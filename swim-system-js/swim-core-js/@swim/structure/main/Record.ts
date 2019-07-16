// Copyright 2015-2019 SWIM.AI inc.
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

import {Murmur3, Objects, Cursor, Builder} from "@swim/util";
import {Output} from "@swim/codec";
import {AnyItem, Item} from "./Item";
import {Field} from "./Field";
import {AnyValue, Value} from "./Value";
import {RecordCursor} from "./RecordCursor";
import {AnyText} from "./Text";
import {AnyNum} from "./Num";
import {AnyInterpreter, Interpreter} from "./Interpreter";

export type AnyRecord = Record
                      | {readonly [key: string]: AnyValue}
                      | ReadonlyArray<unknown>; // ReadonlyArray<AnyItem>

export abstract class Record extends Value implements Builder<Item, Record> {
  /** @hidden */
  _hashCode?: number;

  /** @hidden */
  constructor() {
    super();
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
    return this.fieldCount() === 0;
  }

  /**
   * Returns `true` if this `Record` has only [[Field]] members–no `Value`
   * members.
   */
  isObject(): boolean {
    return this.valueCount() === 0;
  }

  /**
   * Returns the number of members contained in this `Record`.
   */
  abstract get length(): number;

  /**
   * Returns the number of [[Field]] members contained in this `Record`.
   */
  fieldCount(): number {
    let count = 0;
    this.forEach(function (member: Item): void {
      if (member instanceof Item.Field) {
        count += 1;
      }
    }, this);
    return count;
  }

  /**
   * Returns the number of [[Value]] members contained in this `Record`.
   */
  valueCount(): number {
    let count = 0;
    this.forEach(function (member: Item): void {
      if (member instanceof Value) {
        count += 1;
      }
    }, this);
    return count;
  }

  isConstant(): boolean {
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
   * structure.  The `tag` can be used to discern the nominal type of a
   * polymorphic structure, similar to an XML element tag.
   */
  tag(): string | undefined {
    const item = this.head();
    if (item instanceof Item.Attr) {
      return item.key.value;
    }
    return void 0;
  }

  /**
   * Returns the [[Record.flattened flattened]] members of this `Record` after
   * all attributes have been removed.
   *
   * Used to concisely get the scalar value of an attributed structure.  An
   * attributed structure is a `Record` with one or more attributes that modify
   * one or more other members.
   */
  target(): Value {
    let value: Value | undefined;
    let record: Record | undefined;
    let modified = false;
    this.forEach(function (item: Item): void {
      if (item instanceof Item.Attr) {
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
    } else {
      return this;
    }
  }

  /**
   * Returns the sole member of this `Record`, if this `Record` has exactly one
   * member, and its member is a `Value`; returns [[Extant]] if this `Record`
   * is empty; otherwise returns `this` if this `Record` has more than one
   * member.
   *
   * Used to convert a unary `Record` into its member `Value`.  Facilitates
   * writing code that treats a unary `Record` equivalently to a bare `Value`.
   */
  flattened(): Value {
    if (this.isEmpty()) {
      return Value.extant();
    } else {
      const items = this.iterator();
      const head = items.head();
      items.step();
      if (items.isEmpty() && head instanceof Value) {
        return head;
      } else {
        return this.branch();
      }
    }
  }

  /**
   * Returns `this` `Record.
   */
  unflattened(): Record {
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
   * and only if the key string of the head `Attr` is equal to the `tag`.  Can
   * be used to check if a structure might conform to a nominal type named
   * `tag`, while simultaneously getting the value of the `tag` attribute.
   */
  header(tag: string): Value {
    const head = this.head();
    if (head instanceof Item.Attr && head.key.value === tag) {
      return head.value;
    } else {
      return Value.absent();
    }
  }

  /**
   * Returns the [[Record.unflattened unflattened]] [[Record.header header]] of
   * this `Record`.  The `headers` of the `tag` attribute of a structure are
   * like the attributes of an XML element tag; through unlike an XML element,
   * `tag` attribute headers are not limited to string keys and values.
   */
  headers(tag: string): Record | undefined {
    const head = this.head();
    if (head instanceof Item.Attr && head.key.value === tag) {
      const header = head.value;
      if (header instanceof Record) {
        return header;
      } else {
        return Record.of(header);
      }
    }
    return void 0;
  }

  /**
   * Returns the first member of this `Record`, if this `Record` is non-empty;
   * otherwise returns [[Absent]].
   */
  head(): Item {
    return this.forEach(function (item: Item): Item {
      return item;
    }, this) || Item.absent();
  }

  /**
   * Returns a view of all but the first member of this `Record`, if this
   * `Record` is non-empty; otherwise returns an empty `Record`, if this
   * `Record` is itself empty.
   */
  tail(): Record {
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
   * `Record`.  Used to recursively deconstruct a structure, terminating
   * with its last `Value`, rather than a unary `Record` containing its last
   * value, if the structure ends with a `Value` member.
   */
  body(): Value {
    const tail = this.tail();
    if (!tail.isEmpty()) {
      return tail.flattened();
    } else {
      return Value.absent();
    }
  }

  /**
   * Returns `true` if this `Record` has a [[Field]] member with a key that is
   * equal to the given `key`; otherwise returns `false` if this `Record` has
   * no `Field` member with a key equal to the given `key`.
   */
  has(key: AnyValue): boolean {
    key = Value.fromAny(key);
    return this.forEach(function (item: Item): boolean | undefined {
      return item instanceof Item.Field && item.key.equals(key) ? true : void 0;
    }, this) || false;
  }

  indexOf(item: AnyItem, index: number = 0): number {
    item = Item.fromAny(item);
    if (index < 0) {
      index = Math.max(0, this.length + index);
    }
    const i = this.forEach(function (member: Item, i: number): number | undefined {
      return i >= index && (item as Item).equals(member) ? i : void 0;
    }, this);
    return i !== void 0 ? i : -1;
  }

  lastIndexOf(item: AnyItem, index?: number): number {
    item = Item.fromAny(item);
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
  get(key: AnyValue): Value {
    key = Value.fromAny(key);
    return this.forEach(function (item: Item): Value | undefined {
      return item instanceof Item.Field && item.key.equals(key) ? item.value : void 0;
    }, this) || Value.absent();
  }

  /**
   * Returns the value of the last [[Attr]] member of this `Record` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Record` has no
   * `Attr` member with a key equal to the given `key`.
   */
  getAttr(key: AnyText): Value {
    key = Value.Text.fromAny(key);
    return this.forEach(function (item: Item): Value | undefined {
      return item instanceof Item.Attr && item.key.equals(key) ? item.value : void 0;
    }, this) || Value.absent();
  }

  /**
   * Returns the value of the last [[Slot]] member of this `Record` whose key
   * is equal to the given `key`; returns [[Absent]] if this `Record` has no
   * `Slot` member with a key equal to the given `key`.
   */
  getSlot(key: AnyValue): Value {
    key = Value.fromAny(key);
    return this.forEach(function (item: Item): Value | undefined {
      return item instanceof Item.Slot && item.key.equals(key) ? item.value : void 0;
    }, this) || Value.absent();
  }

  /**
   * Returns the last [[Field]] member of this `Record` whose key is equal to
   * the given `key`; returns `undefined` if this `Record` has no `Field` member
   * with a `key` equal to the given `key`.
   */
  getField(key: AnyValue): Field | undefined {
    key = Value.fromAny(key);
    return this.forEach(function (item: Item): Field | undefined {
      return item instanceof Item.Field && item.key.equals(key) ? item : void 0;
    }, this);
  }

  /**
   * Returns the member of this `Record` at the given `index`, if the `index`
   * is greater than or equal to zero, and less than the [[Record.length
   * length]] of this `Record`; otherwise returns [[Absent]] if the `index` is
   * out of bounds.
   */
  abstract getItem(index: AnyNum): Item;

  set(key: AnyValue, newValue: AnyValue): this {
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    const items = this.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item instanceof Item.Field && item.key.equals(key)) {
        if (item.isMutable()) {
          item.setValue(newValue);
        } else {
          items.set(item.updatedValue(newValue));
        }
        return this;
      }
      items.step();
    }
    this.push(new Item.Slot(key, newValue));
    return this;
  }

  setAttr(key: AnyText, newValue: AnyValue): this {
    key = Value.Text.fromAny(key);
    newValue = Value.fromAny(newValue);
    const items = this.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item instanceof Item.Field && item.key.equals(key)) {
        if (item instanceof Item.Attr && item.isMutable()) {
          item.setValue(newValue);
        } else {
          items.set(new Item.Attr(key, newValue));
        }
        return this;
      }
      items.step();
    }
    this.push(new Item.Attr(key, newValue));
    return this;
  }

  setSlot(key: AnyValue, newValue: AnyValue): this {
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    const items = this.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item instanceof Item.Field && item.key.equals(key)) {
        if (item instanceof Item.Slot && item.isMutable()) {
          item.setValue(newValue);
        } else {
          items.set(new Item.Slot(key, newValue));
        }
        return this;
      }
      items.step();
    }
    this.push(new Item.Slot(key, newValue));
    return this;
  }

  /**
   * Replaces the member of this `Record` at the given `index` with a new
   * `item`, returning {@code this} {@code Record}, if the {@code index} is
   * greater than or equal to zero, and less than the [[Record.length length]]
   * of this {@code Record}.
   *
   * @throws `Error` if this is an immutable `Record`.
   * @throws `RangeError` if the `index` is out of bounds.
   */
  abstract setItem(index: number, item: AnyItem): this;

  updated(key: AnyValue, value: AnyValue): Record {
    key = Value.fromAny(key);
    value = Value.fromAny(value);
    const record = this.isMutable() ? this : this.branch();
    const items = record.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item.key.equals(key)) {
        if (item instanceof Item.Field && item.isMutable()) {
          item.setValue(value);
        } else {
          items.set(new Item.Slot(key, value));
        }
        return record;
      }
      items.step();
    }
    record.push(new Item.Slot(key, value));
    return record;
  }

  updatedAttr(key: AnyText, value: AnyValue): Record {
    key = Value.Text.fromAny(key);
    value = Value.fromAny(value);
    const record = this.isMutable() ? this : this.branch();
    const items = record.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item.key.equals(key)) {
        if (item instanceof Item.Attr && item.isMutable()) {
          item.setValue(value);
        } else {
          items.set(new Item.Attr(key, value));
        }
        return record;
      }
      items.step();
    }
    record.push(new Item.Attr(key, value));
    return record;
  }

  updatedSlot(key: AnyValue, value: AnyValue): Record {
    key = Value.fromAny(key);
    value = Value.fromAny(value);
    const record = this.isMutable() ? this : this.branch();
    const items = record.iterator();
    while (!items.isEmpty()) {
      const item = items.head();
      if (item.key.equals(key)) {
        if (item instanceof Item.Slot && item.isMutable()) {
          item.setValue(value);
        } else {
          items.set(new Item.Slot(key, value));
        }
        return record;
      }
      items.step();
    }
    record.push(new Item.Slot(key, value));
    return record;
  }

  abstract push(...items: AnyItem[]): number;

  abstract splice(start: number, deleteCount?: number, ...newItems: AnyItem[]): Item[];

  abstract delete(key: AnyValue): Item;

  abstract clear(): void;

  appended(...items: AnyItem[]): Record {
    const record = this.isMutable() ? this : this.branch();
    record.push.apply(record, arguments);
    return record;
  }

  prepended(...items: AnyItem[]): Record {
    const record = this.isMutable() ? this : this.branch();
    record.splice.apply(record, Array.prototype.concat.apply([0, 0], arguments));
    return record;
  }

  deleted(key: AnyValue): Record {
    const record = this.isMutable() ? this : this.branch();
    record.delete(key);
    return record;
  }

  concat(...items: AnyItem[]): Record {
    const record = this.isMutable() ? this : this.branch();
    for (let i = 0, n = arguments.length; i < n; i += 1) {
      Item.fromAny(arguments[i]).forEach(function (item: Item): void {
        record.push(item);
      });
    }
    return record;
  }

  slice(lower?: number, upper?: number): Record {
    return this.subRecord.apply(this, arguments).branch();
  }

  attr(key: AnyText, value?: AnyValue): this {
    this.push(Item.Attr.of.apply(void 0, arguments));
    return this;
  }

  slot(key: AnyValue, value?: AnyValue): this {
    this.push(Item.Slot.of.apply(void 0, arguments));
    return this;
  }

  item(item: AnyItem): this {
    this.push(item);
    return this;
  }

  items(...items: AnyItem[]): this {
    this.push.apply(this, arguments);
    return this;
  }

  evaluate(interpreter: AnyInterpreter): Record {
    interpreter = Interpreter.fromAny(interpreter);
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

  substitute(interpreter: AnyInterpreter): Record {
    interpreter = Interpreter.fromAny(interpreter);
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

  stringValue(): string | undefined;
  stringValue<T>(orElse: T): string | T;
  stringValue<T>(orElse?: T): string | T | undefined {
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

  toAny(): AnyValue {
    if (!this.isEmpty() && this.isArray()) {
      return this.toArray();
    } else {
      return this.toObject();
    }
  }

  toArray(): AnyItem[] {
    const array = new Array<AnyItem>(this.length);
    this.forEach(function (item: Item, index: number): void {
      if (item instanceof Value) {
        array[index] = item.toAny();
      } else if (item instanceof Item.Field) {
        array[index] = {
          $key: item.key.toAny(),
          $value: item.value.toAny(),
        };
      }
    }, this);
    return array;
  }

  toObject(): {[key: string]: AnyValue} {
    const object = {} as {[key: string]: AnyValue};
    this.forEach(function (item: Item, index: number): void {
      if (item instanceof Item.Attr) {
        object["@" + item.key.value] = item.value.toAny();
      } else if (item instanceof Item.Slot) {
        if (item.key instanceof Value.Text) {
          object[item.key.value] = item.value.toAny();
        } else {
          object["$" + index] = {
            $key: item.key.toAny(),
            $value: item.value.toAny(),
          };
        }
      } else if (item instanceof Value) {
        object["$" + index] = item.toAny();
      }
    }, this);
    return object;
  }

  isAliased(): boolean {
    return false;
  }

  isMutable(): boolean {
    return true;
  }

  alias(): void {
    // nop
  }

  branch(): Record {
    const branch = Record.create();
    this.forEach(function (item: Item): void {
      branch.push(item);
    }, this);
    return branch;
  }

  clone(): Record {
    const clone = Record.create();
    this.forEach(function (item: Item): void {
      clone.push(item.clone());
    }, this);
    return clone;
  }

  commit(): this {
    return this;
  }

  bind(): Record {
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
    const record = Value.Record.create();
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

  abstract forEach<T, S = unknown>(callback: (this: S, item: Item, index: number) => T | void,
                                   thisArg?: S): T | undefined;

  iterator(): Cursor<Item> {
    return new RecordCursor(this);
  }

  typeOrder(): number {
    return 3;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof Record) {
      const xs = this.iterator();
      const ys = that.iterator();
      let order = 0 as 0 | 1 | -1;
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
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
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

  hashCode(): number {
    if (this._hashCode === void 0) {
      if (Record._hashSeed === void 0) {
        Record._hashSeed = Murmur3.seed(Record);
      }
      let code = Record._hashSeed;
      this.forEach(function (item: Item): void {
        code = Murmur3.mix(code, item.hashCode());
      }, this);
      this._hashCode = Murmur3.mash(code);
    }
    return this._hashCode;
  }

  debug(output: Output): void {
    output = output.write("Record").write(46/*'.'*/);
    if (this.isEmpty()) {
      output = output.write("empty").write(40/*'('*/).write(41/*')'*/);
    } else {
      output = output.write("of").write(40/*'('*/);
      this.forEach(function (item: Item, index: number): void {
        if (index !== 0) {
          output = output.write(44/*','*/).write(32/*' '*/);
        }
        output.display(item);
      }, this);
      output = output.write(41/*')'*/);
    }
  }

  display(output: Output): void {
    this.debug(output);
  }

  /** @hidden */
  static readonly ALIASED: number = 1;
  /** @hidden */
  static readonly IMMUTABLE: number = 2;

  private static _hashSeed?: number;

  static empty(): Record {
    return Record.RecordMap.empty();
  }

  static create(initialCapacity?: number): Record {
    return Record.RecordMap.create(initialCapacity);
  }

  static of(...items: AnyItem[]): Record {
    return Record.RecordMap.of.apply(void 0, arguments);
  }

  static fromAny(value: AnyRecord): Record {
    if (value instanceof Record) {
      return value;
    } else if (Array.isArray(value)) {
      return Record.fromArray(value);
    } else if (value && typeof value === "object") {
      return Record.fromObject(value as {[key: string]: AnyValue});
    } else {
      throw new TypeError("" + value);
    }
  }

  static fromArray(array: {[index: number]: AnyItem, length?: number}): Record {
    const n = array.length || 0;
    const record = Record.create(n);
    for (let i = 0; i < n; i += 1) {
      record.push(Item.fromAny(array[i]));
    }
    return record;
  }

  static fromObject(object: {[key: string]: AnyValue}): Record {
    const record = Record.create();
    for (const key in object) {
      const value = object[key];
      if (key.charCodeAt(0) === 36/*'$'*/) {
        if (!value || typeof value !== "object" || !value.hasOwnProperty("$key")) {
          record.push(Value.fromAny(value));
        } else {
          record.push(Item.Field.of((value as any).$key, (value as any).$value));
        }
      } else {
        record.push(Item.Field.of(key, value));
      }
    }
    return record;
  }

  /** @hidden */
  static expand(n: number): number {
    n = Math.max(8, n) - 1;
    n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
  }
}
Item.Record = Record;
