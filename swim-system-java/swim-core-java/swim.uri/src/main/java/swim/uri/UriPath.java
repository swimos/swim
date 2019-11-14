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
import swim.codec.Debug;
import swim.codec.Display;
import swim.codec.Output;
import swim.structure.Form;
import swim.structure.Kind;
import swim.util.HashGenCacheSet;
import swim.util.Murmur3;

public abstract class UriPath extends UriPart implements Collection<String>, Comparable<UriPath>, Debug, Display {
  UriPath() {
    // sealed
  }

  public abstract boolean isDefined();

  public abstract boolean isAbsolute();

  public abstract boolean isRelative();

  @Override
  public abstract boolean isEmpty();

  @Override
  public int size() {
    return UriPath.size(this);
  }

  private static int size(UriPath path) {
    int n = 0;
    while (!path.isEmpty()) {
      n += 1;
      path = path.tail();
    }
    return n;
  }

  public abstract String head();

  public abstract UriPath tail();

  abstract void setTail(UriPath tail);

  abstract UriPath dealias();

  public abstract UriPath parent();

  public abstract UriPath base();

  public String name() {
    return UriPath.name(this);
  }

  private static String name(UriPath path) {
    if (path.isEmpty()) {
      return "";
    }
    do {
      final UriPath tail = path.tail();
      if (tail.isEmpty()) {
        return path.isRelative() ? path.head() : "";
      } else {
        path = tail;
      }
    } while (true);
  }

  public UriPath name(String name) {
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addPath(base());
    builder.addSegment(name);
    return builder.bind();
  }

  public abstract UriPath body();

  public UriPath foot() {
    return UriPath.foot(this);
  }

  private static UriPath foot(UriPath path) {
    if (path.isEmpty()) {
      return path;
    }
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
    return UriPath.isRelativeTo(this, b);
  }

  private static boolean isRelativeTo(UriPath a, UriPath b) {
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
    return UriPath.isChildOf(this, b);
  }

  private static boolean isChildOf(UriPath a, UriPath b) {
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
  public boolean contains(Object component) {
    if (component instanceof String) {
      return UriPath.contains(this, (String) component);
    }
    return false;
  }

  private static boolean contains(UriPath path, String component) {
    while (!path.isEmpty()) {
      if (component.equals(path.head())) {
        return true;
      }
      path = path.tail();
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> components) {
    if (components == null) {
      throw new NullPointerException();
    }
    return UriPath.containsAll(this, new HashSet<Object>(components));
  }

  private static boolean containsAll(UriPath path, HashSet<?> missing) {
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
    if (component == null) {
      throw new NullPointerException();
    }
    if (component.equals("/")) {
      return appendedSlash();
    } else {
      return appendedSegment(component);
    }
  }

  public UriPath appended(String... components) {
    return appended(UriPath.from(components));
  }

  public UriPath appended(Collection<? extends String> components) {
    if (!components.isEmpty()) {
      final UriPathBuilder builder = new UriPathBuilder();
      builder.addPath(this);
      builder.addAll(components);
      return builder.bind();
    } else {
      return this;
    }
  }

  public UriPath appendedSlash() {
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addSlash();
    return builder.bind();
  }

  public UriPath appendedSegment(String segment) {
    final UriPathBuilder builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addSegment(segment);
    return builder.bind();
  }

  public UriPath prepended(String component) {
    if (component == null) {
      throw new NullPointerException();
    }
    if (component.equals("/")) {
      return prependedSlash();
    } else {
      return prependedSegment(component);
    }
  }

  public UriPath prepended(String... components) {
    return prepended(UriPath.from(components));
  }

  public UriPath prepended(Collection<? extends String> components) {
    if (!components.isEmpty()) {
      final UriPathBuilder builder = new UriPathBuilder();
      builder.addAll(components);
      builder.addPath(this);
      return builder.bind();
    } else {
      return this;
    }
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
      return merge(that).removeDotSegments();
    }
  }

  public UriPath removeDotSegments() {
    return UriPath.removeDotSegments(this, new UriPathBuilder());
  }

  private static UriPath removeDotSegments(UriPath path, UriPathBuilder builder) {
    while (!path.isEmpty()) {
      final String head = path.head();
      if (head.equals(".") || head.equals("..")) {
        path = path.tail();
        if (!path.isEmpty()) {
          path = path.tail();
        }
      } else if (path.isAbsolute()) {
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
            if (!builder.isEmpty() && !builder.pop().isAbsolute()) {
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
    return builder.bind();
  }

  public UriPath merge(UriPath that) {
    if (that == null) {
      throw new NullPointerException();
    }
    if (!isEmpty()) {
      return UriPath.merge(this, that);
    } else {
      return that;
    }
  }

  static UriPath merge(UriPath prev, UriPath that) {
    final UriPathBuilder builder = new UriPathBuilder();
    do {
      final UriPath next = prev.tail();
      if (!next.isEmpty()) {
        if (prev.isAbsolute()) {
          builder.addSlash();
        } else {
          builder.addSegment(prev.head());
        }
        prev = next;
      } else {
        if (prev.isAbsolute()) {
          builder.addSlash();
        }
        break;
      }
    } while (true);
    builder.addPath(that);
    return builder.bind();
  }

  public UriPath unmerge(UriPath that) {
    return UriPath.unmerge(this, that, that);
  }

  private static UriPath unmerge(UriPath base, UriPath relative, UriPath root) {
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
            return root;
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
    final Object[] array = new Object[size()];
    UriPath.toArray(this, array);
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final int n = size();
    if (array.length < n) {
      array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    UriPath.toArray(this, array);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  private static void toArray(UriPath path, Object[] array) {
    int i = 0;
    while (!path.isEmpty()) {
      array[i] = path.head();
      path = path.tail();
      i += 1;
    }
  }

  @Override
  public Iterator<String> iterator() {
    return new UriPathIterator(this);
  }

  @Override
  public final int compareTo(UriPath that) {
    return toString().compareTo(that.toString());
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriPath) {
      return toString().equals(((UriPath) other).toString());
    }
    return false;
  }

  @Override
  public final int hashCode() {
    return Murmur3.seed(toString());
  }

  @Override
  public abstract void debug(Output<?> output);

  @Override
  public abstract void display(Output<?> output);

  static void display(UriPath path, Output<?> output) {
    while (!path.isEmpty()) {
      if (path.isAbsolute()) {
        output = output.write('/');
      } else {
        Uri.writePathSegment(path.head(), output);
      }
      path = path.tail();
    }
  }

  @Override
  public abstract String toString();

  private static UriPath empty;

  private static UriPath slash;

  private static ThreadLocal<HashGenCacheSet<String>> segmentCache = new ThreadLocal<>();

  public static UriPathBuilder builder() {
    return new UriPathBuilder();
  }

  public static UriPath empty() {
    if (empty == null) {
      empty = new UriPathEmpty();
    }
    return empty;
  }

  public static UriPath slash() {
    if (slash == null) {
      slash = new UriPathSlash(UriPath.empty());
    }
    return slash;
  }

  static UriPath slash(UriPath tail) {
    if (tail == empty) {
      return UriPath.slash();
    } else {
      return new UriPathSlash(tail);
    }
  }

  public static UriPath segment(String segment) {
    return UriPath.segment(segment, UriPath.empty());
  }

  static UriPath segment(String segment, UriPath tail) {
    if (segment == null) {
      throw new NullPointerException("segment");
    }
    segment = UriPath.cacheSegment(segment);
    return new UriPathSegment(segment, tail);
  }

  public static UriPath component(String component) {
    return UriPath.component(component, UriPath.empty());
  }

  static UriPath component(String component, UriPath tail) {
    if (component == null) {
      throw new NullPointerException();
    }
    if (component.equals("/")) {
      return slash();
    } else {
      return segment(component);
    }
  }

  public static UriPath from(String... components) {
    if (components == null) {
      throw new NullPointerException();
    }
    final UriPathBuilder builder = new UriPathBuilder();
    for (int i = 0, n = components.length; i < n; i += 1) {
      builder.add(components[i]);
    }
    return builder.bind();
  }

  public static UriPath from(Collection<? extends String> components) {
    if (components == null) {
      throw new NullPointerException();
    }
    if (components instanceof UriPath) {
      return (UriPath) components;
    } else {
      final UriPathBuilder builder = new UriPathBuilder();
      builder.addAll(components);
      return builder.bind();
    }
  }

  public static UriPath parse(String string) {
    return Uri.standardParser().parsePathString(string);
  }

  static HashGenCacheSet<String> segmentCache() {
    HashGenCacheSet<String> segmentCache = UriPath.segmentCache.get();
    if (segmentCache == null) {
      int segmentCacheSize;
      try {
        segmentCacheSize = Integer.parseInt(System.getProperty("swim.uri.segment.cache.size"));
      } catch (NumberFormatException e) {
        segmentCacheSize = 64;
      }
      segmentCache = new HashGenCacheSet<String>(segmentCacheSize);
      UriPath.segmentCache.set(segmentCache);
    }
    return segmentCache;
  }

  static String cacheSegment(String segment) {
    if (segment.length() <= 32) {
      return segmentCache().put(segment);
    } else {
      return segment;
    }
  }

  private static Form<UriPath> pathForm;

  @Kind
  public static Form<UriPath> pathForm() {
    if (pathForm == null) {
      pathForm = new UriPathForm(UriPath.empty());
    }
    return pathForm;
  }
}
