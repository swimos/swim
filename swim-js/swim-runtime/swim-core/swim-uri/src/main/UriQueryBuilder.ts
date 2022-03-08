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

import type {PairBuilder} from "@swim/util";
import {AnyUriQuery, UriQuery} from "./UriQuery";

/** @public */
export class UriQueryBuilder implements PairBuilder<string | undefined, string, UriQuery> {
  /** @internal */
  first: UriQuery;
  /** @internal */
  last: UriQuery | null;
  /** @internal */
  size: number;
  /** @internal */
  aliased: number;

  constructor() {
    this.first = UriQuery.undefined();
    this.last = null;
    this.size = 0;
    this.aliased = 0;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  add(key: string | undefined, value: string): void;
  add(params: AnyUriQuery): void;
  add(key: AnyUriQuery | undefined, value?: string): void {
    if (value !== void 0) {
      this.addParam(key as string | undefined, value);
    } else if (typeof key === "string") {
      this.addParam(void 0, key);
    } else if (key instanceof UriQuery) {
      this.addQuery(key);
    } else {
      const params = key!;
      for (const k in params) {
        let key = k as string | undefined;
        const value = params[k]!;
        if (k.charCodeAt(0) === 36/*'$'*/) {
          key = void 0;
        }
        this.addParam(key, value);
      }
    }
  }

  bind(): UriQuery {
    this.aliased = 0;
    return this.first;
  }

  addParam(value: string): void;
  addParam(key: string | undefined, value: string): void;
  addParam(key: string | undefined, value?: string): void {
    if (value === void 0) {
      value = key!;
      key = void 0;
    }
    const tail = UriQuery.param(key, value, UriQuery.undefined());
    const size = this.size;
    if (size === 0) {
      this.first = tail;
    } else {
      this.dealias(size - 1).setTail(tail);
    }
    this.last = tail;
    this.size = size + 1;
    this.aliased += 1;
  }

  addQuery(query: UriQuery): void {
    if (!query.isEmpty()) {
      let size = this.size;
      if (size === 0) {
        this.first = query;
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
      this.last = query;
      this.size = size;
    }
  }

  /** @internal */
  dealias(n: number): UriQuery {
    let i = 0;
    let xi: UriQuery | null = null;
    let xs = this.first;
    if (this.aliased <= n) {
      while (i < this.aliased) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
      while (i <= n) {
        const xn = xs.dealias();
        if (i === 0) {
          this.first = xn;
        } else {
          xi!.setTail(xn);
        }
        xi = xn;
        xs = xs.tail();
        i += 1;
      }
      if (i === this.size) {
        this.last = xi;
      }
      this.aliased = i;
    } else if (n === 0) {
      xi = this.first;
    } else if (n === this.size - 1) {
      xi = this.last;
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
