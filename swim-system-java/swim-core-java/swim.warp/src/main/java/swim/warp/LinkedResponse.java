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

public final class LinkedResponse extends LinkAddressed {
  public LinkedResponse(Uri nodeUri, Uri laneUri, float prio, float rate, Value body) {
    super(nodeUri, laneUri, prio, rate, body);
  }

  public LinkedResponse(Uri nodeUri, Uri laneUri, float prio, float rate) {
    this(nodeUri, laneUri, prio, rate, Value.absent());
  }

  public LinkedResponse(Uri nodeUri, Uri laneUri, Value body) {
    this(nodeUri, laneUri, 0f, 0f, body);
  }

  public LinkedResponse(Uri nodeUri, Uri laneUri) {
    this(nodeUri, laneUri, 0f, 0f, Value.absent());
  }

  public LinkedResponse(String nodeUri, String laneUri, float prio, float rate, Value body) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), prio, rate, body);
  }

  public LinkedResponse(String nodeUri, String laneUri, float prio, float rate) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), prio, rate, Value.absent());
  }

  public LinkedResponse(String nodeUri, String laneUri, Value body) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), 0f, 0f, body);
  }

  public LinkedResponse(String nodeUri, String laneUri) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), 0f, 0f, Value.absent());
  }

  @Override
  public String tag() {
    return "linked";
  }

  @Override
  public Form<LinkedResponse> form() {
    return FORM;
  }

  @Override
  public LinkedResponse nodeUri(Uri nodeUri) {
    return new LinkedResponse(nodeUri, this.laneUri, this.prio, this.rate, this.body);
  }

  @Override
  public LinkedResponse laneUri(Uri laneUri) {
    return new LinkedResponse(this.nodeUri, laneUri, this.prio, this.rate, this.body);
  }

  @Override
  public LinkedResponse body(Value body) {
    return new LinkedResponse(this.nodeUri, this.laneUri, this.prio, this.rate, body);
  }

  @Kind
  public static final Form<LinkedResponse> FORM = new LinkedResponseForm();
}

final class LinkedResponseForm extends LinkAddressedForm<LinkedResponse> {
  @Override
  public String tag() {
    return "linked";
  }

  @Override
  public Class<?> type() {
    return LinkedResponse.class;
  }

  @Override
  public LinkedResponse from(Uri nodeUri, Uri laneUri, float prio, float rate, Value body) {
    return new LinkedResponse(nodeUri, laneUri, prio, rate, body);
  }
}
