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
import swim.util.CombinerFunction;
import swim.util.Cursor;
import swim.util.OrderedMapCursor;

public abstract class BTreePage<K, V, U> {
  BTreePage() {
    // stub
  }

  public abstract boolean isEmpty();

  public abstract int size();

  public abstract int arity();

  public abstract U fold();

  public abstract K minKey();

  public abstract K maxKey();

  public abstract boolean containsKey(Object key, BTreeContext<K, V> tree);

  public abstract boolean containsValue(Object value);

  public abstract int indexOf(Object key, BTreeContext<K, V> tree);

  public abstract V get(Object key, BTreeContext<K, V> tree);

  public abstract Map.Entry<K, V> getEntry(Object key, BTreeContext<K, V> tree);

  public abstract Map.Entry<K, V> getIndex(int index);

  public abstract Map.Entry<K, V> firstEntry();

  public abstract Map.Entry<K, V> lastEntry();

  public abstract Map.Entry<K, V> nextEntry(K key, BTreeContext<K, V> tree);

  public abstract Map.Entry<K, V> previousEntry(K key, BTreeContext<K, V> tree);

  public abstract BTreePage<K, V, U> updated(K key, V newValue, BTreeContext<K, V> tree);

  public abstract BTreePage<K, V, U> removed(Object key, BTreeContext<K, V> tree);

  public abstract BTreePage<K, V, U> drop(int lower, BTreeContext<K, V> tree);

  public abstract BTreePage<K, V, U> take(int upper, BTreeContext<K, V> tree);

  public abstract BTreePage<K, V, U> balanced(BTreeContext<K, V> tree);

  public abstract BTreePage<K, V, U> split(int index);

  public abstract BTreePage<K, V, U> splitLeft(int index);

  public abstract BTreePage<K, V, U> splitRight(int index);

  public abstract BTreePage<K, V, U> reduced(U identity, CombinerFunction<? super V, U> accumulator,
                                             CombinerFunction<U, U> combiner);

  public Cursor<K> keyIterator() {
    return Cursor.keys(iterator());
  }

  public Cursor<V> valueIterator() {
    return Cursor.values(iterator());
  }

  public abstract OrderedMapCursor<K, V> iterator();

  public Cursor<K> lastKeyIterator() {
    return Cursor.keys(lastIterator());
  }

  public Cursor<V> lastValueIterator() {
    return Cursor.values(lastIterator());
  }

  public abstract OrderedMapCursor<K, V> lastIterator();

  public static <K, V, U> BTreePage<K, V, U> empty() {
    return BTreeLeaf.empty();
  }
}
