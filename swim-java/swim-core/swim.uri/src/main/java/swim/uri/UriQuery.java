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

import java.io.IOException;
import java.util.AbstractCollection;
import java.util.AbstractMap.SimpleImmutableEntry;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.ParseException;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Utf8DecodedOutput;
import swim.util.CacheMap;
import swim.util.LruCacheMap;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public abstract class UriQuery extends UriPart implements Iterable<Map.Entry<String, String>>, UpdatableMap<String, String>, Comparable<UriQuery>, ToSource, ToString {

  UriQuery() {
    // sealed
  }

  public abstract boolean isDefined();

  @Override
  public abstract boolean isEmpty();

  @Override
  public int size() {
    int n = 0;
    UriQuery query = this;
    while (!query.isEmpty()) {
      n += 1;
      query = query.tail();
    }
    return n;
  }

  public abstract Map.Entry<String, String> head();

  public abstract @Nullable String key();

  public abstract String value();

  public abstract UriQuery tail();

  abstract void setTail(UriQuery tail);

  abstract UriQuery dealias();

  @Override
  public boolean containsKey(@Nullable Object key) {
    if (key instanceof String) {
      UriQuery query = this;
      while (!query.isEmpty()) {
        if (key.equals(query.key())) {
          return true;
        }
        query = query.tail();
      }
    }
    return false;
  }

  @Override
  public boolean containsValue(@Nullable Object value) {
    if (value instanceof String) {
      UriQuery query = this;
      while (!query.isEmpty()) {
        if (value.equals(query.value())) {
          return true;
        }
        query = query.tail();
      }
    }
    return false;
  }

  @Override
  public @Nullable String get(@Nullable Object key) {
    if (key instanceof String) {
      UriQuery query = this;
      while (!query.isEmpty()) {
        if (key.equals(query.key())) {
          return query.value();
        }
        query = query.tail();
      }
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

  @Override
  public UriQuery updated(@Nullable String key, @Nullable String value) {
    Objects.requireNonNull(key, "key");
    Objects.requireNonNull(value, "value");
    UriQuery query = this;
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
    return builder.build();
  }

  @Override
  public UriQuery removed(@Nullable Object key) {
    Objects.requireNonNull(key);
    if (key instanceof String) {
      UriQuery query = this;
      final UriQueryBuilder builder = new UriQueryBuilder();
      boolean removed = false;
      while (!query.isEmpty()) {
        if (!key.equals(query.key())) {
          builder.addParam(query.key(), query.value());
        } else {
          removed = true;
        }
        query = query.tail();
      }
      if (removed) {
        return builder.build();
      }
    }
    return this;
  }

  public UriQuery appended(String value) {
    return this.appended(null, value);
  }

  public UriQuery appended(@Nullable String key, String value) {
    final UriQueryBuilder builder = new UriQueryBuilder();
    builder.addQuery(this);
    builder.addParam(key, value);
    return builder.build();
  }

  public UriQuery appended(@Nullable String... keyValuePairs) {
    Objects.requireNonNull(keyValuePairs);
    if (keyValuePairs.length == 0) {
      return this;
    }
    final UriQueryBuilder builder = new UriQueryBuilder();
    builder.addQuery(this);
    builder.addQuery(UriQuery.of(keyValuePairs));
    return builder.build();
  }

  public UriQuery appendedAll(Map<? extends String, ? extends String> params) {
    if (params.isEmpty()) {
      return this;
    }
    final UriQueryBuilder builder = new UriQueryBuilder();
    builder.addQuery(this);
    builder.addAll(params);
    return builder.build();
  }

  public UriQuery prepended(String value) {
    return this.prepended(null, value);
  }

  public UriQuery prepended(@Nullable String key, String value) {
    return UriQuery.param(key, value, this);
  }

  public UriQuery prepended(@Nullable String... keyValuePairs) {
    Objects.requireNonNull(keyValuePairs);
    if (keyValuePairs.length == 0) {
      return this;
    }
    final UriQueryBuilder builder = new UriQueryBuilder();
    builder.addQuery(UriQuery.of(keyValuePairs));
    builder.addQuery(this);
    return builder.build();
  }

  public UriQuery prependedAll(Map<? extends String, ? extends String> params) {
    if (params.isEmpty()) {
      return this;
    }
    final UriQueryBuilder builder = new UriQueryBuilder();
    builder.addAll(params);
    builder.addQuery(this);
    return builder.build();
  }

  @Override
  public void forEach(BiConsumer<? super String, ? super String> action) {
    UriQuery query = this;
    while (!query.isEmpty()) {
      action.accept(query.key(), query.value());
      query = query.tail();
    }
  }

  @Override
  public void forEach(Consumer<? super Map.Entry<String, String>> action) {
    UriQuery query = this;
    while (!query.isEmpty()) {
      action.accept(query.head());
      query = query.tail();
    }
  }

  @Override
  public Iterator<Map.Entry<String, String>> iterator() {
    return new UriQueryEntryIterator(this);
  }

  public Iterator<String> keyIterator() {
    return new UriQueryKeyIterator(this);
  }

  public Iterator<String> valueIterator() {
    return new UriQueryValueIterator(this);
  }

  @Override
  public Set<Map.Entry<String, String>> entrySet() {
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
      return this.entrySet().equals(((Map<?, ?>) other).entrySet());
    }
    return false;
  }

  @Override
  public final int hashCode() {
    int code = 0;
    UriQuery query = this;
    while (!query.isEmpty()) {
      code += Objects.hashCode(query.key()) ^ Objects.hashCode(query.value());
      query = query.tail();
    }
    return code;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UriQuery", "of");
    this.writeArguments(notation);
    notation.endInvoke();
  }

  void writeArguments(Notation notation) {
    UriQuery query = this;
    while (!query.isEmpty()) {
      notation.appendArgument(query.key())
              .appendArgument(query.value());
      query = query.tail();
    }
  }

  static void writeString(Appendable output, UriQuery query) throws IOException {
    boolean first = true;
    while (!query.isEmpty()) {
      if (!first) {
        output.append('&');
      } else {
        first = false;
      }
      final String key = query.key();
      if (key != null) {
        for (int i = 0, n = key.length(); i < n; i = key.offsetByCodePoints(i, 1)) {
          final int c = key.codePointAt(i);
          if (Uri.isParamChar(c)) {
            output.append((char) c);
          } else {
            Uri.writeEncoded(output, c);
          }
        }
        output.append('=');
      }
      final String value = query.value();
      for (int i = 0, n = value.length(); i < n; i = value.offsetByCodePoints(i, 1)) {
        final int c = value.codePointAt(i);
        if (Uri.isQueryChar(c)) {
          output.append((char) c);
        } else {
          Uri.writeEncoded(output, c);
        }
      }
      query = query.tail();
    }
  }

  @Override
  public abstract String toString();

  private static final UriQuery UNDEFINED = new UriQueryUndefined();

  public static UriQuery undefined() {
    return UNDEFINED;
  }

  public static UriQuery param(@Nullable String key, String value) {
    return UriQuery.param(key, value, UriQuery.undefined());
  }

  public static UriQuery param(String value) {
    return UriQuery.param(value, UriQuery.undefined());
  }

  static UriQuery param(@Nullable String key, String value, UriQuery tail) {
    Objects.requireNonNull(value, "value");
    return new UriQueryParam(key, value, tail);
  }

  static UriQuery param(String value, UriQuery tail) {
    Objects.requireNonNull(value, "value");
    return new UriQueryParam(null, value, tail);
  }

  public static UriQuery of(@Nullable String... keyValuePairs) {
    Objects.requireNonNull(keyValuePairs);
    final int n = keyValuePairs.length;
    if (n % 2 != 0) {
      throw new IllegalArgumentException("Odd number of key-value pairs");
    }
    final UriQueryBuilder builder = new UriQueryBuilder();
    for (int i = 0; i < n; i += 2) {
      builder.addParam(keyValuePairs[i], keyValuePairs[i + 1]);
    }
    return builder.build();
  }

  public static UriQuery from(Map<? extends String, ? extends String> params) {
    Objects.requireNonNull(params);
    if (params instanceof UriQuery) {
      return (UriQuery) params;
    } else {
      final UriQueryBuilder builder = new UriQueryBuilder();
      builder.addAll(params);
      return builder.build();
    }
  }

  public static UriQuery parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, UriQuery> cache = UriQuery.cache();
    UriQuery query = cache.get(part);
    if (query == null) {
      final Input input = new StringInput(part);
      query = UriQuery.parse(input);
      if (input.isCont()) {
        throw new ParseException(Diagnostic.unexpected(input));
      } else if (input.isError()) {
        throw new ParseException(input.getError());
      }
      query = cache.put(part, query);
    }
    return query;
  }

  public static UriQuery parse(Input input) {
    final UriQueryBuilder builder = new UriQueryBuilder();
    do {
      UriQuery.parseParam(input, builder);
      if (input.isCont() && input.head() == '&') {
        input.step();
        continue;
      } else if (input.isReady()) {
        return builder.build();
      }
    } while (true);
  }

  static void parseParam(Input input, UriQueryBuilder builder) {
    final String key = UriQuery.parseKey(input);
    if (input.isCont() && input.head() == '=') {
      input.step();
      final String value = UriQuery.parseValue(input);
      if (input.isReady()) {
        builder.addParam(key, value);
        return;
      }
    } else if (input.isReady()) {
      builder.addParam(key);
      return;
    }
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  static String parseKey(Input input) {
    final Utf8DecodedOutput<String> output = new Utf8DecodedOutput<String>(new StringOutput());
    int c = 0;
    do {
      while (input.isCont()) {
        c = input.head();
        if (Uri.isParamChar(c)) {
          input.step();
          output.write(c);
        } else {
          break;
        }
      }
      if (input.isCont() && c == '%') {
        input.step();
      } else if (input.isReady()) {
        return output.getNonNull();
      } else {
        break;
      }
      int c1 = 0;
      if (input.isCont()) {
        c1 = input.head();
        if (Base16.isDigit(c1)) {
          input.step();
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
      int c2 = 0;
      if (input.isCont()) {
        c2 = input.head();
        if (Base16.isDigit(c2)) {
          input.step();
          output.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c2));
          continue;
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
    } while (true);
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  static String parseValue(Input input) {
    final Utf8DecodedOutput<String> output = new Utf8DecodedOutput<String>(new StringOutput());
    int c = 0;
    do {
      while (input.isCont()) {
        c = input.head();
        if (Uri.isParamChar(c) || c == '=') {
          input.step();
          output.write(c);
        } else {
          break;
        }
      }
      if (input.isCont() && c == '%') {
        input.step();
      } else if (input.isReady()) {
        return output.getNonNull();
      } else {
        break;
      }
      int c1 = 0;
      if (input.isCont()) {
        c1 = input.head();
        if (Base16.isDigit(c1)) {
          input.step();
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
      int c2 = 0;
      if (input.isCont()) {
        c2 = input.head();
        if (Base16.isDigit(c2)) {
          input.step();
          output.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c2));
          continue;
        } else {
          throw new ParseException(Diagnostic.expected("hex digit", input));
        }
      } else if (input.isDone()) {
        throw new ParseException(Diagnostic.expected("hex digit", input));
      } else {
        break;
      }
    } while (true);
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  public static UriQuery fromJsonString(String value) {
    return UriQuery.parse(value);
  }

  public static String toJsonString(UriQuery query) {
    return query.toString();
  }

  public static UriQuery fromWamlString(String value) {
    return UriQuery.parse(value);
  }

  public static String toWamlString(UriQuery query) {
    return query.toString();
  }

  private static final ThreadLocal<CacheMap<String, UriQuery>> CACHE = new ThreadLocal<CacheMap<String, UriQuery>>();

  private static CacheMap<String, UriQuery> cache() {
    CacheMap<String, UriQuery> cache = CACHE.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.query.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 256;
      }
      cache = new LruCacheMap<String, UriQuery>(cacheSize);
      CACHE.set(cache);
    }
    return cache;
  }

}

final class UriQueryParam extends UriQuery {

  final @Nullable String key;

  final String value;

  UriQuery tail;

  transient @Nullable String string;

  UriQueryParam(@Nullable String key, String value, UriQuery tail) {
    this.key = key;
    this.value = value;
    this.tail = tail;
  }

  @Override
  public boolean isDefined() {
    return true;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public Map.Entry<String, String> head() {
    return new SimpleImmutableEntry<String, String>(this.key, this.value);
  }

  @Override
  public @Nullable String key() {
    return this.key;
  }

  @Override
  public String value() {
    return this.value;
  }

  @Override
  public UriQuery tail() {
    return this.tail;
  }

  @Override
  void setTail(UriQuery tail) {
    this.tail = tail;
  }

  @Override
  UriQuery dealias() {
    return new UriQueryParam(this.key, this.value, this.tail);
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    if (this.string != null) {
      output.append(this.string);
    } else {
      UriQuery.writeString(output, this);
    }
  }

  @Override
  public String toString() {
    if (this.string == null) {
      this.string = this.toString(null);
    }
    return this.string;
  }

}

final class UriQueryUndefined extends UriQuery {

  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public boolean isEmpty() {
    return true;
  }

  @Override
  public Map.Entry<String, String> head() {
    throw new NoSuchElementException();
  }

  @Override
  public @Nullable String key() {
    throw new NoSuchElementException();
  }

  @Override
  public String value() {
    throw new NoSuchElementException();
  }

  @Override
  public UriQuery tail() {
    throw new UnsupportedOperationException();
  }

  @Override
  void setTail(UriQuery tail) {
    throw new UnsupportedOperationException();
  }

  @Override
  UriQuery dealias() {
    return this;
  }

  @Override
  public UriQuery updated(@Nullable String key, @Nullable String value) {
    Objects.requireNonNull(key, "key");
    Objects.requireNonNull(value, "value");
    return UriQuery.param(key, value, this);
  }

  @Override
  public UriQuery removed(@Nullable Object key) {
    Objects.requireNonNull(key);
    return this;
  }

  @Override
  public UriQuery appended(String value) {
    return UriQuery.param(value, this);
  }

  @Override
  public UriQuery appended(@Nullable String key, String value) {
    return UriQuery.param(key, value, this);
  }

  @Override
  public UriQuery appended(@Nullable String... keyValuePairs) {
    return UriQuery.of(keyValuePairs);
  }

  @Override
  public UriQuery appendedAll(Map<? extends String, ? extends String> params) {
    return UriQuery.from(params);
  }

  @Override
  public UriQuery prepended(String value) {
    return UriQuery.param(value, this);
  }

  @Override
  public UriQuery prepended(@Nullable String key, String value) {
    return UriQuery.param(key, value, this);
  }

  @Override
  public UriQuery prepended(@Nullable String... keyValuePairs) {
    return UriQuery.of(keyValuePairs);
  }

  @Override
  public UriQuery prependedAll(Map<? extends String, ? extends String> params) {
    return UriQuery.from(params);
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UriQuery", "undefined").endInvoke();
  }

  @Override
  public void writeString(Appendable output) {
    // blank
  }

  @Override
  public String toString() {
    return "";
  }

}

final class UriQueryEntryIterator implements Iterator<Map.Entry<String, String>> {

  UriQuery query;

  UriQueryEntryIterator(UriQuery query) {
    this.query = query;
  }

  @Override
  public boolean hasNext() {
    return !this.query.isEmpty();
  }

  @Override
  public Map.Entry<String, String> next() {
    final UriQuery query = this.query;
    if (query.isEmpty()) {
      throw new NoSuchElementException();
    }
    final Map.Entry<String, String> param = query.head();
    this.query = query.tail();
    return param;
  }

}

final class UriQueryEntrySet extends AbstractSet<Map.Entry<String, String>> {

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
  public Iterator<Map.Entry<String, String>> iterator() {
    return this.query.iterator();
  }

}

final class UriQueryKeyIterator implements Iterator<String> {

  UriQuery query;

  UriQueryKeyIterator(UriQuery query) {
    this.query = query;
  }

  @Override
  public boolean hasNext() {
    return !this.query.isEmpty();
  }

  @Override
  public @Nullable String next() {
    final UriQuery query = this.query;
    if (query.isEmpty()) {
      throw new NoSuchElementException();
    }
    final String key = query.key();
    this.query = query.tail();
    return key;
  }

}

final class UriQueryKeySet extends AbstractSet<String> {

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
  public Iterator<String> iterator() {
    return this.query.keyIterator();
  }

}

final class UriQueryValueIterator implements Iterator<String> {

  UriQuery query;

  UriQueryValueIterator(UriQuery query) {
    this.query = query;
  }

  @Override
  public boolean hasNext() {
    return !this.query.isEmpty();
  }

  @Override
  public String next() {
    final UriQuery query = this.query;
    if (query.isEmpty()) {
      throw new NoSuchElementException();
    }
    final String value = query.value();
    this.query = query.tail();
    return value;
  }

}

final class UriQueryValues extends AbstractCollection<String> {

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
  public Iterator<String> iterator() {
    return this.query.valueIterator();
  }

}
