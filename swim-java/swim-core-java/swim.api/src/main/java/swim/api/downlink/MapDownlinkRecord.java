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

import java.util.Iterator;
import java.util.Map;
import swim.observable.function.DidClear;
import swim.observable.function.DidDrop;
import swim.observable.function.DidRemoveKey;
import swim.observable.function.DidTake;
import swim.observable.function.DidUpdateKey;
import swim.streamlet.KeyEffect;
import swim.structure.Item;
import swim.structure.Slot;
import swim.structure.Text;
import swim.structure.Value;

public class MapDownlinkRecord extends DownlinkRecord
    implements DidUpdateKey<Value, Value>, DidRemoveKey<Value, Value>,
               DidDrop, DidTake, DidClear {

  protected final MapDownlink<Value, Value> downlink;

  public MapDownlinkRecord(MapDownlink<Value, Value> downlink) {
    this.downlink = downlink;
    this.downlink.observe(this);
  }

  @Override
  public MapDownlink<Value, Value> downlink() {
    return this.downlink;
  }

  @Override
  public boolean isEmpty() {
    return this.downlink.isEmpty();
  }

  @Override
  public boolean isArray() {
    return this.downlink.isEmpty();
  }

  @Override
  public boolean isObject() {
    return true;
  }

  @Override
  public int size() {
    return this.downlink.size();
  }

  @Override
  public boolean containsKey(Value key) {
    return this.downlink.containsKey(key);
  }

  @Override
  public boolean containsKey(String key) {
    return this.downlink.containsKey(Text.from(key));
  }

  @Override
  public Value get(Value key) {
    return this.downlink.get(key);
  }

  @Override
  public Value get(String key) {
    return this.downlink.get(key);
  }

  @Override
  public Value getAttr(Text key) {
    return Value.absent();
  }

  @Override
  public Value getAttr(String key) {
    return Value.absent();
  }

  @Override
  public Value getSlot(Value key) {
    return get(key);
  }

  @Override
  public Value getSlot(String key) {
    return get(key);
  }

  @Override
  public Item get(int index) {
    final Map.Entry<Value, Value> entry = this.downlink.getEntry(index);
    if (entry != null) {
      return Slot.of(entry.getKey(), entry.getValue());
    } else {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
  }

  @Override
  public Item getItem(int index) {
    final Map.Entry<Value, Value> entry = this.downlink.getEntry(index);
    if (entry != null) {
      return Slot.of(entry.getKey(), entry.getValue());
    } else {
      return Item.absent();
    }
  }

  @Override
  public Value put(Value key, Value newValue) {
    return this.downlink.put(key, newValue);
  }

  @Override
  public Value put(String key, Value newValue) {
    return this.downlink.put(Text.from(key), newValue);
  }

  @Override
  public Value putAttr(Text key, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value putAttr(String key, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value putSlot(Value key, Value newValue) {
    return put(key, newValue);
  }

  @Override
  public Value putSlot(String key, Value newValue) {
    return put(key, newValue);
  }

  @Override
  public Item setItem(int index, Item newItem) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean add(Item item) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void add(int index, Item item) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Item remove(int index) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeKey(Value key) {
    return this.downlink.remove(key) != null;
  }

  @Override
  public boolean removeKey(String key) {
    return this.downlink.remove(Text.from(key)) != null;
  }

  @Override
  public void clear() {
    this.downlink.clear();
  }

  @Override
  public Iterator<Value> keyIterator() {
    return this.downlink.keyIterator();
  }

  @Override
  public void didUpdate(Value key, Value newValue, Value oldValue) {
    this.invalidateInputKey(key, KeyEffect.UPDATE);
    this.reconcileInput(0); // TODO: debounce
  }

  @Override
  public void didRemove(Value key, Value oldValue) {
    this.invalidateInputKey(key, KeyEffect.REMOVE);
    this.reconcileInput(0); // TODO: debounce
  }

  @Override
  public void didDrop(int lower) {
    // TODO
  }

  @Override
  public void didTake(int upper) {
    // TODO
  }

  @Override
  public void didClear() {
    // TODO
  }
}
