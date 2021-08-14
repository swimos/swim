// Copyright 2015-2021 Swim inc.
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

import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import swim.codec.Debug;
import swim.codec.Display;
import swim.codec.Output;
import swim.util.HashGenCacheSet;

public abstract class UriQuery extends UriPart implements Iterable<Map.Entry<String, String>>,
    Map<String, String>, Comparable<UriQuery>, Debug, Display {

  protected UriQuery() {
    // sealed
  }

  public abstract boolean isDefined();

  @Override
  public abstract boolean isEmpty();

  @Override
  public int size() {
    return UriQuery.size(this);
  }

  private static int size(UriQuery query) {
    int n = 0;
    while (!query.isEmpty()) {
      n += 1;
      query = query.tail();
    }
    return n;
  }

  public abstract Entry<String, String> head();

  public abstract String key();

  public abstract String value();

  public abstract UriQuery tail();

  protected abstract void setTail(UriQuery tail);

  protected abstract UriQuery dealias();

  @Override
  public boolean containsKey(Object key) {
    if (key instanceof String) {
      return UriQuery.containsKey(this, (String) key);
    }
    return false;
  }

  private static boolean containsKey(UriQuery query, String key) {
    while (!query.isEmpty()) {
      if (key.equals(query.key())) {
        return true;
      }
      query = query.tail();
    }
    return false;
  }

  @Override
  public boolean containsValue(Object value) {
    if (value instanceof String) {
      return UriQuery.containsValue(this, (String) value);
    }
    return false;
  }

  private static boolean containsValue(UriQuery query, String value) {
    while (!query.isEmpty()) {
      if (value.equals(query.value())) {
        return true;
      }
      query = query.tail();
    }
    return false;
  }

  @Override
  public String get(Object key) {
    if (key instanceof String) {
      return UriQuery.get(this, (String) key);
    }
    return null;
  }

  private static String get(UriQuery query, String key) {
    while (!query.isEmpty()) {
      if (key.equals(query.key())) {
        return query.value();
      }
      query = query.tail();
    }
    return null;
  }

  @Override
  public String put(String key, String value) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void putAll(Map<? extends String, ? extends String> params) {
    throw new UnsupportedOperationException();
  }

  @Override
  public String remove(Object key) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  public UriQuery updated(String key, String value) {
    if (key == null) {
      throw new NullPointerException("key");
    }
    if (value == null) {
      throw new NullPointerException("value");
    }
    return UriQuery.updated(this, key, value);
  }

  private static UriQuery updated(UriQuery query, String key, String value) {
    final UriQueryBuilder builder = new UriQueryBuilder();
    boolean updated = false;
    while (!query.isEmpty()) {
      if (key.equals(query.key())) {
        builder.addParam(key, value);
        updated = true;
      } else {
        builder.addParam(query.key(), query.value());
      }
      query = query.tail();
    }
    if (!updated) {
      builder.addParam(key, value);
    }
    return builder.bind();
  }

  public UriQuery removed(String key) {
    if (key == null) {
      throw new NullPointerException();
    }
    final UriQuery newQuery = UriQuery.removed(this, key);
    if (this != newQuery) {
      return newQuery;
    } else {
      return this;
    }
  }

  private static UriQuery removed(UriQuery query, String key) {
    final UriQueryBuilder builder = new UriQueryBuilder();
    while (!query.isEmpty()) {
      if (!key.equals(query.key())) {
        builder.addParam(query.key(), query.value());
      }
      query = query.tail();
    }
    return builder.bind();
  }

  public UriQuery appended(String value) {
    return this.appended(null, value);
  }

  public UriQuery appended(String key, String value) {
    final UriQueryBuilder builder = new UriQueryBuilder();
    builder.addQuery(this);
    builder.addParam(key, value);
    return builder.bind();
  }

  public UriQuery appended(String... keyValuePairs) {
    return this.appended(UriQuery.of(keyValuePairs));
  }

  public UriQuery appended(Map<? extends String, ? extends String> params) {
    final UriQueryBuilder builder = new UriQueryBuilder();
    builder.addQuery(this);
    builder.addAll(params);
    return builder.bind();
  }

  public UriQuery prepended(String value) {
    return this.prepended(null, value);
  }

  public UriQuery prepended(String key, String value) {
    return UriQuery.param(key, value, this);
  }

  public UriQuery prepended(String... keyValuePairs) {
    return this.prepended(UriQuery.of(keyValuePairs));
  }

  public UriQuery prepended(Map<? extends String, ? extends String> params) {
    final UriQueryBuilder builder = new UriQueryBuilder();
    builder.addAll(params);
    builder.addQuery(this);
    return builder.bind();
  }

  @Override
  public Iterator<Entry<String, String>> iterator() {
    return new UriQueryEntryIterator(this);
  }

  @Override
  public Set<Entry<String, String>> entrySet() {
    return new UriQueryEntrySet(this);
  }

  @Override
  public Set<String> keySet() {
    return new UriQueryKeySet(this);
  }

  @Override
  public Collection<String> values() {
    return new UriQueryValues(this);
  }

  @Override
  public final int compareTo(UriQuery that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?>) {
      return UriQueryEntrySet.equals(this, ((Map<?, ?>) other).entrySet());
    }
    return false;
  }

  @Override
  public final int hashCode() {
    return UriQueryEntrySet.hashCode(this);
  }

  @Override
  public abstract <T> Output<T> debug(Output<T> output);

  @Override
  public abstract <T> Output<T> display(Output<T> output);

  static <T> Output<T> display(UriQuery query, Output<T> output) {
    boolean first = true;
    while (!query.isEmpty()) {
      if (!first) {
        output = output.write('&');
      } else {
        first = false;
      }
      final String key = query.key();
      if (key != null) {
        output = Uri.writeParam(key, output);
        output = output.write('=');
      }
      output = Uri.writeQuery(query.value(), output);
      query = query.tail();
    }
    return output;
  }

  @Override
  public abstract String toString();

  private static UriQuery undefined;

  public static UriQuery undefined() {
    if (UriQuery.undefined == null) {
      UriQuery.undefined = new UriQueryUndefined();
    }
    return UriQuery.undefined;
  }

  public static UriQuery param(String key, String value) {
    return UriQuery.param(key, value, UriQuery.undefined());
  }

  public static UriQuery param(String value) {
    return UriQuery.param(value, UriQuery.undefined());
  }

  static UriQuery param(String key, String value, UriQuery tail) {
    if (value == null) {
      throw new NullPointerException("value");
    }
    if (key != null) {
      key = UriQuery.cacheKey(key);
    }
    return new UriQueryParam(key, value, tail);
  }

  static UriQuery param(String value, UriQuery tail) {
    if (value == null) {
      throw new NullPointerException("value");
    }
    return new UriQueryParam(null, value, tail);
  }

  public static UriQuery of(String... keyValuePairs) {
    if (keyValuePairs == null) {
      throw new NullPointerException();
    }
    final int n = keyValuePairs.length;
    if (n % 2 != 0) {
      throw new IllegalArgumentException("Odd number of key-value pairs");
    }
    final UriQueryBuilder builder = new UriQueryBuilder();
    for (int i = 0; i < n; i += 2) {
      builder.addParam(keyValuePairs[i], keyValuePairs[i + 1]);
    }
    return builder.bind();
  }

  public static UriQuery from(Map<? extends String, ? extends String> params) {
    if (params == null) {
      throw new NullPointerException();
    }
    if (params instanceof UriQuery) {
      return (UriQuery) params;
    } else {
      final UriQueryBuilder builder = new UriQueryBuilder();
      builder.addAll(params);
      return builder.bind();
    }
  }

  public static UriQueryBuilder builder() {
    return new UriQueryBuilder();
  }

  public static UriQuery parse(String string) {
    return Uri.standardParser().parseQueryString(string);
  }

  private static ThreadLocal<HashGenCacheSet<String>> keyCache = new ThreadLocal<>();

  static HashGenCacheSet<String> keyCache() {
    HashGenCacheSet<String> keyCache = UriQuery.keyCache.get();
    if (keyCache == null) {
      int keyCacheSize;
      try {
        keyCacheSize = Integer.parseInt(System.getProperty("swim.uri.key.cache.size"));
      } catch (NumberFormatException e) {
        keyCacheSize = 64;
      }
      keyCache = new HashGenCacheSet<String>(keyCacheSize);
      UriQuery.keyCache.set(keyCache);
    }
    return keyCache;
  }

  static String cacheKey(String key) {
    if (key.length() <= 32) {
      return UriQuery.keyCache().put(key);
    } else {
      return key;
    }
  }

}
