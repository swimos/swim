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

import java.util.ListIterator;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import swim.api.Link;
import swim.api.data.ListData;
import swim.collections.FingerTrieSeq;
import swim.runtime.LinkBinding;
import swim.runtime.link.ListLinkDelta;
import swim.structure.Form;
import swim.structure.Value;
import swim.warp.CommandMessage;

public class ListLaneModel extends LaneModel<ListLaneView<?>, ListLaneUplink> {
  protected int flags;
  protected ListData<Value> data;

  ListLaneModel(int flags) {
    this.flags = flags;
  }

  public ListLaneModel() {
    this(0);
  }

  @Override
  public String laneType() {
    return "list";
  }

  @Override
  protected ListLaneUplink createUplink(LinkBinding link) {
    return new ListLaneUplink(this, link);
  }

  @Override
  protected void didOpenLaneView(ListLaneView<?> view) {
    view.setLaneBinding(this);
  }

  @Override
  public void onCommand(CommandMessage message) {
    final Value payload = message.body();
    final String tag = payload.tag();
    if ("update".equals(tag)) {
      final Value header = payload.header("update");
      final int index = header.get("index").intValue(-1);
      if (index > -1) {
        final Object key;
        if (header.get("key").isDistinct()) {
          key = header.get("key");
        } else {
          key = null;
        }
        final Value value = payload.body();
        new ListLaneRelayUpdate(this, null, message, index, value, key).run();
      }
    } else if ("move".equals(tag)) {
      final Value header = payload.header("move");
      final int fromIndex = header.get("from").intValue(-1);
      final int toIindex = header.get("to").intValue(-1);
      if (fromIndex > -1 && toIindex > -1) {
        final Object key;
        if (header.get("key").isDistinct()) {
          key = header.get("key");
        } else {
          key = null;
        }
        new ListLaneRelayMove(this, null, message, fromIndex, toIindex, key).run();
      }
    } else if ("remove".equals(tag)) {
      final Value header = payload.header("remove");
      final int index = header.get("index").intValue(-1);
      if (index > -1) {
        final Object key;
        if (header.get("key").isDistinct()) {
          key = header.get("key");
        } else {
          key = null;
        }
        new ListLaneRelayRemove(this, null, message, index, key).run();
      }
    } else if ("drop".equals(tag)) {
      final Value header = payload.header("drop");
      final int lower = header.intValue(0);
      new ListLaneRelayDrop(this, null, message, lower).run();
    } else if ("take".equals(tag)) {
      final Value header = payload.header("take");
      final int upper = header.intValue(0);
      new ListLaneRelayTake(this, null, message, upper).run();
    } else if ("clear".equals(tag)) {
      new ListLaneRelayClear(this, null, message).run();
    }
  }

  protected void sendDown(ListLinkDelta delta) {
    FingerTrieSeq<ListLaneUplink> uplinks;
    FingerTrieSeq<Value> closedLinks = FingerTrieSeq.empty();
    do {
      uplinks = this.uplinks;
      for (int i = 0, n = uplinks.size(); i < n; i += 1) {
        final ListLaneUplink uplink = uplinks.get(i);
        if (uplink.isConnected()) {
          uplink.sendDown(delta);
        } else {
          closedLinks = closedLinks.appended(uplink.linkKey());
        }
      }
    } while (uplinks != this.uplinks);

    for (Value linkKey : closedLinks) {
      closeUplink(linkKey);
    }
  }

  public final boolean isResident() {
    return (this.flags & RESIDENT) != 0;
  }

  public ListLaneModel isResident(boolean isResident) {
    if (this.data != null) {
      this.data.isResident(isResident);
    }
    if (isResident) {
      this.flags |= RESIDENT;
    } else {
      this.flags &= ~RESIDENT;
    }
    final Object views = this.views;
    if (views instanceof ListLaneView<?>) {
      ((ListLaneView<?>) views).didSetResident(isResident);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((ListLaneView<?>) viewArray[i]).didSetResident(isResident);
      }
    }
    return this;
  }

  public final boolean isTransient() {
    return (this.flags & TRANSIENT) != 0;
  }

  public ListLaneModel isTransient(boolean isTransient) {
    if (this.data != null) {
      this.data.isTransient(isTransient);
    }
    if (isTransient) {
      this.flags |= TRANSIENT;
    } else {
      this.flags &= ~TRANSIENT;
    }
    final Object views = this.views;
    if (views instanceof ListLaneView<?>) {
      ((ListLaneView<?>) views).didSetTransient(isTransient);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((ListLaneView<?>) viewArray[i]).didSetTransient(isTransient);
      }
    }
    return this;
  }

  public final boolean isSigned() {
    return (this.flags & SIGNED) != 0;
  }

  public ListLaneModel isSigned(boolean isSigned) {
    if (isSigned) {
      this.flags |= SIGNED;
    } else {
      this.flags &= ~SIGNED;
    }
    final Object views = this.views;
    if (views instanceof ListLaneView<?>) {
      ((ListLaneView<?>) views).didSetSigned(isSigned);
    } else if (views instanceof LaneView[]) {
      final LaneView[] viewArray = (LaneView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((ListLaneView<?>) viewArray[i]).didSetSigned(isSigned);
      }
    }
    return this;
  }

  @SuppressWarnings("unchecked")
  public <V> boolean add(ListLaneView<V> view, int index, V newObject) {
    return add(view, index, newObject, null);
  }

  @SuppressWarnings("unchecked")
  public <V> boolean add(ListLaneView<V> view, int index, V newObject, Object key) {
    final Form<V> valueForm = view.valueForm;
    final Value newValue = valueForm.mold(newObject).toValue();
    final ListLaneRelayUpdate relay = new ListLaneRelayUpdate(this, null, index, newValue, key);
    relay.valueForm = (Form<Object>) valueForm;
    relay.newObject = newObject;
    relay.stage = stage();
    relay.run();
    return relay.newObject != null; // TODO
  }

  @SuppressWarnings("unchecked")
  public <V> V set(ListLaneView<V> view, int index, V newObject) {
    return set(view, index, newObject, null);
  }

  @SuppressWarnings("unchecked")
  public <V> V set(ListLaneView<V> view, int index, V newObject, Object key) {
    final Form<V> valueForm = view.valueForm;
    final Value newValue = valueForm.mold(newObject).toValue();
    final ListLaneRelayUpdate relay = new ListLaneRelayUpdate(this, null, index, newValue, key);
    relay.valueForm = (Form<Object>) valueForm;
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

  public void move(int fromIndex, int toIndex) {
    move(fromIndex, toIndex, null);
  }

  public void move(int fromIndex, int toIndex, Object key) {
    final ListLaneRelayMove relay = new ListLaneRelayMove(this, null, fromIndex, toIndex, key);
    relay.stage = stage();
    relay.run();
  }

  @SuppressWarnings("unchecked")
  public <V> V remove(ListLaneView<V> view, int index) {
    return remove(view, index, null);
  }

  @SuppressWarnings("unchecked")
  public <V> V remove(ListLaneView<V> view, int index, Object key) {
    final Form<V> valueForm = view.valueForm;
    final Map.Entry<Object, Value> entry = this.data.getEntry(index, key);
    if (entry != null) {
      final Object actualKey = key == null ? entry.getKey() : key;
      final ListLaneRelayRemove relay = new ListLaneRelayRemove(this, null, index, actualKey);
      relay.valueForm = (Form<Object>) valueForm;
      relay.stage = stage();
      relay.run();
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

  public void drop(ListLaneView<?> view, int lower) {
    if (lower > 0) {
      final ListLaneRelayDrop relay = new ListLaneRelayDrop(this, null, lower);
      relay.stage = stage();
      relay.run();
    }
  }

  public void take(ListLaneView<?> view, int upper) {
    if (upper > 0) {
      final ListLaneRelayTake relay = new ListLaneRelayTake(this, null, upper);
      relay.stage = stage();
      relay.run();
    }
  }

  public void clear(ListLaneView<?> view) {
    final ListLaneRelayClear relay = new ListLaneRelayClear(this, null);
    relay.stage = stage();
    relay.run();
  }

  public ListIterator<Map.Entry<Object, Value>> iterator() {
    return this.data.entryIterator();
  }

  protected void openStore() {
    this.data = this.laneContext.store().listData(laneUri().toString())
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

final class ListLaneRelayUpdate extends LaneRelay<ListLaneModel, ListLaneView<?>> {
  final Link link;
  final CommandMessage message;
  final int index;
  Object key;
  Form<Object> valueForm;
  Value oldValue;
  Object oldObject;
  Value newValue;
  Object newObject;

  ListLaneRelayUpdate(ListLaneModel model, Link link, CommandMessage message, int index, Value newValue, Object key) {
    super(model, 4);
    this.link = link;
    this.message = message;
    this.index = index;
    this.newValue = newValue;
    this.key = key;
  }

  ListLaneRelayUpdate(ListLaneModel model, Link link, int index, Value newValue, Object key) {
    super(model, 1, 3);
    this.link = link;
    this.message = null;
    this.index = index;
    this.newValue = newValue;
    this.key = key;
  }

  @Override
  void beginPhase(int phase) {
    if (phase == 2) {
      final Map.Entry<Object, Value> entry;
      if (model.data.isEmpty()) {
        entry = null;
      } else {
        entry = this.model.data.getEntry(this.index, this.key);
      }
      if (entry == null) {
        if (this.key == null) {
          final byte[] bytes = new byte[6];
          ThreadLocalRandom.current().nextBytes(bytes);
          this.key = Value.fromObject(bytes);
        }
        this.model.data.add(this.index, this.newValue, this.key);
      } else {
        this.oldValue = entry.getValue();
        this.key = entry.getKey();
        this.model.data.set(this.index, this.newValue, this.key);
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
  boolean runPhase(ListLaneView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.oldObject = valueForm.cast(this.newValue);
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
      }
      if (preemptive) {
        this.newObject = ((ListLaneView<Object>) view).laneWillUpdate(this.index, this.oldObject);
      }
      final Map.Entry<Boolean, Object> result = ((ListLaneView<Object>) view).dispatchWillUpdate(this.link, this.index, this.newObject, preemptive);
      this.newObject = result.getValue();
      if (this.oldObject != this.newObject) {
        this.oldObject = this.newObject;
        this.newValue = valueForm.mold(this.newObject).toValue();
      }
      return result.getKey();
    } else if (phase == 2) {
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
        ((ListLaneView<Object>) view).laneDidUpdate(this.index, this.newObject, this.oldObject);
      }
      return ((ListLaneView<Object>) view).dispatchDidUpdate(this.link, this.index, this.newObject, this.oldObject, preemptive);
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
    this.model.sendDown(ListLinkDelta.update(this.index, Value.fromObject(this.key), this.newValue));
  }
}

final class ListLaneRelayMove extends LaneRelay<ListLaneModel, ListLaneView<?>> {
  final Link link;
  final CommandMessage message;
  final int fromIndex;
  final int toIndex;
  final Object key;
  Form<Object> valueForm;
  Value value;
  Object object;

  ListLaneRelayMove(ListLaneModel model, Link link, CommandMessage message, int fromIndex, int toIndex, Object key) {
    super(model, 4);
    this.link = link;
    this.message = message;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.key = key;
  }

  ListLaneRelayMove(ListLaneModel model, Link link, int fromIndex, int toIndex, Object key) {
    super(model, 1, 3);
    this.link = link;
    this.message = null;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.key = key;
  }

  @Override
  void beginPhase(int phase) {
    if (phase == 2) {
      this.model.data.move(this.fromIndex, this.toIndex, this.key);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  boolean runPhase(ListLaneView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.value = this.model.data.get(this.fromIndex, this.key);
        this.object = valueForm.cast(this.value);
        if (this.object == null) {
          this.object = valueForm.unit();
        }
      }
      if (preemptive) {
        ((ListLaneView<Object>) view).laneWillMove(this.fromIndex, this.toIndex, this.object);
      }
      return ((ListLaneView<Object>) view).dispatchWillMove(this.link, this.fromIndex, this.toIndex, this.object, preemptive);
    } else if (phase == 2) {
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.object = valueForm.cast(this.value);
        if (this.object == null) {
          this.object = valueForm.unit();
        }
      }
      if (preemptive) {
        ((ListLaneView<Object>) view).laneDidMove(this.fromIndex, this.toIndex, this.object);
      }
      return ((ListLaneView<Object>) view).dispatchDidMove(this.link, this.fromIndex, this.toIndex, this.object, preemptive);
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
    this.model.sendDown(ListLinkDelta.move(this.fromIndex, this.toIndex, Value.fromObject(this.key)));
  }
}

final class ListLaneRelayRemove extends LaneRelay<ListLaneModel, ListLaneView<?>> {
  final Link link;
  final CommandMessage message;
  final int index;
  final Object key;
  Form<Object> valueForm;
  Value oldValue;
  Object oldObject;

  ListLaneRelayRemove(ListLaneModel model, Link link, CommandMessage message, int index, Object key) {
    super(model, 4);
    this.link = link;
    this.message = message;
    this.index = index;
    this.key = key;
  }

  ListLaneRelayRemove(ListLaneModel model, Link link, int index, Object key) {
    super(model, 1, 3);
    this.link = link;
    this.message = null;
    this.index = index;
    this.key = key;
  }

  @Override
  void beginPhase(int phase) {
    if (phase == 2) {
      this.oldValue = this.model.data.remove(this.index, this.key);
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
  boolean runPhase(ListLaneView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
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
        view.laneWillRemove(this.index);
      }
      return view.dispatchWillRemove(this.link, this.index, preemptive);
    } else if (phase == 2) {
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.oldObject = valueForm.cast(this.oldValue);
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
      }
      if (preemptive) {
        ((ListLaneView<Object>) view).laneDidRemove(this.index, this.oldObject);
      }
      return ((ListLaneView<Object>) view).dispatchDidRemove(this.link, this.index, this.oldObject, preemptive);
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
    this.model.sendDown(ListLinkDelta.remove(this.index, Value.fromObject(this.key)));
  }
}

final class ListLaneRelayDrop extends LaneRelay<ListLaneModel, ListLaneView<?>> {
  final Link link;
  final CommandMessage message;
  final int lower;

  ListLaneRelayDrop(ListLaneModel model, Link link, CommandMessage message, int lower) {
    super(model, 4);
    this.link = link;
    this.message = message;
    this.lower = lower;
  }

  ListLaneRelayDrop(ListLaneModel model, Link link, int lower) {
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
  boolean runPhase(ListLaneView<?> view, int phase, boolean preemptive) {
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
    this.model.sendDown(ListLinkDelta.drop(this.lower));
  }
}

final class ListLaneRelayTake extends LaneRelay<ListLaneModel, ListLaneView<?>> {
  final Link link;
  final CommandMessage message;
  final int upper;

  ListLaneRelayTake(ListLaneModel model, Link link, CommandMessage message, int upper) {
    super(model, 4);
    this.link = link;
    this.message = message;
    this.upper = upper;
  }

  ListLaneRelayTake(ListLaneModel model, Link link, int upper) {
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
  boolean runPhase(ListLaneView<?> view, int phase, boolean preemptive) {
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
    this.model.sendDown(ListLinkDelta.take(this.upper));
  }
}

final class ListLaneRelayClear extends LaneRelay<ListLaneModel, ListLaneView<?>> {
  final Link link;
  final CommandMessage message;

  ListLaneRelayClear(ListLaneModel model, Link link, CommandMessage message) {
    super(model, 4);
    this.link = link;
    this.message = message;
  }

  ListLaneRelayClear(ListLaneModel model, Link link) {
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
  boolean runPhase(ListLaneView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.laneWillCommand(this.message);
      }
      return view.dispatchWillCommand(this.message.body(), preemptive);
    } else if (phase == 1) {
      view.laneWillClear();
      return view.dispatchWillClear(this.link, preemptive);
    } else if (phase == 2) {
      view.laneDidClear();
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
    this.model.sendDown(ListLinkDelta.clear());
  }
}
