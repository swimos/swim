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

import type {Interpolator} from "@swim/mapping";
import {AnyItem, Item} from "./Item";
import {FieldInterpolator} from "./"; // forward import
import {Attr} from "./"; // forward import
import {Slot} from "./" // forward import
import {AnyValue, Value} from "./"; // forward import
import {Record} from "./"; // forward import
import {AnyText, Text} from "./"; // forward import
import type {AnyNum} from "./Num";

export type AnyField = Field
                     | {readonly $key: AnyValue, readonly $value: AnyValue}
                     | {[key: string]: AnyValue};

export abstract class Field extends Item {
  /** @hidden */
  constructor() {
    super();
  }

  /**
   * Always returns `true` because a `Field` can never be [[Absent]].
   */
  isDefined(): boolean {
    return true;
  }

  /**
   * Always returns `true` because a `Field` can be neither [[Extant]] nor
   * [[Absent]].
   */
  isDistinct(): boolean {
    return true;
  }

  /**
   * Returns the key component of this `Field`.
   */
  abstract readonly key: Value;

  /**
   * Returns the value component of this `Field`.
   */
  abstract readonly value: Value;

  /**
   * Sets the value of this `Field` to the new `value`, returning the old value.
   *
   * @throws `Error` if this `Field` is immutable.
   */
  abstract setValue(value: AnyValue): Value;

  /**
   * Returns a copy of this `Field` with the updated `value`.
   */
  abstract updatedValue(value: AnyValue): Field;

  /**
   * Returns the value component of this `Field`.
   */
  toValue(): Value {
    return this.value;
  }

  /**
   * Always returns `undefined` because a `Field` can't be a `Record`, so it
   * can't have a first member `Attr` whose key string could be returned.
   */
  get tag(): string | undefined {
    return void 0;
  }

  /**
   * Always returns the value component of this `Field`.
   */
  get target(): Value {
    return this.value;
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be flattened into a
   * `Value`.
   */
  flattened(): Value {
    return Value.absent();
  }

  /**
   * Returns a `Record` containing just this `Field`.
   */
  unflattened(): Record {
    return Record.of(this);
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a head `Attr` whose value could be returned if its key were
   * equal to the `tag`.
   */
  header(tag: string): Value {
    return Value.absent();
  }

  /**
   * Always returns `undefined` because a `Field` can't be a `Record`, so it
   * can't have a head `Attr` whose value could be returned as a `Record` if
   * its key were equal to the `tag`.
   */
  headers(tag: string): Record | undefined {
    return void 0;
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a first member.
   */
  head(): Item {
    return Item.absent();
  }

  /**
   * Always returns an empty `Record` because a `Field` can't itself be a
   * `Record`, so it can't have any non-first members.
   */
  tail(): Record {
    return Record.empty();
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have any non-first members to flatten, and because a `Field` isn't
   * a distinct `Value`, so it can't return `Extant`.
   */
  body(): Value {
    return Value.absent();
  }

  /**
   * Always returns `0` because a `Field` can't be a `Record`, so it can't
   * contain any members.
   */
  get length(): number {
    return 0;
  }

  /**
   * Always returns `false` because a `Field` can't be a `Record`, so it can't
   * have a `Field` member whose key is equal to the given `key`.
   */
  has(key: AnyValue): boolean {
    return false;
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a `Field` member whose key is equal to the given `key`.
   */
  get(key: AnyValue): Value {
    return Value.absent();
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have an `Attr` member whose key is equal to the given `key`.
   */
  getAttr(key: AnyText): Value {
    return Value.absent();
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a `Slot` member whose key is equal to the given `key`.
   */
  getSlot(key: AnyValue): Value {
    return Value.absent();
  }

  /**
   * Always returns `undefined` because a `Field` can't be a `Record`, so it
   * can't have a `Field` member whose key is equal to the given `key`.
   */
  getField(key: AnyValue): Field | undefined {
    return void 0;
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a member at the given `index`.
   */
  getItem(index: AnyNum): Item {
    return Item.absent();
  }

  deleted(key: AnyValue): Field {
    return this;
  }

  conditional(thenTerm: Field, elseTerm: Field): Field;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item {
    thenTerm = Item.fromAny(thenTerm);
    return thenTerm;
  }

  or(that: Field): Field;
  or(that: AnyItem): Item;
  or(that: AnyItem): Item {
    return this;
  }

  and(that: Field): Field;
  and(that: AnyItem): Item;
  and(that: AnyItem): Item {
    that = Item.fromAny(that);
    return that;
  }

  lambda(template: Value): Value {
    return Value.absent();
  }

  /**
   * Converts the value of this `Field` into a `string` value, if possible.
   *
   * @throws `Error` if the value of this `Field` can't be converted into a
   *         `string` value.
   */
  stringValue(): string | undefined;
  /**
   * Converts the value of this `Field` into a `string` value, if possible;
   * otherwise returns `orElse` if the value of this `Field` can't be converted
   * into a `string` value.
   */
  stringValue<T>(orElse: T): string | T;
  stringValue<T>(orElse?: T): string | T | undefined {
    return this.value.stringValue(orElse);
  }

  /**
   * Converts the value of this `Field` into a `number` value, if possible.
   *
   * @throws `Error` if the value of this `Field` can't be converted into a
   *         `number` value.
   */
  numberValue(): number | undefined;
  /**
   * Converts the value of this `Field` into a `number` value, if possible;
   * otherwise returns `orElse` if the value of this `Field` can't be converted
   * into a `number` value.
   */
  numberValue<T>(orElse: T): number | T;
  numberValue<T>(orElse?: T): number | T | undefined {
    return this.value.numberValue(orElse);
  }

  /**
   * Converts the value of this `Field` into a `boolean` value, if possible.
   *
   * @throws `Error` if the value of this `Field` can't be converted into a
   *         `boolean` value.
   */
  booleanValue(): boolean | undefined;
  /**
   * Converts the value of this `Field` into a `boolean` value, if possible;
   * otherwise returns `orElse` if the value of this `Field` can't be converted
   * into a `boolean` value.
   */
  booleanValue<T>(orElse: T): boolean | T;
  booleanValue<T>(orElse?: T): boolean | T | undefined {
    return this.value.booleanValue(orElse);
  }

  abstract toAny(): AnyField;

  abstract branch(): Field;

  abstract clone(): Field;

  abstract commit(): this;

  interpolateTo(that: Field): Interpolator<Field>;
  interpolateTo(that: Item): Interpolator<Item>;
  interpolateTo(that: unknown): Interpolator<Item> | null;
  interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof Field) {
      return FieldInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  /** @hidden */
  static readonly ImmutableFlag: number = 1 << 0;

  static of(key: AnyValue, value?: AnyValue): Field {
    let name: string | undefined;
    if (typeof key === "string") {
      name = key;
    } else if (key instanceof Text) {
      name = key.value;
    }
    if (name !== void 0 && name.charCodeAt(0) === 64/*'@'*/) {
      name = name.slice(1);
      if (arguments.length === 1) {
        return Attr.of(name);
      } else {
        return Attr.of(name, value);
      }
    } else {
      if (arguments.length === 1) {
        return Slot.of(key);
      } else {
        return Slot.of(key, value);
      }
    }
  }

  static fromAny(field: AnyField): Field {
    if (field instanceof Field) {
      return field;
    } else if (typeof field === "object" && field !== null) {
      if ((field as any).$key !== void 0) {
        return Field.of((field as any).$key, (field as any).$value);
      } else {
        for (const key in field) {
          return Field.of(key, (field as any)[key]);
        }
      }
    }
    throw new TypeError("" + field);
  }
}
