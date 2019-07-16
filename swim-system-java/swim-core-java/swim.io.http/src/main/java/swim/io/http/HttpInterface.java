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
import swim.io.IpInterface;
import swim.io.IpServiceRef;
import swim.io.IpSocketModem;
import swim.io.IpSocketRef;

public interface HttpInterface extends IpInterface {
  HttpSettings httpSettings();

  default IpServiceRef bindHttp(InetSocketAddress localAddress, HttpService service, HttpSettings httpSettings) {
    final HttpSocketService tcpService = new HttpSocketService(service, httpSettings);
    return bindTcp(localAddress, tcpService, httpSettings.ipSettings());
  }

  default IpServiceRef bindHttp(InetSocketAddress localAddress, HttpService service) {
    return bindHttp(localAddress, service, httpSettings());
  }

  default IpServiceRef bindHttp(String address, int port, HttpService service, HttpSettings httpSettings) {
    return bindHttp(new InetSocketAddress(address, port), service, httpSettings);
  }

  default IpServiceRef bindHttp(String address, int port, HttpService service) {
    return bindHttp(new InetSocketAddress(address, port), service, httpSettings());
  }

  default IpServiceRef bindHttps(InetSocketAddress localAddress, HttpService service, HttpSettings httpSettings) {
    final HttpSocketService tlsService = new HttpSocketService(service, httpSettings);
    return bindTls(localAddress, tlsService, httpSettings.ipSettings());
  }

  default IpServiceRef bindHttps(InetSocketAddress localAddress, HttpService service) {
    return bindHttps(localAddress, service, httpSettings());
  }

  default IpServiceRef bindHttps(String address, int port, HttpService service, HttpSettings httpSettings) {
    return bindHttps(new InetSocketAddress(address, port), service, httpSettings);
  }

  default IpServiceRef bindHttps(String address, int port, HttpService service) {
    return bindHttps(new InetSocketAddress(address, port), service, httpSettings());
  }

  default IpSocketRef connectHttp(InetSocketAddress remoteAddress, HttpClient client, HttpSettings httpSettings) {
    final HttpClientModem modem = new HttpClientModem(client, httpSettings);
    final IpSocketModem<HttpResponse<?>, HttpRequest<?>> socket = new IpSocketModem<HttpResponse<?>, HttpRequest<?>>(modem);
    return connectTcp(remoteAddress, socket, httpSettings.ipSettings());
  }

  default IpSocketRef connectHttp(InetSocketAddress remoteAddress, HttpClient client) {
    return connectHttp(remoteAddress, client, httpSettings());
  }

  default IpSocketRef connectHttp(String address, int port, HttpClient client, HttpSettings httpSettings) {
    return connectHttp(new InetSocketAddress(address, port), client, httpSettings);
  }

  default IpSocketRef connectHttp(String address, int port, HttpClient client) {
    return connectHttp(new InetSocketAddress(address, port), client, httpSettings());
  }

  default IpSocketRef connectHttps(InetSocketAddress remoteAddress, HttpClient client, HttpSettings httpSettings) {
    final HttpClientModem modem = new HttpClientModem(client, httpSettings);
    final IpSocketModem<HttpResponse<?>, HttpRequest<?>> socket = new IpSocketModem<HttpResponse<?>, HttpRequest<?>>(modem);
    return connectTls(remoteAddress, socket, httpSettings.ipSettings());
  }

  default IpSocketRef connectHttps(InetSocketAddress remoteAddress, HttpClient client) {
    return connectHttps(remoteAddress, client, httpSettings());
  }

  default IpSocketRef connectHttps(String address, int port, HttpClient client, HttpSettings httpSettings) {
    return connectHttps(new InetSocketAddress(address, port), client, httpSettings);
  }

  default IpSocketRef connectHttps(String address, int port, HttpClient client) {
    return connectHttps(new InetSocketAddress(address, port), client, httpSettings());
  }
}
