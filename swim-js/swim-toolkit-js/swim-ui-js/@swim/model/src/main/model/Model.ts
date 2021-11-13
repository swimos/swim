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
  FromAny,
  Dictionary,
  MutableDictionary,
  Creatable,
  InitType,
  Initable,
  ConsumerType,
  Consumable,
  Consumer,
} from "@swim/util";
import {Fastener, Property, Provider, HierarchyFlags, Hierarchy} from "@swim/fastener";
import {WarpRef, WarpService, WarpProvider, DownlinkFastener} from "@swim/client";
import {RefreshService} from "../refresh/RefreshService";
import {RefreshProvider} from "../refresh/RefreshProvider";
import {SelectionService} from "../selection/SelectionService";
import {SelectionProvider} from "../selection/SelectionProvider";
import {ModelContext} from "./ModelContext";
import type {ModelObserver} from "./ModelObserver";
import {ModelRelation} from "./"; // forward import
import {AnyTrait, TraitCreator, Trait} from "../"; // forward import
import {TraitRelation} from "../"; // forward import

export type ModelContextType<M extends Model> =
  M extends {readonly contextType?: Class<infer T>} ? T : never;

export type ModelFlags = HierarchyFlags;

export type AnyModel<M extends Model = Model> = M | ModelFactory<M> | InitType<M>;

export interface ModelInit {
  type?: Creatable<Model>;
  key?: string;
  traits?: AnyTrait[];
  children?: AnyModel[];
}

export interface ModelFactory<M extends Model = Model, U = AnyModel<M>> extends Creatable<M>, FromAny<M, U> {
  fromInit(init: InitType<M>): M;
}

export interface ModelClass<M extends Model = Model, U = AnyModel<M>> extends Function, ModelFactory<M, U> {
  readonly prototype: M;
}

export interface ModelConstructor<M extends Model = Model, U = AnyModel<M>> extends ModelClass<M, U> {
  new(): M;
}

export type ModelCreator<F extends (abstract new (...args: any[]) => M) & Creatable<InstanceType<F>>, M extends Model = Model> =
  (abstract new (...args: any[]) => InstanceType<F>) & Creatable<InstanceType<F>>;

export abstract class Model extends Hierarchy implements Initable<ModelInit>, Consumable {
  constructor() {
    super();
    this.consumers = Arrays.empty;
    this.parent = null;
    this.traits = [];
    this.traitMap = null;
  }

  override readonly familyType?: Class<Model>;

  override readonly observerType?: Class<ModelObserver>;

  /** @override */
  readonly consumerType?: Class<Consumer>;

  readonly contextType?: Class<ModelContext>;

  /** @internal */
  override readonly flags!: ModelFlags;

  /** @internal */
  override setFlags(flags: ModelFlags): void {
    (this as Mutable<this>).flags = flags;
  }

  override readonly parent: Model | null;

  /** @internal */
  override attachParent(parent: Model): void {
    // assert(this.parent === null);
    this.willAttachParent(parent);
    (this as Mutable<this>).parent = parent;
    if (parent.mounted) {
      this.cascadeMount();
    }
    this.onAttachParent(parent);
    this.didAttachParent(parent);
  }

  protected override willAttachParent(parent: Model): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillAttachParent !== void 0) {
        observer.modelWillAttachParent(parent, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willAttachParent(parent);
    }
  }

  protected override onAttachParent(parent: Model): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onAttachParent(parent);
    }
  }

  protected override didAttachParent(parent: Model): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didAttachParent(parent);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidAttachParent !== void 0) {
        observer.modelDidAttachParent(parent, this);
      }
    }
  }

  /** @internal */
  override detachParent(parent: Model): void {
    // assert(this.parent === parent);
    this.willDetachParent(parent);
    if (this.mounted) {
      this.cascadeUnmount();
    }
    this.onDetachParent(parent);
    (this as Mutable<this>).parent = null;
    this.didDetachParent(parent);
  }

  protected override willDetachParent(parent: Model): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillDetachParent !== void 0) {
        observer.modelWillDetachParent(parent, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willDetachParent(parent);
    }
  }

  protected override onDetachParent(parent: Model): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onDetachParent(parent);
    }
  }

  protected override didDetachParent(parent: Model): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didDetachParent(parent);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidDetachParent !== void 0) {
        observer.modelDidDetachParent(parent, this);
      }
    }
  }

  abstract override readonly childCount: number;

  abstract override readonly children: ReadonlyArray<Model>;

  abstract override firstChild(): Model | null;

  abstract override lastChild(): Model | null;

  abstract override nextChild(target: Model): Model | null;

  abstract override previousChild(target: Model): Model | null;

  abstract override forEachChild<T>(callback: (child: Model) => T | void): T | undefined;
  abstract override forEachChild<T, S>(callback: (this: S, child: Model) => T | void, thisArg: S): T | undefined;

  abstract override getChild<F extends abstract new (...args: any[]) => Model>(key: string, childBound: F): InstanceType<F> | null;
  abstract override getChild(key: string, childBound?: abstract new (...args: any[]) => Model): Model | null;

  abstract override setChild<M extends Model>(key: string, newChild: M): Model | null;
  abstract override setChild<F extends ModelCreator<F>>(key: string, factory: F): Model | null;
  abstract override setChild(key: string, newChild: AnyModel | null): Model | null;

  abstract override appendChild<M extends Model>(child: M, key?: string): M;
  abstract override appendChild<F extends ModelCreator<F>>(factory: F, key?: string): InstanceType<F>;
  abstract override appendChild(child: AnyModel, key?: string): Model;

  abstract override prependChild<M extends Model>(child: M, key?: string): M;
  abstract override prependChild<F extends ModelCreator<F>>(factory: F, key?: string): InstanceType<F>;
  abstract override prependChild(child: AnyModel, key?: string): Model;

  abstract override insertChild<M extends Model>(child: M, target: Model | null, key?: string): M;
  abstract override insertChild<F extends ModelCreator<F>>(factory: F, target: Model | null, key?: string): InstanceType<F>;
  abstract override insertChild(child: AnyModel, target: Model | null, key?: string): Model;

  abstract override replaceChild<M extends Model>(newChild: Model, oldChild: M): M;
  abstract override replaceChild<M extends Model>(newChild: AnyModel, oldChild: M): M;

  override get insertChildFlags(): ModelFlags {
    return (this.constructor as typeof Model).InsertChildFlags;
  }

  protected override willInsertChild(child: Model, target: Model | null): void {
    super.willInsertChild(child, target);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillInsertChild !== void 0) {
        observer.modelWillInsertChild(child, target, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willInsertChild(child, target);
    }
  }

  protected override onInsertChild(child: Model, target: Model | null): void {
    super.onInsertChild(child, target);
    this.bindChildFasteners(child, target);
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onInsertChild(child, target);
    }
  }

  protected override didInsertChild(child: Model, target: Model | null): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didInsertChild(child, target);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidInsertChild !== void 0) {
        observer.modelDidInsertChild(child, target, this);
      }
    }
    super.didInsertChild(child, target);
  }

  /** @internal */
  override cascadeInsert(updateFlags?: ModelFlags, modelContext?: ModelContext): void {
    if ((this.flags & Model.MountedFlag) !== 0) {
      if (updateFlags === void 0) {
        updateFlags = 0;
      }
      updateFlags |= this.flags & Model.UpdateMask;
      if ((updateFlags & Model.AnalyzeMask) !== 0) {
        if (modelContext === void 0) {
          modelContext = this.superModelContext;
        }
        this.cascadeAnalyze(updateFlags, modelContext);
      }
    }
  }

  abstract override removeChild(key: string): Model | null;
  abstract override removeChild<M extends Model>(child: M): M;

  override get removeChildFlags(): ModelFlags {
    return (this.constructor as typeof Model).RemoveChildFlags;
  }

  protected override willRemoveChild(child: Model): void {
    super.willRemoveChild(child);
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillRemoveChild !== void 0) {
        observer.modelWillRemoveChild(child, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willRemoveChild(child);
    }
  }

  protected override onRemoveChild(child: Model): void {
    super.onRemoveChild(child);
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onRemoveChild(child);
    }
    this.unbindChildFasteners(child);
  }

  protected override didRemoveChild(child: Model): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didRemoveChild(child);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidRemoveChild !== void 0) {
        observer.modelDidRemoveChild(child, this);
      }
    }
    super.didRemoveChild(child);
  }

  get traitCount(): number {
    return this.traits.length;
  }

  readonly traits: ReadonlyArray<Trait>;

  firstTrait(): Trait | null {
    const traits = this.traits;
    if (traits.length !== 0) {
      return traits[0]!;
    }
    return null;
  }

  lastTrait(): Trait | null {
    const traits = this.traits;
    const traitCount = traits.length;
    if (traitCount !== 0) {
      return traits[traitCount - 1]!;
    }
    return null;
  }

  nextTrait(target: Trait): Trait | null {
    const traits = this.traits;
    const targetIndex = traits.indexOf(target);
    if (targetIndex >= 0 && targetIndex + 1 < traits.length) {
      return traits[targetIndex + 1]!;
    }
    return null;
  }

  previousTrait(target: Trait): Trait | null {
    const traits = this.traits;
    const targetIndex = traits.indexOf(target);
    if (targetIndex - 1 >= 0) {
      return traits[targetIndex - 1]!;
    }
    return null;
  }

  forEachTrait<T>(callback: (trait: Trait) => T | void): T | undefined;
  forEachTrait<T, S>(callback: (this: S, trait: Trait) => T | void, thisArg: S): T | undefined;
  forEachTrait<T, S>(callback: (this: S | undefined, trait: Trait) => T | void, thisArg?: S): T | undefined {
    let result: T | undefined;
    const traits = this.traits;
    let i = 0;
    while (i < traits.length) {
      const trait = traits[i]!;
      result = callback.call(thisArg, trait) as T | undefined;
      if (result !== void 0) {
        break;
      }
      if (traits[i] === trait) {
        i += 1;
      }
    }
    return result;
  }

  /** @internal */
  readonly traitMap: Dictionary<Trait> | null;

  /** @internal */
  protected insertTraitMap(trait: Trait): void {
    const key = trait.key;
    if (key !== void 0) {
      let traitMap = this.traitMap as MutableDictionary<Trait>;
      if (traitMap === null) {
        traitMap = {};
        (this as Mutable<this>).traitMap = traitMap;
      }
      traitMap[key] = trait;
    }
  }

  /** @internal */
  protected removeTraitMap(trait: Trait): void {
    const key = trait.key;
    if (key !== void 0) {
      const traitMap = this.traitMap as MutableDictionary<Trait>;
      if (traitMap !== null) {
        delete traitMap[key];
      }
    }
  }

  /** @internal */
  protected replaceTraitMap(newTrait: Trait, oldTrait: Trait): void {
    const key = oldTrait.key;
    if (key !== void 0) {
      let traitMap = this.traitMap as MutableDictionary<Trait>;
      if (traitMap === null) {
        traitMap = {};
        (this as Mutable<this>).traitMap = traitMap;
      }
      traitMap[key] = newTrait;
    }
  }

  getTrait<F extends abstract new (...args: any[]) => Trait>(key: string, traitBound: F): InstanceType<F> | null;
  getTrait(key: string, traitBound?: abstract new (...args: any[]) => Trait): Trait | null;
  getTrait<F extends abstract new (...args: any[]) => Trait>(traitBound: F): InstanceType<F> | null;
  getTrait(key: string | (abstract new (...args: any[]) => Trait), traitBound?: abstract new (...args: any[]) => Trait): Trait | null {
    if (typeof key === "string") {
      const traitMap = this.traitMap;
      if (traitMap !== null) {
        const trait = traitMap[key];
        if (trait !== void 0 && (traitBound === void 0 || trait instanceof traitBound)) {
          return trait;
        }
      }
    } else {
      const traits = this.traits;
      for (let i = 0, n = traits.length; i < n; i += 1) {
        const trait = traits[i];
        if (trait instanceof key) {
          return trait;
        }
      }
    }
    return null;
  }

  setTrait<T extends Trait>(key: string, newTrait: T): Trait | null;
  setTrait<F extends TraitCreator<F>>(key: string, factory: F): Trait | null;
  setTrait(key: string, newTrait: AnyTrait | null): Trait | null;
  setTrait(key: string, newTrait: AnyTrait | null): Trait | null {
    if (newTrait !== null) {
      newTrait = Trait.fromAny(newTrait);
    }
    const oldTrait = this.getTrait(key);
    const traits = this.traits as Trait[];
    let index = -1;
    let target: Trait | null = null;

    if (oldTrait !== null && newTrait !== null && oldTrait !== newTrait) { // replace
      newTrait.remove();
      index = traits.indexOf(oldTrait);
      // assert(index >= 0);
      target = index + 1 < traits.length ? traits[index + 1]! : null;
      newTrait.setKey(oldTrait.key);
      this.willRemoveTrait(oldTrait);
      this.willInsertTrait(newTrait, target);
      oldTrait.detachModel(this);
      traits[index] = newTrait;
      this.replaceTraitMap(newTrait, oldTrait);
      newTrait.attachModel(this);
      this.onRemoveTrait(oldTrait);
      this.onInsertTrait(newTrait, target);
      this.didRemoveTrait(oldTrait);
      this.didInsertTrait(newTrait, target);
      oldTrait.setKey(void 0);
    } else if (newTrait !== oldTrait || newTrait !== null && newTrait.key !== key) {
      if (oldTrait !== null) { // remove
        this.willRemoveTrait(oldTrait);
        oldTrait.detachModel(this);
        this.removeTraitMap(oldTrait);
        index = traits.indexOf(oldTrait);
        // assert(index >= 0);
        traits.splice(index, 1);
        this.onRemoveTrait(oldTrait);
        this.didRemoveTrait(oldTrait);
        oldTrait.setKey(void 0);
        if (index < traits.length) {
          target = traits[index]!;
        }
      }
      if (newTrait !== null) { // insert
        newTrait.remove();
        newTrait.setKey(key);
        this.willInsertTrait(newTrait, target);
        if (index >= 0) {
          traits.splice(index, 0, newTrait);
        } else {
          traits.push(newTrait);
        }
        this.insertTraitMap(newTrait);
        newTrait.attachModel(this);
        this.onInsertTrait(newTrait, target);
        this.didInsertTrait(newTrait, target);
      }
    }

    return oldTrait;
  }

  appendTrait<T extends Trait>(trait: T, key?: string): T;
  appendTrait<F extends TraitCreator<F>>(factory: F, key?: string): InstanceType<F>;
  appendTrait(trait: AnyTrait, key?: string): Trait;
  appendTrait(trait: AnyTrait, key?: string): Trait {
    trait = Trait.fromAny(trait);

    trait.remove();
    if (key !== void 0) {
      this.removeChild(key);
      trait.setKey(key);
    }

    this.willInsertTrait(trait, null);
    (this.traits as Trait[]).push(trait);
    this.insertTraitMap(trait);
    trait.attachModel(this);
    this.onInsertTrait(trait, null);
    this.didInsertTrait(trait, null);

    return trait;
  }

  prependTrait<T extends Trait>(trait: T, key?: string): T;
  prependTrait<F extends TraitCreator<F>>(factory: F, key?: string): InstanceType<F>;
  prependTrait(trait: AnyTrait, key?: string): Trait;
  prependTrait(trait: AnyTrait, key?: string): Trait {
    trait = Trait.fromAny(trait);

    trait.remove();
    if (key !== void 0) {
      this.removeChild(key);
      trait.setKey(key);
    }

    const traits = this.traits as Trait[];
    const target = traits.length !== 0 ? traits[0]! : null;
    this.willInsertTrait(trait, target);
    traits.unshift(trait);
    this.insertTraitMap(trait);
    trait.attachModel(this);
    this.onInsertTrait(trait, target);
    this.didInsertTrait(trait, target);

    return trait;
  }

  insertTrait<T extends Trait>(trait: T, target: Trait | null, key?: string): T;
  insertTrait<F extends TraitCreator<F>>(factory: F, target: Trait | null, key?: string): InstanceType<F>;
  insertTrait(trait: AnyTrait, target: Trait | null, key?: string): Trait;
  insertTrait(trait: AnyTrait, target: Trait | null, key?: string): Trait {
    if (target !== null && target.model !== this) {
      throw new TypeError("" + target);
    }

    trait = Trait.fromAny(trait);

    trait.remove();
    if (key !== void 0) {
      this.removeChild(key);
      trait.setKey(key);
    }

    this.willInsertTrait(trait, target);
    const traits = this.traits as Trait[];
    const index = target !== null ? traits.indexOf(target) : -1;
    if (index >= 0) {
      traits.splice(index, 0, trait);
    } else {
      traits.push(trait);
    }
    this.insertTraitMap(trait);
    trait.attachModel(this);
    this.onInsertTrait(trait, target);
    this.didInsertTrait(trait, target);

    return trait;
  }

  replaceTrait<T extends Trait>(newTrait: Trait, oldTrait: T): T;
  replaceTrait<T extends Trait>(newTrait: AnyTrait, oldTrait: T): T;
  replaceTrait(newTrait: AnyTrait, oldTrait: Trait): Trait {
    const traits = this.traits as Trait[];
    let index: number
    if (oldTrait.model !== this || (index = traits.indexOf(oldTrait), index < 0)) {
      throw new TypeError("" + oldTrait);
    }

    newTrait = Trait.fromAny(newTrait);
    if (newTrait !== oldTrait) {
      newTrait.remove();
      newTrait.setKey(oldTrait.key);

      const target = index + 1 < traits.length ? traits[index + 1]! : null;
      this.willRemoveTrait(oldTrait);
      this.willInsertTrait(newTrait, target);
      oldTrait.detachModel(this);
      traits[index] = newTrait;
      this.replaceTraitMap(newTrait, oldTrait);
      newTrait.attachModel(this);
      this.onRemoveTrait(oldTrait);
      this.onInsertTrait(newTrait, target);
      this.didRemoveTrait(oldTrait);
      this.didInsertTrait(newTrait, target);
      oldTrait.setKey(void 0);
    }

    return oldTrait;
  }


  get insertTraitFlags(): ModelFlags {
    return (this.constructor as typeof Model).InsertTraitFlags;
  }

  protected willInsertTrait(trait: Trait, target: Trait | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillInsertTrait !== void 0) {
        observer.modelWillInsertTrait(trait, target, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willInsertTrait(trait, target);
    }
  }

  protected onInsertTrait(trait: Trait, target: Trait | null): void {
    this.requireUpdate(this.insertTraitFlags);
    this.bindTraitFasteners(trait, target);
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onInsertTrait(trait, target);
    }
  }

  protected didInsertTrait(trait: Trait, target: Trait | null): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didInsertTrait(trait, target);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidInsertTrait !== void 0) {
        observer.modelDidInsertTrait(trait, target, this);
      }
    }
  }

  removeTrait(key: string): Trait | null;
  removeTrait(trait: Trait): void;
  removeTrait(key: string | Trait): Trait | null | void {
    let trait: Trait | null;
    if (typeof key === "string") {
      trait = this.getTrait(key);
      if (trait === null) {
        return null;
      }
    } else {
      trait = key;
    }
    if (trait.model !== this) {
      throw new Error("not a member trait");
    }

    this.willRemoveTrait(trait);
    trait.detachModel(this);
    this.removeTraitMap(trait);
    const traits = this.traits as Trait[];
    const index = traits.indexOf(trait);
    if (index >= 0) {
      traits.splice(index, 1);
    }
    this.onRemoveTrait(trait);
    this.didRemoveTrait(trait);
    trait.setKey(void 0);

    if (typeof key === "string") {
      return trait;
    }
  }

  get removeTraitFlags(): ModelFlags {
    return (this.constructor as typeof Model).RemoveTraitFlags;
  }

  protected willRemoveTrait(trait: Trait): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillRemoveTrait !== void 0) {
        observer.modelWillRemoveTrait(trait, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willRemoveTrait(trait);
    }
  }

  protected onRemoveTrait(trait: Trait): void {
    this.requireUpdate(this.removeTraitFlags);
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onRemoveTrait(trait);
    }
    this.unbindTraitFasteners(trait);
  }

  protected didRemoveTrait(trait: Trait): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didRemoveTrait(trait);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidRemoveTrait !== void 0) {
        observer.modelDidRemoveTrait(trait, this);
      }
    }
  }

  /** @internal */
  protected mountTraits(): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.mountTrait();
    }
  }

  /** @internal */
  protected unmountTraits(): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.unmountTrait();
    }
  }

  getSuperTrait<F extends abstract new (...args: any[]) => Trait>(superBound: F): InstanceType<F> | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else {
      const trait = parent.getTrait(superBound);
      if (trait !== null) {
        return trait;
      } else {
        return parent.getSuperTrait(superBound);
      }
    }
  }

  getBaseTrait<F extends abstract new (...args: any[]) => Trait>(baseBound: F): InstanceType<F> | null {
    const parent = this.parent;
    if (parent === null) {
      return null;
    } else {
      const baseTrait = parent.getBaseTrait(baseBound);
      if (baseTrait !== null) {
        return baseTrait;
      } else {
        return parent.getTrait(baseBound);
      }
    }
  }

  override get mountFlags(): ModelFlags {
    return (this.constructor as typeof Model).MountFlags;
  }

  mount(): void {
    if (!this.mounted && this.parent === null) {
      this.cascadeMount();
      this.cascadeInsert();
    }
  }

  /** @internal */
  override cascadeMount(): void {
    if ((this.flags & Model.MountedFlag) === 0) {
      this.setFlags(this.flags | (Model.MountedFlag | Model.TraversingFlag));
      try {
        this.willMount();
        this.onMount();
        this.mountTraits();
        this.mountChildren();
        this.didMount();
      } finally {
        this.setFlags(this.flags & ~Model.TraversingFlag);
      }
    } else {
      throw new Error("already mounted");
    }
  }

  protected override willMount(): void {
    super.willMount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillMount !== void 0) {
        observer.modelWillMount(this);
      }
    }
  }

  protected override onMount(): void {
    // subsume super
    this.requestUpdate(this, this.flags & Model.UpdateMask, false);
    this.requireUpdate(this.mountFlags);

    if (this.decoherent !== null && this.decoherent.length !== 0) {
      this.requireUpdate(Model.NeedsMutate);
    }

    this.mountFasteners();

    if (this.consumers.length !== 0) {
      this.startConsuming();
    }
  }

  protected override didMount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidMount !== void 0) {
        observer.modelDidMount(this);
      }
    }
    super.didMount();
  }

  /** @internal */
  override cascadeUnmount(): void {
    if ((this.flags & Model.MountedFlag) !== 0) {
      this.setFlags(this.flags & ~Model.MountedFlag | Model.TraversingFlag);
      try {
        this.willUnmount();
        this.unmountChildren();
        this.unmountTraits();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this.setFlags(this.flags & ~Model.TraversingFlag);
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected override willUnmount(): void {
    super.willUnmount();
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillUnmount !== void 0) {
        observer.modelWillUnmount(this);
      }
    }
  }

  protected override onUnmount(): void {
    this.stopConsuming();
    super.onUnmount();
  }

  protected override didUnmount(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidUnmount !== void 0) {
        observer.modelDidUnmount(this);
      }
    }
    super.didUnmount();
  }

  override requireUpdate(updateFlags: ModelFlags, immediate: boolean = false): void {
    const flags = this.flags;
    const deltaUpdateFlags = updateFlags & ~flags & Model.UpdateMask;
    if (deltaUpdateFlags !== 0) {
      this.setFlags(flags | deltaUpdateFlags);
      this.requestUpdate(this, deltaUpdateFlags, immediate);
    }
  }

  protected needsUpdate(updateFlags: ModelFlags, immediate: boolean): ModelFlags {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      updateFlags = traits[i]!.needsUpdate(updateFlags, immediate);
    }
    return updateFlags;
  }

  requestUpdate(target: Model, updateFlags: ModelFlags, immediate: boolean): void {
    updateFlags = this.needsUpdate(updateFlags, immediate);
    let deltaUpdateFlags = this.flags & ~updateFlags & Model.UpdateMask;
    if ((updateFlags & Model.AnalyzeMask) !== 0) {
      deltaUpdateFlags |= Model.NeedsAnalyze;
    }
    if ((updateFlags & Model.RefreshMask) !== 0) {
      deltaUpdateFlags |= Model.NeedsRefresh;
    }
    if (deltaUpdateFlags !== 0 || immediate) {
      this.setFlags(this.flags | deltaUpdateFlags);
      const parent = this.parent;
      if (parent !== null) {
        parent.requestUpdate(target, updateFlags, immediate);
      } else if (this.mounted) {
        const refreshProvider = this.refreshProvider.service;
        if (refreshProvider !== void 0 && refreshProvider !== null) {
          refreshProvider.requestUpdate(target, updateFlags, immediate);
        }
      }
    }
  }

  get updating(): boolean {
    return (this.flags & Model.UpdatingMask) !== 0;
  }

  get analyzing(): boolean {
    return (this.flags & Model.AnalyzingFlag) !== 0;
  }

  protected needsAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): ModelFlags {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      analyzeFlags = traits[i]!.needsAnalyze(analyzeFlags, modelContext);
    }
    return analyzeFlags;
  }

  cascadeAnalyze(analyzeFlags: ModelFlags, baesModelContext: ModelContext): void {
    const modelContext = this.extendModelContext(baesModelContext);
    const outerModelContext = ModelContext.current;
    try {
      ModelContext.current = modelContext;
      analyzeFlags &= ~Model.NeedsAnalyze;
      analyzeFlags |= this.flags & Model.UpdateMask;
      analyzeFlags = this.needsAnalyze(analyzeFlags, modelContext);
      if ((analyzeFlags & Model.AnalyzeMask) !== 0) {
        let cascadeFlags = analyzeFlags;
        this.setFlags(this.flags & ~Model.NeedsAnalyze | (Model.TraversingFlag | Model.AnalyzingFlag | Model.ContextualFlag));
        this.willAnalyze(cascadeFlags, modelContext);
        if (((this.flags | analyzeFlags) & Model.NeedsMutate) !== 0) {
          cascadeFlags |= Model.NeedsMutate;
          this.setFlags(this.flags & ~Model.NeedsMutate);
          this.willMutate(modelContext);
        }
        if (((this.flags | analyzeFlags) & Model.NeedsAggregate) !== 0) {
          cascadeFlags |= Model.NeedsAggregate;
          this.setFlags(this.flags & ~Model.NeedsAggregate);
          this.willAggregate(modelContext);
        }
        if (((this.flags | analyzeFlags) & Model.NeedsCorrelate) !== 0) {
          cascadeFlags |= Model.NeedsCorrelate;
          this.setFlags(this.flags & ~Model.NeedsCorrelate);
          this.willCorrelate(modelContext);
        }

        this.onAnalyze(cascadeFlags, modelContext);
        if ((cascadeFlags & Model.NeedsMutate) !== 0) {
          this.onMutate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsAggregate) !== 0) {
          this.onAggregate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsCorrelate) !== 0) {
          this.onCorrelate(modelContext);
        }

        if ((cascadeFlags & Model.AnalyzeMask) !== 0) {
          this.setFlags(this.flags & ~Model.ContextualFlag);
          this.analyzeChildren(cascadeFlags, modelContext, this.analyzeChild);
          this.setFlags(this.flags | Model.ContextualFlag);
        }

        if ((cascadeFlags & Model.NeedsCorrelate) !== 0) {
          this.didCorrelate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsAggregate) !== 0) {
          this.didAggregate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsMutate) !== 0) {
          this.didMutate(modelContext);
        }
        this.didAnalyze(cascadeFlags, modelContext);
      }
    } finally {
      this.setFlags(this.flags & ~(Model.TraversingFlag | Model.AnalyzingFlag | Model.ContextualFlag));
      ModelContext.current = outerModelContext;
    }
  }

  protected willAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willAnalyze(analyzeFlags, modelContext);
    }
  }

  protected onAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onAnalyze(analyzeFlags, modelContext);
    }
  }

  protected didAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didAnalyze(analyzeFlags, modelContext);
    }
  }

  protected willMutate(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillMutate !== void 0) {
        observer.modelWillMutate(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willMutate(modelContext);
    }
  }

  protected onMutate(modelContext: ModelContextType<this>): void {
    this.recohereFasteners(modelContext.updateTime);
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onMutate(modelContext);
    }
  }

  protected didMutate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didMutate(modelContext);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidMutate !== void 0) {
        observer.modelDidMutate(modelContext, this);
      }
    }
  }

  protected willAggregate(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillAggregate !== void 0) {
        observer.modelWillAggregate(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willAggregate(modelContext);
    }
  }

  protected onAggregate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onAggregate(modelContext);
    }
  }

  protected didAggregate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didAggregate(modelContext);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidAggregate !== void 0) {
        observer.modelDidAggregate(modelContext, this);
      }
    }
  }

  protected willCorrelate(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillCorrelate !== void 0) {
        observer.modelWillCorrelate(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willCorrelate(modelContext);
    }
  }

  protected onCorrelate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onCorrelate(modelContext);
    }
  }

  protected didCorrelate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didCorrelate(modelContext);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidCorrelate !== void 0) {
        observer.modelDidCorrelate(modelContext, this);
      }
    }
  }

  /** @internal */
  protected analyzeOwnChildren(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                               analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags,
                                              modelContext: ModelContextType<this>) => void): void {
    type self = this;
    function analyzeNext(this: self, child: Model): void {
      analyzeChild.call(this, child, analyzeFlags, modelContext);
      if ((child.flags & Model.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Model.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(analyzeNext, this);
  }

  protected analyzeTraitChildren(traits: ReadonlyArray<Trait>, traitIndex: number,
                                 analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                                 analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags,
                                                modelContext: ModelContextType<this>) => void): void {
    if (traitIndex < traits.length) {
      traits[traitIndex]!.analyzeChildren(analyzeFlags, modelContext, analyzeChild as any,
                                          this.analyzeTraitChildren.bind(this, traits, traitIndex + 1) as any);
    } else {
      this.analyzeOwnChildren(analyzeFlags, modelContext, analyzeChild);
    }
  }

  protected analyzeChildren(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                            analyzeChild: (this: this, child: Model, analyzeFlags: ModelFlags,
                                           modelContext: ModelContextType<this>) => void): void {
    const traits = this.traits;
    if (traits.length !== 0) {
      this.analyzeTraitChildren(traits, 0, analyzeFlags, modelContext, analyzeChild);
    } else {
      this.analyzeOwnChildren(analyzeFlags, modelContext, analyzeChild);
    }
  }

  protected analyzeChild(child: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    child.cascadeAnalyze(analyzeFlags, modelContext);
  }

  get refreshing(): boolean {
    return (this.flags & Model.RefreshingFlag) !== 0;
  }

  protected needsRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): ModelFlags {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      refreshFlags = traits[i]!.needsRefresh(refreshFlags, modelContext);
    }
    return refreshFlags;
  }

  cascadeRefresh(refreshFlags: ModelFlags, baseModelContext: ModelContext): void {
    const modelContext = this.extendModelContext(baseModelContext);
    const outerModelContext = ModelContext.current;
    try {
      ModelContext.current = modelContext;
      refreshFlags &= ~Model.NeedsRefresh;
      refreshFlags |= this.flags & Model.UpdateMask;
      refreshFlags = this.needsRefresh(refreshFlags, modelContext);
      if ((refreshFlags & Model.RefreshMask) !== 0) {
        let cascadeFlags = refreshFlags;
        this.setFlags(this.flags & ~Model.NeedsRefresh | (Model.TraversingFlag | Model.RefreshingFlag | Model.ContextualFlag));
        this.willRefresh(cascadeFlags, modelContext);
        if (((this.flags | refreshFlags) & Model.NeedsValidate) !== 0) {
          cascadeFlags |= Model.NeedsValidate;
          this.setFlags(this.flags & ~Model.NeedsValidate);
          this.willValidate(modelContext);
        }
        if (((this.flags | refreshFlags) & Model.NeedsReconcile) !== 0) {
          cascadeFlags |= Model.NeedsReconcile;
          this.setFlags(this.flags & ~Model.NeedsReconcile);
          this.willReconcile(modelContext);
        }

        this.onRefresh(cascadeFlags, modelContext);
        if ((cascadeFlags & Model.NeedsValidate) !== 0) {
          this.onValidate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsReconcile) !== 0) {
          this.onReconcile(modelContext);
        }

        if ((cascadeFlags & Model.RefreshMask)) {
          this.setFlags(this.flags & ~Model.ContextualFlag);
          this.refreshChildren(cascadeFlags, modelContext, this.refreshChild);
          this.setFlags(this.flags | Model.ContextualFlag);
        }

        if ((cascadeFlags & Model.NeedsReconcile) !== 0) {
          this.didReconcile(modelContext);
        }
        if ((cascadeFlags & Model.NeedsValidate) !== 0) {
          this.didValidate(modelContext);
        }
        this.didRefresh(cascadeFlags, modelContext);
      }
    } finally {
      this.setFlags(this.flags & ~(Model.TraversingFlag | Model.RefreshingFlag | Model.ContextualFlag));
      ModelContext.current = outerModelContext;
    }
  }

  protected willRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willRefresh(refreshFlags, modelContext);
    }
  }

  protected onRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onRefresh(refreshFlags, modelContext);
    }
  }

  protected didRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didRefresh(refreshFlags, modelContext);
    }
  }

  protected willValidate(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillValidate !== void 0) {
        observer.modelWillValidate(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willValidate(modelContext);
    }
  }

  protected onValidate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onValidate(modelContext);
    }
  }

  protected didValidate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didValidate(modelContext);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidValidate !== void 0) {
        observer.modelDidValidate(modelContext, this);
      }
    }
  }

  protected willReconcile(modelContext: ModelContextType<this>): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillReconcile !== void 0) {
        observer.modelWillReconcile(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.willReconcile(modelContext);
    }
  }

  protected onReconcile(modelContext: ModelContextType<this>): void {
    this.recohereDownlinks(modelContext.updateTime);
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.onReconcile(modelContext);
    }
  }

  protected didReconcile(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      traits[i]!.didReconcile(modelContext);
    }
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelDidReconcile !== void 0) {
        observer.modelDidReconcile(modelContext, this);
      }
    }
  }

  /** @internal */
  protected refreshOwnChildren(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                               refreshChild: (this: this, child: Model, refreshFlags: ModelFlags,
                                              modelContext: ModelContextType<this>) => void): void {
    type self = this;
    function refreshNext(this: self, child: Model): void {
      refreshChild.call(this, child, refreshFlags, modelContext);
      if ((child.flags & Model.RemovingFlag) !== 0) {
        child.setFlags(child.flags & ~Model.RemovingFlag);
        this.removeChild(child);
      }
    }
    this.forEachChild(refreshNext, this);
  }

  protected refreshTraitChildren(traits: ReadonlyArray<Trait>, traitIndex: number,
                                 refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                                 refreshChild: (this: this, child: Model, refreshFlags: ModelFlags,
                                                modelContext: ModelContextType<this>) => void): void {
    if (traitIndex < traits.length) {
      traits[traitIndex]!.refreshChildren(refreshFlags, modelContext, refreshChild as any,
                                          this.refreshTraitChildren.bind(this, traits, traitIndex + 1) as any);
    } else {
      this.refreshOwnChildren(refreshFlags, modelContext, refreshChild);
    }
  }

  protected refreshChildren(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                            refreshChild: (this: this, child: Model, refreshFlags: ModelFlags,
                                           modelContext: ModelContextType<this>) => void): void {
    const traits = this.traits;
    if (traits.length !== 0) {
      this.refreshTraitChildren(traits, 0, refreshFlags, modelContext, refreshChild);
    } else {
      this.refreshOwnChildren(refreshFlags, modelContext, refreshChild);
    }
  }

  protected refreshChild(child: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    child.cascadeRefresh(refreshFlags, modelContext);
  }

  protected override onAttachFastener(fastenerName: string, fastener: Fastener): void {
    super.onAttachFastener(fastenerName, fastener);
    this.bindFastener(fastener);
  }

  protected bindFastener(fastener: Fastener): void {
    if ((fastener instanceof ModelRelation || fastener instanceof TraitRelation) && fastener.binds) {
      this.forEachChild(function (child: Model): void {
        fastener.bindModel(child, null);
      }, this);
    }
    if (fastener instanceof TraitRelation && fastener.binds) {
      this.forEachTrait(function (trait: Trait): void {
        fastener.bindTrait(trait, null);
      }, this);
    }
    if (fastener instanceof DownlinkFastener && fastener.consumed === true && this.consuming) {
      fastener.consume(this);
    }
  }

  /** @internal */
  protected bindChildFasteners(child: Model, target: Model | null): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.bindChildFastener(fastener, child, target);
    }
  }

  /** @internal */
  protected bindChildFastener(fastener: Fastener, child: Model, target: Model | null): void {
    if (fastener instanceof ModelRelation || fastener instanceof TraitRelation) {
      fastener.bindModel(child, target);
    }
  }

  /** @internal */
  protected unbindChildFasteners(child: Model): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.unbindChildFastener(fastener, child);
    }
  }

  /** @internal */
  protected unbindChildFastener(fastener: Fastener, child: Model): void {
    if (fastener instanceof ModelRelation || fastener instanceof TraitRelation) {
      fastener.unbindModel(child);
    }
  }

  /** @internal */
  protected bindTraitFasteners(trait: Trait, target: Trait | null): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.bindTraitFastener(fastener, trait, target);
    }
  }

  /** @internal */
  protected bindTraitFastener(fastener: Fastener, trait: Trait, target: Trait | null): void {
    if (fastener instanceof TraitRelation) {
      fastener.bindTrait(trait, target);
    }
  }

  /** @internal */
  protected unbindTraitFasteners(trait: Trait): void {
    const fasteners = this.fasteners;
    for (const fastenerName in fasteners) {
      const fastener = fasteners[fastenerName]!;
      this.unbindTraitFastener(fastener, trait);
    }
  }

  /** @internal */
  protected unbindTraitFastener(fastener: Fastener, trait: Trait): void {
    if (fastener instanceof TraitRelation) {
      fastener.unbindTrait(trait);
    }
  }

  /** @internal @override */
  override decohereFastener(fastener: Fastener): void {
    super.decohereFastener(fastener);
    if (fastener instanceof DownlinkFastener) {
      this.requireUpdate(Model.NeedsReconcile);
    } else {
      this.requireUpdate(Model.NeedsMutate);
    }
  }

  /** @internal */
  override recohereFasteners(t?: number): void {
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
    return (this.flags & Model.ConsumingFlag) !== 0;
  }

  get startConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Model).StartConsumingFlags;
  }

  protected startConsuming(): void {
    if ((this.flags & Model.ConsumingFlag) === 0) {
      this.willStartConsuming();
      this.setFlags(this.flags | Model.ConsumingFlag);
      this.onStartConsuming();
      this.didStartConsuming();
    }
  }

  protected willStartConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillStartConsuming !== void 0) {
        observer.modelWillStartConsuming(this);
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
      if (observer.modelDidStartConsuming !== void 0) {
        observer.modelDidStartConsuming(this);
      }
    }
  }

  get stopConsumingFlags(): ModelFlags {
    return (this.constructor as typeof Model).StopConsumingFlags;
  }

  protected stopConsuming(): void {
    if ((this.flags & Model.ConsumingFlag) !== 0) {
      this.willStopConsuming();
      this.setFlags(this.flags & ~Model.ConsumingFlag);
      this.onStopConsuming();
      this.didStopConsuming();
    }
  }

  protected willStopConsuming(): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.modelWillStopConsuming !== void 0) {
        observer.modelWillStopConsuming(this);
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
      if (observer.modelDidStopConsuming !== void 0) {
        observer.modelDidStopConsuming(this);
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

  @Provider({
    extends: RefreshProvider,
    type: RefreshService,
    observes: false,
    service: RefreshService.global(),
  })
  readonly refreshProvider!: RefreshProvider<this>;

  @Provider({
    extends: SelectionProvider,
    type: SelectionService,
    observes: false,
    service: SelectionService.global(),
  })
  readonly selectionProvider!: SelectionProvider<this>;

  @Provider({
    extends: WarpProvider,
    type: WarpService,
    observes: false,
    service: WarpService.global(),
  })
  readonly warpProvider!: WarpProvider<this>;

  @Property({type: Object, inherits: true, state: null, updateFlags: Model.NeedsReconcile})
  readonly warpRef!: Property<this, WarpRef | null>;

  /** @internal */
  get superModelContext(): ModelContext {
    const parent = this.parent;
    if (parent !== null) {
      return parent.modelContext;
    } else {
      return this.refreshProvider.updatedModelContext();
    }
  }

  /** @internal */
  extendModelContext(modelContext: ModelContext): ModelContextType<this> {
    return modelContext as ModelContextType<this>;
  }

  get modelContext(): ModelContextType<this> {
    if ((this.flags & Model.ContextualFlag) !== 0) {
      return ModelContext.current as ModelContextType<this>;
    } else {
      return this.extendModelContext(this.superModelContext);
    }
  }

  /** @override */
  init(init: ModelInit): void {
    // hook
  }

  static create<S extends new () => InstanceType<S>>(this: S): InstanceType<S> {
    return new this();
  }

  static fromInit<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, init: InitType<InstanceType<S>>): InstanceType<S> {
    let type: Creatable<Model>;
    if ((typeof init === "object" && init !== null || typeof init === "function") && Creatable.is((init as ModelInit).type)) {
      type = (init as ModelInit).type!;
    } else {
      type = this as unknown as Creatable<Model>;
    }
    const view = type.create();
    view.init(init as ModelInit);
    return view as InstanceType<S>;
  }

  static fromAny<S extends abstract new (...args: any[]) => InstanceType<S>>(this: S, value: AnyModel<InstanceType<S>>): InstanceType<S> {
    if (value === void 0 || value === null) {
      return value as InstanceType<S>;
    } else if (value instanceof Model) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else if (Creatable.is(value)) {
      return (value as Creatable<InstanceType<S>>).create();
    } else {
      return (this as unknown as ModelFactory<InstanceType<S>>).fromInit(value);
    }
  }

  /** @internal */
  static override uid: () => number = (function () {
    let nextId = 1;
    return function uid(): number {
      const id = ~~nextId;
      nextId += 1;
      return id;
    }
  })();

  /** @internal */
  static override readonly MountedFlag: ModelFlags = Hierarchy.MountedFlag;
  /** @internal */
  static override readonly RemovingFlag: ModelFlags = Hierarchy.RemovingFlag;
  /** @internal */
  static override readonly TraversingFlag: ModelFlags = Hierarchy.TraversingFlag;
  /** @internal */
  static readonly AnalyzingFlag: ModelFlags = 1 << (Hierarchy.FlagShift + 0);
  /** @internal */
  static readonly RefreshingFlag: ModelFlags = 1 << (Hierarchy.FlagShift + 1);
  /** @internal */
  static readonly ContextualFlag: ModelFlags = 1 << (Hierarchy.FlagShift + 2);
  /** @internal */
  static readonly ConsumingFlag: ModelFlags = 1 << (Hierarchy.FlagShift + 3);
  /** @internal */
  static readonly UpdatingMask: ModelFlags = Model.AnalyzingFlag
                                           | Model.RefreshingFlag;
  /** @internal */
  static readonly StatusMask: ModelFlags = Model.MountedFlag
                                         | Model.RemovingFlag
                                         | Model.TraversingFlag
                                         | Model.AnalyzingFlag
                                         | Model.RefreshingFlag
                                         | Model.ContextualFlag
                                         | Model.ConsumingFlag;

  static readonly NeedsAnalyze: ModelFlags = 1 << (Hierarchy.FlagShift + 4);
  static readonly NeedsMutate: ModelFlags = 1 << (Hierarchy.FlagShift + 5);
  static readonly NeedsAggregate: ModelFlags = 1 << (Hierarchy.FlagShift + 6);
  static readonly NeedsCorrelate: ModelFlags = 1 << (Hierarchy.FlagShift + 7);
  /** @internal */
  static readonly AnalyzeMask: ModelFlags = Model.NeedsAnalyze
                                          | Model.NeedsMutate
                                          | Model.NeedsAggregate
                                          | Model.NeedsCorrelate;

  static readonly NeedsRefresh: ModelFlags = 1 << (Hierarchy.FlagShift + 8);
  static readonly NeedsValidate: ModelFlags = 1 << (Hierarchy.FlagShift + 9);
  static readonly NeedsReconcile: ModelFlags = 1 << (Hierarchy.FlagShift + 10);
  /** @internal */
  static readonly RefreshMask: ModelFlags = Model.NeedsRefresh
                                          | Model.NeedsValidate
                                          | Model.NeedsReconcile;

  /** @internal */
  static readonly UpdateMask: ModelFlags = Model.AnalyzeMask
                                         | Model.RefreshMask;

  /** @internal */
  static override readonly FlagShift: number = Hierarchy.FlagShift + 11;
  /** @internal */
  static override readonly FlagMask: ModelFlags = (1 << Model.FlagShift) - 1;

  static override readonly MountFlags: ModelFlags = 0;
  static override readonly InsertChildFlags: ModelFlags = 0;
  static override readonly RemoveChildFlags: ModelFlags = 0;
  static readonly InsertTraitFlags: ModelFlags = 0;
  static readonly RemoveTraitFlags: ModelFlags = 0;
  static readonly StartConsumingFlags: ModelFlags = 0;
  static readonly StopConsumingFlags: ModelFlags = 0;
}
