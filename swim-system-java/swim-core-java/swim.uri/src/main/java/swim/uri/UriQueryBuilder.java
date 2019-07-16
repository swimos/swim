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
import java.util.Map;
import swim.util.EntryBuilder;

public final class UriQueryBuilder implements EntryBuilder<String, String, UriQuery> {
  UriQuery first;
  UriQuery last;
  int size;
  int aliased;

  public UriQueryBuilder() {
    this.first = UriQuery.undefined();
    this.last = null;
    this.size = 0;
    this.aliased = 0;
  }

  boolean isEmpty() {
    return this.size == 0;
  }

  @Override
  public boolean add(String key, String value) {
    if (value == null) {
      throw new NullPointerException();
    }
    return addParam(key, value);
  }

  @Override
  public boolean add(Map.Entry<String, String> param) {
    if (param == null) {
      throw new NullPointerException();
    }
    return addParam(param.getKey(), param.getValue());
  }

  @Override
  public boolean addAll(Collection<? extends Map.Entry<String, String>> params) {
    if (params == null) {
      throw new NullPointerException();
    }
    boolean modified = false;
    for (Map.Entry<String, String> param : params) {
      modified = add(param) || modified;
    }
    return modified;
  }

  @Override
  public boolean addAll(Map<? extends String, ? extends String> params) {
    if (params == null) {
      throw new NullPointerException();
    }
    if (params instanceof UriQuery) {
      return addQuery((UriQuery) params);
    } else {
      boolean modified = false;
      for (Map.Entry<? extends String, ? extends String> param : params.entrySet()) {
        modified = addParam(param.getKey(), param.getValue()) || modified;
      }
      return modified;
    }
  }

  @Override
  public UriQuery bind() {
    this.aliased = 0;
    return this.first;
  }

  public boolean addParam(String key, String value) {
    if (value == null) {
      throw new NullPointerException("value");
    }
    final UriQuery tail = UriQuery.param(key, value, UriQuery.undefined());
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

  public boolean addParam(String value) {
    return addParam(null, value);
  }

  public boolean addQuery(UriQuery query) {
    if (!query.isEmpty()) {
      int size = this.size;
      if (size == 0) {
        this.first = query;
      } else {
        dealias(size - 1).setTail(query);
      }
      size += 1;
      do {
        final UriQuery tail = query.tail();
        if (!tail.isEmpty()) {
          query = tail;
          size += 1;
        } else {
          break;
        }
      } while (true);
      this.last = query;
      this.size = size;
      return true;
    }
    return false;
  }

  UriQuery dealias(int n) {
    int i = 0;
    UriQuery xi = null;
    UriQuery xs = this.first;
    if (this.aliased <= n) {
      while (i < this.aliased) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
      while (i <= n) {
        final UriQuery xn = xs.dealias();
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
    } else if (n == size - 1) {
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
