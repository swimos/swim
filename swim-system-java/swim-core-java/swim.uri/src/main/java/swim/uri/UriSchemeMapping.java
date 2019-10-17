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

final class UriSchemeMapping<T> extends UriSchemeMapper<T> {
  final HashTrieMap<String, UriAuthorityMapper<T>> table;

  UriSchemeMapping(HashTrieMap<String, UriAuthorityMapper<T>> table) {
    this.table = table;
  }

  @Override
  public boolean isEmpty() {
    return this.table.isEmpty();
  }

  @Override
  public int size() {
    int size = 0;
    final Iterator<UriAuthorityMapper<T>> routes = this.table.valueIterator();
    while (routes.hasNext()) {
      size += routes.next().size();
    }
    return size;
  }

  @Override
  public boolean containsValue(Object value) {
    final Iterator<UriAuthorityMapper<T>> routes = this.table.valueIterator();
    while (routes.hasNext()) {
      if (routes.next().containsValue(value)) {
        return true;
      }
    }
    return false;
  }

  @Override
  UriMapper<T> getSuffix(UriScheme scheme, UriAuthority authority, UriPath path,
                         UriQuery query, UriFragment fragment) {
    final UriAuthorityMapper<T> mapping = this.table.get(scheme.name());
    if (mapping != null) {
      return mapping.getSuffix(authority, path, query, fragment);
    } else {
      return UriMapper.empty();
    }
  }

  @Override
  T get(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    final UriAuthorityMapper<T> mapping = this.table.get(scheme.name());
    if (mapping != null) {
      return mapping.get(authority, path, query, fragment);
    } else {
      return null;
    }
  }

  UriSchemeMapping<T> merged(UriSchemeMapping<T> that) {
    HashTrieMap<String, UriAuthorityMapper<T>> table = this.table;
    final Iterator<Map.Entry<String, UriAuthorityMapper<T>>> routes = that.table.iterator();
    while (routes.hasNext()) {
      final Map.Entry<String, UriAuthorityMapper<T>> route = routes.next();
      final String schemeName = route.getKey();
      UriAuthorityMapper<T> mapping = this.table.get(schemeName);
      if (mapping != null) {
        mapping = mapping.merged(route.getValue());
      } else {
        mapping = route.getValue();
      }
      table = table.updated(schemeName, mapping);
    }
    return new UriSchemeMapping<T>(table);
  }

  @Override
  UriSchemeMapper<T> merged(UriSchemeMapper<T> that) {
    if (that instanceof UriSchemeMapping<?>) {
      return merged((UriSchemeMapping<T>) that);
    } else {
      return that;
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  UriSchemeMapper<T> removed(UriScheme scheme, UriAuthority authority, UriPath path, UriQuery query, UriFragment fragment) {
    final String schemeName = scheme.name();
    final UriAuthorityMapper<T> oldMapping = this.table.get(schemeName);
    if (oldMapping != null) {
      final UriAuthorityMapper<T> newMapping = oldMapping.removed(authority, path, query, fragment);
      if (oldMapping != newMapping) {
        if (!oldMapping.isEmpty()) {
          return new UriSchemeMapping<T>(this.table.updated(schemeName, newMapping));
        } else {
          return (UriSchemeMapper<T>) empty();
        }
      }
    }
    return this;
  }

  @SuppressWarnings("unchecked")
  UriSchemeMapper<T> unmerged(UriSchemeMapping<T> that) {
    HashTrieMap<String, UriAuthorityMapper<T>> table = this.table;
    final Iterator<Map.Entry<String, UriAuthorityMapper<T>>> routes = that.table.iterator();
    while (routes.hasNext()) {
      final Map.Entry<String, UriAuthorityMapper<T>> route = routes.next();
      final String schemeName = route.getKey();
      UriAuthorityMapper<T> mapping = table.get(schemeName);
      if (mapping != null) {
        mapping = mapping.unmerged(route.getValue());
        if (!mapping.isEmpty()) {
          table = table.updated(schemeName, mapping);
        } else {
          table = table.removed(schemeName);
        }
      }
    }
    if (!table.isEmpty()) {
      return new UriSchemeMapping<T>(table);
    } else {
      return (UriSchemeMapper<T>) empty();
    }
  }

  @Override
  UriSchemeMapper<T> unmerged(UriSchemeMapper<T> that) {
    if (that instanceof UriSchemeMapping<?>) {
      return unmerged((UriSchemeMapping<T>) that);
    } else {
      return this;
    }
  }

  @Override
  public Iterator<Entry<Uri, T>> iterator() {
    return new UriSchemeMappingIterator<T>(this.table.valueIterator());
  }

  @Override
  public Iterator<Uri> keyIterator() {
    return new UriSchemeMappingKeyIterator<T>(this.table.valueIterator());
  }

  @Override
  public Iterator<T> valueIterator() {
    return new UriSchemeMappingValueIterator<T>(this.table.valueIterator());
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof UriSchemeMapping<?>) {
      final UriSchemeMapping<?> that = (UriSchemeMapping<?>) other;
      return this.table.equals(that.table);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(UriSchemeMapping.class);
    }
    return Murmur3.mash(Murmur3.mix(hashSeed, this.table.hashCode()));
  }

  private static int hashSeed;
}

final class UriSchemeMappingIterator<T> extends FlatteningIterator<UriAuthorityMapper<T>, Map.Entry<Uri, T>> {
  UriSchemeMappingIterator(Iterator<UriAuthorityMapper<T>> outer) {
    super(outer);
  }

  @Override
  protected Iterator<Map.Entry<Uri, T>> childIterator(UriAuthorityMapper<T> parent) {
    return parent.iterator();
  }
}

final class UriSchemeMappingKeyIterator<T> extends FlatteningIterator<UriAuthorityMapper<T>, Uri> {
  UriSchemeMappingKeyIterator(Iterator<UriAuthorityMapper<T>> outer) {
    super(outer);
  }

  @Override
  protected Iterator<Uri> childIterator(UriAuthorityMapper<T> parent) {
    return parent.keyIterator();
  }
}

final class UriSchemeMappingValueIterator<T> extends FlatteningIterator<UriAuthorityMapper<T>, T> {
  UriSchemeMappingValueIterator(Iterator<UriAuthorityMapper<T>> outer) {
    super(outer);
  }

  @Override
  protected Iterator<T> childIterator(UriAuthorityMapper<T> parent) {
    return parent.valueIterator();
  }
}
