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

import {Mutable, Murmur3, Numbers, Constructors} from "@swim/util";
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
    this.key = key.commit();
    this.value = value;
    this.flags = flags !== void 0 ? flags : 0;
  }

  override readonly key: Value;

  override readonly value: Value;

  /** @hidden */
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

  override bitwiseOr(that: AnyItem): Item {
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

  override bitwiseXor(that: AnyItem): Item {
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

  override bitwiseAnd(that: AnyItem): Item {
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

  override plus(that: AnyItem): Item {
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

  override minus(that: AnyItem): Item {
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

  override times(that: AnyItem): Item {
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

  override divide(that: AnyItem): Item {
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

  override modulo(that: AnyItem): Item {
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

  override evaluate(interpreter: AnyInterpreter): Item {
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

  override substitute(interpreter: AnyInterpreter): Item {
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

  override toAny(): AnyField {
    const field = {} as {[key: string]: AnyValue};
    if (this.key instanceof Text) {
      field[this.key.value] = this.value.toAny();
    } else {
      field.$key = this.key.toAny();
      field.$value = this.value.toAny();
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
    if ((this.flags & Field.ImmutableFlag) !== 0) {
      return new Slot(this.key, this.value, this.flags & ~Field.ImmutableFlag);
    } else {
      return this;
    }
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
    } else {
      return super.interpolateTo(that);
    }
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

  static override of(key: AnyValue, value?: AnyValue): Slot {
    key = Value.fromAny(key);
    if (arguments.length === 1) {
      value = Value.extant();
    } else {
      value = Value.fromAny(value);
    }
    return new Slot(key, value);
  }
}
