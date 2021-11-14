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

import {HashCode, Compare, Lazy, Strings, HashGenCacheMap} from "@swim/util";
import type {Output, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";

/** @public */
export type AnyUriScheme = UriScheme | string;

/** @public */
export class UriScheme implements HashCode, Compare, Debug, Display {
  /** @internal */
  constructor(name: string) {
    this.name = name;
  }

  isDefined(): boolean {
    return this.name.length !== 0;
  }

  readonly name: string;

  toAny(): string | undefined {
    return this.name.length !== 0 ? this.name : void 0;
  }

  compareTo(that: unknown): number {
    if (that instanceof UriScheme) {
      return this.name.localeCompare(that.name);
    }
    return NaN;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriScheme) {
      return this.name === that.name;
    }
    return false;
  }

  hashCode(): number {
    return Strings.hash(this.name);
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriScheme").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/)
                     .display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
    return output;
  }

  display<T>(output: Output<T>): Output<T> {
    output = Uri.writeScheme(output, this.name);
    return output;
  }

  toString(): string {
    return this.name;
  }

  @Lazy
  static undefined(): UriScheme {
    return new UriScheme("");
  }

  static create(schemeName: string): UriScheme {
    const cache = UriScheme.cache;
    const scheme = cache.get(schemeName);
    if (scheme !== void 0) {
      return scheme;
    } else {
      return cache.put(schemeName, new UriScheme(schemeName));
    }
  }

  static fromAny(value: AnyUriScheme | null | undefined): UriScheme {
    if (value === void 0 || value === null) {
      return UriScheme.undefined();
    } else if (value instanceof UriScheme) {
      return value;
    } else if (typeof value === "string") {
      return UriScheme.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static parse(schemePart: string): UriScheme {
    return Uri.standardParser.parseSchemeString(schemePart);
  }

  /** @internal */
  @Lazy
  static get cache(): HashGenCacheMap<string, UriScheme> {
    const cacheSize = 4;
    return new HashGenCacheMap<string, UriScheme>(cacheSize);
  }
}
