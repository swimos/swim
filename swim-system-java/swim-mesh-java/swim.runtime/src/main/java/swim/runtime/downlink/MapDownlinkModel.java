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

package swim.runtime.downlink;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import swim.api.DownlinkException;
import swim.collections.BTreeMap;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.concurrent.Stage;
import swim.runtime.DownlinkRelay;
import swim.runtime.DownlinkView;
import swim.runtime.Push;
import swim.runtime.warp.MapDownlinkModem;
import swim.structure.Attr;
import swim.structure.Form;
import swim.structure.Record;
import swim.structure.Value;
import swim.uri.Uri;
import swim.util.Cursor;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;
import swim.warp.EventMessage;

public class MapDownlinkModel extends MapDownlinkModem<MapDownlinkView<?, ?>> {
  protected int flags;
  protected final BTreeMap<Value, Value, Value> state;

  public MapDownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                          float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
    this.flags = 0;
    this.state = BTreeMap.empty();
  }

  public final boolean isStateful() {
    return (this.flags & STATEFUL) != 0;
  }

  public MapDownlinkModel isStateful(boolean isStateful) {
    if (isStateful) {
      this.flags |= STATEFUL;
    } else {
      this.flags &= ~STATEFUL;
    }
    final Object views = this.views;
    if (views instanceof DownlinkView) {
      ((MapDownlinkView<?, ?>) views).didSetStateful(isStateful);
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((MapDownlinkView<?, ?>) viewArray[i]).didSetStateful(isStateful);
      }
    }
    return this;
  }

  @Override
  protected void pushDownEvent(Push<EventMessage> push) {
    final EventMessage message = push.message();
    onEvent(message);
    final Value payload = message.body();
    final String tag = payload.tag();
    if ("update".equals(tag)) {
      final Value header = payload.header("update");
      final Value key = header.get("key");
      final Value value = payload.body();
      new MapDownlinkRelayUpdate(this, message, push.cont(), key, value).run();
    } else if ("remove".equals(tag)) {
      final Value header = payload.header("remove");
      final Value key = header.get("key");
      new MapDownlinkRelayRemove(this, message, push.cont(), key).run();
    } else if ("drop".equals(tag)) {
      final Value header = payload.header("drop");
      final int lower = header.intValue(0);
      new MapDownlinkRelayDrop(this, message, push.cont(), lower).run();
    } else if ("take".equals(tag)) {
      final Value header = payload.header("take");
      final int upper = header.intValue(0);
      new MapDownlinkRelayTake(this, message, push.cont(), upper).run();
    } else if ("clear".equals(tag)) {
      new MapDownlinkRelayClear(this, message, push.cont()).run();
    } else {
      push.trap(new DownlinkException("unknown subcommand: " + payload));
    }
  }

  @Override
  protected Value nextUpKey(Value key) {
    final Value value = this.state.get(key);
    if (value != null) {
      return Attr.of("update", Record.create(1).slot("key", key)).concat(value);
    } else {
      return null;
    }
  }

  @Override
  protected void didAddDownlink(MapDownlinkView<?, ?> view) {
    super.didAddDownlink(view);
    if (this.views instanceof DownlinkView) {
      isStateful(((MapDownlinkView<?, ?>) view).isStateful());
    }
  }

  public boolean isEmpty() {
    return this.state.isEmpty();
  }

  public int size() {
    return this.state.size();
  }

  public boolean containsKey(Object key) {
    if (key != null) {
      return this.state.containsKey(key);
    } else {
      return false;
    }
  }

  public boolean containsValue(Object value) {
    if (value != null) {
      return this.state.containsValue(value);
    } else {
      return false;
    }
  }

  public int indexOf(Object key) {
    return this.state.indexOf(key);
  }

  public Value get(Object key) {
    if (key != null) {
      final Value value = this.state.get(key);
      if (value != null) {
        return value;
      }
    }
    return Value.absent();
  }

  public Map.Entry<Value, Value> getEntry(Object key) {
    return this.state.getEntry(key);
  }

  public Map.Entry<Value, Value> getIndex(int index) {
    return this.state.getIndex(index);
  }

  public Map.Entry<Value, Value> firstEntry() {
    return this.state.firstEntry();
  }

  public Value firstKey() {
    return this.state.firstKey();
  }

  public Value firstValue() {
    return this.state.firstValue();
  }

  public Map.Entry<Value, Value> lastEntry() {
    return this.state.lastEntry();
  }

  public Value lastKey() {
    return this.state.lastKey();
  }

  public Value lastValue() {
    return this.state.lastValue();
  }

  public Map.Entry<Value, Value> nextEntry(Value key) {
    return this.state.nextEntry(key);
  }

  public Value nextKey(Value key) {
    return this.state.nextKey(key);
  }

  public Value nextValue(Value key) {
    return this.state.nextValue(key);
  }

  public Map.Entry<Value, Value> previousEntry(Value key) {
    return this.state.previousEntry(key);
  }

  public Value previousKey(Value key) {
    return this.state.previousKey(key);
  }

  public Value previousValue(Value key) {
    return this.state.previousValue(key);
  }

  @SuppressWarnings("unchecked")
  public <K, V> V put(MapDownlinkView<K, V> view, K keyObject, V newObject) {
    final Form<K> keyForm = view.keyForm;
    final Form<V> valueForm = view.valueForm;
    final Value key = keyForm.mold(keyObject).toValue();
    final Value newValue = valueForm.mold(newObject).toValue();
    final MapDownlinkRelayUpdate relay = new MapDownlinkRelayUpdate(this, view.stage(), key, newValue);
    relay.keyForm = (Form<Object>) keyForm;
    relay.valueForm = (Form<Object>) valueForm;
    relay.keyObject = keyObject;
    relay.oldObject = newObject;
    relay.newObject = newObject;
    relay.run();
    if (relay.isDone() && relay.valueForm == valueForm) {
      return (V) relay.oldObject;
    } else {
      return null;
    }
  }

  @SuppressWarnings("unchecked")
  public <K, V> V remove(MapDownlinkView<K, V> view, K keyObject) {
    final Form<K> keyForm = view.keyForm;
    final Form<V> valueForm = view.valueForm;
    final Value key = keyForm.mold(keyObject).toValue();
    final MapDownlinkRelayRemove relay = new MapDownlinkRelayRemove(this, view.stage(), key);
    relay.keyForm = (Form<Object>) keyForm;
    relay.valueForm = (Form<Object>) valueForm;
    relay.keyObject = keyObject;
    relay.run();
    if (relay.isDone()) {
      if (relay.valueForm != valueForm && valueForm != null) {
        relay.oldObject = valueForm.cast(relay.oldValue);
        if (relay.oldObject == null) {
          relay.oldObject = valueForm.unit();
        }
      }
      return (V) relay.oldObject;
    } else {
      return null;
    }
  }

  public void drop(MapDownlinkView<?, ?> view, int lower) {
    if (lower > 0) {
      pushUp(Record.create(1).attr("drop", lower)); // TODO: drop top key
    }
    //final MapDownlinkRelayDrop relay = new MapDownlinkRelayDrop(this, view.stage(), lower);
    //relay.run();
  }

  public void take(MapDownlinkView<?, ?> view, int upper) {
    if (upper > 0) {
      pushUp(Record.create(1).attr("take", upper)); // TODO: take to key
    }
    //final MapDownlinkRelayTake relay = new MapDownlinkRelayTake(this, view.stage(), upper);
    //relay.run();
  }

  public void clear(MapDownlinkView<?, ?> view) {
    final MapDownlinkRelayClear relay = new MapDownlinkRelayClear(this, view.stage());
    relay.run();
  }

  public OrderedMap<Value, Value> headMap(Value toKey) {
    return this.state.headMap(toKey);
  }

  public OrderedMap<Value, Value> tailMap(Value fromKey) {
    return this.state.tailMap(fromKey);
  }

  public OrderedMap<Value, Value> subMap(Value fromKey, Value toKey) {
    return this.state.subMap(fromKey, toKey);
  }

  public Set<Map.Entry<Value, Value>> entrySet() {
    return this.state.entrySet();
  }

  public Set<Value> keySet() {
    return this.state.keySet();
  }

  public Collection<Value> values() {
    return this.state.values();
  }

  public OrderedMapCursor<Value, Value> iterator() {
    return this.state.iterator();
  }

  public Cursor<Value> keyIterator() {
    return this.state.keyIterator();
  }

  public Cursor<Value> valueIterator() {
    return this.state.valueIterator();
  }

  protected static final int STATEFUL = 1 << 0;
}

final class MapDownlinkRelayUpdate extends DownlinkRelay<MapDownlinkModel, MapDownlinkView<?, ?>> {
  final EventMessage message;
  final Cont<EventMessage> cont;
  Form<Object> keyForm;
  Form<Object> valueForm;
  final Value key;
  Object keyObject;
  Value oldValue;
  Value newValue;
  Object oldObject;
  Object newObject;

  MapDownlinkRelayUpdate(MapDownlinkModel model, EventMessage message, Cont<EventMessage> cont, Value key, Value newValue) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.key = key;
    this.newValue = newValue;
  }

  MapDownlinkRelayUpdate(MapDownlinkModel model, Stage stage, Value key, Value newValue) {
    super(model, 1, 3, stage);
    this.message = null;
    this.cont = null;
    this.key = key;
    this.newValue = newValue;
    this.stage = stage;
  }

  @SuppressWarnings("unchecked")
  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      if (this.model.isStateful()) {
        this.oldValue = this.model.state.put(this.key, this.newValue);
      }
      if (this.oldValue == null) {
        this.oldValue = Value.absent();
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(MapDownlinkView<?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      this.newValue = view.downlinkWillUpdateValue(this.key, this.newValue);
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
        newObject = valueForm.cast(this.newValue);
      }
      if (preemptive) {
        this.newObject = ((MapDownlinkView<Object, Object>) view).downlinkWillUpdate(this.keyObject, this.newObject);
      }
      final Map.Entry<Boolean, Object> result = ((MapDownlinkView<Object, Object>) view).dispatchWillUpdate(this.keyObject, this.newObject, preemptive);
      if (this.newObject != result.getValue()) {
        this.oldObject = this.newObject; //FIXME: Is this right?
        this.newObject = result.getValue();
        this.newValue = valueForm.mold(this.newObject).toValue();
      }
      return result.getKey();
    } else if (phase == 2) {
      view.downlinkDidUpdateValue(this.key, this.newValue, this.oldValue);
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
        ((MapDownlinkView<Object, Object>) view).downlinkDidUpdate(this.keyObject, this.newObject, this.oldObject);
      }
      return ((MapDownlinkView<Object, Object>) view).dispatchDidUpdate(this.keyObject, this.newObject, this.oldObject, preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.downlinkDidReceive(this.message);
      }
      return view.dispatchDidReceive(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    if (this.message != null) {
      this.model.cueDown();
    } else {
      this.model.cueUpKey(this.key);
    }
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Conts.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }
}

final class MapDownlinkRelayRemove extends DownlinkRelay<MapDownlinkModel, MapDownlinkView<?, ?>> {
  final EventMessage message;
  final Cont<EventMessage> cont;
  Form<Object> keyForm;
  Form<Object> valueForm;
  final Value key;
  Object keyObject;
  Value oldValue;
  Object oldObject;

  MapDownlinkRelayRemove(MapDownlinkModel model, EventMessage message, Cont<EventMessage> cont, Value key) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.key = key;
  }

  MapDownlinkRelayRemove(MapDownlinkModel model, Stage stage, Value key) {
    super(model, 1, 3, stage);
    this.message = null;
    this.cont = null;
    this.key = key;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      if (this.model.isStateful()) {
        this.oldValue = this.model.state.remove(this.key);
      }
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
  protected boolean runPhase(MapDownlinkView<?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      view.downlinkWillRemoveValue(this.key);
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
        ((MapDownlinkView<Object, Object>) view).downlinkWillRemove(this.keyObject);
      }
      return ((MapDownlinkView<Object, Object>) view).dispatchWillRemove(this.keyObject, preemptive);
    } else if (phase == 2) {
      view.downlinkDidRemoveValue(this.key, this.oldValue);
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
        ((MapDownlinkView<Object, Object>) view).downlinkDidRemove(this.keyObject, this.oldObject);
      }
      return ((MapDownlinkView<Object, Object>) view).dispatchDidRemove(this.keyObject, this.oldObject, preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.downlinkDidReceive(this.message);
      }
      return view.dispatchDidReceive(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    if (this.message != null) {
      this.model.cueDown();
    } else {
      final Record header = Record.create(1).slot("key", this.key);
      this.model.pushUp(Record.create(1).attr("remove", header));
    }
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Conts.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }
}

final class MapDownlinkRelayDrop extends DownlinkRelay<MapDownlinkModel, MapDownlinkView<?, ?>> {
  final EventMessage message;
  final Cont<EventMessage> cont;
  final int lower;

  MapDownlinkRelayDrop(MapDownlinkModel model, EventMessage message, Cont<EventMessage> cont, int lower) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.lower = lower;
  }

  MapDownlinkRelayDrop(MapDownlinkModel model, Stage stage, int lower) {
    super(model, 1, 3, stage);
    this.message = null;
    this.cont = null;
    this.lower = lower;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      if (this.model.isStateful()) {
        this.model.state.drop(this.lower);
      }
    }
  }

  @Override
  protected boolean runPhase(MapDownlinkView<?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.downlinkWillDrop(this.lower);
      }
      return view.dispatchWillDrop(this.lower, preemptive);
    } else if (phase == 2) {
      if (preemptive) {
        view.downlinkDidDrop(this.lower);
      }
      return view.dispatchDidDrop(this.lower, preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.downlinkDidReceive(this.message);
      }
      return view.dispatchDidReceive(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    if (this.message != null) {
      this.model.cueDown();
    } else {
      this.model.pushUp(Record.create(1).attr("drop", this.lower));
    }
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Conts.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }
}

final class MapDownlinkRelayTake extends DownlinkRelay<MapDownlinkModel, MapDownlinkView<?, ?>> {
  final EventMessage message;
  final Cont<EventMessage> cont;
  final int upper;

  MapDownlinkRelayTake(MapDownlinkModel model, EventMessage message, Cont<EventMessage> cont, int upper) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.upper = upper;
  }

  MapDownlinkRelayTake(MapDownlinkModel model, Stage stage, int upper) {
    super(model, 1, 3, stage);
    this.message = null;
    this.cont = null;
    this.upper = upper;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      if (this.model.isStateful()) {
        this.model.state.take(this.upper);
      }
    }
  }

  @Override
  protected boolean runPhase(MapDownlinkView<?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.downlinkWillTake(this.upper);
      }
      return view.dispatchWillTake(this.upper, preemptive);
    } else if (phase == 2) {
      if (preemptive) {
        view.downlinkDidTake(this.upper);
      }
      return view.dispatchDidTake(this.upper, preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.downlinkDidReceive(this.message);
      }
      return view.dispatchDidReceive(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    if (this.message != null) {
      this.model.cueDown();
    } else {
      this.model.pushUp(Record.create(1).attr("take", this.upper));
    }
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Conts.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }
}

final class MapDownlinkRelayClear extends DownlinkRelay<MapDownlinkModel, MapDownlinkView<?, ?>> {
  final EventMessage message;
  final Cont<EventMessage> cont;

  MapDownlinkRelayClear(MapDownlinkModel model, EventMessage message, Cont<EventMessage> cont) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
  }

  MapDownlinkRelayClear(MapDownlinkModel model, Stage stage) {
    super(model, 1, 3, stage);
    this.message = null;
    this.cont = null;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      if (this.model.isStateful()) {
        this.model.state.clear();
      }
    }
  }

  @Override
  protected boolean runPhase(MapDownlinkView<?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.downlinkWillClear();
      }
      return view.dispatchWillClear(preemptive);
    } else if (phase == 2) {
      if (preemptive) {
        view.downlinkDidClear();
      }
      return view.dispatchDidClear(preemptive);
    } else if (phase == 3) {
      if (preemptive) {
        view.downlinkDidReceive(this.message);
      }
      return view.dispatchDidReceive(this.message.body(), preemptive);
    } else {
      throw new AssertionError(); // unreachable
    }
  }

  @Override
  protected void done() {
    if (this.message != null) {
      this.model.cueDown();
    } else {
      this.model.pushUp(Record.create(1).attr("clear"));
    }
    if (this.cont != null) {
      try {
        this.cont.bind(this.message);
      } catch (Throwable error) {
        if (Conts.isNonFatal(error)) {
          this.cont.trap(error);
        } else {
          throw error;
        }
      }
    }
  }
}
