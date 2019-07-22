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

package swim.api.downlink;

import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.warp.WarpDownlink;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.OnEvent;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;

public interface EventDownlink<V> extends WarpDownlink {
  @Override
  EventDownlink<V> hostUri(Uri hostUri);

  @Override
  EventDownlink<V> hostUri(String hostUri);

  @Override
  EventDownlink<V> nodeUri(Uri nodeUri);

  @Override
  EventDownlink<V> nodeUri(String nodeUri);

  @Override
  EventDownlink<V> laneUri(Uri laneUri);

  @Override
  EventDownlink<V> laneUri(String laneUri);

  @Override
  EventDownlink<V> prio(float prio);

  @Override
  EventDownlink<V> rate(float rate);

  @Override
  EventDownlink<V> body(Value body);

  @Override
  EventDownlink<V> keepLinked(boolean keepLinked);

  @Override
  EventDownlink<V> keepSynced(boolean keepSynced);

  Form<V> valueForm();

  <V2> EventDownlink<V2> valueForm(Form<V2> valueForm);

  <V2> EventDownlink<V2> valueClass(Class<V2> valueClass);

  @Override
  EventDownlink<V> observe(Object observer);

  @Override
  EventDownlink<V> unobserve(Object observer);

  EventDownlink<V> onEvent(OnEvent<V> onEvent);

  @Override
  EventDownlink<V> willReceive(WillReceive willReceive);

  @Override
  EventDownlink<V> didReceive(DidReceive didReceive);

  @Override
  EventDownlink<V> willCommand(WillCommand willCommand);

  @Override
  EventDownlink<V> willLink(WillLink willLink);

  @Override
  EventDownlink<V> didLink(DidLink didLink);

  @Override
  EventDownlink<V> willSync(WillSync willSync);

  @Override
  EventDownlink<V> didSync(DidSync didSync);

  @Override
  EventDownlink<V> willUnlink(WillUnlink willUnlink);

  @Override
  EventDownlink<V> didUnlink(DidUnlink didUnlink);

  @Override
  EventDownlink<V> didConnect(DidConnect didConnect);

  @Override
  EventDownlink<V> didDisconnect(DidDisconnect didDisconnect);

  @Override
  EventDownlink<V> didClose(DidClose didClose);

  @Override
  EventDownlink<V> didFail(DidFail didFail);

  @Override
  EventDownlink<V> open();
}
