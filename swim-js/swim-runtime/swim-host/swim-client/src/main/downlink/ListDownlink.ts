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

import type {Mutable, Class, Proto, Cursor} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import type {STree} from "@swim/collections";
import {AnyValue, Value, Form, ValueCursor, ValueEntryCursor} from "@swim/structure";
import {WarpDownlinkContext} from "./WarpDownlinkContext";
import {WarpDownlinkDescriptor, WarpDownlinkClass, WarpDownlink} from "./WarpDownlink";
import {ListDownlinkModel} from "./ListDownlinkModel";
import type {ListDownlinkObserver} from "./ListDownlinkObserver";

/** @public */
export type ListDownlinkValue<D extends ListDownlink<any, any, any>> =
  D extends {value: infer V} ? V : never;

/** @public */
export type ListDownlinkValueInit<D extends ListDownlink<any, any, any>> =
  D extends {valueInit?: infer VU} ? VU : never;

/** @public */
export type AnyListDownlinkValue<D extends ListDownlink<any, any, any>> =
  ListDownlinkValue<D> | ListDownlinkValueInit<D>;

/** @public */
export interface ListDownlinkDescriptor<V = unknown, VU = V> extends WarpDownlinkDescriptor {
  extends?: Proto<ListDownlink<any, any, any>> | string | boolean | null;
  valueForm?: Form<V, VU>;
  /** @internal */
  stateInit?: STree<Value, Value> | null;
}

/** @public */
export type ListDownlinkTemplate<D extends ListDownlink<any, any, any>> =
  ThisType<D> &
  ListDownlinkDescriptor<ListDownlinkValue<D>, ListDownlinkValueInit<D>> &
  Partial<Omit<D, keyof ListDownlinkDescriptor>>;

/** @public */
export interface ListDownlinkClass<D extends ListDownlink<any, any, any> = ListDownlink<any, any, any>> extends WarpDownlinkClass<D> {
  /** @override */
  specialize(template: ListDownlinkDescriptor<any>): ListDownlinkClass<D>;

  /** @override */
  refine(downlinkClass: ListDownlinkClass<any>): void;

  /** @override */
  extend<D2 extends D>(className: string, template: ListDownlinkTemplate<D2>): ListDownlinkClass<D2>;
  extend<D2 extends D>(className: string, template: ListDownlinkTemplate<D2>): ListDownlinkClass<D2>;

  /** @override */
  define<D2 extends D>(className: string, template: ListDownlinkTemplate<D2>): ListDownlinkClass<D2>;
  define<D2 extends D>(className: string, template: ListDownlinkTemplate<D2>): ListDownlinkClass<D2>;

  /** @override */
  <D2 extends D>(template: ListDownlinkTemplate<D2>): PropertyDecorator;
}

/** @public */
export interface ListDownlink<O = unknown, V = Value, VU = V extends Value ? AnyValue & V : V> extends WarpDownlink<O> {
  (index: number): V | undefined;
  (index: number, newObject: V | VU): O;

  /** @override */
  readonly observerType?: Class<ListDownlinkObserver<V>>;

  /** @internal @override */
  readonly model: ListDownlinkModel | null;

  /** @protected */
  initValueForm(): Form<V, VU>;

  readonly valueForm: Form<V, VU>;

  setValueForm(valueForm: Form<V, VU>): this;

  /** @internal */
  readonly value?: V; // for type destructuring

  /** @internal */
  readonly valueInit?: VU; // for type destructuring

  /** @internal */
  readonly stateInit?: STree<Value, Value> | null; // optional prototype property

  /** @internal */
  initState(): STree<Value, Value> | null;

  /** @internal */
  setState(state: STree<Value, Value>): void;

  get size(): number;

  isEmpty(): boolean;

  get(index: number, id?: Value): V;

  getEntry(index: number, id?: Value): [V, Value] | undefined;

  set(index: number, newObject: V | VU, id?: Value): this;

  insert(index: number, newObject: V | VU, id?: Value): this;

  remove(index: number, id?: Value): this;

  push(...newObjects: (V | VU)[]): number;

  pop(): V;

  unshift(...newObjects: (V | VU)[]): number;

  shift(): V;

  move(fromIndex: number, toIndex: number, id?: Value): this;

  splice(start: number, deleteCount?: number, ...newObjects: (V | VU)[]): V[];

  clear(): void;

  forEach<T, S>(callback: (value: V, index: number, id: Value) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, value: V, index: number, id: Value) => T | void,
                thisArg: S): T | undefined;

  values(): Cursor<V>;

  keys(): Cursor<Value>;

  entries(): Cursor<[Value, V]>;

  snapshot(): STree<Value, Value>;

  /** @protected */
  willUpdate?(index: number, newValue: V): V | void;

  /** @protected */
  didUpdate?(index: number, newValue: V, oldValue: V): void;

  /** @protected */
  willMove?(fromIndex: number, toIndex: number, value: V): void;

  /** @protected */
  didMove?(fromIndex: number, toIndex: number, value: V): void;

  /** @protected */
  willRemove?(index: number): void;

  /** @protected */
  didRemove?(index: number, oldValue: V): void;

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
  listWillUpdate(index: number, newValue: Value): Value;

  /** @internal */
  listDidUpdate(index: number, newValue: Value, oldValue: Value): void;

  /** @internal */
  listWillMove(fromIndex: number, toIndex: number, value: Value): void;

  /** @internal */
  listDidMove(fromIndex: number, toIndex: number, value: Value): void;

  /** @internal */
  listWillRemove(index: number): void;

  /** @internal */
  listDidRemove(index: number, oldValue: Value): void;

  /** @internal */
  listWillDrop(lower: number): void;

  /** @internal */
  listDidDrop(lower: number): void;

  /** @internal */
  listWillTake(upper: number): void;

  /** @internal */
  listDidTake(upper: number): void;

  /** @internal */
  listWillClear(): void;

  /** @internal */
  listDidClear(): void;

  /** @internal */
  didAliasModel(): void;

  /** @override */
  open(): this;
}

/** @public */
export const ListDownlink = (function (_super: typeof WarpDownlink) {
  const ListDownlink = _super.extend("ListDownlink", {
    relinks: true,
    syncs: true,
  }) as ListDownlinkClass;

  ListDownlink.prototype.initValueForm = function <V, VU>(this: ListDownlink<unknown, V, VU>): Form<V, VU> {
    let valueForm = (Object.getPrototypeOf(this) as ListDownlink<unknown, V, VU>).valueForm as Form<V, VU> | undefined;
    if (valueForm === void 0) {
      valueForm = Form.forValue() as unknown as Form<V, VU>;
    }
    return valueForm;
  };

  ListDownlink.prototype.setValueForm = function <V, VU>(this: ListDownlink<unknown, V, VU>, valueForm: Form<V, VU>): ListDownlink<unknown, V, VU> {
    if (this.valueForm !== valueForm) {
      (this as Mutable<typeof this>).valueForm = valueForm;
      this.relink();
    }
    return this;
  };

  ListDownlink.prototype.initState = function (this: ListDownlink): STree<Value, Value> | null {
    let state = this.stateInit;
    if (state === void 0) {
      state = null;
    }
    return state;
  };

  ListDownlink.prototype.setState = function (this: ListDownlink, state: STree<Value, Value>): void {
    const model = this.model;
    if (model !== null) {
      model.setState(state);
    } else {
      throw new Error("unopened downlink");
    }
  };

  Object.defineProperty(ListDownlink.prototype, "size", {
    get(this: ListDownlink): number {
      const model = this.model;
      return model !== null ? model.size : 0;
    },
    configurable: true,
  });

  ListDownlink.prototype.isEmpty = function (this: ListDownlink): boolean {
    const model = this.model;
    if (model !== null) {
      return model.isEmpty();
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.get = function <V>(this: ListDownlink<unknown, V>, index: number, id?: Value): V {
    const model = this.model;
    if (model !== null) {
      const value = model.get(index, id);
      return value.coerce(this.valueForm);
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.getEntry = function <V>(this: ListDownlink<unknown, V>, index: number, id?: Value): [V, Value] | undefined {
    const model = this.model;
    if (model !== null) {
      const entry = model.getEntry(index, id);
      if (entry !== void 0) {
        return [entry[0].coerce(this.valueForm), entry[1]];
      } else {
        return void 0;
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.set = function <V, VU>(this: ListDownlink<unknown, V, VU>, index: number, newObject: V | VU, id?: Value): ListDownlink<unknown, V, VU> {
    const model = this.model;
    if (model !== null) {
      const newValue = this.valueForm.mold(newObject);
      model.set(index, newValue, id);
      return this;
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.insert = function <V, VU>(this: ListDownlink<unknown, V, VU>, index: number, newObject: V | VU, id?: Value): ListDownlink<unknown, V, VU> {
    const model = this.model;
    if (model !== null) {
      const newValue = this.valueForm.mold(newObject);
      model.insert(index, newValue, id);
      return this;
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.remove = function <V>(this: ListDownlink<unknown, V>, index: number, id?: Value): ListDownlink<unknown, V> {
    const model = this.model;
    if (model !== null) {
      model.remove(index, id);
      return this;
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.push = function <V, VU>(this: ListDownlink<unknown, V, VU>, ...newObjects: (V | VU)[]): number {
    const model = this.model;
    if (model !== null) {
      const valueForm = this.valueForm;
      const newValues = new Array(newObjects.length);
      for (let i = 0; i < newObjects.length; i += 1) {
        newValues[i] = valueForm.mold(newObjects[i]!);
      }
      return model.push(...newValues);
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.pop = function <V>(this: ListDownlink<unknown, V>): V {
    const model = this.model;
    if (model !== null) {
      const value = model.pop();
      return value.coerce(this.valueForm);
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.unshift = function <V, VU>(this: ListDownlink<unknown, V, VU>, ...newObjects: (V | VU)[]): number {
    const model = this.model;
    if (model !== null) {
      const valueForm = this.valueForm;
      const newValues = new Array(newObjects.length);
      for (let i = 0; i < newObjects.length; i += 1) {
        newValues[i] = valueForm.mold(newObjects[i]!);
      }
      return model.unshift(...newValues);
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.shift = function <V>(this: ListDownlink<unknown, V>): V {
    const model = this.model;
    if (model !== null) {
      const value = model.shift();
      return value.coerce(this.valueForm);
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.move = function <V>(this: ListDownlink<unknown, V>, fromIndex: number, toIndex: number, id?: Value): ListDownlink<unknown, V> {
    const model = this.model;
    if (model !== null) {
      model.move(fromIndex, toIndex, id);
      return this;
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.splice = function <V, VU>(this: ListDownlink<unknown, V, VU>, start: number, deleteCount?: number, ...newObjects: (V | VU)[]): V[] {
    const model = this.model;
    if (model !== null) {
      const valueForm = this.valueForm;
      const newValues = new Array(newObjects.length);
      for (let i = 0; i < newObjects.length; i += 1) {
        newValues[i] = valueForm.mold(newObjects[i]!);
      }
      const oldValues = this.model!.splice(start, deleteCount, ...newValues);
      const oldObjects = new Array(oldValues.length);
      for (let i = 0; i < oldValues.length; i += 1) {
        oldObjects[i] = oldValues[i]!.coerce(valueForm);
      }
      return oldObjects;
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.clear = function (this: ListDownlink): void {
    const model = this.model;
    if (model !== null) {
      model.clear();
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.forEach = function <V, T, S>(this: ListDownlink<unknown, V>,
                                                      callback: (this: S | undefined, value: V, index: number, id: Value) => T | void,
                                                      thisArg?: S): T | undefined {
    const model = this.model;
    if (model !== null) {
      const valueForm = this.valueForm;
      if (valueForm as unknown === Form.forValue()) {
        return model.state.forEach(callback as any, thisArg);
      } else {
        return model.state.forEach(function (value: Value, index: number, id: Value): T | void {
          const object = value.coerce(valueForm);
          return callback.call(thisArg, object, index, id);
        }, this);
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.values = function <V>(this: ListDownlink<unknown, V>): Cursor<V> {
    const model = this.model;
    if (model !== null) {
      const cursor = model.values();
      const valueForm = this.valueForm;
      if (valueForm as unknown === Form.forValue()) {
        return cursor as unknown as Cursor<V>;
      } else {
        return new ValueCursor(cursor, valueForm);
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.keys = function <V>(this: ListDownlink<unknown, V>): Cursor<Value> {
    const model = this.model;
    if (model !== null) {
      return model.keys();
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.entries = function <V>(this: ListDownlink<unknown, V>): Cursor<[Value, V]> {
    const model = this.model;
    if (model !== null) {
      const cursor = model.entries();
      if (this.valueForm as unknown === Form.forValue()) {
        return cursor as unknown as Cursor<[Value, V]>;
      } else {
        return new ValueEntryCursor(cursor, Form.forValue(), this.valueForm);
      }
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.snapshot = function <V>(this: ListDownlink<unknown, V>): STree<Value, Value> {
    const model = this.model;
    if (model !== null) {
      return model.snapshot();
    } else {
      throw new Error("unopened downlink");
    }
  };

  ListDownlink.prototype.listWillUpdate = function <V>(this: ListDownlink<unknown, V>, index: number, newValue: Value): Value {
    let newObject: V | undefined;
    const valueForm = this.valueForm;

    if (this.willUpdate !== void 0) {
      newObject = newValue.coerce(valueForm);
      const newResult = this.willUpdate(index, newObject);
      if (newResult !== void 0) {
        newObject = newResult;
        newValue = valueForm.mold(newObject);
      }
    }

    const observers = this.observers;
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.willUpdate !== void 0) {
          const newResult = observer.willUpdate(index, newObject, this);
          if (newResult !== void 0) {
            newObject = newResult;
            newValue = valueForm.mold(newObject);
          }
        }
      }
    }

    return newValue;
  };

  ListDownlink.prototype.listDidUpdate = function <V>(this: ListDownlink<unknown, V>, index: number, newValue: Value, oldValue: Value): void {
    let newObject: V | undefined;
    let oldObject: V | undefined;
    const valueForm = this.valueForm;

    if (this.didUpdate !== void 0) {
      newObject = newValue.coerce(valueForm);
      oldObject = oldValue.coerce(valueForm);
      this.didUpdate(index, newObject, oldObject);
    }

    const observers = this.observers;
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (newObject === void 0) {
        newObject = newValue.coerce(valueForm);
      }
      if (oldObject === void 0) {
        oldObject = oldValue.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.didUpdate !== void 0) {
          observer.didUpdate(index, newObject, oldObject, this);
        }
      }
    }
  };

  ListDownlink.prototype.listWillMove = function <V>(this: ListDownlink<unknown, V>, fromIndex: number, toIndex: number, value: Value): void {
    let object: V | undefined;
    const valueForm = this.valueForm;

    if (this.willMove !== void 0) {
      object = value.coerce(valueForm);
      this.willMove(fromIndex, toIndex, object);
    }

    const observers = this.observers;
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (object === void 0) {
        object = value.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.willMove !== void 0) {
          observer.willMove(fromIndex, toIndex, object, this);
        }
      }
    }
  };

  ListDownlink.prototype.listDidMove = function <V>(this: ListDownlink<unknown, V>, fromIndex: number, toIndex: number, value: Value): void {
    let object: V | undefined;
    const valueForm = this.valueForm;

    if (this.didMove !== void 0) {
      object = value.coerce(valueForm);
      this.didMove(fromIndex, toIndex, object);
    }

    const observers = this.observers;
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (object === void 0) {
        object = value.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.didMove !== void 0) {
          observer.didMove(fromIndex, toIndex, object, this);
        }
      }
    }
  };

  ListDownlink.prototype.listWillRemove = function <V>(this: ListDownlink<unknown, V>, index: number): void {
    if (this.willRemove !== void 0) {
      this.willRemove(index);
    }

    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.willRemove !== void 0) {
        observer.willRemove(index, this);
      }
    }
  };

  ListDownlink.prototype.listDidRemove = function <V>(this: ListDownlink<unknown, V>, index: number, oldValue: Value): void {
    let oldObject: V | undefined;
    const valueForm = this.valueForm;

    if (this.didRemove !== void 0) {
      oldObject = oldValue.coerce(valueForm);
      this.didRemove(index, oldObject);
    }

    const observers = this.observers;
    const observerCount = observers.length;
    if (observerCount !== 0) {
      if (oldObject === void 0) {
        oldObject = oldValue.coerce(valueForm);
      }
      for (let i = 0; i < observerCount; i += 1) {
        const observer = observers[i]!;
        if (observer.didRemove !== void 0) {
          observer.didRemove(index, oldObject, this);
        }
      }
    }
  };

  ListDownlink.prototype.listWillDrop = function (this: ListDownlink, lower: number): void {
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

  ListDownlink.prototype.listDidDrop = function (this: ListDownlink, lower: number): void {
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

  ListDownlink.prototype.listWillTake = function (this: ListDownlink, upper: number): void {
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

  ListDownlink.prototype.listDidTake = function (this: ListDownlink, upper: number): void {
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

  ListDownlink.prototype.listWillClear = function (this: ListDownlink): void {
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

  ListDownlink.prototype.listDidClear = function (this: ListDownlink): void {
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

  ListDownlink.prototype.didAliasModel = function (this: ListDownlink): void {
    const model = this.model;
    if (model !== null && model.linked) {
      this.onLinkedResponse();
      model.state.forEach(function (value: Value, index: number) {
        this.listDidUpdate(index, value, Value.absent());
      }, this);
      if (model.synced) {
        this.onSyncedResponse();
      }
    }
  };

  ListDownlink.prototype.open = function (this: ListDownlink): ListDownlink {
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
          if (!(model instanceof ListDownlinkModel)) {
            throw new Error("downlink type mismatch");
          }
          model.addDownlink(this);
          (this as Mutable<typeof this>).model = model as ListDownlinkModel;
          setTimeout(this.didAliasModel.bind(this));
        } else {
          const state = this.initState();
          model = new ListDownlinkModel(hostUri, nodeUri, laneUri, prio, rate, body, state);
          model.addDownlink(this);
          owner.openDownlink(model);
          (this as Mutable<typeof this>).model = model as ListDownlinkModel;
        }
      } else {
        throw new Error("no downlink context");
      }
    }
    return this;
  };

  ListDownlink.construct = function <D extends ListDownlink<any, any, any>>(downlink: D | null, owner: FastenerOwner<D>): D {
    if (downlink === null) {
      downlink = function (index: number, value?: ListDownlinkValue<D> | ListDownlinkValueInit<D>): ListDownlinkValue<D> | undefined | FastenerOwner<D> {
        if (arguments.length === 0) {
          return downlink!.get(index);
        } else {
          downlink!.set(index, value!);
          return downlink!.owner;
        }
      } as D;
      delete (downlink as Partial<Mutable<D>>).name; // don't clobber prototype name
      Object.setPrototypeOf(downlink, this.prototype);
    }
    downlink = _super.construct.call(this, downlink, owner) as D;
    (downlink as Mutable<typeof downlink>).valueForm = downlink.initValueForm();
    return downlink;
  };

  return ListDownlink;
})(WarpDownlink);
