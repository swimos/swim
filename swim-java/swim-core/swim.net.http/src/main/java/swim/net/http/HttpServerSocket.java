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
import swim.http.HttpPayload;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.log.Log;
import swim.net.FlowContext;
import swim.net.NetSocket;
import swim.net.NetSocketContext;
import swim.net.TcpEndpoint;
import swim.util.Assume;

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
  @Nullable HttpServerResponder requesting;
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

    // Initialize the request pipeline.
    this.requesting = null;
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

  @Nullable HttpServerResponder requesting() {
    return (HttpServerResponder) REQUESTING.getOpaque(this);
  }

  @Override
  public boolean enqueueRequest(HttpResponder responder) {
    final HttpServerResponder responderContext = new HttpServerResponder(this, responder);
    responder.setResponderContext(responderContext);

    // Atomically set the current requester, synchronizing with concurrent dequeues.
    // Only one requester can be enqueued at a time.
    if (REQUESTING.compareAndExchangeAcquire(this, null, responderContext) != null) {
      // Another request is already being processed. The caller must wait until
      // that request is complete before enqueueing a new request.
      return false;
    }

    // Trigger a read operation to begin processing the request.
    // We force a read instead of requesting one to ensure that
    // any buffered data left over from the last request gets consumed.
    this.triggerRead();
    // The requester was successfully enqueued.
    return true;
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueRequest(HttpServerResponder responderContext) {
    // Atomically clear the current requester, synchronizing with concurrent enqueues.
    if (REQUESTING.compareAndExchangeRelease(this, responderContext, null) != responderContext) {
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
    final HttpServerResponder responderContext = this.requesting();
    if (responderContext != null) {
      // Delegate the read operation to the current requester.
      responderContext.doRead();
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

  @Nullable HttpServerResponder responding() {
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
      final HttpServerResponder responderContext = (HttpServerResponder) RESPONDER_QUEUE.getAcquire(this.responders, readIndex);
      if (responderContext != null) {
        // Return the current responder.
        return responderContext;
      } else {
        // A new current responder is being concurrently enqueued; spin and try again.
        Thread.onSpinWait();
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  boolean enqueueResponse(HttpServerResponder responderContext) {
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
        RESPONDER_QUEUE.setRelease(this.responders, oldWriteIndex, responderContext);
        // Responders aren't ready to write when first enqueued; the response
        // will begin after the request message has been received.
        return true;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueResponse(HttpServerResponder responderContext) {
    // Try to dequeue the responder from the MPSC responder queue.
    // Only the write task is permitted to dequeue responders.
    final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
    int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The responder queue is empty.
      throw new IllegalStateException("Inconsistent response pipeline");
    }

    // Clear the current responder, assuming it's at the head of the responder queue.
    if (RESPONDER_QUEUE.compareAndExchangeAcquire(this.responders, readIndex, responderContext, null) != responderContext) {
      throw new IllegalStateException("Inconsistent response pipeline");
    }
    // Increment the read index to free up the dequeued responder's old slot.
    final int newReadIndex = (readIndex + 1) % this.responders.length;
    RESPONDER_READ_INDEX.setRelease(this, newReadIndex);

    if (readIndex == (writeIndex + 1) % this.responders.length) {
      // The responder queue was full; request a read to ensure that
      // request processing resumes.
      this.requestRead();
    }

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
    final HttpServerResponder responderContext = this.responding();
    if (responderContext != null) {
      // Delegate the write operation to the current responder.
      responderContext.doWrite();
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
   * {@code VarHandle} for atomically accessing the {@link #requesting} field.
   */
  static final VarHandle REQUESTING;

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
      REQUESTING = lookup.findVarHandle(HttpServerSocket.class, "requesting", HttpServerResponder.class);
      RESPONDER_READ_INDEX = lookup.findVarHandle(HttpServerSocket.class, "responderReadIndex", Integer.TYPE);
      RESPONDER_WRITE_INDEX = lookup.findVarHandle(HttpServerSocket.class, "responderWriteIndex", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
