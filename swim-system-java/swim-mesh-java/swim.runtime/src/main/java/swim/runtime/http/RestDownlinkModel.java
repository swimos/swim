package swim.runtime.http;

import swim.codec.Decoder;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.uri.Uri;

public class RestDownlinkModel<V> extends HttpDownlinkModel<RestDownlinkView<V>> {

  public RestDownlinkModel(Uri hostUri, HttpRequest<V> request) {
    super(hostUri, request);
  }

  @Override
  public HttpRequest<?> request() {
    return super.request();
  }

  @Override
  public HttpRequest<?> doRequest() {
    return super.doRequest();
  }

  @Override
  public Decoder<Object> decodeResponseDown(HttpResponse<?> response) {
    return super.decodeResponseDown(response);
  }

  @Override
  public void writeResponse(HttpResponse<?> response) {
    super.writeResponse(response);
  }

  @Override
  public void willRequestDown(HttpRequest<?> request) {
    super.willRequestDown(request);
  }

  @Override
  public void didRequestDown(HttpRequest<Object> request) {
    super.didRequestDown(request);
  }

  @Override
  public void doRespondDown(HttpRequest<Object> request) {
    super.doRespondDown(request);
  }

  @Override
  public void willRespondDown(HttpResponse<?> response) {
    super.willRespondDown(response);
  }


  @Override
  public void didRespondDown(HttpResponse<?> response) {
    super.didRespondDown(response);
  }
}
