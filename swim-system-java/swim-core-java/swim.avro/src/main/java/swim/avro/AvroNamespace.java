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

package swim.avro;

import java.lang.reflect.Array;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.NoSuchElementException;
import swim.codec.Debug;
import swim.codec.Diagnostic;
import swim.codec.Display;
import swim.codec.Input;
import swim.codec.Output;
import swim.codec.Parser;
import swim.codec.Unicode;
import swim.util.Murmur3;

public abstract class AvroNamespace implements Collection<String>, Comparable<AvroNamespace>, Debug, Display {
  AvroNamespace() {
    // sealed
  }

  public abstract boolean isDefined();

  @Override
  public abstract boolean isEmpty();

  @Override
  public int size() {
    return AvroNamespace.size(this);
  }

  private static int size(AvroNamespace namespace) {
    int n = 0;
    while (!namespace.isEmpty()) {
      n += 1;
      namespace = namespace.tail();
    }
    return n;
  }

  public abstract String head();

  public abstract AvroNamespace tail();

  abstract void setTail(AvroNamespace tail);

  abstract AvroNamespace dealias();

  @Override
  public boolean contains(Object component) {
    if (component instanceof String) {
      return AvroNamespace.contains(this, (String) component);
    }
    return false;
  }

  private static boolean contains(AvroNamespace namespace, String component) {
    while (!namespace.isEmpty()) {
      if (component.equals(namespace.head())) {
        return true;
      }
      namespace = namespace.tail();
    }
    return false;
  }

  @Override
  public boolean containsAll(Collection<?> components) {
    if (components == null) {
      throw new NullPointerException();
    }
    return AvroNamespace.containsAll(this, new HashSet<Object>(components));
  }

  private static boolean containsAll(AvroNamespace namespace, HashSet<?> missing) {
    while (!namespace.isEmpty() && !missing.isEmpty()) {
      missing.remove(namespace.head());
      namespace = namespace.tail();
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

  public AvroNamespace appended(String component) {
    final AvroNamespaceBuilder builder = new AvroNamespaceBuilder();
    builder.addNamespace(this);
    builder.add(component);
    return builder.bind();
  }

  public AvroNamespace appended(Collection<? extends String> components) {
    if (!components.isEmpty()) {
      final AvroNamespaceBuilder builder = new AvroNamespaceBuilder();
      builder.addNamespace(this);
      builder.addAll(components);
      return builder.bind();
    } else {
      return this;
    }
  }

  public AvroNamespace appended(String... components) {
    return appended(AvroNamespace.from(components));
  }

  public AvroNamespace prepended(String component) {
    return AvroNamespace.component(component, this);
  }

  public AvroNamespace prepended(Collection<? extends String> components) {
    if (!components.isEmpty()) {
      final AvroNamespaceBuilder builder = new AvroNamespaceBuilder();
      builder.addAll(components);
      builder.addNamespace(this);
      return builder.bind();
    } else {
      return this;
    }
  }

  public AvroNamespace prepended(String... components) {
    return prepended(AvroNamespace.from(components));
  }

  @Override
  public Object[] toArray() {
    final Object[] array = new Object[size()];
    AvroNamespace.toArray(this, array);
    return array;
  }

  @SuppressWarnings("unchecked")
  @Override
  public <T> T[] toArray(T[] array) {
    final int n = size();
    if (array.length < n) {
      array = (T[]) Array.newInstance(array.getClass().getComponentType(), n);
    }
    AvroNamespace.toArray(this, array);
    if (array.length > n) {
      array[n] = null;
    }
    return array;
  }

  private static void toArray(AvroNamespace path, Object[] array) {
    int i = 0;
    while (!path.isEmpty()) {
      array[i] = path.head();
      path = path.tail();
      i += 1;
    }
  }

  @Override
  public Iterator<String> iterator() {
    return new AvroNamespaceIterator(this);
  }

  @Override
  public final int compareTo(AvroNamespace that) {
    return toString().compareTo(that.toString());
  }

  @Override
  public final boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof AvroNamespace) {
      return toString().equals(((AvroNamespace) other).toString());
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

  static void display(AvroNamespace namespace, Output<?> output) {
    if (!namespace.isEmpty()) {
      do {
        output = output.write(namespace.head());
        namespace = namespace.tail();
        if (!namespace.isEmpty()) {
          output = output.write('.');
        } else {
          break;
        }
      } while (true);
    }
  }

  @Override
  public abstract String toString();

  private static AvroNamespace empty;

  public static AvroNamespaceBuilder builder() {
    return new AvroNamespaceBuilder();
  }

  public static AvroNamespace empty() {
    if (empty == null) {
      empty = new AvroNamespaceEmpty();
    }
    return empty;
  }

  static AvroNamespace component(String component, AvroNamespace tail) {
    if (component == null) {
      throw new NullPointerException("component");
    }
    component = AvroName.cacheName(component);
    return new AvroNamespaceComponent(component, tail);
  }

  public static AvroNamespace component(String component) {
    return AvroNamespace.component(component, AvroNamespace.empty());
  }

  public static AvroNamespace from(Collection<? extends String> components) {
    if (components == null) {
      throw new NullPointerException();
    }
    if (components instanceof AvroNamespace) {
      return (AvroNamespace) components;
    } else {
      final AvroNamespaceBuilder builder = new AvroNamespaceBuilder();
      builder.addAll(components);
      return builder.bind();
    }
  }

  public static AvroNamespace from(String... components) {
    if (components == null) {
      throw new NullPointerException();
    }
    final AvroNamespaceBuilder builder = new AvroNamespaceBuilder();
    for (int i = 0, n = components.length; i < n; i += 1) {
      builder.add(components[i]);
    }
    return builder.bind();
  }

  public static AvroNamespace parse(String string) {
    final Input input = Unicode.stringInput(string);
    Parser<AvroNamespace> parser = AvroNamespaceParser.parse(input);
    if (input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    } else if (input.isError()) {
      parser = Parser.error(input.trap());
    }
    return parser.bind();
  }
}

final class AvroNamespaceIterator implements Iterator<String> {
  AvroNamespace namespace;

  AvroNamespaceIterator(AvroNamespace namespace) {
    this.namespace = namespace;
  }

  @Override
  public boolean hasNext() {
    return !this.namespace.isEmpty();
  }

  @Override
  public String next() {
    final AvroNamespace namespace = this.namespace;
    if (namespace.isEmpty()) {
      throw new NoSuchElementException();
    }
    final String component = namespace.head();
    this.namespace = namespace.tail();
    return component;
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
