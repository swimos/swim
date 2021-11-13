// Copyright 2015-2021 Swim Inc.
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

import {HashCode, Compare, Lazy, Strings, HashGenCacheSet} from "@swim/util";
import type {Output, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";
import {UriQueryParam} from "./"; // forward import
import {UriQueryUndefined} from "./"; // forward import
import {UriQueryBuilder} from "./"; // forward import

export type AnyUriQuery = UriQuery | {[key: string]: string} | string;

export abstract class UriQuery implements HashCode, Compare, Debug, Display {
  abstract isDefined(): boolean;

  abstract isEmpty(): boolean;

  get length(): number {
    let n = 0;
    let query: UriQuery = this;
    while (!query.isEmpty()) {
      n += 1;
      query = query.tail();
    }
    return n;
  }

  abstract head(): [string | undefined, string];

  abstract readonly key: string | undefined;

  abstract readonly value: string;

  abstract tail(): UriQuery;

  /** @internal */
  abstract setTail(tail: UriQuery): void;

  /** @internal */
  abstract dealias(): UriQuery;

  has(key: string): boolean {
    let query: UriQuery = this;
    while (!query.isEmpty()) {
      if (key === query.key) {
        return true;
      }
      query = query.tail();
    }
    return false;
  }

  get(key: string): string | undefined {
    let query: UriQuery = this;
    while (!query.isEmpty()) {
      if (key === query.key) {
        return query.value;
      }
      query = query.tail();
    }
    return void 0;
  }

  updated(key: string, value: string): UriQuery {
    let query: UriQuery = this;
    const builder = new UriQueryBuilder();
    let updated = false;
    while (!query.isEmpty()) {
      if (key === query.key) {
        builder.addParam(key, value);
        updated = true;
      } else {
        builder.addParam(query.key, query.value);
      }
      query = query.tail();
    }
    if (!updated) {
      builder.addParam(key, value);
    }
    return builder.bind();
  }

  removed(key: string): UriQuery {
    let query: UriQuery = this;
    const builder = new UriQueryBuilder();
    let updated = false;
    while (!query.isEmpty()) {
      if (key === query.key) {
        updated = true;
      } else {
        builder.addParam(query.key, query.value);
      }
      query = query.tail();
    }
    if (updated) {
      return builder.bind();
    } else {
      return this;
    }
  }

  appended(key: string | undefined, value: string): UriQuery;
  appended(params: AnyUriQuery): UriQuery;
  appended(key: AnyUriQuery | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.addQuery(this);
    builder.add(key as any, value as any);
    return builder.bind();
  }

  prepended(key: string | undefined, value: string): UriQuery;
  prepended(params: AnyUriQuery): UriQuery;
  prepended(key: AnyUriQuery | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.add(key as any, value as any);
    builder.addQuery(this);
    return builder.bind();
  }

  toAny(params?: {[key: string]: string}): {[key: string]: string} | undefined {
    if (this.isDefined()) {
      params = params || {};
      let query: UriQuery = this;
      let i = 0;
      while (!query.isEmpty()) {
        const key = query.key;
        if (key !== void 0) {
          params[key] = query.value;
        } else {
          params["$" + i] = query.value;
        }
        query = query.tail();
        i += 1;
      }
    }
    return params;
  }

  compareTo(that: UriQuery): number {
    if (that instanceof UriQuery) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
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
    return Strings.hash(this.toString());
  }

  abstract debug<T>(output: Output<T>): Output<T>;

  display<T>(output: Output<T>): Output<T> {
    let query: UriQuery = this;
    let first = true;
    while (!query.isEmpty()) {
      if (!first) {
        output = output.write(38/*'&'*/);
      } else {
        first = false;
      }
      const key = query.key;
      if (key !== void 0) {
        output = Uri.writeParam(output, key);
        output = output.write(61/*'='*/);
      }
      output = Uri.writeQuery(output, query.value);
      query = query.tail();
    }
    return output;
  }

  abstract toString(): string;

  @Lazy
  static undefined(): UriQuery {
    return new UriQueryUndefined();
  }

  static param(value: string, tail?: UriQuery): UriQuery;
  static param(key: string | undefined, value: string, tail?: UriQuery): UriQuery;
  static param(key: string | undefined, value?: UriQuery | string, tail?: UriQuery): UriQuery {
    if (tail === void 0) {
      tail = value as UriQuery | undefined;
      value = key!;
      key = void 0;
    } else if (key !== void 0) {
      key = this.cacheKey(key);
    }
    if (tail === void 0) {
      tail = UriQuery.undefined();
    }
    return new UriQueryParam(key, value as string, tail);
  }

  static fromAny(value: AnyUriQuery | null | undefined): UriQuery {
    if (value === void 0 || value === null) {
      return UriQuery.undefined();
    } else if (value instanceof UriQuery) {
      return value;
    } else if (typeof value === "object") {
      const builder = new UriQueryBuilder();
      builder.add(value);
      return builder.bind();
    } else if (typeof value === "string") {
      return UriQuery.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static parse(queryPart: string): UriQuery {
    return Uri.standardParser.parseQueryString(queryPart);
  }

  static builder(): UriQueryBuilder {
    return new UriQueryBuilder();
  }

  /** @internal */
  @Lazy
  static get keyCache(): HashGenCacheSet<string> {
    const keyCacheSize = 64;
    return new HashGenCacheSet<string>(keyCacheSize);
  }

  /** @internal */
  static cacheKey(key: string): string {
    if (key.length <= 32) {
      return UriQuery.keyCache.put(key);
    } else {
      return key;
    }
  }
}
