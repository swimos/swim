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

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.concurrent.ThreadLocalRandom;
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.structure.Form;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Slot;
import swim.structure.Value;
import swim.structure.collections.ValueList;
import swim.util.Cursor;
import swim.util.KeyedList;

public class STreeList implements KeyedList<Value> {
  final Trunk<STree> trunk;

  public STreeList(Trunk<STree> trunk) {
    this.trunk = trunk;
  }

  public final Trunk<STree> trunk() {
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

  public final STree tree() {
    return this.trunk.tree;
  }

  public final TreeDelegate treeDelegate() {
    return tree().treeDelegate();
  }

  public void setTreeDelegate(TreeDelegate treeDelegate) {
    tree().setTreeDelegate(treeDelegate);
  }

  public boolean isResident() {
    return tree().isResident();
  }

  public STreeList isResident(boolean isResident) {
    do {
      final long newVersion = this.trunk.version();
      final STree oldTree = tree();
      final STree newTree = oldTree.isResident(isResident);
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
    return tree().isTransient();
  }

  public STreeList isTransient(boolean isTransient) {
    do {
      final long newVersion = this.trunk.version();
      final STree oldTree = tree();
      final STree newTree = oldTree.isTransient(isTransient);
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

  public <V> ValueList<V> valueForm(Form<V> valueForm) {
    return new ValueList<V>(this, valueForm);
  }

  public <V> ValueList<V> valueClass(Class<V> valueClass) {
    return valueForm(Form.<V>forClass(valueClass));
  }

  public STreeListView snapshot() {
    return new STreeListView(tree());
  }

  @Override
  public boolean isEmpty() {
    return tree().isEmpty();
  }

  @Override
  public int size() {
    return (int) tree().span();
  }

  public long span() {
    return tree().span();
  }

  public long treeSize() {
    return tree().treeSize();
  }

  @Override
  public boolean contains(Object value) {
    if (value instanceof Value) {
      return contains((Value) value);
    }
    return false;
  }
  private boolean contains(Value value) {
    int retries = 0;
    do {
      try {
        return tree().contains(value);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean containsAll(Collection<?> values) {
    for (Object value : values) {
      if (!(value instanceof Value && contains((Value) value))) {
        return false;
      }
    }
    return true;
  }

  @Override
  public int indexOf(Object object) {
    int retries = 0;
    do {
      try {
        final long k = tree().indexOf(object);
        final int i = (int) k;
        if (i != k) {
          throw new IndexOutOfBoundsException("index overflow");
        }
        return i;
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public int lastIndexOf(Object object) {
    int retries = 0;
    do {
      try {
        final long k = tree().lastIndexOf(object);
        final int i = (int) k;
        if (i != k) {
          throw new IndexOutOfBoundsException("index overflow");
        }
        return i;
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value get(int index) {
    return get(index, null);
  }

  @Override
  public Value get(int index, Object key) {
    int retries = 0;
    do {
      try {
        final STree tree = tree();
        if (key != null) {
          index = (int) tree.lookup(index, key);
          if (index < 0) {
            return Value.absent();
          }
        }
        return tree.get(index);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Map.Entry<Object, Value> getEntry(int index) {
    return getEntry(index, null);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Map.Entry<Object, Value> getEntry(int index, Object key) {
    int retries = 0;
    do {
      try {
        final STree tree = tree();
        if (key != null) {
          index = (int) tree.lookup(index, key);
          if (index < 0) {
            return null;
          }
        }
        return (Map.Entry<Object, Value>) (Map.Entry<?, ?>) tree.getEntry(index);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Value set(int index, Value newValue) {
    return set(index, newValue, null);
  }

  @Override
  public Value set(int index, Value newValue, Object key) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final STree oldTree = tree();
        if (key != null) {
          index = (int) oldTree.lookup(index, key);
          if (index < 0) {
            throw new NoSuchElementException(key.toString());
          }
        }
        final STree newTree = oldTree.updated(index, newValue, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final Slot oldSlot = oldTree.getEntry(index);
            final Value oldKey = oldSlot.key();
            final Value oldValue = oldSlot.value();
            final TreeContext treeContext = newTree.treeContext();
            treeContext.streeDidUpdate(newTree, oldTree, index, oldKey, newValue, oldValue);
            treeContext.treeDidChange(newTree, oldTree);
            return oldValue;
          }
        } else {
          return Value.absent();
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean add(Value newValue) {
    return add(newValue, null);
  }

  @Override
  public boolean add(Value newValue, Object key) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final STree oldTree = tree();
        final Value newKey = key instanceof Value ? (Value) key : identify(newValue);
        final STree newTree = oldTree.appended(newKey, newValue, newVersion, newPost);
        if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
          final int index = (int) oldTree.span();
          final TreeContext treeContext = newTree.treeContext();
          treeContext.streeDidInsert(newTree, oldTree, index, newKey, newValue);
          treeContext.treeDidChange(newTree, oldTree);
          return true;
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean addAll(Collection<? extends Value> newValues) {
    boolean modified = false;
    for (Value newValue : newValues) {
      add(newValue);
      modified = true;
    }
    return modified;
  }

  @Override
  public void add(int index, Value newValue) {
    add(index, newValue, null);
  }

  @Override
  public void add(int index, Value newValue, Object key) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final STree oldTree = tree();
        final Value newKey = key instanceof Value ? (Value) key : identify(newValue);
        final STree newTree = oldTree.inserted(index, newKey, newValue, newVersion, newPost);
        if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
          final TreeContext treeContext = newTree.treeContext();
          treeContext.streeDidInsert(newTree, oldTree, index, newKey, newValue);
          treeContext.treeDidChange(newTree, oldTree);
          return;
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean addAll(int index, Collection<? extends Value> newValues) {
    boolean modified = false;
    for (Value newValue : newValues) {
      add(index, newValue);
      index += 1;
      modified = true;
    }
    return modified;
  }

  @Override
  public Value remove(int index) {
    return remove(index, null);
  }

  @Override
  public Value remove(int index, Object key) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final STree oldTree = tree();
        if (key != null) {
          index = (int) oldTree.lookup(index, key);
          if (index < 0) {
            return null;
          }
        }
        final STree newTree = oldTree.removed(index, newVersion, newPost);
        if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
          final Slot oldSlot = oldTree.getEntry(index);
          final Value oldKey = oldSlot.key();
          final Value oldValue = oldSlot.value();
          final TreeContext treeContext = newTree.treeContext();
          treeContext.streeDidRemove(newTree, oldTree, index, oldKey, oldValue);
          treeContext.treeDidChange(newTree, oldTree);
          return oldValue;
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean remove(Object value) {
    if (value instanceof Value) {
      return remove((Value) value);
    }
    return false;
  }
  private boolean remove(Value value) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final STree oldTree = tree();
        final STree newTree = oldTree.removed(value, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final long index = oldTree.indexOf(value);
            final Slot oldSlot = oldTree.getEntry(index);
            final Value key = oldSlot.key();
            final TreeContext treeContext = newTree.treeContext();
            treeContext.streeDidRemove(newTree, oldTree, index, key, value);
            treeContext.treeDidChange(newTree, oldTree);
            return true;
          }
        } else {
          return false;
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean removeAll(Collection<?> values) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final STree oldTree = tree();
        Record removed = null;
        STree newTree = oldTree;
        long n = newTree.span();
        long i = 0L;
        while (i < n) {
          final Slot slot = newTree.getEntry(i);
          if (values.contains(slot.value())) {
            newTree = newTree.removed(i, newVersion, newPost);
            if (removed == null) {
              removed = Record.create();
            }
            removed.add(Record.create(2).item(i).item(slot));
            n -= 1L;
          } else {
            i += 1L;
          }
        }
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            for (Item entry : removed) {
              final long index = entry.getItem(0).longValue();
              final Slot oldSlot = (Slot) entry.getItem(1);
              treeContext.streeDidRemove(newTree, oldTree, index, oldSlot.key(), oldSlot.value());
            }
            treeContext.treeDidChange(newTree, oldTree);
            return true;
          }
        } else {
          return false;
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public boolean retainAll(Collection<?> values) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final STree oldTree = tree();
        Record removed = null;
        STree newTree = oldTree;
        long n = newTree.span();
        long i = 0L;
        while (i < n) {
          final Slot slot = newTree.getEntry(i);
          if (!values.contains(slot.value())) {
            newTree = newTree.removed(i, newVersion, newPost);
            if (removed == null) {
              removed = Record.create();
            }
            removed.add(Record.create(2).item(i).item(slot));
            n -= 1L;
          } else {
            i += 1L;
          }
        }
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            for (Item entry : removed) {
              final long index = entry.getItem(0).longValue();
              final Slot oldSlot = (Slot) entry.getItem(1);
              treeContext.streeDidRemove(newTree, oldTree, index, oldSlot.key(), oldSlot.value());
            }
            treeContext.treeDidChange(newTree, oldTree);
            return true;
          }
        } else {
          return false;
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public void move(int fromIndex, int toIndex) {
    move(fromIndex, toIndex, null);
  }

  @Override
  public void move(int fromIndex, int toIndex, Object key) {
    int retries = 0;
    do {
      final long newVersion = this.trunk.version();
      final int newPost = this.trunk.post();
      try {
        final STree oldTree = tree();
        if (key != null) {
          fromIndex = (int) oldTree.lookup(fromIndex, key);
          if (fromIndex < 0) {
            throw new NoSuchElementException(key.toString());
          }
        }
        if (fromIndex < 0 || fromIndex >= oldTree.span()) {
          throw new IndexOutOfBoundsException(Integer.toString(fromIndex));
        }
        if (toIndex < 0 || toIndex >= oldTree.span()) {
          throw new IndexOutOfBoundsException(Integer.toString(toIndex));
        }
        if (fromIndex != toIndex) {
          final Slot slot = oldTree.getEntry(fromIndex);
          final Value oldKey = slot.key();
          final Value oldValue = slot.value();
          final STree newTree = oldTree.removed(fromIndex, newVersion, newPost)
              .inserted(toIndex, oldKey, oldValue, newVersion, newPost);
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            treeContext.streeDidMove(newTree, oldTree, fromIndex, toIndex, oldKey, oldValue);
            treeContext.treeDidChange(newTree, oldTree);
            return;
          }
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
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
        final STree oldTree = tree();
        final STree newTree = oldTree.drop(lower, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            treeContext.streeDidDrop(newTree, oldTree, lower);
            treeContext.treeDidChange(newTree, oldTree);
            return;
          }
        } else {
          return;
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
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
        final STree oldTree = tree();
        final STree newTree = oldTree.take(upper, newVersion, newPost);
        if (oldTree != newTree) {
          if (this.trunk.updateTree(oldTree, newTree, newVersion)) {
            final TreeContext treeContext = newTree.treeContext();
            treeContext.streeDidTake(newTree, oldTree, upper);
            treeContext.treeDidChange(newTree, oldTree);
            return;
          }
        } else {
          return;
        }
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
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
        final STree oldTree = tree();
        final STree newTree = oldTree.cleared(newVersion);
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
        if (retries < settings().maxRetries) {
          retries += 1;
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Object[] toArray() {
    int retries = 0;
    do {
      try {
        final STree tree = tree();
        final long k = tree.span();
        final int n = (int) k;
        if (n != k) {
          throw new IndexOutOfBoundsException("length overflow");
        }
        final Object[] array = new Object[n];
        tree.copyToArray(array, 0);
        return array;
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    int retries = 0;
    do {
      try {
        final STree tree = tree();
        final long k = tree.span();
        final int n = (int) k;
        if (n != k) {
          throw new IndexOutOfBoundsException("length overflow");
        }
        if (array.length < n) {
          array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
        }
        tree.copyToArray(array, 0);
        if (array.length > n) {
          array[n] = null;
        }
        return array;
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Value> iterator() {
    int retries = 0;
    do {
      try {
        return Cursor.values(tree().cursor());
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Value> listIterator() {
    int retries = 0;
    do {
      try {
        return Cursor.values(tree().cursor());
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Value> listIterator(int index) {
    int retries = 0;
    do {
      try {
        final Cursor<Slot> cursor = tree().cursor();
        cursor.skip(index);
        return Cursor.values(cursor);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public Cursor<Object> keyIterator() {
    int retries = 0;
    do {
      try {
        return Cursor.<Object>keys(tree().cursor());
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  @Override
  public Cursor<Map.Entry<Object, Value>> entryIterator() {
    int retries = 0;
    do {
      try {
        return (Cursor<Map.Entry<Object, Value>>) (Cursor<?>) tree().cursor();
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  public Cursor<Value> depthIterator(int maxDepth) {
    int retries = 0;
    do {
      try {
        return Cursor.values(tree().depthCursor(maxDepth));
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @Override
  public List<Value> subList(int fromIndex, int toIndex) {
    int retries = 0;
    do {
      try {
        if (fromIndex > toIndex) {
          throw new IllegalArgumentException();
        }
        return new STreeSubList(this, fromIndex, toIndex);
      } catch (StoreException error) {
        if (retries < settings().maxRetries) {
          retries += 1;
        } else if (retries == settings().maxRetries) {
          retries += 1;
          didFail(error);
        } else {
          throw error;
        }
      }
    } while (true);
  }

  @SuppressWarnings("unchecked")
  protected Value identify(Value value) {
    return Num.from(ThreadLocalRandom.current().nextLong());
  }

  protected void didFail(StoreException error) {
    System.err.println(error.getMessage());
    error.printStackTrace();
    clear();
  }

  public void loadAsync(Cont<STreeList> cont) {
    try {
      final Cont<Tree> andThen = Conts.constant(cont, this);
      tree().loadAsync(andThen);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public STreeList load() throws InterruptedException {
    tree().load();
    return this;
  }

  public void commitAsync(Commit commit) {
    try {
      this.trunk.commitAsync(commit);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        commit.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public Chunk commit(Commit commit) throws InterruptedException {
    return this.trunk.commit(commit);
  }
}
