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
public class HttpClientSocket implements NetSocket, FlowContext, HttpClientContext {

  protected final HttpClient client;
  protected final HttpOptions options;
  protected BinaryOutputBuffer writeBuffer;
  protected BinaryInputBuffer readBuffer;
  protected @Nullable NetSocketContext context;
  final HttpClientRequester[] requesters;
  int requesterReadIndex;
  int requesterWriteIndex;
  final HttpClientRequester[] responders;
  int responderReadIndex;
  int responderWriteIndex;
  int status;
  Log log;

  public HttpClientSocket(HttpClient client, HttpOptions options) {
    // Initialize socket parameters.
    this.client = client;
    this.options = options;

    // Initialize I/O buffers.
    this.writeBuffer = BinaryOutputBuffer.allocateDirect(options.clientRequestBufferSize()).asLast(false);
    this.readBuffer = BinaryInputBuffer.allocateDirect(options.clientResponseBufferSize()).asLast(false);

    // Initialize socket context.
    this.context = null;

    // Initialize the request pipeline.
    this.requesters = new HttpClientRequester[Math.max(2, options.clientPipelineLength())];
    this.requesterReadIndex = 0;
    this.requesterWriteIndex = 0;

    // Initialize the response pipeline.
    this.responders = new HttpClientRequester[Math.max(2, options.clientPipelineLength())];
    this.responderReadIndex = 0;
    this.responderWriteIndex = 0;

    // Initialize status.
    this.status = 0;

    // Initialize the client log.
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
    return Log.forTopic("swim.net.http.client").withFocus(this.logFocus());
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
  public final HttpClient client() {
    return this.client;
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
    this.client.setClientContext(this);
  }

  @Override
  public long idleTimeout() {
    return this.client.idleTimeout();
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
  public final boolean isConnecting() {
    final NetSocketContext context = this.context;
    return context != null && context.isConnecting();
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
  public boolean connect(InetSocketAddress remoteAddress) {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.connect(remoteAddress);
  }

  @Override
  public boolean connect(String address, int port) {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.connect(address, port);
  }

  @Override
  public void willConnect() throws IOException {
    this.log.debugEntity("connecting socket", this.client);

    // Focus the log now that remoteAddress is known.
    this.setLog(this.log);
    this.client.willConnect();
  }

  @Override
  public void willOpen() throws IOException {
    this.log.debugEntity("opening socket", this.client);

    // Focus the log now that remoteAddress is known.
    this.setLog(this.log);
    this.client.willOpen();
  }

  @Override
  public void didOpen() throws IOException {
    this.log.infoConfig("opened socket", this);

    this.client.didOpen();
  }

  @Override
  public boolean isRequesting() {
    final int readIndex = (int) REQUESTER_READ_INDEX.getAcquire(this);
    final int writeIndex = (int) REQUESTER_WRITE_INDEX.getAcquire(this);
    return readIndex != writeIndex;
  }

  @Nullable HttpClientRequester requester() {
    // Peek at the head of the MPSC requester queue.
    // Only the read task can safely peek at the current request handler.
    final int readIndex = (int) REQUESTER_READ_INDEX.getOpaque(this);
    final int writeIndex = (int) REQUESTER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The requester queue is empty.
      return null;
    }

    do {
      // Try to atomically acquire the head of the requester queue.
      final HttpClientRequester handler = (HttpClientRequester) REQUESTER_ARRAY.getAcquire(this.requesters, readIndex);
      if (handler != null) {
        // Return the current request handler.
        return handler;
      } else {
        // A new current request handler is concurrently being enqueued;
        // spin and try again.
        Thread.onSpinWait();
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public boolean enqueueRequester(HttpRequester requester) {
    final HttpClientRequester handler = new HttpClientRequester(this, requester);
    requester.setRequesterContext(handler);

    // Try to enqueue the request handler into the MPSC requester queue.
    int writeIndex = (int) REQUESTER_WRITE_INDEX.getOpaque(this);
    do {
      final int oldWriteIndex = writeIndex;
      final int newWriteIndex = (oldWriteIndex + 1) % this.requesters.length;
      final int readIndex = (int) REQUESTER_READ_INDEX.getAcquire(this);
      if (newWriteIndex == readIndex) {
        // The requester queue appears to be full.
        return false;
      }
      writeIndex = (int) REQUESTER_WRITE_INDEX.compareAndExchangeAcquire(this, oldWriteIndex, newWriteIndex);
      if (writeIndex == oldWriteIndex) {
        // Successfully acquired a slot in the requester queue;
        // release the request handler into the queue.
        REQUESTER_ARRAY.setRelease(this.requesters, oldWriteIndex, handler);
        if (oldWriteIndex == readIndex) {
          // The requester queue was empty; trigger a write to begin handling
          // the request. We force a write instead of requesting one because
          // the selector might have already dispatched a write ready event,
          // in which case it won't dispatch a new write ready event until
          // data has been written to the socket.
          this.triggerWrite();
        }
        return true;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueRequester(HttpClientRequester handler) {
    // Try to dequeue the request handler from the MPSC requester queue.
    // Only the write task is permitted to dequeue requesters.
    final int readIndex = (int) REQUESTER_READ_INDEX.getOpaque(this);
    int writeIndex = (int) REQUESTER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The requester queue is empty.
      throw new IllegalStateException("Inconsistent request pipeline");
    }

    // Clear the current request handler, if it's the head of the requester queue.
    if (REQUESTER_ARRAY.compareAndExchange(this.requesters, readIndex, handler, null) != handler) {
      // The request handler was not the head of the requester queue.
      throw new IllegalStateException("Inconsistent request pipeline");
    }
    // Increment the read index to free up the dequeued request handler's old slot.
    final int newReadIndex = (readIndex + 1) % this.requesters.length;
    REQUESTER_READ_INDEX.setRelease(this, newReadIndex);

    // Reload the write index to check for concurrent enqueues.
    writeIndex = (int) REQUESTER_WRITE_INDEX.getAcquire(this);
    if (newReadIndex != writeIndex) {
      // The requester queue is non-empty; trigger a write to begin handling
      // the next request.
      this.triggerWrite();
    }
  }

  @Override
  public boolean requestWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.requestWrite();
  }

  @Override
  public boolean cancelWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.cancelWrite();
  }

  @Override
  public boolean triggerWrite() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.triggerWrite();
  }

  @Override
  public void doWrite() throws IOException {
    final LogScope scope = LogScope.swapCurrent(this.protocol());
    LogScope.push("write");
    try {
      HttpClientRequester handler = this.requester();

      while (handler != null && !this.isDoneWriting()) {
        // Delegate the write operation to the current request handler.
        handler.doWrite();
        // Start handling the next request, if the current request handler changed.
        final HttpClientRequester nextHandler = this.requester();
        if (handler != nextHandler) {
          handler = nextHandler;
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
        if (!this.isDoneReading()) {
          // The socket is done writing, but not done reading;
          // check if the responder queue is empty.
          if ((int) RESPONDER_READ_INDEX.getOpaque(this) == (int) RESPONDER_WRITE_INDEX.getAcquire(this)) {
            // The responder queue is empty, and the socket is done writing;
            // no more responses can be generated, so we're also done reading.
            this.doneReading();
          }
        }
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
      throw new IllegalStateException("Unbound client");
    }
    return context.write(writeBuffer);
  }

  protected void willWriteRequest(HttpRequesterContext handler) {
    try {
      // Invoke willWriteRequest client callback.
      this.client.willWriteRequest(handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willWriteRequest callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willWriteRequest callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void willWriteRequestMessage(HttpRequesterContext handler) {
    try {
      // Invoke willWriteRequestMessage client callback.
      this.client.willWriteRequestMessage(handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willWriteRequestMessage callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willWriteRequestMessage callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didWriteRequestMessage(Result<HttpRequest<?>> requestResult, HttpRequesterContext handler) {
    try {
      // Invoke didWriteRequestMessage client callback.
      this.client.didWriteRequestMessage(requestResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didWriteRequestMessage callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didWriteRequestMessage callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void willWriteRequestPayload(HttpRequest<?> request, HttpRequesterContext handler) {
    try {
      // Invoke willWriteRequestPayload client callback.
      this.client.willWriteRequestPayload(request, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willWriteRequestPayload callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willWriteRequestPayload callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didWriteRequestPayload(Result<HttpRequest<?>> requestResult, HttpRequesterContext handler) {
    try {
      // Invoke didWriteRequestPayload client callback.
      this.client.didWriteRequestPayload(requestResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didWriteRequestPayload callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didWriteRequestPayload callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didWriteRequest(Result<HttpRequest<?>> requestResult, HttpRequesterContext handler) {
    try {
      // Invoke didWriteRequest client callback.
      this.client.didWriteRequest(requestResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didWriteRequest callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didWriteRequest callback failed", this.client, cause);
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

  @Nullable HttpClientRequester responder() {
    // Peek at the head of the MPSC responder queue.
    // Only the read task can safely peek at the current response handler.
    final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
    final int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The responder queue is empty.
      return null;
    }

    do {
      // Try to atomically acquire the head of the responder queue.
      final HttpClientRequester handle = (HttpClientRequester) REQUESTER_ARRAY.getAcquire(this.responders, readIndex);
      if (handle != null) {
        // Return the current response handler.
        return handle;
      } else {
        // A new current response handler is concurrently being enqueued;
        // spin and try again.
        Thread.onSpinWait();
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  boolean enqueueResponder(HttpClientRequester handler) {
    // Enqueue the response handler into the MPSC responder queue.
    int writeIndex = (int) RESPONDER_WRITE_INDEX.getOpaque(this);
    do {
      final int oldWriteIndex = writeIndex;
      final int newWriteIndex = (oldWriteIndex + 1) % this.responders.length;
      final int readIndex = (int) RESPONDER_READ_INDEX.getAcquire(this);
      if (newWriteIndex == readIndex) {
        return false;
      }
      writeIndex = (int) RESPONDER_WRITE_INDEX.compareAndExchangeAcquire(this, oldWriteIndex, newWriteIndex);
      if (writeIndex == oldWriteIndex) {
        // Successfully acquired a slot in the responder queue;
        // release the response handler into the queue.
        REQUESTER_ARRAY.setRelease(this.responders, oldWriteIndex, handler);
        // Responders aren't ready to read when first enqueued; the response
        // will begin after the request message has been written.
        return true;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueResponder(HttpClientRequester handler) {
    // Try to dequeue the response handler from the MPSC responder queue.
    // Only the read task is permitted to dequeue responders.
    final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
    int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The responder queue is empty.
      throw new IllegalStateException("Inconsistent response pipeline");
    }

    // Clear the current response handler, if it's the head of the responder queue.
    if (REQUESTER_ARRAY.compareAndExchange(this.responders, readIndex, handler, null) != handler) {
      // The response handler was not the head of the responder queue.
      throw new IllegalStateException("Inconsistent response pipeline");
    }
    // Increment the read index to free up the dequeued response handler's old slot.
    final int newReadIndex = (readIndex + 1) % this.responders.length;
    RESPONDER_READ_INDEX.setRelease(this, newReadIndex);

    // Request a write to ensure that request handling continues.
    this.requestWrite();

    // Reload the write index to check for concurrent enqueues.
    writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (newReadIndex != writeIndex) {
      // The responder queue is non-empty; trigger a read to begin handling
      // the next response.
      this.triggerRead();
    } else if (this.isDoneWriting()) {
      // The responder queue is empty, and the socket is done writing;
      // no more responses can be generated, so we're also done reading.
      this.doneReading();
    }
  }

  @Override
  public boolean requestRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.requestRead();
  }

  @Override
  public boolean cancelRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.cancelRead();
  }

  @Override
  public boolean triggerRead() {
    final NetSocketContext context = this.context;
    if (context == null) {
      throw new IllegalStateException("Unbound client");
    }
    return context.triggerRead();
  }

  @Override
  public void doRead() throws IOException {
    final LogScope scope = LogScope.swapCurrent(this.protocol());
    LogScope.push("read");
    try {
      HttpClientRequester handler = this.responder();

      // Read data from the socket into the read buffer.
      final int count = this.read(this.readBuffer.byteBuffer());
      if (count < 0) {
        // Signal the end of input.
        this.readBuffer.asLast(true);
      }
      // Prepare to consume data from the read buffer.
      this.readBuffer.flip();

      while (handler != null) {
        // Delegate the read operation to the current response handler.
        handler.doRead();
        // Start handling the next response, if the current response handler changed.
        final HttpClientRequester nextHandler = this.responder();
        if (handler != nextHandler) {
          handler = nextHandler;
        } else {
          break;
        }
      }

      if (this.isDoneReading()) {
        // Close the socket for reading.
        Assume.nonNull(this.context).doneReading();
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
      throw new IllegalStateException("Unbound client");
    }
    return context.read(readBuffer);
  }

  protected void willReadResponse(HttpRequesterContext handler) {
    try {
      // Invoke willReadResponse client callback.
      this.client.willReadResponse(handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willReadResponse callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willReadResponse callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void willReadResponseMessage(HttpRequesterContext handler) {
    try {
      // Invoke willReadResponseMessage client callback.
      this.client.willReadResponseMessage(handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willReadResponseMessage callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willReadResponseMessage callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didReadResponseMessage(Result<HttpResponse<?>> responseResult, HttpRequesterContext handler) {
    try {
      // Invoke didReadResponseMessage client callback.
      this.client.didReadResponseMessage(responseResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didReadResponseMessage callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didReadResponseMessage callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void willReadResponsePayload(HttpResponse<?> response, HttpRequesterContext handler) {
    try {
      // Invoke willReadResponsePayload client callback.
      this.client.willReadResponsePayload(response, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("willReadResponsePayload callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("willReadResponsePayload callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didReadResponsePayload(Result<HttpResponse<?>> responseResult, HttpRequesterContext handler) {
    try {
      // Invoke didReadResponsePayload client callback.
      this.client.didReadResponsePayload(responseResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didReadResponsePayload callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didReadResponsePayload callback failed", this.client, cause);
      } else {
        // Rethrow the fatal exception.
        throw cause;
      }
    }
  }

  protected void didReadResponse(Result<HttpResponse<?>> responseResult, HttpRequesterContext handler) {
    try {
      // Invoke didReadResponse client callback.
      this.client.didReadResponse(responseResult, handler);
    } catch (HttpException cause) {
      // Report the exception.
      this.log.warningStatus("didReadResponse callback failed", this.client, cause);
    } catch (Throwable cause) {
      if (Result.isNonFatal(cause)) {
        // Report the non-fatal exception.
        this.log.errorStatus("didReadResponse callback failed", this.client, cause);
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
      throw new IllegalStateException("Unbound client");
    }
    context.become(socket);
  }

  @Override
  public void willBecome(NetSocket socket) {
    this.log.debugEntity("becoming socket", socket);

    this.client.willBecome(socket);
  }

  @Override
  public void didBecome(NetSocket socket) {
    this.log.traceEntity("became socket", socket);

    this.client.didBecome(socket);
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
    HttpClientRequester handler = this.responder();
    if (handler == null) {
      handler = this.requester();
    }
    this.client.doTimeout(handler);
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
    this.log.debugEntity("closing socket", this.client);

    this.client.willClose();

    // TODO: willClose requesters.
  }

  @Override
  public void didClose() throws IOException {
    this.log.info("closed socket");

    // TODO: didClose requesters

    this.client.didClose();
  }

  static final int WRITE_DONE = 1 << 0;
  static final int READ_DONE = 1 << 1;

  /**
   * {@code VarHandle} for atomically accessing elements of an
   * {@link HttpClientRequester} array.
   */
  static final VarHandle REQUESTER_ARRAY;

  /**
   * {@code VarHandle} for atomically accessing the {@link #requesterReadIndex} field.
   */
  static final VarHandle REQUESTER_READ_INDEX;

  /**
   * {@code VarHandle} for atomically accessing the {@link #requesterWriteIndex} field.
   */
  static final VarHandle REQUESTER_WRITE_INDEX;

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
    REQUESTER_ARRAY = MethodHandles.arrayElementVarHandle(HttpClientRequester.class.arrayType());
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      REQUESTER_READ_INDEX = lookup.findVarHandle(HttpClientSocket.class, "requesterReadIndex", Integer.TYPE);
      REQUESTER_WRITE_INDEX = lookup.findVarHandle(HttpClientSocket.class, "requesterWriteIndex", Integer.TYPE);
      RESPONDER_READ_INDEX = lookup.findVarHandle(HttpClientSocket.class, "responderReadIndex", Integer.TYPE);
      RESPONDER_WRITE_INDEX = lookup.findVarHandle(HttpClientSocket.class, "responderWriteIndex", Integer.TYPE);
      STATUS = lookup.findVarHandle(HttpClientSocket.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
