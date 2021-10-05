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

import {
  Mutable,
  Class,
  Arrays,
  Creatable,
  InitType,
  Initable,
  ObserverType,
  Observable,
  ConsumerType,
  Consumable,
  Consumer,
} from "@swim/util";
import {FastenerContext, Fastener, Property, Provider} from "@swim/fastener";
import {WarpRef, WarpService, WarpProvider, DownlinkFastener} from "@swim/client";
import {ModelContextType, ModelFlags, AnyModel, Model} from "../model/Model";
import {ModelFastener} from "../model/ModelFastener";
import type {TraitObserver} from "./TraitObserver";
import {TraitFastener} from "./"; // forward import

export type TraitModelType<R extends Trait> = R extends {readonly model: infer M | null} ? M : never;

export type TraitContextType<R extends Trait> = ModelContextType<TraitModelType<R>>;

export type TraitFlags = number;

export type AnyTrait<R extends Trait = Trait> = R | TraitFactory<R> | InitType<R>;

export interface TraitInit {
  type?: Creatable<Trait>;
  key?: string;
  traits?: AnyTrait[];
}

export interface AnyTraitFactory<R extends Trait = Trait, U = never> {
  create?(): R;

  fromAny?(value: R | U): R;
}

export interface TraitFactory<R extends Trait = Trait> extends Creatable<R> {
  fromInit(init: InitType<R>): R;
}

export interface TraitClass<R extends Trait = Trait> extends Function, TraitFactory<R> {
  readonly prototype: R;
}

export interface TraitConstructor<R extends Trait = Trait> extends TraitClass<R> {
  new(): R;
}

export abstract class Trait implements Initable<TraitInit>, Observable, Consumable, FastenerContext {
  constructor() {
    this.key = void 0;
    this.flags = 0;
    this.fasteners = null;
    this.decoherent = null;
    this.observers = Arrays.empty;
    this.consumers = Arrays.empty;
    this.model = null;
  }

  readonly observerType?: Class<TraitObserver>;

  /** @override */
  readonly consumerType?: Class<Consumer>;

  readonly key: string | undefined;

  /** @internal */
  setKey(key: string | undefined): void {
    (this as Mutable<this>).key = key;
  }

  /** @internal */
  readonly flags: TraitFlags;

  setFlags(flags: TraitFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  readonly model: Model | null;

  /** @internal */
  setModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    this.willSetModel(newModel, oldModel);
    if (oldModel !== null) {
      this.detachModel(oldModel);
    }
    (this as Mutable<this>).model = newModel;
    this.onSetModel(newModel, oldModel);
    if (newModel !== null) {
      this.attachModel(newModel);
    }
    this.didSetModel(newModel, oldModel);
  }

  protected attachModel(model: TraitModelType<this>): void {
    if (model.mounted) {
      this.mountTrait();
    }
  }

  protected detachModel(model: TraitModelType<this>): void {
    if (this.mounted) {
      this.unmountTrait();
    }
  }

  protected willSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillSetModel !== void 0) {
        observer.traitWillSetModel(newModel, oldModel, this);
      }
    }
  }

  protected onSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    // hook
  }

  protected didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidSetModel !== void 0) {
        observer.traitDidSetModel(newModel, oldModel, this);
      }
    }
  }

  get modelFlags(): ModelFlags {
    const model = this.model;
    return model !== null ? model.flags : 0;
  }

  setModelFlags(modelFlags: ModelFlags): void {
    const model = this.model;
    if (model !== null) {
      model.setFlags(modelFlags);
    } else {
      throw new Error("no model");
    }
  }

  remove(): void {
    const model = this.model;
    if (model !== null) {
      model.removeTrait(this);
    }
  }

  get parent(): Model | null {
    const model = this.model;
    return model !== null ? model.parent : null;
  }

  /** @protected */
  attachParent(parent: Model): void {
    // hook
  }

  /** @protected */
  detachParent(parent: Model): void {
    // hook
  }

  /** @protected */
  willSetParent(newParent: Model | null, oldParent: Model | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillSetParent !== void 0) {
        observer.traitWillSetParent(newParent, oldParent, this);
      }
    }
  }

  /** @protected */
  onSetParent(newParent: Model | null, oldParent: Model | null): void {
    // hook
  }

  /** @protected */
  didSetParent(newParent: Model | null, oldParent: Model | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidSetParent !== void 0) {
        observer.traitDidSetParent(newParent, oldParent, this);
      }
    }
  }

  get childCount(): number {
    const model = this.model;
    return model !== null ? model.childCount : 0;
  }

  get children(): ReadonlyArray<Model> {
    const model = this.model;
    return model !== null ? model.children : [];
  }

  firstChild(): Model | null {
    const model = this.model;
    return model !== null ? model.firstChild() : null;
  }

  lastChild(): Model | null {
    const model = this.model;
    return model !== null ? model.lastChild() : null;
  }

  nextChild(target: Model): Model | null {
    const model = this.model;
    return model !== null ? model.nextChild(target) : null;
  }

  previousChild(target: Model): Model | null {
    const model = this.model;
    return model !== null ? model.previousChild(target) : null;
  }

  forEachChild<T>(callback: (child: Model) => T | void): T | undefined;
  forEachChild<T, S>(callback: (this: S, child: Model) => T | void, thisArg: S): T | undefined;
  forEachChild<T, S>(callback: (this: S | undefined, child: Model) => T | void, thisArg?: S): T | undefined {
    const model = this.model;
    return model !== null ? model.forEachChild(callback, thisArg) : void 0;
  }

  getChild<M extends Model>(key: string, childBound: Class<M>): M | null;
  getChild(key: string, childBound?: Class<Model>): Model | null;
  getChild(key: string, childBound?: Class<Model>): Model | null {
    const model = this.model;
    return model !== null ? model.getChild(key, childBound) : null;
  }

  setChild<M extends Model>(key: string, newChild: AnyModel<M> | null): Model | null;
  setChild(key: string, newChild: AnyModel | null): Model | null;
  setChild(key: string, newChild: AnyModel | null): Model | null {
    const model = this.model;
    if (model !== null) {
      return model.setChild(key, newChild);
    } else {
      throw new Error("no model");
    }
  }

  appendChild<M extends Model>(child: AnyModel<M>, key?: string): M;
  appendChild(child: AnyModel, key?: string): Model;
  appendChild(child: AnyModel, key?: string): Model {
    const model = this.model;
    if (model !== null) {
      return model.appendChild(child, key);
    } else {
      throw new Error("no model");
    }
  }

  prependChild<M extends Model>(child: AnyModel<M>, key?: string): M;
  prependChild(child: AnyModel, key?: string): Model;
  prependChild(child: AnyModel, key?: string): Model {
    const model = this.model;
    if (model !== null) {
      return model.prependChild(child, key);
    } else {
      throw new Error("no model");
    }
  }

  insertChild<M extends Model>(child: AnyModel<M>, target: Model | null, key?: string): M;
  insertChild(child: AnyModel, target: Model | null, key?: string): Model;
  insertChild(child: AnyModel, target: Model | null, key?: string): Model {
    const model = this.model;
    if (model !== null) {
      return model.insertChild(child, target, key);
    } else {
      throw new Error("no model");
    }
  }

  get insertChildFlags(): ModelFlags {
    return (this.constructor as typeof Trait).InsertChildFlags;
  }

  /** @protected */
  willInsertChild(child: Model, target: Model | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillInsertChild !== void 0) {
        observer.traitWillInsertChild(child, target, this);
      }
    }
  }

  /** @protected */
  onInsertChild(child: Model, target: Model | null): void {
    this.requireUpdate(this.insertChildFlags);
    this.attachChildFasteners(child, target);
  }

  /** @protected */
  didInsertChild(child: Model, target: Model | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidInsertChild !== void 0) {
        observer.traitDidInsertChild(child, target, this);
      }
    }
  }

  removeChild(key: string): Model | null;
  removeChild(child: Model): void;
  removeChild(key: string | Model): Model | null | void {
    const model = this.model;
    if (typeof key === "string") {
      return model !== null ? model.removeChild(key) : null;
    } else if (model !== null) {
      model.removeChild(key);
    }
  }

  get removeChildFlags(): ModelFlags {
    return (this.constructor as typeof Trait).RemoveChildFlags;
  }

  /** @protected */
  willRemoveChild(child: Model): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillRemoveChild !== void 0) {
        observer.traitWillRemoveChild(child, this);
      }
    }
    this.requireUpdate(this.removeChildFlags);
  }

  /** @protected */
  onRemoveChild(child: Model): void {
    this.detachChildFastenerss(child);
  }

  /** @protected */
  didRemoveChild(child: Model): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidRemoveChild !== void 0) {
        observer.traitDidRemoveChild(child, this);
      }
    }
  }

  getSuper<M extends Model>(superBound: Class<M>): M | null {
    const model = this.model;
    return model !== null ? model.getSuper(superBound) : null;
  }

  getBase<M extends Model>(baseBound: Class<M>): M | null {
    const model = this.model;
    return model !== null ? model.getBase(baseBound) : null;
  }

  get traitCount(): number {
    const model = this.model;
    return model !== null ? model.traitCount : 0;
  }

  get traits(): ReadonlyArray<Trait> {
    const model = this.model;
    return model !== null ? model.traits : [];
  }

  firstTrait(): Trait | null {
    const model = this.model;
    return model !== null ? model.firstTrait() : null;
  }

  lastTrait(): Trait | null {
    const model = this.model;
    return model !== null ? model.lastTrait() : null;
  }

  nextTrait(target: Trait): Trait | null {
    const model = this.model;
    return model !== null ? model.nextTrait(target) : null;
  }

  previousTrait(target: Trait): Trait | null {
    const model = this.model;
    return model !== null ? model.previousTrait(target) : null;
  }

  forEachTrait<T>(callback: (trait: Trait) => T | void): T | undefined;
  forEachTrait<T, S>(callback: (this: S, trait: Trait) => T | void, thisArg: S): T | undefined;
  forEachTrait<T, S>(callback: (this: S | undefined, trait: Trait) => T | void, thisArg?: S): T | undefined {
    const model = this.model;
    return model !== null ? model.forEachTrait(callback, thisArg) : void 0;
  }

  getTrait<R extends Trait>(key: string, traitBound: Class<R>): R | null;
  getTrait(key: string, traitBound?: Class<Trait>): Trait | null;
  getTrait<R extends Trait>(traitBound: Class<R>): R | null;
  getTrait(key: string | Class<Trait>, traitBound?: Class<Trait>): Trait | null {
    const model = this.model;
    return model !== null ? model.getTrait(key as string, traitBound) : null;
  }

  setTrait<R extends Trait>(key: string, newTrait: AnyTrait<R> | null): Trait | null;
  setTrait(key: string, newTrait: AnyTrait | null): Trait | null;
  setTrait(key: string, newTrait: AnyTrait | null): Trait | null {
    const model = this.model;
    if (model !== null) {
      return model.setTrait(key, newTrait);
    } else {
      throw new Error("no model");
    }
  }

  appendTrait<R extends Trait>(trait: AnyTrait<R>, key?: string): R;
  appendTrait(trait: AnyTrait, key?: string): Trait;
  appendTrait(trait: AnyTrait, key?: string): Trait {
    const model = this.model;
    if (model !== null) {
      return model.appendTrait(trait, key);
    } else {
      throw new Error("no model");
    }
  }

  prependTrait<R extends Trait>(trait: AnyTrait<R>, key?: string): R;
  prependTrait(trait: AnyTrait, key?: string): Trait;
  prependTrait(trait: AnyTrait, key?: string): Trait {
    const model = this.model;
    if (model !== null) {
      return model.prependTrait(trait, key);
    } else {
      throw new Error("no model");
    }
  }

  insertTrait<R extends Trait>(trait: AnyTrait<R>, target: Trait | null, key?: string): R;
  insertTrait(trait: AnyTrait, target: Trait | null, key?: string): Trait;
  insertTrait(trait: AnyTrait, target: Trait | null, key?: string): Trait {
    const model = this.model;
    if (model !== null) {
      return model.insertTrait(trait, target, key);
    } else {
      throw new Error("no model");
    }
  }

  get insertTraitFlags(): ModelFlags {
    return (this.constructor as typeof Trait).InsertTraitFlags;
  }

  /** @protected */
  willInsertTrait(trait: Trait, target: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillInsertTrait !== void 0) {
        observer.traitWillInsertTrait(trait, target, this);
      }
    }
  }

  /** @protected */
  onInsertTrait(trait: Trait, target: Trait | null): void {
    this.requireUpdate(this.insertTraitFlags);
    this.attachTraitFasteners(trait, target);
  }

  /** @protected */
  didInsertTrait(trait: Trait, target: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidInsertTrait !== void 0) {
        observer.traitDidInsertTrait(trait, target, this);
      }
    }
  }

  removeTrait(key: string): Trait | null;
  removeTrait(trait: Trait): void;
  removeTrait(key: string | Trait): Trait | null | void {
    const model = this.model;
    if (typeof key === "string") {
      return model !== null ? model.removeTrait(key) : null;
    } else if (model !== null) {
      model.removeTrait(key);
    }
  }

  get removeTraitFlags(): ModelFlags {
    return (this.constructor as typeof Trait).RemoveTraitFlags;
  }

  /** @protected */
  willRemoveTrait(trait: Trait): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillRemoveTrait !== void 0) {
        observer.traitWillRemoveTrait(trait, this);
      }
    }
  }

  /** @protected */
  onRemoveTrait(trait: Trait): void {
    this.requireUpdate(this.removeTraitFlags);
    this.detachTraitFasteners(trait);
  }

  /** @protected */
  didRemoveTrait(trait: Trait): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidRemoveTrait !== void 0) {
        observer.traitDidRemoveTrait(trait, this);
      }
    }
  }

  /** @internal */
  protected attachTraitFasteners(trait: Trait, target: Trait | null): void {
    const fastenerName = trait.key;
    if (fastenerName !== void 0) {
      const traitFastener = this.getLazyFastener(fastenerName, TraitFastener);
      if (traitFastener !== null && traitFastener.sibling === true) {
        traitFastener.setOwnTrait(trait, null);
      }
    }
  }

  /** @internal */
  protected detachTraitFasteners(trait: Trait): void {
    const fastenerName = trait.key;
    if (fastenerName !== void 0) {
      const traitFastener = this.getFastener(fastenerName, TraitFastener);
      if (traitFastener !== null && traitFastener.sibling === true && traitFastener.trait === trait) {
        traitFastener.setOwnTrait(null, null);
      }
    }
  }

  getSuperTrait<R extends Trait>(superBounds: Class<R>): R | null {
    const model = this.model;
    return model !== null ? model.getSuperTrait(superBounds) : null;
  }

  getBaseTrait<R extends Trait>(baseBound: Class<R>): R | null {
    const model = this.model;
    return model !== null ? model.getBaseTrait(baseBound) : null;
  }

  @Provider({
    extends: WarpProvider,
    type: WarpService,
    observes: false,
    service: WarpService.global(),
  })
  readonly warpProvider!: WarpService<this>;

  @Property({
    type: Object,
    inherits: true,
    state: null,
    updateFlags: Model.NeedsReconcile,
  })
  readonly warpRef!: Property<this, WarpRef | null>;

  /** @internal */
  protected attachChildFasteners(child: Model, target: Model | null): void {
    const fastenerName = child.key;
    if (fastenerName !== void 0) {
      const modelFastener = this.getLazyFastener(fastenerName, ModelFastener);
      if (modelFastener !== null && modelFastener.child === true) {
        modelFastener.setOwnModel(child, target);
      }
    }
  }

  /** @internal */
  protected detachChildFastenerss(child: Model): void {
    const fastenerName = child.key;
    if (fastenerName !== void 0) {
      const modelFastener = this.getFastener(fastenerName, ModelFastener);
      if (modelFastener !== null && modelFastener.child === true && modelFastener.model === child) {
        modelFastener.setOwnModel(null, null);
      }
    }
  }

  get mounted(): boolean {
    return (this.flags & Trait.MountedFlag) !== 0;
  }

  get mountFlags(): ModelFlags {
    return (this.constructor as typeof Trait).MountFlags;
  }

  /** @internal */
  mountTrait(): void {
    if ((this.flags & Trait.MountedFlag) === 0) {
      this.setFlags(this.flags | Trait.MountedFlag);
      this.willMount();
      this.onMount();
      this.didMount();
    } else {
      throw new Error("already mounted");
    }
  }

  protected willMount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillMount !== void 0) {
        observer.traitWillMount(this);
      }
    }
  }

  protected onMount(): void {
    this.requireUpdate(this.mountFlags);

    if (this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(Model.NeedsMutate);
    }

    this.mountFasteners();

    if (this.consumers.length !== 0) {
      this.startConsuming();
    }
  }

  protected didMount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidMount !== void 0) {
        observer.traitDidMount(this);
      }
    }
  }

  /** @internal */
  unmountTrait(): void {
    if ((this.flags & Trait.MountedFlag) !== 0) {
      this.setFlags(this.flags & ~Trait.MountedFlag);
      this.willUnmount();
      this.onUnmount();
      this.didUnmount();
    } else {
      throw new Error("already unmounted");
    }
  }

  protected willUnmount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillUnmount !== void 0) {
        observer.traitWillUnmount(this);
      }
    }
  }

  protected onUnmount(): void {
    this.stopConsuming();
    this.unmountFasteners();
  }

  protected didUnmount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidUnmount !== void 0) {
        observer.traitDidUnmount(this);
      }
    }
  }

  requireUpdate(updateFlags: ModelFlags, immediate: boolean = false): void {
    const model = this.model;
    if (model !== null) {
      model.requireUpdate(updateFlags, immediate);
    }
  }

  /** @protected */
  needsUpdate(updateFlags: ModelFlags, immediate: boolean): ModelFlags {
    return updateFlags;
  }

  requestUpdate(target: Model, updateFlags: ModelFlags, immediate: boolean): void {
    const model = this.model;
    if (model !== null) {
      model.requestUpdate(target, updateFlags, immediate);
    } else {
      throw new TypeError("no model");
    }
  }

  get traversing(): boolean {
    const model = this.model;
    return model !== null && model.traversing;
  }

  get updating(): boolean {
    const model = this.model;
    return model !== null && model.updating;
  }

  get analyzing(): boolean {
    const model = this.model;
    return model !== null && model.analyzing;
  }

  /** @protected */
  needsAnalyze(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): ModelFlags {
    return analyzeFlags;
  }

  /** @protected */
  willAnalyze(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  /** @protected */
  onAnalyze(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  /** @protected */
  didAnalyze(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  /** @protected */
  willMutate(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillMutate !== void 0) {
        observer.traitWillMutate(modelContext, this);
      }
    }
  }

  /** @protected */
  onMutate(modelContext: TraitContextType<this>): void {
    this.recohereFasteners(modelContext.updateTime);
  }

  /** @protected */
  didMutate(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidMutate !== void 0) {
        observer.traitDidMutate(modelContext, this);
      }
    }
  }

  /** @protected */
  willAggregate(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillAggregate !== void 0) {
        observer.traitWillAggregate(modelContext, this);
      }
    }
  }

  /** @protected */
  onAggregate(modelContext: TraitContextType<this>): void {
    // hook
  }

  /** @protected */
  didAggregate(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidAggregate !== void 0) {
        observer.traitDidAggregate(modelContext, this);
      }
    }
  }

  /** @protected */
  willCorrelate(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillCorrelate !== void 0) {
        observer.traitWillCorrelate(modelContext, this);
      }
    }
  }

  /** @protected */
  onCorrelate(modelContext: TraitContextType<this>): void {
    // hook
  }

  /** @protected */
  didCorrelate(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidCorrelate !== void 0) {
        observer.traitDidCorrelate(modelContext, this);
      }
    }
  }

  /** @protected */
  analyzeChildren(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>,
                  analyzeChildModel: (this: TraitModelType<this>, child: Model, analyzeFlags: ModelFlags,
                                      modelContext: TraitContextType<this>) => void,
                  analyzeChildren: (this: TraitModelType<this>, analyzeFlags: ModelFlags, modelContext: TraitContextType<this>,
                                    analyzeChildModel: (this: TraitModelType<this>, child: Model, analyzeFlags: ModelFlags,
                                                        modelContext: TraitContextType<this>) => void) => void): void {
    const model = this.model as TraitModelType<this>;
    analyzeChildren.call(model, analyzeFlags, modelContext, analyzeChildModel);
  }

  get refreshing(): boolean {
    const model = this.model;
    return model !== null && model.refreshing;
  }

  /** @protected */
  needsRefresh(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): ModelFlags {
    return refreshFlags;
  }

  /** @protected */
  willRefresh(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  /** @protected */
  onRefresh(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  /** @protected */
  didRefresh(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  /** @protected */
  willValidate(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillValidate !== void 0) {
        observer.traitWillValidate(modelContext, this);
      }
    }
  }

  /** @protected */
  onValidate(modelContext: TraitContextType<this>): void {
    // hook
  }

  /** @protected */
  didValidate(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidValidate !== void 0) {
        observer.traitDidValidate(modelContext, this);
      }
    }
  }

  /** @protected */
  willReconcile(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillReconcile !== void 0) {
        observer.traitWillReconcile(modelContext, this);
      }
    }
  }

  /** @protected */
  onReconcile(modelContext: TraitContextType<this>): void {
    this.recohereDownlinks(modelContext.updateTime);
  }

  /** @protected */
  didReconcile(modelContext: TraitContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidReconcile !== void 0) {
        observer.traitDidReconcile(modelContext, this);
      }
    }
  }

  /** @protected */
  refreshChildren(refreshFlags: ModelFlags, modelContext: TraitContextType<this>,
                  refreshChild: (this: TraitModelType<this>, child: Model, refreshFlags: ModelFlags,
                                 modelContext: TraitContextType<this>) => void,
                  refreshChildren: (this: TraitModelType<this>, refreshFlags: ModelFlags, modelContext: TraitContextType<this>,
                                    refreshChild: (this: TraitModelType<this>, child: Model, refreshFlags: ModelFlags,
                                                        modelContext: TraitContextType<this>) => void) => void): void {
    const model = this.model as TraitModelType<this>;
    refreshChildren.call(model, refreshFlags, modelContext, refreshChild);
  }

  /** @internal */
  readonly fasteners: {[fastenerName: string]: Fastener | undefined} | null;

  /** @override */
  hasFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): boolean {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      const fastener = fasteners[fastenerName];
      if (fastener !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastener instanceof fastenerBound)) {
        return true;
      }
    }
    return false;
  }

  /** @override */
  getFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;
  getFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    const fasteners = this.fasteners;
    if (fasteners !== null) {
      const fastener = fasteners[fastenerName];
      if (fastener !== void 0 && (fastenerBound === void 0 || fastenerBound === null || fastener instanceof fastenerBound)) {
        return fastener;
      }
    }
    return null;
  }

  /** @override */
  setFastener(fastenerName: string, newFastener: Fastener | null): void {
    let fasteners = this.fasteners;
    if (fasteners === null) {
      fasteners = {};
      (this as Mutable<this>).fasteners = fasteners;
    }
    let oldFastener: Fastener | null | undefined = fasteners[fastenerName];
    if (oldFastener === void 0) {
      oldFastener = null;
    }
    if (newFastener !== oldFastener) {
      this.willSetFastener(fastenerName, newFastener, oldFastener);
      if (oldFastener !== null) {
        this.detachFastener(fastenerName, oldFastener);
        if (this.mounted) {
          oldFastener.unmount();
        }
      }
      if (newFastener !== null) {
        fasteners[fastenerName] = newFastener;
        if (this.mounted) {
          newFastener.mount();
        }
      } else {
        delete fasteners[fastenerName];
      }
      this.onSetFastener(fastenerName, newFastener, oldFastener);
      if (newFastener !== null) {
        this.attachFastener(fastenerName, newFastener);
      }
      this.didSetFastener(fastenerName, newFastener, oldFastener);
    }
  }

  protected attachFastener(fastenerName: string, fastener: Fastener): void {
    if (fastener instanceof ModelFastener && fastener.child === true) {
      const child = this.getChild(fastenerName);
      if (child !== null) {
        fastener.setOwnModel(child, null);
      }
    }

    if (fastener instanceof TraitFastener && fastener.sibling === true) {
      const trait = this.getTrait(fastenerName);
      if (trait !== null) {
        fastener.setOwnTrait(trait, null);
      }
    }

    if (fastener instanceof DownlinkFastener && fastener.consumed === true && this.consuming) {
      fastener.consume(this);
    }
  }

  protected detachFastener(fastenerName: string, fastener: Fastener): void {
    // hook
  }

  protected willSetFastener(fastenerName: string, newFastener: Fastener | null, oldFastener: Fastener | null): void {
    // hook
  }

  protected onSetFastener(fastenerName: string, newFastener: Fastener | null, oldFastener: Fastener | null): void {
    // hook
  }

  protected didSetFastener(fastenerName: string, newFastener: Fastener | null, oldFastener: Fastener | null): void {
    // hook
  }

  /** @override */
  getLazyFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getLazyFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;
  getLazyFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    return FastenerContext.getLazyFastener(this, fastenerName, fastenerBound);
  }

  /** @override */
  getSuperFastener<F extends Fastener<any>>(fastenerName: string, fastenerBound: Class<F>): F | null;
  /** @override */
  getSuperFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null;
  getSuperFastener(fastenerName: string, fastenerBound?: Class<Fastener> | null): Fastener | null {
    const model = this.model;
    if (model === null) {
      return null;
    } else {
      const modelFastener = model.getLazyFastener(fastenerName, fastenerBound);
      if (modelFastener !== null) {
        return modelFastener;
      } else {
        return model.getSuperFastener(fastenerName, fastenerBound);
      }
    }
  }

  /** @internal */
  protected mountFasteners(): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      fastener.mount();
    }
    FastenerContext.init(this);
  }

  /** @internal */
  protected unmountFasteners(): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      fastener.unmount();
    }
  }

  /** @internal */
  readonly decoherent: ReadonlyArray<Fastener> | null;

  /** @internal */
  decohereFastener(fastener: Fastener): void {
    let decoherent = this.decoherent as Fastener[];
    if (decoherent === null) {
      decoherent = [];
      (this as Mutable<this>).decoherent = decoherent;
    }
    decoherent.push(fastener);
    if (fastener instanceof DownlinkFastener) {
      this.requireUpdate(Model.NeedsReconcile);
    } else {
      this.requireUpdate(Model.NeedsMutate);
    }
  }

  /** @internal */
  recohereFasteners(t?: number): void {
    const decoherent = this.decoherent;
    if (decoherent !== null) {
      const decoherentCount = decoherent.length;
      if (decoherentCount !== 0) {
        if (t === void 0) {
          t = performance.now();
        }
        (this as Mutable<this>).decoherent = null;
        for (let i = 0; i < decoherentCount; i += 1) {
          const fastener = decoherent[i]!;
          if (!(fastener instanceof DownlinkFastener)) {
            fastener.recohere(t);
          } else {
            this.decohereFastener(fastener);
          }
        }
      }
    }
  }

  /** @internal */
  recohereDownlinks(t: number): void {
    const decoherent = this.decoherent;
    if (decoherent !== null) {
      const decoherentCount = decoherent.length;
      if (decoherentCount !== 0) {
        (this as Mutable<this>).decoherent = null;
        for (let i = 0; i < decoherentCount; i += 1) {
          const fastener = decoherent[i]!;
          if (fastener instanceof DownlinkFastener) {
            fastener.recohere(t);
          } else {
            this.decohereFastener(fastener);
          }
        }
      }
    }
  }

  /** @internal */
  readonly observers: ReadonlyArray<ObserverType<this>>;

  /** @override */
  observe(observer: ObserverType<this>): void {
    const oldObservers = this.observers;
    const newObservers = Arrays.inserted(observer, oldObservers);
    if (oldObservers !== newObservers) {
      this.willObserve(observer);
      (this as Mutable<this>).observers = newObservers;
      this.onObserve(observer);
      this.didObserve(observer);
    }
  }

  protected willObserve(observer: ObserverType<this>): void {
    // hook
  }

  protected onObserve(observer: ObserverType<this>): void {
    // hook
  }

  protected didObserve(observer: ObserverType<this>): void {
    // hook
  }

  /** @override */
  unobserve(observer: ObserverType<this>): void {
    const oldObservers = this.observers;
    const newObservers = Arrays.removed(observer, oldObservers);
    if (oldObservers !== newObservers) {
      this.willUnobserve(observer);
      (this as Mutable<this>).observers = newObservers;
      this.onUnobserve(observer);
      this.didUnobserve(observer);
    }
  }

  protected willUnobserve(observer: ObserverType<this>): void {
    // hook
  }

  protected onUnobserve(observer: ObserverType<this>): void {
    // hook
  }

  protected didUnobserve(observer: ObserverType<this>): void {
    // hook
  }

  protected forEachObserver<T>(callback: (this: this, observer: ObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      result = callback.call(this, observer as ObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  /** @internal */
  readonly consumers: ReadonlyArray<ConsumerType<this>>;

  /** @override */
  consume(consumer: ConsumerType<this>): void {
    const oldConsumers = this.consumers;
    const newConsumers = Arrays.inserted(consumer, oldConsumers);
    if (oldConsumers !== newConsumers) {
      this.willConsume(consumer);
      (this as Mutable<this>).consumers = newConsumers;
      this.onConsume(consumer);
      this.didConsume(consumer);
      if (oldConsumers.length === 0 && this.mounted) {
        this.startConsuming();
      }
    }
  }

  protected willConsume(consumer: ConsumerType<this>): void {
    // hook
  }

  protected onConsume(consumer: ConsumerType<this>): void {
    // hook
  }

  protected didConsume(consumer: ConsumerType<this>): void {
    // hook
  }

  /** @override */
  unconsume(consumer: ConsumerType<this>): void {
    const oldConsumers = this.consumers;
    const newConsumers = Arrays.removed(consumer, oldConsumers);
    if (oldConsumers !== newConsumers) {
      this.willUnconsume(consumer);
      (this as Mutable<this>).consumers = newConsumers;
      this.onUnconsume(consumer);
      this.didUnconsume(consumer);
      if (newConsumers.length === 0) {
        this.stopConsuming();
      }
    }
  }

  protected willUnconsume(consumer: ConsumerType<this>): void {
    // hook
  }

  protected onUnconsume(consumer: ConsumerType<this>): void {
    // hook
  }

  protected didUnconsume(consumer: ConsumerType<this>): void {
    // hook
  }

  get consuming(): boolean {
    return (this.flags & Trait.ConsumingFlag) !== 0;
  }

  get startConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Trait).StartConsumingFlags;
  }

  protected startConsuming(): void {
    if ((this.flags & Trait.ConsumingFlag) === 0) {
      this.willStartConsuming();
      this.setFlags(this.flags | Trait.ConsumingFlag);
      this.onStartConsuming();
      this.didStartConsuming();
    }
  }

  protected willStartConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillStartConsuming !== void 0) {
        observer.traitWillStartConsuming(this);
      }
    }
  }

  protected onStartConsuming(): void {
    this.requireUpdate(this.startConsumingFlags);
    this.startConsumingFasteners();
  }

  protected didStartConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidStartConsuming !== void 0) {
        observer.traitDidStartConsuming(this);
      }
    }
  }

  get stopConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Trait).StopConsumingFlags;
  }

  protected stopConsuming(): void {
    if ((this.flags & Trait.ConsumingFlag) !== 0) {
      this.willStopConsuming();
      this.setFlags(this.flags & ~Trait.ConsumingFlag);
      this.onStopConsuming();
      this.didStopConsuming();
    }
  }

  protected willStopConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitWillStopConsuming !== void 0) {
        observer.traitWillStopConsuming(this);
      }
    }
  }

  protected onStopConsuming(): void {
    this.requireUpdate(this.stopConsumingFlags);
    this.stopConsumingFasteners();
  }

  protected didStopConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.traitDidStopConsuming !== void 0) {
        observer.traitDidStopConsuming(this);
      }
    }
  }

  /** @internal */
  protected startConsumingFasteners(): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof DownlinkFastener && fastener.consumed === true) {
        fastener.consume(this);
      }
    }
  }

  /** @internal */
  protected stopConsumingFasteners(): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      if (fastener instanceof DownlinkFastener && fastener.consumed === true) {
        fastener.unconsume(this);
      }
    }
  }

  get modelContext(): TraitContextType<this> | null {
    const model = this.model;
    return model !== null ? model.modelContext as TraitContextType<this> : null;
  }

  /** @override */
  init(init: TraitInit): void {
    // hook
  }

  static create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  static fromInit<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, init: InitType<InstanceType<S>>): InstanceType<S> {
    let type: Creatable<Trait>;
    if ((typeof init === "object" && init !== null || typeof init === "function") && Creatable.is((init as TraitInit).type)) {
      type = (init as TraitInit).type!;
    } else {
      type = this as unknown as Creatable<Trait>;
    }
    const view = type.create();
    view.init(init as TraitInit);
    return view as InstanceType<S>;
  }

  static fromAny<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, value: AnyTrait<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof Trait) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else if (Creatable.is(value)) {
      return (value as Creatable<InstanceType<S>>).create();
    } else {
      return (this as unknown as TraitFactory<InstanceType<S>>).fromInit(value);
    }
  }

  /** @internal */
  static readonly MountedFlag: TraitFlags = 1 << 0;
  /** @internal */
  static readonly ConsumingFlag: TraitFlags = 1 << 1;

  /** @internal */
  static readonly FlagShift: number = 2;
  /** @internal */
  static readonly FlagMask: ModelFlags = (1 << Trait.FlagShift) - 1;

  static readonly MountFlags: ModelFlags = 0;
  static readonly InsertChildFlags: ModelFlags = 0;
  static readonly RemoveChildFlags: ModelFlags = 0;
  static readonly InsertTraitFlags: ModelFlags = 0;
  static readonly RemoveTraitFlags: ModelFlags = 0;
  static readonly StartConsumingFlags: TraitFlags = 0;
  static readonly StopConsumingFlags: TraitFlags = 0;
}
