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
import swim.log.Log;
import swim.log.LogScope;
import swim.net.FlowContext;
import swim.net.NetSocket;
import swim.net.NetSocketContext;
import swim.net.TcpEndpoint;

@Public
@Since("5.0")
public class HttpServerSocket implements NetSocket, FlowContext, HttpServerContext {

  protected final HttpServer server;
  protected final HttpOptions httpOptions;
  protected @Nullable NetSocketContext context;
  protected ByteBuffer readBuffer;
  protected ByteBuffer writeBuffer;
  protected BinaryInputBuffer inputBuffer;
  protected BinaryOutputBuffer outputBuffer;
  @Nullable HttpServerResponder requester;
  final HttpServerResponder[] responders;
  int responderReadIndex;
  int responderWriteIndex;
  Log log;

  public HttpServerSocket(HttpServer server, HttpOptions httpOptions) {
    // Initialize socket parameters.
    this.server = server;
    this.httpOptions = httpOptions;

    // Initialize socket context.
    this.context = null;

    // Initialize I/O buffers.
    this.readBuffer = ByteBuffer.allocateDirect(httpOptions.readBufferSize());
    this.writeBuffer = ByteBuffer.allocateDirect(httpOptions.writeBufferSize());
    this.inputBuffer = new BinaryInputBuffer(this.readBuffer).asLast(false);
    this.outputBuffer = new BinaryOutputBuffer(this.writeBuffer).asLast(false);

    // Initialize the response pipeline.
    this.requester = null;
    this.responders = new HttpServerResponder[Math.max(2, httpOptions.serverPipelineLength())];
    this.responderReadIndex = 0;
    this.responderWriteIndex = 0;

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
  public final HttpOptions httpOptions() {
    return this.httpOptions;
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
    if (context != null) {
      return context.isClient();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public final boolean isServer() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.isServer();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public final boolean isOpening() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.isOpening();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public final boolean isOpen() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.isOpen();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public final @Nullable InetSocketAddress localAddress() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.localAddress();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public final @Nullable InetSocketAddress remoteAddress() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.remoteAddress();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public final @Nullable SSLSession sslSession() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.sslSession();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
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
    this.server.didOpen();

    this.log.infoConfig("opened socket", this);
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
      throw new IllegalStateException("Inconsistent request pipeline");
    }

    if (this.isDoneReading() && !this.isDoneWriting()) {
      // The socket is done reading, but not done writing;
      // check if the responder queue is empty.
      if ((int) RESPONDER_READ_INDEX.getOpaque(this) == (int) RESPONDER_WRITE_INDEX.getAcquire(this)) {
        // The responder queue is empty, and the socket is done reading;
        // no more responses can be generated, so we're also done writing.
        this.doneWriting();
      }
    }
  }

  @Override
  public boolean requestRead() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.requestRead();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public boolean cancelRead() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.cancelRead();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public boolean triggerRead() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.triggerRead();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public void doRead() throws IOException {
    final LogScope scope = LogScope.swapCurrent(this.protocol());
    LogScope.push("read");
    try {
      HttpServerResponder handler = this.requester();
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
    } finally {
      LogScope.pop();
      LogScope.setCurrent(scope);
    }
  }

  int read(ByteBuffer readBuffer) throws IOException {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.read(readBuffer);
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  protected void willReadRequest(HttpResponderContext handler) {
    this.server.willReadRequest(handler);
  }

  protected void willReadRequestMessage(HttpResponderContext handler) {
    this.server.willReadRequestMessage(handler);
  }

  protected void didReadRequestMessage(HttpResponderContext handler) {
    this.server.didReadRequestMessage(handler);
  }

  protected void willReadRequestPayload(HttpResponderContext handler) {
    this.server.willReadRequestPayload(handler);
  }

  protected void didReadRequestPayload(HttpResponderContext handler) {
    this.server.didReadRequestPayload(handler);
  }

  protected void didReadRequest(HttpResponderContext handler) {
    this.server.didReadRequest(handler);
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
      throw new IllegalStateException("Inconsistent response pipeline");
    }

    // Clear the current response handler, if it's the head of the responder queue.
    if (RESPONDER_ARRAY.compareAndExchange(this.responders, readIndex, handler, null) != handler) {
      // The response handler was not the head of the responder queue.
      throw new IllegalStateException("Inconsistent response pipeline");
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
    if (context != null) {
      return context.requestWrite();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public boolean cancelWrite() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.cancelWrite();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public boolean triggerWrite() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.triggerWrite();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public void doWrite() throws IOException {
    final LogScope scope = LogScope.swapCurrent(this.protocol());
    LogScope.push("write");
    try {
      HttpServerResponder handler = this.responder();
      while (handler != null) {
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
    } finally {
      LogScope.pop();
      LogScope.setCurrent(scope);
    }
  }

  int write(ByteBuffer writeBuffer) throws IOException {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.write(writeBuffer);
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  protected void willWriteResponse(HttpResponderContext handler) {
    this.server.willWriteResponse(handler);
  }

  protected void willWriteResponseMessage(HttpResponderContext handler) {
    this.server.willWriteResponseMessage(handler);
  }

  protected void didWriteResponseMessage(HttpResponderContext handler) {
    this.server.didWriteResponseMessage(handler);
  }

  protected void willWriteResponsePayload(HttpResponderContext handler) {
    this.server.willWriteResponsePayload(handler);
  }

  protected void didWriteResponsePayload(HttpResponderContext handler) {
    this.server.didWriteResponsePayload(handler);
  }

  protected void didWriteResponse(HttpResponderContext handler) {
    this.server.didWriteResponse(handler);
  }

  @Override
  public void become(NetSocket socket) {
    final NetSocketContext context = this.context;
    if (context != null) {
      context.become(socket);
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public void willBecome(NetSocket socket) {
    this.log.debugEntity("becoming socket", socket);

    this.server.willBecome(socket);
  }

  @Override
  public void didBecome(NetSocket socket) {
    this.server.didBecome(socket);

    this.log.traceEntity("became socket", socket);
  }

  @Override
  public final boolean isDoneReading() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.isDoneReading();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public boolean doneReading() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.doneReading();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public final boolean isDoneWriting() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.isDoneWriting();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public boolean doneWriting() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.doneWriting();
    } else {
      throw new IllegalStateException("Unbound socket");
    }
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
    } else {
      throw new IllegalStateException("Unbound socket");
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
    // TODO: didClose responders

    this.server.didClose();

    this.log.info("closed socket");
  }

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

  static {
    // Initialize var handles.
    RESPONDER_ARRAY = MethodHandles.arrayElementVarHandle(HttpServerResponder.class.arrayType());
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      REQUESTER = lookup.findVarHandle(HttpServerSocket.class, "requester", HttpServerResponder.class);
      RESPONDER_READ_INDEX = lookup.findVarHandle(HttpServerSocket.class, "responderReadIndex", Integer.TYPE);
      RESPONDER_WRITE_INDEX = lookup.findVarHandle(HttpServerSocket.class, "responderWriteIndex", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
