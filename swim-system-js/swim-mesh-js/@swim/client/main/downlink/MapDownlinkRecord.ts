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

import {Cursor} from "@swim/util";
import {AnyItem, Item, Slot, AnyValue, Value, Record, AnyText, AnyNum, Num} from "@swim/structure";
import {KeyEffect} from "@swim/streamlet";
import {DownlinkRecord} from "./DownlinkRecord";
import {MapDownlink} from "./MapDownlink";

export class MapDownlinkRecord extends DownlinkRecord {
  /** @hidden */
  readonly _downlink: MapDownlink<Value, Value, AnyValue, AnyValue>;

  constructor(downlink: MapDownlink<Value, Value, AnyValue, AnyValue>) {
    super();
    this._downlink = downlink;
    this._downlink.observe(this);
  }

  get downlink(): MapDownlink<Value, Value, AnyValue, AnyValue> {
    return this._downlink;
  }

  isEmpty(): boolean {
    return this._downlink.isEmpty();
  }

  isArray(): boolean {
    return this._downlink.isEmpty();
  }

  isObject(): boolean {
    return true;
  }

  get length(): number {
    return this._downlink.size;
  }

  has(key: AnyValue): boolean {
    return this._downlink.has(key);
  }

  get(): Record;
  get(key: AnyValue): Value;
  get(key?: AnyValue): Value {
    if (key === void 0) {
      return this;
    } else {
      return this._downlink.get(key);
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
    const n = this._downlink.size;
    if (index < 0) {
      index = n + index;
    }
    index = Math.min(Math.max(0, index), n - 1);
    if (index >= 0) {
      const entry = this._downlink.getEntry(index)!;
      return Slot.of(entry[0], entry[1]);
    }
    return Item.absent();
  }

  set(key: AnyValue, newValue: AnyValue): this {
    this._downlink.set(key, newValue);
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
    const oldValue = this._downlink.get(key);
    if (this._downlink.delete(key)) {
      return Slot.of(key, oldValue);
    }
    return Item.absent();
  }

  clear(): void {
    this._downlink.clear();
  }

  forEach<T, S = unknown>(callback: (this: S, item: Item, index: number) => T | void,
                          thisArg?: S): T | undefined {
    let index = 0;
    return this._downlink.forEach(function (key: Value, value: Value): T | void {
      const result = callback.call(thisArg, Slot.of(key, value), index);
      index += 1;
      return result;
    });
  }

  keyIterator(): Cursor<Value> {
    return this._downlink.keys();
  }

  didUpdate(key: Value, newValue: Value, oldValue: Value): void {
    this.invalidateInputKey(key, KeyEffect.Update);
    this.reconcileInput(0); // TODO: debounce
  }

  didRemove(key: Value, oldValue: Value): void {
    this.invalidateInputKey(key, KeyEffect.Remove);
    this.reconcileInput(0); // TODO: debounce
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
