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
import swim.concurrent.Cont;
import swim.concurrent.Conts;
import swim.structure.Form;
import swim.structure.Slot;
import swim.structure.Value;
import swim.structure.collections.ValueList;
import swim.util.Cursor;

public class STreeListView implements List<Value> {
  protected final STree tree;

  public STreeListView(STree tree) {
    this.tree = tree;
  }

  public STree getTree() {
    return this.tree;
  }

  public void loadAsync(Cont<STreeListView> cont) {
    try {
      final Cont<Tree> andThen = Conts.constant(cont, this);
      this.tree.loadAsync(andThen);
    } catch (Throwable cause) {
      if (Conts.isNonFatal(cause)) {
        cont.trap(cause);
      } else {
        throw cause;
      }
    }
  }

  public STreeListView load() throws InterruptedException {
    this.tree.load();
    return this;
  }

  public boolean isResident() {
    return this.tree.isResident();
  }

  public boolean isTransient() {
    return this.tree.isTransient();
  }

  public <V> ValueList<V> valueForm(Form<V> valueForm) {
    return new ValueList<V>(this, valueForm);
  }

  public <V> ValueList<V> valueClass(Class<V> valueClass) {
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
  public boolean contains(Object value) {
    if (value instanceof Value) {
      return this.tree.contains((Value) value);
    }
    return false;
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
    final long k = this.tree.indexOf(object);
    final int i = (int) k;
    if (i != k) {
      throw new IndexOutOfBoundsException("index overflow");
    }
    return i;
  }

  @Override
  public int lastIndexOf(Object object) {
    final long k = this.tree.lastIndexOf(object);
    final int i = (int) k;
    if (i != k) {
      throw new IndexOutOfBoundsException("index overflow");
    }
    return i;
  }

  @Override
  public Value get(int index) {
    return this.tree.get(index);
  }

  @Override
  public Value set(int index, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean add(Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends Value> newValues) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void add(int index, Value newValue) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(int index, Collection<? extends Value> newValues) {
    throw new UnsupportedOperationException();
  }

  @Override
  public Value remove(int index) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean remove(Object value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeAll(Collection<?> values) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean retainAll(Collection<?> values) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Object[] toArray() {
    final STree tree = this.tree;
    final long k = tree.span();
    final int n = (int) k;
    if (n != k) {
      throw new IndexOutOfBoundsException("length overflow");
    }
    final Object[] array = new Object[n];
    tree.copyToArray(array, 0);
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final STree tree = this.tree;
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
  }

  @Override
  public Cursor<Value> iterator() {
    return Cursor.values(this.tree.cursor());
  }

  @Override
  public Cursor<Value> listIterator() {
    return Cursor.values(this.tree.cursor());
  }

  @Override
  public Cursor<Value> listIterator(int index) {
    final Cursor<Slot> cursor = this.tree.cursor();
    cursor.skip(index);
    return Cursor.values(cursor);
  }

  @Override
  public List<Value> subList(int fromIndex, int toIndex) {
    if (fromIndex > toIndex) {
      throw new IllegalArgumentException();
    }
    return new STreeSubListView(this, fromIndex, toIndex);
  }
}
