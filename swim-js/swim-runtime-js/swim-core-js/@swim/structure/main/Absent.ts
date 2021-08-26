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

  override updated(key: AnyValue, value: AnyValue): Record {
    return Record.of(Slot.of(key, value));
  }

  override updatedAttr(key: AnyText, value: AnyValue): Record {
    return Record.of(Attr.of(key, value));
  }

  override updatedSlot(key: AnyValue, value: AnyValue): Record {
    return Record.of(Slot.of(key, value));
  }

  override appended(...items: AnyItem[]): Record {
    return Record.of(items);
  }

  override prepended(...items: AnyItem[]): Record {
    return Record.of(items);
  }

  override concat(...items: AnyItem[]): Record {
    const record = Record.create();
    for (let i = 0, n = items.length; i < n; i += 1) {
      Item.fromAny(items[i]).forEach(function (item: Item): void {
        record.push(item);
      });
    }
    return record;
  }

  override conditional(thenTerm: AnyValue, elseTerm: AnyValue): Value;
  override conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item;
  override conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item {
    return Item.fromAny(elseTerm);
  }

  override or(that: AnyValue): Value;
  override or(that: AnyItem): Item;
  override or(that: AnyItem): Item {
    return Item.fromAny(that);
  }

  override and(that: AnyValue): Value;
  override and(that: AnyItem): Item;
  override and(that: AnyItem): Item {
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

  override toAny(): AnyAbsent {
    return void 0;
  }

  override forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void,
                         thisArg: S): T | undefined;
  override forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void,
                         thisArg?: S): T | undefined {
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

  override debug(output: Output): void {
    output = output.write("Value").write(46/*'.'*/).write("absent").write(40/*'('*/).write(41/*')'*/);
  }

  override display(output: Output): void {
    output = output.write("undefined");
  }

  @Lazy
  static override absent(): Absent {
    return new Absent();
  }

  static override fromAny(value: AnyAbsent): Absent {
    if (value instanceof Absent) {
      return value;
    } else if (value === void 0) {
      return Absent.absent();
    } else {
      throw new TypeError("" + value);
    }
  }
}
