// Copyright 2015-2020 Swim inc.
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

import {__extends} from "tslib";
import {Cursor, OrderedMap} from "@swim/util";
import {AnyValue, Value, Form} from "@swim/structure";
import {Uri} from "@swim/uri";
import {MapDownlinkObserver, MapDownlink, WarpRef} from "@swim/client";
import {Model} from "../Model";
import {ModelDownlinkInit, ModelDownlink} from "./ModelDownlink";

export interface ModelMapDownlinkInit<K, V, KU = K, VU = V> extends ModelDownlinkInit, MapDownlinkObserver<K, V, KU, VU> {
  extends?: ModelMapDownlinkPrototype;
  keyForm?: Form<K, KU>;
  valueForm?: Form<V, VU>;

  initDownlink?(downlink: MapDownlink<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;
}

export type ModelMapDownlinkDescriptorInit<M extends Model, K, V, KU = K, VU = V, I = {}> = ModelMapDownlinkInit<K, V, KU, VU> & ThisType<ModelMapDownlink<M, K, V, KU, VU> & I> & I;

export type ModelMapDownlinkDescriptorExtends<M extends Model, K, V, KU = K, VU = V, I = {}> = {extends: ModelMapDownlinkPrototype | undefined} & ModelMapDownlinkDescriptorInit<M, K, V, KU, VU, I>;

export type ModelMapDownlinkDescriptor<M extends Model, K, V, KU = K, VU = V, I = {}> = ModelMapDownlinkDescriptorInit<M, K, V, KU, VU, I>;

export type ModelMapDownlinkPrototype = Function & {prototype: ModelMapDownlink<any, any, any, any, any>};

export type ModelMapDownlinkConstructor<M extends Model, K, V, KU = K, VU = V, I = {}> = {
  new(model: M, downlinkName: string | undefined): ModelMapDownlink<M, K, V, KU, VU> & I;
  prototype: ModelMapDownlink<any, any, any, any, any> & I;
};

export declare abstract class ModelMapDownlink<M extends Model, K, V, KU = K, VU = V> {
  /** @hidden */
  _downlink: MapDownlink<K, V, KU, VU> | null;
  /** @hidden */
  _keyForm?: Form<K, KU>;
  /** @hidden */
  _valueForm?: Form<V, VU>;

  constructor(model: M, downlinkName: string | undefined);

  get downlink(): MapDownlink<K, V, KU, VU> | null;

  keyForm(): Form<K, KU> | null;
  keyForm(keyForm: Form<K, KU> | null): this;

  valueForm(): Form<V, VU> | null;
  valueForm(valueForm: Form<V, VU> | null): this;

  get size(): number;

  isEmpty(): boolean;

  has(key: K | KU): boolean;

  get(key: K | KU): V | undefined;

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

  forEach<T, S = unknown>(callback: (this: S, key: K, value: V) => T | void,
                          thisArg?: S): T | undefined;

  keys(): Cursor<K>;

  values(): Cursor<V>;

  entries(): Cursor<[K, V]>;

  /** @hidden */
  createDownlink(warp: WarpRef): MapDownlink<K, V, KU, VU>;

  /** @hidden */
  scopeDownlink(downlink: MapDownlink<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;

  /** @hidden */
  initDownlink?(downlink: MapDownlink<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;

  static define<M extends Model, K, V, KU = K, VU = V, I = {}>(descriptor: ModelMapDownlinkDescriptorExtends<M, K, V, KU, VU, I>): ModelMapDownlinkConstructor<M, K, V, KU, VU, I>;
  static define<M extends Model, K, V, KU = K, VU = V>(descriptor: {keyForm: Form<K, KU>; valueForm: Form<V, VU>} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): ModelMapDownlinkConstructor<M, K, V, KU, VU>;
  static define<M extends Model, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(descriptor: ModelMapDownlinkDescriptor<M, K, V, KU, VU>): ModelMapDownlinkConstructor<M, K, V, KU, VU>;
}

export interface ModelMapDownlink<M extends Model, K, V, KU = K, VU = V> extends ModelDownlink<M>, OrderedMap<K, V> {
  (key: K | KU): V | undefined;
  (key: K | KU, value: V | VU): M;
}

export function ModelMapDownlink<M extends Model, K, V, KU = K, VU = V, I = {}>(descriptor: ModelMapDownlinkDescriptorExtends<M, K, V, KU, VU, I>): PropertyDecorator;
export function ModelMapDownlink<M extends Model, K, V, KU = K, VU = V>(descriptor: {keyForm: Form<K, KU>; valueForm: Form<V, VU>} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator;
export function ModelMapDownlink<M extends Model, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(descriptor: ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator;

export function ModelMapDownlink<M extends Model, K, V, KU, VU>(
    this: ModelMapDownlink<M, K, V, KU, VU> | typeof ModelMapDownlink,
    model: M | ModelMapDownlinkDescriptor<M, K, V, KU, VU>,
    downlinkName?: string
  ): ModelMapDownlink<M, K, V, KU, VU> | PropertyDecorator {
  if (this instanceof ModelMapDownlink) { // constructor
    return ModelMapDownlinkConstructor.call(this, model as M, downlinkName);
  } else { // decorator factory
    return ModelMapDownlinkDecoratorFactory(model as ModelMapDownlinkDescriptor<M, K, V, KU, VU>);
  }
}
__extends(ModelMapDownlink, ModelDownlink);
ModelDownlink.Map = ModelMapDownlink;

function ModelMapDownlinkConstructor<M extends Model, K, V, KU, VU>(this: ModelMapDownlink<M, K, V, KU, VU>, model: M, downlinkName: string | undefined): ModelMapDownlink<M, K, V, KU, VU> {
  const _this: ModelMapDownlink<M, K, V, KU, VU> = ModelDownlink.call(this, model, downlinkName) || this;
  return _this;
}

function ModelMapDownlinkDecoratorFactory<M extends Model, K, V, KU, VU>(descriptor: ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator {
  return Model.decorateModelDownlink.bind(Model, ModelMapDownlink.define(descriptor as ModelMapDownlinkDescriptorExtends<M, K, V, KU, VU>));
}

ModelMapDownlink.prototype.keyForm = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, keyForm?: Form<K, KU> | null): Form<K, KU> | null | ModelMapDownlink<Model, K, V, KU, VU> {
  if (keyForm === void 0) {
    return this._keyForm !== void 0 ? this._keyForm : null;
  } else {
    if (keyForm === null) {
      keyForm = void 0;
    }
    if (this._keyForm !== keyForm) {
      this._keyForm = keyForm;
      this.relink();
    }
    return this;
  }
} as {(): Form<any, any> | null; (valueForm: Form<any, any> | null): ModelMapDownlink<any, any, any>};

ModelMapDownlink.prototype.valueForm = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, valueForm?: Form<V, VU> | null): Form<V, VU> | null | ModelMapDownlink<Model, K, V, KU, VU> {
  if (valueForm === void 0) {
    return this._valueForm !== void 0 ? this._valueForm : null;
  } else {
    if (valueForm === null) {
      valueForm = void 0;
    }
    if (this._valueForm !== valueForm) {
      this._valueForm = valueForm;
      this.relink();
    }
    return this;
  }
} as {(): Form<any, any> | null; (valueForm: Form<any, any> | null): ModelMapDownlink<any, any, any>};

Object.defineProperty(ModelMapDownlink.prototype, "size", {
  get: function (this: ModelMapDownlink<Model, unknown, unknown>): number {
    const downlink = this._downlink;
    return downlink !== null ? downlink.size : 0;
  },
  enumerable: true,
  configurable: true,
});

ModelMapDownlink.prototype.isEmpty = function (this: ModelMapDownlink<Model, unknown, unknown>): boolean {
  const downlink = this._downlink;
  return downlink !== null ? downlink.isEmpty() : true;
};

ModelMapDownlink.prototype.has = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, key: K | KU): boolean {
  const downlink = this._downlink;
  return downlink !== null ? downlink.has(key) : false;
};

ModelMapDownlink.prototype.get = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, key: K | KU): V | undefined {
  const downlink = this._downlink;
  let value: V | undefined;
  if (downlink !== null) {
    value = downlink.get(key);
  }
  if (value === void 0 && this._valueForm !== void 0) {
    value = this._valueForm.unit();
  }
  return value;
};

ModelMapDownlink.prototype.getEntry = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, index: number): [K, V] | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.getEntry(index) : void 0;
};

ModelMapDownlink.prototype.firstKey = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>): K | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.firstKey() : void 0;
};

ModelMapDownlink.prototype.firstValue = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>): V | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.firstValue() : void 0;
};

ModelMapDownlink.prototype.firstEntry = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>): [K, V] | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.firstEntry() : void 0;
};

ModelMapDownlink.prototype.lastKey = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>): K | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.lastKey() : void 0;
};

ModelMapDownlink.prototype.lastValue = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>): V | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.lastValue() : void 0;
};

ModelMapDownlink.prototype.lastEntry = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>): [K, V] | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.lastEntry() : void 0;
};

ModelMapDownlink.prototype.nextKey = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, keyObject: K): K | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.nextKey(keyObject) : void 0;
};

ModelMapDownlink.prototype.nextValue = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, keyObject: K): V | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.nextValue(keyObject) : void 0;
};

ModelMapDownlink.prototype.nextEntry = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, keyObject: K): [K, V] | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.nextEntry(keyObject) : void 0;
};

ModelMapDownlink.prototype.previousKey = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, keyObject: K): K | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.previousKey(keyObject) : void 0;
};

ModelMapDownlink.prototype.previousValue = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, keyObject: K): V | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.previousValue(keyObject) : void 0;
};

ModelMapDownlink.prototype.previousEntry = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, keyObject: K): [K, V] | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.previousEntry(keyObject) : void 0;
};

ModelMapDownlink.prototype.set = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, key: K | KU, newValue: V | VU): ModelMapDownlink<Model, K, V, KU, VU> {
  const downlink = this._downlink;
  if (downlink !== null) {
    downlink.set(key, newValue);
  }
  return this;
};

ModelMapDownlink.prototype.delete = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, key: K | KU): boolean {
  const downlink = this._downlink;
  return downlink !== null ? downlink.delete(key) : false;
};

ModelMapDownlink.prototype.drop = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, lower: number): ModelMapDownlink<Model, K, V, KU, VU> {
  const downlink = this._downlink;
  if (downlink !== null) {
    downlink.drop(lower);
  }
  return this;
};

ModelMapDownlink.prototype.take = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, upper: number): ModelMapDownlink<Model, K, V, KU, VU> {
  const downlink = this._downlink;
  if (downlink !== null) {
    downlink.take(upper);
  }
  return this;
};

ModelMapDownlink.prototype.clear = function (this: ModelMapDownlink<Model, unknown, unknown>): void {
  const downlink = this._downlink;
  if (downlink !== null) {
    downlink.clear();
  }
};

ModelMapDownlink.prototype.forEach = function <K, V, KU, VU, T, S = unknown>(this: ModelMapDownlink<Model, K, V, KU, VU>,
                                                                             callback: (this: S, key: K, value: V) => T | void,
                                                                             thisArg?: S): T | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.forEach(callback, thisArg) : void 0;
};

ModelMapDownlink.prototype.keys = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>): Cursor<K> {
  const downlink = this._downlink;
  return downlink !== null ? downlink.keys() : Cursor.empty();
};

ModelMapDownlink.prototype.values = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>): Cursor<V> {
  const downlink = this._downlink;
  return downlink !== null ? downlink.values() : Cursor.empty();
};

ModelMapDownlink.prototype.entries = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>): Cursor<[K, V]> {
  const downlink = this._downlink;
  return downlink !== null ? downlink.entries() : Cursor.empty();
};

ModelMapDownlink.prototype.createDownlink = function <K, V, KU, VU>(this: ModelMapDownlink<Model, K, V, KU, VU>, warp: WarpRef): MapDownlink<K, V, KU, VU> {
  let downlink = warp.downlinkMap() as unknown as MapDownlink<K, V, KU, VU>;
  if (this._keyForm !== void 0) {
    downlink = downlink.keyForm(this._keyForm);
  }
  if (this._valueForm !== void 0) {
    downlink = downlink.valueForm(this._valueForm);
  }
  return downlink;
};

ModelMapDownlink.define = function <M extends Model, K, V, KU, VU, I>(descriptor: ModelMapDownlinkDescriptor<M, K, V, KU, VU, I>): ModelMapDownlinkConstructor<M, K, V, KU, VU, I> {
  let _super: ModelMapDownlinkPrototype | null | undefined = descriptor.extends;
  const enabled = descriptor.enabled;
  const keyForm = descriptor.keyForm;
  const valueForm = descriptor.valueForm;
  let hostUri = descriptor.hostUri;
  let nodeUri = descriptor.nodeUri;
  let laneUri = descriptor.laneUri;
  let prio = descriptor.prio;
  let rate = descriptor.rate;
  let body = descriptor.body;
  delete descriptor.extends;
  delete descriptor.enabled;
  delete descriptor.keyForm;
  delete descriptor.valueForm;
  delete descriptor.hostUri;
  delete descriptor.nodeUri;
  delete descriptor.laneUri;
  delete descriptor.prio;
  delete descriptor.rate;
  delete descriptor.body;

  if (_super === void 0) {
    _super = ModelMapDownlink;
  }

  const _constructor = function ModelMapDownlinkAccessor(this: ModelMapDownlink<M, K, V, KU, VU>, model: M, downlinkName: string | undefined): ModelMapDownlink<M, K, V, KU, VU> {
    let _this: ModelMapDownlink<M, K, V, KU, VU> = function accessor(key: K | KU, value?: V | VU): V | undefined | M {
      if (arguments.length === 1) {
        return _this.get(key);
      } else {
        _this.set(key, value!);
        return _this._model;
      }
    } as ModelMapDownlink<M, K, V, KU, VU>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, model, downlinkName) || _this;
    if (enabled === true) {
      _this._downlinkFlags |= ModelDownlink.EnabledFlag;
    }
    if (keyForm !== void 0) {
      _this._keyForm = keyForm;
    }
    if (valueForm !== void 0) {
      _this._valueForm = valueForm;
    }
    if (hostUri !== void 0) {
      _this._hostUri = hostUri as Uri;
    }
    if (nodeUri !== void 0) {
      _this._nodeUri = nodeUri as Uri;
    }
    if (laneUri !== void 0) {
      _this._laneUri = laneUri as Uri;
    }
    if (prio !== void 0) {
      _this._prio = prio as number;
    }
    if (rate !== void 0) {
      _this._rate = rate as number;
    }
    if (body !== void 0) {
      _this._body = body as Value;
    }
    return _this;
  } as unknown as ModelMapDownlinkConstructor<M, K, V, KU, VU, I>;

  const _prototype = descriptor as unknown as ModelMapDownlink<M, K, V, KU, VU> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (typeof hostUri === "function") {
    _prototype.initHostUri = hostUri;
    hostUri = void 0;
  } else if (hostUri !== void 0) {
    hostUri = Uri.fromAny(hostUri);
  }
  if (typeof nodeUri === "function") {
    _prototype.initNodeUri = nodeUri;
    nodeUri = void 0;
  } else if (nodeUri !== void 0) {
    nodeUri = Uri.fromAny(nodeUri);
  }
  if (typeof laneUri === "function") {
    _prototype.initLaneUri = laneUri;
    laneUri = void 0;
  } else if (laneUri !== void 0) {
    laneUri = Uri.fromAny(laneUri);
  }
  if (typeof prio === "function") {
    _prototype.initPrio = prio;
    prio = void 0;
  }
  if (typeof rate === "function") {
    _prototype.initRate = rate;
    rate = void 0;
  }
  if (typeof body === "function") {
    _prototype.initBody = body;
    body = void 0;
  } else if (body !== void 0) {
    body = Value.fromAny(body);
  }

  return _constructor;
};
