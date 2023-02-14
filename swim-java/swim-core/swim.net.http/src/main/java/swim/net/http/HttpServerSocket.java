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
import swim.collections.FingerTrieList;
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
  FingerTrieList<HttpServerResponder> requesters;
  FingerTrieList<HttpServerResponder> responders;
  int status;
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

    // Initialize pipeline queues.
    this.requesters = FingerTrieList.empty();
    this.responders = FingerTrieList.empty();

    // Initialize socket status.
    this.status = 0;

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
  public FingerTrieList<HttpResponderContext> responseQueue() {
    return (FingerTrieList<HttpResponderContext>) RESPONDERS.getOpaque(this);
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public void enqueueRequest(HttpResponder responder) {
    final HttpServerResponder responderContext = new HttpServerResponder(this, responder);
    responder.setResponderContext(responderContext);

    FingerTrieList<HttpServerResponder> requesters = (FingerTrieList<HttpServerResponder>) REQUESTERS.getOpaque(this);
    do {
      final FingerTrieList<HttpServerResponder> oldRequesters = requesters;
      final FingerTrieList<HttpServerResponder> newRequesters = oldRequesters.appended(responderContext);
      requesters = (FingerTrieList<HttpServerResponder>) REQUESTERS.compareAndExchangeRelease(this, oldRequesters, newRequesters);
      if (requesters == oldRequesters) {
        requesters = newRequesters;
        if (oldRequesters.isEmpty()) {
          this.triggerRead();
        }
        break;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueRequest(HttpServerResponder responderContext) {
    FingerTrieList<HttpServerResponder> requesters = (FingerTrieList<HttpServerResponder>) REQUESTERS.getOpaque(this);
    do {
      final FingerTrieList<HttpServerResponder> oldRequesters = requesters;
      if (oldRequesters.isEmpty() || oldRequesters.head() != responderContext) {
        throw new IllegalStateException();
      }
      final FingerTrieList<HttpServerResponder> newRequesters = oldRequesters.tail();
      requesters = (FingerTrieList<HttpServerResponder>) REQUESTERS.compareAndExchangeAcquire(this, oldRequesters, newRequesters);
      if (requesters == oldRequesters) {
        requesters = newRequesters;
        if (!newRequesters.isEmpty() && !this.isDoneReading()) {
          this.triggerRead();
        }
        break;
      }
    } while (true);
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
    final FingerTrieList<HttpServerResponder> requesters = (FingerTrieList<HttpServerResponder>) REQUESTERS.getAcquire(this);
    if (!requesters.isEmpty()) {
      final HttpServerResponder responderContext = Assume.nonNull(requesters.head());
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

  @SuppressWarnings("ReferenceEquality")
  void enqueueResponse(HttpServerResponder responderContext) {
    FingerTrieList<HttpServerResponder> responders = (FingerTrieList<HttpServerResponder>) RESPONDERS.getOpaque(this);
    do {
      final FingerTrieList<HttpServerResponder> oldResponders = responders;
      final FingerTrieList<HttpServerResponder> newResponders = oldResponders.appended(responderContext);
      responders = (FingerTrieList<HttpServerResponder>) RESPONDERS.compareAndExchangeRelease(this, oldResponders, newResponders);
      if (responders == oldResponders) {
        responders = newResponders;
        if (oldResponders.isEmpty()) {
          this.triggerWrite();
        }
        break;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueResponse(HttpServerResponder responderContext) {
    FingerTrieList<HttpServerResponder> responders = (FingerTrieList<HttpServerResponder>) RESPONDERS.getOpaque(this);
    do {
      final FingerTrieList<HttpServerResponder> oldResponders = responders;
      if (oldResponders.isEmpty() || oldResponders.head() != responderContext) {
        throw new IllegalStateException();
      }
      final FingerTrieList<HttpServerResponder> newResponders = oldResponders.tail();
      responders = (FingerTrieList<HttpServerResponder>) RESPONDERS.compareAndExchangeAcquire(this, oldResponders, newResponders);
      if (responders == oldResponders) {
        responders = newResponders;
        if (!newResponders.isEmpty()) {
          this.triggerWrite();
        } else if (this.isDoneReading()) {
          this.doneWriting();
        }
        break;
      }
    } while (true);
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
    final FingerTrieList<HttpServerResponder> responders = (FingerTrieList<HttpServerResponder>) RESPONDERS.getAcquire(this);
    if (!responders.isEmpty()) {
      final HttpServerResponder responderContext = Assume.nonNull(responders.head());
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
   * {@code VarHandle} for atomically accessing the {@link #requesters} field.
   */
  static final VarHandle REQUESTERS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #responders} field.
   */
  static final VarHandle RESPONDERS;

  /**
   * {@code VarHandle} for atomically accessing the {@link #status} field.
   */
  static final VarHandle STATUS;

  static {
    // Initialize var handles.
    final MethodHandles.Lookup lookup = MethodHandles.lookup();
    try {
      REQUESTERS = lookup.findVarHandle(HttpServerSocket.class, "requesters", FingerTrieList.class);
      RESPONDERS = lookup.findVarHandle(HttpServerSocket.class, "responders", FingerTrieList.class);
      STATUS = lookup.findVarHandle(HttpServerSocket.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
