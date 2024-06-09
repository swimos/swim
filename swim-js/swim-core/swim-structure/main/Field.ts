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
import {Interpolator} from "@swim/util";
import type {ItemLike} from "./Item";
import {Item} from "./Item";
import {Attr} from "./"; // forward import
import {Slot} from "./"; // forward import
import type {ValueLike} from "./Value";
import {Value} from "./"; // forward import
import {Record} from "./"; // forward import
import type {TextLike} from "./Text";
import {Text} from "./"; // forward import
import type {NumLike} from "./Num";

/** @public */
export type FieldLike = Field
                      | {readonly $key: ValueLike, readonly $value: ValueLike}
                      | {[key: string]: ValueLike};

/** @public */
export abstract class Field extends Item {
  /** @internal */
  constructor() {
    super();
  }

  override likeType?(like: {readonly $key: ValueLike, readonly $value: ValueLike}
                         | {[key: string]: ValueLike}): void;

  /**
   * Always returns `true` because a `Field` can never be [[Absent]].
   */
  override isDefined(): boolean {
    return true;
  }

  /**
   * Always returns `true` because a `Field` can be neither [[Extant]] nor
   * [[Absent]].
   */
  override isDistinct(): boolean {
    return true;
  }

  /**
   * Always returns `true` because a `Field` cannot be one of:
   * an empty `Record`, `False`, `Extant`, or `Absent`.
   */
  override isDefinite(): boolean {
    return true;
  }

  /**
   * Returns the key component of this `Field`.
   */
  abstract override readonly key: Value;

  /**
   * Returns the value component of this `Field`.
   */
  abstract readonly value: Value;

  /**
   * Sets the value of this `Field` to the new `value`, returning the old value.
   *
   * @throws `Error` if this `Field` is immutable.
   */
  abstract setValue(value: ValueLike): Value;

  /**
   * Returns a copy of this `Field` with the updated `value`.
   */
  abstract updatedValue(value: ValueLike): Field;

  /**
   * Returns the value component of this `Field`.
   */
  override toValue(): Value {
    return this.value;
  }

  /**
   * Always returns `undefined` because a `Field` can't be a `Record`, so it
   * can't have a first member `Attr` whose key string could be returned.
   */
  override get tag(): string | undefined {
    return void 0;
  }

  /**
   * Always returns the value component of this `Field`.
   */
  override get target(): Value {
    return this.value;
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be flattened into a
   * `Value`.
   */
  override flattened(): Value {
    return Value.absent();
  }

  /**
   * Returns a `Record` containing just this `Field`.
   */
  override unflattened(): Record {
    return Record.of(this);
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a head `Attr` whose value could be returned if its key were
   * equal to the `tag`.
   */
  override header(tag: string): Value {
    return Value.absent();
  }

  /**
   * Always returns `undefined` because a `Field` can't be a `Record`, so it
   * can't have a head `Attr` whose value could be returned as a `Record` if
   * its key were equal to the `tag`.
   */
  override headers(tag: string): Record | undefined {
    return void 0;
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a first member.
   */
  override head(): Item {
    return Item.absent();
  }

  /**
   * Always returns an empty `Record` because a `Field` can't itself be a
   * `Record`, so it can't have any non-first members.
   */
  override tail(): Record {
    return Record.empty();
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have any non-first members to flatten, and because a `Field` isn't
   * a distinct `Value`, so it can't return `Extant`.
   */
  override body(): Value {
    return Value.absent();
  }

  /**
   * Always returns `0` because a `Field` can't be a `Record`, so it can't
   * contain any members.
   */
  override get length(): number {
    return 0;
  }

  /**
   * Always returns `false` because a `Field` can't be a `Record`, so it can't
   * have a `Field` member whose key is equal to the given `key`.
   */
  override has(key: ValueLike): boolean {
    return false;
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a `Field` member whose key is equal to the given `key`.
   */
  override get(key: ValueLike): Value {
    return Value.absent();
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have an `Attr` member whose key is equal to the given `key`.
   */
  override getAttr(key: TextLike): Value {
    return Value.absent();
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a `Slot` member whose key is equal to the given `key`.
   */
  override getSlot(key: ValueLike): Value {
    return Value.absent();
  }

  /**
   * Always returns `undefined` because a `Field` can't be a `Record`, so it
   * can't have a `Field` member whose key is equal to the given `key`.
   */
  override getField(key: ValueLike): Field | undefined {
    return void 0;
  }

  /**
   * Always returns [[Absent]] because a `Field` can't be a `Record`, so it
   * can't have a member at the given `index`.
   */
  override getItem(index: NumLike): Item {
    return Item.absent();
  }

  override deleted(key: ValueLike): Field {
    return this;
  }

  override conditional(thenTerm: Field, elseTerm: Field): Field;
  override conditional(thenTerm: ItemLike, elseTerm: ItemLike): Item;
  override conditional(thenTerm: ItemLike, elseTerm: ItemLike): Item {
    thenTerm = Item.fromLike(thenTerm);
    return thenTerm;
  }

  override or(that: Field): Field;
  override or(that: ItemLike): Item;
  override or(that: ItemLike): Item {
    return this;
  }

  override and(that: Field): Field;
  override and(that: ItemLike): Item;
  override and(that: ItemLike): Item {
    that = Item.fromLike(that);
    return that;
  }

  override lambda(template: Value): Value {
    return Value.absent();
  }

  /**
   * Converts the value of this `Field` into a `string` value, if possible.
   *
   * @throws `Error` if the value of this `Field` can't be converted into a
   *         `string` value.
   */
  override stringValue(): string | undefined;
  /**
   * Converts the value of this `Field` into a `string` value, if possible;
   * otherwise returns `orElse` if the value of this `Field` can't be converted
   * into a `string` value.
   */
  override stringValue<T>(orElse: T): string | T;
  override stringValue<T>(orElse?: T): string | T | undefined {
    return this.value.stringValue(orElse);
  }

  /**
   * Converts the value of this `Field` into a `number` value, if possible.
   *
   * @throws `Error` if the value of this `Field` can't be converted into a
   *         `number` value.
   */
  override numberValue(): number | undefined;
  /**
   * Converts the value of this `Field` into a `number` value, if possible;
   * otherwise returns `orElse` if the value of this `Field` can't be converted
   * into a `number` value.
   */
  override numberValue<T>(orElse: T): number | T;
  override numberValue<T>(orElse?: T): number | T | undefined {
    return this.value.numberValue(orElse);
  }

  /**
   * Converts the value of this `Field` into a `boolean` value, if possible.
   *
   * @throws `Error` if the value of this `Field` can't be converted into a
   *         `boolean` value.
   */
  override booleanValue(): boolean | undefined;
  /**
   * Converts the value of this `Field` into a `boolean` value, if possible;
   * otherwise returns `orElse` if the value of this `Field` can't be converted
   * into a `boolean` value.
   */
  override booleanValue<T>(orElse: T): boolean | T;
  override booleanValue<T>(orElse?: T): boolean | T | undefined {
    return this.value.booleanValue(orElse);
  }

  abstract override toLike(): FieldLike;

  abstract override branch(): Field;

  abstract override clone(): Field;

  abstract override commit(): this;

  override interpolateTo(that: Field): Interpolator<Field>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof Field) {
      return FieldInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  /** @internal */
  static readonly ImmutableFlag: number = 1 << 0;

  static of(key: ValueLike, value?: ValueLike): Field {
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
    } else if (arguments.length === 1) {
      return Slot.of(key);
    } else {
      return Slot.of(key, value);
    }
  }

  static override fromLike(field: FieldLike): Field {
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

/** @internal */
export interface FieldInterpolator extends Interpolator<Field> {
  /** @internal */
  readonly keyInterpolator: Interpolator<Value>;
  /** @internal */
  readonly valueInterpolator: Interpolator<Value>;

  readonly 0: Field;

  readonly 1: Field;

  equals(that: unknown): boolean;
}

/** @internal */
export const FieldInterpolator = (function (_super: typeof Interpolator) {
  const FieldInterpolator = function (y0: Field, y1: Field): FieldInterpolator {
    const interpolator = function (u: number): Field {
      const key = interpolator.keyInterpolator(u);
      const value = interpolator.valueInterpolator(u);
      return Slot.of(key, value);
    } as FieldInterpolator;
    Object.setPrototypeOf(interpolator, FieldInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).keyInterpolator = y0.key.interpolateTo(y1.key);
    (interpolator as Mutable<typeof interpolator>).valueInterpolator = y0.value.interpolateTo(y1.value);
    return interpolator;
  } as {
    (y0: Field, y1: Field): FieldInterpolator;

    /** @internal */
    prototype: FieldInterpolator;
  };

  FieldInterpolator.prototype = Object.create(_super.prototype);
  FieldInterpolator.prototype.constructor = FieldInterpolator;

  Object.defineProperty(FieldInterpolator.prototype, 0, {
    get(this: FieldInterpolator): Field {
      return Slot.of(this.keyInterpolator[0], this.valueInterpolator[0]);
    },
    configurable: true,
  });

  Object.defineProperty(FieldInterpolator.prototype, 1, {
    get(this: FieldInterpolator): Field {
      return Slot.of(this.keyInterpolator[1], this.valueInterpolator[1]);
    },
    configurable: true,
  });

  FieldInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FieldInterpolator) {
      return this.keyInterpolator.equals(that.keyInterpolator)
          && this.valueInterpolator.equals(that.valueInterpolator);
    }
    return false;
  };

  return FieldInterpolator;
})(Interpolator);
