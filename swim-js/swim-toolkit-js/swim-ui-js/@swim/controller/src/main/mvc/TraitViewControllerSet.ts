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

import type {Mutable, ObserverType} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import type {Controller} from "../controller/Controller";
import {ControllerSetInit, ControllerSetClass, ControllerSet} from "../controller/ControllerSet";
import type {TraitViewRef} from "./TraitViewRef";

/** @internal */
export type TraitViewControllerSetType<F extends TraitViewControllerSet<any, any, any, any>> =
  F extends TraitViewControllerSet<any, any, any, infer C> ? C : never;

/** @public */
export interface TraitViewControllerSetInit<T extends Trait = Trait, V extends View = View, C extends Controller = Controller> extends ControllerSetInit<C> {
  extends?: {prototype: TraitViewControllerSet<any, any, any, any>} | string | boolean | null;
  getTraitViewRef?(controller: C): TraitViewRef<any, T, V>;
  willAttachControllerTrait?(controller: C, trait: T, targetTrait: Trait | null): void;
  didAttachControllerTrait?(controller: C, trait: T, targetTrait: Trait | null): void;
  willDetachControllerTrait?(controller: C, trait: T): void;
  didDetachControllerTrait?(controller: C, trait: T): void;
  createController?(trait?: T): C;
  parentView?: View | null;
}

/** @public */
export type TraitViewControllerSetDescriptor<O = unknown, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}> = ThisType<TraitViewControllerSet<O, T, V, C> & I> & TraitViewControllerSetInit<T, V, C> & Partial<I>;

/** @public */
export interface TraitViewControllerSetClass<F extends TraitViewControllerSet<any, any, any, any> = TraitViewControllerSet<any, any, any, any>> extends ControllerSetClass<F> {
}

/** @public */
export interface TraitViewControllerSetFactory<F extends TraitViewControllerSet<any, any, any, any> = TraitViewControllerSet<any, any, any, any>> extends TraitViewControllerSetClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitViewControllerSetFactory<F> & I;

  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(className: string, descriptor: TraitViewControllerSetDescriptor<O, T, V, C>): TraitViewControllerSetFactory<TraitViewControllerSet<any, T, V, C>>;
  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(className: string, descriptor: {observes: boolean} & TraitViewControllerSetDescriptor<O, T, V, C, ObserverType<C>>): TraitViewControllerSetFactory<TraitViewControllerSet<any, T, V, C>>;
  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(className: string, descriptor: TraitViewControllerSetDescriptor<O, T, V, C, I>): TraitViewControllerSetFactory<TraitViewControllerSet<any, T, V, C> & I>;
  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(className: string, descriptor: {observes: boolean} & TraitViewControllerSetDescriptor<O, T, V, C, I & ObserverType<C>>): TraitViewControllerSetFactory<TraitViewControllerSet<any, T, V, C> & I>;

  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(descriptor: TraitViewControllerSetDescriptor<O, T, V, C>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(descriptor: {observes: boolean} & TraitViewControllerSetDescriptor<O, T, V, C, ObserverType<C>>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(descriptor: TraitViewControllerSetDescriptor<O, T, V, C, I>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(descriptor: {observes: boolean} & TraitViewControllerSetDescriptor<O, T, V, C, I & ObserverType<C>>): PropertyDecorator;
}

/** @public */
export interface TraitViewControllerSet<O = unknown, T extends Trait = Trait, V extends View = View, C extends Controller = Controller> extends ControllerSet<O, C> {
  /** @internal */
  readonly traitControllers: {readonly [traitId: number]: C | undefined};

  /** @internal */
  getTraitViewRef(controller: C): TraitViewRef<unknown, T, V>;

  hasTraitController(trait: Trait): boolean;

  addTraitController(trait: T, targetTrait?: Trait | null, key?: string): C;

  removeTraitController(trait: T): C | null;

  deleteTraitController(trait: T): C | null;

  attachControllerTrait(controller: C, trait: T, targetTrait?: Trait | null): C;

  /** @protected */
  initControllerTrait(controller: C, trait: T): void;

  /** @protected */
  willAttachControllerTrait(controller: C, trait: T, targetTrait: Trait | null): void;

  /** @protected */
  onAttachControllerTrait(controller: C, trait: T, targetTrait: Trait | null): void;

  /** @protected */
  didAttachControllerTrait(controller: C, trait: T, targetTrait: Trait | null): void;

  detachControllerTrait(controller: C, trait: T): C | null;

  /** @protected */
  deinitControllerTrait(controller: C, trait: T): void;

  /** @protected */
  willDetachControllerTrait(controller: C, trait: T): void;

  /** @protected */
  onDetachControllerTrait(controller: C, trait: T): void;

  /** @protected */
  didDetachControllerTrait(controller: C, trait: T): void;

  /** @protected @override */
  onAttachController(controller: C, targetController: Controller | null): void;

  /** @protected @override */
  onDetachController(controller: C): void;

  createController(trait?: T): C;

  /** @internal @protected */
  get parentView(): View | null; // optional prototype property
}

/** @public */
export const TraitViewControllerSet = (function (_super: typeof ControllerSet) {
  const TraitViewControllerSet: TraitViewControllerSetFactory = _super.extend("TraitViewControllerSet");

  TraitViewControllerSet.prototype.getTraitViewRef = function <T extends Trait, V extends View, C extends Controller>(controller: C): TraitViewRef<unknown, T, V> {
    throw new Error("missing implementation");
  };

  TraitViewControllerSet.prototype.hasTraitController = function (this: TraitViewControllerSet, trait: Trait): boolean {
    return this.traitControllers[trait.uid] !== void 0;
  };

  TraitViewControllerSet.prototype.addTraitController = function <T extends Trait, V extends View, C extends Controller>(this: TraitViewControllerSet<unknown, T, V, C>, trait: T, targetTrait?: Trait | null, key?: string): C {
    const traitControllers = this.traitControllers as {[traitId: number]: C | undefined};
    let controller = traitControllers[trait.uid];
    if (controller === void 0) {
      controller = this.createController(trait);
      const traitViewRef = this.getTraitViewRef(controller);
      traitViewRef.setTrait(trait, targetTrait, key);
      const targetController = targetTrait !== void 0 && targetTrait !== null ? traitControllers[targetTrait.uid] : void 0;
      this.addController(controller, targetController, key);
      if (traitViewRef.view === null) {
        const view = traitViewRef.createView();
        const targetView = targetController !== void 0 ? this.getTraitViewRef(targetController).view : null;
        traitViewRef.insertView(this.parentView, view, targetView, key);
      }
    }
    return controller;
  };

  TraitViewControllerSet.prototype.removeTraitController = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, trait: T): C | null {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const traitViewRef = this.getTraitViewRef(controller);
      if (traitViewRef.trait === trait) {
        this.removeController(controller);
        return controller;
      }
    }
    return null;
  };

  TraitViewControllerSet.prototype.deleteTraitController = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, trait: T): C | null {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const traitViewRef = this.getTraitViewRef(controller);
      if (traitViewRef.trait === trait) {
        this.deleteController(controller);
        return controller;
      }
    }
    return null;
  };

  TraitViewControllerSet.prototype.attachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T, targetTrait?: Trait | null): C {
    const traitControllers = this.traitControllers as {[traitId: number]: C | undefined};
    let traitController = traitControllers[trait.uid];
    if (traitController === void 0) {
      traitController = controller;
      if (targetTrait === void 0) {
        targetTrait = null;
      }
      this.willAttachControllerTrait(traitController, trait, targetTrait);
      traitControllers[trait.uid] = traitController;
      (this as Mutable<typeof this>).controllerCount += 1;
      this.onAttachControllerTrait(traitController, trait, targetTrait);
      this.initControllerTrait(traitController, trait);
      this.didAttachControllerTrait(traitController, trait, targetTrait);
    }
    return traitController;
  };

  TraitViewControllerSet.prototype.detachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T): C | null {
    const traitControllers = this.traitControllers as {[comtroltraitIdltraitIderId: number]: C | undefined};
    const traitController = traitControllers[trait.uid];
    if (traitController !== void 0) {
      this.willDetachControllerTrait(traitController, trait);
      (this as Mutable<typeof this>).controllerCount -= 1;
      delete traitControllers[trait.uid];
      this.onDetachControllerTrait(traitController, trait);
      this.deinitControllerTrait(traitController, trait);
      this.didDetachControllerTrait(traitController, trait);
      return traitController;
    }
    return null;
  };

  TraitViewControllerSet.prototype.initControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T): void {
    // hook
  };

  TraitViewControllerSet.prototype.willAttachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitViewControllerSet.prototype.onAttachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitViewControllerSet.prototype.didAttachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitViewControllerSet.prototype.deinitControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T): void {
    // hook
  };

  TraitViewControllerSet.prototype.willDetachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T): void {
    // hook
  };

  TraitViewControllerSet.prototype.onDetachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T): void {
    // hook
  };

  TraitViewControllerSet.prototype.didDetachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T): void {
    // hook
  };

  TraitViewControllerSet.prototype.onAttachController = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, targetController: Controller | null): void {
    const trait = this.getTraitViewRef(controller).trait;
    if (trait !== null) {
      const targetTrait = targetController !== null && this.hasController(targetController) ? this.getTraitViewRef(targetController as C).trait : null;
      this.attachControllerTrait(controller, trait, targetTrait);
    }
    ControllerSet.prototype.onAttachController.call(this, controller, targetController);
  };

  TraitViewControllerSet.prototype.onDetachController = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C): void {
    ControllerSet.prototype.onDetachController.call(this, controller);
    const trait = this.getTraitViewRef(controller).trait;
    if (trait !== null) {
      this.detachControllerTrait(controller, trait);
    }
  };

  Object.defineProperty(TraitViewControllerSet.prototype, "parentView", {
    get: function (this: TraitViewControllerSet): View | null {
      return null;
    },
    configurable: true,
  });

  TraitViewControllerSet.construct = function <F extends TraitViewControllerSet<any, any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).traitControllers = {};
    return fastener;
  };

  TraitViewControllerSet.define = function <O, T extends Trait, V extends View, C extends Controller>(className: string, descriptor: TraitViewControllerSetDescriptor<O, T, V, C>): TraitViewControllerSetFactory<TraitViewControllerSet<any, T, V, C>> {
    let superClass = descriptor.extends as TraitViewControllerSetFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const sorted = descriptor.sorted;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.sorted;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: TraitViewControllerSet<any, any, any, any>}, fastener: TraitViewControllerSet<O, T, V, C> | null, owner: O): TraitViewControllerSet<O, T, V, C> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (sorted !== void 0) {
        fastener.initSorted(sorted);
      }
      return fastener;
    };

    return fastenerClass;
  };

  return TraitViewControllerSet;
})(ControllerSet);
