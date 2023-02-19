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

package swim.http;

import java.util.AbstractCollection;
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
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parse;
import swim.codec.StringInput;
import swim.codec.StringOutput;
import swim.codec.Write;
import swim.codec.WriteException;
import swim.collections.StringTrieMap;
import swim.util.Assume;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;
import swim.util.UpdatableMap;

@Public
@Since("5.0")
public final class HttpHeaders implements UpdatableMap<String, String>, Iterable<HttpHeader>, ToSource, ToString {

  int flags;
  int size;
  HttpHeader[] array;

  HttpHeaders(int flags, int size, HttpHeader[] array) {
    this.flags = flags;
    this.array = array;
    this.size = size;
  }

  @Override
  public boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public int size() {
    return this.size;
  }

  @Override
  public boolean containsKey(@Nullable Object key) {
    if (key instanceof String) {
      final String name = (String) key;
      for (int i = 0; i < this.size; i += 1) {
        final HttpHeader header = this.array[i];
        if (name.equalsIgnoreCase(header.name)) {
          return true;
        }
      }
    }
    return false;
  }

  public boolean containsKey(HttpHeaderType<?> type) {
    Objects.requireNonNull(type);
    return this.containsKey((Object) type.name());
  }

  @Override
  public boolean containsValue(@Nullable Object value) {
    if (value instanceof String) {
      for (int i = 0; i < this.size; i += 1) {
        final HttpHeader header = this.array[i];
        if (value.equals(header.value)) {
          return true;
        }
      }
    }
    return false;
  }

  @Override
  public @Nullable String get(@Nullable Object key) {
    if (key instanceof String) {
      final String name = (String) key;
      for (int i = 0; i < this.size; i += 1) {
        final HttpHeader header = this.array[i];
        if (name.equalsIgnoreCase(header.name)) {
          return header.value;
        }
      }
    }
    return null;
  }

  public @Nullable String get(HttpHeaderType<?> type) {
    Objects.requireNonNull(type, "type");
    return this.get((Object) type.name());
  }

  public @Nullable HttpHeader getHeader(String name) {
    Objects.requireNonNull(name, "name");
    for (int i = 0; i < this.size; i += 1) {
      final HttpHeader header = this.array[i];
      if (name.equalsIgnoreCase(header.name)) {
        return header;
      }
    }
    return null;
  }

  public @Nullable HttpHeader getHeader(HttpHeaderType<?> type) {
    Objects.requireNonNull(type, "type");
    return this.getHeader(type.name());
  }

  public <V> @Nullable V getValue(HttpHeaderType<V> type) {
    Objects.requireNonNull(type, "type");
    final String name = type.name();
    for (int i = 0; i < this.size; i += 1) {
      final HttpHeader header = this.array[i];
      if (name.equalsIgnoreCase(header.name)) {
        return type.getValue(header);
      }
    }
    return null;
  }

  @Override
  public @Nullable String put(@Nullable String name, @Nullable String value) {
    Objects.requireNonNull(name, "name");
    Objects.requireNonNull(value, "value");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    HttpHeader[] array = this.array;
    for (int i = 0; i < n; i += 1) {
      final HttpHeader header = array[i];
      if (name.equalsIgnoreCase(header.name)) {
        if ((this.flags & ALIASED_FLAG) != 0) {
          final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n)];
          System.arraycopy(array, 0, newArray, 0, n);
          array = newArray;
          this.array = array;
          this.flags &= ~ALIASED_FLAG;
        }
        array[i] = header.withValue(value);
        return header.value;
      }
    }
    if (n + 1 > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + 1)];
      System.arraycopy(array, 0, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    }
    array[n] = HttpHeader.of(name, value);
    this.size = n + 1;
    return null;
  }

  public <V> @Nullable String put(HttpHeaderType<V> type, V value) {
    Objects.requireNonNull(type, "type");
    Objects.requireNonNull(value, "value");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    final String name = type.name();
    HttpHeader[] array = this.array;
    for (int i = 0; i < n; i += 1) {
      final HttpHeader header = array[i];
      if (name.equalsIgnoreCase(header.name)) {
        if ((this.flags & ALIASED_FLAG) != 0) {
          final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n)];
          System.arraycopy(array, 0, newArray, 0, n);
          array = newArray;
          this.array = array;
          this.flags &= ~ALIASED_FLAG;
        }
        array[i] = type.of(value);
        return header.value;
      }
    }
    if (n + 1 > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + 1)];
      System.arraycopy(array, 0, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    }
    array[n] = type.of(value);
    this.size = n + 1;
    return null;
  }

  @Override
  public void putAll(Map<? extends String, ? extends String> map) {
    for (Map.Entry<? extends String, ? extends String> entry : map.entrySet()) {
      this.put(entry.getKey(), entry.getValue());
    }
  }

  @Override
  public @Nullable String putIfAbsent(String name, String value) {
    Objects.requireNonNull(name, "name");
    Objects.requireNonNull(value, "value");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    HttpHeader[] array = this.array;
    for (int i = 0; i < n; i += 1) {
      final HttpHeader header = array[i];
      if (name.equalsIgnoreCase(header.name)) {
        return header.value;
      }
    }
    if (n + 1 > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + 1)];
      System.arraycopy(array, 0, newArray, 0, n);
      array = newArray;
      this.array = newArray;
      this.flags &= ~ALIASED_FLAG;
    }
    array[n] = HttpHeader.of(name, value);
    this.size = n + 1;
    return null;
  }

  public <V> @Nullable String putIfAbsent(HttpHeaderType<V> type, V value) {
    Objects.requireNonNull(type, "type");
    Objects.requireNonNull(value, "value");
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    final String name = type.name();
    HttpHeader[] array = this.array;
    for (int i = 0; i < n; i += 1) {
      final HttpHeader header = array[i];
      if (name.equalsIgnoreCase(header.name)) {
        return header.value;
      }
    }
    if (n + 1 > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + 1)];
      System.arraycopy(array, 0, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    }
    array[n] = type.of(value);
    this.size = n + 1;
    return null;
  }

  public HttpHeaders let(String name, String value) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return this.updated(name, value);
    } else {
      this.put(name, value);
      return this;
    }
  }

  public <V> HttpHeaders let(HttpHeaderType<V> type, V value) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      return this.updated(type, value);
    } else {
      this.put(type, value);
      return this;
    }
  }

  @Override
  public HttpHeaders updated(@Nullable String name, @Nullable String value) {
    Objects.requireNonNull(name, "name");
    Objects.requireNonNull(value, "value");
    final int n = this.size;
    final HttpHeader[] array = this.array;
    for (int i = 0; i < n; i += 1) {
      final HttpHeader header = array[i];
      if (name.equalsIgnoreCase(header.name)) {
        final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n)];
        System.arraycopy(array, 0, newArray, 0, n);
        newArray[i] = header.withValue(value);
        return new HttpHeaders(0, n, newArray);
      }
    }
    final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + 1)];
    System.arraycopy(array, 0, newArray, 0, n);
    newArray[n] = HttpHeader.of(name, value);
    return new HttpHeaders(0, n + 1, newArray);
  }

  public <V> HttpHeaders updated(HttpHeaderType<V> type, V value) {
    Objects.requireNonNull(type, "type");
    Objects.requireNonNull(value, "value");
    final int n = this.size;
    final String name = type.name();
    final HttpHeader[] array = this.array;
    for (int i = 0; i < n; i += 1) {
      final HttpHeader header = array[i];
      if (name.equalsIgnoreCase(header.name)) {
        final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n)];
        System.arraycopy(array, 0, newArray, 0, n);
        newArray[i] = type.of(value);
        return new HttpHeaders(0, n, newArray);
      }
    }
    final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + 1)];
    System.arraycopy(array, 0, newArray, 0, n);
    newArray[n] = type.of(value);
    return new HttpHeaders(0, n + 1, newArray);
  }

  public HttpHeaders updatedAll(Map<? extends String, ? extends String> headers) {
    final HttpHeaders newHeaders = this.clone();
    newHeaders.putAll(headers);
    return newHeaders;
  }

  @Override
  public @Nullable String remove(@Nullable Object key) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    if (n != 0 && key instanceof String) {
      final String name = (String) key;
      HttpHeader[] array = this.array;
      for (int i = 0; i < n; i += 1) {
        final HttpHeader header = array[i];
        if (name.equalsIgnoreCase(header.name)) {
          if ((this.flags & ALIASED_FLAG) != 0) {
            final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n - 1)];
            System.arraycopy(array, 0, newArray, 0, i);
            System.arraycopy(array, i + 1, newArray, i, n - i - 1);
            array = newArray;
            this.array = array;
            this.flags &= ~ALIASED_FLAG;
          } else {
            System.arraycopy(array, i + 1, array, i, n - i - 1);
            array[n - 1] = null;
          }
          this.size = n - 1;
          return header.value;
        }
      }
    }
    return null;
  }

  public @Nullable String remove(HttpHeaderType<?> type) {
    Objects.requireNonNull(type, "type");
    return this.remove((Object) type.name());
  }

  @Override
  public HttpHeaders removed(@Nullable Object key) {
    final int n = this.size;
    if (n != 0 && key instanceof String) {
      final String name = (String) key;
      final HttpHeader[] array = this.array;
      for (int i = 0; i < n; i += 1) {
        final HttpHeader header = array[i];
        if (name.equalsIgnoreCase(header.name)) {
          final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n - 1)];
          System.arraycopy(array, 0, newArray, 0, i);
          System.arraycopy(array, i + 1, newArray, i, n - i - 1);
          return new HttpHeaders(0, n - 1, newArray);
        }
      }
    }
    return this.clone();
  }

  public <V> HttpHeaders removed(HttpHeaderType<V> type) {
    Objects.requireNonNull(type, "type");
    return this.removed(type.name());
  }

  public HttpHeader get(int index) {
    if (0 <= index && index < this.size) {
      return this.array[index];
    } else {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
  }

  public boolean add(HttpHeader header) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    HttpHeader[] array = this.array;
    if (n + 1 > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + 1)];
      System.arraycopy(array, 0, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    }
    array[n] = header;
    this.size = n + 1;
    return true;
  }

  public boolean addAll(Collection<? extends HttpHeader> headers) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int k = headers.size();
    if (k == 0) {
      return false;
    }
    int n = this.size;
    HttpHeader[] array = this.array;
    if (n + k > array.length || (this.flags & ALIASED_FLAG) != 0) {
      final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + k)];
      System.arraycopy(array, 0, newArray, 0, n);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    }
    for (HttpHeader header : headers) {
      array[n] = header;
      n += 1;
    }
    this.size = n;
    return true;
  }

  public HttpHeaders appended(HttpHeader header) {
    final int n = this.size;
    final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + 1)];
    System.arraycopy(this.array, 0, newArray, 0, n);
    newArray[n] = header;
    return new HttpHeaders(0, n + 1, newArray);
  }

  public HttpHeaders appendedAll(Collection<? extends HttpHeader> headers) {
    int n = this.size;
    final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n + headers.size())];
    System.arraycopy(this.array, 0, newArray, 0, n);
    for (HttpHeader header : headers) {
      newArray[n] = header;
      n += 1;
    }
    return new HttpHeaders(0, n, newArray);
  }

  public HttpHeaders prepended(HttpHeader header) {
    final int n = this.size;
    final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(1 + n)];
    newArray[0] = header;
    System.arraycopy(this.array, 0, newArray, 1, n);
    return new HttpHeaders(0, 1 + n, newArray);
  }

  public HttpHeaders prependedAll(Collection<? extends HttpHeader> headers) {
    final int n = this.size;
    final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(headers.size() + n)];
    int k = 0;
    for (HttpHeader header : headers) {
      newArray[k] = header;
      k += 1;
    }
    System.arraycopy(this.array, 0, newArray, k, n);
    return new HttpHeaders(0, k + n, newArray);
  }

  public HttpHeader remove(int index) {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    final int n = this.size;
    if (index < 0 || index >= n) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    HttpHeader[] array = this.array;
    final HttpHeader oldHeader = array[index];
    if ((this.flags & ALIASED_FLAG) != 0) {
      final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n - 1)];
      System.arraycopy(array, 0, newArray, 0, index);
      System.arraycopy(array, index + 1, newArray, index, n - index - 1);
      array = newArray;
      this.array = array;
      this.flags &= ~ALIASED_FLAG;
    } else {
      System.arraycopy(array, index + 1, array, index, n - index - 1);
      array[n - 1] = null;
    }
    this.size = n - 1;
    return oldHeader;
  }

  public HttpHeaders removed(int index) {
    final int n = this.size;
    if (index < 0 || index >= n) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    final HttpHeader[] array = this.array;
    final HttpHeader[] newArray = new HttpHeader[HttpHeaders.expand(n - 1)];
    System.arraycopy(array, 0, newArray, 0, index);
    System.arraycopy(array, index + 1, newArray, index, n - index - 1);
    return new HttpHeaders(0, n - 1, newArray);
  }

  @Override
  public void clear() {
    if ((this.flags & IMMUTABLE_FLAG) != 0) {
      throw new UnsupportedOperationException("Immutable");
    }
    this.array = EMPTY_ARRAY;
    this.size = 0;
    this.flags |= ALIASED_FLAG;
  }

  public boolean isMutable() {
    return (this.flags & IMMUTABLE_FLAG) == 0;
  }

  public HttpHeaders asMutable() {
    return this.isMutable() ? this : this.clone();
  }

  @Override
  public HttpHeaders clone() {
    this.flags |= ALIASED_FLAG;
    return new HttpHeaders(this.flags & ~(IMMUTABLE_FLAG | ALIASED_FLAG),
                           this.size, this.array);
  }

  public HttpHeaders commit() {
    this.flags |= IMMUTABLE_FLAG;
    return this;
  }

  @Override
  public void forEach(BiConsumer<? super String, ? super String> action) {
    for (int i = 0; i < this.size; i += 1) {
      final HttpHeader header = this.array[i];
      action.accept(header.name, header.value);
    }
  }

  @Override
  public void forEach(Consumer<? super HttpHeader> action) {
    for (int i = 0; i < this.size; i += 1) {
      action.accept(this.array[i]);
    }
  }

  @Override
  public Iterator<HttpHeader> iterator() {
    if (this.size == 0) {
      return HttpHeadersIterator.EMPTY;
    } else {
      return new HttpHeadersIterator(this);
    }
  }

  public Iterator<String> keyIterator() {
    return new HttpHeadersKeyIterator(this);
  }

  public Iterator<String> valueIterator() {
    return new HttpHeadersValueIterator(this);
  }

  @Override
  public Set<Map.Entry<String, String>> entrySet() {
    return Assume.conforms(new HttpHeadersEntrySet(this));
  }

  @Override
  public Set<String> keySet() {
    return new HttpHeadersKeySet(this);
  }

  @Override
  public Collection<String> values() {
    return new HttpHeadersValues(this);
  }

  public Write<?> write(Output<?> output) {
    return WriteHttpHeaders.write(output, this.iterator(), null, null, 0, 1);
  }

  public Write<?> write() {
    return new WriteHttpHeaders(this.iterator(), null, null, 0, 1);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Map<?, ?>) {
      return this.entrySet().equals(((Map<?, ?>) other).entrySet());
    }
    return false;
  }

  @Override
  public int hashCode() {
    int code = 0;
    for (int i = 0; i < this.size; i += 1) {
      code += this.array[i].hashCode();
    }
    return code;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("HttpHeaders", "of");
    for (int i = 0; i < this.size; i += 1) {
      notation.appendArgument(this.array[i]);
    }
    notation.endInvoke();
  }

  @Override
  public void writeString(Appendable output) {
    this.write(StringOutput.from(output)).checkDone();
  }

  @Override
  public String toString() {
    final StringOutput output = new StringOutput();
    this.write(output).checkDone();
    return output.get();
  }

  static final int IMMUTABLE_FLAG = 1 << 0;

  static final int ALIASED_FLAG = 1 << 1;

  private static final HttpHeader[] EMPTY_ARRAY = new HttpHeader[0];

  private static final HttpHeaders EMPTY = new HttpHeaders(IMMUTABLE_FLAG | ALIASED_FLAG, 0, EMPTY_ARRAY);

  public static HttpHeaders empty() {
    return EMPTY;
  }

  public static HttpHeaders of() {
    return new HttpHeaders(ALIASED_FLAG, 0, EMPTY_ARRAY);
  }

  public static HttpHeaders of(HttpHeader header) {
    return new HttpHeaders(0, 1, new HttpHeader[] {header});
  }

  public static HttpHeaders of(HttpHeader... headers) {
    return new HttpHeaders(ALIASED_FLAG, headers.length, headers);
  }

  public static Parse<HttpHeaders> parse(Input input, @Nullable HttpHeaderRegistry headerRegistry) {
    return ParseHttpHeaders.parse(input, headerRegistry != null ? headerRegistry.headerTypes() : null, null, null, null, null, 1);
  }

  public static Parse<HttpHeaders> parse(Input input) {
    return HttpHeaders.parse(input, HttpHeader.registry());
  }

  public static Parse<HttpHeaders> parse(@Nullable HttpHeaderRegistry headerRegistry) {
    return new ParseHttpHeaders(headerRegistry != null ? headerRegistry.headerTypes() : null, null, null, null, null, 1);
  }

  public static Parse<HttpHeaders> parse() {
    return HttpHeaders.parse(HttpHeader.registry());
  }

  public static HttpHeaders parse(String string) {
    final Input input = new StringInput(string);
    Parse<HttpHeaders> parse = HttpHeaders.parse(input);
    if (input.isCont() && !parse.isError()) {
      parse = Parse.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parse = Parse.error(input.getError());
    }
    return parse.getNonNull();
  }

  static int expand(int n) {
    n = Math.max(8, n) - 1;
    n |= n >> 1;
    n |= n >> 2;
    n |= n >> 4;
    n |= n >> 8;
    n |= n >> 16;
    return n + 1;
  }

}

final class HttpHeadersIterator implements Iterator<HttpHeader> {

  final HttpHeaders headers;
  int index;
  int direction;

  HttpHeadersIterator(HttpHeaders headers, int index, int direction) {
    this.headers = headers;
    this.index = index;
    this.direction = direction;
  }

  HttpHeadersIterator(HttpHeaders headers) {
    this(headers, 0, 0);
  }

  @Override
  public boolean hasNext() {
    return this.index < this.headers.size;
  }

  @Override
  public HttpHeader next() {
    final int index = this.index;
    if (index >= this.headers.size) {
      throw new NoSuchElementException();
    }
    final HttpHeader header = this.headers.get(index);
    this.index = index + 1;
    this.direction = 1;
    return header;
  }

  @Override
  public void remove() {
    if (this.direction == 0) {
      throw new IllegalStateException();
    }
    if (this.direction > 0) {
      this.index -= 1;
    }
    this.headers.remove(this.index);
    this.direction = 0;
  }

  static final HttpHeadersIterator EMPTY = new HttpHeadersIterator(HttpHeaders.empty(), 0, 0);

}

final class HttpHeadersEntrySet extends AbstractSet<HttpHeader> {

  final HttpHeaders headers;

  HttpHeadersEntrySet(HttpHeaders headers) {
    this.headers = headers;
  }

  @Override
  public int size() {
    return this.headers.size();
  }

  @Override
  public Iterator<HttpHeader> iterator() {
    return this.headers.iterator();
  }

}

final class HttpHeadersKeyIterator implements Iterator<String> {

  final HttpHeaders headers;
  int index;
  int direction;

  HttpHeadersKeyIterator(HttpHeaders headers, int index, int direction) {
    this.headers = headers;
    this.index = index;
    this.direction = direction;
  }

  HttpHeadersKeyIterator(HttpHeaders headers) {
    this(headers, 0, 0);
  }

  @Override
  public boolean hasNext() {
    return this.index < this.headers.size;
  }

  @Override
  public String next() {
    final int index = this.index;
    if (index >= this.headers.size) {
      throw new NoSuchElementException();
    }
    final HttpHeader header = this.headers.get(index);
    this.index = index + 1;
    this.direction = 1;
    return header.name;
  }

  @Override
  public void remove() {
    if (this.direction == 0) {
      throw new IllegalStateException();
    }
    if (this.direction > 0) {
      this.index -= 1;
    }
    this.headers.remove(this.index);
    this.direction = 0;
  }

}

final class HttpHeadersKeySet extends AbstractSet<String> {

  final HttpHeaders headers;

  HttpHeadersKeySet(HttpHeaders headers) {
    this.headers = headers;
  }

  @Override
  public int size() {
    return this.headers.size();
  }

  @Override
  public Iterator<String> iterator() {
    return this.headers.keyIterator();
  }

}

final class HttpHeadersValueIterator implements Iterator<String> {

  final HttpHeaders headers;
  int index;
  int direction;

  HttpHeadersValueIterator(HttpHeaders headers, int index, int direction) {
    this.headers = headers;
    this.index = index;
    this.direction = direction;
  }

  HttpHeadersValueIterator(HttpHeaders headers) {
    this(headers, 0, 0);
  }

  @Override
  public boolean hasNext() {
    return this.index < this.headers.size;
  }

  @Override
  public String next() {
    final int index = this.index;
    if (index >= this.headers.size) {
      throw new NoSuchElementException();
    }
    final HttpHeader header = this.headers.get(index);
    this.index = index + 1;
    this.direction = 1;
    return header.value;
  }

  @Override
  public void remove() {
    if (this.direction == 0) {
      throw new IllegalStateException();
    }
    if (this.direction > 0) {
      this.index -= 1;
    }
    this.headers.remove(this.index);
    this.direction = 0;
  }

}

final class HttpHeadersValues extends AbstractCollection<String> {

  final HttpHeaders headers;

  HttpHeadersValues(HttpHeaders headers) {
    this.headers = headers;
  }

  @Override
  public int size() {
    return this.headers.size();
  }

  @Override
  public Iterator<String> iterator() {
    return this.headers.valueIterator();
  }

}

final class ParseHttpHeaders extends Parse<HttpHeaders> {

  final @Nullable StringTrieMap<HttpHeaderType<?>> headerTypes;
  final @Nullable HttpHeaders headers;
  final @Nullable StringTrieMap<HttpHeaderType<?>> nameTrie;
  final @Nullable StringBuilder nameBuilder;
  final @Nullable StringBuilder valueBuilder;
  final int step;

  ParseHttpHeaders(@Nullable StringTrieMap<HttpHeaderType<?>> headerTypes,
                   @Nullable HttpHeaders headers,
                   @Nullable StringTrieMap<HttpHeaderType<?>> nameTrie,
                   @Nullable StringBuilder nameBuilder,
                   @Nullable StringBuilder valueBuilder, int step) {
    this.headerTypes = headerTypes;
    this.headers = headers;
    this.nameTrie = nameTrie;
    this.nameBuilder = nameBuilder;
    this.valueBuilder = valueBuilder;
    this.step = step;
  }

  @Override
  public Parse<HttpHeaders> consume(Input input) {
    return ParseHttpHeaders.parse(input, this.headerTypes, this.headers, this.nameTrie,
                                  this.nameBuilder, this.valueBuilder, this.step);
  }

  static Parse<HttpHeaders> parse(Input input,
                                  @Nullable StringTrieMap<HttpHeaderType<?>> headerTypes,
                                  @Nullable HttpHeaders headers,
                                  @Nullable StringTrieMap<HttpHeaderType<?>> nameTrie,
                                  @Nullable StringBuilder nameBuilder,
                                  @Nullable StringBuilder valueBuilder,  int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input.step();
            if (headerTypes != null) {
              final StringTrieMap<HttpHeaderType<?>> subTrie = headerTypes.getBranch(headerTypes.normalized(c));
              if (subTrie != null) {
                nameTrie = subTrie;
              } else {
                nameBuilder = new StringBuilder();
                nameBuilder.appendCodePoint(c);
                nameTrie = null;
              }
            } else {
              nameBuilder = new StringBuilder();
              nameBuilder.appendCodePoint(c);
            }
            step = 2;
          } else {
            if (headers == null) {
              headers = HttpHeaders.of();
            }
            return Parse.done(headers);
          }
        } else if (input.isDone()) {
          if (headers == null) {
            headers = HttpHeaders.of();
          }
          return Parse.done(headers);
        }
      }
      if (step == 2) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isTokenChar(c)) {
            input.step();
            if (nameTrie != null) {
              final StringTrieMap<HttpHeaderType<?>> subTrie = nameTrie.getBranch(nameTrie.normalized(c));
              if (subTrie != null) {
                nameTrie = subTrie;
              } else {
                nameBuilder = new StringBuilder(nameTrie.prefix());
                nameBuilder.appendCodePoint(c);
                nameTrie = null;
              }
            } else {
              Assume.nonNull(nameBuilder).appendCodePoint(c);
            }
          } else {
            break;
          }
        }
        if (input.isCont()) {
          step = 3;
        } else if (input.isDone()) {
          return Parse.error(Diagnostic.unexpected(input));
        }
      }
      if (step == 3) {
        if (input.isCont() && input.head() == ':') {
          input.step();
          step = 5;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected(':', input));
        }
      }
      if (step == 5) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isFieldChar(c)) {
            input.step();
            if (valueBuilder == null) {
              valueBuilder = new StringBuilder();
            }
            valueBuilder.appendCodePoint(c);
          } else {
            break;
          }
        }
        if (input.isCont() && Http.isSpace(c)) {
          input.step();
          step = 6;
        } else if (input.isReady()) {
          step = 7;
        }
      }
      if (step == 6) {
        while (input.isCont()) {
          c = input.head();
          if (Http.isSpace(c)) {
            input.step();
          } else {
            break;
          }
        }
        if (input.isCont() && Http.isFieldChar(c)) {
          if (valueBuilder != null) {
            valueBuilder.appendCodePoint(' ');
          }
          step = 5;
          continue;
        } else if (input.isReady()) {
          step = 7;
        }
      }
      if (step == 7) {
        if (input.isCont() && input.head() == '\r') {
          input.step();
          step = 8;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("carriage return", input));
        }
      }
      if (step == 8) {
        if (input.isCont() && input.head() == '\n') {
          input.step();
          step = 9;
          continue;
        } else if (input.isReady()) {
          return Parse.error(Diagnostic.expected("line feed", input));
        }
      }
      if (step == 9) {
        if (input.isCont() && Http.isSpace(input.head())) {
          input.step();
          step = 6;
          continue;
        } else if (input.isReady()) {
          final HttpHeaderType<?> type = nameTrie != null ? nameTrie.value() : null;
          final String value = valueBuilder != null ? valueBuilder.toString() : "";
          final HttpHeader header;
          if (type != null) {
            header = type.of(value);
          } else {
            final String name = nameTrie != null ? nameTrie.prefix() : Assume.nonNull(nameBuilder).toString();
            header = HttpHeader.of(name, value);
          }
          if (headers == null) {
            headers = HttpHeaders.of();
          }
          headers.add(header);
          nameTrie = null;
          nameBuilder = null;
          valueBuilder = null;
          step = 1;
          continue;
        }
      }
      break;
    } while (true);
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseHttpHeaders(headerTypes, headers, nameTrie,
                                nameBuilder, valueBuilder, step);
  }

}

final class WriteHttpHeaders extends Write<Object> {

  final Iterator<? extends Map.Entry<String, String>> headers;
  final @Nullable String name;
  final @Nullable String value;
  final int index;
  final int step;

  WriteHttpHeaders(Iterator<? extends Map.Entry<String, String>> headers,
                   @Nullable String name, @Nullable String value,
                   int index, int step) {
    this.headers = headers;
    this.name = name;
    this.value = value;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteHttpHeaders.write(output, this.headers, this.name, this.value,
                                  this.index, this.step);
  }

  static Write<Object> write(Output<?> output,
                             Iterator<? extends Map.Entry<String, String>> headers,
                             @Nullable String name, @Nullable String value,
                             int index, int step) {
    int c = 0;
    do {
      if (step == 1) {
        if (name == null) {
          if (headers.hasNext()) {
            final Map.Entry<String, String> header = headers.next();
            name = header.getKey();
            value = header.getValue();
          } else {
            return Write.done();
          }
        }
        if (name.length() == 0) {
          return Write.error(new WriteException("Blank header name"));
        }
        while (index < name.length() && output.isCont()) {
          c = name.codePointAt(index);
          if (Http.isTokenChar(c)) {
            output.write(c);
            index = name.offsetByCodePoints(index, 1);
          } else {
            return Write.error(new WriteException("Invalid header name: " + name));
          }
        }
        if (index >= name.length()) {
          index = 0;
          step = 2;
        }
      }
      if (step == 2 && output.isCont()) {
        value = Assume.nonNull(value);
        output.write(':');
        if (value.isEmpty()) {
          step = 5;
        } else {
          step = 3;
        }
      }
      if (step == 3 && output.isCont()) {
        output.write(' ');
        step = 4;
      }
      if (step == 4) {
        value = Assume.nonNull(value);
        while (index < value.length() && output.isCont()) {
          c = value.codePointAt(index);
          if (Http.isFieldChar(c) || Http.isSpace(c)) {
            output.write(c);
            index = value.offsetByCodePoints(index, 1);
          } else {
            return Write.error(new WriteException("Invalid header value: " + value));
          }
        }
        if (index >= value.length()) {
          index = 0;
          step = 5;
        }
      }
      if (step == 5 && output.isCont()) {
        output.write('\r');
        step = 6;
      }
      if (step == 6 && output.isCont()) {
        output.write('\n');
        name = null;
        value = null;
        step = 1;
        continue;
      }
      break;
    } while (true);
    if (output.isDone()) {
      return Write.error(new WriteException("Truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteHttpHeaders(headers, name, value, index, step);
  }

}
