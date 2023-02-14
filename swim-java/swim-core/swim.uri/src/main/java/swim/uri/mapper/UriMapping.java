// Copyright 2015-2022 Swim.inc
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

package swim.uri.mapper;

import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import swim.annotations.Nullable;
import swim.uri.Uri;
import swim.uri.UriMapper;
import swim.util.Assume;
import swim.util.Murmur3;

final class UriMapping<T> extends TerminalUriMapper<T> {

  final Uri key;
  final T value;

  UriMapping(Uri key, T value) {
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
    return new UriMappingIterator<T>(this.key, this.value);
  }

  @Override
  public Iterator<Uri> keyIterator() {
    return new UriMappingKeyIterator(this.key);
  }

  @Override
  public Iterator<T> valueIterator() {
    return new UriMappingValueIterator<T>(this.value);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriMapping<?>) {
      final UriMapping<?> that = (UriMapping<?>) other;
      return this.value.equals(that.value);
    }
    return false;
  }

  private static final int hashSeed = Murmur3.seed(UriMapping.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(UriMapping.hashSeed, this.value.hashCode()));
  }

}

final class UriMappingIterator<T> implements Iterator<Map.Entry<Uri, T>> {

  @Nullable Uri key;
  @Nullable T value;

  UriMappingIterator(Uri key, T value) {
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
    final Map.Entry<Uri, T> entry = new SimpleImmutableEntry<Uri, T>(key, this.value);
    this.key = null;
    this.value = null;
    return entry;
  }

}

final class UriMappingKeyIterator implements Iterator<Uri> {

  @Nullable Uri key;

  UriMappingKeyIterator(Uri key) {
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

}

final class UriMappingValueIterator<T> implements Iterator<T> {

  @Nullable T value;
  boolean hasNext;

  UriMappingValueIterator(T value) {
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
    final T value = Assume.nonNull(this.value);
    this.hasNext = false;
    this.value = null;
    return value;
  }

}
