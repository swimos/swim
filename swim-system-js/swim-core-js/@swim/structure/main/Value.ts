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

import {Builder} from "@swim/util";
import {AnyItem, Item} from "./Item";
import {Field} from "./Field";
import {ValueBuilder} from "./ValueBuilder";
import {Record} from "./Record";
import {AnyText} from "./Text";
import {AnyNum} from "./Num";

export type AnyValue = Value
                     | {readonly [key: string]: AnyValue}
                     | ReadonlyArray<unknown> // ReadonlyArray<AnyItem>
                     | Uint8Array
                     | string
                     | number
                     | boolean
                     | null
                     | undefined;

export abstract class Value extends Item {
  /** @hidden */
  constructor() {
    super();
  }

  /**
   * Returns `true` if this `Value` is not [[Absent]].
   */
  isDefined(): boolean {
    return true;
  }

  /**
   * Returns `true` if this `Value` is neither [[Extant]] nor [[Absent]].
   */
  isDistinct(): boolean {
    return true;
  }

  /**
   * Always returns [[Absent]] because a `Value` can't be a `Field`, so it
   * can't have a key component.
   */
  get key(): Value {
    return Value.absent();
  }

  /**
   * Always returns `this` because every `Value` is its own value component.
   */
  toValue(): Value {
    return this;
  }

  /**
   * Returns the `key` string of the first member of this `Value`, if this
   * `Value` is a [[Record]], and its first member is an [[Attr]]; otherwise
   * returns `undefined` if this `Value` is not a `Record`, or if this `Value`
   * is a `Record` whose first member is not an `Attr`.
   *
   * Used to concisely get the name of the discriminating attribute of a
   * structure.  The `tag` can be used to discern the nominal type of a
   * polymorphic structure, similar to an XML element tag.
   */
  tag(): string | undefined {
    return void 0;
  }

  /**
   * Returns the [[Value.flattened flattened]] members of this `Value` after
   * all attributes have been removed, if this `Value` is a [[Record]];
   * otherwise returns `this` if this `Value` is not a `Record`.
   *
   * Used to concisely get the scalar value of an attributed structure.  An
   * attributed structure is a `Record` with one or more attributes that modify
   * one or more other members.
   */
  target(): Value {
    return this;
  }

  /**
   * Returns the sole member of this `Value`, if this `Value` is a [[Record]]
   * with exactly one member, and its member is a `Value`; returns [[Extant]]
   * if this `Value` is an empty `Record`; otherwise returns `this` if this
   * `Value` is a `Record` with more than one member, or if this `Value` is a
   * not a `Record`.
   *
   * Used to convert a unary `Record` into its member `Value`.  Facilitates
   * writing code that treats a unary `Record` equivalently to a bare `Value`.
   */
  flattened(): Value {
    return this;
  }

  /**
   * Returns `this` if this `Value` is a [[Record]]; returns a `Record`
   * containing just this `Value`, if this `Value` is [[Value.isDistinct
   * distinct]]; otherwise returns an empty `Record` if this `Value` is
   * [[Extant]] or [[Absent]].  Facilitates writing code that treats a bare
   * `Value` equivalently to a unary `Record`.
   */
  unflattened(): Record {
    return Value.Record.of(this);
  }

  /**
   * Returns the value of the first member of this `Value`, if this `Value` is
   * a `Record`, and its first member is an [[Attr]] whose `key` string is
   * equal to `tag`; otherwise returns [[Absent]] if this `Value` is not a
   * `Record`, or if this `Value` is a `Record` whose first member is not an
   * `Attr`, or if this `Value` is a `Record` whose first member is an `Attr`
   * whose `key` does not equal the `tag`.
   *
   * Used to conditionally get the value of the head `Attr` of a structure, if
   * and only if the key string of the head `Attr` is equal to the `tag`.  Can
   * be used to check if a structure might conform to a nominal type named
   * `tag`, while simultaneously getting the value of the `tag` attribute.
   */
  header(tag: string): Value {
    return Value.absent();
  }

  /**
   * Returns the [[Value.unflattened unflattened]] [[Value.header header]] of
   * this `Value`, if this `Value` is a [[Record]], and its first member is an
   * [[Attr]] whose `key` string is equal to `tag`; otherwise returns
   * `undefined`.
   *
   * The `headers` of the `tag` attribute of a structure are like the
   * attributes of an XML element tag; through unlike an XML element, `tag`
   * attribute headers are not limited to string keys and values.
   */
  headers(tag: string): Record | undefined {
    return void 0;
  }

  /**
   * Returns the first member of this `Value`, if this `Value` is a non-empty
   * [[Record]]; otherwise returns [[Absent]].
   */
  head(): Item {
    return Item.absent();
  }

  /**
   * Returns a view of all but the first member of this `Value`, if this
   * `Value` is a non-empty [[Record]]; otherwise returns an empty `Record`
   * if this `Value` is not a `Record`, of if this `Value` is itself an
   * empty `Record`.
   */
  tail(): Record {
    return Value.Record.empty();
  }

  /**
   * Returns the [[Record.flattened flattened]] [[Value.tail tail]] of this
   * `Value`.  Used to recursively deconstruct a structure, terminating with
   * its last `Value`, rather than a unary `Record` containing its last value,
   * if the structure ends with a `Value` member.
   */
  body(): Value {
    return Value.extant();
  }

  /**
   * Returns the number of members contained in this `Value`, if this `Value`
   * is a [[Record]]; otherwise returns `0` if this `Value` is not a `Record`.
   */
  get length(): number {
    return 0;
  }

  /**
   * Returns `true` if this `Value` is a [[Record]] that has a [[Field]] member
   * with a key that is equal to the given `key`; otherwise returns `false` if
   * this `Value` is not a `Record`, or if this `Value` is a `Record`, but has
   * no `Field` member with a key equal to the given `key`.
   */
  has(key: AnyValue): boolean {
    return false;
  }

  /**
   * Returns the value of the last [[Field]] member of this `Value` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Value` is not a
   * [[Record]], or if this `Value` is a `Record`, but has no `Field` member
   * with a key equal to the given `key`.
   */
  get(key: AnyValue): Value {
    return Value.absent();
  }

  /**
   * Returns the value of the last [[Attr]] member of this `Value` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Value` is not a
   * [[Record]], or if this `Value` is a `Record`, but has no `Attr` member
   * with a key equal to the given `key`.
   */
  getAttr(key: AnyText): Value {
    return Value.absent();
  }

  /**
   * Returns the value of the last [[Slot]] member of this `Value` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Value` is not a
   * [[Record]], or if this `Value` is a `Record`, but has no `Slot` member
   * with a key equal to the given `key`.
   */
  getSlot(key: AnyValue): Value {
    return Value.absent();
  }

  /**
   * Returns the last [[Field]] member of this `Value` whose key is equal to
   * the given `key`; returns `undefined` if this `Value` is not a [[Record]],
   * or if this `Value` is a `Record`, but has no `Field` member with a `key`
   * equal to the given `key`.
   */
  getField(key: AnyValue): Field | undefined {
    return void 0;
  }

  /**
   * Returns the member of this `Value` at the given `index`, if this `Value`
   * is a [[Record]], and the `index` is greater than or equal to zero, and
   * less than the [[Record.length length]] of the `Record`; otherwise returns
   * [[Absent]] if this `Value` is not a `Record`, or if this `Value` is a
   * `Record`, but the `index` is out of bounds.
   */
  getItem(index: AnyNum): Item {
    return Item.absent();
  }

  deleted(key: AnyValue): Value {
    return this;
  }

  conditional(thenTerm: AnyValue, elseTerm: AnyValue): Value;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item {
    thenTerm = Item.fromAny(thenTerm);
    return thenTerm;
  }

  or(that: AnyValue): Value;
  or(that: AnyItem): Item;
  or(that: AnyItem): Item {
    return this;
  }

  and(that: AnyValue): Value;
  and(that: AnyItem): Item;
  and(that: AnyItem): Item {
    that = Item.fromAny(that);
    return that;
  }

  bitwiseOr(that: AnyValue): Value;
  bitwiseOr(that: AnyItem): Item;
  bitwiseOr(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.BitwiseOrOperator(this, that);
    } else if (that instanceof Item.Attr) {
      const newValue = this.bitwiseOr(that.value);
      if (newValue.isDefined()) {
        return new Item.Attr(that.key, newValue);
      }
    } else if (that instanceof Item.Slot) {
      const newValue = this.bitwiseOr(that.value);
      if (newValue.isDefined()) {
        return new Item.Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  bitwiseXor(that: AnyValue): Value;
  bitwiseXor(that: AnyItem): Item;
  bitwiseXor(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.BitwiseXorOperator(this, that);
    } else if (that instanceof Item.Attr) {
      const newValue = this.bitwiseXor(that.value);
      if (newValue.isDefined()) {
        return new Item.Attr(that.key, newValue);
      }
    } else if (that instanceof Item.Slot) {
      const newValue = this.bitwiseXor(that.value);
      if (newValue.isDefined()) {
        return new Item.Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  bitwiseAnd(that: AnyValue): Value;
  bitwiseAnd(that: AnyItem): Item;
  bitwiseAnd(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.BitwiseAndOperator(this, that);
    } else if (that instanceof Item.Attr) {
      const newValue = this.bitwiseAnd(that.value);
      if (newValue.isDefined()) {
        return new Item.Attr(that.key, newValue);
      }
    } else if (that instanceof Item.Slot) {
      const newValue = this.bitwiseAnd(that.value);
      if (newValue.isDefined()) {
        return new Item.Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  lt(that: AnyValue): Value;
  lt(that: AnyItem): Item;
  lt(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.LtOperator(this, that);
    }
    return super.lt(that);
  }

  le(that: AnyValue): Value;
  le(that: AnyItem): Item;
  le(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.LeOperator(this, that);
    }
    return super.le(that);
  }

  eq(that: AnyValue): Value;
  eq(that: AnyItem): Item;
  eq(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.EqOperator(this, that);
    }
    return super.eq(that);
  }

  ne(that: AnyValue): Value;
  ne(that: AnyItem): Item;
  ne(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.NeOperator(this, that);
    }
    return super.ne(that);
  }

  ge(that: AnyValue): Value;
  ge(that: AnyItem): Item;
  ge(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.GeOperator(this, that);
    }
    return super.ge(that);
  }

  gt(that: AnyValue): Value;
  gt(that: AnyItem): Item;
  gt(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.GtOperator(this, that);
    }
    return super.gt(that);
  }

  plus(that: AnyValue): Value;
  plus(that: AnyItem): Item;
  plus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.PlusOperator(this, that);
    } else if (that instanceof Item.Attr) {
      const newValue = this.plus(that.value);
      if (newValue.isDefined()) {
        return new Item.Attr(that.key, newValue);
      }
    } else if (that instanceof Item.Slot) {
      const newValue = this.plus(that.value);
      if (newValue.isDefined()) {
        return new Item.Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  minus(that: AnyValue): Value;
  minus(that: AnyItem): Item;
  minus(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.MinusOperator(this, that);
    } else if (that instanceof Item.Attr) {
      const newValue = this.minus(that.value);
      if (newValue.isDefined()) {
        return new Item.Attr(that.key, newValue);
      }
    } else if (that instanceof Item.Slot) {
      const newValue = this.minus(that.value);
      if (newValue.isDefined()) {
        return new Item.Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  times(that: AnyValue): Value;
  times(that: AnyItem): Item;
  times(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.TimesOperator(this, that);
    } else if (that instanceof Item.Attr) {
      const newValue = this.times(that.value);
      if (newValue.isDefined()) {
        return new Item.Attr(that.key, newValue);
      }
    } else if (that instanceof Item.Slot) {
      const newValue = this.times(that.value);
      if (newValue.isDefined()) {
        return new Item.Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  divide(that: AnyValue): Value;
  divide(that: AnyItem): Item;
  divide(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.DivideOperator(this, that);
    } else if (that instanceof Item.Attr) {
      const newValue = this.divide(that.value);
      if (newValue.isDefined()) {
        return new Item.Attr(that.key, newValue);
      }
    } else if (that instanceof Item.Slot) {
      const newValue = this.divide(that.value);
      if (newValue.isDefined()) {
        return new Item.Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  modulo(that: AnyValue): Value;
  modulo(that: AnyItem): Item;
  modulo(that: AnyItem): Item {
    that = Item.fromAny(that);
    if (that instanceof Item.Expression) {
      return new Item.ModuloOperator(this, that);
    } else if (that instanceof Item.Attr) {
      const newValue = this.modulo(that.value);
      if (newValue.isDefined()) {
        return new Item.Attr(that.key, newValue);
      }
    } else if (that instanceof Item.Slot) {
      const newValue = this.modulo(that.value);
      if (newValue.isDefined()) {
        return new Item.Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  not(): Value {
    return Value.absent();
  }

  bitwiseNot(): Value {
    return Value.absent();
  }

  negative(): Value {
    return Value.absent();
  }

  positive(): Value {
    return Value.absent();
  }

  inverse(): Value {
    return Value.absent();
  }

  lambda(template: Value): Value {
    return new Item.LambdaFunc(this, template);
  }

  /**
   * Converts this `Value` into a `string` value, if possible; otherwise returns
   * `undefined` if this `Value` can't be converted into a `string` value.
   */
  stringValue(): string | undefined;
  /**
   * Converts this `Value` into a `string` value, if possible; otherwise returns
   * `orElse` if this `Value` can't be converted into a `string` value.
   */
  stringValue<T>(orElse: T): string | T;
  stringValue<T>(orElse?: T): string | T | undefined {
    return orElse;
  }

  /**
   * Converts this `Value` into a `number` value, if possible; otherwise returns
   * `undefined` if this `Value` can't be converted into a `number` value.
   */
  numberValue(): number | undefined;
  /**
   * Converts this `Value` into a `number` value, if possible; otherwise returns
   * `orElse` if this `Value` can't be converted into a `number` value.
   */
  numberValue<T>(orElse: T): number | T;
  numberValue<T>(orElse?: T): number | T | undefined {
    return orElse;
  }

  /**
   * Converts this `Value` into a `boolean` value, if possible; otherwise
   * returns `undefined` if this `Value` can't be converted into a `boolean`
   * value.
   */
  booleanValue(): boolean | undefined;
  /**
   * Converts this `Value` into a `boolean` value, if possible; otherwise
   * returns `orElse` if this `Value` can't be converted into a `boolean` value.
   */
  booleanValue<T>(orElse: T): boolean | T;
  booleanValue<T>(orElse?: T): boolean | T | undefined {
    return orElse;
  }

  abstract toAny(): AnyValue;

  isAliased(): boolean {
    return false;
  }

  isMutable(): boolean {
    return false;
  }

  alias(): void {
    // nop
  }

  branch(): Value {
    return this;
  }

  clone(): Value {
    return this;
  }

  commit(): this {
    return this;
  }

  keyEquals(key: unknown): boolean {
    return false;
  }

  static builder(): Builder<Item, Value> {
    return new ValueBuilder();
  }

  static empty(): Value {
    return Value.Record.empty();
  }

  static extant(): Value {
    return Value.Extant.extant();
  }

  static absent(): Value {
    return Value.Absent.absent();
  }

  static fromAny(value: AnyValue): Value {
    if (value instanceof Value) {
      return value;
    } else if (value === void 0) {
      return Value.Absent.absent();
    } else if (value === null) {
      return Value.Extant.extant();
    } else if (typeof value === "boolean") {
      return Value.Bool.from(value);
    } else if (typeof value === "number") {
      return Value.Num.from(value);
    } else if (typeof value === "string") {
      return Value.Text.from(value);
    } else if (value instanceof Uint8Array) {
      return Value.Data.wrap(value);
    } else if (Array.isArray(value)) {
      return Value.Record.fromArray(value);
    } else if (typeof value === "object") {
      return Value.Record.fromObject(value as {[key: string]: AnyValue});
    } else {
      throw new TypeError("" + value);
    }
  }
}
Item.Value = Value;
