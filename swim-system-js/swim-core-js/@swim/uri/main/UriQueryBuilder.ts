// Copyright 2015-2020 Swim inc.
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

import {PairBuilder} from "@swim/util";
import {Uri} from "./Uri";
import {AnyUriQuery, UriQuery} from "./UriQuery";

export class UriQueryBuilder implements PairBuilder<string | null, string, UriQuery> {
  /** @hidden */
  _first: UriQuery;
  /** @hidden */
  _last: UriQuery | null;
  /** @hidden */
  _size: number;
  /** @hidden */
  _aliased: number;

  constructor() {
    this._first = Uri.Query.undefined();
    this._last = null;
    this._size = 0;
    this._aliased = 0;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  add(key: string | null, value: string): void;
  add(params: AnyUriQuery): void;
  add(key: AnyUriQuery | null, value?: string): void {
    if (value !== void 0) {
      this.addParam(key as string | null, value);
    } else if (typeof key === "string") {
      this.addParam(null, key);
    } else if (key instanceof Uri.Query) {
      this.addQuery(key);
    } else {
      const params = key!;
      for (const k in params) {
        let key = k as string | null;
        const value = params[k];
        if (k.charCodeAt(0) === 36/*'$'*/) {
          key = null;
        }
        this.addParam(key, value);
      }
    }
  }

  bind(): UriQuery {
    this._aliased = 0;
    return this._first;
  }

  addParam(value: string): void;
  addParam(key: string | null, value: string): void;
  addParam(key: string | null, value?: string): void {
    if (value === void 0) {
      value = key!;
      key = null;
    }
    const tail = Uri.Query.param(key, value, Uri.Query.undefined());
    const size = this._size;
    if (size === 0) {
      this._first = tail;
    } else {
      this.dealias(size - 1).setTail(tail);
    }
    this._last = tail;
    this._size = size + 1;
    this._aliased += 1;
  }

  addQuery(query: UriQuery): void {
    if (!query.isEmpty()) {
      let size = this._size;
      if (size === 0) {
        this._first = query;
      } else {
        this.dealias(size - 1).setTail(query);
      }
      size += 1;
      do {
        const tail = query.tail();
        if (!tail.isEmpty()) {
          query = tail;
          size += 1;
        } else {
          break;
        }
      } while (true);
      this._last = query;
      this._size = size;
    }
  }

  /** @hidden */
  dealias(n: number): UriQuery {
    let i = 0;
    let xi = null as UriQuery | null;
    let xs = this._first;
    if (this._aliased <= n) {
      while (i < this._aliased) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
      while (i <= n) {
        const xn = xs.dealias();
        if (i === 0) {
          this._first = xn;
        } else {
          xi!.setTail(xn);
        }
        xi = xn;
        xs = xs.tail();
        i += 1;
      }
      if (i === this._size) {
        this._last = xi;
      }
      this._aliased = i;
    } else if (n === 0) {
      xi = this._first;
    } else if (n === this._size - 1) {
      xi = this._last;
    } else {
      while (i <= n) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
    }
    return xi!;
  }
}
Uri.QueryBuilder = UriQueryBuilder;
