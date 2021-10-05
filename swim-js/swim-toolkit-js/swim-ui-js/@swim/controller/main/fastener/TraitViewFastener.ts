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

import {Mutable, Class, FromAny, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "@swim/fastener";
import {Model, AnyTraitFactory, Trait} from "@swim/model";
import {AnyViewFactory, View} from "@swim/view";

export type TraitViewFastenerTraitType<F extends TraitViewFastener<any, any, any, any, any>> =
  F extends TraitViewFastener<any, infer R, any, any, any> ? R : never;

export type TraitViewFastenerTraitInitType<F extends TraitViewFastener<any, any, any, any, any>> =
  F extends TraitViewFastener<any, any, infer RU, any, any> ? RU : never;

export type TraitViewFastenerViewType<F extends TraitViewFastener<any, any, any, any, any>> =
  F extends TraitViewFastener<any, any, any, infer V, any> ? V : never;

export type TraitViewFastenerViewInitType<F extends TraitViewFastener<any, any, any, any, any>> =
  F extends TraitViewFastener<any, any, any, any, infer VU> ? VU : never;

export interface TraitViewFastenerInit<R extends Trait = Trait, V extends View = View, RU = never, VU = never> extends FastenerInit {
  traitKey?: string | boolean;
  traitType?: AnyTraitFactory<R, RU>;
  observesTrait?: boolean;
  willSetTrait?(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;
  onSetTrait?(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;
  didSetTrait?(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;
  createTrait?(): R | null;
  insertTrait?(model: Model, trait: R, target: Trait | null, key: string | undefined): void;
  fromAnyTrait?(value: R | RU): R | null;

  viewKey?: string | boolean;
  viewType?: AnyViewFactory<V, VU>;
  observesView?: boolean;
  willSetView?(newView: V | null, oldView: V | null, target: View | null): void;
  onSetView?(newView: V | null, oldView: V | null, target: View | null): void;
  didSetView?(newView: V | null, oldView: V | null, target: View | null): void;
  createView?(): V | null;
  insertView?(parent: View, child: V, target: View | null, key: string | undefined): void;
  fromAnyView?(value: V | VU): V | null;
}

export type TraitViewFastenerDescriptor<O = unknown, R extends Trait = Trait, V extends View = View, RU = never, VU = never, I = {}> = ThisType<TraitViewFastener<O, R, V, RU, VU> & I> & TraitViewFastenerInit<R, V, RU, VU> & Partial<I>;

export interface TraitViewFastenerClass<F extends TraitViewFastener<any, any, any> = TraitViewFastener<any, any, any, any, any>> extends FastenerClass<F> {
  create(this: TraitViewFastenerClass<F>, owner: FastenerOwner<F>, fastenerName: string): F;

  construct(fastenerClass: TraitViewFastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F;

  extend(this: TraitViewFastenerClass<F>, classMembers?: {} | null): TraitViewFastenerClass<F>;

  define<O, R extends Trait = Trait, V extends View = View, RU = never, VU = never, I = {}>(descriptor: {extends: TraitViewFastenerClass | null, observesTrait: boolean, observesView: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, I & ObserverType<R> & ObserverType<V>>): TraitViewFastenerClass<TraitViewFastener<any, R, V, RU, VU> & I>;
  define<O, R extends Trait = Trait, V extends View = View, RU = never, VU = never, I = {}>(descriptor: {extends: TraitViewFastenerClass | null, observesTrait: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, I & ObserverType<R>>): TraitViewFastenerClass<TraitViewFastener<any, R, V, RU, VU> & I>;
  define<O, R extends Trait = Trait, V extends View = View, RU = never, VU = never, I = {}>(descriptor: {extends: TraitViewFastenerClass | null, observesView: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, I & ObserverType<V>>): TraitViewFastenerClass<TraitViewFastener<any, R, V, RU, VU> & I>;
  define<O, R extends Trait = Trait, V extends View = View, RU = never, VU = never, I = {}>(descriptor: {extends: TraitViewFastenerClass | null} & TraitViewFastenerDescriptor<O, R, V, RU, VU, I>): TraitViewFastenerClass<TraitViewFastener<any, R, V, RU, VU> & I>;
  define<O, R extends Trait = Trait, V extends View = View, RU = never, VU = never>(descriptor: {observesTrait: boolean, observesView: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, ObserverType<R> & ObserverType<V>>): TraitViewFastenerClass<TraitViewFastener<any, R, V, RU, VU>>;
  define<O, R extends Trait = Trait, V extends View = View, RU = never, VU = never>(descriptor: {observesTrait: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, ObserverType<R>>): TraitViewFastenerClass<TraitViewFastener<any, R, V, RU, VU>>;
  define<O, R extends Trait = Trait, V extends View = View, RU = never, VU = never>(descriptor: {observesView: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, ObserverType<V>>): TraitViewFastenerClass<TraitViewFastener<any, R, V, RU, VU>>;
  define<O, R extends Trait = Trait, V extends View = View, RU = never, VU = never>(descriptor: TraitViewFastenerDescriptor<O, R, V, RU, VU>): TraitViewFastenerClass<TraitViewFastener<any, R, V, RU, VU>>;

  <O, R extends Trait = Trait, V extends View = View, RU = never, VU = never, I = {}>(descriptor: {extends: TraitViewFastenerClass | null, observesTrait: boolean, observesView: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, I & ObserverType<R> & ObserverType<V>>): PropertyDecorator;
  <O, R extends Trait = Trait, V extends View = View, RU = never, VU = never, I = {}>(descriptor: {extends: TraitViewFastenerClass | null, observesTrait: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, I & ObserverType<R>>): PropertyDecorator;
  <O, R extends Trait = Trait, V extends View = View, RU = never, VU = never, I = {}>(descriptor: {extends: TraitViewFastenerClass | null, observesView: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, I & ObserverType<V>>): PropertyDecorator;
  <O, R extends Trait = Trait, V extends View = View, RU = never, VU = never, I = {}>(descriptor: {extends: TraitViewFastenerClass | null} & TraitViewFastenerDescriptor<O, R, V, RU, VU, I>): PropertyDecorator;
  <O, R extends Trait = Trait, V extends View = View, RU = never, VU = never>(descriptor: {observesTrait: boolean, observesView: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, ObserverType<R> & ObserverType<V>>): PropertyDecorator;
  <O, R extends Trait = Trait, V extends View = View, RU = never, VU = never>(descriptor: {observesTrait: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, ObserverType<R>>): PropertyDecorator;
  <O, R extends Trait = Trait, V extends View = View, RU = never, VU = never>(descriptor: {observesView: boolean} & TraitViewFastenerDescriptor<O, R, V, RU, VU, ObserverType<V>>): PropertyDecorator;
  <O, R extends Trait = Trait, V extends View = View, RU = never, VU = never>(descriptor: TraitViewFastenerDescriptor<O, R, V, RU, VU>): PropertyDecorator;
}

export interface TraitViewFastener<O = unknown, R extends Trait = Trait, V extends View = View, RU = never, VU = never> extends Fastener<O> {
  /** @override */
  get familyType(): Class<TraitViewFastener<any, any, any, any, any>> | null;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly trait: R | null;

  getTrait(): R;

  setTrait(newTrait: R | RU | null, target?: Trait | null): R | null;

  /** @protected */
  attachTrait(newTrait: R): void;

  /** @protected */
  detachTrait(oldTrait: R): void;

  /** @protected */
  willSetTrait(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;

  /** @protected */
  onSetTrait(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;

  /** @protected */
  didSetTrait(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;

  readonly traitKey: string | undefined;

  /** @internal @protected */
  get model(): Model | null;

  injectTrait(model?: Model | null, trait?: R | RU | null, target?: Trait | null, key?: string | null): R | null;

  createTrait(): R | null;

  /** @internal @protected */
  insertTrait(model: Model, trait: R, target: Trait | null, key: string | undefined): void;

  removeTrait(): R | null;

  /** @internal @protected */
  fromAnyTrait(value: R | RU): R | null;

  /** @internal @protected */
  get traitType(): AnyTraitFactory<R, RU> | undefined; // optional prototype property

  /** @internal @protected */
  get observesTrait(): boolean | undefined; // optional prototype property

  readonly view: V | null;

  getView(): V;

  setView(newView: V | VU | null, target?: View | null): V | null;

  /** @protected */
  attachView(newView: V): void;

  /** @protected */
  detachView(oldView: V): void;

  /** @protected */
  willSetView(newView: V | null, oldView: V | null, target: View | null): void;

  /** @protected */
  onSetView(newView: V | null, oldView: V | null, target: View | null): void;

  /** @protected */
  didSetView(newView: V | null, oldView: V | null, target: View | null): void;

  readonly viewKey: string | undefined;

  /** @internal @protected */
  get parentView(): View | null;

  injectView(parent?: View | null, child?: V | VU | null, target?: View | null, key?: string | null): V | null;

  createView(): V | null;

  /** @internal @protected */
  insertView(parent: View, child: V, target: View | null, key: string | undefined): void;

  removeView(): V | null;

  /** @internal @protected */
  fromAnyView(value: V | VU): V | null;

  /** @internal @protected */
  get viewType(): AnyViewFactory<V, VU> | undefined; // optional prototype property

  /** @internal @protected */
  get observesView(): boolean | undefined; // optional prototype property
}

export const TraitViewFastener = (function (_super: typeof Fastener) {
  const TraitViewFastener = _super.extend() as TraitViewFastenerClass;

  Object.defineProperty(TraitViewFastener.prototype, "familyType", {
    get: function (this: TraitViewFastener): Class<TraitViewFastener<any, any, any>> | null {
      return TraitViewFastener;
    },
    configurable: true,
  });

  TraitViewFastener.prototype.onInherit = function (this: TraitViewFastener, superFastener: TraitViewFastener): void {
    this.setTrait(superFastener.trait);
    this.setView(superFastener.view);
  };

  TraitViewFastener.prototype.getTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>): R {
    const trait = this.trait;
    if (trait === null) {
      throw new TypeError("null " + this.name + " trait");
    }
    return trait;
  };

  TraitViewFastener.prototype.setTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>, newTrait: R | null, target?: Trait | null): R | null {
    const oldTrait = this.trait;
    if (newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    }
    if (target === void 0) {
      target = null;
    }
    if (oldTrait !== newTrait) {
      this.willSetTrait(newTrait, oldTrait, target);
      if (oldTrait !== null) {
        this.detachTrait(oldTrait);
      }
      (this as Mutable<typeof this>).trait = newTrait;
      if (newTrait !== null) {
        this.attachTrait(newTrait);
      }
      this.onSetTrait(newTrait, oldTrait, target);
      this.didSetTrait(newTrait, oldTrait, target);
    }
    return oldTrait;
  };

  TraitViewFastener.prototype.attachTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>, newTrait: R): void {
    if (this.observesTrait === true) {
      newTrait.observe(this as ObserverType<R>);
    }
  };

  TraitViewFastener.prototype.detachTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>, oldTrait: R): void {
    if (this.observesTrait === true) {
      oldTrait.unobserve(this as ObserverType<R>);
    }
  };

  TraitViewFastener.prototype.willSetTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>, newTrait: R | null, oldTrait: R | null, target: Trait | null): void {
    // hook
  };

  TraitViewFastener.prototype.onSetTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>, newTrait: R | null, oldTrait: R | null, target: Trait | null): void {
    // hook
  };

  TraitViewFastener.prototype.didSetTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>, newTrait: R | null, oldTrait: R | null, target: Trait | null): void {
    // hook
  };

  Object.defineProperty(TraitViewFastener.prototype, "model", {
    get(this: TraitViewFastener): Model | null {
      const owner = this.owner;
      if (owner instanceof Model) {
        return owner;
      } else if (owner instanceof Trait) {
        return owner.model;
      } else {
        return null;
      }
    },
    configurable: true,
  });

  TraitViewFastener.prototype.injectTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>, model?: Model | null, trait?: R | null, target?: Trait | null, key?: string | null): R | null {
    if (target === void 0) {
      target = null;
    }
    if (trait === void 0 || trait === null) {
      trait = this.trait;
      if (trait === null) {
        trait = this.createTrait();
      }
    } else {
      trait = this.fromAnyTrait(trait);
      if (trait !== null) {
        this.setTrait(trait, target);
      }
    }
    if (trait !== null) {
      if (model === void 0 || model === null) {
        model = this.model;
      }
      if (key === void 0) {
        key = this.traitKey;
      } else if (key === null) {
        key = void 0;
      }
      if (model !== null && (trait.model !== model || trait.key !== key)) {
        this.insertTrait(model, trait, target, key);
      }
      if (this.trait === null) {
        this.setTrait(trait, target);
      }
    }
    return trait;
  };

  TraitViewFastener.prototype.createTrait = function <R extends Trait, RU>(this: TraitViewFastener<unknown, R, View, RU, never>): R | null {
    const traitType = this.traitType;
    if (traitType !== void 0 && traitType.create !== void 0) {
      return traitType.create();
    }
    return null;
  };

  TraitViewFastener.prototype.insertTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>, model: Model, trait: R, target: Trait | null, key: string | undefined): void {
    model.insertTrait(trait, target, key);
  };

  TraitViewFastener.prototype.removeTrait = function <R extends Trait>(this: TraitViewFastener<unknown, R, View>): R | null {
    const trait = this.trait;
    if (trait !== null) {
      trait.remove();
    }
    return trait;
  };

  TraitViewFastener.prototype.fromAnyTrait = function <R extends Trait, RU>(this: TraitViewFastener<unknown, R, View, RU, never>, value: R | RU): R | null {
    const traitType = this.traitType;
    if (FromAny.is<R, RU>(traitType)) {
      return traitType.fromAny(value);
    } else if (value instanceof Trait) {
      return value;
    }
    return null;
  };

  TraitViewFastener.prototype.getView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>): V {
    const view = this.view;
    if (view === null) {
      throw new TypeError("null " + this.name + " view");
    }
    return view;
  };

  TraitViewFastener.prototype.setView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>, newView: V | null, target?: View | null): V | null {
    const oldView = this.view;
    if (newView !== null) {
      newView = this.fromAnyView(newView);
    }
    if (target === void 0) {
      target = null;
    }
    if (oldView !== newView) {
      this.willSetView(newView, oldView, target);
      if (oldView !== null) {
        this.detachView(oldView);
      }
      (this as Mutable<typeof this>).view = newView;
      if (newView !== null) {
        this.attachView(newView);
      }
      this.onSetView(newView, oldView, target);
      this.didSetView(newView, oldView, target);
    }
    return oldView;
  };

  TraitViewFastener.prototype.attachView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>, newView: V): void {
    if (this.observesView === true) {
      newView.observe(this as ObserverType<V>);
    }
  };

  TraitViewFastener.prototype.detachView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>, oldView: V): void {
    if (this.observesView === true) {
      oldView.unobserve(this as ObserverType<V>);
    }
  };

  TraitViewFastener.prototype.willSetView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>, newView: V | null, oldView: V | null, target: View | null): void {
    // hook
  };

  TraitViewFastener.prototype.onSetView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>, newView: V | null, oldView: V | null, target: View | null): void {
    // hook
  };

  TraitViewFastener.prototype.didSetView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>, newView: V | null, oldView: V | null, target: View | null): void {
    // hook
  };

  Object.defineProperty(TraitViewFastener.prototype, "parentView", {
    get(this: TraitViewFastener): View | null {
      const owner = this.owner;
      return owner instanceof View ? owner : null;
    },
    configurable: true,
  });

  TraitViewFastener.prototype.injectView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>, parent?: View | null, child?: V | null, target?: View | null, key?: string | null): V | null {
    if (target === void 0) {
      target = null;
    }
    if (child === void 0 || child === null) {
      child = this.view;
      if (child === null) {
        child = this.createView();
      }
    } else {
      child = this.fromAnyView(child);
      if (child !== null) {
        this.setView(child, target);
      }
    }
    if (child !== null) {
      if (parent === void 0 || parent === null) {
        parent = this.parentView;
      }
      if (key === void 0) {
        key = this.viewKey;
      } else if (key === null) {
        key = void 0;
      }
      if (parent !== null && (child.parent !== parent || child.key !== key)) {
        this.insertView(parent, child, target, key);
      }
      if (this.view === null) {
        this.setView(child, target);
      }
    }
    return child;
  };

  TraitViewFastener.prototype.createView = function <V extends View, VU>(this: TraitViewFastener<unknown, Trait, V, never, VU>): V | null {
    const viewType = this.viewType;
    if (viewType !== void 0 && viewType.create !== void 0) {
      return viewType.create();
    }
    return null;
  };

  TraitViewFastener.prototype.insertView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>, parent: View, child: V, target: View | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  TraitViewFastener.prototype.removeView = function <V extends View>(this: TraitViewFastener<unknown, Trait, V>): V | null {
    const view = this.view;
    if (view !== null) {
      view.remove();
    }
    return view;
  };

  TraitViewFastener.prototype.fromAnyView = function <V extends View, VU>(this: TraitViewFastener<unknown, Trait, V, never, VU>, value: V | VU): V | null {
    const viewType = this.viewType;
    if (FromAny.is<V, VU>(viewType)) {
      return viewType.fromAny(value);
    } else if (value instanceof View) {
      return value;
    }
    return null;
  };

  TraitViewFastener.construct = function <F extends TraitViewFastener<any, any, any>>(fastenerClass: TraitViewFastenerClass, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F {
    fastener = _super.construct(fastenerClass, fastener, owner, fastenerName) as F;
    (fastener as Mutable<typeof fastener>).traitKey = void 0;
    (fastener as Mutable<typeof fastener>).trait = null;
    (fastener as Mutable<typeof fastener>).viewKey = void 0;
    (fastener as Mutable<typeof fastener>).view = null;
    return fastener;
  };

  TraitViewFastener.define = function <O, R extends Trait, V extends View, RU, VU>(descriptor: TraitViewFastenerDescriptor<O, R, V, RU, VU>): TraitViewFastenerClass<TraitViewFastener<any, R, V, RU, VU>> {
    let superClass = descriptor.extends as TraitViewFastenerClass | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const traitKey = descriptor.traitKey;
    const viewKey = descriptor.viewKey;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.traitKey;
    delete descriptor.viewKey;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(descriptor);

    fastenerClass.construct = function (fastenerClass: TraitViewFastenerClass, fastener: TraitViewFastener<O, R, V, RU, VU> | null, owner: O, fastenerName: string): TraitViewFastener<O, R, V, RU, VU> {
      fastener = superClass!.construct(fastenerClass, fastener, owner, fastenerName);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (typeof traitKey === "string") {
        (fastener as Mutable<typeof fastener>).traitKey = traitKey;
      } else if (traitKey === true) {
        (fastener as Mutable<typeof fastener>).traitKey = fastenerName;
      }
      if (typeof viewKey === "string") {
        (fastener as Mutable<typeof fastener>).viewKey = viewKey;
      } else if (viewKey === true) {
        (fastener as Mutable<typeof fastener>).viewKey = fastenerName;
      }
      return fastener;
    };

    return fastenerClass;
  };

  return TraitViewFastener;
})(Fastener);
