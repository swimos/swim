// Copyright 2015-2023 Nstream, inc.
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
import swim.codec.Debug;
import swim.codec.Format;
import swim.codec.Output;

public abstract class UriMapper<T> implements Iterable<Map.Entry<Uri, T>>, Map<Uri, T>, Debug {

  UriMapper() {
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

  public UriMapper<T> getSuffix(String uri) {
    return this.getSuffix(Uri.parse(uri));
  }

  public abstract T get(Uri uri);

  public T get(String uri) {
    return this.get(Uri.parse(uri));
  }

  @Override
  public T get(Object key) {
    if (key instanceof Uri) {
      return this.get((Uri) key);
    } else if (key instanceof String) {
      return this.get((String) key);
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

  public UriMapper<T> updated(UriPattern pattern, T value) {
    return this.updated(pattern.toUri(), value);
  }

  public UriMapper<T> updated(String pattern, T value) {
    return this.updated(Uri.parse(pattern), value);
  }

  public abstract UriMapper<T> removed(Uri pattern);

  public UriMapper<T> removed(UriPattern pattern) {
    return this.removed(pattern.toUri());
  }

  public UriMapper<T> removed(String pattern) {
    return this.removed(Uri.parse(pattern));
  }

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
  public <U> Output<U> debug(Output<U> output) {
    output = output.write("UriMapper").write('.').write("empty").write('(').write(')');
    for (Map.Entry<Uri, T> entry : this) {
      output = output.write('.').write("updated").write('(')
                     .debug(entry.getKey().toString()).write(", ")
                     .debug(entry.getValue()).write(')');
    }
    return output;
  }

  @Override
  public String toString() {
    return Format.debug(this);
  }

  private static UriMapper<Object> empty;

  @SuppressWarnings("unchecked")
  public static <T> UriMapper<T> empty() {
    if (UriMapper.empty == null) {
      UriMapper.empty = new UriEmptyMapping<Object>();
    }
    return (UriMapper<T>) UriMapper.empty;
  }

  public static <T> UriMapper<T> mapping(Uri pattern, T value) {
    return UriSchemeMapper.compile(pattern, pattern.scheme(), pattern.authority(),
                                   pattern.path(), pattern.query(), pattern.fragment(), value);
  }

  public static <T> UriMapper<T> mapping(UriPattern pattern, T value) {
    return UriMapper.mapping(pattern.toUri(), value);
  }

  public static <T> UriMapper<T> mapping(String uriString, T value) {
    return UriMapper.mapping(Uri.parse(uriString), value);
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
