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

import {Mutable, Proto, Arrays, Observes, Consumer, Consumable} from "@swim/util";
import {FastenerFlags, FastenerOwner, FastenerDescriptor, FastenerClass, Fastener} from "@swim/component";
import {Model, AnyTrait, TraitFactory, Trait} from "@swim/model";
import {AnyView, ViewFactory, View} from "@swim/view";

/** @public */
export type TraitViewRefTrait<F extends TraitViewRef<any, any, any>> =
  F extends {traitType?: TraitFactory<infer T>} ? T : never;

/** @public */
export type TraitViewRefView<F extends TraitViewRef<any, any, any>> =
  F extends {viewType?: ViewFactory<infer V>} ? V : never;

/** @public */
export interface TraitViewRefDescriptor<T extends Trait = Trait, V extends View = View> extends FastenerDescriptor {
  extends?: Proto<TraitViewRef<any, any, any>> | string | boolean | null;
  consumed?: boolean;

  traitKey?: string | boolean;
  traitType?: TraitFactory<T>;
  bindsTrait?: boolean;
  observesTrait?: boolean;

  viewKey?: string | boolean;
  viewType?: ViewFactory<V>;
  bindsView?: boolean;
  observesView?: boolean;
}

/** @public */
export type TraitViewRefTemplate<F extends TraitViewRef<any, any, any>> =
  ThisType<F> &
  TraitViewRefDescriptor<TraitViewRefTrait<F>, TraitViewRefView<F>> &
  Partial<Omit<F, keyof TraitViewRefDescriptor>>;

/** @public */
export interface TraitViewRefClass<F extends TraitViewRef<any, any, any> = TraitViewRef<any, any, any>> extends FastenerClass<F> {
  /** @override */
  specialize(template: TraitViewRefDescriptor<any>): TraitViewRefClass<F>;

  /** @override */
  refine(fastenerClass: TraitViewRefClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: TraitViewRefTemplate<F2>): TraitViewRefClass<F2>;
  extend<F2 extends F>(className: string, template: TraitViewRefTemplate<F2>): TraitViewRefClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: TraitViewRefTemplate<F2>): TraitViewRefClass<F2>;
  define<F2 extends F>(className: string, template: TraitViewRefTemplate<F2>): TraitViewRefClass<F2>;

  /** @override */
  <F2 extends F>(template: TraitViewRefTemplate<F2>): PropertyDecorator;

  /** @internal */
  readonly ConsumingFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface TraitViewRef<O = unknown, T extends Trait = Trait, V extends View = View> extends Fastener<O>, Consumable {
  /** @override */
  get fastenerType(): Proto<TraitViewRef<any, any, any>>;

  /** @protected */
  readonly consumed?: boolean; // optional prototype property

  /** @protected @override */
  onDerive(inlet: Fastener): void;

  /** @internal */
  readonly traitType?: TraitFactory<T>; // optional prototype property

  /** @internal */
  readonly traitKey?: string; // optional prototype property

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

  /** @internal */
  readonly bindsTrait?: boolean; // optional prototype property

  /** @internal */
  readonly observesTrait?: boolean; // optional prototype property

  /** @internal @protected */
  fromAnyTrait(value: AnyTrait<T>): T;

  /** @internal */
  readonly viewType?: ViewFactory<V>; // optional prototype property

  /** @internal */
  readonly viewKey?: string; // optional prototype property

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

  /** @internal */
  readonly bindsView?: boolean; // optional prototype property

  /** @internal */
  readonly observesView?: boolean; // optional prototype property

  /** @internal @protected */
  fromAnyView(value: AnyView<V>): V;

  /** @internal */
  readonly consumers: ReadonlyArray<Consumer>;

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
export const TraitViewRef = (function (_super: typeof Fastener) {
  const TraitViewRef = _super.extend("TraitViewRef", {
    lazy: false,
    static: true,
  }) as TraitViewRefClass;

  Object.defineProperty(TraitViewRef.prototype, "fastenerType", {
    value: TraitViewRef,
    configurable: true,
  });

  TraitViewRef.prototype.onDerive = function (this: TraitViewRef, inlet: TraitViewRef): void {
    this.setTrait(inlet.trait);
    this.setView(inlet.view);
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
    let oldTrait = this.trait;
    if (newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    }
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
    if (oldTrait !== newTrait) {
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
      trait.observe(this as Observes<T>);
    }
    if ((this.flags & TraitViewRef.ConsumingFlag) !== 0) {
      trait.consume(this);
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
    if ((this.flags & TraitViewRef.ConsumingFlag) !== 0) {
      trait.unconsume(this);
    }
    if (this.observesTrait === true) {
      trait.unobserve(this as Observes<T>);
    }
  };

  TraitViewRef.prototype.didDetachTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, trait: T): void {
    // hook
  };

  TraitViewRef.prototype.insertTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, model?: Model | null, newTrait?: AnyTrait<T> | null, target?: Trait | null, key?: string): T {
    let oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    } else if (oldTrait === null) {
      newTrait = this.createTrait();
    } else {
      newTrait = oldTrait;
    }
    if (model === void 0) {
      model = null;
    }
    if (this.bindsTrait || oldTrait !== newTrait || newTrait.model === null || model !== null || key !== void 0) {
      if (model === null) {
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
      oldTrait = this.trait;
      if (oldTrait !== newTrait) {
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

  TraitViewRef.prototype.fromAnyTrait = function <T extends Trait>(this: TraitViewRef<unknown, T, View>, value: AnyTrait<T>): T {
    const traitType = this.traitType;
    if (traitType !== void 0) {
      return traitType.fromAny(value);
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
    let oldView = this.view;
    if (newView !== null) {
      newView = this.fromAnyView(newView);
    }
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
    if (oldView !== newView) {
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
      view.observe(this as Observes<V>);
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
      view.unobserve(this as Observes<V>);
    }
  };

  TraitViewRef.prototype.didDetachView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, view: V): void {
    // hook
  };

  TraitViewRef.prototype.insertView = function <V extends View>(this: TraitViewRef<unknown, Trait, V>, parent?: View | null, newView?: AnyView<V> | null, target?: View | null, key?: string): V {
    let oldView = this.view;
    if (newView !== void 0 && newView !== null) {
      newView = this.fromAnyView(newView);
    } else if (oldView === null) {
      newView = this.createView();
    } else {
      newView = oldView;
    }
    if (parent === void 0) {
      parent = null;
    }
    if (this.bindsView || oldView !== newView || newView.parent === null || parent !== null || key !== void 0) {
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
      if (oldView !== newView) {
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
    const viewType = this.viewType;
    if (viewType !== void 0) {
      view = viewType.create();
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
    const viewType = this.viewType;
    if (viewType !== void 0) {
      return viewType.fromAny(value);
    } else {
      return View.fromAny(value) as V;
    }
  };

  TraitViewRef.prototype.consume = function (this: TraitViewRef, consumer: Consumer): void {
    const oldConsumers = this.consumers;
    const newConsumerrss = Arrays.inserted(consumer, oldConsumers);
    if (oldConsumers !== newConsumerrss) {
      this.willConsume(consumer);
      (this as Mutable<typeof this>).consumers = newConsumerrss;
      this.onConsume(consumer);
      this.didConsume(consumer);
      if (oldConsumers.length === 0 && (this.flags & TraitViewRef.MountedFlag) !== 0) {
        this.startConsuming();
      }
    }
  };

  TraitViewRef.prototype.willConsume = function (this: TraitViewRef, consumer: Consumer): void {
    // hook
  };

  TraitViewRef.prototype.onConsume = function (this: TraitViewRef, consumer: Consumer): void {
    // hook
  };

  TraitViewRef.prototype.didConsume = function (this: TraitViewRef, consumer: Consumer): void {
    // hook
  };

  TraitViewRef.prototype.unconsume = function (this: TraitViewRef, consumer: Consumer): void {
    const oldConsumers = this.consumers;
    const newConsumerrss = Arrays.removed(consumer, oldConsumers);
    if (oldConsumers !== newConsumerrss) {
      this.willUnconsume(consumer);
      (this as Mutable<typeof this>).consumers = newConsumerrss;
      this.onUnconsume(consumer);
      this.didUnconsume(consumer);
      if (newConsumerrss.length === 0) {
        this.stopConsuming();
      }
    }
  };

  TraitViewRef.prototype.willUnconsume = function (this: TraitViewRef, consumer: Consumer): void {
    // hook
  };

  TraitViewRef.prototype.onUnconsume = function (this: TraitViewRef, consumer: Consumer): void {
    // hook
  };

  TraitViewRef.prototype.didUnconsume = function (this: TraitViewRef, consumer: Consumer): void {
    // hook
  };

  Object.defineProperty(TraitViewRef.prototype, "consuming", {
    get(this: TraitViewRef): boolean {
      return (this.flags & TraitViewRef.ConsumingFlag) !== 0;
    },
    configurable: true,
  })

  TraitViewRef.prototype.startConsuming = function (this: TraitViewRef): void {
    if ((this.flags & TraitViewRef.ConsumingFlag) === 0) {
      this.willStartConsuming();
      this.setFlags(this.flags | TraitViewRef.ConsumingFlag);
      this.onStartConsuming();
      this.didStartConsuming();
    }
  };

  TraitViewRef.prototype.willStartConsuming = function (this: TraitViewRef): void {
    // hook
  };

  TraitViewRef.prototype.onStartConsuming = function (this: TraitViewRef): void {
    const trait = this.trait;
    if (trait !== null) {
      trait.consume(this);
    }
  };

  TraitViewRef.prototype.didStartConsuming = function (this: TraitViewRef): void {
    // hook
  };

  TraitViewRef.prototype.stopConsuming = function (this: TraitViewRef): void {
    if ((this.flags & TraitViewRef.ConsumingFlag) !== 0) {
      this.willStopConsuming();
      this.setFlags(this.flags & ~TraitViewRef.ConsumingFlag);
      this.onStopConsuming();
      this.didStopConsuming();
    }
  };

  TraitViewRef.prototype.willStopConsuming = function (this: TraitViewRef): void {
    // hook
  };

  TraitViewRef.prototype.onStopConsuming = function (this: TraitViewRef): void {
    const trait = this.trait;
    if (trait !== null) {
      trait.unconsume(this);
    }
  };

  TraitViewRef.prototype.didStopConsuming = function (this: TraitViewRef): void {
    // hook
  };

  TraitViewRef.prototype.onMount = function (this: TraitViewRef): void {
    _super.prototype.onMount.call(this);
    if (this.consumers.length !== 0) {
      this.startConsuming();
    }
  };

  TraitViewRef.prototype.onUnmount = function (this: TraitViewRef): void {
    _super.prototype.onUnmount.call(this);
    this.stopConsuming();
  };

  TraitViewRef.construct = function <F extends TraitViewRef<any, any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).consumers = Arrays.empty;
    (fastener as Mutable<typeof fastener>).trait = null;
    (fastener as Mutable<typeof fastener>).view = null;
    return fastener;
  };

  TraitViewRef.refine = function (fastenerClass: TraitViewRefClass<any>): void {
    _super.refine.call(this, fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "traitKey")) {
      const traitKey = fastenerPrototype.traitKey as string | boolean | undefined;
      if (traitKey === true) {
        Object.defineProperty(fastenerPrototype, "traitKey", {
          value: fastenerClass.name,
          enumerable: true,
          configurable: true,
        });
      } else if (traitKey === false) {
        Object.defineProperty(fastenerPrototype, "traitKey", {
          value: void 0,
          enumerable: true,
          configurable: true,
        });
      }
    }

    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "viewKey")) {
      const viewKey = fastenerPrototype.viewKey as string | boolean | undefined;
      if (viewKey === true) {
        Object.defineProperty(fastenerPrototype, "traitKey", {
          value: fastenerClass.name,
          enumerable: true,
          configurable: true,
        });
      } else if (viewKey === false) {
        Object.defineProperty(fastenerPrototype, "viewKey", {
          value: void 0,
          enumerable: true,
          configurable: true,
        });
      }
    }
  };

  (TraitViewRef as Mutable<typeof TraitViewRef>).ConsumingFlag = 1 << (_super.FlagShift + 0);

  (TraitViewRef as Mutable<typeof TraitViewRef>).FlagShift = _super.FlagShift + 1;
  (TraitViewRef as Mutable<typeof TraitViewRef>).FlagMask = (1 << TraitViewRef.FlagShift) - 1;

  return TraitViewRef;
})(Fastener);
