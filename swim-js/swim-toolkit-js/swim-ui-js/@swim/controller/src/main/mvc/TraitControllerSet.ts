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
import type {Trait, TraitRef} from "@swim/model";
import type {Controller} from "../controller/Controller";
import {ControllerSetInit, ControllerSetClass, ControllerSet} from "../controller/ControllerSet";

/** @internal */
export type TraitControllerSetType<F extends TraitControllerSet<any, any, any>> =
  F extends TraitControllerSet<any, any, infer C> ? C : never;

/** @public */
export interface TraitControllerSetInit<T extends Trait = Trait, C extends Controller = Controller> extends ControllerSetInit<C> {
  extends?: {prototype: TraitControllerSet<any, any, any>} | string | boolean | null;
  getTraitRef?(controller: C): TraitRef<any, T>;
  willAttachControllerTrait?(controller: C, trait: T, targetTrait: Trait | null): void;
  didAttachControllerTrait?(controller: C, trait: T, targetTrait: Trait | null): void;
  willDetachControllerTrait?(controller: C, trait: T): void;
  didDetachControllerTrait?(controller: C, trait: T): void;
  createController?(trait?: T): C;
}

/** @public */
export type TraitControllerSetDescriptor<O = unknown, T extends Trait = Trait, C extends Controller = Controller, I = {}> = ThisType<TraitControllerSet<O, T, C> & I> & TraitControllerSetInit<T, C> & Partial<I>;

/** @public */
export interface TraitControllerSetClass<F extends TraitControllerSet<any, any, any> = TraitControllerSet<any, any, any>> extends ControllerSetClass<F> {
}

/** @public */
export interface TraitControllerSetFactory<F extends TraitControllerSet<any, any, any> = TraitControllerSet<any, any, any>> extends TraitControllerSetClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitControllerSetFactory<F> & I;

  define<O, T extends Trait = Trait, C extends Controller = Controller>(className: string, descriptor: TraitControllerSetDescriptor<O, T, C>): TraitControllerSetFactory<TraitControllerSet<any, T, C>>;
  define<O, T extends Trait = Trait, C extends Controller = Controller>(className: string, descriptor: {observes: boolean} & TraitControllerSetDescriptor<O, T, C, ObserverType<C>>): TraitControllerSetFactory<TraitControllerSet<any, T, C>>;
  define<O, T extends Trait = Trait, C extends Controller = Controller, I = {}>(className: string, descriptor: TraitControllerSetDescriptor<O, T, C, I>): TraitControllerSetFactory<TraitControllerSet<any, T, C> & I>;
  define<O, T extends Trait = Trait, C extends Controller = Controller, I = {}>(className: string, descriptor: {observes: boolean} & TraitControllerSetDescriptor<O, T, C, I & ObserverType<C>>): TraitControllerSetFactory<TraitControllerSet<any, T, C> & I>;

  <O, T extends Trait = Trait, C extends Controller = Controller>(descriptor: TraitControllerSetDescriptor<O, T, C>): PropertyDecorator;
  <O, T extends Trait = Trait, C extends Controller = Controller>(descriptor: {observes: boolean} & TraitControllerSetDescriptor<O, T, C, ObserverType<C>>): PropertyDecorator;
  <O, T extends Trait = Trait, C extends Controller = Controller, I = {}>(descriptor: TraitControllerSetDescriptor<O, T, C, I>): PropertyDecorator;
  <O, T extends Trait = Trait, C extends Controller = Controller, I = {}>(descriptor: {observes: boolean} & TraitControllerSetDescriptor<O, T, C, I & ObserverType<C>>): PropertyDecorator;
}

/** @public */
export interface TraitControllerSet<O = unknown, T extends Trait = Trait, C extends Controller = Controller> extends ControllerSet<O, C> {
  /** @internal */
  readonly traitControllers: {readonly [traitId: number]: C | undefined};

  /** @internal */
  getTraitRef(controller: C): TraitRef<unknown, T>;

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
}

/** @public */
export const TraitControllerSet = (function (_super: typeof ControllerSet) {
  const TraitControllerSet: TraitControllerSetFactory = _super.extend("TraitControllerSet");

  TraitControllerSet.prototype.getTraitRef = function <T extends Trait, C extends Controller>(controller: C): TraitRef<unknown, T> {
    throw new Error("missing implementation");
  };

  TraitControllerSet.prototype.hasTraitController = function (this: TraitControllerSet, trait: Trait): boolean {
    return this.traitControllers[trait.uid] !== void 0;
  };

  TraitControllerSet.prototype.addTraitController = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, trait: T, targetTrait?: Trait | null, key?: string): C {
    const traitControllers = this.traitControllers as {[traitId: number]: C | undefined};
    let controller = traitControllers[trait.uid];
    if (controller === void 0) {
      controller = this.createController(trait);
      const traitRef = this.getTraitRef(controller);
      traitRef.setTrait(trait, targetTrait, key);
      const targetController = targetTrait !== void 0 && targetTrait !== null ? traitControllers[targetTrait.uid] : void 0;
      this.addController(controller, targetController, key);
    }
    return controller;
  };

  TraitControllerSet.prototype.removeTraitController = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, trait: T): C | null {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const traitRef = this.getTraitRef(controller);
      if (traitRef.trait === trait) {
        this.removeController(controller);
        return controller;
      }
    }
    return null;
  };

  TraitControllerSet.prototype.deleteTraitController = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, trait: T): C | null {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const traitRef = this.getTraitRef(controller);
      if (traitRef.trait === trait) {
        this.deleteController(controller);
        return controller;
      }
    }
    return null;
  };

  TraitControllerSet.prototype.attachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T, targetTrait?: Trait | null): C {
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

  TraitControllerSet.prototype.detachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T): C | null {
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

  TraitControllerSet.prototype.initControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T): void {
    // hook
  };

  TraitControllerSet.prototype.willAttachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitControllerSet.prototype.onAttachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitControllerSet.prototype.didAttachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitControllerSet.prototype.deinitControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T): void {
    // hook
  };

  TraitControllerSet.prototype.willDetachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T): void {
    // hook
  };

  TraitControllerSet.prototype.onDetachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T): void {
    // hook
  };

  TraitControllerSet.prototype.didDetachControllerTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, trait: T): void {
    // hook
  };

  TraitControllerSet.prototype.onAttachController = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C, targetController: Controller | null): void {
    const trait = this.getTraitRef(controller).trait;
    if (trait !== null) {
      const targetTrait = targetController !== null && this.hasController(targetController) ? this.getTraitRef(targetController as C).trait : null;
      this.attachControllerTrait(controller, trait, targetTrait);
    }
    ControllerSet.prototype.onAttachController.call(this, controller, targetController);
  };

  TraitControllerSet.prototype.onDetachController = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, controller: C): void {
    ControllerSet.prototype.onDetachController.call(this, controller);
    const trait = this.getTraitRef(controller).trait;
    if (trait !== null) {
      this.detachControllerTrait(controller, trait);
    }
  };

  TraitControllerSet.construct = function <F extends TraitControllerSet<any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).traitControllers = {};
    return fastener;
  };

  TraitControllerSet.define = function <O, T extends Trait, C extends Controller>(className: string, descriptor: TraitControllerSetDescriptor<O, T, C>): TraitControllerSetFactory<TraitControllerSet<any, T, C>> {
    let superClass = descriptor.extends as TraitControllerSetFactory | null | undefined;
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

    fastenerClass.construct = function (fastenerClass: {prototype: TraitControllerSet<any, any, any>}, fastener: TraitControllerSet<O, T, C> | null, owner: O): TraitControllerSet<O, T, C> {
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

  return TraitControllerSet;
})(ControllerSet);
