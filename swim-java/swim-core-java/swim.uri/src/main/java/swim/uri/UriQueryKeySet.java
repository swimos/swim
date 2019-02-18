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

package swim.uri;

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Set;

final class UriQueryKeySet implements Set<String> {
  final UriQuery query;

  UriQueryKeySet(UriQuery query) {
    this.query = query;
  }

  @Override
  public boolean isEmpty() {
    return this.query.isEmpty();
  }

  @Override
  public int size() {
    return this.query.size();
  }

  @Override
  public boolean contains(Object key) {
    return this.query.containsKey(key);
  }

  @Override
  public boolean containsAll(Collection<?> keys) {
    if (keys == null) {
      throw new NullPointerException();
    }
    return UriQueryKeySet.containsAll(this.query, new HashSet<Object>(keys));
  }

  private static boolean containsAll(UriQuery query, HashSet<?> missing) {
    while (!query.isEmpty() && !missing.isEmpty()) {
      missing.remove(query.key());
      query = query.tail();
    }
    return missing.isEmpty();
  }

  @Override
  public boolean add(String key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends String> keys) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean remove(Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeAll(Collection<?> keys) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean retainAll(Collection<?> keys) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Iterator<String> iterator() {
    return new UriQueryKeyIterator(this.query);
  }

  @Override
  public Object[] toArray() {
    final Object[] array = new Object[size()];
    UriQueryKeySet.toArray(this.query, array);
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final int n = size();
    if (array.length < n) {
      array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    UriQueryKeySet.toArray(this.query, array);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  private static void toArray(UriQuery query, Object[] array) {
    int i = 0;
    while (!query.isEmpty()) {
      array[i] = query.key();
      query = query.tail();
      i += 1;
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Set<?>) {
      final Set<?> that = (Set<?>) other;
      if (size() == that.size()) {
        return UriQueryKeySet.equals(this.query, that);
      }
    }
    return false;
  }

  private static boolean equals(UriQuery query, Set<?> that) {
    while (!query.isEmpty()) {
      if (!that.contains(query.key())) {
        return false;
      }
      query = query.tail();
    }
    return true;
  }

  @Override
  public int hashCode() {
    return UriQueryKeySet.hashCode(this.query);
  }

  private static int hashCode(UriQuery query) {
    int code = 0;
    while (!query.isEmpty()) {
      final String key = query.key();
      code += (key == null ? 0 : key.hashCode());
      query = query.tail();
    }
    return code;
  }

  @Override
  public String toString() {
    return UriQueryKeySet.toString(this.query);
  }

  private static String toString(UriQuery query) {
    final StringBuilder s = new StringBuilder();
    s.append('[');
    if (!query.isEmpty()) {
      s.append(String.valueOf(query.key()));
      query = query.tail();
      while (!query.isEmpty()) {
        s.append(", ").append(String.valueOf(query.key()));
        query = query.tail();
      }
    }
    s.append(']');
    return s.toString();
  }
}
