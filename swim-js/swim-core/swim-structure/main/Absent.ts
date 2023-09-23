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
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Cursor} from "@swim/util";
import type {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {ItemLike} from "./Item";
import {Item} from "./Item";
import {Attr} from "./Attr";
import {Slot} from "./Slot";
import type {ValueLike} from "./Value";
import {Value} from "./Value";
import {Record} from "./Record";
import type {TextLike} from "./Text";

/** @public */
export type AbsentLike = Absent | undefined;

/** @public */
export class Absent extends Value {
  /** @internal */
  private constructor() {
    super();
  }

  override likeType?(like: undefined): void;

  /**
   * Always returns `false` because `Absent` represents an undefined value.
   */
  override isDefined(): boolean {
    return false;
  }

  /**
   * Always returns `false` because `Absent` is not a distinct value.
   */
  override isDistinct(): boolean {
    return false;
  }

  /**
   * Always returns `false` because `Absent` is not a definite value.
   */
  override isDefinite(): boolean {
    return false;
  }

  override isConstant(): boolean {
    return true;
  }

  /**
   * Always returns an empty `Record` because `Absent` is not a distinct value.
   */
  override unflattened(): Record {
    return Record.empty();
  }

  override updated(key: ValueLike, value: ValueLike): Record {
    return Record.of(Slot.of(key, value));
  }

  override updatedAttr(key: TextLike, value: ValueLike): Record {
    return Record.of(Attr.of(key, value));
  }

  override updatedSlot(key: ValueLike, value: ValueLike): Record {
    return Record.of(Slot.of(key, value));
  }

  override appended(...items: ItemLike[]): Record {
    return Record.of(items);
  }

  override prepended(...items: ItemLike[]): Record {
    return Record.of(items);
  }

  override concat(...items: ItemLike[]): Record {
    const record = Record.create();
    for (let i = 0; i < items.length; i += 1) {
      Item.fromLike(items[i]).forEach(function (item: Item): void {
        record.push(item);
      });
    }
    return record;
  }

  override conditional(thenTerm: ValueLike, elseTerm: ValueLike): Value;
  override conditional(thenTerm: ItemLike, elseTerm: ItemLike): Item;
  override conditional(thenTerm: ItemLike, elseTerm: ItemLike): Item {
    return Item.fromLike(elseTerm);
  }

  override or(that: ValueLike): Value;
  override or(that: ItemLike): Item;
  override or(that: ItemLike): Item {
    return Item.fromLike(that);
  }

  override and(that: ValueLike): Value;
  override and(that: ItemLike): Item;
  override and(that: ItemLike): Item {
    return this;
  }

  override not(): Value {
    return Value.extant();
  }

  /**
   * Always returns `false` because `Absent` behaves like a falsey value.
   */
  override booleanValue(): boolean;
  /**
   * Always returns `false` because `Absent` behaves like a falsey value.
   */
  override booleanValue<T>(orElse: T): boolean;
  override booleanValue<T>(orElse?: T): boolean {
    return false;
  }

  override toLike(): AbsentLike {
    return void 0;
  }

  override forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void, thisArg: S): T | undefined;
  override forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void, thisArg?: S): T | undefined {
    return void 0;
  }

  override iterator(): Cursor<Item> {
    return Cursor.empty();
  }

  override interpolateTo(that: Absent): Interpolator<Absent>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    return super.interpolateTo(that);
  }

  override get typeOrder(): number {
    return 99;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown): boolean {
    return this === that;
  }

  override equals(that: unknown): boolean {
    return this === that;
  }

  override hashCode(): number {
    return Constructors.hash(Absent);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Value").write(46/*'.'*/).write("absent").write(40/*'('*/).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    output = output.write("undefined");
    return output;
  }

  @Lazy
  static override absent(): Absent {
    return new Absent();
  }

  static override fromLike(value: AbsentLike): Absent {
    if (value instanceof Absent) {
      return value;
    } else if (value === void 0) {
      return Absent.absent();
    }
    throw new TypeError("" + value);
  }
}
