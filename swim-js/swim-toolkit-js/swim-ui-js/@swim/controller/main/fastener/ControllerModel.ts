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
import {FromAny, Mutable} from "@swim/util";
import {Model, ModelObserverType} from "@swim/model";
import {Controller} from "../Controller";

export type ControllerModelMemberType<C, K extends keyof C> =
  C[K] extends ControllerModel<any, infer M, any> ? M : never;

export type ControllerModelMemberInit<C, K extends keyof C> =
  C[K] extends ControllerModel<any, infer M, infer U> ? M | U : never;

export type ControllerModelFlags = number;

export interface ControllerModelInit<M extends Model, U = never> {
  extends?: ControllerModelClass;
  key?: string | boolean;
  type?: unknown;
  observe?: boolean;

  willSetModel?(newModel: M | null, oldModel: M | null, targetModel: Model | null): void;
  onSetModel?(newModel: M | null, oldModel: M | null, targetModel: Model | null): void;
  didSetModel?(newModel: M | null, oldModel: M | null, targetModel: Model | null): void;

  createModel?(): M | U | null;
  insertModel?(parentModel: Model, childModel: M, targetModel: Model | null, key: string | undefined): void;
  fromAny?(value: M | U): M | null;
}

export type ControllerModelDescriptor<C extends Controller, M extends Model, U = never, I = {}> = ControllerModelInit<M, U> & ThisType<ControllerModel<C, M, U> & I> & Partial<I>;

export interface ControllerModelConstructor<C extends Controller, M extends Model, U = never, I = {}> {
  new<O extends C>(owner: O, key: string | undefined, fastenerName: string | undefined): ControllerModel<O, M, U> & I;
  prototype: Omit<ControllerModel<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface ControllerModelClass extends Function {
  readonly prototype: Omit<ControllerModel<any, any>, "key"> & {key?: string | boolean};
}

export interface ControllerModel<C extends Controller, M extends Model, U = never> {
  (): M | null;
  (model: M | U | null, targetModel?: Model | null): C;

  readonly name: string;

  readonly owner: C;

  /** @hidden */
  fastenerFlags: ControllerModelFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ControllerModelFlags): void;

  readonly key: string | undefined;

  readonly model: M | null;

  getModel(): M;

  setModel(newModel: M | U | null, targetModel?: Model | null): M | null;

  /** @hidden */
  attachModel(newModel: M): void;

  /** @hidden */
  detachModel(oldModel: M): void;

  /** @hidden */
  willSetModel(newModel: M | null, oldModel: M | null, targetModel: Model | null): void;

  /** @hidden */
  onSetModel(newModel: M | null, oldModel: M | null, targetModel: Model | null): void;

  /** @hidden */
  didSetModel(newModel: M | null, oldModel: M | null, targetModel: Model | null): void;

  injectModel(parentModel: Model, childModel?: M | U | null, targetModel?: Model | null, key?: string | null): M | null;

  createModel(): M | U | null;

  /** @hidden */
  insertModel(parentModel: Model, childModel: M, targetMoel: Model | null, key: string | undefined): void;

  removeModel(): M | null;

  /** @hidden */
  observe?: boolean;

  /** @hidden */
  readonly type?: unknown;

  fromAny(value: M | U): M | null;

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

export const ControllerModel = function <C extends Controller, M extends Model, U>(
    this: ControllerModel<C, M, U> | typeof ControllerModel,
    owner: C | ControllerModelDescriptor<C, M, U>,
    key?: string,
    fastenerName?: string,
  ): ControllerModel<C, M, U> | PropertyDecorator {
  if (this instanceof ControllerModel) { // constructor
    return ControllerModelConstructor.call(this as unknown as ControllerModel<Controller, Model, unknown>, owner as C, key, fastenerName);
  } else { // decorator factory
    return ControllerModelDecoratorFactory(owner as ControllerModelDescriptor<C, M, U>);
  }
} as {
  /** @hidden */
  new<C extends Controller, M extends Model, U = never>(owner: C, key: string | undefined, fastenerName: string | undefined): ControllerModel<C, M, U>;

  <C extends Controller, M extends Model = Model, U = never, I = {}>(descriptor: {observe: boolean} & ControllerModelDescriptor<C, M, U, I & ModelObserverType<M>>): PropertyDecorator;
  <C extends Controller, M extends Model = Model, U = never, I = {}>(descriptor: ControllerModelDescriptor<C, M, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: ControllerModel<any, any>;

  define<C extends Controller, M extends Model = Model, U = never, I = {}>(descriptor: {observe: boolean} & ControllerModelDescriptor<C, M, U, I & ModelObserverType<M>>): ControllerModelConstructor<C, M, U, I>;
  define<C extends Controller, M extends Model = Model, U = never, I = {}>(descriptor: ControllerModelDescriptor<C, M, U, I>): ControllerModelConstructor<C, M, U, I>;

  /** @hidden */
  MountedFlag: ControllerModelFlags;
};
__extends(ControllerModel, Object);

function ControllerModelConstructor<C extends Controller, M extends Model, U>(this: ControllerModel<C, M, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ControllerModel<C, M, U> {
  if (fastenerName !== void 0) {
    Object.defineProperty(this, "name", {
      value: fastenerName,
      enumerable: true,
      configurable: true,
    });
  }
  (this as Mutable<typeof this>).owner = owner;
  (this as Mutable<typeof this>).fastenerFlags = 0;
  (this as Mutable<typeof this>).key = key;
  (this as Mutable<typeof this>).model = null;
  return this;
}

function ControllerModelDecoratorFactory<C extends Controller, M extends Model, U = never>(descriptor: ControllerModelDescriptor<C, M, U>): PropertyDecorator {
  return Controller.decorateControllerModel.bind(Controller, ControllerModel.define(descriptor as ControllerModelDescriptor<Controller, Model>));
}

ControllerModel.prototype.setFastenerFlags = function (this: ControllerModel<Controller, Model>, fastenerFlags: ControllerModelFlags): void {
  (this as Mutable<typeof this>).fastenerFlags = fastenerFlags;
};

ControllerModel.prototype.getModel = function <M extends Model>(this: ControllerModel<Controller, M>): M {
  const model = this.model;
  if (model === null) {
    throw new TypeError("null " + this.name + " model");
  }
  return model;
};

ControllerModel.prototype.setModel = function <M extends Model>(this: ControllerModel<Controller, M>, newModel: M | null, targetModel?: Model | null): M | null {
  const oldModel = this.model;
  if (newModel !== null) {
    newModel = this.fromAny(newModel);
  }
  if (oldModel !== newModel) {
    if (targetModel === void 0) {
      targetModel = null;
    }
    this.willSetModel(newModel, oldModel, targetModel);
    if (oldModel !== null) {
      this.detachModel(oldModel);
    }
    (this as Mutable<typeof this>).model = newModel;
    if (newModel !== null) {
      this.attachModel(newModel);
    }
    this.onSetModel(newModel, oldModel, targetModel);
    this.didSetModel(newModel, oldModel, targetModel);
  }
  return oldModel;
};

ControllerModel.prototype.attachModel = function <M extends Model>(this: ControllerModel<Controller, M>, newModel: M): void {
  if (this.observe === true) {
    newModel.addModelObserver(this as ModelObserverType<M>);
  }
};

ControllerModel.prototype.detachModel = function <M extends Model>(this: ControllerModel<Controller, M>, oldModel: M): void {
  if (this.observe === true) {
    oldModel.removeModelObserver(this as ModelObserverType<M>);
  }
};

ControllerModel.prototype.willSetModel = function <M extends Model>(this: ControllerModel<Controller, M>, newModel: M | null, oldModel: M | null, targetModel: Model | null): void {
  // hook
};

ControllerModel.prototype.onSetModel = function <M extends Model>(this: ControllerModel<Controller, M>, newModel: M | null, oldModel: M | null, targetModel: Model | null): void {
  // hook
};

ControllerModel.prototype.didSetModel = function <M extends Model>(this: ControllerModel<Controller, M>, newModel: M | null, oldModel: M | null, targetModel: Model | null): void {
  // hook
};

ControllerModel.prototype.injectModel = function <M extends Model>(this: ControllerModel<Controller, M>, parentModel: Model, childModel?: M | null, targetModel?: Model | null, key?: string | null): M | null {
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
      this.setModel(childModel, targetModel);
    }
  }
  if (childModel !== null) {
    if (key === void 0) {
      key = this.key;
    } else if (key === null) {
      key = void 0;
    }
    if (childModel.parentModel !== parentModel || childModel.key !== key) {
      this.insertModel(parentModel, childModel, targetModel, key);
    }
    if (this.model === null) {
      this.setModel(childModel, targetModel);
    }
  }
  return childModel;
};

ControllerModel.prototype.createModel = function <M extends Model, U>(this: ControllerModel<Controller, M, U>): M | U | null {
  return null;
};

ControllerModel.prototype.insertModel = function <M extends Model>(this: ControllerModel<Controller, M>, parentModel: Model, childModel: M, targetModel: Model | null, key: string | undefined): void {
  parentModel.insertChildModel(childModel, targetModel, key);
};

ControllerModel.prototype.removeModel = function <M extends Model>(this: ControllerModel<Controller, M>): M | null {
  const childModel = this.model;
  if (childModel !== null) {
    childModel.remove();
  }
  return childModel;
};

ControllerModel.prototype.fromAny = function <M extends Model, U>(this: ControllerModel<Controller, M, U>, value: M | U): M | null {
  const type = this.type;
  if (FromAny.is<M, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof Model) {
    return value;
  }
  return null;
};

ControllerModel.prototype.isMounted = function (this: ControllerModel<Controller, Model>): boolean {
  return (this.fastenerFlags & ControllerModel.MountedFlag) !== 0;
};

ControllerModel.prototype.mount = function (this: ControllerModel<Controller, Model>): void {
  if ((this.fastenerFlags & ControllerModel.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ControllerModel.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ControllerModel.prototype.willMount = function (this: ControllerModel<Controller, Model>): void {
  // hook
};

ControllerModel.prototype.onMount = function (this: ControllerModel<Controller, Model>): void {
  // hook
};

ControllerModel.prototype.didMount = function (this: ControllerModel<Controller, Model>): void {
  // hook
};

ControllerModel.prototype.unmount = function (this: ControllerModel<Controller, Model>): void {
  if ((this.fastenerFlags & ControllerModel.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ControllerModel.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ControllerModel.prototype.willUnmount = function (this: ControllerModel<Controller, Model>): void {
  // hook
};

ControllerModel.prototype.onUnmount = function (this: ControllerModel<Controller, Model>): void {
  // hook
};

ControllerModel.prototype.didUnmount = function (this: ControllerModel<Controller, Model>): void {
  // hook
};

ControllerModel.define = function <C extends Controller, M extends Model, U, I>(descriptor: ControllerModelDescriptor<C, M, U, I>): ControllerModelConstructor<C, M, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ControllerModel;
  }

  const _constructor = function DecoratedControllerModel(this: ControllerModel<C, M, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ControllerModel<C, M, U> {
    let _this: ControllerModel<C, M, U> = function ControllerModelAccessor(model?: M | null, targetModel?: Model | null): M | null | C {
      if (model === void 0) {
        return _this.model;
      } else {
        _this.setModel(model, targetModel);
        return _this.owner;
      }
    } as ControllerModel<C, M, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as ControllerModelConstructor<C, M, U, I>;

  const _prototype = descriptor as unknown as ControllerModel<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  return _constructor;
};

ControllerModel.MountedFlag = 1 << 0;
