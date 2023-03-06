// Copyright 2015-2023 Swim.inc
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

package swim.remote;

import java.net.InetSocketAddress;
import swim.collections.FingerTrieSeq;
import swim.concurrent.Cont;
import swim.concurrent.TimerFunction;
import swim.concurrent.TimerRef;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.IpInterface;
import swim.io.IpSocketModem;
import swim.io.IpSocketRef;
import swim.io.http.HttpClient;
import swim.io.http.HttpClientContext;
import swim.io.http.HttpClientModem;
import swim.io.http.HttpSettings;
import swim.io.warp.AbstractWarpClient;
import swim.io.warp.WarpSettings;
import swim.io.warp.WarpSocketContext;
import swim.io.warp.WarpWebSocket;
import swim.io.ws.WsSettings;
import swim.system.HostContext;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriScheme;
import swim.ws.WsCloseFrame;
import swim.ws.WsRequest;

public class RemoteHostClient extends RemoteHost {

  final IpInterface endpoint;
  final WarpSettings warpSettings;
  HttpClient client;
  TimerRef reconnectTimer;
  double reconnectTimeout;

  public RemoteHostClient(Uri baseUri, IpInterface endpoint, WarpSettings warpSettings) {
    super(Uri.empty(), baseUri);
    this.endpoint = endpoint;
    this.warpSettings = warpSettings;
    this.client = null;
    this.reconnectTimer = null;
    this.reconnectTimeout = 0.0;
  }

  public RemoteHostClient(Uri baseUri, IpInterface endpoint) {
    this(baseUri, endpoint, WarpSettings.standard());
  }

  @Override
  public void setHostContext(HostContext hostContext) {
    super.setHostContext(hostContext);
  }

  public void connect() {
    final String scheme = this.baseUri.schemeName();
    final boolean isSecure = "warps".equals(scheme);

    final UriAuthority remoteAuthority = this.baseUri.authority();
    final String remoteAddress = remoteAuthority.host().address();
    final int remotePort = remoteAuthority.port().number();
    final int requestPort = remotePort > 0 ? remotePort : isSecure ? 443 : 80;

    if (this.client == null) {
      final Uri requestUri = Uri.create(UriScheme.create("http"), remoteAuthority, this.baseUri.path(), this.baseUri.query());
      final WarpSettings warpSettings = this.warpSettings;
      final WsSettings wsSettings = warpSettings.wsSettings();
      final WsRequest wsRequest = wsSettings.handshakeRequest(requestUri, RemoteHostClient.PROTOCOL_LIST);
      final WarpWebSocket webSocket = new WarpWebSocket(this, warpSettings);
      this.client = new RemoteHostClientBinding(this, webSocket, wsRequest, warpSettings);
      this.setWarpSocketContext(webSocket); // eagerly set
    }

    try {
      if (isSecure) {
        this.connectHttps(new InetSocketAddress(remoteAddress, requestPort), this.client, this.warpSettings.httpSettings());
      } else {
        this.connectHttp(new InetSocketAddress(remoteAddress, requestPort), this.client, this.warpSettings.httpSettings());
      }
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      cause.printStackTrace();
      this.reconnect();
    }
  }

  protected IpSocketRef connectHttp(InetSocketAddress remoteAddress, HttpClient client, HttpSettings httpSettings) {
    final HttpClientModem modem = new HttpClientModem(client, httpSettings);
    final IpSocketModem<HttpResponse<?>, HttpRequest<?>> socket = new IpSocketModem<HttpResponse<?>, HttpRequest<?>>(modem);
    return this.endpoint.connectTcp(remoteAddress, socket, httpSettings.ipSettings());
  }

  protected IpSocketRef connectHttps(InetSocketAddress remoteAddress, HttpClient client, HttpSettings httpSettings) {
    final HttpClientModem modem = new HttpClientModem(client, httpSettings);
    final IpSocketModem<HttpResponse<?>, HttpRequest<?>> socket = new IpSocketModem<HttpResponse<?>, HttpRequest<?>>(modem);
    return this.endpoint.connectTls(remoteAddress, socket, httpSettings.ipSettings());
  }

  @Override
  protected void reconnect() {
    if (this.warpSettings.wsSettings().autoClose()) {
      if (RemoteHost.DOWNLINKS.get(this).isEmpty() && RemoteHost.UPLINKS.get(this).isEmpty()) {
        close();
        return;
      }
    }
    if (this.reconnectTimer != null && this.reconnectTimer.isScheduled()) {
      return;
    }
    if (this.reconnectTimeout == 0.0) {
      final double jitter = 1000.0 * Math.random();
      this.reconnectTimeout = 500.0 + jitter;
    } else {
      this.reconnectTimeout = Math.min(1.8 * this.reconnectTimeout, RemoteHostClient.MAX_RECONNECT_TIMEOUT);
    }
    this.reconnectTimer = this.hostContext.schedule().setTimer((long) this.reconnectTimeout, new RemoteHostClientReconnectTimer(this));
  }

  @Override
  public void didConnect() {
    if (this.reconnectTimer != null) {
      this.reconnectTimer.cancel();
      this.reconnectTimer = null;
    }
    this.reconnectTimeout = 0.0;
    super.didConnect();
  }

  @Override
  protected void willOpen() {
    this.connect();
    super.willOpen();
  }

  @Override
  protected void didReadClose(WsCloseFrame<?, ?> frame) {
    Throwable failure = null;
    try {
      final WarpSocketContext warpSocketContext = this.warpSocketContext;
      if (warpSocketContext != null) {
        this.warpSocketContext = null;
        warpSocketContext.close();
      }
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.reconnect();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  @Override
  public void didFail(Throwable error) {
    Throwable failure = null;
    try {
      final WarpSocketContext warpSocketContext = this.warpSocketContext;
      if (warpSocketContext != null) {
        this.warpSocketContext = null;
        warpSocketContext.close();
      }
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.reconnect();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

  static final double MAX_RECONNECT_TIMEOUT = 15000.0;

  static final FingerTrieSeq<String> PROTOCOL_LIST = FingerTrieSeq.of("warp0");

}

final class RemoteHostClientBinding extends AbstractWarpClient {

  final RemoteHostClient client;
  final WarpWebSocket webSocket;
  final WsRequest wsRequest;
  final WarpSettings warpSettings;

  RemoteHostClientBinding(RemoteHostClient client, WarpWebSocket webSocket,
                          WsRequest wsRequest, WarpSettings warpSettings) {
    super(warpSettings);
    this.client = client;
    this.webSocket = webSocket;
    this.wsRequest = wsRequest;
    this.warpSettings = warpSettings;
  }

  @Override
  public void setHttpClientContext(HttpClientContext context) {
    super.setHttpClientContext(context);
  }

  @Override
  public void didConnect() {
    super.didConnect();
    this.doRequest(this.upgrade(this.webSocket, this.wsRequest));
  }

  @Override
  public void didDisconnect() {
    Throwable failure = null;
    try {
      this.webSocket.close();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.client.didDisconnect();
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

}

final class RemoteHostClientReconnectTimer implements TimerFunction {

  final RemoteHostClient client;

  RemoteHostClientReconnectTimer(RemoteHostClient client) {
    this.client = client;
  }

  @Override
  public void runTimer() {
    Throwable failure = null;
    try {
      this.client.connect();
    } catch (Throwable cause) {
      if (!Cont.isNonFatal(cause)) {
        throw cause;
      }
      failure = cause;
    }
    this.client.reconnect(); // schedule reconnect
    if (failure instanceof RuntimeException) {
      throw (RuntimeException) failure;
    } else if (failure instanceof Error) {
      throw (Error) failure;
    }
  }

}
