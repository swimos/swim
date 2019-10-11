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
import java.util.Iterator;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Downlink;
import swim.api.policy.Policy;
import swim.codec.Decoder;
import swim.collections.HashTrieMap;
import swim.collections.HashTrieSet;
import swim.concurrent.AbstractTimer;
import swim.concurrent.Schedule;
import swim.concurrent.Stage;
import swim.concurrent.TimerFunction;
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

  private AbstractHttpClient client;

  volatile HashTrieMap<HttpRequest<?>, HashTrieSet<RemoteHttpUplink>> uplinks;
  volatile HashTrieMap<HttpRequest<?>, RemoteHttpPoller> timerRefs;

  static final long POLL_INTERVAL = 10 * 1000;
  private boolean connected;

  public RemoteHttpHostClient(Uri baseUri, IpInterface endpoint, HttpSettings httpSettings) {
    this.baseUri = baseUri;
    this.endpoint = endpoint;
    this.httpSettings = httpSettings;
    this.uplinks = HashTrieMap.empty();
    this.timerRefs = HashTrieMap.empty();
  }

  public RemoteHttpHostClient(Uri baseUri, IpInterface endpoint) {
    this(baseUri, endpoint, HttpSettings.standard());
  }

  @Override
  protected void willOpen() {
    connect();
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

  @Override
  public boolean isConnected() {
    return connected;
  }

  public void openUplink(LinkBinding link) {
    if (link instanceof HttpBinding) {
      openHttpUplink((HttpBinding) link);
    } else {
      UplinkError.rejectUnsupported(link);
    }
  }

  private void openHttpUplink(HttpBinding link) {
    final RemoteHttpUplink uplink = new RemoteHttpUplink(this, link);
    link.setLinkContext(uplink);

    HashTrieMap<HttpRequest<?>, HashTrieSet<RemoteHttpUplink>> oldUplinks;
    HashTrieMap<HttpRequest<?>, HashTrieSet<RemoteHttpUplink>> newUplinks;
    do {
      oldUplinks = this.uplinks;
      HashTrieSet<RemoteHttpUplink> httpUplinks = oldUplinks.get(link.request());
      if (httpUplinks == null) {
        httpUplinks = HashTrieSet.empty();
      }
      httpUplinks = httpUplinks.added(uplink);
      newUplinks = oldUplinks.updated(link.request(), httpUplinks);
    } while (!UPLINKS.compareAndSet(this, oldUplinks, newUplinks));

    if (isConnected()) {
      uplink.didConnect();
    }
    schedulePoller(link.request());
  }

  private void schedulePoller(HttpRequest<?> request) {
    // use uplinks to compute poll interval
    RemoteHttpPoller timerRef = timerRefs.get(request);
    if (timerRef == null) {
      HashTrieMap<HttpRequest<?>, RemoteHttpPoller> oldTimerRefs;
      HashTrieMap<HttpRequest<?>, RemoteHttpPoller> newTimerRefs;
      do {
        oldTimerRefs = this.timerRefs;
        timerRef = oldTimerRefs.get(request);
        if (timerRef != null) {
          break;
        }
        timerRef = new RemoteHttpPoller(this, request);
        newTimerRefs = oldTimerRefs.updated(request, timerRef);
      } while (!TIMER_REFS.compareAndSet(this, oldTimerRefs, newTimerRefs));
    }
    hostContext().schedule().setTimer(POLL_INTERVAL, timerRef);
  }

  public void connect() {
    final String scheme = this.baseUri.schemeName();
    final boolean isSecure = "https".equals(scheme);

    final UriAuthority remoteAuthority = this.baseUri.authority();
    final String remoteAddress = remoteAuthority.host().address();
    final int remotePort = remoteAuthority.port().number();
    final int requestPort = remotePort > 0 ? remotePort : isSecure ? 443 : 80;

    if (this.client == null) {
      this.client = new RemoteHttpHostClientBinding(this);
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

  protected void didConnect() {
    connected = true;
    final Iterator<HttpRequest<?>> requestHttpUplinksIterator = uplinks.keyIterator();
    while (requestHttpUplinksIterator.hasNext()) {
      final HashTrieSet<RemoteHttpUplink> httpUplinks = uplinks.get(requestHttpUplinksIterator.next());
      final Iterator<RemoteHttpUplink> uplinksIterator = httpUplinks.iterator();
      while (uplinksIterator.hasNext()) {
        uplinksIterator.next().link.didConnect();
      }
    }
  }

  protected void nextRequest(HttpRequest<?> request) {
    final RemoteHttpRequester requester = new RemoteHttpRequester(this, request);
    this.client.doRequest(requester);
    schedulePoller(request);
  }

  protected HttpRequest<?> doRequest(HttpRequest<?> request) {
    final HashTrieSet<RemoteHttpUplink> httpUplinks = uplinks.get(request);
    if (httpUplinks != null && !httpUplinks.isEmpty()) {
      return httpUplinks.head().link.request();
    } else {
      return null;
    }
  }

  protected void willRequest(HttpRequest<?> request) {
    final HashTrieSet<RemoteHttpUplink> httpUplinks = uplinks.get(request);
    if (httpUplinks != null && !httpUplinks.isEmpty()) {
      final Iterator<RemoteHttpUplink> uplinksIterator = httpUplinks.iterator();
      while (uplinksIterator.hasNext()) {
        uplinksIterator.next().link.linkContext().willRequestUp(request);
      }
    }
  }

  @SuppressWarnings("unchecked")
  protected void didRequest(HttpRequest<?> request) {
    final HashTrieSet<RemoteHttpUplink> httpUplinks = uplinks.get(request);
    if (httpUplinks != null && !httpUplinks.isEmpty()) {
      final Iterator<RemoteHttpUplink> uplinksIterator = httpUplinks.iterator();
      while (uplinksIterator.hasNext()) {
        uplinksIterator.next().link.linkContext().didRequestUp((HttpRequest<Object>) request);
      }
    }
  }

  protected void willRespond(HttpRequest<?> request, HttpResponse<?> response) {
    final HashTrieSet<RemoteHttpUplink> httpUplinks = uplinks.get(request);
    if (httpUplinks != null && !httpUplinks.isEmpty()) {
      final Iterator<RemoteHttpUplink> uplinksIterator = httpUplinks.iterator();
      while (uplinksIterator.hasNext()) {
        uplinksIterator.next().link.linkContext().willRespondUp(response);
      }
    }
  }

  protected Decoder<Object> contentDecoder(HttpRequest<?> request, HttpResponse<?> response) {
    final HashTrieSet<RemoteHttpUplink> httpUplinks = uplinks.get(request);
    if (httpUplinks != null && !httpUplinks.isEmpty()) {
      final Iterator<RemoteHttpUplink> uplinksIterator = httpUplinks.iterator();
      while (uplinksIterator.hasNext()) {
        //TODO- Returning the first decoder here
        return uplinksIterator.next().link.decodeResponseDown(response);
      }
    }
    return response.contentDecoder();
  }

  protected void didRespond(HttpRequest<?> request, HttpResponse<?> response) {
    final HashTrieSet<RemoteHttpUplink> httpUplinks = uplinks.get(request);
    if (httpUplinks != null && !httpUplinks.isEmpty()) {
      final Iterator<RemoteHttpUplink> uplinksIterator = httpUplinks.iterator();
      while (uplinksIterator.hasNext()) {
        uplinksIterator.next().link.linkContext().didRespondUp(response);
      }
    }
  }

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<RemoteHttpHostClient, HashTrieMap<HttpRequest<?>, HashTrieSet<RemoteHttpUplink>>> UPLINKS =
      AtomicReferenceFieldUpdater.newUpdater(RemoteHttpHostClient.class, (Class<HashTrieMap<HttpRequest<?>, HashTrieSet<RemoteHttpUplink>>>) (Class<?>) HashTrieMap.class, "uplinks");

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<RemoteHttpHostClient, HashTrieMap<HttpRequest<?>, RemoteHttpPoller>> TIMER_REFS =
      AtomicReferenceFieldUpdater.newUpdater(RemoteHttpHostClient.class, (Class<HashTrieMap<HttpRequest<?>, RemoteHttpPoller>>) (Class<?>) HashTrieMap.class, "timerRefs");

}

final class RemoteHttpHostClientBinding extends AbstractHttpClient {

  private final RemoteHttpHostClient remoteHttpHostClient;

  RemoteHttpHostClientBinding(RemoteHttpHostClient remoteHttpHostClient) {
    this.remoteHttpHostClient = remoteHttpHostClient;
  }

  @Override
  public void willConnect() {
    super.willConnect();
  }

  @Override
  public void didConnect() {
    this.remoteHttpHostClient.didConnect();
    super.didConnect();
  }
}

final class RemoteHttpPoller extends AbstractTimer implements TimerFunction {

  private final RemoteHttpHostClient remoteHttpHostClient;
  private final HttpRequest<?> request;

  RemoteHttpPoller(RemoteHttpHostClient remoteHttpHostClient, HttpRequest<?> request) {
    this.remoteHttpHostClient = remoteHttpHostClient;
    this.request = request;
  }

  @Override
  public void runTimer() {
    remoteHttpHostClient.nextRequest(request);
  }
}

final class RemoteHttpRequester extends AbstractHttpRequester<Object> {

  private final RemoteHttpHostClient remoteHttpHostClient;
  private final HttpRequest<?> request;

  RemoteHttpRequester(RemoteHttpHostClient remoteHttpHostClient, HttpRequest<?> request) {
    this.remoteHttpHostClient = remoteHttpHostClient;
    this.request = request;
  }

  @Override
  public void doRequest() {
    final HttpRequest<?> request = this.remoteHttpHostClient.doRequest(this.request);
    if (request != null) {
      writeRequest(request);
    }
  }

  @Override
  public void willRequest(HttpRequest<?> request) {
    this.remoteHttpHostClient.willRequest(request);
  }

  @Override
  public void didRequest(HttpRequest<?> request) {
    this.remoteHttpHostClient.didRequest(request);
  }

  @Override
  public void willRespond(HttpResponse<?> response) {
    this.remoteHttpHostClient.willRespond(request, response);
  }

  @Override
  public Decoder<Object> contentDecoder(HttpResponse<?> response) {
    return this.remoteHttpHostClient.contentDecoder(request, response);
  }

  @Override
  public void didRespond(HttpResponse<Object> response) {
    this.remoteHttpHostClient.didRespond(request, response);
  }

}
