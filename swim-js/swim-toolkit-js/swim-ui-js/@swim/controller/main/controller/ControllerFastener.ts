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

import {Mutable, Class, FromAny, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, Fastener} from "@swim/fastener";
import {AnyControllerFactory, Controller} from "./Controller";

export type ControllerFastenerType<F extends ControllerFastener<any, any, any>> =
  F extends ControllerFastener<any, infer C, any> ? C : never;

export type ControllerFastenerInitType<F extends ControllerFastener<any, any, any>> =
  F extends ControllerFastener<any, any, infer U> ? U : never;

export interface ControllerFastenerInit<C extends Controller = Controller, U = never> extends FastenerInit {
  key?: string | boolean;
  type?: AnyControllerFactory<C, U>;
  child?: boolean;
  observes?: boolean;

  willSetController?(newController: C | null, oldController: C | null, target: Controller | null): void;
  onSetController?(newController: C | null, oldController: C | null, target: Controller | null): void;
  didSetController?(newController: C | null, oldController: C | null, target: Controller | null): void;

  parentController?: Controller | null;
  createController?(): C | null;
  insertController?(parent: Controller, child: C, target: Controller | null, key: string | undefined): void;
  fromAny?(value: C | U): C | null;
}

export type ControllerFastenerDescriptor<O = unknown, C extends Controller = Controller, U = never, I = {}> = ThisType<ControllerFastener<O, C, U> & I> & ControllerFastenerInit<C, U> & Partial<I>;

export interface ControllerFastenerClass<F extends ControllerFastener<any, any> = ControllerFastener<any, any, any>> {
  /** @internal */
  prototype: F;

  create(owner: FastenerOwner<F>, fastenerName: string): F;

  construct(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F;

  extend<I = {}>(classMembers?: Partial<I> | null): ControllerFastenerClass<F> & I;

  define<O, C extends Controller = Controller, U = never>(descriptor: ControllerFastenerDescriptor<O, C, U>): ControllerFastenerClass<ControllerFastener<any, C, U>>;
  define<O, C extends Controller = Controller, U = never>(descriptor: {observes: boolean} & ControllerFastenerDescriptor<O, C, U, ObserverType<C>>): ControllerFastenerClass<ControllerFastener<any, C, U>>;
  define<O, C extends Controller = Controller, U = never, I = {}>(descriptor: ControllerFastenerDescriptor<O, C, U, I>): ControllerFastenerClass<ControllerFastener<any, C, U> & I>;
  define<O, C extends Controller = Controller, U = never, I = {}>(descriptor: {observes: boolean} & ControllerFastenerDescriptor<O, C, U, I & ObserverType<C>>): ControllerFastenerClass<ControllerFastener<any, C, U> & I>;

  <O, C extends Controller = Controller, U = never>(descriptor: ControllerFastenerDescriptor<O, C, U>): PropertyDecorator;
  <O, C extends Controller = Controller, U = never>(descriptor: {observes: boolean} & ControllerFastenerDescriptor<O, C, U, ObserverType<C>>): PropertyDecorator;
  <O, C extends Controller = Controller, U = never, I = {}>(descriptor: ControllerFastenerDescriptor<O, C, U, I>): PropertyDecorator;
  <O, C extends Controller = Controller, U = never, I = {}>(descriptor: {observes: boolean} & ControllerFastenerDescriptor<O, C, U, I & ObserverType<C>>): PropertyDecorator;
}

export interface ControllerFastener<O = unknown, C extends Controller = Controller, U = never> extends Fastener<O> {
  (): C | null;
  (controller: C | U | null, target?: Controller | null): O;

  /** @override */
  get familyType(): Class<ControllerFastener<any, any, any>> | null;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly controller: C | null;

  getController(): C;

  setController(newController: C | U | null, target?: Controller | null): C | null;

  /** @internal */
  setOwnController(newController: C | null, target: Controller | null): void;

  /** @protected */
  attachController(newController: C): void;

  /** @protected */
  detachController(oldController: C): void;

  /** @protected */
  willSetController(newController: C | null, oldController: C | null, target: Controller | null): void;

  /** @protected */
  onSetController(newController: C | null, oldController: C | null, target: Controller | null): void;

  /** @protected */
  didSetController(newController: C | null, oldController: C | null, target: Controller | null): void;

  readonly key: string | undefined;

  /** @internal @protected */
  get parentController(): Controller | null;

  injectController(parent?: Controller | null, child?: C | U | null, target?: Controller | null, key?: string | null): C | null;

  createController(): C | null;

  /** @internal @protected */
  insertController(parent: Controller, child: C, target: Controller | null, key: string | undefined): void;

  removeController(): C | null;

  /** @internal @protected */
  fromAny(value: C | U): C | null;

  /** @internal @protected */
  get type(): AnyControllerFactory<C, U> | undefined; // optional prototype property

  /** @internal @protected */
  get child(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observes(): boolean | undefined; // optional prototype property
}

export const ControllerFastener = (function (_super: typeof Fastener) {
  const ControllerFastener: ControllerFastenerClass = _super.extend();

  Object.defineProperty(ControllerFastener.prototype, "familyType", {
    get: function (this: ControllerFastener): Class<ControllerFastener<any, any, any>> | null {
      return ControllerFastener;
    },
    configurable: true,
  });

  ControllerFastener.prototype.onInherit = function (this: ControllerFastener, superFastener: ControllerFastener): void {
    this.setController(superFastener.controller);
  };

  ControllerFastener.prototype.getController = function <C extends Controller>(this: ControllerFastener<unknown, C>): C {
    const controller = this.controller;
    if (controller === null) {
      throw new TypeError("null " + this.name + " controller");
    }
    return controller;
  };

  ControllerFastener.prototype.setController = function <C extends Controller>(this: ControllerFastener<unknown, C>, newController: C | null, target?: Controller | null): C | null {
    const oldController = this.controller;
    if (newController !== null) {
      newController = this.fromAny(newController);
    }
    if (target === void 0) {
      target = null;
    }
    if (this.child === true) {
      if (newController !== null && newController.parent === null) {
        const parent = this.parentController;
        if (parent !== null) {
          this.insertController(parent, newController, target, this.key);
        }
      } else if (newController === null && oldController !== null) {
        oldController.remove();
      }
    }
    this.setOwnController(newController, target);
    return oldController;
  };

  ControllerFastener.prototype.setOwnController = function <C extends Controller>(this: ControllerFastener<unknown, C>, newController: C | null, target: Controller | null): void {
    const oldController = this.controller;
    if (oldController !== newController) {
      this.willSetController(newController, oldController, target);
      if (oldController !== null) {
        this.detachController(oldController);
      }
      (this as Mutable<typeof this>).controller = newController;
      if (newController !== null) {
        this.attachController(newController);
      }
      this.onSetController(newController, oldController, target);
      this.didSetController(newController, oldController, target);
    }
  };

  ControllerFastener.prototype.attachController = function <C extends Controller>(this: ControllerFastener<unknown, C>, newController: C): void {
    if (this.observes === true) {
      newController.observe(this as ObserverType<C>);
    }
  };

  ControllerFastener.prototype.detachController = function <C extends Controller>(this: ControllerFastener<unknown, C>, oldController: C): void {
    if (this.observes === true) {
      oldController.unobserve(this as ObserverType<C>);
    }
  };

  ControllerFastener.prototype.willSetController = function <C extends Controller>(this: ControllerFastener<unknown, C>, newController: C | null, oldController: C | null, target: Controller | null): void {
    // hook
  };

  ControllerFastener.prototype.onSetController = function <C extends Controller>(this: ControllerFastener<unknown, C>, newController: C | null, oldController: C | null, target: Controller | null): void {
    // hook
  };

  ControllerFastener.prototype.didSetController = function <C extends Controller>(this: ControllerFastener<unknown, C>, newController: C | null, oldController: C | null, target: Controller | null): void {
    // hook
  };

  Object.defineProperty(ControllerFastener.prototype, "parentController", {
    get(this: ControllerFastener): Controller | null {
      const owner = this.owner;
      return owner instanceof Controller ? owner : null;
    },
    configurable: true,
  });

  ControllerFastener.prototype.injectController = function <C extends Controller>(this: ControllerFastener<unknown, C>, parent?: Controller | null, child?: C | null, target?: Controller | null, key?: string | null): C | null {
    if (target === void 0) {
      target = null;
    }
    if (child === void 0 || child === null) {
      child = this.controller;
      if (child === null) {
        child = this.createController();
      }
    } else {
      child = this.fromAny(child);
      if (child !== null) {
        this.setOwnController(child, target);
      }
    }
    if (child !== null) {
      if (parent === void 0 || parent === null) {
        parent = this.parentController;
      }
      if (key === void 0) {
        key = this.key;
      } else if (key === null) {
        key = void 0;
      }
      if (parent !== null && (child.parent !== parent || child.key !== key)) {
        this.insertController(parent, child, target, key);
      }
      if (this.controller === null) {
        this.setOwnController(child, target);
      }
    }
    return child;
  };

  ControllerFastener.prototype.createController = function <C extends Controller, U>(this: ControllerFastener<unknown, C, U>): C | null {
    const type = this.type;
    if (type !== void 0 && type.create !== void 0) {
      return type.create();
    }
    return null;
  };

  ControllerFastener.prototype.insertController = function <C extends Controller>(this: ControllerFastener<unknown, C>, parent: Controller, child: C, target: Controller | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  ControllerFastener.prototype.removeController = function <C extends Controller>(this: ControllerFastener<unknown, C>): C | null {
    const controller = this.controller;
    if (controller !== null) {
      controller.remove();
    }
    return controller;
  };

  ControllerFastener.prototype.fromAny = function <C extends Controller, U>(this: ControllerFastener<unknown, C, U>, value: C | U): C | null {
    const type = this.type;
    if (FromAny.is<C, U>(type)) {
      return type.fromAny(value);
    } else if (value instanceof Controller) {
      return value;
    }
    return null;
  };

  ControllerFastener.construct = function <F extends ControllerFastener<any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F {
    if (fastener === null) {
      fastener = function ControllerFastener(controller?: ControllerFastenerType<F> | ControllerFastenerInitType<F> | null, target?: Controller | null): ControllerFastenerType<F> | null | FastenerOwner<F> {
        if (controller === void 0) {
          return fastener!.controller;
        } else {
          fastener!.setController(controller, target);
          return fastener!.owner;
        }
      } as F;
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner, fastenerName) as F;
    (fastener as Mutable<typeof fastener>).key = void 0;
    (fastener as Mutable<typeof fastener>).controller = null;
    return fastener;
  };

  ControllerFastener.define = function <O, C extends Controller, U>(descriptor: ControllerFastenerDescriptor<O, C, U>): ControllerFastenerClass<ControllerFastener<any, C, U>> {
    let superClass = descriptor.extends as ControllerFastenerClass | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const key = descriptor.key;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.key;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ControllerFastener<any, any, any>}, fastener: ControllerFastener<O, C, U> | null, owner: O, fastenerName: string): ControllerFastener<O, C, U> {
      fastener = superClass!.construct(fastenerClass, fastener, owner, fastenerName);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (typeof key === "string") {
        (fastener as Mutable<typeof fastener>).key = key;
      } else if (key === true) {
        (fastener as Mutable<typeof fastener>).key = fastenerName;
      }
      return fastener;
    };

    return fastenerClass;
  };

  return ControllerFastener;
})(Fastener);
