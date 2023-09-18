// Copyright 2015-2023 Nstream, inc.
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

package swim.system.downlink;

import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import swim.api.DownlinkException;
import swim.collections.STreeList;
import swim.concurrent.Cont;
import swim.concurrent.Stage;
import swim.structure.Form;
import swim.structure.Value;
import swim.system.DownlinkModel;
import swim.system.DownlinkRelay;
import swim.system.DownlinkView;
import swim.system.Push;
import swim.system.warp.ListDownlinkModem;
import swim.system.warp.ListLinkDelta;
import swim.uri.Uri;
import swim.warp.EventMessage;

public class ListDownlinkModel extends ListDownlinkModem<ListDownlinkView<?>> {

  protected final STreeList<Value> state;
  protected int flags;

  public ListDownlinkModel(Uri meshUri, Uri hostUri, Uri nodeUri, Uri laneUri,
                           float prio, float rate, Value body) {
    super(meshUri, hostUri, nodeUri, laneUri, prio, rate, body);
    this.state = STreeList.empty();
    this.flags = 0;
  }

  public final boolean isStateful() {
    return (this.flags & ListDownlinkModel.STATEFUL) != 0;
  }

  public ListDownlinkModel isStateful(boolean isStateful) {
    if (isStateful) {
      this.flags |= ListDownlinkModel.STATEFUL;
    } else {
      this.flags &= ~ListDownlinkModel.STATEFUL;
    }
    final Object views = DownlinkModel.VIEWS.get(this);
    if (views instanceof DownlinkView) {
      ((ListDownlinkView<?>) views).didSetStateful(isStateful);
    } else if (views instanceof DownlinkView[]) {
      final DownlinkView[] viewArray = (DownlinkView[]) views;
      for (int i = 0, n = viewArray.length; i < n; i += 1) {
        ((ListDownlinkView<?>) viewArray[i]).didSetStateful(isStateful);
      }
    }
    return this;
  }

  @Override
  protected void pushDownEvent(Push<EventMessage> push) {
    final EventMessage message = push.message();
    this.onEvent(message);
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
        new ListDownlinkRelayUpdate(this, message, push.cont(), index, value, key).run();
      }
    } else if ("move".equals(tag)) {
      final Value header = payload.header("move");
      final int fromIndex = header.get("from").intValue(-1);
      final int toIndex = header.get("to").intValue(-1);
      if (fromIndex > -1 && toIndex > -1) {
        final Object key;
        if (header.get("key").isDistinct()) {
          key = header.get("key");
        } else {
          key = null;
        }
        new ListDownlinkRelayMove(this, message, push.cont(), fromIndex, toIndex, key).run();
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
        new ListDownlinkRelayRemove(this, message, push.cont(), index, key).run();
      }
    } else if ("drop".equals(tag)) {
      final Value header = payload.header("drop");
      final int lower = header.intValue(0);
      new ListDownlinkRelayDrop(this, message, push.cont(), lower).run();
    } else if ("take".equals(tag)) {
      final Value header = payload.header("take");
      final int upper = header.intValue(0);
      new ListDownlinkRelayTake(this, message, push.cont(), upper).run();
    } else if ("clear".equals(tag)) {
      new ListDownlinkRelayClear(this, message, push.cont()).run();
    } else {
      push.trap(new DownlinkException("unknown subcommand: " + payload));
    }
  }

  @Override
  protected void didAddDownlink(ListDownlinkView<?> view) {
    super.didAddDownlink(view);
    if (DownlinkModel.VIEWS.get(this) instanceof DownlinkView) {
      this.isStateful(((ListDownlinkView<?>) view).isStateful());
    }
  }

  public boolean isEmpty() {
    return this.state.isEmpty();
  }

  public int size() {
    return this.state.size();
  }

  public boolean contains(Object value) {
    if (value != null) {
      return this.state.contains(value);
    } else {
      return false;
    }
  }

  public int indexOf(Object o) {
    return this.state.indexOf(o);
  }

  public int lastIndexOf(Object o) {
    return this.state.lastIndexOf(o);
  }

  public List<Value> subList(int fromIndex, int toIndex) {
    return this.state.subList(fromIndex, toIndex);
  }

  public Object[] toArray() {
    return this.state.toArray();
  }

  public <V> V[] toArray(V[] array) {
    return this.state.toArray(array);
  }

  public ListIterator<Map.Entry<Object, Value>> entryIterator() {
    return this.state.entryIterator();
  }

  public Iterator<Value> iterator() {
    return this.state.iterator();
  }

  public ListIterator<Value> listIterator() {
    return this.state.listIterator();
  }

  public ListIterator<Value> listIterator(int index) {
    return this.state.listIterator(index);
  }

  public ListIterator<Object> keyIterator() {
    return this.state.keyIterator();
  }

  public Map.Entry<Object, Value> getEntry(int index) {
    return this.state.getEntry(index);
  }

  public Map.Entry<Object, Value> getEntry(int index, Object key) {
    return this.state.getEntry(index, key);
  }

  public Value get(int index, Object key) {
    final Value value = this.state.get(index, key);
    if (value != null) {
      return value;
    }
    return Value.absent();
  }

  @SuppressWarnings("unchecked")
  public <V> boolean add(ListDownlinkView<V> view, int index, V newObject) {
    return this.add(view, index, newObject, null);
  }

  @SuppressWarnings("unchecked")
  public <V> boolean add(ListDownlinkView<V> view, int index, V newObject, Object key) {
    final Form<V> valueForm = view.valueForm;
    final Value newValue = valueForm.mold(newObject).toValue();
    final ListDownlinkRelayUpdate relay = new ListDownlinkRelayUpdate(this, view.stage(), index, newValue, key);
    relay.valueForm = (Form<Object>) valueForm;
    relay.newObject = newObject;
    relay.run();
    if (relay.isDone() && relay.valueForm == valueForm) {
      return relay.oldObject != null;
    } else {
      return false;
    }
  }

  @SuppressWarnings("unchecked")
  public <V> V set(ListDownlinkView<V> view, int index, V newObject) {
    return this.set(view, index, newObject, null);
  }

  @SuppressWarnings("unchecked")
  public <V> V set(ListDownlinkView<V> view, int index, V newObject, Object key) {
    final Form<V> valueForm = view.valueForm;
    final Value newValue = valueForm.mold(newObject).toValue();
    final ListDownlinkRelayUpdate relay = new ListDownlinkRelayUpdate(this, view.stage(), index, newValue, key);
    relay.valueForm = (Form<Object>) valueForm;
    relay.oldObject = newObject;
    relay.newObject = newObject;
    relay.run();
    if (relay.isDone() && relay.valueForm == valueForm) {
      return (V) relay.oldObject;
    } else {
      return null;
    }
  }

  public <V> void move(ListDownlinkView<V> view, int fromIndex, int toIndex) {
    this.move(view, fromIndex, toIndex, null);
  }

  public <V> void move(ListDownlinkView<V> view, int fromIndex, int toIndex, Object key) {
    final ListDownlinkRelayMove relay = new ListDownlinkRelayMove(this, view.stage(), fromIndex, toIndex, key);
    relay.run();
  }

  @SuppressWarnings("unchecked")
  public <V> V remove(ListDownlinkView<V> view, int index) {
    return this.remove(view, index, null);
  }

  @SuppressWarnings("unchecked")
  public <V> V remove(ListDownlinkView<V> view, int index, Object key) {
    final Form<V> valueForm = view.valueForm;
    final Map.Entry<Object, Value> entry = this.getEntry(index, key);
    if (entry != null) {
      final Object actualKey = key == null ? entry.getKey() : key;
      final ListDownlinkRelayRemove relay = new ListDownlinkRelayRemove(this, view.stage(), index, actualKey);
      relay.valueForm = (Form<Object>) valueForm;
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
    } else {
      return null;
    }
  }

  public void drop(ListDownlinkView<?> view, int lower) {
    this.pushUp(ListLinkDelta.drop(lower));
    //final ListDownlinkRelayDrop relay = new ListDownlinkRelayDrop(this, view.stage(), lower);
    //relay.run();
  }

  public void take(ListDownlinkView<?> view, int upper) {
    this.pushUp(ListLinkDelta.take(upper));
    //final ListDownlinkRelayTake relay = new ListDownlinkRelayTake(this, view.stage(), upper);
    //relay.run();
  }

  public void clear(ListDownlinkView<?> view) {
    this.pushUp(ListLinkDelta.clear());
    //final ListDownlinkRelayClear relay = new ListDownlinkRelayClear(this, view.stage());
    //relay.run();
  }

  protected static final int STATEFUL = 1 << 0;

}

final class ListDownlinkRelayUpdate extends DownlinkRelay<ListDownlinkModel, ListDownlinkView<?>> {

  final EventMessage message;
  final Cont<EventMessage> cont;
  final int index;
  Object key;
  Form<Object> valueForm;
  Value oldValue;
  Value newValue;
  Object oldObject;
  Object newObject;

  ListDownlinkRelayUpdate(ListDownlinkModel model, EventMessage message, Cont<EventMessage> cont, int index, Value newValue, Object key) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.index = index;
    this.key = key;
    this.newValue = newValue;
  }

  ListDownlinkRelayUpdate(ListDownlinkModel model, Stage stage, int index, Value newValue, Object key) {
    super(model, 1, 3, stage);
    this.message = null;
    this.cont = null;
    this.index = index;
    this.key = key;
    this.newValue = newValue;
  }

  @SuppressWarnings("unchecked")
  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      if (this.model.isStateful()) {
        final Map.Entry<Object, Value> entry;
        if (this.index < this.model.state.size()) {
          entry = this.model.state.getEntry(this.index, this.key);
        } else {
          entry = null;
        }
        if (entry == null) {
          if (this.key == null) {
            final byte[] bytes = new byte[6];
            ThreadLocalRandom.current().nextBytes(bytes);
            this.key = Value.fromObject(bytes);
          }
          this.model.state.add(this.index, this.newValue, this.key);
        } else {
          this.oldValue = entry.getValue();
          this.key = entry.getKey();
          this.model.state.set(this.index, this.newValue, this.key);
        }
      }
      if (this.oldValue == null) {
        this.oldValue = Value.absent();
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(ListDownlinkView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      this.newValue = view.downlinkWillUpdateValue(this.index, this.newValue);
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        if (this.oldValue != null) {
          this.oldObject = valueForm.cast(this.oldValue);
        }
        if (this.oldObject == null) {
          this.oldObject = valueForm.unit();
        }
        this.newObject = valueForm.cast(this.newValue);
      }
      if (preemptive) {
        this.newObject = ((ListDownlinkView<Object>) view).downlinkWillUpdate(this.index, this.newObject);
      }
      final Map.Entry<Boolean, Object> result = ((ListDownlinkView<Object>) view).dispatchWillUpdate(this.index, this.newObject, preemptive);
      if (this.newObject != result.getValue()) {
        this.oldObject = this.newObject;
        this.newObject = result.getValue();
        this.newValue = valueForm.mold(this.newObject).toValue();
      }
      return result.getKey();
    } else if (phase == 2) {
      view.downlinkDidUpdateValue(this.index, this.newValue, this.oldValue);
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
        ((ListDownlinkView<Object>) view).downlinkDidUpdate(this.index, this.newObject, this.oldObject);
      }
      return ((ListDownlinkView<Object>) view).dispatchDidUpdate(this.index, this.newObject, this.oldObject, preemptive);
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
      this.model.pushUp(ListLinkDelta.update(this.index, Value.fromObject(this.key), this.newValue));
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

final class ListDownlinkRelayMove extends DownlinkRelay<ListDownlinkModel, ListDownlinkView<?>> {

  final EventMessage message;
  final Cont<EventMessage> cont;
  final int fromIndex;
  final int toIndex;
  Object key;
  Form<Object> valueForm;
  Value value;
  Object object;

  ListDownlinkRelayMove(ListDownlinkModel model, EventMessage message, Cont<EventMessage> cont, int fromIndex, int toIndex, Object key) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.key = key;
  }

  ListDownlinkRelayMove(ListDownlinkModel model, Stage stage, int fromIndex, int toIndex, Object key) {
    super(model, 1, 3, stage);
    this.message = null;
    this.cont = null;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
    this.key = key;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      final Map.Entry<Object, Value> entry = this.model.state.getEntry(this.fromIndex);
      this.model.state.move(this.fromIndex, this.toIndex, this.key);
      this.key = entry.getKey();
      this.value = entry.getValue();
      if (this.value == null) {
        this.value = Value.absent();
      }
      if (this.valueForm != null) {
        this.object = this.valueForm.cast(this.value);
        if (this.object == null) {
          this.object = this.valueForm.unit();
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  protected boolean runPhase(ListDownlinkView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      view.downlinkWillMoveValue(this.fromIndex, this.toIndex, this.value);
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        if (this.value != null) {
          this.object = valueForm.cast(this.value);
        }
        if (this.object == null) {
          this.object = valueForm.unit();
        }
      }
      if (preemptive) {
        ((ListDownlinkView<Object>) view).downlinkWillMove(this.fromIndex, this.toIndex, this.value);
      }
      return ((ListDownlinkView<Object>) view).dispatchWillMove(this.fromIndex, this.toIndex, this.value, preemptive);
    } else if (phase == 2) {
      view.downlinkDidMoveValue(this.fromIndex, this.toIndex, this.value);
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      if (this.valueForm != valueForm && valueForm != null) {
        this.valueForm = valueForm;
        this.object = valueForm.cast(this.value);
        if (this.object == null) {
          this.object = valueForm.unit();
        }
      }
      if (preemptive) {
        ((ListDownlinkView<Object>) view).downlinkDidMove(this.fromIndex, this.toIndex, this.object);
      }
      return ((ListDownlinkView<Object>) view).dispatchDidMove(this.fromIndex, this.toIndex, this.object, preemptive);
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
      this.model.pushUp(ListLinkDelta.move(this.fromIndex, this.toIndex, Value.fromObject(this.key)));
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

final class ListDownlinkRelayRemove extends DownlinkRelay<ListDownlinkModel, ListDownlinkView<?>> {

  final EventMessage message;
  final Cont<EventMessage> cont;
  final int index;
  Object key;
  Form<Object> valueForm;
  Value oldValue;
  Object oldObject;

  ListDownlinkRelayRemove(ListDownlinkModel model, EventMessage message, Cont<EventMessage> cont, int index, Object key) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.index = index;
    this.key = key;
  }

  ListDownlinkRelayRemove(ListDownlinkModel model, Stage stage, int index, Object key) {
    super(model, 1, 3, stage);
    this.message = null;
    this.cont = null;
    this.index = index;
    this.key = key;
  }

  @Override
  protected void beginPhase(int phase) {
    if (phase == 2) {
      this.model.state.remove(this.index, this.key);
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
  protected boolean runPhase(ListDownlinkView<?> view, int phase, boolean preemptive) {
    if (phase == 0) {
      if (preemptive) {
        view.downlinkWillReceive(this.message);
      }
      return view.dispatchWillReceive(this.message.body(), preemptive);
    } else if (phase == 1) {
      view.downlinkWillRemoveValue(this.index);
      final Form<Object> valueForm = (Form<Object>) view.valueForm;
      this.valueForm = valueForm;
      final Map.Entry<Object, Value> entry = this.model.state.getEntry(this.index, this.key);
      if (entry != null) {
        this.oldValue = entry.getValue();
        this.key = entry.getKey();
        this.oldObject = valueForm.cast(this.oldValue);
      }
      if (this.oldObject == null) {
        this.oldObject = valueForm.unit();
      }
      if (preemptive) {
        view.downlinkWillRemove(this.index);
      }
      return view.dispatchWillRemove(this.index, preemptive);
    } else if (phase == 2) {
      view.downlinkDidRemoveValue(this.index, this.oldValue);
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
        ((ListDownlinkView<Object>) view).downlinkDidRemove(this.index, this.oldObject);
      }
      return ((ListDownlinkView<Object>) view).dispatchDidRemove(this.index, this.oldObject, preemptive);
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
      this.model.pushUp(ListLinkDelta.remove(this.index, Value.fromObject(this.key)));
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

final class ListDownlinkRelayDrop extends DownlinkRelay<ListDownlinkModel, ListDownlinkView<?>> {

  final EventMessage message;
  final Cont<EventMessage> cont;
  final int lower;

  ListDownlinkRelayDrop(ListDownlinkModel model, EventMessage message, Cont<EventMessage> cont, int lower) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.lower = lower;
  }

  ListDownlinkRelayDrop(ListDownlinkModel model, Stage stage, int lower) {
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
  protected boolean runPhase(ListDownlinkView<?> view, int phase, boolean preemptive) {
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
      this.model.pushUp(ListLinkDelta.drop(this.lower));
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

final class ListDownlinkRelayTake extends DownlinkRelay<ListDownlinkModel, ListDownlinkView<?>> {

  final EventMessage message;
  final Cont<EventMessage> cont;
  final int upper;

  ListDownlinkRelayTake(ListDownlinkModel model, EventMessage message, Cont<EventMessage> cont, int upper) {
    super(model, 4);
    this.message = message;
    this.cont = cont;
    this.upper = upper;
  }

  ListDownlinkRelayTake(ListDownlinkModel model, Stage stage, int upper) {
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
  protected boolean runPhase(ListDownlinkView<?> view, int phase, boolean preemptive) {
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
      this.model.pushUp(ListLinkDelta.drop(this.upper));
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

final class ListDownlinkRelayClear extends DownlinkRelay<ListDownlinkModel, ListDownlinkView<?>> {

  final EventMessage message;
  final Cont<EventMessage> cont;

  ListDownlinkRelayClear(ListDownlinkModel model, EventMessage message, Cont<EventMessage> cont) {
    super(model, 0, 3, null);
    this.message = message;
    this.cont = cont;
  }

  ListDownlinkRelayClear(ListDownlinkModel model, Stage stage) {
    super(model, 3, 4, stage);
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
  protected boolean runPhase(ListDownlinkView<?> view, int phase, boolean preemptive) {
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
      this.model.pushUp(ListLinkDelta.clear());
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
