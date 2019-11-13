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

import java.util.Iterator;
import java.util.Map;
import swim.collections.HashTrieMap;
import swim.util.Murmur3;

final class UriPathMapping<T> extends UriPathMapper<T> {
  final HashTrieMap<String, UriPathMapper<T>> table;
  final UriPathMapper<T> wildcard;
  final UriQueryMapper<T> terminal;

  UriPathMapping(HashTrieMap<String, UriPathMapper<T>> table, UriPathMapper<T> wildcard, UriQueryMapper<T> terminal) {
    this.table = table;
    this.wildcard = wildcard;
    this.terminal = terminal;
  }

  @Override
  public boolean isEmpty() {
    return this.table.isEmpty() && this.wildcard.isEmpty() && this.terminal.isEmpty();
  }

  @Override
  public int size() {
    int size = 0;
    final Iterator<UriPathMapper<T>> routes = this.table.valueIterator();
    while (routes.hasNext()) {
      size += routes.next().size();
    }
    size += this.wildcard.size();
    size += this.terminal.size();
    return size;
  }

  @Override
  public boolean containsValue(Object value) {
    final Iterator<UriPathMapper<T>> routes = this.table.valueIterator();
    while (routes.hasNext()) {
      if (routes.next().containsValue(value)) {
        return true;
      }
    }
    return this.wildcard.containsValue(value) || this.terminal.containsValue(value);
  }

  @Override
  UriMapper<T> getSuffix(UriPath path, UriQuery query, UriFragment fragment) {
    if (!path.isEmpty()) {
      UriPathMapper<T> mapping = this.table.get(path.head());
      if (mapping == null) {
        mapping = this.wildcard;
      }
      return mapping.getSuffix(path.tail(), query, fragment);
    } else {
      return this;
    }
  }

  @Override
  T get(UriPath path, UriQuery query, UriFragment fragment) {
    if (!path.isEmpty()) {
      UriPathMapper<T> mapping = this.table.get(path.head());
      if (mapping == null) {
        mapping = this.wildcard;
      }
      return mapping.get(path.tail(), query, fragment);
    } else {
      return this.terminal.get(query, fragment);
    }
  }

  UriPathMapping<T> merged(UriPathMapping<T> that) {
    HashTrieMap<String, UriPathMapper<T>> table = this.table;
    final Iterator<Map.Entry<String, UriPathMapper<T>>> routes = that.table.iterator();
    while (routes.hasNext()) {
      final Map.Entry<String, UriPathMapper<T>> route = routes.next();
      final String segment = route.getKey();
      UriPathMapper<T> mapping = table.get(segment);
      if (mapping != null) {
        mapping = mapping.merged(route.getValue());
      } else {
        mapping = route.getValue();
      }
      table = table.updated(segment, mapping);
    }
    final UriPathMapper<T> wildcard = this.wildcard.merged(that.wildcard);
    final UriQueryMapper<T> terminal = this.terminal.merged(that.terminal);
    return new UriPathMapping<T>(table, wildcard, terminal);
  }

  @Override
  UriPathMapper<T> merged(UriPathMapper<T> that) {
    if (that instanceof UriPathMapping<?>) {
      return merged((UriPathMapping<T>) that);
    } else {
      return that;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  UriPathMapper<T> removed(UriPath path, UriQuery query, UriFragment fragment) {
    if (!path.isEmpty()) {
      final String segment = path.head();
      if (!segment.isEmpty() && segment.charAt(0) == ':') {
        final UriPathMapper<T> oldWildcard = this.wildcard;
        if (oldWildcard != null) {
          final UriPathMapper<T> newWildcard = oldWildcard.removed(path.tail(), query, fragment);
          if (oldWildcard != newWildcard) {
            if (!this.table.isEmpty() || !newWildcard.isEmpty() || !this.terminal.isEmpty()) {
              return new UriPathMapping<T>(this.table, newWildcard, this.terminal);
            } else {
              return (UriPathMapper<T>) empty();
            }
          }
        }
      } else {
        final HashTrieMap<String, UriPathMapper<T>> oldTable = this.table;
        final UriPathMapper<T> oldMapping = oldTable.get(segment);
        if (oldMapping != null) {
          final UriPathMapper<T> newMapping = oldMapping.removed(path.tail(), query, fragment);
          if (oldMapping != newMapping) {
            final HashTrieMap<String, UriPathMapper<T>> newTable;
            if (!newMapping.isEmpty()) {
              newTable = oldTable.updated(segment, newMapping);
            } else {
              newTable = oldTable.removed(segment);
            }
            if (!newTable.isEmpty() || !this.wildcard.isEmpty() || !this.terminal.isEmpty()) {
              return new UriPathMapping<T>(newTable, this.wildcard, this.terminal);
            } else {
              return (UriPathMapper<T>) empty();
            }
          }
        }
      }
    } else {
      final UriQueryMapper<T> oldTerminal = terminal;
      if (oldTerminal != null) {
        final UriQueryMapper<T> newTerminal = oldTerminal.removed(query, fragment);
        if (oldTerminal != newTerminal) {
          if (!this.table.isEmpty() || !this.wildcard.isEmpty() || !newTerminal.isEmpty()) {
            return new UriPathMapping<T>(this.table, this.wildcard, newTerminal);
          } else {
            return (UriPathMapper<T>) empty();
          }
        }
      }
    }
    return this;
  }

  @SuppressWarnings("unchecked")
  UriPathMapper<T> unmerged(UriPathMapping<T> that) {
    HashTrieMap<String, UriPathMapper<T>> table = this.table;
    final Iterator<Map.Entry<String, UriPathMapper<T>>> routes = that.table.iterator();
    while (routes.hasNext()) {
      final Map.Entry<String, UriPathMapper<T>> route = routes.next();
      final String segment = route.getKey();
      UriPathMapper<T> mapping = this.table.get(segment);
      if (mapping != null) {
        mapping = mapping.unmerged(route.getValue());
        if (!mapping.isEmpty()) {
          table = table.updated(segment, mapping);
        } else {
          table = table.removed(segment);
        }
      }
    }
    final UriPathMapper<T> wildcard = this.wildcard.unmerged(that.wildcard);
    final UriQueryMapper<T> terminal = this.terminal.unmerged(that.terminal);
    if (!table.isEmpty() || !wildcard.isEmpty() || !terminal.isEmpty()) {
      return new UriPathMapping<T>(table, wildcard, terminal);
    } else {
      return (UriPathMapper<T>) empty();
    }
  }

  @Override
  UriPathMapper<T> unmerged(UriPathMapper<T> that) {
    if (that instanceof UriPathMapping<?>) {
      return unmerged((UriPathMapping<T>) that);
    } else {
      return this;
    }
  }

  @Override
  public Iterator<Entry<Uri, T>> iterator() {
    final Iterator<Entry<Uri, T>> tableIterator = new UriPathMappingEntryIterator<T>(this.table.valueIterator());
    return new UriPathMappingIterator<Entry<Uri, T>>(tableIterator, this.wildcard.iterator(), this.terminal.iterator());
  }

  @Override
  public Iterator<Uri> keyIterator() {
    final Iterator<Uri> tableIterator = new UriPathMappingKeyIterator<T>(this.table.valueIterator());
    return new UriPathMappingIterator<Uri>(tableIterator, this.wildcard.keyIterator(), this.terminal.keyIterator());
  }

  @Override
  public Iterator<T> valueIterator() {
    final Iterator<T> tableIterator = new UriPathMappingValueIterator<T>(this.table.valueIterator());
    return new UriPathMappingIterator<T>(tableIterator, this.wildcard.valueIterator(), this.terminal.valueIterator());
  }

  @Override
  public long childCount() {
    return (long) this.table.size();
  }

  @Override
  public Iterator<UriPart> childIterator() {
    return new UriPathMappingChildIterator(this.table.keyIterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriPathMapping<?>) {
      final UriPathMapping<?> that = (UriPathMapping<?>) other;
      return this.table.equals(that.table) && this.wildcard.equals(that.wildcard)
          && this.terminal.equals(that.terminal);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(UriPathMapping.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        this.table.hashCode()), this.wildcard.hashCode()), terminal.hashCode()));
  }

  private static int hashSeed;
}

final class UriPathMappingIterator<T> implements Iterator<T> {
  final Iterator<T> tableIterator;
  final Iterator<T> wildcardIterator;
  final Iterator<T> terminalIterator;

  UriPathMappingIterator(Iterator<T> tableIterator, Iterator<T> wildcardIterator, Iterator<T> terminalIterator) {
    this.tableIterator = tableIterator;
    this.wildcardIterator = wildcardIterator;
    this.terminalIterator = terminalIterator;
  }

  @Override
  public boolean hasNext() {
    return this.tableIterator.hasNext() || this.wildcardIterator.hasNext() || this.terminalIterator.hasNext();
  }

  @Override
  public T next() {
    if (this.tableIterator.hasNext()) {
      return this.tableIterator.next();
    } else if (this.wildcardIterator.hasNext()) {
      return this.wildcardIterator.next();
    } else {
      return this.terminalIterator.next();
    }
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}

final class UriPathMappingEntryIterator<T> extends FlatteningIterator<UriPathMapper<T>, Map.Entry<Uri, T>> {
  UriPathMappingEntryIterator(Iterator<UriPathMapper<T>> outer) {
    super(outer);
  }

  @Override
  protected Iterator<Map.Entry<Uri, T>> childIterator(UriPathMapper<T> parent) {
    return parent.iterator();
  }
}

final class UriPathMappingKeyIterator<T> extends FlatteningIterator<UriPathMapper<T>, Uri> {
  UriPathMappingKeyIterator(Iterator<UriPathMapper<T>> outer) {
    super(outer);
  }

  @Override
  protected Iterator<Uri> childIterator(UriPathMapper<T> parent) {
    return parent.keyIterator();
  }
}

final class UriPathMappingValueIterator<T> extends FlatteningIterator<UriPathMapper<T>, T> {
  UriPathMappingValueIterator(Iterator<UriPathMapper<T>> outer) {
    super(outer);
  }

  @Override
  protected Iterator<T> childIterator(UriPathMapper<T> parent) {
    return parent.valueIterator();
  }
}

final class UriPathMappingChildIterator implements Iterator<UriPart> {
  final Iterator<String> componentIterator;

  UriPathMappingChildIterator(Iterator<String> componentIterator) {
    this.componentIterator = componentIterator;
  }

  @Override
  public boolean hasNext() {
    return this.componentIterator.hasNext();
  }

  @Override
  public UriPart next() {
    return UriPath.component(this.componentIterator.next());
  }

  @Override
  public void remove() {
    throw new UnsupportedOperationException();
  }
}
