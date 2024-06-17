// Copyright 2015-2024 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import {Affinity} from "@swim/component";
import {FastenerContext} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {Controller} from "./Controller";
import type {ControllerRelationDescriptor} from "./ControllerRelation";
import type {ControllerRelationClass} from "./ControllerRelation";
import {ControllerRelation} from "./ControllerRelation";

/** @public */
export interface ControllerRefDescriptor<R, C extends Controller> extends ControllerRelationDescriptor<R, C> {
  extends?: Proto<ControllerRef<any, any, any>> | boolean | null;
  controllerKey?: string | boolean;
}

/** @public */
export interface ControllerRefClass<F extends ControllerRef<any, any, any> = ControllerRef<any, any, any>> extends ControllerRelationClass<F> {
  tryController<R, K extends keyof R, F extends R[K] = R[K]>(owner: R, fastenerName: K): (F extends {readonly controller: infer C | null} ? C | null : never) | null;
}

/** @public */
export interface ControllerRef<R = any, C extends Controller = Controller, I extends any[] = [C | null]> extends ControllerRelation<R, C, I> {
  /** @override */
  get descriptorType(): Proto<ControllerRefDescriptor<R, C>>;

  /** @override */
  get fastenerType(): Proto<ControllerRef<any, any, any>>;

  /** @override */
  get parent(): ControllerRef<any, C, any> | null;

  get inletController(): C | null;

  getInletController(): C;

  get controllerKey(): string | undefined;

  get(): C | null;

  set(controller: C | LikeType<C> | Fastener<any, I[0], any> | null): R;

  setIntrinsic(controller: C | LikeType<C> | Fastener<any, I[0], any> | null): R;

  readonly controller: C | null;

  getController(): C;

  setController(controller: C | LikeType<C> | null, target?: Controller | null, key?: string): C | null;

  attachController(controller?: C | LikeType<C> | null, target?: Controller | null): C;

  detachController(): C | null;

  insertController(parent?: Controller | null, controller?: C | LikeType<C>, target?: Controller | null, key?: string): C;

  removeController(): C | null;

  deleteController(): C | null;

  /** @internal @override */
  bindController(controller: Controller, target: Controller | null): void;

  /** @internal @override */
  unbindController(controller: Controller): void;

  /** @override */
  detectController(controller: Controller): C | null;

  /** @protected @override */
  onStartConsuming(): void;

  /** @protected @override */
  onStopConsuming(): void;

  /** @override */
  recohere(t: number): void;
}

/** @public */
export const ControllerRef = (<R, C extends Controller, I extends any[], F extends ControllerRef<any, any, any>>() => ControllerRelation.extend<ControllerRef<R, C, I>, ControllerRefClass<F>>("ControllerRef", {
  get fastenerType(): Proto<ControllerRef<any, any, any>> {
    return ControllerRef;
  },

  get inletController(): C | null {
    const inlet = this.inlet;
    return inlet instanceof ControllerRef ? inlet.controller : null;
  },

  getInletController(): C {
    const inletController = this.inletController;
    if (inletController === void 0 || inletController === null) {
      let message = inletController + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "inlet controller";
      throw new TypeError(message);
    }
    return inletController;
  },

  get(): C | null {
    return this.controller;
  },

  set(controller: C | LikeType<C> | Fastener<any, I[0], any> | null): R {
    if (controller instanceof Fastener) {
      this.bindInlet(controller);
    } else {
      this.setController(controller);
    }
    return this.owner;
  },

  setIntrinsic(controller: C | LikeType<C> | Fastener<any, I[0], any> | null): R {
    if (controller instanceof Fastener) {
      this.bindInlet(controller);
    } else {
      this.setController(controller);
    }
    return this.owner;
  },

  controllerKey: void 0,

  getController(): C {
    const controller = this.controller;
    if (controller === null) {
      let message = controller + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "controller";
      throw new TypeError(message);
    }
    return controller;
  },

  setController(newController: C  | null, target?: Controller | null, key?: string): C | null {
    if (newController !== null) {
      newController = this.fromLike(newController);
    }
    let oldController = this.controller;
    if (oldController === newController) {
      this.setCoherent(true);
      return oldController;
    } else if (target === void 0) {
      target = null;
    }
    let parent: Controller | null;
    if (this.binds && (parent = this.parentController, parent !== null)) {
      if (oldController !== null && oldController.parent === parent) {
        if (target === null) {
          target = oldController.nextSibling;
        }
        oldController.remove();
      }
      if (newController !== null) {
        if (key === void 0) {
          key = this.controllerKey;
        }
        this.insertChild(parent, newController, target, key);
      }
      oldController = this.controller;
      if (oldController === newController) {
        return oldController;
      }
    }
    if (oldController !== null) {
      (this as Mutable<typeof this>).controller = null;
      this.willDetachController(oldController);
      this.onDetachController(oldController);
      this.deinitController(oldController);
      this.didDetachController(oldController);
    }
    if (newController !== null) {
      (this as Mutable<typeof this>).controller = newController;
      this.willAttachController(newController, target);
      this.onAttachController(newController, target);
      this.initController(newController);
      this.didAttachController(newController, target);
    }
    this.setCoherent(true);
    this.decohereOutlets();
    return oldController;
  },

  attachController(newController?: C | LikeType<C> | null, target?: Controller | null): C {
    const oldController = this.controller;
    if (newController !== void 0 && newController !== null) {
      newController = this.fromLike(newController);
    } else if (oldController === null) {
      newController = this.createController();
    } else {
      newController = oldController;
    }
    if (target === void 0) {
      target = null;
    }
    if (oldController === newController) {
      return newController;
    } else if (oldController !== null) {
      (this as Mutable<typeof this>).controller = null;
      this.willDetachController(oldController);
      this.onDetachController(oldController);
      this.deinitController(oldController);
      this.didDetachController(oldController);
    }
    (this as Mutable<typeof this>).controller = newController;
    this.willAttachController(newController, target);
    this.onAttachController(newController, target);
    this.initController(newController);
    this.didAttachController(newController, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newController;
  },

  detachController(): C | null {
    const oldController = this.controller;
    if (oldController === null) {
      return null;
    }
    (this as Mutable<typeof this>).controller = null;
    this.willDetachController(oldController);
    this.onDetachController(oldController);
    this.deinitController(oldController);
    this.didDetachController(oldController);
    this.setCoherent(true);
    this.decohereOutlets();
    return oldController;
  },

  insertController(parent?: Controller | null, newController?: C | LikeType<C>, target?: Controller | null, key?: string): C {
    let oldController = this.controller;
    if (newController !== void 0 && newController !== null) {
      newController = this.fromLike(newController);
    } else if (oldController === null) {
      newController = this.createController();
    } else {
      newController = oldController;
    }
    if (parent === void 0) {
      parent = null;
    }
    if (!this.binds && oldController === newController && newController.parent !== null && parent === null && key === void 0) {
      return newController;
    }
    if (parent === null) {
      parent = this.parentController;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.controllerKey;
    }
    if (parent !== null && (newController.parent !== parent || newController.key !== key)) {
      this.insertChild(parent, newController, target, key);
    }
    oldController = this.controller;
    if (oldController === newController) {
      return newController;
    } else if (oldController !== null) {
      (this as Mutable<typeof this>).controller = null;
      this.willDetachController(oldController);
      this.onDetachController(oldController);
      this.deinitController(oldController);
      this.didDetachController(oldController);
      if (this.binds && parent !== null && oldController.parent === parent) {
        oldController.remove();
      }
    }
    (this as Mutable<typeof this>).controller = newController;
    this.willAttachController(newController, target);
    this.onAttachController(newController, target);
    this.initController(newController);
    this.didAttachController(newController, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newController;
  },

  removeController(): C | null {
    const controller = this.controller;
    if (controller === null) {
      return null;
    }
    controller.remove();
    return controller;
  },

  deleteController(): C | null {
    const controller = this.detachController();
    if (controller === null) {
      return null;
    }
    controller.remove();
    return controller;
  },

  bindController(controller: Controller, target: Controller | null): void {
    if (!this.binds || this.controller !== null) {
      return;
    }
    const newController = this.detectController(controller);
    if (newController === null) {
      return;
    }
    (this as Mutable<typeof this>).controller = newController;
    this.willAttachController(newController, target);
    this.onAttachController(newController, target);
    this.initController(newController);
    this.didAttachController(newController, target);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindController(controller: Controller): void {
    if (!this.binds) {
      return;
    }
    const oldController = this.detectController(controller);
    if (oldController === null || this.controller !== oldController) {
      return;
    }
    (this as Mutable<typeof this>).controller = null;
    this.willDetachController(oldController);
    this.onDetachController(oldController);
    this.deinitController(oldController);
    this.didDetachController(oldController);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectController(controller: Controller): C | null {
    const key = this.controllerKey;
    if (key !== void 0 && key === controller.key) {
      return controller as C;
    }
    return null;
  },

  onStartConsuming(): void {
    const controller = this.controller;
    if (controller !== null) {
      controller.consume(this);
    }
  },

  onStopConsuming(): void {
    const controller = this.controller;
    if (controller !== null) {
      controller.unconsume(this);
    }
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof ControllerRef) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setController(inlet.controller);
      }
    } else {
      this.setDerived(false);
    }
  },
},
{
  tryController<R, K extends keyof R, F extends R[K]>(owner: R, fastenerName: K): (F extends {readonly controller: infer C | null} ? C | null : never) | null {
    const metaclass = FastenerContext.getMetaclass(owner);
    const controllerRef = metaclass !== null ? metaclass.tryFastener(owner, fastenerName) : null;
    return controllerRef instanceof ControllerRef ? controllerRef.controller : null;
  },

  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).controller = null;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<ControllerRef<any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    const controllerKeyDescriptor = Object.getOwnPropertyDescriptor(fastenerPrototype, "controllerKey");
    if (controllerKeyDescriptor !== void 0 && "value" in controllerKeyDescriptor) {
      if (controllerKeyDescriptor.value === true) {
        controllerKeyDescriptor.value = fastenerClass.name;
        Object.defineProperty(fastenerPrototype, "controllerKey", controllerKeyDescriptor);
      } else if (controllerKeyDescriptor.value === false) {
        controllerKeyDescriptor.value = void 0;
        Object.defineProperty(fastenerPrototype, "controllerKey", controllerKeyDescriptor);
      }
    }
  },
}))();
