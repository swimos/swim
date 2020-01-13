// Copyright 2015-2020 SWIM.AI inc.
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

import {Comparable, HashCode, Murmur3, HashGenCacheMap} from "@swim/util";
import {Output, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";

export type AnyUriScheme = UriScheme | string;

export class UriScheme implements Comparable<UriScheme>, HashCode, Debug, Display {
  /** @hidden */
  readonly _name: string;

  /** @hidden */
  constructor(name: string) {
    this._name = name;
  }

  isDefined(): boolean {
    return this._name.length !== 0;
  }

  name(): string {
    return this._name;
  }

  toAny(): string | undefined {
    return this._name.length !== 0 ? this._name : void 0;
  }

  compareTo(that: UriScheme): 0 | 1 | -1 {
    const order = this._name.localeCompare(that._name);
    return order < 0 ? -1 : order > 0 ? 1 : 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriScheme) {
      return this._name === that._name;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.hash(this._name);
  }

  debug(output: Output): void {
    output = output.write("UriScheme").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/).display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
  }

  display(output: Output): void {
    Uri.writeScheme(this._name, output);
  }

  toString(): string {
    return this._name;
  }

  private static _undefined?: UriScheme;

  private static _cache?: HashGenCacheMap<string, UriScheme>;

  static undefined(): UriScheme {
    if (UriScheme._undefined === void 0) {
      UriScheme._undefined = new UriScheme("");
    }
    return UriScheme._undefined;
  }

  static from(name: string): UriScheme {
    const cache = UriScheme.cache();
    const scheme = cache.get(name);
    if (scheme) {
      return scheme;
    } else {
      return cache.put(name, new UriScheme(name));
    }
  }

  static fromAny(scheme: AnyUriScheme | null | undefined): UriScheme {
    if (scheme === null || scheme === void 0) {
      return UriScheme.undefined();
    } else if (scheme instanceof UriScheme) {
      return scheme;
    } else if (typeof scheme === "string") {
      return UriScheme.parse(scheme);
    } else {
      throw new TypeError("" + scheme);
    }
  }

  static parse(string: string): UriScheme {
    return Uri.standardParser().parseSchemeString(string);
  }

  /** @hidden */
  static cache(): HashGenCacheMap<string, UriScheme> {
    if (UriScheme._cache === void 0) {
      const cacheSize = 4;
      UriScheme._cache = new HashGenCacheMap<string, UriScheme>(cacheSize);
    }
    return UriScheme._cache;
  }
}
Uri.Scheme = UriScheme;
