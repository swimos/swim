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
import java.lang.reflect.Array;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.NoSuchElementException;
import java.util.Objects;
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
import swim.util.Assume;
import swim.util.CacheMap;
import swim.util.LruCacheMap;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToSource;
import swim.util.ToString;

@Public
@Since("5.0")
public abstract class UriPath extends UriPart implements Collection<String>, Comparable<UriPath>, ToSource, ToString {

  UriPath() {
    // sealed
  }

  public abstract boolean isDefined();

  public abstract boolean isAbsolute();

  public abstract boolean isRelative();

  public abstract boolean isSegment();

  public abstract boolean isSlash();

  @Override
  public abstract boolean isEmpty();

  @Override
  public int size() {
    int n = 0;
    UriPath path = this;
    while (!path.isEmpty()) {
      n += 1;
      path = path.tail();
    }
    return n;
  }

  public abstract String segment();

  public abstract String head();

  public abstract UriPath tail();

  abstract void setTail(UriPath tail);

  abstract UriPath dealias();

  public abstract UriPath parent();

  public abstract UriPath base();

  public String name() {
    if (this.isEmpty()) {
      return "";
    }
    UriPath path = this;
    do {
      final UriPath tail = path.tail();
      if (tail.isEmpty()) {
        return path.isRelative() ? path.head() : "";
      } else {
        path = tail;
      }
    } while (true);
  }

  public UriPath withName(String name) {
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addPath(this.base());
    builder.addSegment(name);
    return builder.build();
  }

  public abstract UriPath body();

  public UriPath foot() {
    if (this.isEmpty()) {
      return this;
    }
    UriPath path = this;
    do {
      final UriPath tail = path.tail();
      if (tail.isEmpty()) {
        return path;
      } else {
        path = tail;
      }
    } while (true);
  }

  public boolean isRelativeTo(UriPath b) {
    UriPath a = this;
    while (!a.isEmpty() && !b.isEmpty()) {
      if (!a.head().equals(b.head())) {
        return false;
      }
      a = a.tail();
      b = b.tail();
    }
    return b.isEmpty();
  }

  public boolean isChildOf(UriPath b) {
    UriPath a = this;
    while (!a.isEmpty() && !b.isEmpty()) {
      if (!a.head().equals(b.head())) {
        return false;
      }
      a = a.tail();
      b = b.tail();
    }
    return b.isEmpty() && !a.isEmpty() && a.tail().isEmpty();
  }

  @Override
  public boolean contains(@Nullable Object component) {
    if (component instanceof String) {
      UriPath path = this;
      while (!path.isEmpty()) {
        if (component.equals(path.head())) {
          return true;
        }
        path = path.tail();
      }
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> components) {
    UriPath path = this;
    HashSet<?> missing = new HashSet<Object>(components);
    while (!path.isEmpty() && !missing.isEmpty()) {
      missing.remove(path.head());
      path = path.tail();
    }
    return missing.isEmpty();
  }

  @Override
  public boolean add(String component) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean addAll(Collection<? extends String> components) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean remove(Object component) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean removeAll(Collection<?> components) {
    throw new UnsupportedOperationException();
  }

  @Override
  public boolean retainAll(Collection<?> components) {
    throw new UnsupportedOperationException();
  }

  @Override
  public void clear() {
    throw new UnsupportedOperationException();
  }

  public UriPath appended(String component) {
    Objects.requireNonNull(component);
    if (component.equals("/")) {
      return this.appendedSlash();
    } else {
      return this.appendedSegment(component);
    }
  }

  public UriPath appended(String... components) {
    if (components.length == 0) {
      return this;
    }
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addPath(UriPath.of(components));
    return builder.build();
  }

  public UriPath appendedAll(Collection<? extends String> components) {
    if (components.isEmpty()) {
      return this;
    }
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addAll(components);
    return builder.build();
  }

  public UriPath appendedSlash() {
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addSlash();
    return builder.build();
  }

  public UriPath appendedSegment(String segment) {
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addSegment(segment);
    return builder.build();
  }

  public UriPath prepended(String component) {
    Objects.requireNonNull(component);
    if (component.equals("/")) {
      return this.prependedSlash();
    } else {
      return this.prependedSegment(component);
    }
  }

  public UriPath prepended(String... components) {
    if (components.length == 0) {
      return this;
    }
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addPath(UriPath.of(components));
    builder.addPath(this);
    return builder.build();
  }

  public UriPath prependedAll(Collection<? extends String> components) {
    if (components.isEmpty()) {
      return this;
    }
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addAll(components);
    builder.addPath(this);
    return builder.build();
  }

  public UriPath prependedSlash() {
    return UriPath.slash(this);
  }

  public UriPath prependedSegment(String segment) {
    if (this.isEmpty() || this.isAbsolute()) {
      return UriPath.segment(segment, this);
    } else {
      return UriPath.segment(segment, UriPath.slash(this));
    }
  }

  public UriPath resolve(UriPath that) {
    if (that.isEmpty()) {
      return this;
    } else if (that.isAbsolute() || this.isEmpty()) {
      return that.removeDotSegments();
    } else {
      return this.merge(that).removeDotSegments();
    }
  }

  public UriPath removeDotSegments() {
    UriPath path = this;
    UriPathBuilder builder = new UriPathBuilder();
    while (!path.isEmpty()) {
      final String head = path.head();
      if (head.equals(".") || head.equals("..")) {
        path = path.tail();
        if (!path.isEmpty()) {
          path = path.tail();
        }
      } else if (path.isSlash()) {
        final UriPath rest = path.tail();
        if (!rest.isEmpty()) {
          final String next = rest.head();
          if (next.equals(".")) {
            path = rest.tail();
            if (path.isEmpty()) {
              path = UriPath.slash();
            }
          } else if (next.equals("..")) {
            path = rest.tail();
            if (path.isEmpty()) {
              path = UriPath.slash();
            }
            if (!builder.isEmpty() && !builder.pop().isSlash()) {
              if (!builder.isEmpty()) {
                builder.pop();
              }
            }
          } else {
            builder.add(head);
            builder.add(next);
            path = rest.tail();
          }
        } else {
          builder.add(path.head());
          path = path.tail();
        }
      } else {
        builder.add(path.head());
        path = path.tail();
      }
    }
    return builder.build();
  }

  public UriPath merge(UriPath that) {
    Objects.requireNonNull(that);
    if (this.isEmpty()) {
      return that;
    }
    UriPath prev = this;
    final UriPathBuilder builder = new UriPathBuilder();
    do {
      final UriPath next = prev.tail();
      if (!next.isEmpty()) {
        if (prev.isSlash()) {
          builder.addSlash();
        } else {
          builder.addSegment(prev.head());
        }
        prev = next;
      } else {
        if (prev.isSlash()) {
          builder.addSlash();
        }
        break;
      }
    } while (true);
    builder.addPath(that);
    return builder.build();
  }

  public UriPath unmerge(UriPath that) {
    UriPath base = this;
    UriPath relative = that;
    do {
      if (base.isEmpty()) {
        if (!relative.isEmpty() && !relative.tail().isEmpty()) {
          return relative.tail();
        } else {
          return relative;
        }
      } else if (base.isRelative()) {
        return relative;
      } else if (relative.isRelative()) {
        return UriPath.slash(relative);
      } else {
        UriPath a = base.tail();
        UriPath b = relative.tail();
        if (!a.isEmpty() && b.isEmpty()) {
          return UriPath.slash();
        } else if (a.isEmpty() || b.isEmpty() || !a.head().equals(b.head())) {
          return b;
        } else {
          a = a.tail();
          b = b.tail();
          if (!a.isEmpty() && b.isEmpty()) {
            return that;
          } else {
            base = a;
            relative = b;
          }
        }
      }
    } while (true);
  }

  @Override
  public Object[] toArray() {
    final Object[] array = new Object[this.size()];
    UriPath path = this;
    int i = 0;
    while (!path.isEmpty()) {
      array[i] = path.head();
      path = path.tail();
      i += 1;
    }
    return array;
  }

  @Override
  public <T> T[] toArray(T[] array) {
    final int n = this.size();
    if (array.length < n) {
      array = Assume.conforms(Array.newInstance(array.getClass().getComponentType(), n));
    }
    UriPath path = this;
    int i = 0;
    while (!path.isEmpty()) {
      array[i] = Assume.conforms(path.head());
      path = path.tail();
      i += 1;
    }
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  @Override
  public void forEach(Consumer<? super String> action) {
    UriPath path = this;
    while (!path.isEmpty()) {
      action.accept(path.head());
      path = path.tail();
    }
  }

  @Override
  public Iterator<String> iterator() {
    return new UriPathIterator(this);
  }

  @Override
  public final int compareTo(UriPath that) {
    return this.toString().compareTo(that.toString());
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriPath) {
      return this.toString().equals(((UriPath) other).toString());
    }
    return false;
  }

  @Override
  public final int hashCode() {
    return Murmur3.seed(this.toString());
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UriPath", "of");
    this.writeArguments(notation);
    notation.endInvoke();
  }

  void writeArguments(Notation notation) {
    UriPath path = this;
    while (!path.isEmpty()) {
      if (path.isSlash()) {
        notation.appendArgument("/");
      } else {
        notation.appendArgument(path.head());
      }
      path = path.tail();
    }
  }

  static void writeString(Appendable output, UriPath path) throws IOException {
    while (!path.isEmpty()) {
      if (path.isSlash()) {
        output.append('/');
      } else {
        final String segment = path.head();
        for (int i = 0, n = segment.length(); i < n; i = segment.offsetByCodePoints(i, 1)) {
          final int c = segment.codePointAt(i);
          if (Uri.isPathChar(c)) {
            output.append((char) c);
          } else {
            Uri.writeEncoded(output, c);
          }
        }
      }
      path = path.tail();
    }
  }

  @Override
  public abstract String toString();

  private static final UriPath EMPTY = new UriPathEmpty();

  public static UriPath empty() {
    return EMPTY;
  }

  private static final UriPath SLASH = new UriPathSlash(EMPTY);

  public static UriPath slash() {
    return SLASH;
  }

  @SuppressWarnings("ReferenceEquality")
  static UriPath slash(UriPath tail) {
    if (tail == EMPTY) {
      return UriPath.slash();
    } else {
      return new UriPathSlash(tail);
    }
  }

  public static UriPath segment(String segment) {
    return UriPath.segment(segment, UriPath.empty());
  }

  static UriPath segment(String segment, UriPath tail) {
    Objects.requireNonNull(segment, "segment");
    return new UriPathSegment(segment, tail);
  }

  public static UriPath component(String component) {
    return UriPath.component(component, UriPath.empty());
  }

  static UriPath component(String component, UriPath tail) {
    Objects.requireNonNull(component, "component");
    if (component.equals("/")) {
      return UriPath.slash();
    } else {
      return UriPath.segment(component);
    }
  }

  public static UriPath of(String... components) {
    Objects.requireNonNull(components);
    if (components.length == 0) {
      return UriPath.empty();
    }
    final UriPathBuilder builder = new UriPathBuilder();
    for (int i = 0; i < components.length; i += 1) {
      builder.add(components[i]);
    }
    return builder.build();
  }

  public static UriPath from(Collection<? extends String> components) {
    Objects.requireNonNull(components);
    if (components instanceof UriPath) {
      return (UriPath) components;
    } else {
      final UriPathBuilder builder = new UriPathBuilder();
      builder.addAll(components);
      return builder.build();
    }
  }

  public static UriPath parse(String part) {
    Objects.requireNonNull(part);
    final CacheMap<String, UriPath> cache = UriPath.cache();
    UriPath path = cache.get(part);
    if (path == null) {
      final Input input = new StringInput(part);
      path = UriPath.parse(input);
      if (input.isCont()) {
        throw new ParseException(Diagnostic.unexpected(input));
      } else if (input.isError()) {
        throw new ParseException(input.getError());
      }
      path = cache.put(part, path);
    }
    return path;
  }

  public static UriPath parse(Input input) {
    return UriPath.parse(input, null);
  }

  public static UriPath parse(Input input, @Nullable UriPathBuilder builder) {
    int c = 0;
    do {
      if (input.isCont()) {
        c = input.head();
        if (Uri.isPathChar(c) || c == '%') {
          final String segment = UriPath.parseSegment(input);
          if (builder == null) {
            builder = new UriPathBuilder();
          }
          builder.addSegment(segment);
          continue;
        } else if (c == '/' || c == '\\') {
          input.step();
          if (builder == null) {
            builder = new UriPathBuilder();
          }
          builder.addSlash();
          continue;
        } else {
          if (builder != null) {
            return builder.build();
          } else {
            return UriPath.empty();
          }
        }
      } else if (input.isReady()) {
        if (builder != null) {
          return builder.build();
        } else {
          return UriPath.empty();
        }
      } else {
        break;
      }
    } while (true);
    if (input.isError()) {
      throw new ParseException(input.getError());
    }
    throw new ParseException(Diagnostic.unexpected(input));
  }

  static String parseSegment(Input input) {
    final Utf8DecodedOutput<String> output = new Utf8DecodedOutput<String>(new StringOutput());
    int c = 0;
    do {
      while (input.isCont()) {
        c = input.head();
        if (Uri.isPathChar(c)) {
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

  public static UriPath fromJsonString(String value) {
    return UriPath.parse(value);
  }

  public static String toJsonString(UriPath path) {
    return path.toString();
  }

  public static UriPath fromWamlString(String value) {
    return UriPath.parse(value);
  }

  public static String toWamlString(UriPath path) {
    return path.toString();
  }

  private static final ThreadLocal<CacheMap<String, UriPath>> CACHE = new ThreadLocal<CacheMap<String, UriPath>>();

  private static CacheMap<String, UriPath> cache() {
    CacheMap<String, UriPath> cache = CACHE.get();
    if (cache == null) {
      int cacheSize;
      try {
        cacheSize = Integer.parseInt(System.getProperty("swim.uri.path.cache.size"));
      } catch (NumberFormatException e) {
        cacheSize = 512;
      }
      cache = new LruCacheMap<String, UriPath>(cacheSize);
      CACHE.set(cache);
    }
    return cache;
  }

}

final class UriPathSegment extends UriPath {

  final String head;

  UriPath tail;

  transient @Nullable String string;

  UriPathSegment(String head, UriPath tail) {
    Objects.requireNonNull(head, "head");
    this.head = head;
    this.tail = tail;
  }

  @Override
  public boolean isDefined() {
    return true;
  }

  @Override
  public boolean isAbsolute() {
    return false;
  }

  @Override
  public boolean isRelative() {
    return true;
  }

  @Override
  public boolean isSegment() {
    return true;
  }

  @Override
  public boolean isSlash() {
    return false;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public String segment() {
    return this.head;
  }

  @Override
  public String head() {
    return this.head;
  }

  @Override
  public UriPath tail() {
    return this.tail;
  }

  @Override
  void setTail(UriPath tail) {
    if (tail instanceof UriPathSegment) {
      throw new UnsupportedOperationException();
    } else {
      this.tail = tail;
    }
  }

  @Override
  UriPath dealias() {
    return new UriPathSegment(this.head, this.tail);
  }

  @Override
  public UriPath parent() {
    final UriPath tail = this.tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      final UriPath next = tail.tail();
      if (next.isEmpty()) {
        return UriPath.empty();
      } else {
        return new UriPathSegment(this.head, tail.parent());
      }
    }
  }

  @Override
  public UriPath base() {
    final UriPath tail = this.tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      return new UriPathSegment(this.head, tail.base());
    }
  }

  @Override
  public UriPath body() {
    final UriPath tail = this.tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      return new UriPathSegment(this.head, tail.body());
    }
  }

  @Override
  public UriPath prependedSegment(String segment) {
    return UriPath.segment(segment, UriPath.slash(this));
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    if (this.string != null) {
      output.append(this.string);
    } else {
      UriPath.writeString(output, this);
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

final class UriPathSlash extends UriPath {

  UriPath tail;

  transient @Nullable String string;

  UriPathSlash(UriPath tail) {
    this.tail = tail;
  }

  @Override
  public boolean isDefined() {
    return true;
  }

  @Override
  public boolean isAbsolute() {
    return true;
  }

  @Override
  public boolean isRelative() {
    return false;
  }

  @Override
  public boolean isSegment() {
    return false;
  }

  @Override
  public boolean isSlash() {
    return true;
  }

  @Override
  public boolean isEmpty() {
    return false;
  }

  @Override
  public String segment() {
    throw new NoSuchElementException();
  }

  @Override
  public String head() {
    return "/";
  }

  @Override
  public UriPath tail() {
    return this.tail;
  }

  @Override
  void setTail(UriPath tail) {
    this.tail = tail;
  }

  @Override
  UriPath dealias() {
    return new UriPathSlash(this.tail);
  }

  @Override
  public UriPath parent() {
    final UriPath tail = this.tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      final UriPath next = tail.tail();
      if (next.isEmpty()) {
        return UriPath.slash();
      } else {
        return new UriPathSlash(tail.parent());
      }
    }
  }

  @Override
  public UriPath base() {
    final UriPath tail = this.tail;
    if (tail.isEmpty()) {
      return this;
    } else {
      return new UriPathSlash(tail.base());
    }
  }

  @Override
  public UriPath body() {
    final UriPath tail = this.tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      final UriPath next = tail.tail();
      if (next.isEmpty()) {
        return UriPath.slash();
      } else {
        return new UriPathSlash(tail.body());
      }
    }
  }

  @Override
  public UriPath prependedSegment(String segment) {
    return UriPath.segment(segment, this);
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    if (this.string != null) {
      output.append(this.string);
    } else {
      UriPath.writeString(output, this);
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

final class UriPathEmpty extends UriPath {

  @Override
  public boolean isDefined() {
    return false;
  }

  @Override
  public boolean isAbsolute() {
    return false;
  }

  @Override
  public boolean isRelative() {
    return true;
  }

  @Override
  public boolean isSegment() {
    return false;
  }

  @Override
  public boolean isSlash() {
    return false;
  }

  @Override
  public boolean isEmpty() {
    return true;
  }

  @Override
  public String segment() {
    throw new NoSuchElementException();
  }

  @Override
  public String head() {
    throw new NoSuchElementException();
  }

  @Override
  public UriPath tail() {
    throw new UnsupportedOperationException();
  }

  @Override
  void setTail(UriPath tail) {
    throw new UnsupportedOperationException();
  }

  @Override
  UriPath dealias() {
    return this;
  }

  @Override
  public UriPath parent() {
    return this;
  }

  @Override
  public UriPath base() {
    return this;
  }

  @Override
  public UriPath body() {
    return this;
  }

  @Override
  public UriPath appendedAll(Collection<? extends String> components) {
    return UriPath.from(components);
  }

  @Override
  public UriPath appendedSlash() {
    return UriPath.slash();
  }

  @Override
  public UriPath appendedSegment(String segment) {
    return UriPath.segment(segment);
  }

  @Override
  public UriPath prependedAll(Collection<? extends String> components) {
    return UriPath.from(components);
  }

  @Override
  public UriPath prependedSlash() {
    return UriPath.slash();
  }

  @Override
  public UriPath prependedSegment(String segment) {
    return UriPath.segment(segment);
  }

  @Override
  public UriPath removeDotSegments() {
    return this;
  }

  @Override
  public UriPath merge(UriPath that) {
    Objects.requireNonNull(that);
    return that;
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("UriPath", "empty").endInvoke();
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

final class UriPathIterator implements Iterator<String> {

  UriPath path;

  UriPathIterator(UriPath path) {
    this.path = path;
  }

  @Override
  public boolean hasNext() {
    return !this.path.isEmpty();
  }

  @Override
  public String next() {
    final UriPath path = this.path;
    if (path.isEmpty()) {
      throw new NoSuchElementException();
    }
    final String component = path.head();
    this.path = path.tail();
    return component;
  }

}
