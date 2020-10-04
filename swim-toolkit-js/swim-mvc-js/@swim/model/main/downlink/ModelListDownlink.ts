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
import {Cursor} from "@swim/util";
import {AnyValue, Value, Form} from "@swim/structure";
import {Uri} from "@swim/uri";
import {ListDownlinkObserver, ListDownlink, WarpRef} from "@swim/client";
import {Model} from "../Model";
import {ModelDownlinkInit, ModelDownlink} from "./ModelDownlink";

export interface ModelListDownlinkInit<V, VU = V> extends ModelDownlinkInit, ListDownlinkObserver<V, VU> {
  extends?: ModelListDownlinkPrototype;
  valueForm?: Form<V, VU>;

  initDownlink?(downlink: ListDownlink<V, VU>): ListDownlink<V, VU>;
}

export type ModelListDownlinkDescriptorInit<M extends Model, V, VU = V, I = {}> = ModelListDownlinkInit<V, VU> & ThisType<ModelListDownlink<M, V, VU> & I> & I;

export type ModelListDownlinkDescriptorExtends<M extends Model, V, VU = V, I = {}> = {extends: ModelListDownlinkPrototype | undefined} & ModelListDownlinkDescriptorInit<M, V, VU, I>;

export type ModelListDownlinkDescriptor<M extends Model, V, VU = V, I = {}> = ModelListDownlinkDescriptorInit<M, V, VU, I>;

export type ModelListDownlinkPrototype = Function & {prototype: ModelListDownlink<any, any, any>};

export type ModelListDownlinkConstructor<M extends Model, V, VU = V, I = {}> = {
  new(model: M, downlinkName: string | undefined): ModelListDownlink<M, V, VU> & I;
  prototype: ModelListDownlink<any, any, any> & I;
};

export declare abstract class ModelListDownlink<M extends Model, V, VU = V> {
  /** @hidden */
  _downlink: ListDownlink<V, VU> | null;
  /** @hidden */
  _valueForm?: Form<V, VU>;

  constructor(model: M, downlinkName: string | undefined);

  get downlink(): ListDownlink<V, VU> | null;

  valueForm(): Form<V, VU> | null;
  valueForm(valueForm: Form<V, VU> | null): this;

  get length(): number;

  isEmpty(): boolean;

  get(index: number, id?: Value): V | undefined;

  getEntry(index: number, id?: Value): [V, Value] | undefined;

  set(index: number, newObject: V | VU, id?: Value): this;

  insert(index: number, newObject: V | VU, id?: Value): this;

  remove(index: number, id?: Value): this;

  push(...newObjects: (V | VU)[]): number;

  pop(): V | undefined;

  unshift(...newObjects: (V | VU)[]): number;

  shift(): V | undefined;

  move(fromIndex: number, toIndex: number, id?: Value): this;

  splice(start: number, deleteCount?: number, ...newObjects: (V | VU)[]): V[];

  clear(): void;

  forEach<T, S = unknown>(callback: (this: S, value: V, index: number, id: Value) => T | void,
                          thisArg?: S): T | undefined;

  values(): Cursor<V>;

  keys(): Cursor<Value>;

  entries(): Cursor<[Value, V]>;

  /** @hidden */
  createDownlink(warp: WarpRef): ListDownlink<V, VU>;

  /** @hidden */
  scopeDownlink(downlink: ListDownlink<V, VU>): ListDownlink<V, VU>;

  /** @hidden */
  initDownlink?(downlink: ListDownlink<V, VU>): ListDownlink<V, VU>;

  static define<M extends Model, V, VU = V, I = {}>(descriptor: ModelListDownlinkDescriptorExtends<M, V, VU, I>): ModelListDownlinkConstructor<M, V, VU, I>;
  static define<M extends Model, V, VU = V>(descriptor: {valueForm: Form<V, VU>} & ModelListDownlinkDescriptor<M, V, VU>): ModelListDownlinkConstructor<M, V, VU>;
  static define<M extends Model, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ModelListDownlinkDescriptor<M, V, VU>): ModelListDownlinkConstructor<M, V, VU>;
}

export interface ModelListDownlink<M extends Model, V, VU = V> extends ModelDownlink<M> {
  (index: number): V | undefined;
  (index: number, newObject: V | VU): M;
}

export function ModelListDownlink<M extends Model, V, VU = V, I = {}>(descriptor: ModelListDownlinkDescriptorExtends<M, V, VU, I>): PropertyDecorator;
export function ModelListDownlink<M extends Model, V, VU = V>(descriptor: {valueForm: Form<V, VU>} & ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator;
export function ModelListDownlink<M extends Model, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator;

export function ModelListDownlink<M extends Model, V, VU>(
    this: ModelListDownlink<M, V, VU> | typeof ModelListDownlink,
    model: M | ModelListDownlinkDescriptor<M, V, VU>,
    downlinkName?: string
  ): ModelListDownlink<M, V, VU> | PropertyDecorator {
  if (this instanceof ModelListDownlink) { // constructor
    return ModelListDownlinkConstructor.call(this, model as M, downlinkName);
  } else { // decorator factory
    return ModelListDownlinkDecoratorFactory(model as ModelListDownlinkDescriptor<M, V, VU>);
  }
}
__extends(ModelListDownlink, ModelDownlink);
ModelDownlink.List = ModelListDownlink;

function ModelListDownlinkConstructor<M extends Model, V, VU>(this: ModelListDownlink<M, V, VU>, model: M, downlinkName: string | undefined): ModelListDownlink<M, V, VU> {
  const _this: ModelListDownlink<M, V, VU> = ModelDownlink.call(this, model, downlinkName) || this;
  return _this;
}

function ModelListDownlinkDecoratorFactory<M extends Model, V, VU>(descriptor: ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator {
  return Model.decorateModelDownlink.bind(Model, ModelListDownlink.define(descriptor as ModelListDownlinkDescriptorExtends<M, V, VU>));
}

ModelListDownlink.prototype.valueForm = function <V, VU>(this: ModelListDownlink<Model, V, VU>, valueForm?: Form<V, VU> | null): Form<V, VU> | null | ModelListDownlink<Model, V, VU> {
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
} as {(): Form<any, any> | null; (valueForm: Form<any, any> | null): ModelListDownlink<any, any, any>};

Object.defineProperty(ModelListDownlink.prototype, "length", {
  get: function <M extends Model>(this: ModelListDownlink<M, unknown>): number {
    const downlink = this._downlink;
    return downlink !== null ? downlink.length : 0;
  },
  enumerable: true,
  configurable: true,
});

ModelListDownlink.prototype.isEmpty = function (this: ModelListDownlink<Model, unknown>): boolean {
  const downlink = this._downlink;
  return downlink !== null ? downlink.isEmpty() : true;
};

ModelListDownlink.prototype.get = function <V>(this: ModelListDownlink<Model, V>, index: number, id?: Value): V | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.get(index, id) : void 0;
};

ModelListDownlink.prototype.getEntry = function <V, VU>(this: ModelListDownlink<Model, V, VU>, index: number, id?: Value): [V, Value] | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.getEntry(index, id) : void 0;
};

ModelListDownlink.prototype.set = function <V, VU>(this: ModelListDownlink<Model, V, VU>, index: number, newObject: V | VU, id?: Value): ModelListDownlink<Model, V, VU> {
  const downlink = this._downlink;
  if (downlink != null) {
    downlink.set(index, newObject, id);
  }
  return this;
};

ModelListDownlink.prototype.insert = function <V, VU>(this: ModelListDownlink<Model, V, VU>, index: number, newObject: V | VU, id?: Value): ModelListDownlink<Model, V, VU> {
  const downlink = this._downlink;
  if (downlink != null) {
    downlink.insert(index, newObject, id);
  }
  return this;
};

ModelListDownlink.prototype.remove = function <V, VU>(this: ModelListDownlink<Model, V, VU>, index: number, id?: Value): ModelListDownlink<Model, V, VU> {
  const downlink = this._downlink;
  if (downlink != null) {
    downlink.remove(index, id);
  }
  return this;
};

ModelListDownlink.prototype.push = function <V, VU>(this: ModelListDownlink<Model, V, VU>, ...newObjects: (V | VU)[]): number {
  const downlink = this._downlink;
  return downlink !== null ? downlink.push(...newObjects) : 0;
};

ModelListDownlink.prototype.pop = function <V, VU>(this: ModelListDownlink<Model, V, VU>): V | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.pop() : void 0;
};

ModelListDownlink.prototype.unshift = function <V, VU>(this: ModelListDownlink<Model, V, VU>, ...newObjects: (V | VU)[]): number {
  const downlink = this._downlink;
  return downlink !== null ? downlink.unshift(...newObjects) : 0;
};

ModelListDownlink.prototype.shift = function <V, VU>(this: ModelListDownlink<Model, V, VU>): V | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.shift() : void 0;
};

ModelListDownlink.prototype.move = function <V, VU>(this: ModelListDownlink<Model, V, VU>, fromIndex: number, toIndex: number, id?: Value): ModelListDownlink<Model, V, VU> {
  const downlink = this._downlink;
  if (downlink != null) {
    downlink.move(fromIndex, toIndex, id);
  }
  return this;
};

ModelListDownlink.prototype.splice = function <V, VU>(this: ModelListDownlink<Model, V, VU>, start: number, deleteCount?: number, ...newObjects: (V | VU)[]): V[] {
  const downlink = this._downlink;
  return downlink !== null ? downlink.splice(start, deleteCount, ...newObjects) : [];
};

ModelListDownlink.prototype.clear = function (this: ModelListDownlink<Model, unknown>): void {
  const downlink = this._downlink;
  if (downlink != null) {
    downlink.clear();
  }
};

ModelListDownlink.prototype.forEach = function <V, VU, T, S = unknown>(this: ModelListDownlink<Model, V, VU>,
                                                                       callback: (this: S, value: V, index: number, id: Value) => T | void,
                                                                       thisArg?: S): T | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.forEach(callback, thisArg) : void 0;
};

ModelListDownlink.prototype.values = function <V, VU>(this: ModelListDownlink<Model, V, VU>): Cursor<V> {
  const downlink = this._downlink;
  return downlink !== null ? downlink.values() : Cursor.empty();
};

ModelListDownlink.prototype.keys = function <V, VU>(this: ModelListDownlink<Model, V, VU>): Cursor<Value> {
  const downlink = this._downlink;
  return downlink !== null ? downlink.keys() : Cursor.empty();
};

ModelListDownlink.prototype.entries = function <V, VU>(this: ModelListDownlink<Model, V, VU>): Cursor<[Value, V]> {
  const downlink = this._downlink;
  return downlink !== null ? downlink.entries() : Cursor.empty();
};

ModelListDownlink.prototype.createDownlink = function <V, VU>(this: ModelListDownlink<Model, V, VU>, warp: WarpRef): ListDownlink<V, VU> {
  let downlink = warp.downlinkValue() as unknown as ListDownlink<V, VU>;
  if (this._valueForm !== void 0) {
    downlink = downlink.valueForm(this._valueForm);
  }
  return downlink;
};

ModelListDownlink.define = function <M extends Model, V, VU, I>(descriptor: ModelListDownlinkDescriptor<M, V, VU, I>): ModelListDownlinkConstructor<M, V, VU, I> {
  let _super: ModelListDownlinkPrototype | null | undefined = descriptor.extends;
  const enabled = descriptor.enabled;
  const valueForm = descriptor.valueForm;
  let hostUri = descriptor.hostUri;
  let nodeUri = descriptor.nodeUri;
  let laneUri = descriptor.laneUri;
  let prio = descriptor.prio;
  let rate = descriptor.rate;
  let body = descriptor.body;
  delete descriptor.extends;
  delete descriptor.enabled;
  delete descriptor.valueForm;
  delete descriptor.hostUri;
  delete descriptor.nodeUri;
  delete descriptor.laneUri;
  delete descriptor.prio;
  delete descriptor.rate;
  delete descriptor.body;

  if (_super === void 0) {
    _super = ModelListDownlink;
  }

  const _constructor = function ModelListDownlinkAccessor(this: ModelListDownlink<M, V, VU>, model: M, downlinkName: string | undefined): ModelListDownlink<M, V, VU> {
    let _this: ModelListDownlink<M, V, VU> = function accessor(index: number, value?: V | VU): V | undefined | M {
      if (arguments.length === 0) {
        return _this.get(index);
      } else {
        _this.set(index, value!);
        return _this._model;
      }
    } as ModelListDownlink<M, V, VU>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, model, downlinkName) || _this;
    if (enabled === true) {
      _this._downlinkFlags |= ModelDownlink.EnabledFlag;
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
  } as unknown as ModelListDownlinkConstructor<M, V, VU, I>;

  const _prototype = descriptor as unknown as ModelListDownlink<M, V, VU> & I;
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
