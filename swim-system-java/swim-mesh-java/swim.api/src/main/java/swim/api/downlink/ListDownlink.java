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
import swim.observable.ObservableList;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidMoveIndex;
import swim.observable.function.DidRemoveIndex;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateIndex;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillMoveIndex;
import swim.observable.function.WillRemoveIndex;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateIndex;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.KeyedList;

public interface ListDownlink<V> extends WarpDownlink, ObservableList<V>, KeyedList<V> {
  @Override
  ListDownlink<V> hostUri(Uri hostUri);

  @Override
  ListDownlink<V> hostUri(String hostUri);

  @Override
  ListDownlink<V> nodeUri(Uri nodeUri);

  @Override
  ListDownlink<V> nodeUri(String nodeUri);

  @Override
  ListDownlink<V> laneUri(Uri laneUri);

  @Override
  ListDownlink<V> laneUri(String laneUri);

  @Override
  ListDownlink<V> prio(float prio);

  @Override
  ListDownlink<V> rate(float rate);

  @Override
  ListDownlink<V> body(Value body);

  @Override
  ListDownlink<V> keepLinked(boolean keepLinked);

  @Override
  ListDownlink<V> keepSynced(boolean keepSynced);

  boolean isStateful();

  ListDownlink<V> isStateful(boolean isStateful);

  Form<V> valueForm();

  <V2> ListDownlink<V2> valueForm(Form<V2> valueForm);

  <V2> ListDownlink<V2> valueClass(Class<V2> valueClass);

  @Override
  ListDownlink<V> observe(Object observer);

  @Override
  ListDownlink<V> unobserve(Object observer);

  @Override
  ListDownlink<V> willUpdate(WillUpdateIndex<V> willUpdate);

  @Override
  ListDownlink<V> didUpdate(DidUpdateIndex<V> didUpdate);

  @Override
  ListDownlink<V> willMove(WillMoveIndex<V> willMove);

  @Override
  ListDownlink<V> didMove(DidMoveIndex<V> didMove);

  @Override
  ListDownlink<V> willRemove(WillRemoveIndex willRemove);

  @Override
  ListDownlink<V> didRemove(DidRemoveIndex<V> didRemove);

  @Override
  ListDownlink<V> willDrop(WillDrop willDrop);

  @Override
  ListDownlink<V> didDrop(DidDrop didDrop);

  @Override
  ListDownlink<V> willTake(WillTake willTake);

  @Override
  ListDownlink<V> didTake(DidTake didTake);

  @Override
  ListDownlink<V> willClear(WillClear willClear);

  @Override
  ListDownlink<V> didClear(DidClear didClear);

  @Override
  ListDownlink<V> willReceive(WillReceive willReceive);

  @Override
  ListDownlink<V> didReceive(DidReceive didReceive);

  @Override
  ListDownlink<V> willCommand(WillCommand willCommand);

  @Override
  ListDownlink<V> willLink(WillLink willLink);

  @Override
  ListDownlink<V> didLink(DidLink didLink);

  @Override
  ListDownlink<V> willSync(WillSync willSync);

  @Override
  ListDownlink<V> didSync(DidSync didSync);

  @Override
  ListDownlink<V> willUnlink(WillUnlink willUnlink);

  @Override
  ListDownlink<V> didUnlink(DidUnlink didUnlink);

  @Override
  ListDownlink<V> didConnect(DidConnect didConnect);

  @Override
  ListDownlink<V> didDisconnect(DidDisconnect didDisconnect);

  @Override
  ListDownlink<V> didClose(DidClose didClose);

  @Override
  ListDownlink<V> didFail(DidFail didFail);

  @Override
  ListDownlink<V> open();

  @Override
  void drop(int lower);

  @Override
  void take(int keep);
}
