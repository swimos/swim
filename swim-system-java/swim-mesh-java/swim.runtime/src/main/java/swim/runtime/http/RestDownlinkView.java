package swim.runtime.http;

import swim.api.DownlinkException;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.http.HttpDownlink;
import swim.api.http.function.DecodeResponseHttp;
import swim.api.http.function.DidRequestHttp;
import swim.api.http.function.DidRespondHttp;
import swim.api.http.function.DoRequestHttp;
import swim.api.http.function.WillRequestHttp;
import swim.api.http.function.WillRespondHttp;
import swim.concurrent.Stage;
import swim.runtime.CellContext;
import swim.runtime.LinkBinding;
import swim.uri.Uri;

public class RestDownlinkView<V> extends HttpDownlinkView<V> {

  protected RestDownlinkModel<V> model;

  public RestDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                          Uri hostUri, Uri nodeUri, Uri laneUri,
                          Uri requestUri) {
    super(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, requestUri, null);
  }

  @Override
  public RestDownlinkModel<V> downlinkModel() {
    return this.model;
  }

  @Override
  public RestDownlinkView<V> requestUri(Uri requestUri) {
    this.requestUri = requestUri;
    //TODO- extract host URI here- is this right?
    this.hostUri = requestUri.base();
    return this;
  }

  @Override
  public HttpDownlink<V> doRequest(DoRequestHttp<?> doRequest) {
    this.model.doRequest();
    return this;
  }

  @Override
  public HttpDownlink<V> willRequest(WillRequestHttp<?> willRequest) {
    super.willRequest(willRequest);
    return this;
  }

  @Override
  public HttpDownlink<V> didRequest(DidRequestHttp<?> didRequest) {
    super.didRequest(didRequest);
    return this;
  }

  @Override
  public HttpDownlink<V> decodeResponse(DecodeResponseHttp<V> decodeResponse) {
    super.decodeResponse(decodeResponse);
    return this;
  }

  @Override
  public HttpDownlink<V> willRespond(WillRespondHttp<V> willRespond) {
    super.willRespond(willRespond);
    return this;
  }

  @Override
  public HttpDownlink<V> didRespond(DidRespondHttp<V> didRespond) {
    super.didRespond(didRespond);
    return this;
  }

  @Override
  public RestDownlinkView<V> didConnect(DidConnect didConnect) {
    super.didConnect(didConnect);
    return this;
  }

  @Override
  public RestDownlinkView<V> didDisconnect(DidDisconnect didDisconnect) {
    super.didDisconnect(didDisconnect);
    return this;
  }

  @Override
  public RestDownlinkView<V> didClose(DidClose didClose) {
    super.didClose(didClose);
    return this;
  }

  @Override
  public RestDownlinkView<V> didFail(DidFail didFail) {
    super.didFail(didFail);
    return this;
  }

  @Override
  public RestDownlinkModel<V> createDownlinkModel() {
    return new RestDownlinkModel<>(this.meshUri, this.hostUri, this.nodeUri, this.laneUri, requestUri);
  }

  @SuppressWarnings("unchecked")
  @Override
  public RestDownlinkView<V> open() {
    if (this.model == null) {
      final LinkBinding linkBinding = this.cellContext.bindDownlink(this);
      if (linkBinding instanceof RestDownlinkModel) {
        this.model = (RestDownlinkModel<V>) linkBinding;
        this.model.addDownlink(this);
      } else {
        throw new DownlinkException("downlink type mismatch");
      }
    }
    return this;
  }
}
