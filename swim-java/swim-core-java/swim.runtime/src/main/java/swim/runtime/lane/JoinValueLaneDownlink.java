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
import swim.runtime.downlink.ValueDownlinkView;
import swim.structure.Form;
import swim.structure.Value;
import swim.uri.Uri;

public class JoinValueLaneDownlink<V> extends ValueDownlinkView<V> {
  protected final JoinValueLaneModel laneModel;
  protected final Value key;

  public JoinValueLaneDownlink(CellContext cellContext, Stage stage, JoinValueLaneModel laneModel,
                               Value key, Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                               float prio, float rate, Value body, int flags, Form<V> valueForm,
                               Object observers) {
    super(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate,
          body, flags, valueForm, observers);
    this.laneModel = laneModel;
    this.key = key;
  }

  public JoinValueLaneDownlink(CellContext cellContext, Stage stage, JoinValueLaneModel laneModel,
                               Value key, Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                               float prio, float rate, Value body, Form<V> valueForm) {
    this(cellContext, stage, laneModel, key, meshUri, hostUri, nodeUri, laneUri,
         prio, rate, body, KEEP_LINKED | KEEP_SYNCED, valueForm, null);
  }

  @Override
  public ValueDownlinkView<V> hostUri(Uri hostUri) {
    return new JoinValueLaneDownlink<V>(this.cellContext, this.stage, this.laneModel,
                                        this.key, this.meshUri, hostUri, this.nodeUri,
                                        this.laneUri, this.prio, this.rate, this.body,
                                        this.flags, this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> nodeUri(Uri nodeUri) {
    return new JoinValueLaneDownlink<V>(this.cellContext, this.stage, this.laneModel,
                                        this.key, this.meshUri, this.hostUri, nodeUri,
                                        this.laneUri, this.prio, this.rate, this.body,
                                        this.flags, this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> laneUri(Uri laneUri) {
    return new JoinValueLaneDownlink<V>(this.cellContext, this.stage, this.laneModel,
                                        this.key, this.meshUri, this.hostUri, this.nodeUri,
                                        laneUri, this.prio, this.rate, this.body,
                                        this.flags, this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> prio(float prio) {
    return new JoinValueLaneDownlink<V>(this.cellContext, this.stage, this.laneModel,
                                        this.key, this.meshUri, this.hostUri, this.nodeUri,
                                        this.laneUri, prio, this.rate, this.body,
                                        this.flags, this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> rate(float rate) {
    return new JoinValueLaneDownlink<V>(this.cellContext, this.stage, this.laneModel,
                                        this.key, this.meshUri, this.hostUri, this.nodeUri,
                                        this.laneUri, this.prio, rate, this.body,
                                        this.flags, this.valueForm, this.observers);
  }

  @Override
  public ValueDownlinkView<V> body(Value body) {
    return new JoinValueLaneDownlink<V>(this.cellContext, this.stage, this.laneModel,
                                        this.key, this.meshUri, this.hostUri, this.nodeUri,
                                        this.laneUri, this.prio, this.rate, body,
                                        this.flags, this.valueForm, this.observers);
  }

  @Override
  public <V2> ValueDownlinkView<V2> valueForm(Form<V2> valueForm) {
    return new JoinValueLaneDownlink<V2>(this.cellContext, this.stage, this.laneModel,
                                        this.key, this.meshUri, this.hostUri, this.nodeUri,
                                        this.laneUri, this.prio, this.rate, this.body,
                                        this.flags, valueForm, typesafeObservers(this.observers));
  }

  @Override
  public Value downlinkWillSetValue(Value newValue) {
    return newValue;
  }

  @Override
  public void downlinkDidSetValue(Value newValue, Value oldValue) {
    this.laneModel.put(this, this.key, newValue);
  }

  @Override
  public ValueDownlinkView<V> open() {
    this.laneModel.downlink(this.key, this);
    return this;
  }

  protected void openDownlink() {
    super.open();
  }

  public Value setValue(Value newValue) {
    return this.model.setValue(newValue);
  }
}
