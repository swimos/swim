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

public final class UnlinkRequest extends LaneAddressed {
  public UnlinkRequest(Uri nodeUri, Uri laneUri, Value body) {
    super(nodeUri, laneUri, body);
  }

  public UnlinkRequest(Uri nodeUri, Uri laneUri) {
    this(nodeUri, laneUri, Value.absent());
  }

  public UnlinkRequest(String nodeUri, String laneUri, Value body) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), body);
  }

  public UnlinkRequest(String nodeUri, String laneUri) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), Value.absent());
  }

  @Override
  public String tag() {
    return "unlink";
  }

  @Override
  public Form<UnlinkRequest> form() {
    return FORM;
  }

  @Override
  public UnlinkRequest nodeUri(Uri nodeUri) {
    return new UnlinkRequest(nodeUri, this.laneUri, this.body);
  }

  @Override
  public UnlinkRequest laneUri(Uri laneUri) {
    return new UnlinkRequest(this.nodeUri, laneUri, this.body);
  }

  @Override
  public UnlinkRequest body(Value body) {
    return new UnlinkRequest(this.nodeUri, this.laneUri, body);
  }

  @Kind
  public static final Form<UnlinkRequest> FORM = new UnlinkRequestForm();
}

final class UnlinkRequestForm extends LaneAddressedForm<UnlinkRequest> {
  @Override
  public String tag() {
    return "unlink";
  }

  @Override
  public Class<?> type() {
    return UnlinkRequest.class;
  }

  @Override
  public UnlinkRequest from(Uri nodeUri, Uri laneUri, Value body) {
    return new UnlinkRequest(nodeUri, laneUri, body);
  }
}
