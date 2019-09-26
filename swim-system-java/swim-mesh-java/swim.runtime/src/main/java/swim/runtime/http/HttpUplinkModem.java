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

import swim.api.http.HttpUplink;
import swim.codec.Decoder;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.runtime.AbstractUplinkContext;
import swim.runtime.HttpBinding;
import swim.runtime.HttpContext;
import swim.runtime.LinkBinding;
import swim.runtime.LinkKeys;
import swim.runtime.NodeBinding;
import swim.structure.Value;
import swim.uri.Uri;

public abstract class HttpUplinkModem extends AbstractUplinkContext implements HttpContext, HttpUplink {
  protected final HttpBinding linkBinding;
  protected final Value linkKey;

  protected HttpUplinkModem(HttpBinding linkBinding, Value linkKey) {
    this.linkBinding = linkBinding;
    this.linkKey = linkKey.commit();
  }

  protected HttpUplinkModem(HttpBinding linkBinding) {
    this(linkBinding, LinkKeys.generateLinkKey());
  }

  @Override
  public final HttpBinding linkWrapper() {
    return this.linkBinding.linkWrapper();
  }

  @Override
  public final HttpBinding linkBinding() {
    return this.linkBinding;
  }

  @Override
  public final Uri hostUri() {
    return this.linkBinding.hostUri();
  }

  @Override
  public final Uri nodeUri() {
    return this.linkBinding.nodeUri();
  }

  @Override
  public final Uri laneUri() {
    return this.linkBinding.laneUri();
  }

  @Override
  public final Value linkKey() {
    return this.linkKey;
  }

  @Override
  public final Uri requestUri() {
    return this.linkBinding.requestUri();
  }

  @Override
  public final HttpRequest<?> request() {
    return this.linkBinding.request();
  }

  @Override
  public HttpUplinkModem observe(Object observer) {
    super.observe(observer);
    return this;
  }

  @Override
  public HttpUplinkModem unobserve(Object observer) {
    super.unobserve(observer);
    return this;
  }

  @Override
  public abstract Decoder<Object> decodeRequest(HttpRequest<?> request);

  @Override
  public abstract void willRequest(HttpRequest<?> request);

  @Override
  public abstract void didRequest(HttpRequest<Object> request);

  @Override
  public abstract void doRespond(HttpRequest<Object> request);

  @Override
  public abstract void willRespond(HttpResponse<?> response);

  public void writeResponse(HttpResponse<?> response) {
    this.linkBinding.writeResponse(response);
  }

  @Override
  public abstract void didRespond(HttpResponse<?> response);

  @Override
  public void openMetaUplink(LinkBinding uplink, NodeBinding metaUplink) {
    laneBinding().openMetaUplink(uplink, metaUplink);
  }
}
