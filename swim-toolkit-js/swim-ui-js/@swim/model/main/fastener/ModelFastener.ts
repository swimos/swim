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
import {FromAny} from "@swim/util";
import {Model} from "../Model";
import type {ModelObserverType} from "../ModelObserver";

export type ModelFastenerMemberType<M, K extends keyof M> =
  M[K] extends ModelFastener<any, infer S, any> ? S : never;

export type ModelFastenerMemberInit<M, K extends keyof M> =
  M[K] extends ModelFastener<any, infer S, infer U> ? S | U : never;

export type ModelFastenerFlags = number;

export interface ModelFastenerInit<S extends Model, U = never> {
  extends?: ModelFastenerClass;
  key?: string | boolean;
  type?: unknown;
  child?: boolean;
  observe?: boolean;

  willSetModel?(newModel: S | null, oldModel: S | null, targetModel: Model | null): void;
  onSetModel?(newModel: S | null, oldModel: S | null, targetModel: Model | null): void;
  didSetModel?(newModel: S | null, oldModel: S | null, targetModel: Model | null): void;

  parentModel?: Model | null;
  createModel?(): S | U | null;
  insertModel?(parentModel: Model, childModel: S, targetModel: Model | null, key: string | undefined): void;
  fromAny?(value: S | U): S | null;
}

export type ModelFastenerDescriptor<M extends Model, S extends Model, U = never, I = {}> = ModelFastenerInit<S, U> & ThisType<ModelFastener<M, S, U> & I> & Partial<I>;

export interface ModelFastenerConstructor<M extends Model, S extends Model, U = never, I = {}> {
  new<O extends M>(owner: O, key: string | undefined, fastenerName: string | undefined): ModelFastener<O, S, U> & I;
  prototype: Omit<ModelFastener<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface ModelFastenerClass extends Function {
  readonly prototype: Omit<ModelFastener<any, any>, "key"> & {key?: string | boolean};
}

export interface ModelFastener<M extends Model, S extends Model, U = never> {
  (): S | null;
  (model: S | U | null, targetModel?: Model | null): M;

  readonly name: string;

  readonly owner: M;

  /** @hidden */
  fastenerFlags: ModelFastenerFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ModelFastenerFlags): void;

  readonly key: string | undefined;

  readonly model: S | null;

  getModel(): S;

  setModel(newModel: S | U | null, targetModel?: Model | null): S | null;

  /** @hidden */
  doSetModel(newModel: S | null, targetModel: Model | null): void;

  /** @hidden */
  attachModel(newModel: S): void;

  /** @hidden */
  detachModel(oldModel: S): void;

  /** @hidden */
  willSetModel(newModel: S | null, oldModel: S | null, targetModel: Model | null): void;

  /** @hidden */
  onSetModel(newModel: S | null, oldModel: S | null, targetModel: Model | null): void;

  /** @hidden */
  didSetModel(newModel: S | null, oldModel: S | null, targetModel: Model | null): void;

  /** @hidden */
  readonly parentModel: Model | null;

  injectModel(parentModel?: Model | null, childModel?: S | U | null, targetModel?: Model | null, key?: string | null): S | null;

  createModel(): S | U | null;

  /** @hidden */
  insertModel(parentModel: Model, childModel: S, targetModel: Model | null, key: string | undefined): void;

  removeModel(): S | null;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  child?: boolean;

  /** @hidden */
  readonly type?: unknown;

  fromAny(value: S | U): S | null;

  isMounted(): boolean;

  /** @hidden */
  mount(): void;

  /** @hidden */
  willMount(): void;

  /** @hidden */
  onMount(): void;

  /** @hidden */
  didMount(): void;

  /** @hidden */
  unmount(): void;

  /** @hidden */
  willUnmount(): void;

  /** @hidden */
  onUnmount(): void;

  /** @hidden */
  didUnmount(): void;
}

export const ModelFastener = function <M extends Model, S extends Model, U>(
    this: ModelFastener<M, S, U> | typeof ModelFastener,
    owner: M | ModelFastenerDescriptor<M, S, U>,
    key?: string,
    fastenerName?: string,
  ): ModelFastener<M, S, U> | PropertyDecorator {
  if (this instanceof ModelFastener) { // constructor
    return ModelFastenerConstructor.call(this as unknown as ModelFastener<Model, Model, unknown>, owner as M, key, fastenerName);
  } else { // decorator factory
    return ModelFastenerDecoratorFactory(owner as ModelFastenerDescriptor<M, S, U>);
  }
} as {
  /** @hidden */
  new<M extends Model, S extends Model, U = never>(owner: M, key: string | undefined, fastenerName: string | undefined): ModelFastener<M, S, U>;

  <M extends Model, S extends Model = Model, U = never, I = {}>(descriptor: {observe: boolean} & ModelFastenerDescriptor<M, S, U, I & ModelObserverType<S>>): PropertyDecorator;
  <M extends Model, S extends Model = Model, U = never, I = {}>(descriptor: ModelFastenerDescriptor<M, S, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: ModelFastener<any, any>;

  define<M extends Model, S extends Model = Model, U = never, I = {}>(descriptor: {observe: boolean} & ModelFastenerDescriptor<M, S, U, I & ModelObserverType<S>>): ModelFastenerConstructor<M, S, U, I>;
  define<M extends Model, S extends Model = Model, U = never, I = {}>(descriptor: ModelFastenerDescriptor<M, S, U, I>): ModelFastenerConstructor<M, S, U, I>;

  /** @hidden */
  MountedFlag: ModelFastenerFlags;
};
__extends(ModelFastener, Object);

function ModelFastenerConstructor<M extends Model, S extends Model, U>(this: ModelFastener<M, S, U>, owner: M, key: string | undefined, fastenerName: string | undefined): ModelFastener<M, S, U> {
  if (fastenerName !== void 0) {
    Object.defineProperty(this, "name", {
      value: fastenerName,
      enumerable: true,
      configurable: true,
    });
  }
  Object.defineProperty(this, "owner", {
    value: owner,
    enumerable: true,
  });
  Object.defineProperty(this, "fastenerFlags", {
    value: 0,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "key", {
    value: key,
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(this, "model", {
    value: null,
    enumerable: true,
    configurable: true,
  });
  return this;
}

function ModelFastenerDecoratorFactory<M extends Model, S extends Model, U>(descriptor: ModelFastenerDescriptor<M, S, U>): PropertyDecorator {
  return Model.decorateModelFastener.bind(Model, ModelFastener.define(descriptor as ModelFastenerDescriptor<Model, Model>));
}

ModelFastener.prototype.setFastenerFlags = function (this: ModelFastener<Model, Model>, fastenerFlags: ModelFastenerFlags): void {
  Object.defineProperty(this, "fastenerFlags", {
    value: fastenerFlags,
    enumerable: true,
    configurable: true,
  });
};

ModelFastener.prototype.getModel = function <S extends Model>(this: ModelFastener<Model, S>): S {
  const model = this.model;
  if (model === null) {
    throw new TypeError("null " + this.name + " model");
  }
  return model;
};

ModelFastener.prototype.setModel = function <S extends Model>(this: ModelFastener<Model, S>, newModel: S | null, targetModel?: Model | null): S | null {
  const oldModel = this.model;
  if (newModel !== null) {
    newModel = this.fromAny(newModel);
  }
  if (targetModel === void 0) {
    targetModel = null;
  }
  if (this.child === true) {
    if (newModel !== null && (newModel.parentModel !== this.owner || newModel.key !== this.key)) {
      this.insertModel(this.owner, newModel, targetModel, this.key);
    } else if (newModel === null && oldModel !== null) {
      oldModel.remove();
    }
  }
  this.doSetModel(newModel , targetModel);
  return oldModel;
};

ModelFastener.prototype.doSetModel = function <S extends Model>(this: ModelFastener<Model, S>, newModel: S | null, targetModel: Model | null): void {
  const oldModel = this.model;
  if (oldModel !== newModel) {
    this.willSetModel(newModel, oldModel, targetModel);
    if (oldModel !== null) {
      this.detachModel(oldModel);
    }
    Object.defineProperty(this, "model", {
      value: newModel,
      enumerable: true,
      configurable: true,
    });
    if (newModel !== null) {
      this.attachModel(newModel);
    }
    this.onSetModel(newModel, oldModel, targetModel);
    this.didSetModel(newModel, oldModel, targetModel);
  }
};

ModelFastener.prototype.attachModel = function <S extends Model>(this: ModelFastener<Model, S>, newModel: S): void {
  if (this.observe === true) {
    newModel.addModelObserver(this as ModelObserverType<S>);
  }
};

ModelFastener.prototype.detachModel = function <S extends Model>(this: ModelFastener<Model, S>, oldModel: S): void {
  if (this.observe === true) {
    oldModel.removeModelObserver(this as ModelObserverType<S>);
  }
};

ModelFastener.prototype.willSetModel = function <S extends Model>(this: ModelFastener<Model, S>, newModel: S | null, oldModel: S | null, targetModel: Model | null): void {
  // hook
};

ModelFastener.prototype.onSetModel = function <S extends Model>(this: ModelFastener<Model, S>, newModel: S | null, oldModel: S | null, targetModel: Model | null): void {
  // hook
};

ModelFastener.prototype.didSetModel = function <S extends Model>(this: ModelFastener<Model, S>, newModel: S | null, oldModel: S | null, targetModel: Model | null): void {
  // hook
};

Object.defineProperty(ModelFastener.prototype, "parentModel", {
  get(this: ModelFastener<Model, Model>): Model | null {
    return this.owner;
  },
  enumerable: true,
  configurable: true,
});

ModelFastener.prototype.injectModel = function <S extends Model>(this: ModelFastener<Model, S>, parentModel?: Model | null, childModel?: S | null, targetModel?: Model | null, key?: string | null): S | null {
  if (targetModel === void 0) {
    targetModel = null;
  }
  if (childModel === void 0 || childModel === null) {
    childModel = this.model;
    if (childModel === null) {
      childModel = this.createModel();
    }
  } else {
    childModel = this.fromAny(childModel);
    if (childModel !== null) {
      this.doSetModel(childModel, targetModel);
    }
  }
  if (childModel !== null) {
    if (parentModel === void 0 || parentModel === null) {
      parentModel = this.parentModel;
    }
    if (key === void 0) {
      key = this.key;
    } else if (key === null) {
      key = void 0;
    }
    if (parentModel !== null && (childModel.parentModel !== parentModel || childModel.key !== key)) {
      this.insertModel(parentModel, childModel, targetModel, key);
    }
    if (this.model === null) {
      this.doSetModel(childModel, targetModel);
    }
  }
  return childModel;
};

ModelFastener.prototype.createModel = function <S extends Model, U>(this: ModelFastener<Model, S, U>): S | U | null {
  return null;
};

ModelFastener.prototype.insertModel = function <S extends Model>(this: ModelFastener<Model, S>, parentModel: Model, childModel: S, targetModel: Model | null, key: string | undefined): void {
  parentModel.insertChildModel(childModel, targetModel, key);
};

ModelFastener.prototype.removeModel = function <S extends Model>(this: ModelFastener<Model, S>): S | null {
  const childModel = this.model;
  if (childModel !== null) {
    childModel.remove();
  }
  return childModel;
};

ModelFastener.prototype.fromAny = function <S extends Model, U>(this: ModelFastener<Model, S, U>, value: S | U): S | null {
  const type = this.type;
  if (FromAny.is<S, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof Model) {
    return value;
  }
  return null;
};

ModelFastener.prototype.isMounted = function (this: ModelFastener<Model, Model>): boolean {
  return (this.fastenerFlags & ModelFastener.MountedFlag) !== 0;
};

ModelFastener.prototype.mount = function (this: ModelFastener<Model, Model>): void {
  if ((this.fastenerFlags & ModelFastener.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ModelFastener.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ModelFastener.prototype.willMount = function (this: ModelFastener<Model, Model>): void {
  // hook
};

ModelFastener.prototype.onMount = function (this: ModelFastener<Model, Model>): void {
  // hook
};

ModelFastener.prototype.didMount = function (this: ModelFastener<Model, Model>): void {
  // hook
};

ModelFastener.prototype.unmount = function (this: ModelFastener<Model, Model>): void {
  if ((this.fastenerFlags & ModelFastener.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ModelFastener.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ModelFastener.prototype.willUnmount = function (this: ModelFastener<Model, Model>): void {
  // hook
};

ModelFastener.prototype.onUnmount = function (this: ModelFastener<Model, Model>): void {
  // hook
};

ModelFastener.prototype.didUnmount = function (this: ModelFastener<Model, Model>): void {
  // hook
};

ModelFastener.define = function <M extends Model, S extends Model, U, I>(descriptor: ModelFastenerDescriptor<M, S, U, I>): ModelFastenerConstructor<M, S, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ModelFastener;
  }

  const _constructor = function DecoratedModelFastener(this: ModelFastener<M, S>, owner: M, key: string | undefined, fastenerName: string | undefined): ModelFastener<M, S, U> {
    let _this: ModelFastener<M, S, U> = function ModelFastenerAccessor(model?: S | U | null, targetModel?: Model | null): S | null | M {
      if (model === void 0) {
        return _this.model;
      } else {
        _this.setModel(model, targetModel);
        return _this.owner;
      }
    } as ModelFastener<M, S, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as ModelFastenerConstructor<M, S, U, I>;

  const _prototype = descriptor as unknown as ModelFastener<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (_prototype.child === void 0) {
    _prototype.child = true;
  }

  return _constructor;
};

ModelFastener.MountedFlag = 1 << 0;
