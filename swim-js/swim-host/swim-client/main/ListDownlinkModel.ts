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
import type {Cursor} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {STree} from "@swim/collections";
import {Attr} from "@swim/structure";
import {Value} from "@swim/structure";
import {Record} from "@swim/structure";
import type {Uri} from "@swim/uri";
import type {EventMessage} from "@swim/warp";
import {WarpDownlinkModel} from "./WarpDownlinkModel";
import type {ListDownlink} from "./ListDownlink";
import type {WarpHost} from "./WarpHost";

/** @internal */
export class ListDownlinkModel extends WarpDownlinkModel {
  constructor(hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number,
              rate: number, body: Value, state: STree<Value, Value> | null) {
    super(hostUri, nodeUri, laneUri, prio, rate, body);
    if (state === null) {
      state = new STree();
    }
    this.state = state;
  }

  declare readonly views: ReadonlySet<ListDownlink<any, any, any>> | null;

  /** @internal */
  readonly state: STree<Value, Value>;

  get size(): number {
    return this.state.length;
  }

  isEmpty(): boolean {
    return this.state.isEmpty();
  }

  get(index: number, key?: Value): Value {
    return this.state.get(index, key) || Value.absent();
  }

  getEntry(index: number, key?: Value): [Value, Value] | undefined {
    return this.state.getEntry(index, key);
  }

  override set(index: number, newValue: Value, key?: Value): this;
  override set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this;
  override set(index: number | {[K in keyof ListDownlinkModel as ListDownlinkModel[K] extends {set(value: any): any} ? K : never]?: ListDownlinkModel[K] extends {set(value: infer T): any} ? T : never}, newValue?: Value | TimingLike | boolean | null, key?: Value): this {
    if (typeof index !== "number") {
      super.set(index, newValue as TimingLike | boolean | null | undefined);
      return this;
    }
    if (key !== void 0) {
      index = this.state.lookup(key, index);
      if (index < 0) {
        throw new RangeError("" + key);
      }
    }
    if (index < 0 || index >= this.state.length) {
      throw new RangeError("" + index);
    }
    newValue = this.listWillUpdate(index, newValue as Value);
    const oldEntry = this.state.getEntry(index)!;
    this.state.set(index, newValue);
    this.listDidUpdate(index, newValue, oldEntry[1]);
    const header = Record.create(2).slot("key", oldEntry[0]).slot("index", index);
    this.command(Attr.of("update", header).concat(newValue));
    return this;
  }

  insert(index: number, newValue: Value, key?: Value): this {
    if (index < 0 || index > this.state.length) {
      throw new RangeError("" + index);
    }
    newValue = this.listWillUpdate(index, newValue);
    this.state.insert(index, newValue, key);
    const newEntry = this.state.getEntry(index)!;
    this.listDidUpdate(index, newValue, Value.absent());
    const header = Record.create(2).slot("key", newEntry[0]).slot("index", index);
    this.command(Attr.of("update", header).concat(newValue));
    return this;
  }

  override remove(): void;
  override remove(index: number, key?: Value): this;
  override remove(index?: number, key?: Value): this | void {
    if (arguments.length === 0) {
      super.remove();
      return;
    } else if (key !== void 0) {
      index = this.state.lookup(key, index);
      if (index < 0) {
        throw new RangeError("" + key);
      }
    }
    if (index! < 0 || index! > this.state.length) {
      throw new RangeError("" + index);
    }
    this.listWillRemove(index!);
    const oldEntry = this.state.getEntry(index!)!;
    this.state.remove(index!);
    this.listDidRemove(index!, oldEntry[1]);
    const header = Record.create(2).slot("key", oldEntry[0]).slot("index", index!);
    this.command(Record.create(1).attr("remove", header));
    return this;
  }

  push(...newValues: Value[]): number {
    for (let i = 0; i < newValues.length; i += 1) {
      const index = this.state.length + i;
      const newValue = this.listWillUpdate(index, newValues[i]!);
      this.state.insert(index, newValue);
      const newEntry = this.state.getEntry(index)!;
      this.listDidUpdate(index, newValue, Value.absent());
      const header = Record.create(2).slot("key", newEntry[0]).slot("index", index);
      this.command(Attr.of("update", header).concat(newValue));
    }
    return this.state.length;
  }

  pop(): Value {
    const index = this.state.length - 1;
    if (index < 0) {
      return Value.absent();
    }
    this.listWillRemove(index);
    const oldEntry = this.state.getEntry(index)!;
    this.state.remove(index);
    this.listDidRemove(index, oldEntry[1]);
    const header = Record.create(2).slot("key", oldEntry[0]).slot("index", index);
    this.command(Record.create(1).attr("remove", header));
    return oldEntry[1];
  }

  unshift(...newValues: Value[]): number {
    for (let i = newValues.length - 1; i >= 0; i -= 1) {
      const newValue = this.listWillUpdate(0, newValues[i]!);
      this.state.insert(0, newValue);
      const newEntry = this.state.getEntry(0)!;
      this.listDidUpdate(0, newValue, Value.absent());
      const header = Record.create(2).slot("key", newEntry[0]).slot("index", 0);
      this.command(Attr.of("update", header).concat(newValue));
    }
    return this.state.length;
  }

  shift(): Value {
    if (this.state.length <= 0) {
      return Value.absent();
    }
    this.listWillRemove(0);
    const oldEntry = this.state.getEntry(0)!;
    this.state.remove(0);
    this.listDidRemove(0, oldEntry[1]);
    const header = Record.create(2).slot("key", oldEntry[0]).slot("index", 0);
    this.command(Record.create(1).attr("remove", header));
    return oldEntry[1];
  }

  move(fromIndex: number, toIndex: number, key?: Value): this {
    if (key !== void 0) {
      fromIndex = this.state.lookup(key, fromIndex);
      if (fromIndex < 0) {
        throw new RangeError("" + key);
      }
    }
    if (fromIndex < 0 || fromIndex >= this.state.length) {
      throw new RangeError("" + fromIndex);
    }
    if (toIndex < 0 || toIndex >= this.state.length) {
      throw new RangeError("" + toIndex);
    }
    if (fromIndex !== toIndex) {
      const entry = this.state.getEntry(fromIndex)!;
      this.listWillMove(fromIndex, toIndex, entry[1]);
      this.state.remove(fromIndex).insert(toIndex, entry[1], entry[0]);
      this.listDidMove(fromIndex, toIndex, entry[1]);
      const header = Record.create(2).slot("key", entry[0]).slot("from", fromIndex).slot("to", toIndex);
      this.command(Record.create(1).attr("move", header));
    }
    return this;
  }

  splice(start: number, deleteCount?: number, ...newValues: Value[]): Value[] {
    if (start < 0) {
      start = this.state.length + start;
    }
    start = Math.min(Math.max(0, start), this.state.length);
    if (deleteCount === void 0) {
      deleteCount = this.state.length - start;
    }
    const deleted = [] as Value[];
    for (let i = start, n = start + deleteCount; i < n; i += 1) {
      this.listWillRemove(start);
      const oldEntry = this.state.getEntry(start)!;
      deleted.push(oldEntry[1]);
      this.state.remove(start);
      this.listDidRemove(start, oldEntry[1]);
      const header = Record.create(2).slot("key", oldEntry[0]).slot("index", start);
      this.command(Record.create(1).attr("remove", header));
    }
    for (let i = 0; i < newValues.length; i += 1) {
      const index = start + i;
      const newValue = this.listWillUpdate(index, newValues[i]!);
      this.state.insert(index, newValue);
      const newEntry = this.state.getEntry(index)!;
      this.listDidUpdate(index, newValue, Value.absent());
      const header = Record.create(2).slot("key", newEntry[0]).slot("index", index);
      this.command(Attr.of("update", header).concat(newValue));
    }
    return deleted;
  }

  clear(): void {
    this.listWillClear();
    this.state.clear();
    this.listDidClear();
    this.command(Record.create(1).attr("clear"));
  }

  forEach<T>(callback: (value: Value, index: number, key: Value) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, value: Value, index: number, key: Value) => T | void, thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, value: Value, index: number, key: Value) => T | void, thisArg?: S): T | undefined {
    return this.state.forEach(callback, thisArg);
  }

  values(): Cursor<Value> {
    return this.state.values();
  }

  keys(): Cursor<Value> {
    return this.state.keys();
  }

  entries(): Cursor<[Value, Value]> {
    return this.state.entries();
  }

  snapshot(): STree<Value, Value> {
    return this.state.clone();
  }

  setState(state: STree<Value, Value>): void {
    (this as Mutable<this>).state = state;
  }

  override onEventMessage(message: EventMessage, host: WarpHost): void {
    super.onEventMessage(message, host);
    const event = message.body;
    const tag = event.tag;
    if (tag === "update") {
      const header = event.head().toValue();
      const index = this.state.lookup(header.get("key"), header.get("index").numberValue());
      if (index >= 0) {
        this.onUpdateEvent(index, event.body(), header.get("key"));
      } else {
        this.onInsertEvent(header.get("index").numberValue(0), event.body(), header.get("key"));
      }
    } else if (tag === "move") {
      const header = event.head().toValue();
      const index = this.state.lookup(header.get("key"), header.get("from").numberValue());
      if (index >= 0) {
        this.onMoveEvent(index, header.get("to").numberValue(0), header.get("key"));
      }
    } else if (tag === "remove") {
      const header = event.head().toValue();
      const index = this.state.lookup(header.get("key"), header.get("index").numberValue());
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
    this.state.insert(index, newValue, key);
    this.listDidUpdate(index, newValue, Value.absent());
  }

  protected onUpdateEvent(index: number, newValue: Value, key: Value): void {
    newValue = this.listWillUpdate(index, newValue);
    const oldValue = this.state.get(index) || Value.absent();
    this.state.set(index, newValue);
    this.listDidUpdate(index, newValue, oldValue);
  }

  protected onMoveEvent(fromIndex: number, toIndex: number, key: Value): void {
    toIndex = Math.min(Math.max(0, toIndex), this.state.length);
    if (fromIndex === toIndex) {
      return;
    }
    const value = this.state.get(fromIndex) || Value.absent();
    this.listWillMove(fromIndex, toIndex, value);
    this.state.remove(fromIndex).insert(toIndex, value, key);
    this.listDidMove(fromIndex, toIndex, value);
  }

  protected onRemoveEvent(index: number, key: Value): void {
    this.listWillRemove(index);
    const oldValue = this.state.get(index) || Value.absent();
    this.state.remove(index);
    this.listDidRemove(index, oldValue);
  }

  protected onDropEvent(lower: number): void {
    this.listWillDrop(lower);
    this.state.drop(lower);
    this.listDidDrop(lower);
  }

  protected onTakeEvent(upper: number): void {
    this.listWillTake(upper);
    this.state.take(upper);
    this.listDidTake(upper);
  }

  protected onClearEvent(): void {
    this.listWillClear();
    this.state.clear();
    this.listDidClear();
  }

  protected listWillUpdate(index: number, newValue: Value): Value {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        newValue = view.listWillUpdate(index, newValue);
      }
    }
    return newValue;
  }

  protected listDidUpdate(index: number, newValue: Value, oldValue: Value): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listDidUpdate(index, newValue, oldValue);
      }
    }
  }

  protected listWillMove(fromIndex: number, toIndex: number, value: Value): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listWillMove(fromIndex, toIndex, value);
      }
    }
  }

  protected listDidMove(fromIndex: number, toIndex: number, value: Value): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listDidMove(fromIndex, toIndex, value);
      }
    }
  }

  protected listWillRemove(index: number): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listWillRemove(index);
      }
    }
  }

  protected listDidRemove(index: number, oldValue: Value): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listDidRemove(index, oldValue);
      }
    }
  }

  protected listWillDrop(lower: number): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listWillDrop(lower);
      }
    }
  }

  protected listDidDrop(lower: number): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listDidDrop(lower);
      }
    }
  }

  protected listWillTake(upper: number): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listWillTake(upper);
      }
    }
  }

  protected listDidTake(upper: number): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listDidTake(upper);
      }
    }
  }

  protected listWillClear(): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listWillClear();
      }
    }
  }

  protected listDidClear(): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.listDidClear();
      }
    }
  }
}
