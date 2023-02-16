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
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.log.Log;
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

    // Initialize the socket log.
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
  public boolean enqueueRequester(HttpResponder handler) {
    final HttpServerResponder requester = new HttpServerResponder(this, handler);
    handler.setResponderContext(requester);

    // Atomically set the current requester, synchronizing with concurrent dequeues.
    // Only one requester can be enqueued at a time.
    if (REQUESTER.compareAndExchangeAcquire(this, null, requester) != null) {
      // Another request is already being processed. The caller must wait until
      // that request is complete before enqueueing a new request.
      return false;
    }

    // Trigger a read operation to begin processing the request.
    // We force a read instead of requesting one to ensure that any
    // buffered data left over from the previous request gets consumed.
    this.triggerRead();
    // The requester was successfully enqueued.
    return true;
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueRequester(HttpServerResponder requester) {
    // Atomically clear the current requester, synchronizing with concurrent enqueues.
    if (REQUESTER.compareAndExchangeRelease(this, requester, null) != requester) {
      throw new IllegalStateException("Inconsistent request pipeline");
    }

    if (this.isDoneReading() && !this.isDoneWriting()) {
      // The socket is done reading, but not done writing;
      // check if the responder queue is empty.
      final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
      final int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
      if (readIndex == writeIndex) {
        // The inbound closure was received after completing the last request;
        // fully close the socket by closing the outbound end.
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
    HttpServerResponder requester = this.requester();
    while (requester != null) {
      // Delegate the read operation to the current requester.
      requester.doRead();
      // Start processing the next requester, if the current requester changed.
      final HttpServerResponder nextRequester = this.requester();
      if (requester != nextRequester) {
        requester = nextRequester;
      } else {
        break;
      }
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

  protected void willReadRequest(HttpResponder responder) {
    this.server.willReadRequest(responder);
  }

  protected void willReadRequestMessage(HttpResponder responder) {
    this.server.willReadRequestMessage(responder);
  }

  protected void didReadRequestMessage(HttpRequest<?> request, HttpResponder responder) {
    this.server.didReadRequestMessage(request, responder);
  }

  protected void willReadRequestPayload(HttpRequest<?> request, HttpResponder responder) {
    this.server.willReadRequestPayload(request, responder);
  }

  protected void didReadRequestPayload(HttpRequest<?> request, HttpResponder responder) {
    this.server.didReadRequestPayload(request, responder);
  }

  protected void didReadRequest(HttpRequest<?> request, HttpResponder responder) {
    this.server.didReadRequest(request, responder);
  }

  @Override
  public boolean isResponding() {
    final int readIndex = (int) RESPONDER_READ_INDEX.getAcquire(this);
    final int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    return readIndex != writeIndex;
  }

  @Nullable HttpServerResponder responder() {
    // Peek at the head of the MPSC responder queue.
    // Only the write task can safely peek at the current responder.
    final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
    final int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The responder queue is empty.
      return null;
    }

    do {
      // Try to atomically acquire the head of the responder queue.
      final HttpServerResponder responder = (HttpServerResponder) RESPONDER_QUEUE.getAcquire(this.responders, readIndex);
      if (responder != null) {
        // Return the current responder.
        return responder;
      } else {
        // A new current responder is concurrently being enqueued; spin and try again.
        Thread.onSpinWait();
      }
    } while (true);
  }

  boolean enqueueResponder(HttpServerResponder responder) {
    // Try to enqueue the responder into the MPSC responder queue.
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
        // release the responder into the queue.
        RESPONDER_QUEUE.setRelease(this.responders, oldWriteIndex, responder);
        // Responders aren't ready to write when first enqueued; the response
        // will begin after the request message has been received.
        return true;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueResponder(HttpServerResponder responder) {
    // Try to dequeue the responder from the MPSC responder queue.
    // Only the write task is permitted to dequeue responders.
    final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
    int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The responder queue is empty.
      throw new IllegalStateException("Inconsistent response pipeline");
    }

    // Clear the current responder, if it's the head of the responder queue.
    if (RESPONDER_QUEUE.compareAndExchange(this.responders, readIndex, responder, null) != responder) {
      // The responder was not the head of the responder queue.
      throw new IllegalStateException("Inconsistent response pipeline");
    }
    // Increment the read index to free up the dequeued responder's old slot.
    final int newReadIndex = (readIndex + 1) % this.responders.length;
    RESPONDER_READ_INDEX.setRelease(this, newReadIndex);

    // Request a read to ensure that request processing continues.
    this.requestRead();

    // Reload the write index to check for concurrent enqueues.
    writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (newReadIndex != writeIndex) {
      // The responder queue is non-empty; trigger a write to begin processing
      // the next response.
      this.triggerWrite();
    } else if (this.isDoneReading()) {
      // The responder queue is empty, and the socket is done reading;
      // no more responses can be enqueued, so we're also done writing.
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
    HttpServerResponder responder = this.responder();
    while (responder != null) {
      // Delegate the write operation to the current responder.
      responder.doWrite();
      // Start processing the next responder, if the current responder changed.
      final HttpServerResponder nextResponder = this.responder();
      if (responder != nextResponder) {
        responder = nextResponder;
      } else {
        break;
      }
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

  protected void willWriteResponse(HttpRequest<?> request, HttpResponder responder) {
    this.server.willWriteResponse(request, responder);
  }

  protected void willWriteResponseMessage(HttpRequest<?> request, HttpResponder responder) {
    this.server.willWriteResponseMessage(request, responder);
  }

  protected void didWriteResponseMessage(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
    this.server.didWriteResponseMessage(request, response, responder);
  }

  protected void willWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
    this.server.willWriteResponsePayload(request, response, responder);
  }

  protected void didWriteResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
    this.server.didWriteResponsePayload(request, response, responder);
  }

  protected void didWriteResponse(HttpRequest<?> request, HttpResponse<?> response, HttpResponder responder) {
    this.server.didWriteResponse(request, response, responder);
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
    this.server.doTimeout();
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
  static final VarHandle RESPONDER_QUEUE;

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
    RESPONDER_QUEUE = MethodHandles.arrayElementVarHandle(HttpServerResponder.class.arrayType());
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
