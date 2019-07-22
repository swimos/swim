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
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.observable.ObservableValue;
import swim.observable.function.DidSet;
import swim.observable.function.WillSet;
import swim.streamlet.Inlet;
import swim.streamlet.Outlet;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;

public interface ValueDownlink<V> extends WarpDownlink, ObservableValue<V>, Inlet<V>, Outlet<V> {
  @Override
  ValueDownlink<V> hostUri(Uri hostUri);

  @Override
  ValueDownlink<V> hostUri(String hostUri);

  @Override
  ValueDownlink<V> nodeUri(Uri nodeUri);

  @Override
  ValueDownlink<V> nodeUri(String nodeUri);

  @Override
  ValueDownlink<V> laneUri(Uri laneUri);

  @Override
  ValueDownlink<V> laneUri(String laneUri);

  @Override
  ValueDownlink<V> prio(float prio);

  @Override
  ValueDownlink<V> rate(float rate);

  @Override
  ValueDownlink<V> body(Value body);

  @Override
  ValueDownlink<V> keepLinked(boolean keepLinked);

  @Override
  ValueDownlink<V> keepSynced(boolean keepSynced);

  boolean isStateful();

  ValueDownlink<V> isStateful(boolean isStateful);

  Form<V> valueForm();

  <V2> ValueDownlink<V2> valueForm(Form<V2> valueForm);

  <V2> ValueDownlink<V2> valueClass(Class<V2> valueClass);

  @Override
  ValueDownlink<V> observe(Object observer);

  @Override
  ValueDownlink<V> unobserve(Object observer);

  @Override
  ValueDownlink<V> willSet(WillSet<V> willSet);

  @Override
  ValueDownlink<V> didSet(DidSet<V> didSet);

  @Override
  ValueDownlink<V> willReceive(WillReceive willReceive);

  @Override
  ValueDownlink<V> didReceive(DidReceive didReceive);

  @Override
  ValueDownlink<V> willCommand(WillCommand willCommand);

  @Override
  ValueDownlink<V> willLink(WillLink willLink);

  @Override
  ValueDownlink<V> didLink(DidLink didLink);

  @Override
  ValueDownlink<V> willSync(WillSync willSync);

  @Override
  ValueDownlink<V> didSync(DidSync didSync);

  @Override
  ValueDownlink<V> willUnlink(WillUnlink willUnlink);

  @Override
  ValueDownlink<V> didUnlink(DidUnlink didUnlink);

  @Override
  ValueDownlink<V> didConnect(DidConnect didConnect);

  @Override
  ValueDownlink<V> didDisconnect(DidDisconnect didDisconnect);

  @Override
  ValueDownlink<V> didClose(DidClose didClose);

  @Override
  ValueDownlink<V> didFail(DidFail didFail);

  @Override
  ValueDownlink<V> open();

  @Override
  V get();

  @Override
  V set(V newValue);
}
