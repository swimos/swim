// Copyright 2015-2021 Swim Inc.
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

package swim.system.lane;

import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.LaneException;
import swim.api.Link;
import swim.api.data.MapData;
import swim.api.downlink.MapDownlink;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Record;
import swim.structure.Value;
import swim.system.LaneModel;
import swim.system.LaneRelay;
import swim.system.LaneView;
import swim.system.Push;
import swim.system.WarpBinding;
import swim.system.warp.WarpLaneModel;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public class JoinMapLaneModel extends WarpLaneModel<JoinMapLaneView<?, ?, ?>, JoinMapLaneUplink> {

  protected int flags;
  protected MapData<Value, Value> data;
  protected MapData<Value, Value> linkData;
  protected volatile HashTrieMap<Value, JoinMapLaneDownlink<?, ?>> downlinks;

  JoinMapLaneModel(int flags) {
    this.flags = flags;
    this.data = null;
    this.linkData = null;
    this.downlinks = HashTrieMap.empty();
  }

  public JoinMapLaneModel() {
    this(0);
  }

  @Override
  public String laneType() {
    return "map";
  }

  @Override
  protected JoinMapLaneUplink createWarpUplink(WarpBinding link) {
    return new JoinMapLaneUplink(this, link, this.createUplinkAddress(link));
  }

  protected void openDownlinks() {
    for (Map.Entry<Value, Value> entry : this.linkData) {
      final Value key = entry.getKey();
      final Value value = entry.getValue();
      final Value header = value.header("downlink");
      final Uri nodeUri = header.get("node").coerce(Uri.form());
      final Uri laneUri = header.get("lane").coerce(Uri.form());
      final float prio = header.get("prio").floatValue(0.0f);
      final float rate = header.get("rate").floatValue(0.0f);
      final Value body = header.get("body");
      new JoinMapLaneDownlink<Value, Value>(this.laneContext, this.stage(), this, key,
                                            this.laneContext.meshUri(), this.laneContext.hostUri(),
                                            nodeUri, laneUri, prio, rate, body, Form.forValue(),
                                            Form.forValue()).openDownlink();
    }
  }

  protected void downlink(Value key, JoinMapLaneDownlink<?, ?> downlink) {
    Value value = this.linkData.get(key);
    Record header = value.headers("downlink");
    if (header == null
        || !header.get("node").coerce(Uri.form()).equals(downlink.nodeUri())
        || !header.get("lane").coerce(Uri.form()).equals(downlink.laneUri())
        || header.get("prio").floatValue(0.0f) != downlink.prio()
        || header.get("rate").floatValue(0.0f) != downlink.rate()
        || !header.get("body").equals(downlink.body())) {
      header = Record.create(2).slot("node", downlink.nodeUri().toString())
                               .slot("lane", downlink.laneUri().toString());
      if (downlink.prio() != 0.0f) {
        header.slot("prio", downlink.prio());
      }
      if (downlink.rate() != 0.0f) {
        header.slot("rate", downlink.rate());
      }
      if (downlink.body().isDefined()) {
        header.slot("body", downlink.body());
      }
      if ("downlink".equals(value.tag())) {
        value = value.updatedAttr("downlink", header);
      } else {
        value = Attr.of("downlink", header).concat(value);
      }
      this.linkData.put(key, value);
    }
    new JoinMapLaneRelayDownlink(this, key, downlink).run();
  }

  protected void openDownlink(Value key, JoinMapLaneDownlink<?, ?> downlink) {
    downlink.openDownlink(); // Open before CAS
    do {
      final HashTrieMap<Value, JoinMapLaneDownlink<?, ?>> oldDownlinks = JoinMapLaneModel.DOWNLINKS.get(this);
      final HashTrieMap<Value, JoinMapLaneDownlink<?, ?>> newDownlinks = oldDownlinks.updated(key, downlink);
      if (oldDownlinks != newDownlinks) {
        if (JoinMapLaneModel.DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks)) {
          final JoinMapLaneDownlink<?, ?> oldDownlink = oldDownlinks.get(key);
          if (oldDownlink != null) {
            try {
              oldDownlink.close();
            } catch (Exception swallow) {
            }
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void closeDownlinks() {
    do {
      final HashTrieMap<Value, JoinMapLaneDownlink<?, ?>> oldDownlinks = JoinMapLaneModel.DOWNLINKS.get(this);
      if (!oldDownlinks.isEmpty()) {
        final HashTrieMap<Value, JoinMapLaneDownlink<?, ?>> newDownlinks = HashTrieMap.empty();
        if (JoinMapLaneModel.DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks)) {
          for (JoinMapLaneDownlink<?, ?> downlink : oldDownlinks.values()) {
            try {
              downlink.close();
            } catch (Exception swallow) {
            }
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  protected void closeDownlinkKey(Value key) {
    do {
      final HashTrieMap<Value, JoinMapLaneDownlink<?, ?>> oldDownlinks = JoinMapLaneModel.DOWNLINKS.get(this);
      final HashTrieMap<Value, JoinMapLaneDownlink<?, ?>> newDownlinks = oldDownlinks.removed(key);
      if (oldDownlinks != newDownlinks) {
        if (JoinMapLaneModel.DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks)) {
          final JoinMapLaneDownlink<?, ?> downlink = oldDownlinks.get(key);
          try {
            downlink.close();
          } catch (Exception swallow) {
          }
          break;
        }
      } else {
        break;
      }
    } while (true);
  }

  @Override
  protected void didOpenLaneView(JoinMapLaneView<?, ?, ?> view) {
    view.setLaneBinding(this);
  }

  @Override
  public void onCommand(Push<CommandMessage> push) {
    final CommandMessage message = push.message();
    final Value payload = message.body();
    final String tag = payload.tag();
    if ("update".equals(tag)) {
      final Value header = payload.header("update");
      final Value key = header.get("key");
      final Value value = payload.body();
      new JoinMapLaneRelayUpdate(this, message, push.cont(), key, value).run();
    } else if ("remove".equals(tag)) {
      final Value header = payload.header("remove");
      final Value key = header.get("key");
      new JoinMapLaneRelayRemove(this, message, push.cont(), key).run();
    } else if ("clear".equals(tag)) {
      new JoinMapLaneRelayClear(this, message, push.cont()).run();
    } else {
      push.trap(new LaneException("unknown subcommand: " + payload));
    }
  }

  @SuppressWarnings("unchecked")
  protected void cueDownKey(Value key) {
    FingerTrieSeq<JoinMapLaneUplink> uplinks;
    do {
      uplinks = (FingerTrieSeq<JoinMapLaneUplink>) LaneModel.UPLINKS.get(this);
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        uplinks.get(i).cueDownKey(key);
      }
    } while (uplinks != LaneModel.UPLINKS.get(this));
  }

  public final boolean isResident() {
    return (this.flags & JoinMapLaneModel.RESIDENT) != 0;
  }

  public JoinMapLaneModel isResident(boolean isResident) {
    if (this.data != null) {
      this.data.isResident(isResident);
    }
    if (this.linkData != null) {
      this.linkData.isResident(isResident);
    }
    if (isResident) {
      this.flags |= JoinMapLaneModel.RESIDENT;
    } else {
      this.flags &= ~JoinMapLaneModel.RESIDENT;
    }
    final Object views = LaneModel.VIEWS.get(this);
    if (views instanceof ValueLaneView<?>) {
      ((ValueLaneView<?>) views).didSetResident(isResident);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((ValueLaneView<?>) viewArray[i]).didSetResident(isResident);
      }
    }
    return this;
  }

  public final boolean isTransient() {
    return (this.flags & JoinMapLaneModel.TRANSIENT) != 0;
  }

  public JoinMapLaneModel isTransient(boolean isTransient) {
    if (this.data != null) {
      this.data.isTransient(isTransient);
    }
    if (this.linkData != null) {
      this.linkData.isTransient(isTransient);
    }
    if (isTransient) {
      this.flags |= JoinMapLaneModel.TRANSIENT;
    } else {
      this.flags &= ~JoinMapLaneModel.TRANSIENT;
    }
    final Object views = LaneModel.VIEWS.get(this);
    if (views instanceof ValueLaneView<?>) {
      ((ValueLaneView<?>) views).didSetTransient(isTransient);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((ValueLaneView<?>) viewArray[i]).didSetTransient(isTransient);
      }
    }
    return this;
  }

  public Value get(Object key) {
    if (key != null) {
      return this.data.get(key);
    } else {
      return Value.absent();
    }
  }

  public JoinMapLaneDownlink<?, ?> getDownlink(Object key) {
    return JoinMapLaneModel.DOWNLINKS.get(this).get(key);
  }

  public void put(JoinMapLaneDownlink<?, ?> downlink, Value key, Value newValue) {
    final JoinMapLaneRelayUpdate relay = new JoinMapLaneRelayUpdate(this, downlink, key, newValue);
    relay.run();
  }

  @SuppressWarnings("unchecked")
  public <K, V> V put(JoinMapLaneView<?, K, V> view, K keyObject, V newObject) {
    final Form<K> keyForm = view.keyForm;
    final Form<V> valueForm = view.valueForm;
    final Value key = keyForm.mold(keyObject).toValue();
    final Value newValue = valueForm.mold(newObject).toValue();
    final JoinMapLaneRelayUpdate relay = new JoinMapLaneRelayUpdate(this, stage(), key, newValue);
    relay.keyForm = (Form<Object>) keyForm;
    relay.valueForm = (Form<Object>) valueForm;
    relay.keyObject = keyObject;
    relay.oldObject = newObject;
    relay.newObject = newObject;
    relay.run();
    if (relay.valueForm != valueForm && valueForm != null) {
      relay.oldObject = valueForm.cast(relay.oldValue);
      if (relay.oldObject == null) {
        relay.oldObject = valueForm.unit();
      }
    }
    return (V) relay.oldObject;
  }

  public void remove(JoinMapLaneDownlink<?, ?> downlink, Value key) {
    final JoinMapLaneRelayRemove relay = new JoinMapLaneRelayRemove(this, downlink, key);
    relay.run();
  }

  @SuppressWarnings("unchecked")
  public <K, V> V remove(JoinMapLaneView<?, K, V> view, K keyObject) {
    final Form<K> keyForm = view.keyForm;
    final Form<V> valueForm = view.valueForm;
    final Value key = keyForm.mold(keyObject).toValue();
    final JoinMapLaneRelayRemove relay = new JoinMapLaneRelayRemove(this, stage(), key);
    relay.keyForm = (Form<Object>) keyForm;
    relay.valueForm = (Form<Object>) valueForm;
    relay.keyObject = keyObject;
    relay.run();
    if (relay.valueForm == valueForm) {
      return (V) relay.oldObject;
    } else {
      return null;
    }
  }

  public void clear(JoinMapLaneDownlink<?, ?> downlink) {
    final JoinMapLaneRelayClear relay = new JoinMapLaneRelayClear(this, downlink);
    relay.run();
  }

  public void clear(JoinMapLaneView<?, ?, ?> view) {
    final JoinMapLaneRelayClear relay = new JoinMapLaneRelayClear(this, stage());
    relay.run();
  }

  public Iterator<Map.Entry<Value, Value>> iterator() {
    return this.data.iterator();
  }

  public Iterator<Value> keyIterator() {
    return this.data.keyIterator();
  }

  public Iterator<Value> valueIterator() {
    return this.data.valueIterator();
  }

  protected void openStore() {
    this.data = this.laneContext.store().mapData(laneUri().toString())
                                        .isTransient(this.isTransient())
                                        .isResident(this.isResident());
    this.linkData = this.laneContext.store().mapData(Record.create(1).attr("join", laneUri().toString()))
                                            .isTransient(this.isTransient())
                                            .isResident(this.isResident());
  }

  @Override
  protected void willLoad() {
    this.openStore();
    super.willLoad();
  }

  @Override
  protected void willStart() {
    super.willStart();
    this.openDownlinks();
  }

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<JoinMapLaneModel, HashTrieMap<Value, JoinMapLaneDownlink<?, ?>>> DOWNLINKS =
      AtomicReferenceFieldUpdater.newUpdater(JoinMapLaneModel.class, (Class<HashTrieMap<Value, JoinMapLaneDownlink<?, ?>>>) (Class<?>) HashTrieMap.class, "downlinks");

}

final class JoinMapLaneRelayUpdate extends LaneRelay<JoinMapLaneModel, JoinMapLaneView<?, ?, ?>> {

  final Link link;
  final CommandMessage message;
  final Cont<CommandMessage> cont;
  final Value key;
  Form<Object> keyForm;
  Form<Object> valueForm;
  Object keyObject;
  Value oldValue;
  Object oldObject;
  Value newValue;
  Object newObject;

  JoinMapLaneRelayUpdate(JoinMapLaneModel model, CommandMessage message, Cont<CommandMessage> cont, Value key, Value newValue) {
    super(model, 4);
    this.link = null;
    this.message = message;
    this.cont = cont;
    this.key = key;
    this.newValue = newValue;
  }

  JoinMapLaneRelayUpdate(JoinMapLaneModel model, Link link, Value key, Value newValue) {
    super(model, 1, 3, null);
    this.link = link;
    this.message = null;
    this.cont = null;
    this.key = key;
    this.newValue = newValue;
  }

  JoinMapLaneRelayUpdate(JoinMapLaneModel model, Stage stage, Value key, Value newValue) {
    super(model, 1, 3, stage);
    this.link = null;
    this.message = null;
    this.cont = null;
    this.key = key;
    this.newValue = newValue;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      this.oldValue = this.model.data.put(this.key, this.newValue);
      if (this.oldValue == null) {
        this.oldValue = Value.absent();
      }

      if (this.valueForm != null) {
        this.oldObject = this.valueForm.cast(this.oldValue);
        if (this.oldObject == null) {
          this.oldObject = this.valueForm.unit();
        }
      }

    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(JoinMapLaneView<?, ?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      final Form<Object> keyForm = (Form<Object>) view.keyForm;
      if (this.keyForm != keyForm && keyForm != null) {
        this.keyForm = keyForm;
        this.keyObject = keyForm.cast(this.key);
        if (this.keyObject == null) {
          this.keyObject = keyForm.unit();
        }
      }
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.oldObject = valueForm.cast(this.newValue);
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
      }
      if (preemptive) {
        this.newObject = ((JoinMapLaneView<Object, Object, Object>) view).laneWillUpdate(this.keyObject, this.oldObject);
      }
      final Map.Entry<Boolean, Object> result = ((JoinMapLaneView<Object, Object, Object>) view).dispatchWillUpdate(this.link, this.keyObject, this.oldObject, preemptive);
      this.newObject = result.getValue();
      if (this.oldObject != this.newObject) {
        this.oldObject = this.newObject;
        this.newValue = valueForm.mold(this.newObject).toValue();
      }
      return result.getKey();
    } else if (phase == 2) {
      final Form<Object> keyForm = (Form<Object>) view.keyForm;
      if (this.keyForm != keyForm && keyForm != null) {
        this.keyForm = keyForm;
        this.keyObject = keyForm.cast(this.key);
        if (this.keyObject == null) {
          this.keyObject = keyForm.unit();
        }
      }
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.oldObject = valueForm.cast(this.oldValue);
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
        this.newObject = valueForm.cast(this.newValue);
        if (this.newObject == null) {
          this.newObject = valueForm.unit();
        }
      }
      if (preemptive) {
        ((JoinMapLaneView<Object, Object, Object>) view).laneDidUpdate(this.keyObject, this.newObject, this.oldObject);
      }
      return ((JoinMapLaneView<Object, Object, Object>) view).dispatchDidUpdate(this.link, this.keyObject, this.newObject, this.oldObject, preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.laneDidCommand(this.message);
      }
      return view.dispatchDidCommand(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    this.model.cueDownKey(this.key);
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Cont.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }

}

final class JoinMapLaneRelayRemove extends LaneRelay<JoinMapLaneModel, JoinMapLaneView<?, ?, ?>> {

  final Link link;
  final CommandMessage message;
  final Cont<CommandMessage> cont;
  final Value key;
  Form<Object> keyForm;
  Form<Object> valueForm;
  Object keyObject;
  Value oldValue;
  Object oldObject;

  JoinMapLaneRelayRemove(JoinMapLaneModel model, CommandMessage message, Cont<CommandMessage> cont, Value key) {
    super(model, 4);
    this.link = null;
    this.message = message;
    this.cont = cont;
    this.key = key;
  }

  JoinMapLaneRelayRemove(JoinMapLaneModel model, Link link, Value key) {
    super(model, 1, 3, null);
    this.link = link;
    this.message = null;
    this.cont = null;
    this.key = key;
  }

  JoinMapLaneRelayRemove(JoinMapLaneModel model, Stage stage, Value key) {
    super(model, 1, 3, null);
    this.link = null;
    this.message = null;
    this.cont = null;
    this.key = key;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      this.oldValue = this.model.data.remove(this.key);
      if (this.oldValue == null) {
        this.oldValue = Value.absent();
      }
      if (this.valueForm != null) {
        this.oldObject = this.valueForm.cast(this.oldValue);
        if (this.oldObject == null) {
          this.oldObject = this.valueForm.unit();
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(JoinMapLaneView<?, ?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      final Form<Object> keyForm = (Form<Object>) view.keyForm;
      if (this.keyForm != keyForm && keyForm != null) {
        this.keyForm = keyForm;
        this.keyObject = keyForm.cast(this.key);
        if (this.keyObject == null) {
          this.keyObject = keyForm.unit();
        }
      }
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        if (this.oldValue != null) {
          this.oldObject = valueForm.cast(this.oldValue);
        }
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
      }
      if (preemptive) {
        ((JoinMapLaneView<Object, Object, Object>) view).laneWillRemove(this.keyObject);
      }
      return ((JoinMapLaneView<Object, Object, Object>) view).dispatchWillRemove(this.link, this.keyObject, preemptive);
    } else if (phase == 2) {
      final Form<Object> keyForm = (Form<Object>) view.keyForm;
      if (this.keyForm != keyForm && keyForm != null) {
        this.keyForm = keyForm;
        this.keyObject = keyForm.cast(this.key);
        if (this.keyObject == null) {
          this.keyObject = keyForm.unit();
        }
      }
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.oldObject = valueForm.cast(this.oldValue);
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
      }
      if (preemptive) {
        ((JoinMapLaneView<Object, Object, Object>) view).laneDidRemove(this.keyObject, this.oldObject);
      }
      return ((JoinMapLaneView<Object, Object, Object>) view).dispatchDidRemove(this.link, this.keyObject, this.oldObject, preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.laneDidCommand(this.message);
      }
      return view.dispatchDidCommand(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    if (this.oldValue.isDefined()) {
      this.model.sendDown(Record.create(1).attr("remove", Record.create(1).slot("key", this.key)));
    }
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Cont.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }

}

final class JoinMapLaneRelayClear extends LaneRelay<JoinMapLaneModel, JoinMapLaneView<?, ?, ?>> {

  final Link link;
  final CommandMessage message;
  final Cont<CommandMessage> cont;

  JoinMapLaneRelayClear(JoinMapLaneModel model, CommandMessage message, Cont<CommandMessage> cont) {
    super(model, 4);
    this.link = null;
    this.message = message;
    this.cont = cont;
  }

  JoinMapLaneRelayClear(JoinMapLaneModel model, Link link) {
    super(model, 1, 3, null);
    this.link = link;
    this.message = null;
    this.cont = null;
  }

  JoinMapLaneRelayClear(JoinMapLaneModel model, Stage stage) {
    super(model, 1, 3, stage);
    this.link = null;
    this.message = null;
    this.cont = null;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      this.model.closeDownlinks();
      this.model.data.clear();
    }
  }

  @Override
  protected boolean runPhase(JoinMapLaneView<?, ?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.laneWillClear();
      }
      return view.dispatchWillClear(this.link, preemptive);
    } else if (phase == 2) {
      if (preemptive) {
        view.laneDidClear();
      }
      return view.dispatchDidClear(this.link, preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.laneDidCommand(this.message);
      }
      return view.dispatchDidCommand(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    this.model.sendDown(Record.create(1).attr("clear"));
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Cont.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }

}

final class JoinMapLaneRelayDownlink extends LaneRelay<JoinMapLaneModel, JoinMapLaneView<?, ?, ?>> {

  final Value key;
  Form<Object> keyForm;
  Object keyObject;
  JoinMapLaneDownlink<Object, Object> downlink;

  @SuppressWarnings("unchecked")
  JoinMapLaneRelayDownlink(JoinMapLaneModel model, Value key, JoinMapLaneDownlink<?, ?> downlink) {
    super(model, 2);
    this.key = key;
    this.downlink = (JoinMapLaneDownlink<Object, Object>) downlink;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 1) {
      this.model.openDownlink(this.key, this.downlink);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(JoinMapLaneView<?, ?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      final Form<Object> keyForm = (Form<Object>) view.keyForm;
      if (this.keyForm != keyForm && keyForm != null) {
        this.keyForm = keyForm;
        this.keyObject = keyForm.cast(this.key);
        if (this.keyObject == null) {
          this.keyObject = keyForm.unit();
        }
      }
      if (preemptive) {
        this.downlink = (JoinMapLaneDownlink<Object, Object>) ((JoinMapLaneView<Object, Object, Object>) view).laneWillDownlink(this.keyObject, this.downlink);
      }
      final Map.Entry<Boolean, MapDownlink<?, ?>> result = ((JoinMapLaneView<Object, Object, Object>) view).dispatchWillDownlink(this.keyObject, this.downlink, preemptive);
      this.downlink = (JoinMapLaneDownlink<Object, Object>) result.getValue();
      return result.getKey();
    } else if (phase == 1) {
      final Form<Object> keyForm = (Form<Object>) view.keyForm;
      if (this.keyForm != keyForm && keyForm != null) {
        this.keyForm = keyForm;
        this.keyObject = keyForm.cast(this.key);
        if (this.keyObject == null) {
          this.keyObject = keyForm.unit();
        }
      }
      if (preemptive) {
        ((JoinMapLaneView<Object, Object, Object>) view).laneDidDownlink(this.keyObject, this.downlink);
      }
      return ((JoinMapLaneView<Object, Object, Object>) view).dispatchDidDownlink(this.keyObject, this.downlink, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

}
