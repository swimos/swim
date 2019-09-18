package swim.service.web;

import swim.runtime.EdgeContext;
import swim.uri.Uri;

public class HttpLaneRoute { // TODO

  final EdgeContext edgeContext;
  final Uri nodeUri;
  final Uri laneUri;

  public HttpLaneRoute(EdgeContext edgeContext, Uri nodeUri, Uri laneUri) {
    this.edgeContext = edgeContext;
    this.nodeUri = nodeUri;
    this.laneUri = laneUri;
  }
}
