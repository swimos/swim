// Copyright 2015-2022 Swim.inc
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.net.http;

import java.io.IOException;
import java.lang.invoke.MethodHandles;
import java.lang.invoke.VarHandle;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.util.Objects;
import javax.net.ssl.SSLSession;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.BinaryInputBuffer;
import swim.codec.BinaryOutputBuffer;
import swim.http.HttpException;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.log.Log;
import swim.log.LogScope;
import swim.net.FlowContext;
import swim.net.NetSocket;
import swim.net.NetSocketContext;
import swim.net.TcpEndpoint;
import swim.util.Assume;
import swim.util.Result;

@Public
@Since("5.0")
public class HttpServerSocket implements NetSocket, FlowContext, HttpServerContext {

  protected final HttpServer server;
  protected final HttpOptions options;
  protected BinaryInputBuffer readBuffer;
  protected BinaryOutputBuffer writeBuffer;
  protected @Nullable NetSocketContext context;
  @Nullable HttpServerResponder requester;
  final HttpServerResponder[] responders;
  int responderReadIndex;
  int responderWriteIndex;
  int status;
  Log log;

  public HttpServerSocket(HttpServer server, HttpOptions options) {
    // Initialize socket parameters.
    this.server = server;
    this.options = options;

    // Initialize I/O buffers.
    this.readBuffer = BinaryInputBuffer.allocateDirect(options.serverRequestBufferSize()).asLast(false);
    this.writeBuffer = BinaryOutputBuffer.allocateDirect(options.serverResponseBufferSize()).asLast(false);

    // Initialize socket context.
    this.context = null;

    // Initialize the request pipeline.
    this.requester = null;

    // Initialize the response pipeline.
    this.responders = new HttpServerResponder[Math.max(2, options.serverPipelineLength())];
    this.responderReadIndex = 0;
    this.responderWriteIndex = 0;

    // Initialize status.
    this.status = 0;

    // Initialize the server log.
    this.log = this.initLog();
  }

  public Log log() {
    return this.log;
  }

  protected String logFocus() {
    final NetSocketContext context = this.context;
    if (context != null) {
      final InetSocketAddress remoteAddress = context.remoteAddress();
      if (remoteAddress != null) {
        return TcpEndpoint.endpointAddress(remoteAddress);
      }
    }
    return "";
  }

  protected Log initLog() {
    return Log.forTopic("swim.net.http.server").withFocus(this.logFocus());
  }

  public void setLog(Log log) {
    Objects.requireNonNull(log);
    this.log = log.withFocus(this.logFocus());
  }

  String protocol() {
    final NetSocketContext context = this.context;
    if (context != null && context.sslSession() != null) {
      return "https";
    } else {
      return "http";
    }
  }

  @Override
  public final HttpServer server() {
    return this.server;
  }

  @Override
  public final HttpOptions options() {
    return this.options;
  }

  @Override
  public final BinaryInputBuffer readBuffer() {
    return this.readBuffer;
  }

  @Override
  public final BinaryOutputBuffer writeBuffer() {
    return this.writeBuffer;
  }

  @Override
  public final @Nullable NetSocketContext socketContext() {
    return this.context;
  }

  @Override
  public void setSocketContext(@Nullable NetSocketContext context) {
    this.context = context;
    this.server.setServerContext(this);
  }

  @Override
  public long idleTimeout() {
    return this.server.idleTimeout();
  }

  @Override
  public final boolean isClient() {
    final NetSocketContext context = this.context;
    return context != null && context.isClient();
  }

  @Override
  public final boolean isServer() {
    final NetSocketContext context = this.context;
    return context != null && context.isServer();
  }

  @Override
  public final boolean isOpening() {
    final NetSocketContext context = this.context;
    return context != null && context.isOpening();
  }

  @Override
  public final boolean isOpen() {
    final NetSocketContext context = this.context;
    return context != null && context.isOpen();
  }

  @Override
  public final @Nullable InetSocketAddress localAddress() {
    final NetSocketContext context = this.context;
    return context != null ? context.localAddress() : null;
  }

  @Override
  public final @Nullable InetSocketAddress remoteAddress() {
    final NetSocketContext context = this.context;
    return context != null ? context.remoteAddress() : null;
  }

  @Override
  public final @Nullable SSLSession sslSession() {
    final NetSocketContext context = this.context;
    return context != null ? context.sslSession() : null;
  }

  @Override
  public void willOpen() throws IOException {
    this.log.debugEntity("opening socket", this.server);

    // Focus the log now that remoteAddress is known.
    this.setLog(this.log);
    this.server.willOpen();
  }

  @Override
  public void didOpen() throws IOException {
    this.log.infoConfig("opened socket", this);

    this.server.didOpen();
  }

  @Override
  public boolean isRequesting() {
    return REQUESTER.getOpaque(this) != null;
  }

  @Nullable HttpServerResponder requester() {
    return (HttpServerResponder) REQUESTER.getOpaque(this);
  }

  @Override
  public boolean enqueueRequester(HttpResponder responder) {
    final HttpServerResponder handler = new HttpServerResponder(this, responder);
    responder.setResponderContext(handler);

    // Try to set the current request handler, synchronizing with concurrent dequeues.
    // Only one request handler can be enqueued at a time.
    if (REQUESTER.compareAndExchangeAcquire(this, null, handler) != null) {
      // Another request is already being handled. The caller must wait until
      // that request is complete before enqueueing a new request handler.
      return false;
    }

    // Trigger a read operation to begin handling the request.
    // We force a read instead of requesting one to ensure that any
    // buffered data left over from the previous request gets consumed.
    this.triggerRead();
    // The request handler was successfully enqueued.
    return true;
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueRequester(HttpServerResponder handler) {
    // Try to clear the current request handler, synchronizing with concurrent enqueues.
    if (REQUESTER.compareAndExchangeRelease(this, handler, null) != handler) {
      throw new IllegalStateException("inconsistent request pipeline");
    }
  }

  @Override
  public boolean requestRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound server");
    }
    return context.requestRead();
  }

  @Override
  public boolean cancelRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound server");
    }
    return context.cancelRead();
  }

  @Override
  public boolean triggerRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound server");
    }
    return context.triggerRead();
  }

  @Override
  public void doRead() throws IOException {
    final LogScope scope = LogScope.swapCurrent(this.protocol());
    LogScope.push("read");
    try {
      HttpServerResponder handler = this.requester();

      // Read data from the socket into the read buffer.
      final int count = this.read(this.readBuffer.byteBuffer());
      if (count < 0) {
        // Signal the end of input.
        this.readBuffer.asLast(true);
      }
      // Prepare to consume data from the read buffer.
      this.readBuffer.flip();

      while (handler != null) {
        // Delegate the read operation to the current request handler.
        handler.doRead();
        // Start handling the next request, if the current request handler changed.
        final HttpServerResponder nextHandler = this.requester();
        if (handler != nextHandler) {
          handler = nextHandler;
        } else {
          break;
        }
      }

      if (this.isDoneReading()) {
        // Close the socket for reading.
        Assume.nonNull(this.context).doneReading();
        if (!this.isDoneWriting()) {
          // The socket is done reading, but not done writing;
          // check if the responder queue is empty.
          if ((int) RESPONDER_READ_INDEX.getOpaque(this) == (int) RESPONDER_WRITE_INDEX.getAcquire(this)) {
            // The responder queue is empty, and the socket is done reading;
            // no more responses can be generated, so we're also done writing.
            this.doneWriting();
          }
        }
      }
    } finally {
      // Prepare the read buffer for the next read.
      this.readBuffer.compact();
      LogScope.pop();
      LogScope.setCurrent(scope);
    }
  }

  int read(ByteBuffer readBuffer) throws IOException {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound server");
    }
    return context.read(readBuffer);
  }

  protected void willReadRequest(HttpResponderContext handler) {
    try {
      // Invoke willReadRequest server callback.
      this.server.willReadRequest(handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willReadRequest callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willReadRequest callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void willReadRequestMessage(HttpResponderContext handler) {
    try {
      // Invoke willReadRequestMessage server callback.
      this.server.willReadRequestMessage(handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willReadRequestMessage callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willReadRequestMessage callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didReadRequestMessage(Result<HttpRequest<?>> requestResult, HttpResponderContext handler) {
    try {
      // Invoke didReadRequestMessage server callback.
      this.server.didReadRequestMessage(requestResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didReadRequestMessage callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didReadRequestMessage callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void willReadRequestPayload(HttpRequest<?> request, HttpResponderContext handler) {
    try {
      // Invoke willReadRequestPayload server callback.
      this.server.willReadRequestPayload(request, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willReadRequestPayload callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willReadRequestPayload callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didReadRequestPayload(Result<HttpRequest<?>> requestResult, HttpResponderContext handler) {
    try {
      // Invoke didReadRequestPayload server callback.
      this.server.didReadRequestPayload(requestResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didReadRequestPayload callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didReadRequestPayload callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didReadRequest(Result<HttpRequest<?>> requestResult, HttpResponderContext handler) {
    try {
      // Invoke didReadRequest server callback.
      this.server.didReadRequest(requestResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didReadRequest callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didReadRequest callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  @Override
  public boolean isResponding() {
    final int readIndex = (int) RESPONDER_READ_INDEX.getAcquire(this);
    final int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    return readIndex != writeIndex;
  }

  @Nullable HttpServerResponder responder() {
    // Peek at the head of the MPSC responder queue.
    // Only the write task can safely peek at the current response handler.
    final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
    final int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The responder queue is empty.
      return null;
    }

    do {
      // Try to atomically acquire the head of the responder queue.
      final HttpServerResponder handler = (HttpServerResponder) RESPONDER_ARRAY.getAcquire(this.responders, readIndex);
      if (handler != null) {
        // Return the current response handler.
        return handler;
      } else {
        // A new current response handle is concurrently being enqueued;
        // spin and try again.
        Thread.onSpinWait();
      }
    } while (true);
  }

  boolean enqueueResponder(HttpServerResponder handler) {
    // Try to enqueue the response handler into the MPSC responder queue.
    int writeIndex = (int) RESPONDER_WRITE_INDEX.getOpaque(this);
    do {
      final int oldWriteIndex = writeIndex;
      final int newWriteIndex = (oldWriteIndex + 1) % this.responders.length;
      final int readIndex = (int) RESPONDER_READ_INDEX.getAcquire(this);
      if (newWriteIndex == readIndex) {
        // The responder queue appears to be full.
        return false;
      }
      writeIndex = (int) RESPONDER_WRITE_INDEX.compareAndExchangeAcquire(this, oldWriteIndex, newWriteIndex);
      if (writeIndex == oldWriteIndex) {
        // Successfully acquired a slot in the responder queue;
        // release the response handler into the queue.
        RESPONDER_ARRAY.setRelease(this.responders, oldWriteIndex, handler);
        // Responders aren't ready to write when first enqueued; the response
        // will begin after the request message has been received.
        return true;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueResponder(HttpServerResponder handler) {
    // Try to dequeue the response handler from the MPSC responder queue.
    // Only the write task is permitted to dequeue responders.
    final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
    int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The responder queue is empty.
      throw new IllegalStateException("inconsistent response pipeline");
    }

    // Clear the current response handler, if it's the head of the responder queue.
    if (RESPONDER_ARRAY.compareAndExchange(this.responders, readIndex, handler, null) != handler) {
      // The response handler was not the head of the responder queue.
      throw new IllegalStateException("inconsistent response pipeline");
    }
    // Increment the read index to free up the dequeued response handler's old slot.
    final int newReadIndex = (readIndex + 1) % this.responders.length;
    RESPONDER_READ_INDEX.setRelease(this, newReadIndex);

    // Request a read to ensure that request handling continues.
    this.requestRead();

    // Reload the write index to check for concurrent enqueues.
    writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (newReadIndex != writeIndex) {
      // The responder queue is non-empty; trigger a write to begin handling
      // the next response.
      this.triggerWrite();
    } else if (this.isDoneReading()) {
      // The responder queue is empty, and the socket is done reading;
      // no more responses can be generated, so we're also done writing.
      this.doneWriting();
    }
  }

  @Override
  public boolean requestWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound server");
    }
    return context.requestWrite();
  }

  @Override
  public boolean cancelWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound server");
    }
    return context.cancelWrite();
  }

  @Override
  public boolean triggerWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound server");
    }
    return context.triggerWrite();
  }

  @Override
  public void doWrite() throws IOException {
    final LogScope scope = LogScope.swapCurrent(this.protocol());
    LogScope.push("write");
    try {
      HttpServerResponder handler = this.responder();

      while (handler != null && !this.isDoneWriting()) {
        // Delegate the write operation to the current response handler.
        handler.doWrite();
        // Start handling the next response, if the current response handler changed.
        final HttpServerResponder nextResponder = this.responder();
        if (handler != nextResponder) {
          handler = nextResponder;
        } else {
          break;
        }
      }

      // Prepare to transfer data from the write buffer to the socket.
      this.writeBuffer.flip();
      if (this.writeBuffer.hasRemaining()) {
        // Write data from the write buffer to the socket.
        this.write(this.writeBuffer.byteBuffer());
      }
      if (this.writeBuffer.position() != 0) {
        // The write buffer has not been fully written to the socket;
        // yield until the socket is ready to write more data.
        this.requestWrite();
      } else if (this.isDoneWriting()) {
        // Close the socket for writing.
        Assume.nonNull(this.context).doneWriting();
      }
    } finally {
      // Prepare the write buffer for the next write.
      this.writeBuffer.compact();
      LogScope.pop();
      LogScope.setCurrent(scope);
    }
  }

  int write(ByteBuffer writeBuffer) throws IOException {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound server");
    }
    return context.write(writeBuffer);
  }

  protected void willWriteResponse(HttpResponderContext handler) {
    try {
      // Invoke willWriteResponse server callback.
      this.server.willWriteResponse(handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willWriteResponse callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willWriteResponse callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void willWriteResponseMessage(HttpResponderContext handler) {
    try {
      // Invoke willWriteResponseMessage server callback.
      this.server.willWriteResponseMessage(handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willWriteResponseMessage callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willWriteResponseMessage callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didWriteResponseMessage(Result<HttpResponse<?>> responseResult, HttpResponderContext handler) {
    try {
      // Invoke didWriteResponseMessage server callback.
      this.server.didWriteResponseMessage(responseResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didWriteResponseMessage callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didWriteResponseMessage callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void willWriteResponsePayload(HttpResponse<?> response, HttpResponderContext handler) {
    try {
      // Invoke willWriteResponsePayload server callback.
      this.server.willWriteResponsePayload(response, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willWriteResponsePayload callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willWriteResponsePayload callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didWriteResponsePayload(Result<HttpResponse<?>> responseResult, HttpResponderContext handler) {
    try {
      // Invoke didWriteResponsePayload server callback.
      this.server.didWriteResponsePayload(responseResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didWriteResponsePayload callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didWriteResponsePayload callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didWriteResponse(Result<HttpResponse<?>> responseResult, HttpResponderContext handler) {
    try {
      // Invoke didWriteResponse server callback.
      this.server.didWriteResponse(responseResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didWriteResponse callback failed", this.server, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didWriteResponse callback failed", this.server, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void handleServerError(Throwable error, HttpResponderContext handler) {
    try {
      // Invoke handleServerError delegate.
      this.server.handleServerError(error, handler);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorEntity("handleServerError delegate failed", this.server, cause);
        // Last ditch attempt to write an error response.
        handler.writeResponse(HttpResponse.error(error));
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  @Override
  public void become(NetSocket socket) {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("unbound server");
    }
    context.become(socket);
  }

  @Override
  public void willBecome(NetSocket socket) {
    this.log.debugEntity("becoming socket", socket);

    this.server.willBecome(socket);
  }

  @Override
  public void didBecome(NetSocket socket) {
    this.log.traceEntity("became socket", socket);

    this.server.didBecome(socket);
  }

  @Override
  public final boolean isDoneReading() {
    return ((int) STATUS.getOpaque(this) & READ_DONE) != 0;
  }

  @Override
  public boolean doneReading() {
    int status = (int) STATUS.getOpaque(this);
    do {
      final int oldStatus = status;
      final int newStatus = status | READ_DONE;
      status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        if ((oldStatus & READ_DONE) == 0) {
          // Trigger a read to close the socket for reading.
          this.triggerRead();
          return true;
        } else {
          return false;
        }
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);
  }

  @Override
  public final boolean isDoneWriting() {
    return ((int) STATUS.getOpaque(this) & WRITE_DONE) != 0;
  }

  @Override
  public boolean doneWriting() {
    int status = (int) STATUS.getOpaque(this);
    do {
      final int oldStatus = status;
      final int newStatus = status | WRITE_DONE;
      status = (int) STATUS.compareAndExchangeRelease(this, oldStatus, newStatus);
      if (status == oldStatus) {
        status = newStatus;
        if ((oldStatus & WRITE_DONE) == 0) {
          // Trigger a write to close the socket for writing.
          this.triggerWrite();
          return true;
        } else {
          return false;
        }
      } else {
        // CAS failed; try again.
        continue;
      }
    } while (true);
  }

  @Override
  public void doTimeout() throws IOException {
    HttpServerResponder handler = this.responder();
    if (handler == null) {
      handler = this.requester();
    }
    this.server.doTimeout(handler);
  }

  @Override
  public void close() {
    final NetSocketContext context = this.context;
    if (context != null) {
      context.close();
    }
  }

  @Override
  public void willClose() throws IOException {
    this.log.debugEntity("closing socket", this.server);

    this.server.willClose();

    // TODO: willClose responders.
  }

  @Override
  public void didClose() throws IOException {
    this.log.info("closed socket");

    // TODO: didClose responders

    this.server.didClose();
  }

  static final int READ_DONE = 1 << 0;
  static final int WRITE_DONE = 1 << 1;

  /**
   * {@code VarHandle} for atomically accessing the {@link #requester} field.
   */
  static final VarHandle REQUESTER;

  /**
   * {@code VarHandle} for atomically accessing elements of an
   * {@link HttpSercerResponder} array.
   */
  static final VarHandle RESPONDER_ARRAY;

  /**
   * {@code VarHandle} for atomically accessing the {@link #responderReadIndex} field.
   */
  static final VarHandle RESPONDER_READ_INDEX;

  /**
   * {@code VarHandle} for atomically accessing the {@link #responderWriteIndex} field.
   */
  static final VarHandle RESPONDER_WRITE_INDEX;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    RESPONDER_ARRAY = MethodHandles.arrayElementVarHandle(HttpServerResponder.class.arrayType());
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      REQUESTER = lookup.findVarHandle(HttpServerSocket.class, "requester", HttpServerResponder.class);
      RESPONDER_READ_INDEX = lookup.findVarHandle(HttpServerSocket.class, "responderReadIndex", Integer.TYPE);
      RESPONDER_WRITE_INDEX = lookup.findVarHandle(HttpServerSocket.class, "responderWriteIndex", Integer.TYPE);
      STATUS = lookup.findVarHandle(HttpServerSocket.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
