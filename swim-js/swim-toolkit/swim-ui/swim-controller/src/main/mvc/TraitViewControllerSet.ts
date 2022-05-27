// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Proto, Consumer} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import type {TraitFactory, Trait} from "@swim/model";
import type {ViewFactory, View} from "@swim/view";
import type {ControllerFactory, Controller} from "../controller/Controller";
import {ControllerSetDescriptor, ControllerSetClass, ControllerSet} from "../controller/ControllerSet";
import type {TraitViewRef} from "./TraitViewRef";

/** @public */
export type TraitViewControllerSetTrait<F extends TraitViewControllerSet<any, any, any, any>> =
  F extends {traitType?: TraitFactory<infer T>} ? T : never;

/** @public */
export type TraitViewControllerSetView<F extends TraitViewControllerSet<any, any, any, any>> =
  F extends {viewType?: ViewFactory<infer V>} ? V : never;

/** @public */
export type TraitViewControllerSetController<F extends TraitViewControllerSet<any, any, any, any>> =
  F extends {controllerType?: ControllerFactory<infer C>} ? C : never;

/** @public */
export interface TraitViewControllerSetDescriptor<T extends Trait = Trait, V extends View = View, C extends Controller = Controller> extends ControllerSetDescriptor<C> {
  extends?: Proto<TraitViewControllerSet<any, any, any, any>> | string | boolean | null;
  traitType?: TraitFactory<T>;
  viewType?: ViewFactory<V>;
}

/** @public */
export type TraitViewControllerSetTemplate<F extends TraitViewControllerSet<any, any, any, any>> =
  ThisType<F> &
  TraitViewControllerSetDescriptor<TraitViewControllerSetTrait<F>, TraitViewControllerSetView<F>, TraitViewControllerSetController<F>> &
  Partial<Omit<F, keyof TraitViewControllerSetDescriptor>>;

/** @public */
export interface TraitViewControllerSetClass<F extends TraitViewControllerSet<any, any, any, any> = TraitViewControllerSet<any, any, any, any>> extends ControllerSetClass<F> {
  /** @override */
  specialize(template: TraitViewControllerSetDescriptor<any>): TraitViewControllerSetClass<F>;

  /** @override */
  refine(fastenerClass: TraitViewControllerSetClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: TraitViewControllerSetTemplate<F2>): TraitViewControllerSetClass<F2>;
  extend<F2 extends F>(className: string, template: TraitViewControllerSetTemplate<F2>): TraitViewControllerSetClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: TraitViewControllerSetTemplate<F2>): TraitViewControllerSetClass<F2>;
  define<F2 extends F>(className: string, template: TraitViewControllerSetTemplate<F2>): TraitViewControllerSetClass<F2>;

  /** @override */
  <F2 extends F>(template: TraitViewControllerSetTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface TraitViewControllerSet<O = unknown, T extends Trait = Trait, V extends View = View, C extends Controller = Controller> extends ControllerSet<O, C> {
  /** @internal */
  readonly traitControllers: {readonly [traitId: string]: C | undefined};

  /** @internal */
  getTraitViewRef(controller: C): TraitViewRef<unknown, T, V>;

  /** @internal */
  readonly traitType?: TraitFactory<T>; // optional prototype property

  hasTrait(trait: Trait): boolean;

  addTrait(trait: T, targetTrait?: Trait | null, key?: string): C;

  addTraits(traits: {readonly [traitId: string]: T | undefined}, targetTrait?: Trait | null): void;

  attachTrait(trait: T, targetTrait?: Trait | null, controller?: C): C;

  /** @protected */
  initTrait(trait: T, controller: C): void;

  /** @protected */
  willAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void;

  /** @protected */
  onAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void;

  /** @protected */
  didAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void;

  attachTraits(traits: {readonly [traitId: string]: T | undefined}, targetTrait?: Trait | null): void;

  detachTrait(trait: T): C | null;

  /** @protected */
  deinitTrait(trait: T, controller: C): void;

  /** @protected */
  willDetachTrait(trait: T, controller: C): void;

  /** @protected */
  onDetachTrait(trait: T, controller: C): void;

  /** @protected */
  didDetachTrait(trait: T, controller: C): void;

  detachTraits(traits: {readonly [traitId: string]: T | undefined}): void;

  removeTrait(trait: T): C | null;

  removeTraits(traits: {readonly [traitId: string]: T | undefined}): void;

  deleteTrait(trait: T): C | null;

  deleteTraits(traits: {readonly [traitId: string]: T | undefined}): void;

  reinsertTrait(trait: T, targetTrait?: T | null): void;

  consumeTraits(consumer: Consumer): void;

  unconsumeTraits(consumer: Consumer): void;

  createTrait(): T;

  /** @internal */
  readonly viewType?: ViewFactory<V>; // optional prototype property

  getTargetView(controller: C): V | null;

  /** @protected @override */
  onAttachController(controller: C, targetController: Controller | null): void;

  /** @protected @override */
  onDetachController(controller: C): void;

  /** @override */
  createController(trait?: T): C;

  get parentView(): View | null;
}

/** @public */
export const TraitViewControllerSet = (function (_super: typeof ControllerSet) {
  const TraitViewControllerSet = _super.extend("TraitViewControllerSet", {}) as TraitViewControllerSetClass;

  TraitViewControllerSet.prototype.getTraitViewRef = function <T extends Trait, V extends View, C extends Controller>(controller: C): TraitViewRef<unknown, T, V> {
    throw new Error("missing implementation");
  };

  TraitViewControllerSet.prototype.hasTrait = function (this: TraitViewControllerSet, trait: Trait): boolean {
    return this.traitControllers[trait.uid] !== void 0;
  };

  TraitViewControllerSet.prototype.addTrait = function <T extends Trait, V extends View, C extends Controller>(this: TraitViewControllerSet<unknown, T, V, C>, trait: T, targetTrait?: Trait | null, key?: string): C {
    const traitControllers = this.traitControllers as {[traitId: string]: C | undefined};
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

  TraitViewControllerSet.prototype.addTraits = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, newTraits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void {
    for (const traitId in newTraits) {
      this.addTrait(newTraits[traitId]!, target);
    }
  };

  TraitViewControllerSet.prototype.attachTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, trait: T, targetTrait?: Trait | null, controller?: C): C {
    const traitControllers = this.traitControllers as {[traitId: string]: C | undefined};
    if (controller === void 0) {
      controller = traitControllers[trait.uid];
    }
    if (controller === void 0) {
      controller = this.createController();
      const traitViewRef = this.getTraitViewRef(controller);
      traitViewRef.setTrait(trait, targetTrait);
      const targetController = targetTrait !== void 0 && targetTrait !== null ? traitControllers[targetTrait.uid] : void 0;
      this.attachController(controller, targetController);
    }
    if (traitControllers[trait.uid] === void 0) {
      if (targetTrait === void 0) {
        targetTrait = null;
      }
      traitControllers[trait.uid] = controller;
      this.willAttachTrait(trait, targetTrait, controller);
      this.onAttachTrait(trait, targetTrait, controller);
      this.initTrait(trait, controller);
      this.didAttachTrait(trait, targetTrait, controller);
    }
    return controller;
  };

  TraitViewControllerSet.prototype.initTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, trait: T, controller: C): void {
    // hook
  };

  TraitViewControllerSet.prototype.willAttachTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitViewControllerSet.prototype.onAttachTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitViewControllerSet.prototype.didAttachTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitViewControllerSet.prototype.attachTraits = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, newTraits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void {
    for (const traitId in newTraits) {
      this.attachTrait(newTraits[traitId]!, target);
    }
  };

  TraitViewControllerSet.prototype.detachTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, trait: T): C | null {
    const traitControllers = this.traitControllers as {[traitId: string]: C | undefined};
    const controller = traitControllers[trait.uid];
    if (controller !== void 0) {
      delete traitControllers[trait.uid];
      this.willDetachTrait(trait, controller);
      this.onDetachTrait(trait, controller);
      this.deinitTrait(trait, controller);
      this.didDetachTrait(trait, controller);
      return controller;
    }
    return null;
  };

  TraitViewControllerSet.prototype.deinitTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, trait: T, controller: C): void {
    // hook
  };

  TraitViewControllerSet.prototype.willDetachTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T): void {
    // hook
  };

  TraitViewControllerSet.prototype.onDetachTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T): void {
    // hook
  };

  TraitViewControllerSet.prototype.didDetachTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, trait: T): void {
    // hook
  };

  TraitViewControllerSet.prototype.detachTraits = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, traits: {readonly [traitId: string]: T | undefined}): void {
    for (const traitId in traits) {
      this.detachTrait(traits[traitId]!);
    }
  };

  TraitViewControllerSet.prototype.removeTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, trait: T): C | null {
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

  TraitViewControllerSet.prototype.removeTraits = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, traits: {readonly [traitId: string]: T | undefined}): void {
    for (const traitId in traits) {
      this.removeTrait(traits[traitId]!);
    }
  };

  TraitViewControllerSet.prototype.deleteTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, trait: T): C | null {
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

  TraitViewControllerSet.prototype.deleteTraits = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, traits: {readonly [traitId: string]: T | undefined}): void {
    for (const traitId in traits) {
      this.deleteTrait(traits[traitId]!);
    }
  };

  TraitViewControllerSet.prototype.reinsertTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, trait: T, targetTrait: T | null): void {
    const controller = this.traitControllers[trait.uid];
    if (controller !== void 0) {
      const targetController = targetTrait !== null ? this.traitControllers[targetTrait.uid] : void 0;
      this.reinsertController(controller, targetController !== void 0 ? targetController : null);
    }
  };

  TraitViewControllerSet.prototype.consumeTraits = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, consumer: Consumer): void {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const trait = this.getTraitViewRef(controller).trait;
      if (trait !== null) {
        trait.consume(consumer);
      }
    }
  };

  TraitViewControllerSet.prototype.unconsumeTraits = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, consumer: Consumer): void {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const trait = this.getTraitViewRef(controller).trait;
      if (trait !== null) {
        trait.unconsume(consumer);
      }
    }
  };

  TraitViewControllerSet.prototype.createTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>): T {
    let trait: T | undefined;
    const traitType = this.traitType;
    if (traitType !== void 0) {
      trait = traitType.create();
    }
    if (trait === void 0 || trait === null) {
      let message = "Unable to create ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "trait";
      throw new Error(message);
    }
    return trait;
  };

  TraitViewControllerSet.prototype.getTargetView = function <V extends View, C extends Controller>(this: TraitViewControllerSet<unknown, Trait, V, C>, controller: C): V | null {
    if ((this.flags & ControllerSet.SortedFlag) !== 0) {
      const nextController = controller.nextSibling;
      if (nextController !== null && this.controllers[nextController.uid] !== void 0) {
        return this.getTraitViewRef(nextController as C).view;
      }
    }
    return null;
  };

  Object.defineProperty(TraitViewControllerSet.prototype, "parentView", {
    value: null,
    configurable: true,
  });

  TraitViewControllerSet.prototype.onAttachController = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C, targetController: Controller | null): void {
    const trait = this.getTraitViewRef(controller).trait;
    if (trait !== null) {
      const targetTrait = targetController !== null && this.hasController(targetController) ? this.getTraitViewRef(targetController as C).trait : null;
      this.attachTrait(trait, targetTrait, controller);
    }
    ControllerSet.prototype.onAttachController.call(this, controller, targetController);
  };

  TraitViewControllerSet.prototype.onDetachController = function <T extends Trait, C extends Controller>(this: TraitViewControllerSet<unknown, T, View, C>, controller: C): void {
    ControllerSet.prototype.onDetachController.call(this, controller);
    const trait = this.getTraitViewRef(controller).trait;
    if (trait !== null) {
      this.detachTrait(trait);
    }
  };

  Object.defineProperty(TraitViewControllerSet.prototype, "parentView", {
    get: function (this: TraitViewControllerSet): View | null {
      return null;
    },
    configurable: true,
  });

  TraitViewControllerSet.construct = function <F extends TraitViewControllerSet<any, any, any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).traitControllers = {};
    return fastener;
  };

  return TraitViewControllerSet;
})(ControllerSet);
