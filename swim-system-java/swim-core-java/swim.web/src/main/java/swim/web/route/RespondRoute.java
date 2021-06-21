package swim.web.route;

import swim.http.HttpResponse;
import swim.web.WebRequest;
import swim.web.WebResponse;
import swim.web.WebRoute;

public final class RespondRoute implements WebRoute {

  final HttpResponse<?> response;

  public RespondRoute(HttpResponse<?> response) {
    this.response = response;
  }

  @Override
  public WebResponse routeRequest(WebRequest request) {
    return request.respond(this.response);
  }
}
