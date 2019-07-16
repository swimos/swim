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

package swim.service.warp;

import java.io.File;
import java.io.IOException;
import swim.api.policy.PlanePolicy;
import swim.api.policy.PolicyDirective;
import swim.api.service.ServiceException;
import swim.api.space.Space;
import swim.http.HttpBody;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.io.http.HttpResponder;
import swim.io.http.StaticHttpResponder;
import swim.io.warp.AbstractWarpServer;
import swim.kernel.KernelContext;
import swim.remote.RemoteHost;
import swim.runtime.EdgeBinding;
import swim.runtime.EdgeContext;
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

public class WarpServiceServer extends AbstractWarpServer {
  protected final KernelContext kernel;
  protected final WarpServiceDef serviceDef;
  final UriPath documentRoot;

  public WarpServiceServer(KernelContext kernel, WarpServiceDef serviceDef) {
    this.kernel = kernel;
    this.serviceDef = serviceDef;

    UriPath documentRoot = serviceDef.documentRoot();
    if (documentRoot != null && documentRoot.isRelative()) {
      final UriPath cwd = UriPath.parse(new File("").getAbsolutePath().replace('\\', '/'));
      documentRoot = cwd.appended(documentRoot).removeDotSegments();
    }
    this.documentRoot = documentRoot;
  }

  public final KernelContext kernel() {
    return this.kernel;
  }

  public final WarpServiceDef serviceDef() {
    return this.serviceDef;
  }

  @Override
  public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
    final Space space = this.kernel.getSpace(this.serviceDef.spaceName);
    final PlanePolicy policy = space != null ? space.policy() : null;
    final Uri requestUri = httpRequest.uri();

    // Check request permission.
    if (policy != null) {
      final PolicyDirective<?> directive = policy.canConnect(requestUri);
      if (directive.isDenied()) {
        return new StaticHttpResponder<Object>(HttpResponse.from(HttpStatus.UNAUTHORIZED)
            .content(HttpBody.empty()));
      }
    }

    // Check for WARP upgrade.
    final WsRequest wsRequest = WsRequest.from(httpRequest);
    if (wsRequest != null) {
      final WsResponse wsResponse = wsRequest.accept(this.wsSettings);
      if (wsResponse != null) {
        return warpWebSocketResponder(wsRequest, wsResponse);
      }
    }

    // Try routing HTTP lane.
    try {
      final Uri laneUri = Uri.parse(requestUri.query().get("lane"));
      final Uri nodeUri = Uri.from(requestUri.path());
      final WarpServiceHttpResponder httpBinding = new WarpServiceHttpResponder(
          Uri.empty(), Uri.empty(), nodeUri, laneUri, httpRequest);
      final EdgeBinding edge = ((EdgeContext) space).edgeWrapper();
      edge.httpUplink(httpBinding);
      return httpBinding;
    } catch (Exception swallow) {
      // nop
    }

    // Try routing static resource request.
    try {
      if (this.documentRoot != null) {
        UriPath requestPath = requestUri.path();
        if (requestPath.foot().isAbsolute()) {
          requestPath = requestPath.appended("index.html"); // TODO: configurable directory index
        }
        if (requestPath.isAbsolute()) {
          requestPath = requestPath.tail();
        }
        final UriPath documentPath = this.documentRoot.appended(requestPath).removeDotSegments();
        if (documentPath.isSubpathOf(this.documentRoot)) {
          final HttpBody<Object> body = HttpBody.fromFile(documentPath.toString());
          final HttpResponse<Object> httpResponse = HttpResponse.from(HttpStatus.OK).content(body);
          return new StaticHttpResponder<Object>(httpResponse);
        }
      }
    } catch (IOException swallow) {
      // continue
    }

    // Return 404 error.
    return new StaticHttpResponder<Object>(HttpResponse.from(HttpStatus.NOT_FOUND).content(HttpBody.empty()));
  }

  protected HttpResponder<?> warpWebSocketResponder(WsRequest wsRequest, WsResponse wsResponse) {
    final RemoteHost host = openHost(wsRequest.httpRequest().uri());
    return upgrade(host, wsResponse);
  }

  protected RemoteHost openHost(Uri requestUri) {
    final Uri baseUri = Uri.from(UriScheme.from("warp"),
        UriAuthority.from(UriHost.inetAddress(context.localAddress().getAddress()),
                          UriPort.from(context.localAddress().getPort())),
        requestUri.path(), requestUri.query(), requestUri.fragment());

    final Uri remoteUri = Uri.from(UriScheme.from("warp"),
        UriAuthority.from(UriHost.inetAddress(context.remoteAddress().getAddress()),
                          UriPort.from(context.remoteAddress().getPort())), UriPath.slash());

    final String spaceName = this.serviceDef.spaceName;
    final Space space = this.kernel.getSpace(spaceName);
    if (space != null) {
      final EdgeBinding edge = ((EdgeContext) space).edgeWrapper();
      final MeshBinding mesh = edge.openMesh(remoteUri);
      final PartBinding gateway = mesh.openGateway();
      final RemoteHost host = new RemoteHost(requestUri, baseUri);
      gateway.openHost(remoteUri, host);
      return host;
    } else {
      throw new ServiceException("unknown space: " + spaceName);
    }
  }
}
