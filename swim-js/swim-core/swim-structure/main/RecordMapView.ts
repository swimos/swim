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
import type {ItemLike} from "./Item";
import {Item} from "./Item";
import {Field} from "./Field";
import {Attr} from "./Attr";
import type {ValueLike} from "./Value";
import {Value} from "./Value";
import {Record} from "./Record";
import {RecordMap} from "./RecordMap";
import type {NumLike} from "./Num";
import {Num} from "./"; // forward import

/** @internal */
export class RecordMapView extends Record {
  constructor(record: RecordMap, lower: number, upper: number) {
    super();
    this.record = record;
    this.lower = lower;
    this.upper = upper;
  }

  /** @internal */
  readonly record: RecordMap;

  /** @internal */
  readonly lower: number;

  /** @internal */
  readonly upper: number;

  override isEmpty(): boolean {
    return this.lower === this.upper;
  }

  override isArray(): boolean {
    const array = this.record.array;
    for (let i = this.lower; i < this.upper; i += 1) {
      if (array![i] instanceof Field) {
        return false;
      }
    }
    return true;
  }

  override isObject(): boolean {
    const array = this.record.array;
    for (let i = this.lower; i < this.upper; i += 1) {
      if (array![i] instanceof Value) {
        return false;
      }
    }
    return true;
  }

  override get length(): number {
    return this.upper - this.lower;
  }

  declare readonly fieldCount: number; // getter defined below to work around useDefineForClassFields lunacy

  override get valueCount(): number {
    let k = 0;
    const array = this.record.array;
    for (let i = this.lower; i < this.upper; i += 1) {
      if (array![i] instanceof Value) {
        k += 1;
      }
    }
    return k;
  }

  override isConstant(): boolean {
    const array = this.record.array;
    for (let i = this.lower; i < this.upper; i += 1) {
      if (!array![i]!.isConstant()) {
        return false;
      }
    }
    return true;
  }

  override get tag(): string | undefined {
    if (this.length === 0) {
      return void 0;
    }
    const item = this.record.array![this.lower];
    if (!(item instanceof Attr)) {
      return void 0;
    }
    return item.key.value;
  }

  override get target(): Value {
    let value: Value | undefined;
    let record: Record | undefined;
    let modified = false;
    const array = this.record.array;
    for (let i = this.lower; i < this.upper; i += 1) {
      const item = array![i];
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
    }
    return this;
  }

  override head(): Item {
    if (this.length === 0) {
      return Item.absent();
    }
    return this.record.array![this.lower]!;
  }

  override tail(): Record {
    if (this.length === 0) {
      return Record.empty();
    }
    return new RecordMapView(this.record, this.lower + 1, this.upper);
  }

  override body(): Value {
    const n = this.length;
    if (n === 0 || n === 1) {
      return Value.absent();
    } else if (n === 2) {
      const item = this.record.array![this.lower + 1];
      if (item instanceof Value) {
        return item;
      }
      return Record.of(item);
    }
    return new RecordMapView(this.record, this.lower + 1, this.upper).branch();
  }

  override indexOf(item: ItemLike, index: number = 0): number {
    item = Item.fromLike(item);
    const array = this.record.array;
    const n = this.length;
    if (index < 0) {
      index = Math.max(0, n + index);
    }
    index = this.lower + index;
    while (index < this.upper) {
      if (item.equals(array![index])) {
        return index - this.lower;
      }
      index += 1;
    }
    return -1;
  }

  override lastIndexOf(item: ItemLike, index?: number): number {
    item = Item.fromLike(item);
    const array = this.record.array;
    const n = this.length;
    if (index === void 0) {
      index = n - 1;
    } else if (index < 0) {
      index = n + index;
    }
    index = this.lower + Math.min(index, n - 1);
    while (index >= this.lower) {
      if (item.equals(array![index])) {
        return index - this.lower;
      }
      index -= 1;
    }
    return -1;
  }

  override getItem(index: NumLike): Item {
    if (index instanceof Num) {
      index = index.value;
    }
    const n = this.length;
    if (index < 0) {
      index = n + index;
    }
    if (index < 0 || index >= n) {
      return Item.absent();
    }
    return this.record.array![this.lower + index]!;
  }

  override setItem(index: number, newItem: ItemLike): this {
    if ((this.record.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    newItem = Item.fromLike(newItem);
    const n = this.length;
    if (index < 0) {
      index = n + index;
    }
    if (index < 0 || index > n) {
      throw new RangeError("" + index);
    }
    if ((this.record.flags & Record.AliasedFlag) !== 0) {
      this.setItemAliased(index, newItem);
    } else {
      this.setItemMutable(index, newItem);
    }
    return this;
  }

  /** @internal */
  setItemAliased(index: number, newItem: Item): void {
    const record = this.record;
    const n = record.length;
    const oldArray = record.array;
    const newArray = new Array(Record.expand(n));
    for (let i = 0; i < n; i += 1) {
      newArray[i] = oldArray![i];
    }
    const oldItem = oldArray !== null ? oldArray[this.lower + index] : null;
    newArray[this.lower + index] = newItem;
    (record as Mutable<RecordMap>).array = newArray;
    (record as Mutable<RecordMap>).table = null;
    if (newItem instanceof Field) {
      if (!(oldItem instanceof Field)) {
        (record as Mutable<RecordMap>).fieldCount += 1;
      }
    } else if (oldItem instanceof Field) {
      (record as Mutable<RecordMap>).fieldCount -= 1;
    }
    (record as Mutable<RecordMap>).flags &= ~Record.AliasedFlag;
  }

  /** @internal */
  setItemMutable(index: number, newItem: Item): void {
    const record = this.record;
    const array = record.array!;
    const oldItem = array[this.lower + index];
    array[this.lower + index] = newItem;
    if (newItem instanceof Field) {
      (record as Mutable<RecordMap>).table = null;
      if (!(oldItem instanceof Field)) {
        (record as Mutable<RecordMap>).fieldCount += 1;
      }
    } else if (oldItem instanceof Field) {
      (record as Mutable<RecordMap>).table = null;
      (record as Mutable<RecordMap>).fieldCount -= 1;
    }
  }

  override push(...newItems: ItemLike[]): number {
    if ((this.record.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    if ((this.record.flags & Record.AliasedFlag) !== 0) {
      this.pushAliased(...newItems);
    } else {
      this.pushMutable(...newItems);
    }
    return this.length;
  }

  /** @internal */
  pushAliased(...newItems: ItemLike[]): void {
    const record = this.record;
    const k = newItems.length;
    let m = record.length;
    let n = record.fieldCount;
    const oldArray = record.array;
    const newArray = new Array(Record.expand(m + k));
    if (oldArray !== null) {
      for (let i = 0; i < this.upper; i += 1) {
        newArray[i] = oldArray[i];
      }
      for (let i = this.upper; i < m; i += 1) {
        newArray[i + k] = oldArray[i];
      }
    }
    for (let i = 0; i < k; i += 1) {
      const newItem = Item.fromLike(newItems[i]);
      newArray[i + this.upper] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
      }
    }
    (record as Mutable<RecordMap>).array = newArray;
    (record as Mutable<RecordMap>).table = null;
    (record as Mutable<RecordMap>).length = m;
    (record as Mutable<RecordMap>).fieldCount = n;
    (record as Mutable<RecordMap>).flags &= ~Record.AliasedFlag;
    (this as Mutable<this>).upper += k;
  }

  /** @internal */
  pushMutable(...newItems: ItemLike[]): void {
    const record = this.record;
    const k = newItems.length;
    let m = record.length;
    let n = record.fieldCount;
    const oldArray = record.array!;
    let newArray;
    if (oldArray === null || m + k > oldArray.length) {
      newArray = new Array(Record.expand(m + k));
      if (oldArray !== null) {
        for (let i = 0; i < this.upper; i += 1) {
          newArray[i] = oldArray[i];
        }
      }
    } else {
      newArray = oldArray;
    }
    for (let i = m - 1; i >= this.upper; i -= 1) {
      newArray[i + k] = oldArray[i];
    }
    for (let i = 0; i < k; i += 1) {
      const newItem = Item.fromLike(newItems[i]);
      newArray[i + this.upper] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
        (record as Mutable<RecordMap>).table = null;
      }
    }
    (record as Mutable<RecordMap>).array = newArray;
    (record as Mutable<RecordMap>).length = m;
    (record as Mutable<RecordMap>).fieldCount = n;
    (this as Mutable<this>).upper += k;
  }

  override splice(start: number, deleteCount: number = 0, ...newItems: ItemLike[]): Item[] {
    if ((this.record.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    const n = this.length;
    if (start < 0) {
      start = n + start;
    }
    start = Math.min(Math.max(0, start), n);
    deleteCount = Math.min(Math.max(0, deleteCount), n - start);
    let deleted;
    if ((this.record.flags & Record.AliasedFlag) !== 0) {
      deleted = this.record.spliceAliased(this.lower + start, deleteCount, ...newItems);
    } else {
      deleted = this.record.spliceMutable(this.lower + start, deleteCount, ...newItems);
    }
    (this as Mutable<this>).upper += newItems.length - deleted.length;
    return deleted;
  }

  override delete(key: ValueLike): Item {
    if ((this.record.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    key = Value.fromLike(key);
    if ((this.record.flags & Record.AliasedFlag) !== 0) {
      return this.deleteAliased(key);
    } else {
      return this.deleteMutable(key);
    }
  }

  /** @internal */
  deleteAliased(key: Value): Item {
    const record = this.record;
    const n = record.length;
    const oldArray = record.array;
    const newArray = new Array(Record.expand(n));
    for (let i = this.lower; i < this.upper; i += 1) {
      const item = oldArray![i];
      if (item instanceof Field && item.key.equals(key)) {
        for (let j = i + 1; j < n; j += 1, i += 1) {
          newArray[i] = oldArray![j];
        }
        (record as Mutable<RecordMap>).array = newArray;
        (record as Mutable<RecordMap>).table = null;
        (record as Mutable<RecordMap>).length = n - 1;
        (record as Mutable<RecordMap>).fieldCount -= 1;
        (record as Mutable<RecordMap>).flags &= ~Record.AliasedFlag;
        (this as Mutable<this>).upper -= 1;
        return item;
      }
      newArray[i] = item;
    }
    return Item.absent();
  }

  /** @internal */
  deleteMutable(key: Value): Item {
    const record = this.record;
    const n = record.length;
    const array = record.array;
    for (let i = this.lower; i < this.upper; i += 1) {
      const item = array![i]!;
      if (item instanceof Field && item.key.equals(key)) {
        for (let j = i + 1; j < n; j += 1, i += 1) {
          array![i] = array![j]!;
        }
        array![n - 1] = void 0 as any;
        (record as Mutable<RecordMap>).table = null;
        (record as Mutable<RecordMap>).length = n - 1;
        (record as Mutable<RecordMap>).fieldCount -= 1;
        (this as Mutable<this>).upper -= 1;
        return item;
      }
    }
    return Item.absent();
  }

  override clear(): void {
    if ((this.record.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    if ((this.record.flags & Record.AliasedFlag) !== 0) {
      this.clearAliased();
    } else {
      this.clearMutable();
    }
  }

  /** @internal */
  clearAliased(): void {
    const record = this.record;
    const m = record.length;
    let n = record.fieldCount;
    const l = m - this.length;
    const oldArray = record.array;
    const newArray = new Array(Record.expand(l));
    let i = 0;
    while (i < this.lower) {
      newArray[i] = oldArray![i];
      i += 1;
    }
    while (i < this.upper) {
      if (oldArray![i] instanceof Field) {
        n -= 1;
      }
      i += 1;
    }
    i = this.lower;
    let j = this.upper;
    while (j < m) {
      newArray[i] = oldArray![j];
      i += 1;
      j += 1;
    }
    (record as Mutable<RecordMap>).array = newArray;
    (record as Mutable<RecordMap>).table = null;
    (record as Mutable<RecordMap>).length = l;
    (record as Mutable<RecordMap>).fieldCount = n;
    (record as Mutable<RecordMap>).flags &= ~Record.AliasedFlag;
    (this as Mutable<this>).upper = this.lower;
  }

  /** @internal */
  clearMutable(): void {
    const record = this.record;
    const m = record.length;
    let n = record.fieldCount;
    const array = record.array;
    let i = this.lower;
    while (i < this.upper) {
      if (array![i] instanceof Field) {
        n -= 1;
      }
      i += 1;
    }
    i = this.lower;
    let j = this.upper;
    while (j < m) {
      const item = array![j]!;
      if (item instanceof Field) {
        (record as Mutable<RecordMap>).table = null;
      }
      array![i] = item;
      i += 1;
      j += 1;
    }
    (record as Mutable<RecordMap>).length = i;
    (record as Mutable<RecordMap>).fieldCount = n;
    while (i < m) {
      array![i] = void 0 as any;
      i += 1;
    }
    (this as Mutable<this>).upper = this.lower;
  }

  override isAliased(): boolean {
    return (this.record.flags & Record.AliasedFlag) !== 0;
  }

  override isMutable(): boolean {
    return (this.record.flags & Record.ImmutableFlag) === 0;
  }

  override alias(): void {
    (this.record as Mutable<RecordMap>).flags |= Record.AliasedFlag;
  }

  override branch(): RecordMap {
    const m = this.length;
    let n = 0;
    const oldArray = this.record.array;
    const newArray = new Array(Record.expand(m));
    let i = this.lower;
    let j = 0;
    while (j < m) {
      const item = oldArray![i];
      newArray[j] = item;
      if (item instanceof Field) {
        n += 1;
      }
      i += 1;
      j += 1;
    }
    return new RecordMap(newArray, null, m, n, 0);
  }

  override clone(): RecordMap {
    const m = this.length;
    let n = 0;
    const oldArray = this.record.array;
    const newArray = new Array(Record.expand(m));
    let i = this.lower;
    let j = 0;
    while (j < m) {
      const item = oldArray![i]!;
      newArray[j] = item.clone();
      if (item instanceof Field) {
        n += 1;
      }
      i += 1;
      j += 1;
    }
    return new RecordMap(newArray, null, m, n, 0);
  }

  override commit(): this {
    this.record.commit();
    return this;
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
    return new RecordMapView(this.record, this.lower + lower, this.upper + upper);
  }

  override forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void, thisArg?: S): T | undefined;
  override forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void, thisArg?: S): T | undefined {
    const array = this.record.array;
    for (let i = this.lower; i < this.upper; i += 1) {
      const result = callback.call(thisArg, array![i]!, i);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }
}
Object.defineProperty(RecordMapView.prototype, "fieldCount", {
  get(this: RecordMapView): number {
    const array = this.record.array;
    let k = 0;
    for (let i = this.lower; i < this.upper; i += 1) {
      if (array![i] instanceof Field) {
        k += 1;
      }
    }
    return k;
  },
  configurable: true,
});
