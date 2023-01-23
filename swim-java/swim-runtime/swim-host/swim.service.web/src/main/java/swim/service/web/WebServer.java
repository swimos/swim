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

package swim.service.web;

import java.io.File;
import swim.api.policy.PlanePolicy;
import swim.api.policy.PolicyDirective;
import swim.api.service.ServiceException;
import swim.api.space.Space;
import swim.collections.HashTrieMap;
import swim.http.Cookie;
import swim.http.HttpBody;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.io.http.HttpResponder;
import swim.io.http.StaticHttpResponder;
import swim.io.warp.AbstractWarpServer;
import swim.kernel.KernelContext;
import swim.remote.RemoteHost;
import swim.system.EdgeBinding;
import swim.system.EdgeContext;
import swim.system.MeshBinding;
import swim.system.PartBinding;
import swim.uri.Uri;
import swim.uri.UriAuthority;
import swim.uri.UriHost;
import swim.uri.UriPath;
import swim.uri.UriPort;
import swim.uri.UriScheme;
import swim.web.WebRoute;
import swim.web.route.DirectoryRoute;
import swim.web.route.ResourceDirectoryRoute;
import swim.ws.WsRequest;
import swim.ws.WsResponse;

public class WebServer extends AbstractWarpServer {

  final KernelContext kernel;
  final WebServiceDef serviceDef;
  WebRoute router;

  public WebServer(KernelContext kernel, WebServiceDef serviceDef, WebRoute router) {
    super(serviceDef.warpSettings);

    this.kernel = kernel;
    this.serviceDef = serviceDef;

    UriPath documentRoot = serviceDef.documentRoot();
    if (documentRoot != null && documentRoot.isRelative()) {
      final UriPath cwd = UriPath.parse(new File("").getAbsolutePath().replace('\\', '/'));
      documentRoot = cwd.appended(documentRoot).removeDotSegments();
    }
    final UriPath resourceRoot = serviceDef.resourceRoot();

    if (documentRoot != null) {
      router = router.orElse(new DirectoryRoute(documentRoot, "index.html"));
    }
    if (resourceRoot != null) {
      final ClassLoader classLoader = ClassLoader.getSystemClassLoader();
      router = router.orElse(new ResourceDirectoryRoute(classLoader, resourceRoot, "index.html"));
    }
    this.router = router;
  }

  public final KernelContext kernel() {
    return this.kernel;
  }

  public final WebServiceDef serviceDef() {
    return this.serviceDef;
  }

  @Override
  public HttpResponder<?> doRequest(HttpRequest<?> httpRequest) {
    final Space space = this.kernel.getSpace(this.serviceDef.spaceName);
    final PlanePolicy policy = space != null ? space.policy() : null;
    final Uri requestUri = httpRequest.uri();

    // Verify request permission.
    if (policy != null) {
      final PolicyDirective<?> directive = policy.canConnect(httpRequest);
      if (directive.isDenied()) {
        return new StaticHttpResponder<Object>(HttpResponse.create(HttpStatus.UNAUTHORIZED).content(HttpBody.empty()));
      }
    }

    // Route WARP upgrades.
    // TODO: Refactor into WarpSpaceRoute.
    final WsRequest wsRequest = WsRequest.create(httpRequest);
    if (wsRequest != null) {
      final WsResponse wsResponse = wsRequest.accept(this.wsSettings);
      if (wsResponse != null) {
        return this.warpWebSocketResponder(wsRequest, wsResponse);
      }
    }

    // Routing HTTP lanes.
    // TODO: Refactor into HttpLaneRoute.
    try {
      final Uri laneUri = Uri.parse(requestUri.query().get("lane"));
      final Uri nodeUri = Uri.create(requestUri.path());

      // Verify HTTP lane request permission.
      if (policy != null) {
        final PolicyDirective<?> directive = policy.authorizeHttpLane(nodeUri, laneUri, httpRequest);
        if (directive.isDenied()) {
          return new StaticHttpResponder<Object>(HttpResponse.create(HttpStatus.UNAUTHORIZED).content(HttpBody.empty()));
        }
      }

      final HttpLaneResponder httpBinding = new HttpLaneResponder(Uri.empty(), Uri.empty(), nodeUri, laneUri, httpRequest);
      final EdgeBinding edge = ((EdgeContext) space).edgeWrapper();
      edge.openUplink(httpBinding);
      return httpBinding;
    } catch (Exception swallow) {
      // nop
    }

    return new HttpWebResponder<Object>(this.router, this.kernel);
  }

  protected HttpResponder<?> warpWebSocketResponder(WsRequest wsRequest, WsResponse wsResponse) {
    final RemoteHost host = this.openHost(wsRequest.httpRequest().uri(), wsRequest.cookies());
    return this.upgrade(host, wsResponse);
  }

  protected RemoteHost openHost(Uri requestUri, HashTrieMap<String, Cookie> cookies) {
    final Uri baseUri = Uri.create(UriScheme.create("warp"),
                                   UriAuthority.create(UriHost.inetAddress(context.localAddress().getAddress()),
                                                       UriPort.create(context.localAddress().getPort())),
                                   requestUri.path(), requestUri.query(), requestUri.fragment());

    final Uri remoteUri = Uri.create(UriScheme.create("warp"),
                                     UriAuthority.create(UriHost.inetAddress(context.remoteAddress().getAddress()),
                                                         UriPort.create(context.remoteAddress().getPort())), UriPath.slash());

    final String spaceName = this.serviceDef.spaceName;
    final Space space = this.kernel.getSpace(spaceName);
    if (space != null) {
      final EdgeBinding edge = ((EdgeContext) space).edgeWrapper();
      final MeshBinding mesh = edge.openMesh(remoteUri);
      final PartBinding gateway = mesh.openGateway();
      final RemoteHost host = new RemoteHost(requestUri, baseUri, cookies);
      gateway.openHost(remoteUri, host);
      return host;
    } else {
      throw new ServiceException("unknown space: " + spaceName);
    }
  }

}
