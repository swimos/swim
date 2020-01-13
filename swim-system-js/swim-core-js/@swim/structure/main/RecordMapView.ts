// Copyright 2015-2020 SWIM.AI inc.
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
import {AnyValue, Value} from "./Value";
import {Record} from "./Record";
import {RecordMap} from "./RecordMap";
import {AnyNum} from "./Num";

/** @hidden */
export class RecordMapView extends Record {
  /** @hidden */
  readonly _record: RecordMap;
  /** @hidden */
  _lower: number;
  /** @hidden */
  _upper: number;

  constructor(record: RecordMap, lower: number, upper: number) {
    super();
    this._record = record;
    this._lower = lower;
    this._upper = upper;
  }

  isEmpty(): boolean {
    return this._lower === this._upper;
  }

  isArray(): boolean {
    const array = this._record._array!;
    for (let i = this._lower, n = this._upper; i < n; i += 1) {
      if (array[i] instanceof Item.Field) {
        return false;
      }
    }
    return true;
  }

  isObject(): boolean {
    const array = this._record._array!;
    for (let i = this._lower, n = this._upper; i < n; i += 1) {
      if (array[i] instanceof Value) {
        return false;
      }
    }
    return true;
  }

  get length(): number {
    return this._upper - this._lower;
  }

  fieldCount(): number {
    const array = this._record._array!;
    let k = 0;
    for (let i = this._lower, n = this._upper; i < n; i += 1) {
      if (array[i] instanceof Item.Field) {
        k += 1;
      }
    }
    return k;
  }

  valueCount(): number {
    let k = 0;
    const array = this._record._array!;
    for (let i = this._lower, n = this._upper; i < n; i += 1) {
      if (array[i] instanceof Value) {
        k += 1;
      }
    }
    return k;
  }

  isConstant(): boolean {
    const array = this._record._array;
    for (let i = this._lower, n = this._upper; i < n; i += 1) {
      if (!array![i].isConstant()) {
        return false;
      }
    }
    return true;
  }

  tag(): string | undefined {
    if (this.length > 0) {
      const item = this._record._array![this._lower];
      if (item instanceof Item.Attr) {
        return item.key.value;
      }
    }
    return void 0;
  }

  target(): Value {
    let value: Value | undefined;
    let record: Record | undefined;
    let modified = false;
    const array = this._record._array!;
    for (let i = this._lower, n = this._upper; i < n; i += 1) {
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
    if (this.length > 0) {
      return this._record._array![this._lower];
    } else {
      return Item.absent();
    }
  }

  tail(): Record {
    if (this.length > 0) {
      return new RecordMapView(this._record, this._lower + 1, this._upper);
    } else {
      return Record.empty();
    }
  }

  body(): Value {
    const n = this.length;
    if (n > 2) {
      return new RecordMapView(this._record, this._lower + 1, this._upper).branch();
    } else if (n === 2) {
      const item = this._record._array![this._lower + 1];
      if (item instanceof Value) {
        return item;
      } else {
        return Record.of(item);
      }
    } else {
      return Value.absent();
    }
  }

  indexOf(item: AnyItem, index: number = 0): number {
    item = Item.fromAny(item);
    const array = this._record._array!;
    const n = this.length;
    if (index < 0) {
      index = Math.max(0, n + index);
    }
    index = this._lower + index;
    while (index < this._upper) {
      if (item.equals(array[index])) {
        return index - this._lower;
      }
      index += 1;
    }
    return -1;
  }

  lastIndexOf(item: AnyItem, index?: number): number {
    item = Item.fromAny(item);
    const array = this._record._array!;
    const n = this.length;
    if (index === void 0) {
      index = n - 1;
    } else if (index < 0) {
      index = n + index;
    }
    index = this._lower + Math.min(index, n - 1);
    while (index >= this._lower) {
      if (item.equals(array[index])) {
        return index - this._lower;
      }
      index -= 1;
    }
    return -1;
  }

  getItem(index: AnyNum): Item {
    if (index instanceof Item.Num) {
      index = index.value;
    }
    const n = this.length;
    if (index < 0) {
      index = n + index;
    }
    if (index >= 0 && index < n) {
      return this._record._array![this._lower + index];
    } else {
      return Item.absent();
    }
  }

  setItem(index: number, newItem: AnyItem): this {
    if ((this._record._flags & Record.IMMUTABLE) !== 0) {
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
    if ((this._record._flags & Record.ALIASED) !== 0) {
      this.setItemAliased(index, newItem);
    } else {
      this.setItemMutable(index, newItem);
    }
    return this;
  }

  private setItemAliased(index: number, newItem: Item): void {
    const n = this._record._itemCount;
    const oldArray = this._record._array!;
    const newArray = new Array(Record.expand(n));
    for (let i = 0; i < n; i += 1) {
      newArray[i] = oldArray[i];
    }
    const oldItem = oldArray[this._lower + index];
    newArray[this._lower + index] = newItem;
    this._record._array = newArray;
    this._record._table = null;
    if (newItem instanceof Item.Field) {
      if (!(oldItem instanceof Item.Field)) {
        this._record._fieldCount += 1;
      }
    } else if (oldItem instanceof Item.Field) {
      this._record._fieldCount -= 1;
    }
    this._record._flags &= ~Record.ALIASED;
  }

  private setItemMutable(index: number, newItem: Item): void {
    const array = this._record._array!;
    const oldItem = array[this._lower + index];
    array[this._lower + index] = newItem;
    if (newItem instanceof Item.Field) {
      this._record._table = null;
      if (!(oldItem instanceof Item.Field)) {
        this._record._fieldCount += 1;
      }
    } else if (oldItem instanceof Item.Field) {
      this._record._table = null;
      this._record._fieldCount -= 1;
    }
  }

  push(...newItems: AnyItem[]): number {
    if ((this._record._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    if ((this._record._flags & Record.ALIASED) !== 0) {
      this.pushAliased.apply(this, arguments);
    } else {
      this.pushMutable.apply(this, arguments);
    }
    return this.length;
  }

  private pushAliased(...newItems: AnyItem[]): void {
    const k = newItems.length;
    let m = this._record._itemCount;
    let n = this._record._fieldCount;
    const oldArray = this._record._array;
    const newArray = new Array(Record.expand(m + k));
    if (oldArray !== null) {
      for (let i = 0; i < this._upper; i += 1) {
        newArray[i] = oldArray[i];
      }
      for (let i = this._upper; i < m; i += 1) {
        newArray[i + k] = oldArray[i];
      }
    }
    for (let i = 0; i < k; i += 1) {
      const newItem = Item.fromAny(newItems[i]);
      newArray[i + this._upper] = newItem;
      m += 1;
      if (newItem instanceof Item.Field) {
        n += 1;
      }
    }
    this._record._array = newArray;
    this._record._table = null;
    this._record._itemCount = m;
    this._record._fieldCount = n;
    this._record._flags &= ~Record.ALIASED;
    this._upper += k;
  }

  private pushMutable(...newItems: AnyItem[]): void {
    const k = newItems.length;
    let m = this._record._itemCount;
    let n = this._record._fieldCount;
    const oldArray = this._record._array!;
    let newArray;
    if (oldArray === null || m + k > oldArray.length) {
      newArray = new Array(Record.expand(m + k));
      if (oldArray !== null) {
        for (let i = 0; i < this._upper; i += 1) {
          newArray[i] = oldArray[i];
        }
      }
    } else {
      newArray = oldArray;
    }
    for (let i = m - 1; i >= this._upper; i -= 1) {
      newArray[i + k] = oldArray[i];
    }
    for (let i = 0; i < k; i += 1) {
      const newItem = Item.fromAny(newItems[i]);
      newArray[i + this._upper] = newItem;
      m += 1;
      if (newItem instanceof Item.Field) {
        n += 1;
        this._record._table = null;
      }
    }
    this._record._array = newArray;
    this._record._itemCount = m;
    this._record._fieldCount = n;
    this._upper += k;
  }

  splice(start: number, deleteCount: number = 0, ...newItems: AnyItem[]): Item[] {
    if ((this._record._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    const n = this.length;
    if (start < 0) {
      start = n + start;
    }
    start = Math.min(Math.max(0, start), n);
    deleteCount = Math.min(Math.max(0, deleteCount), n - start);
    let deleted;
    if ((this._record._flags & Record.ALIASED) !== 0) {
      deleted = this._record.spliceAliased(this._lower + start, deleteCount, ...newItems);
    } else {
      deleted = this._record.spliceMutable(this._lower + start, deleteCount, ...newItems);
    }
    this._upper += newItems.length - deleted.length;
    return deleted;
  }

  delete(key: AnyValue): Item {
    if ((this._record._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    key = Value.fromAny(key);
    if ((this._record._flags & Record.ALIASED) !== 0) {
      return this.deleteAliased(key);
    } else {
      return this.deleteMutable(key);
    }
  }

  /** @hidden */
  deleteAliased(key: Value): Item {
    const n = this._record._itemCount;
    const oldArray = this._record._array!;
    const newArray = new Array(Record.expand(n));
    for (let i = this._lower; i < this._upper; i += 1) {
      const item = oldArray[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        for (let j = i + 1; j < n; j += 1, i += 1) {
          newArray[i] = oldArray[j];
        }
        this._record._array = newArray;
        this._record._table = null;
        this._record._itemCount = n - 1;
        this._record._fieldCount -= 1;
        this._record._flags &= ~Record.ALIASED;
        this._upper -= 1;
        return item;
      }
      newArray[i] = item;
    }
    return Item.absent();
  }

  /** @hidden */
  deleteMutable(key: Value): Item {
    const n = this._record._itemCount;
    const array = this._record._array!;
    for (let i = this._lower; i < this._upper; i += 1) {
      const item = array[i];
      if (item instanceof Item.Field && item.key.equals(key)) {
        for (let j = i + 1; j < n; j += 1, i += 1) {
          array[i] = array[j];
        }
        array[n - 1] = void 0 as any;
        this._record._table = null;
        this._record._itemCount -= 1;
        this._record._fieldCount -= 1;
        this._upper -= 1;
        return item;
      }
    }
    return Item.absent();
  }

  clear(): void {
    if ((this._record._flags & Record.IMMUTABLE) !== 0) {
      throw new Error("immutable");
    }
    if ((this._record._flags & Record.ALIASED) !== 0) {
      this.clearAliased();
    } else {
      this.clearMutable();
    }
  }

  private clearAliased(): void {
    const m = this._record._itemCount;
    let n = this._record._fieldCount;
    const l = m - this.length;
    const oldArray = this._record._array!;
    const newArray = new Array(Record.expand(l));
    let i = 0;
    while (i < this._lower) {
      newArray[i] = oldArray[i];
      i += 1;
    }
    while (i < this._upper) {
      if (oldArray[i] instanceof Item.Field) {
        n -= 1;
      }
      i += 1;
    }
    i = this._lower;
    let j = this._upper;
    while (j < m) {
      newArray[i] = oldArray[j];
      i += 1;
      j += 1;
    }
    this._record._array = newArray;
    this._record._table = null;
    this._record._itemCount = l;
    this._record._fieldCount = n;
    this._record._flags &= ~Record.ALIASED;
    this._upper = this._lower;
  }

  private clearMutable(): void {
    const m = this._record._itemCount;
    let n = this._record._fieldCount;
    const array = this._record._array!;
    let i = this._lower;
    while (i < this._upper) {
      if (array[i] instanceof Item.Field) {
        n -= 1;
      }
      i += 1;
    }
    i = this._lower;
    let j = this._upper;
    while (j < m) {
      const item = array[j];
      if (item instanceof Item.Field) {
        this._record._table = null;
      }
      array[i] = item;
      i += 1;
      j += 1;
    }
    this._record._itemCount = i;
    this._record._fieldCount = n;
    while (i < m) {
      array[i] = void 0 as any;
      i += 1;
    }
    this._upper = this._lower;
  }

  isAliased(): boolean {
    return (this._record._flags & Record.ALIASED) !== 0;
  }

  isMutable(): boolean {
    return (this._record._flags & Record.IMMUTABLE) === 0;
  }

  alias(): void {
    this._record._flags |= Record.ALIASED;
  }

  branch(): RecordMap {
    const m = this.length;
    let n = 0;
    const oldArray = this._record._array!;
    const newArray = new Array(Record.expand(m));
    let i = this._lower;
    let j = 0;
    while (j < m) {
      const item = oldArray[i];
      newArray[j] = item;
      if (item instanceof Item.Field) {
        n += 1;
      }
      i += 1;
      j += 1;
    }
    return new RecordMap(newArray, null, m, n, 0);
  }

  clone(): RecordMap {
    const m = this.length;
    let n = 0;
    const oldArray = this._record._array!;
    const newArray = new Array(Record.expand(m));
    let i = this._lower;
    let j = 0;
    while (j < m) {
      const item = oldArray[i];
      newArray[j] = item.clone();
      if (item instanceof Item.Field) {
        n += 1;
      }
      i += 1;
      j += 1;
    }
    return new RecordMap(newArray, null, m, n, 0);
  }

  commit(): this {
    this._record.commit();
    return this;
  }

  subRecord(lower?: number, upper?: number): Record {
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
    return new RecordMapView(this._record, this._lower + lower, this._upper + upper);
  }

  forEach<T, S = unknown>(callback: (this: S, item: Item, index: number) => T | void,
                          thisArg?: S): T | undefined {
    const array = this._record._array!;
    for (let i = this._lower, n = this._upper; i < n; i += 1) {
      const result = callback.call(thisArg, array[i], i);
      if (result !== void 0) {
        return result;
      }
    }
    return;
  }
}
Item.RecordMapView = RecordMapView;
