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

import {Comparable, HashCode, Murmur3, HashGenCacheMap} from "@swim/util";
import {Output, Format, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";

export type AnyUriPort = UriPort | number | string;

export class UriPort implements Comparable<UriPort>, HashCode, Debug, Display {
  /** @hidden */
  readonly _number: number;

  /** @hidden */
  constructor(num: number) {
    this._number = num;
  }

  isDefined(): boolean {
    return this._number !== 0;
  }

  number(): number {
    return this._number;
  }

  valueOf(): number {
    return this._number;
  }

  toAny(): number {
    return this._number;
  }

  compareTo(that: UriPort): 0 | 1 | -1 {
    return this._number < that._number ? -1 : this._number > that._number ? 1 : 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriPort) {
      return this._number === that._number;
    }
    return false;
  }

  hashCode(): number {
    if (UriPort._hashSeed === void 0) {
      UriPort._hashSeed = Murmur3.seed(UriPort);
    }
    return Murmur3.mash(Murmur3.mix(UriPort._hashSeed, this._number));
  }

  debug(output: Output): void {
    output = output.write("UriPort").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("from").write(40/*'('*/);
      Format.displayNumber(this._number, output);
      output = output.write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
  }

  display(output: Output): void {
    Format.displayNumber(this._number, output);
  }

  toString(): string {
    return "" + this._number;
  }

  private static _hashSeed?: number;

  private static _undefined?: UriPort;

  private static _cache?: HashGenCacheMap<number, UriPort>;

  static undefined(): UriPort {
    if (UriPort._undefined === void 0) {
      UriPort._undefined = new UriPort(0);
    }
    return UriPort._undefined;
  }

  static from(number: number) {
    if (number > 0) {
      const cache = UriPort.cache();
      const port = cache.get(number);
      if (port !== void 0) {
        return port;
      } else {
        return cache.put(number, new UriPort(number));
      }
    } else if (number === 0) {
      return UriPort.undefined();
    } else {
      throw new TypeError("" + number);
    }
  }

  static fromAny(port: AnyUriPort | null | undefined): UriPort {
    if (port === null || port === void 0) {
      return UriPort.undefined();
    } else if (port instanceof UriPort) {
      return port;
    } else if (typeof port === "number") {
      return UriPort.from(port);
    } else if (typeof port === "string") {
      return UriPort.parse(port);
    } else {
      throw new TypeError("" + port);
    }
  }

  static parse(string: string): UriPort {
    return Uri.standardParser().parsePortString(string);
  }

  /** @hidden */
  static cache(): HashGenCacheMap<number, UriPort> {
    if (UriPort._cache === void 0) {
      const cacheSize = 4;
      UriPort._cache = new HashGenCacheMap<number, UriPort>(cacheSize);
    }
    return UriPort._cache;
  }
}
Uri.Port = UriPort;
