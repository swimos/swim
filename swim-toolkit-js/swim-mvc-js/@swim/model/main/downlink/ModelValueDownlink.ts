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
import {AnyValue, Value, Form} from "@swim/structure";
import {Uri} from "@swim/uri";
import {ValueDownlinkObserver, ValueDownlink, WarpRef} from "@swim/client";
import {Model} from "../Model";
import {ModelDownlinkInit, ModelDownlink} from "./ModelDownlink";

export interface ModelValueDownlinkInit<V, VU = V> extends ModelDownlinkInit, ValueDownlinkObserver<V, VU> {
  extends?: ModelValueDownlinkPrototype;
  valueForm?: Form<V, VU>;

  initDownlink?(downlink: ValueDownlink<V, VU>): ValueDownlink<V, VU>;
}

export type ModelValueDownlinkDescriptorInit<M extends Model, V, VU = V, I = {}> = ModelValueDownlinkInit<V, VU> & ThisType<ModelValueDownlink<M, V, VU> & I> & I;

export type ModelValueDownlinkDescriptorExtends<M extends Model, V, VU = V, I = {}> = {extends: ModelValueDownlinkPrototype | undefined} & ModelValueDownlinkDescriptorInit<M, V, VU, I>;

export type ModelValueDownlinkDescriptor<M extends Model, V, VU = V, I = {}> = ModelValueDownlinkDescriptorInit<M, V, VU, I>;

export type ModelValueDownlinkPrototype = Function & {prototype: ModelValueDownlink<any, any, any>};

export type ModelValueDownlinkConstructor<M extends Model, V, VU = V, I = {}> = {
  new(model: M, downlinkName: string | undefined): ModelValueDownlink<M, V, VU> & I;
  prototype: ModelValueDownlink<any, any, any> & I;
};

export declare abstract class ModelValueDownlink<M extends Model, V, VU = V> {
  /** @hidden */
  _downlink: ValueDownlink<V, VU> | null;
  /** @hidden */
  _valueForm?: Form<V, VU>;

  constructor(model: M, downlinkName: string | undefined);

  get downlink(): ValueDownlink<V, VU> | null;

  valueForm(): Form<V, VU> | null;
  valueForm(valueForm: Form<V, VU> | null): this;

  get(): V | undefined;

  set(value: V | VU): void;

  /** @hidden */
  createDownlink(warp: WarpRef): ValueDownlink<V, VU>;

  /** @hidden */
  scopeDownlink(downlink: ValueDownlink<V, VU>): ValueDownlink<V, VU>;

  /** @hidden */
  initDownlink?(downlink: ValueDownlink<V, VU>): ValueDownlink<V, VU>;

  static define<M extends Model, V, VU = V, I = {}>(descriptor: ModelValueDownlinkDescriptorExtends<M, V, VU, I>): ModelValueDownlinkConstructor<M, V, VU, I>;
  static define<M extends Model, V, VU = V>(descriptor: {valueForm: Form<V, VU>} & ModelValueDownlinkDescriptor<M, V, VU>): ModelValueDownlinkConstructor<M, V, VU>;
  static define<M extends Model, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ModelValueDownlinkDescriptor<M, V, VU>): ModelValueDownlinkConstructor<M, V, VU>;
}

export interface ModelValueDownlink<M extends Model, V, VU = V> extends ModelDownlink<M> {
  (): V | undefined;
  (value: V | VU): M;
}

export function ModelValueDownlink<M extends Model, V, VU = V, I = {}>(descriptor: ModelValueDownlinkDescriptorExtends<M, V, VU, I>): PropertyDecorator;
export function ModelValueDownlink<M extends Model, V, VU = V>(descriptor: {valueForm: Form<V, VU>} & ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator;
export function ModelValueDownlink<M extends Model, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator;

export function ModelValueDownlink<M extends Model, V, VU>(
    this: ModelValueDownlink<M, V, VU> | typeof ModelValueDownlink,
    model: M | ModelValueDownlinkDescriptor<M, V, VU>,
    downlinkName?: string
  ): ModelValueDownlink<M, V, VU> | PropertyDecorator {
  if (this instanceof ModelValueDownlink) { // constructor
    return ModelValueDownlinkConstructor.call(this, model as M, downlinkName);
  } else { // decorator factory
    return ModelValueDownlinkDecoratorFactory(model as ModelValueDownlinkDescriptor<M, V, VU>);
  }
}
__extends(ModelValueDownlink, ModelDownlink);
ModelDownlink.Value = ModelValueDownlink;

function ModelValueDownlinkConstructor<M extends Model, V, VU>(this: ModelValueDownlink<M, V, VU>, model: M, downlinkName: string | undefined): ModelValueDownlink<M, V, VU> {
  const _this: ModelValueDownlink<M, V, VU> = ModelDownlink.call(this, model, downlinkName) || this;
  return _this;
}

function ModelValueDownlinkDecoratorFactory<M extends Model, V, VU>(descriptor: ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator {
  return Model.decorateModelDownlink.bind(Model, ModelValueDownlink.define(descriptor as ModelValueDownlinkDescriptorExtends<M, V, VU>));
}

ModelValueDownlink.prototype.valueForm = function <V, VU>(this: ModelValueDownlink<Model, V, VU>, valueForm?: Form<V, VU> | null): Form<V, VU> | null | ModelValueDownlink<Model, V, VU> {
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
} as {(): Form<any, any> | null; (valueForm: Form<any, any> | null): ModelValueDownlink<any, any, any>};

ModelValueDownlink.prototype.get = function <V>(this: ModelValueDownlink<Model, V>): V | undefined {
  const downlink = this._downlink;
  return downlink !== null ? downlink.get() : void 0;
};

ModelValueDownlink.prototype.set = function <V, VU>(this: ModelValueDownlink<Model, V, VU>, value: V | VU): void {
  const downlink = this._downlink;
  if (downlink !== null) {
    downlink.set(value);
  }
};

ModelValueDownlink.prototype.createDownlink = function <V, VU>(this: ModelValueDownlink<Model, V, VU>, warp: WarpRef): ValueDownlink<V, VU> {
  let downlink = warp.downlinkValue() as unknown as ValueDownlink<V, VU>;
  if (this._valueForm !== void 0) {
    downlink = downlink.valueForm(this._valueForm);
  }
  return downlink;
};

ModelValueDownlink.define = function <M extends Model, V, VU, I>(descriptor: ModelValueDownlinkDescriptor<M, V, VU, I>): ModelValueDownlinkConstructor<M, V, VU, I> {
  let _super: ModelValueDownlinkPrototype | null | undefined = descriptor.extends;
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
    _super = ModelValueDownlink;
  }

  const _constructor = function ModelValueDownlinkAccessor(this: ModelValueDownlink<M, V, VU>, model: M, downlinkName: string | undefined): ModelValueDownlink<M, V, VU> {
    let _this: ModelValueDownlink<M, V, VU> = function accessor(value?: V | VU): V | undefined | M {
      if (arguments.length === 0) {
        return _this.get();
      } else {
        _this.set(value!);
        return _this._model;
      }
    } as ModelValueDownlink<M, V, VU>;
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
  } as unknown as ModelValueDownlinkConstructor<M, V, VU, I>;

  const _prototype = descriptor as unknown as ModelValueDownlink<M, V, VU> & I;
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
