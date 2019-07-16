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

final class UriQueryValues implements Collection<String> {
  final UriQuery query;

  UriQueryValues(UriQuery query) {
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
  public boolean contains(Object value) {
    return this.query.containsValue(value);
  }

  @Override
  public boolean containsAll(Collection<?> values) {
    if (values == null) {
      throw new NullPointerException();
    }
    return UriQueryValues.containsAll(this.query, new HashSet<Object>(values));
  }

  private static boolean containsAll(UriQuery query, HashSet<?> missing) {
    while (!query.isEmpty() && !missing.isEmpty()) {
      missing.remove(query.value());
      query = query.tail();
    }
    return missing.isEmpty();
  }

  @Override
  public boolean add(String value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends String> values) {
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
  public Iterator<String> iterator() {
    return new UriQueryValueIterator(this.query);
  }

  @Override
  public Object[] toArray() {
    final Object[] array = new Object[size()];
    UriQueryValues.toArray(this.query, array);
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final int n = size();
    if (array.length < n) {
      array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    UriQueryValues.toArray(this.query, array);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  private static void toArray(UriQuery query, Object[] array) {
    int i = 0;
    while (!query.isEmpty()) {
      array[i] = query.value();
      query = query.tail();
      i += 1;
    }
  }

  @Override
  public String toString() {
    return UriQueryValues.toString(this.query);
  }

  private static String toString(UriQuery query) {
    final StringBuilder s = new StringBuilder();
    s.append('[');
    if (!query.isEmpty()) {
      s.append(String.valueOf(query.value()));
      query = query.tail();
      while (!query.isEmpty()) {
        s.append(", ").append(String.valueOf(query.value()));
        query = query.tail();
      }
    }
    s.append(']');
    return s.toString();
  }
}
