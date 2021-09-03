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

import {HashCode, Lazy, Compare, Strings, HashGenCacheMap} from "@swim/util";
import {Output, Format, Debug, Display} from "@swim/codec";
import {Uri} from "./Uri";

export type AnyUriPort = UriPort | number | string;

export class UriPort implements HashCode, Compare, Debug, Display {
  /** @hidden */
  constructor(portNumber: number) {
    Object.defineProperty(this, "number", {
      value: portNumber,
      enumerable: true,
    });
  }

  isDefined(): boolean {
    return this.number !== 0;
  }

  readonly number!: number;

  valueOf(): number {
    return this.number;
  }

  toAny(): number {
    return this.number;
  }

  compareTo(that: unknown): number {
    if (that instanceof UriPort) {
      return this.number < that.number ? -1 : this.number > that.number ? 1 : 0;
    }
    return NaN;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriPort) {
      return this.number === that.number;
    }
    return false;
  }

  hashCode(): number {
    return Strings.hash(this.toString());
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriPort").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("create").write(40/*'('*/);
      output = Format.displayNumber(output, this.number);
    } else {
      output = output.write("undefined").write(40/*'('*/);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  display<T>(output: Output<T>): Output<T> {
    output = Format.displayNumber(output, this.number);
    return output;
  }

  toString(): string {
    return "" + this.number;
  }

  @Lazy
  static undefined(): UriPort {
    return new UriPort(0);
  }

  static create(number: number): UriPort {
    if (number === 0) {
      return UriPort.undefined();
    } else if (number > 0) {
      const cache = UriPort.cache;
      const port = cache.get(number);
      if (port !== void 0) {
        return port;
      } else {
        return cache.put(number, new UriPort(number));
      }
    } else {
      throw new TypeError("" + number);
    }
  }

  static fromAny(value: AnyUriPort | null | undefined): UriPort {
    if (value === void 0 || value === null) {
      return UriPort.undefined();
    } else if (value instanceof UriPort) {
      return value;
    } else if (typeof value === "number") {
      return UriPort.create(value);
    } else if (typeof value === "string") {
      return UriPort.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static parse(portPart: string): UriPort {
    return Uri.standardParser.parsePortString(portPart);
  }

  /** @hidden */
  @Lazy
  static get cache(): HashGenCacheMap<number, UriPort> {
    const cacheSize = 16;
    return new HashGenCacheMap<number, UriPort>(cacheSize);
  }
}
