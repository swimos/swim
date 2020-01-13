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

import {Murmur3, Objects, HashGenCacheSet} from "@swim/util";
import {Output, Format} from "@swim/codec";
import {AnyItem, Item} from "./Item";
import {AnyValue, Value} from "./Value";

export type AnyNum = Num | number;

export class Num extends Value {
  /** @hidden */
  readonly _value: number;
  /** @hidden */
  readonly _flags: number;

  private constructor(value: number, flags: number = 0) {
    super();
    this._value = value;
    this._flags = flags;
  }

  isConstant(): boolean {
    return true;
  }

  get value(): number {
    return this._value;
  }

  isNaN(): boolean {
    return isNaN(this._value);
  }

  isInfinite(): boolean {
    return !isNaN(this._value) && !isFinite(this._value);
  }

  isUint32(): boolean {
    return (this._flags & Num.UINT32) !== 0;
  }

  isUint64(): boolean {
    return (this._flags & Num.UINT64) !== 0;
  }

  stringValue(): string;
  stringValue<T>(orElse: T): string;
  stringValue<T>(orElse?: T): string {
    return "" + this._value;
  }

  numberValue(): number;
  numberValue<T>(orElse: T): number;
  numberValue<T>(orElse?: T): number {
    return this._value;
  }

  booleanValue(): boolean;
  booleanValue<T>(orElse: T): boolean;
  booleanValue<T>(orElse?: T): boolean {
    return !!this._value;
  }

  toAny(): AnyNum {
    return this._value;
  }

  valueOf(): number {
    return this._value;
  }

  bitwiseOr(that: AnyValue): Value;
  bitwiseOr(that: AnyItem): Item;
  bitwiseOr(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from((this._value | that._value) >>> 0);
    }
    return super.bitwiseOr(that);
  }

  bitwiseXor(that: AnyValue): Value;
  bitwiseXor(that: AnyItem): Item;
  bitwiseXor(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from((this._value ^ that._value) >>> 0);
    }
    return super.bitwiseXor(that);
  }

  bitwiseAnd(that: AnyValue): Value;
  bitwiseAnd(that: AnyItem): Item;
  bitwiseAnd(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from((this._value & that._value) >>> 0);
    }
    return super.bitwiseAnd(that);
  }

  plus(that: AnyValue): Value;
  plus(that: AnyItem): Item;
  plus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this._value + that._value);
    }
    return super.plus(that);
  }

  minus(that: AnyValue): Value;
  minus(that: AnyItem): Item;
  minus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this._value - that._value);
    }
    return super.minus(that);
  }

  times(that: AnyValue): Value;
  times(that: AnyItem): Item;
  times(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this._value * that._value);
    }
    return super.times(that);
  }

  divide(that: AnyValue): Value;
  divide(that: AnyItem): Item;
  divide(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this._value / that._value);
    }
    return super.divide(that);
  }

  modulo(that: AnyValue): Value;
  modulo(that: AnyItem): Item;
  modulo(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this._value % that._value);
    }
    return super.modulo(that);
  }

  bitwiseNot(): Value {
    return Num.from(~this._value >>> 0);
  }

  negative(): Value {
    return Num.from(-this._value);
  }

  positive(): Value {
    return this;
  }

  inverse(): Value {
    return Num.from(1 / this._value);
  }

  abs(): Num {
    return Num.from(Math.abs(this._value));
  }

  ceil(): Num {
    return Num.from(Math.ceil(this._value));
  }

  floor(): Num {
    return Num.from(Math.floor(this._value));
  }

  round(): Num {
    return Num.from(Math.round(this._value));
  }

  sqrt(): Num {
    return Num.from(Math.sqrt(this._value));
  }

  pow(that: AnyNum): Num {
    that = Num.fromAny(that);
    return Num.from(Math.pow(this._value, that._value));
  }

  max(that: Num): Num;
  max(that: Item): Item;
  max(that: Item): Item {
    return this.compareTo(that) >= 0 ? this : that;
  }

  min(that: Num): Num;
  min(that: Item): Item;
  min(that: Item): Item {
    return this.compareTo(that) <= 0 ? this : that;
  }

  typeOrder(): number {
    return 6;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof Num) {
      const x = this._value;
      const y = that._value;
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Num) {
      const x = this._value;
      const y = that._value;
      return x === y || isNaN(x) && isNaN(y);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.hash(this._value);
  }

  debug(output: Output): void {
    output = output.write("Num").write(46/*'.'*/).write("from")
        .write(40/*'('*/).display(this).write(41/*')'*/);
  }

  display(output: Output): void {
    Format.displayNumber(this._value, output);
  }

  /** @hidden */
  static readonly TYPE_MASK = 0x3;
  /** @hidden */
  static readonly UINT32: number = 1;
  /** @hidden */
  static readonly UINT64: number = 2;

  private static _positiveZero?: Num;
  private static _negativeZero?: Num;
  private static _positiveOne?: Num;
  private static _negativeOne?: Num;
  private static _nan?: Num;

  private static _cache?: HashGenCacheSet<Num>;

  static positiveZero(): Num {
    if (Num._positiveZero === void 0) {
      Num._positiveZero = new Num(0);
    }
    return Num._positiveZero;
  }

  static negativeZero(): Num {
    if (Num._negativeZero === void 0) {
      Num._negativeZero = new Num(-0);
    }
    return Num._negativeZero;
  }

  static positiveOne(): Num {
    if (Num._positiveOne === void 0) {
      Num._positiveOne = new Num(1);
    }
    return Num._positiveOne;
  }

  static negativeOne(): Num {
    if (Num._negativeOne === void 0) {
      Num._negativeOne = new Num(-1);
    }
    return Num._negativeOne;
  }

  static nan(): Num {
    if (Num._nan === void 0) {
      Num._nan = new Num(NaN);
    }
    return Num._nan;
  }

  static uint32(value: number): Num {
    return new Num(value, Num.UINT32);
  }

  static uint64(value: number): Num {
    return new Num(value, Num.UINT64);
  }

  static from(value: number | string): Num {
    if (typeof value === "number") {
      if (value === 0) {
        if (1 / value === -Infinity) {
          return Num.negativeZero();
        } else {
          return Num.positiveZero();
        }
      } else if (value === 1) {
        return Num.positiveOne();
      } else if (value === -1) {
        return Num.negativeOne();
      } else if (isNaN(value)) {
        return Num.nan();
      } else {
        return Num.cache().put(new Num(value));
      }
    } else if (typeof value === "string") {
      if (value === "NaN") {
        return Num.nan();
      } else {
        const num = +value;
        if (isFinite(num)) {
          return Num.from(num);
        }
      }
      throw new Error(value);
    }
    throw new TypeError("" + value);
  }

  static fromAny(value: AnyNum): Num {
    if (value instanceof Num) {
      return value;
    } else if (typeof value === "number") {
      return Num.from(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  /** @hidden */
  static cache(): HashGenCacheSet<Num> {
    if (Num._cache == null) {
      const cacheSize = 16;
      Num._cache = new HashGenCacheSet<Num>(cacheSize);
    }
    return Num._cache;
  }
}
Item.Num = Num;
