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

package swim.uri;

import java.util.AbstractCollection;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Collections;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import swim.annotations.Internal;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.uri.mapper.EmptyUriMapping;
import swim.uri.mapper.UriSchemeMapper;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;

@Public
@Since("5.0")
public abstract class UriMapper<T> implements Iterable<Map.Entry<Uri, T>>, Map<Uri, T>, ToSource {

  @Internal
  protected UriMapper() {
    // sealed
  }

  @Override
  public abstract boolean isEmpty();

  @Override
  public abstract int size();

  @Override
  public boolean containsKey(Object key) {
    return this.get(key) != null;
  }

  @Override
  public abstract boolean containsValue(Object value);

  public abstract UriMapper<T> getSuffix(Uri uri);

  public abstract @Nullable T get(Uri uri);

  @Override
  public @Nullable T get(Object key) {
    if (key instanceof Uri) {
      return this.get((Uri) key);
    } else {
      return null;
    }
  }

  @Override
  public T put(Uri pattern, T value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void putAll(Map<? extends Uri, ? extends T> map) {
    throw new UnsupportedOperationException();
  }

  @Override
  public T remove(Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  public abstract UriMapper<T> merged(UriMapper<T> that);

  public UriMapper<T> updated(Uri pattern, T value) {
    return this.merged(UriMapper.mapping(pattern, value));
  }

  public abstract UriMapper<T> removed(Uri pattern);

  public abstract UriMapper<T> unmerged(UriMapper<T> that);

  @Override
  public Set<Map.Entry<Uri, T>> entrySet() {
    return new UriMapperEntrySet<T>(this);
  }

  @Override
  public Set<Uri> keySet() {
    return new UriMapperKeySet<T>(this);
  }

  @Override
  public Collection<T> values() {
    return new UriMapperValues<T>(this);
  }

  @Override
  public abstract Iterator<Map.Entry<Uri, T>> iterator();

  public abstract Iterator<Uri> keyIterator();

  public abstract Iterator<T> valueIterator();

  public long childCount() {
    return 0L;
  }

  public Iterator<UriPart> childIterator() {
    return Collections.emptyIterator();
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UriMapper", "empty").endInvoke();
    for (Map.Entry<Uri, T> entry : this) {
      notation.beginInvoke("updated")
              .appendArgument(entry.getKey())
              .appendArgument(entry.getValue())
              .endInvoke();
    }
  }

  @Override
  public String toString() {
    return this.toSource();
  }

  private static final UriMapper<Object> EMPTY = new EmptyUriMapping<Object>();

  public static <T> UriMapper<T> empty() {
    return Assume.conforms(EMPTY);
  }

  public static <T> UriMapper<T> mapping(Uri pattern, T value) {
    return UriSchemeMapper.compile(pattern, pattern.scheme(), pattern.authority(),
                                   pattern.path(), pattern.query(),
                                   pattern.fragment(), value);
  }

}

final class UriMapperEntrySet<T> extends AbstractSet<Map.Entry<Uri, T>> {

  final UriMapper<T> mapper;

  UriMapperEntrySet(UriMapper<T> mapper) {
    this.mapper = mapper;
  }

  @Override
  public boolean isEmpty() {
    return this.mapper.isEmpty();
  }

  @Override
  public int size() {
    return this.mapper.size();
  }

  @Override
  public Iterator<Map.Entry<Uri, T>> iterator() {
    return this.mapper.iterator();
  }

}

final class UriMapperKeySet<T> extends AbstractSet<Uri> {

  final UriMapper<T> mapper;

  UriMapperKeySet(UriMapper<T> mapper) {
    this.mapper = mapper;
  }

  @Override
  public boolean isEmpty() {
    return this.mapper.isEmpty();
  }

  @Override
  public int size() {
    return this.mapper.size();
  }

  @Override
  public Iterator<Uri> iterator() {
    return this.mapper.keyIterator();
  }

}

final class UriMapperValues<T> extends AbstractCollection<T> {

  final UriMapper<T> mapper;

  UriMapperValues(UriMapper<T> mapper) {
    this.mapper = mapper;
  }

  @Override
  public boolean isEmpty() {
    return this.mapper.isEmpty();
  }

  @Override
  public int size() {
    return this.mapper.size();
  }

  @Override
  public Iterator<T> iterator() {
    return this.mapper.valueIterator();
  }

}
