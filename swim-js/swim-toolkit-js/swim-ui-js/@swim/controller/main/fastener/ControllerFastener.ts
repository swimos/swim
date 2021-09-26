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
import {Controller} from "../Controller";
import type {ControllerObserverType} from "../ControllerObserver";

export type ControllerFastenerMemberType<C, K extends keyof C> =
  C[K] extends ControllerFastener<any, infer S, any> ? S : never;

export type ControllerFastenerMemberInit<C, K extends keyof C> =
  C[K] extends ControllerFastener<any, infer T, infer U> ? T | U : never;

export type ControllerFastenerFlags = number;

export interface ControllerFastenerInit<S extends Controller, U = never> {
  extends?: ControllerFastenerClass;
  key?: string | boolean;
  type?: unknown;
  child?: boolean;
  observe?: boolean;

  willSetController?(newController: S | null, oldController: S | null, targetController: Controller | null): void;
  onSetController?(newController: S | null, oldController: S | null, targetController: Controller | null): void;
  didSetController?(newController: S | null, oldController: S | null, targetController: Controller | null): void;

  parentController?: Controller | null;
  createController?(): S | U | null;
  insertController?(parentController: Controller, childController: S, targetController: Controller | null, key: string | undefined): void;
  fromAny?(value: S | U): S | null;
}

export type ControllerFastenerDescriptor<C extends Controller, S extends Controller, U = never, I = {}> = ControllerFastenerInit<S, U> & ThisType<ControllerFastener<C, S, U> & I> & Partial<I>;

export interface ControllerFastenerConstructor<C extends Controller, S extends Controller, U = never, I = {}> {
  new<O extends C>(owner: O, key: string | undefined, fastenerName: string | undefined): ControllerFastener<O, S, U> & I;
  prototype: Omit<ControllerFastener<any, any>, "key"> & {key?: string | boolean} & I;
}

export interface ControllerFastenerClass extends Function {
  readonly prototype: Omit<ControllerFastener<any, any>, "key"> & {key?: string | boolean};
}

export interface ControllerFastener<C extends Controller, S extends Controller, U = never> {
  (): S | null;
  (controller: S | U | null, targetController?: Controller | null): C;

  readonly name: string;

  readonly owner: C;

  /** @hidden */
  fastenerFlags: ControllerFastenerFlags;

  /** @hidden */
  setFastenerFlags(fastenerFlags: ControllerFastenerFlags): void;

  readonly key: string | undefined;

  readonly controller: S | null;

  getController(): S;

  setController(newController: S | U | null, targetController?: Controller | null): S | null;

  /** @hidden */
  doSetController(newController: S | null, targetController: Controller | null): void;

  /** @hidden */
  attachController(newController: S): void;

  /** @hidden */
  detachController(oldController: S): void;

  /** @hidden */
  willSetController(newController: S | null, oldController: S | null, targetController: Controller | null): void;

  /** @hidden */
  onSetController(newController: S | null, oldController: S | null, targetController: Controller | null): void;

  /** @hidden */
  didSetController(newController: S | null, oldController: S | null, targetController: Controller | null): void;

  /** @hidden */
  readonly parentController: Controller | null;

  injectController(parentController?: Controller | null, childController?: S | U | null, targetController?: Controller | null, key?: string | null): S | null;

  createController(): S | U | null;

  /** @hidden */
  insertController(parentController: Controller, childController: S, targetController: Controller | null, key: string | undefined): void;

  removeController(): S | null;

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

export const ControllerFastener = function <C extends Controller, S extends Controller, U>(
    this: ControllerFastener<C, S, U> | typeof ControllerFastener,
    owner: C | ControllerFastenerDescriptor<C, S, U>,
    key?: string,
    fastenerName?: string,
  ): ControllerFastener<C, S, U> | PropertyDecorator {
  if (this instanceof ControllerFastener) { // constructor
    return ControllerFastenerConstructor.call(this as unknown as ControllerFastener<Controller, Controller, unknown>, owner as C, key, fastenerName);
  } else { // decorator factory
    return ControllerFastenerDecoratorFactory(owner as ControllerFastenerDescriptor<C, S, U>);
  }
} as {
  /** @hidden */
  new<C extends Controller, S extends Controller, U = never>(owner: C, key: string | undefined, fastenerName: string | undefined): ControllerFastener<C, S, U>;

  <C extends Controller, S extends Controller = Controller, U = never, I = {}>(descriptor: {observe: boolean} & ControllerFastenerDescriptor<C, S, U, I & ControllerObserverType<S>>): PropertyDecorator;
  <C extends Controller, S extends Controller = Controller, U = never, I = {}>(descriptor: ControllerFastenerDescriptor<C, S, U, I>): PropertyDecorator;

  /** @hidden */
  prototype: ControllerFastener<any, any>;

  define<C extends Controller, S extends Controller = Controller, U = never, I = {}>(descriptor: {observe: boolean} & ControllerFastenerDescriptor<C, S, U, I & ControllerObserverType<S>>): ControllerFastenerConstructor<C, S, U, I>;
  define<C extends Controller, S extends Controller = Controller, U = never, I = {}>(descriptor: ControllerFastenerDescriptor<C, S, U, I>): ControllerFastenerConstructor<C, S, U, I>;

  /** @hidden */
  MountedFlag: ControllerFastenerFlags;
};
__extends(ControllerFastener, Object);

function ControllerFastenerConstructor<C extends Controller, S extends Controller, U>(this: ControllerFastener<C, S, U>, owner: C, key: string | undefined, fastenerName: string | undefined): ControllerFastener<C, S, U> {
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
  (this as Mutable<typeof this>).controller = null;
  return this;
}

function ControllerFastenerDecoratorFactory<C extends Controller, S extends Controller, U>(descriptor: ControllerFastenerDescriptor<C, S, U>): PropertyDecorator {
  return Controller.decorateControllerFastener.bind(Controller, ControllerFastener.define(descriptor as ControllerFastenerDescriptor<Controller, Controller>));
}

ControllerFastener.prototype.setFastenerFlags = function (this: ControllerFastener<Controller, Controller>, fastenerFlags: ControllerFastenerFlags): void {
  (this as Mutable<typeof this>).fastenerFlags = fastenerFlags;
};

ControllerFastener.prototype.getController = function <S extends Controller>(this: ControllerFastener<Controller, S>): S {
  const controller = this.controller;
  if (controller === null) {
    throw new TypeError("null " + this.name + " controller");
  }
  return controller;
};

ControllerFastener.prototype.setController = function <S extends Controller>(this: ControllerFastener<Controller, S>, newController: S | null, targetController?: Controller | null): S | null {
  const oldController = this.controller;
  if (newController !== null) {
    newController = this.fromAny(newController);
  }
  if (targetController === void 0) {
    targetController = null;
  }
  if (this.child === true) {
    if (newController !== null && (newController.parentController !== this.owner || newController.key !== this.key)) {
      this.insertController(this.owner, newController, targetController, this.key);
    } else if (newController === null && oldController !== null) {
      oldController.remove();
    }
  }
  this.doSetController(newController, targetController);
  return oldController;
};

ControllerFastener.prototype.doSetController = function <S extends Controller>(this: ControllerFastener<Controller, S>, newController: S | null, targetController: Controller | null): void {
  const oldController = this.controller;
  if (oldController !== newController) {
    this.willSetController(newController, oldController, targetController);
    if (oldController !== null) {
      this.detachController(oldController);
    }
    (this as Mutable<typeof this>).controller = newController;
    if (newController !== null) {
      this.attachController(newController);
    }
    this.onSetController(newController, oldController, targetController);
    this.didSetController(newController, oldController, targetController);
  }
};

ControllerFastener.prototype.attachController = function <S extends Controller>(this: ControllerFastener<Controller, S>, newController: S): void {
  if (this.observe === true) {
    newController.addControllerObserver(this as ControllerObserverType<S>);
  }
};

ControllerFastener.prototype.detachController = function <S extends Controller>(this: ControllerFastener<Controller, S>, oldController: S): void {
  if (this.observe === true) {
    oldController.removeControllerObserver(this as ControllerObserverType<S>);
  }
};

ControllerFastener.prototype.willSetController = function <S extends Controller>(this: ControllerFastener<Controller, S>, newController: S | null, oldController: S | null, targetController: Controller | null): void {
  // hook
};

ControllerFastener.prototype.onSetController = function <S extends Controller>(this: ControllerFastener<Controller, S>, newController: S | null, oldController: S | null, targetController: Controller | null): void {
  // hook
};

ControllerFastener.prototype.didSetController = function <S extends Controller>(this: ControllerFastener<Controller, S>, newController: S | null, oldController: S | null, targetController: Controller | null): void {
  // hook
};

Object.defineProperty(ControllerFastener.prototype, "parentController", {
  get(this: ControllerFastener<Controller, Controller>): Controller | null {
    return this.owner;
  },
  enumerable: true,
  configurable: true,
});

ControllerFastener.prototype.injectController = function <S extends Controller>(this: ControllerFastener<Controller, S>, parentController?: Controller | null, childController?: S | null, targetController?: Controller | null, key?: string | null): S | null {
  if (targetController === void 0) {
    targetController = null;
  }
  if (childController === void 0 || childController === null) {
    childController = this.controller;
    if (childController === null) {
      childController = this.createController();
    }
  } else {
    childController = this.fromAny(childController);
    if (childController !== null) {
      this.doSetController(childController, targetController);
    }
  }
  if (childController !== null) {
    if (parentController === void 0 || parentController === null) {
      parentController = this.parentController;
    }
    if (key === void 0) {
      key = this.key;
    } else if (key === null) {
      key = void 0;
    }
    if (parentController !== null && (childController.parentController !== parentController || childController.key !== key)) {
      this.insertController(parentController, childController, targetController, key);
    }
    if (this.controller === null) {
      this.doSetController(childController, targetController);
    }
  }
  return childController
};

ControllerFastener.prototype.createController = function <S extends Controller, U>(this: ControllerFastener<Controller, S, U>): S | U | null {
  return null;
};

ControllerFastener.prototype.insertController = function <S extends Controller>(this: ControllerFastener<Controller, S>, parentController: Controller, childController: S, targetController: Controller | null, key: string | undefined): void {
  parentController.insertChildController(childController, targetController, key);
};

ControllerFastener.prototype.removeController = function <S extends Controller>(this: ControllerFastener<Controller, S>): S | null {
  const childController = this.controller;
  if (childController !== null) {
    childController.remove();
  }
  return childController;
};

ControllerFastener.prototype.fromAny = function <S extends Controller, U>(this: ControllerFastener<Controller, S, U>, value: S | U): S | null {
  const type = this.type;
  if (FromAny.is<S, U>(type)) {
    return type.fromAny(value);
  } else if (value instanceof Controller) {
    return value;
  }
  return null;
};

ControllerFastener.prototype.isMounted = function (this: ControllerFastener<Controller, Controller>): boolean {
  return (this.fastenerFlags & ControllerFastener.MountedFlag) !== 0;
};

ControllerFastener.prototype.mount = function (this: ControllerFastener<Controller, Controller>): void {
  if ((this.fastenerFlags & ControllerFastener.MountedFlag) === 0) {
    this.willMount();
    this.setFastenerFlags(this.fastenerFlags | ControllerFastener.MountedFlag);
    this.onMount();
    this.didMount();
  }
};

ControllerFastener.prototype.willMount = function (this: ControllerFastener<Controller, Controller>): void {
  // hook
};

ControllerFastener.prototype.onMount = function (this: ControllerFastener<Controller, Controller>): void {
  // hook
};

ControllerFastener.prototype.didMount = function (this: ControllerFastener<Controller, Controller>): void {
  // hook
};

ControllerFastener.prototype.unmount = function (this: ControllerFastener<Controller, Controller>): void {
  if ((this.fastenerFlags & ControllerFastener.MountedFlag) !== 0) {
    this.willUnmount();
    this.setFastenerFlags(this.fastenerFlags & ~ControllerFastener.MountedFlag);
    this.onUnmount();
    this.didUnmount();
  }
};

ControllerFastener.prototype.willUnmount = function (this: ControllerFastener<Controller, Controller>): void {
  // hook
};

ControllerFastener.prototype.onUnmount = function (this: ControllerFastener<Controller, Controller>): void {
  // hook
};

ControllerFastener.prototype.didUnmount = function (this: ControllerFastener<Controller, Controller>): void {
  // hook
};

ControllerFastener.define = function <C extends Controller, S extends Controller, U, I>(descriptor: ControllerFastenerDescriptor<C, S, U, I>): ControllerFastenerConstructor<C, S, U, I> {
  let _super = descriptor.extends;
  delete descriptor.extends;

  if (_super === void 0) {
    _super = ControllerFastener;
  }

  const _constructor = function DecoratedControllerFastener(this: ControllerFastener<C, S>, owner: C, key: string | undefined, fastenerName: string | undefined): ControllerFastener<C, S, U> {
    let _this: ControllerFastener<C, S, U> = function ControllerFastenerAccessor(controller?: S | U | null, targetController?: Controller | null): S | null | C {
      if (controller === void 0) {
        return _this.controller;
      } else {
        _this.setController(controller, targetController);
        return _this.owner;
      }
    } as ControllerFastener<C, S, U>;
    Object.setPrototypeOf(_this, this);
    _this = _super!.call(_this, owner, key, fastenerName) || _this;
    return _this;
  } as unknown as ControllerFastenerConstructor<C, S, U, I>;

  const _prototype = descriptor as unknown as ControllerFastener<any, any> & I;
  Object.setPrototypeOf(_constructor, _super);
  _constructor.prototype = _prototype;
  _constructor.prototype.constructor = _constructor;
  Object.setPrototypeOf(_constructor.prototype, _super.prototype);

  if (_prototype.child === void 0) {
    _prototype.child = true;
  }

  return _constructor;
};

ControllerFastener.MountedFlag = 1 << 0;
