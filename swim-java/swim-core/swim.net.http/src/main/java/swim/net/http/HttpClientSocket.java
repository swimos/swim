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
public class HttpClientSocket implements NetSocket, FlowContext, HttpClientContext {

  protected final HttpClient client;
  protected final HttpOptions httpOptions;
  protected @Nullable NetSocketContext context;
  protected ByteBuffer readBuffer;
  protected ByteBuffer writeBuffer;
  protected BinaryInputBuffer inputBuffer;
  protected BinaryOutputBuffer outputBuffer;
  FingerTrieList<HttpClientRequester> requesters;
  FingerTrieList<HttpClientRequester> responders;
  int status;
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
  public FingerTrieList<HttpRequesterContext> requestQueue() {
    return (FingerTrieList<HttpRequesterContext>) REQUESTERS.getOpaque(this);
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public void enqueueRequest(HttpRequester requester) {
    final HttpClientRequester requesterContext = new HttpClientRequester(this, requester);
    requester.setRequesterContext(requesterContext);

    FingerTrieList<HttpClientRequester> requesters = (FingerTrieList<HttpClientRequester>) REQUESTERS.getOpaque(this);
    do {
      final FingerTrieList<HttpClientRequester> oldRequesters = requesters;
      final FingerTrieList<HttpClientRequester> newRequesters = oldRequesters.appended(requesterContext);
      requesters = (FingerTrieList<HttpClientRequester>) REQUESTERS.compareAndExchangeRelease(this, oldRequesters, newRequesters);
      if (requesters == oldRequesters) {
        requesters = newRequesters;
        if (oldRequesters.isEmpty()) {
          this.triggerWrite();
        }
        break;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueRequest(HttpClientRequester requesterContext) {
    FingerTrieList<HttpClientRequester> requesters = (FingerTrieList<HttpClientRequester>) REQUESTERS.getOpaque(this);
    do {
      final FingerTrieList<HttpClientRequester> oldRequesters = requesters;
      if (oldRequesters.isEmpty() || oldRequesters.head() != requesterContext) {
        throw new IllegalStateException();
      }
      final FingerTrieList<HttpClientRequester> newRequesters = oldRequesters.tail();
      requesters = (FingerTrieList<HttpClientRequester>) REQUESTERS.compareAndExchangeAcquire(this, oldRequesters, newRequesters);
      if (requesters == oldRequesters) {
        requesters = newRequesters;
        if (!newRequesters.isEmpty() && !this.isDoneWriting()) {
          this.triggerWrite();
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
    final FingerTrieList<HttpClientRequester> requesters = (FingerTrieList<HttpClientRequester>) REQUESTERS.getAcquire(this);
    if (!requesters.isEmpty()) {
      final HttpClientRequester requesterContext = Assume.nonNull(requesters.head());
      requesterContext.doWrite();
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

  @SuppressWarnings("ReferenceEquality")
  void enqueueResponse(HttpClientRequester requesterContext) {
    FingerTrieList<HttpClientRequester> responders = (FingerTrieList<HttpClientRequester>) RESPONDERS.getOpaque(this);
    do {
      final FingerTrieList<HttpClientRequester> oldResponders = responders;
      final FingerTrieList<HttpClientRequester> newResponders = oldResponders.appended(requesterContext);
      responders = (FingerTrieList<HttpClientRequester>) RESPONDERS.compareAndExchangeRelease(this, oldResponders, newResponders);
      if (responders == oldResponders) {
        responders = newResponders;
        if (oldResponders.isEmpty()) {
          this.triggerRead();
        }
        break;
      }
    } while (true);
  }

  @SuppressWarnings("ReferenceEquality")
  void dequeueResponse(HttpClientRequester requesterContext) {
    FingerTrieList<HttpClientRequester> responders = (FingerTrieList<HttpClientRequester>) RESPONDERS.getOpaque(this);
    do {
      final FingerTrieList<HttpClientRequester> oldResponders = responders;
      if (oldResponders.isEmpty() || oldResponders.head() != requesterContext) {
        throw new IllegalStateException();
      }
      final FingerTrieList<HttpClientRequester> newResponders = oldResponders.tail();
      responders = (FingerTrieList<HttpClientRequester>) RESPONDERS.compareAndExchangeAcquire(this, oldResponders, newResponders);
      if (responders == oldResponders) {
        responders = newResponders;
        if (!newResponders.isEmpty()) {
          this.triggerRead();
        } else if (this.isDoneWriting()) {
          this.doneReading();
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
    final FingerTrieList<HttpClientRequester> responders = (FingerTrieList<HttpClientRequester>) RESPONDERS.getAcquire(this);
    if (!responders.isEmpty()) {
      final HttpClientRequester requesterContext = Assume.nonNull(responders.head());
      requesterContext.doRead();
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
      REQUESTERS = lookup.findVarHandle(HttpClientSocket.class, "requesters", FingerTrieList.class);
      RESPONDERS = lookup.findVarHandle(HttpClientSocket.class, "responders", FingerTrieList.class);
      STATUS = lookup.findVarHandle(HttpClientSocket.class, "status", Integer.TYPE);
    } catch (ReflectiveOperationException cause) {
      throw new ExceptionInInitializerError(cause);
    }
  }

}
