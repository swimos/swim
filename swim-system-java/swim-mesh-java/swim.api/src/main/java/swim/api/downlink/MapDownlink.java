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

import java.util.Map;
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
import swim.observable.ObservableOrderedMap;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateKey;
import swim.observable.function.WillClear;
import swim.observable.function.WillDrop;
import swim.observable.function.WillRemoveKey;
import swim.observable.function.WillTake;
import swim.observable.function.WillUpdateKey;
import swim.streamlet.MapInlet;
import swim.streamlet.MapOutlet;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Cursor;

public interface MapDownlink<K, V> extends WarpDownlink, ObservableOrderedMap<K, V>, MapInlet<K, V, Map<K, V>>, MapOutlet<K, V, MapDownlink<K, V>> {
  @Override
  MapDownlink<K, V> hostUri(Uri hostUri);

  @Override
  MapDownlink<K, V> hostUri(String hostUri);

  @Override
  MapDownlink<K, V> nodeUri(Uri nodeUri);

  @Override
  MapDownlink<K, V> nodeUri(String nodeUri);

  @Override
  MapDownlink<K, V> laneUri(Uri laneUri);

  @Override
  MapDownlink<K, V> laneUri(String laneUri);

  @Override
  MapDownlink<K, V> prio(float prio);

  @Override
  MapDownlink<K, V> rate(float rate);

  @Override
  MapDownlink<K, V> body(Value body);

  @Override
  MapDownlink<K, V> keepLinked(boolean keepLinked);

  @Override
  MapDownlink<K, V> keepSynced(boolean keepSynced);

  boolean isStateful();

  MapDownlink<K, V> isStateful(boolean isStateful);

  Form<K> keyForm();

  <K2> MapDownlink<K2, V> keyForm(Form<K2> keyForm);

  <K2> MapDownlink<K2, V> keyClass(Class<K2> keyClass);

  Form<V> valueForm();

  <V2> MapDownlink<K, V2> valueForm(Form<V2> valueForm);

  <V2> MapDownlink<K, V2> valueClass(Class<V2> valueClass);

  @Override
  MapDownlink<K, V> observe(Object observer);

  @Override
  MapDownlink<K, V> unobserve(Object observer);

  @Override
  MapDownlink<K, V> willUpdate(WillUpdateKey<K, V> willUpdate);

  @Override
  MapDownlink<K, V> didUpdate(DidUpdateKey<K, V> didUpdate);

  @Override
  MapDownlink<K, V> willRemove(WillRemoveKey<K> willRemove);

  @Override
  MapDownlink<K, V> didRemove(DidRemoveKey<K, V> didRemove);

  @Override
  MapDownlink<K, V> willDrop(WillDrop willDrop);

  @Override
  MapDownlink<K, V> didDrop(DidDrop didDrop);

  @Override
  MapDownlink<K, V> willTake(WillTake willTake);

  @Override
  MapDownlink<K, V> didTake(DidTake didTake);

  @Override
  MapDownlink<K, V> willClear(WillClear willClear);

  @Override
  MapDownlink<K, V> didClear(DidClear didClear);

  @Override
  MapDownlink<K, V> willReceive(WillReceive willReceive);

  @Override
  MapDownlink<K, V> didReceive(DidReceive didReceive);

  @Override
  MapDownlink<K, V> willCommand(WillCommand willCommand);

  @Override
  MapDownlink<K, V> willLink(WillLink willLink);

  @Override
  MapDownlink<K, V> didLink(DidLink didLink);

  @Override
  MapDownlink<K, V> willSync(WillSync willSync);

  @Override
  MapDownlink<K, V> didSync(DidSync didSync);

  @Override
  MapDownlink<K, V> willUnlink(WillUnlink willUnlink);

  @Override
  MapDownlink<K, V> didUnlink(DidUnlink didUnlink);

  @Override
  MapDownlink<K, V> didConnect(DidConnect didConnect);

  @Override
  MapDownlink<K, V> didDisconnect(DidDisconnect didDisconnect);

  @Override
  MapDownlink<K, V> didClose(DidClose didClose);

  @Override
  MapDownlink<K, V> didFail(DidFail didFail);

  @Override
  MapDownlink<K, V> open();

  @Override
  Cursor<K> keyIterator();
}
