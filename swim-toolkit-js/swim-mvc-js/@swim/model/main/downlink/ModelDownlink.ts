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
import {Objects} from "@swim/util";
import {AnyValue, Value, Form} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import {DownlinkType, DownlinkObserver, Downlink, WarpRef} from "@swim/client";
import {Model} from "../Model";
import {
  ModelEventDownlinkDescriptorExtends,
  ModelEventDownlinkDescriptor,
  ModelEventDownlinkConstructor,
  ModelEventDownlink,
} from "./ModelEventDownlink";
import {
  ModelListDownlinkDescriptorExtends,
  ModelListDownlinkDescriptor,
  ModelListDownlinkConstructor,
  ModelListDownlink,
} from "./ModelListDownlink";
import {
  ModelMapDownlinkDescriptorExtends,
  ModelMapDownlinkDescriptor,
  ModelMapDownlinkConstructor,
  ModelMapDownlink,
} from "./ModelMapDownlink";
import {
  ModelValueDownlinkDescriptorExtends,
  ModelValueDownlinkDescriptor,
  ModelValueDownlinkConstructor,
  ModelValueDownlink,
} from "./ModelValueDownlink";

export interface ModelDownlinkInit extends DownlinkObserver {
  extends?: ModelDownlinkPrototype;
  enabled?: boolean;

  hostUri?: AnyUri | (() => AnyUri | null);
  nodeUri?: AnyUri | (() => AnyUri | null);
  laneUri?: AnyUri | (() => AnyUri | null);
  prio?: number | (() => number | null);
  rate?: number | (() => number | null);
  body?: AnyValue | (() => AnyValue | null);

  initDownlink?(downlink: Downlink): Downlink;
}

export type ModelDownlinkFlags = number;

export type ModelDownlinkDescriptorInit<M extends Model, I = {}> = ModelDownlinkInit & ThisType<ModelDownlink<M> & I> & I;

export type ModelDownlinkDescriptorExtends<M extends Model, I = {}> = {extends: ModelDownlinkPrototype | undefined, type: DownlinkType} & ModelDownlinkDescriptorInit<M, I>;

export type ModelDownlinkDescriptor<M extends Model, I = {}> = {type: DownlinkType} & ModelDownlinkDescriptorInit<M, I>;

export type ModelDownlinkPrototype = Function & {prototype: ModelDownlink<any>};

export type ModelDownlinkConstructor<M extends Model, I = {}> = {
  new(model: M, downlinkName: string | undefined): ModelDownlink<M> & I;
  prototype: ModelDownlink<any> & I;
};

export declare abstract class ModelDownlink<M extends Model> {
  /** @hidden */
  _model: M;
  /** @hidden */
  _downlink: Downlink | null;
  /** @hidden */
  _downlinkFlags: ModelDownlinkFlags;
  /** @hidden */
  _warp?: WarpRef;
  /** @hidden */
  _hostUri?: Uri;
  /** @hidden */
  _nodeUri?: Uri;
  /** @hidden */
  _laneUri?: Uri;
  /** @hidden */
  _prio?: number;
  /** @hidden */
  _rate?: number;
  /** @hidden */
  _body?: Value;

  constructor(model: M, downlinkName: string | undefined);

  get name(): string | undefined;

  get model(): M;

  get downlink(): Downlink | null;

  enabled(): boolean;
  enabled(enabled: boolean): this;

  warp(): WarpRef | null;
  warp(warp: WarpRef | null): this;

  hostUri(): Uri | null;
  hostUri(hostUri: AnyUri | null): this;

  nodeUri(): Uri | null;
  nodeUri(nodeUri: AnyUri | null): this;

  laneUri(): Uri | null;
  laneUri(laneUri: AnyUri | null): this;

  prio(): number | null;
  prio(prio: number | null): this;

  rate(): number | null;
  rate(rate: number | null): this;

  body(): Value | null;
  body(body: AnyValue | null): this;

  /** @hidden */
  link(): void;

  /** @hidden */
  unlink(): void;

  /** @hidden */
  relink(): void;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  reconcile(): void;

  /** @hidden */
  abstract createDownlink(warp: WarpRef): Downlink;

  /** @hidden */
  scopeDownlink(downlink: Downlink): Downlink;

  /** @hidden */
  initDownlink?(downlink: Downlink): Downlink;

  /** @hidden */
  initHostUri?(): AnyUri | null;

  /** @hidden */
  initNodeUri?(): AnyUri | null;

  /** @hidden */
  initLaneUri?(): AnyUri | null;

  /** @hidden */
  initPrio?(): number | null;

  /** @hidden */
  initRate?(): number | null;

  /** @hidden */
  initBody?(): AnyValue | null;

  static define<M extends Model, I = {}>(descriptor: {type: "event"} & ModelEventDownlinkDescriptorExtends<M, I>): ModelEventDownlinkConstructor<M, I>;
  static define<M extends Model>(descriptor: {type: "event"} & ModelEventDownlinkDescriptor<M>): ModelEventDownlinkConstructor<M>;

  static define<M extends Model, V, VU = V, I = {}>(descriptor: {type: "list"} & ModelListDownlinkDescriptorExtends<M, V, VU, I>): ModelListDownlinkConstructor<M, V, VU, I>;
  static define<M extends Model, V, VU = V>(descriptor: {type: "list"; valueForm: Form<V, VU>} & ModelListDownlinkDescriptor<M, V, VU>): ModelListDownlinkConstructor<M, V, VU>;
  static define<M extends Model, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: {type: "list"} & ModelListDownlinkDescriptor<M, V, VU>): ModelListDownlinkConstructor<M, V, VU>;

  static define<M extends Model, K, V, KU = K, VU = V, I = {}>(descriptor: {type: "map"} & ModelMapDownlinkDescriptorExtends<M, K, V, KU, VU, I>): ModelMapDownlinkConstructor<M, K, V, KU, VU, I>;
  static define<M extends Model, K, V, KU = K, VU = V>(descriptor: {type: "map"; keyForm: Form<K, KU>; valueForm: Form<V, VU>} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): ModelMapDownlinkConstructor<M, K, V, KU, VU>;
  static define<M extends Model, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(descriptor: {type: "map"} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): ModelMapDownlinkConstructor<M, K, V, KU, VU>;

  static define<M extends Model, V, VU = V, I = {}>(descriptor: {type: "value"} & ModelValueDownlinkDescriptorExtends<M, V, VU, I>): ModelValueDownlinkConstructor<M, V, VU, I>;
  static define<M extends Model, V, VU = V>(descriptor: {type: "value"; valueForm: Form<V, VU>} & ModelValueDownlinkDescriptor<M, V, VU>): ModelValueDownlinkConstructor<M, V, VU>;
  static define<M extends Model, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: {type: "value"} & ModelValueDownlinkDescriptor<M, V, VU>): ModelValueDownlinkConstructor<M, V, VU>;

  static define<M extends Model, I = {}>(descriptor: ModelDownlinkDescriptorExtends<M, I>): ModelDownlinkConstructor<M, I>;
  static define<M extends Model>(descriptor: ModelDownlinkDescriptor<M>): ModelDownlinkConstructor<M>;

  /** @hidden */
  static PendingFlag: ModelDownlinkFlags;
  /** @hidden */
  static EnabledFlag: ModelDownlinkFlags;
  /** @hidden */
  static RelinkMask: ModelDownlinkFlags;

  // Forward type declarations
  /** @hidden */
  static Event: typeof ModelEventDownlink; // defined by ModelEventDownlink
  /** @hidden */
  static List: typeof ModelListDownlink; // defined by ModelListDownlink
  /** @hidden */
  static Map: typeof ModelMapDownlink; // defined by ModelMapDownlink
  /** @hidden */
  static Value: typeof ModelValueDownlink; // defined by ModelValueDownlink
}

export interface ModelDownlink<M extends Model> {
}

export function ModelDownlink<M extends Model, I = {}>(descriptor: {type: "event"} & ModelEventDownlinkDescriptorExtends<M, I>): PropertyDecorator;
export function ModelDownlink<M extends Model>(descriptor: {type: "event"} & ModelEventDownlinkDescriptor<M>): PropertyDecorator;

export function ModelDownlink<M extends Model, V, VU = V, I = {}>(descriptor: {type: "list"} & ModelListDownlinkDescriptorExtends<M, V, VU, I>): PropertyDecorator;
export function ModelDownlink<M extends Model, V, VU = V>(descriptor: {type: "list"; valueForm: Form<V, VU>} & ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator;
export function ModelDownlink<M extends Model, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: {type: "list"} & ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator;

export function ModelDownlink<M extends Model, K, V, KU = K, VU = V, I = {}>(descriptor: {type: "map"} & ModelMapDownlinkDescriptorExtends<M, K, V, KU, VU, I>): PropertyDecorator;
export function ModelDownlink<M extends Model, K, V, KU = K, VU = V>(descriptor: {type: "map"; keyForm: Form<K, KU>; valueForm: Form<V, VU>} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator;
export function ModelDownlink<M extends Model, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(descriptor: {type: "map"} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator;

export function ModelDownlink<M extends Model, V, VU = V, I = {}>(descriptor: {type: "value"} & ModelValueDownlinkDescriptorExtends<M, V, VU, I>): PropertyDecorator;
export function ModelDownlink<M extends Model, V, VU = V>(descriptor: {type: "value"; valueForm: Form<V, VU>} & ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator;
export function ModelDownlink<M extends Model, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: {type: "value"} & ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator;

export function ModelDownlink<M extends Model, I = {}>(descriptor: ModelDownlinkDescriptorExtends<M, I>): PropertyDecorator;
export function ModelDownlink<M extends Model>(descriptor: ModelDownlinkDescriptor<M>): PropertyDecorator;

export function ModelDownlink<M extends Model>(
    this: ModelDownlink<M> | typeof ModelDownlink,
    model: M | ModelDownlinkDescriptor<M>,
    downlinkName?: string
  ): ModelDownlink<M> | PropertyDecorator {
  if (this instanceof ModelDownlink) { // constructor
    return ModelDownlinkConstructor.call(this, model as M, downlinkName);
  } else { // decorator factory
    return ModelDownlinkDecoratorFactory(model as ModelDownlinkDescriptor<M>);
  }
}
__extends(ModelDownlink, Object);
Model.Downlink = ModelDownlink;

function ModelDownlinkConstructor<M extends Model>(this: ModelDownlink<M>, model: M, downlinkName: string | undefined): ModelDownlink<M> {
  if (downlinkName !== void 0) {
    Object.defineProperty(this, "name", {
      value: downlinkName,
      enumerable: true,
      configurable: true,
    });
  }
  this._model = model;
  this._downlink = null;
  this._downlinkFlags = ModelDownlink.PendingFlag;
  return this;
}

function ModelDownlinkDecoratorFactory<M extends Model>(descriptor: ModelDownlinkDescriptor<M>): PropertyDecorator {
  return Model.decorateModelDownlink.bind(Model, ModelDownlink.define(descriptor));
}

Object.defineProperty(ModelDownlink.prototype, "model", {
  get: function <M extends Model>(this: ModelDownlink<M>): M {
    return this._model;
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ModelDownlink.prototype, "downlink", {
  get: function (this: ModelDownlink<Model>): Downlink | null {
    return this._downlink;
  },
  enumerable: true,
  configurable: true,
});

ModelDownlink.prototype.enabled = function (this: ModelDownlink<Model>, enabled?: boolean): boolean | ModelDownlink<Model> {
  if (enabled === void 0) {
    return (this._downlinkFlags & ModelDownlink.EnabledFlag) !== 0;
  } else {
    if (enabled && (this._downlinkFlags & ModelDownlink.EnabledFlag) === 0) {
      this._downlinkFlags |= ModelDownlink.EnabledFlag;
      this._model.requireUpdate(Model.NeedsReconcile);
    } else if (!enabled && (this._downlinkFlags & ModelDownlink.EnabledFlag) !== 0) {
      this._downlinkFlags &= ~ModelDownlink.EnabledFlag;
      this._model.requireUpdate(Model.NeedsReconcile);
    }
    return this;
  }
} as {(): boolean; (enabled: boolean): ModelDownlink<Model>};

ModelDownlink.prototype.warp = function (this: ModelDownlink<Model>, warp?: WarpRef | null): WarpRef | null | ModelDownlink<Model> {
  if (warp === void 0) {
    return this._warp !== void 0 ? this._warp : null;
  } else {
    if (warp === null) {
      warp = void 0;
    }
    if (this._warp !== warp) {
      this._warp = warp;
      this.relink();
    }
    return this;
  }
} as {(): WarpRef | null; (warp: WarpRef | null): ModelDownlink<Model>};

ModelDownlink.prototype.hostUri = function (this: ModelDownlink<Model>, hostUri?: AnyUri | null): Uri | null | ModelDownlink<Model> {
  if (hostUri === void 0) {
    if (this._hostUri !== void 0) {
      return this._hostUri;
    } else {
      hostUri = this.initHostUri !== void 0 ? this.initHostUri() : null;
      if (hostUri !== null) {
        hostUri = Uri.fromAny(hostUri);
        this._hostUri = hostUri;
      }
      return hostUri;
    }
  } else {
    if (hostUri !== null) {
      hostUri = Uri.fromAny(hostUri);
    } else {
      hostUri = void 0;
    }
    if (!Objects.equal(this._hostUri, hostUri)) {
      this._hostUri = hostUri;
      this.relink();
    }
    return this;
  }
} as {(): Uri | null; (hostUri: AnyUri | null): ModelDownlink<Model>};

ModelDownlink.prototype.nodeUri = function (this: ModelDownlink<Model>, nodeUri?: AnyUri | null): Uri | null | ModelDownlink<Model> {
  if (nodeUri === void 0) {
    if (this._nodeUri !== void 0) {
      return this._nodeUri;
    } else {
      nodeUri = this.initNodeUri !== void 0 ? this.initNodeUri() : null;
      if (nodeUri !== null) {
        nodeUri = Uri.fromAny(nodeUri);
        this._nodeUri = nodeUri;
      }
      return nodeUri;
    }
  } else {
    if (nodeUri !== null) {
      nodeUri = Uri.fromAny(nodeUri);
    } else {
      nodeUri = void 0;
    }
    if (!Objects.equal(this._nodeUri, nodeUri)) {
      this._nodeUri = nodeUri;
      this.relink();
    }
    return this;
  }
} as {(): Uri | null; (nodeUri: AnyUri | null): ModelDownlink<Model>};

ModelDownlink.prototype.laneUri = function (this: ModelDownlink<Model>, laneUri?: AnyUri | null): Uri | null | ModelDownlink<Model> {
  if (laneUri === void 0) {
    if (this._laneUri !== void 0) {
      return this._laneUri;
    } else {
      laneUri = this.initLaneUri !== void 0 ? this.initLaneUri() : null;
      if (laneUri !== null) {
        laneUri = Uri.fromAny(laneUri);
        this._laneUri = laneUri;
      }
      return laneUri;
    }
  } else {
    if (laneUri !== null) {
      laneUri = Uri.fromAny(laneUri);
    } else {
      laneUri = void 0;
    }
    if (!Objects.equal(this._laneUri, laneUri)) {
      this._laneUri = laneUri;
      this.relink();
    }
    return this;
  }
} as {(): Uri | null; (laneUri: AnyUri | null): ModelDownlink<Model>};

ModelDownlink.prototype.prio = function (this: ModelDownlink<Model>, prio?: number | null): number | null | ModelDownlink<Model> {
  if (prio === void 0) {
    if (this._prio !== void 0) {
      return this._prio;
    } else {
      prio = this.initPrio !== void 0 ? this.initPrio() : null;
      if (prio !== null) {
        this._prio = prio;
      }
      return prio;
    }
  } else {
    if (prio === null) {
      prio = void 0;
    }
    if (this._prio !== prio) {
      this._prio = prio;
      this.relink();
    }
    return this;
  }
} as {(): number | null; (prio: number | null): ModelDownlink<Model>};

ModelDownlink.prototype.rate = function (this: ModelDownlink<Model>, rate?: number | null): number | null | ModelDownlink<Model> {
  if (rate === void 0) {
    if (this._rate !== void 0) {
      return this._rate;
    } else {
      rate = this.initRate !== void 0 ? this.initRate() : null;
      if (rate !== null) {
        this._rate = rate;
      }
      return rate;
    }
  } else {
    if (rate === null) {
      rate = void 0;
    }
    if (this._rate !== rate) {
      this._rate = rate;
      this.relink();
    }
    return this;
  }
} as {(): number | null; (rate: number | null): ModelDownlink<Model>};

ModelDownlink.prototype.body = function (this: ModelDownlink<Model>, body?: AnyValue | null): Value | null | ModelDownlink<Model> {
  if (body === void 0) {
    if (this._body !== void 0) {
      return this._body;
    } else {
      body = this.initBody !== void 0 ? this.initBody() : null;
      if (body !== null) {
        body = Value.fromAny(body);
        this._body = body;
      }
      return body;
    }
  } else {
    if (body !== null) {
      body = Value.fromAny(body);
    } else {
      body = void 0;
    }
    if (!Objects.equal(this._body, body)) {
      this._body = body;
      this.relink();
    }
    return this;
  }
} as {(): Value | null; (body: AnyValue | null): ModelDownlink<Model>};

ModelDownlink.prototype.link = function (this: ModelDownlink<Model>): void {
  if (this._downlink === null) {
    let warp = this._warp;
    if (warp === void 0) {
      warp = this._model.warpRef.state;
    }
    if (warp === void 0) {
      warp = this._model.warpService.client;
    }
    let downlink = this.createDownlink(warp);
    downlink = this.scopeDownlink(downlink);
    if (this.initDownlink !== void 0) {
      downlink = this.initDownlink(downlink);
    }
    downlink = downlink.observe(this as DownlinkObserver);
    this._downlink = downlink.open();
    this._downlinkFlags &= ~ModelDownlink.PendingFlag;
  }
};

ModelDownlink.prototype.unlink = function (this: ModelDownlink<Model>): void {
  if (this._downlink !== null) {
    this._downlink.close();
    this._downlink = null;
    this._downlinkFlags |= ModelDownlink.PendingFlag;
  }
};

ModelDownlink.prototype.relink = function (this: ModelDownlink<Model>): void {
  this._downlinkFlags |= ModelDownlink.PendingFlag;
  this._model.requireUpdate(Model.NeedsReconcile);
};

ModelDownlink.prototype.mount = function (this: ModelDownlink<Model>): void {
  if ((this._downlinkFlags & ModelDownlink.EnabledFlag) !== 0) {
    this._model.requireUpdate(Model.NeedsReconcile);
  }
};

ModelDownlink.prototype.unmount = function (this: ModelDownlink<Model>): void {
  this.unlink();
};

ModelDownlink.prototype.reconcile = function (this: ModelDownlink<Model>): void {
  if (this._downlink !== null && (this._downlinkFlags & ModelDownlink.RelinkMask) === ModelDownlink.RelinkMask) {
    this.unlink();
    this.link();
  } else if (this._downlink === null && (this._downlinkFlags & ModelDownlink.EnabledFlag) !== 0) {
    this.link();
  } else if (this._downlink !== null && (this._downlinkFlags & ModelDownlink.EnabledFlag) === 0) {
    this.unlink();
  }
};

ModelDownlink.prototype.scopeDownlink = function (this: ModelDownlink<Model>, downlink: Downlink): Downlink {
  const hostUri = this.hostUri();
  if (hostUri !== null) {
    downlink = downlink.hostUri(hostUri);
  }
  const nodeUri = this.nodeUri();
  if (nodeUri !== null) {
    downlink = downlink.nodeUri(nodeUri);
  }
  const laneUri = this.laneUri();
  if (laneUri !== null) {
    downlink = downlink.laneUri(laneUri);
  }
  const prio = this.prio();
  if (prio !== null) {
    downlink = downlink.prio(prio);
  }
  const rate = this.rate();
  if (rate !== null) {
    downlink = downlink.rate(rate);
  }
  const body = this.body();
  if (body !== null) {
    downlink = downlink.body(body);
  }
  return downlink;
};

ModelDownlink.define = function <M extends Model, I>(descriptor: ModelDownlinkDescriptor<M, I>): ModelDownlinkConstructor<M, I> {
  const type = descriptor.type;
  delete (descriptor as {type?: string}).type;
  if (type === "event") {
    return ModelDownlink.Event.define(descriptor as unknown as ModelEventDownlinkDescriptor<M>) as unknown as ModelDownlinkConstructor<M, I>;
  } else if (type === "list") {
    return ModelDownlink.List.define(descriptor as unknown as ModelListDownlinkDescriptor<M, any, any>) as unknown as ModelDownlinkConstructor<M, I>;
  } else if (type === "map") {
    return ModelDownlink.Map.define(descriptor as unknown as ModelMapDownlinkDescriptor<M, any, any, any, any>) as unknown as ModelDownlinkConstructor<M, I>;
  } else if (type === "value") {
    return ModelDownlink.Value.define(descriptor as unknown as ModelValueDownlinkDescriptor<M, any, any>) as unknown as ModelDownlinkConstructor<M, I>;
  } else {
    let _super: ModelDownlinkPrototype | null | undefined = descriptor.extends;
    const enabled = descriptor.enabled;
    let hostUri = descriptor.hostUri;
    let nodeUri = descriptor.nodeUri;
    let laneUri = descriptor.laneUri;
    let prio = descriptor.prio;
    let rate = descriptor.rate;
    let body = descriptor.body;
    delete descriptor.extends;
    delete descriptor.enabled;
    delete descriptor.hostUri;
    delete descriptor.nodeUri;
    delete descriptor.laneUri;
    delete descriptor.prio;
    delete descriptor.rate;
    delete descriptor.body;

    if (_super === void 0) {
      _super = ModelDownlink;
    }

    const _constructor = function ModelDownlinkAccessor(this: ModelDownlink<M>, model: M, downlinkName: string | undefined): ModelDownlink<M> {
      const _this: ModelDownlink<M> = _super!.call(this, model, downlinkName) || this;
      if (enabled === true) {
        _this._downlinkFlags |= ModelDownlink.EnabledFlag;
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
    } as unknown as ModelDownlinkConstructor<M, I>;

    const _prototype = descriptor as unknown as ModelDownlink<M> & I;
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
  }
};

ModelDownlink.PendingFlag = 1 << 0;
ModelDownlink.EnabledFlag = 1 << 1;
ModelDownlink.RelinkMask = ModelDownlink.PendingFlag | ModelDownlink.EnabledFlag;
