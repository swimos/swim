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

import java.util.AbstractMap;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReferenceFieldUpdater;
import swim.api.Link;
import swim.api.data.MapData;
import swim.api.downlink.ValueDownlink;
import swim.collections.FingerTrieSeq;
import swim.collections.HashTrieMap;
import swim.concurrent.Stage;
import swim.runtime.LaneRelay;
import swim.runtime.LaneView;
import swim.runtime.WarpBinding;
import swim.runtime.warp.WarpLaneModel;
import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.warp.CommandMessage;

public class JoinValueLaneModel extends WarpLaneModel<JoinValueLaneView<?, ?>, JoinValueLaneUplink> {
  protected int flags;
  protected MapData<Value, Value> data;
  protected volatile HashTrieMap<Value, JoinValueLaneDownlink<?>> downlinks;

  JoinValueLaneModel(int flags) {
    this.flags = flags;
    this.downlinks = HashTrieMap.empty();
  }

  public JoinValueLaneModel() {
    this(0);
  }

  @Override
  public String laneType() {
    return "map";
  }

  @Override
  protected JoinValueLaneUplink createWarpUplink(WarpBinding link) {
    return new JoinValueLaneUplink(this, link, createUplinkAddress(link));
  }

  protected void openDownlinks() {
    for (Map.Entry<Value, Value> entry : this.data) {
      final Value key = entry.getKey();
      final Value value = entry.getValue();
      final Value header = value.header("downlink");
      final Uri nodeUri = header.get("node").coerce(Uri.form());
      final Uri laneUri = header.get("lane").coerce(Uri.form());
      final float prio = header.get("prio").floatValue(0.0f);
      final float rate = header.get("rate").floatValue(0.0f);
      final Value body = header.get("body");
      new JoinValueLaneDownlink<Value>(this.laneContext, stage(), this, key,
          this.laneContext.meshUri(), this.laneContext.hostUri(), nodeUri, laneUri,
          prio, rate, body, Form.forValue()).openDownlink();
    }
  }

  protected void downlink(Value key, JoinValueLaneDownlink<?> downlink) {
    Value value = this.data.get(key);
    Record header = value.headers("downlink");
    if (header == null
        || !header.get("node").coerce(Uri.form()).equals(downlink.nodeUri())
        || !header.get("lane").coerce(Uri.form()).equals(downlink.laneUri())
        || header.get("prio").floatValue(0.0f) != downlink.prio()
        || header.get("rate").floatValue(0.0f) != downlink.rate()
        || !header.get("body").equals(downlink.body())) {
      header = Record.create(2)
          .slot("node", downlink.nodeUri().toString())
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
      this.data.put(key, value);
    }
    new JoinValueLaneRelayDownlink(this, key, downlink).run();
  }

  protected void openDownlink(Value key, JoinValueLaneDownlink<?> downlink) {
    downlink.openDownlink(); // Open before CAS
    HashTrieMap<Value, JoinValueLaneDownlink<?>> oldDownlinks;
    HashTrieMap<Value, JoinValueLaneDownlink<?>> newDownlinks;
    do {
      oldDownlinks = this.downlinks;
      newDownlinks = oldDownlinks.updated(key, downlink);
    } while (oldDownlinks != newDownlinks && !DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks));
    if (oldDownlinks != newDownlinks) {
      final JoinValueLaneDownlink<?> oldDownlink = oldDownlinks.get(key);
      if (oldDownlink != null) {
        try {
          oldDownlink.close();
        } catch (Exception swallow) { }
      }
    }
  }

  protected void closeDownlinks() {
    HashTrieMap<Value, JoinValueLaneDownlink<?>> oldDownlinks;
    final HashTrieMap<Value, JoinValueLaneDownlink<?>> newDownlinks = HashTrieMap.empty();
    do {
      oldDownlinks = this.downlinks;
    } while (oldDownlinks != newDownlinks && !DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks));
    if (!oldDownlinks.isEmpty()) {
      for (JoinValueLaneDownlink<?> downlink : oldDownlinks.values()) {
        try {
          downlink.close();
        } catch (Exception swallow) { }
      }
    }
  }

  protected void closeDownlinkKey(Value key) {
    HashTrieMap<Value, JoinValueLaneDownlink<?>> oldDownlinks;
    HashTrieMap<Value, JoinValueLaneDownlink<?>> newDownlinks;
    do {
      oldDownlinks = this.downlinks;
      newDownlinks = oldDownlinks.removed(key);
    } while (oldDownlinks != newDownlinks && !DOWNLINKS.compareAndSet(this, oldDownlinks, newDownlinks));
    if (oldDownlinks != newDownlinks) {
      final JoinValueLaneDownlink<?> downlink = oldDownlinks.get(key);
      try {
        downlink.close();
      } catch (Exception swallow) { }
    }
  }

  @Override
  protected void didOpenLaneView(JoinValueLaneView<?, ?> view) {
    view.setLaneBinding(this);
  }

  @Override
  public void onCommand(CommandMessage message) {
    final Value payload = message.body();
    final String tag = payload.tag();
    if ("update".equals(tag)) {
      final Value header = payload.header("update");
      final Value key = header.get("key");
      final Item head = this.data.get(key).head();
      final Value newValue = payload.body();
      new JoinValueLaneRelayUpdate(this, message, key, newValue).run();
    } else if ("remove".equals(tag)) {
      final Value header = payload.header("remove");
      final Value key = header.get("key");
      new JoinValueLaneRelayRemove(this, message, key).run();
    } else if ("clear".equals(tag)) {
      new JoinValueLaneRelayClear(this, message).run();
    }
  }

  protected void cueDownKey(Value key) {
    FingerTrieSeq<JoinValueLaneUplink> uplinks;
    do {
      uplinks = this.uplinks;
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        uplinks.get(i).cueDownKey(key);
      }
    } while (uplinks != this.uplinks);
  }

  public final boolean isResident() {
    return (this.flags & RESIDENT) != 0;
  }

  public JoinValueLaneModel isResident(boolean isResident) {
    if (this.data != null) {
      this.data.isResident(isResident);
    }
    if (isResident) {
      this.flags |= RESIDENT;
    } else {
      this.flags &= ~RESIDENT;
    }
    final Object views = this.views;
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
    return (this.flags & TRANSIENT) != 0;
  }

  public JoinValueLaneModel isTransient(boolean isTransient) {
    if (this.data != null) {
      this.data.isTransient(isTransient);
    }
    if (isTransient) {
      this.flags |= TRANSIENT;
    } else {
      this.flags &= ~TRANSIENT;
    }
    final Object views = this.views;
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
      Value value = this.data.get(key);
      if ("downlink".equals(value.tag())) {
        value = value.body();
      }
      return value;
    } else {
      return Value.absent();
    }
  }

  public JoinValueLaneDownlink<?> getDownlink(Object key) {
    return this.downlinks.get(key);
  }

  public void put(JoinValueLaneDownlink<?> downlink, Value key, Value newValue) {
    final JoinValueLaneRelayUpdate relay = new JoinValueLaneRelayUpdate(this, downlink, key, newValue);
    relay.run();
  }

  @SuppressWarnings("unchecked")
  public <K, V> V put(JoinValueLaneView<K, V> view, K keyObject, V newObject) {
    final Form<K> keyForm = view.keyForm;
    final Form<V> valueForm = view.valueForm;
    final Value key = keyForm.mold(keyObject).toValue();
    final Value newValue = valueForm.mold(newObject).toValue();
    final JoinValueLaneRelayUpdate relay = new JoinValueLaneRelayUpdate(this, stage(), key, newValue);
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

  @SuppressWarnings("unchecked")
  public <K, V> V remove(JoinValueLaneView<K, V> view, K keyObject) {
    final Form<K> keyForm = view.keyForm;
    final Form<V> valueForm = view.valueForm;
    final Value key = keyForm.mold(keyObject).toValue();
    final JoinValueLaneRelayRemove relay = new JoinValueLaneRelayRemove(this, stage(), key);
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

  public void clear(JoinValueLaneView<?, ?> view) {
    final JoinValueLaneRelayClear relay = new JoinValueLaneRelayClear(this, stage());
    relay.run();
  }

  public Iterator<Map.Entry<Value, Value>> iterator() {
    return new JoinValueLaneModelEntryIterator(this.data.iterator());
  }

  public Iterator<Value> keyIterator() {
    return this.data.keyIterator();
  }

  public Iterator<Value> valueIterator() {
    return new JoinValueLaneModelValueIterator(this.data.valueIterator());
  }

  public Set<Map.Entry<Value, Value>> entrySet() {
    return this.data.entrySet();
  }

  public Set<Value> keySet() {
    return this.data.keySet();
  }

  public Collection<Value> values() {
    return this.data.values();
  }

  protected void openStore() {
    this.data = this.laneContext.store().mapData(laneUri().toString())
        .isTransient(isTransient())
        .isResident(isResident());
  }

  @Override
  protected void willLoad() {
    openStore();
    super.willLoad();
  }

  @Override
  protected void willStart() {
    super.willStart();
    openDownlinks();
  }

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;
  static final int SIGNED = 1 << 2;

  @SuppressWarnings("unchecked")
  static final AtomicReferenceFieldUpdater<JoinValueLaneModel, HashTrieMap<Value, JoinValueLaneDownlink<?>>> DOWNLINKS =
      AtomicReferenceFieldUpdater.newUpdater(JoinValueLaneModel.class, (Class<HashTrieMap<Value, JoinValueLaneDownlink<?>>>) (Class<?>) HashTrieMap.class, "downlinks");
}

final class JoinValueLaneModelEntryIterator implements Iterator<Map.Entry<Value, Value>> {
  final Iterator<Map.Entry<Value, Value>> iterator;

  JoinValueLaneModelEntryIterator(Iterator<Map.Entry<Value, Value>> iterator) {
    this.iterator = iterator;
  }

  @Override
  public boolean hasNext() {
    return this.iterator.hasNext();
  }

  @Override
  public Map.Entry<Value, Value> next() {
    final Map.Entry<Value, Value> entry = this.iterator.next();
    Value value = entry.getValue();
    if ("downlink".equals(value.tag())) {
      value = value.body();
    }
    return new AbstractMap.SimpleImmutableEntry<Value, Value>(entry.getKey(), value);
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class JoinValueLaneModelValueIterator implements Iterator<Value> {
  final Iterator<Value> iterator;

  JoinValueLaneModelValueIterator(Iterator<Value> iterator) {
    this.iterator = iterator;
  }

  @Override
  public boolean hasNext() {
    return this.iterator.hasNext();
  }

  @Override
  public Value next() {
    Value value = this.iterator.next();
    if ("downlink".equals(value.tag())) {
      value = value.body();
    }
    return value;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class JoinValueLaneRelayUpdate extends LaneRelay<JoinValueLaneModel, JoinValueLaneView<?, ?>> {
  final Link link;
  final CommandMessage message;
  Form<Object> keyForm;
  Form<Object> valueForm;
  final Value key;
  Object keyObject;
  Value oldValue;
  Object oldObject;
  Value newValue;
  Object newObject;

  JoinValueLaneRelayUpdate(JoinValueLaneModel model, CommandMessage message, Value key, Value newValue) {
    super(model, 4);
    this.link = null;
    this.message = message;
    this.key = key;
    this.newValue = newValue;
  }

  JoinValueLaneRelayUpdate(JoinValueLaneModel model, Link link, Value key, Value newValue) {
    super(model, 1, 3, null);
    this.link = link;
    this.message = null;
    this.key = key;
    this.newValue = newValue;
  }

  JoinValueLaneRelayUpdate(JoinValueLaneModel model, Stage stage, Value key, Value newValue) {
    super(model, 1, 3, stage);
    this.link = null;
    this.message = null;
    this.key = key;
    this.newValue = newValue;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      final Item head = this.model.data.get(this.key).head();
      Value dataValue = this.newValue;
      if (head instanceof Attr && "downlink".equals(((Attr) head).name())) {
        dataValue = head.concat(dataValue);
      }
      this.oldValue = this.model.data.put(this.key, dataValue);
      if ("downlink".equals(this.oldValue.tag())) {
        this.oldValue = this.oldValue.body();
      }
      if (this.valueForm != null) {
        this.oldObject = this.valueForm.cast(this.oldValue);
        if (this.oldObject == null) {
          this.oldObject = this.valueForm.unit();
        }
      }
      if (message != null) { // propagate to source ValueLane
        final JoinValueLaneDownlink<?> downlink = this.model.getDownlink(this.key);
        if (downlink != null) {
          downlink.setValue(this.newValue);
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(JoinValueLaneView<?, ?> view, int phase, boolean preemptive) {
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
        this.newObject = ((JoinValueLaneView<Object, Object>) view).laneWillUpdate(this.keyObject, this.oldObject);
      }
      final Map.Entry<Boolean, Object> result = ((JoinValueLaneView<Object, Object>) view).dispatchWillUpdate(this.link, this.keyObject, this.oldObject, preemptive);
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
        ((JoinValueLaneView<Object, Object>) view).laneDidUpdate(this.keyObject, this.newObject, this.oldObject);
      }
      return ((JoinValueLaneView<Object, Object>) view).dispatchDidUpdate(this.link, this.keyObject, this.newObject, this.oldObject, preemptive);
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
  }
}

final class JoinValueLaneRelayRemove extends LaneRelay<JoinValueLaneModel, JoinValueLaneView<?, ?>> {
  final Link link;
  final CommandMessage message;
  Form<Object> keyForm;
  Form<Object> valueForm;
  final Value key;
  Object keyObject;
  Value oldValue;
  Object oldObject;

  JoinValueLaneRelayRemove(JoinValueLaneModel model, CommandMessage message, Value key) {
    super(model, 4);
    this.link = null;
    this.message = message;
    this.key = key;
  }

  JoinValueLaneRelayRemove(JoinValueLaneModel model, Link link, Value key) {
    super(model, 1, 3, null);
    this.link = link;
    this.message = null;
    this.key = key;
  }

  JoinValueLaneRelayRemove(JoinValueLaneModel model, Stage stage, Value key) {
    super(model, 1, 3, stage);
    this.link = null;
    this.message = null;
    this.key = key;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      this.model.closeDownlinkKey(this.key);
      this.oldValue = this.model.data.remove(this.key);
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
  protected boolean runPhase(JoinValueLaneView<?, ?> view, int phase, boolean preemptive) {
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
        this.oldObject = valueForm.cast(this.oldValue);
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
      }
      if (preemptive) {
        ((JoinValueLaneView<Object, Object>) view).laneWillRemove(this.keyObject);
      }
      return ((JoinValueLaneView<Object, Object>) view).dispatchWillRemove(this.link, this.keyObject, preemptive);
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
        ((JoinValueLaneView<Object, Object>) view).laneDidRemove(this.keyObject, this.oldObject);
      }
      return ((JoinValueLaneView<Object, Object>) view).dispatchDidRemove(this.link, this.keyObject, this.oldObject, preemptive);
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
  }
}

final class JoinValueLaneRelayClear extends LaneRelay<JoinValueLaneModel, JoinValueLaneView<?, ?>> {
  final Link link;
  final CommandMessage message;

  JoinValueLaneRelayClear(JoinValueLaneModel model, CommandMessage message) {
    super(model, 4);
    this.link = null;
    this.message = message;
  }

  JoinValueLaneRelayClear(JoinValueLaneModel model, Link link) {
    super(model, 1, 3, null);
    this.link = link;
    this.message = null;
  }

  JoinValueLaneRelayClear(JoinValueLaneModel model, Stage stage) {
    super(model, 1, 3, stage);
    this.link = null;
    this.message = null;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      this.model.closeDownlinks();
      this.model.data.clear();
    }
  }

  @Override
  protected boolean runPhase(JoinValueLaneView<?, ?> view, int phase, boolean preemptive) {
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
  }
}

final class JoinValueLaneRelayDownlink extends LaneRelay<JoinValueLaneModel, JoinValueLaneView<?, ?>> {
  Form<Object> keyForm;
  final Value key;
  Object keyObject;
  JoinValueLaneDownlink<Object> downlink;

  @SuppressWarnings("unchecked")
  JoinValueLaneRelayDownlink(JoinValueLaneModel model, Value key, JoinValueLaneDownlink<?> downlink) {
    super(model, 2);
    this.key = key;
    this.downlink = (JoinValueLaneDownlink<Object>) downlink;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 1) {
      this.model.openDownlink(this.key, this.downlink);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(JoinValueLaneView<?, ?> view, int phase, boolean preemptive) {
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
        this.downlink = (JoinValueLaneDownlink<Object>) ((JoinValueLaneView<Object, Object>) view).laneWillDownlink(this.keyObject, this.downlink);
      }
      final Map.Entry<Boolean, ValueDownlink<?>> result = ((JoinValueLaneView<Object, Object>) view).dispatchWillDownlink(this.keyObject, this.downlink, preemptive);
      this.downlink = (JoinValueLaneDownlink<Object>) result.getValue();
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
        ((JoinValueLaneView<Object, Object>) view).laneDidDownlink(this.keyObject, this.downlink);
      }
      return ((JoinValueLaneView<Object, Object>) view).dispatchDidDownlink(this.keyObject, this.downlink, preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }
}
