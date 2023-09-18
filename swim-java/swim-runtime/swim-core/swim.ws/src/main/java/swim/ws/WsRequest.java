// Copyright 2015-2023 Nstream, inc.
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

import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.http.Cookie;
import swim.http.HttpHeader;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.UpgradeProtocol;
import swim.http.WebSocketExtension;
import swim.http.header.ConnectionHeader;
import swim.http.header.CookieHeader;
import swim.http.header.HostHeader;
import swim.http.header.SecWebSocketAcceptHeader;
import swim.http.header.SecWebSocketExtensionsHeader;
import swim.http.header.SecWebSocketKeyHeader;
import swim.http.header.SecWebSocketProtocolHeader;
import swim.http.header.SecWebSocketVersionHeader;
import swim.http.header.UpgradeHeader;
import swim.uri.Uri;
import swim.uri.UriPath;
import swim.util.Builder;

/**
 * WebSocket handshake request.
 */
public class WsRequest {

  protected final HttpRequest<?> httpRequest;
  protected final SecWebSocketKeyHeader key;
  protected final FingerTrieSeq<String> protocols;
  protected final FingerTrieSeq<WebSocketExtension> extensions;
  protected final HashTrieMap<String, Cookie> cookies;

  public WsRequest(HttpRequest<?> httpRequest, SecWebSocketKeyHeader key, FingerTrieSeq<String> protocols,
                   HashTrieMap<String, Cookie> cookies, FingerTrieSeq<WebSocketExtension> extensions) {
    this.httpRequest = httpRequest;
    this.key = key;
    this.protocols = protocols;
    this.cookies = cookies;
    this.extensions = extensions;
  }

  public final HttpRequest<?> httpRequest() {
    return this.httpRequest;
  }

  public final SecWebSocketKeyHeader key() {
    return this.key;
  }

  public final FingerTrieSeq<String> protocols() {
    return this.protocols;
  }

  public final HashTrieMap<String, Cookie> cookies() {
    return this.cookies;
  }

  public final FingerTrieSeq<WebSocketExtension> extensions() {
    return this.extensions;
  }

  public HttpResponse<?> httpResponse(String protocol, FingerTrieSeq<WebSocketExtension> extensions,
                                      FingerTrieSeq<HttpHeader> headers) {
    final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> responseHeaders = FingerTrieSeq.builder();
    responseHeaders.add(ConnectionHeader.upgrade());
    responseHeaders.add(UpgradeHeader.websocket());
    responseHeaders.add(this.key.accept());
    if (protocol != null) {
      responseHeaders.add(SecWebSocketProtocolHeader.create(protocol));
    }
    if (!extensions.isEmpty()) {
      responseHeaders.add(SecWebSocketExtensionsHeader.create(extensions));
    }
    responseHeaders.addAll(headers);
    return HttpResponse.create(HttpStatus.SWITCHING_PROTOCOLS, responseHeaders.bind());
  }

  public HttpResponse<?> httpResponse(String protocol, HttpHeader... headers) {
    return this.httpResponse(protocol, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.of(headers));
  }

  public HttpResponse<?> httpResponse(String protocol) {
    return this.httpResponse(protocol, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.<HttpHeader>empty());
  }

  public HttpResponse<?> httpResponse(FingerTrieSeq<HttpHeader> headers) {
    return this.httpResponse(null, FingerTrieSeq.<WebSocketExtension>empty(), headers);
  }

  public HttpResponse<?> httpResponse(HttpHeader... headers) {
    return this.httpResponse(null, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.of(headers));
  }

  public HttpResponse<?> httpResponse() {
    return this.httpResponse(null, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.<HttpHeader>empty());
  }

  public WsResponse accept(WsEngineSettings settings, String protocol, FingerTrieSeq<HttpHeader> headers) {
    final FingerTrieSeq<WebSocketExtension> responseExtensions = settings.acceptExtensions(this.extensions);
    final HttpResponse<?> httpResponse = this.httpResponse(protocol, responseExtensions, headers);
    return new WsResponse(this.httpRequest, httpResponse, protocol, responseExtensions);
  }

  public WsResponse accept(WsEngineSettings settings, String protocol, HttpHeader... headers) {
    return this.accept(settings, protocol, FingerTrieSeq.of(headers));
  }

  public WsResponse accept(WsEngineSettings settings, String protocol) {
    return this.accept(settings, protocol, FingerTrieSeq.<HttpHeader>empty());
  }

  public WsResponse accept(WsEngineSettings settings, FingerTrieSeq<HttpHeader> headers) {
    return this.accept(settings, null, headers);
  }

  public WsResponse accept(WsEngineSettings settings, HttpHeader... headers) {
    return this.accept(settings, null, FingerTrieSeq.of(headers));
  }

  public WsResponse accept(WsEngineSettings settings) {
    return this.accept(settings, null, FingerTrieSeq.<HttpHeader>empty());
  }

  public WsResponse accept(HttpResponse<?> httpResponse, WsEngineSettings settings) {
    boolean connectionUpgrade = false;
    boolean upgradeWebSocket = false;
    SecWebSocketAcceptHeader accept = null;
    String protocol = null;
    FingerTrieSeq<WebSocketExtension> extensions = FingerTrieSeq.empty();
    for (HttpHeader header : httpResponse.headers()) {
      if (header instanceof ConnectionHeader && ((ConnectionHeader) header).contains("Upgrade")) {
        connectionUpgrade = true;
      } else if (header instanceof UpgradeHeader && ((UpgradeHeader) header).supports(UpgradeProtocol.websocket())) {
        upgradeWebSocket = true;
      } else if (header instanceof SecWebSocketAcceptHeader) {
        accept = (SecWebSocketAcceptHeader) header;
      } else if (header instanceof SecWebSocketProtocolHeader) {
        final FingerTrieSeq<String> protocols = ((SecWebSocketProtocolHeader) header).protocols();
        if (!protocols.isEmpty()) {
          protocol = protocols.head();
        }
      } else if (header instanceof SecWebSocketExtensionsHeader) {
        extensions = ((SecWebSocketExtensionsHeader) header).extensions();
      }
    }
    if (httpResponse.status().code() == 101 && connectionUpgrade && upgradeWebSocket && accept != null) {
      extensions = settings.acceptExtensions(extensions);
      return new WsResponse(this.httpRequest, httpResponse, protocol, extensions);
    }
    return null;
  }

  public static WsRequest create(Uri uri, FingerTrieSeq<String> protocols,
                                 FingerTrieSeq<WebSocketExtension> extensions,
                                 HashTrieMap<String, Cookie> cookies,
                                 FingerTrieSeq<HttpHeader> headers) {
    final SecWebSocketKeyHeader key = SecWebSocketKeyHeader.generate();
    final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> requestHeaders = FingerTrieSeq.builder();
    requestHeaders.add(HostHeader.create(uri.authority()));
    requestHeaders.add(ConnectionHeader.upgrade());
    requestHeaders.add(UpgradeHeader.websocket());
    requestHeaders.add(SecWebSocketVersionHeader.version13());
    requestHeaders.add(key);
    if (!protocols.isEmpty()) {
      requestHeaders.add(SecWebSocketProtocolHeader.create(protocols));
    }
    if (!extensions.isEmpty()) {
      requestHeaders.add(SecWebSocketExtensionsHeader.create(extensions));
    }
    if (headers != null) {
      requestHeaders.addAll(headers);
    }
    final UriPath requestPath = uri.path().isEmpty() ? UriPath.slash() : uri.path();
    final Uri requestUri = Uri.create(null, null, requestPath, uri.query(), null);
    final HttpRequest<?> httpRequest = HttpRequest.get(requestUri, requestHeaders.bind());
    return new WsRequest(httpRequest, key, protocols, cookies, extensions);
  }

  public static WsRequest create(Uri uri, FingerTrieSeq<String> protocols, HttpHeader... headers) {
    return WsRequest.create(uri, protocols, FingerTrieSeq.empty(), HashTrieMap.empty(), FingerTrieSeq.of(headers));
  }

  public static WsRequest create(Uri uri, FingerTrieSeq<String> protocols) {
    return WsRequest.create(uri, protocols, FingerTrieSeq.empty(), HashTrieMap.empty(), FingerTrieSeq.empty());
  }

  public static WsRequest create(Uri uri, HttpHeader... headers) {
    return WsRequest.create(uri, FingerTrieSeq.empty(), FingerTrieSeq.empty(), HashTrieMap.empty(), FingerTrieSeq.of(headers));
  }

  public static WsRequest create(Uri uri) {
    return WsRequest.create(uri, FingerTrieSeq.empty(), FingerTrieSeq.empty(), HashTrieMap.empty(), FingerTrieSeq.empty());
  }

  public static WsRequest create(HttpRequest<?> httpRequest) {
    boolean connectionUpgrade = false;
    boolean upgradeWebSocket = false;
    SecWebSocketKeyHeader key = null;
    FingerTrieSeq<String> protocols = FingerTrieSeq.empty();
    HashTrieMap<String, Cookie> cookies = HashTrieMap.empty();
    FingerTrieSeq<WebSocketExtension> extensions = FingerTrieSeq.empty();
    for (HttpHeader header : httpRequest.headers()) {
      if (header instanceof ConnectionHeader && ((ConnectionHeader) header).contains("Upgrade")) {
        connectionUpgrade = true;
      } else if (header instanceof UpgradeHeader && ((UpgradeHeader) header).supports(UpgradeProtocol.websocket())) {
        upgradeWebSocket = true;
      } else if (header instanceof SecWebSocketKeyHeader) {
        key = (SecWebSocketKeyHeader) header;
      } else if (header instanceof SecWebSocketProtocolHeader) {
        protocols = ((SecWebSocketProtocolHeader) header).protocols();
      } else if (header instanceof CookieHeader) {
        cookies = ((CookieHeader) header).cookies();
      } else if (header instanceof SecWebSocketExtensionsHeader) {
        extensions = ((SecWebSocketExtensionsHeader) header).extensions();
      }
    }
    if (connectionUpgrade && upgradeWebSocket && key != null) {
      return new WsRequest(httpRequest, key, protocols, cookies, extensions);
    }
    return null;
  }

}
