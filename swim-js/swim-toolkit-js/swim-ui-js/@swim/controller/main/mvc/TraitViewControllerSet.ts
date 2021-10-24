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

import type {Class, ObserverType} from "@swim/util";
import type {FastenerOwner} from "@swim/fastener";
import type {Trait} from "@swim/model";
import type {View} from "@swim/view";
import type {Controller} from "../controller/Controller";
import {ControllerSetInit, ControllerSetClass, ControllerSet} from "../controller/ControllerSet";
import type {TraitViewRef} from "./TraitViewRef";

export type TraitViewControllerSetType<F extends TraitViewControllerSet<any, any, any, any>> =
  F extends TraitViewControllerSet<any, any, any, infer C> ? C : never;

export interface TraitViewControllerSetInit<T extends Trait = Trait, V extends View = View, C extends Controller = Controller> extends ControllerSetInit<C> {
  extends?: {prototype: TraitViewControllerSet<any, any, any, any>} | string | boolean | null;
  getTraitViewRef?(controller: C): TraitViewRef<any, T, V>;
  createController?(trait?: T): C | null;
  parentView?: View | null;
}

export type TraitViewControllerSetDescriptor<O = unknown, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}> = ThisType<TraitViewControllerSet<O, T, V, C> & I> & TraitViewControllerSetInit<T, V, C> & Partial<I>;

export interface TraitViewControllerSetClass<F extends TraitViewControllerSet<any, any, any, any> = TraitViewControllerSet<any, any, any, any>> extends ControllerSetClass<F> {
}

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

export interface TraitViewControllerSet<O = unknown, T extends Trait = Trait, V extends View = View, C extends Controller = Controller> extends ControllerSet<O, C> {
  /** @override */
  get familyType(): Class<TraitViewControllerSet<any, any, any, any>> | null;

  /** @internal */
  getTraitViewRef(controller: C): TraitViewRef<unknown, T, V>;

  hasTrait(trait: T): boolean;

  addTrait(trait: T, targetTrait?: Trait | null, key?: string): C | null;

  removeTrait(trait: T): C | null;

  deleteTrait(trait: T): C | null;

  createController(trait?: T): C | null;

  /** @internal @protected */
  get parentView(): View | null; // optional prototype property
}

export const TraitViewControllerSet = (function (_super: typeof ControllerSet) {
  const TraitViewControllerSet: TraitViewControllerSetFactory = _super.extend("TraitViewControllerSet");

  Object.defineProperty(TraitViewControllerSet.prototype, "familyType", {
    get: function (this: TraitViewControllerSet<unknown, any, any>): Class<TraitViewControllerSet<any, any, any, any>> | null {
      return TraitViewControllerSet;
    },
    configurable: true,
  });

  TraitViewControllerSet.prototype.getTraitViewRef = function <T extends Trait, V extends View, C extends Controller>(controller: C): TraitViewRef<unknown, T, V> {
    throw new Error("missing implementation");
  };

  TraitViewControllerSet.prototype.hasTrait = function <T extends Trait>(this: TraitViewControllerSet<unknown, T, View, Controller>, trait: T): boolean {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const traitViewRef = this.getTraitViewRef(controller);
      if (traitViewRef.trait === trait) {
        return true;
      }
    }
    return false;
  };

  TraitViewControllerSet.prototype.addTrait = function <T extends Trait, V extends View, C extends Controller>(this: TraitViewControllerSet<unknown, T, V, C>, trait: T, targetTrait?: Trait | null, key?: string): C | null {
    let targetController: C | null = null;
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const controllerTrait = this.getTraitViewRef(controller).trait;
      if (controllerTrait === trait) {
        return controller;
      } else if (controllerTrait === targetTrait) {
        targetController = controller;
      }
    }
    const controller = this.createController(trait);
    if (controller !== null) {
      const traitViewRef = this.getTraitViewRef(controller);
      traitViewRef.setTrait(trait, targetTrait, key);
      this.addController(controller, targetController, key);
      if (traitViewRef.view === null) {
        const view = traitViewRef.createView();
        let targetView: View | null = null;
        if (targetController !== null) {
          targetView = this.getTraitViewRef(targetController).view;
        }
        traitViewRef.insertView(this.parentView, view, targetView, key);
      }
    }
    return controller;
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

  Object.defineProperty(TraitViewControllerSet.prototype, "parentView", {
    get: function (this: TraitViewControllerSet): View | null {
      return null;
    },
    configurable: true,
  });

  TraitViewControllerSet.construct = function <F extends TraitViewControllerSet<any, any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  TraitViewControllerSet.define = function <O, T extends Trait, V extends View, C extends Controller>(className: string, descriptor: TraitViewControllerSetDescriptor<O, T, V, C>): TraitViewControllerSetFactory<TraitViewControllerSet<any, T, V, C>> {
    let superClass = descriptor.extends as TraitViewControllerSetFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

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
      return fastener;
    };

    return fastenerClass;
  };

  return TraitViewControllerSet;
})(ControllerSet);
