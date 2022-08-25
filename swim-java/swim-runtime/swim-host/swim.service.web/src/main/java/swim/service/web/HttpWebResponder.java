package swim.service.web;

import swim.http.HttpRequest;
import swim.io.http.AbstractHttpResponder;
import swim.io.http.HttpResponder;
import swim.kernel.KernelContext;
import swim.web.WebRequest;
import swim.web.WebResponse;
import swim.web.WebRoute;
import swim.web.WebServerRequest;

public class HttpWebResponder<T> extends AbstractHttpResponder<T> {

  WebRoute router;
  KernelContext kernel;

  public HttpWebResponder(WebRoute router, KernelContext kernel) {
    this.router = router;
    this.kernel = kernel;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void doRespond(HttpRequest<T> request) {

    final WebRequest webRequest = new WebServerRequest(request);
    // Route application requests.
    WebResponse webResponse = this.router.routeRequest(webRequest);
    if (webResponse.isRejected()) {
      // Route kernel module requests.
      webResponse = this.kernel.routeRequest(webRequest);
    }

    final HttpResponder<T> responder =  (HttpResponder<T>) webResponse.httpResponder();
    responder.setHttpResponderContext(this.context);
    responder.doRespond(request);

  }

}
