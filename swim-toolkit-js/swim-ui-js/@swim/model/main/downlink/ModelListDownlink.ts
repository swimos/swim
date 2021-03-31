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
import type {ListDownlinkObserver, ListDownlink, WarpRef} from "@swim/client";
import {ModelDownlinkContext} from "./ModelDownlinkContext";
import {ModelDownlinkInit, ModelDownlink} from "./ModelDownlink";

export interface ModelListDownlinkInit<V, VU = never> extends ModelDownlinkInit, ListDownlinkObserver<V, VU> {
  extends?: ModelListDownlinkClass;
  valueForm?: Form<V, VU>;

  initDownlink?(downlink: ListDownlink<V, VU>): ListDownlink<V, VU>;
}

export type ModelListDownlinkDescriptor<M extends ModelDownlinkContext, V, VU = never, I = {}> = ModelListDownlinkInit<V, VU> & ThisType<ModelListDownlink<M, V, VU> & I> & Partial<I>;

export type ModelListDownlinkDescriptorExtends<M extends ModelDownlinkContext, V, VU = never, I = {}> = {extends: ModelListDownlinkClass | undefined} & ModelListDownlinkDescriptor<M, V, VU, I>;

export interface ModelListDownlinkConstructor<M extends ModelDownlinkContext, V, VU = never, I = {}> {
  new(owner: M, downlinkName: string | undefined): ModelListDownlink<M, V, VU> & I;
  prototype: ModelListDownlink<any, any> & I;
}

export interface ModelListDownlinkClass extends Function {
  readonly prototype: ModelListDownlink<any, any>;
}

export interface ModelListDownlink<M extends ModelDownlinkContext, V = Value, VU = never> extends ModelDownlink<M> {
  (index: number): V | undefined;
  (index: number, newObject: V | VU): M;

  readonly downlink: ListDownlink<V, VU> | null;

  /** @hidden */
  readonly ownValueForm: Form<V, VU> | null;

  valueForm(): Form<V, VU> | null;
  valueForm(valueForm: Form<V, VU> | null): this;

  readonly length: number;

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

  forEach<T>(callback: (value: V, index: number, id: Value) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, value: V, index: number, id: Value) => T | void,
                thisArg: S): T | undefined;

  values(): Cursor<V>;

  keys(): Cursor<Value>;

  entries(): Cursor<[Value, V]>;

  /** @hidden */
  createDownlink(warp: WarpRef): ListDownlink<V, VU>;

  /** @hidden */
  bindDownlink(downlink: ListDownlink<V, VU>): ListDownlink<V, VU>;

  /** @hidden */
  initDownlink?(downlink: ListDownlink<V, VU>): ListDownlink<V, VU>;
}

export const ModelListDownlink = function <M extends ModelDownlinkContext, V, VU>(
    this: ModelListDownlink<M, V, VU> | typeof ModelListDownlink,
    owner: M | ModelListDownlinkDescriptor<M, V, VU>,
    downlinkName?: string
  ): ModelListDownlink<M, V, VU> | PropertyDecorator {
  if (this instanceof ModelListDownlink) { // constructor
    return ModelListDownlinkConstructor.call(this as ModelListDownlink<ModelDownlinkContext, unknown, unknown>, owner as M, downlinkName) as ModelListDownlink<M, V, VU>;
  } else { // decorator factory
    return ModelListDownlinkDecoratorFactory(owner as ModelListDownlinkDescriptor<M, V, VU>);
  }
} as {
  /** @hidden */
  new<M extends ModelDownlinkContext, V, VU = never>(owner: M, downlinkName: string | undefined): ModelListDownlink<M, V, VU>;

  <M extends ModelDownlinkContext, V, VU = never, I = {}>(descriptor: ModelListDownlinkDescriptorExtends<M, V, VU, I>): PropertyDecorator;
  <M extends ModelDownlinkContext, V, VU = never>(descriptor: {valueForm: Form<V, VU>} & ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator;
  <M extends ModelDownlinkContext, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator;

  /** @hidden */
  prototype: ModelListDownlink<any>;

  define<M extends ModelDownlinkContext, V, VU = never, I = {}>(descriptor: ModelListDownlinkDescriptorExtends<M, V, VU, I>): ModelListDownlinkConstructor<M, V, VU, I>;
  define<M extends ModelDownlinkContext, V, VU = never>(descriptor: {valueForm: Form<V, VU>} & ModelListDownlinkDescriptor<M, V, VU>): ModelListDownlinkConstructor<M, V, VU>;
  define<M extends ModelDownlinkContext, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ModelListDownlinkDescriptor<M, V, VU>): ModelListDownlinkConstructor<M, V, VU>;
};
__extends(ModelListDownlink, ModelDownlink);

function ModelListDownlinkConstructor<M extends ModelDownlinkContext, V, VU>(this: ModelListDownlink<M, V, VU>, owner: M, downlinkName: string | undefined): ModelListDownlink<M, V, VU> {
  const _this: ModelListDownlink<M, V, VU> = (ModelDownlink as Function).call(this, owner, downlinkName) || this;
  Object.defineProperty(_this, "ownValueForm", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return _this;
}

function ModelListDownlinkDecoratorFactory<M extends ModelDownlinkContext, V, VU>(descriptor: ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator {
  return ModelDownlinkContext.decorateModelDownlink.bind(ModelDownlinkContext, ModelListDownlink.define(descriptor as ModelListDownlinkDescriptor<ModelDownlinkContext, Value>));
}

ModelListDownlink.prototype.valueForm = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, valueForm?: Form<V, VU> | null): Form<V, VU> | null | ModelListDownlink<ModelDownlinkContext, V, VU> {
  if (valueForm === void 0) {
    return this.ownValueForm;
  } else {
    if (this.ownValueForm !== valueForm) {
      Object.defineProperty(this, "ownValueForm", {
        value: valueForm,
        enumerable: true,
        configurable: true,
      });
      this.relink();
    }
    return this;
  }
} as typeof ModelListDownlink.prototype.valueForm;

Object.defineProperty(ModelListDownlink.prototype, "length", {
  get: function <M extends ModelDownlinkContext>(this: ModelListDownlink<M, unknown>): number {
    const downlink = this.downlink;
    return downlink !== null ? downlink.length : 0;
  },
  enumerable: true,
  configurable: true,
});

ModelListDownlink.prototype.isEmpty = function (this: ModelListDownlink<ModelDownlinkContext, unknown>): boolean {
  const downlink = this.downlink;
  return downlink !== null ? downlink.isEmpty() : true;
};

ModelListDownlink.prototype.get = function <V>(this: ModelListDownlink<ModelDownlinkContext, V>, index: number, id?: Value): V | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.get(index, id) : void 0;
};

ModelListDownlink.prototype.getEntry = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, index: number, id?: Value): [V, Value] | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.getEntry(index, id) : void 0;
};

ModelListDownlink.prototype.set = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, index: number, newObject: V | VU, id?: Value): ModelListDownlink<ModelDownlinkContext, V, VU> {
  const downlink = this.downlink;
  if (downlink != null) {
    downlink.set(index, newObject, id);
  }
  return this;
};

ModelListDownlink.prototype.insert = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, index: number, newObject: V | VU, id?: Value): ModelListDownlink<ModelDownlinkContext, V, VU> {
  const downlink = this.downlink;
  if (downlink != null) {
    downlink.insert(index, newObject, id);
  }
  return this;
};

ModelListDownlink.prototype.remove = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, index: number, id?: Value): ModelListDownlink<ModelDownlinkContext, V, VU> {
  const downlink = this.downlink;
  if (downlink != null) {
    downlink.remove(index, id);
  }
  return this;
};

ModelListDownlink.prototype.push = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, ...newObjects: (V | VU)[]): number {
  const downlink = this.downlink;
  return downlink !== null ? downlink.push(...newObjects) : 0;
};

ModelListDownlink.prototype.pop = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>): V | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.pop() : void 0;
};

ModelListDownlink.prototype.unshift = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, ...newObjects: (V | VU)[]): number {
  const downlink = this.downlink;
  return downlink !== null ? downlink.unshift(...newObjects) : 0;
};

ModelListDownlink.prototype.shift = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>): V | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.shift() : void 0;
};

ModelListDownlink.prototype.move = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, fromIndex: number, toIndex: number, id?: Value): ModelListDownlink<ModelDownlinkContext, V, VU> {
  const downlink = this.downlink;
  if (downlink != null) {
    downlink.move(fromIndex, toIndex, id);
  }
  return this;
};

ModelListDownlink.prototype.splice = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, start: number, deleteCount?: number, ...newObjects: (V | VU)[]): V[] {
  const downlink = this.downlink;
  return downlink !== null ? downlink.splice(start, deleteCount, ...newObjects) : [];
};

ModelListDownlink.prototype.clear = function (this: ModelListDownlink<ModelDownlinkContext, unknown>): void {
  const downlink = this.downlink;
  if (downlink != null) {
    downlink.clear();
  }
};

ModelListDownlink.prototype.forEach = function <V, VU, T, S>(this: ModelListDownlink<ModelDownlinkContext, V, VU>,
                                                             callback: (this: S | undefined, value: V, index: number, id: Value) => T | void,
                                                             thisArg?: S): T | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.forEach(callback, thisArg) : void 0;
};

ModelListDownlink.prototype.values = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>): Cursor<V> {
  const downlink = this.downlink;
  return downlink !== null ? downlink.values() : Cursor.empty();
};

ModelListDownlink.prototype.keys = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>): Cursor<Value> {
  const downlink = this.downlink;
  return downlink !== null ? downlink.keys() : Cursor.empty();
};

ModelListDownlink.prototype.entries = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>): Cursor<[Value, V]> {
  const downlink = this.downlink;
  return downlink !== null ? downlink.entries() : Cursor.empty();
};

ModelListDownlink.prototype.createDownlink = function <V, VU>(this: ModelListDownlink<ModelDownlinkContext, V, VU>, warp: WarpRef): ListDownlink<V, VU> {
  let downlink = warp.downlinkValue() as unknown as ListDownlink<V, VU>;
  if (this.ownValueForm !== null) {
    downlink = downlink.valueForm(this.ownValueForm);
  }
  return downlink;
};

ModelListDownlink.define = function <M extends ModelDownlinkContext, V, VU, I>(descriptor: ModelListDownlinkDescriptor<M, V, VU, I>): ModelListDownlinkConstructor<M, V, VU, I> {
  let _super: ModelListDownlinkClass | null | undefined = descriptor.extends;
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

  const _constructor = function DecoratedModelListDownlink(this: ModelListDownlink<M, V, VU>, owner: M, downlinkName: string | undefined): ModelListDownlink<M, V, VU> {
    let _this: ModelListDownlink<M, V, VU> = function ModelListDownlinkAccessor(index: number, value?: V | VU): V | undefined | M {
      if (arguments.length === 0) {
        return _this.get(index);
      } else {
        _this.set(index, value!);
        return _this.owner;
      }
    } as ModelListDownlink<M, V, VU>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, downlinkName) || _this;
    if (enabled === true) {
      Object.defineProperty(_this, "downlinkFlags", {
        value: _this.downlinkFlags | ModelDownlink.EnabledFlag,
        enumerable: true,
        configurable: true,
      });
    }
    if (valueForm !== void 0) {
      Object.defineProperty(_this, "ownValueForm", {
        value: valueForm,
        enumerable: true,
        configurable: true,
      });
    }
    if (hostUri !== void 0) {
      Object.defineProperty(_this, "ownHostUri", {
        value: hostUri as Uri,
        enumerable: true,
        configurable: true,
      });
    }
    if (nodeUri !== void 0) {
      Object.defineProperty(_this, "ownNodeUri", {
        value: nodeUri as Uri,
        enumerable: true,
        configurable: true,
      });
    }
    if (laneUri !== void 0) {
      Object.defineProperty(_this, "ownLaneUri", {
        value: laneUri as Uri,
        enumerable: true,
        configurable: true,
      });
    }
    if (prio !== void 0) {
      Object.defineProperty(_this, "ownPrio", {
        value: prio as number,
        enumerable: true,
        configurable: true,
      });
    }
    if (rate !== void 0) {
      Object.defineProperty(_this, "ownRate", {
        value: rate as number,
        enumerable: true,
        configurable: true,
      });
    }
    if (body !== void 0) {
      Object.defineProperty(_this, "ownBody", {
        value: body as Value,
        enumerable: true,
        configurable: true,
      });
    }
    return _this;
  } as unknown as ModelListDownlinkConstructor<M, V, VU, I>;

  const _prototype = descriptor as unknown as ModelListDownlink<any, any> & I;
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
