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
import type {FastenerOwner} from "@swim/component";
import type {Trait, TraitRef} from "@swim/model";
import type {Controller} from "../controller/Controller";
import {ControllerRefInit, ControllerRefClass, ControllerRef} from "../controller/ControllerRef";

/** @internal */
export type TraitControllerRefType<F extends TraitControllerRef<any, any, any>> =
  F extends TraitControllerRef<any, any, infer C> ? C : never;

/** @public */
export interface TraitControllerRefInit<T extends Trait, C extends Controller = Controller> extends ControllerRefInit<C> {
  extends?: {prototype: TraitControllerRef<any, any, any>} | string | boolean | null;
  getTraitRef?(controller: C): TraitRef<any, T>;
  createController?(trait?: T): C;
}

/** @public */
export type TraitControllerRefDescriptor<O = unknown, T extends Trait = Trait, C extends Controller = Controller, I = {}> = ThisType<TraitControllerRef<O, T, C> & I> & TraitControllerRefInit<T, C> & Partial<I>;

/** @public */
export interface TraitControllerRefClass<F extends TraitControllerRef<any, any, any> = TraitControllerRef<any, any, any>> extends ControllerRefClass<F> {
}

/** @public */
export interface TraitControllerRefFactory<F extends TraitControllerRef<any, any, any> = TraitControllerRef<any, any, any>> extends TraitControllerRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitControllerRefFactory<F> & I;

  define<O, T extends Trait = Trait, C extends Controller = Controller>(className: string, descriptor: TraitControllerRefDescriptor<O, T, C>): TraitControllerRefFactory<TraitControllerRef<any, T, C>>;
  define<O, T extends Trait = Trait, C extends Controller = Controller>(className: string, descriptor: {observes: boolean} & TraitControllerRefDescriptor<O, T, C, ObserverType<C>>): TraitControllerRefFactory<TraitControllerRef<any, T, C>>;
  define<O, T extends Trait = Trait, C extends Controller = Controller, I = {}>(className: string, descriptor: TraitControllerRefDescriptor<O, T, C, I>): TraitControllerRefFactory<TraitControllerRef<any, T, C> & I>;
  define<O, T extends Trait = Trait, C extends Controller = Controller, I = {}>(className: string, descriptor: {observes: boolean} & TraitControllerRefDescriptor<O, T, C, I & ObserverType<C>>): TraitControllerRefFactory<TraitControllerRef<any, T, C> & I>;

  <O, T extends Trait = Trait, C extends Controller = Controller>(descriptor: TraitControllerRefDescriptor<O, T, C>): PropertyDecorator;
  <O, T extends Trait = Trait, C extends Controller = Controller>(descriptor: {observes: boolean} & TraitControllerRefDescriptor<O, T, C, ObserverType<C>>): PropertyDecorator;
  <O, T extends Trait = Trait, C extends Controller = Controller, I = {}>(descriptor: TraitControllerRefDescriptor<O, T, C, I>): PropertyDecorator;
  <O, T extends Trait = Trait, C extends Controller = Controller, I = {}>(descriptor: {observes: boolean} & TraitControllerRefDescriptor<O, T, C, I & ObserverType<C>>): PropertyDecorator;
}

/** @public */
export interface TraitControllerRef<O = unknown, T extends Trait = Trait, C extends Controller = Controller> extends ControllerRef<O, C> {
  /** @override */
  get familyType(): Class<TraitControllerRef<any, any, any>> | null;

  /** @internal */
  getTraitRef(controller: C): TraitRef<unknown, T>;

  get trait(): T | null;

  setTrait(trait: T | null, targetTrait?: Trait | null, key?: string): C | null;

  removeTrait(trait: T | null): C | null;

  deleteTrait(trait: T | null): C | null;

  createController(trait?: T): C;
}

/** @public */
export const TraitControllerRef = (function (_super: typeof ControllerRef) {
  const TraitControllerRef: TraitControllerRefFactory = _super.extend("TraitControllerRef");

  Object.defineProperty(TraitControllerRef.prototype, "familyType", {
    get: function (this: TraitControllerRef): Class<TraitControllerRef<any, any, any>> | null {
      return TraitControllerRef;
    },
    configurable: true,
  });

  TraitControllerRef.prototype.getTraitRef = function <T extends Trait, C extends Controller>(controller: C): TraitRef<unknown, T> {
    throw new Error("abstract");
  };

  Object.defineProperty(TraitControllerRef.prototype, "trait", {
    get: function <T extends Trait>(this: TraitControllerRef<unknown, T, Controller>): T | null {
      const controller = this.controller;
      if (controller !== null) {
        const traitRef = this.getTraitRef(controller);
        return traitRef.trait;
      }
      return null;
    },
    configurable: true,
  });

  TraitControllerRef.prototype.setTrait = function <T extends Trait, C extends Controller>(this: TraitControllerRef<unknown, T, C>, trait: T | null, targetTrait?: Trait | null, key?: string): C | null {
    let controller = this.controller;
    if (trait !== null) {
      if (controller === null) {
        controller = this.createController(trait);
      }
      const traitRef = this.getTraitRef(controller);
      traitRef.setTrait(trait, targetTrait, key);
      this.setController(controller, null, key);
    } else if (controller !== null) {
      const traitRef = this.getTraitRef(controller);
      traitRef.setTrait(null);
    }
    return controller;
  };

  TraitControllerRef.prototype.removeTrait = function <T extends Trait, C extends Controller>(this: TraitControllerRef<unknown, T, C>, trait: T | null): C | null {
    const controller = this.controller;
    if (controller !== null) {
      const traitRef = this.getTraitRef(controller);
      if (traitRef.trait === trait) {
        controller.remove();
        return controller;
      }
    }
    return null;
  };

  TraitControllerRef.prototype.deleteTrait = function <T extends Trait, C extends Controller>(this: TraitControllerRef<unknown, T, C>, trait: T | null): C | null {
    const controller = this.controller;
    if (controller !== null) {
      const traitRef = this.getTraitRef(controller);
      if (traitRef.trait === trait) {
        controller.remove();
        this.setController(null);
        return controller;
      }
    }
    return null;
  };

  TraitControllerRef.construct = function <F extends TraitControllerRef<any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  TraitControllerRef.define = function <O, T extends Trait, C extends Controller>(className: string, descriptor: TraitControllerRefDescriptor<O, T, C>): TraitControllerRefFactory<TraitControllerRef<any, T, C>> {
    let superClass = descriptor.extends as TraitControllerRefFactory | null | undefined;
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

    fastenerClass.construct = function (fastenerClass: {prototype: TraitControllerRef<any, any, any>}, fastener: TraitControllerRef<O, T, C> | null, owner: O): TraitControllerRef<O, T, C> {
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

  return TraitControllerRef;
})(ControllerRef);
