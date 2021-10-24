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

import type {Mutable, Class, ObserverType} from "@swim/util";
import type {FastenerOwner} from "@swim/fastener";
import type {Model} from "../model/Model";
import type {AnyTrait, TraitFactory, Trait} from "./Trait";
import {TraitRelationInit, TraitRelationClass, TraitRelation} from "./TraitRelation";

export type TraitSetType<F extends TraitSet<any, any>> =
  F extends TraitSet<any, infer T> ? T : never;

export interface TraitSetInit<T extends Trait = Trait> extends TraitRelationInit<T> {
  extends?: {prototype: TraitSet<any, any>} | string | boolean | null;
  key?(trait: T): string | undefined;
}

export type TraitSetDescriptor<O = unknown, T extends Trait = Trait, I = {}> = ThisType<TraitSet<O, T> & I> & TraitSetInit<T> & Partial<I>;

export interface TraitSetClass<F extends TraitSet<any, any> = TraitSet<any, any>> extends TraitRelationClass<F> {
}

export interface TraitSetFactory<F extends TraitSet<any, any> = TraitSet<any, any>> extends TraitSetClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitSetFactory<F> & I;

  define<O, T extends Trait = Trait>(className: string, descriptor: TraitSetDescriptor<O, T>): TraitSetFactory<TraitSet<any, T>>;
  define<O, T extends Trait = Trait>(className: string, descriptor: {observes: boolean} & TraitSetDescriptor<O, T, ObserverType<T>>): TraitSetFactory<TraitSet<any, T>>;
  define<O, T extends Trait = Trait, I = {}>(className: string, descriptor: TraitSetDescriptor<O, T, I>): TraitSetFactory<TraitSet<any, T> & I>;
  define<O, T extends Trait = Trait, I = {}>(className: string, descriptor: {observes: boolean} & TraitSetDescriptor<O, T, I & ObserverType<T>>): TraitSetFactory<TraitSet<any, T> & I>;

  <O, T extends Trait = Trait>(descriptor: TraitSetDescriptor<O, T>): PropertyDecorator;
  <O, T extends Trait = Trait>(descriptor: {observes: boolean} & TraitSetDescriptor<O, T, ObserverType<T>>): PropertyDecorator;
  <O, T extends Trait = Trait, I = {}>(descriptor: TraitSetDescriptor<O, T, I>): PropertyDecorator;
  <O, T extends Trait = Trait, I = {}>(descriptor: {observes: boolean} & TraitSetDescriptor<O, T, I & ObserverType<T>>): PropertyDecorator;
}

export interface TraitSet<O = unknown, T extends Trait = Trait> extends TraitRelation<O, T> {
  (newTrait: AnyTrait<T>): O;

  /** @override */
  get familyType(): Class<TraitSet<any, any>> | null;

  /** @internal */
  readonly traits: {readonly [id: number]: T | undefined};

  readonly traitCount: number;

  hasTrait(trait: T): boolean;

  addTrait<T2 extends T>(trait: T2 | TraitFactory<T2>, targetTrait?: Trait | null, key?: string): T2;
  addTrait(trait: AnyTrait<T>, targetTrait?: Trait | null, key?: string): T;
  addTrait(trait?: AnyTrait<T> | null, targetTrait?: Trait | null, key?: string): T | null;

  attachTrait<T2 extends T>(trait: T2 | TraitFactory<T2>, targetTrait?: Trait | null): T2;
  attachTrait(trait: AnyTrait<T>, targetTrait?: Trait | null): T;
  attachTrait(trait?: AnyTrait<T> | null, targetTrait?: Trait | null): T | null;

  detachTrait(trait: T): T | null;

  insertTrait(model?: Model | null, newTrait?: AnyTrait<T> | null, targetTrait?: Trait | null, key?: string): T | null;

  removeTrait(trait: T): T | null;

  deleteTrait(trait: T): T | null;

  /** @internal @override */
  bindModel(model: Model, targetModel: Model | null): void;

  /** @internal @override */
  unbindModel(model: Model): void;

  /** @override */
  detectModel(model: Model): T | null;

  /** @internal @override */
  bindTrait(trait: Trait, targetTrait: Trait | null): void;

  /** @internal @override */
  unbindTrait(trait: Trait): void;

  /** @override */
  detectTrait(trait: Trait): T | null;

  /** @internal @protected */
  key(trait: T): string | undefined;
}

export const TraitSet = (function (_super: typeof TraitRelation) {
  const TraitSet: TraitSetFactory = _super.extend("TraitSet");

  Object.defineProperty(TraitSet.prototype, "familyType", {
    get: function (this: TraitSet): Class<TraitSet<any, any>> | null {
      return TraitSet;
    },
    configurable: true,
  });

  TraitSet.prototype.hasTrait = function <T extends Trait>(this: TraitSet<unknown, T>, trait: T): boolean {
    return this.traits[trait.uid] !== void 0;
  };

  TraitSet.prototype.addTrait = function <T extends Trait>(this: TraitSet<unknown, T>, newTrait?: AnyTrait<T> | null, targetTrait?: Trait | null, key?: string): T | null {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    if (newTrait !== null) {
      if (targetTrait === void 0) {
        targetTrait = null;
      }
      let model: Model | null;
      if (this.binds && (model = this.parentModel, model !== null)) {
        if (key === void 0) {
          key = this.key(newTrait);
        }
        this.insertChild(model, newTrait, targetTrait, key);
      }
      const traits = this.traits as {[id: number]: T | undefined};
      if (traits[newTrait.uid] === void 0) {
        this.willAttachTrait(newTrait, targetTrait);
        traits[newTrait.uid] = newTrait;
        (this as Mutable<typeof this>).traitCount += 1;
        this.onAttachTrait(newTrait, targetTrait);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, targetTrait);
      }
    }
    return newTrait;
  };

  TraitSet.prototype.attachTrait = function <T extends Trait>(this: TraitSet<unknown, T>, newTrait?: AnyTrait<T> | null, targetTrait?: Trait | null): T | null {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    const traits = this.traits as {[id: number]: T | undefined};
    if (newTrait !== null && traits[newTrait.uid] === void 0) {
      if (targetTrait === void 0) {
        targetTrait = null;
      }
      this.willAttachTrait(newTrait, targetTrait);
      traits[newTrait.uid] = newTrait;
      (this as Mutable<typeof this>).traitCount += 1;
      this.onAttachTrait(newTrait, targetTrait);
      this.initTrait(newTrait);
      this.didAttachTrait(newTrait, targetTrait);
    }
    return newTrait;
  };

  TraitSet.prototype.detachTrait = function <T extends Trait>(this: TraitSet<unknown, T>, oldTrait: T): T | null {
    const traits = this.traits as {[id: number]: T | undefined};
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

  TraitSet.prototype.insertTrait = function <T extends Trait>(this: TraitSet<unknown, T>, model?: Model | null, newTrait?: AnyTrait<T> | null, targetTrait?: Trait | null, key?: string): T | null {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    const traits = this.traits as {[id: number]: T | undefined};
    if (newTrait !== null) {
      if (model === void 0 || model === null) {
        model = this.parentModel;
      }
      if (targetTrait === void 0) {
        targetTrait = null;
      }
      if (key === void 0) {
        key = this.key(newTrait);
      }
      if (model !== null && (newTrait.model !== model || newTrait.key !== key)) {
        this.insertChild(model, newTrait, targetTrait, key);
      }
      if (traits[newTrait.uid] === void 0) {
        this.willAttachTrait(newTrait, targetTrait);
        traits[newTrait.uid] = newTrait;
        (this as Mutable<typeof this>).traitCount += 1;
        this.onAttachTrait(newTrait, targetTrait);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, targetTrait);
      }
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

  TraitSet.prototype.bindModel = function <T extends Trait>(this: TraitSet<unknown, T>, model: Model, targetModel: Model | null): void {
    if (this.binds) {
      const newTrait = this.detectModel(model);
      const traits = this.traits as {[id: number]: T | undefined};
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
      const traits = this.traits as {[id: number]: T | undefined};
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

  TraitSet.prototype.bindTrait = function <T extends Trait>(this: TraitSet<unknown, T>, trait: Trait, targetTrait: Trait | null): void {
    if (this.binds) {
      const newTrait = this.detectTrait(trait);
      const traits = this.traits as {[id: number]: T | undefined};
      if (newTrait !== null && traits[newTrait.uid] === void 0) {
        this.willAttachTrait(newTrait, targetTrait);
        traits[newTrait.uid] = newTrait;
        (this as Mutable<typeof this>).traitCount += 1;
        this.onAttachTrait(newTrait, targetTrait);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, targetTrait);
      }
    }
  };

  TraitSet.prototype.unbindTrait = function <T extends Trait>(this: TraitSet<unknown, T>, trait: Trait): void {
    if (this.binds) {
      const oldTrait = this.detectTrait(trait);
      const traits = this.traits as {[id: number]: T | undefined};
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
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;

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
      return fastener;
    };

    return fastenerClass;
  };

  return TraitSet;
})(TraitRelation);
