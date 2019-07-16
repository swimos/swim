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

package swim.collections;

import java.util.Map;
import swim.util.Cursor;

public abstract class STreePage<T> {
  public abstract boolean isEmpty();

  public abstract int size();

  public abstract int arity();

  public abstract boolean contains(Object value);

  public abstract int indexOf(Object value);

  public abstract int lastIndexOf(Object value);

  public abstract T get(int index);

  public abstract Map.Entry<Object, T> getEntry(int index);

  public abstract STreePage<T> updated(int index, T newValue, STreeContext<T> tree);

  public abstract STreePage<T> inserted(int index, T newValue, Object id, STreeContext<T> tree);

  public STreePage<T> appended(T newValue, Object id, STreeContext<T> tree) {
    return inserted(size(), newValue, id, tree);
  }

  public STreePage<T> prepended(T newValue, Object id, STreeContext<T> tree) {
    return inserted(0, newValue, id, tree);
  }

  public abstract STreePage<T> removed(int index, STreeContext<T> tree);

  public abstract STreePage<T> removed(Object value, STreeContext<T> tree);

  public abstract STreePage<T> drop(int lower, STreeContext<T> tree);

  public abstract STreePage<T> take(int upper, STreeContext<T> tree);

  public abstract STreePage<T> balanced(STreeContext<T> tree);

  public abstract STreePage<T> split(int index);

  public abstract STreePage<T> splitLeft(int index);

  public abstract STreePage<T> splitRight(int index);

  public abstract void copyToArray(Object[] array, int offset);

  public Cursor<T> iterator() {
    return Cursor.values(this.entryIterator());
  }

  public Cursor<Object> keyIterator() {
    return Cursor.keys(this.entryIterator());
  }

  public abstract Cursor<Map.Entry<Object, T>> entryIterator();

  public Cursor<T> reverseIterator() {
    return Cursor.values(this.reverseEntryIterator());
  }

  public Cursor<Object> reverseKeyIterator() {
    return Cursor.keys(this.reverseEntryIterator());
  }

  public abstract Cursor<Map.Entry<Object, T>> reverseEntryIterator();

  public static <T> STreePage<T> empty() {
    return STreeLeaf.empty();
  }
}
