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

import {__extends} from "tslib";
import {Value} from "@swim/structure";
import {Uri} from "@swim/uri";
import type {EventDownlinkObserver, EventDownlink, WarpRef} from "@swim/client";
import {ModelDownlinkContext} from "./ModelDownlinkContext";
import {ModelDownlinkInit, ModelDownlink} from "./ModelDownlink";

export interface ModelEventDownlinkInit extends ModelDownlinkInit, EventDownlinkObserver {
  extends?: ModelEventDownlinkClass;

  initDownlink?(downlink: EventDownlink): EventDownlink;
}

export type ModelEventDownlinkDescriptor<M extends ModelDownlinkContext, I = {}> = ModelEventDownlinkInit & ThisType<ModelEventDownlink<M> & I> & Partial<I>;

export type ModelEventDownlinkDescriptorExtends<M extends ModelDownlinkContext, I = {}> = {extends: ModelEventDownlinkClass | undefined} & ModelEventDownlinkDescriptor<M, I>;

export interface ModelEventDownlinkConstructor<M extends ModelDownlinkContext, I = {}> {
  new(owner: M, downlinkName: string | undefined): ModelEventDownlink<M> & I;
  prototype: ModelEventDownlink<any> & I;
}

export interface ModelEventDownlinkClass extends Function {
  readonly prototype: ModelEventDownlink<any>;
}

export interface ModelEventDownlink<M extends ModelDownlinkContext> extends ModelDownlink<M> {
  readonly downlink: EventDownlink | null;

  /** @hidden */
  createDownlink(warp: WarpRef): EventDownlink;

  /** @hidden */
  bindDownlink(downlink: EventDownlink): EventDownlink;

  /** @hidden */
  initDownlink?(downlink: EventDownlink): EventDownlink;
}

export const ModelEventDownlink = function <M extends ModelDownlinkContext>(
    this: ModelEventDownlink<M> | typeof ModelEventDownlink,
    owner: M | ModelEventDownlinkDescriptor<M>,
    downlinkName?: string
  ): ModelEventDownlink<M> | PropertyDecorator {
  if (this instanceof ModelEventDownlink) { // constructor
    return ModelEventDownlinkConstructor.call(this, owner as M, downlinkName) as ModelEventDownlink<M>;
  } else { // decorator factory
    return ModelEventDownlinkDecoratorFactory(owner as ModelEventDownlinkDescriptor<M>);
  }
} as {
  /** @hidden */
  new<M extends ModelDownlinkContext>(owner: M, downlinkName: string | undefined): ModelEventDownlink<M>;

  <M extends ModelDownlinkContext, I = {}>(descriptor: ModelEventDownlinkDescriptorExtends<M, I>): PropertyDecorator;
  <M extends ModelDownlinkContext>(descriptor: ModelEventDownlinkDescriptor<M>): PropertyDecorator;

  /** @hidden */
  prototype: ModelEventDownlink<any>;

  define<M extends ModelDownlinkContext, I = {}>(descriptor: ModelEventDownlinkDescriptorExtends<M, I>): ModelEventDownlinkConstructor<M, I>;
  define<M extends ModelDownlinkContext>(descriptor: ModelEventDownlinkDescriptor<M>): ModelEventDownlinkConstructor<M>;
};
__extends(ModelEventDownlink, ModelDownlink);

function ModelEventDownlinkConstructor<M extends ModelDownlinkContext>(this: ModelEventDownlink<M>, owner: M, downlinkName: string | undefined): ModelEventDownlink<M> {
  const _this: ModelEventDownlink<M> = (ModelDownlink as Function).call(this, owner, downlinkName) || this;
  return _this;
}

function ModelEventDownlinkDecoratorFactory<M extends ModelDownlinkContext>(descriptor: ModelEventDownlinkDescriptor<M>): PropertyDecorator {
  return ModelDownlinkContext.decorateModelDownlink.bind(ModelDownlinkContext, ModelEventDownlink.define(descriptor as ModelEventDownlinkDescriptor<ModelDownlinkContext>));
}

ModelEventDownlink.prototype.createDownlink = function <V, VU>(this: ModelEventDownlink<ModelDownlinkContext>, warp: WarpRef): EventDownlink {
  return warp.downlink();
};

ModelEventDownlink.define = function <M extends ModelDownlinkContext, V, VU, I>(descriptor: ModelEventDownlinkDescriptor<M, I>): ModelEventDownlinkConstructor<M, I> {
  let _super: ModelEventDownlinkClass | null | undefined = descriptor.extends;
  let hostUri = descriptor.hostUri;
  let nodeUri = descriptor.nodeUri;
  let laneUri = descriptor.laneUri;
  let prio = descriptor.prio;
  let rate = descriptor.rate;
  let body = descriptor.body;
  delete descriptor.extends;
  delete descriptor.hostUri;
  delete descriptor.nodeUri;
  delete descriptor.laneUri;
  delete descriptor.prio;
  delete descriptor.rate;
  delete descriptor.body;

  if (_super === void 0) {
    _super = ModelEventDownlink;
  }

  const _constructor = function DecoratedModelEventDownlink(this: ModelDownlink<M>, owner: M, downlinkName: string | undefined): ModelEventDownlink<M> {
    const _this: ModelEventDownlink<M> = _super!.call(this, owner, downlinkName) || this;
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
  } as unknown as ModelEventDownlinkConstructor<M, I>;

  const _prototype = descriptor as unknown as ModelEventDownlink<any> & I;
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
