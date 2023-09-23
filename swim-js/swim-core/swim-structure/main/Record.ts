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

import type {Mutable} from "@swim/util";
import {Murmur3} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Interpolator} from "@swim/util";
import {Cursor} from "@swim/util";
import type {Builder} from "@swim/util";
import type {Output} from "@swim/codec";
import type {ItemLike} from "./Item";
import {Item} from "./Item";
import {Field} from "./Field";
import {Attr} from "./Attr";
import {Slot} from "./Slot";
import type {ValueLike} from "./Value";
import {Value} from "./Value";
import {RecordMap} from "./"; // forward import
import type {TextLike} from "./Text";
import {Text} from "./"; // forward import
import type {NumLike} from "./Num";
import type {InterpreterLike} from "./interpreter/Interpreter";
import {Interpreter} from "./"; // forward import

/** @public */
export type RecordLike = Record
                       | {readonly [key: string]: ValueLike}
                       | readonly ItemLike[];

/** @public */
export abstract class Record extends Value implements Builder<Item, Record> {
  /** @internal */
  constructor() {
    super();
  }

  override likeType?(like: {readonly [key: string]: ValueLike}
                         | readonly ItemLike[]): void;

  override isDefinite(): boolean {
    return !this.isEmpty();
  }

  /**
   * Returns `true` if this `Record` has no members.
   */
  abstract isEmpty(): boolean;

  /**
   * Returns `true` if this `Record` has only [[Value]] members–no `Field`
   * members.
   */
  isArray(): boolean {
    return this.fieldCount === 0;
  }

  /**
   * Returns `true` if this `Record` has only [[Field]] members–no `Value`
   * members.
   */
  isObject(): boolean {
    return this.valueCount === 0;
  }

  /**
   * Returns the number of members contained in this `Record`.
   */
  abstract override get length(): number;

  /**
   * Returns the number of [[Field]] members contained in this `Record`.
   */
  declare readonly fieldCount: number; // getter defined below to work around useDefineForClassFields lunacy

  /**
   * Returns the number of [[Value]] members contained in this `Record`.
   */
  get valueCount(): number {
    let count = 0;
    this.forEach(function (member: Item): void {
      if (member instanceof Value) {
        count += 1;
      }
    }, this);
    return count;
  }

  override isConstant(): boolean {
    return this.forEach(function (member: Item): boolean | undefined {
      return member.isConstant() ? void 0 : false;
    }, this) === void 0;
  }

  /**
   * Returns the `key` string of the first member of this `Record`, if the
   * first member is an [[Attr]]; otherwise returns `undefined` if the first
   * member is not an `Attr`.
   *
   * Used to concisely get the name of the discriminating attribute of a
   * structure. The `tag` can be used to discern the nominal type of a
   * polymorphic structure, similar to an XML element tag.
   */
  override get tag(): string | undefined {
    const item = this.head();
    if (item instanceof Attr) {
      return item.key.value;
    }
    return void 0;
  }

  /**
   * Returns the [[Record.flattened flattened]] members of this `Record` after
   * all attributes have been removed.
   *
   * Used to concisely get the scalar value of an attributed structure. An
   * attributed structure is a `Record` with one or more attributes that modify
   * one or more other members.
   */
  override get target(): Value {
    let value: Value | undefined;
    let record: Record | undefined;
    let modified = false;
    this.forEach(function (item: Item): void {
      if (item instanceof Attr) {
        modified = true;
      } else if (value === void 0 && item instanceof Value) {
        value = item;
      } else {
        if (record === void 0) {
          record = Record.create();
          if (value !== void 0) {
            record.push(value);
          }
        }
        record.push(item);
      }
    }, this);
    if (value === void 0) {
      return Value.extant();
    } else if (record === void 0) {
      return value;
    } else if (modified) {
      return record;
    }
    return this;
  }

  /**
   * Returns the sole member of this `Record`, if this `Record` has exactly one
   * member, and its member is a `Value`; returns [[Extant]] if this `Record`
   * is empty; otherwise returns `this` if this `Record` has more than one
   * member.
   *
   * Used to convert a unary `Record` into its member `Value`. Facilitates
   * writing code that treats a unary `Record` equivalently to a bare `Value`.
   */
  override flattened(): Value {
    if (this.isEmpty()) {
      return Value.extant();
    }
    const items = this.iterator();
    const head = items.head();
    items.step();
    if (items.isEmpty() && head instanceof Value) {
      return head;
    } else {
      return this.branch();
    }
  }

  /**
   * Returns this `Record`.
   */
  override unflattened(): Record {
    return this;
  }

  /**
   * Returns the value of the first member of this `Record`, if the first
   * member is an [[Attr]] whose `key` string is equal to `tag`; otherwise
   * returns [[Absent]] if the first member of this `Record` is not an `Attr`,
   * or if the first member of this `Record` is an `Attr` whose `key` does not
   * equal the `tag`.
   *
   * Used to conditionally get the value of the head `Attr` of a structure, if
   * and only if the key string of the head `Attr` is equal to the `tag`. Can
   * be used to check if a structure might conform to a nominal type named
   * `tag`, while simultaneously getting the value of the `tag` attribute.
   */
  override header(tag: string): Value {
    const head = this.head();
    if (!(head instanceof Attr) || head.key.value !== tag) {
      return Value.absent();
    }
    return head.value;
  }

  /**
   * Returns the [[Record.unflattened unflattened]] [[Record.header header]] of
   * this `Record`. The `headers` of the `tag` attribute of a structure are
   * like the attributes of an XML element tag; through unlike an XML element,
   * `tag` attribute headers are not limited to string keys and values.
   */
  override headers(tag: string): Record | undefined {
    const head = this.head();
    if (!(head instanceof Attr) || head.key.value !== tag) {
      return void 0;
    }
    const header = head.value;
    if (header instanceof Record) {
      return header;
    }
    return Record.of(header);
  }

  /**
   * Returns the first member of this `Record`, if this `Record` is non-empty;
   * otherwise returns [[Absent]].
   */
  override head(): Item {
    return this.forEach(function (item: Item): Item {
      return item;
    }, this) || Item.absent();
  }

  /**
   * Returns a view of all but the first member of this `Record`, if this
   * `Record` is non-empty; otherwise returns an empty `Record`, if this
   * `Record` is itself empty.
   */
  override tail(): Record {
    const tail = Record.create();
    this.forEach(function (item: Item, index: number): void {
      if (index > 0) {
        tail.push(item);
      }
    }, this);
    return tail;
  }

  /**
   * Returns the [[Record.flattened flattened]] [[Record.tail tail]] of this
   * `Record`. Used to recursively deconstruct a structure, terminating
   * with its last `Value`, rather than a unary `Record` containing its last
   * value, if the structure ends with a `Value` member.
   */
  override body(): Value {
    const tail = this.tail();
    if (tail.isEmpty()) {
      return Value.absent();
    }
    return tail.flattened();
  }

  /**
   * Returns `true` if this `Record` has a [[Field]] member with a key that is
   * equal to the given `key`; otherwise returns `false` if this `Record` has
   * no `Field` member with a key equal to the given `key`.
   */
  override has(key: ValueLike): boolean {
    key = Value.fromLike(key);
    return this.forEach(function (item: Item): boolean | undefined {
      return item instanceof Field && item.key.equals(key) ? true : void 0;
    }, this) || false;
  }

  indexOf(item: ItemLike, index: number = 0): number {
    item = Item.fromLike(item);
    if (index < 0) {
      index = Math.max(0, this.length + index);
    }
    const i = this.forEach(function (member: Item, i: number): number | undefined {
      return i >= index && (item as Item).equals(member) ? i : void 0;
    }, this);
    return i !== void 0 ? i : -1;
  }

  lastIndexOf(item: ItemLike, index?: number): number {
    item = Item.fromLike(item);
    const n = this.length;
    if (index === void 0) {
      index = n - 1;
    } else if (index < 0) {
      index = n + index;
    }
    index = Math.min(index, n - 1);
    while (index >= 0) {
      if (item.equals(this.getItem(index))) {
        return index;
      }
      index -= 1;
    }
    return -1;
  }

  /**
   * Returns the value of the last [[Field]] member of this `Record` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Record` has no
   * `Field` member with a key equal to the given `key`.
   */
  override get(key: ValueLike): Value {
    key = Value.fromLike(key);
    return this.forEach(function (item: Item): Value | undefined {
      return item instanceof Field && item.key.equals(key) ? item.value : void 0;
    }, this) || Value.absent();
  }

  /**
   * Returns the value of the last [[Attr]] member of this `Record` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Record` has no
   * `Attr` member with a key equal to the given `key`.
   */
  override getAttr(key: TextLike): Value {
    key = Text.fromLike(key);
    return this.forEach(function (item: Item): Value | undefined {
      return item instanceof Attr && item.key.equals(key) ? item.value : void 0;
    }, this) || Value.absent();
  }

  /**
   * Returns the value of the last [[Slot]] member of this `Record` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Record` has no
   * `Slot` member with a key equal to the given `key`.
   */
  override getSlot(key: ValueLike): Value {
    key = Value.fromLike(key);
    return this.forEach(function (item: Item): Value | undefined {
      return item instanceof Slot && item.key.equals(key) ? item.value : void 0;
    }, this) || Value.absent();
  }

  /**
   * Returns the last [[Field]] member of this `Record` whose key is equal to
   * the given `key`; returns `undefined` if this `Record` has no `Field` member
   * with a `key` equal to the given `key`.
   */
  override getField(key: ValueLike): Field | undefined {
    key = Value.fromLike(key);
    return this.forEach(function (item: Item): Field | undefined {
      return item instanceof Field && item.key.equals(key) ? item : void 0;
    }, this);
  }

  /**
   * Returns the member of this `Record` at the given `index`, if the `index`
   * is greater than or equal to zero, and less than the [[Record.length
   * length]] of this `Record`; otherwise returns [[Absent]] if the `index` is
   * out of bounds.
   */
  abstract override getItem(index: NumLike): Item;

  set(key: ValueLike, newValue: ValueLike): this {
    key = Value.fromLike(key);
    newValue = Value.fromLike(newValue);
    const items = this.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item instanceof Field && item.key.equals(key)) {
        if (item.isMutable()) {
          item.setValue(newValue);
        } else {
          items.set(item.updatedValue(newValue));
        }
        return this;
      }
      items.step();
    }
    this.push(new Slot(key, newValue));
    return this;
  }

  setAttr(key: TextLike, newValue: ValueLike): this {
    key = Text.fromLike(key);
    newValue = Value.fromLike(newValue);
    const items = this.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item instanceof Field && item.key.equals(key)) {
        if (item instanceof Attr && item.isMutable()) {
          item.setValue(newValue);
        } else {
          items.set(new Attr(key, newValue));
        }
        return this;
      }
      items.step();
    }
    this.push(new Attr(key, newValue));
    return this;
  }

  setSlot(key: ValueLike, newValue: ValueLike): this {
    key = Value.fromLike(key);
    newValue = Value.fromLike(newValue);
    const items = this.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item instanceof Field && item.key.equals(key)) {
        if (item instanceof Slot && item.isMutable()) {
          item.setValue(newValue);
        } else {
          items.set(new Slot(key, newValue));
        }
        return this;
      }
      items.step();
    }
    this.push(new Slot(key, newValue));
    return this;
  }

  /**
   * Replaces the member of this `Record` at the given `index` with a new
   * `item`, returning `this` `Record`, if the `index` is greater than or
   * equal to zero, and less than the [[Record.length length]] of this `Record`.
   *
   * @throws `Error` if this is an immutable `Record`.
   * @throws `RangeError` if the `index` is out of bounds.
   */
  abstract setItem(index: number, item: ItemLike): this;

  override updated(key: ValueLike, value: ValueLike): Record {
    key = Value.fromLike(key);
    value = Value.fromLike(value);
    const record = this.isMutable() ? this : this.branch();
    const items = record.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item.key.equals(key)) {
        if (item instanceof Field && item.isMutable()) {
          item.setValue(value);
        } else {
          items.set(new Slot(key, value));
        }
        return record;
      }
      items.step();
    }
    record.push(new Slot(key, value));
    return record;
  }

  override updatedAttr(key: TextLike, value: ValueLike): Record {
    key = Text.fromLike(key);
    value = Value.fromLike(value);
    const record = this.isMutable() ? this : this.branch();
    const items = record.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item.key.equals(key)) {
        if (item instanceof Attr && item.isMutable()) {
          item.setValue(value);
        } else {
          items.set(new Attr(key, value));
        }
        return record;
      }
      items.step();
    }
    record.push(new Attr(key, value));
    return record;
  }

  override updatedSlot(key: ValueLike, value: ValueLike): Record {
    key = Value.fromLike(key);
    value = Value.fromLike(value);
    const record = this.isMutable() ? this : this.branch();
    const items = record.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item.key.equals(key)) {
        if (item instanceof Slot && item.isMutable()) {
          item.setValue(value);
        } else {
          items.set(new Slot(key, value));
        }
        return record;
      }
      items.step();
    }
    record.push(new Slot(key, value));
    return record;
  }

  abstract push(...items: ItemLike[]): number;

  abstract splice(start: number, deleteCount?: number, ...newItems: ItemLike[]): Item[];

  abstract delete(key: ValueLike): Item;

  abstract clear(): void;

  override appended(...items: ItemLike[]): Record {
    const record = this.isMutable() ? this : this.branch();
    record.push(...items);
    return record;
  }

  override prepended(...items: ItemLike[]): Record {
    const record = this.isMutable() ? this : this.branch();
    record.splice(0, 0, ...items);
    return record;
  }

  override deleted(key: ValueLike): Record {
    const record = this.isMutable() ? this : this.branch();
    record.delete(key);
    return record;
  }

  override concat(...items: ItemLike[]): Record {
    const record = this.isMutable() ? this : this.branch();
    for (let i = 0; i < items.length; i += 1) {
      Item.fromLike(items[i]).forEach(function (item: Item): void {
        record.push(item);
      });
    }
    return record;
  }

  slice(lower?: number, upper?: number): Record {
    return this.subRecord(lower, upper).branch();
  }

  attr(key: TextLike, value?: ValueLike): this {
    let field: Field;
    if (arguments.length === 1) {
      field = Attr.of(key);
    } else {
      field = Attr.of(key, value);
    }
    this.push(field);
    return this;
  }

  slot(key: ValueLike, value?: ValueLike): this {
    let field: Field;
    if (arguments.length === 1) {
      field = Slot.of(key);
    } else {
      field = Slot.of(key, value);
    }
    this.push(field);
    return this;
  }

  item(item: ItemLike): this {
    this.push(item);
    return this;
  }

  items(...items: ItemLike[]): this {
    this.push(this, ...items);
    return this;
  }

  override evaluate(interpreter: InterpreterLike): Record {
    interpreter = Interpreter.fromLike(interpreter);
    const scope = Record.create();
    interpreter.pushScope(scope);
    let changed = false;
    this.forEach(function (oldItem: Item): void {
      const newItem = oldItem.evaluate(interpreter);
      if (newItem.isDefined()) {
        scope.push(newItem);
      }
      if (oldItem !== newItem) {
        changed = true;
      }
    }, this);
    interpreter.popScope();
    return changed ? scope : this;
  }

  override substitute(interpreter: InterpreterLike): Record {
    interpreter = Interpreter.fromLike(interpreter);
    const scope = Record.create();
    interpreter.pushScope(scope);
    let changed = false;
    this.forEach(function (oldItem: Item) {
      const newItem = oldItem.substitute(interpreter);
      if (newItem.isDefined()) {
        scope.push(newItem);
      }
      if (oldItem !== newItem) {
        changed = true;
      }
    }, this);
    interpreter.popScope();
    return changed ? scope : this;
  }

  override stringValue(): string | undefined;
  override stringValue<T>(orElse: T): string | T;
  override stringValue<T>(orElse?: T): string | T | undefined {
    let recordString = "";
    const defined = this.forEach(function (item: Item): null | void {
      if (item instanceof Value) {
        const itemString = item.stringValue();
        if (itemString !== void 0) {
          recordString += itemString;
          return;
        }
      }
      return null; // break
    }, this) === void 0;
    return defined ? recordString : void 0;
  }

  override toLike(): ValueLike {
    if (!this.isEmpty() && this.isArray()) {
      return this.toArray();
    }
    return this.toObject();
  }

  toArray(): ItemLike[] {
    const array = new Array<ItemLike>(this.length);
    this.forEach(function (item: Item, index: number): void {
      if (item instanceof Value) {
        array[index] = item.toLike();
      } else if (item instanceof Field) {
        array[index] = {
          $key: item.key.toLike(),
          $value: item.value.toLike(),
        };
      }
    }, this);
    return array;
  }

  toObject(): {[key: string]: ValueLike} {
    const object = {} as {[key: string]: ValueLike};
    this.forEach(function (item: Item, index: number): void {
      if (item instanceof Attr) {
        object["@" + item.key.value] = item.value.toLike();
      } else if (item instanceof Slot) {
        if (item.key instanceof Text) {
          object[item.key.value] = item.value.toLike();
        } else {
          object["$" + index] = {
            $key: item.key.toLike(),
            $value: item.value.toLike(),
          };
        }
      } else if (item instanceof Value) {
        object["$" + index] = item.toLike();
      }
    }, this);
    return object;
  }

  override isAliased(): boolean {
    return false;
  }

  override isMutable(): boolean {
    return true;
  }

  override alias(): void {
    // nop
  }

  override branch(): Record {
    const branch = Record.create();
    this.forEach(function (item: Item): void {
      branch.push(item);
    }, this);
    return branch;
  }

  override clone(): Record {
    const clone = Record.create();
    this.forEach(function (item: Item): void {
      clone.push(item.clone());
    }, this);
    return clone;
  }

  override commit(): this {
    return this;
  }

  build(): Record {
    return this;
  }

  subRecord(lower?: number, upper?: number): Record {
    const n = this.length;
    if (lower === void 0) {
      lower = 0;
    } else if (lower < 0) {
      lower = n + lower;
    }
    lower = Math.min(Math.max(0, lower), n);
    if (upper === void 0) {
      upper = n;
    } else if (upper < 0) {
      upper = n + upper;
    }
    const record = Record.create();
    this.forEach(function (item: Item, index: number): null | void {
      if (index < lower!) {
        return;
      } else if (index < upper!) {
        record.push(item);
        return;
      } else {
        return null;
      }
    }, this);
    return record;
  }

  abstract override forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  abstract override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void, thisArg: S): T | undefined;

  override iterator(): Cursor<Item> {
    return new RecordCursor(this);
  }

  override interpolateTo(that: Record): Interpolator<Record>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof Record) {
      return RecordInterpolator(this, that);
    }
    return super.interpolateTo(that);
  }

  override get typeOrder(): number {
    return 3;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Record) {
      const xs = this.iterator();
      const ys = that.iterator();
      let order = 0;
      do {
        if (!xs.isEmpty() && !ys.isEmpty()) {
          order = xs.head().compareTo(ys.head());
          xs.step();
          ys.step();
        } else {
          break;
        }
      } while (order === 0);
      if (order !== 0) {
        return order;
      } else if (xs.isEmpty() && !ys.isEmpty()) {
        return -1;
      } else if (!xs.isEmpty() && ys.isEmpty()) {
        return 1;
      } else {
        return 0;
      }
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Record) {
      const xs = this.iterator();
      const ys = that.iterator();
      while (!xs.isEmpty() && !ys.isEmpty()) {
        if (!xs.head().equivalentTo(ys.head(), epsilon)) {
          return false;
        }
        xs.step();
        ys.step();
      }
      return xs.isEmpty() && ys.isEmpty();
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof Record) {
      const xs = this.iterator();
      const ys = that.iterator();
      while (!xs.isEmpty() && !ys.isEmpty()) {
        if (!xs.head().equals(ys.head())) {
          return false;
        }
        xs.step();
        ys.step();
      }
      return xs.isEmpty() && ys.isEmpty();
    }
    return false;
  }

  override hashCode(): number {
    let hashValue = Constructors.hash(Record);
    this.forEach(function (item: Item): void {
      hashValue = Murmur3.mix(hashValue, item.hashCode());
    }, this);
    return hashValue;
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Record").write(46/*'.'*/);
    if (this.isEmpty()) {
      output = output.write("empty").write(40/*'('*/).write(41/*')'*/);
    } else {
      output = output.write("of").write(40/*'('*/);
      this.forEach(function (item: Item, index: number): void {
        if (index !== 0) {
          output = output.write(44/*','*/).write(32/*' '*/);
        }
        output = output.display(item);
      }, this);
      output = output.write(41/*')'*/);
    }
    return output;
  }

  /** @internal */
  static readonly AliasedFlag: number = 1;
  /** @internal */
  static readonly ImmutableFlag: number = 2;

  static override empty(): Record {
    return RecordMap.empty();
  }

  static create(initialCapacity?: number): Record {
    return RecordMap.create(initialCapacity);
  }

  static of(...items: ItemLike[]): Record {
    return RecordMap.of(...items);
  }

  static override fromLike(value: RecordLike): Record {
    if (value instanceof Record) {
      return value;
    } else if (Array.isArray(value)) {
      return Record.fromArray(value);
    } else if (typeof value === "object" && value !== null) {
      return Record.fromObject(value as {[key: string]: ValueLike});
    }
    throw new TypeError("" + value);
  }

  static fromArray(array: {[index: number]: ItemLike, length?: number}): Record {
    const n = array.length || 0;
    const record = Record.create(n);
    for (let i = 0; i < n; i += 1) {
      record.push(Item.fromLike(array[i]));
    }
    return record;
  }

  static fromObject(object: {[key: string]: ValueLike}): Record {
    const record = Record.create();
    for (const key in object) {
      const value = object[key];
      if (key.charCodeAt(0) === 36/*'$'*/) {
        if (!value || typeof value !== "object" || !Object.prototype.hasOwnProperty.call(value, "$key")) {
          record.push(Value.fromLike(value));
        } else {
          record.push(Field.of((value as any).$key, (value as any).$value));
        }
      } else {
        record.push(Field.of(key, value));
      }
    }
    return record;
  }

  /** @internal */
  static expand(n: number): number {
    n = Math.max(8, n) - 1;
    n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
  }
}
Object.defineProperty(Record.prototype, "fieldCount", {
  get(this: Record): number {
    let count = 0;
    this.forEach(function (member: Item): void {
      if (member instanceof Field) {
        count += 1;
      }
    }, this);
    return count;
  },
  configurable: true,
});

/** @internal */
export interface RecordInterpolator extends Interpolator<Record> {
  /** @internal */
  readonly interpolators: readonly Interpolator<Item>[];

  readonly 0: Record;

  readonly 1: Record;

  equals(that: unknown): boolean;
}

/** @internal */
export const RecordInterpolator = (function (_super: typeof Interpolator) {
  const RecordInterpolator = function (y0: Record, y1: Record): RecordInterpolator {
    const interpolator = function (u: number): Record {
      const interpolators = interpolator.interpolators;
      const interpolatorCount = interpolators.length;
      const record = Record.create(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        record.push(interpolators[i]!(u));
      }
      return record;
    } as RecordInterpolator;
    Object.setPrototypeOf(interpolator, RecordInterpolator.prototype);
    const interpolatorCount = Math.min(y0.length, y1.length);
    const interpolators = new Array<Interpolator<Item>>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      interpolators[i] = y0.getItem(i)!.interpolateTo(y1.getItem(i)!);
    }
    (interpolator as Mutable<typeof interpolator>).interpolators = interpolators;
    return interpolator;
  } as {
    (y0: Record, y1: Record): RecordInterpolator;

    /** @internal */
    prototype: RecordInterpolator;
  };

  RecordInterpolator.prototype = Object.create(_super.prototype);
  RecordInterpolator.prototype.constructor = RecordInterpolator;

  Object.defineProperty(RecordInterpolator.prototype, 0, {
    get(this: RecordInterpolator): Record {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const record = Record.create(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        record.push(interpolators[i]![0]);
      }
      return record;
    },
    configurable: true,
  });

  Object.defineProperty(RecordInterpolator.prototype, 1, {
    get(this: RecordInterpolator): Record {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const record = Record.create(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        record.push(interpolators[i]![1]);
      }
      return record;
    },
    configurable: true,
  });

  RecordInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof RecordInterpolator) {
      const n = this.interpolators.length;
      if (n === that.interpolators.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.interpolators[i]!.equals(that.interpolators[i]!)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  };

  return RecordInterpolator;
})(Interpolator);

/** @internal */
export class RecordCursor extends Cursor<Item> {
  constructor(record: Record, lower?: number, upper?: number, index?: number) {
    super();
    if (lower === void 0) {
      lower = 0;
    }
    if (upper === void 0) {
      upper = record.length;
    }
    if (index === void 0) {
      index = lower;
    }
    this.record = record;
    this.lower = lower;
    this.upper = upper;
    this.index = index;
    this.direction = 0;
  }

  /** @internal */
  readonly record: Record;

  /** @internal */
  readonly lower: number;

  /** @internal */
  readonly upper: number;

  /** @internal */
  readonly index: number;

  /** @internal */
  readonly direction: number;

  override isEmpty(): boolean {
    return this.index >= this.upper;
  }

  override head(): Item {
    (this as Mutable<this>).direction = 0;
    if (this.index >= this.upper) {
      throw new Error("empty");
    }
    return this.record.getItem(this.index);
  }

  override step(): void {
    (this as Mutable<this>).direction = 0;
    const index = this.index;
    if (index >= this.upper) {
      throw new Error("empty");
    }
    (this as Mutable<this>).index = index + 1;
  }

  override skip(count: number): void {
    (this as Mutable<this>).index = Math.min(Math.max(this.lower, this.index + count, this.upper));
  }

  override hasNext(): boolean {
    return this.index < this.upper;
  }

  override nextIndex(): number {
    return this.index - this.lower;
  }

  override next(): IteratorResult<Item> {
    (this as Mutable<this>).direction = 1;
    const index = this.index;
    if (index >= this.upper) {
      (this as Mutable<this>).index = this.upper;
      return {done: true, value: void 0};
    }
    (this as Mutable<this>).index = index + 1;
    return {done: this.index === this.upper, value: this.record.getItem(index)};
  }

  override hasPrevious(): boolean {
    return this.index > this.lower;
  }

  override previousIndex(): number {
    return this.index - this.lower - 1;
  }

  override previous(): IteratorResult<Item> {
    (this as Mutable<this>).direction = -1;
    const index = this.index - 1;
    if (index < this.lower) {
      (this as Mutable<this>).index = 0;
      return {done: true, value: void 0};
    }
    (this as Mutable<this>).index = index;
    return {done: index === this.lower, value: this.record.getItem(index)};
  }

  override set(newItem: Item): void {
    if (this.direction > 0) {
      this.record.setItem(this.index - 1, newItem);
    } else {
      this.record.setItem(this.index, newItem);
    }
  }

  override delete(): void {
    let index = this.index;
    if (this.direction > 0) {
      index -= 1;
      (this as Mutable<this>).index = index;
    }
    this.record.splice(index, 1);
    (this as Mutable<this>).direction = 0;
  }
}
