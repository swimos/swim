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

package swim.warp;

import swim.structure.Form;
import swim.structure.Kind;
import swim.structure.Value;
import swim.uri.Uri;

public final class LinkRequest extends LinkAddressed {
  public LinkRequest(Uri nodeUri, Uri laneUri, float prio, float rate, Value body) {
    super(nodeUri, laneUri, prio, rate, body);
  }

  public LinkRequest(Uri nodeUri, Uri laneUri, float prio, float rate) {
    this(nodeUri, laneUri, prio, rate, Value.absent());
  }

  public LinkRequest(Uri nodeUri, Uri laneUri, Value body) {
    this(nodeUri, laneUri, 0f, 0f, body);
  }

  public LinkRequest(Uri nodeUri, Uri laneUri) {
    this(nodeUri, laneUri, 0f, 0f, Value.absent());
  }

  public LinkRequest(String nodeUri, String laneUri, float prio, float rate, Value body) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), prio, rate, body);
  }

  public LinkRequest(String nodeUri, String laneUri, float prio, float rate) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), prio, rate, Value.absent());
  }

  public LinkRequest(String nodeUri, String laneUri, Value body) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), 0f, 0f, body);
  }

  public LinkRequest(String nodeUri, String laneUri) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), 0f, 0f, Value.absent());
  }

  @Override
  public String tag() {
    return "link";
  }

  @Override
  public Form<LinkRequest> form() {
    return FORM;
  }

  @Override
  public LinkRequest nodeUri(Uri nodeUri) {
    return new LinkRequest(nodeUri, this.laneUri, this.prio, this.rate, this.body);
  }

  @Override
  public LinkRequest laneUri(Uri laneUri) {
    return new LinkRequest(this.nodeUri, laneUri, this.prio, this.rate, this.body);
  }

  @Override
  public LinkRequest body(Value body) {
    return new LinkRequest(this.nodeUri, this.laneUri, this.prio, this.rate, body);
  }

  @Kind
  public static final Form<LinkRequest> FORM = new LinkRequestForm();
}

final class LinkRequestForm extends LinkAddressedForm<LinkRequest> {
  @Override
  public String tag() {
    return "link";
  }

  @Override
  public Class<?> type() {
    return LinkRequest.class;
  }

  @Override
  public LinkRequest from(Uri nodeUri, Uri laneUri, float prio, float rate, Value body) {
    return new LinkRequest(nodeUri, laneUri, prio, rate, body);
  }
}
