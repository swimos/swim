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

package swim.io.http;

import java.net.InetSocketAddress;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.FlowControl;
import swim.io.FlowModifier;
import swim.io.IpService;
import swim.io.IpServiceContext;
import swim.io.IpSocket;
import swim.io.IpSocketModem;

public class HttpSocketService implements IpService, HttpServiceContext {
  protected final HttpService service;
  protected final HttpSettings httpSettings;
  protected IpServiceContext context;

  public HttpSocketService(HttpService service, HttpSettings httpSettings) {
    this.service = service;
    this.httpSettings = httpSettings;
  }

  @Override
  public IpServiceContext ipServiceContext() {
    return this.context;
  }

  @Override
  public void setIpServiceContext(IpServiceContext context) {
    this.context = context;
    this.service.setHttpServiceContext(this);
  }

  @Override
  public IpSocket createSocket() {
    final HttpServer server = this.service.createServer();
    final HttpServerModem modem = new HttpServerModem(server, this.httpSettings);
    return new IpSocketModem<HttpRequest<?>, HttpResponse<?>>(modem);
  }

  @Override
  public void didBind() {
    this.service.didBind();
  }

  @Override
  public void didAccept(IpSocket socket) {
    if (socket instanceof HttpServerModem) {
      this.service.didAccept(((HttpServerModem) socket).server);
    }
  }

  @Override
  public void didUnbind() {
    this.service.didUnbind();
  }

  @Override
  public void didFail(Throwable error) {
    this.service.didFail(error);
  }

  @Override
  public FlowControl flowControl() {
    return this.context.flowControl();
  }

  @Override
  public void flowControl(FlowControl flowControl) {
    this.context.flowControl(flowControl);
  }

  @Override
  public FlowControl flowControl(FlowModifier flowModifier) {
    return this.context.flowControl(flowModifier);
  }

  @Override
  public HttpSettings httpSettings() {
    return this.httpSettings;
  }

  @Override
  public InetSocketAddress localAddress() {
    return this.context.localAddress();
  }

  @Override
  public void unbind() {
    this.context.unbind();
  }
}
