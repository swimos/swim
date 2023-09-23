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
import type {Class} from "@swim/util";
import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {Cursor} from "@swim/util";
import type {OrderedMap} from "@swim/util";
import type {Fastener} from "@swim/component";
import type {BTree} from "@swim/collections";
import {Value} from "@swim/structure";
import {Form} from "@swim/structure";
import {ValueCursor} from "@swim/structure";
import {ValueEntryCursor} from "@swim/structure";
import {WarpDownlinkContext} from "./WarpDownlinkContext";
import type {WarpDownlinkDescriptor} from "./WarpDownlink";
import type {WarpDownlinkClass} from "./WarpDownlink";
import type {WarpDownlinkObserver} from "./WarpDownlink";
import {WarpDownlink} from "./WarpDownlink";
import {MapDownlinkModel} from "./MapDownlinkModel";

/** @public */
export interface MapDownlinkDescriptor<R, K, V> extends WarpDownlinkDescriptor<R> {
  extends?: Proto<MapDownlink<any, any, any, any>> | boolean | null;
  keyForm?: Form<K, LikeType<K>>;
  valueForm?: Form<V, LikeType<V>>;
  /** @internal */
  stateInit?: BTree<Value, Value> | null;
}

/** @public */
export interface MapDownlinkClass<F extends MapDownlink<any, any, any, any> = MapDownlink<any, any, any, any>> extends WarpDownlinkClass<F> {
}

/** @public */
export interface MapDownlinkObserver<K = any, V = any, F extends MapDownlink<any, K, V> = MapDownlink<any, K, V>> extends WarpDownlinkObserver<F> {
  willUpdate?(key: K, newValue: V, downlink: F): V | void;

  didUpdate?(key: K, newValue: V, oldValue: V, downlink: F): void;

  willRemove?(key: K, downlink: F): void;

  didRemove?(key: K, oldValue: V, downlink: F): void;

  willDrop?(lower: number, downlink: F): void;

  didDrop?(lower: number, downlink: F): void;

  willTake?(upper: number, downlink: F): void;

  didTake?(upper: number, downlink: F): void;

  willClear?(downlink: F): void;

  didClear?(downlink: F): void;
}

/** @public */
export interface MapDownlink<R = any, K = Value, V = Value, I extends any[] = [Iterable<[K, V]>]> extends WarpDownlink<R, Iterable<[K, V]>, I>, OrderedMap<K, V> {
  /** @override */
  get descriptorType(): Proto<MapDownlinkDescriptor<R, K, V>>;

  /** @override */
  readonly observerType?: Class<MapDownlinkObserver<K, V>>;

  /** @internal @override */
  readonly model: MapDownlinkModel | null;

  /** @protected */
  initKeyForm(): Form<K, LikeType<K>>;

  keyForm: Form<K, LikeType<K>>;

  setKeyForm(keyForm: Form<K, LikeType<K>>): this;

  /** @protected */
  initValueForm(): Form<V, LikeType<V>>;

  readonly valueForm: Form<V, LikeType<V>>;

  setValueForm(valueForm: Form<V, LikeType<V>>): this;

  /** @internal */
  readonly stateInit?: BTree<Value, Value> | null; // optional prototype property

  /** @internal */
  initState(): BTree<Value, Value> | null;

  /** @internal */
  setState(state: BTree<Value, Value>): void;

  get size(): number;

  isEmpty(): boolean;

  has(key: K | LikeType<K>): boolean;

  /** @override */
  get(): Iterable<[K, V]>;
  get(key: K | LikeType<K>): V;

  getEntry(index: number): [K, V] | undefined;

  firstKey(): K | undefined;

  firstValue(): V | undefined;

  firstEntry(): [K, V] | undefined;

  lastKey(): K | undefined;

  lastValue(): V | undefined;

  lastEntry(): [K, V] | undefined;

  nextKey(keyObject: K): K | undefined;

  nextValue(keyObject: K): V | undefined;

  nextEntry(keyObject: K): [K, V] | undefined;

  previousKey(keyObject: K): K | undefined;

  previousValue(keyObject: K): V | undefined;

  previousEntry(keyObject: K): [K, V] | undefined;

  set(key: K | LikeType<K>, newValue: V | LikeType<V>): this;

  delete(key: K | LikeType<K>): boolean;

  drop(lower: number): this;

  take(upper: number): this;

  clear(): void;

  forEach<T>(callback: (value: V, key: K, map: MapDownlink<any, K, V>) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, value: V, key: K, map: MapDownlink<any, K, V>) => T | void, thisArg: S): T | undefined;

  keys(): Cursor<K>;

  values(): Cursor<V>;

  entries(): Cursor<[K, V]>;

  snapshot(): BTree<Value, Value>;

  /** @protected */
  willUpdate?(key: K, newValue: V): V | void;

  /** @protected */
  didUpdate?(key: K, newValue: V, oldValue: V): void;

  /** @protected */
  willRemove?(key: K): void;

  /** @protected */
  didRemove?(key: K, oldValue: V): void;

  /** @protected */
  willDrop?(lower: number): void;

  /** @protected */
  didDrop?(lower: number): void;

  /** @protected */
  willTake?(upper: number): void;

  /** @protected */
  didTake?(upper: number): void;

  /** @protected */
  willClear?(): void;

  /** @protected */
  didClear?(): void;

  /** @internal */
  mapWillUpdate(key: Value, newValue: Value): Value;

  /** @internal */
  mapDidUpdate(key: Value, newValue: Value, oldValue: Value): void;

  /** @internal */
  mapWillRemove(key: Value): void;

  /** @internal */
  mapDidRemove(key: Value, oldValue: Value): void;

  /** @internal */
  mapWillDrop(lower: number): void;

  /** @internal */
  mapDidDrop(lower: number): void;

  /** @internal */
  mapWillTake(upper: number): void;

  /** @internal */
  mapDidTake(upper: number): void;

  /** @internal */
  mapWillClear(): void;

  /** @internal */
  mapDidClear(): void;

  /** @internal */
  didAliasModel(): void;

  /** @override */
  open(): this;
}

/** @public */
export const MapDownlink = (<R, K, V, F extends MapDownlink<any, any, any, any>>() => WarpDownlink.extend<MapDownlink<R, K, V>, MapDownlinkClass<F>>("MapDownlink", {
  relinks: true,
  syncs: true,

  initKeyForm(): Form<K, LikeType<K>> {
    let keyForm = (Object.getPrototypeOf(this) as MapDownlink<unknown, K, V>).keyForm as Form<K, LikeType<K>> | undefined;
    if (keyForm === void 0) {
      keyForm = Form.forValue() as unknown as Form<K, LikeType<K>>;
    }
    return keyForm;
  },

  setKeyForm(keyForm: Form<K, LikeType<K>>): typeof this {
    if (this.keyForm !== keyForm) {
      (this as Mutable<typeof this>).keyForm = keyForm;
      this.relink();
    }
    return this;
  },

  initValueForm(): Form<V, LikeType<V>> {
    let valueForm = (Object.getPrototypeOf(this) as MapDownlink<unknown, K, V>).valueForm as Form<V, LikeType<V>> | undefined;
    if (valueForm === void 0) {
      valueForm = Form.forValue() as unknown as Form<V, LikeType<V>>;
    }
    return valueForm;
  },

  setValueForm(valueForm: Form<V, LikeType<V>>): typeof this {
    if (this.valueForm !== valueForm) {
      (this as Mutable<typeof this>).valueForm = valueForm;
      this.relink();
    }
    return this;
  },

  initState(): BTree<Value, Value> | null {
    let state = this.stateInit;
    if (state === void 0) {
      state = null;
    }
    return state;
  },

  setState(state: BTree<Value, Value>): void {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    model.setState(state);
  },

  get size(): number {
    const model = this.model;
    return model !== null ? model.size : 0;
  },

  isEmpty(): boolean {
    const model = this.model;
    return model === null || model.isEmpty();
  },

  has(key: K | LikeType<K>): boolean {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const keyObject = this.keyForm.mold(key);
    return model.has(keyObject);
  },

  get(key?: K | LikeType<K>): any/*Iterable<[K, V]> | V*/ {
    if (arguments.length === 0) {
      return this;
    }
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const keyObject = this.keyForm.mold(key as K | LikeType<K>);
    const value = model.get(keyObject);
    return value.coerce(this.valueForm);
  },

  getEntry(index: number): [K, V] | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const entry = model.getEntry(index);
    if (entry === void 0) {
      return void 0;
    }
    return [entry[0].coerce(this.keyForm), entry[1].coerce(this.valueForm)];
  },

  firstKey(): K | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const key = model.state.firstKey();
    if (key === void 0) {
      return void 0;
    }
    return key.coerce(this.keyForm);
  },

  firstValue(): V | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const value = model.state.firstValue();
    if (value === void 0) {
      return void 0;
    }
    return value.coerce(this.valueForm);
  },

  firstEntry(): [K, V] | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const entry = model.state.firstEntry();
    if (entry === void 0) {
      return void 0;
    }
    return [entry[0].coerce(this.keyForm), entry[1].coerce(this.valueForm)];
  },

  lastKey(): K | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const key = model.state.lastKey();
    if (key === void 0) {
      return void 0;
    }
    return key.coerce(this.keyForm);
  },

  lastValue(): V | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const value = model.state.lastValue();
    if (value === void 0) {
      return void 0;
    }
    return value.coerce(this.valueForm);
  },

  lastEntry(): [K, V] | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const entry = model.state.lastEntry();
    if (entry === void 0) {
      return void 0;
    }
    return [entry[0].coerce(this.keyForm), entry[1].coerce(this.valueForm)];
  },

  nextKey(keyObject: K): K | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const key = this.keyForm.mold(keyObject);
    const nextKey = model.state.nextKey(key);
    if (nextKey === void 0) {
      return void 0;
    }
    return nextKey.coerce(this.keyForm);
  },

  nextValue(keyObject: K): V | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const key = this.keyForm.mold(keyObject);
    const nextValue = model.state.nextValue(key);
    if (nextValue === void 0) {
      return void 0;
    }
    return nextValue.coerce(this.valueForm);
  },

  nextEntry(keyObject: K): [K, V] | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const key = this.keyForm.mold(keyObject);
    const nextEntry = model.state.nextEntry(key);
    if (nextEntry === void 0) {
      return void 0;
    }
    return [nextEntry[0].coerce(this.keyForm), nextEntry[1].coerce(this.valueForm)];
  },

  previousKey(keyObject: K): K | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const key = this.keyForm.mold(keyObject);
    const previousKey = model.state.previousKey(key);
    if (previousKey === void 0) {
      return void 0;
    }
    return previousKey.coerce(this.keyForm);
  },

  previousValue(keyObject: K): V | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const key = this.keyForm.mold(keyObject);
    const previousValue = model.state.previousValue(key);
    if (previousValue === void 0) {
      return void 0;
    }
    return previousValue.coerce(this.valueForm);
  },

  previousEntry(keyObject: K): [K, V] | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const key = this.keyForm.mold(keyObject);
    const previousEntry = model.state.previousEntry(key);
    if (previousEntry === void 0) {
      return void 0;
    }
    return [previousEntry[0].coerce(this.keyForm), previousEntry[1].coerce(this.valueForm)];
  },

  set(key: K | LikeType<K>, newValue: V | LikeType<V>): typeof this {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const keyObject = this.keyForm.mold(key);
    const newObject = this.valueForm.mold(newValue);
    model.set(keyObject, newObject);
    return this;
  },

  delete(key: K | LikeType<K>): boolean {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const keyObject = this.keyForm.mold(key);
    return model.delete(keyObject);
  },

  drop(lower: number): typeof this {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    model.drop(lower);
    return this;
  },

  take(upper: number): typeof this {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    model.take(upper);
    return this;
  },

  clear(): void {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    model.clear();
  },

  forEach<T, S>(callback: (this: S | undefined, value: V, key: K, map: MapDownlink<unknown, K, V>) => T | void, thisArg?: S): T | undefined {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const keyForm = this.keyForm;
    const valueForm = this.valueForm;
    if (keyForm as unknown === Form.forValue() && valueForm as unknown === Form.forValue()) {
      return model.state.forEach(function (value: Value, key: Value): T | void {
        return callback.call(thisArg, value as V, key as K, this);
      }, this);
    }
    return model.state.forEach(function (value: Value, key: Value): T | void {
      const object = value.coerce(valueForm);
      const keyObject = key.coerce(keyForm);
      return callback.call(thisArg, object, keyObject, this);
    }, this);
  },

  keys(): Cursor<K> {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const cursor = model.keys();
    if (this.keyForm as unknown === Form.forValue()) {
      return cursor as unknown as Cursor<K>;
    }
    return new ValueCursor(cursor, this.keyForm);
  },

  values(): Cursor<V> {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const cursor = model.values();
    if (this.valueForm as unknown === Form.forValue()) {
      return cursor as unknown as Cursor<V>;
    }
    return new ValueCursor(cursor, this.valueForm);
  },

  entries(): Cursor<[K, V]> {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    const cursor = model.entries();
    if (this.keyForm as unknown === Form.forValue() && this.valueForm as unknown === Form.forValue()) {
      return cursor as unknown as Cursor<[K, V]>;
    }
    return new ValueEntryCursor(cursor, this.keyForm, this.valueForm);
  },

  snapshot(): BTree<Value, Value> {
    const model = this.model;
    if (model === null) {
      throw new Error("unopened downlink");
    }
    return model.snapshot();
  },

  mapWillUpdate(key: Value, newValue: Value): Value {
    let keyObject: K | undefined;
    let newObject: V | undefined;
    const keyForm = this.keyForm;
    const valueForm = this.valueForm;

    if (this.willUpdate !== void 0) {
      keyObject = key.coerce(keyForm);
      newObject = newValue.coerce(valueForm);
      const newResult = this.willUpdate(keyObject, newObject);
      if (newResult !== void 0) {
        newObject = newResult;
        newValue = valueForm.mold(newObject);
      }
    }

    const observers = this.observers;
    if (observers !== null && observers.size !== 0) {
      if (keyObject === void 0) {
        keyObject = key.coerce(keyForm);
      }
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      for (const observer of observers) {
        if (observer.willUpdate === void 0) {
          continue;
        }
        const newResult = observer.willUpdate(keyObject, newObject, this);
        if (newResult !== void 0) {
          newObject = newResult;
          newValue = valueForm.mold(newObject);
        }
      }
    }

    return newValue;
  },

  mapDidUpdate(key: Value, newValue: Value, oldValue: Value): void {
    let keyObject: K | undefined;
    let newObject: V | undefined;
    let oldObject: V | undefined;
    const keyForm = this.keyForm;
    const valueForm = this.valueForm;

    if (this.didUpdate !== void 0) {
      keyObject = key.coerce(keyForm);
      newObject = newValue.coerce(valueForm);
      oldObject = oldValue.coerce(valueForm);
      this.didUpdate(keyObject, newObject, oldObject);
    }

    const observers = this.observers;
    if (observers !== null && observers.size !== 0) {
      if (keyObject === void 0) {
        keyObject = key.coerce(keyForm);
      }
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      if (oldObject === void 0) {
        oldObject = oldValue.coerce(valueForm);
      }
      for (const observer of observers) {
        if (observer.didUpdate === void 0) {
          continue;
        }
        observer.didUpdate(keyObject, newObject, oldObject, this);
      }
    }
  },

  mapWillRemove(key: Value): void {
    let keyObject: K | undefined;
    const keyForm = this.keyForm;

    if (this.willRemove !== void 0) {
      keyObject = key.coerce(keyForm);
      this.willRemove(keyObject);
    }

    const observers = this.observers;
    if (observers !== null && observers.size !== 0) {
      if (keyObject === void 0) {
        keyObject = key.coerce(keyForm);
      }
      for (const observer of observers) {
        if (observer.willRemove === void 0) {
          continue;
        }
        observer.willRemove(keyObject, this);
      }
    }
  },

  mapDidRemove(key: Value, oldValue: Value): void {
    let keyObject: K | undefined;
    let oldObject: V | undefined;
    const keyForm = this.keyForm;
    const valueForm = this.valueForm;

    if (this.didRemove !== void 0) {
      keyObject = key.coerce(keyForm);
      oldObject = oldValue.coerce(valueForm);
      this.didRemove(keyObject, oldObject);
    }

    const observers = this.observers;
    if (observers !== null && observers.size !== 0) {
      if (keyObject === void 0) {
        keyObject = key.coerce(keyForm);
      }
      if (oldObject === void 0) {
        oldObject = oldValue.coerce(valueForm);
      }
      for (const observer of observers) {
        if (observer.didRemove === void 0) {
          continue;
        }
        observer.didRemove(keyObject, oldObject, this);
      }
    }
  },

  mapWillDrop(lower: number): void {
    if (this.willDrop !== void 0) {
      this.willDrop(lower);
    }
    this.callObservers("willDrop", lower, this);
  },

  mapDidDrop(lower: number): void {
    if (this.didDrop !== void 0) {
      this.didDrop(lower);
    }
    this.callObservers("didDrop", lower, this);
  },

  mapWillTake(upper: number): void {
    if (this.willTake !== void 0) {
      this.willTake(upper);
    }
    this.callObservers("willTake", upper, this);
  },

  mapDidTake(upper: number): void {
    if (this.didTake !== void 0) {
      this.didTake(upper);
    }
    this.callObservers("didTake", upper, this);
  },

  mapWillClear(): void {
    if (this.willClear !== void 0) {
      this.willClear();
    }
    this.callObservers("willClear", this);
  },

  mapDidClear(): void {
    if (this.didClear !== void 0) {
      this.didClear();
    }
    this.callObservers("didClear", this);
  },

  didAliasModel(): void {
    const model = this.model;
    if (model === null || !model.linked) {
      return;
    }
    this.onLinkedResponse();
    model.state.forEach(function (value: Value, key: Value): void {
      this.mapDidUpdate(key, value, Value.absent());
    }, this);
    if (model.synced) {
      this.onSyncedResponse();
    }
  },

  open(): typeof this {
    if (this.model !== null) {
      return this;
    }
    const laneUri = this.getLaneUri();
    if (laneUri === null) {
      throw new Error("no laneUri");
    }
    let nodeUri = this.getNodeUri();
    if (nodeUri === null) {
      throw new Error("no nodeUri");
    }
    let hostUri = this.getHostUri();
    if (hostUri === null) {
      hostUri = nodeUri.endpoint();
      nodeUri = hostUri.unresolve(nodeUri);
    }
    let prio = this.getPrio();
    if (prio === void 0) {
      prio = 0;
    }
    let rate = this.getRate();
    if (rate === void 0) {
      rate = 0;
    }
    let body = this.getBody();
    if (body === null) {
      body = Value.absent();
    }
    const owner = this.owner;
    if (!WarpDownlinkContext[Symbol.hasInstance](owner)) {
      throw new Error("no downlink context");
    }
    let model = owner.getDownlink(hostUri, nodeUri, laneUri);
    if (model !== null) {
      if (!(model instanceof MapDownlinkModel)) {
        throw new Error("downlink type mismatch");
      }
      model.addDownlink(this);
      (this as Mutable<typeof this>).model = model as MapDownlinkModel;
      setTimeout(this.didAliasModel.bind(this));
    } else {
      const state = this.initState();
      model = new MapDownlinkModel(hostUri, nodeUri, laneUri, prio, rate, body, state);
      model.addDownlink(this);
      owner.openDownlink(model);
      (this as Mutable<typeof this>).model = model as MapDownlinkModel;
    }
    return this;
  },
},
{
  construct(downlink: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    downlink = super.construct(downlink, owner) as F;
    (downlink as Mutable<typeof downlink>).keyForm = downlink.initKeyForm();
    (downlink as Mutable<typeof downlink>).valueForm = downlink.initValueForm();
    return downlink;
  },
}))();
