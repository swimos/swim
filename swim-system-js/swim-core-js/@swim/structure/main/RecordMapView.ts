// Copyright 2015-2021 Swim inc.
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
import {Attr} from "./Attr";
import {AnyValue, Value} from "./Value";
import {Record} from "./Record";
import {RecordMap} from "./RecordMap";
import {AnyNum, Num} from "./"; // forward import

/** @hidden */
export class RecordMapView extends Record {
  constructor(record: RecordMap, lower: number, upper: number) {
    super();
    Object.defineProperty(this, "record", {
      value: record,
      enumerable: true,
    });
    Object.defineProperty(this, "lower", {
      value: lower,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "upper", {
      value: upper,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly record!: RecordMap;

  /** @hidden */
  readonly lower!: number;

  /** @hidden */
  readonly upper!: number;

  override isEmpty(): boolean {
    return this.lower === this.upper;
  }

  override isArray(): boolean {
    const array = this.record.array;
    for (let i = this.lower, n = this.upper; i < n; i += 1) {
      if (array![i] instanceof Field) {
        return false;
      }
    }
    return true;
  }

  override isObject(): boolean {
    const array = this.record.array;
    for (let i = this.lower, n = this.upper; i < n; i += 1) {
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
    for (let i = this.lower, n = this.upper; i < n; i += 1) {
      if (array![i] instanceof Value) {
        k += 1;
      }
    }
    return k;
  }

  override isConstant(): boolean {
    const array = this.record.array;
    for (let i = this.lower, n = this.upper; i < n; i += 1) {
      if (!array![i]!.isConstant()) {
        return false;
      }
    }
    return true;
  }

  override get tag(): string | undefined {
    if (this.length > 0) {
      const item = this.record.array![this.lower];
      if (item instanceof Attr) {
        return item.key.value;
      }
    }
    return void 0;
  }

  override get target(): Value {
    let value: Value | undefined;
    let record: Record | undefined;
    let modified = false;
    const array = this.record.array;
    for (let i = this.lower, n = this.upper; i < n; i += 1) {
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
    } else {
      return this;
    }
  }

  override head(): Item {
    if (this.length > 0) {
      return this.record.array![this.lower]!;
    } else {
      return Item.absent();
    }
  }

  override tail(): Record {
    if (this.length > 0) {
      return new RecordMapView(this.record, this.lower + 1, this.upper);
    } else {
      return Record.empty();
    }
  }

  override body(): Value {
    const n = this.length;
    if (n > 2) {
      return new RecordMapView(this.record, this.lower + 1, this.upper).branch();
    } else if (n === 2) {
      const item = this.record.array![this.lower + 1];
      if (item instanceof Value) {
        return item;
      } else {
        return Record.of(item);
      }
    } else {
      return Value.absent();
    }
  }

  override indexOf(item: AnyItem, index: number = 0): number {
    item = Item.fromAny(item);
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

  override lastIndexOf(item: AnyItem, index?: number): number {
    item = Item.fromAny(item);
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

  override getItem(index: AnyNum): Item {
    if (index instanceof Num) {
      index = index.value;
    }
    const n = this.length;
    if (index < 0) {
      index = n + index;
    }
    if (index >= 0 && index < n) {
      return this.record.array![this.lower + index]!;
    } else {
      return Item.absent();
    }
  }

  override setItem(index: number, newItem: AnyItem): this {
    if ((this.record.flags & Record.ImmutableFlag) !== 0) {
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
    if ((this.record.flags & Record.AliasedFlag) !== 0) {
      this.setItemAliased(index, newItem);
    } else {
      this.setItemMutable(index, newItem);
    }
    return this;
  }

  /** @hidden */
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
    Object.defineProperty(record, "array", {
      value: newArray,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "table", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    if (newItem instanceof Field) {
      if (!(oldItem instanceof Field)) {
        Object.defineProperty(record, "fieldCount", {
          value: record.fieldCount + 1,
          enumerable: true,
          configurable: true,
        });
      }
    } else if (oldItem instanceof Field) {
      Object.defineProperty(record, "fieldCount", {
        value: record.fieldCount - 1,
        enumerable: true,
        configurable: true,
      });
    }
    Object.defineProperty(record, "flags", {
      value: record.flags & ~Record.AliasedFlag,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  setItemMutable(index: number, newItem: Item): void {
    const record = this.record;
    const array = record.array!;
    const oldItem = array[this.lower + index];
    array[this.lower + index] = newItem;
    if (newItem instanceof Field) {
      Object.defineProperty(record, "table", {
        value: null,
        enumerable: true,
        configurable: true,
      });
      if (!(oldItem instanceof Field)) {
        Object.defineProperty(record, "fieldCount", {
          value: record.fieldCount + 1,
          enumerable: true,
          configurable: true,
        });
      }
    } else if (oldItem instanceof Field) {
      Object.defineProperty(record, "table", {
        value: null,
        enumerable: true,
        configurable: true,
      });
      Object.defineProperty(record, "fieldCount", {
        value: record.fieldCount - 1,
        enumerable: true,
        configurable: true,
      });
    }
  }

  override push(...newItems: AnyItem[]): number {
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

  /** @hidden */
  pushAliased(...newItems: AnyItem[]): void {
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
      const newItem = Item.fromAny(newItems[i]);
      newArray[i + this.upper] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
      }
    }
    Object.defineProperty(record, "array", {
      value: newArray,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "table", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "length", {
      value: m,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "fieldCount", {
      value: n,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "flags", {
      value: record.flags & ~Record.AliasedFlag,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "upper", {
      value: this.upper + k,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  pushMutable(...newItems: AnyItem[]): void {
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
      const newItem = Item.fromAny(newItems[i]);
      newArray[i + this.upper] = newItem;
      m += 1;
      if (newItem instanceof Field) {
        n += 1;
        Object.defineProperty(record, "table", {
          value: null,
          enumerable: true,
          configurable: true,
        });
      }
    }
    Object.defineProperty(record, "array", {
      value: newArray,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "length", {
      value: m,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "fieldCount", {
      value: n,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "upper", {
      value: this.upper + k,
      enumerable: true,
      configurable: true,
    });
  }

  override splice(start: number, deleteCount: number = 0, ...newItems: AnyItem[]): Item[] {
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
    Object.defineProperty(this, "upper", {
      value: this.upper + newItems.length - deleted.length,
      enumerable: true,
      configurable: true,
    });
    return deleted;
  }

  override delete(key: AnyValue): Item {
    if ((this.record.flags & Record.ImmutableFlag) !== 0) {
      throw new Error("immutable");
    }
    key = Value.fromAny(key);
    if ((this.record.flags & Record.AliasedFlag) !== 0) {
      return this.deleteAliased(key);
    } else {
      return this.deleteMutable(key);
    }
  }

  /** @hidden */
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
        Object.defineProperty(record, "array", {
          value: newArray,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(record, "table", {
          value: null,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(record, "length", {
          value: n - 1,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(record, "fieldCount", {
          value: record.fieldCount - 1,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(record, "flags", {
          value: record.flags & ~Record.AliasedFlag,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(this, "upper", {
          value: this.upper - 1,
          enumerable: true,
          configurable: true,
        });
        return item;
      }
      newArray[i] = item;
    }
    return Item.absent();
  }

  /** @hidden */
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
        Object.defineProperty(record, "table", {
          value: null,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(record, "length", {
          value: n - 1,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(record, "fieldCount", {
          value: record.fieldCount - 1,
          enumerable: true,
          configurable: true,
        });
        Object.defineProperty(this, "upper", {
          value: this.upper - 1,
          enumerable: true,
          configurable: true,
        });
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

  /** @hidden */
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
    Object.defineProperty(record, "array", {
      value: newArray,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "table", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "length", {
      value: l,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "fieldCount", {
      value: n,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "flags", {
      value: record.flags & ~Record.AliasedFlag,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "upper", {
      value: this.lower,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
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
        Object.defineProperty(record, "table", {
          value: null,
          enumerable: true,
          configurable: true,
        });
      }
      array![i] = item;
      i += 1;
      j += 1;
    }
    Object.defineProperty(record, "length", {
      value: i,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(record, "fieldCount", {
      value: n,
      enumerable: true,
      configurable: true,
    });
    while (i < m) {
      array![i] = void 0 as any;
      i += 1;
    }
    Object.defineProperty(this, "upper", {
      value: this.lower,
      enumerable: true,
      configurable: true,
    });
  }

  override isAliased(): boolean {
    return (this.record.flags & Record.AliasedFlag) !== 0;
  }

  override isMutable(): boolean {
    return (this.record.flags & Record.ImmutableFlag) === 0;
  }

  override alias(): void {
    Object.defineProperty(this.record, "flags", {
      value: this.record.flags | Record.AliasedFlag,
      enumerable: true,
      configurable: true,
    });
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
  override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void,
                         thisArg?: S): T | undefined;
  override forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void,
                         thisArg?: S): T | undefined {
    const array = this.record.array;
    for (let i = this.lower, n = this.upper; i < n; i += 1) {
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
    for (let i = this.lower, n = this.upper; i < n; i += 1) {
      if (array![i] instanceof Field) {
        k += 1;
      }
    }
    return k;
  },
  enumerable: true,
  configurable: true,
});
