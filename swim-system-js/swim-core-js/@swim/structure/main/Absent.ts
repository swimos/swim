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

import {Lazy, Numbers, Constructors, Cursor} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {AnyItem, Item} from "./Item";
import {Attr} from "./Attr";
import {Slot} from "./Slot";
import {AnyValue, Value} from "./Value";
import {Record} from "./Record";
import type {AnyText} from "./Text";

export type AnyAbsent = Absent | undefined;

export class Absent extends Value {
  /** @hidden */
  private constructor() {
    super();
  }

  /**
   * Always returns `false` because `Absent` represents an undefined value.
   */
  isDefined(): boolean {
    return false;
  }

  /**
   * Always returns `false` because `Absent` is not a distinct value.
   */
  isDistinct(): boolean {
    return false;
  }

  isConstant(): boolean {
    return true;
  }

  /**
   * Always returns an empty `Record` because `Absent` is not a distinct value.
   */
  unflattened(): Record {
    return Record.empty();
  }

  updated(key: AnyValue, value: AnyValue): Record {
    return Record.of(Slot.of(key, value));
  }

  updatedAttr(key: AnyText, value: AnyValue): Record {
    return Record.of(Attr.of(key, value));
  }

  updatedSlot(key: AnyValue, value: AnyValue): Record {
    return Record.of(Slot.of(key, value));
  }

  appended(...items: AnyItem[]): Record {
    return Record.of(items);
  }

  prepended(...items: AnyItem[]): Record {
    return Record.of(items);
  }

  concat(...items: AnyItem[]): Record {
    const record = Record.create();
    for (let i = 0, n = items.length; i < n; i += 1) {
      Item.fromAny(items[i]).forEach(function (item: Item): void {
        record.push(item);
      });
    }
    return record;
  }

  cond(thenTerm: AnyValue, elseTerm: AnyValue): Value;
  cond(thenTerm: AnyItem, elseTerm: AnyItem): Item;
  cond(thenTerm: AnyItem, elseTerm: AnyItem): Item {
    return Item.fromAny(elseTerm);
  }

  or(that: AnyValue): Value;
  or(that: AnyItem): Item;
  or(that: AnyItem): Item {
    return Item.fromAny(that);
  }

  and(that: AnyValue): Value;
  and(that: AnyItem): Item;
  and(that: AnyItem): Item {
    return this;
  }

  not(): Value {
    return Value.extant();
  }

  /**
   * Always returns `false` because `Absent` behaves like a falsey value.
   */
  booleanValue(): boolean;
  /**
   * Always returns `false` because `Absent` behaves like a falsey value.
   */
  booleanValue<T>(orElse: T): boolean;
  booleanValue<T>(orElse?: T): boolean {
    return false;
  }

  toAny(): AnyAbsent {
    return void 0;
  }

  forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void,
                thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void,
                thisArg?: S): T | undefined {
    return void 0;
  }

  iterator(): Cursor<Item> {
    return Cursor.empty();
  }

  interpolateTo(that: Absent): Interpolator<Absent>;
  interpolateTo(that: Item): Interpolator<Item>;
  interpolateTo(that: unknown): Interpolator<Item> | null;
  interpolateTo(that: unknown): Interpolator<Item> | null {
    return super.interpolateTo(that);
  }

  get typeOrder(): number {
    return 99;
  }

  compareTo(that: unknown): number {
    if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  equivalentTo(that: unknown): boolean {
    return this === that;
  }

  equals(that: unknown): boolean {
    return this === that;
  }

  hashCode(): number {
    return Constructors.hash(Absent);
  }

  debug(output: Output): void {
    output = output.write("Value").write(46/*'.'*/).write("absent").write(40/*'('*/).write(41/*')'*/);
  }

  display(output: Output): void {
    output = output.write("undefined");
  }

  @Lazy
  static absent(): Absent {
    return new Absent();
  }

  static fromAny(value: AnyAbsent): Absent {
    if (value instanceof Absent) {
      return value;
    } else if (value === void 0) {
      return Absent.absent();
    } else {
      throw new TypeError("" + value);
    }
  }
}
