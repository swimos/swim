// Copyright 2015-2021 Swim.inc
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

import type {Proto, ObserverType} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import type {Trait} from "@swim/model";
import type {AnyView, View} from "@swim/view";
import type {Controller} from "../controller/Controller";
import {ControllerRefInit, ControllerRefClass, ControllerRef} from "../controller/ControllerRef";
import type {TraitViewRef} from "./TraitViewRef";

/** @internal */
export type TraitViewControllerRefType<F extends TraitViewControllerRef<any, any, any, any>> =
  F extends TraitViewControllerRef<any, any, any, infer C> ? C : never;

/** @public */
export interface TraitViewControllerRefInit<T extends Trait, V extends View, C extends Controller = Controller> extends ControllerRefInit<C> {
  extends?: {prototype: TraitViewControllerRef<any, any, any, any>} | string | boolean | null;
  getTraitViewRef?(controller: C): TraitViewRef<any, T, V>;
  createController?(trait?: T): C;
  traitKey?: string | boolean;
  viewKey?: string | boolean;
  parentView?: View | null;
}

/** @public */
export type TraitViewControllerRefDescriptor<O = unknown, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}> = ThisType<TraitViewControllerRef<O, T, V, C> & I> & TraitViewControllerRefInit<T, V, C> & Partial<I>;

/** @public */
export interface TraitViewControllerRefClass<F extends TraitViewControllerRef<any, any, any, any> = TraitViewControllerRef<any, any, any, any>> extends ControllerRefClass<F> {
}

/** @public */
export interface TraitViewControllerRefFactory<F extends TraitViewControllerRef<any, any, any, any> = TraitViewControllerRef<any, any, any, any>> extends TraitViewControllerRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitViewControllerRefFactory<F> & I;

  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(className: string, descriptor: TraitViewControllerRefDescriptor<O, T, V, C>): TraitViewControllerRefFactory<TraitViewControllerRef<any, T, V, C>>;
  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(className: string, descriptor: {observes: boolean} & TraitViewControllerRefDescriptor<O, T, V, C, ObserverType<C>>): TraitViewControllerRefFactory<TraitViewControllerRef<any, T, V, C>>;
  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(className: string, descriptor: {implements: unknown} & TraitViewControllerRefDescriptor<O, T, V, C, I>): TraitViewControllerRefFactory<TraitViewControllerRef<any, T, V, C> & I>;
  define<O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & TraitViewControllerRefDescriptor<O, T, V, C, I & ObserverType<C>>): TraitViewControllerRefFactory<TraitViewControllerRef<any, T, V, C> & I>;

  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(descriptor: TraitViewControllerRefDescriptor<O, T, V, C>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller>(descriptor: {observes: boolean} & TraitViewControllerRefDescriptor<O, T, V, C, ObserverType<C>>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(descriptor: {implements: unknown} & TraitViewControllerRefDescriptor<O, T, V, C, I>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, C extends Controller = Controller, I = {}>(descriptor: {implements: unknown; observes: boolean} & TraitViewControllerRefDescriptor<O, T, V, C, I & ObserverType<C>>): PropertyDecorator;
}

/** @public */
export interface TraitViewControllerRef<O = unknown, T extends Trait = Trait, V extends View = View, C extends Controller = Controller> extends ControllerRef<O, C> {
  /** @override */
  get fastenerType(): Proto<TraitViewControllerRef<any, any, any, any>>;

  /** @internal */
  getTraitViewRef(controller: C): TraitViewRef<unknown, T, V>;

  get trait(): T | null;

  getTrait(): T;

  setTrait(trait: T | null, targetTrait?: Trait | null, key?: string): T | null;

  removeTrait(trait: T | null): C | null;

  deleteTrait(trait: T | null): C | null;

  /** @internal */
  get traitKey(): string | undefined; // optional prototype field

  get view(): V | null;

  getView(): V;

  setView(view: AnyView<V> | null, targetView?: View | null, key?: string): V | null;

  attachView(view?: AnyView<V>, targetView?: View | null): V;

  detachView(): V | null;

  insertView(parentView?: View | null, view?: AnyView<V>, targetView?: View | null, key?: string): V;

  removeView(): V | null;

  deleteView(): V | null;

  /** @override */
  createController(trait?: T): C;

  /** @internal */
  get viewKey(): string | undefined; // optional prototype field

  /** @internal @protected */
  get parentView(): View | null; // optional prototype property
}

/** @public */
export const TraitViewControllerRef = (function (_super: typeof ControllerRef) {
  const TraitViewControllerRef: TraitViewControllerRefFactory = _super.extend("TraitViewControllerRef");

  Object.defineProperty(TraitViewControllerRef.prototype, "fastenerType", {
    get: function (this: TraitViewControllerRef): Proto<TraitViewControllerRef<any, any, any, any>> {
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

  TraitViewControllerRef.prototype.getTrait = function <T extends Trait>(this: TraitViewControllerRef<unknown, T, View, Controller>): T {
    const trait = this.trait;
    if (trait === null) {
      let message = trait + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "trait";
      throw new TypeError(message);
    }
    return trait;
  };

  TraitViewControllerRef.prototype.setTrait = function <T extends Trait>(this: TraitViewControllerRef<unknown, T, View, Controller>, newTrait: T | null, targetTrait?: Trait | null, key?: string): T | null {
    let controller = this.controller;
    if (newTrait !== null) {
      if (controller === null) {
        controller = this.createController(newTrait);
      }
      const traitViewRef = this.getTraitViewRef(controller);
      const traitKey = key !== void 0 ? key : this.traitKey;
      const oldTrait = traitViewRef.setTrait(newTrait, targetTrait, traitKey);
      this.setController(controller);
      if (traitViewRef.view === null) {
        traitViewRef.insertView(this.parentView, null, null, this.viewKey);
      }
      return oldTrait;
    } else if (controller !== null) {
      const traitViewRef = this.getTraitViewRef(controller);
      return traitViewRef.setTrait(null);
    }
    return null;
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

  TraitViewControllerRef.prototype.getView = function <V extends View>(this: TraitViewControllerRef<unknown, Trait, V, Controller>): V {
    const view = this.view;
    if (view === null) {
      let message = view + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "view";
      throw new TypeError(message);
    }
    return view;
  };

  TraitViewControllerRef.prototype.setView = function <V extends View>(this: TraitViewControllerRef<unknown, Trait, V, Controller>, view: AnyView<V> | null, targetView?: View | null, key?: string): V | null {
    const controller = this.attachController();
    const traitViewRef = this.getTraitViewRef(controller);
    if (key === void 0) {
      key = this.viewKey;
    }
    return traitViewRef.setView(view, targetView, key);
  };

  TraitViewControllerRef.prototype.attachView = function <V extends View>(this: TraitViewControllerRef<unknown, Trait, V, Controller>, view?: AnyView<V>, targetView?: View | null): V | null {
    const controller = this.attachController();
    const traitViewRef = this.getTraitViewRef(controller);
    return traitViewRef.attachView(view, targetView);
  };

  TraitViewControllerRef.prototype.detachView = function <V extends View>(this: TraitViewControllerRef<unknown, Trait, V, Controller>): V | null {
    const controller = this.controller;
    if (controller !== null) {
      const traitViewRef = this.getTraitViewRef(controller);
      return traitViewRef.detachView();
    }
    return null;
  };

  TraitViewControllerRef.prototype.insertView = function <V extends View>(this: TraitViewControllerRef<unknown, Trait, V, Controller>, parentView?: View | null, view?: AnyView<V>, targetView?: View | null, key?: string): V {
    const controller = this.attachController();
    const traitViewRef = this.getTraitViewRef(controller);
    if (parentView === void 0 || parentView === null) {
      parentView = this.parentView;
    }
    if (key === void 0) {
      key = this.viewKey;
    }
    return traitViewRef.insertView(parentView, view, targetView, key);
  };

  TraitViewControllerRef.prototype.removeView = function <V extends View>(this: TraitViewControllerRef<unknown, Trait, V, Controller>): V | null {
    const controller = this.controller;
    if (controller !== null) {
      const traitViewRef = this.getTraitViewRef(controller);
      return traitViewRef.removeView();
    }
    return null;
  };

  TraitViewControllerRef.prototype.deleteView = function <V extends View>(this: TraitViewControllerRef<unknown, Trait, V, Controller>): V | null {
    const controller = this.controller;
    if (controller !== null) {
      const traitViewRef = this.getTraitViewRef(controller);
      return traitViewRef.deleteView();
    }
    return null;
  };

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
    delete descriptor.implements;
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

    if (descriptor.traitKey === true) {
      Object.defineProperty(descriptor, "traitKey", {
        value: className,
        configurable: true,
      });
    } else if (descriptor.traitKey === false) {
      Object.defineProperty(descriptor, "traitKey", {
        value: void 0,
        configurable: true,
      });
    }

    if (descriptor.viewKey === true) {
      Object.defineProperty(descriptor, "viewKey", {
        value: className,
        configurable: true,
      });
    } else if (descriptor.viewKey === false) {
      Object.defineProperty(descriptor, "viewKey", {
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
