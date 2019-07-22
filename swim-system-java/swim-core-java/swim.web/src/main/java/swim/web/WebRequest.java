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

package swim.web;

import swim.collections.FingerTrieSeq;
import swim.http.HttpEntity;
import swim.http.HttpHeader;
import swim.http.HttpMethod;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpVersion;
import swim.io.http.HttpResponder;
import swim.io.http.StaticHttpResponder;
import swim.io.warp.WarpSettings;
import swim.io.warp.WarpSocket;
import swim.io.warp.WarpWebSocket;
import swim.io.ws.WebSocket;
import swim.io.ws.WsSettings;
import swim.io.ws.WsUpgradeResponder;
import swim.uri.Uri;
import swim.uri.UriPath;
import swim.uri.UriQuery;
import swim.ws.WsResponse;

public abstract class WebRequest {
  public abstract HttpRequest<?> httpRequest();

  public HttpMethod httpMethod() {
    return httpRequest().method();
  }

  public Uri httpUri() {
    return httpRequest().uri();
  }

  public UriPath httpUriPath() {
    return httpUri().path();
  }

  public UriQuery httpUriQuery() {
    return httpUri().query();
  }

  public HttpVersion httpVersion() {
    return httpRequest().version();
  }

  public FingerTrieSeq<HttpHeader> httpHeaders() {
    return httpRequest().headers();
  }

  public HttpHeader getHttpHeader(String name) {
    return httpRequest().getHeader(name);
  }

  public <H extends HttpHeader> H getHttpHeader(Class<H> headerClass) {
    return httpRequest().getHeader(headerClass);
  }

  public HttpEntity<?> httpEntity() {
    return httpRequest().entity();
  }

  public abstract UriPath routePath();

  public abstract WebRequest routePath(UriPath routePath);

  public WebResponse accept(HttpResponder<?> responder) {
    return new WebServerAccepted(responder);
  }

  public WebResponse respond(HttpResponse<?> response) {
    return accept(new StaticHttpResponder<>(response));
  }

  public WebResponse upgrade(WebSocket<?, ?> webSocket, WsResponse wsResponse, WsSettings wsSettings) {
    return accept(new WsUpgradeResponder(webSocket, wsResponse, wsSettings));
  }

  public WebResponse upgrade(WarpSocket warpSocket, WsResponse wsResponse, WarpSettings warpSettings) {
    final WarpWebSocket webSocket = new WarpWebSocket(warpSocket, warpSettings);
    warpSocket.setWarpSocketContext(webSocket); // eagerly set
    return accept(new WsUpgradeResponder(webSocket, wsResponse, warpSettings.wsSettings()));
  }

  public WebResponse reject(HttpResponder<?> responder) {
    return new WebServerRejected(responder);
  }

  public WebResponse reject() {
    return WebServerRejected.notFound();
  }
}
