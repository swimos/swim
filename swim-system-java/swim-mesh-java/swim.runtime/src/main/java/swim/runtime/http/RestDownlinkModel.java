package swim.runtime.http;

import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.uri.Uri;

public class RestDownlinkModel<V> extends HttpDownlinkModel<RestDownlinkView<V>> {

  public RestDownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri, Uri requestUri) {
    super(meshUri, hostUri, nodeUri, laneUri, requestUri);
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
  public void writeResponse(HttpResponse<?> response) {
    super.writeResponse(response);
  }
}
