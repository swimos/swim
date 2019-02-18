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
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

final class UriQueryEntrySet implements Set<Map.Entry<String, String>> {
  final UriQuery query;

  UriQueryEntrySet(UriQuery query) {
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
  public boolean contains(Object entry) {
    if (entry instanceof Map.Entry<?, ?>) {
      return UriQueryEntrySet.contains(this.query, (Map.Entry<?, ?>) entry);
    }
    return false;
  }

  private static boolean contains(UriQuery query, Map.Entry<?, ?> entry) {
    while (!query.isEmpty()) {
      if ((query.key() == null ? entry.getKey() == null : query.key().equals(entry.getKey()))
          && (query.value() == null ? entry.getValue() == null : query.value().equals(entry.getValue()))) {
        return true;
      }
      query = query.tail();
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> entries) {
    for (Object entry : entries) {
      if (!contains(entry)) {
        return false;
      }
    }
    return true;
  }

  @Override
  public boolean add(Map.Entry<String, String> entry) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends Map.Entry<String, String>> entries) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean remove(Object entry) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeAll(Collection<?> entries) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean retainAll(Collection<?> entries) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  @Override
  public Iterator<Map.Entry<String, String>> iterator() {
    return new UriQueryEntryIterator(this.query);
  }

  @Override
  public Object[] toArray() {
    final Object[] array = new Object[size()];
    UriQueryEntrySet.toArray(this.query, array);
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final int n = size();
    if (array.length < n) {
      array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    UriQueryEntrySet.toArray(this.query, array);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  private static void toArray(UriQuery query, Object[] array) {
    int i = 0;
    while (!query.isEmpty()) {
      array[i] = query.head();
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
        return UriQueryEntrySet.equals(this.query, that);
      }
    }
    return false;
  }

  static boolean equals(UriQuery query, Set<?> that) {
    while (!query.isEmpty()) {
      if (!that.contains(query.head())) {
        return false;
      }
      query = query.tail();
    }
    return true;
  }

  @Override
  public int hashCode() {
    return UriQueryEntrySet.hashCode(this.query);
  }

  static int hashCode(UriQuery query) {
    int code = 0;
    while (!query.isEmpty()) {
      final String key = query.key();
      final String value = query.value();
      code += (key == null ? 0 : key.hashCode())
            ^ (value == null ? 0 : value.hashCode());
      query = query.tail();
    }
    return code;
  }

  @Override
  public String toString() {
    return UriQueryEntrySet.toString(this.query);
  }

  private static String toString(UriQuery query) {
    final StringBuilder s = new StringBuilder();
    s.append('[');
    if (!query.isEmpty()) {
      s.append(query.head().toString());
      query = query.tail();
      while (!query.isEmpty()) {
        s.append(", ").append(query.head().toString());
        query = query.tail();
      }
    }
    s.append(']');
    return s.toString();
  }
}
