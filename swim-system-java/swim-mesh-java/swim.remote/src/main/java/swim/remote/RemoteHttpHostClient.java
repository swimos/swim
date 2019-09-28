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

package swim.remote;

import java.net.InetSocketAddress;
import swim.api.Downlink;
import swim.api.policy.Policy;
import swim.codec.Decoder;
import swim.concurrent.AbstractTimer;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.concurrent.TimerFunction;
import swim.concurrent.TimerRef;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.io.IpInterface;
import swim.io.IpSocketModem;
import swim.io.IpSocketRef;
import swim.io.http.AbstractHttpClient;
import swim.io.http.AbstractHttpRequester;
import swim.io.http.HttpClient;
import swim.io.http.HttpClientModem;
import swim.io.http.HttpSettings;
import swim.runtime.HttpBinding;
import swim.runtime.LinkBinding;
import swim.runtime.PushRequest;
import swim.runtime.UplinkError;
import swim.store.StoreBinding;
import swim.uri.Uri;
import swim.uri.UriAuthority;

//TODO- Connection Pool
public class RemoteHttpHostClient extends RemoteHost {

  final IpInterface endpoint;
  final HttpSettings httpSettings;
  final Uri baseUri;

  private HttpClient client;
  private TimerRef remoteHttpPoller;

  static final long POLL_INTERVAL = 10 * 1000;


  public RemoteHttpHostClient(Uri baseUri, IpInterface endpoint, HttpSettings httpSettings) {
    this.baseUri = baseUri;
    this.endpoint = endpoint;
    this.httpSettings = httpSettings;
  }

  public RemoteHttpHostClient(Uri baseUri, IpInterface endpoint) {
    this(baseUri, endpoint, HttpSettings.standard());
  }

  @Override
  protected void willOpen() {
    super.willOpen();
  }

  @Override
  public Policy policy() {
    //TODO
    return this.hostContext().policy();
  }

  @Override
  public Schedule schedule() {
    //TODO
    return this.hostContext().schedule();
  }

  @Override
  public Stage stage() {
    //TODO
    return this.hostContext().stage();
  }

  @Override
  public StoreBinding store() {
    //TODO
    return this.hostContext().store();
  }

  @Override
  public LinkBinding bindDownlink(Downlink downlink) {
    return null;
  }

  @Override
  public void openDownlink(LinkBinding link) {

  }

  @Override
  public void closeDownlink(LinkBinding link) {

  }

  @Override
  public void pushDown(PushRequest pushRequest) {

  }

  @Override
  public void trace(Object message) {
    //TODO
    this.hostContext().trace(message);
  }

  @Override
  public void debug(Object message) {
    //TODO
    this.hostContext().debug(message);
  }

  @Override
  public void info(Object message) {
    //TODO
    this.hostContext().info(message);
  }

  @Override
  public void warn(Object message) {
    //TODO
    this.hostContext().warn(message);
  }

  @Override
  public void error(Object message) {
    //TODO
    this.hostContext().error(message);
  }

  @Override
  public void fail(Object message) {
    //TODO
    this.hostContext().fail(message);
  }

  public void openUplink(LinkBinding link) {
    if (link instanceof HttpBinding) {
      openHttpUplink((HttpBinding) link);
    } else {
      UplinkError.rejectUnsupported(link);
    }
  }

  private void openHttpUplink(HttpBinding link) {
    this.remoteHttpPoller = hostContext().schedule().setTimer(POLL_INTERVAL,
        new RemoteHttpPoller(this, link));
  }

  public void connect(HttpBinding link) {
    final String scheme = link.requestUri().schemeName();
    final boolean isSecure = "https".equals(scheme);

    final UriAuthority remoteAuthority = link.requestUri().authority();
    final String remoteAddress = remoteAuthority.host().address();
    final int remotePort = remoteAuthority.port().number();
    final int requestPort = remotePort > 0 ? remotePort : isSecure ? 443 : 80;

    if (this.client == null) {
      this.client = new RemoteHttpHostClientBinding(this, link);
    }
    if (isSecure) {
      connectHttps(new InetSocketAddress(remoteAddress, requestPort), this.client, this.httpSettings);
    } else {
      connectHttp(new InetSocketAddress(remoteAddress, requestPort), this.client, this.httpSettings);
    }
  }

  protected IpSocketRef connectHttp(InetSocketAddress remoteAddress, HttpClient client, HttpSettings httpSettings) {
    final HttpClientModem modem = new HttpClientModem(client, httpSettings);
    final IpSocketModem<HttpResponse<?>, HttpRequest<?>> socket = new IpSocketModem<HttpResponse<?>, HttpRequest<?>>(modem);
    return this.endpoint.connectTcp(remoteAddress, socket, httpSettings.ipSettings());
  }

  protected IpSocketRef connectHttps(InetSocketAddress remoteAddress, HttpClient client, HttpSettings httpSettings) {
    final HttpClientModem modem = new HttpClientModem(client, httpSettings);
    final IpSocketModem<HttpResponse<?>, HttpRequest<?>> socket = new IpSocketModem<HttpResponse<?>, HttpRequest<?>>(modem);
    return this.endpoint.connectTls(remoteAddress, socket, httpSettings.ipSettings());
  }

}

final class RemoteHttpHostClientBinding extends AbstractHttpClient {

  private final RemoteHttpHostClient remoteHttpHostClient;
  private final HttpBinding link;

  RemoteHttpHostClientBinding(RemoteHttpHostClient remoteHttpHostClient, HttpBinding link) {
    this.remoteHttpHostClient = remoteHttpHostClient;
    this.link = link;
  }

  @Override
  public void willConnect() {
    super.willConnect();
  }

  @Override
  public void didConnect() {
    final RemoteHttpUplink remoteHttpUplink = new RemoteHttpUplink(remoteHttpHostClient, link);
    this.link.setLinkContext(remoteHttpUplink);
    super.didConnect();
    this.link.didConnect();
    doRequest(new RemoteHttpRequester(this.remoteHttpHostClient, link));
  }
}

final class RemoteHttpPoller extends AbstractTimer implements TimerFunction {

  private final RemoteHttpHostClient remoteHttpHostClient;
  private final HttpBinding link;

  RemoteHttpPoller(RemoteHttpHostClient remoteHttpHostClient, HttpBinding link) {
    this.remoteHttpHostClient = remoteHttpHostClient;
    this.link = link;
  }

  @Override
  public void runTimer() {
    this.remoteHttpHostClient.connect(link);
    this.reschedule(RemoteHttpHostClient.POLL_INTERVAL);
  }
}

final class RemoteHttpRequester extends AbstractHttpRequester<Object> {

  private final RemoteHttpHostClient remoteHttpHostClient;
  private final HttpBinding link;

  RemoteHttpRequester(RemoteHttpHostClient remoteHttpHostClient, HttpBinding link) {
    this.remoteHttpHostClient = remoteHttpHostClient;
    this.link = link;
  }

  @Override
  public void doRequest() {
    final HttpRequest<?> request = this.link.doRequest();
    writeRequest(request);
  }

  @Override
  public void willRequest(HttpRequest<?> request) {
    this.link.linkContext().willRequestUp(request);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void didRequest(HttpRequest<?> request) {
    this.link.linkContext().didRequestUp((HttpRequest<Object>) request);
  }


  @Override
  public void willRespond(HttpResponse<?> response) {
    this.link.linkContext().willRespondUp(response);
  }

  @Override
  public Decoder<Object> contentDecoder(HttpResponse<?> response) {
    return this.link.decodeResponseDown(response);
  }

  @Override
  public void didRespond(HttpResponse<Object> response) {
    this.link.linkContext().didRespondUp(response);
  }

}
