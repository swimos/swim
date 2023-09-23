// Copyright 2015-2023 Nstream, inc.
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
import {BTree} from "@swim/collections";
import {Attr} from "@swim/structure";
import {Value} from "@swim/structure";
import {Record} from "@swim/structure";
import type {Uri} from "@swim/uri";
import type {EventMessage} from "@swim/warp";
import {WarpDownlinkModel} from "./WarpDownlinkModel";
import type {MapDownlink} from "./MapDownlink";
import type {WarpHost} from "./WarpHost";

/** @internal */
export class MapDownlinkModel extends WarpDownlinkModel {
  constructor(hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number,
              rate: number, body: Value, state: BTree<Value, Value> | null) {
    super(hostUri, nodeUri, laneUri, prio, rate, body);
    if (state === null) {
      state = new BTree();
    }
    this.state = state;
  }

  declare readonly views: ReadonlySet<MapDownlink<any, any, any, any>> | null;

  /** @internal */
  readonly state: BTree<Value, Value>;

  get size(): number {
    return this.state.size;
  }

  isEmpty(): boolean {
    return this.state.isEmpty();
  }

  has(key: Value): boolean {
    return this.state.has(key);
  }

  get(key: Value): Value {
    return this.state.get(key) ?? Value.absent();
  }

  getEntry(index: number): [Value, Value] | undefined {
    return this.state.getEntry(index);
  }

  override set(key: Value, newValue: Value): this;
  override set<S>(this: S, properties: {[K in keyof S as S[K] extends {set(value: any): any} ? K : never]?: S[K] extends {set(value: infer T): any} ? T : never}, timing?: TimingLike | boolean | null): this;
  override set(key: Value | {[K in keyof MapDownlinkModel as MapDownlinkModel[K] extends {set(value: any): any} ? K : never]?: MapDownlinkModel[K] extends {set(value: infer T): any} ? T : never}, newValue?: Value | TimingLike | boolean | null): this {
    if (!(key instanceof Value)) {
      super.set(key, newValue as TimingLike | boolean | null | undefined);
      return this;
    }
    newValue = this.mapWillUpdate(key, newValue as Value);
    const oldValue = this.state.get(key) ?? Value.absent();
    this.state.set(key, newValue);
    this.mapDidUpdate(key, newValue, oldValue);
    const header = Record.create(1).slot("key", key);
    this.command(Attr.of("update", header).concat(newValue));
    return this;
  }

  delete(key: Value): boolean {
    if (!this.state.has(key)) {
      return false;
    }
    this.mapWillRemove(key);
    const oldValue = this.state.get(key) ?? Value.absent();
    this.state.delete(key);
    this.mapDidRemove(key, oldValue);
    const header = Record.create(1).slot("key", key);
    this.command(Record.create(1).attr("remove", header));
    return true;
  }

  drop(lower: number): this {
    this.mapWillDrop(lower);
    this.state.drop(lower);
    this.mapDidDrop(lower);
    this.command(Record.create(1).attr("drop", lower));
    return this;
  }

  take(upper: number): this {
    this.mapWillTake(upper);
    this.state.take(upper);
    this.mapDidTake(upper);
    this.command(Record.create(1).attr("take", upper));
    return this;
  }

  clear(): void {
    this.mapWillClear();
    this.state.clear();
    this.mapDidClear();
    this.command(Record.create(1).attr("clear"));
  }

  forEach<T>(callback: (value: Value, key: Value) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, value: Value, key: Value) => T | void, thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, value: Value, key: Value) => T | void, thisArg?: S): T | undefined {
    return this.state.forEach(callback, thisArg);
  }

  keys(): Cursor<Value> {
    return this.state.keys();
  }

  values(): Cursor<Value> {
    return this.state.values();
  }

  entries(): Cursor<[Value, Value]> {
    return this.state.entries();
  }

  snapshot(): BTree<Value, Value> {
    return this.state.clone();
  }

  setState(state: BTree<Value, Value>): void {
    (this as Mutable<this>).state = state;
  }

  override onEventMessage(message: EventMessage, host: WarpHost): void {
    super.onEventMessage(message, host);
    const event = message.body;
    const tag = event.tag;
    if (tag === "update") {
      const header = event.head().toValue();
      this.onUpdateEvent(header.get("key"), event.body());
    } else if (tag === "remove") {
      const header = event.head().toValue();
      this.onRemoveEvent(header.get("key"));
    } else if (tag === "drop") {
      const header = event.head().toValue();
      this.onDropEvent(header.numberValue(0));
    } else if (tag === "take") {
      const header = event.head().toValue();
      this.onTakeEvent(header.numberValue(0));
    } else if (tag === "clear") {
      this.onClearEvent();
    }
  }

  protected onUpdateEvent(key: Value, newValue: Value): void {
    newValue = this.mapWillUpdate(key, newValue);
    const oldValue = this.state.get(key) ?? Value.absent();
    this.state.set(key, newValue);
    this.mapDidUpdate(key, newValue, oldValue);
  }

  protected onRemoveEvent(key: Value): void {
    this.mapWillRemove(key);
    const oldValue = this.state.get(key) ?? Value.absent();
    this.state.delete(key);
    this.mapDidRemove(key, oldValue);
  }

  protected onDropEvent(lower: number): void {
    this.mapWillDrop(lower);
    this.state.drop(lower);
    this.mapDidDrop(lower);
  }

  protected onTakeEvent(upper: number): void {
    this.mapWillTake(upper);
    this.state.take(upper);
    this.mapDidTake(upper);
  }

  protected onClearEvent(): void {
    this.mapWillClear();
    this.state.clear();
    this.mapDidClear();
  }

  protected mapWillUpdate(key: Value, newValue: Value): Value {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        newValue = view.mapWillUpdate(key, newValue);
      }
    }
    return newValue;
  }

  protected mapDidUpdate(key: Value, newValue: Value, oldValue: Value): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.mapDidUpdate(key, newValue, oldValue);
      }
    }
  }

  protected mapWillRemove(key: Value): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.mapWillRemove(key);
      }
    }
  }

  protected mapDidRemove(key: Value, oldValue: Value): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.mapDidRemove(key, oldValue);
      }
    }
  }

  protected mapWillDrop(lower: number): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.mapWillDrop(lower);
      }
    }
  }

  protected mapDidDrop(lower: number): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.mapDidDrop(lower);
      }
    }
  }

  protected mapWillTake(upper: number): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.mapWillTake(upper);
      }
    }
  }

  protected mapDidTake(upper: number): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.mapDidTake(upper);
      }
    }
  }

  protected mapWillClear(): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.mapWillClear();
      }
    }
  }

  protected mapDidClear(): void {
    const views = this.views;
    if (views !== null) {
      for (const view of views) {
        view.mapDidClear();
      }
    }
  }
}
