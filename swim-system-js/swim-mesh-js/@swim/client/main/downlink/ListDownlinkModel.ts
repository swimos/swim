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
import {STree} from "@swim/collections";
import {Attr, Value, Record} from "@swim/structure";
import {Uri} from "@swim/uri";
import {EventMessage} from "@swim/warp";
import {Host} from "../host/Host";
import {DownlinkContext} from "./DownlinkContext";
import {DownlinkModel} from "./DownlinkModel";
import {DownlinkType} from "./Downlink";
import {ListDownlink} from "./ListDownlink";

/** @hidden */
export class ListDownlinkModel extends DownlinkModel {
  /** @hidden */
  _views: ListDownlink<unknown>[];
  /** @hidden */
  _state: STree<Value, Value>;

  constructor(context: DownlinkContext, hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio?: number, rate?: number, body?: Value, state: STree<Value, Value> = new STree()) {
    super(context, hostUri, nodeUri, laneUri, prio, rate, body);
    this._state = state;
  }

  type(): DownlinkType {
    return "list";
  }

  isEmpty(): boolean {
    return this._state.isEmpty();
  }

  get length(): number {
    return this._state.length;
  }

  get(index: number, key?: Value): Value {
    return this._state.get(index, key) || Value.absent();
  }

  getEntry(index: number, key?: Value): [Value, Value] | undefined {
    return this._state.getEntry(index, key);
  }

  set(index: number, newValue: Value, key?: Value): this {
    if (key !== void 0) {
      index = this._state.lookup(key, index);
      if (index < 0) {
        throw new RangeError("" + key);
      }
    }
    if (index < 0 || index >= this._state.length) {
      throw new RangeError("" + index);
    }
    newValue = this.listWillUpdate(index, newValue);
    const oldEntry = this._state.getEntry(index)!;
    this._state.set(index, newValue);
    this.listDidUpdate(index, newValue, oldEntry[1]);
    const header = Record.create(2).slot("key", oldEntry[0]).slot("index", index);
    this.command(Attr.of("update", header).concat(newValue));
    return this;
  }

  insert(index: number, newValue: Value, key?: Value): this {
    if (index < 0 || index > this._state.length) {
      throw new RangeError("" + index);
    }
    newValue = this.listWillUpdate(index, newValue);
    this._state.insert(index, newValue, key);
    const newEntry = this._state.getEntry(index)!;
    this.listDidUpdate(index, newValue, Value.absent());
    const header = Record.create(2).slot("key", newEntry[0]).slot("index", index);
    this.command(Attr.of("update", header).concat(newValue));
    return this;
  }

  remove(index: number, key?: Value): this {
    if (key !== void 0) {
      index = this._state.lookup(key, index);
      if (index < 0) {
        throw new RangeError("" + key);
      }
    }
    if (index < 0 || index > this._state.length) {
      throw new RangeError("" + index);
    }
    this.listWillRemove(index);
    const oldEntry = this._state.getEntry(index)!;
    this._state.remove(index);
    this.listDidRemove(index, oldEntry[1]);
    const header = Record.create(2).slot("key", oldEntry[0]).slot("index", index);
    this.command(Record.create(1).attr("remove", header));
    return this;
  }

  push(...newValues: Value[]): number {
    for (let i = 0; i < newValues.length; i += 1) {
      const index = this._state.length + i;
      const newValue = this.listWillUpdate(index, newValues[i]);
      this._state.insert(index, newValue);
      const newEntry = this._state.getEntry(index)!;
      this.listDidUpdate(index, newValue, Value.absent());
      const header = Record.create(2).slot("key", newEntry[0]).slot("index", index);
      this.command(Attr.of("update", header).concat(newValue));
    }
    return this._state.length;
  }

  pop(): Value {
    const index = this._state.length - 1;
    if (index >= 0) {
      this.listWillRemove(index);
      const oldEntry = this._state.getEntry(index)!;
      this._state.remove(index);
      this.listDidRemove(index, oldEntry[1]);
      const header = Record.create(2).slot("key", oldEntry[0]).slot("index", index);
      this.command(Record.create(1).attr("remove", header));
      return oldEntry[1];
    } else {
      return Value.absent();
    }
  }

  unshift(...newValues: Value[]): number {
    for (let i = newValues.length - 1; i >= 0; i -= 1) {
      const newValue = this.listWillUpdate(0, newValues[i]);
      this._state.insert(0, newValue);
      const newEntry = this._state.getEntry(0)!;
      this.listDidUpdate(0, newValue, Value.absent());
      const header = Record.create(2).slot("key", newEntry[0]).slot("index", 0);
      this.command(Attr.of("update", header).concat(newValue));
    }
    return this._state.length;
  }

  shift(): Value {
    if (this._state.length > 0) {
      this.listWillRemove(0);
      const oldEntry = this._state.getEntry(0)!;
      this._state.remove(0);
      this.listDidRemove(0, oldEntry[1]);
      const header = Record.create(2).slot("key", oldEntry[0]).slot("index", 0);
      this.command(Record.create(1).attr("remove", header));
      return oldEntry[1];
    } else {
      return Value.absent();
    }
  }

  move(fromIndex: number, toIndex: number, key?: Value): this {
    if (key !== void 0) {
      fromIndex = this._state.lookup(key, fromIndex);
      if (fromIndex < 0) {
        throw new RangeError("" + key);
      }
    }
    if (fromIndex < 0 || fromIndex >= this._state.length) {
      throw new RangeError("" + fromIndex);
    }
    if (toIndex < 0 || toIndex >= this._state.length) {
      throw new RangeError("" + toIndex);
    }
    if (fromIndex !== toIndex) {
      const entry = this._state.getEntry(fromIndex)!;
      this.listWillMove(fromIndex, toIndex, entry[1]);
      this._state.remove(fromIndex).insert(toIndex, entry[1], entry[0]);
      this.listDidMove(fromIndex, toIndex, entry[1]);
      const header = Record.create(2).slot("key", entry[0]).slot("from", fromIndex).slot("to", toIndex);
      this.command(Record.create(1).attr("move", header));
    }
    return this;
  }

  splice(start: number, deleteCount?: number, ...newValues: Value[]): Value[] {
    if (start < 0) {
      start = this._state.length + start;
    }
    start = Math.min(Math.max(0, start), this._state.length);
    if (deleteCount === void 0) {
      deleteCount = this._state.length - start;
    }
    const deleted = [] as Value[];
    for (let i = start, n = start + deleteCount; i < n; i += 1) {
      this.listWillRemove(start);
      const oldEntry = this._state.getEntry(start)!;
      deleted.push(oldEntry[1]);
      this._state.remove(start);
      this.listDidRemove(start, oldEntry[1]);
      const header = Record.create(2).slot("key", oldEntry[0]).slot("index", start);
      this.command(Record.create(1).attr("remove", header));
    }
    for (let i = 0; i < newValues.length; i += 1) {
      const index = start + i;
      const newValue = this.listWillUpdate(index, newValues[i]);
      this._state.insert(index, newValue);
      const newEntry = this._state.getEntry(index)!;
      this.listDidUpdate(index, newValue, Value.absent());
      const header = Record.create(2).slot("key", newEntry[0]).slot("index", index);
      this.command(Attr.of("update", header).concat(newValue));
    }
    return deleted;
  }

  clear(): void {
    this.listWillClear();
    this._state.clear();
    this.listDidClear();
    this.command(Record.create(1).attr("clear"));
  }

  forEach<T, S = unknown>(callback: (this: typeof thisArg, value: Value, index: number, key: Value) => T | void,
                          thisArg?: S): T | undefined {
    return this._state.forEach(callback, thisArg);
  }

  values(): Cursor<Value> {
    return this._state.values();
  }

  keys(): Cursor<Value> {
    return this._state.keys();
  }

  entries(): Cursor<[Value, Value]> {
    return this._state.entries();
  }

  snapshot(): STree<Value, Value> {
    return this._state.clone();
  }

  setState(state: STree<Value, Value>): void {
    this._state = state;
  }

  onEventMessage(message: EventMessage, host: Host): void {
    super.onEventMessage(message, host);
    const event = message.body();
    const tag = event.tag();
    if (tag === "update") {
      const header = event.head().toValue();
      const index = this._state.lookup(header.get("key"), header.get("index").numberValue());
      if (index >= 0) {
        this.onUpdateEvent(index, event.body(), header.get("key"));
      } else {
        this.onInsertEvent(header.get("index").numberValue(0), event.body(), header.get("key"));
      }
    } else if (tag === "move") {
      const header = event.head().toValue();
      const index = this._state.lookup(header.get("key"), header.get("from").numberValue());
      if (index >= 0) {
        this.onMoveEvent(index, header.get("to").numberValue(0), header.get("key"));
      }
    } else if (tag === "remove") {
      const header = event.head().toValue();
      const index = this._state.lookup(header.get("key"), header.get("index").numberValue());
      if (index >= 0) {
        this.onRemoveEvent(index, header.get("key"));
      }
    } else if (tag === "drop") {
      const header = event.head();
      this.onDropEvent(header.numberValue(0));
    } else if (tag === "take") {
      const header = event.head();
      this.onTakeEvent(header.numberValue(0));
    } else if (tag === "clear") {
      this.onClearEvent();
    }
  }

  protected onInsertEvent(index: number, newValue: Value, key: Value): void {
    newValue = this.listWillUpdate(index, newValue);
    this._state.insert(index, newValue, key);
    this.listDidUpdate(index, newValue, Value.absent());
  }

  protected onUpdateEvent(index: number, newValue: Value, key: Value): void {
    newValue = this.listWillUpdate(index, newValue);
    const oldValue = this._state.get(index) || Value.absent();
    this._state.set(index, newValue);
    this.listDidUpdate(index, newValue, oldValue);
  }

  protected onMoveEvent(fromIndex: number, toIndex: number, key: Value): void {
    toIndex = Math.min(Math.max(0, toIndex), this._state.length);
    if (fromIndex !== toIndex) {
      const value = this._state.get(fromIndex) || Value.absent();
      this.listWillMove(fromIndex, toIndex, value);
      this._state.remove(fromIndex).insert(toIndex, value, key);
      this.listDidMove(fromIndex, toIndex, value);
    }
  }

  protected onRemoveEvent(index: number, key: Value): void {
    this.listWillRemove(index);
    const oldValue = this._state.get(index) || Value.absent();
    this._state.remove(index);
    this.listDidRemove(index, oldValue);
  }

  protected onDropEvent(lower: number): void {
    this.listWillDrop(lower);
    this._state.drop(lower);
    this.listDidDrop(lower);
  }

  protected onTakeEvent(upper: number): void {
    this.listWillTake(upper);
    this._state.take(upper);
    this.listDidTake(upper);
  }

  protected onClearEvent(): void {
    this.listWillClear();
    this._state.clear();
    this.listDidClear();
  }

  protected listWillUpdate(index: number, newValue: Value): Value {
    for (let i = 0; i < this._views.length; i += 1) {
      newValue = this._views[i].listWillUpdate(index, newValue);
    }
    return newValue;
  }

  protected listDidUpdate(index: number, newValue: Value, oldValue: Value): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listDidUpdate(index, newValue, oldValue);
    }
  }

  protected listWillMove(fromIndex: number, toIndex: number, value: Value): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listWillMove(fromIndex, toIndex, value);
    }
  }

  protected listDidMove(fromIndex: number, toIndex: number, value: Value): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listDidMove(fromIndex, toIndex, value);
    }
  }

  protected listWillRemove(index: number): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listWillRemove(index);
    }
  }

  protected listDidRemove(index: number, oldValue: Value): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listDidRemove(index, oldValue);
    }
  }

  protected listWillDrop(lower: number): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listWillDrop(lower);
    }
  }

  protected listDidDrop(lower: number): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listDidDrop(lower);
    }
  }

  protected listWillTake(upper: number): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listWillTake(upper);
    }
  }

  protected listDidTake(upper: number): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listDidTake(upper);
    }
  }

  protected listWillClear() {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listWillClear();
    }
  }

  protected listDidClear() {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].listDidClear();
    }
  }
}
