// Copyright 2015-2024 Nstream, inc.
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
import {Objects} from "@swim/util";
import type {Comparator} from "@swim/util";
import type {Consumer} from "@swim/util";
import {Affinity} from "@swim/component";
import type {FastenerFlags} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {Model} from "./Model";
import type {Trait} from "./Trait";
import type {TraitRelationDescriptor} from "./TraitRelation";
import type {TraitRelationClass} from "./TraitRelation";
import {TraitRelation} from "./TraitRelation";

/** @public */
export interface TraitSetDescriptor<R, T extends Trait> extends TraitRelationDescriptor<R, T> {
  extends?: Proto<TraitSet<any, any, any>> | boolean | null;
  ordered?: boolean;
  sorted?: boolean;
}

/** @public */
export interface TraitSetClass<F extends TraitSet<any, any, any> = TraitSet<any, any, any>> extends TraitRelationClass<F> {
  /** @internal */
  readonly OrderedFlag: FastenerFlags;
  /** @internal */
  readonly SortedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface TraitSet<R = any, T extends Trait = Trait, I extends any[] = [T | null]> extends TraitRelation<R, T, I> {
  /** @override */
  get descriptorType(): Proto<TraitSetDescriptor<R, T>>;

  /** @override */
  get fastenerType(): Proto<TraitSet<any, any, any>>;

  /** @override */
  get parent(): TraitSet<any, T, any> | null;

  /** @internal */
  readonly traits: {readonly [traitId: string]: T | undefined};

  readonly traitCount: number;

  /** @internal */
  insertTraitMap(newTrait: T, target: Trait | null): void;

  /** @internal */
  removeTraitMap(oldTrait: T): void;

  hasTrait(trait: Trait): boolean;

  addTrait(trait?: T | LikeType<T>, target?: Trait | null, key?: string): T;

  addTraits(traits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void;

  setTraits(traits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void;

  attachTrait(trait?: T | LikeType<T> | null, target?: Trait | null): T;

  attachTraits(traits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void;

  detachTrait(trait: T): T | null;

  detachTraits(traits?: {readonly [traitId: string]: T | undefined}): void;

  insertTrait(model?: Model | null, trait?: T | LikeType<T>, target?: Trait | null, key?: string): T;

  insertTraits(model: Model | null, traits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void;

  removeTrait(trait: T): T | null;

  removeTraits(traits?: {readonly [traitId: string]: T | undefined}): void;

  deleteTrait(trait: T): T | null;

  deleteTraits(traits?: {readonly [traitId: string]: T | undefined}): void;

  reinsertTrait(trait: T, target?: Trait | null): void;

  /** @internal @override */
  bindModel(model: Model, target: Model | null): void;

  /** @internal @override */
  unbindModel(model: Model): void;

  /** @override */
  detectModel(model: Model): T | null;

  /** @internal @override */
  bindTrait(trait: Trait, target: Trait | null): void;

  /** @internal @override */
  unbindTrait(trait: Trait): void;

  /** @override */
  detectTrait(trait: Trait): T | null;

  consumeTraits(consumer: Consumer): void;

  unconsumeTraits(consumer: Consumer): void;

  /** @protected @override */
  onStartConsuming(): void;

  /** @protected @override */
  onStopConsuming(): void;

  /** @override */
  recohere(t: number): void;

  /** @protected */
  traitKey(trait: T): string | undefined;

  get ordered(): boolean;

  order(ordered?: boolean): this;

  get sorted(): boolean;

  sort(sorted?: boolean): this;

  /** @protected */
  willSort(parent: Model | null): void;

  /** @protected */
  onSort(parent: Model | null): void;

  /** @protected */
  didSort(parent: Model | null): void;

  /** @internal */
  sortChildren(parent: Model, comparator?: Comparator<T>): void;

  /** @internal */
  getTargetChild(parent: Model, child: T): Trait | null;

  /** @internal */
  compareChildren(a: Model, b: Model): number;

  /** @internal */
  compareTargetChild(a: Model, b: Model): number;

  /** @protected */
  compare(a: T, b: T): number;
}

/** @public */
export const TraitSet = (<R, T extends Trait, I extends any[], F extends TraitSet<any, any, any>>() => TraitRelation.extend<TraitSet<R, T, I>, TraitSetClass<F>>("TraitSet", {
  get fastenerType(): Proto<TraitSet<any, any, any>> {
    return TraitSet;
  },

  traitKey(trait: T): string | undefined {
    return void 0;
  },

  insertTraitMap(newTrait: T, target: Trait | null): void {
    const traits = this.traits as {[traitId: string]: T | undefined};
    if (target !== null && (this.flags & TraitSet.OrderedFlag) !== 0) {
      (this as Mutable<typeof this>).traits = Objects.inserted(traits, newTrait.uid, newTrait, target);
    } else {
      traits[newTrait.uid] = newTrait;
    }
  },

  removeTraitMap(oldTrait: T): void {
    const traits = this.traits as {[traitId: string]: T | undefined};
    delete traits[oldTrait.uid];
  },

  hasTrait(trait: Trait): boolean {
    return this.traits[trait.uid] !== void 0;
  },

  addTrait(newTrait?: T | LikeType<T>, target?: Trait | null, key?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromLike(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    if (target === void 0) {
      target = null;
    }
    let model: Model | null;
    if (this.binds && (model = this.parentModel, model !== null)) {
      if (target === null) {
        if (newTrait.model === model) {
          target = newTrait.nextTrait;
        } else {
          target = this.getTargetChild(model, newTrait);
        }
      }
      if (key === void 0) {
        key = this.traitKey(newTrait);
      }
      if (newTrait.model !== model || newTrait.nextTrait !== target || newTrait.key !== key) {
        this.insertChild(model, newTrait, target, key);
      }
    }
    if (this.traits[newTrait.uid] !== void 0) {
      return newTrait;
    }
    this.insertTraitMap(newTrait, target);
    (this as Mutable<typeof this>).traitCount += 1;
    this.willAttachTrait(newTrait, target);
    this.onAttachTrait(newTrait, target);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newTrait;
  },

  addTraits(newTraits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void {
    for (const traitId in newTraits) {
      this.addTrait(newTraits[traitId]!, target);
    }
  },

  setTraits(newTraits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void {
    const binds = this.binds;
    const model = binds ? this.parentModel : null;
    const traits = this.traits;
    for (const traitId in traits) {
      if (newTraits[traitId] === void 0) {
        const oldTrait = this.detachTrait(traits[traitId]!);
        if (oldTrait !== null && binds && model !== null && oldTrait.model === model) {
          oldTrait.remove();
        }
      }
    }
    if ((this.flags & TraitSet.OrderedFlag) !== 0) {
      const orderedTraits = new Array<T>();
      for (const traitId in newTraits) {
        orderedTraits.push(newTraits[traitId]!);
      }
      for (let i = 0, n = orderedTraits.length; i < n; i += 1) {
        const newTrait = orderedTraits[i]!;
        if (traits[newTrait.uid] === void 0) {
          const targetTrait = i < n + 1 ? orderedTraits[i + 1] : target;
          this.addTrait(newTrait, targetTrait);
        }
      }
    } else {
      for (const traitId in newTraits) {
        if (traits[traitId] === void 0) {
          this.addTrait(newTraits[traitId]!, target);
        }
      }
    }
  },

  attachTrait(newTrait?: T | LikeType<T> | null, target?: Trait | null): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromLike(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    if (this.traits[newTrait.uid] !== void 0) {
      return newTrait;
    } else if (target === void 0) {
      target = null;
    }
    this.insertTraitMap(newTrait, target);
    (this as Mutable<typeof this>).traitCount += 1;
    this.willAttachTrait(newTrait, target);
    this.onAttachTrait(newTrait, target);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newTrait;
  },

  attachTraits(newTraits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void {
    for (const traitId in newTraits) {
      this.attachTrait(newTraits[traitId]!, target);
    }
  },

  detachTrait(oldTrait: T): T | null {
    if (this.traits[oldTrait.uid] === void 0) {
      return null;
    }
    (this as Mutable<typeof this>).traitCount -= 1;
    this.removeTraitMap(oldTrait);
    this.willDetachTrait(oldTrait);
    this.onDetachTrait(oldTrait);
    this.deinitTrait(oldTrait);
    this.didDetachTrait(oldTrait);
    this.setCoherent(true);
    this.decohereOutlets();
    return oldTrait;
  },

  detachTraits(traits?: {readonly [traitId: string]: T | undefined}): void {
    if (traits === void 0) {
      traits = this.traits;
    }
    for (const traitId in traits) {
      this.detachTrait(traits[traitId]!);
    }
  },

  insertTrait(model?: Model | null, newTrait?: T | LikeType<T>, target?: Trait | null, key?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromLike(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    if (model === void 0) {
      model = null;
    }
    if (!this.binds && this.traits[newTrait.uid] !== void 0 && newTrait.model !== null && model === null && key === void 0) {
      return newTrait;
    }
    if (model === null) {
      model = this.parentModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.traitKey(newTrait);
    }
    if (model !== null && (newTrait.model !== model || newTrait.key !== key)) {
      if (target === null) {
        target = this.getTargetChild(model, newTrait);
      }
      this.insertChild(model, newTrait, target, key);
    }
    if (this.traits[newTrait.uid] !== void 0) {
      return newTrait;
    }
    this.insertTraitMap(newTrait, target);
    (this as Mutable<typeof this>).traitCount += 1;
    this.willAttachTrait(newTrait, target);
    this.onAttachTrait(newTrait, target);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, target);
    this.setCoherent(true);
    this.decohereOutlets();
    return newTrait;
  },

  insertTraits(model: Model | null, newTraits: {readonly [traitId: string]: T | undefined}, target?: Trait | null): void {
    for (const traitId in newTraits) {
      this.insertTrait(model, newTraits[traitId]!, target);
    }
  },

  removeTrait(trait: T): T | null {
    if (!this.hasTrait(trait)) {
      return null;
    }
    trait.remove();
    return trait;
  },

  removeTraits(traits?: {readonly [traitId: string]: T | undefined}): void {
    if (traits === void 0) {
      traits = this.traits;
    }
    for (const traitId in traits) {
      this.removeTrait(traits[traitId]!);
    }
  },

  deleteTrait(trait: T): T | null {
    const oldTrait = this.detachTrait(trait);
    if (oldTrait === null) {
      return null;
    }
    oldTrait.remove();
    return oldTrait;
  },

  deleteTraits(traits?: {readonly [traitId: string]: T | undefined}): void {
    if (traits === void 0) {
      traits = this.traits;
    }
    for (const traitId in traits) {
      this.deleteTrait(traits[traitId]!);
    }
  },

  reinsertTrait(trait: T, target?: Trait | null): void {
    if (this.traits[trait.uid] === void 0 || (target === void 0 && (this.flags & TraitSet.SortedFlag) === 0)) {
      return;
    }
    const model = trait.model;
    if (model === null) {
      return;
    }
    const parent = trait.parent;
    if (parent === null) {
      return;
    } else if (target === void 0) {
      target = this.getTargetChild(parent, trait);
    }
    parent.reinsertChild(model, target !== null ? target.model : null);
  },

  bindModel(model: Model, target: Model | null): void {
    if (!this.binds) {
      return;
    }
    const newTrait = this.detectModel(model);
    if (newTrait === null || this.traits[newTrait.uid] !== void 0) {
      return;
    }
    this.insertTraitMap(newTrait, null);
    (this as Mutable<typeof this>).traitCount += 1;
    this.willAttachTrait(newTrait, null);
    this.onAttachTrait(newTrait, null);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, null);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindModel(model: Model): void {
    if (!this.binds) {
      return;
    }
    const oldTrait = this.detectModel(model);
    if (oldTrait === null || this.traits[oldTrait.uid] === void 0) {
      return;
    }
    (this as Mutable<typeof this>).traitCount -= 1;
    this.removeTraitMap(oldTrait);
    this.willDetachTrait(oldTrait);
    this.onDetachTrait(oldTrait);
    this.deinitTrait(oldTrait);
    this.didDetachTrait(oldTrait);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectModel(model: Model): T | null {
    return null;
  },

  bindTrait(trait: Trait, target: Trait | null): void {
    if (!this.binds) {
      return;
    }
    const newTrait = this.detectTrait(trait);
    if (newTrait === null || this.traits[newTrait.uid] !== void 0) {
      return;
    }
    this.insertTraitMap(newTrait, target);
    (this as Mutable<typeof this>).traitCount += 1;
    this.willAttachTrait(newTrait, target);
    this.onAttachTrait(newTrait, target);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, target);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindTrait(trait: Trait): void {
    if (!this.binds) {
      return;
    }
    const oldTrait = this.detectTrait(trait);
    if (oldTrait === null || this.traits[oldTrait.uid] === void 0) {
      return;
    }
    (this as Mutable<typeof this>).traitCount -= 1;
    this.removeTraitMap(oldTrait);
    this.willDetachTrait(oldTrait);
    this.onDetachTrait(oldTrait);
    this.deinitTrait(oldTrait);
    this.didDetachTrait(oldTrait);
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectTrait(trait: Trait): T | null {
    if (typeof this.traitType === "function" && trait instanceof this.traitType) {
      return trait as T;
    }
    return null;
  },

  consumeTraits(consumer: Consumer): void {
    const traits = this.traits;
    for (const traitId in traits) {
      const trait = traits[traitId]!;
      trait.consume(consumer);
    }
  },

  unconsumeTraits(consumer: Consumer): void {
    const traits = this.traits;
    for (const traitId in traits) {
      const trait = traits[traitId]!;
      trait.unconsume(consumer);
    }
  },

  onStartConsuming(): void {
    this.consumeTraits(this);
  },

  onStopConsuming(): void {
    this.unconsumeTraits(this);
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof TraitSet) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setTraits(inlet.traits);
      }
    } else {
      this.setDerived(false);
    }
  },

  get ordered(): boolean {
    return (this.flags & TraitSet.OrderedFlag) !== 0;
  },

  order(ordered?: boolean): typeof this {
    if (ordered === void 0) {
      ordered = true;
    }
    if (ordered) {
      this.setFlags(this.flags | TraitSet.OrderedFlag);
    } else {
      this.setFlags(this.flags & ~TraitSet.OrderedFlag);
    }
    return this;
  },

  get sorted(): boolean {
    return (this.flags & TraitSet.SortedFlag) !== 0;
  },

  sort(sorted?: boolean): typeof this {
    if (sorted === void 0) {
      sorted = true;
    }
    if (sorted) {
      const parent = this.parentModel;
      this.willSort(parent);
      this.setFlags(this.flags | TraitSet.SortedFlag);
      this.onSort(parent);
      this.didSort(parent);
    } else {
      this.setFlags(this.flags & ~TraitSet.SortedFlag);
    }
    return this;
  },

  willSort(parent: Model | null): void {
    // hook
  },

  onSort(parent: Model | null): void {
    if (parent !== null) {
      this.sortChildren(parent);
    }
  },

  didSort(parent: Model | null): void {
    // hook
  },

  sortChildren(parent: Model, comparator?: Comparator<T>): void {
    parent.sortChildren(this.compareChildren.bind(this));
  },

  getTargetChild(parent: Model, child: T): Trait | null {
    if ((this.flags & TraitSet.SortedFlag) !== 0 && child.model !== null) {
      const targetModel = parent.getTargetChild(child.model, this.compareTargetChild.bind(this));
      if (targetModel !== null) {
        return this.detectModel(targetModel);
      }
    }
    return null;
  },

  compareChildren(a: Model, b: Model): number {
    const traits = this.traits;
    const p = this.detectModel(a);
    const q = this.detectModel(b);
    const x = p !== null ? traits[p.uid] : void 0;
    const y = q !== null ? traits[q.uid] : void 0;
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    }
    return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
  },

  compareTargetChild(a: Model, b: Model): number {
    const traits = this.traits;
    const p = this.detectModel(a);
    const q = this.detectModel(b);
    const x = p !== null ? p : void 0;
    const y = q !== null ? traits[q.uid] : void 0;
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    }
    return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
  },

  compare(a: T, b: T): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).traits = {};
    (fastener as Mutable<typeof fastener>).traitCount = 0;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<TraitSet<any, any, any>>): void {
    super.refine(fastenerClass);
    const fastenerPrototype = fastenerClass.prototype;

    let flagsInit = fastenerPrototype.flagsInit;
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "ordered")) {
      if (fastenerPrototype.ordered) {
        flagsInit |= TraitSet.OrderedFlag;
      } else {
        flagsInit &= ~TraitSet.OrderedFlag;
      }
      delete (fastenerPrototype as TraitSetDescriptor<any, any>).ordered;
    }
    if (Object.prototype.hasOwnProperty.call(fastenerPrototype, "sorted")) {
      if (fastenerPrototype.sorted) {
        flagsInit |= TraitSet.SortedFlag;
      } else {
        flagsInit &= ~TraitSet.SortedFlag;
      }
      delete (fastenerPrototype as TraitSetDescriptor<any, any>).sorted;
    }
    Object.defineProperty(fastenerPrototype, "flagsInit", {
      value: flagsInit,
      enumerable: true,
      configurable: true,
    });
  },

  OrderedFlag: 1 << (TraitRelation.FlagShift + 0),
  SortedFlag: 1 << (TraitRelation.FlagShift + 1),

  FlagShift: TraitRelation.FlagShift + 2,
  FlagMask: (1 << (TraitRelation.FlagShift + 2)) - 1,
}))();
