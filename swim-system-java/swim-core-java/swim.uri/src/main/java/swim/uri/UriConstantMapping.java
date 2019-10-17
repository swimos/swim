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

import java.util.AbstractMap;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import swim.util.Murmur3;

final class UriConstantMapping<T> extends UriTerminalMapper<T> {
  final Uri key;
  final T value;

  UriConstantMapping(Uri key, T value) {
    this.key = key;
    this.value = value;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public int size() {
    return 1;
  }

  @Override
  public boolean containsValue(Object value) {
    return value == null ? this.value == null : value.equals(this.value);
  }

  @Override
  UriMapper<T> getSuffix() {
    return this;
  }

  @Override
  T get() {
    return this.value;
  }

  @Override
  public Iterator<Entry<Uri, T>> iterator() {
    return new UriConstantMappingIterator<T>(this.key, this.value);
  }

  @Override
  public Iterator<Uri> keyIterator() {
    return new UriConstantMappingKeyIterator(this.key);
  }

  @Override
  public Iterator<T> valueIterator() {
    return new UriConstantMappingValueIterator<T>(this.value);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriConstantMapping<?>) {
      final UriConstantMapping<?> that = (UriConstantMapping<?>) other;
      return this.value.equals(that.value);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(UriConstantMapping.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.value.hashCode()));
  }

  private static int hashSeed;
}

final class UriConstantMappingIterator<T> implements Iterator<Map.Entry<Uri, T>> {
  Uri key;
  T value;

  UriConstantMappingIterator(Uri key, T value) {
    this.key = key;
    this.value = value;
  }

  @Override
  public boolean hasNext() {
    return this.key != null;
  }

  @Override
  public Map.Entry<Uri, T> next() {
    final Uri key = this.key;
    if (key == null) {
      throw new NoSuchElementException();
    }
    final Map.Entry<Uri, T> entry = new AbstractMap.SimpleImmutableEntry<Uri, T>(key, value);
    this.key = null;
    value = null;
    return entry;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class UriConstantMappingKeyIterator implements Iterator<Uri> {
  Uri key;

  UriConstantMappingKeyIterator(Uri key) {
    this.key = key;
  }

  @Override
  public boolean hasNext() {
    return this.key != null;
  }

  @Override
  public Uri next() {
    final Uri key = this.key;
    if (key == null) {
      throw new NoSuchElementException();
    }
    this.key = null;
    return key;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class UriConstantMappingValueIterator<T> implements Iterator<T> {
  T value;
  boolean hasNext;

  UriConstantMappingValueIterator(T value) {
    this.value = value;
    this.hasNext = true;
  }

  @Override
  public boolean hasNext() {
    return this.hasNext;
  }

  @Override
  public T next() {
    if (!this.hasNext) {
      throw new NoSuchElementException();
    }
    final T value = this.value;
    this.hasNext = false;
    this.value = null;
    return value;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
