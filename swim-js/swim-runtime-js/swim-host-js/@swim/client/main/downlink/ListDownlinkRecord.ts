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

  override readonly downlink!: ListDownlink<Value, AnyValue>;

  override isEmpty(): boolean {
    return this.downlink.isEmpty();
  }

  override isArray(): boolean {
    return true;
  }

  override isObject(): boolean {
    return this.downlink.isEmpty();
  }

  override get length(): number {
    return this.downlink.length;
  }

  override has(key: AnyValue): boolean {
    return false;
  }

  override get(): Record;
  override get(key: AnyValue): Value;
  override get(key?: AnyValue): Value {
    if (key === void 0) {
      return this;
    } else {
      return Value.absent();
    }
  }

  override getAttr(key: AnyText): Value {
    return Value.absent();
  }

  override getSlot(key: AnyValue): Value {
    return Value.absent();
  }

  override getItem(index: AnyNum): Item {
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

  override set(key: AnyValue, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  override setAttr(key: AnyText, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  override setSlot(key: AnyValue, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  override setItem(index: AnyNum, newItem: AnyItem): this {
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

  override push(...newItems: AnyItem[]): number {
    return this.downlink.push(...newItems);
  }

  override splice(start: number, deleteCount?: number, ...newItems: AnyItem[]): Item[] {
    return this.downlink.splice(start, deleteCount, ...newItems);
  }

  override delete(key: AnyValue): Item {
    return Item.absent();
  }

  override clear(): void {
    this.downlink.clear();
  }

  override forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void,
                         thisArg: S): T | undefined;
  override forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void,
                         thisArg?: S): T | undefined {
    return this.downlink.forEach(callback, thisArg);
  }

  override keyIterator(): Cursor<Value> {
    return Cursor.empty();
  }
}
