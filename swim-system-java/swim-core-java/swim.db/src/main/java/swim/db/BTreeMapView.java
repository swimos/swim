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

package swim.db;

import java.util.Comparator;
import java.util.Map;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.structure.Form;
import swim.structure.Slot;
import swim.structure.Value;
import swim.structure.collections.ValueMap;
import swim.util.Cursor;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;

public class BTreeMapView implements OrderedMap<Value, Value> {
  protected final BTree tree;

  public BTreeMapView(BTree tree) {
    this.tree = tree;
  }

  public BTree tree() {
    return this.tree;
  }

  public void loadAsync(Cont<BTreeMapView> future) {
    try {
      final Cont<Tree> andThen = Conts.constant(future, this);
      this.tree.loadAsync(andThen);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        future.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public BTreeMapView load() throws InterruptedException {
    this.tree.load();
    return this;
  }

  public boolean isResident() {
    return this.tree.isResident();
  }

  public boolean isTransient() {
    return this.tree.isTransient();
  }

  public <K> ValueMap<K, Value> keyForm(Form<K> keyForm) {
    return new ValueMap<K, Value>(this, keyForm, Form.forValue());
  }

  public <K> ValueMap<K, Value> keyClass(Class<K> keyClass) {
    return keyForm(Form.<K>forClass(keyClass));
  }

  public <V> ValueMap<Value, V> valueForm(Form<V> valueForm) {
    return new ValueMap<Value, V>(this, Form.forValue(), valueForm);
  }

  public <V> ValueMap<Value, V> valueClass(Class<V> valueClass) {
    return valueForm(Form.<V>forClass(valueClass));
  }

  @Override
  public boolean isEmpty() {
    return this.tree.isEmpty();
  }

  @Override
  public int size() {
    return (int) this.tree.span();
  }

  @Override
  public boolean containsKey(Object key) {
    if (key instanceof Value) {
      return this.tree.containsKey((Value) key);
    }
    return false;
  }

  @Override
  public boolean containsValue(Object value) {
    if (value instanceof Value) {
      return this.tree.containsValue((Value) value);
    }
    return false;
  }

  @Override
  public int indexOf(Object key) {
    if (key instanceof Value) {
      return (int) this.tree.indexOf((Value) key);
    }
    throw new IllegalArgumentException(key.toString());
  }

  @Override
  public Value get(Object key) {
    if (key instanceof Value) {
      return this.tree.get((Value) key);
    }
    return Value.absent();
  }

  @Override
  public Slot getEntry(Object key) {
    if (key instanceof Value) {
      return this.tree.getEntry((Value) key);
    }
    return null;
  }

  @Override
  public Slot getIndex(int index) {
    return this.tree.getIndex((long) index);
  }

  @Override
  public Slot firstEntry() {
    return this.tree.firstEntry();
  }

  @Override
  public Value firstKey() {
    return this.tree.firstKey();
  }

  @Override
  public Value firstValue() {
    return this.tree.firstValue();
  }

  @Override
  public Slot lastEntry() {
    return this.tree.lastEntry();
  }

  @Override
  public Value lastKey() {
    return this.tree.lastKey();
  }

  @Override
  public Value lastValue() {
    return this.tree.lastValue();
  }

  @Override
  public Slot nextEntry(Value key) {
    return this.tree.nextEntry(key);
  }

  @Override
  public Value nextKey(Value key) {
    return this.tree.nextKey(key);
  }

  @Override
  public Value nextValue(Value key) {
    return this.tree.nextValue(key);
  }

  @Override
  public Slot previousEntry(Value key) {
    return this.tree.previousEntry(key);
  }

  @Override
  public Value previousKey(Value key) {
    return this.tree.previousKey(key);
  }

  @Override
  public Value previousValue(Value key) {
    return this.tree.previousValue(key);
  }

  @Override
  public Value put(Value key, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void putAll(Map<? extends Value, ? extends Value> map) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value remove(Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public OrderedMapCursor<Value, Value> iterator() {
    return this.tree.cursor();
  }

  public Cursor<Value> keyIterator() {
    return Cursor.keys(this.tree.cursor());
  }

  public Cursor<Value> valueIterator() {
    return Cursor.values(this.tree.cursor());
  }

  public Cursor<Value> depthValueIterator(int maxDepth) {
    return Cursor.values(this.tree.depthCursor(maxDepth));
  }

  @Override
  public Comparator<? super Value> comparator() {
    return null;
  }
}
