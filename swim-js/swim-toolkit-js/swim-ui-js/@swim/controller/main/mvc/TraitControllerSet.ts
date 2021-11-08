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
import type {Trait, TraitRef} from "@swim/model";
import type {Controller} from "../controller/Controller";
import {ControllerSetInit, ControllerSetClass, ControllerSet} from "../controller/ControllerSet";

export type TraitControllerSetType<F extends TraitControllerSet<any, any, any>> =
  F extends TraitControllerSet<any, any, infer C> ? C : never;

export interface TraitControllerSetInit<T extends Trait = Trait, C extends Controller = Controller> extends ControllerSetInit<C> {
  extends?: {prototype: TraitControllerSet<any, any, any>} | string | boolean | null;
  getTraitRef?(controller: C): TraitRef<any, T>;
  createController?(trait?: T): C;
}

export type TraitControllerSetDescriptor<O = unknown, T extends Trait = Trait, C extends Controller = Controller, I = {}> = ThisType<TraitControllerSet<O, T, C> & I> & TraitControllerSetInit<T, C> & Partial<I>;

export interface TraitControllerSetClass<F extends TraitControllerSet<any, any, any> = TraitControllerSet<any, any, any>> extends ControllerSetClass<F> {
}

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

export interface TraitControllerSet<O = unknown, T extends Trait = Trait, C extends Controller = Controller> extends ControllerSet<O, C> {
  /** @override */
  get familyType(): Class<TraitControllerSet<any, any, any>> | null;

  /** @internal */
  getTraitRef(controller: C): TraitRef<unknown, T>;

  hasTrait(trait: T): boolean;

  addTrait(trait: T, targetTrait?: Trait | null, key?: string): C;

  removeTrait(trait: T): C | null;

  deleteTrait(trait: T): C | null;

  createController(trait?: T): C;
}

export const TraitControllerSet = (function (_super: typeof ControllerSet) {
  const TraitControllerSet: TraitControllerSetFactory = _super.extend("TraitControllerSet");

  Object.defineProperty(TraitControllerSet.prototype, "familyType", {
    get: function (this: TraitControllerSet<unknown, any, any>): Class<TraitControllerSet<any, any, any>> | null {
      return TraitControllerSet;
    },
    configurable: true,
  });

  TraitControllerSet.prototype.getTraitRef = function <T extends Trait, C extends Controller>(controller: C): TraitRef<unknown, T> {
    throw new Error("missing implementation");
  };

  TraitControllerSet.prototype.hasTrait = function <T extends Trait>(this: TraitControllerSet<unknown, T, Controller>, trait: T): boolean {
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const traitRef = this.getTraitRef(controller);
      if (traitRef.trait === trait) {
        return true;
      }
    }
    return false;
  };

  TraitControllerSet.prototype.addTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, trait: T, targetTrait?: Trait | null, key?: string): C {
    let targetController: C | null = null;
    const controllers = this.controllers;
    for (const controllerId in controllers) {
      const controller = controllers[controllerId]!;
      const controllerTrait = this.getTraitRef(controller).trait;
      if (controllerTrait === trait) {
        return controller;
      } else if (controllerTrait === targetTrait) {
        targetController = controller;
      }
    }
    const controller = this.createController(trait);
    const traitRef = this.getTraitRef(controller);
    traitRef.setTrait(trait, targetTrait, key);
    this.addController(controller, targetController, key);
    return controller;
  };

  TraitControllerSet.prototype.removeTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, trait: T): C | null {
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

  TraitControllerSet.prototype.deleteTrait = function <T extends Trait, C extends Controller>(this: TraitControllerSet<unknown, T, C>, trait: T): C | null {
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

  TraitControllerSet.construct = function <F extends TraitControllerSet<any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  TraitControllerSet.define = function <O, T extends Trait, C extends Controller>(className: string, descriptor: TraitControllerSetDescriptor<O, T, C>): TraitControllerSetFactory<TraitControllerSet<any, T, C>> {
    let superClass = descriptor.extends as TraitControllerSetFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

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
      return fastener;
    };

    return fastenerClass;
  };

  return TraitControllerSet;
})(ControllerSet);
