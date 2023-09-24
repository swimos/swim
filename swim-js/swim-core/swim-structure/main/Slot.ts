// Copyright 2015-2023 Nstream, inc.
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
import {Murmur3} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {ItemLike} from "./Item";
import {Item} from "./Item";
import type {FieldLike} from "./Field";
import {Field} from "./Field";
import type {ValueLike} from "./Value";
import {Value} from "./"; // forward import
import {Text} from "./"; // forward import
import {Extant} from "./"; // forward import
import {Expression} from "./"; // forward import
import {BitwiseOrOperator} from "./"; // forward import
import {BitwiseXorOperator} from "./"; // forward import
import {BitwiseAndOperator} from "./"; // forward import
import {PlusOperator} from "./"; // forward import
import {MinusOperator} from "./"; // forward import
import {TimesOperator} from "./"; // forward import
import {DivideOperator} from "./"; // forward import
import {ModuloOperator} from "./"; // forward import
import type {InterpreterLike} from "./interpreter/Interpreter";
import {Interpreter} from "./"; // forward import

/** @public */
export class Slot extends Field {
  constructor(key: Value, value: Value, flags?: number) {
    super();
    this.key = key.commit();
    this.value = value;
    this.flags = flags !== void 0 ? flags : 0;
  }

  override readonly key: Value;

  override readonly value: Value;

  /** @internal */
  readonly flags: number;

  override isConstant(): boolean {
    return this.key.isConstant() && this.value.isConstant();
  }

  override setValue(newValue: Value): Value {
    if ((this.flags & Field.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    const oldValue = this.value;
    (this as Mutable<this>).value = newValue;
    return oldValue;
  }

  override updatedValue(value: Value): Slot {
    return new Slot(this.key, value);
  }

  override bitwiseOr(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new BitwiseOrOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this.key.equals(that.key)) {
      newValue = this.value.bitwiseOr(that.value);
    } else if (that instanceof Value) {
      newValue = this.value.bitwiseOr(that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override bitwiseXor(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new BitwiseXorOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this.key.equals(that.key)) {
      newValue = this.value.bitwiseXor(that.value);
    } else if (that instanceof Value) {
      newValue = this.value.bitwiseXor(that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override bitwiseAnd(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new BitwiseAndOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this.key.equals(that.key)) {
      newValue = this.value.bitwiseAnd(that.value);
    } else if (that instanceof Value) {
      newValue = this.value.bitwiseAnd(that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override plus(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new PlusOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this.key.equals(that.key)) {
      newValue = this.value.plus(that.value);
    } else if (that instanceof Value) {
      newValue = this.value.plus(that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override minus(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new MinusOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this.key.equals(that.key)) {
      newValue = this.value.minus(that.value);
    } else if (that instanceof Value) {
      newValue = this.value.minus(that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override times(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new TimesOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this.key.equals(that.key)) {
      newValue = this.value.times(that.value);
    } else if (that instanceof Value) {
      newValue = this.value.times(that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override divide(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new DivideOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this.key.equals(that.key)) {
      newValue = this.value.divide(that.value);
    } else if (that instanceof Value) {
      newValue = this.value.divide(that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override modulo(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new ModuloOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this.key.equals(that.key)) {
      newValue = this.value.modulo(that.value);
    } else if (that instanceof Value) {
      newValue = this.value.modulo(that);
    } else {
      newValue = Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override not(): Item {
    const newValue = this.value.not();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override bitwiseNot(): Item {
    const newValue = this.value.bitwiseNot();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override negative(): Item {
    const newValue = this.value.negative();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override positive(): Item {
    const newValue = this.value.positive();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override inverse(): Item {
    const newValue = this.value.inverse();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  override evaluate(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    const key = this.key.evaluate(interpreter).toValue();
    const value = this.value.evaluate(interpreter).toValue();
    if (key === this.key && value === this.value) {
      return this;
    } else if (key.isDefined() && value.isDefined()) {
      return new Slot(key, value);
    }
    return Item.absent();
  }

  override substitute(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    const key = this.key.substitute(interpreter).toValue();
    const value = this.value.substitute(interpreter).toValue();
    if (key === this.key && value === this.value) {
      return this;
    } else if (key.isDefined() && value.isDefined()) {
      return new Slot(key, value);
    }
    return Item.absent();
  }

  override toLike(): FieldLike {
    const field = {} as {[key: string]: ValueLike};
    if (this.key instanceof Text) {
      field[this.key.value] = this.value.toLike();
    } else {
      field.$key = this.key.toLike();
      field.$value = this.value.toLike();
    }
    return field;
  }

  override isAliased(): boolean {
    return false;
  }

  override isMutable(): boolean {
    return (this.flags & Field.ImmutableFlag) === 0;
  }

  override alias(): void {
    (this as Mutable<this>).flags |= Field.ImmutableFlag;
  }

  override branch(): Slot {
    if ((this.flags & Field.ImmutableFlag) === 0) {
      return this;
    }
    return new Slot(this.key, this.value, this.flags & ~Field.ImmutableFlag);
  }

  override clone(): Slot {
    return new Slot(this.key.clone(), this.value.clone());
  }

  override commit(): this {
    (this as Mutable<this>).flags |= Field.ImmutableFlag;
    this.value.commit();
    return this;
  }

  override interpolateTo(that: Slot): Interpolator<Slot>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof Slot) {
      return SlotInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  override get typeOrder(): number {
    return 2;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Slot) {
      let order = this.key.compareTo(that.key);
      if (order === 0) {
        order = this.value.compareTo(that.value);
      }
      return order;
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Slot) {
      return this.key.equals(that.key) && this.value.equivalentTo(that.value, epsilon);
    }
    return false;
  }

  override keyEquals(key: unknown): boolean {
    if (typeof key === "string" && this.key instanceof Text) {
      return this.key.value === key;
    } else if (key instanceof Field) {
      return this.key.equals(key.key);
    } else {
      return this.key.equals(key);
    }
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Slot) {
      return this.key.equals(that.key) && this.value.equals(that.value);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(Slot),
        this.key.hashCode()), this.value.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Slot").write(46/*'.'*/).write("of").write(40/*'('*/).display(this.key);
    if (!(this.value instanceof Extant)) {
      output = output.write(44/*','*/).write(32/*' '*/).display(this.value);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  static override of(key: ValueLike, value?: ValueLike): Slot {
    key = Value.fromLike(key);
    if (arguments.length === 1) {
      value = Value.extant();
    } else {
      value = Value.fromLike(value);
    }
    return new Slot(key, value);
  }
}

/** @internal */
export interface SlotInterpolator extends Interpolator<Slot> {
  /** @internal */
  readonly keyInterpolator: Interpolator<Value>;
  /** @internal */
  readonly valueInterpolator: Interpolator<Value>;

  readonly 0: Slot;

  readonly 1: Slot;

  equals(that: unknown): boolean;
}

/** @internal */
export const SlotInterpolator = (function (_super: typeof Interpolator) {
  const SlotInterpolator = function (y0: Slot, y1: Slot): SlotInterpolator {
    const interpolator = function (u: number): Slot {
      const key = interpolator.keyInterpolator(u);
      const value = interpolator.valueInterpolator(u);
      return Slot.of(key, value);
    } as SlotInterpolator;
    Object.setPrototypeOf(interpolator, SlotInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).keyInterpolator = y0.key.interpolateTo(y1.key);
    (interpolator as Mutable<typeof interpolator>).valueInterpolator = y0.value.interpolateTo(y1.value);
    return interpolator;
  } as {
    (y0: Slot, y1: Slot): SlotInterpolator;

    /** @internal */
    prototype: SlotInterpolator;
  };

  SlotInterpolator.prototype = Object.create(_super.prototype);
  SlotInterpolator.prototype.constructor = SlotInterpolator;

  Object.defineProperty(SlotInterpolator.prototype, 0, {
    get(this: SlotInterpolator): Slot {
      return Slot.of(this.keyInterpolator[0], this.valueInterpolator[0]);
    },
    configurable: true,
  });

  Object.defineProperty(SlotInterpolator.prototype, 1, {
    get(this: SlotInterpolator): Slot {
      return Slot.of(this.keyInterpolator[1], this.valueInterpolator[1]);
    },
    configurable: true,
  });

  SlotInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SlotInterpolator) {
      return this.keyInterpolator.equals(that.keyInterpolator)
          && this.valueInterpolator.equals(that.valueInterpolator);
    }
    return false;
  };

  return SlotInterpolator;
})(Interpolator);
