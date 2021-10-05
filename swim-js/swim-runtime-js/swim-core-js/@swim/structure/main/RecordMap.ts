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

import {Lazy, Mutable} from "@swim/util";
import {AnyItem, Item} from "./Item";
import {Field} from "./Field";
import {Attr} from "./Attr";
import {Slot} from "./Slot";
import {AnyValue, Value} from "./Value";
import {Record} from "./Record";
import {RecordMapView} from "./"; // forward import
import {AnyText, Text} from "./"; // forward import
import {AnyNum, Num} from "./"; // forward import
import {AnyInterpreter, Interpreter} from "./"; // forward import

/** @internal */
export class RecordMap extends Record {
  constructor(array: Array<Item> | null, table: Array<Field> | null,
              length: number, fieldCount: number, flags: number) {
    super();
    this.array = array;
    this.table = table;
    Object.defineProperty(this, "length", {
      value: length,
      writable: true,
      enumerable: true,
      configurable: true,
    })
    Object.defineProperty(this, "fieldCount", {
      value: fieldCount,
      writable: true,
      enumerable: true,
      configurable: true,
    })
    this.flags = flags;
  }

  /** @internal */
  readonly array: Array<Item> | null;

  /** @internal */
  readonly table: Array<Field> | null;

  override isEmpty(): boolean {
    return this.length === 0;
  }

  override readonly length!: number;

  override readonly fieldCount!: number;

  override get valueCount(): number {
    return this.length - this.fieldCount;
  }

  /** @internal */
  readonly flags: number;

  override isConstant(): boolean {
    const array = this.array;
    for (let i = 0, n = this.length; i < n; i += 1) {
      if (!array![i]!.isConstant()) {
        return false;
      }
    }
    return true;
  }

  override get tag(): string | undefined {
    if (this.fieldCount > 0) {
      const head = this.array![0];
      if (head instanceof Attr) {
        return head.key.value;
      }
    }
    return void 0;
  }

  override get target(): Value {
    let value: Value | undefined;
    let record: Record | undefined;
    let modified = false;
    const array = this.array!;
    for (let i = 0, n = this.length; i < n; i += 1) {
      const item = array[i];
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
    }
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

  override head(): Item {
    if (this.length > 0) {
      return this.array![0]!;
    }
    return Item.absent();
  }

  override tail(): Record {
    const n = this.length;
    if (n > 0) {
      return new RecordMapView(this, 1, n);
    } else {
      return Record.empty();
    }
  }

  override body(): Value {
    const n = this.length;
    if (n > 2) {
      return new RecordMapView(this, 1, n).branch();
    } else if (n === 2) {
      const item = this.array![1];
      if (item instanceof Value) {
        return item;
      } else {
        return Record.of(item);
      }
    }
    return Value.absent();
  }

  override has(key: AnyValue): boolean {
    if (this.fieldCount !== 0) {
      key = Value.fromAny(key);
      const table = this.hashTable()!;
      const n = table.length;
      //assert(n > 0);
      const x = Math.abs(key.hashCode() % n);
      let i = x;
      do {
        const field = table[i];
        if (field !== void 0) {
          if (field.key.equals(key)) {
            return true;
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i !== x);
    }
    return false;
  }

  override indexOf(item: AnyItem, index: number = 0): number {
    item = Item.fromAny(item);
    const array = this.array!;
    const n = this.length;
    if (index < 0) {
      index = Math.max(0, n + index);
    }
    while (index < n) {
      if (item.equals(array[index])) {
        return index;
      }
      index += 1;
    }
    return -1;
  }

  override lastIndexOf(item: AnyItem, index?: number): number {
    item = Item.fromAny(item);
    const array = this.array!;
    const n = this.length;
    if (index === void 0) {
      index = n - 1;
    } else if (index < 0) {
      index = n + index;
    }
    index = Math.min(index, n - 1);
    while (index >= 0) {
      if (item.equals(array[index])) {
        return index;
      }
      index -= 1;
    }
    return -1;
  }

  override get(key: AnyValue): Value {
    if (this.fieldCount > 0) {
      key = Value.fromAny(key);
      const table = this.hashTable()!;
      const n = table.length;
      //assert(n > 0);
      const x = Math.abs(key.hashCode() % n);
      let i = x;
      do {
        const field = table[i];
        if (field !== void 0) {
          if (field.key.equals(key)) {
            return field.value;
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i !== x);
    }
    return Value.absent();
  }

  override getAttr(key: AnyText): Value {
    if (this.fieldCount > 0) {
      key = Text.fromAny(key);
      const table = this.hashTable()!;
      const n = table.length;
      //assert(n > 0);
      const x = Math.abs(key.hashCode() % n);
      let i = x;
      do {
        const field = table[i];
        if (field !== void 0) {
          if (field instanceof Attr && field.key.equals(key)) {
            return field.value;
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i !== x);
    }
    return Value.absent();
  }

  override getSlot(key: AnyValue): Value {
    if (this.fieldCount > 0) {
      key = Value.fromAny(key);
      const table = this.hashTable()!;
      const n = table.length;
      //assert(n > 0);
      const x = Math.abs(key.hashCode() % n);
      let i = x;
      do {
        const field = table[i];
        if (field !== void 0) {
          if (field instanceof Slot && field.key.equals(key)) {
            return field.value;
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i !== x);
    }
    return Value.absent();
  }

  override getField(key: AnyValue): Field | undefined {
    if (this.fieldCount > 0) {
      key = Value.fromAny(key);
      const table = this.hashTable()!;
      const n = table.length;
      //assert(n > 0);
      const x = Math.abs(key.hashCode() % n);
      let i = x;
      do {
        const field = table[i];
        if (field !== void 0) {
          if (field.key.equals(key)) {
            return field;
          }
        } else {
          break;
        }
        i = (i + 1) % n;
      } while (i !== x);
    }
    return void 0;
  }

  override getItem(index: AnyNum): Item {
    if (index instanceof Num) {
      index = index.value;
    }
    const n = this.length;
    if (index < 0) {
      index = n + index;
    }
    if (index >= 0 && index < n) {
      return this.array![index]!;
    } else {
      return Item.absent();
    }
  }

  override set(key: AnyValue, newValue: Value): this {
    if ((this.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    if ((this.flags & Record.AliasedFlag) !== 0) {
      if (this.fieldCount > 0) {
        this.setAliased(key, newValue);
      } else {
        this.pushAliased(new Slot(key, newValue));
      }
    } else {
      if (this.fieldCount > 0) {
        if (this.table !== null) {
          this.setMutable(key, newValue);
        } else {
          this.updateMutable(key, newValue);
        }
      } else {
        this.pushMutable(new Slot(key, newValue));
      }
    }
    return this;
  }

  /** @internal */
  setAliased(key: Value, newValue: Value): void {
    const n = this.length;
    const oldArray = this.array!;
    const newArray = new Array(Record.expand(n + 1));
    for (let i = 0; i < n; i += 1) {
      const item = oldArray[i];
      if (item instanceof Field && item.key.equals(key)) {
        newArray[i] = item.updatedValue(newValue);
        i += 1;
        while (i < n) {
          newArray[i] = oldArray[i];
          i += 1;
        }
        (this as Mutable<this>).array = newArray;
        (this as Mutable<this>).table = null;
        (this as Mutable<this>).flags &= ~Record.AliasedFlag;
        return;
      }
      newArray[i] = item;
    }
    newArray[n] = new Slot(key, newValue);
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).table = null;
    (this as Mutable<this>).length = n + 1;
    (this as Mutable<this>).fieldCount += 1;
    (this as Mutable<this>).flags &= ~Record.AliasedFlag;
  }

  /** @internal */
  setMutable(key: Value, newValue: Value): void {
    const table = this.table!;
    const n = table.length;
    //assert(n > 0);
    const x = Math.abs(key.hashCode() % n);
    let i = x;
    do {
      const field = table[i];
      if (field !== void 0) {
        if (field.key.equals(key)) {
          if (field.isMutable()) {
            field.setValue(newValue);
            return;
          } else {
            this.updateMutable(key, newValue);
            return;
          }
        }
      } else {
        break;
      }
      i = (i + 1) % n;
    } while (i !== x);
    const field = new Slot(key, newValue);
    this.pushMutable(field);
    RecordMap.put(table, field);
  }

  /** @internal */
  updateMutable(key: Value, newValue: Value): void {
    const array = this.array!;
    for (let i = 0, n = this.length; i < n; i += 1) {
      const item = array[i];
      if (item instanceof Field && item.key.equals(key)) {
        array[i] = item.updatedValue(newValue);
        (this as Mutable<this>).table = null;
        return;
      }
    }
    const field = new Slot(key, newValue);
    this.pushMutable(field);
    RecordMap.put(this.table, field);
  }

  override setAttr(key: AnyText, newValue: Value): this {
    if ((this.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    key = Text.fromAny(key);
    newValue = Value.fromAny(newValue);
    if ((this.flags & Record.AliasedFlag) !== 0) {
      if (this.fieldCount > 0) {
        this.setAttrAliased(key, newValue);
      } else {
        this.pushAliased(new Attr(key, newValue));
      }
    } else {
      if (this.fieldCount > 0) {
        if (this.table !== null) {
          this.setAttrMutable(key, newValue);
        } else {
          this.updateAttrMutable(key, newValue);
        }
      } else {
        this.pushMutable(new Attr(key, newValue));
      }
    }
    return this;
  }

  /** @internal */
  setAttrAliased(key: Text, newValue: Value): void {
    const n = this.length;
    const oldArray = this.array!;
    const newArray = new Array(Record.expand(n + 1));
    for (let i = 0; i < n; i += 1) {
      const item = oldArray[i];
      if (item instanceof Field && item.key.equals(key)) {
        newArray[i] = new Attr(key, newValue);
        i += 1;
        while (i < n) {
          newArray[i] = oldArray[i];
          i += 1;
        }
        (this as Mutable<this>).array = newArray;
        (this as Mutable<this>).table = null;
        (this as Mutable<this>).flags &= ~Record.AliasedFlag;
        return;
      }
      newArray[i] = item;
    }
    newArray[n] = new Attr(key, newValue);
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).table = null;
    (this as Mutable<this>).length = n + 1;
    (this as Mutable<this>).fieldCount += 1;
    (this as Mutable<this>).flags &= ~Record.AliasedFlag;
  }

  /** @internal */
  setAttrMutable(key: Text, newValue: Value): void {
    const table = this.table!;
    const n = table.length;
    //assert(n > 0);
    const x = Math.abs(key.hashCode() % n);
    let i = x;
    do {
      const field = table[i];
      if (field !== void 0) {
        if (field.key.equals(key)) {
          if (field instanceof Attr && field.isMutable()) {
            field.setValue(newValue);
          } else {
            this.updateAttrMutable(key, newValue);
          }
          return;
        }
      } else {
        break;
      }
      i = (i + 1) % n;
    } while (i !== x);
    const field = new Attr(key, newValue);
    this.push(field);
    RecordMap.put(table, field);
  }

  /** @internal */
  updateAttrMutable(key: Text, newValue: Value): void {
    const array = this.array!;
    for (let i = 0, n = this.length; i < n; i += 1) {
      const item = array[i];
      if (item instanceof Field && item.key.equals(key)) {
        array[i] = new Attr(key, newValue);
        (this as Mutable<this>).table = null;
        return;
      }
    }
    const field = new Attr(key, newValue);
    this.push(field);
    RecordMap.put(this.table, field);
  }

  override setSlot(key: AnyValue, newValue: Value): this {
    if ((this.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    if ((this.flags & Record.AliasedFlag) !== 0) {
      if (this.fieldCount > 0) {
        this.setSlotAliased(key, newValue);
      } else {
        this.pushAliased(new Slot(key, newValue));
      }
    } else {
      if (this.fieldCount > 0) {
        if (this.table !== null) {
          this.setSlotMutable(key, newValue);
        } else {
          this.updateSlotMutable(key, newValue);
        }
      } else {
        this.pushMutable(new Slot(key, newValue));
      }
    }
    return this;
  }

  /** @internal */
  setSlotAliased(key: Value, newValue: Value): void {
    const n = this.length;
    const oldArray = this.array!;
    const newArray = new Array(Record.expand(n + 1));
    for (let i = 0; i < n; i += 1) {
      const item = oldArray[i];
      if (item instanceof Field && item.key.equals(key)) {
        newArray[i] = new Slot(key, newValue);
        i += 1;
        while (i < n) {
          newArray[i] = oldArray[i];
          i += 1;
        }
        (this as Mutable<this>).array = newArray;
        (this as Mutable<this>).table = null;
        (this as Mutable<this>).flags &= ~Record.AliasedFlag;
        return;
      }
      newArray[i] = item;
    }
    newArray[n] = new Slot(key, newValue);
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).table = null;
    (this as Mutable<this>).length = n + 1;
    (this as Mutable<this>).fieldCount += 1;
    (this as Mutable<this>).flags &= ~Record.AliasedFlag;
  }

  /** @internal */
  setSlotMutable(key: Value, newValue: Value): void {
    const table = this.table!;
    const n = table.length;
    //assert(n > 0);
    const x = Math.abs(key.hashCode() % n);
    let i = x;
    do {
      const field = table[i];
      if (field !== void 0) {
        if (field.key.equals(key)) {
          if (field instanceof Slot && field.isMutable()) {
            field.setValue(newValue);
          } else {
            this.updateSlotMutable(key, newValue);
          }
          return;
        }
      } else {
        break;
      }
      i = (i + 1) % n;
    } while (i !== x);
    const field = new Slot(key, newValue);
    this.push(field);
    RecordMap.put(table, field);
  }

  /** @internal */
  updateSlotMutable(key: Value, newValue: Value): void {
    const array = this.array!;
    for (let i = 0, n = this.length; i < n; i += 1) {
      const item = array[i];
      if (item instanceof Field && item.key.equals(key)) {
        array[i] = new Slot(key, newValue);
        (this as Mutable<this>).table = null;
        return;
      }
    }
    const field = new Slot(key, newValue);
    this.push(field);
    RecordMap.put(this.table, field);
  }

  override setItem(index: number, newItem: AnyItem): this {
    if ((this.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    newItem = Item.fromAny(newItem);
    const n = this.length;
    if (index < 0) {
      index = n + index;
    }
    if (index < 0 || index > n) {
      throw new RangeError("" + index);
    }
    if ((this.flags & Record.AliasedFlag) !== 0) {
      this.setItemAliased(index, newItem);
    } else {
      this.setItemMutable(index, newItem);
    }
    return this;
  }

  /** @internal */
  setItemAliased(index: number, newItem: Item): void {
    const n = this.length;
    const oldArray = this.array!;
    const newArray = new Array(Record.expand(n));
    for (let i = 0; i < n; i += 1) {
      newArray[i] = oldArray[i];
    }
    const oldItem = oldArray[index];
    newArray[index] = newItem;
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).table = null;
    if (newItem instanceof Field) {
      if (!(oldItem instanceof Field)) {
        (this as Mutable<this>).fieldCount += 1;
      }
    } else if (oldItem instanceof Field) {
      (this as Mutable<this>).fieldCount -= 1;
    }
    (this as Mutable<this>).flags &= ~Record.AliasedFlag;
  }

  /** @internal */
  setItemMutable(index: number, newItem: Item): void {
    const array = this.array!;
    const oldItem = array[index];
    array[index] = newItem;
    if (newItem instanceof Field) {
      (this as Mutable<this>).table = null;
      if (!(oldItem instanceof Field)) {
        (this as Mutable<this>).fieldCount += 1;
      }
    } else if (oldItem instanceof Field) {
      (this as Mutable<this>).table = null;
      (this as Mutable<this>).fieldCount -= 1;
    }
  }

  override updated(key: AnyValue, newValue: AnyValue): Record {
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    const record = (this.flags & Record.ImmutableFlag) === 0 ? this : this.branch();
    if ((record.flags & Record.AliasedFlag) !== 0) {
      if (record.fieldCount > 0) {
        record.setAliased(key, newValue);
      } else {
        record.pushAliased(new Slot(key, newValue));
      }
    } else {
      if (record.fieldCount > 0) {
        if (record.table !== null) {
          record.setMutable(key, newValue);
        } else {
          record.updateMutable(key, newValue);
        }
      } else {
        record.pushMutable(new Slot(key, newValue));
      }
    }
    return record;
  }

  override updatedAttr(key: AnyText, newValue: AnyValue): Record {
    key = Text.fromAny(key);
    newValue = Value.fromAny(newValue);
    const record = (this.flags & Record.ImmutableFlag) === 0 ? this : this.branch();
    if ((record.flags & Record.AliasedFlag) !== 0) {
      if (record.fieldCount > 0) {
        record.setAttrAliased(key, newValue);
      } else {
        record.pushAliased(new Attr(key, newValue));
      }
    } else {
      if (record.fieldCount > 0) {
        if (record.table !== null) {
          record.setAttrMutable(key, newValue);
        } else {
          record.updateAttrMutable(key, newValue);
        }
      } else {
        record.pushMutable(new Attr(key, newValue));
      }
    }
    return record;
  }

  override updatedSlot(key: AnyValue, newValue: AnyValue): Record {
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    const record = (this.flags & Record.ImmutableFlag) === 0 ? this : this.branch();
    if ((record.flags & Record.AliasedFlag) !== 0) {
      if (record.fieldCount > 0) {
        record.setSlotAliased(key, newValue);
      } else {
        record.pushAliased(new Slot(key, newValue));
      }
    } else {
      if (record.fieldCount > 0) {
        if (record.table !== null) {
          record.setSlotMutable(key, newValue);
        } else {
          record.updateSlotMutable(key, newValue);
        }
      } else {
        record.pushMutable(new Slot(key, newValue));
      }
    }
    return record;
  }

  override push(...newItems: AnyItem[]): number {
    if ((this.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    if ((this.flags & Record.AliasedFlag) !== 0) {
      this.pushAliased(...newItems);
    } else {
      this.pushMutable(...newItems);
    }
    return this.length;
  }

  /** @internal */
  pushAliased(...newItems: AnyItem[]): void {
    const k = newItems.length;
    let m = this.length;
    let n = this.fieldCount;
    const oldArray = this.array;
    const newArray = new Array(Record.expand(m + k));
    if (oldArray !== null) {
      for (let i = 0; i < m; i += 1) {
        newArray[i] = oldArray[i];
      }
    }
    for (let i = 0; i < k; i += 1) {
      const newItem = Item.fromAny(newItems[i]);
      newArray[m] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
      }
    }
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).table = null;
    (this as Mutable<this>).length = m;
    (this as Mutable<this>).fieldCount = n;
    (this as Mutable<this>).flags &= ~Record.AliasedFlag;
  }

  /** @internal */
  pushMutable(...newItems: AnyItem[]): void {
    const k = newItems.length;
    let m = this.length;
    let n = this.fieldCount;
    const oldArray = this.array;
    let newArray;
    if (oldArray === null || m + k > oldArray.length) {
      newArray = new Array(Record.expand(m + k));
      if (oldArray !== null) {
        for (let i = 0; i < m; i += 1) {
          newArray[i] = oldArray[i];
        }
      }
    } else {
      newArray = oldArray;
    }
    for (let i = 0; i < k; i += 1) {
      const newItem = Item.fromAny(newItems[i]);
      newArray[m] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
        (this as Mutable<this>).table = null;
      }
    }
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).length = m;
    (this as Mutable<this>).fieldCount = n;
  }

  splice(start: number, deleteCount: number = 0, ...newItems: AnyItem[]): Item[] {
    if ((this.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    const n = this.length;
    if (start < 0) {
      start = n + start;
    }
    start = Math.min(Math.max(0, start), n);
    deleteCount = Math.min(Math.max(0, deleteCount), n - start);
    if ((this.flags & Record.AliasedFlag) !== 0) {
      return this.spliceAliased(start, deleteCount, ...newItems);
    } else {
      return this.spliceMutable(start, deleteCount, ...newItems);
    }
  }

  /** @internal */
  spliceAliased(start: number, deleteCount: number, ...newItems: AnyItem[]): Item[] {
    const k = newItems.length;
    let m = this.length;
    let n = this.fieldCount;
    const oldArray = this.array!;
    const newArray = new Array(Record.expand(m - deleteCount + k));
    for (let i = 0; i < start; i += 1) {
      newArray[i] = oldArray[i];
    }
    const oldItems: Item[] = [];
    for (let i = start; i < start + deleteCount; i += 1) {
      const oldItem = oldArray[i]!;
      oldItems.push(oldItem);
      m -= 1;
      if (oldItem instanceof Field) {
        n -= 1;
      }
    }
    for (let i = start; i < m; i += 1) {
      newArray[i + k] = oldArray[i + deleteCount];
    }
    for (let i = 0; i < k; i += 1) {
      const newItem = Item.fromAny(newItems[i]);
      newArray[i + start] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
      }
    }
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).table = null;
    (this as Mutable<this>).length = m;
    (this as Mutable<this>).fieldCount = n;
    (this as Mutable<this>).flags &= ~Record.AliasedFlag;
    return oldItems;
  }

  /** @internal */
  spliceMutable(start: number, deleteCount: number, ...newItems: AnyItem[]): Item[] {
    const k = newItems.length;
    let m = this.length;
    let n = this.fieldCount;
    const oldArray = this.array!;
    let newArray;
    if (oldArray === null || m - deleteCount + k > oldArray.length) {
      newArray = new Array(Record.expand(m - deleteCount + k));
      if (oldArray !== null) {
        for (let i = 0; i < start; i += 1) {
          newArray[i] = oldArray[i];
        }
      }
    } else {
      newArray = oldArray;
    }
    const oldItems: Item[] = [];
    for (let i = start; i < start + deleteCount; i += 1) {
      const oldItem = oldArray[i]!;
      oldItems.push(oldItem);
      m -= 1;
      if (oldItem instanceof Field) {
        n -= 1;
      }
    }
    if (k > deleteCount) {
      for (let i = m - 1; i >= start; i -= 1) {
        newArray[i + k] = oldArray[i + deleteCount];
      }
    } else {
      for (let i = start; i < m; i += 1) {
        newArray[i + k] = oldArray[i + deleteCount];
      }
    }
    for (let i = 0; i < k; i += 1) {
      const newItem = Item.fromAny(newItems[i]);
      newArray[i + start] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
      }
    }
    (this as Mutable<this>).array = newArray;
    (this as Mutable<this>).length = m;
    (this as Mutable<this>).fieldCount = n;
    return oldItems;
  }

  override delete(key: AnyValue): Item {
    if ((this.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    key = Value.fromAny(key);
    if ((this.flags & Record.AliasedFlag) !== 0) {
      return this.deleteAliased(key);
    } else {
      return this.deleteMutable(key);
    }
  }

  /** @internal */
  deleteAliased(key: Value): Item {
    const n = this.length;
    const oldArray = this.array!;
    const newArray = new Array(Record.expand(n));
    for (let i = 0; i < n; i += 1) {
      const item = oldArray[i];
      if (item instanceof Field && item.key.equals(key)) {
        for (let j = i + 1; j < n; j += 1, i += 1) {
          newArray[i] = oldArray[j];
        }
        (this as Mutable<this>).array = newArray;
        (this as Mutable<this>).table = null;
        (this as Mutable<this>).length = n - 1;
        (this as Mutable<this>).fieldCount -= 1;
        (this as Mutable<this>).flags &= ~Record.AliasedFlag;
        return item;
      }
      newArray[i] = item;
    }
    return Item.absent();
  }

  /** @internal */
  deleteMutable(key: Value): Item {
    const n = this.length;
    const array = this.array!;
    for (let i = 0; i < n; i += 1) {
      const item = array[i]!;
      if (item instanceof Field && item.key.equals(key)) {
        for (let j = i + 1; j < n; j += 1, i += 1) {
          array[i] = array[j]!;
        }
        array[n - 1] = void 0 as unknown as Item;
        (this as Mutable<this>).table = null;
        (this as Mutable<this>).length = n - 1;
        (this as Mutable<this>).fieldCount -= 1;
        return item;
      }
    }
    return Item.absent();
  }

  override clear(): void {
    if ((this.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    (this as Mutable<this>).array = null;
    (this as Mutable<this>).table = null;
    (this as Mutable<this>).length = 0;
    (this as Mutable<this>).fieldCount = 0;
    (this as Mutable<this>).flags = 0;
  }

  override isAliased(): boolean {
    return (this.flags & Record.AliasedFlag) !== 0;
  }

  override isMutable(): boolean {
    return (this.flags & Record.ImmutableFlag) === 0;
  }

  override alias(): void {
    (this as Mutable<this>).flags |= Record.AliasedFlag;
  }

  override branch(): RecordMap {
    if ((this.flags & (Record.AliasedFlag | Record.ImmutableFlag)) === 0) {
      const array = this.array!;
      for (let i = 0, n = this.length; i < n; i += 1) {
        array[i]!.alias();
      }
    }
    (this as Mutable<this>).flags |= Record.AliasedFlag;
    return new RecordMap(this.array, this.table, this.length, this.fieldCount, Record.AliasedFlag);
  }

  override clone(): RecordMap {
    const itemCount = this.length;
    const oldArray = this.array!;
    const newArray = new Array(itemCount);
    for (let i = 0; i < itemCount; i += 1) {
      newArray[i] = oldArray[i]!.clone();
    }
    return new RecordMap(newArray, null, itemCount, this.fieldCount, 0);
  }

  override commit(): this {
    if ((this.flags & Record.ImmutableFlag) === 0) {
      (this as Mutable<this>).flags |= Record.ImmutableFlag;
      const array = this.array!;
      for (let i = 0, n = this.length; i < n; i += 1) {
        array[i]!.commit();
      }
    }
    return this;
  }

  hashTable(): Array<Field> | null {
    const n = this.fieldCount;
    let table = this.table;
    if (n !== 0 && table === null) {
      table = new Array(Record.expand(Math.max(n, n * 10 / 7)));
      const array = this.array!;
      for (let i = 0, m = this.length; i < m; i += 1) {
        const item = array[i];
        if (item instanceof Field) {
          RecordMap.put(table, item);
        }
      }
      (this as Mutable<this>).table = table;
    }
    return table;
  }

  /** @internal */
  static put(table: Field[] | null, field: Field): void {
    if (table !== null) {
      const n = table.length;
      const x = Math.abs(field.key.hashCode() % n);
      let i = x;
      do {
        const item = table[i];
        if (item !== void 0) {
          if (field.key.equals(item.key)) {
            table[i] = field;
            return;
          }
        } else {
          table[i] = field;
          return;
        }
        i = (i + 1) % n;
      } while (i !== x);
      throw new Error();
    }
  }

  override evaluate(interpreter: AnyInterpreter): Record {
    interpreter = Interpreter.fromAny(interpreter);
    const array = this.array!;
    const n = this.length;
    const scope = Record.create(n);
    interpreter.pushScope(scope);
    let changed = false;
    for (let i = 0; i < n; i += 1) {
      const oldItem = array[i]!;
      const newItem = oldItem.evaluate(interpreter);
      if (newItem.isDefined()) {
        scope.push(newItem);
      }
      if (oldItem !== newItem) {
        changed = true;
      }
    }
    interpreter.popScope();
    return changed ? scope : this;
  }

  override substitute(interpreter: AnyInterpreter): Record {
    interpreter = Interpreter.fromAny(interpreter);
    const array = this.array!;
    const n = this.length;
    const scope = Record.create(n);
    interpreter.pushScope(scope);
    let changed = false;
    for (let i = 0; i < n; i += 1) {
      const oldItem = array[i]!;
      const newItem = oldItem.substitute(interpreter);
      if (newItem.isDefined()) {
        scope.push(newItem);
      }
      if (oldItem !== newItem) {
        changed = true;
      }
    }
    interpreter.popScope();
    return changed ? scope : this;
  }

  override subRecord(lower?: number, upper?: number): Record {
    const n = this.length;
    if (lower === void 0) {
      lower = 0;
    } else if (lower < 0) {
      lower = n + lower;
    }
    if (upper === void 0) {
      upper = n;
    } else if (upper < 0) {
      upper = n + upper;
    }
    if (lower < 0 || upper > n || lower > upper) {
      throw new RangeError(lower + ", " + upper);
    }
    return new RecordMapView(this, lower, upper);
  }

  override forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void,
                         thisArg: S): T | undefined;
  override forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void,
                         thisArg?: S): T | undefined {
    const array = this.array!;
    for (let i = 0, n = this.length; i < n; i += 1) {
      const result = callback.call(thisArg, array[i]!, i);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  @Lazy
  static override empty(): RecordMap {
    return new RecordMap(null, null, 0, 0, Record.AliasedFlag | Record.ImmutableFlag);
  }

  static override create(initialCapacity?: number): RecordMap {
    if (initialCapacity === void 0) {
      return new RecordMap(null, null, 0, 0, Record.AliasedFlag);
    } else {
      return new RecordMap(new Array(initialCapacity), null, 0, 0, 0);
    }
  }

  static override of(...items: AnyItem[]): RecordMap {
    const n = items.length;
    if (n === 0) {
      return new RecordMap(null, null, 0, 0, Record.AliasedFlag);
    } else {
      const array = new Array(n);
      let itemCount = 0;
      let fieldCount = 0;
      for (let i = 0; i < n; i += 1) {
        const item = Item.fromAny(items[i]);
        array[i] = item;
        itemCount += 1;
        if (item instanceof Field) {
          fieldCount += 1;
        }
      }
      return new RecordMap(array, null, itemCount, fieldCount, 0);
    }
  }
}
