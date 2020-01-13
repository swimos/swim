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

import {Murmur3, Objects} from "@swim/util";
import {Output} from "@swim/codec";
import {AnyItem, Item} from "./Item";
import {AnyField, Field} from "./Field";
import {AnyValue, Value} from "./Value";
import {AnyInterpreter, Interpreter} from "./Interpreter";

export class Slot extends Field {
  /** @hidden */
  readonly _key: Value;
  /** @hidden */
  _value: Value;
  /** @hidden */
  _flags: number;

  constructor(key: Value, value: Value = Item.Value.extant(), flags: number = 0) {
    super();
    this._key = key.commit();
    this._value = value;
    this._flags = flags;
  }

  get key(): Value {
    return this._key;
  }

  get value(): Value {
    return this._value;
  }

  isConstant(): boolean {
    return this._key.isConstant() && this._value.isConstant();
  }

  setValue(newValue: Value): Value {
    if ((this._flags & Field.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    const oldValue = this._value;
    this._value = newValue;
    return oldValue;
  }

  updatedValue(value: Value): Slot {
    return new Slot(this._key, value);
  }

  bitwiseOr(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.BitwiseOrOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this._key.equals(that._key)) {
      newValue = this._value.bitwiseOr(that._value);
    } else if (that instanceof Item.Value) {
      newValue = this._value.bitwiseOr(that);
    } else {
      newValue = Item.Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  bitwiseXor(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.BitwiseXorOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this._key.equals(that._key)) {
      newValue = this._value.bitwiseXor(that._value);
    } else if (that instanceof Item.Value) {
      newValue = this._value.bitwiseXor(that);
    } else {
      newValue = Item.Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  bitwiseAnd(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.BitwiseAndOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this._key.equals(that._key)) {
      newValue = this._value.bitwiseAnd(that._value);
    } else if (that instanceof Item.Value) {
      newValue = this._value.bitwiseAnd(that);
    } else {
      newValue = Item.Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  plus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.PlusOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this._key.equals(that._key)) {
      newValue = this._value.plus(that._value);
    } else if (that instanceof Item.Value) {
      newValue = this._value.plus(that);
    } else {
      newValue = Item.Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  minus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.MinusOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this._key.equals(that._key)) {
      newValue = this._value.minus(that._value);
    } else if (that instanceof Item.Value) {
      newValue = this._value.minus(that);
    } else {
      newValue = Item.Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  times(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.TimesOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this._key.equals(that._key)) {
      newValue = this._value.times(that._value);
    } else if (that instanceof Item.Value) {
      newValue = this._value.times(that);
    } else {
      newValue = Item.Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  divide(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.DivideOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this._key.equals(that._key)) {
      newValue = this._value.divide(that._value);
    } else if (that instanceof Item.Value) {
      newValue = this._value.divide(that);
    } else {
      newValue = Item.Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  modulo(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.ModuloOperator(this, that);
    }
    let newValue;
    if (that instanceof Slot && this._key.equals(that._key)) {
      newValue = this._value.modulo(that._value);
    } else if (that instanceof Item.Value) {
      newValue = this._value.modulo(that);
    } else {
      newValue = Item.Value.absent();
    }
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  not(): Item {
    const newValue = this._value.not();
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  bitwiseNot(): Item {
    const newValue = this._value.bitwiseNot();
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  negative(): Item {
    const newValue = this._value.negative();
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  positive(): Item {
    const newValue = this._value.positive();
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  inverse(): Item {
    const newValue = this._value.inverse();
    if (newValue.isDefined()) {
      return new Slot(this._key, newValue);
    }
    return Item.absent();
  }

  evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const key = this._key.evaluate(interpreter).toValue();
    const value = this._value.evaluate(interpreter).toValue();
    if (key === this._key && value === this._value) {
      return this;
    } else if (key.isDefined() && value.isDefined()) {
      return new Slot(key, value);
    }
    return Item.absent();
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const key = this._key.substitute(interpreter).toValue();
    const value = this._value.substitute(interpreter).toValue();
    if (key === this._key && value === this._value) {
      return this;
    } else if (key.isDefined() && value.isDefined()) {
      return new Slot(key, value);
    }
    return Item.absent();
  }

  toAny(): AnyField {
    const field = {} as {[key: string]: AnyValue};
    if (this._key instanceof Item.Text) {
      field[this._key.value] = this._value.toAny();
    } else {
      field.$key = this._key.toAny();
      field.$value = this._value.toAny();
    }
    return field;
  }

  isAliased(): boolean {
    return false;
  }

  isMutable(): boolean {
    return (this._flags & Field.IMMUTABLE) === 0;
  }

  alias(): void {
    this._flags |= Field.IMMUTABLE;
  }

  branch(): Slot {
    if ((this._flags & Field.IMMUTABLE) !== 0) {
      return new Slot(this._key, this._value, this._flags & ~Field.IMMUTABLE);
    } else {
      return this;
    }
  }

  clone(): Slot {
    return new Slot(this._key.clone(), this._value.clone());
  }

  commit(): this {
    if ((this._flags & Field.IMMUTABLE) === 0) {
      this._flags |= Field.IMMUTABLE;
      this._value.commit();
    }
    return this;
  }

  typeOrder(): number {
    return 2;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof Slot) {
      let order = this._key.compareTo(that._key);
      if (order === 0) {
        order = this._value.compareTo(that._value);
      }
      return order;
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  keyEquals(key: unknown): boolean {
    if (typeof key === "string" && this._key instanceof Item.Text) {
      return this._key.value === key;
    } else if (key instanceof Field) {
      return this._key.equals(key.key);
    } else {
      return this._key.equals(key);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Slot) {
      return this._key.equals(that._key) && this._value.equals(that._value);
    }
    return false;
  }

  hashCode(): number {
    if (Slot._hashSeed === void 0) {
      Slot._hashSeed = Murmur3.seed(Slot);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Slot._hashSeed,
        this._key.hashCode()), this._value.hashCode()));
  }

  debug(output: Output): void {
    output = output.write("Slot").write(46/*'.'*/).write("of").write(40/*'('*/).display(this.key);
    if (!(this.value instanceof Item.Extant)) {
      output = output.write(44/*','*/).write(32/*' '*/).display(this.value);
    }
    output = output.write(41/*')'*/);
  }

  display(output: Output): void {
    this.debug(output);
  }

  private static _hashSeed?: number;

  static of(key: AnyValue, value?: AnyValue): Slot {
    key = Item.Value.fromAny(key);
    value = arguments.length >= 2 ? Item.Value.fromAny(value) : Item.Value.extant();
    return new Slot(key, value);
  }
}
Item.Slot = Slot;
