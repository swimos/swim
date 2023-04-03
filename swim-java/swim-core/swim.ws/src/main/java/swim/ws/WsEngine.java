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

package swim.ws;

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.collections.FingerTrieList;
import swim.http.HttpException;
import swim.http.HttpHeader;
import swim.http.HttpHeaders;
import swim.http.HttpMethod;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.HttpUpgrade;
import swim.http.header.ConnectionHeader;
import swim.http.header.HostHeader;
import swim.http.header.UpgradeHeader;
import swim.uri.Uri;
import swim.uri.UriPath;
import swim.ws.header.SecWebSocketAcceptHeader;
import swim.ws.header.SecWebSocketExtensionsHeader;
import swim.ws.header.SecWebSocketKeyHeader;
import swim.ws.header.SecWebSocketVersionHeader;

@Public
@Since("5.0")
public abstract class WsEngine {

  protected final WsOptions options;

  protected WsEngine(WsOptions options) {
    this.options = options;
  }

  public final WsOptions options() {
    return this.options;
  }

  public abstract WsDecoder decoder();

  public abstract WsEncoder encoder();

  public WsEngine acceptOptions(WsOptions options) {
    return this;
  }

  public @Nullable WsEngine acceptHandshakeRequest(HttpRequest<?> request) throws HttpException {
    boolean connectionUpgrade = false;
    boolean upgradeWebSocket = false;
    SecWebSocketKeyHeader key = null;
    FingerTrieList<WsExtension> extensions = FingerTrieList.empty();
    for (HttpHeader header : request.headers()) {
      if (header instanceof ConnectionHeader && ((ConnectionHeader) header).contains("Upgrade")) {
        connectionUpgrade = true;
      } else if (header instanceof UpgradeHeader && ((UpgradeHeader) header).supports(HttpUpgrade.WEBSOCKET)) {
        upgradeWebSocket = true;
      } else if (header instanceof SecWebSocketKeyHeader) {
        key = (SecWebSocketKeyHeader) header;
      } else if (header instanceof SecWebSocketExtensionsHeader) {
        extensions = ((SecWebSocketExtensionsHeader) header).extensions();
      }
    }
    if (connectionUpgrade && upgradeWebSocket && key != null) {
      return this.acceptOptions(this.options.extensions(extensions));
    }
    return null;
  }

  public @Nullable WsEngine acceptHandshakeResponse(HttpRequest<?> request, HttpResponse<?> response) throws HttpException {
    boolean connectionUpgrade = false;
    boolean upgradeWebSocket = false;
    SecWebSocketAcceptHeader accept = null;
    FingerTrieList<WsExtension> extensions = FingerTrieList.empty();
    for (HttpHeader header : response.headers()) {
      if (header instanceof ConnectionHeader && ((ConnectionHeader) header).contains("Upgrade")) {
        connectionUpgrade = true;
      } else if (header instanceof UpgradeHeader && ((UpgradeHeader) header).supports(HttpUpgrade.WEBSOCKET)) {
        upgradeWebSocket = true;
      } else if (header instanceof SecWebSocketAcceptHeader) {
        accept = (SecWebSocketAcceptHeader) header;
      } else if (header instanceof SecWebSocketExtensionsHeader) {
        extensions = ((SecWebSocketExtensionsHeader) header).extensions();
      }
    }
    if (response.status().code() == HttpStatus.SWITCHING_PROTOCOLS.code() && connectionUpgrade && upgradeWebSocket && accept != null) {
      final SecWebSocketKeyHeader key = request.headers().getHeader(SecWebSocketKeyHeader.TYPE);
      if (key != null && key.validate(accept.digest())) {
        return this.acceptOptions(this.options.extensions(extensions));
      }
    }
    return null;
  }

  public HttpRequest<?> handshakeRequest(Uri requestUri, HttpHeaders requestHeaders) {
    final HttpHeaders headers = HttpHeaders.of();
    headers.add(HostHeader.of(requestUri.authority()));
    headers.add(ConnectionHeader.UPGRADE);
    headers.add(UpgradeHeader.WEBSOCKET);
    headers.add(SecWebSocketVersionHeader.VERSION_13);
    headers.add(SecWebSocketKeyHeader.generate());
    final FingerTrieList<WsExtension> extensions = this.options.extensions();
    if (!extensions.isEmpty()) {
      headers.add(SecWebSocketExtensionsHeader.of(extensions));
    }
    headers.addAll(requestHeaders);
    final UriPath path = requestUri.path().isEmpty() ? UriPath.slash() : requestUri.path();
    final Uri target = Uri.of(null, null, path, requestUri.query(), null);
    return HttpRequest.of(HttpMethod.GET, target.toString(), headers);
  }

  public HttpRequest<?> handshakeRequest(Uri requestUri, HttpHeader... requestHeaders) {
    return this.handshakeRequest(requestUri, HttpHeaders.of(requestHeaders));
  }

  public HttpRequest<?> handshakeRequest(Uri requestUri) {
    return this.handshakeRequest(requestUri, HttpHeaders.empty());
  }

  public HttpResponse<?> handshakeResponse(HttpRequest<?> request, HttpHeaders responseHeaders) throws HttpException {
    final SecWebSocketKeyHeader key = request.headers().getHeader(SecWebSocketKeyHeader.TYPE);
    if (key == null) {
      throw new HttpException(HttpStatus.BAD_REQUEST, "missing " + SecWebSocketKeyHeader.NAME);
    }

    final HttpHeaders headers = HttpHeaders.of();
    headers.add(ConnectionHeader.UPGRADE);
    headers.add(UpgradeHeader.WEBSOCKET);
    headers.add(key.accept());
    final FingerTrieList<WsExtension> extensions = this.options.extensions();
    if (!extensions.isEmpty()) {
      headers.add(SecWebSocketExtensionsHeader.of(extensions));
    }
    headers.addAll(responseHeaders);
    return HttpResponse.of(HttpStatus.SWITCHING_PROTOCOLS, headers);
  }

  public HttpResponse<?> handshakeResponse(HttpRequest<?> request, HttpHeader... responseHeaders) throws HttpException {
    return this.handshakeResponse(request, HttpHeaders.of(responseHeaders));
  }

  public HttpResponse<?> handshakeResponse(HttpRequest<?> request) throws HttpException {
    return this.handshakeResponse(request, HttpHeaders.empty());
  }

}
