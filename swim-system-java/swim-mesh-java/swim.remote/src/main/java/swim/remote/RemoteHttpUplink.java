package swim.remote;

import java.net.InetSocketAddress;
import java.security.Principal;
import java.security.cert.Certificate;
import java.util.Collection;
import swim.api.auth.Identity;
import swim.codec.Decoder;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.runtime.HttpBinding;
import swim.runtime.HttpContext;
import swim.runtime.LinkBinding;
import swim.structure.Value;

public class RemoteHttpUplink implements HttpContext {

  final RemoteHttpHostClient host;

  final HttpBinding link;

  public RemoteHttpUplink(RemoteHttpHostClient host, HttpBinding link) {
    this.host = host;
    this.link = link;
  }

  @Override
  public HttpBinding linkWrapper() {
    return this.link.linkWrapper();
  }

  public final LinkBinding linkBinding() {
    return this.link;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T unwrapLink(Class<T> linkClass) {
    if (linkClass.isAssignableFrom(getClass())) {
      return (T) this;
    } else {
      return null;
    }
  }

  @Override
  public Value linkKey() {
    return this.linkKey();
  }

  @Override
  public boolean isConnectedUp() {
    return this.host.isConnected();
  }

  @Override
  public boolean isRemoteUp() {
    return this.host.isRemote();
  }

  @Override
  public boolean isSecureUp() {
    return this.host.isSecure();
  }

  @Override
  public String securityProtocolUp() {
    //TODO
    return null;
  }

  @Override
  public String cipherSuiteUp() {
    //TODO
    return null;
  }

  @Override
  public InetSocketAddress localAddressUp() {
    //TODO
    return null;
  }

  @Override
  public Identity localIdentityUp() {
    //TODO
    return null;
  }

  @Override
  public Principal localPrincipalUp() {
    //TODO
    return null;
  }

  @Override
  public Collection<Certificate> localCertificatesUp() {
    return null;
  }

  @Override
  public InetSocketAddress remoteAddressUp() {
    return null;
  }

  @Override
  public Identity remoteIdentityUp() {
    return null;
  }

  @Override
  public Principal remotePrincipalUp() {
    return null;
  }

  @Override
  public Collection<Certificate> remoteCertificatesUp() {
    return null;
  }

  @Override
  public void closeUp() {
    // noop
  }

  @Override
  public void didOpenDown() {
    // noop
  }

  @Override
  public void didCloseDown() {
    this.host.closeDownlink(link);
  }

  @Override
  public void traceUp(Object message) {
    this.host.trace(message);
  }

  @Override
  public void debugUp(Object message) {
    this.host.debug(message);
  }

  @Override
  public void infoUp(Object message) {
    this.host.info(message);
  }

  @Override
  public void warnUp(Object message) {
    this.host.warn(message);
  }

  @Override
  public void errorUp(Object message) {
    this.host.error(message);
  }

  @Override
  public Decoder<Object> decodeRequestUp(HttpRequest<?> request) {
    return request.contentDecoder();
  }

  @Override
  public void willRequestUp(HttpRequest<?> request) {
    this.link.willRequestDown(request);
  }

  @Override
  public void didRequestUp(HttpRequest<Object> request) {
    this.link.didRequestDown(request);
  }

  @Override
  public void doRespondUp(HttpRequest<Object> request) {
    this.link.doRespondDown(request);
  }

  @Override
  public void willRespondUp(HttpResponse<?> response) {
    this.link.willRespondDown(response);
  }

  @Override
  public void didRespondUp(HttpResponse<?> response) {
    this.link.didRespondDown(response);
  }
}
