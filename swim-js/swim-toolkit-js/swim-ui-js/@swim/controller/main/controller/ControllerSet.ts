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

import type {Mutable, Class, ObserverType} from "@swim/util";
import type {FastenerOwner} from "@swim/fastener";
import type {AnyController, ControllerFactory, Controller} from "./Controller";
import {ControllerRelationInit, ControllerRelationClass, ControllerRelation} from "./ControllerRelation";

export type ControllerSetType<F extends ControllerSet<any, any>> =
  F extends ControllerSet<any, infer C> ? C : never;

export interface ControllerSetInit<C extends Controller = Controller> extends ControllerRelationInit<C> {
  extends?: {prototype: ControllerSet<any, any>} | string | boolean | null;
  key?(controller: C): string | undefined;
}

export type ControllerSetDescriptor<O = unknown, C extends Controller = Controller, I = {}> = ThisType<ControllerSet<O, C> & I> & ControllerSetInit<C> & Partial<I>;

export interface ControllerSetClass<F extends ControllerSet<any, any> = ControllerSet<any, any>> extends ControllerRelationClass<F> {
}

export interface ControllerSetFactory<F extends ControllerSet<any, any> = ControllerSet<any, any>> extends ControllerSetClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ControllerSetFactory<F> & I;

  define<O, C extends Controller = Controller>(className: string, descriptor: ControllerSetDescriptor<O, C>): ControllerSetFactory<ControllerSet<any, C>>;
  define<O, C extends Controller = Controller>(className: string, descriptor: {observes: boolean} & ControllerSetDescriptor<O, C, ObserverType<C>>): ControllerSetFactory<ControllerSet<any, C>>;
  define<O, C extends Controller = Controller, I = {}>(className: string, descriptor: ControllerSetDescriptor<O, C, I>): ControllerSetFactory<ControllerSet<any, C> & I>;
  define<O, C extends Controller = Controller, I = {}>(className: string, descriptor: {observes: boolean} & ControllerSetDescriptor<O, C, I & ObserverType<C>>): ControllerSetFactory<ControllerSet<any, C> & I>;

  <O, C extends Controller = Controller>(descriptor: ControllerSetDescriptor<O, C>): PropertyDecorator;
  <O, C extends Controller = Controller>(descriptor: {observes: boolean} & ControllerSetDescriptor<O, C, ObserverType<C>>): PropertyDecorator;
  <O, C extends Controller = Controller, I = {}>(descriptor: ControllerSetDescriptor<O, C, I>): PropertyDecorator;
  <O, C extends Controller = Controller, I = {}>(descriptor: {observes: boolean} & ControllerSetDescriptor<O, C, I & ObserverType<C>>): PropertyDecorator;
}

export interface ControllerSet<O = unknown, C extends Controller = Controller> extends ControllerRelation<O, C> {
  (newController: AnyController<C>): O;

  /** @override */
  get familyType(): Class<ControllerSet<any, any>> | null;

  /** @internal */
  readonly controllers: {readonly [id: number]: C | undefined};

  readonly controllerCount: number;

  hasController(controller: C): boolean;

  addController<C2 extends C>(controller: C2 | ControllerFactory<C2>, targetController?: Controller | null, key?: string): C2;
  addController(controller: AnyController<C>, targetController?: Controller | null, key?: string): C;
  addController(controller?: AnyController<C> | null, targetController?: Controller | null, key?: string): C | null;

  attachController<C2 extends C>(controller: C2 | ControllerFactory<C2>, targetController?: Controller | null): C2;
  attachController(controller: AnyController<C>, targetController?: Controller | null): C;
  attachController(controller?: AnyController<C> | null, targetController?: Controller | null): C | null;

  detachController(controller: C): C | null;

  insertController(parentController?: Controller | null, newController?: AnyController<C> | null, targetController?: Controller | null, key?: string): C | null;

  removeController(controller: C): C | null;

  deleteController(controller: C): C | null;

  /** @internal @override */
  bindController(controller: Controller, targetController: Controller | null): void;

  /** @internal @override */
  unbindController(controller: Controller): void;

  /** @override */
  detectController(controller: Controller): C | null;

  /** @internal @protected */
  key(controller: C): string | undefined;
}

export const ControllerSet = (function (_super: typeof ControllerRelation) {
  const ControllerSet: ControllerSetFactory = _super.extend("ControllerSet");

  Object.defineProperty(ControllerSet.prototype, "familyType", {
    get: function (this: ControllerSet): Class<ControllerSet<any, any>> | null {
      return ControllerSet;
    },
    configurable: true,
  });

  ControllerSet.prototype.hasController = function <C extends Controller>(this: ControllerSet<unknown, C>, controller: C): boolean {
    return this.controllers[controller.uid] !== void 0;
  };

  ControllerSet.prototype.addController = function <C extends Controller>(this: ControllerSet<unknown, C>, newController?: AnyController<C> | null, targetController?: Controller | null, key?: string): C | null {
    if (newController !== void 0 && newController !== null) {
      newController = this.fromAny(newController);
    } else {
      newController = this.createController();
    }
    if (newController !== null) {
      if (targetController === void 0) {
        targetController = null;
      }
      let parentController: Controller | null;
      if (this.binds && (parentController = this.parentController, parentController !== null)) {
        if (key === void 0) {
          key = this.key(newController);
        }
        this.insertChild(parentController, newController, targetController, key);
      }
      const controllers = this.controllers as {[id: number]: C | undefined};
      if (controllers[newController.uid] === void 0) {
        this.willAttachController(newController, targetController);
        controllers[newController.uid] = newController;
        (this as Mutable<typeof this>).controllerCount += 1;
        this.onAttachController(newController, targetController);
        this.initController(newController);
        this.didAttachController(newController, targetController);
      }
    }
    return newController;
  };

  ControllerSet.prototype.attachController = function <C extends Controller>(this: ControllerSet<unknown, C>, newController?: AnyController<C> | null, targetController?: Controller | null): C | null {
    if (newController !== void 0 && newController !== null) {
      newController = this.fromAny(newController);
    } else {
      newController = this.createController();
    }
    const controllers = this.controllers as {[id: number]: C | undefined};
    if (newController !== null && controllers[newController.uid] === void 0) {
      if (targetController === void 0) {
        targetController = null;
      }
      this.willAttachController(newController, targetController);
      controllers[newController.uid] = newController;
      (this as Mutable<typeof this>).controllerCount += 1;
      this.onAttachController(newController, targetController);
      this.initController(newController);
      this.didAttachController(newController, targetController);
    }
    return newController;
  };

  ControllerSet.prototype.detachController = function <C extends Controller>(this: ControllerSet<unknown, C>, oldController: C): C | null {
    const controllers = this.controllers as {[id: number]: C | undefined};
    if (controllers[oldController.uid] !== void 0) {
      this.willDetachController(oldController);
      (this as Mutable<typeof this>).controllerCount -= 1;
      delete controllers[oldController.uid];
      this.onDetachController(oldController);
      this.deinitController(oldController);
      this.didDetachController(oldController);
      return oldController;
    }
    return null;
  };

  ControllerSet.prototype.insertController = function <C extends Controller>(this: ControllerSet<unknown, C>, parentController?: Controller | null, newController?: AnyController<C> | null, targetController?: Controller | null, key?: string): C | null {
    if (newController !== void 0 && newController !== null) {
      newController = this.fromAny(newController);
    } else {
      newController = this.createController();
    }
    const controllers = this.controllers as {[id: number]: C | undefined};
    if (newController !== null) {
      if (parentController === void 0 || parentController === null) {
        parentController = this.parentController;
      }
      if (targetController === void 0) {
        targetController = null;
      }
      if (key === void 0) {
        key = this.key(newController);
      }
      if (parentController !== null && (newController.parent !== parentController || newController.key !== key)) {
        this.insertChild(parentController, newController, targetController, key);
      }
      if (controllers[newController.uid] === void 0) {
        this.willAttachController(newController, targetController);
        controllers[newController.uid] = newController;
        (this as Mutable<typeof this>).controllerCount += 1;
        this.onAttachController(newController, targetController);
        this.initController(newController);
        this.didAttachController(newController, targetController);
      }
    }
    return newController;
  };

  ControllerSet.prototype.removeController = function <C extends Controller>(this: ControllerSet<unknown, C>, controller: C): C | null {
    if (this.hasController(controller)) {
      controller.remove();
      return controller;
    }
    return null;
  };

  ControllerSet.prototype.deleteController = function <C extends Controller>(this: ControllerSet<unknown, C>, controller: C): C | null {
    const oldController = this.detachController(controller);
    if (oldController !== null) {
      oldController.remove();
    }
    return oldController;
  };

  ControllerSet.prototype.bindController = function <C extends Controller>(this: ControllerSet<unknown, C>, controller: Controller, targetController: Controller | null): void {
    if (this.binds) {
      const newController = this.detectController(controller);
      const controllers = this.controllers as {[id: number]: C | undefined};
      if (newController !== null && controllers[newController.uid] === void 0) {
        this.willAttachController(newController, targetController);
        controllers[newController.uid] = newController;
        (this as Mutable<typeof this>).controllerCount += 1;
        this.onAttachController(newController, targetController);
        this.initController(newController);
        this.didAttachController(newController, targetController);
      }
    }
  };

  ControllerSet.prototype.unbindController = function <C extends Controller>(this: ControllerSet<unknown, C>, controller: Controller): void {
    if (this.binds) {
      const oldController = this.detectController(controller);
      const controllers = this.controllers as {[id: number]: C | undefined};
      if (oldController !== null && controllers[oldController.uid] !== void 0) {
        this.willDetachController(oldController);
        (this as Mutable<typeof this>).controllerCount -= 1;
        delete controllers[oldController.uid];
        this.onDetachController(oldController);
        this.deinitController(oldController);
        this.didDetachController(oldController);
      }
    }
  };

  ControllerSet.prototype.detectController = function <C extends Controller>(this: ControllerSet<unknown, C>, controller: Controller): C | null {
    if (typeof this.type === "function" && controller instanceof this.type) {
      return controller as C;
    }
    return null;
  };

  ControllerSet.prototype.key = function <C extends Controller>(this: ControllerSet<unknown, C>, controller: C): string | undefined {
    return void 0;
  };

  ControllerSet.construct = function <F extends ControllerSet<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (newController: AnyController<ControllerSetType<F>>): FastenerOwner<F> {
        fastener!.addController(newController);
        return fastener!.owner;
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).controllers = {};
    (fastener as Mutable<typeof fastener>).controllerCount = 0;
    return fastener;
  };

  ControllerSet.define = function <O, C extends Controller>(className: string, descriptor: ControllerSetDescriptor<O, C>): ControllerSetFactory<ControllerSet<any, C>> {
    let superClass = descriptor.extends as ControllerSetFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ControllerSet<any, any>}, fastener: ControllerSet<O, C> | null, owner: O): ControllerSet<O, C> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      return fastener;
    };

    return fastenerClass;
  };

  return ControllerSet;
})(ControllerRelation);
