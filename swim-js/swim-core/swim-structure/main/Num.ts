// Copyright 2015-2024 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Equivalent} from "@swim/util";
import {Numbers} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import {Format} from "@swim/codec";
import type {ItemLike} from "./Item";
import {Item} from "./Item";
import type {ValueLike} from "./Value";
import {Value} from "./Value";

/** @public */
export type NumLike = Num | number;

/** @public */
export class Num extends Value {
  private constructor(value: number, flags?: number) {
    super();
    this.value = value;
    this.flags = flags !== void 0 ? flags : 0;
  }

  override likeType?(like: number): void;

  override isConstant(): boolean {
    return true;
  }

  readonly value: number;

  /** @internal */
  readonly flags: number;

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

  override stringValue(): string;
  override stringValue<T>(orElse: T): string;
  override stringValue<T>(orElse?: T): string {
    return "" + this.value;
  }

  override numberValue(): number;
  override numberValue<T>(orElse: T): number;
  override numberValue<T>(orElse?: T): number {
    return this.value;
  }

  override booleanValue(): boolean;
  override booleanValue<T>(orElse: T): boolean;
  override booleanValue<T>(orElse?: T): boolean {
    return !!this.value;
  }

  override toLike(): NumLike {
    return this.value;
  }

  override valueOf(): number {
    return this.value;
  }

  override bitwiseOr(that: ValueLike): Value;
  override bitwiseOr(that: ItemLike): Item;
  override bitwiseOr(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Num) {
      return Num.from((this.value | that.value) >>> 0);
    }
    return super.bitwiseOr(that);
  }

  override bitwiseXor(that: ValueLike): Value;
  override bitwiseXor(that: ItemLike): Item;
  override bitwiseXor(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Num) {
      return Num.from((this.value ^ that.value) >>> 0);
    }
    return super.bitwiseXor(that);
  }

  override bitwiseAnd(that: ValueLike): Value;
  override bitwiseAnd(that: ItemLike): Item;
  override bitwiseAnd(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Num) {
      return Num.from((this.value & that.value) >>> 0);
    }
    return super.bitwiseAnd(that);
  }

  override plus(that: ValueLike): Value;
  override plus(that: ItemLike): Item;
  override plus(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Num) {
      return Num.from(this.value + that.value);
    }
    return super.plus(that);
  }

  override minus(that: ValueLike): Value;
  override minus(that: ItemLike): Item;
  override minus(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Num) {
      return Num.from(this.value - that.value);
    }
    return super.minus(that);
  }

  override times(that: ValueLike): Value;
  override times(that: ItemLike): Item;
  override times(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Num) {
      return Num.from(this.value * that.value);
    }
    return super.times(that);
  }

  override divide(that: ValueLike): Value;
  override divide(that: ItemLike): Item;
  override divide(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Num) {
      return Num.from(this.value / that.value);
    }
    return super.divide(that);
  }

  override modulo(that: ValueLike): Value;
  override modulo(that: ItemLike): Item;
  override modulo(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Num) {
      return Num.from(this.value % that.value);
    }
    return super.modulo(that);
  }

  override bitwiseNot(): Value {
    return Num.from(~this.value >>> 0);
  }

  override negative(): Value {
    return Num.from(-this.value);
  }

  override positive(): Value {
    return this;
  }

  override inverse(): Value {
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

  pow(that: NumLike): Num {
    that = Num.fromLike(that);
    return Num.from(Math.pow(this.value, that.value));
  }

  override max(that: Num): Num;
  override max(that: Item): Item;
  override max(that: Item): Item {
    return this.compareTo(that) >= 0 ? this : that;
  }

  override min(that: Num): Num;
  override min(that: Item): Item;
  override min(that: Item): Item {
    return this.compareTo(that) <= 0 ? this : that;
  }

  override interpolateTo(that: Num): Interpolator<Num>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof Num) {
      return NumInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  override get typeOrder(): number {
    return 6;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Num) {
      const x = this.value;
      const y = that.value;
      return x < y ? -1 : x > y ? 1 : isNaN(y) ? (isNaN(x) ? 0 : -1) : isNaN(x) ? 1 : 0;
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Num) {
      const x = this.value;
      const y = that.value;
      return x === y || isNaN(x) && isNaN(y) || Math.abs(y - x) < (epsilon !== void 0 ? epsilon : Equivalent.Epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Num) {
      const x = this.value;
      const y = that.value;
      return x === y || isNaN(x) && isNaN(y);
    }
    return false;
  }

  override hashCode(): number {
    return Numbers.hash(this.value);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Num").write(46/*'.'*/).write("from")
                   .write(40/*'('*/).display(this).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    return Format.displayNumber(output, this.value);
  }

  /** @internal */
  static readonly Uint32Flag: number = 1;
  /** @internal */
  static readonly Uint64Flag: number = 2;
  /** @internal */
  static readonly TypeMask = 0x3;

  @Lazy
  static zero(): Num {
    return new Num(0);
  }

  @Lazy
  static negativeZero(): Num {
    return new Num(-0);
  }

  @Lazy
  static one(): Num {
    return new Num(1);
  }

  @Lazy
  static negativeOne(): Num {
    return new Num(-1);
  }

  @Lazy
  static nan(): Num {
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
        return Num.negativeZero();
      } else {
        return Num.zero();
      }
    } else if (value === 1) {
      return Num.one();
    } else if (value === -1) {
      return Num.negativeOne();
    } else if (isNaN(value)) {
      return Num.nan();
    }
    return new Num(value);
  }

  static override fromLike(value: NumLike): Num {
    if (value instanceof Num) {
      return value;
    } else if (typeof value === "number") {
      return Num.from(value);
    }
    throw new TypeError("" + value);
  }

  static parse(value: string): Num {
    if (value === "NaN") {
      return Num.nan();
    }
    const num = +value;
    if (!isFinite(num)) {
      throw new Error(value);
    }
    return Num.from(num);
  }
}

/** @internal */
export const NumInterpolator = (function (_super: typeof Interpolator) {
  const NumInterpolator = function (y0: Num, y1: Num): Interpolator<Num> {
    const interpolator = function (u: number): Num {
      const y0 = interpolator[0].value;
      const y1 = interpolator[1].value;
      return Num.from(y0 + u * (y1 - y0));
    } as Interpolator<Num>;
    Object.setPrototypeOf(interpolator, NumInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = y0;
    (interpolator as Mutable<typeof interpolator>)[1] = y1;
    return interpolator;
  } as {
    (y0: Num, y1: Num): Interpolator<Num>;

    /** @internal */
    prototype: Interpolator<Num>;
  };

  NumInterpolator.prototype = Object.create(_super.prototype);
  NumInterpolator.prototype.constructor = NumInterpolator;

  return NumInterpolator;
})(Interpolator);
