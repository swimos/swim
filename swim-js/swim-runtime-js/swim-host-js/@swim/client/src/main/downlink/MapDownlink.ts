// Copyright 2015-2021 Swim Inc.
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

import {Mutable, Arrays, Cursor, Map, OrderedMap} from "@swim/util";
import {BTree} from "@swim/collections";
import {AnyValue, Value, Form, ValueCursor, ValueEntryCursor} from "@swim/structure";
import {Inlet, Outlet, KeyEffect, MapInlet, MapOutlet, MapOutletCombinators, KeyOutlet} from "@swim/streamlet";
import type {AnyUri, Uri} from "@swim/uri";
import type {DownlinkContext} from "./DownlinkContext";
import type {DownlinkOwner} from "./DownlinkOwner";
import {DownlinkType, DownlinkObserver, DownlinkInit, DownlinkFlags, Downlink} from "./Downlink";
import {MapDownlinkModel} from "./MapDownlinkModel";

/** @public */
export type MapDownlinkWillUpdate<K, V, KU = never, VU = never> = (key: K, newValue: V, downlink: MapDownlink<K, V, KU, VU>) => V | void;
/** @public */
export type MapDownlinkDidUpdate<K, V, KU = never, VU = never> = (key: K, newValue: V, oldValue: V, downlink: MapDownlink<K, V, KU, VU>) => void;
/** @public */
export type MapDownlinkWillRemove<K, V, KU = never, VU = never> = (key: K, downlink: MapDownlink<K, V, KU, VU>) => void;
/** @public */
export type MapDownlinkDidRemove<K, V, KU = never, VU = never> = (key: K, oldValue: V, downlink: MapDownlink<K, V, KU, VU>) => void;
/** @public */
export type MapDownlinkWillDrop<K, V, KU = never, VU = never> = (lower: number, downlink: MapDownlink<K, V, KU, VU>) => void;
/** @public */
export type MapDownlinkDidDrop<K, V, KU = never, VU = never> = (lower: number, downlink: MapDownlink<K, V, KU, VU>) => void;
/** @public */
export type MapDownlinkWillTake<K, V, KU = never, VU = never> = (upper: number, downlink: MapDownlink<K, V, KU, VU>) => void;
/** @public */
export type MapDownlinkDidTake<K, V, KU = never, VU = never> = (upper: number, downlink: MapDownlink<K, V, KU, VU>) => void;
/** @public */
export type MapDownlinkWillClear<K, V, KU = never, VU = never> = (downlink: MapDownlink<K, V, KU, VU>) => void;
/** @public */
export type MapDownlinkDidClear<K, V, KU = never, VU = never> = (downlink: MapDownlink<K, V, KU, VU>) => void;

/** @public */
export interface MapDownlinkObserver<K, V, KU = never, VU = never> extends DownlinkObserver {
  willUpdate?: MapDownlinkWillUpdate<K, V, KU, VU>;
  didUpdate?: MapDownlinkDidUpdate<K, V, KU, VU>;
  willRemove?: MapDownlinkWillRemove<K, V, KU, VU>;
  didRemove?: MapDownlinkDidRemove<K, V, KU, VU>;
  willDrop?: MapDownlinkWillDrop<K, V, KU, VU>;
  didDrop?: MapDownlinkDidDrop<K, V, KU, VU>;
  willTake?: MapDownlinkWillTake<K, V, KU, VU>;
  didTake?: MapDownlinkDidTake<K, V, KU, VU>;
  willClear?: MapDownlinkWillClear<K, V, KU, VU>;
  didClear?: MapDownlinkDidClear<K, V, KU, VU>;
}

/** @public */
export interface MapDownlinkInit<K, V, KU = never, VU = never> extends MapDownlinkObserver<K, V, KU, VU>, DownlinkInit {
  keyForm?: Form<K, KU>;
  valueForm?: Form<V, VU>;
}

/** @public */
export class MapDownlink<K, V, KU = never, VU = never> extends Downlink implements OrderedMap<K, V>, MapInlet<K, V, Map<K, V>>, MapOutlet<K, V, MapDownlink<K, V, KU, VU>> {
  /** @internal */
  constructor(context: DownlinkContext, owner: DownlinkOwner | null, init?: MapDownlinkInit<K, V, KU, VU>,
              hostUri?: Uri, nodeUri?: Uri, laneUri?: Uri, prio?: number, rate?: number,
              body?: Value, flags: number = DownlinkFlags.KeepLinkedSynced,
              observers?: ReadonlyArray<MapDownlinkObserver<K, V, KU, VU>> | MapDownlinkObserver<K, V, KU, VU>,
              keyForm?: Form<K, KU>, valueForm?: Form<V, VU>, state0: BTree<Value, Value> | null = null) {
    super(context, owner, init, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
    if (init !== void 0) {
      const observer = this.observers[this.observers.length - 1]!;
      observer.willUpdate = init.willUpdate ?? observer.willUpdate;
      observer.didUpdate = init.didUpdate ?? observer.didUpdate;
      observer.willRemove = init.willRemove ?? observer.willRemove;
      observer.didRemove = init.didRemove ?? observer.didRemove;
      observer.willDrop = init.willDrop ?? observer.willDrop;
      observer.didDrop = init.didDrop ?? observer.didDrop;
      observer.willTake = init.willTake ?? observer.willTake;
      observer.didTake = init.didTake ?? observer.didTake;
      observer.willClear = init.willClear ?? observer.willClear;
      observer.didClear = init.didClear ?? observer.didClear;
      keyForm = init.keyForm !== void 0 ? init.keyForm : keyForm;
      valueForm = init.valueForm !== void 0 ? init.valueForm : valueForm;
    }
    this.ownKeyForm = keyForm !== void 0 ? keyForm : Form.forValue() as unknown as Form<K, KU>;
    this.ownValueForm = valueForm !== void 0 ? valueForm : Form.forValue() as unknown as Form<V, VU>;
    this.state0 = state0;
    this.input = null;
    this.effects = new BTree();
    this.outlets = new BTree();
    this.outputs = Arrays.empty;
    this.version = -1;
  }

  /** @internal */
  override readonly model!: MapDownlinkModel | null;

  /** @internal */
  override readonly observers!: ReadonlyArray<MapDownlinkObserver<K, V, KU, VU>>;

  /** @internal */
  readonly ownKeyForm: Form<K, KU>;

  /** @internal */
  readonly ownValueForm: Form<V, VU>;

  /** @internal */
  readonly state0: BTree<Value, Value> | null;

  override get type(): DownlinkType {
    return "map";
  }

  /** @internal */
  protected override copy<K, V, KU, VU>(context: DownlinkContext, owner: DownlinkOwner | null,
                                        hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                                        body: Value, flags: number, observers: ReadonlyArray<MapDownlinkObserver<K, V, KU, VU>>,
                                        keyForm?: Form<K, KU>, valueForm?: Form<V, VU>, state0?: BTree<Value, Value> | null): MapDownlink<K, V, KU, VU> {
    if (arguments.length === 10) {
      state0 = this.state0;
      keyForm = this.ownKeyForm as unknown as Form<K, KU>;
      valueForm = this.ownValueForm as unknown as Form<V, VU>;
    }
    return new MapDownlink(context, owner, void 0, hostUri, nodeUri, laneUri,
                           prio, rate, body, flags, observers, keyForm, valueForm, state0);
  }

  keyForm(): Form<K, KU>;
  keyForm<K2, K2U = never>(keyForm: Form<K2, K2U>): MapDownlink<K2, V, K2U, VU>;
  keyForm<K2, K2U = never>(keyForm?: Form<K2, K2U>): Form<K, KU> | MapDownlink<K2, V, K2U, VU> {
    if (keyForm === void 0) {
      return this.ownKeyForm;
    } else {
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers as any,
                       keyForm, this.ownValueForm, this.state0);
    }
  }

  valueForm(): Form<V, VU>;
  valueForm<V2, V2U = never>(valueForm: Form<V2, V2U>): MapDownlink<K, V2, KU, V2U>;
  valueForm<V2, V2U = never>(valueForm?: Form<V2, V2U>): Form<V, VU> | MapDownlink<K, V2, KU, V2U> {
    if (valueForm === void 0) {
      return this.ownValueForm;
    } else {
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers as any,
                       this.ownKeyForm, valueForm, this.state0);
    }
  }

  get size(): number {
    return this.model!.size;
  }

  isEmpty(): boolean {
    return this.model!.isEmpty();
  }

  has(key: K | KU): boolean {
    const keyObject = this.ownKeyForm.mold(key);
    return this.model!.has(keyObject);
  }

  get(): MapDownlink<K, V, KU, VU>;
  get(key: K | KU): V;
  get(key?: K | KU): MapDownlink<K, V, KU, VU> | V {
    if (key === void 0) {
      return this;
    } else {
      const keyObject = this.ownKeyForm.mold(key);
      const value = this.model!.get(keyObject);
      return value.coerce(this.ownValueForm);
    }
  }

  getEntry(index: number): [K, V] | undefined {
    const entry = this.model!.getEntry(index);
    if (entry !== void 0) {
      return [entry[0].coerce(this.ownKeyForm), entry[1].coerce(this.ownValueForm)];
    }
    return void 0;
  }

  firstKey(): K | undefined {
    const key = this.model!.state.firstKey();
    if (key !== void 0) {
      const keyObject = this.ownKeyForm.cast(key);
      if (keyObject !== void 0) {
        return keyObject;
      }
    }
    return this.ownKeyForm.unit;
  }

  firstValue(): V | undefined {
    const value = this.model!.state.firstValue();
    if (value !== void 0) {
      const object = this.ownValueForm.cast(value);
      if (object !== void 0) {
        return object;
      }
    }
    return this.ownValueForm.unit;
  }

  firstEntry(): [K, V] | undefined {
    const entry = this.model!.state.firstEntry();
    if (entry !== void 0) {
      const keyObject: K = this.ownKeyForm.cast(entry[0])!;
      const object: V = this.ownValueForm.cast(entry[1])!;
      return [keyObject, object];
    }
    return void 0;
  }

  lastKey(): K | undefined {
    const key = this.model!.state.lastKey();
    if (key !== void 0) {
      const keyObject = this.ownKeyForm.cast(key);
      if (keyObject !== void 0) {
        return keyObject;
      }
    }
    return this.ownKeyForm.unit;
  }

  lastValue(): V | undefined {
    const value = this.model!.state.lastValue();
    if (value !== void 0) {
      const object = this.ownValueForm.cast(value);
      if (object !== void 0) {
        return object;
      }
    }
    return this.ownValueForm.unit;
  }

  lastEntry(): [K, V] | undefined {
    const entry = this.model!.state.lastEntry();
    if (entry !== void 0) {
      const keyObject: K = this.ownKeyForm.cast(entry[0])!;
      const object: V = this.ownValueForm.cast(entry[1])!;
      return [keyObject, object];
    }
    return void 0;
  }

  nextKey(keyObject: K): K | undefined {
    const key = this.ownKeyForm.mold(keyObject);
    const nextKey = this.model!.state.nextKey(key);
    if (nextKey !== void 0) {
      const nextKeyObject = this.ownKeyForm.cast(nextKey);
      if (nextKeyObject !== void 0) {
        return nextKeyObject;
      }
    }
    return this.ownKeyForm.unit;
  }

  nextValue(keyObject: K): V | undefined {
    const key = this.ownKeyForm.mold(keyObject);
    const nextValue = this.model!.state.nextValue(key);
    if (nextValue !== void 0) {
      const nextObject = this.ownValueForm.cast(nextValue);
      if (nextObject !== void 0) {
        return nextObject;
      }
    }
    return this.ownValueForm.unit;
  }

  nextEntry(keyObject: K): [K, V] | undefined {
    const key = this.ownKeyForm.mold(keyObject);
    const entry = this.model!.state.nextEntry(key);
    if (entry !== void 0) {
      const keyObject: K = this.ownKeyForm.cast(entry[0])!;
      const object: V = this.ownValueForm.cast(entry[1])!;
      return [keyObject, object];
    }
    return void 0;
  }

  previousKey(keyObject: K): K | undefined {
    const key = this.ownKeyForm.mold(keyObject);
    const previousKey = this.model!.state.previousKey(key);
    if (previousKey !== void 0) {
      const previousKeyObject = this.ownKeyForm.cast(previousKey);
      if (previousKeyObject !== void 0) {
        return previousKeyObject;
      }
    }
    return this.ownKeyForm.unit;
  }

  previousValue(keyObject: K): V | undefined {
    const key = this.ownKeyForm.mold(keyObject);
    const previousValue = this.model!.state.previousValue(key);
    if (previousValue !== void 0) {
      const previousObject = this.ownValueForm.cast(previousValue);
      if (previousObject !== void 0) {
        return previousObject;
      }
    }
    return this.ownValueForm.unit;
  }

  previousEntry(keyObject: K): [K, V] | undefined {
    const key = this.ownKeyForm.mold(keyObject);
    const entry = this.model!.state.previousEntry(key);
    if (entry !== void 0) {
      const keyObject: K = this.ownKeyForm.cast(entry[0])!;
      const object: V = this.ownValueForm.cast(entry[1])!;
      return [keyObject, object];
    }
    return void 0;
  }

  set(key: K | KU, newValue: V | VU): this {
    const keyObject = this.ownKeyForm.mold(key);
    const newObject = this.ownValueForm.mold(newValue);
    this.model!.set(keyObject, newObject);
    return this;
  }

  delete(key: K | KU): boolean {
    const keyObject = this.ownKeyForm.mold(key);
    return this.model!.delete(keyObject);
  }

  drop(lower: number): this {
    this.model!.drop(lower);
    return this;
  }

  take(upper: number): this {
    this.model!.take(upper);
    return this;
  }

  clear(): void {
    this.model!.clear();
  }

  forEach<T>(callback: (key: K, value: V) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, key: K, value: V) => T | void,
                thisArg: S): T | undefined;
  forEach<T, S>(callback: (this: S | undefined, key: K, value: V) => T | void,
                thisArg?: S): T | undefined {
    if (this.ownKeyForm as unknown === Form.forValue() && this.ownValueForm as unknown === Form.forValue()) {
      return this.model!.state.forEach(callback as any, thisArg);
    } else {
      return this.model!.state.forEach(function (key: Value, value: Value): T | void {
        const keyObject = key.coerce(this.ownKeyForm);
        const object = value.coerce(this.ownValueForm);
        return callback.call(thisArg, keyObject, object);
      }, this);
    }
  }

  keys(): Cursor<K> {
    const cursor = this.model!.keys();
    if (this.ownKeyForm as unknown === Form.forValue()) {
      return cursor as unknown as Cursor<K>;
    } else {
      return new ValueCursor(cursor, this.ownKeyForm);
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

  entries(): Cursor<[K, V]> {
    const cursor = this.model!.entries();
    if (this.ownKeyForm as unknown === Form.forValue() && this.ownValueForm as unknown === Form.forValue()) {
      return cursor as unknown as Cursor<[K, V]>;
    } else {
      return new ValueEntryCursor(cursor, this.ownKeyForm, this.ownValueForm);
    }
  }

  snapshot(): BTree<Value, Value> {
    return this.model!.snapshot();
  }

  setState(state: BTree<Value, Value>): void {
    this.model!.setState(state);
  }

  override observe(observer: MapDownlinkObserver<K, V, KU, VU>): this {
    return super.observe(observer);
  }

  willUpdate(willUpdate: MapDownlinkWillUpdate<K, V, KU, VU>): this {
    return this.observe({willUpdate});
  }

  didUpdate(didUpdate: MapDownlinkDidUpdate<K, V, KU, VU>): this {
    return this.observe({didUpdate});
  }

  willRemove(willRemove: MapDownlinkWillRemove<K, V, KU, VU>): this {
    return this.observe({willRemove});
  }

  didRemove(didRemove: MapDownlinkDidRemove<K, V, KU, VU>): this {
    return this.observe({didRemove});
  }

  willDrop(willDrop: MapDownlinkWillDrop<K, V, KU, VU>): this {
    return this.observe({willDrop});
  }

  didDrop(didDrop: MapDownlinkDidDrop<K, V, KU, VU>): this {
    return this.observe({didDrop});
  }

  willTake(willTake: MapDownlinkWillTake<K, V, KU, VU>): this {
    return this.observe({willTake});
  }

  didTake(didTake: MapDownlinkDidTake<K, V, KU, VU>): this {
    return this.observe({didTake});
  }

  willClear(willClear: MapDownlinkWillClear<K, V, KU, VU>): this {
    return this.observe({willClear});
  }

  didClear(didClear: MapDownlinkDidClear<K, V, KU, VU>): this {
    return this.observe({didClear});
  }

  /** @internal */
  mapWillUpdate(key: Value, newValue: Value): Value {
    let keyObject: K | undefined;
    let newObject: V | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willUpdate !== void 0) {
        if (keyObject === void 0) {
          keyObject = key.coerce(this.ownKeyForm);
        }
        if (newObject === void 0) {
          newObject = newValue.coerce(this.ownValueForm);
        }
        const newResult = observer.willUpdate(keyObject, newObject, this);
        if (newResult !== void 0) {
          newObject = newResult;
          newValue = this.ownValueForm.mold(newObject);
        }
      }
    }
    return newValue;
  }

  /** @internal */
  mapDidUpdate(key: Value, newValue: Value, oldValue: Value): void {
    const keyObject = key.coerce(this.ownKeyForm);
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
        observer.didUpdate(keyObject, newObject, oldObject, this);
      }
    }
    this.decohereInputKey(keyObject, KeyEffect.Update);
    this.recohereInput(0); // TODO: debounce and track version
  }

  /** @internal */
  mapWillRemove(key: Value): void {
    let keyObject: K | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willRemove !== void 0) {
        if (keyObject === void 0) {
          keyObject = key.coerce(this.ownKeyForm);
        }
        observer.willRemove(keyObject, this);
      }
    }
  }

  /** @internal */
  mapDidRemove(key: Value, oldValue: Value): void {
    const keyObject = key.coerce(this.ownKeyForm);
    let oldObject: V | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didRemove !== void 0) {
        if (oldObject === void 0) {
          oldObject = oldValue.coerce(this.ownValueForm);
        }
        observer.didRemove(keyObject, oldObject, this);
      }
    }
    this.decohereInputKey(keyObject, KeyEffect.Remove);
    this.recohereInput(0); // TODO: debounce and track version
  }

  /** @internal */
  mapWillDrop(lower: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willDrop !== void 0) {
        observer.willDrop(lower, this);
      }
    }
  }

  /** @internal */
  mapDidDrop(lower: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didDrop !== void 0) {
        observer.didDrop(lower, this);
      }
    }
  }

  /** @internal */
  mapWillTake(upper: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willTake !== void 0) {
        observer.willTake(upper, this);
      }
    }
  }

  /** @internal */
  mapDidTake(upper: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didTake !== void 0) {
        observer.didTake(upper, this);
      }
    }
  }

  /** @internal */
  mapWillClear(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willClear !== void 0) {
        observer.willClear(this);
      }
    }
  }

  /** @internal */
  mapDidClear(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didClear !== void 0) {
        observer.didClear(this);
      }
    }
  }

  initialState(): BTree<Value, Value> | null;
  initialState(state0: BTree<Value, Value> | null): MapDownlink<K, V, KU, VU>;
  initialState(state0?: BTree<Value, Value> | null): BTree | null | MapDownlink<K, V, KU, VU> {
    if (state0 === void 0) {
      return this.state0;
    } else {
      return this.copy(this.context, this.owner, this.ownHostUri, this.ownNodeUri, this.ownLaneUri,
                       this.ownPrio, this.ownRate, this.ownBody, this.flags, this.observers,
                       this.ownKeyForm, this.ownValueForm, state0);
    }
  }

  /** @internal */
  protected didAliasModel(): void {
    this.onLinkedResponse();
    this.model!.state.forEach(function (key: Value, value: Value): void {
      this.mapDidUpdate(key, value, Value.absent());
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
      if (!(model instanceof MapDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
      (this as Mutable<this>).model = model as MapDownlinkModel;
      setTimeout(this.didAliasModel.bind(this));
    } else {
      model = new MapDownlinkModel(this.context, hostUri, nodeUri, laneUri, this.ownPrio,
                                   this.ownRate, this.ownBody, this.state0 ?? void 0);
      model.addDownlink(this);
      this.context.openDownlink(model);
      (this as Mutable<this>).model = model as MapDownlinkModel;
    }
    if (this.owner !== null) {
      this.owner.addDownlink(this);
    }
    return this;
  }

  keyIterator(): Cursor<K> {
    return this.keys();
  }

  readonly input: MapOutlet<K, V, Map<K, V>> | null;

  /** @internal */
  readonly effects: BTree<K, KeyEffect>;

  /** @internal */
  readonly outlets: BTree<K, KeyOutlet<K, V>>;

  /** @internal */
  readonly outputs: ReadonlyArray<Inlet<MapDownlink<K, V, KU, VU>>>;

  /** @internal */
  readonly version: number;

  bindInput(newInput: MapOutlet<K, V, Map<K, V>>): void {
    if (!MapOutlet.is(newInput)) {
      throw new TypeError("" + newInput);
    }
    const oldInput = this.input;
    if (oldInput !== newInput) {
      if (oldInput !== null) {
        oldInput.unbindOutput(this);
      }
      (this as Mutable<this>).input = newInput;
      if (newInput !== null) {
        newInput.bindOutput(this);
      }
    }
  }

  unbindInput(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      (this as Mutable<this>).input = null;
    }
  }

  disconnectInputs(): void {
    const oldInput = this.input;
    if (oldInput !== null) {
      oldInput.unbindOutput(this);
      (this as Mutable<this>).input = null;
      oldInput.disconnectInputs();
    }
  }

  outlet(key: K): Outlet<V> {
    const oldOutlets = this.outlets;
    let outlet = oldOutlets.get(key);
    if (outlet === void 0) {
      outlet = new KeyOutlet<K, V>(this, key);
      (this as Mutable<this>).outlets = oldOutlets.updated(key, outlet);
    }
    return outlet;
  }

  outputIterator(): Cursor<Inlet<MapDownlink<K, V, KU, VU>>> {
    return Cursor.array(this.outputs);
  }

  bindOutput(output: Inlet<MapDownlink<K, V, KU, VU>>): void {
    (this as Mutable<this>).outputs = Arrays.inserted(output, this.outputs);
  }

  unbindOutput(output: Inlet<MapDownlink<K, V, KU, VU>>): void {
    (this as Mutable<this>).outputs = Arrays.removed(output, this.outputs);
  }

  unbindOutputs(): void {
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      (this as Mutable<this>).outlets = new BTree();
      oldOutlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, V>) {
        keyOutlet.unbindOutputs();
      }, this);
    }
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
    }
  }

  disconnectOutputs(): void {
    const oldOutlets = this.outlets;
    if (oldOutlets.isEmpty()) {
      (this as Mutable<this>).outlets = new BTree();
      oldOutlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, V>) {
        keyOutlet.disconnectOutputs();
      }, this);
    }
    const oldOutputs = this.outputs;
    (this as Mutable<this>).outputs = Arrays.empty;
    for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
      const output = oldOutputs[i]!;
      output.unbindInput();
      output.disconnectOutputs();
    }
  }

  decohereOutputKey(key: K, effect: KeyEffect): void {
    this.decohereKey(key, effect);
  }

  decohereInputKey(key: K, effect: KeyEffect): void {
    this.decohereKey(key, effect);
  }

  decohereKey(key: K, effect: KeyEffect): void {
    const oldEffects = this.effects;
    if (oldEffects.get(key) !== effect) {
      this.willDecohereKey(key, effect);
      (this as Mutable<this>).effects = oldEffects.updated(key, effect);
      (this as Mutable<this>).version = -1;
      this.onDecohereKey(key, effect);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        if (MapInlet.is(output)) {
          output.decohereOutputKey(key, effect);
        } else {
          output.decohereOutput();
        }
      }
      const outlet = this.outlets.get(key);
      if (outlet !== void 0) {
        outlet.decohereInput();
      }
      this.didDecohereKey(key, effect);
    }
  }

  decohereOutput(): void {
    this.decohere();
  }

  decohereInput(): void {
    this.decohere();
  }

  decohere(): void {
    if (this.version >= 0) {
      this.willDecohere();
      (this as Mutable<this>).version = -1;
      this.onDecohere();
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.decohereOutput();
      }
      this.outlets.forEach(function (key: K, outlet: KeyOutlet<K, V>): void {
        outlet.decohereInput();
      }, this);
      this.didDecohere();
    }
  }

  recohereOutputKey(key: K, version: number): void {
    this.recohereKey(key, version);
  }

  recohereInputKey(key: K, version: number): void {
    this.recohereKey(key, version);
  }

  recohereKey(key: K, version: number): void {
    if (this.version < 0) {
      const oldEffects = this.effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willRecohereKey(key, effect, version);
        (this as Mutable<this>).effects = oldEffects.removed(key);
        if (this.input !== null) {
          this.input.recohereInputKey(key, version);
        }
        this.onRecohereKey(key, effect, version);
        const outputs = this.outputs;
        for (let i = 0, n = outputs.length; i < n; i += 1) {
          const output = outputs[i];
          if (MapInlet.is(output)) {
            output.recohereOutputKey(key, version);
          }
        }
        const outlet = this.outlets.get(key);
        if (outlet !== void 0) {
          outlet.recohereInput(version);
        }
        this.didRecohereKey(key, effect, version);
      }
    }
  }

  recohereOutput(version: number): void {
    this.recohere(version);
  }

  recohereInput(version: number): void {
    this.recohere(version);
  }

  recohere(version: number): void {
    if (this.version < 0) {
      this.willRecohere(version);
      this.effects.forEach(function (key: K): void {
        this.recohereKey(key, version);
      }, this);
      (this as Mutable<this>).version = version;
      this.onRecohere(version);
      const outputs = this.outputs;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i]!;
        output.recohereOutput(version);
      }
      this.didRecohere(version);
    }
  }

  protected willDecohereKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected onDecohereKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected didDecohereKey(key: K, effect: KeyEffect): void {
    // hook
  }

  protected willDecohere(): void {
    // hook
  }

  protected onDecohere(): void {
    // hook
  }

  protected didDecohere(): void {
    // hook
  }

  protected willRecohereKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected onRecohereKey(key: K, effect: KeyEffect, version: number): void {
    if (effect === KeyEffect.Update) {
      const input = this.input;
      if (input !== null) {
        const value = input.get(key);
        if (value !== void 0) {
          this.set(key, value);
        } else {
          this.delete(key);
        }
      }
    } else if (effect === KeyEffect.Remove) {
      this.delete(key);
    }
  }

  protected didRecohereKey(key: K, effect: KeyEffect, version: number): void {
    // hook
  }

  protected willRecohere(version: number): void {
    // hook
  }

  protected onRecohere(version: number): void {
    // hook
  }

  protected didRecohere(version: number): void {
    // hook
  }
}
/** @public */
export interface MapDownlink<K, V, KU, VU> {
  hostUri(): Uri;
  hostUri(hostUri: AnyUri): MapDownlink<K, V, KU, VU>;

  nodeUri(): Uri;
  nodeUri(nodeUri: AnyUri): MapDownlink<K, V, KU, VU>;

  laneUri(): Uri;
  laneUri(laneUri: AnyUri): MapDownlink<K, V, KU, VU>;

  prio(): number;
  prio(prio: number): MapDownlink<K, V, KU, VU>;

  rate(): number;
  rate(rate: number): MapDownlink<K, V, KU, VU>;

  body(): Value;
  body(body: AnyValue): MapDownlink<K, V, KU, VU>;

  keepLinked(): boolean;
  keepLinked(keepLinked: boolean): MapDownlink<K, V, KU, VU>;

  keepSynced(): boolean;
  keepSynced(keepSynced: boolean): MapDownlink<K, V, KU, VU>;
}
/** @public */
export interface MapDownlink<K, V, KU, VU> extends MapOutletCombinators<K, V, MapDownlink<K, V, KU, VU>> {
}
MapOutletCombinators.define(MapDownlink.prototype);
