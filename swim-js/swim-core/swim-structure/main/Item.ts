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

import {Lazy} from "@swim/util";
import type {Mutable} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {Compare} from "@swim/util";
import {Cursor} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import type {Display} from "@swim/codec";
import {Format} from "@swim/codec";
import type {Field} from "./Field";
import type {ValueLike} from "./Value";
import {Value} from "./"; // forward import
import {Record} from "./"; // forward import
import type {TextLike} from "./Text";
import type {NumLike} from "./Num";
import {Bool} from "./"; // forward import
import {Extant} from "./"; // forward import
import {Absent} from "./"; // forward import
import {Selector} from "./"; // forward import
import {MathModule} from "./"; // forward import
import type {InterpreterLike} from "./interpreter/Interpreter";
import type {Form} from "./form/Form";

/** @public */
export type ItemLike = Item
                     | {readonly $key: ValueLike, readonly $value: ValueLike}
                     | {readonly [key: string]: ValueLike}
                     | readonly ItemLike[]
                     | Uint8Array
                     | string
                     | number
                     | boolean
                     | null
                     | undefined;

/** @public */
export abstract class Item implements Interpolate<Item>, HashCode, Equivalent, Compare, Debug, Display {
  /** @internal */
  constructor() {
    // nop
  }

  likeType?(like: {readonly $key: ValueLike, readonly $value: ValueLike}
                | {readonly [key: string]: ValueLike}
                | readonly ItemLike[]
                | Uint8Array
                | string
                | number
                | boolean
                | null
                | undefined): void;

  /**
   * Returns `true` if this `Item` is not [[Absent]].
   */
  abstract isDefined(): boolean;

  /**
   * Returns `true` if this `Item` is neither [[Extant]] nor [[Absent]].
   */
  abstract isDistinct(): boolean;

  /**
   * Returns `true` if this `Item` is not one of: an empty `Record`, `False`,
   * `Extant`, or `Absent`.
   */
  abstract isDefinite(): boolean;

  /**
   * Returns `true` if this `Item` always [[Item.evaluate evaluates]] to the
   * same `Item`.
   */
  abstract isConstant(): boolean;

  /**
   * Returns the key component of this `Item`, if this `Item` is a [[Field]];
   * otherwise returns [[Absent]] if this `Item` is a `Value`.
   */
  abstract readonly key: Value;

  /**
   * Returns the value component of this `Item`, if this `Item` is a [[Field]];
   * otherwise returns `this` if this `Item` is a `Value`.
   */
  abstract toValue(): Value;

  /**
   * Returns the `key` string of the first member of this `Item`, if this `Item`
   * is a [[Record]], and its first member is an [[Attr]]; otherwise returns
   * `undefined` if this `Item` is not a `Record`, or if this `Item` is a
   * `Record` whose first member is not an `Attr`.
   *
   * Used to concisely get the name of the discriminating attribute of a
   * structure. The `tag` can be used to discern the nominal type of a
   * polymorphic structure, similar to an XML element tag.
   */
  abstract readonly tag: string | undefined;

  /**
   * Returns the [[Item.flattened flattened]] members of this `Item` after all
   * attributes have been removed, if this `Item` is a [[Record]]; otherwise
   * returns `this` if this `Item` is a non-`Record` `Value`, or returns
   * the value component if this `Item` is a `Field`.
   *
   * Used to concisely get the scalar value of an attributed structure. An
   * attributed structure is a `Record` with one or more attributes that modify
   * one or more other members.
   */
  abstract readonly target: Value;

  /**
   * Returns the sole member of this `Item`, if this `Item` is a [[Record]]
   * with exactly one member, and its member is a `Value`; returns [[Extant]]
   * if this `Item` is an empty `Record`; returns [[Absent]] if this `Item` is
   * a `Field`; otherwise returns `this` if this `Item` is a `Record` with more
   * than one member, or if this `Item` is a non-`Record` `Value`.
   *
   * Used to convert a unary `Record` into its member `Value`. Facilitates
   * writing code that treats a unary `Record` equivalently to a bare `Value`.
   */
  abstract flattened(): Value;

  /**
   * Returns `this` if this `Item` is a [[Record]]; returns a `Record`
   * containing just this `Item`, if this `Item` is [[Item.isDistinct
   * distinct]]; otherwise returns an empty `Record` if this `Item` is
   * [[Extant]] or [[Absent]]. Facilitates writing code that treats a bare
   * `Value` equivalently to a unary `Record`.
   */
  abstract unflattened(): Record;

  /**
   * Returns the value of the first member of this `Item`, if this `Item` is a
   * [[Record]], and its first member is an [[Attr]] whose `key` string is
   * equal to `tag`; otherwise returns [[Absent]] if this `Item` is not a
   * `Record`, or if this `Item` is a `Record` whose first member is not an
   * `Attr`, or if this `Item` is a `Record` whose first member is an `Attr`
   * whose `key` does not equal the `tag`.
   *
   * Used to conditionally get the value of the head `Attr` of a structure, if
   * and only if the key string of the head `Attr` is equal to the `tag`. Can
   * be used to check if a structure might conform to a nominal type named
   * `tag`, while simultaneously getting the value of the `tag` attribute.
   */
  abstract header(tag: string): Value;

  /**
   * Returns the [[Item.unflattened unflattened]] [[Item.header header]] of
   * this `Item`, if this `Item` is a [[Record]], and its first member is an
   * [[Attr]] whose `key` string is equal to `tag`; otherwise returns
   * `undefined`.
   *
   * The `headers` of the `tag` attribute of a structure are like the
   * attributes of an XML element tag; through unlike an XML element, `tag`
   * attribute headers are not limited to string keys and values.
   */
  abstract headers(tag: string): Record | undefined;

  /**
   * Returns the first member of this `Item`, if this `Item` is a non-empty
   * [[Record]]; otherwise returns [[Absent]].
   */
  abstract head(): Item;

  /**
   * Returns a view of all but the first member of this `Item`, if this `Item`
   * is a non-empty [[Record]]; otherwise returns an empty `Record` if this
   * `Item` is not a `Record`, or if this `Item` is itself an empty `Record`.
   */
  abstract tail(): Record;

  /**
   * Returns the [[Record.flattened flattened]] [[Item.tail tail]] of this
   * `Item`. Used to recursively deconstruct a structure, terminating with its
   * last `Value`, rather than a unary `Record` containing its last value, if
   * the structure ends with a `Value` member.
   */
  abstract body(): Value;

  /**
   * Returns the number of members contained in this `Item`, if this `Item` is
   * a [[Record]]; otherwise returns `0` if this `Item` is not a `Record`.
   */
  abstract readonly length: number;

  /**
   * Returns `true` if this `Item` is a [[Record]] that has a [[Field]] member
   * with a key that is equal to the given `key`; otherwise returns `false` if
   * this `Item` is not a `Record`, or if this `Item` is a `Record`, but has no
   * `Field` member with a key equal to the given `key`.
   */
  abstract has(key: ValueLike): boolean;

  /**
   * Returns the value of the last [[Field]] member of this `Item` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Item` is not a
   * [[Record]], or if this `Item` is a `Record`, but has no `Field` member
   * with a key equal to the given `key`.
   */
  abstract get(key: ValueLike): Value;

  /**
   * Returns the value of the last [[Attr]] member of this `Item` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Item` is not a
   * [[Record]], or if this `Item` is a `Record`, but has no `Attr` member
   * with a key equal to the given `key`.
   */
  abstract getAttr(key: TextLike): Value;

  /**
   * Returns the value of the last [[Slot]] member of this `Item` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Item` is not a
   * [[Record]], or if this `Item` is a `Record`, but has no `Slot` member
   * with a key equal to the given `key`.
   */
  abstract getSlot(key: ValueLike): Value;

  /**
   * Returns the last [[Field]] member of this `Item` whose key is equal to the
   * given `key`; returns `undefined` if this `Item` is not a [[Record]], or if
   * this `Item` is a `Record`, but has no `Field` member with a `key` equal to
   * the given `key`.
   */
  abstract getField(key: ValueLike): Field | undefined;

  /**
   * Returns the member of this `Item` at the given `index`, if this `Item` is
   * a [[Record]], and the `index` is greater than or equal to zero, and less
   * than the [[Record.length length]] of the `Record`; otherwise returns
   * [[Absent]] if this `Item` is not a `Record`, or if this `Item` is a
   * `Record`, but the `index` is out of bounds.
   */
  abstract getItem(index: NumLike): Item;

  updated(key: ValueLike, value: ValueLike): Record {
    const record = Record.create(2);
    record.push(this);
    record.set(key, value);
    return record;
  }

  updatedAttr(key: TextLike, value: ValueLike): Record {
    const record = Record.create(2);
    record.push(this);
    record.setAttr(key, value);
    return record;
  }

  updatedSlot(key: ValueLike, value: ValueLike): Record {
    const record = Record.create(2);
    record.push(this);
    record.setSlot(key, value);
    return record;
  }

  appended(...items: ItemLike[]): Record {
    const record = Record.create(1 + arguments.length);
    record.push(this);
    record.push(...items);
    return record;
  }

  prepended(...items: ItemLike[]): Record {
    const record = Record.create(arguments.length + 1);
    record.push(...items);
    record.push(this);
    return record;
  }

  abstract deleted(key: ValueLike): Item;

  concat(...items: ItemLike[]): Record {
    const record = Record.create();
    record.push(this);
    for (let i = 0; i < items.length; i += 1) {
      Item.fromLike(items[i]).forEach(function (item: Item): void {
        record.push(item);
      });
    }
    return record;
  }

  abstract conditional(thenTerm: Item, elseTerm: Item): Item;

  abstract or(that: Item): Item;

  abstract and(that: Item): Item;

  abstract bitwiseOr(that: ItemLike): Item;

  abstract bitwiseXor(that: ItemLike): Item;

  abstract bitwiseAnd(that: ItemLike): Item;

  lt(that: ItemLike): Item {
    that = Item.fromLike(that);
    return this.compareTo(that) < 0 ? Bool.from(true) : Item.absent();
  }

  le(that: ItemLike): Item {
    that = Item.fromLike(that);
    return this.compareTo(that) <= 0 ? Bool.from(true) : Item.absent();
  }

  eq(that: ItemLike): Item {
    that = Item.fromLike(that);
    return this.equals(that) ? Bool.from(true) : Item.absent();
  }

  ne(that: ItemLike): Item {
    that = Item.fromLike(that);
    return !this.equals(that) ? Bool.from(true) : Item.absent();
  }

  ge(that: ItemLike): Item {
    that = Item.fromLike(that);
    return this.compareTo(that) >= 0 ? Bool.from(true) : Item.absent();
  }

  gt(that: ItemLike): Item {
    that = Item.fromLike(that);
    return this.compareTo(that) > 0 ? Bool.from(true) : Item.absent();
  }

  abstract plus(that: ItemLike): Item;

  abstract minus(that: ItemLike): Item;

  abstract times(that: ItemLike): Item;

  abstract divide(that: ItemLike): Item;

  abstract modulo(that: ItemLike): Item;

  abstract not(): Item;

  abstract bitwiseNot(): Item;

  abstract negative(): Item;

  abstract positive(): Item;

  abstract inverse(): Item;

  invoke(args: Value): Item {
    return Item.absent();
  }

  abstract lambda(template: Value): Value;

  filter(predicate?: ItemLike): Selector {
    const selector = Selector.literal(this);
    if (arguments.length === 0) {
      return selector.filter();
    } else {
      return selector.filter(predicate);
    }
  }

  max(that: Item): Item {
    return this.compareTo(that) >= 0 ? this : that;
  }

  min(that: Item): Item {
    return this.compareTo(that) <= 0 ? this : that;
  }

  evaluate(interpreter: InterpreterLike): Item {
    return this;
  }

  substitute(interpreter: InterpreterLike): Item {
    return this;
  }

  /**
   * Converts this `Item` into a `string` value, if possible; otherwise returns
   * `undefined` if this `Item` can't be converted into a `string` value.
   */
  abstract stringValue(): string | undefined;

  /**
   * Converts this `Item` into a `string` value, if possible; otherwise returns
   * `orElse` if this `Item` can't be converted into a `string` value.
   */
  abstract stringValue<T>(orElse: T): string | T;

  /**
   * Converts this `Item` into a `number` value, if possible; otherwise returns
   * `undefined` if this `Item` can't be converted into a `number` value.
   */
  abstract numberValue(): number | undefined;

  /**
   * Converts this `Item` into a `number` value, if possible; otherwise returns
   * `orElse` if this `Item` can't be converted into a `number` value.
   */
  abstract numberValue<T>(orElse: T): number | T;

  /**
   * Converts this `Item` into a `boolean` value, if possible; otherwise returns
   * `undefined` if this `Item` can't be converted into a `boolean` value.
   */
  abstract booleanValue(): boolean | undefined;

  /**
   * Converts this `Item` into a `boolean` value, if possible; otherwise returns
   * `orElse` if this `Item` can't be converted into a `boolean` value.
   */
  abstract booleanValue<T>(orElse: T): boolean | T;

  cast<T>(form: Form<T, unknown>): T | undefined;

  cast<T, E = T>(form: Form<T, unknown>, orElse: E): T | E;

  cast<T, E = T>(form: Form<T, unknown>, orElse?: E): T | E | undefined {
    let object: T | E | undefined = form.cast(this);
    if (object === void 0) {
      object = orElse;
    }
    return object;
  }

  coerce<T>(form: Form<T, unknown>): T;

  coerce<T, E = T>(form: Form<T, unknown>, orElse: E): T | E;

  coerce<T, E = T>(form: Form<T, unknown>, orElse?: E): T | E {
    let object: T | E | undefined = form.cast(this);
    if (object === void 0) {
      object = form.unit;
    }
    if (object === void 0) {
      object = orElse;
    }
    return object!;
  }

  abstract toLike(): ItemLike;

  abstract isAliased(): boolean;

  abstract isMutable(): boolean;

  abstract alias(): void;

  abstract branch(): Item;

  abstract clone(): Item;

  abstract commit(): this;

  /** @internal */
  get precedence(): number {
    return 11;
  }

  forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void, thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | undefined, thisArg?: S): T | undefined {
    return callback.call(thisArg, this, 0);
  }

  iterator(): Cursor<Item> {
    return Cursor.unary(this);
  }

  [Symbol.iterator](): Cursor<Item> {
    return this.iterator();
  }

  /** @override */
  interpolateTo(that: Item): Interpolator<Item>;
  interpolateTo(that: unknown): Interpolator<Item> | null;
  interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof Item) {
      return ItemInterpolator(this, that);
    }
    return null;
  }

  /**
   * Returns the heterogeneous sort order of this `Item`. Used to impose a
   * total order on the set of all items. When comparing two items of
   * different types, the items order according to their `typeOrder`.
   */
  abstract readonly typeOrder: number;

  /** @override */
  abstract compareTo(that: unknown): number;

  /** @override */
  abstract equivalentTo(that: unknown, epsilon?: number): boolean;

  abstract keyEquals(key: unknown): boolean;

  /** @override */
  abstract equals(that: unknown): boolean;

  /** @override */
  abstract hashCode(): number;

  /** @override */
  abstract debug<T>(output: Output<T>): Output<T>;

  /** @override */
  display<T>(output: Output<T>): Output<T> {
    return this.debug(output);
  }

  /** @override */
  toString(): string {
    return Format.debug(this);
  }

  static empty(): Item {
    return Record.empty();
  }

  static extant(): Item {
    return Extant.extant();
  }

  static absent(): Item {
    return Absent.absent();
  }

  static fromLike(item: ItemLike): Item {
    if (item instanceof Item) {
      return item;
    }
    return Value.fromLike(item);
  }

  @Lazy
  static globalScope(): Item {
    return Record.create(1)
        .slot("math", MathModule.scope)
        .commit();
  }
}

/** @internal */
export const ItemInterpolator = (function (_super: typeof Interpolator) {
  const ItemInterpolator = function <Y extends Item>(y0: Y, y1: Y): Interpolator<Y> {
    const interpolator = function (u: number): Y {
      return u < 1 ? interpolator[0] : interpolator[1];
    } as Interpolator<Y>;
    Object.setPrototypeOf(interpolator, ItemInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = y0.commit();
    (interpolator as Mutable<typeof interpolator>)[1] = y1.commit();
    return interpolator;
  } as {
    <Y extends Item>(y0: Y, y1: Y): Interpolator<Y>;

    /** @internal */
    prototype: Interpolator<any>;
  };

  ItemInterpolator.prototype = Object.create(_super.prototype);
  ItemInterpolator.prototype.constructor = ItemInterpolator;

  return ItemInterpolator;
})(Interpolator);
