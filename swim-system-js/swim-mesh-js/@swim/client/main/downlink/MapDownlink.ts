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

import {Cursor, Map, OrderedMap} from "@swim/util";
import {BTree} from "@swim/collections";
import {Value, Form, ValueCursor, ValueEntryCursor} from "@swim/structure";
import {Inlet, Outlet, KeyEffect, MapInlet, MapOutlet, KeyOutlet} from "@swim/streamlet";
import {FilterFieldsFunction, FilterFieldsCombinator} from "@swim/streamlet";
import {MapValueFunction, MapValueCombinator} from "@swim/streamlet";
import {MapFieldValuesFunction, MapFieldValuesCombinator} from "@swim/streamlet";
import {ReduceFieldsCombinator} from "@swim/streamlet";
import {WatchValueFunction, WatchValueCombinator} from "@swim/streamlet";
import {WatchFieldsFunction, WatchFieldsCombinator} from "@swim/streamlet";
import {Uri} from "@swim/uri";
import {DownlinkContext} from "./DownlinkContext";
import {DownlinkOwner} from "./DownlinkOwner";
import {DownlinkType, DownlinkObserver, DownlinkInit, DownlinkFlags, Downlink} from "./Downlink";
import {MapDownlinkModel} from "./MapDownlinkModel";

export type MapDownlinkWillUpdate<K extends KU, V extends VU, KU = K, VU = V> = (key: K, newValue: V, downlink: MapDownlink<K, V, KU, VU>) => V | void;
export type MapDownlinkDidUpdate<K extends KU, V extends VU, KU = K, VU = V> = (key: K, newValue: V, oldValue: V, downlink: MapDownlink<K, V, KU, VU>) => void;
export type MapDownlinkWillRemove<K extends KU, V extends VU, KU = K, VU = V> = (key: K, downlink: MapDownlink<K, V, KU, VU>) => void;
export type MapDownlinkDidRemove<K extends KU, V extends VU, KU = K, VU = V> = (key: K, oldValue: V, downlink: MapDownlink<K, V, KU, VU>) => void;
export type MapDownlinkWillDrop<K extends KU, V extends VU, KU = K, VU = V> = (lower: number, downlink: MapDownlink<K, V, KU, VU>) => void;
export type MapDownlinkDidDrop<K extends KU, V extends VU, KU = K, VU = V> = (lower: number, downlink: MapDownlink<K, V, KU, VU>) => void;
export type MapDownlinkWillTake<K extends KU, V extends VU, KU = K, VU = V> = (upper: number, downlink: MapDownlink<K, V, KU, VU>) => void;
export type MapDownlinkDidTake<K extends KU, V extends VU, KU = K, VU = V> = (upper: number, downlink: MapDownlink<K, V, KU, VU>) => void;
export type MapDownlinkWillClear<K extends KU, V extends VU, KU = K, VU = V> = (downlink: MapDownlink<K, V, KU, VU>) => void;
export type MapDownlinkDidClear<K extends KU, V extends VU, KU = K, VU = V> = (downlink: MapDownlink<K, V, KU, VU>) => void;

export interface MapDownlinkObserver<K extends KU, V extends VU, KU = K, VU = V> extends DownlinkObserver {
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

export interface MapDownlinkInit<K extends KU, V extends VU, KU = K, VU = V> extends MapDownlinkObserver<K, V, KU, VU>, DownlinkInit {
  keyForm?: Form<K, KU>;
  valueForm?: Form<V, VU>;
}

export class MapDownlink<K extends KU, V extends VU, KU = K, VU = V> extends Downlink implements OrderedMap<K, V>, MapInlet<K, V, Map<K, V>>, MapOutlet<K, V, MapDownlink<K, V, KU, VU>> {
  /** @hidden */
  _observers: ReadonlyArray<MapDownlinkObserver<K, V, KU, VU>> | null;
  /** @hidden */
  _model: MapDownlinkModel | null;
  /** @hidden */
  _keyForm: Form<K, KU>;
  /** @hidden */
  _valueForm: Form<V, VU>;
  /** @hidden */
  _state0: BTree<Value, Value> | undefined;
  /** @hidden */
  protected _input: MapOutlet<K, V, Map<K, V>> | null;
  /** @hidden */
  protected _effects: BTree<K, KeyEffect>;
  /** @hidden */
  protected _outlets: BTree<K, KeyOutlet<K, V>>; // TODO: unify with observers
  /** @hidden */
  protected _outputs: ReadonlyArray<Inlet<MapDownlink<K, V>>> | null;
  /** @hidden */
  protected _version: number;

  /** @hidden */
  constructor(context: DownlinkContext, owner?: DownlinkOwner, init?: MapDownlinkInit<K, V, KU, VU>,
              hostUri?: Uri, nodeUri?: Uri, laneUri?: Uri, prio?: number, rate?: number,
              body?: Value, flags: number = DownlinkFlags.KeepLinkedSynced,
              observers?: ReadonlyArray<MapDownlinkObserver<K, V, KU, VU>> | MapDownlinkObserver<K, V, KU, VU> | null,
              keyForm?: Form<K, KU>, valueForm?: Form<V, VU>, state0?: BTree<Value, Value>) {
    super(context, owner, init, hostUri, nodeUri, laneUri, prio, rate, body, flags, observers);
    if (init) {
      const observer = this._observers![this._observers!.length - 1];
      observer.willUpdate = init.willUpdate || observer.willUpdate;
      observer.didUpdate = init.didUpdate || observer.didUpdate;
      observer.willRemove = init.willRemove || observer.willRemove;
      observer.didRemove = init.didRemove || observer.didRemove;
      observer.willDrop = init.willDrop || observer.willDrop;
      observer.didDrop = init.didDrop || observer.didDrop;
      observer.willTake = init.willTake || observer.willTake;
      observer.didTake = init.didTake || observer.didTake;
      observer.willClear = init.willClear || observer.willClear;
      observer.didClear = init.didClear || observer.didClear;
      keyForm = init.keyForm ? init.keyForm : keyForm;
      valueForm = init.valueForm ? init.valueForm : valueForm;
    }
    this._keyForm = keyForm || Form.forValue() as any;
    this._valueForm = valueForm || Form.forValue() as any;
    this._state0 = state0;
    this._input = null;
    this._effects = new BTree();
    this._outlets = new BTree();
    this._outputs = null;
    this._version = -1;
  }

  protected copy(context: DownlinkContext, owner: DownlinkOwner | undefined,
                 hostUri: Uri, nodeUri: Uri, laneUri: Uri, prio: number, rate: number,
                 body: Value, flags: number, observers: ReadonlyArray<MapDownlinkObserver<K, V, KU, VU>> | null,
                 keyForm?: Form<K, KU>, valueForm?: Form<V, VU>, state0?: BTree<Value, Value>): this {
    if (arguments.length === 10) {
      state0 = this._state0;
      keyForm = this._keyForm;
      valueForm = this._valueForm;
    }
    return new MapDownlink(context, owner, void 0, hostUri, nodeUri, laneUri,
                           prio, rate, body, flags, observers, keyForm, valueForm,
                           state0) as this;
  }

  type(): DownlinkType {
    return "map";
  }

  keyForm(): Form<K, KU>;
  keyForm<K2 extends K2U, K2U = K2>(keyForm: Form<K2, K2U>): MapDownlink<K2, V, K2U, VU>;
  keyForm<K2 extends K2U, K2U = K2>(keyForm?: Form<K2, K2U>): Form<K, KU> | MapDownlink<K2, V, K2U, VU> {
    if (keyForm === void 0) {
      return this._keyForm;
    } else {
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers,
                       keyForm as any, this._valueForm, this._state0) as any;
    }
  }

  valueForm(): Form<V, VU>;
  valueForm<V2 extends V2U, V2U = V2>(valueForm: Form<V2, V2U>): MapDownlink<K, V2, KU, V2U>;
  valueForm<V2 extends V2U, V2U = V2>(valueForm?: Form<V2, V2U>): Form<V, VU> | MapDownlink<K, V2, KU, V2U> {
    if (valueForm === void 0) {
      return this._valueForm;
    } else {
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers,
                       this._keyForm, valueForm as any, this._state0) as any;
    }
  }

  get size(): number {
    return this._model!.size;
  }

  isEmpty(): boolean {
    return this._model!.isEmpty();
  }

  has(key: KU): boolean {
    const keyObject = this._keyForm.mold(key);
    return this._model!.has(keyObject);
  }

  get(): MapDownlink<K, V, KU, VU>;
  get(key: KU): V;
  get(key?: KU): MapDownlink<K, V, KU, VU> | V {
    if (key === void 0) {
      return this;
    } else {
      const keyObject = this._keyForm.mold(key);
      const value = this._model!.get(keyObject);
      return value.coerce(this._valueForm);
    }
  }

  getEntry(index: number): [K, V] | undefined {
    const entry = this._model!.getEntry(index);
    if (entry) {
      return [entry[0].coerce(this._keyForm), entry[1].coerce(this._valueForm)];
    }
    return void 0;
  }

  firstKey(): K | undefined {
    const key = this._model!._state.firstKey();
    if (key !== void 0) {
      const keyObject = this._keyForm.cast(key);
      if (keyObject !== void 0) {
        return keyObject;
      }
    }
    return this._keyForm.unit();
  }

  firstValue(): V | undefined {
    const value = this._model!._state.firstValue();
    if (value !== void 0) {
      const object = this._valueForm.cast(value);
      if (object !== void 0) {
        return object;
      }
    }
    return this._valueForm.unit();
  }

  firstEntry(): [K, V] | undefined {
    const entry = this._model!._state.firstEntry();
    if (entry !== void 0) {
      const keyObject: K = this._keyForm.cast(entry[0])!;
      const object: V = this._valueForm.cast(entry[1])!;
      return [keyObject, object];
    }
    return void 0;
  }

  lastKey(): K | undefined {
    const key = this._model!._state.lastKey();
    if (key !== void 0) {
      const keyObject = this._keyForm.cast(key);
      if (keyObject !== void 0) {
        return keyObject;
      }
    }
    return this._keyForm.unit();
  }

  lastValue(): V | undefined {
    const value = this._model!._state.lastValue();
    if (value !== void 0) {
      const object = this._valueForm.cast(value);
      if (object !== void 0) {
        return object;
      }
    }
    return this._valueForm.unit();
  }

  lastEntry(): [K, V] | undefined {
    const entry = this._model!._state.lastEntry();
    if (entry !== void 0) {
      const keyObject: K = this._keyForm.cast(entry[0])!;
      const object: V = this._valueForm.cast(entry[1])!;
      return [keyObject, object];
    }
    return void 0;
  }

  nextKey(keyObject: K): K | undefined {
    const key = this._keyForm.mold(keyObject);
    const nextKey = this._model!._state.nextKey(key);
    if (nextKey !== void 0) {
      const nextKeyObject = this._keyForm.cast(nextKey);
      if (nextKeyObject !== void 0) {
        return nextKeyObject;
      }
    }
    return this._keyForm.unit();
  }

  nextValue(keyObject: K): V | undefined {
    const key = this._keyForm.mold(keyObject);
    const nextValue = this._model!._state.nextValue(key);
    if (nextValue !== void 0) {
      const nextObject = this._valueForm.cast(nextValue);
      if (nextObject !== void 0) {
        return nextObject;
      }
    }
    return this._valueForm.unit();
  }

  nextEntry(keyObject: K): [K, V] | undefined {
    const key = this._keyForm.mold(keyObject);
    const entry = this._model!._state.nextEntry(key);
    if (entry !== void 0) {
      const keyObject: K = this._keyForm.cast(entry[0])!;
      const object: V = this._valueForm.cast(entry[1])!;
      return [keyObject, object];
    }
    return void 0;
  }

  previousKey(keyObject: K): K | undefined {
    const key = this._keyForm.mold(keyObject);
    const previousKey = this._model!._state.previousKey(key);
    if (previousKey !== void 0) {
      const previousKeyObject = this._keyForm.cast(previousKey);
      if (previousKeyObject !== void 0) {
        return previousKeyObject;
      }
    }
    return this._keyForm.unit();
  }

  previousValue(keyObject: K): V | undefined {
    const key = this._keyForm.mold(keyObject);
    const previousValue = this._model!._state.previousValue(key);
    if (previousValue !== void 0) {
      const previousObject = this._valueForm.cast(previousValue);
      if (previousObject !== void 0) {
        return previousObject;
      }
    }
    return this._valueForm.unit();
  }

  previousEntry(keyObject: K): [K, V] | undefined {
    const key = this._keyForm.mold(keyObject);
    const entry = this._model!._state.previousEntry(key);
    if (entry !== void 0) {
      const keyObject: K = this._keyForm.cast(entry[0])!;
      const object: V = this._valueForm.cast(entry[1])!;
      return [keyObject, object];
    }
    return void 0;
  }

  set(key: KU, newValue: VU): this {
    const keyObject = this._keyForm.mold(key);
    const newObject = this._valueForm.mold(newValue);
    this._model!.set(keyObject, newObject);
    return this;
  }

  delete(key: KU): boolean {
    const keyObject = this._keyForm.mold(key);
    return this._model!.delete(keyObject);
  }

  drop(lower: number): this {
    this._model!.drop(lower);
    return this;
  }

  take(upper: number): this {
    this._model!.take(upper);
    return this;
  }

  clear(): void {
    this._model!.clear();
  }

  forEach<T, S = unknown>(callback: (this: S,
                                     key: K,
                                     value: V,
                                     downlink: MapDownlink<K, V, KU, VU>) => T | void,
                          thisArg?: S): T | undefined {
    if (this._keyForm as any === Form.forValue() && this._valueForm as any === Form.forValue()) {
      return this._model!._state.forEach(callback as any, thisArg);
    } else {
      return this._model!._state.forEach(function (key: Value, value: Value): T | void {
        const keyObject = key.coerce(this._keyForm);
        const object = value.coerce(this._valueForm);
        return callback.call(thisArg, keyObject, object, this);
      }, this);
    }
  }

  keys(): Cursor<K> {
    const cursor = this._model!.keys();
    if (this._keyForm as any === Form.forValue()) {
      return cursor as any;
    } else {
      return new ValueCursor(cursor, this._keyForm);
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

  entries(): Cursor<[K, V]> {
    const cursor = this._model!.entries();
    if (this._keyForm as any === Form.forValue() && this._valueForm as any === Form.forValue()) {
      return cursor as any;
    } else {
      return new ValueEntryCursor(cursor, this._keyForm, this._valueForm);
    }
  }

  snapshot(): BTree<Value, Value> {
    return this._model!.snapshot();
  }

  setState(state: BTree<Value, Value>): void {
    this._model!.setState(state);
  }

  observe(observer: MapDownlinkObserver<K, V, KU, VU>): this {
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

  /** @hidden */
  mapWillUpdate(key: Value, newValue: Value): Value {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    let keyObject: K | undefined;
    let newObject: V | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willUpdate) {
        if (keyObject === void 0) {
          keyObject = key.coerce(this._keyForm);
        }
        if (newObject === void 0) {
          newObject = newValue.coerce(this._valueForm);
        }
        const newResult = observer.willUpdate(keyObject, newObject, this);
        if (newResult !== void 0) {
          newObject = newResult;
          newValue = this._valueForm.mold(newObject);
        }
      }
    }
    return newValue;
  }

  /** @hidden */
  mapDidUpdate(key: Value, newValue: Value, oldValue: Value): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    const keyObject = key.coerce(this._keyForm);
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
        observer.didUpdate(keyObject, newObject, oldObject, this);
      }
    }
    this.invalidateInputKey(keyObject, KeyEffect.Update);
    this.reconcileInput(0); // TODO: debounce and track version
  }

  /** @hidden */
  mapWillRemove(key: Value): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    let keyObject: K | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.willRemove) {
        if (keyObject === void 0) {
          keyObject = key.coerce(this._keyForm);
        }
        observer.willRemove(keyObject, this);
      }
    }
  }

  /** @hidden */
  mapDidRemove(key: Value, oldValue: Value): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    const keyObject = key.coerce(this._keyForm);
    let oldObject: V | undefined;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didRemove) {
        if (oldObject === void 0) {
          oldObject = oldValue.coerce(this._valueForm);
        }
        observer.didRemove(keyObject, oldObject, this);
      }
    }
    this.invalidateInputKey(keyObject, KeyEffect.Remove);
    this.reconcileInput(0); // TODO: debounce and track version
  }

  /** @hidden */
  mapWillDrop(lower: number): void {
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
  mapDidDrop(lower: number): void {
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
  mapWillTake(upper: number): void {
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
  mapDidTake(upper: number): void {
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
  mapWillClear(): void {
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
  mapDidClear(): void {
    const observers = this._observers;
    const n = observers ? observers.length : 0;
    for (let i = 0; i < n; i += 1) {
      const observer = observers![i];
      if (observer.didClear) {
        observer.didClear(this);
      }
    }
  }

  initialState(): BTree<Value, Value> | null;
  initialState(state0: BTree<Value, Value> | null): this;
  initialState(state0?: BTree<Value, Value> | null): BTree | null | this {
    if (state0 === void 0) {
      return this._state0 || null;
    } else {
      return this.copy(this._context, this._owner, this._hostUri, this._nodeUri, this._laneUri,
                       this._prio, this._rate, this._body, this._flags, this._observers,
                       this._keyForm, this._valueForm, state0 || void 0);
    }
  }

  /** @hidden */
  protected didAliasModel(): void {
    this.onLinkedResponse();
    this._model!._state.forEach(function (key: Value, value: Value): void {
      this.mapDidUpdate(key, value, Value.absent());
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
      if (!(model instanceof MapDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
      this._model = model as MapDownlinkModel;
      setTimeout(this.didAliasModel.bind(this));
    } else {
      model = new MapDownlinkModel(this._context, hostUri, nodeUri, laneUri, this._prio,
                                   this._rate, this._body, this._state0);
      model.addDownlink(this);
      this._context.openDownlink(model);
      this._model = model as MapDownlinkModel;
    }
    if (this._owner) {
      this._owner.addDownlink(this);
    }
    return this;
  }

  keyIterator(): Cursor<K> {
    return this.keys();
  }

  input(): MapOutlet<K, V, Map<K, V>> | null {
    return this._input;
  }

  bindInput(input: MapOutlet<K, V, Map<K, V>>): void {
    if (!MapOutlet.is(input)) {
      throw new TypeError("" + input);
    }
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = input;
    if (this._input !== null) {
      this._input.bindOutput(this);
    }
  }

  unbindInput(): void {
    if (this._input !== null) {
      this._input.unbindOutput(this);
    }
    this._input = null;
  }

  disconnectInputs(): void {
    const input = this._input;
    if (input !== null) {
      input.unbindOutput(this);
      this._input = null;
      input.disconnectInputs();
    }
  }

  outlet(key: K): Outlet<V> {
    let outlet = this._outlets.get(key);
    if (outlet === void 0) {
      outlet = new KeyOutlet<K, V>(this, key);
      this._outlets = this._outlets.updated(key, outlet);
    }
    return outlet;
  }

  outputIterator(): Cursor<Inlet<MapDownlink<K, V>>> {
    return this._outputs !== null ? Cursor.array(this._outputs) : Cursor.empty();
  }

  bindOutput(output: Inlet<MapDownlink<K, V>>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    const newOutputs = new Array<Inlet<MapDownlink<K, V>>>(n + 1);
    for (let i = 0; i < n; i += 1) {
      newOutputs[i] = oldOutputs![i];
    }
    newOutputs[n] = output;
    this._outputs = newOutputs;
  }

  unbindOutput(output: Inlet<MapDownlink<K, V>>): void {
    const oldOutputs = this._outputs;
    const n = oldOutputs !== null ? oldOutputs.length : 0;
    for (let i = 0; i < n; i += 1) {
      if (oldOutputs![i] === output) {
        if (n > 1) {
          const newOutputs = new Array<Inlet<MapDownlink<K, V>>>(n - 1);
          for (let j = 0; j < i; j += 1) {
            newOutputs[j] = oldOutputs![j];
          }
          for (let j = i; j < n - 1; j += 1) {
            newOutputs[j] = oldOutputs![j + 1];
          }
          this._outputs = newOutputs;
        } else {
          this._outputs = null;
        }
        break;
      }
    }
  }

  unbindOutputs(): void {
    const oldOutputs = this._outputs;
    if (oldOutputs !== null) {
      this._outputs = null;
      for (let i = 0, n = oldOutputs.length; i < n; i += 1) {
        oldOutputs[i].unbindInput();
      }
    }
  }

  disconnectOutputs(): void {
    const outlets = this._outlets;
    if (outlets.isEmpty()) {
      this._outlets = new BTree();
      outlets.forEach(function (key: K, keyOutlet: KeyOutlet<K, V>) {
        keyOutlet.disconnectOutputs();
      }, this);
    }
    const outputs = this._outputs;
    if (outputs !== null) {
      this._outputs = null;
      for (let i = 0, n = outputs.length; i < n; i += 1) {
        const output = outputs[i];
        output.unbindInput();
        output.disconnectOutputs();
      }
    }
  }

  invalidateOutputKey(key: K, effect: KeyEffect): void {
    this.invalidateKey(key, effect);
  }

  invalidateInputKey(key: K, effect: KeyEffect): void {
    this.invalidateKey(key, effect);
  }

  invalidateKey(key: K, effect: KeyEffect): void {
    const oldEffects = this._effects;
    if (oldEffects.get(key) !== effect) {
      this.willInvalidateKey(key, effect);
      this._effects = oldEffects.updated(key, effect);
      this._version = -1;
      this.onInvalidateKey(key, effect);
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        const output = this._outputs![i];
        if (MapInlet.is(output)) {
          output.invalidateOutputKey(key, effect);
        } else {
          output.invalidateOutput();
        }
      }
      const outlet = this._outlets.get(key);
      if (outlet !== void 0) {
        outlet.invalidateInput();
      }
      this.didInvalidateKey(key, effect);
    }
  }

  invalidateOutput(): void {
    this.invalidate();
  }

  invalidateInput(): void {
    this.invalidate();
  }

  invalidate(): void {
    if (this._version >= 0) {
      this.willInvalidate();
      this._version = -1;
      this.onInvalidate();
      const n = this._outputs !== null ? this._outputs.length : 0;
      for (let i = 0; i < n; i += 1) {
        this._outputs![i].invalidateOutput();
      }
      this._outlets.forEach(function (key: K, outlet: KeyOutlet<K, V>): void {
        outlet.invalidateInput();
      }, this);
      this.didInvalidate();
    }
  }

  reconcileOutputKey(key: K, version: number): void {
    this.reconcileKey(key, version);
  }

  reconcileInputKey(key: K, version: number): void {
    this.reconcileKey(key, version);
  }

  reconcileKey(key: K, version: number): void {
    if (this._version < 0) {
      const oldEffects = this._effects;
      const effect = oldEffects.get(key);
      if (effect !== void 0) {
        this.willReconcileKey(key, effect, version);
        this._effects = oldEffects.removed(key);
        if (this._input !== null) {
          this._input.reconcileInputKey(key, version);
        }
        this.onReconcileKey(key, effect, version);
        for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
          const output = this._outputs![i];
          if (MapInlet.is(output)) {
            output.reconcileOutputKey(key, version);
          }
        }
        const outlet = this._outlets.get(key);
        if (outlet !== void 0) {
          outlet.reconcileInput(version);
        }
        this.didReconcileKey(key, effect, version);
      }
    }
  }

  reconcileOutput(version: number): void {
    this.reconcile(version);
  }

  reconcileInput(version: number): void {
    this.reconcile(version);
  }

  reconcile(version: number): void {
    if (this._version < 0) {
      this.willReconcile(version);
      this._effects.forEach(function (key: K): void {
        this.reconcileKey(key, version);
      }, this);
      this._version = version;
      this.onReconcile(version);
      for (let i = 0, n = this._outputs !== null ? this._outputs.length : 0; i < n; i += 1) {
        this._outputs![i].reconcileOutput(version);
      }
      this.didReconcile(version);
    }
  }

  protected willInvalidateKey(key: K, effect: KeyEffect): void {
    // stub
  }

  protected onInvalidateKey(key: K, effect: KeyEffect): void {
    // stub
  }

  protected didInvalidateKey(key: K, effect: KeyEffect): void {
    // stub
  }

  protected willInvalidate(): void {
    // stub
  }

  protected onInvalidate(): void {
    // stub
  }

  protected didInvalidate(): void {
    // stub
  }

  protected willReconcileKey(key: K, effect: KeyEffect, version: number): void {
    // stub
  }

  protected onReconcileKey(key: K, effect: KeyEffect, version: number): void {
    if (effect === KeyEffect.Update) {
      if (this._input !== null) {
        const value = this._input.get(key);
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

  protected didReconcileKey(key: K, effect: KeyEffect, version: number): void {
    // stub
  }

  protected willReconcile(version: number): void {
    // stub
  }

  protected onReconcile(version: number): void {
    // stub
  }

  protected didReconcile(version: number): void {
    // stub
  }

  memoize(): MapOutlet<K, V, MapDownlink<K, V, KU, VU>> {
    return this;
  }

  filter(func: FilterFieldsFunction<K, V>): MapOutlet<K, V, Map<K, V>> {
    const combinator = new FilterFieldsCombinator<K, V, MapDownlink<K, V, KU, VU>>(func);
    combinator.bindInput(this);
    return combinator;
  }

  map<O2>(func: MapValueFunction<MapDownlink<K, V, KU, VU>, O2>): Outlet<O2>;
  map<V2>(func: MapFieldValuesFunction<K, V, V2>): MapOutlet<K, V2, Map<K, V2>>;
  map<V2>(func: MapValueFunction<MapDownlink<K, V, KU, VU>, V2> | MapFieldValuesFunction<K, V, V2>): Outlet<V2> | MapOutlet<K, V2, Map<K, V2>> {
    if (func.length === 1) {
      const combinator = new MapValueCombinator<MapDownlink<K, V, KU, VU>, V2>(func as MapValueFunction<MapDownlink<K, V, KU, VU>, V2>);
      combinator.bindInput(this);
      return combinator;
    } else {
      const combinator = new MapFieldValuesCombinator<K, V, V2, MapDownlink<K, V, KU, VU>>(func as MapFieldValuesFunction<K, V, V2>);
      combinator.bindInput(this);
      return combinator;
    }
  }

  reduce<U>(identity: U, accumulator: (result: U, element: V) => U, combiner: (result: U, result2: U) => U): Outlet<U> {
    const combinator = new ReduceFieldsCombinator<K, V, MapDownlink<K, V, KU, VU>, U>(identity, accumulator, combiner);
    combinator.bindInput(this);
    return combinator;
  }

  watch(func: WatchValueFunction<MapDownlink<K, V, KU, VU>>): this;
  watch(func: WatchFieldsFunction<K, V>): this;
  watch(func: WatchValueFunction<MapDownlink<K, V, KU, VU>> | WatchFieldsFunction<K, V>): this {
    if (func.length === 1) {
      const combinator = new WatchValueCombinator<MapDownlink<K, V, KU, VU>>(func as WatchValueFunction<MapDownlink<K, V, KU, VU>>);
      combinator.bindInput(this);
      return this;
    } else {
      const combinator = new WatchFieldsCombinator<K, V, MapDownlink<K, V, KU, VU>>(func as WatchFieldsFunction<K, V>);
      combinator.bindInput(this);
      return this;
    }
  }
}
