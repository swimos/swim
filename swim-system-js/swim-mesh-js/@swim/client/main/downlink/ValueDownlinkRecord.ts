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
import {AnyItem, Item, Field, AnyValue, Value, Record, AnyText, AnyNum} from "@swim/structure";
import {DownlinkRecord} from "./DownlinkRecord";
import {ValueDownlink} from "./ValueDownlink";

export class ValueDownlinkRecord extends DownlinkRecord {
  /** @hidden */
  readonly _downlink: ValueDownlink<Value, AnyValue>;

  constructor(downlink: ValueDownlink<Value, AnyValue>) {
    super();
    this._downlink = downlink;
    this._downlink.observe(this);
  }

  get downlink(): ValueDownlink<Value, AnyValue> {
    return this._downlink;
  }

  isEmpty(): boolean {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.isEmpty();
    } else {
      return !value.isDefined();
    }
  }

  isArray(): boolean {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.isArray();
    } else {
      return true;
    }
  }

  isObject(): boolean {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.isObject();
    } else {
      return !value.isDefined();
    }
  }

  get length(): number {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.length;
    } else if (value.isDefined()) {
      return 1;
    } else {
      return 0;
    }
  }

  has(key: AnyValue): boolean {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.has(key);
    } else {
      return false;
    }
  }

  get(): Record;
  get(key: AnyValue): Value;
  get(key?: AnyValue): Value {
    if (key === void 0) {
      return this;
    } else {
      const value = this._downlink.get();
      if (value instanceof Record) {
        return value.get(key);
      } else {
        return Value.absent();
      }
    }
  }

  getAttr(key: AnyText): Value {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.getAttr(key);
    } else {
      return Value.absent();
    }
  }

  getSlot(key: AnyValue): Value {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.getSlot(key);
    } else {
      return Value.absent();
    }
  }

  getField(key: AnyValue): Field | undefined {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.getField(key);
    } else {
      return void 0;
    }
  }

  getItem(index: AnyNum): Item {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.getItem(index);
    } else {
      return value;
    }
  }

  set(key: AnyValue, newValue: AnyValue): this {
    const value = this._downlink.get();
    if (value instanceof Record) {
      value.set(key, newValue);
    } else {
      throw new Error("unsupported");
    }
    return this;
  }

  setAttr(key: AnyText, newValue: AnyValue): this {
    const value = this._downlink.get();
    if (value instanceof Record) {
      value.setAttr(key, newValue);
    } else {
      throw new Error("unsupported");
    }
    return this;
  }

  setSlot(key: AnyValue, newValue: AnyValue): this {
    const value = this._downlink.get();
    if (value instanceof Record) {
      value.setSlot(key, newValue);
    } else {
      throw new Error("unsupported");
    }
    return this;
  }

  setItem(index: number, newItem: AnyItem): this {
    const value = this._downlink.get();
    if (value instanceof Record) {
      value.setItem(index, newItem);
    } else {
      this._downlink.set(Item.fromAny(newItem).toValue());
    }
    return this;
  }

  push(...newItems: AnyItem[]): number {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.push.apply(value, arguments);
    } else {
      throw new Error("unsupported");
    }
  }

  splice(start: number, deleteCount?: number, ...newItems: AnyItem[]): Item[] {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.splice.apply(value, arguments);
    } else {
      throw new Error("unsupported");
    }
  }

  delete(key: AnyValue): Item {
    const value = this._downlink.get();
    if (value instanceof Record) {
      return value.delete(key);
    } else {
      return Value.absent();
    }
  }

  clear(): void {
    const value = this._downlink.get();
    if (value instanceof Record) {
      value.clear();
    } else {
      throw new Error("unsupported");
    }
  }

  forEach<T, S = unknown>(callback: (this: S, item: Item, index: number) => T | void,
                          thisArg?: S): T | undefined {
    const value = this._downlink.get();
    return value.forEach(callback, thisArg);
  }

  keyIterator(): Cursor<Value> {
    const value = this._downlink.get();
    if (value instanceof Record) {
      throw new Error(); // TODO
    } else {
      return Cursor.empty();
    }
  }

  didSet(newValue: Value, oldValue: Value): void {
    this.decohereInput();
    this.recohereInput(0); // TODO: debounce
  }
}
