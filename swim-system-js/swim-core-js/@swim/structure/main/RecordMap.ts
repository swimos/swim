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

import {AnyItem, Item} from "./Item";
import {Field} from "./Field";
import {AnyValue, Value} from "./Value";
import {Record} from "./Record";
import {AnyText, Text} from "./Text";
import {AnyNum} from "./Num";
import {AnyInterpreter, Interpreter} from "./Interpreter";

/** @hidden */
export class RecordMap extends Record {
  /** @hidden */
  _array: Array<Item> | null;
  /** @hidden */
  _table: Array<Field> | null;
  /** @hidden */
  _itemCount: number;
  /** @hidden */
  _fieldCount: number;
  /** @hidden */
  _flags: number;

  constructor(array: Array<Item> | null, table: Array<Field> | null,
              itemCount: number, fieldCount: number, flags: number) {
    super();
    this._array = array;
    this._table = table;
    this._itemCount = itemCount;
    this._fieldCount = fieldCount;
    this._flags = flags;
  }

  isEmpty(): boolean {
    return this._itemCount === 0;
  }

  get length(): number {
    return this._itemCount;
  }

  fieldCount(): number {
    return this._fieldCount;
  }

  valueCount(): number {
    return this._itemCount - this._fieldCount;
  }

  isConstant(): boolean {
    const array = this._array;
    for (let i = 0, n = this._itemCount; i < n; i += 1) {
      if (!array![i]!.isConstant()) {
        return false;
      }
    }
    return true;
  }

  tag(): string | undefined {
    if (this._fieldCount > 0) {
      const head = this._array![0];
      if (head instanceof Item.Attr) {
        return head.key.value;
      }
    }
    return void 0;
  }

  target(): Value {
    let value: Value | undefined;
    let record: Record | undefined;
    let modified = false;
    const array = this._array!;
    for (let i = 0, n = this._itemCount; i < n; i += 1) {
      const item = array[i];
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

  head(): Item {
    if (this._itemCount > 0) {
      return this._array![0];
    }
    return Item.absent();
  }

  tail(): Record {
    const n = this._itemCount;
    if (n > 0) {
      return new Record.RecordMapView(this, 1, n);
    } else {
      return Record.empty();
    }
  }

  body(): Value {
    const n = this._itemCount;
    if (n > 2) {
      return new Record.RecordMapView(this, 1, n).branch();
    } else if (n === 2) {
      const item = this._array![1];
      if (item instanceof Value) {
        return item;
      } else {
        return Record.of(item);
      }
    }
    return Value.absent();
  }

  has(key: AnyValue): boolean {
    if (this._fieldCount !== 0) {
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

  indexOf(item: AnyItem, index: number = 0): number {
    item = Item.fromAny(item);
    const array = this._array!;
    const n = this._itemCount;
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

  lastIndexOf(item: AnyItem, index?: number): number {
    item = Item.fromAny(item);
    const array = this._array!;
    const n = this._itemCount;
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

  get(key: AnyValue): Value {
    if (this._fieldCount > 0) {
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

  getAttr(key: AnyText): Value {
    if (this._fieldCount > 0) {
      key = Value.Text.fromAny(key);
      const table = this.hashTable()!;
      const n = table.length;
      //assert(n > 0);
      const x = Math.abs(key.hashCode() % n);
      let i = x;
      do {
        const field = table[i];
        if (field !== void 0) {
          if (field instanceof Item.Attr && field.key.equals(key)) {
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

  getSlot(key: AnyValue): Value {
    if (this._fieldCount > 0) {
      key = Value.fromAny(key);
      const table = this.hashTable()!;
      const n = table.length;
      //assert(n > 0);
      const x = Math.abs(key.hashCode() % n);
      let i = x;
      do {
        const field = table[i];
        if (field !== void 0) {
          if (field instanceof Item.Slot && field.key.equals(key)) {
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

  getField(key: AnyValue): Field | undefined {
    if (this._fieldCount > 0) {
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

  getItem(index: AnyNum): Item {
    if (index instanceof Item.Num) {
      index = index.value;
    }
    const n = this._itemCount;
    if (index < 0) {
      index = n + index;
    }
    if (index >= 0 && index < n) {
      return this._array![index];
    } else {
      return Item.absent();
    }
  }

  set(key: AnyValue, newValue: Value): this {
    if ((this._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    if ((this._flags & Record.ALIASED) !== 0) {
      if (this._fieldCount > 0) {
        this.setAliased(key, newValue);
      } else {
        this.pushAliased(new Item.Slot(key, newValue));
      }
    } else {
      if (this._fieldCount > 0) {
        if (this._table !== null) {
          this.setMutable(key, newValue);
        } else {
          this.updateMutable(key, newValue);
        }
      } else {
        this.pushMutable(new Item.Slot(key, newValue));
      }
    }
    return this;
  }

  private setAliased(key: Value, newValue: Value): void {
    const n = this._itemCount;
    const oldArray = this._array!;
    const newArray = new Array(Record.expand(n + 1));
    for (let i = 0; i < n; i += 1) {
      const item = oldArray[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        newArray[i] = item.updatedValue(newValue);
        i += 1;
        while (i < n) {
          newArray[i] = oldArray[i];
          i += 1;
        }
        this._array = newArray;
        this._table = null;
        this._flags &= ~Record.ALIASED;
        return;
      }
      newArray[i] = item;
    }
    newArray[n] = new Item.Slot(key, newValue);
    this._array = newArray;
    this._table = null;
    this._itemCount = n + 1;
    this._fieldCount += 1;
    this._flags &= ~Record.ALIASED;
  }

  private setMutable(key: Value, newValue: Value): void {
    const table = this._table!;
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
    const field = new Item.Slot(key, newValue);
    this.pushMutable(field);
    RecordMap.put(table, field);
  }

  private updateMutable(key: Value, newValue: Value): void {
    const array = this._array!;
    for (let i = 0, n = this._itemCount; i < n; i += 1) {
      const item = array[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        array[i] = item.updatedValue(newValue);
        this._table = null;
        return;
      }
    }
    const field = new Item.Slot(key, newValue);
    this.pushMutable(field);
    RecordMap.put(this._table, field);
  }

  setAttr(key: AnyText, newValue: Value): this {
    if ((this._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    key = Value.Text.fromAny(key);
    newValue = Value.fromAny(newValue);
    if ((this._flags & Record.ALIASED) !== 0) {
      if (this._fieldCount > 0) {
        this.setAttrAliased(key, newValue);
      } else {
        this.pushAliased(new Item.Attr(key, newValue));
      }
    } else {
      if (this._fieldCount > 0) {
        if (this._table !== null) {
          this.setAttrMutable(key, newValue);
        } else {
          this.updateAttrMutable(key, newValue);
        }
      } else {
        this.pushMutable(new Item.Attr(key, newValue));
      }
    }
    return this;
  }

  private setAttrAliased(key: Text, newValue: Value): void {
    const n = this._itemCount;
    const oldArray = this._array!;
    const newArray = new Array(Record.expand(n + 1));
    for (let i = 0; i < n; i += 1) {
      const item = oldArray[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        newArray[i] = new Item.Attr(key, newValue);
        i += 1;
        while (i < n) {
          newArray[i] = oldArray[i];
          i += 1;
        }
        this._array = newArray;
        this._table = null;
        this._flags &= ~Record.ALIASED;
        return;
      }
      newArray[i] = item;
    }
    newArray[n] = new Item.Attr(key, newValue);
    this._array = newArray;
    this._table = null;
    this._itemCount = n + 1;
    this._fieldCount += 1;
    this._flags &= ~Record.ALIASED;
  }

  private setAttrMutable(key: Text, newValue: Value): void {
    const table = this._table!;
    const n = table.length;
    //assert(n > 0);
    const x = Math.abs(key.hashCode() % n);
    let i = x;
    do {
      const field = table[i];
      if (field !== void 0) {
        if (field.key.equals(key)) {
          if (field instanceof Item.Attr && field.isMutable()) {
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
    const field = new Item.Attr(key, newValue);
    this.push(field);
    RecordMap.put(table, field);
  }

  private updateAttrMutable(key: Text, newValue: Value): void {
    const array = this._array!;
    for (let i = 0, n = this._itemCount; i < n; i += 1) {
      const item = array[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        array[i] = new Item.Attr(key, newValue);
        this._table = null;
        return;
      }
    }
    const field = new Item.Attr(key, newValue);
    this.push(field);
    RecordMap.put(this._table, field);
  }

  setSlot(key: AnyValue, newValue: Value): this {
    if ((this._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    if ((this._flags & Record.ALIASED) !== 0) {
      if (this._fieldCount > 0) {
        this.setSlotAliased(key, newValue);
      } else {
        this.pushAliased(new Item.Slot(key, newValue));
      }
    } else {
      if (this._fieldCount > 0) {
        if (this._table !== null) {
          this.setSlotMutable(key, newValue);
        } else {
          this.updateSlotMutable(key, newValue);
        }
      } else {
        this.pushMutable(new Item.Slot(key, newValue));
      }
    }
    return this;
  }

  private setSlotAliased(key: Value, newValue: Value): void {
    const n = this._itemCount;
    const oldArray = this._array!;
    const newArray = new Array(Record.expand(n + 1));
    for (let i = 0; i < n; i += 1) {
      const item = oldArray[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        newArray[i] = new Item.Slot(key, newValue);
        i += 1;
        while (i < n) {
          newArray[i] = oldArray[i];
          i += 1;
        }
        this._array = newArray;
        this._table = null;
        this._flags &= ~Record.ALIASED;
        return;
      }
      newArray[i] = item;
    }
    newArray[n] = new Item.Slot(key, newValue);
    this._array = newArray;
    this._table = null;
    this._itemCount = n + 1;
    this._fieldCount += 1;
    this._flags &= ~Record.ALIASED;
  }

  private setSlotMutable(key: Value, newValue: Value): void {
    const table = this._table!;
    const n = table.length;
    //assert(n > 0);
    const x = Math.abs(key.hashCode() % n);
    let i = x;
    do {
      const field = table[i];
      if (field !== void 0) {
        if (field.key.equals(key)) {
          if (field instanceof Item.Slot && field.isMutable()) {
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
    const field = new Item.Slot(key, newValue);
    this.push(field);
    RecordMap.put(table, field);
  }

  private updateSlotMutable(key: Value, newValue: Value): void {
    const array = this._array!;
    for (let i = 0, n = this._itemCount; i < n; i += 1) {
      const item = array[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        array[i] = new Item.Slot(key, newValue);
        this._table = null;
        return;
      }
    }
    const field = new Item.Slot(key, newValue);
    this.push(field);
    RecordMap.put(this._table, field);
  }

  setItem(index: number, newItem: AnyItem): this {
    if ((this._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    newItem = Item.fromAny(newItem);
    const n = this._itemCount;
    if (index < 0) {
      index = n + index;
    }
    if (index < 0 || index > n) {
      throw new RangeError("" + index);
    }
    if ((this._flags & Record.ALIASED) !== 0) {
      this.setItemAliased(index, newItem);
    } else {
      this.setItemMutable(index, newItem);
    }
    return this;
  }

  private setItemAliased(index: number, newItem: Item): void {
    const n = this._itemCount;
    const oldArray = this._array!;
    const newArray = new Array(Record.expand(n));
    for (let i = 0; i < n; i += 1) {
      newArray[i] = oldArray[i];
    }
    const oldItem = oldArray[index];
    newArray[index] = newItem;
    this._array = newArray;
    this._table = null;
    if (newItem instanceof Item.Field) {
      if (!(oldItem instanceof Item.Field)) {
        this._fieldCount += 1;
      }
    } else if (oldItem instanceof Item.Field) {
      this._fieldCount -= 1;
    }
    this._flags &= ~Record.ALIASED;
  }

  private setItemMutable(index: number, newItem: Item): void {
    const array = this._array!;
    const oldItem = array[index];
    array[index] = newItem;
    if (newItem instanceof Item.Field) {
      this._table = null;
      if (!(oldItem instanceof Item.Field)) {
        this._fieldCount += 1;
      }
    } else if (oldItem instanceof Item.Field) {
      this._table = null;
      this._fieldCount -= 1;
    }
  }

  updated(key: AnyValue, newValue: AnyValue): Record {
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    const record = (this._flags & Record.IMMUTABLE) === 0 ? this : this.branch();
    if ((record._flags & Record.ALIASED) !== 0) {
      if (record._fieldCount > 0) {
        record.setAliased(key, newValue);
      } else {
        record.pushAliased(new Item.Slot(key, newValue));
      }
    } else {
      if (record._fieldCount > 0) {
        if (record._table !== null) {
          record.setMutable(key, newValue);
        } else {
          record.updateMutable(key, newValue);
        }
      } else {
        record.pushMutable(new Item.Slot(key, newValue));
      }
    }
    return record;
  }

  updatedAttr(key: AnyText, newValue: AnyValue): Record {
    key = Value.Text.fromAny(key);
    newValue = Value.fromAny(newValue);
    const record = (this._flags & Record.IMMUTABLE) === 0 ? this : this.branch();
    if ((record._flags & Record.ALIASED) !== 0) {
      if (record._fieldCount > 0) {
        record.setAttrAliased(key, newValue);
      } else {
        record.pushAliased(new Item.Attr(key, newValue));
      }
    } else {
      if (record._fieldCount > 0) {
        if (record._table !== null) {
          record.setAttrMutable(key, newValue);
        } else {
          record.updateAttrMutable(key, newValue);
        }
      } else {
        record.pushMutable(new Item.Attr(key, newValue));
      }
    }
    return record;
  }

  updatedSlot(key: AnyValue, newValue: AnyValue): Record {
    key = Value.fromAny(key);
    newValue = Value.fromAny(newValue);
    const record = (this._flags & Record.IMMUTABLE) === 0 ? this : this.branch();
    if ((record._flags & Record.ALIASED) !== 0) {
      if (record._fieldCount > 0) {
        record.setSlotAliased(key, newValue);
      } else {
        record.pushAliased(new Item.Slot(key, newValue));
      }
    } else {
      if (record._fieldCount > 0) {
        if (record._table !== null) {
          record.setSlotMutable(key, newValue);
        } else {
          record.updateSlotMutable(key, newValue);
        }
      } else {
        record.pushMutable(new Item.Slot(key, newValue));
      }
    }
    return record;
  }

  push(...newItems: AnyItem[]): number {
    if ((this._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    if ((this._flags & Record.ALIASED) !== 0) {
      this.pushAliased.apply(this, arguments);
    } else {
      this.pushMutable.apply(this, arguments);
    }
    return this._itemCount;
  }

  private pushAliased(...newItems: AnyItem[]): void {
    const k = arguments.length;
    let m = this._itemCount;
    let n = this._fieldCount;
    const oldArray = this._array;
    const newArray = new Array(Record.expand(m + k));
    if (oldArray !== null) {
      for (let i = 0; i < m; i += 1) {
        newArray[i] = oldArray[i];
      }
    }
    for (let i = 0; i < k; i += 1) {
      const newItem = Item.fromAny(arguments[i]);
      newArray[m] = newItem;
      m += 1;
      if (newItem instanceof Item.Field) {
        n += 1;
      }
    }
    this._array = newArray;
    this._table = null;
    this._itemCount = m;
    this._fieldCount = n;
    this._flags &= ~Record.ALIASED;
  }

  private pushMutable(...newItems: AnyItem[]): void {
    const k = arguments.length;
    let m = this._itemCount;
    let n = this._fieldCount;
    const oldArray = this._array;
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
      const newItem = Item.fromAny(arguments[i]);
      newArray[m] = newItem;
      m += 1;
      if (newItem instanceof Item.Field) {
        n += 1;
        this._table = null;
      }
    }
    this._array = newArray;
    this._itemCount = m;
    this._fieldCount = n;
  }

  splice(start: number, deleteCount: number = 0, ...newItems: AnyItem[]): Item[] {
    if ((this._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    const n = this._itemCount;
    if (start < 0) {
      start = n + start;
    }
    start = Math.min(Math.max(0, start), n);
    deleteCount = Math.min(Math.max(0, deleteCount), n - start);
    if ((this._flags & Record.ALIASED) !== 0) {
      return this.spliceAliased.apply(this, arguments);
    } else {
      return this.spliceMutable.apply(this, arguments);
    }
  }

  /** @hidden */
  spliceAliased(start: number, deleteCount: number, ...newItems: AnyItem[]): Item[] {
    const k = newItems.length;
    let m = this._itemCount;
    let n = this._fieldCount;
    const oldArray = this._array!;
    const newArray = new Array(Record.expand(m - deleteCount + k));
    for (let i = 0; i < start; i += 1) {
      newArray[i] = oldArray[i];
    }
    const oldItems = [];
    for (let i = start; i < start + deleteCount; i += 1) {
      const oldItem = oldArray[i];
      oldItems.push(oldItem);
      m -= 1;
      if (oldItem instanceof Item.Field) {
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
      if (newItem instanceof Item.Field) {
        n += 1;
      }
    }
    this._array = newArray;
    this._table = null;
    this._itemCount = m;
    this._fieldCount = n;
    this._flags &= ~Record.ALIASED;
    return oldItems;
  }

  /** @hidden */
  spliceMutable(start: number, deleteCount: number, ...newItems: AnyItem[]): Item[] {
    const k = newItems.length;
    let m = this._itemCount;
    let n = this._fieldCount;
    const oldArray = this._array!;
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
    const oldItems = [];
    for (let i = start; i < start + deleteCount; i += 1) {
      const oldItem = oldArray[i];
      oldItems.push(oldItem);
      m -= 1;
      if (oldItem instanceof Item.Field) {
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
      if (newItem instanceof Item.Field) {
        n += 1;
      }
    }
    this._array = newArray;
    this._itemCount = m;
    this._fieldCount = n;
    return oldItems;
  }

  delete(key: AnyValue): Item {
    if ((this._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    key = Value.fromAny(key);
    if ((this._flags & Record.ALIASED) !== 0) {
      return this.deleteAliased(key);
    } else {
      return this.deleteMutable(key);
    }
  }

  private deleteAliased(key: Value): Item {
    const n = this._itemCount;
    const oldArray = this._array!;
    const newArray = new Array(Record.expand(n));
    for (let i = 0; i < n; i += 1) {
      const item = oldArray[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        for (let j = i + 1; j < n; j += 1, i += 1) {
          newArray[i] = oldArray[j];
        }
        this._array = newArray;
        this._table = null;
        this._itemCount = n - 1;
        this._fieldCount -= 1;
        this._flags &= ~Record.ALIASED;
        return item;
      }
      newArray[i] = item;
    }
    return Item.absent();
  }

  private deleteMutable(key: Value): Item {
    const n = this._itemCount;
    const array = this._array!;
    for (let i = 0; i < n; i += 1) {
      const item = array[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        for (let j = i + 1; j < n; j += 1, i += 1) {
          array[i] = array[j];
        }
        array[n - 1] = void 0 as any;
        this._table = null;
        this._itemCount = n - 1;
        this._fieldCount -= 1;
        return item;
      }
    }
    return Item.absent();
  }

  clear(): void {
    if ((this._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    this._array = null;
    this._table = null;
    this._itemCount = 0;
    this._fieldCount = 0;
    this._flags = 0;
  }

  isAliased(): boolean {
    return (this._flags & Record.ALIASED) !== 0;
  }

  isMutable(): boolean {
    return (this._flags & Record.IMMUTABLE) === 0;
  }

  alias(): void {
    this._flags |= Record.ALIASED;
  }

  branch(): RecordMap {
    if ((this._flags & (Record.ALIASED | Record.IMMUTABLE)) === 0) {
      const array = this._array!;
      for (let i = 0, n = this._itemCount; i < n; i += 1) {
        array[i].alias();
      }
    }
    this._flags |= Record.ALIASED;
    return new RecordMap(this._array, this._table, this._itemCount, this._fieldCount, Record.ALIASED);
  }

  clone(): RecordMap {
    const itemCount = this._itemCount;
    const oldArray = this._array!;
    const newArray = new Array(itemCount);
    for (let i = 0; i < itemCount; i += 1) {
      newArray[i] = oldArray[i].clone();
    }
    return new RecordMap(newArray, null, itemCount, this._fieldCount, 0);
  }

  commit(): this {
    if ((this._flags & Record.IMMUTABLE) === 0) {
      this._flags |= Record.IMMUTABLE;
      const array = this._array!;
      for (let i = 0, n = this._itemCount; i < n; i += 1) {
        array[i].commit();
      }
    }
    return this;
  }

  hashTable(): Array<Field> | null {
    const n = this._fieldCount;
    let table = this._table;
    if (n !== 0 && this._table === null) {
      table = new Array(Record.expand(Math.max(n, n * 10 / 7)));
      const array = this._array!;
      for (let i = 0, m = this._itemCount; i < m; i += 1) {
        const item = array[i];
        if (item instanceof Item.Field) {
          RecordMap.put(table, item);
        }
      }
      this._table = table;
    }
    return table;
  }

  /** @hidden */
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

  evaluate(interpreter: AnyInterpreter): Record {
    interpreter = Interpreter.fromAny(interpreter);
    const array = this._array!;
    const n = this._itemCount;
    const scope = Record.create(n);
    interpreter.pushScope(scope);
    let changed = false;
    for (let i = 0; i < n; i += 1) {
      const oldItem = array[i];
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

  substitute(interpreter: AnyInterpreter): Record {
    interpreter = Interpreter.fromAny(interpreter);
    const array = this._array!;
    const n = this._itemCount;
    const scope = Record.create(n);
    interpreter.pushScope(scope);
    let changed = false;
    for (let i = 0; i < n; i += 1) {
      const oldItem = array[i];
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

  subRecord(lower?: number, upper?: number): Record {
    const n = this._itemCount;
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
    return new Record.RecordMapView(this, lower, upper);
  }

  forEach<T, S = unknown>(callback: (this: S, item: Item, index: number) => T | void,
                          thisArg?: S): T | undefined {
    const array = this._array!;
    for (let i = 0, n = this._itemCount; i < n; i += 1) {
      const result = callback.call(thisArg, array[i], i);
      if (result !== void 0) {
        return result;
      }
    }
    return;
  }

  private static _empty?: RecordMap;

  static empty(): RecordMap {
    if (RecordMap._empty === void 0) {
      RecordMap._empty = new RecordMap(null, null, 0, 0, Record.ALIASED | Record.IMMUTABLE);
    }
    return RecordMap._empty;
  }

  static create(initialCapacity?: number): RecordMap {
    if (initialCapacity === void 0) {
      return new RecordMap(null, null, 0, 0, Record.ALIASED);
    } else {
      return new RecordMap(new Array(initialCapacity), null, 0, 0, 0);
    }
  }

  static of(...items: AnyItem[]): RecordMap {
    const n = arguments.length;
    if (n === 0) {
      return new RecordMap(null, null, 0, 0, Record.ALIASED);
    } else {
      const array = new Array(n);
      let itemCount = 0;
      let fieldCount = 0;
      for (let i = 0; i < n; i += 1) {
        const item = Item.fromAny(arguments[i]);
        array[i] = item;
        itemCount += 1;
        if (item instanceof Item.Field) {
          fieldCount += 1;
        }
      }
      return new RecordMap(array, null, itemCount, fieldCount, 0);
    }
  }
}
Item.RecordMap = RecordMap;
