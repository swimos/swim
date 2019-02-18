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

import java.util.Collection;
import java.util.NoSuchElementException;
import swim.util.Builder;

public final class UriPathBuilder implements Builder<String, UriPath> {
  UriPath first;
  UriPath last;
  int size;
  int aliased;

  public UriPathBuilder() {
    this.first = UriPath.empty();
    this.last = null;
    this.size = 0;
    this.aliased = 0;
  }

  boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public boolean add(String component) {
    if (component == null) {
      throw new NullPointerException();
    }
    if (component.equals("/")) {
      return addSlash();
    } else {
      return addSegment(component);
    }
  }

  @Override
  public boolean addAll(Collection<? extends String> components) {
    if (components == null) {
      throw new NullPointerException();
    }
    if (components instanceof UriPath) {
      return addPath((UriPath) components);
    } else {
      boolean modified = false;
      for (String component : components) {
        modified = add(component) || modified;
      }
      return modified;
    }
  }

  @Override
  public UriPath bind() {
    this.aliased = 0;
    return this.first;
  }

  public boolean addSlash() {
    final UriPath tail = UriPath.slash().dealias();
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

  public boolean addSegment(String segment) {
    segment = UriPath.cacheSegment(segment);
    final UriPath tail = UriPath.segment(segment, UriPath.empty());
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

  public boolean addPath(UriPath path) {
    if (!path.isEmpty()) {
      int size = this.size;
      if (size == 0) {
        this.first = path;
      } else {
        dealias(size - 1).setTail(path);
      }
      size += 1;
      do {
        final UriPath tail = path.tail();
        if (!tail.isEmpty()) {
          path = tail;
          size += 1;
        } else {
          break;
        }
      } while (true);
      this.last = path;
      this.size = size;
      return true;
    }
    return false;
  }

  public UriPath pop() {
    final int size = this.size;
    final int aliased = this.aliased;
    if (size == 0) {
      throw new NoSuchElementException();
    } else if (size == 1) {
      final UriPath first = this.first;
      this.first = first.tail();
      if (first.tail().isEmpty()) {
        this.last = null;
      }
      this.size = size - 1;
      if (aliased > 0) {
        this.aliased = aliased - 1;
      }
      return first;
    } else {
      final UriPath last = dealias(size - 2);
      last.setTail(UriPath.empty());
      this.last = last;
      this.size = size - 1;
      this.aliased = aliased - 1;
      return last.tail();
    }
  }

  UriPath dealias(int n) {
    int i = 0;
    UriPath xi = null;
    UriPath xs = this.first;
    if (this.aliased <= n) {
      while (i < this.aliased) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
      while (i <= n) {
        final UriPath xn = xs.dealias();
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
