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

package swim.runtime.lane;

import swim.concurrent.Stage;
import swim.runtime.CellContext;
import swim.runtime.downlink.MapDownlinkView;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;

public class JoinMapLaneDownlink<K, V> extends MapDownlinkView<K, V> {
  protected final JoinMapLaneModel laneModel;
  protected final Value key;

  public JoinMapLaneDownlink(CellContext cellContext, Stage stage, JoinMapLaneModel laneModel,
                             Value key, Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                             float prio, float rate, Value body, int flags, Form<K> keyForm,
                             Form<V> valueForm, Object observers) {
    super(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate,
          body, flags, keyForm, valueForm, observers);
    this.laneModel = laneModel;
    this.key = key;
  }

  public JoinMapLaneDownlink(CellContext cellContext, Stage stage, JoinMapLaneModel laneModel,
                             Value key, Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                             float prio, float rate, Value body, Form<K> keyForm, Form<V> valueForm) {
    this(cellContext, stage, laneModel, key, meshUri, hostUri, nodeUri, laneUri,
         prio, rate, body, KEEP_LINKED | KEEP_SYNCED, keyForm, valueForm, null);
  }

  @Override
  public MapDownlinkView<K, V> hostUri(Uri hostUri) {
    return new JoinMapLaneDownlink<K, V>(this.cellContext, this.stage, this.laneModel,
                                         this.key,  this.meshUri, hostUri, this.nodeUri,
                                         this.laneUri, this.prio, this.rate, this.body,
                                         this.flags, this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> nodeUri(Uri nodeUri) {
    return new JoinMapLaneDownlink<K, V>(this.cellContext, this.stage, this.laneModel,
                                         this.key, this.meshUri, this.hostUri, nodeUri,
                                         this.laneUri, this.prio, this.rate, this.body,
                                         this.flags, this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> laneUri(Uri laneUri) {
    return new JoinMapLaneDownlink<K, V>(this.cellContext, this.stage, this.laneModel,
                                         this.key, this.meshUri, this.hostUri, this.nodeUri,
                                         laneUri, this.prio, this.rate, this.body,
                                         this.flags, this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> prio(float prio) {
    return new JoinMapLaneDownlink<K, V>(this.cellContext, this.stage, this.laneModel,
                                         this.key, this.meshUri, this.hostUri, this.nodeUri,
                                         this.laneUri, prio, this.rate, this.body,
                                         this.flags, this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> rate(float rate) {
    return new JoinMapLaneDownlink<K, V>(this.cellContext, this.stage, this.laneModel,
                                         this.key, this.meshUri, this.hostUri, this.nodeUri,
                                         this.laneUri, this.prio, rate, this.body,
                                         this.flags, this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public MapDownlinkView<K, V> body(Value body) {
    return new JoinMapLaneDownlink<K, V>(this.cellContext, this.stage, this.laneModel,
                                         this.key, this.meshUri, this.hostUri, this.nodeUri,
                                         this.laneUri, this.prio, this.rate, body,
                                         this.flags, this.keyForm, this.valueForm, this.observers);
  }

  @Override
  public <K2> MapDownlinkView<K2, V> keyForm(Form<K2> keyForm) {
    return new JoinMapLaneDownlink<K2, V>(this.cellContext, this.stage, this.laneModel,
                                          this.key, this.meshUri, this.hostUri, this.nodeUri,
                                          this.laneUri, this.prio, this.rate, this.body,
                                          this.flags, keyForm, this.valueForm,
                                          typesafeObservers(this.observers));
  }

  @Override
  public <V2> MapDownlinkView<K, V2> valueForm(Form<V2> valueForm) {
    return new JoinMapLaneDownlink<K, V2>(this.cellContext, this.stage, this.laneModel,
                                          this.key, this.meshUri, this.hostUri, this.nodeUri,
                                          this.laneUri, this.prio, this.rate, this.body,
                                          this.flags, this.keyForm, valueForm,
                                          typesafeObservers(this.observers));
  }

  @Override
  public Value downlinkWillUpdateValue(Value key, Value newValue) {
    return newValue;
  }

  @Override
  public void downlinkDidUpdateValue(Value key, Value newValue, Value oldValue) {
    this.laneModel.put(this, key, newValue);
  }

  @Override
  public void downlinkWillRemoveValue(Value key) {
  }

  @Override
  public void downlinkDidRemoveValue(Value key, Value oldValue) {
    this.laneModel.remove(this, key);
  }

  @Override
  public void downlinkWillDrop(int lower) {
  }

  @Override
  public void downlinkDidDrop(int lower) {
  }

  @Override
  public void downlinkWillTake(int upper) {
  }

  @Override
  public void downlinkDidTake(int upper) {
  }

  @Override
  public void downlinkWillClear() {
  }

  @Override
  public void downlinkDidClear() {
    //this.laneModel.clear(this);
  }

  @Override
  public MapDownlinkView<K, V> open() {
    this.laneModel.downlink(this.key, this);
    return this;
  }

  protected void openDownlink() {
    super.open();
  }
}
