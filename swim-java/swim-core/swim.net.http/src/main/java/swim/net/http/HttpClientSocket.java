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
public class HttpClientSocket implements NetSocket, FlowContext, HttpClientContext {

  protected final HttpClient client;
  protected final HttpOptions httpOptions;
  protected @Nullable NetSocketContext context;
  protected ByteBuffer readBuffer;
  protected ByteBuffer writeBuffer;
  protected BinaryInputBuffer inputBuffer;
  protected BinaryOutputBuffer outputBuffer;
  final HttpClientRequester[] requesters;
  int requesterReadIndex;
  int requesterWriteIndex;
  final HttpClientRequester[] responders;
  int responderReadIndex;
  int responderWriteIndex;
  Log log;

  public HttpClientSocket(HttpClient client, HttpOptions httpOptions) {
    // Initialize socket parameters.
    this.client = client;
    this.httpOptions = httpOptions;

    // Initialize socket context.
    this.context = null;

    // Initialize I/O buffers.
    this.readBuffer = ByteBuffer.allocateDirect(httpOptions.readBufferSize());
    this.writeBuffer = ByteBuffer.allocateDirect(httpOptions.writeBufferSize());
    this.inputBuffer = new BinaryInputBuffer(this.readBuffer).asLast(false);
    this.outputBuffer = new BinaryOutputBuffer(this.writeBuffer).asLast(false);

    // Initialize the request pipeline.
    this.requesters = new HttpClientRequester[Math.max(2, httpOptions.clientPipelineLength())];
    this.requesterReadIndex = 0;
    this.requesterWriteIndex = 0;
    this.responders = new HttpClientRequester[Math.max(2, httpOptions.clientPipelineLength())];
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
    return Log.forTopic("swim.net.http.client").withFocus(this.logFocus());
  }

  public void setLog(Log log) {
    Objects.requireNonNull(log);
    this.log = log.withFocus(this.logFocus());
  }

  @Override
  public final HttpClient client() {
    return this.client;
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
    this.client.setClientContext(this);
  }

  @Override
  public long idleTimeout() {
    return this.client.idleTimeout();
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
  public final boolean isConnecting() {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.isConnecting();
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
  public boolean connect(InetSocketAddress remoteAddress) {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.connect(remoteAddress);
    } else {
      throw new IllegalStateException("Unbound socket");
    }
  }

  @Override
  public boolean connect(String address, int port) {
    final NetSocketContext context = this.context;
    if (context != null) {
      return context.connect(address, port);
    } else {
      throw new IllegalStateException("Unbound socket");
    }
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
    this.client.didOpen();

    this.log.infoConfig("opened socket", this);
  }

  @Override
  public boolean isRequesting() {
    final int readIndex = (int) REQUESTER_READ_INDEX.getAcquire(this);
    final int writeIndex = (int) REQUESTER_WRITE_INDEX.getAcquire(this);
    return readIndex != writeIndex;
  }

  @Nullable HttpClientRequester requester() {
    // Peek at the head of the MPSC requester queue.
    // Only the read task can safely peek at the current requester.
    final int readIndex = (int) REQUESTER_READ_INDEX.getOpaque(this);
    final int writeIndex = (int) REQUESTER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The requester queue is empty.
      return null;
    }

    do {
      // Try to atomically acquire the head of the requester queue.
      final HttpClientRequester requester = (HttpClientRequester) REQUESTER_QUEUE.getAcquire(this.requesters, readIndex);
      if (requester != null) {
        // Return the current requester.
        return requester;
      } else {
        // A new current requester is concurrently being enqueued; spin and try again.
        Thread.onSpinWait();
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public boolean enqueueRequester(HttpRequester handler) {
    final HttpClientRequester requester = new HttpClientRequester(this, handler);
    handler.setRequesterContext(requester);

    // Try to enqueue the requester into the MPSC requester queue.
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
        // release the requester into the queue.
        REQUESTER_QUEUE.setRelease(this.requesters, oldWriteIndex, requester);
        if (oldWriteIndex == readIndex) {
          // The requester queue was empty; trigger a write to begin processing
          // the request. We force a write instead of requesting one because
          // the selector might have already dispatched a write ready event,
          // in which case it won't dispatch a new write ready event until data
          // has been written to the socket.
          this.triggerWrite();
        }
        return true;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueRequester(HttpClientRequester requester) {
    // Try to dequeue the requester from the MPSC requester queue.
    // Only the write task is permitted to dequeue requesters.
    final int readIndex = (int) REQUESTER_READ_INDEX.getOpaque(this);
    int writeIndex = (int) REQUESTER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The requester queue is empty.
      throw new IllegalStateException("Inconsistent request pipeline");
    }

    // Clear the current requester, if it's the head of the requester queue.
    if (REQUESTER_QUEUE.compareAndExchange(this.requesters, readIndex, requester, null) != requester) {
      // The requester was not the head of the requester queue.
      throw new IllegalStateException("Inconsistent request pipeline");
    }
    // Increment the read index to free up the dequeued requester's old slot.
    final int newReadIndex = (readIndex + 1) % this.requesters.length;
    REQUESTER_READ_INDEX.setRelease(this, newReadIndex);

    // Reload the write index to check for concurrent enqueues.
    writeIndex = (int) REQUESTER_WRITE_INDEX.getAcquire(this);
    if (newReadIndex != writeIndex) {
      // The requester queue is non-empty; trigger a write to begin processing
      // the next request.
      this.triggerWrite();
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
    HttpClientRequester requester = this.requester();
    while (requester != null) {
      // Delegate the write operation to the current requester.
      requester.doWrite();
      // Start processing the next requester, if the current requester changed.
      final HttpClientRequester nextRequester = this.requester();
      if (requester != nextRequester) {
        requester = nextRequester;
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

  protected void willWriteRequest(HttpRequester requester) {
    this.client.willWriteRequest(requester);
  }

  protected void willWriteRequestMessage(HttpRequester requester) {
    this.client.willWriteRequestMessage(requester);
  }

  protected void didWriteRequestMessage(HttpRequest<?> request, HttpRequester requester) {
    this.client.didWriteRequestMessage(request, requester);
  }

  protected void willWriteRequestPayload(HttpRequest<?> request, HttpRequester requester) {
    this.client.willWriteRequestPayload(request, requester);
  }

  protected void didWriteRequestPayload(HttpRequest<?> request, HttpRequester requester) {
    this.client.didWriteRequestPayload(request, requester);
  }

  protected void didWriteRequest(HttpRequest<?> request, HttpRequester requester) {
    this.client.didWriteRequest(request, requester);
  }

  @Override
  public boolean isResponding() {
    final int readIndex = (int) RESPONDER_READ_INDEX.getAcquire(this);
    final int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    return readIndex != writeIndex;
  }

  @Nullable HttpClientRequester responder() {
    // Peek at the head of the MPSC responder queue.
    // Only the read task can safely peek at the current responder.
    final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
    final int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The responder queue is empty.
      return null;
    }

    do {
      // Try to atomically acquire the head of the responder queue.
      final HttpClientRequester responder = (HttpClientRequester) REQUESTER_QUEUE.getAcquire(this.responders, readIndex);
      if (responder != null) {
        // Return the current responder.
        return responder;
      } else {
        // A new current responder is concurrently being enqueued; spin and try again.
        Thread.onSpinWait();
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  boolean enqueueResponder(HttpClientRequester responder) {
    // Enqueue the requester into the MPSC responder queue.
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
        // release the requester into the queue.
        REQUESTER_QUEUE.setRelease(this.responders, oldWriteIndex, responder);
        // Responders aren't ready to read when first enqueued; the response
        // will begin after the request message has been written.
        return true;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueResponder(HttpClientRequester responder) {
    // Try to dequeue the requester from the MPSC responder queue.
    // Only the read task is permitted to dequeue responders.
    final int readIndex = (int) RESPONDER_READ_INDEX.getOpaque(this);
    int writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (readIndex == writeIndex) {
      // The responder queue is empty.
      throw new IllegalStateException("Inconsistent response pipeline");
    }

    // Clear the current responder, if it's the head of the responder queue.
    if (REQUESTER_QUEUE.compareAndExchange(this.responders, readIndex, responder, null) != responder) {
      // The responder was not the head of the responder queue.
      throw new IllegalStateException("Inconsistent response pipeline");
    }
    // Increment the read index to free up the dequeued responder's old slot.
    final int newReadIndex = (readIndex + 1) % this.responders.length;
    RESPONDER_READ_INDEX.setRelease(this, newReadIndex);

    // Request a write to ensure that request processing continues.
    this.requestWrite();

    // Reload the write index to check for concurrent enqueues.
    writeIndex = (int) RESPONDER_WRITE_INDEX.getAcquire(this);
    if (newReadIndex != writeIndex) {
      // The responder queue is non-empty; trigger a read to begin processing
      // the next response.
      this.triggerRead();
    } else if (this.isDoneWriting()) {
      this.doneReading();
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
    HttpClientRequester responder = this.responder();
    while (responder != null) {
      // Delegate the read operation to the current responder.
      responder.doRead();
      // Start processing the next responder, if the current responder changed.
      final HttpClientRequester nextResponder = this.responder();
      if (responder != nextResponder) {
        responder = nextResponder;
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

  protected void willReadResponse(HttpRequest<?> request, HttpRequester requester) {
    this.client.willReadResponse(request, requester);
  }

  protected void willReadResponseMessage(HttpRequest<?> request, HttpRequester requester) {
    this.client.willReadResponseMessage(request, requester);
  }

  protected void didReadResponseMessage(HttpRequest<?> request, HttpResponse<?> response, HttpRequester requester) {
    this.client.didReadResponseMessage(request, response, requester);
  }

  protected void willReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpRequester requester) {
    this.client.willReadResponsePayload(request, response, requester);
  }

  protected void didReadResponsePayload(HttpRequest<?> request, HttpResponse<?> response, HttpRequester requester) {
    this.client.didReadResponsePayload(request, response, requester);
  }

  protected void didReadResponse(HttpRequest<?> request, HttpResponse<?> response, HttpRequester requester) {
    this.client.didReadResponse(request, response, requester);
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

    this.client.willBecome(socket);
  }

  @Override
  public void didBecome(NetSocket socket) {
    this.client.didBecome(socket);

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
    this.client.doTimeout();
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
    this.log.debugEntity("closing socket", this.client);

    this.client.willClose();

    // TODO: willClose requesters.
  }

  @Override
  public void didClose() throws IOException {
    // TODO: didClose requesters

    this.client.didClose();

    this.log.info("closed socket");
  }

  /**
   * {@code VarHandle} for atomically accessing elements of an
   * {@link HttpClientRequester} array.
   */
  static final VarHandle REQUESTER_QUEUE;

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

  static {
    // Initialize var handles.
    REQUESTER_QUEUE = MethodHandles.arrayElementVarHandle(HttpClientRequester.class.arrayType());
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      REQUESTER_READ_INDEX = lookup.findVarHandle(HttpClientSocket.class, "requesterReadIndex", Integer.TYPE);
      REQUESTER_WRITE_INDEX = lookup.findVarHandle(HttpClientSocket.class, "requesterWriteIndex", Integer.TYPE);
      RESPONDER_READ_INDEX = lookup.findVarHandle(HttpClientSocket.class, "responderReadIndex", Integer.TYPE);
      RESPONDER_WRITE_INDEX = lookup.findVarHandle(HttpClientSocket.class, "responderWriteIndex", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
