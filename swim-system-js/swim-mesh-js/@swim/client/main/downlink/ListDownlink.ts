// Copyright 2015-2020 SWIM.AI inc.
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
import {Value, Form, ValueCursor, ValueEntryCursor} from "@swim/structure";
import {Uri} from "@swim/uri";
import {DownlinkContext} from "./DownlinkContext";
import {DownlinkOwner} from "./DownlinkOwner";
import {DownlinkType, DownlinkObserver, DownlinkInit, DownlinkFlags, Downlink} from "./Downlink";
import {ListDownlinkModel} from "./ListDownlinkModel";

export type ListDownlinkWillUpdate<V extends VU, VU = V> = (index: number, newValue: V, downlink: ListDownlink<V, VU>) => V | void;
export type ListDownlinkDidUpdate<V extends VU, VU = V> = (index: number, newValue: V, oldValue: V, downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkWillMove<V extends VU, VU = V> = (fromIndex: number, toIndex: number, value: V, downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkDidMove<V extends VU, VU = V> = (fromIndex: number, toIndex: number, value: V, downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkWillRemove<V extends VU, VU = V> = (index: number, downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkDidRemove<V extends VU, VU = V> = (index: number, oldValue: V, downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkWillDrop<V extends VU, VU = V> = (lower: number, downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkDidDrop<V extends VU, VU = V> = (lower: number, downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkWillTake<V extends VU, VU = V> = (upper: number, downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkDidTake<V extends VU, VU = V> = (upper: number, downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkWillClear<V extends VU, VU = V> = (downlink: ListDownlink<V, VU>) => void;
export type ListDownlinkDidClear<V extends VU, VU = V> = (downlink: ListDownlink<V, VU>) => void;

export interface ListDownlinkObserver<V extends VU, VU = V> extends DownlinkObserver {
  willUpdate?: ListDownlinkWillUpdate<V, VU>;
  didUpdate?: ListDownlinkDidUpdate<V, VU>;
  willMove?: ListDownlinkWillMove<V, VU>;
  didMove?: ListDownlinkDidMove<V, VU>;
  willRemove?: ListDownlinkWillRemove<V, VU>;
  didRemove?: ListDownlinkDidRemove<V, VU>;
  willDrop?: ListDownlinkWillDrop<V, VU>;
  didDrop?: ListDownlinkDidDrop<V, VU>;
  willTake?: ListDownlinkWillTake<V, VU>;
  didTake?: ListDownlinkDidTake<V, VU>;
  willClear?: ListDownlinkWillClear<V, VU>;
  didClear?: ListDownlinkDidClear<V, VU>;
}

export interface ListDownlinkInit<V extends VU, VU = V> extends ListDownlinkObserver<V, VU>, DownlinkInit {
  valueForm?: Form<V, VU>;
}

export class ListDownlink<V extends VU, VU = V> extends Downlink {
  /** @hidden */
  _observers: ReadonlyArray<ListDownlinkObserver<V, VU>> | null;
  /** @hidden */
  _model: ListDownlinkModel | null;
  /** @hidden */
  _valueForm: Form<V, VU>;
  /** @hidden */
  _state0: STree<Value, Value> | undefined;

  /** @hidden */
  constructor(context: DownlinkContext, owner?: DownlinkOwner, init?: ListDownlinkInit<V, VU>,
              hostUri?: Uri, nodeUri?: Uri, laneUri?: Uri, prio?: number, rate?: number,
              body?: Value, flags: number = DownlinkFlags.KeepLinkedSynced,
              observers?: ReadonlyArray<ListDownlinkObserver<V, VU>> | ListDownlinkObserver<V, VU> | null,
              valueForm?: Form<V, VU>, state0?: STree<Value, Value>) {
    super(context, owner, init, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
    if (init) {
      const observer = this._observers![this._observers!.length - 1];
      observer.willUpdate = init.willUpdate || observer.willUpdate;
      observer.didUpdate = init.didUpdate || observer.didUpdate;
      observer.willMove = init.willMove || observer.willMove;
      observer.didMove = init.didMove || observer.didMove;
      observer.willRemove = init.willRemove || observer.willRemove;
      observer.didRemove = init.didRemove || observer.didRemove;
      observer.willDrop = init.willDrop || observer.willDrop;
      observer.didDrop = init.didDrop || observer.didDrop;
      observer.willTake = init.willTake || observer.willTake;
      observer.didTake = init.didTake || observer.didTake;
      observer.willClear = init.willClear || observer.willClear;
      observer.didClear = init.didClear || observer.didClear;
      valueForm = init.valueForm ? init.valueForm : valueForm;
    }
    this._valueForm = valueForm || Form.forValue() as any;
    this._state0 = state0;
  }

  protected copy(context: DownlinkContext, owner: DownlinkOwner | undefined,
                 hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                 body: Value, flags: number, observers: ReadonlyArray<ListDownlinkObserver<V, VU>> | null,
                 valueForm?: Form<V, VU>, state0?: STree<Value, Value>): this {
    if (arguments.length === 10) {
      valueForm = this._valueForm;
      state0 = this._state0;
    }
    return new ListDownlink(context, owner, void 0, hostUri, nodeUri, laneUri,
                            prio, rate, body, flags, observers, valueForm, state0) as this;
  }

  type(): DownlinkType {
    return "list";
  }

  valueForm(): Form<V, VU>;
  valueForm<V2 extends V2U, V2U = V2>(valueForm: Form<V2, V2U>): ListDownlink<V2, V2U>;
  valueForm<V2 extends V2U, V2U = V2>(valueForm?: Form<V2, V2U>): Form<V, VU> | ListDownlink<V2, V2U> {
    if (valueForm === void 0) {
      return this._valueForm;
    } else {
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers,
                       valueForm as any, this._state0) as any;
    }
  }

  isEmpty(): boolean {
    return this._model!.isEmpty();
  }

  get length(): number {
    return this._model!.length;
  }

  get(index: number, id?: Value): V {
    const value = this._model!.get(index, id);
    return value.coerce(this._valueForm);
  }

  getEntry(index: number, id?: Value): [V, Value] | undefined {
    const entry = this._model!.getEntry(index, id);
    if (entry) {
      return [entry[0].coerce(this._valueForm), entry[1]];
    }
    return void 0;
  }

  set(index: number, newObject: VU, id?: Value): this {
    const newValue = this._valueForm.mold(newObject);
    this._model!.set(index, newValue, id);
    return this;
  }

  insert(index: number, newObject: VU, id?: Value): this {
    const newValue = this._valueForm.mold(newObject);
    this._model!.insert(index, newValue, id);
    return this;
  }

  remove(index: number, id?: Value): this {
    this._model!.remove(index, id);
    return this;
  }

  push(...newObjects: VU[]): number {
    const newValues = new Array(newObjects.length);
    for (let i = 0; i < newObjects.length; i += 1) {
      newValues[i] = this._valueForm.mold(newObjects[i]);
    }
    return this._model!.push.apply(this._model, newValues);
  }

  pop(): V {
    const value = this._model!.pop();
    return value.coerce(this._valueForm);
  }

  unshift(...newObjects: VU[]): number {
    const newValues = new Array(newObjects.length);
    for (let i = 0; i < newObjects.length; i += 1) {
      newValues[i] = this._valueForm.mold(newObjects[i]);
    }
    return this._model!.unshift.apply(this._model, newValues);
  }

  shift(): V {
    const value = this._model!.shift();
    return value.coerce(this._valueForm);
  }

  move(fromIndex: number, toIndex: number, id?: Value): this {
    this._model!.move(fromIndex, toIndex, id);
    return this;
  }

  splice(start: number, deleteCount?: number, ...newObjects: VU[]): V[] {
    const newValues = new Array(newObjects.length);
    for (let i = 0; i < newObjects.length; i += 1) {
      newValues[i] = this._valueForm.mold(newObjects[i]);
    }
    const oldValues = this._model!.splice(start, deleteCount, ...newValues);
    const oldObjects = new Array(oldValues.length);
    for (let i = 0; i < oldValues.length; i += 1) {
      oldObjects[i] = oldValues[i].coerce(this._valueForm);
    }
    return oldObjects;
  }

  clear(): void {
    this._model!.clear();
  }

  forEach<T, S = unknown>(callback: (this: S,
                                     value: V,
                                     index: number,
                                     downlink: ListDownlink<V, VU>,
                                     id: Value) => T | void,
                          thisArg?: S): T | undefined {
    if (this._valueForm as any === Form.forValue()) {
      return this._model!._state.forEach(callback as any, thisArg);
    } else {
      return this._model!._state.forEach(function (value: Value, index: number, tree: STree<Value, Value>, id: Value): T | void {
        const object = value.coerce(this._valueForm);
        return callback.call(thisArg, object, index, this, id);
      }, this);
    }
  }

  values(): Cursor<V> {
    const cursor = this._model!.values();
    if (this._valueForm as any === Form.forValue()) {
      return cursor as any;
    } else {
      return new ValueCursor(cursor, this._valueForm);
    }
  }

  keys(): Cursor<Value> {
    return this._model!.keys();
  }

  entries(): Cursor<[Value, V]> {
    const cursor = this._model!.entries();
    if (this._valueForm as any === Form.forValue()) {
      return cursor as any;
    } else {
      return new ValueEntryCursor(cursor, Form.forValue(), this._valueForm);
    }
  }

  snapshot(): STree<Value, Value> {
    return this._model!.snapshot();
  }

  setState(state: STree<Value, Value>): void {
    this._model!.setState(state);
  }

  observe(observer: ListDownlinkObserver<V, VU>): this {
    return super.observe(observer);
  }

  willUpdate(willUpdate: ListDownlinkWillUpdate<V, VU>): this {
    return this.observe({willUpdate});
  }

  didUpdate(didUpdate: ListDownlinkDidUpdate<V, VU>): this {
    return this.observe({didUpdate});
  }

  willMove(willMove: ListDownlinkWillMove<V, VU>): this {
    return this.observe({willMove});
  }

  didMove(didMove: ListDownlinkDidMove<V, VU>): this {
    return this.observe({didMove});
  }

  willRemove(willRemove: ListDownlinkWillRemove<V, VU>): this {
    return this.observe({willRemove});
  }

  didRemove(didRemove: ListDownlinkDidRemove<V, VU>): this {
    return this.observe({didRemove});
  }

  willDrop(willDrop: ListDownlinkWillDrop<V, VU>): this {
    return this.observe({willDrop});
  }

  didDrop(didDrop: ListDownlinkDidDrop<V, VU>): this {
    return this.observe({didDrop});
  }

  willTake(willTake: ListDownlinkWillTake<V, VU>): this {
    return this.observe({willTake});
  }

  didTake(didTake: ListDownlinkDidTake<V, VU>): this {
    return this.observe({didTake});
  }

  willClear(willClear: ListDownlinkWillClear<V, VU>): this {
    return this.observe({willClear});
  }

  didClear(didClear: ListDownlinkDidClear<V, VU>): this {
    return this.observe({didClear});
  }

  /** @hidden */
  listWillUpdate(index: number, newValue: Value): Value {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    let newObject: V | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willUpdate) {
        if (newObject === void 0) {
          newObject = newValue.coerce(this._valueForm);
        }
        const newResult = observer.willUpdate(index, newObject, this);
        if (newResult !== void 0) {
          newObject = newResult;
          newValue = this._valueForm.mold(newObject);
        }
      }
    }
    return newValue;
  }

  /** @hidden */
  listDidUpdate(index: number, newValue: Value, oldValue: Value): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    let newObject: V | undefined;
    let oldObject: V | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didUpdate) {
        if (newObject === void 0) {
          newObject = newValue.coerce(this._valueForm);
        }
        if (oldObject === void 0) {
          oldObject = oldValue.coerce(this._valueForm);
        }
        observer.didUpdate(index, newObject, oldObject, this);
      }
    }
  }

  /** @hidden */
  listWillMove(fromIndex: number, toIndex: number, value: Value): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    let object: V | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willMove) {
        if (object === void 0) {
          object = value.coerce(this._valueForm);
        }
        observer.willMove(fromIndex, toIndex, object, this);
      }
    }
  }

  /** @hidden */
  listDidMove(fromIndex: number, toIndex: number, value: Value): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    let object: V | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didMove) {
        if (object === void 0) {
          object = value.coerce(this._valueForm);
        }
        observer.didMove(fromIndex, toIndex, object, this);
      }
    }
  }

  /** @hidden */
  listWillRemove(index: number): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willRemove) {
        observer.willRemove(index, this);
      }
    }
  }

  /** @hidden */
  listDidRemove(index: number, oldValue: Value): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    let oldObject: V | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didRemove) {
        if (oldObject === void 0) {
          oldObject = oldValue.coerce(this._valueForm);
        }
        observer.didRemove(index, oldObject, this);
      }
    }
  }

  /** @hidden */
  listWillDrop(lower: number): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willDrop) {
        observer.willDrop(lower, this);
      }
    }
  }

  /** @hidden */
  listDidDrop(lower: number): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didDrop) {
        observer.didDrop(lower, this);
      }
    }
  }

  /** @hidden */
  listWillTake(upper: number): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willTake) {
        observer.willTake(upper, this);
      }
    }
  }

  /** @hidden */
  listDidTake(upper: number): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didTake) {
        observer.didTake(upper, this);
      }
    }
  }

  /** @hidden */
  listWillClear(): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willClear) {
        observer.willClear(this);
      }
    }
  }

  /** @hidden */
  listDidClear(): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didClear) {
        observer.didClear(this);
      }
    }
  }

  initialState(): STree<Value, Value> | null;
  initialState(state0: STree<Value, Value> | null): this;
  initialState(state0?: STree<Value, Value> | null): STree<Value, Value> | null | this {
    if (state0 === void 0) {
      return this._state0 || null;
    } else {
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers,
                       this._valueForm, state0 || void 0);
    }
  }

  /** @hidden */
  protected didAliasModel(): void {
    this.onLinkedResponse();
    this._model!._state.forEach(function (value: Value, index: number) {
      this.listDidUpdate(index, value, Value.absent());
    }, this);
    this.onSyncedResponse();
  }

  open(): this {
    const laneUri = this._laneUri;
    if (laneUri.isEmpty()) {
      throw new Error("no lane");
    }
    let nodeUri = this._nodeUri;
    if (nodeUri.isEmpty()) {
      throw new Error("no node");
    }
    let hostUri = this._hostUri;
    if (hostUri.isEmpty()) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    let model = this._context.getDownlink(hostUri, nodeUri, laneUri);
    if (model) {
      if (!(model instanceof ListDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
      this._model = model as ListDownlinkModel;
      setTimeout(this.didAliasModel.bind(this));
    } else {
      model = new ListDownlinkModel(this._context, hostUri, nodeUri, laneUri, this._prio,
                                    this._rate, this._body, this._state0);
      model.addDownlink(this);
      this._context.openDownlink(model);
      this._model = model as ListDownlinkModel;
    }
    if (this._owner) {
      this._owner.addDownlink(this);
    }
    return this;
  }
}
