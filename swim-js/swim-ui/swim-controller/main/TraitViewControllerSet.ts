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
import type {Consumer} from "@swim/util";
import type {Fastener} from "@swim/component";
import type {TraitFactory} from "@swim/model";
import {Trait} from "@swim/model";
import type {ViewFactory} from "@swim/view";
import type {View} from "@swim/view";
import type {Controller} from "./Controller";
import type {ControllerSetDescriptor} from "./ControllerSet";
import type {ControllerSetClass} from "./ControllerSet";
import {ControllerSet} from "./ControllerSet";
import type {TraitViewRef} from "./TraitViewRef";

/** @public */
export interface TraitViewControllerSetDescriptor<R, T extends Trait, V extends View, C extends Controller> extends ControllerSetDescriptor<R, C> {
  extends?: Proto<TraitViewControllerSet<any, any, any, any, any>> | boolean | null;
}

/** @public */
export interface TraitViewControllerSetClass<F extends TraitViewControllerSet<any, any, any, any, any> = TraitViewControllerSet<any, any, any, any, any>> extends ControllerSetClass<F> {
}

/** @public */
export interface TraitViewControllerSet<R = any, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I extends any[] = [C | null]> extends ControllerSet<R, C, I> {
  /** @override */
  get descriptorType(): Proto<TraitViewControllerSetDescriptor<R, T, V, C>>;

  getTraitViewRef(controller: C): TraitViewRef<any, T, V>;

  get traitType(): TraitFactory<T> | null;

  /** @internal */
  readonly traitControllers: {readonly [traitId: string]: C | undefined};

  hasTrait(trait: Trait): boolean;

  addTrait(trait: T | LikeType<T>, targetTrait?: Trait | null, key?: string): C;

  addTraits(traits: {readonly [traitId: string]: T | undefined}, targetTrait?: Trait | null): void;

  setTraits(traits: {readonly [traitId: string]: T | undefined}, targetTrait?: Trait | null): void;

  attachTrait(trait: T | LikeType<T>, targetTrait?: Trait | null, controller?: C): C;

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

  insertTrait(parent: Controller | null | undefined, trait: T | LikeType<T>, targetTrait?: Trait | null, key?: string): C;

  insertTraits(parent: Controller | null | undefined, traits: {readonly [traitId: string]: T | undefined}, targetTrait?: Trait | null, key?: string): void;

  removeTrait(trait: T): C | null;

  removeTraits(traits: {readonly [traitId: string]: T | undefined}): void;

  deleteTrait(trait: T): C | null;

  deleteTraits(traits: {readonly [traitId: string]: T | undefined}): void;

  reinsertTrait(trait: T, targetTrait?: T | null): void;

  consumeTraits(consumer: Consumer): void;

  unconsumeTraits(consumer: Consumer): void;

  createTrait(): T;

  /** @protected */
  fromTraitLike(value: T | LikeType<T>): T;

  get viewType(): ViewFactory<V> | null;

  get parentView(): View | null;

  getTargetView(controller: C): V | null;

  /** @protected @override */
  onAttachController(controller: C, targetController: Controller | null): void;

  /** @protected @override */
  onDetachController(controller: C): void;

  /** @override */
  createController(trait?: T): C;
}

/** @public */
export const TraitViewControllerSet = (<R, T extends Trait, V extends View, C extends Controller, I extends any[], F extends TraitViewControllerSet<any, any, any, any, any>>() => ControllerSet.extend<TraitViewControllerSet<R, T, V, C, I>, TraitViewControllerSetClass<F>>("TraitViewControllerSet", {
  getTraitViewRef(controller: C): TraitViewRef<any, T, V> {
    throw new Error("missing implementation");
  },

  traitType: null,

  hasTrait(trait: Trait): boolean {
    return this.traitControllers[trait.uid] !== void 0;
  },

  addTrait(trait: T | LikeType<T>, targetTrait?: Trait | null, key?: string): C {
    trait = this.fromTraitLike(trait);
    const traitControllers = this.traitControllers as {[traitId: string]: C | undefined};
    let controller = traitControllers[trait.uid];
    if (controller !== void 0) {
      return controller;
    } else if (targetTrait === void 0) {
      targetTrait = null;
    }
    controller = this.createController(trait);
    const traitViewRef = this.getTraitViewRef(controller);
    traitViewRef.setTrait(trait, targetTrait, key);
    const targetController = targetTrait !== null ? traitControllers[targetTrait.uid] : void 0;
    this.addController(controller, targetController, key);
    if (traitViewRef.view === null) {
      const view = traitViewRef.createView();
      const targetView = targetController !== void 0 ? this.getTraitViewRef(targetController).view : null;
      traitViewRef.insertView(this.parentView, view, targetView, key);
    }
    return controller;
  },

  addTraits(newTraits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void {
    for (const traitId in newTraits) {
      this.addTrait(newTraits[traitId]!, target);
    }
  },

  setTraits(newTraits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void {
    const binds = this.binds;
    const parent = binds ? this.parentController : null;
    const traitControllers = this.traitControllers;
    for (const traitId in traitControllers) {
      if (newTraits[traitId] === void 0) {
        const oldController = this.detachController(traitControllers[traitId]!);
        if (oldController !== null && binds && parent !== null && oldController.parent === parent) {
          oldController.remove();
        }
      }
    }
    if ((this.flags & ControllerSet.OrderedFlag) !== 0) {
      const orderedTraits = new Array<T>();
      for (const traitId in newTraits) {
        orderedTraits.push(newTraits[traitId]!);
      }
      for (let i = 0, n = orderedTraits.length; i < n; i += 1) {
        const newController = orderedTraits[i]!;
        if (traitControllers[newController.uid] === void 0) {
          const targetTrait = i < n + 1 ? orderedTraits[i + 1] : target;
          this.addTrait(newController, targetTrait);
        }
      }
    } else {
      for (const traitId in newTraits) {
        if (traitControllers[traitId] === void 0) {
          this.addTrait(newTraits[traitId]!, target);
        }
      }
    }
  },

  attachTrait(trait: T | LikeType<T>, targetTrait?: Trait | null, controller?: C): C {
    trait = this.fromTraitLike(trait);
    const traitControllers = this.traitControllers as {[traitId: string]: C | undefined};
    if (controller === void 0) {
      controller = traitControllers[trait.uid];
    }
    if (targetTrait === void 0) {
      targetTrait = null;
    }
    if (controller === void 0) {
      controller = this.createController();
      const traitViewRef = this.getTraitViewRef(controller);
      traitViewRef.setTrait(trait, targetTrait);
      const targetController = targetTrait !== null ? traitControllers[targetTrait.uid] : void 0;
      this.attachController(controller, targetController);
    }
    if (traitControllers[trait.uid] === void 0) {
      traitControllers[trait.uid] = controller;
      this.willAttachTrait(trait, targetTrait, controller);
      this.onAttachTrait(trait, targetTrait, controller);
      this.initTrait(trait, controller);
      this.didAttachTrait(trait, targetTrait, controller);
    }
    return controller;
  },

  initTrait(trait: T, controller: C): void {
    // hook
  },

  willAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void {
    // hook
  },

  onAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void {
    // hook
  },

  didAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void {
    // hook
  },

  attachTraits(newTraits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void {
    for (const traitId in newTraits) {
      this.attachTrait(newTraits[traitId]!, target);
    }
  },

  detachTrait(trait: T): C | null {
    const traitControllers = this.traitControllers as {[traitId: string]: C | undefined};
    const controller = traitControllers[trait.uid];
    if (controller === void 0) {
      return null;
    }
    delete traitControllers[trait.uid];
    this.willDetachTrait(trait, controller);
    this.onDetachTrait(trait, controller);
    this.deinitTrait(trait, controller);
    this.didDetachTrait(trait, controller);
    return controller;
  },

  deinitTrait(trait: T, controller: C): void {
    // hook
  },

  willDetachTrait(trait: T, controller: C): void {
    // hook
  },

  onDetachTrait(trait: T, controller: C): void {
    // hook
  },

  didDetachTrait(trait: T, controller: C): void {
    // hook
  },

  detachTraits(traits: {readonly [traitId: string]: T | undefined}): void {
    for (const traitId in traits) {
      this.detachTrait(traits[traitId]!);
    }
  },

  insertTrait(parent: Controller | null | undefined, trait: T | LikeType<T>, targetTrait?: Trait | null, key?: string): C {
    trait = this.fromTraitLike(trait);
    const traitControllers = this.traitControllers as {[traitId: string]: C | undefined};
    let controller = traitControllers[trait.uid];
    if (controller !== void 0) {
      return controller;
    } else if (targetTrait === void 0) {
      targetTrait = null;
    }
    controller = this.createController();
    const traitViewRef = this.getTraitViewRef(controller);
    traitViewRef.setTrait(trait, targetTrait);
    const targetController = targetTrait !== null ? traitControllers[targetTrait.uid] : void 0;
    this.insertController(parent, controller, targetController, key);
    if (traitViewRef.view === null) {
      const view = traitViewRef.createView();
      const targetView = targetController !== void 0 ? this.getTraitViewRef(targetController).view : null;
      traitViewRef.insertView(this.parentView, view, targetView, key);
    }
    return controller;
  },

  insertTraits(parent: Controller | null | undefined, newTraits: {readonly [traitId: string]: T | undefined}, targetTrait?: Trait | null, key?: string): void {
    for (const traitId in newTraits) {
      this.insertTrait(parent, newTraits[traitId]!, targetTrait, key);
    }
  },

  removeTrait(trait: T): C | null {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const traitViewRef = this.getTraitViewRef(controller);
      if (traitViewRef.trait !== trait) {
        continue;
      }
      this.removeController(controller);
      return controller;
    }
    return null;
  },

  removeTraits(traits: {readonly [traitId: string]: T | undefined}): void {
    for (const traitId in traits) {
      this.removeTrait(traits[traitId]!);
    }
  },

  deleteTrait(trait: T): C | null {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const traitViewRef = this.getTraitViewRef(controller);
      if (traitViewRef.trait !== trait) {
        continue;
      }
      this.deleteController(controller);
      return controller;
    }
    return null;
  },

  deleteTraits(traits: {readonly [traitId: string]: T | undefined}): void {
    for (const traitId in traits) {
      this.deleteTrait(traits[traitId]!);
    }
  },

  reinsertTrait(trait: T, targetTrait: T | null): void {
    const controller = this.traitControllers[trait.uid];
    if (controller === void 0) {
      return;
    }
    const targetController = targetTrait !== null ? this.traitControllers[targetTrait.uid] : void 0;
    this.reinsertController(controller, targetController !== void 0 ? targetController : null);
  },

  consumeTraits(consumer: Consumer): void {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const trait = this.getTraitViewRef(controller).trait;
      if (trait !== null) {
        trait.consume(consumer);
      }
    }
  },

  unconsumeTraits(consumer: Consumer): void {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const trait = this.getTraitViewRef(controller).trait;
      if (trait !== null) {
        trait.unconsume(consumer);
      }
    }
  },

  createTrait(): T {
    let trait: T | undefined;
    const traitType = this.traitType;
    if (traitType !== null) {
      trait = traitType.create();
    }
    if (trait === void 0 || trait === null) {
      let message = "unable to create ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "trait";
      throw new Error(message);
    }
    return trait;
  },

  fromTraitLike(value: T | LikeType<T>): T {
    const traitType = this.traitType;
    if (traitType !== null) {
      return traitType.fromLike(value);
    }
    return Trait.fromLike(value) as T;
  },

  get parentView(): View | null {
    return null;
  },

  getTargetView(controller: C): V | null {
    if ((this.flags & ControllerSet.SortedFlag) === 0) {
      return null;
    }
    const nextController = controller.nextSibling;
    if (nextController === null || this.controllers[nextController.uid] === void 0) {
      return null;
    }
    return this.getTraitViewRef(nextController as C).view;
  },

  onAttachController(controller: C, targetController: Controller | null): void {
    const trait = this.getTraitViewRef(controller).trait;
    if (trait !== null) {
      const targetTrait = targetController !== null && this.hasController(targetController) ? this.getTraitViewRef(targetController as C).trait : null;
      this.attachTrait(trait, targetTrait, controller);
    }
    super.onAttachController(controller, targetController);
  },

  onDetachController(controller: C): void {
    super.onDetachController(controller);
    const trait = this.getTraitViewRef(controller).trait;
    if (trait !== null) {
      this.detachTrait(trait);
    }
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).traitControllers = {};
    return fastener;
  },
}))();
