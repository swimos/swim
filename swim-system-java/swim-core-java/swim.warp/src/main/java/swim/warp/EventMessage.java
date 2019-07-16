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

public final class EventMessage extends LaneAddressed {
  public EventMessage(Uri nodeUri, Uri laneUri, Value body) {
    super(nodeUri, laneUri, body);
  }

  public EventMessage(Uri nodeUri, Uri laneUri) {
    this(nodeUri, laneUri, Value.absent());
  }

  public EventMessage(String nodeUri, String laneUri, Value body) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), body);
  }

  public EventMessage(String nodeUri, String laneUri) {
    this(Uri.parse(nodeUri), Uri.parse(laneUri), Value.absent());
  }

  @Override
  public String tag() {
    return "event";
  }

  @Override
  public Form<EventMessage> form() {
    return FORM;
  }

  @Override
  public EventMessage nodeUri(Uri nodeUri) {
    return new EventMessage(nodeUri, this.laneUri, this.body);
  }

  @Override
  public EventMessage laneUri(Uri laneUri) {
    return new EventMessage(this.nodeUri, laneUri, this.body);
  }

  @Override
  public EventMessage body(Value body) {
    return new EventMessage(this.nodeUri, this.laneUri, body);
  }

  @Kind
  public static final Form<EventMessage> FORM = new EventMessageForm();
}

final class EventMessageForm extends LaneAddressedForm<EventMessage> {
  @Override
  public String tag() {
    return "event";
  }

  @Override
  public Class<?> type() {
    return EventMessage.class;
  }

  @Override
  public EventMessage from(Uri nodeUri, Uri laneUri, Value body) {
    return new EventMessage(nodeUri, laneUri, body);
  }
}
