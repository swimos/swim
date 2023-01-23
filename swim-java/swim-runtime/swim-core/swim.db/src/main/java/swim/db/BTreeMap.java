// Copyright 2015-2023 Swim.inc
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
import swim.structure.Form;
import swim.structure.Slot;
import swim.structure.Value;
import swim.structure.collections.ValueMap;
import swim.util.CombinerFunction;
import swim.util.Cursor;
import swim.util.OrderedMap;
import swim.util.OrderedMapCursor;
import swim.util.ReducedMap;

public class BTreeMap implements OrderedMap<Value, Value>, ReducedMap<Value, Value, Value> {

  final Trunk<BTree> trunk;

  public BTreeMap(Trunk<BTree> trunk) {
    this.trunk = trunk;
  }

  public final Trunk<BTree> trunk() {
    return this.trunk;
  }

  public final StoreSettings settings() {
    return this.trunk.settings();
  }

  public final Database database() {
    return this.trunk.database;
  }

  public final Value name() {
    return this.trunk.name;
  }

  public final BTree tree() {
    return (BTree) Trunk.TREE.get(this.trunk);
  }

  public final TreeDelegate treeDelegate() {
    return this.tree().treeDelegate();
  }

  public void setTreeDelegate(TreeDelegate treeDelegate) {
    this.tree().setTreeDelegate(treeDelegate);
  }

  public boolean isResident() {
    return this.tree().isResident();
  }

  public BTreeMap isResident(boolean isResident) {
    do {
      final long newVersion = this.trunk.version();
      final BTree oldTree = this.tree();
      final BTree newTree = oldTree.isResident(isResident);
      if (oldTree != newTree) {
        if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
  }

  public boolean isTransient() {
    return this.tree().isTransient();
  }

  public BTreeMap isTransient(boolean isTransient) {
    do {
      final long newVersion = this.trunk.version();
      final BTree oldTree = this.tree();
      final BTree newTree = oldTree.isTransient(isTransient);
      if (oldTree != newTree) {
        if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
          break;
        }
      } else {
        break;
      }
    } while (true);
    return this;
  }

  public <K> ValueMap<K, Value> keyForm(Form<K> keyForm) {
    return new ValueMap<K, Value>(this, keyForm, Form.forValue());
  }

  public <K> ValueMap<K, Value> keyClass(Class<K> keyClass) {
    return this.keyForm(Form.<K>forClass(keyClass));
  }

  public <V> ValueMap<Value, V> valueForm(Form<V> valueForm) {
    return new ValueMap<Value, V>(this, Form.forValue(), valueForm);
  }

  public <V> ValueMap<Value, V> valueClass(Class<V> valueClass) {
    return this.valueForm(Form.<V>forClass(valueClass));
  }

  public BTreeMapView snapshot() {
    return new BTreeMapView(this.tree());
  }

  @Override
  public boolean isEmpty() {
    return this.tree().isEmpty();
  }

  @Override
  public int size() {
    return (int) this.tree().span();
  }

  public long span() {
    return this.tree().span();
  }

  public long treeSize() {
    return this.tree().treeSize();
  }

  @Override
  public boolean containsKey(Object key) {
    if (key instanceof Value) {
      return this.containsKey((Value) key);
    }
    return false;
  }

  private boolean containsKey(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().containsKey(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean containsValue(Object value) {
    if (value instanceof Value) {
      return this.containsValue((Value) value);
    }
    return false;
  }

  private boolean containsValue(Value value) {
    int retries = 0;
    do {
      try {
        return this.tree().containsValue(value);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public int indexOf(Object key) {
    if (key instanceof Value) {
      return (int) this.indexOf((Value) key);
    }
    throw new IllegalArgumentException(key.toString());
  }

  private long indexOf(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().indexOf(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value get(Object key) {
    if (key instanceof Value) {
      return this.get((Value) key);
    }
    return Value.absent();
  }

  private Value get(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().get(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Slot getEntry(Object key) {
    if (key instanceof Value) {
      return this.getEntry((Value) key);
    }
    return null;
  }

  private Slot getEntry(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().getEntry(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Slot getIndex(int index) {
    return this.getIndex((long) index);
  }

  public Slot getIndex(long index) {
    int retries = 0;
    do {
      try {
        return this.tree().getIndex(index);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Slot firstEntry() {
    int retries = 0;
    do {
      try {
        return this.tree().firstEntry();
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value firstKey() {
    int retries = 0;
    do {
      try {
        return this.tree().firstKey();
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value firstValue() {
    int retries = 0;
    do {
      try {
        return this.tree().firstValue();
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Slot lastEntry() {
    int retries = 0;
    do {
      try {
        return this.tree().lastEntry();
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value lastKey() {
    int retries = 0;
    do {
      try {
        return this.tree().lastKey();
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value lastValue() {
    int retries = 0;
    do {
      try {
        return this.tree().lastValue();
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Slot nextEntry(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().nextEntry(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value nextKey(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().nextKey(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value nextValue(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().nextValue(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Slot previousEntry(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().previousEntry(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value previousKey(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().previousKey(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value previousValue(Value key) {
    int retries = 0;
    do {
      try {
        return this.tree().previousValue(key);
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value put(Value key, Value newValue) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final BTree oldTree = this.tree();
        final BTree newTree = oldTree.updated(key, newValue, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final Value oldValue = oldTree.get(key);
            final TreeContext treeContext = newTree.treeContext();
            treeContext.btreeDidUpdate(newTree, oldTree, key, newValue, oldValue);
            treeContext.treeDidChange(newTree, oldTree);
            return oldValue;
          }
        } else {
          return oldTree.get(key);
        }
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public void putAll(Map<? extends Value, ? extends Value> map) {
    for (Entry<? extends Value, ? extends Value> entry : map.entrySet()) {
      this.put(entry.getKey(), entry.getValue());
    }
  }

  @Override
  public Value remove(Object key) {
    if (key instanceof Value) {
      return this.remove((Value) key);
    }
    return Value.absent();
  }

  private Value remove(Value key) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final BTree oldTree = this.tree();
        final BTree newTree = oldTree.removed(key, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final Value oldValue = oldTree.get(key);
            final TreeContext treeContext = newTree.treeContext();
            treeContext.btreeDidRemove(newTree, oldTree, key, oldValue);
            treeContext.treeDidChange(newTree, oldTree);
            return oldValue;
          }
        } else {
          return Value.absent();
        }
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  public void drop(int lower) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final BTree oldTree = this.tree();
        final BTree newTree = oldTree.drop(lower, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            treeContext.btreeDidDrop(newTree, oldTree, lower);
            treeContext.treeDidChange(newTree, oldTree);
            return;
          }
        } else {
          return;
        }
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  public void take(int upper) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final BTree oldTree = this.tree();
        final BTree newTree = oldTree.take(upper, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            treeContext.btreeDidTake(newTree, oldTree, upper);
            treeContext.treeDidChange(newTree, oldTree);
            return;
          }
        } else {
          return;
        }
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public void clear() {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      try {
        final BTree oldTree = this.tree();
        final BTree newTree = oldTree.cleared(newVersion);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            treeContext.treeDidClear(newTree, oldTree);
            treeContext.treeDidChange(newTree, oldTree);
            return;
          }
        } else {
          return;
        }
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value reduced(Value identity, CombinerFunction<? super Value, Value> accumulator,
                       CombinerFunction<Value, Value> combiner) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final BTree oldTree = this.tree();
        final BTree newTree = oldTree.reduced(identity, accumulator, combiner, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            treeContext.treeDidChange(newTree, oldTree);
            return newTree.rootRef.fold();
          }
        } else {
          return newTree.rootRef.fold();
        }
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public OrderedMapCursor<Value, Value> iterator() {
    int retries = 0;
    do {
      try {
        return this.tree().cursor();
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Value> keyIterator() {
    int retries = 0;
    do {
      try {
        return Cursor.keys(this.tree().cursor());
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Value> valueIterator() {
    int retries = 0;
    do {
      try {
        return Cursor.values(this.tree().cursor());
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  public Cursor<Value> depthValueIterator(int maxDepth) {
    int retries = 0;
    do {
      try {
        return Cursor.values(this.tree().depthCursor(maxDepth));
      } catch (StoreException error) {
        if (retries < this.settings().maxRetries) {
          retries += 1;
        } else if (retries == this.settings().maxRetries) {
          retries += 1;
          this.didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  protected void didFail(StoreException error) {
    System.err.println(error.getMessage());
    error.printStackTrace();
    this.clear();
  }

  public BTreeMap load() {
    this.tree().load();
    return this;
  }

  public void commitAsync(Commit commit) {
    try {
      this.trunk.commitAsync(commit);
    } catch (Throwable cause) {
      if (Cont.isNonFatal(cause)) {
        commit.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public Chunk commit(Commit commit) throws InterruptedException {
    return this.trunk.commit(commit);
  }

  @Override
  public Comparator<? super Value> comparator() {
    return null;
  }

}
