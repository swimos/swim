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
import {BTree} from "@swim/collections";
import {Attr, Value, Record} from "@swim/structure";
import {Uri} from "@swim/uri";
import {EventMessage} from "@swim/warp";
import {Host} from "../host/Host";
import {DownlinkContext} from "./DownlinkContext";
import {DownlinkModel} from "./DownlinkModel";
import {DownlinkType} from "./Downlink";
import {MapDownlink} from "./MapDownlink";

/** @hidden */
export class MapDownlinkModel extends DownlinkModel {
  /** @hidden */
  _views: MapDownlink<unknown, unknown>[];
  /** @hidden */
  _state: BTree<Value, Value>;

  constructor(context: DownlinkContext, hostUri: Uri, nodeUri: Uri, laneUri: Uri,
              prio?: number, rate?: number, body?: Value, state: BTree<Value, Value> = new BTree()) {
    super(context, hostUri, nodeUri, laneUri, prio, rate, body);
    this._state = state;
  }

  type(): DownlinkType {
    return "map";
  }

  get size(): number {
    return this._state.size;
  }

  isEmpty(): boolean {
    return this._state.isEmpty();
  }

  has(key: Value): boolean {
    return this._state.has(key);
  }

  get(key: Value): Value {
    return this._state.get(key) || Value.absent();
  }

  getEntry(index: number): [Value, Value] | undefined {
    return this._state.getEntry(index);
  }

  set(key: Value, newValue: Value): this {
    newValue = this.mapWillUpdate(key, newValue);
    const oldValue = this._state.get(key) || Value.absent();
    this._state.set(key, newValue);
    this.mapDidUpdate(key, newValue, oldValue);
    const header = Record.create(1).slot("key", key);
    this.command(Attr.of("update", header).concat(newValue));
    return this;
  }

  delete(key: Value): boolean {
    if (this._state.has(key)) {
      this.mapWillRemove(key);
      const oldValue = this._state.get(key) || Value.absent();
      this._state.delete(key);
      this.mapDidRemove(key, oldValue);
      const header = Record.create(1).slot("key", key);
      this.command(Record.create(1).attr("remove", header));
      return true;
    } else {
      return false;
    }
  }

  drop(lower: number): this {
    this.mapWillDrop(lower);
    this._state.drop(lower);
    this.mapDidDrop(lower);
    this.command(Record.create(1).attr("drop", lower));
    return this;
  }

  take(upper: number): this {
    this.mapWillTake(upper);
    this._state.take(upper);
    this.mapDidTake(upper);
    this.command(Record.create(1).attr("take", upper));
    return this;
  }

  clear(): void {
    this.mapWillClear();
    this._state.clear();
    this.mapDidClear();
    this.command(Record.create(1).attr("clear"));
  }

  forEach<T, S = unknown>(callback: (this: S,
                                     key: Value,
                                     value: Value,
                                     downlink: MapDownlinkModel) => T | void,
                          thisArg?: S): T | undefined {
    return this._state.forEach(function (key: Value, value: Value): T | void {
      return callback.call(thisArg, key, value, this);
    }, this);
  }

  keys(): Cursor<Value> {
    return this._state.keys();
  }

  values(): Cursor<Value> {
    return this._state.values();
  }

  entries(): Cursor<[Value, Value]> {
    return this._state.entries();
  }

  snapshot(): BTree<Value, Value> {
    return this._state.clone();
  }

  setState(state: BTree<Value, Value>): void {
    this._state = state;
  }

  onEventMessage(message: EventMessage, host: Host): void {
    super.onEventMessage(message, host);
    const event = message.body();
    const tag = event.tag();
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
    const oldValue = this._state.get(key) || Value.absent();
    this._state.set(key, newValue);
    this.mapDidUpdate(key, newValue, oldValue);
  }

  protected onRemoveEvent(key: Value): void {
    this.mapWillRemove(key);
    const oldValue = this._state.get(key) || Value.absent();
    this._state.delete(key);
    this.mapDidRemove(key, oldValue);
  }

  protected onDropEvent(lower: number): void {
    this.mapWillDrop(lower);
    this._state.drop(lower);
    this.mapDidDrop(lower);
  }

  protected onTakeEvent(upper: number): void {
    this.mapWillTake(upper);
    this._state.take(upper);
    this.mapDidTake(upper);
  }

  protected onClearEvent(): void {
    this.mapWillClear();
    this._state.clear();
    this.mapDidClear();
  }

  protected mapWillUpdate(key: Value, newValue: Value): Value {
    for (let i = 0; i < this._views.length; i += 1) {
      newValue = this._views[i].mapWillUpdate(key, newValue);
    }
    return newValue;
  }

  protected mapDidUpdate(key: Value, newValue: Value, oldValue: Value): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].mapDidUpdate(key, newValue, oldValue);
    }
  }

  protected mapWillRemove(key: Value): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].mapWillRemove(key);
    }
  }

  protected mapDidRemove(key: Value, oldValue: Value): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].mapDidRemove(key, oldValue);
    }
  }

  protected mapWillDrop(lower: number): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].mapWillDrop(lower);
    }
  }

  protected mapDidDrop(lower: number): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].mapDidDrop(lower);
    }
  }

  protected mapWillTake(upper: number): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].mapWillTake(upper);
    }
  }

  protected mapDidTake(upper: number): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].mapDidTake(upper);
    }
  }

  protected mapWillClear(): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].mapWillClear();
    }
  }

  protected mapDidClear(): void {
    for (let i = 0; i < this._views.length; i += 1) {
      this._views[i].mapDidClear();
    }
  }
}
