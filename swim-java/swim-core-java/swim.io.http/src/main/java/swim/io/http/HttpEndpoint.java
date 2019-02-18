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
import swim.concurrent.Stage;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.Endpoint;
import swim.io.ServiceRef;
import swim.io.SocketModem;
import swim.io.SocketRef;

public class HttpEndpoint {
  protected final Endpoint endpoint;
  protected HttpSettings httpSettings;

  public HttpEndpoint(Endpoint endpoint, HttpSettings httpSettings) {
    this.endpoint = endpoint;
    this.httpSettings = httpSettings;
  }

  public HttpEndpoint(Endpoint endpoint) {
    this(endpoint, HttpSettings.standard());
  }

  public HttpEndpoint(Stage stage, HttpSettings httpSettings) {
    this(new Endpoint(stage), httpSettings);
  }

  public HttpEndpoint(Stage stage) {
    this(new Endpoint(stage), HttpSettings.standard());
  }

  public final HttpSettings httpSettings() {
    return this.httpSettings;
  }

  public final Stage stage() {
    return this.endpoint.stage();
  }

  public final Endpoint endpoint() {
    return this.endpoint;
  }

  public void start() {
    this.endpoint.start();
  }

  public void stop() {
    this.endpoint.stop();
  }

  public ServiceRef bindHttp(InetSocketAddress localAddress, HttpService service, HttpSettings httpSettings) {
    final HttpSocketService tcpService = new HttpSocketService(service, httpSettings);
    return this.endpoint.bindTcp(localAddress, tcpService, httpSettings.socketSettings());
  }

  public ServiceRef bindHttp(InetSocketAddress localAddress, HttpService service) {
    return bindHttp(localAddress, service, this.httpSettings);
  }

  public ServiceRef bindHttp(String address, int port, HttpService service, HttpSettings httpSettings) {
    return bindHttp(new InetSocketAddress(address, port), service, httpSettings);
  }

  public ServiceRef bindHttp(String address, int port, HttpService service) {
    return bindHttp(new InetSocketAddress(address, port), service, this.httpSettings);
  }

  public ServiceRef bindHttps(InetSocketAddress localAddress, HttpService service, HttpSettings httpSettings) {
    final HttpSocketService tlsService = new HttpSocketService(service, httpSettings);
    return this.endpoint.bindTls(localAddress, tlsService, httpSettings.socketSettings());
  }

  public ServiceRef bindHttps(InetSocketAddress localAddress, HttpService service) {
    return bindHttps(localAddress, service, this.httpSettings);
  }

  public ServiceRef bindHttps(String address, int port, HttpService service, HttpSettings httpSettings) {
    return bindHttps(new InetSocketAddress(address, port), service, httpSettings);
  }

  public ServiceRef bindHttps(String address, int port, HttpService service) {
    return bindHttps(new InetSocketAddress(address, port), service, this.httpSettings);
  }

  public SocketRef connectHttp(InetSocketAddress remoteAddress, HttpClient client, HttpSettings httpSettings) {
    final HttpClientModem modem = new HttpClientModem(client, httpSettings);
    final SocketModem<HttpResponse<?>, HttpRequest<?>> socket = new SocketModem<HttpResponse<?>, HttpRequest<?>>(modem);
    return this.endpoint.connectTcp(remoteAddress, socket, httpSettings.socketSettings());
  }

  public SocketRef connectHttp(InetSocketAddress remoteAddress, HttpClient client) {
    return connectHttp(remoteAddress, client, this.httpSettings);
  }

  public SocketRef connectHttp(String address, int port, HttpClient client, HttpSettings httpSettings) {
    return connectHttp(new InetSocketAddress(address, port), client, httpSettings);
  }

  public SocketRef connectHttp(String address, int port, HttpClient client) {
    return connectHttp(new InetSocketAddress(address, port), client, this.httpSettings);
  }

  public SocketRef connectHttps(InetSocketAddress remoteAddress, HttpClient client, HttpSettings httpSettings) {
    final HttpClientModem modem = new HttpClientModem(client, httpSettings);
    final SocketModem<HttpResponse<?>, HttpRequest<?>> socket = new SocketModem<HttpResponse<?>, HttpRequest<?>>(modem);
    return this.endpoint.connectTls(remoteAddress, socket, httpSettings.socketSettings());
  }

  public SocketRef connectHttps(InetSocketAddress remoteAddress, HttpClient client) {
    return connectHttps(remoteAddress, client, this.httpSettings);
  }

  public SocketRef connectHttps(String address, int port, HttpClient client, HttpSettings httpSettings) {
    return connectHttps(new InetSocketAddress(address, port), client, httpSettings);
  }

  public SocketRef connectHttps(String address, int port, HttpClient client) {
    return connectHttps(new InetSocketAddress(address, port), client, this.httpSettings);
  }
}
