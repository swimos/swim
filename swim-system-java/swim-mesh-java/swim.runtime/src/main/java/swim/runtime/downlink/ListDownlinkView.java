// Copyright 2015-2020 SWIM.AI inc.
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

import swim.api.DownlinkException;
import swim.api.downlink.ListDownlink;
import swim.api.function.DidClose;
import swim.api.function.DidConnect;
import swim.api.function.DidDisconnect;
import swim.api.function.DidFail;
import swim.api.warp.function.DidLink;
import swim.api.warp.function.DidReceive;
import swim.api.warp.function.DidSync;
import swim.api.warp.function.DidUnlink;
import swim.api.warp.function.WillCommand;
import swim.api.warp.function.WillLink;
import swim.api.warp.function.WillReceive;
import swim.api.warp.function.WillSync;
import swim.api.warp.function.WillUnlink;
import swim.concurrent.Stage;
import swim.observable.Observer;
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
import swim.runtime.CellContext;
import swim.runtime.LinkBinding;
import swim.runtime.observer.LaneObserver;
import swim.runtime.warp.WarpDownlinkView;
import swim.structure.Form;
import swim.structure.Value;
import swim.structure.collections.ValueIterator;
import swim.structure.collections.ValueList;
import swim.structure.collections.ValueListIterator;
import swim.uri.Uri;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;
import java.util.Map;

public class ListDownlinkView<V> extends WarpDownlinkView implements ListDownlink<V> {

  protected static final int STATEFUL = 1 << 2;
  protected final Form<V> valueForm;
  protected ListDownlinkModel model;

  public ListDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                          Uri hostUri, Uri nodeUri, Uri laneUri, float prio, float rate, Value body,
                          int flags, Form<V> valueForm, LaneObserver observers) {
    super(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate,
        body, flags, observers);
    this.valueForm = valueForm;
  }

  public ListDownlinkView(CellContext cellContext, Stage stage, Uri meshUri,
                          Uri hostUri, Uri nodeUri, Uri laneUri, float prio, float rate,
                          Value body, Form<V> valueForm) {
    this(cellContext, stage, meshUri, hostUri, nodeUri, laneUri, prio, rate,
        body, KEEP_LINKED | KEEP_SYNCED | STATEFUL, valueForm, null);
  }

  @Override
  public ListDownlinkModel downlinkModel() {
    return this.model;
  }

  @Override
  public ListDownlinkView<V> hostUri(Uri hostUri) {
    return new ListDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
        hostUri, this.nodeUri, this.laneUri, this.prio,
        this.rate, this.body, this.flags, this.valueForm,
        this.observers);
  }

  @Override
  public ListDownlinkView<V> hostUri(String hostUri) {
    return hostUri(Uri.parse(hostUri));
  }

  @Override
  public ListDownlinkView<V> nodeUri(Uri nodeUri) {
    return new ListDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
        this.hostUri, nodeUri, this.laneUri, this.prio,
        this.rate, this.body, this.flags, this.valueForm,
        this.observers);
  }

  @Override
  public ListDownlinkView<V> nodeUri(String nodeUri) {
    return nodeUri(Uri.parse(nodeUri));
  }

  @Override
  public ListDownlinkView<V> laneUri(Uri laneUri) {
    return new ListDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
        this.hostUri, this.nodeUri, laneUri, this.prio,
        this.rate, this.body, this.flags, this.valueForm,
        this.observers);
  }

  @Override
  public ListDownlinkView<V> laneUri(String laneUri) {
    return laneUri(Uri.parse(laneUri));
  }

  @Override
  public ListDownlinkView<V> prio(float prio) {
    return new ListDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
        this.hostUri, this.nodeUri, this.laneUri, prio,
        this.rate, this.body, this.flags, this.valueForm,
        this.observers);
  }

  @Override
  public ListDownlinkView<V> rate(float rate) {
    return new ListDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
        this.hostUri, this.nodeUri, this.laneUri, this.prio,
        rate, this.body, this.flags, this.valueForm,
        this.observers);
  }

  @Override
  public ListDownlinkView<V> body(Value body) {
    return new ListDownlinkView<V>(this.cellContext, this.stage, this.meshUri,
        this.hostUri, this.nodeUri, this.laneUri, this.prio,
        this.rate, body, this.flags, this.valueForm,
        this.observers);
  }

  @Override
  public ListDownlinkView<V> keepLinked(boolean keepLinked) {
    if (keepLinked) {
      this.flags |= KEEP_LINKED;
    } else {
      this.flags &= ~KEEP_LINKED;
    }
    return this;
  }

  @Override
  public ListDownlinkView<V> keepSynced(boolean keepSynced) {
    if (keepSynced) {
      this.flags |= KEEP_SYNCED;
    } else {
      this.flags &= ~KEEP_SYNCED;
    }
    return this;
  }

  @Override
  public final boolean isStateful() {
    return (this.flags & STATEFUL) != 0;
  }

  @Override
  public ListDownlinkView<V> isStateful(boolean isStateful) {
    if (isStateful) {
      this.flags |= STATEFUL;
    } else {
      this.flags &= ~STATEFUL;
    }
    final ListDownlinkModel model = this.model;
    if (model != null) {
      model.isStateful(isStateful);
    }
    return this;
  }

  void didSetStateful(boolean isStateful) {
    if (isStateful) {
      this.flags |= STATEFUL;
    } else {
      this.flags &= ~STATEFUL;
    }
  }

  @Override
  public final Form<V> valueForm() {
    return this.valueForm;
  }

  @Override
  public <V2> ListDownlinkView<V2> valueForm(Form<V2> valueForm) {
    return new ListDownlinkView<V2>(this.cellContext, this.stage, this.meshUri,
        this.hostUri, this.nodeUri, this.laneUri, this.prio,
        this.rate, this.body, this.flags, valueForm,
        typesafeObservers(this.observers));
  }

  @Override
  public <V2> ListDownlinkView<V2> valueClass(Class<V2> valueClass) {
    return valueForm(Form.<V2>forClass(valueClass));
  }

  protected LaneObserver typesafeObservers(LaneObserver observers) {
    // TODO: filter out WillUpdateIndex, DidUpdateIndex,
    //       WillMoveIndex, DidMoveIndex, WillRemoveIndex, DidRemoveIndex,
    //       WillDrop, DidDrop, WillTake, DidTake, WillClear, DidClear
    return observers;
  }

  @SuppressWarnings("unchecked")
  @Override
  public ListDownlinkView<V> observe(Observer observer) {
    return (ListDownlinkView<V>) super.observe(observer);
  }

  @SuppressWarnings("unchecked")
  @Override
  public ListDownlinkView<V> unobserve(Observer observer) {
    return (ListDownlinkView<V>) super.unobserve(observer);
  }

  @Override
  public ListDownlink<V> willMove(WillMoveIndex<V> willMove) {
    return observe(willMove);
  }

  @Override
  public ListDownlink<V> didMove(DidMoveIndex<V> didMove) {
    return observe(didMove);
  }

  @Override
  public ListDownlinkView<V> willUpdate(WillUpdateIndex<V> willUpdate) {
    return observe(willUpdate);
  }

  @Override
  public ListDownlinkView<V> didUpdate(DidUpdateIndex<V> didUpdate) {
    return observe(didUpdate);
  }

  @Override
  public ListDownlinkView<V> willRemove(WillRemoveIndex willRemove) {
    return observe(willRemove);
  }

  @Override
  public ListDownlinkView<V> didRemove(DidRemoveIndex<V> didRemove) {
    return observe(didRemove);
  }

  @Override
  public ListDownlinkView<V> willDrop(WillDrop willDrop) {
    return observe(willDrop);
  }

  @Override
  public ListDownlinkView<V> didDrop(DidDrop didDrop) {
    return observe(didDrop);
  }

  @Override
  public ListDownlinkView<V> willTake(WillTake willTake) {
    return observe(willTake);
  }

  @Override
  public ListDownlinkView<V> didTake(DidTake didTake) {
    return observe(didTake);
  }

  @Override
  public ListDownlinkView<V> willClear(WillClear willClear) {
    return observe(willClear);
  }

  @Override
  public ListDownlinkView<V> didClear(DidClear didClear) {
    return observe(didClear);
  }

  @Override
  public ListDownlinkView<V> willReceive(WillReceive willReceive) {
    return observe(willReceive);
  }

  @Override
  public ListDownlinkView<V> didReceive(DidReceive didReceive) {
    return observe(didReceive);
  }

  @Override
  public ListDownlinkView<V> willCommand(WillCommand willCommand) {
    return observe(willCommand);
  }

  @Override
  public ListDownlinkView<V> willLink(WillLink willLink) {
    return observe(willLink);
  }

  @Override
  public ListDownlinkView<V> didLink(DidLink didLink) {
    return observe(didLink);
  }

  @Override
  public ListDownlinkView<V> willSync(WillSync willSync) {
    return observe(willSync);
  }

  @Override
  public ListDownlinkView<V> didSync(DidSync didSync) {
    return observe(didSync);
  }

  @Override
  public ListDownlinkView<V> willUnlink(WillUnlink willUnlink) {
    return observe(willUnlink);
  }

  @Override
  public ListDownlinkView<V> didUnlink(DidUnlink didUnlink) {
    return observe(didUnlink);
  }

  @Override
  public ListDownlinkView<V> didConnect(DidConnect didConnect) {
    return observe(didConnect);
  }

  @Override
  public ListDownlinkView<V> didDisconnect(DidDisconnect didDisconnect) {
    return observe(didDisconnect);
  }

  @Override
  public ListDownlinkView<V> didClose(DidClose didClose) {
    return observe(didClose);
  }

  @Override
  public ListDownlinkView<V> didFail(DidFail didFail) {
    return observe(didFail);
  }

  public Map.Entry<Boolean, V> dispatchWillUpdate(int index, V newValue, boolean preemptive) {
    return this.observers.dispatchWillUpdateIndex(this, index, newValue, preemptive);
  }

  public boolean dispatchDidUpdate(int index, V newValue, V oldValue, boolean preemptive) {
    return this.observers.dispatchDidUpdateIndex(this, index, newValue, oldValue, preemptive);
  }

  public boolean dispatchWillMove(int fromIndex, int toIndex, V value, boolean preemptive) {
    return this.observers.dispatchWillMoveIndex(this, fromIndex, toIndex, value, preemptive);
  }

  public boolean dispatchDidMove(int fromIndex, int toIndex, V value, boolean preemptive) {
    return this.observers.dispatchDidMoveIndex(this, fromIndex, toIndex, value, preemptive);
  }

  public boolean dispatchWillRemove(int index, boolean preemptive) {
    return this.observers.dispatchWillRemoveIndex(this, index, preemptive);
  }

  public boolean dispatchDidRemove(int index, V oldValue, boolean preemptive) {
    return this.observers.dispatchDidRemoveIndex(this, index, oldValue, preemptive);
  }

  public boolean dispatchWillDrop(int lower, boolean preemptive) {
    return this.observers.dispatchWillDrop(this, preemptive, lower);
  }

  public boolean dispatchDidDrop(int lower, boolean preemptive) {
    return this.observers.dispatchDidDrop(this, preemptive, lower);
  }

  public boolean dispatchWillTake(int upper, boolean preemptive) {
    return this.observers.dispatchWillTake(this, preemptive, upper);
  }

  public boolean dispatchDidTake(int upper, boolean preemptive) {
    return this.observers.dispatchDidTake(this, preemptive, upper);
  }

  public boolean dispatchWillClear(boolean preemptive) {
    return this.observers.dispatchWillClear(this, preemptive);
  }

  public boolean dispatchDidClear(boolean preemptive) {
    return this.observers.dispatchDidClear(this, preemptive);
  }

  public Value downlinkWillInsertValue(int index, Value newValue) {
    return newValue;
  }

  public void downlinkDidInsertValue(int index, Value newValue) {
  }

  public V downlinkWillInsert(int index, V newValue) {
    return newValue;
  }

  public void downlinkDidInsert(int index, V newValue) {
  }

  public Value downlinkWillUpdateValue(int index, Value newValue) {
    return newValue;
  }

  public void downlinkDidUpdateValue(int index, Value newValue, Value oldValue) {
  }

  public V downlinkWillUpdate(int index, V newValue) {
    return newValue;
  }

  public void downlinkDidUpdate(int index, V newValue, V oldValue) {
  }

  public void downlinkWillMoveValue(int fromIndex, int toIndex, Value value) {
  }

  public void downlinkDidMoveValue(int fromIndex, int toIndex, Value value) {
  }

  public void downlinkWillMove(int fromIndex, int toIndex, V value) {
  }

  public void downlinkDidMove(int fromIndex, int toIndex, V value) {
  }

  public void downlinkWillRemoveValue(int index) {
  }

  public void downlinkDidRemoveValue(int index, Value oldValue) {
  }

  public void downlinkWillRemove(int index) {
  }

  public void downlinkDidRemove(int index, V oldValue) {
  }

  public void downlinkWillDrop(int lower) {
  }

  public void downlinkDidDrop(int lower) {
  }

  public void downlinkWillTake(int upper) {
  }

  public void downlinkDidTake(int upper) {
  }

  public void downlinkWillClear() {
  }

  public void downlinkDidClear() {
  }

  @Override
  public ListDownlinkModel createDownlinkModel() {
    return new ListDownlinkModel(this.meshUri, this.hostUri, this.nodeUri,
        this.laneUri, this.prio, this.rate, this.body);
  }

  @Override
  public ListDownlinkView<V> open() {
    if (this.model == null) {
      final LinkBinding linkBinding = this.cellContext.bindDownlink(this);
      if (linkBinding instanceof ListDownlinkModel) {
        this.model = (ListDownlinkModel) linkBinding;
        this.model.addDownlink(this);
      } else {
        throw new DownlinkException("downlink type mismatch");
      }
    }
    return this;
  }

  @Override
  public boolean isEmpty() {
    return this.model.isEmpty();
  }

  @Override
  public boolean contains(Object o) {
    return this.model.contains(o);
  }

  @Override
  public int size() {
    return this.model.size();
  }

  @SuppressWarnings("unchecked")
  @Override
  public V get(int index) {
    return get(index, null);
  }

  @Override
  public V set(int index, V element) {
    return this.model.set(this, index, element);
  }

  @Override
  public void add(int index, V element) {
    this.model.add(this, index, element);
  }

  @SuppressWarnings("unchecked")
  @Override
  public V remove(int index) {
    return this.model.remove(this, index);
  }

  @Override
  public int indexOf(Object o) {
    return this.model.indexOf(o);
  }

  @Override
  public int lastIndexOf(Object o) {
    return this.model.lastIndexOf(o);
  }

  @SuppressWarnings("unchecked")
  @Override
  public ListIterator<V> listIterator() {
    if (this.valueForm != Form.forValue()) {
      return new ValueListIterator<V>(this.model.listIterator(), this.valueForm);
    } else {
      return (ListIterator<V>) this.model.listIterator();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public ListIterator<V> listIterator(int index) {
    if (this.valueForm != Form.forValue()) {
      return new ValueListIterator<V>(this.model.listIterator(index), this.valueForm);
    } else {
      return (ListIterator<V>) this.model.listIterator(index);
    }
  }

  @Override
  public List<V> subList(int fromIndex, int toIndex) {
    return new ValueList<V>(this.model.subList(fromIndex, toIndex), this.valueForm);
  }

  @Override
  public void drop(int lower) {
    this.model.drop(this, lower);
  }

  @Override
  public void take(int upper) {
    this.model.take(this, upper);
  }

  @Override
  public void clear() {
    this.model.clear(this);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Iterator<V> iterator() {
    if (this.valueForm != Form.forValue()) {
      return new ValueIterator<V>(this.model.iterator(), this.valueForm);
    } else {
      return (Iterator<V>) this.model.iterator();
    }
  }

  @Override
  public Object[] toArray() {
    return this.model.toArray();
  }

  @Override
  public <T> T[] toArray(T[] a) {
    return this.model.toArray(a);
  }

  @Override
  public boolean add(V v) {
    return this.model.add(this, size(), v);
  }

  @Override
  public boolean remove(Object o) {
    final int index = indexOf(o);
    if (index != -1) {
      final V oldObject = this.model.remove(this, index);
      return oldObject != null && oldObject != this.valueForm.unit(); // TODO?
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> elements) {
    for (Object element : elements) {
      if (!contains(element)) {
        return false;
      }
    }
    return true;
  }

  @Override
  public boolean addAll(Collection<? extends V> elements) {
    boolean added = false;
    for (V element : elements) {
      added = added || add(element);
    }
    return added;
  }

  @Override
  public boolean addAll(int index, Collection<? extends V> elements) {
    for (V element : elements) {
      add(index, element);
    }
    return elements.isEmpty();
  }

  @Override
  public boolean removeAll(Collection<?> elements) {
    boolean removed = false;
    for (Object element : elements) {
      removed = removed || remove(element);
    }
    return removed;
  }

  @Override
  public boolean retainAll(Collection<?> elements) {
    boolean modified = false;
    for (Object element : elements) {
      if (!elements.contains(element)) {
        modified = modified || remove(element);
      }
    }
    return modified;
  }

  @Override
  public V get(int index, Object key) {
    final Value value = this.model.get(index, key);
    final V object = this.valueForm.cast(value);
    if (object != null) {
      return object;
    } else {
      return this.valueForm.unit();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Map.Entry<Object, V> getEntry(int index) {
    if (this.valueForm != Form.forValue()) {
      return new ListDownlinkViewEntry<V>(this.model.getEntry(index), this.valueForm);
    } else {
      return (Map.Entry<Object, V>) this.model.getEntry(index);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public Map.Entry<Object, V> getEntry(int index, Object key) {
    if (this.valueForm != Form.forValue()) {
      return new ListDownlinkViewEntry<V>(this.model.getEntry(index, key), this.valueForm);
    } else {
      return (Map.Entry<Object, V>) this.model.getEntry(index, key);
    }
  }

  @Override
  public V set(int index, V element, Object key) {
    return this.model.set(this, index, element, key);
  }

  @Override
  public boolean add(V element, Object key) {
    return this.model.add(this, size(), element, key);
  }

  @Override
  public void add(int index, V element, Object key) {
    this.model.add(this, index, element, key);
  }

  @Override
  public V remove(int index, Object key) {
    return this.model.remove(this, index, key);
  }

  @Override
  public void move(int fromIndex, int toIndex) {
    this.model.move(this, fromIndex, toIndex, null);
  }

  @Override
  public void move(int fromIndex, int toIndex, Object key) {
    this.model.move(this, fromIndex, toIndex, key);
  }

  @Override
  public ListIterator<Object> keyIterator() {
    return this.model.keyIterator();
  }

  @Override
  public ListIterator<Map.Entry<Object, V>> entryIterator() {
    return new ListDownlinkViewEntryIterator<V>(this.model.entryIterator(), this.valueForm);
  }

}

final class ListDownlinkViewEntry<V> implements Map.Entry<Object, V> {

  final Map.Entry<Object, Value> entry;
  final Form<V> valueForm;

  ListDownlinkViewEntry(Map.Entry<Object, Value> entry, Form<V> valueForm) {
    this.entry = entry;
    this.valueForm = valueForm;
  }

  @Override
  public Object getKey() {
    return this.entry.getKey();
  }

  @Override
  public V getValue() {
    return this.valueForm.cast(this.entry.getValue());
  }

  @Override
  public V setValue(V value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map.Entry<?, ?>) {
      final Map.Entry<?, ?> that = (Map.Entry<?, ?>) other;
      final Object key = getKey();
      if (key == null ? that.getKey() != null : !key.equals(that.getKey())) {
        return false;
      }
      final V value = getValue();
      if (value == null ? that.getValue() != null : !value.equals(that.getValue())) {
        return false;
      }
      return true;
    }
    return false;
  }

  @Override
  public int hashCode() {
    final Object key = getKey();
    final V value = getValue();
    return (key == null ? 0 : key.hashCode())
        ^ (value == null ? 0 : value.hashCode());
  }

  @Override
  public String toString() {
    return new StringBuilder().append(getKey()).append('=').append(getValue()).toString();
  }

}

final class ListDownlinkViewEntryIterator<V> implements ListIterator<Map.Entry<Object, V>> {

  private final ListIterator<Map.Entry<Object, Value>> iterator;
  private final Form<V> valueForm;

  ListDownlinkViewEntryIterator(ListIterator<Map.Entry<Object, Value>> iterator, Form<V> valueForm) {
    this.iterator = iterator;
    this.valueForm = valueForm;
  }

  @Override
  public boolean hasNext() {
    return this.iterator.hasNext();
  }

  @Override
  public int nextIndex() {
    return this.iterator.nextIndex();
  }

  @Override
  public Map.Entry<Object, V> next() {
    return new ListDownlinkViewEntry<V>(this.iterator.next(), this.valueForm);
  }

  @Override
  public boolean hasPrevious() {
    return this.iterator.hasPrevious();
  }

  @Override
  public int previousIndex() {
    return this.iterator.previousIndex();
  }

  @Override
  public Map.Entry<Object, V> previous() {
    return new ListDownlinkViewEntry<V>(this.iterator.previous(), this.valueForm);
  }

  @Override
  public void remove() {
    this.iterator.remove();
  }

  @Override
  public void set(Map.Entry<Object, V> entry) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void add(Map.Entry<Object, V> entry) {
    throw new UnsupportedOperationException();
  }

}
