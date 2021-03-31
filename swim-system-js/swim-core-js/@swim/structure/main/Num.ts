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

import {Equivalent, Lazy, Numbers, HashGenCacheSet} from "@swim/util";
import type {Interpolator} from "@swim/mapping";
import {Output, Format} from "@swim/codec";
import {AnyItem, Item} from "./Item";
import {AnyValue, Value} from "./Value";
import {NumInterpolator} from "./"; // forward import

export type AnyNum = Num | number;

export class Num extends Value {
  private constructor(value: number, flags?: number ) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
    Object.defineProperty(this, "flags", {
      value: flags !== void 0 ? flags : 0,
      enumerable: true,
    });
  }

  isConstant(): boolean {
    return true;
  }

  declare readonly value: number;

  /** @hidden */
  declare readonly flags: number;

  isNaN(): boolean {
    return isNaN(this.value);
  }

  isInfinite(): boolean {
    return !isNaN(this.value) && !isFinite(this.value);
  }

  isUint32(): boolean {
    return (this.flags & Num.Uint32Flag) !== 0;
  }

  isUint64(): boolean {
    return (this.flags & Num.Uint64Flag) !== 0;
  }

  stringValue(): string;
  stringValue<T>(orElse: T): string;
  stringValue<T>(orElse?: T): string {
    return "" + this.value;
  }

  numberValue(): number;
  numberValue<T>(orElse: T): number;
  numberValue<T>(orElse?: T): number {
    return this.value;
  }

  booleanValue(): boolean;
  booleanValue<T>(orElse: T): boolean;
  booleanValue<T>(orElse?: T): boolean {
    return !!this.value;
  }

  toAny(): AnyNum {
    return this.value;
  }

  valueOf(): number {
    return this.value;
  }

  bitwiseOr(that: AnyValue): Value;
  bitwiseOr(that: AnyItem): Item;
  bitwiseOr(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from((this.value | that.value) >>> 0);
    }
    return super.bitwiseOr(that);
  }

  bitwiseXor(that: AnyValue): Value;
  bitwiseXor(that: AnyItem): Item;
  bitwiseXor(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from((this.value ^ that.value) >>> 0);
    }
    return super.bitwiseXor(that);
  }

  bitwiseAnd(that: AnyValue): Value;
  bitwiseAnd(that: AnyItem): Item;
  bitwiseAnd(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from((this.value & that.value) >>> 0);
    }
    return super.bitwiseAnd(that);
  }

  plus(that: AnyValue): Value;
  plus(that: AnyItem): Item;
  plus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this.value + that.value);
    }
    return super.plus(that);
  }

  minus(that: AnyValue): Value;
  minus(that: AnyItem): Item;
  minus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this.value - that.value);
    }
    return super.minus(that);
  }

  times(that: AnyValue): Value;
  times(that: AnyItem): Item;
  times(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this.value * that.value);
    }
    return super.times(that);
  }

  divide(that: AnyValue): Value;
  divide(that: AnyItem): Item;
  divide(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this.value / that.value);
    }
    return super.divide(that);
  }

  modulo(that: AnyValue): Value;
  modulo(that: AnyItem): Item;
  modulo(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Num) {
      return Num.from(this.value % that.value);
    }
    return super.modulo(that);
  }

  bitwiseNot(): Value {
    return Num.from(~this.value >>> 0);
  }

  negative(): Value {
    return Num.from(-this.value);
  }

  positive(): Value {
    return this;
  }

  inverse(): Value {
    return Num.from(1 / this.value);
  }

  abs(): Num {
    return Num.from(Math.abs(this.value));
  }

  ceil(): Num {
    return Num.from(Math.ceil(this.value));
  }

  floor(): Num {
    return Num.from(Math.floor(this.value));
  }

  round(): Num {
    return Num.from(Math.round(this.value));
  }

  sqrt(): Num {
    return Num.from(Math.sqrt(this.value));
  }

  pow(that: AnyNum): Num {
    that = Num.fromAny(that);
    return Num.from(Math.pow(this.value, that.value));
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

  interpolateTo(that: Num): Interpolator<Num>;
  interpolateTo(that: Item): Interpolator<Item>;
  interpolateTo(that: unknown): Interpolator<Item> | null;
  interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof Num) {
      return NumInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  get typeOrder(): number {
    return 6;
  }

  compareTo(that: unknown): number {
    if (that instanceof Num) {
      const x = this.value;
      const y = that.value;
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Num) {
      const x = this.value;
      const y = that.value;
      return x === y || isNaN(x) && isNaN(y) || Math.abs(y - x) < (epsilon !== void 0 ? epsilon : Equivalent.Epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Num) {
      const x = this.value;
      const y = that.value;
      return x === y || isNaN(x) && isNaN(y);
    }
    return false;
  }

  hashCode(): number {
    return Numbers.hash(this.value);
  }

  debug(output: Output): void {
    output = output.write("Num").write(46/*'.'*/).write("from")
        .write(40/*'('*/).display(this).write(41/*')'*/);
  }

  display(output: Output): void {
    Format.displayNumber(this.value, output);
  }

  /** @hidden */
  static readonly Uint32Flag: number = 1;
  /** @hidden */
  static readonly Uint64Flag: number = 2;
  /** @hidden */
  static readonly TypeMask = 0x3;

  @Lazy
  static get zero(): Num {
    return new Num(0);
  }

  @Lazy
  static get negativeZero(): Num {
    return new Num(-0);
  }

  @Lazy
  static get one(): Num {
    return new Num(1);
  }

  @Lazy
  static get negativeOne(): Num {
    return new Num(-1);
  }

  @Lazy
  static get nan(): Num {
    return new Num(NaN);
  }

  static uint32(value: number): Num {
    return new Num(value, Num.Uint32Flag);
  }

  static uint64(value: number): Num {
    return new Num(value, Num.Uint64Flag);
  }

  static from(value: number): Num {
    if (value === 0) {
      if (1 / value === -Infinity) {
        return Num.negativeZero;
      } else {
        return Num.zero;
      }
    } else if (value === 1) {
      return Num.one;
    } else if (value === -1) {
      return Num.negativeOne;
    } else if (isNaN(value)) {
      return Num.nan;
    } else {
      return Num.cache.put(new Num(value));
    }
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

  static parse(value: string): Num {
    if (value === "NaN") {
      return Num.nan;
    } else {
      const num = +value;
      if (isFinite(num)) {
        return Num.from(num);
      }
    }
    throw new Error(value);
  }

  /** @hidden */
  @Lazy
  static get cache(): HashGenCacheSet<Num> {
    const cacheSize = 128;
    return new HashGenCacheSet<Num>(cacheSize);
  }
}
