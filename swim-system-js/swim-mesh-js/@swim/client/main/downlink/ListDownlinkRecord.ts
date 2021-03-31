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

import {Cursor} from "@swim/util";
import {AnyItem, Item, AnyValue, Value, Record, AnyText, AnyNum, Num} from "@swim/structure";
import {DownlinkRecord} from "./DownlinkRecord";
import type {ListDownlink} from "./ListDownlink";

export class ListDownlinkRecord extends DownlinkRecord {
  constructor(downlink: ListDownlink<Value, AnyValue>) {
    super();
    Object.defineProperty(this, "downlink", {
      value: downlink,
      enumerable: true,
    });
  }

  declare readonly downlink: ListDownlink<Value, AnyValue>;

  isEmpty(): boolean {
    return this.downlink.isEmpty();
  }

  isArray(): boolean {
    return true;
  }

  isObject(): boolean {
    return this.downlink.isEmpty();
  }

  get length(): number {
    return this.downlink.length;
  }

  get size(): number {
    return this.downlink.length;
  }

  has(key: AnyValue): boolean {
    return false;
  }

  get(): Record;
  get(key: AnyValue): Value;
  get(key?: AnyValue): Value {
    if (key === void 0) {
      return this;
    } else {
      return Value.absent();
    }
  }

  getAttr(key: AnyText): Value {
    return Value.absent();
  }

  getSlot(key: AnyValue): Value {
    return Value.absent();
  }

  getItem(index: AnyNum): Item {
    if (index instanceof Num) {
      index = index.value;
    }
    const n = this.downlink.length;
    if (index < 0) {
      index = n + index;
    }
    index = Math.min(Math.max(0, index), n - 1);
    if (index >= 0) {
      return this.downlink.get(index);
    }
    return Item.absent();
  }

  set(key: AnyValue, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  setAttr(key: AnyText, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  setSlot(key: AnyValue, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  setItem(index: AnyNum, newItem: AnyItem): this {
    if (index instanceof Num) {
      index = index.value;
    }
    const n = this.downlink.length;
    if (index < 0) {
      index = n + index;
    }
    index = Math.min(Math.max(0, index), n - 1);
    if (index >= 0) {
      this.downlink.set(index, Value.fromAny(newItem));
    }
    return this;
  }

  push(...newItems: AnyItem[]): number {
    return this.downlink.push(...newItems);
  }

  splice(start: number, deleteCount?: number, ...newItems: AnyItem[]): Item[] {
    return this.downlink.splice(start, deleteCount, ...newItems);
  }

  delete(key: AnyValue): Item {
    return Item.absent();
  }

  clear(): void {
    this.downlink.clear();
  }

  forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void,
                thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void,
                thisArg?: S): T | undefined {
    return this.downlink.forEach(callback, thisArg);
  }

  keyIterator(): Cursor<Value> {
    return Cursor.empty();
  }
}
