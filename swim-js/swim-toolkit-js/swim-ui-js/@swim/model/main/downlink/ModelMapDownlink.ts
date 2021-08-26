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
import {Cursor, OrderedMap} from "@swim/util";
import {AnyValue, Value, Form} from "@swim/structure";
import {Uri} from "@swim/uri";
import type {MapDownlinkObserver, MapDownlink, WarpRef} from "@swim/client";
import {ModelDownlinkContext} from "./ModelDownlinkContext";
import {ModelDownlinkInit, ModelDownlink} from "./ModelDownlink";

export interface ModelMapDownlinkInit<K, V, KU = never, VU = never> extends ModelDownlinkInit, MapDownlinkObserver<K, V, KU, VU> {
  extends?: ModelMapDownlinkClass;
  keyForm?: Form<K, KU>;
  valueForm?: Form<V, VU>;

  initDownlink?(downlink: MapDownlink<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;
}

export type ModelMapDownlinkDescriptor<M extends ModelDownlinkContext, K, V, KU = never, VU = never, I = {}> = ModelMapDownlinkInit<K, V, KU, VU> & ThisType<ModelMapDownlink<M, K, V, KU, VU> & I> & Partial<I>;

export type ModelMapDownlinkDescriptorExtends<M extends ModelDownlinkContext, K, V, KU = never, VU = never, I = {}> = {extends: ModelMapDownlinkClass | undefined} & ModelMapDownlinkDescriptor<M, K, V, KU, VU, I>;

export interface ModelMapDownlinkConstructor<M extends ModelDownlinkContext, K, V, KU = never, VU = never, I = {}> {
  new(owner: M, downlinkName: string | undefined): ModelMapDownlink<M, K, V, KU, VU> & I;
  prototype: ModelMapDownlink<any, any, any> & I;
}

export interface ModelMapDownlinkClass extends Function {
  readonly prototype: ModelMapDownlink<any, any, any>;
}

export interface ModelMapDownlink<M extends ModelDownlinkContext, K = Value, V = Value, KU = never, VU = never> extends ModelDownlink<M>, OrderedMap<K, V> {
  (key: K | KU): V | undefined;
  (key: K | KU, value: V | VU): M;

  readonly downlink: MapDownlink<K, V, KU, VU> | null;

  /** @hidden */
  ownKeyForm: Form<K, KU> | null;

  keyForm(): Form<K, KU> | null;
  keyForm(keyForm: Form<K, KU> | null): this;

  /** @hidden */
  ownValueForm: Form<V, VU> | null;

  valueForm(): Form<V, VU> | null;
  valueForm(valueForm: Form<V, VU> | null): this;

  readonly size: number;

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

  forEach<T>(callback: (key: K, value: V) => T | void): T | undefined;
  forEach<T, S>(callback: (this: S, key: K, value: V) => T | void,
                thisArg: S): T | undefined;

  keys(): Cursor<K>;

  values(): Cursor<V>;

  entries(): Cursor<[K, V]>;

  /** @hidden */
  createDownlink(warp: WarpRef): MapDownlink<K, V, KU, VU>;

  /** @hidden */
  bindDownlink(downlink: MapDownlink<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;

  /** @hidden */
  initDownlink?(downlink: MapDownlink<K, V, KU, VU>): MapDownlink<K, V, KU, VU>;
}

export const ModelMapDownlink = function ModelMapDownlink<M extends ModelDownlinkContext, K, V, KU, VU>(
    this: ModelMapDownlink<M, K, V, KU, VU> | typeof ModelMapDownlink,
    owner: M | ModelMapDownlinkDescriptor<M, K, V, KU, VU>,
    downlinkName?: string
  ): ModelMapDownlink<M, K, V, KU, VU> | PropertyDecorator {
  if (this instanceof ModelMapDownlink) { // constructor
    return ModelMapDownlinkConstructor.call(this as ModelMapDownlink<ModelDownlinkContext, unknown, unknown, unknown, unknown>, owner as M, downlinkName);
  } else { // decorator factory
    return ModelMapDownlinkDecoratorFactory(owner as ModelMapDownlinkDescriptor<M, K, V, KU, VU>);
  }
} as {
  /** @hidden */
  new<M extends ModelDownlinkContext, K, V, KU = never, VU = never>(owner: M, downlinkName: string | undefined): ModelMapDownlink<M, K, V, KU, VU>;

  <M extends ModelDownlinkContext, K, V, KU = never, VU = never, I = {}>(descriptor: ModelMapDownlinkDescriptorExtends<M, K, V, KU, VU, I>): PropertyDecorator;
  <M extends ModelDownlinkContext, K, V, KU = never, VU = never>(descriptor: {keyForm: Form<K, KU>; valueForm: Form<V, VU>} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator;
  <M extends ModelDownlinkContext, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(descriptor: ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator;

  /** @hidden */
  prototype: ModelMapDownlink<any, any, any>;

  define<M extends ModelDownlinkContext, K, V, KU = never, VU = never, I = {}>(descriptor: ModelMapDownlinkDescriptorExtends<M, K, V, KU, VU, I>): ModelMapDownlinkConstructor<M, K, V, KU, VU, I>;
  define<M extends ModelDownlinkContext, K, V, KU = never, VU = never>(descriptor: {keyForm: Form<K, KU>; valueForm: Form<V, VU>} & ModelMapDownlinkDescriptor<M, K, V, KU, VU>): ModelMapDownlinkConstructor<M, K, V, KU, VU>;
  define<M extends ModelDownlinkContext, K extends Value = Value, V extends Value = Value, KU extends AnyValue = AnyValue, VU extends AnyValue = AnyValue>(descriptor: ModelMapDownlinkDescriptor<M, K, V, KU, VU>): ModelMapDownlinkConstructor<M, K, V, KU, VU>;
};
__extends(ModelMapDownlink, ModelDownlink);

function ModelMapDownlinkConstructor<M extends ModelDownlinkContext, K, V, KU, VU>(this: ModelMapDownlink<M, K, V, KU, VU>, owner: M, downlinkName: string | undefined): ModelMapDownlink<M, K, V, KU, VU> {
  const _this: ModelMapDownlink<M, K, V, KU, VU> = (ModelDownlink as Function).call(this, owner, downlinkName) || this;
  Object.defineProperty(_this, "ownKeyForm", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(_this, "ownValueForm", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return _this;
}

function ModelMapDownlinkDecoratorFactory<M extends ModelDownlinkContext, K, V, KU, VU>(descriptor: ModelMapDownlinkDescriptor<M, K, V, KU, VU>): PropertyDecorator {
  return ModelDownlinkContext.decorateModelDownlink.bind(ModelDownlinkContext, ModelMapDownlink.define(descriptor as ModelMapDownlinkDescriptor<ModelDownlinkContext, Value, Value>));
}

ModelMapDownlink.prototype.keyForm = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, keyForm?: Form<K, KU> | null): Form<K, KU> | null | ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU> {
  if (keyForm === void 0) {
    return this.ownKeyForm;
  } else {
    if (this.ownKeyForm !== keyForm) {
      Object.defineProperty(this, "ownKeyForm", {
        value: keyForm,
        enumerable: true,
        configurable: true,
      });
      this.relink();
    }
    return this;
  }
} as typeof ModelMapDownlink.prototype.keyForm;

ModelMapDownlink.prototype.valueForm = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, valueForm?: Form<V, VU> | null): Form<V, VU> | null | ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU> {
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
} as typeof ModelMapDownlink.prototype.valueForm;

Object.defineProperty(ModelMapDownlink.prototype, "size", {
  get: function (this: ModelMapDownlink<ModelDownlinkContext, unknown, unknown>): number {
    const downlink = this.downlink;
    return downlink !== null ? downlink.size : 0;
  },
  enumerable: true,
  configurable: true,
});

ModelMapDownlink.prototype.isEmpty = function (this: ModelMapDownlink<ModelDownlinkContext, unknown, unknown>): boolean {
  const downlink = this.downlink;
  return downlink !== null ? downlink.isEmpty() : true;
};

ModelMapDownlink.prototype.has = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, key: K | KU): boolean {
  const downlink = this.downlink;
  return downlink !== null ? downlink.has(key) : false;
};

ModelMapDownlink.prototype.get = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, key: K | KU): V | undefined {
  const downlink = this.downlink;
  let value: V | undefined;
  if (downlink !== null) {
    value = downlink.get(key);
  }
  if (value === void 0 && this.ownValueForm !== null) {
    value = this.ownValueForm.unit;
  }
  return value;
};

ModelMapDownlink.prototype.getEntry = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, index: number): [K, V] | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.getEntry(index) : void 0;
};

ModelMapDownlink.prototype.firstKey = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>): K | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.firstKey() : void 0;
};

ModelMapDownlink.prototype.firstValue = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>): V | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.firstValue() : void 0;
};

ModelMapDownlink.prototype.firstEntry = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>): [K, V] | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.firstEntry() : void 0;
};

ModelMapDownlink.prototype.lastKey = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>): K | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.lastKey() : void 0;
};

ModelMapDownlink.prototype.lastValue = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>): V | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.lastValue() : void 0;
};

ModelMapDownlink.prototype.lastEntry = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>): [K, V] | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.lastEntry() : void 0;
};

ModelMapDownlink.prototype.nextKey = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, keyObject: K): K | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.nextKey(keyObject) : void 0;
};

ModelMapDownlink.prototype.nextValue = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, keyObject: K): V | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.nextValue(keyObject) : void 0;
};

ModelMapDownlink.prototype.nextEntry = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, keyObject: K): [K, V] | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.nextEntry(keyObject) : void 0;
};

ModelMapDownlink.prototype.previousKey = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, keyObject: K): K | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.previousKey(keyObject) : void 0;
};

ModelMapDownlink.prototype.previousValue = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, keyObject: K): V | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.previousValue(keyObject) : void 0;
};

ModelMapDownlink.prototype.previousEntry = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, keyObject: K): [K, V] | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.previousEntry(keyObject) : void 0;
};

ModelMapDownlink.prototype.set = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, key: K | KU, newValue: V | VU): ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU> {
  const downlink = this.downlink;
  if (downlink !== null) {
    downlink.set(key, newValue);
  }
  return this;
};

ModelMapDownlink.prototype.delete = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, key: K | KU): boolean {
  const downlink = this.downlink;
  return downlink !== null ? downlink.delete(key) : false;
};

ModelMapDownlink.prototype.drop = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, lower: number): ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU> {
  const downlink = this.downlink;
  if (downlink !== null) {
    downlink.drop(lower);
  }
  return this;
};

ModelMapDownlink.prototype.take = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, upper: number): ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU> {
  const downlink = this.downlink;
  if (downlink !== null) {
    downlink.take(upper);
  }
  return this;
};

ModelMapDownlink.prototype.clear = function (this: ModelMapDownlink<ModelDownlinkContext, unknown, unknown>): void {
  const downlink = this.downlink;
  if (downlink !== null) {
    downlink.clear();
  }
};

ModelMapDownlink.prototype.forEach = function <K, V, KU, VU, T, S>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>,
                                                                   callback: (this: S | undefined, key: K, value: V) => T | void,
                                                                   thisArg?: S): T | undefined {
  const downlink = this.downlink;
  return downlink !== null ? downlink.forEach(callback, thisArg) : void 0;
};

ModelMapDownlink.prototype.keys = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>): Cursor<K> {
  const downlink = this.downlink;
  return downlink !== null ? downlink.keys() : Cursor.empty();
};

ModelMapDownlink.prototype.values = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>): Cursor<V> {
  const downlink = this.downlink;
  return downlink !== null ? downlink.values() : Cursor.empty();
};

ModelMapDownlink.prototype.entries = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>): Cursor<[K, V]> {
  const downlink = this.downlink;
  return downlink !== null ? downlink.entries() : Cursor.empty();
};

ModelMapDownlink.prototype.createDownlink = function <K, V, KU, VU>(this: ModelMapDownlink<ModelDownlinkContext, K, V, KU, VU>, warp: WarpRef): MapDownlink<K, V, KU, VU> {
  let downlink = warp.downlinkMap() as unknown as MapDownlink<K, V, KU, VU>;
  if (this.ownKeyForm !== null) {
    downlink = downlink.keyForm(this.ownKeyForm);
  }
  if (this.ownValueForm !== null) {
    downlink = downlink.valueForm(this.ownValueForm);
  }
  return downlink;
};

ModelMapDownlink.define = function <M extends ModelDownlinkContext, K, V, KU, VU, I>(descriptor: ModelMapDownlinkDescriptor<M, K, V, KU, VU, I>): ModelMapDownlinkConstructor<M, K, V, KU, VU, I> {
  let _super: ModelMapDownlinkClass | null | undefined = descriptor.extends;
  const keyForm = descriptor.keyForm;
  const valueForm = descriptor.valueForm;
  let hostUri = descriptor.hostUri;
  let nodeUri = descriptor.nodeUri;
  let laneUri = descriptor.laneUri;
  let prio = descriptor.prio;
  let rate = descriptor.rate;
  let body = descriptor.body;
  delete descriptor.extends;
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

  const _constructor = function DecoratedModelMapDownlink(this: ModelMapDownlink<M, K, V, KU, VU>, owner: M, downlinkName: string | undefined): ModelMapDownlink<M, K, V, KU, VU> {
    let _this: ModelMapDownlink<M, K, V, KU, VU> = function ModelMapDownlinkAccessor(key: K | KU, value?: V | VU): V | undefined | M {
      if (arguments.length === 1) {
        return _this.get(key);
      } else {
        _this.set(key, value!);
        return _this.owner;
      }
    } as ModelMapDownlink<M, K, V, KU, VU>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, downlinkName) || _this;
    if (keyForm !== void 0) {
      Object.defineProperty(_this, "ownKeyForm", {
        value: keyForm,
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
  } as unknown as ModelMapDownlinkConstructor<M, K, V, KU, VU, I>;

  const _prototype = descriptor as unknown as ModelMapDownlink<any, any, any> & I;
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
