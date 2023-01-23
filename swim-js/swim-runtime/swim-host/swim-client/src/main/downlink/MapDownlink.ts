// Copyright 2015-2023 Swim.inc
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

import type {Mutable, Class, Proto, Cursor, OrderedMap} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import type {BTree} from "@swim/collections";
import {AnyValue, Value, Form, ValueCursor, ValueEntryCursor} from "@swim/structure";
import {WarpDownlinkContext} from "./WarpDownlinkContext";
import {WarpDownlinkDescriptor, WarpDownlinkClass, WarpDownlink} from "./WarpDownlink";
import {MapDownlinkModel} from "./MapDownlinkModel";
import type {MapDownlinkObserver} from "./MapDownlinkObserver";

/** @public */
export type MapDownlinkKey<D extends MapDownlink<any, any, any, any, any>> =
  D extends {key: infer K} ? K : never;

/** @public */
export type MapDownlinkValue<D extends MapDownlink<any, any, any, any, any>> =
  D extends {value: infer V} ? V : never;

/** @public */
export type MapDownlinkKeyInit<D extends MapDownlink<any, any, any, any, any>> =
  D extends {keyInit?: infer KU} ? KU : never;

/** @public */
export type MapDownlinkValueInit<D extends MapDownlink<any, any, any, any, any>> =
  D extends {valueInit?: infer VU} ? VU : never;

/** @public */
export type AnyMapDownlinkKey<D extends MapDownlink<any, any, any, any, any>> =
  MapDownlinkKey<D> | MapDownlinkKeyInit<D>;

/** @public */
export type AnyMapDownlinkValue<D extends MapDownlink<any, any, any, any, any>> =
  MapDownlinkValue<D> | MapDownlinkValueInit<D>;

/** @public */
export interface MapDownlinkDescriptor<K = unknown, V = unknown, KU = K, VU = V> extends WarpDownlinkDescriptor {
  extends?: Proto<MapDownlink<any, any, any, any, any>> | string | boolean | null;
  keyForm?: Form<K, KU>;
  valueForm?: Form<V, VU>;
  /** @internal */
  stateInit?: BTree<Value, Value> | null;
}

/** @public */
export type MapDownlinkTemplate<D extends MapDownlink<any, any, any, any, any>> =
  ThisType<D> &
  MapDownlinkDescriptor<MapDownlinkKey<D>, MapDownlinkValue<D>, MapDownlinkKeyInit<D>, MapDownlinkValueInit<D>> &
  Partial<Omit<D, keyof MapDownlinkDescriptor>>;

/** @public */
export interface MapDownlinkClass<D extends MapDownlink<any, any, any, any, any> = MapDownlink<any, any, any, any, any>> extends WarpDownlinkClass<D> {
  /** @override */
  specialize(template: MapDownlinkDescriptor<any>): MapDownlinkClass<D>;

  /** @override */
  refine(downlinkClass: MapDownlinkClass<any>): void;

  /** @override */
  extend<D2 extends D>(className: string, template: MapDownlinkTemplate<D2>): MapDownlinkClass<D2>;
  extend<D2 extends D>(className: string, template: MapDownlinkTemplate<D2>): MapDownlinkClass<D2>;

  /** @override */
  define<D2 extends D>(className: string, template: MapDownlinkTemplate<D2>): MapDownlinkClass<D2>;
  define<D2 extends D>(className: string, template: MapDownlinkTemplate<D2>): MapDownlinkClass<D2>;

  /** @override */
  <D2 extends D>(template: MapDownlinkTemplate<D2>): PropertyDecorator;
}

/** @public */
export interface MapDownlink<O = unknown, K = Value, V = Value, KU = K extends Value ? AnyValue & K : K, VU = V extends Value ? AnyValue & V : V> extends WarpDownlink<O>, OrderedMap<K, V> {
  (key: K | KU): V | undefined;
  (key: K | KU, value: V | VU): O;

  /** @override */
  readonly observerType?: Class<MapDownlinkObserver<K, V>>;

  /** @internal @override */
  readonly model: MapDownlinkModel | null;

  /** @protected */
  initKeyForm(): Form<K, KU>;

  keyForm: Form<K, KU>;

  setKeyForm(keyForm: Form<K, KU>): this;

  /** @protected */
  initValueForm(): Form<V, VU>;

  readonly valueForm: Form<V, VU>;

  setValueForm(valueForm: Form<V, VU>): this;

  /** @internal */
  readonly key?: K; // for type destructuring

  /** @internal */
  readonly keyInit?: KU; // for type destructuring

  /** @internal */
  readonly value?: V; // for type destructuring

  /** @internal */
  readonly valueInit?: VU; // for type destructuring

  /** @internal */
  readonly stateInit?: BTree<Value, Value> | null; // optional prototype property

  /** @internal */
  initState(): BTree<Value, Value> | null;

  /** @internal */
  setState(state: BTree<Value, Value>): void;

  get size(): number;

  isEmpty(): boolean;

  has(key: K | KU): boolean;

  get(key: K | KU): V;

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

  set(key: K | KU, newValue: V | VU): this;

  delete(key: K | KU): boolean;

  drop(lower: number): this;

  take(upper: number): this;

  clear(): void;

  forEach<T>(callback: (key: K, value: V) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, key: K, value: V) => T | void,
                thisArg: S): T | undefined;

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
export const MapDownlink = (function (_super: typeof WarpDownlink) {
  const MapDownlink = _super.extend("MapDownlink", {
    relinks: true,
    syncs: true,
  }) as MapDownlinkClass;

  MapDownlink.prototype.initKeyForm = function <K, V, KU, VU>(this: MapDownlink<unknown, K, V, KU, VU>): Form<K, KU> {
    let keyForm = (Object.getPrototypeOf(this) as MapDownlink<unknown, K,V, KU, VU>).keyForm as Form<K, KU> | undefined;
    if (keyForm === void 0) {
      keyForm = Form.forValue() as unknown as Form<K, KU>;
    }
    return keyForm;
  };

  MapDownlink.prototype.setKeyForm = function <K, V, KU, VU>(this: MapDownlink<unknown, K, V, KU, VU>, keyForm: Form<K, KU>): MapDownlink<unknown, K, V, KU, VU> {
    if (this.keyForm !== keyForm) {
      (this as Mutable<typeof this>).keyForm = keyForm;
      this.relink();
    }
    return this;
  };

  MapDownlink.prototype.initValueForm = function <K, V, KU, VU>(this: MapDownlink<unknown, K, V, KU, VU>): Form<V, VU> {
    let valueForm = (Object.getPrototypeOf(this) as MapDownlink<unknown, K,V, KU, VU>).valueForm as Form<V, VU> | undefined;
    if (valueForm === void 0) {
      valueForm = Form.forValue() as unknown as Form<V, VU>;
    }
    return valueForm;
  };

  MapDownlink.prototype.setValueForm = function <K, V, KU, VU>(this: MapDownlink<unknown, K, V, KU, VU>, valueForm: Form<V, VU>): MapDownlink<unknown, K, V, KU, VU> {
    if (this.valueForm !== valueForm) {
      (this as Mutable<typeof this>).valueForm = valueForm;
      this.relink();
    }
    return this;
  };

  MapDownlink.prototype.initState = function (this: MapDownlink): BTree<Value, Value> | null {
    let state = this.stateInit;
    if (state === void 0) {
      state = null;
    }
    return state;
  };

  MapDownlink.prototype.setState = function (this: MapDownlink, state: BTree<Value, Value>): void {
    const model = this.model;
    if (model !== null) {
      model.setState(state);
    } else {
      throw new Error("unopened downlink");
    }
  };

  Object.defineProperty(MapDownlink.prototype, "size", {
    get(this: MapDownlink): number {
      const model = this.model;
      return model !== null ? model.size : 0;
    },
    configurable: true,
  });

  MapDownlink.prototype.isEmpty = function (this: MapDownlink): boolean {
    const model = this.model;
    return model === null || model.isEmpty();
  };

  MapDownlink.prototype.has = function <K, V, KU, VU>(this: MapDownlink<unknown, K, V, KU, VU>, key: K | KU): boolean {
    const model = this.model;
    if (model !== null) {
      const keyObject = this.keyForm.mold(key);
      return model.has(keyObject);
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.get = function <K, V, KU, VU>(this: MapDownlink<unknown, K, V, KU, VU>, key: K | KU): V {
    const model = this.model;
    if (model !== null) {
      const keyObject = this.keyForm.mold(key);
      const value = model.get(keyObject);
      return value.coerce(this.valueForm);
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.getEntry = function <K, V>(this: MapDownlink<unknown, K, V>, index: number): [K, V] | undefined {
    const model = this.model;
    if (model !== null) {
      const entry = model.getEntry(index);
      if (entry !== void 0) {
        return [entry[0].coerce(this.keyForm), entry[1].coerce(this.valueForm)];
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.firstKey = function <K, V>(this: MapDownlink<unknown, K, V>): K | undefined {
    const model = this.model;
    if (model !== null) {
      const key = model.state.firstKey();
      if (key !== void 0) {
        return key.coerce(this.keyForm);
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.firstValue = function <K, V>(this: MapDownlink<unknown, K, V>): V | undefined {
    const model = this.model;
    if (model !== null) {
      const value = model.state.firstValue();
      if (value !== void 0) {
        return value.coerce(this.valueForm);
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.firstEntry = function <K, V>(this: MapDownlink<unknown, K, V>): [K, V] | undefined {
    const model = this.model;
    if (model !== null) {
      const entry = model.state.firstEntry();
      if (entry !== void 0) {
        return [entry[0].coerce(this.keyForm), entry[1].coerce(this.valueForm)];
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.lastKey = function <K, V>(this: MapDownlink<unknown, K, V>): K | undefined {
    const model = this.model;
    if (model !== null) {
      const key = model.state.lastKey();
      if (key !== void 0) {
        return key.coerce(this.keyForm);
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.lastValue = function <K, V>(this: MapDownlink<unknown, K, V>): V | undefined {
    const model = this.model;
    if (model !== null) {
      const value = model.state.lastValue();
      if (value !== void 0) {
        return value.coerce(this.valueForm);
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.lastEntry = function <K, V>(this: MapDownlink<unknown, K, V>): [K, V] | undefined {
    const model = this.model;
    if (model !== null) {
      const entry = model.state.lastEntry();
      if (entry !== void 0) {
        return [entry[0].coerce(this.keyForm), entry[1].coerce(this.valueForm)];
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.nextKey = function <K, V>(this: MapDownlink<unknown, K, V>, keyObject: K): K | undefined {
    const model = this.model;
    if (model !== null) {
      const key = this.keyForm.mold(keyObject);
      const nextKey = model.state.nextKey(key);
      if (nextKey !== void 0) {
        return nextKey.coerce(this.keyForm);
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.nextValue = function <K, V>(this: MapDownlink<unknown, K, V>, keyObject: K): V | undefined {
    const model = this.model;
    if (model !== null) {
      const key = this.keyForm.mold(keyObject);
      const nextValue = model.state.nextValue(key);
      if (nextValue !== void 0) {
        return nextValue.coerce(this.valueForm);
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.nextEntry = function <K, V>(this: MapDownlink<unknown, K, V>, keyObject: K): [K, V] | undefined {
    const model = this.model;
    if (model !== null) {
      const key = this.keyForm.mold(keyObject);
      const nextEntry = model.state.nextEntry(key);
      if (nextEntry !== void 0) {
        return [nextEntry[0].coerce(this.keyForm), nextEntry[1].coerce(this.valueForm)];
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.previousKey = function <K, V>(this: MapDownlink<unknown, K, V>, keyObject: K): K | undefined {
    const model = this.model;
    if (model !== null) {
      const key = this.keyForm.mold(keyObject);
      const previousKey = model.state.previousKey(key);
      if (previousKey !== void 0) {
        return previousKey.coerce(this.keyForm);
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.previousValue = function <K, V>(this: MapDownlink<unknown, K, V>, keyObject: K): V | undefined {
    const model = this.model;
    if (model !== null) {
      const key = this.keyForm.mold(keyObject);
      const previousValue = model.state.previousValue(key);
      if (previousValue !== void 0) {
        return previousValue.coerce(this.valueForm);
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.previousEntry = function <K, V>(this: MapDownlink<unknown, K, V>, keyObject: K): [K, V] | undefined {
    const model = this.model;
    if (model !== null) {
      const key = this.keyForm.mold(keyObject);
      const previousEntry = model.state.previousEntry(key);
      if (previousEntry !== void 0) {
        return [previousEntry[0].coerce(this.keyForm), previousEntry[1].coerce(this.valueForm)];
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.set = function <K, V, KU, VU>(this: MapDownlink<unknown, K, V, KU, VU>, key: K | KU, newValue: V | VU): MapDownlink<unknown, K, V, KU, VU> {
    const model = this.model;
    if (model !== null) {
      const keyObject = this.keyForm.mold(key);
      const newObject = this.valueForm.mold(newValue);
      model.set(keyObject, newObject);
      return this;
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.delete = function <K, V, KU, VU>(this: MapDownlink<unknown, K, V, KU, VU>, key: K | KU): boolean {
    const model = this.model;
    if (model !== null) {
      const keyObject = this.keyForm.mold(key);
      return model.delete(keyObject);
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.drop = function <K, V>(this: MapDownlink<unknown, K, V>, lower: number): MapDownlink<unknown, K, V> {
    const model = this.model;
    if (model !== null) {
      model.drop(lower);
      return this;
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.take = function <K, V>(this: MapDownlink<unknown, K, V>, upper: number): MapDownlink<unknown, K, V> {
    const model = this.model;
    if (model !== null) {
      model.take(upper);
      return this;
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.clear = function <K, V>(this: MapDownlink<unknown, K, V>): void {
    const model = this.model;
    if (model !== null) {
      model.clear();
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.forEach = function<K, V, T, S>(this: MapDownlink<unknown, K, V>,
                                                       callback: (this: S | undefined, key: K, value: V) => T | void,
                                                       thisArg?: S): T | undefined {
    const model = this.model;
    if (model !== null) {
      const keyForm = this.keyForm;
      const valueForm = this.valueForm;
      if (keyForm as unknown === Form.forValue() && valueForm as unknown === Form.forValue()) {
        return model.state.forEach(callback as any, thisArg);
      } else {
        return model.state.forEach(function (key: Value, value: Value): T | void {
          const keyObject = key.coerce(keyForm);
          const object = value.coerce(valueForm);
          return callback.call(thisArg, keyObject, object);
        }, this);
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.keys = function <K, V>(this: MapDownlink<unknown, K, V>): Cursor<K> {
    const model = this.model;
    if (model !== null) {
      const cursor = model.keys();
      if (this.keyForm as unknown === Form.forValue()) {
        return cursor as unknown as Cursor<K>;
      } else {
        return new ValueCursor(cursor, this.keyForm);
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.values = function <K, V>(this: MapDownlink<unknown, K, V>): Cursor<V> {
    const model = this.model;
    if (model !== null) {
      const cursor = model.values();
      if (this.valueForm as unknown === Form.forValue()) {
        return cursor as unknown as Cursor<V>;
      } else {
        return new ValueCursor(cursor, this.valueForm);
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.entries = function <K, V>(this: MapDownlink<unknown, K, V>): Cursor<[K, V]> {
    const model = this.model;
    if (model !== null) {
      const cursor = model.entries();
      if (this.keyForm as unknown === Form.forValue() && this.valueForm as unknown === Form.forValue()) {
        return cursor as unknown as Cursor<[K, V]>;
      } else {
        return new ValueEntryCursor(cursor, this.keyForm, this.valueForm);
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.snapshot = function <K, V>(this: MapDownlink<unknown, K, V>): BTree<Value, Value> {
    const model = this.model;
    if (model !== null) {
      return model.snapshot();
    } else {
      throw new Error("unopened downlink");
    }
  };

  MapDownlink.prototype.mapWillUpdate = function <K, V>(this: MapDownlink<unknown, K, V>, key: Value, newValue: Value): Value {
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
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (keyObject === void 0) {
        keyObject = key.coerce(keyForm);
      }
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.willUpdate !== void 0) {
          const newResult = observer.willUpdate(keyObject, newObject, this);
          if (newResult !== void 0) {
            newObject = newResult;
            newValue = valueForm.mold(newObject);
          }
        }
      }
    }

    return newValue;
  };

  MapDownlink.prototype.mapDidUpdate = function <K, V>(this: MapDownlink<unknown, K, V>, key: Value, newValue: Value, oldValue: Value): void {
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
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (keyObject === void 0) {
        keyObject = key.coerce(keyForm);
      }
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      if (oldObject === void 0) {
        oldObject = oldValue.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.didUpdate !== void 0) {
          observer.didUpdate(keyObject, newObject, oldObject, this);
        }
      }
    }
  };

  MapDownlink.prototype.mapWillRemove = function <K, V>(this: MapDownlink<unknown, K, V>, key: Value): void {
    let keyObject: K | undefined;
    const keyForm = this.keyForm;

    if (this.willRemove !== void 0) {
      keyObject = key.coerce(keyForm);
      this.willRemove(keyObject);
    }

    const observers = this.observers;
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (keyObject === void 0) {
        keyObject = key.coerce(keyForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.willRemove !== void 0) {
          observer.willRemove(keyObject, this);
        }
      }
    }
  };

  MapDownlink.prototype.mapDidRemove = function <K, V>(this: MapDownlink<unknown, K, V>, key: Value, oldValue: Value): void {
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
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (keyObject === void 0) {
        keyObject = key.coerce(keyForm);
      }
      if (oldObject === void 0) {
        oldObject = oldValue.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.didRemove !== void 0) {
          observer.didRemove(keyObject, oldObject, this);
        }
      }
    }
  };

  MapDownlink.prototype.mapWillDrop = function <K, V>(this: MapDownlink<unknown, K, V>, lower: number): void {
    if (this.willDrop !== void 0) {
      this.willDrop(lower);
    }

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willDrop !== void 0) {
        observer.willDrop(lower, this);
      }
    }
  };

  MapDownlink.prototype.mapDidDrop = function <K, V>(this: MapDownlink<unknown, K, V>, lower: number): void {
    if (this.didDrop !== void 0) {
      this.didDrop(lower);
    }

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didDrop !== void 0) {
        observer.didDrop(lower, this);
      }
    }
  };

  MapDownlink.prototype.mapWillTake = function <K, V>(this: MapDownlink<unknown, K, V>, upper: number): void {
    if (this.willTake !== void 0) {
      this.willTake(upper);
    }

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willTake !== void 0) {
        observer.willTake(upper, this);
      }
    }
  };

  MapDownlink.prototype.mapDidTake = function <K, V>(this: MapDownlink<unknown, K, V>, upper: number): void {
    if (this.didTake !== void 0) {
      this.didTake(upper);
    }

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didTake !== void 0) {
        observer.didTake(upper, this);
      }
    }
  };

  MapDownlink.prototype.mapWillClear = function <K, V>(this: MapDownlink<unknown, K, V>): void {
    if (this.willClear !== void 0) {
      this.willClear();
    }

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willClear !== void 0) {
        observer.willClear(this);
      }
    }
  };

  MapDownlink.prototype.mapDidClear = function <K, V>(this: MapDownlink<unknown, K, V>): void {
    if (this.didClear !== void 0) {
      this.didClear();
    }

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.didClear !== void 0) {
        observer.didClear(this);
      }
    }
  };

  MapDownlink.prototype.didAliasModel = function (this: MapDownlink): void {
    const model = this.model;
    if (model !== null && model.linked) {
      this.onLinkedResponse();
      model.state.forEach(function (key: Value, value: Value): void {
        this.mapDidUpdate(key, value, Value.absent());
      }, this);
      if (model.synced) {
        this.onSyncedResponse();
      }
    }
  };

  MapDownlink.prototype.open = function (this: MapDownlink): MapDownlink {
    if (this.model === null) {
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
      if (WarpDownlinkContext.is(owner)) {
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
      } else {
        throw new Error("no downlink context");
      }
    }
    return this;
  };

  MapDownlink.construct = function <D extends MapDownlink<any, any, any, any, any>>(downlink: D | null, owner: FastenerOwner<D>): D {
    if (downlink === null) {
      downlink = function (key: MapDownlinkKey<D> | MapDownlinkKeyInit<D>, value?: MapDownlinkValue<D> | MapDownlinkValueInit<D>): MapDownlinkValue<D> | undefined | FastenerOwner<D> {
        if (arguments.length === 1) {
          return downlink!.get(key);
        } else {
          downlink!.set(key, value!);
          return downlink!.owner;
        }
      } as D;
      delete (downlink as Partial<Mutable<D>>).name; // don't clobber prototype name
      Object.setPrototypeOf(downlink, this.prototype);
    }
    downlink = _super.construct.call(this, downlink, owner) as D;
    (downlink as Mutable<typeof downlink>).keyForm = downlink.initKeyForm();
    (downlink as Mutable<typeof downlink>).valueForm = downlink.initValueForm();
    return downlink;
  };

  return MapDownlink;
})(WarpDownlink);
