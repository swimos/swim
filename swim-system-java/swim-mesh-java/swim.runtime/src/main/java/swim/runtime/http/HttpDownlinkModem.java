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

package swim.runtime.http;

import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.runtime.CellContext;
import swim.runtime.DownlinkModel;
import swim.runtime.DownlinkView;
import swim.runtime.HttpBinding;
import swim.runtime.HttpContext;
import swim.runtime.LinkContext;
import swim.uri.Uri;

public abstract class HttpDownlinkModem<View extends DownlinkView> extends DownlinkModel<View> implements HttpBinding {

  protected final Uri requestUri;

  protected HttpContext linkContext;
  protected CellContext cellContext;

  public HttpDownlinkModem(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri, Uri requestUri) {
    super(meshUri, hostUri, nodeUri, laneUri);
    this.requestUri = requestUri;
  }

  @Override
  public HttpBinding linkWrapper() {
    return this;
  }

  @Override
  public HttpContext linkContext() {
    return this.linkContext;
  }

  @Override
  public void setLinkContext(LinkContext linkContext) {
    this.linkContext = (HttpContext) linkContext;
  }

  @Override
  public CellContext cellContext() {
    return this.cellContext;
  }

  @Override
  public void setCellContext(CellContext cellContext) {
    this.cellContext = cellContext;
  }

  @Override
  public Uri requestUri() {
    return this.requestUri;
  }

  @Override
  public abstract HttpRequest<?> request();

  @Override
  public abstract HttpRequest<?> doRequest();

  public abstract void writeResponse(HttpResponse<?> response);

  @Override
  public void openDown() {
    //TODO- linkContext is not being set, hence the null check
    if (linkContext != null) {
      this.linkContext.didOpenDown();
    }
  }

  @Override
  public void closeDown() {
    //TODO- linkContext is not being set, hence the null check
    if (linkContext != null) {
      this.linkContext.didCloseDown();
    }
  }

  protected void onRequest(HttpRequest<?> request) {
    // stub
  }

  protected void didRequest(HttpRequest<?> request) {
    // stub
  }

  protected void onResponse(HttpResponse<?> response) {
    // stub
  }
}
