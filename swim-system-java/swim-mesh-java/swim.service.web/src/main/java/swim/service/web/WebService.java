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

package swim.service.web;

import java.net.InetSocketAddress;
import swim.api.service.Service;
import swim.api.service.ServiceContext;
import swim.io.IpService;
import swim.io.IpServiceRef;
import swim.io.IpSettings;
import swim.io.IpSocket;
import swim.io.IpSocketRef;
import swim.io.http.HttpInterface;
import swim.io.http.HttpServer;
import swim.io.http.HttpService;
import swim.io.http.HttpServiceContext;
import swim.io.http.HttpSettings;
import swim.io.warp.WarpSettings;
import swim.kernel.KernelContext;
import swim.web.WebRoute;

public class WebService implements Service, HttpService, HttpInterface {
  final KernelContext kernel;
  final ServiceContext serviceContext;
  final WebServiceDef serviceDef;
  WebRoute router;
  HttpServiceContext httpServiceContext;

  public WebService(KernelContext kernel, ServiceContext serviceContext,
                    WebServiceDef serviceDef, WebRoute router) {
    this.kernel = kernel;
    this.serviceContext = serviceContext;
    this.serviceDef = serviceDef;
    this.router = router;
  }

  public final KernelContext kernel() {
    return this.kernel;
  }

  @Override
  public final ServiceContext serviceContext() {
    return this.serviceContext;
  }

  @Override
  public final HttpServiceContext httpServiceContext() {
    return this.httpServiceContext;
  }

  @Override
  public void setHttpServiceContext(HttpServiceContext httpServiceContext) {
    this.httpServiceContext = httpServiceContext;
  }

  public final WebServiceDef serviceDef() {
    return this.serviceDef;
  }

  public final WebRoute router() {
    return this.router;
  }

  public WebService router(WebRoute router) {
    this.router = router;
    return this;
  }

  @Override
  public final IpSettings ipSettings() {
    return this.serviceDef.warpSettings.ipSettings();
  }

  @Override
  public final HttpSettings httpSettings() {
    return this.serviceDef.warpSettings.httpSettings();
  }

  public final WarpSettings warpSettings() {
    return this.serviceDef.warpSettings;
  }

  @Override
  public IpServiceRef bindTcp(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    return this.serviceContext.bindTcp(localAddress, service, ipSettings);
  }

  @Override
  public IpServiceRef bindTls(InetSocketAddress localAddress, IpService service, IpSettings ipSettings) {
    return this.serviceContext.bindTls(localAddress, service, ipSettings);
  }

  @Override
  public IpSocketRef connectTcp(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    return this.serviceContext.connectTcp(remoteAddress, socket, ipSettings);
  }

  @Override
  public IpSocketRef connectTls(InetSocketAddress remoteAddress, IpSocket socket, IpSettings ipSettings) {
    return this.serviceContext.connectTls(remoteAddress, socket, ipSettings);
  }

  @Override
  public HttpServer createServer() {
    return new WebServer(this.kernel, this.serviceDef, this.router);
  }

  @Override
  public void willStart() {
    // stub
  }

  @Override
  public void didStart() {
    final WebServiceDef serviceDef = this.serviceDef;
    if (serviceDef.isSecure) {
      bindHttps(serviceDef.address, serviceDef.port, this, serviceDef.warpSettings.httpSettings());
    } else {
      bindHttp(serviceDef.address, serviceDef.port, this, serviceDef.warpSettings.httpSettings());
    }
  }

  @Override
  public void didBind() {
    // stub
  }

  @Override
  public void didAccept(HttpServer server) {
    // stub
  }

  @Override
  public void didUnbind() {
    // stub
  }

  @Override
  public void willStop() {
    final HttpServiceContext httpServiceContext = this.httpServiceContext;
    if (httpServiceContext != null) {
      httpServiceContext.unbind();
      this.httpServiceContext = null;
    }
  }

  @Override
  public void didStop() {
    // stub
  }

  @Override
  public void willClose() {
    // stub
  }

  @Override
  public void didClose() {
    // stub
  }

  @Override
  public void didFail(Throwable error) {
    error.printStackTrace();
  }
}
