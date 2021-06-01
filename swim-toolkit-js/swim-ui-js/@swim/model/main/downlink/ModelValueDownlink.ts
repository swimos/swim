// Copyright 2015-2021 Swim inc.
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
import type {ValueDownlinkObserver, ValueDownlink, WarpRef} from "@swim/client";
import {ModelDownlinkContext} from "./ModelDownlinkContext";
import {ModelDownlinkInit, ModelDownlink} from "./ModelDownlink";

export interface ModelValueDownlinkInit<V, VU = never> extends ModelDownlinkInit, ValueDownlinkObserver<V, VU> {
  extends?: ModelValueDownlinkClass;
  valueForm?: Form<V, VU>;

  initDownlink?(downlink: ValueDownlink<V, VU>): ValueDownlink<V, VU>;
}

export type ModelValueDownlinkDescriptor<M extends ModelDownlinkContext, V, VU = never, I = {}> = ModelValueDownlinkInit<V, VU> & ThisType<ModelValueDownlink<M, V, VU> & I> & Partial<I>;

export type ModelValueDownlinkDescriptorExtends<M extends ModelDownlinkContext, V, VU = never, I = {}> = {extends: ModelValueDownlinkClass | undefined} & ModelValueDownlinkDescriptor<M, V, VU, I>;

export interface ModelValueDownlinkConstructor<M extends ModelDownlinkContext, V, VU = never, I = {}> {
  new(owner: M, downlinkName: string | undefined): ModelValueDownlink<M, V, VU> & I;
  prototype: ModelValueDownlink<any, any> & I;
}

export interface ModelValueDownlinkClass extends Function {
  readonly prototype: ModelValueDownlink<any, any>;
}

export interface ModelValueDownlink<M extends ModelDownlinkContext, V = Value, VU = never> extends ModelDownlink<M> {
  (): V | undefined;
  (value: V | VU): M;

  readonly downlink: ValueDownlink<V, VU> | null;

  /** @hidden */
  ownValueForm: Form<V, VU> | null;

  valueForm(): Form<V, VU> | null;
  valueForm(valueForm: Form<V, VU> | null): this;

  get(): V | undefined;

  set(value: V | VU): void;

  /** @hidden */
  createDownlink(warp: WarpRef): ValueDownlink<V, VU>;

  /** @hidden */
  bindDownlink(downlink: ValueDownlink<V, VU>): ValueDownlink<V, VU>;

  /** @hidden */
  initDownlink?(downlink: ValueDownlink<V, VU>): ValueDownlink<V, VU>;
}

export const ModelValueDownlink = function <M extends ModelDownlinkContext, V, VU>(
    this: ModelValueDownlink<M, V, VU> | typeof ModelValueDownlink,
    owner: M | ModelValueDownlinkDescriptor<M, V, VU>,
    downlinkName?: string
  ): ModelValueDownlink<M, V, VU> | PropertyDecorator {
  if (this instanceof ModelValueDownlink) { // constructor
    return ModelValueDownlinkConstructor.call(this as ModelValueDownlink<ModelDownlinkContext, unknown, unknown>, owner as M, downlinkName);
  } else { // decorator factory
    return ModelValueDownlinkDecoratorFactory(owner as ModelValueDownlinkDescriptor<M, V, VU>);
  }
} as {
  /** @hidden */
  new<M extends ModelDownlinkContext, V, VU = never>(owner: M, downlinkName: string | undefined): ModelValueDownlink<M, V, VU>;

  <M extends ModelDownlinkContext, V, VU = never, I = {}>(descriptor: ModelValueDownlinkDescriptorExtends<M, V, VU, I>): PropertyDecorator;
  <M extends ModelDownlinkContext, V, VU = never>(descriptor: {valueForm: Form<V, VU>} & ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator;
  <M extends ModelDownlinkContext, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator;

  /** @hidden */
  prototype: ModelValueDownlink<any, any>;

  define<M extends ModelDownlinkContext, V, VU = never, I = {}>(descriptor: ModelValueDownlinkDescriptorExtends<M, V, VU, I>): ModelValueDownlinkConstructor<M, V, VU, I>;
  define<M extends ModelDownlinkContext, V, VU = never>(descriptor: {valueForm: Form<V, VU>} & ModelValueDownlinkDescriptor<M, V, VU>): ModelValueDownlinkConstructor<M, V, VU>;
  define<M extends ModelDownlinkContext, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: ModelValueDownlinkDescriptor<M, V, VU>): ModelValueDownlinkConstructor<M, V, VU>;
};
__extends(ModelValueDownlink, ModelDownlink);

function ModelValueDownlinkConstructor<M extends ModelDownlinkContext, V, VU>(this: ModelValueDownlink<M, V, VU>, owner: M, downlinkName: string | undefined): ModelValueDownlink<M, V, VU> {
  const _this: ModelValueDownlink<M, V, VU> = (ModelDownlink as Function).call(this, owner, downlinkName) || this;
  Object.defineProperty(_this, "ownValueForm", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return _this;
}

function ModelValueDownlinkDecoratorFactory<M extends ModelDownlinkContext, V, VU>(descriptor: ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator {
  return ModelDownlinkContext.decorateModelDownlink.bind(ModelDownlinkContext, ModelValueDownlink.define(descriptor as ModelValueDownlinkDescriptor<ModelDownlinkContext, Value>));
}

ModelValueDownlink.prototype.valueForm = function <V, VU>(this: ModelValueDownlink<ModelDownlinkContext, V, VU>, valueForm?: Form<V, VU> | null): Form<V, VU> | null | ModelValueDownlink<ModelDownlinkContext, V, VU> {
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
} as typeof ModelValueDownlink.prototype.valueForm;

ModelValueDownlink.prototype.get = function <V>(this: ModelValueDownlink<ModelDownlinkContext, V>): V | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.get() : void 0;
};

ModelValueDownlink.prototype.set = function <V, VU>(this: ModelValueDownlink<ModelDownlinkContext, V, VU>, value: V | VU): void {
  const downlink = this.downlink;
  if (downlink !== null) {
    downlink.set(value);
  }
};

ModelValueDownlink.prototype.createDownlink = function <V, VU>(this: ModelValueDownlink<ModelDownlinkContext, V, VU>, warp: WarpRef): ValueDownlink<V, VU> {
  let downlink = warp.downlinkValue() as unknown as ValueDownlink<V, VU>;
  if (this.ownValueForm !== null) {
    downlink = downlink.valueForm(this.ownValueForm);
  }
  return downlink;
};

ModelValueDownlink.define = function <M extends ModelDownlinkContext, V, VU, I>(descriptor: ModelValueDownlinkDescriptor<M, V, VU, I>): ModelValueDownlinkConstructor<M, V, VU, I> {
  let _super: ModelValueDownlinkClass | null | undefined = descriptor.extends;
  const valueForm = descriptor.valueForm;
  let hostUri = descriptor.hostUri;
  let nodeUri = descriptor.nodeUri;
  let laneUri = descriptor.laneUri;
  let prio = descriptor.prio;
  let rate = descriptor.rate;
  let body = descriptor.body;
  delete descriptor.extends;
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

  const _constructor = function DecoratedModelValueDownlink(this: ModelValueDownlink<M, V, VU>, owner: M, downlinkName: string | undefined): ModelValueDownlink<M, V, VU> {
    let _this: ModelValueDownlink<M, V, VU> = function ModelValueDownlinkAccessor(value?: V | VU): V | undefined | M {
      if (arguments.length === 0) {
        return _this.get();
      } else {
        _this.set(value!);
        return _this.owner;
      }
    } as ModelValueDownlink<M, V, VU>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, downlinkName) || _this;
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
  } as unknown as ModelValueDownlinkConstructor<M, V, VU, I>;

  const _prototype = descriptor as unknown as ModelValueDownlink<any, any> & I;
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
