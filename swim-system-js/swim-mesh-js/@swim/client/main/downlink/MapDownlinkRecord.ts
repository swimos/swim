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

import type {Cursor} from "@swim/util";
import {AnyItem, Item, Slot, AnyValue, Value, Record, AnyText, AnyNum, Num} from "@swim/structure";
import {KeyEffect} from "@swim/streamlet";
import {DownlinkRecord} from "./DownlinkRecord";
import type {MapDownlink} from "./MapDownlink";

export class MapDownlinkRecord extends DownlinkRecord {
  constructor(downlink: MapDownlink<Value, Value, AnyValue, AnyValue>) {
    super();
    Object.defineProperty(this, "downlink", {
      value: downlink,
      enumerable: true,
    });
    downlink.observe(this);
  }

  declare readonly downlink: MapDownlink<Value, Value, AnyValue, AnyValue>;

  isEmpty(): boolean {
    return this.downlink.isEmpty();
  }

  isArray(): boolean {
    return this.downlink.isEmpty();
  }

  isObject(): boolean {
    return true;
  }

  get length(): number {
    return this.downlink.size;
  }

  has(key: AnyValue): boolean {
    return this.downlink.has(key);
  }

  get(): Record;
  get(key: AnyValue): Value;
  get(key?: AnyValue): Value {
    if (key === void 0) {
      return this;
    } else {
      return this.downlink.get(key);
    }
  }

  getAttr(key: AnyText): Value {
    return Value.absent();
  }

  getSlot(key: AnyValue): Value {
    return this.get(key);
  }

  getItem(index: AnyNum): Item {
    if (index instanceof Num) {
      index = index.value;
    }
    const n = this.downlink.size;
    if (index < 0) {
      index = n + index;
    }
    index = Math.min(Math.max(0, index), n - 1);
    if (index >= 0) {
      const entry = this.downlink.getEntry(index)!;
      return Slot.of(entry[0], entry[1]);
    }
    return Item.absent();
  }

  set(key: AnyValue, newValue: AnyValue): this {
    this.downlink.set(key, newValue);
    return this;
  }

  setAttr(key: AnyText, newValue: AnyValue): this {
    throw new Error("unsupported");
  }

  setSlot(key: AnyValue, newValue: AnyValue): this {
    return this.set(key, newValue);
  }

  setItem(index: number, newItem: AnyItem): this {
    throw new Error("unsupported");
  }

  push(...newItems: AnyItem[]): number {
    throw new Error("unsupported");
  }

  splice(start: number, deleteCount?: number, ...newItems: AnyItem[]): Item[] {
    throw new Error("unsupported");
  }

  delete(key: AnyValue): Item {
    key = Value.fromAny(key);
    const oldValue = this.downlink.get(key);
    if (this.downlink.delete(key)) {
      return Slot.of(key, oldValue);
    }
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
    let index = 0;
    return this.downlink.forEach(function (key: Value, value: Value): T | void {
      const result = callback.call(thisArg, Slot.of(key, value), index);
      index += 1;
      return result;
    });
  }

  keyIterator(): Cursor<Value> {
    return this.downlink.keys();
  }

  didUpdate(key: Value, newValue: Value, oldValue: Value): void {
    this.decohereInputKey(key, KeyEffect.Update);
    this.recohereInput(0); // TODO: debounce
  }

  didRemove(key: Value, oldValue: Value): void {
    this.decohereInputKey(key, KeyEffect.Remove);
    this.recohereInput(0); // TODO: debounce
  }

  didDrop(lower: number): void {
    // TODO
  }

  didTake(upper: number): void {
    // TODO
  }

  didClear(): void {
    // TODO
  }
}
