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

import {Comparable, HashCode, Murmur3, HashGenCacheSet} from "@swim/util";
import {Output, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";
import {UriQueryBuilder} from "./UriQueryBuilder";

export type AnyUriQuery = UriQuery | {[key: string]: string} | string;

export abstract class UriQuery implements Comparable<UriQuery>, HashCode, Debug, Display {
  /** @hidden */
  _hashCode?: number;

  abstract isDefined(): boolean;

  abstract isEmpty(): boolean;

  get length(): number {
    let n = 0;
    let query = this as UriQuery;
    while (!query.isEmpty()) {
      n += 1;
      query = query.tail();
    }
    return n;
  }

  abstract head(): [string | null, string];

  abstract key(): string | null;

  abstract value(): string;

  abstract tail(): UriQuery;

  /** @hidden */
  abstract setTail(tail: UriQuery): void;

  /** @hidden */
  abstract dealias(): UriQuery;

  has(key: string): boolean {
    let query = this as UriQuery;
    while (!query.isEmpty()) {
      if (key === query.key()) {
        return true;
      }
      query = query.tail();
    }
    return false;
  }

  get(key: string): string | undefined {
    let query = this as UriQuery;
    while (!query.isEmpty()) {
      if (key === query.key()) {
        return query.value();
      }
      query = query.tail();
    }
    return void 0;
  }

  updated(key: string, value: string): UriQuery {
    let query = this as UriQuery;
    const builder = new Uri.QueryBuilder();
    let updated = false;
    while (!query.isEmpty()) {
      if (key === query.key()) {
        builder.addParam(key, value);
        updated = true;
      } else {
        builder.addParam(query.key(), query.value());
      }
      query = query.tail();
    }
    if (!updated) {
      builder.addParam(key, value);
    }
    return builder.bind();
  }

  removed(key: string): UriQuery {
    let query = this as UriQuery;
    const builder = new Uri.QueryBuilder();
    let updated = false;
    while (!query.isEmpty()) {
      if (key === query.key()) {
        updated = true;
      } else {
        builder.addParam(query.key(), query.value());
      }
      query = query.tail();
    }
    if (updated) {
      return builder.bind();
    } else {
      return this;
    }
  }

  appended(key: string | null, value: string): UriQuery;
  appended(params: AnyUriQuery): UriQuery;
  appended(key: AnyUriQuery | null, value?: string): UriQuery {
    const builder = new Uri.QueryBuilder();
    builder.addQuery(this);
    builder.add(key as any, value as any);
    return builder.bind();
  }

  prepended(key: string | null, value: string): UriQuery;
  prepended(params: AnyUriQuery): UriQuery;
  prepended(key: AnyUriQuery | null, value?: string): UriQuery {
    const builder = new Uri.QueryBuilder();
    builder.add(key as any, value as any);
    builder.addQuery(this);
    return builder.bind();
  }

  toAny(params?: {[key: string]: string}): {[key: string]: string} | undefined {
    if (this.isDefined()) {
      params = params || {};
      let query = this as UriQuery;
      let i = 0;
      while (!query.isEmpty()) {
        const key = query.key();
        if (key !== null) {
          params[key] = query.value();
        } else {
          params["$" + i] = query.value();
        }
        query = query.tail();
        i += 1;
      }
    }
    return params;
  }

  compareTo(that: UriQuery): 0 | 1 | -1 {
    const order = this.toString().localeCompare(that.toString());
    return order < 0 ? -1 : order > 0 ? 1 : 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriQuery) {
      return this.toString() === that.toString();
    }
    return false;
  }

  hashCode(): number {
    if (this._hashCode === void 0) {
      this._hashCode = Murmur3.hash(this.toString());
    }
    return this._hashCode;
  }

  abstract debug(output: Output): void;

  display(output: Output): void {
    let query = this as UriQuery;
    let first = true;
    while (!query.isEmpty()) {
      if (!first) {
        output = output.write(38/*'&'*/);
      } else {
        first = false;
      }
      const key = query.key();
      if (key !== null) {
        Uri.writeParam(key, output);
        output = output.write(61/*'='*/);
      }
      Uri.writeQuery(query.value(), output);
      query = query.tail();
    }
  }

  abstract toString(): string;

  private static _undefined: UriQuery;

  private static _keyCache: HashGenCacheSet<string>;

  static builder(): UriQueryBuilder {
    return new Uri.QueryBuilder();
  }

  static undefined(): UriQuery {
    if (UriQuery._undefined === void 0) {
      UriQuery._undefined = new Uri.QueryUndefined();
    }
    return UriQuery._undefined;
  }

  static param(value: string, tail?: UriQuery): UriQuery;
  static param(key: string | null, value: string, tail?: UriQuery): UriQuery;
  static param(key: string | null, value?: UriQuery | string, tail?: UriQuery): UriQuery {
    if (tail === void 0) {
      tail = value as UriQuery | undefined;
      value = key!;
      key = null;
    } else if (key !== null) {
      key = this.cacheKey(key);
    }
    if (tail === void 0) {
      tail = UriQuery.undefined();
    }
    return new Uri.QueryParam(key, value as string, tail);
  }

  static from(key: string | null, value: string): UriQuery;
  static from(params: AnyUriQuery): UriQuery;
  static from(key: AnyUriQuery | null, value?: string): UriQuery {
    const builder = new Uri.QueryBuilder();
    builder.add(key as any, value as any);
    return builder.bind();
  }

  static fromAny(query: AnyUriQuery | null | undefined): UriQuery {
    if (query === null || query === void 0) {
      return UriQuery.undefined();
    } else if (query instanceof UriQuery) {
      return query;
    } else if (typeof query === "object") {
      const builder = new Uri.QueryBuilder();
      builder.add(query);
      return builder.bind();
    } else if (typeof query === "string") {
      return UriQuery.parse(query);
    } else {
      throw new TypeError("" + query);
    }
  }

  static parse(string: string): UriQuery {
    return Uri.standardParser().parseQueryString(string);
  }

  /** @hidden */
  static keyCache(): HashGenCacheSet<string> {
    if (UriQuery._keyCache === void 0) {
      const keyCacheSize = 64;
      UriQuery._keyCache = new HashGenCacheSet<string>(keyCacheSize);
    }
    return UriQuery._keyCache;
  }

  /** @hidden */
  static cacheKey(key: string): string {
    if (key.length <= 32) {
      return UriQuery.keyCache().put(key);
    } else {
      return key;
    }
  }
}
Uri.Query = UriQuery;
