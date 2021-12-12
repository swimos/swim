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

import type {Mutable, Proto, ObserverType} from "@swim/util";
import type {FastenerOwner, FastenerFlags} from "@swim/component";
import type {Model} from "../model/Model";
import type {AnyTrait, Trait} from "./Trait";
import {TraitRelationInit, TraitRelationClass, TraitRelation} from "./TraitRelation";

/** @internal */
export type TraitSetType<F extends TraitSet<any, any>> =
  F extends TraitSet<any, infer T> ? T : never;

/** @public */
export interface TraitSetInit<T extends Trait = Trait> extends TraitRelationInit<T> {
  extends?: {prototype: TraitSet<any, any>} | string | boolean | null;
  key?(trait: T): string | undefined;
  compare?(a: T, b: T): number;

  sorted?: boolean;
  willSort?(parent: Model | null): void;
  didSort?(parent: Model | null): void;
  sortChildren?(parent: Model): void;
  compareChildren?(a: Trait, b: Trait): number;
}

/** @public */
export type TraitSetDescriptor<O = unknown, T extends Trait = Trait, I = {}> = ThisType<TraitSet<O, T> & I> & TraitSetInit<T> & Partial<I>;

/** @public */
export interface TraitSetClass<F extends TraitSet<any, any> = TraitSet<any, any>> extends TraitRelationClass<F> {
  /** @internal */
  readonly SortedFlag: FastenerFlags;

  /** @internal @override */
  readonly FlagShift: number;
  /** @internal @override */
  readonly FlagMask: FastenerFlags;
}

/** @public */
export interface TraitSetFactory<F extends TraitSet<any, any> = TraitSet<any, any>> extends TraitSetClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitSetFactory<F> & I;

  define<O, T extends Trait = Trait>(className: string, descriptor: TraitSetDescriptor<O, T>): TraitSetFactory<TraitSet<any, T>>;
  define<O, T extends Trait = Trait>(className: string, descriptor: {observes: boolean} & TraitSetDescriptor<O, T, ObserverType<T>>): TraitSetFactory<TraitSet<any, T>>;
  define<O, T extends Trait = Trait, I = {}>(className: string, descriptor: {implements: unknown} & TraitSetDescriptor<O, T, I>): TraitSetFactory<TraitSet<any, T> & I>;
  define<O, T extends Trait = Trait, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & TraitSetDescriptor<O, T, I & ObserverType<T>>): TraitSetFactory<TraitSet<any, T> & I>;

  <O, T extends Trait = Trait>(descriptor: TraitSetDescriptor<O, T>): PropertyDecorator;
  <O, T extends Trait = Trait>(descriptor: {observes: boolean} & TraitSetDescriptor<O, T, ObserverType<T>>): PropertyDecorator;
  <O, T extends Trait = Trait, I = {}>(descriptor: {implements: unknown} & TraitSetDescriptor<O, T, I>): PropertyDecorator;
  <O, T extends Trait = Trait, I = {}>(descriptor: {implements: unknown; observes: boolean} & TraitSetDescriptor<O, T, I & ObserverType<T>>): PropertyDecorator;
}

/** @public */
export interface TraitSet<O = unknown, T extends Trait = Trait> extends TraitRelation<O, T> {
  (trait: AnyTrait<T>): O;

  /** @override */
  get fastenerType(): Proto<TraitSet<any, any>>;

  /** @internal */
  readonly traits: {readonly [traitId: number]: T | undefined};

  readonly traitCount: number;

  hasTrait(trait: Trait): boolean;

  addTrait(trait?: AnyTrait<T>, target?: Trait | null, key?: string): T;

  attachTrait(trait?: AnyTrait<T>, target?: Trait | null): T;

  detachTrait(trait: T): T | null;

  insertTrait(model?: Model | null, trait?: AnyTrait<T>, target?: Trait | null, key?: string): T;

  removeTrait(trait: T): T | null;

  deleteTrait(trait: T): T | null;

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

  /** @internal @protected */
  key(trait: T): string | undefined;

  get sorted(): boolean;

  /** @internal */
  initSorted(sorted: boolean): void;

  sort(sorted?: boolean): this;

  /** @protected */
  willSort(parent: Model | null): void;

  /** @protected */
  onSort(parent: Model | null): void;

  /** @protected */
  didSort(parent: Model | null): void;

  /** @internal @protected */
  sortChildren(parent: Model): void;

  /** @internal */
  compareChildren(a: Trait, b: Trait): number;

  /** @internal @protected */
  compare(a: T, b: T): number;
}

/** @public */
export const TraitSet = (function (_super: typeof TraitRelation) {
  const TraitSet: TraitSetFactory = _super.extend("TraitSet");

  Object.defineProperty(TraitSet.prototype, "fastenerType", {
    get: function (this: TraitSet): Proto<TraitSet<any, any>> {
      return TraitSet;
    },
    configurable: true,
  });

  TraitSet.prototype.hasTrait = function (this: TraitSet, trait: Trait): boolean {
    return this.traits[trait.uid] !== void 0;
  };

  TraitSet.prototype.addTrait = function <T extends Trait>(this: TraitSet<unknown, T>, newTrait?: AnyTrait<T>, target?: Trait | null, key?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    if (target === void 0) {
      target = null;
    }
    let model: Model | null;
    if (this.binds && (model = this.parentModel, model !== null)) {
      if (key === void 0) {
        key = this.key(newTrait);
      }
      this.insertChild(model, newTrait, target, key);
    }
    const traits = this.traits as {[traitId: number]: T | undefined};
    if (traits[newTrait.uid] === void 0) {
      this.willAttachTrait(newTrait, target);
      traits[newTrait.uid] = newTrait;
      (this as Mutable<typeof this>).traitCount += 1;
      this.onAttachTrait(newTrait, target);
      this.initTrait(newTrait);
      this.didAttachTrait(newTrait, target);
    }
    return newTrait;
  };

  TraitSet.prototype.attachTrait = function <T extends Trait>(this: TraitSet<unknown, T>, newTrait?: AnyTrait<T>, target?: Trait | null): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    const traits = this.traits as {[traitId: number]: T | undefined};
    if (traits[newTrait.uid] === void 0) {
      if (target === void 0) {
        target = null;
      }
      this.willAttachTrait(newTrait, target);
      traits[newTrait.uid] = newTrait;
      (this as Mutable<typeof this>).traitCount += 1;
      this.onAttachTrait(newTrait, target);
      this.initTrait(newTrait);
      this.didAttachTrait(newTrait, target);
    }
    return newTrait;
  };

  TraitSet.prototype.detachTrait = function <T extends Trait>(this: TraitSet<unknown, T>, oldTrait: T): T | null {
    const traits = this.traits as {[traitId: number]: T | undefined};
    if (traits[oldTrait.uid] !== void 0) {
      this.willDetachTrait(oldTrait);
      (this as Mutable<typeof this>).traitCount -= 1;
      delete traits[oldTrait.uid];
      this.onDetachTrait(oldTrait);
      this.deinitTrait(oldTrait);
      this.didDetachTrait(oldTrait);
      return oldTrait;
    }
    return null;
  };

  TraitSet.prototype.insertTrait = function <T extends Trait>(this: TraitSet<unknown, T>, model?: Model | null, newTrait?: AnyTrait<T>, target?: Trait | null, key?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    if (model === void 0 || model === null) {
      model = this.parentModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.key(newTrait);
    }
    if (model !== null && (newTrait.model !== model || newTrait.key !== key)) {
      this.insertChild(model, newTrait, target, key);
    }
    const traits = this.traits as {[traitId: number]: T | undefined};
    if (traits[newTrait.uid] === void 0) {
      this.willAttachTrait(newTrait, target);
      traits[newTrait.uid] = newTrait;
      (this as Mutable<typeof this>).traitCount += 1;
      this.onAttachTrait(newTrait, target);
      this.initTrait(newTrait);
      this.didAttachTrait(newTrait, target);
    }
    return newTrait;
  };

  TraitSet.prototype.removeTrait = function <T extends Trait>(this: TraitSet<unknown, T>, trait: T): T | null {
    if (this.hasTrait(trait)) {
      trait.remove();
      return trait;
    }
    return null;
  };

  TraitSet.prototype.deleteTrait = function <T extends Trait>(this: TraitSet<unknown, T>, trait: T): T | null {
    const oldTrait = this.detachTrait(trait);
    if (oldTrait !== null) {
      oldTrait.remove();
    }
    return oldTrait;
  };

  TraitSet.prototype.bindModel = function <T extends Trait>(this: TraitSet<unknown, T>, model: Model, target: Model | null): void {
    if (this.binds) {
      const newTrait = this.detectModel(model);
      const traits = this.traits as {[traitId: number]: T | undefined};
      if (newTrait !== null && traits[newTrait.uid] === void 0) {
        this.willAttachTrait(newTrait, null);
        traits[newTrait.uid] = newTrait;
        (this as Mutable<typeof this>).traitCount += 1;
        this.onAttachTrait(newTrait, null);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, null);
      }
    }
  };

  TraitSet.prototype.unbindModel = function <T extends Trait>(this: TraitSet<unknown, T>, model: Model): void {
    if (this.binds) {
      const oldTrait = this.detectModel(model);
      const traits = this.traits as {[traitId: number]: T | undefined};
      if (oldTrait !== null && traits[oldTrait.uid] !== void 0) {
        this.willDetachTrait(oldTrait);
        (this as Mutable<typeof this>).traitCount -= 1;
        delete traits[oldTrait.uid];
        this.onDetachTrait(oldTrait);
        this.deinitTrait(oldTrait);
        this.didDetachTrait(oldTrait);
      }
    }
  };

  TraitSet.prototype.detectModel = function <T extends Trait>(this: TraitSet<unknown, T>, model: Model): T | null {
    return null;
  };

  TraitSet.prototype.bindTrait = function <T extends Trait>(this: TraitSet<unknown, T>, trait: Trait, target: Trait | null): void {
    if (this.binds) {
      const newTrait = this.detectTrait(trait);
      const traits = this.traits as {[traitId: number]: T | undefined};
      if (newTrait !== null && traits[newTrait.uid] === void 0) {
        this.willAttachTrait(newTrait, target);
        traits[newTrait.uid] = newTrait;
        (this as Mutable<typeof this>).traitCount += 1;
        this.onAttachTrait(newTrait, target);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, target);
      }
    }
  };

  TraitSet.prototype.unbindTrait = function <T extends Trait>(this: TraitSet<unknown, T>, trait: Trait): void {
    if (this.binds) {
      const oldTrait = this.detectTrait(trait);
      const traits = this.traits as {[traitId: number]: T | undefined};
      if (oldTrait !== null && traits[oldTrait.uid] !== void 0) {
        this.willDetachTrait(oldTrait);
        (this as Mutable<typeof this>).traitCount -= 1;
        delete traits[oldTrait.uid];
        this.onDetachTrait(oldTrait);
        this.deinitTrait(oldTrait);
        this.didDetachTrait(oldTrait);
      }
    }
  };

  TraitSet.prototype.detectTrait = function <T extends Trait>(this: TraitSet<unknown, T>, trait: Trait): T | null {
    if (typeof this.type === "function" && trait instanceof this.type) {
      return trait as T;
    }
    return null;
  };

  TraitSet.prototype.key = function <T extends Trait>(this: TraitSet<unknown, T>, trait: T): string | undefined {
    return void 0;
  };

  Object.defineProperty(TraitSet.prototype, "sorted", {
    get(this: TraitSet): boolean {
      return (this.flags & TraitSet.SortedFlag) !== 0;
    },
    configurable: true,
  });

  TraitSet.prototype.initInherits = function (this: TraitSet, sorted: boolean): void {
    if (sorted) {
      (this as Mutable<typeof this>).flags = this.flags | TraitSet.SortedFlag;
    } else {
      (this as Mutable<typeof this>).flags = this.flags & ~TraitSet.SortedFlag;
    }
  };

  TraitSet.prototype.sort = function (this: TraitSet, sorted?: boolean): typeof this {
    if (sorted === void 0) {
      sorted = true;
    }
    const flags = this.flags;
    if (sorted && (flags & TraitSet.SortedFlag) === 0) {
      const parent = this.parentModel;
      this.willSort(parent);
      this.setFlags(flags | TraitSet.SortedFlag);
      this.onSort(parent);
      this.didSort(parent);
    } else if (!sorted && (flags & TraitSet.SortedFlag) !== 0) {
      this.setFlags(flags & ~TraitSet.SortedFlag);
    }
    return this;
  };

  TraitSet.prototype.willSort = function (this: TraitSet, parent: Model | null): void {
    // hook
  };

  TraitSet.prototype.onSort = function (this: TraitSet, parent: Model | null): void {
    if (parent !== null) {
      this.sortChildren(parent);
    }
  };

  TraitSet.prototype.didSort = function (this: TraitSet, parent: Model | null): void {
    // hook
  };

  TraitSet.prototype.sortChildren = function <T extends Trait>(this: TraitSet<unknown, T>, parent: Model): void {
    parent.sortTraits(this.compareChildren.bind(this));
  };

  TraitSet.prototype.compareChildren = function <T extends Trait>(this: TraitSet<unknown, T>, a: Trait, b: Trait): number {
    const traits = this.traits;
    const x = traits[a.uid];
    const y = traits[b.uid];
    if (x !== void 0 && y !== void 0) {
      return this.compare(x, y);
    } else {
      return x !== void 0 ? 1 : y !== void 0 ? -1 : 0;
    }
  };

  TraitSet.prototype.compare = function <T extends Trait>(this: TraitSet<unknown, T>, a: T, b: T): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  };

  TraitSet.construct = function <F extends TraitSet<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (newTrait: AnyTrait<TraitSetType<F>>): FastenerOwner<F> {
        fastener!.addTrait(newTrait);
        return fastener!.owner;
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).traits = {};
    (fastener as Mutable<typeof fastener>).traitCount = 0;
    return fastener;
  };

  TraitSet.define = function <O, T extends Trait>(className: string, descriptor: TraitSetDescriptor<O, T>): TraitSetFactory<TraitSet<any, T>> {
    let superClass = descriptor.extends as TraitSetFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const sorted = descriptor.sorted;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.sorted;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: TraitSet<any, any>}, fastener: TraitSet<O, T> | null, owner: O): TraitSet<O, T> {
      fastener = superClass!.construct(fastenerClass, fastener, owner);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (sorted !== void 0) {
        fastener.initSorted(sorted);
      }
      return fastener;
    };

    return fastenerClass;
  };

  (TraitSet as Mutable<typeof TraitSet>).SortedFlag = 1 << (_super.FlagShift + 0);

  (TraitSet as Mutable<typeof TraitSet>).FlagShift = _super.FlagShift + 1;
  (TraitSet as Mutable<typeof TraitSet>).FlagMask = (1 << TraitSet.FlagShift) - 1;

  return TraitSet;
})(TraitRelation);
