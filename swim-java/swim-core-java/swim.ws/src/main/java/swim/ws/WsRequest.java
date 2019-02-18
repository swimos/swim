// Copyright 2015-2019 SWIM.AI inc.
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
import swim.http.HttpHeader;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.UpgradeProtocol;
import swim.http.WebSocketExtension;
import swim.http.header.Connection;
import swim.http.header.Host;
import swim.http.header.SecWebSocketAccept;
import swim.http.header.SecWebSocketExtensions;
import swim.http.header.SecWebSocketKey;
import swim.http.header.SecWebSocketProtocol;
import swim.http.header.SecWebSocketVersion;
import swim.http.header.Upgrade;
import swim.uri.Uri;
import swim.uri.UriPath;
import swim.util.Builder;

/**
 * WebSocket handshake request.
 */
public class WsRequest {
  protected final HttpRequest<?> httpRequest;
  protected final SecWebSocketKey key;
  protected final FingerTrieSeq<String> protocols;
  protected final FingerTrieSeq<WebSocketExtension> extensions;

  public WsRequest(HttpRequest<?> httpRequest, SecWebSocketKey key, FingerTrieSeq<String> protocols,
                   FingerTrieSeq<WebSocketExtension> extensions) {
    this.httpRequest = httpRequest;
    this.key = key;
    this.protocols = protocols;
    this.extensions = extensions;
  }

  public final HttpRequest<?> httpRequest() {
    return this.httpRequest;
  }

  public final SecWebSocketKey key() {
    return this.key;
  }

  public final FingerTrieSeq<String> protocols() {
    return this.protocols;
  }

  public final FingerTrieSeq<WebSocketExtension> extensions() {
    return this.extensions;
  }

  public HttpResponse<?> httpResponse(String protocol, FingerTrieSeq<WebSocketExtension> extensions,
                                      FingerTrieSeq<HttpHeader> headers) {
    final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> responseHeaders = FingerTrieSeq.builder();
    responseHeaders.add(Connection.upgrade());
    responseHeaders.add(Upgrade.websocket());
    responseHeaders.add(this.key.accept());
    if (protocol != null) {
      responseHeaders.add(SecWebSocketProtocol.from(protocol));
    }
    if (!extensions.isEmpty()) {
      responseHeaders.add(SecWebSocketExtensions.from(extensions));
    }
    responseHeaders.addAll(headers);
    return HttpResponse.from(HttpStatus.SWITCHING_PROTOCOLS, responseHeaders.bind());
  }

  public HttpResponse<?> httpResponse(String protocol, HttpHeader... headers) {
    return httpResponse(protocol, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.of(headers));
  }

  public HttpResponse<?> httpResponse(String protocol) {
    return httpResponse(protocol, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.<HttpHeader>empty());
  }

  public HttpResponse<?> httpResponse(FingerTrieSeq<HttpHeader> headers) {
    return httpResponse(null, FingerTrieSeq.<WebSocketExtension>empty(), headers);
  }

  public HttpResponse<?> httpResponse(HttpHeader... headers) {
    return httpResponse(null, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.of(headers));
  }

  public HttpResponse<?> httpResponse() {
    return httpResponse(null, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.<HttpHeader>empty());
  }

  public WsResponse accept(WsEngineSettings settings, String protocol, FingerTrieSeq<HttpHeader> headers) {
    final FingerTrieSeq<WebSocketExtension> responseExtensions = settings.acceptExtensions(this.extensions);
    final HttpResponse<?> httpResponse = httpResponse(protocol, responseExtensions, headers);
    return new WsResponse(this.httpRequest, httpResponse, protocol, responseExtensions);
  }

  public WsResponse accept(WsEngineSettings settings, String protocol, HttpHeader... headers) {
    return accept(settings, protocol, FingerTrieSeq.of(headers));
  }

  public WsResponse accept(WsEngineSettings settings, String protocol) {
    return accept(settings, protocol, FingerTrieSeq.<HttpHeader>empty());
  }

  public WsResponse accept(WsEngineSettings settings, FingerTrieSeq<HttpHeader> headers) {
    return accept(settings, null, headers);
  }

  public WsResponse accept(WsEngineSettings settings, HttpHeader... headers) {
    return accept(settings, null, FingerTrieSeq.of(headers));
  }

  public WsResponse accept(WsEngineSettings settings) {
    return accept(settings, null, FingerTrieSeq.<HttpHeader>empty());
  }

  public WsResponse accept(HttpResponse<?> httpResponse, WsEngineSettings settings) {
    boolean connectionUpgrade = false;
    boolean upgradeWebSocket = false;
    SecWebSocketAccept accept = null;
    String protocol = null;
    FingerTrieSeq<WebSocketExtension> extensions = FingerTrieSeq.empty();
    for (HttpHeader header : httpResponse.headers()) {
      if (header instanceof Connection && ((Connection) header).contains("Upgrade")) {
        connectionUpgrade = true;
      } else if (header instanceof Upgrade && ((Upgrade) header).supports(UpgradeProtocol.websocket())) {
        upgradeWebSocket = true;
      } else if (header instanceof SecWebSocketAccept) {
        accept = (SecWebSocketAccept) header;
      } else if (header instanceof SecWebSocketProtocol) {
        final FingerTrieSeq<String> protocols = ((SecWebSocketProtocol) header).protocols();
        if (!protocols.isEmpty()) {
          protocol = protocols.head();
        }
      } else if (header instanceof SecWebSocketExtensions) {
        extensions = ((SecWebSocketExtensions) header).extensions();
      }
    }
    if (httpResponse.status().code() == 101 && connectionUpgrade && upgradeWebSocket && accept != null) {
      extensions = settings.acceptExtensions(extensions);
      return new WsResponse(this.httpRequest, httpResponse, protocol, extensions);
    }
    return null;
  }

  public static WsRequest from(Uri uri, FingerTrieSeq<String> protocols,
                               FingerTrieSeq<WebSocketExtension> extensions,
                               FingerTrieSeq<HttpHeader> headers) {
    final SecWebSocketKey key = SecWebSocketKey.generate();
    final Builder<HttpHeader, FingerTrieSeq<HttpHeader>> requestHeaders = FingerTrieSeq.builder();
    requestHeaders.add(Host.from(uri.authority()));
    requestHeaders.add(Connection.upgrade());
    requestHeaders.add(Upgrade.websocket());
    requestHeaders.add(SecWebSocketVersion.version13());
    requestHeaders.add(key);
    if (!protocols.isEmpty()) {
      requestHeaders.add(SecWebSocketProtocol.from(protocols));
    }
    if (!extensions.isEmpty()) {
      requestHeaders.add(SecWebSocketExtensions.from(extensions));
    }
    if (headers != null) {
      requestHeaders.addAll(headers);
    }
    final UriPath requestPath = uri.path().isEmpty() ? UriPath.slash() : uri.path();
    final Uri requestUri = Uri.from(null, null, requestPath, uri.query(), null);
    final HttpRequest<?> httpRequest = HttpRequest.get(requestUri, requestHeaders.bind());
    return new WsRequest(httpRequest, key, protocols, extensions);
  }

  public static WsRequest from(Uri uri, FingerTrieSeq<String> protocols, HttpHeader... headers) {
    return from(uri, protocols, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.of(headers));
  }

  public static WsRequest from(Uri uri, FingerTrieSeq<String> protocols) {
    return from(uri, protocols, FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.<HttpHeader>empty());
  }

  public static WsRequest from(Uri uri, HttpHeader... headers) {
    return from(uri, FingerTrieSeq.<String>empty(), FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.of(headers));
  }

  public static WsRequest from(Uri uri) {
    return from(uri, FingerTrieSeq.<String>empty(), FingerTrieSeq.<WebSocketExtension>empty(), FingerTrieSeq.<HttpHeader>empty());
  }

  public static WsRequest from(HttpRequest<?> httpRequest) {
    boolean connectionUpgrade = false;
    boolean upgradeWebSocket = false;
    SecWebSocketKey key = null;
    FingerTrieSeq<String> protocols = FingerTrieSeq.empty();
    FingerTrieSeq<WebSocketExtension> extensions = FingerTrieSeq.empty();
    for (HttpHeader header : httpRequest.headers()) {
      if (header instanceof Connection && ((Connection) header).contains("Upgrade")) {
        connectionUpgrade = true;
      } else if (header instanceof Upgrade && ((Upgrade) header).supports(UpgradeProtocol.websocket())) {
        upgradeWebSocket = true;
      } else if (header instanceof SecWebSocketKey) {
        key = (SecWebSocketKey) header;
      } else if (header instanceof SecWebSocketProtocol) {
        protocols = ((SecWebSocketProtocol) header).protocols();
      } else if (header instanceof SecWebSocketExtensions) {
        extensions = ((SecWebSocketExtensions) header).extensions();
      }
    }
    if (connectionUpgrade && upgradeWebSocket && key != null) {
      return new WsRequest(httpRequest, key, protocols, extensions);
    }
    return null;
  }
}
