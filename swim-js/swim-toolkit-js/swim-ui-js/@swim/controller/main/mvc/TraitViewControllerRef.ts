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
import {ControllerRefInit, ControllerRefClass, ControllerRef} from "../controller/ControllerRef";
import type {TraitViewRef} from "./TraitViewRef";

export type TraitViewControllerRefType<F extends TraitViewControllerRef<any, any, any, any>> =
  F extends TraitViewControllerRef<any, any, any, infer C> ? C : never;

export interface TraitViewControllerRefInit<T extends Trait, V extends View, C extends Controller = Controller> extends ControllerRefInit<C> {
  extends?: {prototype: TraitViewControllerRef<any, any, any, any>} | string | boolean | null;
  getTraitViewRef?(controller: C): TraitViewRef<any, T, V>;
  createController?(trait?: T): C | null;
  parentView?: View | null;
}

export type TraitViewControllerRefDescriptor<O = unknown, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}> = ThisType<TraitViewControllerRef<O, T, V, C> & I> & TraitViewControllerRefInit<T, V, C> & Partial<I>;

export interface TraitViewControllerRefClass<F extends TraitViewControllerRef<any, any, any, any> = TraitViewControllerRef<any, any, any, any>> extends ControllerRefClass<F> {
}

export interface TraitViewControllerRefFactory<F extends TraitViewControllerRef<any, any, any, any> = TraitViewControllerRef<any, any, any, any>> extends TraitViewControllerRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitViewControllerRefFactory<F> & I;

  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(className: string, descriptor: TraitViewControllerRefDescriptor<O, T, V, C>): TraitViewControllerRefFactory<TraitViewControllerRef<any, T, V, C>>;
  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(className: string, descriptor: {observes: boolean} & TraitViewControllerRefDescriptor<O, T, V, C, ObserverType<C>>): TraitViewControllerRefFactory<TraitViewControllerRef<any, T, V, C>>;
  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(className: string, descriptor: TraitViewControllerRefDescriptor<O, T, V, C, I>): TraitViewControllerRefFactory<TraitViewControllerRef<any, T, V, C> & I>;
  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(className: string, descriptor: {observes: boolean} & TraitViewControllerRefDescriptor<O, T, V, C, I & ObserverType<C>>): TraitViewControllerRefFactory<TraitViewControllerRef<any, T, V, C> & I>;

  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(descriptor: TraitViewControllerRefDescriptor<O, T, V, C>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(descriptor: {observes: boolean} & TraitViewControllerRefDescriptor<O, T, V, C, ObserverType<C>>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(descriptor: TraitViewControllerRefDescriptor<O, T, V, C, I>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(descriptor: {observes: boolean} & TraitViewControllerRefDescriptor<O, T, V, C, I & ObserverType<C>>): PropertyDecorator;
}

export interface TraitViewControllerRef<O = unknown, T extends Trait = Trait, V extends View = View, C extends Controller = Controller> extends ControllerRef<O, C> {
  /** @override */
  get familyType(): Class<TraitViewControllerRef<any, any, any, any>> | null;

  /** @internal */
  getTraitViewRef(controller: C): TraitViewRef<unknown, T, V>;

  get trait(): T | null;

  setTrait(trait: T | null, targetTrait?: Trait | null, key?: string): C | null;

  removeTrait(trait: T | null): C | null;

  deleteTrait(trait: T | null): C | null;

  get view(): V | null;

  createController(trait?: T): C | null;

  /** @internal @protected */
  get parentView(): View | null; // optional prototype property
}

export const TraitViewControllerRef = (function (_super: typeof ControllerRef) {
  const TraitViewControllerRef: TraitViewControllerRefFactory = _super.extend("TraitViewControllerRef");

  Object.defineProperty(TraitViewControllerRef.prototype, "familyType", {
    get: function (this: TraitViewControllerRef): Class<TraitViewControllerRef<any, any, any, any>> | null {
      return TraitViewControllerRef;
    },
    configurable: true,
  });

  TraitViewControllerRef.prototype.getTraitViewRef = function <T extends Trait, V extends View, C extends Controller>(controller: C): TraitViewRef<unknown, T, V> {
    throw new Error("abstract");
  };

  Object.defineProperty(TraitViewControllerRef.prototype, "trait", {
    get: function <T extends Trait>(this: TraitViewControllerRef<unknown, T, View, Controller>): T | null {
      const controller = this.controller;
      if (controller !== null) {
        const traitViewRef = this.getTraitViewRef(controller);
        return traitViewRef.trait;
      }
      return null;
    },
    configurable: true,
  });

  TraitViewControllerRef.prototype.setTrait = function <T extends Trait, V extends View, C extends Controller>(this: TraitViewControllerRef<unknown, T, V, C>, trait: T | null, targetTrait?: Trait | null, key?: string): C | null {
    let controller = this.controller;
    if (trait !== null) {
      if (controller === null) {
        controller = this.createController(trait);
      }
      if (controller !== null) {
        const traitViewRef = this.getTraitViewRef(controller);
        traitViewRef.setTrait(trait, targetTrait, key);
        this.setController(controller, null, key);
        if (traitViewRef.view === null) {
          const view = traitViewRef.createView();
          traitViewRef.insertView(this.parentView, view, null, key);
        }
      }
    } else if (controller !== null) {
      const traitViewRef = this.getTraitViewRef(controller);
      traitViewRef.setTrait(null);
    }
    return controller;
  };

  TraitViewControllerRef.prototype.removeTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerRef<unknown, T, View, C>, trait: T | null): C | null {
    const controller = this.controller;
    if (controller !== null) {
      const traitViewRef = this.getTraitViewRef(controller);
      if (traitViewRef.trait === trait) {
        controller.remove();
        return controller;
      }
    }
    return null;
  };

  TraitViewControllerRef.prototype.deleteTrait = function <T extends Trait, C extends Controller>(this: TraitViewControllerRef<unknown, T, View, C>, trait: T | null): C | null {
    const controller = this.controller;
    if (controller !== null) {
      const traitViewRef = this.getTraitViewRef(controller);
      if (traitViewRef.trait === trait) {
        controller.remove();
        this.setController(null);
        return controller;
      }
    }
    return null;
  };

  Object.defineProperty(TraitViewControllerRef.prototype, "view", {
    get: function <V extends View>(this: TraitViewControllerRef<unknown, Trait, V, Controller>): V | null {
      const controller = this.controller;
      if (controller !== null) {
        const traitViewRef = this.getTraitViewRef(controller);
        return traitViewRef.view;
      }
      return null;
    },
    configurable: true,
  });

  Object.defineProperty(TraitViewControllerRef.prototype, "parentView", {
    get: function (this: TraitViewControllerRef): View | null {
      return null;
    },
    configurable: true,
  });

  TraitViewControllerRef.construct = function <F extends TraitViewControllerRef<any, any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  TraitViewControllerRef.define = function <O, T extends Trait, V extends View, C extends Controller>(className: string, descriptor: TraitViewControllerRefDescriptor<O, T, V, C>): TraitViewControllerRefFactory<TraitViewControllerRef<any, T, V, C>> {
    let superClass = descriptor.extends as TraitViewControllerRefFactory | null | undefined;
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

    fastenerClass.construct = function (fastenerClass: {prototype: TraitViewControllerRef<any, any, any, any>}, fastener: TraitViewControllerRef<O, T, V, C> | null, owner: O): TraitViewControllerRef<O, T, V, C> {
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

  return TraitViewControllerRef;
})(ControllerRef);
