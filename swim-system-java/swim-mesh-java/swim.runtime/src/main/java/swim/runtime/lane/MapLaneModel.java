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

import java.util.Iterator;
import java.util.Map;
import swim.api.Link;
import swim.api.data.MapData;
import swim.collections.FingerTrieSeq;
import swim.runtime.LinkBinding;
import swim.structure.Form;
import swim.structure.Record;
import swim.structure.Value;
import swim.warp.CommandMessage;

public class MapLaneModel extends LaneModel<MapLaneView<?, ?>, MapLaneUplink> {
  protected int flags;
  protected MapData<Value, Value> data;

  MapLaneModel(int flags) {
    this.flags = flags;
  }

  public MapLaneModel() {
    this(0);
  }

  @Override
  public String laneType() {
    return "map";
  }

  @Override
  protected MapLaneUplink createUplink(LinkBinding link) {
    return new MapLaneUplink(this, link);
  }

  @Override
  protected void didOpenLaneView(MapLaneView<?, ?> view) {
    view.setLaneBinding(this);
  }

  @Override
  public void onCommand(CommandMessage message) {
    final Value payload = message.body();
    final String tag = payload.tag();
    if ("update".equals(tag)) {
      final Value header = payload.header("update");
      final Value key = header.get("key");
      final Value value = payload.body();
      new MapLaneRelayUpdate(this, null, message, key, value).run();
    } else if ("remove".equals(tag)) {
      final Value header = payload.header("remove");
      final Value key = header.get("key");
      new MapLaneRelayRemove(this, null, message, key).run();
    } else if ("drop".equals(tag)) {
      final Value header = payload.header("drop");
      final int lower = header.intValue(0);
      new MapLaneRelayDrop(this, null, message, lower).run();
    } else if ("take".equals(tag)) {
      final Value header = payload.header("take");
      final int upper = header.intValue(0);
      new MapLaneRelayTake(this, null, message, upper).run();
    } else if ("clear".equals(tag)) {
      new MapLaneRelayClear(this, null, message).run();
    }
  }

  protected void cueDownKey(Value key) {
    FingerTrieSeq<MapLaneUplink> uplinks;
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

  public MapLaneModel isResident(boolean isResident) {
    if (this.data != null) {
      this.data.isResident(isResident);
    }
    if (isResident) {
      this.flags |= RESIDENT;
    } else {
      this.flags &= ~RESIDENT;
    }
    final Object views = this.views;
    if (views instanceof MapLaneView<?, ?>) {
      ((MapLaneView<?, ?>) views).didSetResident(isResident);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((MapLaneView<?, ?>) viewArray[i]).didSetResident(isResident);
      }
    }
    return this;
  }

  public final boolean isTransient() {
    return (this.flags & TRANSIENT) != 0;
  }

  public MapLaneModel isTransient(boolean isTransient) {
    if (this.data != null) {
      this.data.isTransient(isTransient);
    }
    if (isTransient) {
      this.flags |= TRANSIENT;
    } else {
      this.flags &= ~TRANSIENT;
    }
    final Object views = this.views;
    if (views instanceof MapLaneView<?, ?>) {
      ((MapLaneView<?, ?>) views).didSetTransient(isTransient);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((MapLaneView<?, ?>) viewArray[i]).didSetTransient(isTransient);
      }
    }
    return this;
  }

  public final boolean isSigned() {
    return (this.flags & SIGNED) != 0;
  }

  public MapLaneModel isSigned(boolean isSigned) {
    if (isSigned) {
      this.flags |= SIGNED;
    } else {
      this.flags &= ~SIGNED;
    }
    final Object views = this.views;
    if (views instanceof MapLaneView<?, ?>) {
      ((MapLaneView<?, ?>) views).didSetSigned(isSigned);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((MapLaneView<?, ?>) viewArray[i]).didSetSigned(isSigned);
      }
    }
    return this;
  }

  public Value get(Value key) {
    if (key != null) {
      final Value value = this.data.get(key);
      if (isSigned()) {
        // TODO: might replaced by method from class replace Ledger later
        // value = ledger().unsign(value);
      }
      return value;
    } else {
      return Value.absent();
    }
  }

  @SuppressWarnings("unchecked")
  public <K, V> V put(MapLaneView<K, V> view, K keyObject, V newObject) {
    final Form<K> keyForm = view.keyForm;
    final Form<V> valueForm = view.valueForm;
    final Value key = keyForm.mold(keyObject).toValue();
    final Value newValue = valueForm.mold(newObject).toValue();
    final MapLaneRelayUpdate relay = new MapLaneRelayUpdate(this, null, key, newValue);
    relay.keyForm = (Form<Object>) keyForm;
    relay.valueForm = (Form<Object>) valueForm;
    relay.keyObject = keyObject;
    relay.oldObject = newObject;
    relay.newObject = newObject;
    relay.stage = stage();
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
  public <K, V> V remove(MapLaneView<K, V> view, K keyObject) {
    final Form<K> keyForm = view.keyForm;
    final Form<V> valueForm = view.valueForm;
    final Value key = keyForm.mold(keyObject).toValue();
    final MapLaneRelayRemove relay = new MapLaneRelayRemove(this, null, key);
    relay.keyForm = (Form<Object>) keyForm;
    relay.valueForm = (Form<Object>) valueForm;
    relay.keyObject = keyObject;
    relay.stage = stage();
    relay.run();
    if (relay.valueForm == valueForm || valueForm == null) {
      return (V) relay.oldObject;
    } else  {
      return valueForm.unit();
    }
  }

  public void drop(MapLaneView<?, ?> view, int lower) {
    if (lower > 0) {
      final MapLaneRelayDrop relay = new MapLaneRelayDrop(this, null, lower);
      relay.stage = stage();
      relay.run();
    }
  }

  public void take(MapLaneView<?, ?> view, int upper) {
    if (upper > 0) {
      final MapLaneRelayTake relay = new MapLaneRelayTake(this, null, upper);
      relay.stage = stage();
      relay.run();
    }
  }

  public void clear(MapLaneView<?, ?> view) {
    final MapLaneRelayClear relay = new MapLaneRelayClear(this, null);
    relay.stage = stage();
    relay.run();
  }

  public Iterator<Map.Entry<Value, Value>> iterator() {
    return this.data.iterator();
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

  static final int RESIDENT = 1 << 0;
  static final int TRANSIENT = 1 << 1;
  static final int SIGNED = 1 << 2;
}

final class MapLaneRelayUpdate extends LaneRelay<MapLaneModel, MapLaneView<?, ?>> {
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

  MapLaneRelayUpdate(MapLaneModel model, Link link, CommandMessage message, Value key, Value newValue) {
    super(model, 4);
    this.link = link;
    this.message = message;
    this.key = key;
    this.newValue = newValue;
  }

  MapLaneRelayUpdate(MapLaneModel model, Link link, Value key, Value newValue) {
    super(model, 1, 3);
    this.link = link;
    this.message = null;
    this.key = key;
    this.newValue = newValue;
  }

  @Override
  void beginPhase(int phase) {
    if (phase == 2) {
      this.oldValue = this.model.data.put(this.key, this.newValue);
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
  boolean runPhase(MapLaneView<?, ?> view, int phase, boolean preemptive) {
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
        this.newObject = ((MapLaneView<Object, Object>) view).laneWillUpdate(this.keyObject, this.oldObject);
      }
      final Map.Entry<Boolean, Object> result = ((MapLaneView<Object, Object>) view).dispatchWillUpdate(this.link, this.keyObject, this.oldObject, preemptive);
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
        ((MapLaneView<Object, Object>) view).laneDidUpdate(this.keyObject, this.newObject, this.oldObject);
      }
      return ((MapLaneView<Object, Object>) view).dispatchDidUpdate(this.link, this.keyObject, this.newObject, this.oldObject, preemptive);
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
  void done() {
    this.model.cueDownKey(this.key);
  }
}

final class MapLaneRelayRemove extends LaneRelay<MapLaneModel, MapLaneView<?, ?>> {
  final Link link;
  final CommandMessage message;
  Form<Object> keyForm;
  Form<Object> valueForm;
  final Value key;
  Object keyObject;
  Value oldValue;
  Object oldObject;

  MapLaneRelayRemove(MapLaneModel model, Link link, CommandMessage message, Value key) {
    super(model, 4);
    this.link = link;
    this.message = message;
    this.key = key;
  }

  MapLaneRelayRemove(MapLaneModel model, Link link, Value key) {
    super(model, 1, 3);
    this.link = link;
    this.message = null;
    this.key = key;
  }

  @Override
  void beginPhase(int phase) {
    if (phase == 2) {
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
  boolean runPhase(MapLaneView<?, ?> view, int phase, boolean preemptive) {
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
        ((MapLaneView<Object, Object>) view).laneWillRemove(this.keyObject);
      }
      return ((MapLaneView<Object, Object>) view).dispatchWillRemove(this.link, this.keyObject, preemptive);
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
        ((MapLaneView<Object, Object>) view).laneDidRemove(this.keyObject, this.oldObject);
      }
      return ((MapLaneView<Object, Object>) view).dispatchDidRemove(this.link, this.keyObject, this.oldObject, preemptive);
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
  void done() {
    if (this.oldValue.isDefined()) {
      this.model.sendDown(Record.create(1).attr("remove", Record.create(1).slot("key", this.key)));
    }
  }
}

final class MapLaneRelayDrop extends LaneRelay<MapLaneModel, MapLaneView<?, ?>> {
  final Link link;
  final CommandMessage message;
  final int lower;

  MapLaneRelayDrop(MapLaneModel model, Link link, CommandMessage message, int lower) {
    super(model, 0, 4);
    this.link = link;
    this.message = message;
    this.lower = lower;
  }

  MapLaneRelayDrop(MapLaneModel model, Link link, int lower) {
    super(model, 1, 3);
    this.link = link;
    this.message = null;
    this.lower = lower;
  }

  @Override
  void beginPhase(int phase) {
    if (phase == 2) {
      this.model.data.drop(this.lower);
    }
  }

  @Override
  boolean runPhase(MapLaneView<?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.laneWillDrop(this.lower);
      }
      return view.dispatchWillDrop(this.link, this.lower, preemptive);
    } else if (phase == 2) {
      if (preemptive) {
        view.laneDidDrop(this.lower);
      }
      return view.dispatchDidDrop(this.link, this.lower, preemptive);
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
  void done() {
    this.model.sendDown(Record.create(1).attr("drop", this.lower));
  }
}

final class MapLaneRelayTake extends LaneRelay<MapLaneModel, MapLaneView<?, ?>> {
  final Link link;
  final CommandMessage message;
  final int upper;

  MapLaneRelayTake(MapLaneModel model, Link link, CommandMessage message, int upper) {
    super(model, 4);
    this.link = link;
    this.message = message;
    this.upper = upper;
  }

  MapLaneRelayTake(MapLaneModel model, Link link, int upper) {
    super(model, 1, 3);
    this.link = link;
    this.message = null;
    this.upper = upper;
  }

  @Override
  void beginPhase(int phase) {
    if (phase == 2) {
      this.model.data.take(this.upper);
    }
  }

  @Override
  boolean runPhase(MapLaneView<?, ?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      if (preemptive) {
        view.laneWillTake(this.upper);
      }
      return view.dispatchWillTake(this.link, this.upper, preemptive);
    } else if (phase == 2) {
      if (preemptive) {
        view.laneDidTake(this.upper);
      }
      return view.dispatchDidTake(this.link, this.upper, preemptive);
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
  void done() {
    this.model.sendDown(Record.create(1).attr("take", this.upper));
  }
}

final class MapLaneRelayClear extends LaneRelay<MapLaneModel, MapLaneView<?, ?>> {
  final Link link;
  final CommandMessage message;

  MapLaneRelayClear(MapLaneModel model, Link link, CommandMessage message) {
    super(model, 4);
    this.link = link;
    this.message = message;
  }

  MapLaneRelayClear(MapLaneModel model, Link link) {
    super(model, 1, 3);
    this.link = link;
    this.message = null;
  }

  @Override
  void beginPhase(int phase) {
    if (phase == 2) {
      this.model.data.clear();
    }
  }

  @Override
  boolean runPhase(MapLaneView<?, ?> view, int phase, boolean preemptive) {
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
  void done() {
    this.model.sendDown(Record.create(1).attr("clear"));
  }
}
