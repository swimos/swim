// Copyright 2015-2023 Nstream, inc.
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
import type {Observes} from "@swim/util";
import type {Consumer} from "@swim/util";
import type {Consumable} from "@swim/util";
import {Affinity} from "@swim/component";
import type {FastenerFlags} from "@swim/component";
import type {FastenerDescriptor} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import {Model} from "@swim/model";
import type {TraitFactory} from "@swim/model";
import {Trait} from "@swim/model";
import type {ViewFactory} from "@swim/view";
import {View} from "@swim/view";

/** @public */
export interface TraitViewRefDescriptor<R, T extends Trait, V extends View> extends FastenerDescriptor<R> {
  extends?: Proto<TraitViewRef<any, any, any>> | boolean | null;
  traitKey?: string | boolean;
  viewKey?: string | boolean;
}

/** @public */
export interface TraitViewRefClass<F extends TraitViewRef<any, any, any> = TraitViewRef<any, any, any>> extends FastenerClass<F> {
  /** @internal */
  readonly ConsumingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface TraitViewRef<R = any, T extends Trait = Trait, V extends View = View> extends Fastener<R>, Consumable {
  /** @override */
  get descriptorType(): Proto<TraitViewRefDescriptor<R, T, V>>;

  /** @override */
  get fastenerType(): Proto<TraitViewRef<any, any, any>>;

  get consumed(): boolean | undefined;

  get traitType(): TraitFactory<T> | null;

  get traitKey(): string | undefined;

  get bindsTrait(): boolean;

  get observesTrait(): boolean;

  readonly trait: T | null;

  getTrait(): T;

  setTrait(trait: T | LikeType<T> | null, target?: Trait | null, key?: string): T | null;

  attachTrait(trait?: T | LikeType<T>, target?: Trait | null): T;

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

  insertTrait(model?: Model | null, trait?: T | LikeType<T> | null, target?: Trait | null, key?: string): T;

  removeTrait(): T | null;

  deleteTrait(): T | null;

  get parentModel(): Model | null;

  /** @protected */
  insertChildTrait(model: Model, trait: T, target: Trait | null, key: string | undefined): void;

  /** @internal */
  bindModel(model: Model, targetModel: Model | null): void;

  /** @internal */
  unbindModel(model: Model): void;

  /** @override */
  detectModel(model: Model): T | null;

  /** @internal */
  bindTrait(trait: Trait, target: Trait | null): void;

  /** @internal */
  unbindTrait(trait: Trait): void;

  detectTrait(trait: Trait): T | null;

  createTrait(): T;

  /** @protected */
  fromTraitLike(value: T | LikeType<T>): T;

  get viewType(): ViewFactory<V> | null;

  get viewKey(): string | undefined;

  get bindsView(): boolean;

  get observesView(): boolean;

  readonly view: V | null;

  getView(): V;

  setView(view: V | LikeType<V> | null, target?: View | null, key?: string): V | null;

  attachView(view?: V | LikeType<V> | null, target?: View | null): V;

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

  insertView(parent?: View | null, view?: V | LikeType<V> | null, target?: View | null, key?: string): V;

  removeView(): V | null;

  deleteView(): V | null;

  get parentView(): View | null;

  /** @protected */
  insertChildView(parent: View, child: V, target: View | null, key: string | undefined): void;

  /** @internal */
  bindView(view: View, target: View | null): void;

  /** @internal */
  unbindView(view: View): void;

  detectView(view: View): V | null;

  createView(): V;

  /** @internal @protected */
  fromViewLike(value: V | LikeType<V>): V;

  /** @override */
  recohere(t: number): void;

  /** @internal */
  readonly consumers: ReadonlySet<Consumer> | null;

  /** @override */
  consume(consumer: Consumer): void

  /** @protected */
  willConsume(consumer: Consumer): void;

  /** @protected */
  onConsume(consumer: Consumer): void;

  /** @protected */
  didConsume(consumer: Consumer): void;

  /** @override */
  unconsume(consumer: Consumer): void

  /** @protected */
  willUnconsume(consumer: Consumer): void;

  /** @protected */
  onUnconsume(consumer: Consumer): void;

  /** @protected */
  didUnconsume(consumer: Consumer): void;

  get consuming(): boolean;

  /** @internal */
  startConsuming(): void;

  /** @protected */
  willStartConsuming(): void;

  /** @protected */
  onStartConsuming(): void;

  /** @protected */
  didStartConsuming(): void;

  /** @internal */
  stopConsuming(): void;

  /** @protected */
  willStopConsuming(): void;

  /** @protected */
  onStopConsuming(): void;

  /** @protected */
  didStopConsuming(): void;

  /** @protected @override */
  onMount(): void;

  /** @protected @override */
  onUnmount(): void;
}

/** @public */
export const TraitViewRef = (<R, T extends Trait, V extends View, F extends TraitViewRef<any, any, any>>() => Fastener.extend<TraitViewRef<R, T, V>, TraitViewRefClass<F>>("TraitViewRef", {
  get fastenerType(): Proto<TraitViewRef<any, any, any>> {
    return TraitViewRef;
  },

  consumed: false,

  traitType: null,

  traitKey: void 0,

  bindsTrait: false,

  observesTrait: false,

  getTrait(): T {
    const trait = this.trait;
    if (trait === null) {
      let message = trait + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "trait";
      throw new TypeError(message);
    }
    return trait;
  },

  setTrait(newTrait: T | LikeType<T> | null, target?: Trait | null, key?: string): T | null {
    let oldTrait = this.trait;
    if (newTrait !== null) {
      newTrait = this.fromTraitLike(newTrait);
    }
    if (oldTrait === newTrait) {
      return oldTrait;
    } else if (target === void 0) {
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
      if (oldTrait === newTrait) {
        return oldTrait;
      }
    }
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
    return oldTrait;
  },

  attachTrait(newTrait?: T | LikeType<T>, target?: Trait | null): T {
    const oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromTraitLike(newTrait);
    } else if (oldTrait === null) {
      newTrait = this.createTrait();
    } else {
      newTrait = oldTrait;
    }
    if (target === void 0) {
      target = null;
    }
    if (oldTrait === newTrait) {
      return newTrait;
    } else if (oldTrait !== null) {
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
    return newTrait;
  },

  detachTrait(): T | null {
    const oldTrait = this.trait;
    if (oldTrait === null) {
      return null;
    }
    (this as Mutable<typeof this>).trait = null;
    this.willDetachTrait(oldTrait);
    this.onDetachTrait(oldTrait);
    this.deinitTrait(oldTrait);
    this.didDetachTrait(oldTrait);
    return oldTrait;
  },

  initTrait(trait: T): void {
    // hook
  },

  willAttachTrait(trait: T, target: Trait | null): void {
    // hook
  },

  onAttachTrait(trait: T, target: Trait | null): void {
    if (this.observesTrait) {
      trait.observe(this as Observes<T>);
    }
    if ((this.flags & TraitViewRef.ConsumingFlag) !== 0) {
      trait.consume(this);
    }
  },

  didAttachTrait(trait: T, target: Trait | null): void {
    // hook
  },

  deinitTrait(trait: T): void {
    // hook
  },

  willDetachTrait(trait: T): void {
    // hook
  },

  onDetachTrait(trait: T): void {
    if ((this.flags & TraitViewRef.ConsumingFlag) !== 0) {
      trait.unconsume(this);
    }
    if (this.observesTrait) {
      trait.unobserve(this as Observes<T>);
    }
  },

  didDetachTrait(trait: T): void {
    // hook
  },

  insertTrait(model?: Model | null, newTrait?: T | LikeType<T> | null, target?: Trait | null, key?: string): T {
    let oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromTraitLike(newTrait);
    } else if (oldTrait === null) {
      newTrait = this.createTrait();
    } else {
      newTrait = oldTrait;
    }
    if (model === void 0) {
      model = null;
    }
    if (!this.bindsTrait && oldTrait === newTrait && newTrait.model !== null && model === null && key === void 0) {
      return newTrait;
    }
    if (model === null) {
      model = this.parentModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.traitKey;
    }
    if (model !== null && (newTrait.model !== model || newTrait.key !== key)) {
      this.insertChildTrait(model, newTrait, target, key);
    }
    oldTrait = this.trait;
    if (oldTrait === newTrait) {
      return newTrait;
    } else if (oldTrait !== null) {
      (this as Mutable<typeof this>).trait = null;
      this.willDetachTrait(oldTrait);
      this.onDetachTrait(oldTrait);
      this.deinitTrait(oldTrait);
      this.didDetachTrait(oldTrait);
      if (this.bindsTrait && model !== null && oldTrait.parent === model) {
        oldTrait.remove();
      }
    }
    (this as Mutable<typeof this>).trait = newTrait;
    this.willAttachTrait(newTrait, target);
    this.onAttachTrait(newTrait, target);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, target);
    return newTrait;
  },

  removeTrait(): T | null {
    const trait = this.trait;
    if (trait === null) {
      return null;
    }
    trait.remove();
    return trait;
  },

  deleteTrait(): T | null {
    const trait = this.detachTrait();
    if (trait === null) {
      return null;
    }
    trait.remove();
    return trait;
  },

  get parentModel(): Model | null {
    const owner = this.owner;
    if (owner instanceof Model) {
      return owner;
    } else if (owner instanceof Trait) {
      return owner.model;
    }
    return null;
  },

  insertChildTrait(model: Model, trait: T, target: Trait | null, key: string | undefined): void {
    model.insertTrait(trait, target, key);
  },

  bindModel(model: Model, targetModel: Model | null): void {
    if (!this.bindsTrait || this.trait !== null) {
      return;
    }
    const newTrait = this.detectModel(model);
    if (newTrait === null) {
      return;
    }
    (this as Mutable<typeof this>).trait = newTrait;
    this.willAttachTrait(newTrait, null);
    this.onAttachTrait(newTrait, null);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, null);
  },

  unbindModel(model: Model): void {
    if (!this.bindsTrait) {
      return;
    }
    const oldTrait = this.detectModel(model);
    if (oldTrait === null || this.trait !== oldTrait) {
      return;
    }
    (this as Mutable<typeof this>).trait = null;
    this.willDetachTrait(oldTrait);
    this.onDetachTrait(oldTrait);
    this.deinitTrait(oldTrait);
    this.didDetachTrait(oldTrait);
  },

  detectModel(model: Model): T | null {
    return null;
  },

  bindTrait(trait: Trait, target: Trait | null): void {
    if (!this.bindsTrait || this.trait !== null) {
      return;
    }
    const newTrait = this.detectTrait(trait);
    if (newTrait === null) {
      return;
    }
    (this as Mutable<typeof this>).trait = newTrait;
    this.willAttachTrait(newTrait, target);
    this.onAttachTrait(newTrait, target);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, target);
  },

  unbindTrait(trait: Trait): void {
    if (!this.bindsTrait) {
      return;
    }
    const oldTrait = this.detectTrait(trait);
    if (oldTrait === null || this.trait !== oldTrait) {
      return;
    }
    (this as Mutable<typeof this>).trait = null;
    this.willDetachTrait(oldTrait);
    this.onDetachTrait(oldTrait);
    this.deinitTrait(oldTrait);
    this.didDetachTrait(oldTrait);
  },

  detectTrait(trait: Trait): T | null {
    const key = this.traitKey;
    if (key !== void 0 && key === trait.key) {
      return trait as T;
    }
    return null;
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

  viewType: null,

  viewKey: void 0,

  bindsView: false,

  observesView: false,

  getView(): V {
    const view = this.view;
    if (view === null) {
      let message = view + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "view";
      throw new TypeError(message);
    }
    return view;
  },

  setView(newView: V | LikeType<V> | null, target?: View | null, key?: string): V | null {
    if (newView !== null) {
      newView = this.fromViewLike(newView);
    }
    let oldView = this.view;
    if (oldView === newView) {
      return oldView;
    } else if (target === void 0) {
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
      if (oldView === newView) {
        return oldView;
      }
    }
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
    return oldView;
  },

  attachView(newView?: V | LikeType<V> | null, target?: View | null): V {
    const oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromViewLike(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (target === void 0) {
      target = null;
    }
    if (oldView === newView) {
      return newView;
    } else if (oldView !== null) {
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
    return newView;
  },

  detachView(): V | null {
    const oldView = this.view;
    if (oldView === null) {
      return null;
    }
    (this as Mutable<typeof this>).view = null;
    this.willDetachView(oldView);
    this.onDetachView(oldView);
    this.deinitView(oldView);
    this.didDetachView(oldView);
    return oldView;
  },

  initView(view: V): void {
    // hook
  },

  willAttachView(view: V, target: View | null): void {
    // hook
  },

  onAttachView(view: V, target: View | null): void {
    if (this.observesView) {
      view.observe(this as Observes<V>);
    }
  },

  didAttachView(view: V, target: View | null): void {
    // hook
  },

  deinitView(view: V): void {
    // hook
  },

  willDetachView(view: V): void {
    // hook
  },

  onDetachView(view: V): void {
    if (this.observesView) {
      view.unobserve(this as Observes<V>);
    }
  },

  didDetachView(view: V): void {
    // hook
  },

  insertView(parent?: View | null, newView?: V | LikeType<V> | null, target?: View | null, key?: string): V {
    let oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromViewLike(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (parent === void 0) {
      parent = null;
    }
    if (!this.bindsView && oldView === newView && newView.parent !== null && parent === null && key === void 0) {
      return newView;
    }
    if (parent === null) {
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
    oldView = this.view;
    if (oldView === newView) {
      return newView;
    } else if (oldView !== null) {
      (this as Mutable<typeof this>).view = null;
      this.willDetachView(oldView);
      this.onDetachView(oldView);
      this.deinitView(oldView);
      this.didDetachView(oldView);
      if (this.bindsView && parent !== null && oldView.parent === parent) {
        oldView.remove();
      }
    }
    (this as Mutable<typeof this>).view = newView;
    this.willAttachView(newView, target);
    this.onAttachView(newView, target);
    this.initView(newView);
    this.didAttachView(newView, target);
    return newView;
  },

  removeView(): V | null {
    const view = this.view;
    if (view === null) {
      return null;
    }
    view.remove();
    return view;
  },

  deleteView(): V | null {
    const view = this.detachView();
    if (view === null) {
      return null;
    }
    view.remove();
    return view;
  },

  get parentView(): View | null {
    const owner = this.owner;
    return owner instanceof View ? owner : null;
  },

  insertChildView(parent: View, child: V, target: View | null, key: string | undefined): void {
    parent.insertChild(child, target, key);
  },

  bindView(view: View, target: View | null): void {
    if (!this.bindsView || this.view !== null) {
      return;
    }
    const newView = this.detectView(view);
    if (newView === null) {
      return;
    }
    (this as Mutable<typeof this>).view = newView;
    this.willAttachView(newView, target);
    this.onAttachView(newView, target);
    this.initView(newView);
    this.didAttachView(newView, target);
  },

  unbindView(view: View): void {
    if (!this.bindsView) {
      return;
    }
    const oldView = this.detectView(view);
    if (oldView === null || this.view !== oldView) {
      return;
    }
    (this as Mutable<typeof this>).view = null;
    this.willDetachView(oldView);
    this.onDetachView(oldView);
    this.deinitView(oldView);
    this.didDetachView(oldView);
  },

  detectView(view: View): V | null {
    const key = this.viewKey;
    if (key !== void 0 && key === view.key) {
      return view as V;
    }
    return null;
  },

  createView(): V {
    let view: V | undefined;
    const viewType = this.viewType;
    if (viewType !== null) {
      view = viewType.create();
    }
    if (view === void 0 || view === null) {
      let message = "unable to create ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "view";
      throw new Error(message);
    }
    return view;
  },

  fromViewLike(value: V | LikeType<V>): V {
    const viewType = this.viewType;
    if (viewType !== null) {
      return viewType.fromLike(value);
    }
    return View.fromLike(value) as V;
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof TraitViewRef) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setTrait(inlet.trait);
        this.setView(inlet.view);
        this.setCoherent(true);
      }
    } else {
      this.setDerived(false);
    }
  },

  consume(consumer: Consumer): void {
    let consumers = this.consumers as Set<Consumer> | null;
    if (consumers === null) {
      consumers = new Set<Consumer>();
      (this as Mutable<typeof this>).consumers = consumers;
    } else if (consumers.has(consumer)) {
      return;
    }
    this.willConsume(consumer);
    consumers.add(consumer);
    this.onConsume(consumer);
    this.didConsume(consumer);
    if (consumers.size === 1 && this.mounted) {
      this.startConsuming();
    }
  },

  willConsume(consumer: Consumer): void {
    // hook
  },

  onConsume(consumer: Consumer): void {
    // hook
  },

  didConsume(consumer: Consumer): void {
    // hook
  },

  unconsume(consumer: Consumer): void {
    const consumers = this.consumers as Set<Consumer> | null;
    if (consumers === null || !consumers.has(consumer)) {
      return;
    }
    this.willUnconsume(consumer);
    consumers.delete(consumer);
    this.onUnconsume(consumer);
    this.didUnconsume(consumer);
    if (consumers.size === 0) {
      this.stopConsuming();
    }
  },

  willUnconsume(consumer: Consumer): void {
    // hook
  },

  onUnconsume(consumer: Consumer): void {
    // hook
  },

  didUnconsume(consumer: Consumer): void {
    // hook
  },

  get consuming(): boolean {
    return (this.flags & TraitViewRef.ConsumingFlag) !== 0;
  },

  startConsuming(): void {
    if ((this.flags & TraitViewRef.ConsumingFlag) !== 0) {
      return;
    }
    this.willStartConsuming();
    this.setFlags(this.flags | TraitViewRef.ConsumingFlag);
    this.onStartConsuming();
    this.didStartConsuming();
  },

  willStartConsuming(): void {
    // hook
  },

  onStartConsuming(): void {
    const trait = this.trait;
    if (trait !== null) {
      trait.consume(this);
    }
  },

  didStartConsuming(): void {
    // hook
  },

  stopConsuming(): void {
    if ((this.flags & TraitViewRef.ConsumingFlag) === 0) {
      return;
    }
    this.willStopConsuming();
    this.setFlags(this.flags & ~TraitViewRef.ConsumingFlag);
    this.onStopConsuming();
    this.didStopConsuming();
  },

  willStopConsuming(): void {
    // hook
  },

  onStopConsuming(): void {
    const trait = this.trait;
    if (trait !== null) {
      trait.unconsume(this);
    }
  },

  didStopConsuming(): void {
    // hook
  },

  onMount(): void {
    super.onMount();
    if (this.consumers !== null && this.consumers.size !== 0) {
      this.startConsuming();
    }
  },

  onUnmount(): void {
    super.onUnmount();
    this.stopConsuming();
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).consumers = null;
    (fastener as Mutable<typeof fastener>).trait = null;
    (fastener as Mutable<typeof fastener>).view = null;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<TraitViewRef<any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    const traitKeyDescriptor = Object.getOwnPropertyDescriptor(fastenerPrototype, "traitKey");
    if (traitKeyDescriptor !== void 0 && "value" in traitKeyDescriptor) {
      if (traitKeyDescriptor.value === true) {
        traitKeyDescriptor.value = fastenerClass.name;
        Object.defineProperty(fastenerPrototype, "traitKey", traitKeyDescriptor);
      } else if (traitKeyDescriptor.value === false) {
        traitKeyDescriptor.value = void 0;
        Object.defineProperty(fastenerPrototype, "traitKey", traitKeyDescriptor);
      }
    }

    const viewKeyDescriptor = Object.getOwnPropertyDescriptor(fastenerPrototype, "viewKey");
    if (viewKeyDescriptor !== void 0 && "value" in viewKeyDescriptor) {
      if (viewKeyDescriptor.value === true) {
        viewKeyDescriptor.value = fastenerClass.name;
        Object.defineProperty(fastenerPrototype, "viewKey", viewKeyDescriptor);
      } else if (viewKeyDescriptor.value === false) {
        viewKeyDescriptor.value = void 0;
        Object.defineProperty(fastenerPrototype, "viewKey", viewKeyDescriptor);
      }
    }
  },

  ConsumingFlag: 1 << (Fastener.FlagShift + 0),

  FlagShift: Fastener.FlagShift + 1,
  FlagMask: (1 << (Fastener.FlagShift + 1)) - 1,
}))();
