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
import {Equals} from "@swim/util";
import {AnyValue, Value, Form} from "@swim/structure";
import {AnyUri, Uri} from "@swim/uri";
import type {DownlinkType, DownlinkObserver, Downlink, WarpRef} from "@swim/client";
import {Model} from "../Model";
import {ModelDownlinkContext} from "./ModelDownlinkContext";
import {
  ModelEventDownlinkDescriptorExtends,
  ModelEventDownlinkDescriptor,
  ModelEventDownlinkConstructor,
  ModelEventDownlink,
} from "../"; // forward import
import {
  ModelListDownlinkDescriptorExtends,
  ModelListDownlinkDescriptor,
  ModelListDownlinkConstructor,
  ModelListDownlink,
} from "../"; // forward import
import {
  ModelMapDownlinkDescriptorExtends,
  ModelMapDownlinkDescriptor,
  ModelMapDownlinkConstructor,
  ModelMapDownlink,
} from "../"; // forward import
import {
  ModelValueDownlinkDescriptorExtends,
  ModelValueDownlinkDescriptor,
  ModelValueDownlinkConstructor,
  ModelValueDownlink,
} from "../"; // forward import

export interface ModelDownlinkInit extends DownlinkObserver {
  extends?: ModelDownlinkClass;
  type?: DownlinkType;

  enabled?: boolean;
  hostUri?: AnyUri | (() => AnyUri | null);
  nodeUri?: AnyUri | (() => AnyUri | null);
  laneUri?: AnyUri | (() => AnyUri | null);
  prio?: number | (() => number | undefined);
  rate?: number | (() => number | undefined);
  body?: AnyValue | (() => AnyValue | null);

  initDownlink?(downlink: Downlink): Downlink;
}

export type ModelDownlinkFlags = number;

export type ModelDownlinkDescriptor<M extends ModelDownlinkContext, I = {}> = ModelDownlinkInit & ThisType<ModelDownlink<M> & I> & Partial<I>;

export type ModelDownlinkDescriptorExtends<M extends ModelDownlinkContext, I = {}> = {extends: ModelDownlinkClass | undefined} & ModelDownlinkDescriptor<M, I>;

export interface ModelDownlinkConstructor<M extends ModelDownlinkContext, I = {}> {
  new(owner: M, downlinkName: string | undefined): ModelDownlink<M> & I;
  prototype: ModelDownlink<any> & I;
}

export interface ModelDownlinkClass extends Function {
  readonly prototype: ModelDownlink<any>;
}

export interface ModelDownlink<M extends ModelDownlinkContext> {
  readonly name: string | undefined;

  readonly owner: M;

  readonly downlink: Downlink | null;

  /** @hidden */
  readonly downlinkFlags: ModelDownlinkFlags;

  /** @hidden */
  setDownlinkFlags(downlinkFlags: ModelDownlinkFlags): void;

  enabled(): boolean;
  enabled(enabled: boolean): this;

  /** @hidden */
  readonly ownWarp: WarpRef | null;

  warp(): WarpRef | null;
  warp(warp: WarpRef | null): this;

  /** @hidden */
  readonly ownHostUri: Uri | null;

  hostUri(): Uri | null;
  hostUri(hostUri: AnyUri | null): this;

  /** @hidden */
  readonly ownNodeUri: Uri | null;

  nodeUri(): Uri | null;
  nodeUri(nodeUri: AnyUri | null): this;

  /** @hidden */
  readonly ownLaneUri: Uri | null;

  laneUri(): Uri | null;
  laneUri(laneUri: AnyUri | null): this;

  /** @hidden */
  readonly ownPrio: number | undefined;

  prio(): number | undefined;
  prio(prio: number | undefined): this;

  /** @hidden */
  readonly ownRate: number | undefined;

  rate(): number | undefined;
  rate(rate: number | undefined): this;

  /** @hidden */
  readonly ownBody: Value | null;

  body(): Value | null;
  body(body: AnyValue | null): this;

  /** @hidden */
  link(): void;

  /** @hidden */
  unlink(): void;

  /** @hidden */
  relink(): void;

  /** @hidden */
  reconcile(): void;

  /**
   * @hidden
   * @abstract
   */
  createDownlink(warp: WarpRef): Downlink;

  /** @hidden */
  bindDownlink(downlink: Downlink): Downlink;

  /** @hidden */
  initDownlink?(downlink: Downlink): Downlink;

  /** @hidden */
  initHostUri?(): AnyUri | null;

  /** @hidden */
  initNodeUri?(): AnyUri | null;

  /** @hidden */
  initLaneUri?(): AnyUri | null;

  /** @hidden */
  initPrio?(): number | undefined;

  /** @hidden */
  initRate?(): number | undefined;

  /** @hidden */
  initBody?(): AnyValue | null;

  /** @hidden */
  mount(): void;

  /** @hidden */
  unmount(): void;
}

export const ModelDownlink = function <M extends ModelDownlinkContext>(
    this: ModelDownlink<M> | typeof ModelDownlink,
    owner: M | ModelDownlinkDescriptor<M>,
    downlinkName?: string
  ): ModelDownlink<M> | PropertyDecorator {
  if (this instanceof ModelDownlink) { // constructor
    return ModelDownlinkConstructor.call(this, owner as M, downlinkName) as ModelDownlink<M>;
  } else { // decorator factory
    return ModelDownlinkDecoratorFactory(owner as ModelDownlinkDescriptor<M>);
  }
} as {
  /** @hidden */
  new<M extends ModelDownlinkContext>(owner: M, downlinkName: string | undefined): ModelDownlink<M>;

  <M extends ModelDownlinkContext, I = {}>(descriptor: {type: "event"} & ModelEventDownlinkDescriptorExtends<M, I>): PropertyDecorator;
  <M extends ModelDownlinkContext>(descriptor: {type: "event"} & ModelEventDownlinkDescriptor<M>): PropertyDecorator;

  <M extends ModelDownlinkContext, V, VU = never, I = {}>(descriptor: {type: "list"} & ModelListDownlinkDescriptorExtends<M, V, VU, I>): PropertyDecorator;
  <M extends ModelDownlinkContext, V, VU = never>(descriptor: {type: "list"; valueForm: Form<V, VU>} & ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator;
  <M extends ModelDownlinkContext, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: {type: "list"} & ModelListDownlinkDescriptor<M, V, VU>): PropertyDecorator;

  <M extends ModelDownlinkContext, K, V, KU = never, VU = never, I = {}>(descriptor: {type: "map"} & ModelMapDownlinkDescriptorExtends<M, K, V, KU, VU, I>): PropertyDecorator;
  <M extends ModelDownlinkContext, K, V, KU = never, VU = never>(descriptor: {type: "map"; keyForm: Form<K, KU>; valueForm: Form<V, VU>} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator;
  <M extends ModelDownlinkContext, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(descriptor: {type: "map"} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator;

  <M extends ModelDownlinkContext, V, VU = never, I = {}>(descriptor: {type: "value"} & ModelValueDownlinkDescriptorExtends<M, V, VU, I>): PropertyDecorator;
  <M extends ModelDownlinkContext, V, VU = never>(descriptor: {type: "value"; valueForm: Form<V, VU>} & ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator;
  <M extends ModelDownlinkContext, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: {type: "value"} & ModelValueDownlinkDescriptor<M, V, VU>): PropertyDecorator;

  <M extends ModelDownlinkContext, I = {}>(descriptor: ModelDownlinkDescriptorExtends<M, I>): PropertyDecorator;
  <M extends ModelDownlinkContext>(descriptor: ModelDownlinkDescriptor<M>): PropertyDecorator;

  /** @hidden */
  prototype: ModelDownlink<any>;

  define<M extends ModelDownlinkContext, I = {}>(descriptor: {type: "event"} & ModelEventDownlinkDescriptorExtends<M, I>): ModelEventDownlinkConstructor<M, I>;
  define<M extends ModelDownlinkContext>(descriptor: {type: "event"} & ModelEventDownlinkDescriptor<M>): ModelEventDownlinkConstructor<M>;

  define<M extends ModelDownlinkContext, V, VU = never, I = {}>(descriptor: {type: "list"} & ModelListDownlinkDescriptorExtends<M, V, VU, I>): ModelListDownlinkConstructor<M, V, VU, I>;
  define<M extends ModelDownlinkContext, V, VU = never>(descriptor: {type: "list"; valueForm: Form<V, VU>} & ModelListDownlinkDescriptor<M, V, VU>): ModelListDownlinkConstructor<M, V, VU>;
  define<M extends ModelDownlinkContext, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: {type: "list"} & ModelListDownlinkDescriptor<M, V, VU>): ModelListDownlinkConstructor<M, V, VU>;

  define<M extends ModelDownlinkContext, K, V, KU = never, VU = never, I = {}>(descriptor: {type: "map"} & ModelMapDownlinkDescriptorExtends<M, K, V, KU, VU, I>): ModelMapDownlinkConstructor<M, K, V, KU, VU, I>;
  define<M extends ModelDownlinkContext, K, V, KU = never, VU = never>(descriptor: {type: "map"; keyForm: Form<K, KU>; valueForm: Form<V, VU>} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): ModelMapDownlinkConstructor<M, K, V, KU, VU>;
  define<M extends ModelDownlinkContext, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(descriptor: {type: "map"} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): ModelMapDownlinkConstructor<M, K, V, KU, VU>;

  define<M extends ModelDownlinkContext, V, VU = never, I = {}>(descriptor: {type: "value"} & ModelValueDownlinkDescriptorExtends<M, V, VU, I>): ModelValueDownlinkConstructor<M, V, VU, I>;
  define<M extends ModelDownlinkContext, V, VU = never>(descriptor: {type: "value"; valueForm: Form<V, VU>} & ModelValueDownlinkDescriptor<M, V, VU>): ModelValueDownlinkConstructor<M, V, VU>;
  define<M extends ModelDownlinkContext, V extends Value = Value, VU extends AnyValue = AnyValue>(descriptor: {type: "value"} & ModelValueDownlinkDescriptor<M, V, VU>): ModelValueDownlinkConstructor<M, V, VU>;

  define<M extends ModelDownlinkContext, I = {}>(descriptor: ModelDownlinkDescriptorExtends<M, I>): ModelDownlinkConstructor<M, I>;
  define<M extends ModelDownlinkContext>(descriptor: ModelDownlinkDescriptor<M>): ModelDownlinkConstructor<M>;

  /** @hidden */
  PendingFlag: ModelDownlinkFlags;
  /** @hidden */
  EnabledFlag: ModelDownlinkFlags;
  /** @hidden */
  RelinkMask: ModelDownlinkFlags;
};
__extends(ModelDownlink, Object);

function ModelDownlinkConstructor<M extends ModelDownlinkContext>(this: ModelDownlink<M>, owner: M, downlinkName: string | undefined): ModelDownlink<M> {
  if (downlinkName !== void 0) {
    Object.defineProperty(this, "name", {
      value: downlinkName,
      enumerable: true,
      configurable: true,
    });
  }
  Object.defineProperty(this, "owner", {
    value: owner,
    enumerable: true,
  });
  Object.defineProperty(this, "downlink", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "downlinkFlags", {
    value: ModelDownlink.PendingFlag,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "ownWarp", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "ownHostUri", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "ownNodeUri", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "ownLaneUri", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "ownPrio", {
    value: void 0,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "ownRate", {
    value: void 0,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "ownBody", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ModelDownlinkDecoratorFactory<M extends ModelDownlinkContext>(descriptor: ModelDownlinkDescriptor<M>): PropertyDecorator {
  return ModelDownlinkContext.decorateModelDownlink.bind(ModelDownlinkContext, ModelDownlink.define(descriptor as ModelDownlinkDescriptor<ModelDownlinkContext>));
}

ModelDownlink.prototype.setDownlinkFlags = function (this: ModelDownlink<ModelDownlinkContext>, downlinkFlags: ModelDownlinkFlags): void {
  Object.defineProperty(this, "downlinkFlags", {
    value: downlinkFlags,
    enumerable: true,
    configurable: true,
  });
};

ModelDownlink.prototype.enabled = function (this: ModelDownlink<ModelDownlinkContext>, enabled?: boolean): boolean | ModelDownlink<ModelDownlinkContext> {
  if (enabled === void 0) {
    return (this.downlinkFlags & ModelDownlink.EnabledFlag) !== 0;
  } else {
    if (enabled && (this.downlinkFlags & ModelDownlink.EnabledFlag) === 0) {
      this.setDownlinkFlags(this.downlinkFlags | ModelDownlink.EnabledFlag);
      this.owner.requireUpdate(Model.NeedsReconcile);
    } else if (!enabled && (this.downlinkFlags & ModelDownlink.EnabledFlag) !== 0) {
      this.setDownlinkFlags(this.downlinkFlags & ~ModelDownlink.EnabledFlag);
      this.owner.requireUpdate(Model.NeedsReconcile);
    }
    return this;
  }
} as typeof ModelDownlink.prototype.enabled;

ModelDownlink.prototype.warp = function (this: ModelDownlink<ModelDownlinkContext>, warp?: WarpRef | null): WarpRef | null | ModelDownlink<ModelDownlinkContext> {
  if (warp === void 0) {
    return this.ownWarp;
  } else {
    if (warp === null) {
      warp = void 0;
    }
    if (this.ownWarp !== warp) {
      Object.defineProperty(this, "ownWarp", {
        value: warp,
        enumerable: true,
        configurable: true,
      });
      this.relink();
    }
    return this;
  }
} as typeof ModelDownlink.prototype.warp;

ModelDownlink.prototype.hostUri = function (this: ModelDownlink<ModelDownlinkContext>, hostUri?: AnyUri | null): Uri | null | ModelDownlink<ModelDownlinkContext> {
  if (hostUri === void 0) {
    if (this.ownHostUri !== null) {
      return this.ownHostUri;
    } else {
      hostUri = this.initHostUri !== void 0 ? this.initHostUri() : null;
      if (hostUri !== null) {
        hostUri = Uri.fromAny(hostUri);
        Object.defineProperty(this, "ownHostUri", {
          value: hostUri as Uri,
          enumerable: true,
          configurable: true,
        });
      }
      return hostUri as Uri | null;
    }
  } else {
    if (hostUri !== null) {
      hostUri = Uri.fromAny(hostUri);
    }
    if (!Equals(this.ownHostUri, hostUri)) {
      Object.defineProperty(this, "ownHostUri", {
        value: hostUri as Uri | null,
        enumerable: true,
        configurable: true,
      });
      this.relink();
    }
    return this;
  }
} as typeof ModelDownlink.prototype.hostUri;

ModelDownlink.prototype.nodeUri = function (this: ModelDownlink<ModelDownlinkContext>, nodeUri?: AnyUri | null): Uri | null | ModelDownlink<ModelDownlinkContext> {
  if (nodeUri === void 0) {
    if (this.ownNodeUri !== null) {
      return this.ownNodeUri;
    } else {
      nodeUri = this.initNodeUri !== void 0 ? this.initNodeUri() : null;
      if (nodeUri !== null) {
        nodeUri = Uri.fromAny(nodeUri);
        Object.defineProperty(this, "ownNodeUri", {
          value: nodeUri as Uri,
          enumerable: true,
          configurable: true,
        });
      }
      return nodeUri as Uri | null;
    }
  } else {
    if (nodeUri !== null) {
      nodeUri = Uri.fromAny(nodeUri);
    }
    if (!Equals(this.ownNodeUri, nodeUri)) {
      Object.defineProperty(this, "ownNodeUri", {
        value: nodeUri as Uri | null,
        enumerable: true,
        configurable: true,
      });
      this.relink();
    }
    return this;
  }
} as typeof ModelDownlink.prototype.nodeUri;

ModelDownlink.prototype.laneUri = function (this: ModelDownlink<ModelDownlinkContext>, laneUri?: AnyUri | null): Uri | null | ModelDownlink<ModelDownlinkContext> {
  if (laneUri === void 0) {
    if (this.ownLaneUri !== null) {
      return this.ownLaneUri;
    } else {
      laneUri = this.initLaneUri !== void 0 ? this.initLaneUri() : null;
      if (laneUri !== null) {
        laneUri = Uri.fromAny(laneUri);
        Object.defineProperty(this, "ownLaneUri", {
          value: laneUri as Uri,
          enumerable: true,
          configurable: true,
        });
      }
      return laneUri as Uri | null;
    }
  } else {
    if (laneUri !== null) {
      laneUri = Uri.fromAny(laneUri);
    }
    if (!Equals(this.ownLaneUri, laneUri)) {
      Object.defineProperty(this, "ownLaneUri", {
        value: laneUri as Uri | null,
        enumerable: true,
        configurable: true,
      });
      this.relink();
    }
    return this;
  }
} as typeof ModelDownlink.prototype.laneUri;

ModelDownlink.prototype.prio = function (this: ModelDownlink<ModelDownlinkContext>, prio?: number | undefined): number | undefined | ModelDownlink<ModelDownlinkContext> {
  if (arguments.length === 0) {
    if (this.ownPrio !== void 0) {
      return this.ownPrio;
    } else {
      prio = this.initPrio !== void 0 ? this.initPrio() : void 0;
      if (prio !== void 0) {
        Object.defineProperty(this, "ownPrio", {
          value: prio,
          enumerable: true,
          configurable: true,
        });
      }
      return prio;
    }
  } else {
    if (this.ownPrio !== prio) {
      Object.defineProperty(this, "ownPrio", {
        value: prio,
        enumerable: true,
        configurable: true,
      });
      this.relink();
    }
    return this;
  }
} as typeof ModelDownlink.prototype.prio;

ModelDownlink.prototype.rate = function (this: ModelDownlink<ModelDownlinkContext>, rate?: number | undefined): number | undefined | ModelDownlink<ModelDownlinkContext> {
  if (arguments.length === 0) {
    if (this.ownRate !== void 0) {
      return this.ownRate;
    } else {
      rate = this.initRate !== void 0 ? this.initRate() : void 0;
      if (rate !== void 0) {
        Object.defineProperty(this, "ownRate", {
          value: rate,
          enumerable: true,
          configurable: true,
        });
      }
      return rate;
    }
  } else {
    if (this.ownRate !== rate) {
      Object.defineProperty(this, "ownRate", {
        value: rate,
        enumerable: true,
        configurable: true,
      });
      this.relink();
    }
    return this;
  }
} as typeof ModelDownlink.prototype.rate;

ModelDownlink.prototype.body = function (this: ModelDownlink<ModelDownlinkContext>, body?: AnyValue | null): Value | null | ModelDownlink<ModelDownlinkContext> {
  if (body === void 0) {
    if (this.ownBody !== null) {
      return this.ownBody;
    } else {
      body = this.initBody !== void 0 ? this.initBody() : null;
      if (body !== null) {
        body = Value.fromAny(body);
        Object.defineProperty(this, "ownBody", {
          value: body,
          enumerable: true,
          configurable: true,
        });
      }
      return body;
    }
  } else {
    if (body !== null) {
      body = Value.fromAny(body);
    }
    if (!Equals(this.ownBody, body)) {
      Object.defineProperty(this, "ownBody", {
        value: body,
        enumerable: true,
        configurable: true,
      });
      this.relink();
    }
    return this;
  }
} as typeof ModelDownlink.prototype.body;

ModelDownlink.prototype.link = function (this: ModelDownlink<ModelDownlinkContext>): void {
  if (this.downlink === null) {
    let warp = this.ownWarp;
    if (warp === null) {
      warp = this.owner.warpRef.state;
    }
    if (warp === null) {
      warp = this.owner.warpService.manager.client;
    }
    let downlink = this.createDownlink(warp);
    downlink = this.bindDownlink(downlink);
    if (this.initDownlink !== void 0) {
      downlink = this.initDownlink(downlink);
    }
    downlink = downlink.observe(this as DownlinkObserver);
    Object.defineProperty(this, "downlink", {
      value: downlink.open(),
      enumerable: true,
      configurable: true,
    });
    this.setDownlinkFlags(this.downlinkFlags & ~ModelDownlink.PendingFlag);
  }
};

ModelDownlink.prototype.unlink = function (this: ModelDownlink<ModelDownlinkContext>): void {
  const downlink = this.downlink;
  if (downlink !== null) {
    downlink.close();
    Object.defineProperty(this, "downlink", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    this.setDownlinkFlags(this.downlinkFlags | ModelDownlink.PendingFlag);
  }
};

ModelDownlink.prototype.relink = function (this: ModelDownlink<ModelDownlinkContext>): void {
  this.setDownlinkFlags(this.downlinkFlags | ModelDownlink.PendingFlag);
  this.owner.requireUpdate(Model.NeedsReconcile);
};

ModelDownlink.prototype.reconcile = function (this: ModelDownlink<ModelDownlinkContext>): void {
  if (this.downlink !== null && (this.downlinkFlags & ModelDownlink.RelinkMask) === ModelDownlink.RelinkMask) {
    this.unlink();
    this.link();
  } else if (this.downlink === null && (this.downlinkFlags & ModelDownlink.EnabledFlag) !== 0) {
    this.link();
  } else if (this.downlink !== null && (this.downlinkFlags & ModelDownlink.EnabledFlag) === 0) {
    this.unlink();
  }
};

ModelDownlink.prototype.bindDownlink = function (this: ModelDownlink<ModelDownlinkContext>, downlink: Downlink): Downlink {
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
  if (prio !== void 0) {
    downlink = downlink.prio(prio);
  }
  const rate = this.rate();
  if (rate !== void 0) {
    downlink = downlink.rate(rate);
  }
  const body = this.body();
  if (body !== null) {
    downlink = downlink.body(body);
  }
  return downlink;
};

ModelDownlink.prototype.mount = function (this: ModelDownlink<ModelDownlinkContext>): void {
  if ((this.downlinkFlags & ModelDownlink.EnabledFlag) !== 0) {
    this.owner.requireUpdate(Model.NeedsReconcile);
  }
};

ModelDownlink.prototype.unmount = function (this: ModelDownlink<ModelDownlinkContext>): void {
  this.unlink();
};

ModelDownlink.define = function <M extends ModelDownlinkContext, I>(descriptor: ModelDownlinkDescriptor<M, I>): ModelDownlinkConstructor<M, I> {
  const type = descriptor.type;
  delete (descriptor as {type?: string}).type;
  if (type === "event") {
    return ModelEventDownlink.define(descriptor as unknown as ModelEventDownlinkDescriptor<M>) as unknown as ModelDownlinkConstructor<M, I>;
  } else if (type === "list") {
    return ModelListDownlink.define(descriptor as unknown as ModelListDownlinkDescriptor<M, any, any>) as unknown as ModelDownlinkConstructor<M, I>;
  } else if (type === "map") {
    return ModelMapDownlink.define(descriptor as unknown as ModelMapDownlinkDescriptor<M, any, any, any, any>) as unknown as ModelDownlinkConstructor<M, I>;
  } else if (type === "value") {
    return ModelValueDownlink.define(descriptor as unknown as ModelValueDownlinkDescriptor<M, any, any>) as unknown as ModelDownlinkConstructor<M, I>;
  } else {
    let _super: ModelDownlinkClass | null | undefined = descriptor.extends;
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

    const _constructor = function DecoratedModelDownlink(this: ModelDownlink<M>, owner: M, downlinkName: string | undefined): ModelDownlink<M> {
      const _this: ModelDownlink<M> = _super!.call(this, owner, downlinkName) || this;
      if (enabled === true) {
        Object.defineProperty(_this, "downlinkFlags", {
          value: _this.downlinkFlags | ModelDownlink.EnabledFlag,
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
    } as unknown as ModelDownlinkConstructor<M, I>;

    const _prototype = descriptor as unknown as ModelDownlink<any> & I;
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
