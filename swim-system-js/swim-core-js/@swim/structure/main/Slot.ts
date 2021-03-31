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

import {Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {AnyItem, Item} from "./Item";
import {AnyField, Field} from "./Field";
import {SlotInterpolator} from "./"; // forward import
import {AnyValue, Value} from "./"; // forward import
import {Text} from "./"; // forward import
import {Extant} from "./" // forward import
import {Expression} from "./"; // forward import
import {BitwiseOrOperator} from "./"; // forward import
import {BitwiseXorOperator} from "./"; // forward import
import {BitwiseAndOperator} from "./"; // forward import
import {PlusOperator} from "./"; // forward import
import {MinusOperator} from "./"; // forward import
import {TimesOperator} from "./"; // forward import
import {DivideOperator} from "./"; // forward import
import {ModuloOperator} from "./"; // forward import
import {AnyInterpreter, Interpreter} from "./"; // forward import

export class Slot extends Field {
  constructor(key: Value, value: Value, flags?: number) {
    super();
    Object.defineProperty(this, "key", {
      value: key.commit(),
      enumerable: true,
    });
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "flags", {
      value: flags !== void 0 ? flags : 0,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly key: Value;

  declare readonly value: Value;

  /** @hidden */
  declare readonly flags: number;

  isConstant(): boolean {
    return this.key.isConstant() && this.value.isConstant();
  }

  setValue(newValue: Value): Value {
    if ((this.flags & Field.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    const oldValue = this.value;
    Object.defineProperty(this, "value", {
      value: newValue,
      enumerable: true,
      configurable: true,
    });
    return oldValue;
  }

  updatedValue(value: Value): Slot {
    return new Slot(this.key, value);
  }

  bitwiseOr(that: AnyItem): Item {
    that = Item.fromAny(that);
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

  bitwiseXor(that: AnyItem): Item {
    that = Item.fromAny(that);
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

  bitwiseAnd(that: AnyItem): Item {
    that = Item.fromAny(that);
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

  plus(that: AnyItem): Item {
    that = Item.fromAny(that);
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

  minus(that: AnyItem): Item {
    that = Item.fromAny(that);
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

  times(that: AnyItem): Item {
    that = Item.fromAny(that);
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

  divide(that: AnyItem): Item {
    that = Item.fromAny(that);
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

  modulo(that: AnyItem): Item {
    that = Item.fromAny(that);
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

  not(): Item {
    const newValue = this.value.not();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  bitwiseNot(): Item {
    const newValue = this.value.bitwiseNot();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  negative(): Item {
    const newValue = this.value.negative();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  positive(): Item {
    const newValue = this.value.positive();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  inverse(): Item {
    const newValue = this.value.inverse();
    if (newValue.isDefined()) {
      return new Slot(this.key, newValue);
    }
    return Item.absent();
  }

  evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const key = this.key.evaluate(interpreter).toValue();
    const value = this.value.evaluate(interpreter).toValue();
    if (key === this.key && value === this.value) {
      return this;
    } else if (key.isDefined() && value.isDefined()) {
      return new Slot(key, value);
    }
    return Item.absent();
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const key = this.key.substitute(interpreter).toValue();
    const value = this.value.substitute(interpreter).toValue();
    if (key === this.key && value === this.value) {
      return this;
    } else if (key.isDefined() && value.isDefined()) {
      return new Slot(key, value);
    }
    return Item.absent();
  }

  toAny(): AnyField {
    const field = {} as {[key: string]: AnyValue};
    if (this.key instanceof Text) {
      field[this.key.value] = this.value.toAny();
    } else {
      field.$key = this.key.toAny();
      field.$value = this.value.toAny();
    }
    return field;
  }

  isAliased(): boolean {
    return false;
  }

  isMutable(): boolean {
    return (this.flags & Field.ImmutableFlag) === 0;
  }

  alias(): void {
    if ((this.flags & Field.ImmutableFlag) === 0) {
      Object.defineProperty(this, "flags", {
        value: this.flags | Field.ImmutableFlag,
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "value", {
        value: this.value,
        enumerable: true,
      });
    }
  }

  branch(): Slot {
    if ((this.flags & Field.ImmutableFlag) !== 0) {
      return new Slot(this.key, this.value, this.flags & ~Field.ImmutableFlag);
    } else {
      return this;
    }
  }

  clone(): Slot {
    return new Slot(this.key.clone(), this.value.clone());
  }

  commit(): this {
    if ((this.flags & Field.ImmutableFlag) === 0) {
      Object.defineProperty(this, "flags", {
        value: this.flags | Field.ImmutableFlag,
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(this, "value", {
        value: this.value,
        enumerable: true,
      });
    }
    this.value.commit();
    return this;
  }

  interpolateTo(that: Slot): Interpolator<Slot>;
  interpolateTo(that: Item): Interpolator<Item>;
  interpolateTo(that: unknown): Interpolator<Item> | null;
  interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof Slot) {
      return SlotInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  get typeOrder(): number {
    return 2;
  }

  compareTo(that: unknown): number {
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

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Slot) {
      return this.key.equals(that.key) && this.value.equivalentTo(that.value, epsilon);
    }
    return false;
  }

  keyEquals(key: unknown): boolean {
    if (typeof key === "string" && this.key instanceof Text) {
      return this.key.value === key;
    } else if (key instanceof Field) {
      return this.key.equals(key.key);
    } else {
      return this.key.equals(key);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Slot) {
      return this.key.equals(that.key) && this.value.equals(that.value);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(Slot),
        this.key.hashCode()), this.value.hashCode()));
  }

  debug(output: Output): void {
    output = output.write("Slot").write(46/*'.'*/).write("of").write(40/*'('*/).display(this.key);
    if (!(this.value instanceof Extant)) {
      output = output.write(44/*','*/).write(32/*' '*/).display(this.value);
    }
    output = output.write(41/*')'*/);
  }

  display(output: Output): void {
    this.debug(output);
  }

  static of(key: AnyValue, value?: AnyValue): Slot {
    key = Value.fromAny(key);
    if (arguments.length === 1) {
      value = Value.extant();
    } else {
      value = Value.fromAny(value);
    }
    return new Slot(key, value);
  }
}
