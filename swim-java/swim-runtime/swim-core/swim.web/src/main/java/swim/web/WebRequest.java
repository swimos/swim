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

package swim.web;

import swim.collections.FingerTrieSeq;
import swim.http.HttpHeader;
import swim.http.HttpMethod;
import swim.http.HttpPayload;
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

  public WebRequest() {
    // hook
  }

  public abstract HttpRequest<?> httpRequest();

  public HttpMethod httpMethod() {
    return this.httpRequest().method();
  }

  public Uri httpUri() {
    return this.httpRequest().uri();
  }

  public UriPath httpUriPath() {
    return this.httpUri().path();
  }

  public UriQuery httpUriQuery() {
    return this.httpUri().query();
  }

  public HttpVersion httpVersion() {
    return this.httpRequest().version();
  }

  public FingerTrieSeq<HttpHeader> httpHeaders() {
    return this.httpRequest().headers();
  }

  public HttpHeader getHttpHeader(String name) {
    return this.httpRequest().getHeader(name);
  }

  public <H extends HttpHeader> H getHttpHeader(Class<H> headerClass) {
    return this.httpRequest().getHeader(headerClass);
  }

  public HttpPayload<?> httpPayload() {
    return this.httpRequest().payload();
  }

  public abstract UriPath routePath();

  public abstract WebRequest routePath(UriPath routePath);

  public WebResponse accept(HttpResponder<?> responder) {
    return new WebServerAccepted(responder);
  }

  public WebResponse respond(HttpResponse<?> response) {
    return this.accept(new StaticHttpResponder<>(response));
  }

  public WebResponse upgrade(WebSocket<?, ?> webSocket, WsResponse wsResponse, WsSettings wsSettings) {
    return this.accept(new WsUpgradeResponder(webSocket, wsResponse, wsSettings));
  }

  public WebResponse upgrade(WarpSocket warpSocket, WsResponse wsResponse, WarpSettings warpSettings) {
    final WarpWebSocket webSocket = new WarpWebSocket(warpSocket, warpSettings);
    warpSocket.setWarpSocketContext(webSocket); // eagerly set
    return this.accept(new WsUpgradeResponder(webSocket, wsResponse, warpSettings.wsSettings()));
  }

  public WebResponse reject(HttpResponder<?> responder) {
    return new WebServerRejected(responder);
  }

  public WebResponse reject() {
    return WebServerRejected.notFound();
  }

}
