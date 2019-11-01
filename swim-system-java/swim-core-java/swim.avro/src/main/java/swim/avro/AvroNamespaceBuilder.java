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

import java.util.Collection;
import swim.util.Builder;

final class AvroNamespaceBuilder implements Builder<String, AvroNamespace> {
  AvroNamespace first;
  AvroNamespace last;
  int size;
  int aliased;

  AvroNamespaceBuilder() {
    this.first = AvroNamespace.empty();
    this.last = null;
    this.size = 0;
    this.aliased = 0;
  }

  boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public boolean add(String component) {
    component = AvroName.cacheName(component);
    final AvroNamespace tail = AvroNamespace.component(component, AvroNamespace.empty());
    final int size = this.size;
    if (size == 0) {
      this.first = tail;
    } else {
      dealias(size - 1).setTail(tail);
    }
    this.last = tail;
    this.size = size + 1;
    this.aliased += 1;
    return true;
  }

  @Override
  public boolean addAll(Collection<? extends String> components) {
    if (components == null) {
      throw new NullPointerException();
    }
    if (components instanceof AvroNamespace) {
      return addNamespace((AvroNamespace) components);
    } else {
      boolean modified = false;
      for (String component : components) {
        modified = add(component) || modified;
      }
      return modified;
    }
  }

  @Override
  public AvroNamespace bind() {
    this.aliased = 0;
    return this.first;
  }

  boolean addNamespace(AvroNamespace namespace) {
    if (!namespace.isEmpty()) {
      int size = this.size;
      if (size == 0) {
        this.first = namespace;
      } else {
        dealias(size - 1).setTail(namespace);
      }
      size += 1;
      do {
        final AvroNamespace tail = namespace.tail();
        if (!tail.isEmpty()) {
          namespace = tail;
          size += 1;
        } else {
          break;
        }
      } while (true);
      this.last = namespace;
      this.size = size;
      return true;
    }
    return false;
  }

  AvroNamespace dealias(int n) {
    int i = 0;
    AvroNamespace xi = null;
    AvroNamespace xs = this.first;
    if (this.aliased <= n) {
      while (i < this.aliased) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
      while (i <= n) {
        final AvroNamespace xn = xs.dealias();
        if (i == 0) {
          this.first = xn;
        } else {
          xi.setTail(xn);
        }
        xi = xn;
        xs = xs.tail();
        i += 1;
      }
      if (i == this.size) {
        this.last = xi;
      }
      this.aliased = i;
    } else if (n == 0) {
      xi = this.first;
    } else if (n == this.size - 1) {
      xi = this.last;
    } else {
      while (i <= n) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
    }
    return xi;
  }
}
