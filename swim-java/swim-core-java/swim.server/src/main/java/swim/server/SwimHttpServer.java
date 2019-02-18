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

package swim.server;

import java.io.IOException;
import java.nio.file.Paths;
import swim.api.policy.PlanePolicy;
import swim.api.policy.PolicyDirective;
import swim.http.HttpBody;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.io.http.HttpResponder;
import swim.io.http.StaticHttpResponder;
import swim.io.warp.AbstractWarpServer;
import swim.linker.WarpServiceDef;
import swim.remote.RemoteHost;
import swim.runtime.MeshBinding;
import swim.runtime.PartBinding;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPath;
import swim.uri.UriPort;
import swim.uri.UriScheme;
import swim.ws.WsRequest;
import swim.ws.WsResponse;

final class SwimHttpServer extends AbstractWarpServer {
  final ServerPlane plane;
  final WarpServiceDef serviceDef;
  final Uri documentRoot;

  SwimHttpServer(ServerPlane plane, WarpServiceDef serviceDef) {
    super(serviceDef.warpSettings());
    this.plane = plane;
    this.serviceDef = serviceDef;
    Uri documentRoot = serviceDef.documentRoot();
    if (documentRoot != null && documentRoot.path().isRelative()) {
      Uri cwd = Uri.parse(Paths.get("").toAbsolutePath().toString().replace('\\', '/'));
      if (!cwd.path().foot().isAbsolute()) {
        cwd = cwd.path(cwd.path().appendedSlash());
      }
      documentRoot = cwd.resolve(documentRoot);
    }
    this.documentRoot = documentRoot;
  }

  RemoteHost openHost(Uri requestUri) {
    final Uri baseUri = Uri.from(UriScheme.from("warp"),
        UriAuthority.from(UriHost.inetAddress(context.localAddress().getAddress()),
                          UriPort.from(context.localAddress().getPort())),
        requestUri.path(), requestUri.query(), requestUri.fragment());

    final Uri remoteUri = Uri.from(UriScheme.from("warp"),
        UriAuthority.from(UriHost.inetAddress(context.remoteAddress().getAddress()),
                          UriPort.from(context.remoteAddress().getPort())), UriPath.slash());

    final MeshBinding mesh = this.plane.root.openMesh(remoteUri);
    final PartBinding gateway = mesh.openGateway();
    final RemoteHost host = new RemoteHost(requestUri, baseUri);
    gateway.openHost(remoteUri, host);
    return host;
  }

  @Override
  public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
    final Uri requestUri = httpRequest.uri();
    final PlanePolicy policy = this.plane.planePolicy();
    if (policy != null) {
      final PolicyDirective<?> directive = policy.canConnect(requestUri);
      if (directive.isDenied()) {
        return new StaticHttpResponder<Object>(HttpResponse.from(HttpStatus.UNAUTHORIZED)
            .content(HttpBody.empty()));
      }
    }

    final WsRequest wsRequest = WsRequest.from(httpRequest);
    if (wsRequest != null) {
      final WsResponse wsResponse = wsRequest.accept(wsSettings);
      if (wsResponse != null) {
        return getSwimWebSocketResponder(wsRequest, wsResponse);
      }
    }

    try {
      final Uri laneUri = Uri.parse(requestUri.query().get("lane"));
      final Uri nodeUri = Uri.from(requestUri.path());
      final ServerPlaneHttpBinding httpBinding = new ServerPlaneHttpBinding(
          Uri.empty(), Uri.empty(), nodeUri, laneUri, httpRequest);
      this.plane.root.httpUplink(httpBinding);
      return httpBinding;
    } catch (Exception swallow) {
      // nop
    }

    try {
      if (this.documentRoot != null) {
        UriPath requestPath = requestUri.path();
        if (requestPath.foot().isAbsolute()) {
          requestPath = requestPath.appended("index.html"); // TODO: configurable directory index
        }
        if (requestPath.isAbsolute()) {
          requestPath = requestPath.tail();
        }
        final Uri documentUri = this.documentRoot.resolve(Uri.from(requestPath));
        if (documentUri.path().isSubpathOf(this.documentRoot.path())) {
          final HttpBody<Object> body = HttpBody.fromFile(documentUri.toString());
          final HttpResponse<Object> httpResponse = HttpResponse.from(HttpStatus.OK).content(body);
          return new StaticHttpResponder<Object>(httpResponse);
        }
      }
    } catch (IOException swallow) {
      // continue
    }

    return new StaticHttpResponder<Object>(HttpResponse.from(HttpStatus.NOT_FOUND).content(HttpBody.empty()));
  }

  HttpResponder<?> getSwimWebSocketResponder(WsRequest wsRequest, WsResponse wsResponse) {
    final RemoteHost host = openHost(wsRequest.httpRequest().uri());
    return upgrade(host, wsResponse);
  }
}
