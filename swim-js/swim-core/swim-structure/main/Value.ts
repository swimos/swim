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

import type {Interpolator} from "@swim/util";
import type {Builder} from "@swim/util";
import type {ItemLike} from "./Item";
import {Item} from "./Item";
import {Field} from "./"; // forward import
import {Attr} from "./Attr";
import {Slot} from "./Slot";
import {Record} from "./"; // forward import
import {Data} from "./"; // forward import
import type {TextLike} from "./Text";
import {Text} from "./"; // forward import
import type {NumLike} from "./Num";
import {Num} from "./"; // forward import
import {Bool} from "./"; // forward import
import {Extant} from "./"; // forward import
import {Absent} from "./"; // forward import
import {Expression} from "./"; // forward import
import {BitwiseOrOperator} from "./"; // forward import
import {BitwiseXorOperator} from "./"; // forward import
import {BitwiseAndOperator} from "./"; // forward import
import {LtOperator} from "./"; // forward import
import {LeOperator} from "./"; // forward import
import {EqOperator} from "./"; // forward import
import {NeOperator} from "./"; // forward import
import {GeOperator} from "./"; // forward import
import {GtOperator} from "./"; // forward import
import {PlusOperator} from "./"; // forward import
import {MinusOperator} from "./"; // forward import
import {TimesOperator} from "./"; // forward import
import {DivideOperator} from "./"; // forward import
import {ModuloOperator} from "./"; // forward import
import {LambdaFunc} from "./"; // forward import

/** @public */
export type ValueLike = Value
                      | {readonly [key: string]: ValueLike}
                      | readonly ItemLike[]
                      | Uint8Array
                      | string
                      | number
                      | boolean
                      | null
                      | undefined;

/** @public */
export abstract class Value extends Item {
  /** @internal */
  constructor() {
    super();
  }

  override likeType?(like: {readonly [key: string]: ValueLike}
                         | readonly ItemLike[]
                         | Uint8Array
                         | string
                         | number
                         | boolean
                         | null
                         | undefined): void;

  /**
   * Returns `true` if this `Value` is not [[Absent]].
   */
  override isDefined(): boolean {
    return true;
  }

  /**
   * Returns `true` if this `Value` is neither [[Extant]] nor [[Absent]].
   */
  override isDistinct(): boolean {
    return true;
  }

  /**
   * Returns `true` if this `Value` is not one of: an empty `Record`, `False`,
   * `Extant`, or `Absent`.
   */
  override isDefinite(): boolean {
    return true;
  }

  /**
   * Always returns [[Absent]] because a `Value` can't be a `Field`, so it
   * can't have a key component.
   */
  override get key(): Value {
    return Value.absent();
  }

  /**
   * Always returns `this` because every `Value` is its own value component.
   */
  override toValue(): Value {
    return this;
  }

  /**
   * Returns the `key` string of the first member of this `Value`, if this
   * `Value` is a [[Record]], and its first member is an [[Attr]]; otherwise
   * returns `undefined` if this `Value` is not a `Record`, or if this `Value`
   * is a `Record` whose first member is not an `Attr`.
   *
   * Used to concisely get the name of the discriminating attribute of a
   * structure. The `tag` can be used to discern the nominal type of a
   * polymorphic structure, similar to an XML element tag.
   */
  override get tag(): string | undefined {
    return void 0;
  }

  /**
   * Returns the [[Value.flattened flattened]] members of this `Value` after
   * all attributes have been removed, if this `Value` is a [[Record]];
   * otherwise returns `this` if this `Value` is not a `Record`.
   *
   * Used to concisely get the scalar value of an attributed structure. An
   * attributed structure is a `Record` with one or more attributes that modify
   * one or more other members.
   */
  override get target(): Value {
    return this;
  }

  /**
   * Returns the sole member of this `Value`, if this `Value` is a [[Record]]
   * with exactly one member, and its member is a `Value`; returns [[Extant]]
   * if this `Value` is an empty `Record`; otherwise returns `this` if this
   * `Value` is a `Record` with more than one member, or if this `Value` is a
   * not a `Record`.
   *
   * Used to convert a unary `Record` into its member `Value`. Facilitates
   * writing code that treats a unary `Record` equivalently to a bare `Value`.
   */
  override flattened(): Value {
    return this;
  }

  /**
   * Returns `this` if this `Value` is a [[Record]]; returns a `Record`
   * containing just this `Value`, if this `Value` is [[Value.isDistinct
   * distinct]]; otherwise returns an empty `Record` if this `Value` is
   * [[Extant]] or [[Absent]]. Facilitates writing code that treats a bare
   * `Value` equivalently to a unary `Record`.
   */
  override unflattened(): Record {
    return Record.of(this);
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
   * and only if the key string of the head `Attr` is equal to the `tag`. Can
   * be used to check if a structure might conform to a nominal type named
   * `tag`, while simultaneously getting the value of the `tag` attribute.
   */
  override header(tag: string): Value {
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
  override headers(tag: string): Record | undefined {
    return void 0;
  }

  /**
   * Returns the first member of this `Value`, if this `Value` is a non-empty
   * [[Record]]; otherwise returns [[Absent]].
   */
  override head(): Item {
    return Item.absent();
  }

  /**
   * Returns a view of all but the first member of this `Value`, if this
   * `Value` is a non-empty [[Record]]; otherwise returns an empty `Record`
   * if this `Value` is not a `Record`, of if this `Value` is itself an
   * empty `Record`.
   */
  override tail(): Record {
    return Record.empty();
  }

  /**
   * Returns the [[Record.flattened flattened]] [[Value.tail tail]] of this
   * `Value`. Used to recursively deconstruct a structure, terminating with
   * its last `Value`, rather than a unary `Record` containing its last value,
   * if the structure ends with a `Value` member.
   */
  override body(): Value {
    return Value.extant();
  }

  /**
   * Returns the number of members contained in this `Value`, if this `Value`
   * is a [[Record]]; otherwise returns `0` if this `Value` is not a `Record`.
   */
  override get length(): number {
    return 0;
  }

  /**
   * Returns `true` if this `Value` is a [[Record]] that has a [[Field]] member
   * with a key that is equal to the given `key`; otherwise returns `false` if
   * this `Value` is not a `Record`, or if this `Value` is a `Record`, but has
   * no `Field` member with a key equal to the given `key`.
   */
  override has(key: ValueLike): boolean {
    return false;
  }

  /**
   * Returns the value of the last [[Field]] member of this `Value` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Value` is not a
   * [[Record]], or if this `Value` is a `Record`, but has no `Field` member
   * with a key equal to the given `key`.
   */
  override get(key: ValueLike): Value {
    return Value.absent();
  }

  /**
   * Returns the value of the last [[Attr]] member of this `Value` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Value` is not a
   * [[Record]], or if this `Value` is a `Record`, but has no `Attr` member
   * with a key equal to the given `key`.
   */
  override getAttr(key: TextLike): Value {
    return Value.absent();
  }

  /**
   * Returns the value of the last [[Slot]] member of this `Value` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Value` is not a
   * [[Record]], or if this `Value` is a `Record`, but has no `Slot` member
   * with a key equal to the given `key`.
   */
  override getSlot(key: ValueLike): Value {
    return Value.absent();
  }

  /**
   * Returns the last [[Field]] member of this `Value` whose key is equal to
   * the given `key`; returns `undefined` if this `Value` is not a [[Record]],
   * or if this `Value` is a `Record`, but has no `Field` member with a `key`
   * equal to the given `key`.
   */
  override getField(key: ValueLike): Field | undefined {
    return void 0;
  }

  /**
   * Returns the member of this `Value` at the given `index`, if this `Value`
   * is a [[Record]], and the `index` is greater than or equal to zero, and
   * less than the [[Record.length length]] of the `Record`; otherwise returns
   * [[Absent]] if this `Value` is not a `Record`, or if this `Value` is a
   * `Record`, but the `index` is out of bounds.
   */
  override getItem(index: NumLike): Item {
    return Item.absent();
  }

  override deleted(key: ValueLike): Value {
    return this;
  }

  override conditional(thenTerm: ValueLike, elseTerm: ValueLike): Value;
  override conditional(thenTerm: ItemLike, elseTerm: ItemLike): Item;
  override conditional(thenTerm: ItemLike, elseTerm: ItemLike): Item {
    thenTerm = Item.fromLike(thenTerm);
    return thenTerm;
  }

  override or(that: ValueLike): Value;
  override or(that: ItemLike): Item;
  override or(that: ItemLike): Item {
    return this;
  }

  override and(that: ValueLike): Value;
  override and(that: ItemLike): Item;
  override and(that: ItemLike): Item {
    that = Item.fromLike(that);
    return that;
  }

  override bitwiseOr(that: ValueLike): Value;
  override bitwiseOr(that: ItemLike): Item;
  override bitwiseOr(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new BitwiseOrOperator(this, that);
    } else if (that instanceof Attr) {
      const newValue = this.bitwiseOr(that.value);
      if (newValue.isDefined()) {
        return new Attr(that.key, newValue);
      }
    } else if (that instanceof Slot) {
      const newValue = this.bitwiseOr(that.value);
      if (newValue.isDefined()) {
        return new Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  override bitwiseXor(that: ValueLike): Value;
  override bitwiseXor(that: ItemLike): Item;
  override bitwiseXor(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new BitwiseXorOperator(this, that);
    } else if (that instanceof Attr) {
      const newValue = this.bitwiseXor(that.value);
      if (newValue.isDefined()) {
        return new Attr(that.key, newValue);
      }
    } else if (that instanceof Slot) {
      const newValue = this.bitwiseXor(that.value);
      if (newValue.isDefined()) {
        return new Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  override bitwiseAnd(that: ValueLike): Value;
  override bitwiseAnd(that: ItemLike): Item;
  override bitwiseAnd(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new BitwiseAndOperator(this, that);
    } else if (that instanceof Attr) {
      const newValue = this.bitwiseAnd(that.value);
      if (newValue.isDefined()) {
        return new Attr(that.key, newValue);
      }
    } else if (that instanceof Slot) {
      const newValue = this.bitwiseAnd(that.value);
      if (newValue.isDefined()) {
        return new Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  override lt(that: ValueLike): Value;
  override lt(that: ItemLike): Item;
  override lt(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new LtOperator(this, that);
    }
    return super.lt(that);
  }

  override le(that: ValueLike): Value;
  override le(that: ItemLike): Item;
  override le(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new LeOperator(this, that);
    }
    return super.le(that);
  }

  override eq(that: ValueLike): Value;
  override eq(that: ItemLike): Item;
  override eq(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new EqOperator(this, that);
    }
    return super.eq(that);
  }

  override ne(that: ValueLike): Value;
  override ne(that: ItemLike): Item;
  override ne(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new NeOperator(this, that);
    }
    return super.ne(that);
  }

  override ge(that: ValueLike): Value;
  override ge(that: ItemLike): Item;
  override ge(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new GeOperator(this, that);
    }
    return super.ge(that);
  }

  override gt(that: ValueLike): Value;
  override gt(that: ItemLike): Item;
  override gt(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new GtOperator(this, that);
    }
    return super.gt(that);
  }

  override plus(that: ValueLike): Value;
  override plus(that: ItemLike): Item;
  override plus(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new PlusOperator(this, that);
    } else if (that instanceof Attr) {
      const newValue = this.plus(that.value);
      if (newValue.isDefined()) {
        return new Attr(that.key, newValue);
      }
    } else if (that instanceof Slot) {
      const newValue = this.plus(that.value);
      if (newValue.isDefined()) {
        return new Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  override minus(that: ValueLike): Value;
  override minus(that: ItemLike): Item;
  override minus(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new MinusOperator(this, that);
    } else if (that instanceof Attr) {
      const newValue = this.minus(that.value);
      if (newValue.isDefined()) {
        return new Attr(that.key, newValue);
      }
    } else if (that instanceof Slot) {
      const newValue = this.minus(that.value);
      if (newValue.isDefined()) {
        return new Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  override times(that: ValueLike): Value;
  override times(that: ItemLike): Item;
  override times(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new TimesOperator(this, that);
    } else if (that instanceof Attr) {
      const newValue = this.times(that.value);
      if (newValue.isDefined()) {
        return new Attr(that.key, newValue);
      }
    } else if (that instanceof Slot) {
      const newValue = this.times(that.value);
      if (newValue.isDefined()) {
        return new Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  override divide(that: ValueLike): Value;
  override divide(that: ItemLike): Item;
  override divide(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new DivideOperator(this, that);
    } else if (that instanceof Attr) {
      const newValue = this.divide(that.value);
      if (newValue.isDefined()) {
        return new Attr(that.key, newValue);
      }
    } else if (that instanceof Slot) {
      const newValue = this.divide(that.value);
      if (newValue.isDefined()) {
        return new Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  override modulo(that: ValueLike): Value;
  override modulo(that: ItemLike): Item;
  override modulo(that: ItemLike): Item {
    that = Item.fromLike(that);
    if (that instanceof Expression) {
      return new ModuloOperator(this, that);
    } else if (that instanceof Attr) {
      const newValue = this.modulo(that.value);
      if (newValue.isDefined()) {
        return new Attr(that.key, newValue);
      }
    } else if (that instanceof Slot) {
      const newValue = this.modulo(that.value);
      if (newValue.isDefined()) {
        return new Slot(that.key, newValue);
      }
    }
    return Item.absent();
  }

  override not(): Value {
    return Value.absent();
  }

  override bitwiseNot(): Value {
    return Value.absent();
  }

  override negative(): Value {
    return Value.absent();
  }

  override positive(): Value {
    return Value.absent();
  }

  override inverse(): Value {
    return Value.absent();
  }

  override lambda(template: Value): Value {
    return new LambdaFunc(this, template);
  }

  /**
   * Converts this `Value` into a `string` value, if possible; otherwise returns
   * `undefined` if this `Value` can't be converted into a `string` value.
   */
  override stringValue(): string | undefined;
  /**
   * Converts this `Value` into a `string` value, if possible; otherwise returns
   * `orElse` if this `Value` can't be converted into a `string` value.
   */
  override stringValue<T>(orElse: T): string | T;
  override stringValue<T>(orElse?: T): string | T | undefined {
    return orElse;
  }

  /**
   * Converts this `Value` into a `number` value, if possible; otherwise returns
   * `undefined` if this `Value` can't be converted into a `number` value.
   */
  override numberValue(): number | undefined;
  /**
   * Converts this `Value` into a `number` value, if possible; otherwise returns
   * `orElse` if this `Value` can't be converted into a `number` value.
   */
  override numberValue<T>(orElse: T): number | T;
  override numberValue<T>(orElse?: T): number | T | undefined {
    return orElse;
  }

  /**
   * Converts this `Value` into a `boolean` value, if possible; otherwise
   * returns `undefined` if this `Value` can't be converted into a `boolean`
   * value.
   */
  override booleanValue(): boolean | undefined;
  /**
   * Converts this `Value` into a `boolean` value, if possible; otherwise
   * returns `orElse` if this `Value` can't be converted into a `boolean` value.
   */
  override booleanValue<T>(orElse: T): boolean | T;
  override booleanValue<T>(orElse?: T): boolean | T | undefined {
    return orElse;
  }

  abstract override toLike(): ValueLike;

  override isAliased(): boolean {
    return false;
  }

  override isMutable(): boolean {
    return false;
  }

  override alias(): void {
    // nop
  }

  override branch(): Value {
    return this;
  }

  override clone(): Value {
    return this;
  }

  override commit(): this {
    return this;
  }

  override interpolateTo(that: Value): Interpolator<Value>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    return super.interpolateTo(that);
  }

  override keyEquals(key: unknown): boolean {
    return false;
  }

  static builder(): Builder<Item, Value> {
    return new ValueBuilder();
  }

  static override empty(): Value {
    return Record.empty();
  }

  static override extant(): Value {
    return Extant.extant();
  }

  static override absent(): Value {
    return Absent.absent();
  }

  static override fromLike(value: ValueLike): Value {
    if (value instanceof Value) {
      return value;
    } else if (value instanceof Item) {
      return Record.create(1).item(value);
    } else if (value === void 0) {
      return Absent.absent();
    } else if (value === null) {
      return Extant.extant();
    } else if (typeof value === "boolean") {
      return Bool.from(value);
    } else if (typeof value === "number") {
      return Num.from(value);
    } else if (typeof value === "string") {
      return Text.from(value);
    } else if (value instanceof Uint8Array) {
      return Data.wrap(value);
    } else if (Array.isArray(value)) {
      return Record.fromArray(value);
    } else if (typeof value === "object") {
      return Record.fromObject(value as {[key: string]: ValueLike});
    }
    throw new TypeError("" + value);
  }
}

/** @internal */
export class ValueBuilder implements Builder<Item, Value> {
  /** @internal */
  record: Record | null;
  /** @internal */
  value: Value | null;

  constructor() {
    this.record = null;
    this.value = null;
  }

  push(...items: Item[]): void {
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i]!;
      if (item instanceof Field) {
        return this.pushField(item);
      } else if (item instanceof Value) {
        return this.pushValue(item);
      } else {
        throw new TypeError("" + item);
      }
    }
  }

  /** @internal */
  pushField(item: Field): void {
    if (this.record === null) {
      this.record = Record.create();
      if (this.value !== null) {
        this.record.push(this.value);
        this.value = null;
      }
    }
    this.record.push(item);
  }

  /** @internal */
  pushValue(item: Value): void {
    if (this.record !== null) {
      this.record.push(item);
    } else if (this.value === null) {
      this.value = item;
    } else {
      this.record = Record.create();
      this.record.push(this.value);
      this.value = null;
      this.record.push(item);
    }
  }

  build(): Value {
    if (this.record !== null) {
      return this.record;
    } else if (this.value !== null) {
      return this.value;
    }
    return Value.absent();
  }
}
