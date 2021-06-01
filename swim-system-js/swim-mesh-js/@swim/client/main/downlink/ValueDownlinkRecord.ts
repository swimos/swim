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

import {Cursor} from "@swim/util";
import {AnyItem, Item, Field, AnyValue, Value, Record, AnyText, AnyNum} from "@swim/structure";
import {DownlinkRecord} from "./DownlinkRecord";
import type {ValueDownlinkObserver, ValueDownlink} from "./ValueDownlink";

export class ValueDownlinkRecord extends DownlinkRecord implements ValueDownlinkObserver<Value, AnyValue> {
  constructor(downlink: ValueDownlink<Value, AnyValue>) {
    super();
    Object.defineProperty(this, "downlink", {
      value: downlink,
      enumerable: true,
    });
    downlink.observe(this);
  }

  override readonly downlink!: ValueDownlink<Value, AnyValue>;

  override isEmpty(): boolean {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.isEmpty();
    } else {
      return !value.isDefined();
    }
  }

  override isArray(): boolean {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.isArray();
    } else {
      return true;
    }
  }

  override isObject(): boolean {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.isObject();
    } else {
      return !value.isDefined();
    }
  }

  override get length(): number {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.length;
    } else if (value.isDefined()) {
      return 1;
    } else {
      return 0;
    }
  }

  override has(key: AnyValue): boolean {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.has(key);
    } else {
      return false;
    }
  }

  override get(): Record;
  override get(key: AnyValue): Value;
  override get(key?: AnyValue): Value {
    if (key === void 0) {
      return this;
    } else {
      const value = this.downlink.get();
      if (value instanceof Record) {
        return value.get(key);
      } else {
        return Value.absent();
      }
    }
  }

  override getAttr(key: AnyText): Value {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.getAttr(key);
    } else {
      return Value.absent();
    }
  }

  override getSlot(key: AnyValue): Value {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.getSlot(key);
    } else {
      return Value.absent();
    }
  }

  override getField(key: AnyValue): Field | undefined {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.getField(key);
    } else {
      return void 0;
    }
  }

  override getItem(index: AnyNum): Item {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.getItem(index);
    } else {
      return value;
    }
  }

  override set(key: AnyValue, newValue: AnyValue): this {
    const value = this.downlink.get();
    if (value instanceof Record) {
      value.set(key, newValue);
    } else {
      throw new Error("unsupported");
    }
    return this;
  }

  override setAttr(key: AnyText, newValue: AnyValue): this {
    const value = this.downlink.get();
    if (value instanceof Record) {
      value.setAttr(key, newValue);
    } else {
      throw new Error("unsupported");
    }
    return this;
  }

  override setSlot(key: AnyValue, newValue: AnyValue): this {
    const value = this.downlink.get();
    if (value instanceof Record) {
      value.setSlot(key, newValue);
    } else {
      throw new Error("unsupported");
    }
    return this;
  }

  override setItem(index: number, newItem: AnyItem): this {
    const value = this.downlink.get();
    if (value instanceof Record) {
      value.setItem(index, newItem);
    } else {
      this.downlink.set(Item.fromAny(newItem).toValue());
    }
    return this;
  }

  override push(...newItems: AnyItem[]): number {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.push(...newItems);
    } else {
      throw new Error("unsupported");
    }
  }

  override splice(start: number, deleteCount?: number, ...newItems: AnyItem[]): Item[] {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.splice(start, deleteCount, ...newItems);
    } else {
      throw new Error("unsupported");
    }
  }

  override delete(key: AnyValue): Item {
    const value = this.downlink.get();
    if (value instanceof Record) {
      return value.delete(key);
    } else {
      return Value.absent();
    }
  }

  override clear(): void {
    const value = this.downlink.get();
    if (value instanceof Record) {
      value.clear();
    } else {
      throw new Error("unsupported");
    }
  }

  override forEach<T>(callback: (item: Item, index: number) => T | void): T | undefined;
  override forEach<T, S>(callback: (this: S, item: Item, index: number) => T | void,
                         thisArg: S): T | undefined;
  override forEach<T, S>(callback: (this: S | undefined, item: Item, index: number) => T | void,
                         thisArg?: S): T | undefined {
    const value = this.downlink.get();
    return value.forEach(callback, thisArg);
  }

  override keyIterator(): Cursor<Value> {
    const value = this.downlink.get();
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
