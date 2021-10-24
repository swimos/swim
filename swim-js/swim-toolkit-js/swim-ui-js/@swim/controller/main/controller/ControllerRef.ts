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
import type {FastenerOwner, Fastener} from "@swim/fastener";
import type {AnyController, ControllerFactory, Controller} from "./Controller";
import {ControllerRelationInit, ControllerRelationClass, ControllerRelation} from "./ControllerRelation";

export type ControllerRefType<F extends ControllerRef<any, any>> =
  F extends ControllerRef<any, infer C> ? C : never;

export interface ControllerRefInit<C extends Controller = Controller> extends ControllerRelationInit<C> {
  extends?: {prototype: ControllerRef<any, any>} | string | boolean | null;
  key?: string | boolean;
}

export type ControllerRefDescriptor<O = unknown, C extends Controller = Controller, I = {}> = ThisType<ControllerRef<O, C> & I> & ControllerRefInit<C> & Partial<I>;

export interface ControllerRefClass<F extends ControllerRef<any, any> = ControllerRef<any, any>> extends ControllerRelationClass<F> {
}

export interface ControllerRefFactory<F extends ControllerRef<any, any> = ControllerRef<any, any>> extends ControllerRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): ControllerRefFactory<F> & I;

  define<O, C extends Controller = Controller>(className: string, descriptor: ControllerRefDescriptor<O, C>): ControllerRefFactory<ControllerRef<any, C>>;
  define<O, C extends Controller = Controller>(className: string, descriptor: {observes: boolean} & ControllerRefDescriptor<O, C, ObserverType<C>>): ControllerRefFactory<ControllerRef<any, C>>;
  define<O, C extends Controller = Controller, I = {}>(className: string, descriptor: ControllerRefDescriptor<O, C, I>): ControllerRefFactory<ControllerRef<any, C> & I>;
  define<O, C extends Controller = Controller, I = {}>(className: string, descriptor: {observes: boolean} & ControllerRefDescriptor<O, C, I & ObserverType<C>>): ControllerRefFactory<ControllerRef<any, C> & I>;

  <O, C extends Controller = Controller>(descriptor: ControllerRefDescriptor<O, C>): PropertyDecorator;
  <O, C extends Controller = Controller>(descriptor: {observes: boolean} & ControllerRefDescriptor<O, C, ObserverType<C>>): PropertyDecorator;
  <O, C extends Controller = Controller, I = {}>(descriptor: ControllerRefDescriptor<O, C, I>): PropertyDecorator;
  <O, C extends Controller = Controller, I = {}>(descriptor: {observes: boolean} & ControllerRefDescriptor<O, C, I & ObserverType<C>>): PropertyDecorator;
}

export interface ControllerRef<O = unknown, C extends Controller = Controller> extends ControllerRelation<O, C> {
  (): C | null;
  (controller: AnyController<C> | null, targetController?: Controller | null, key?: string): O;

  /** @override */
  get familyType(): Class<ControllerRef<any, any>> | null;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly controller: C | null;

  getController(): C;

  setController(newController: AnyController<C> | null, targetController?: Controller | null, key?: string): C | null;

  attachController<C2 extends C>(controller: C2 | ControllerFactory<C2>, targetController?: Controller | null): C2;
  attachController(controller: AnyController<C>, targetController?: Controller | null): C;
  attachController(controller?: AnyController<C> | null, targetController?: Controller | null): C | null;

  detachController(): C | null;

  insertController(parentController?: Controller | null, newController?: AnyController<C> | null, targetController?: Controller | null, key?: string): C | null;

  removeController(): C | null;

  deleteController(): C | null;

  /** @internal @override */
  bindController(controller: Controller, targetController: Controller | null): void;

  /** @internal @override */
  unbindController(controller: Controller): void;

  /** @override */
  detectController(controller: Controller): C | null;

  /** @internal */
  get key(): string | undefined; // optional prototype field
}

export const ControllerRef = (function (_super: typeof ControllerRelation) {
  const ControllerRef: ControllerRefFactory = _super.extend("ControllerRef");

  Object.defineProperty(ControllerRef.prototype, "familyType", {
    get: function (this: ControllerRef): Class<ControllerRef<any, any>> | null {
      return ControllerRef;
    },
    configurable: true,
  });

  ControllerRef.prototype.onInherit = function (this: ControllerRef, superFastener: ControllerRef): void {
    this.setController(superFastener.controller);
  };

  ControllerRef.prototype.getController = function <C extends Controller>(this: ControllerRef<unknown, C>): C {
    const controller = this.controller;
    if (controller === null) {
      let message = controller + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "controller";
      throw new TypeError(message);
    }
    return controller;
  };

  ControllerRef.prototype.setController = function <C extends Controller>(this: ControllerRef<unknown, C>, newController: C  | null, targetController?: Controller | null, key?: string): C | null {
    if (newController !== null) {
      newController = this.fromAny(newController);
    }
    let oldController = this.controller;
    if (oldController !== newController) {
      if (targetController === void 0) {
        targetController = null;
      }
      let parentController: Controller | null;
      if (this.binds && (parentController = this.parentController, parentController !== null)) {
        if (oldController !== null && oldController.parent === parentController) {
          if (targetController === null) {
            targetController = parentController.nextChild(oldController);
          }
          oldController.remove();
        }
        if (newController !== null) {
          if (key === void 0) {
            key = this.key;
          }
          this.insertChild(parentController, newController, targetController, key);
        }
        oldController = this.controller;
      }
      if (oldController !== newController) {
        if (oldController !== null) {
          this.willDetachController(oldController);
          (this as Mutable<typeof this>).controller = null;
          this.onDetachController(oldController);
          this.deinitController(oldController);
          this.didDetachController(oldController);
        }
        if (newController !== null) {
          this.willAttachController(newController, targetController);
          (this as Mutable<typeof this>).controller = newController;
          this.onAttachController(newController, targetController);
          this.initController(newController);
          this.didAttachController(newController, targetController);
        }
      }
    }
    return oldController;
  };

  ControllerRef.prototype.attachController = function <C extends Controller>(this: ControllerRef<unknown, C>, newController?: AnyController<C> | null, targetController?: Controller | null): C | null {
    const oldController = this.controller;
    if (newController !== void 0 && newController !== null) {
      newController = this.fromAny(newController);
    } else if (oldController === null) {
      newController = this.createController();
    } else {
      newController = oldController;
    }
    if (newController !== null && newController !== oldController) {
      if (targetController === void 0) {
        targetController = null;
      }
      if (oldController !== null) {
        this.willDetachController(oldController);
        (this as Mutable<typeof this>).controller = null;
        this.onDetachController(oldController);
        this.deinitController(oldController);
        this.didDetachController(oldController);
      }
      this.willAttachController(newController, targetController);
      (this as Mutable<typeof this>).controller = newController;
      this.onAttachController(newController, targetController);
      this.initController(newController);
      this.didAttachController(newController, targetController);
    }
    return newController;
  };

  ControllerRef.prototype.detachController = function <C extends Controller>(this: ControllerRef<unknown, C>): C | null {
    const oldController = this.controller;
    if (oldController !== null) {
      this.willDetachController(oldController);
      (this as Mutable<typeof this>).controller = null;
      this.onDetachController(oldController);
      this.deinitController(oldController);
      this.didDetachController(oldController);
    }
    return oldController;
  };

  ControllerRef.prototype.insertController = function <C extends Controller>(this: ControllerRef<unknown, C>, parentController?: Controller | null, newController?: AnyController<C> | null, targetController?: Controller | null, key?: string): C | null {
    if (newController !== void 0 && newController !== null) {
      newController = this.fromAny(newController);
    } else {
      const oldController = this.controller;
      if (oldController === null) {
        newController = this.createController();
      } else {
        newController = oldController;
      }
    }
    if (newController !== null) {
      if (parentController === void 0 || parentController === null) {
        parentController = this.parentController;
      }
      if (targetController === void 0) {
        targetController = null;
      }
      if (key === void 0) {
        key = this.key;
      }
      if (parentController !== null && (newController.parent !== parentController || newController.key !== key)) {
        this.insertChild(parentController, newController, targetController, key);
      }
      const oldController = this.controller;
      if (newController !== oldController) {
        if (oldController !== null) {
          this.willDetachController(oldController);
          (this as Mutable<typeof this>).controller = null;
          this.onDetachController(oldController);
          this.deinitController(oldController);
          this.didDetachController(oldController);
          oldController.remove();
        }
        this.willAttachController(newController, targetController);
        (this as Mutable<typeof this>).controller = newController;
        this.onAttachController(newController, targetController);
        this.initController(newController);
        this.didAttachController(newController, targetController);
      }
    }
    return newController;
  };

  ControllerRef.prototype.removeController = function <C extends Controller>(this: ControllerRef<unknown, C>): C | null {
    const controller = this.controller;
    if (controller !== null) {
      controller.remove();
    }
    return controller;
  };

  ControllerRef.prototype.deleteController = function <C extends Controller>(this: ControllerRef<unknown, C>): C | null {
    const controller = this.detachController();
    if (controller !== null) {
      controller.remove();
    }
    return controller;
  };

  ControllerRef.prototype.bindController = function <C extends Controller>(this: ControllerRef<unknown, C>, controller: Controller, targetController: Controller | null): void {
    if (this.binds && this.controller === null) {
      const newController = this.detectController(controller);
      if (newController !== null) {
        this.willAttachController(newController, targetController);
        (this as Mutable<typeof this>).controller = newController;
        this.onAttachController(newController, targetController);
        this.initController(newController);
        this.didAttachController(newController, targetController);
      }
    }
  };

  ControllerRef.prototype.unbindController = function <C extends Controller>(this: ControllerRef<unknown, C>, controller: Controller): void {
    if (this.binds) {
      const oldController = this.detectController(controller);
      if (oldController !== null && this.controller === oldController) {
        this.willDetachController(oldController);
        (this as Mutable<typeof this>).controller = null;
        this.onDetachController(oldController);
        this.deinitController(oldController);
        this.didDetachController(oldController);
      }
    }
  };

  ControllerRef.prototype.detectController = function <C extends Controller>(this: ControllerRef<unknown, C>, controller: Controller): C | null {
    const key = this.key;
    if (key !== void 0 && key === controller.key) {
      return controller as C;
    }
    return null;
  };

  ControllerRef.construct = function <F extends ControllerRef<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (controller?: AnyController<ControllerRefType<F>> | null, targetController?: Controller | null, key?: string): ControllerRefType<F> | null | FastenerOwner<F> {
        if (controller === void 0) {
          return fastener!.controller;
        } else {
          fastener!.setController(controller, targetController, key);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).key = void 0;
    (fastener as Mutable<typeof fastener>).controller = null;
    return fastener;
  };

  ControllerRef.define = function <O, C extends Controller>(className: string, descriptor: ControllerRefDescriptor<O, C>): ControllerRefFactory<ControllerRef<any, C>> {
    let superClass = descriptor.extends as ControllerRefFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (descriptor.key === true) {
      Object.defineProperty(descriptor, "key", {
        value: className,
        configurable: true,
      });
    } else if (descriptor.key === false) {
      Object.defineProperty(descriptor, "key", {
        value: void 0,
        configurable: true,
      });
    }

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: ControllerRef<any, any>}, fastener: ControllerRef<O, C> | null, owner: O): ControllerRef<O, C> {
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

  return ControllerRef;
})(ControllerRelation);
