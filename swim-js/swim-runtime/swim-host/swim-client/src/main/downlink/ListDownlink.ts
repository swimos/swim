// Copyright 2015-2021 Swim.inc
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

import type {Mutable, Cursor} from "@swim/util";
import type {STree} from "@swim/collections";
import {AnyValue, Value, Form, ValueCursor, ValueEntryCursor} from "@swim/structure";
import type {AnyUri, Uri} from "@swim/uri";
import type {DownlinkContext} from "./DownlinkContext";
import type {DownlinkOwner} from "./DownlinkOwner";
import {DownlinkType, DownlinkObserver, DownlinkInit, DownlinkFlags, Downlink} from "./Downlink";
import {ListDownlinkModel} from "./ListDownlinkModel";

/** @public */
export type ListDownlinkWillUpdate<V, VU = never> = (index: number, newValue: V, downlink: ListDownlink<V, VU>) => V | void;
/** @public */
export type ListDownlinkDidUpdate<V, VU = never> = (index: number, newValue: V, oldValue: V, downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkWillMove<V, VU = never> = (fromIndex: number, toIndex: number, value: V, downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkDidMove<V, VU = never> = (fromIndex: number, toIndex: number, value: V, downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkWillRemove<V, VU = never> = (index: number, downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkDidRemove<V, VU = never> = (index: number, oldValue: V, downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkWillDrop<V, VU = never> = (lower: number, downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkDidDrop<V, VU = never> = (lower: number, downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkWillTake<V, VU = never> = (upper: number, downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkDidTake<V, VU = never> = (upper: number, downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkWillClear<V, VU = never> = (downlink: ListDownlink<V, VU>) => void;
/** @public */
export type ListDownlinkDidClear<V, VU = never> = (downlink: ListDownlink<V, VU>) => void;

/** @public */
export interface ListDownlinkObserver<V, VU = never> extends DownlinkObserver {
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

/** @public */
export interface ListDownlinkInit<V, VU = never> extends ListDownlinkObserver<V, VU>, DownlinkInit {
  valueForm?: Form<V, VU>;
}

/** @public */
export class ListDownlink<V, VU = never> extends Downlink {
  /** @internal */
  constructor(context: DownlinkContext, owner: DownlinkOwner | null, init?: ListDownlinkInit<V, VU>,
              hostUri?: Uri, nodeUri?: Uri, laneUri?: Uri, prio?: number, rate?: number,
              body?: Value, flags: number = DownlinkFlags.KeepLinkedSynced,
              observers?: ReadonlyArray<ListDownlinkObserver<V, VU>> | ListDownlinkObserver<V, VU>,
              valueForm?: Form<V, VU>, state0: STree<Value, Value> | null = null) {
    super(context, owner, init, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
    if (init !== void 0) {
      const observer = this.observers[this.observers.length - 1]!;
      observer.willUpdate = init.willUpdate ?? observer.willUpdate;
      observer.didUpdate = init.didUpdate ?? observer.didUpdate;
      observer.willMove = init.willMove ?? observer.willMove;
      observer.didMove = init.didMove ?? observer.didMove;
      observer.willRemove = init.willRemove ?? observer.willRemove;
      observer.didRemove = init.didRemove ?? observer.didRemove;
      observer.willDrop = init.willDrop ?? observer.willDrop;
      observer.didDrop = init.didDrop ?? observer.didDrop;
      observer.willTake = init.willTake ?? observer.willTake;
      observer.didTake = init.didTake ?? observer.didTake;
      observer.willClear = init.willClear ?? observer.willClear;
      observer.didClear = init.didClear ?? observer.didClear;
      valueForm = init.valueForm !== void 0 ? init.valueForm : valueForm;
    }
    this.ownValueForm = valueForm !== void 0 ? valueForm : Form.forValue() as unknown as Form<V, VU>;
    this.state0 = state0;
  }

  /** @internal */
  override readonly model!: ListDownlinkModel | null;

  /** @internal */
  override readonly observers!: ReadonlyArray<ListDownlinkObserver<V, VU>>;

  /** @internal */
  readonly ownValueForm: Form<V, VU>;

  /** @internal */
  readonly state0: STree<Value, Value> | null;

  override get type(): DownlinkType {
    return "list";
  }

  /** @internal */
  protected override copy<V, VU>(context: DownlinkContext, owner: DownlinkOwner | null,
                                 hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                                 body: Value, flags: number, observers: ReadonlyArray<ListDownlinkObserver<V, VU>>,
                                 valueForm?: Form<V, VU>, state0?: STree<Value, Value> | null): ListDownlink<V, VU> {
    if (arguments.length === 10) {
      valueForm = this.ownValueForm as unknown as Form<V, VU>;
      state0 = this.state0;
    }
    return new ListDownlink(context, owner, void 0, hostUri, nodeUri, laneUri,
                            prio, rate, body, flags, observers, valueForm, state0);
  }

  valueForm(): Form<V, VU>;
  valueForm<V2, V2U = never>(valueForm: Form<V2, V2U>): ListDownlink<V2, V2U>;
  valueForm<V2, V2U = never>(valueForm?: Form<V2, V2U>): Form<V, VU> | ListDownlink<V2, V2U> {
    if (valueForm === void 0) {
      return this.ownValueForm;
    } else {
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers as any,
                       valueForm, this.state0);
    }
  }

  get length(): number {
    return this.model!.length;
  }

  isEmpty(): boolean {
    return this.model!.isEmpty();
  }

  get(index: number, id?: Value): V {
    const value = this.model!.get(index, id);
    return value.coerce(this.ownValueForm);
  }

  getEntry(index: number, id?: Value): [V, Value] | undefined {
    const entry = this.model!.getEntry(index, id);
    if (entry !== void 0) {
      return [entry[0].coerce(this.ownValueForm), entry[1]];
    }
    return void 0;
  }

  set(index: number, newObject: V | VU, id?: Value): this {
    const newValue = this.ownValueForm.mold(newObject);
    this.model!.set(index, newValue, id);
    return this;
  }

  insert(index: number, newObject: V | VU, id?: Value): this {
    const newValue = this.ownValueForm.mold(newObject);
    this.model!.insert(index, newValue, id);
    return this;
  }

  remove(index: number, id?: Value): this {
    this.model!.remove(index, id);
    return this;
  }

  push(...newObjects: (V | VU)[]): number {
    const newValues = new Array(newObjects.length);
    for (let i = 0; i < newObjects.length; i += 1) {
      newValues[i] = this.ownValueForm.mold(newObjects[i]!);
    }
    return this.model!.push.apply(this.model, newValues);
  }

  pop(): V {
    const value = this.model!.pop();
    return value.coerce(this.ownValueForm);
  }

  unshift(...newObjects: (V | VU)[]): number {
    const newValues = new Array(newObjects.length);
    for (let i = 0; i < newObjects.length; i += 1) {
      newValues[i] = this.ownValueForm.mold(newObjects[i]!);
    }
    return this.model!.unshift.apply(this.model, newValues);
  }

  shift(): V {
    const value = this.model!.shift();
    return value.coerce(this.ownValueForm);
  }

  move(fromIndex: number, toIndex: number, id?: Value): this {
    this.model!.move(fromIndex, toIndex, id);
    return this;
  }

  splice(start: number, deleteCount?: number, ...newObjects: (V | VU)[]): V[] {
    const newValues = new Array(newObjects.length);
    for (let i = 0; i < newObjects.length; i += 1) {
      newValues[i] = this.ownValueForm.mold(newObjects[i]!);
    }
    const oldValues = this.model!.splice(start, deleteCount, ...newValues);
    const oldObjects = new Array(oldValues.length);
    for (let i = 0; i < oldValues.length; i += 1) {
      oldObjects[i] = oldValues[i]!.coerce(this.ownValueForm);
    }
    return oldObjects;
  }

  clear(): void {
    this.model!.clear();
  }

  forEach<T, S>(callback: (value: V, index: number, id: Value) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, value: V, index: number, id: Value) => T | void,
                thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, value: V, index: number, id: Value) => T | void,
                thisArg?: S): T | undefined {
    if (this.ownValueForm as unknown === Form.forValue()) {
      return this.model!.state.forEach(callback as any, thisArg);
    } else {
      return this.model!.state.forEach(function (value: Value, index: number, id: Value): T | void {
        const object = value.coerce(this.ownValueForm);
        return callback.call(thisArg, object, index, id);
      }, this);
    }
  }

  values(): Cursor<V> {
    const cursor = this.model!.values();
    if (this.ownValueForm as unknown === Form.forValue()) {
      return cursor as unknown as Cursor<V>;
    } else {
      return new ValueCursor(cursor, this.ownValueForm);
    }
  }

  keys(): Cursor<Value> {
    return this.model!.keys();
  }

  entries(): Cursor<[Value, V]> {
    const cursor = this.model!.entries();
    if (this.ownValueForm as unknown === Form.forValue()) {
      return cursor as unknown as Cursor<[Value, V]>;
    } else {
      return new ValueEntryCursor(cursor, Form.forValue(), this.ownValueForm);
    }
  }

  snapshot(): STree<Value, Value> {
    return this.model!.snapshot();
  }

  setState(state: STree<Value, Value>): void {
    this.model!.setState(state);
  }

  override observe(observer: ListDownlinkObserver<V, VU>): this {
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

  /** @internal */
  listWillUpdate(index: number, newValue: Value): Value {
    let newObject: V | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willUpdate !== void 0) {
        if (newObject === void 0) {
          newObject = newValue.coerce(this.ownValueForm);
        }
        const newResult = observer.willUpdate(index, newObject, this);
        if (newResult !== void 0) {
          newObject = newResult;
          newValue = this.ownValueForm.mold(newObject);
        }
      }
    }
    return newValue;
  }

  /** @internal */
  listDidUpdate(index: number, newValue: Value, oldValue: Value): void {
    let newObject: V | undefined;
    let oldObject: V | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didUpdate !== void 0) {
        if (newObject === void 0) {
          newObject = newValue.coerce(this.ownValueForm);
        }
        if (oldObject === void 0) {
          oldObject = oldValue.coerce(this.ownValueForm);
        }
        observer.didUpdate(index, newObject, oldObject, this);
      }
    }
  }

  /** @internal */
  listWillMove(fromIndex: number, toIndex: number, value: Value): void {
    let object: V | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willMove !== void 0) {
        if (object === void 0) {
          object = value.coerce(this.ownValueForm);
        }
        observer.willMove(fromIndex, toIndex, object, this);
      }
    }
  }

  /** @internal */
  listDidMove(fromIndex: number, toIndex: number, value: Value): void {
    let object: V | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didMove !== void 0) {
        if (object === void 0) {
          object = value.coerce(this.ownValueForm);
        }
        observer.didMove(fromIndex, toIndex, object, this);
      }
    }
  }

  /** @internal */
  listWillRemove(index: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willRemove !== void 0) {
        observer.willRemove(index, this);
      }
    }
  }

  /** @internal */
  listDidRemove(index: number, oldValue: Value): void {
    let oldObject: V | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didRemove !== void 0) {
        if (oldObject === void 0) {
          oldObject = oldValue.coerce(this.ownValueForm);
        }
        observer.didRemove(index, oldObject, this);
      }
    }
  }

  /** @internal */
  listWillDrop(lower: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willDrop !== void 0) {
        observer.willDrop(lower, this);
      }
    }
  }

  /** @internal */
  listDidDrop(lower: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didDrop !== void 0) {
        observer.didDrop(lower, this);
      }
    }
  }

  /** @internal */
  listWillTake(upper: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willTake !== void 0) {
        observer.willTake(upper, this);
      }
    }
  }

  /** @internal */
  listDidTake(upper: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didTake !== void 0) {
        observer.didTake(upper, this);
      }
    }
  }

  /** @internal */
  listWillClear(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willClear !== void 0) {
        observer.willClear(this);
      }
    }
  }

  /** @internal */
  listDidClear(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didClear !== void 0) {
        observer.didClear(this);
      }
    }
  }

  initialState(): STree<Value, Value> | null;
  initialState(state0: STree<Value, Value> | null): ListDownlink<V, VU>;
  initialState(state0?: STree<Value, Value> | null): STree<Value, Value> | null | ListDownlink<V, VU> {
    if (state0 === void 0) {
      return this.state0;
    } else {
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers,
                       this.ownValueForm, state0);
    }
  }

  /** @internal */
  protected didAliasModel(): void {
    this.onLinkedResponse();
    this.model!.state.forEach(function (value: Value, index: number) {
      this.listDidUpdate(index, value, Value.absent());
    }, this);
    this.onSyncedResponse();
  }

  override open(): this {
    const laneUri = this.ownLaneUri;
    if (laneUri.isEmpty()) {
      throw new Error("no lane");
    }
    let nodeUri = this.ownNodeUri;
    if (nodeUri.isEmpty()) {
      throw new Error("no node");
    }
    let hostUri = this.ownHostUri;
    if (hostUri.isEmpty()) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    let model = this.context.getDownlink(hostUri, nodeUri, laneUri);
    if (model !== void 0) {
      if (!(model instanceof ListDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
      (this as Mutable<this>).model = model as ListDownlinkModel;
      setTimeout(this.didAliasModel.bind(this));
    } else {
      model = new ListDownlinkModel(this.context, hostUri, nodeUri, laneUri, this.ownPrio,
                                    this.ownRate, this.ownBody, this.state0 ?? void 0);
      model.addDownlink(this);
      this.context.openDownlink(model);
      (this as Mutable<this>).model = model as ListDownlinkModel;
    }
    if (this.owner !== null) {
      this.owner.addDownlink(this);
    }
    return this;
  }
}
/** @public */
export interface ListDownlink<V, VU> {
  hostUri(): Uri;
  hostUri(hostUri: AnyUri): ListDownlink<V, VU>;

  nodeUri(): Uri;
  nodeUri(nodeUri: AnyUri): ListDownlink<V, VU>;

  laneUri(): Uri;
  laneUri(laneUri: AnyUri): ListDownlink<V, VU>;

  prio(): number;
  prio(prio: number): ListDownlink<V, VU>;

  rate(): number;
  rate(rate: number): ListDownlink<V, VU>;

  body(): Value;
  body(body: AnyValue): ListDownlink<V, VU>;

  keepLinked(): boolean;
  keepLinked(keepLinked: boolean): ListDownlink<V, VU>;

  keepSynced(): boolean;
  keepSynced(keepSynced: boolean): ListDownlink<V, VU>;
}
