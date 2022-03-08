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

import type {Mutable, Proto, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "@swim/component";
import {Model, AnyTrait, TraitFactory, Trait} from "@swim/model";
import {AnyView, ViewFactory, View} from "@swim/view";

/** @internal */
export type TraitViewRefTraitType<F extends TraitViewRef<any, any, any>> =
  F extends TraitViewRef<any, infer T, any> ? T : never;

/** @internal */
export type TraitViewRefViewType<F extends TraitViewRef<any, any, any>> =
  F extends TraitViewRef<any, any, infer V> ? V : never;

/** @public */
export interface TraitViewRefInit<T extends Trait = Trait, V extends View = View> extends FastenerInit {
  extends?: {prototype: TraitViewRef<any, any, any>} | string | boolean | null;

  traitKey?: string | boolean;
  traitType?: TraitFactory<T>;
  bindsTrait?: boolean;
  observesTrait?: boolean;
  initTrait?(trait: T): void;
  willAttachTrait?(trait: T, target: Trait | null): void;
  didAttachTrait?(trait: T, target: Trait | null): void;
  deinitTrait?(trait: T): void;
  willDetachTrait?(trait: T): void;
  didDetachTrait?(trait: T): void;
  parentModel?: Model | null;
  insertChildTrait?(model: Model, trait: T, target: Trait | null, key: string | undefined): void;
  detectTrait?(trait: Trait): T | null;
  createTrait?(): T;
  fromAnyTrait?(value: AnyTrait<T>): T;

  viewKey?: string | boolean;
  viewType?: ViewFactory<V>;
  bindsView?: boolean;
  observesView?: boolean;
  initView?(view: V): void;
  willAttachView?(view: V, target: View | null): void;
  didAttachView?(view: V, target: View | null): void;
  deinitView?(view: V): void;
  willDetachView?(view: V): void;
  didDetachView?(view: V): void;
  parentView?: View | null;
  insertChildView?(parent: View, child: V, target: View | null, key: string | undefined): void;
  detectView?(view: View): V | null;
  createView?(): V;
  fromAnyView?(value: AnyView<V>): V;
}

/** @public */
export type TraitViewRefDescriptor<O = unknown, T extends Trait = Trait, V extends View = View, I = {}> = ThisType<TraitViewRef<O, T, V> & I> & TraitViewRefInit<T, V> & Partial<I>;

/** @public */
export interface TraitViewRefClass<F extends TraitViewRef<any, any, any> = TraitViewRef<any, any, any>> extends FastenerClass<F> {
}

/** @public */
export interface TraitViewRefFactory<F extends TraitViewRef<any, any, any> = TraitViewRef<any, any, any>> extends TraitViewRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitViewRefFactory<F> & I;

  define<O, T extends Trait = Trait, V extends View = View>(className: string, descriptor: TraitViewRefDescriptor<O, T, V>): TraitViewRefFactory<TraitViewRef<any, T, V>>;
  define<O, T extends Trait = Trait, V extends View = View>(className: string, descriptor: {observesTrait: boolean} & TraitViewRefDescriptor<O, T, V, ObserverType<T>>): TraitViewRefFactory<TraitViewRef<any, T, V>>;
  define<O, T extends Trait = Trait, V extends View = View>(className: string, descriptor: {observesView: boolean} & TraitViewRefDescriptor<O, T, V, ObserverType<V>>): TraitViewRefFactory<TraitViewRef<any, T, V>>;
  define<O, T extends Trait = Trait, V extends View = View>(className: string, descriptor: {observesTrait: boolean, observesView: boolean} & TraitViewRefDescriptor<O, T, V, ObserverType<T> & ObserverType<V>>): TraitViewRefFactory<TraitViewRef<any, T, V>>;
  define<O, T extends Trait = Trait, V extends View = View, I = {}>(className: string, descriptor: {implements: unknown} & TraitViewRefDescriptor<O, T, V, I>): TraitViewRefFactory<TraitViewRef<any, T, V> & I>;
  define<O, T extends Trait = Trait, V extends View = View, I = {}>(className: string, descriptor: {implements: unknown; observesTrait: boolean} & TraitViewRefDescriptor<O, T, V, I & ObserverType<T>>): TraitViewRefFactory<TraitViewRef<any, T, V> & I>;
  define<O, T extends Trait = Trait, V extends View = View, I = {}>(className: string, descriptor: {implements: unknown; observesView: boolean} & TraitViewRefDescriptor<O, T, V, I & ObserverType<V>>): TraitViewRefFactory<TraitViewRef<any, T, V> & I>;
  define<O, T extends Trait = Trait, V extends View = View, I = {}>(className: string, descriptor: {implements: unknown; observesTrait: boolean, observesView: boolean} & TraitViewRefDescriptor<O, T, V, I & ObserverType<T> & ObserverType<V>>): TraitViewRefFactory<TraitViewRef<any, T, V> & I>;

  <O, T extends Trait = Trait, V extends View = View>(descriptor: TraitViewRefDescriptor<O, T, V>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View>(descriptor: {observesTrait: boolean} & TraitViewRefDescriptor<O, T, V, ObserverType<T>>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View>(descriptor: {observesView: boolean} & TraitViewRefDescriptor<O, T, V, ObserverType<V>>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View>(descriptor: {observesTrait: boolean, observesView: boolean} & TraitViewRefDescriptor<O, T, V, ObserverType<T> & ObserverType<V>>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, I = {}>(descriptor: {implements: unknown} & TraitViewRefDescriptor<O, T, V, I>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, I = {}>(descriptor: {implements: unknown; observesTrait: boolean} & TraitViewRefDescriptor<O, T, V, I & ObserverType<T>>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, I = {}>(descriptor: {implements: unknown; observesView: boolean} & TraitViewRefDescriptor<O, T, V, I & ObserverType<V>>): PropertyDecorator;
  <O, T extends Trait = Trait, V extends View = View, I = {}>(descriptor: {implements: unknown; observesTrait: boolean, observesView: boolean} & TraitViewRefDescriptor<O, T, V, I & ObserverType<T> & ObserverType<V>>): PropertyDecorator;
}

/** @public */
export interface TraitViewRef<O = unknown, T extends Trait = Trait, V extends View = View> extends Fastener<O> {
  /** @override */
  get fastenerType(): Proto<TraitViewRef<any, any, any>>;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly trait: T | null;

  getTrait(): T;

  setTrait(trait: AnyTrait<T> | null, target?: Trait | null, key?: string): T | null;

  attachTrait(trait?: AnyTrait<T>, target?: Trait | null): T;

  detachTrait(): T | null;

  /** @protected */
  initTrait(trait: T): void;

  /** @protected */
  willAttachTrait(trait: T, target: Trait | null): void;

  /** @protected */
  onAttachTrait(trait: T, target: Trait | null): void;

  /** @protected */
  didAttachTrait(trait: T, target: Trait | null): void;

  /** @protected */
  deinitTrait(trait: T): void;

  /** @protected */
  willDetachTrait(trait: T): void;

  /** @protected */
  onDetachTrait(trait: T): void;

  /** @protected */
  didDetachTrait(trait: T): void;

  insertTrait(model?: Model | null, trait?: AnyTrait<T> | null, target?: Trait | null, key?: string): T;

  removeTrait(): T | null;

  deleteTrait(): T | null;

  /** @internal @protected */
  get parentModel(): Model | null;

  /** @internal @protected */
  insertChildTrait(model: Model, trait: T, target: Trait | null, key: string | undefined): void;

  /** @internal @override */
  bindModel(model: Model, targetModel: Model | null): void;

  /** @internal @override */
  unbindModel(model: Model): void;

  /** @override */
  detectModel(model: Model): T | null;

  /** @internal */
  bindTrait(trait: Trait, target: Trait | null): void;

  /** @internal */
  unbindTrait(trait: Trait): void;

  detectTrait(trait: Trait): T | null;

  createTrait(): T;

  /** @internal @protected */
  fromAnyTrait(value: AnyTrait<T>): T;

  /** @internal */
  get traitKey(): string | undefined; // optional prototype field

  /** @internal @protected */
  get traitType(): TraitFactory<T> | undefined; // optional prototype property

  /** @internal @protected */
  get bindsTrait(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observesTrait(): boolean | undefined; // optional prototype property

  readonly view: V | null;

  getView(): V;

  setView(view: AnyView<V> | null, target?: View | null, key?: string): V | null;

  attachView(view?: AnyView<V>, target?: View | null): V;

  detachView(): V | null;

  /** @protected */
  initView(view: V): void;

  /** @protected */
  willAttachView(view: V, target: View | null): void;

  /** @protected */
  onAttachView(view: V, target: View | null): void;

  /** @protected */
  didAttachView(view: V, target: View | null): void;

  /** @protected */
  deinitView(view: V): void;

  /** @protected */
  willDetachView(view: V): void;

  /** @protected */
  onDetachView(view: V): void;

  /** @protected */
  didDetachView(view: V): void;

  insertView(parent?: View | null, view?: AnyView<V> | null, target?: View | null, key?: string): V;

  removeView(): V | null;

  deleteView(): V | null;

  /** @internal @protected */
  get parentView(): View | null;

  /** @internal @protected */
  insertChildView(parent: View, child: V, target: View | null, key: string | undefined): void;

  /** @internal */
  bindView(view: View, target: View | null): void;

  /** @internal */
  unbindView(view: View): void;

  detectView(view: View): V | null;

  createView(): V;

  /** @internal @protected */
  fromAnyView(value: AnyView<V>): V;

  /** @internal */
  get viewKey(): string | undefined; // optional prototype field

  /** @internal @protected */
  get viewType(): ViewFactory<V> | undefined; // optional prototype property

  /** @internal @protected */
  get bindsView(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observesView(): boolean | undefined; // optional prototype property

  /** @internal @override */
  get lazy(): boolean; // prototype property

  /** @internal @override */
  get static(): string | boolean; // prototype property
}

/** @public */
export const TraitViewRef = (function (_super: typeof Fastener) {
  const TraitViewRef: TraitViewRefFactory = _super.extend("TraitViewRef");

  Object.defineProperty(TraitViewRef.prototype, "fastenerType", {
    get: function (this: TraitViewRef): Proto<TraitViewRef<any, any, any>> {
      return TraitViewRef;
    },
    configurable: true,
  });

  TraitViewRef.prototype.onInherit = function (this: TraitViewRef, superFastener: TraitViewRef): void {
    this.setTrait(superFastener.trait);
    this.setView(superFastener.view);
  };

  TraitViewRef.prototype.getTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>): T {
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

  TraitViewRef.prototype.setTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, newTrait: AnyTrait<T> | null, target?: Trait | null, key?: string): T | null {
    if (newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    }
    let oldTrait = this.trait;
    if (oldTrait !== newTrait) {
      if (target === void 0) {
        target = null;
      }
      let model: Model | null;
      if (this.bindsTrait && (model = this.parentModel, model !== null)) {
        if (oldTrait !== null && oldTrait.model === model) {
          if (target === null) {
            target = oldTrait.nextTrait;
          }
          oldTrait.remove();
        }
        if (newTrait !== null) {
          if (key === void 0) {
            key = this.traitKey;
          }
          this.insertChildTrait(model, newTrait, target, key);
        }
        oldTrait = this.trait;
      }
      if (oldTrait !== newTrait) {
        if (oldTrait !== null) {
          (this as Mutable<typeof this>).trait = null;
          this.willDetachTrait(oldTrait);
          this.onDetachTrait(oldTrait);
          this.deinitTrait(oldTrait);
          this.didDetachTrait(oldTrait);
        }
        if (newTrait !== null) {
          (this as Mutable<typeof this>).trait = newTrait;
          this.willAttachTrait(newTrait, target);
          this.onAttachTrait(newTrait, target);
          this.initTrait(newTrait);
          this.didAttachTrait(newTrait, target);
        }
      }
    }
    return oldTrait;
  };

  TraitViewRef.prototype.attachTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, newTrait?: AnyTrait<T>, target?: Trait | null): T {
    const oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    } else if (oldTrait === null) {
      newTrait = this.createTrait();
    } else {
      newTrait = oldTrait;
    }
    if (newTrait !== oldTrait) {
      if (target === void 0) {
        target = null;
      }
      if (oldTrait !== null) {
        (this as Mutable<typeof this>).trait = null;
        this.willDetachTrait(oldTrait);
        this.onDetachTrait(oldTrait);
        this.deinitTrait(oldTrait);
        this.didDetachTrait(oldTrait);
      }
      (this as Mutable<typeof this>).trait = newTrait;
      this.willAttachTrait(newTrait, target);
      this.onAttachTrait(newTrait, target);
      this.initTrait(newTrait);
      this.didAttachTrait(newTrait, target);
    }
    return newTrait;
  };

  TraitViewRef.prototype.detachTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>): T | null {
    const oldTrait = this.trait;
    if (oldTrait !== null) {
      (this as Mutable<typeof this>).trait = null;
      this.willDetachTrait(oldTrait);
      this.onDetachTrait(oldTrait);
      this.deinitTrait(oldTrait);
      this.didDetachTrait(oldTrait);
    }
    return oldTrait;
  };

  TraitViewRef.prototype.initTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: T): void {
    // hook
  };

  TraitViewRef.prototype.willAttachTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: T, target: Trait | null): void {
    // hook
  };

  TraitViewRef.prototype.onAttachTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: T, target: Trait | null): void {
    if (this.observesTrait === true) {
      trait.observe(this as ObserverType<T>);
    }
  };

  TraitViewRef.prototype.didAttachTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: T, target: Trait | null): void {
    // hook
  };

  TraitViewRef.prototype.deinitTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: T): void {
    // hook
  };

  TraitViewRef.prototype.willDetachTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: T): void {
    // hook
  };

  TraitViewRef.prototype.onDetachTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: T): void {
    if (this.observesTrait === true) {
      trait.unobserve(this as ObserverType<T>);
    }
  };

  TraitViewRef.prototype.didDetachTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: T): void {
    // hook
  };

  TraitViewRef.prototype.insertTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, model?: Model | null, newTrait?: AnyTrait<T> | null, target?: Trait | null, key?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    } else {
      const oldTrait = this.trait;
      if (oldTrait === null) {
        newTrait = this.createTrait();
      } else {
        newTrait = oldTrait;
      }
    }
    if (model === void 0 || model === null) {
      model = this.parentModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.traitKey;
    }
    if (model !== null && (newTrait.parent !== model || newTrait.key !== key)) {
      this.insertChildTrait(model, newTrait, target, key);
    }
    const oldTrait = this.trait;
    if (newTrait !== oldTrait) {
      if (oldTrait !== null) {
        (this as Mutable<typeof this>).trait = null;
        this.willDetachTrait(oldTrait);
        this.onDetachTrait(oldTrait);
        this.deinitTrait(oldTrait);
        this.didDetachTrait(oldTrait);
        oldTrait.remove();
      }
      (this as Mutable<typeof this>).trait = newTrait;
      this.willAttachTrait(newTrait, target);
      this.onAttachTrait(newTrait, target);
      this.initTrait(newTrait);
      this.didAttachTrait(newTrait, target);
    }
    return newTrait;
  };

  TraitViewRef.prototype.removeTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>): T | null {
    const trait = this.trait;
    if (trait !== null) {
      trait.remove();
    }
    return trait;
  };

  TraitViewRef.prototype.deleteTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>): T | null {
    const trait = this.detachTrait();
    if (trait !== null) {
      trait.remove();
    }
    return trait;
  };

  Object.defineProperty(TraitViewRef.prototype, "parentModel", {
    get(this: TraitViewRef): Model | null {
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

  TraitViewRef.prototype.insertChildTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, model: Model, trait: T, target: Trait | null, key: string | undefined): void {
    model.insertTrait(trait, target, key);
  };

  TraitViewRef.prototype.bindModel = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, model: Model, targetModel: Model | null): void {
    if (this.bindsTrait && this.trait === null) {
      const newTrait = this.detectModel(model);
      if (newTrait !== null) {
        (this as Mutable<typeof this>).trait = newTrait;
        this.willAttachTrait(newTrait, null);
        this.onAttachTrait(newTrait, null);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, null);
      }
    }
  };

  TraitViewRef.prototype.unbindModel = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, model: Model): void {
    if (this.bindsTrait) {
      const oldTrait = this.detectModel(model);
      if (oldTrait !== null && this.trait === oldTrait) {
        (this as Mutable<typeof this>).trait = null;
        this.willDetachTrait(oldTrait);
        this.onDetachTrait(oldTrait);
        this.deinitTrait(oldTrait);
        this.didDetachTrait(oldTrait);
      }
    }
  };

  TraitViewRef.prototype.detectModel = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, model: Model): T | null {
    return null;
  };

  TraitViewRef.prototype.bindTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: Trait, target: Trait | null): void {
    if (this.bindsTrait && this.trait === null) {
      const newTrait = this.detectTrait(trait);
      if (newTrait !== null) {
        (this as Mutable<typeof this>).trait = newTrait;
        this.willAttachTrait(newTrait, target);
        this.onAttachTrait(newTrait, target);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, target);
      }
    }
  };

  TraitViewRef.prototype.unbindTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: Trait): void {
    if (this.bindsTrait) {
      const oldTrait = this.detectTrait(trait);
      if (oldTrait !== null && this.trait === oldTrait) {
        (this as Mutable<typeof this>).trait = null;
        this.willDetachTrait(oldTrait);
        this.onDetachTrait(oldTrait);
        this.deinitTrait(oldTrait);
        this.didDetachTrait(oldTrait);
      }
    }
  };

  TraitViewRef.prototype.detectTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: Trait): T | null {
    const key = this.traitKey;
    if (key !== void 0 && key === trait.key) {
      return trait as T;
    }
    return null;
  };

  TraitViewRef.prototype.createTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>): T {
    let trait: T | undefined;
    const type = this.traitType;
    if (type !== void 0) {
      trait = type.create();
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

  TraitViewRef.prototype.fromAnyTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, value: AnyTrait<T>): T {
    const type = this.traitType;
    if (type !== void 0) {
      return type.fromAny(value);
    } else {
      return Trait.fromAny(value) as T;
    }
  };

  TraitViewRef.prototype.getView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>): V {
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

  TraitViewRef.prototype.setView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, newView: AnyView<V> | null, target?: View | null, key?: string): V | null {
    if (newView !== null) {
      newView = this.fromAnyView(newView);
    }
    let oldView = this.view;
    if (oldView !== newView) {
      if (target === void 0) {
        target = null;
      }
      let parent: View | null;
      if (this.bindsView && (parent = this.parentView, parent !== null)) {
        if (oldView !== null && oldView.parent === parent) {
          if (target === null) {
            target = oldView.nextSibling;
          }
          oldView.remove();
        }
        if (newView !== null) {
          if (key === void 0) {
            key = this.viewKey;
          }
          this.insertChildView(parent, newView, target, key);
        }
        oldView = this.view;
      }
      if (oldView !== newView) {
        if (oldView !== null) {
          (this as Mutable<typeof this>).view = null;
          this.willDetachView(oldView);
          this.onDetachView(oldView);
          this.deinitView(oldView);
          this.didDetachView(oldView);
        }
        if (newView !== null) {
          (this as Mutable<typeof this>).view = newView;
          this.willAttachView(newView, target);
          this.onAttachView(newView, target);
          this.initView(newView);
          this.didAttachView(newView, target);
        }
      }
    }
    return oldView;
  };

  TraitViewRef.prototype.attachView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, newView?: AnyView<V>, target?: View | null): V {
    const oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAnyView(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (newView !== oldView) {
      if (target === void 0) {
        target = null;
      }
      if (oldView !== null) {
        (this as Mutable<typeof this>).view = null;
        this.willDetachView(oldView);
        this.onDetachView(oldView);
        this.deinitView(oldView);
        this.didDetachView(oldView);
      }
      (this as Mutable<typeof this>).view = newView;
      this.willAttachView(newView, target);
      this.onAttachView(newView, target);
      this.initView(newView);
      this.didAttachView(newView, target);
    }
    return newView;
  };

  TraitViewRef.prototype.detachView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>): V | null {
    const oldView = this.view;
    if (oldView !== null) {
      (this as Mutable<typeof this>).view = null;
      this.willDetachView(oldView);
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
    }
    return oldView;
  };

  TraitViewRef.prototype.initView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: V): void {
    // hook
  };

  TraitViewRef.prototype.willAttachView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: V, target: View | null): void {
    // hook
  };

  TraitViewRef.prototype.onAttachView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: V, target: View | null): void {
    if (this.observesView === true) {
      view.observe(this as ObserverType<V>);
    }
  };

  TraitViewRef.prototype.didAttachView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: V, target: View | null): void {
    // hook
  };

  TraitViewRef.prototype.deinitView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: V): void {
    // hook
  };

  TraitViewRef.prototype.willDetachView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: V): void {
    // hook
  };

  TraitViewRef.prototype.onDetachView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: V): void {
    if (this.observesView === true) {
      view.unobserve(this as ObserverType<V>);
    }
  };

  TraitViewRef.prototype.didDetachView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: V): void {
    // hook
  };

  TraitViewRef.prototype.insertView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, parent?: View | null, newView?: AnyView<V> | null, target?: View | null, key?: string): V {
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAnyView(newView);
    } else {
      const oldView = this.view;
      if (oldView === null) {
        newView = this.createView();
      } else {
        newView = oldView;
      }
    }
    if (parent === void 0 || parent === null) {
      parent = this.parentView;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.viewKey;
    }
    if (parent !== null && (newView.parent !== parent || newView.key !== key)) {
      this.insertChildView(parent, newView, target, key);
    }
    const oldView = this.view;
    if (newView !== oldView) {
      if (oldView !== null) {
        (this as Mutable<typeof this>).view = null;
        this.willDetachView(oldView);
        this.onDetachView(oldView);
        this.deinitView(oldView);
        this.didDetachView(oldView);
        oldView.remove();
      }
      (this as Mutable<typeof this>).view = newView;
      this.willAttachView(newView, target);
      this.onAttachView(newView, target);
      this.initView(newView);
      this.didAttachView(newView, target);
    }
    return newView;
  };

  TraitViewRef.prototype.removeView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>): V | null {
    const view = this.view;
    if (view !== null) {
      view.remove();
    }
    return view;
  };

  TraitViewRef.prototype.deleteView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>): V | null {
    const view = this.detachView();
    if (view !== null) {
      view.remove();
    }
    return view;
  };

  Object.defineProperty(TraitViewRef.prototype, "parentView", {
    get(this: TraitViewRef): View | null {
      const owner = this.owner;
      return owner instanceof View ? owner : null;
    },
    configurable: true,
  });

  TraitViewRef.prototype.insertChildView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, parent: View, child: V, target: View | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  };

  TraitViewRef.prototype.bindView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: View, target: View | null): void {
    if (this.bindsView && this.view === null) {
      const newView = this.detectView(view);
      if (newView !== null) {
        (this as Mutable<typeof this>).view = newView;
        this.willAttachView(newView, target);
        this.onAttachView(newView, target);
        this.initView(newView);
        this.didAttachView(newView, target);
      }
    }
  };

  TraitViewRef.prototype.unbindView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: View): void {
    if (this.bindsView) {
      const oldView = this.detectView(view);
      if (oldView !== null && this.view === oldView) {
        (this as Mutable<typeof this>).view = null;
        this.willDetachView(oldView);
        this.onDetachView(oldView);
        this.deinitView(oldView);
        this.didDetachView(oldView);
      }
    }
  };

  TraitViewRef.prototype.detectView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: View): V | null {
    const key = this.viewKey;
    if (key !== void 0 && key === view.key) {
      return view as V;
    }
    return null;
  };

  TraitViewRef.prototype.createView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>): V {
    let view: V | undefined;
    const type = this.viewType;
    if (type !== void 0) {
      view = type.create();
    }
    if (view === void 0 || view === null) {
      let message = "Unable to create ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "view";
      throw new Error(message);
    }
    return view;
  };

  TraitViewRef.prototype.fromAnyView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, value: AnyView<V>): V {
    const type = this.viewType;
    if (type !== void 0) {
      return type.fromAny(value);
    } else {
      return View.fromAny(value) as V;
    }
  };

  Object.defineProperty(TraitViewRef.prototype, "lazy", {
    get: function (this: TraitViewRef): boolean {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(TraitViewRef.prototype, "static", {
    get: function (this: TraitViewRef): string | boolean {
      return true;
    },
    configurable: true,
  });

  TraitViewRef.construct = function <F extends TraitViewRef<any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).trait = null;
    (fastener as Mutable<typeof fastener>).view = null;
    return fastener;
  };

  TraitViewRef.define = function <O, T extends Trait, V extends View>(className: string, descriptor: TraitViewRefDescriptor<O, T, V>): TraitViewRefFactory<TraitViewRef<any, T, V>> {
    let superClass = descriptor.extends as TraitViewRefFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;

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

    fastenerClass.construct = function (fastenerClass: {prototype: TraitViewRef<any, any, any>}, fastener: TraitViewRef<O, T, V> | null, owner: O): TraitViewRef<O, T, V> {
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

  return TraitViewRef;
})(Fastener);
