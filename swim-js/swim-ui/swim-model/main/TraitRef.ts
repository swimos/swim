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
import {Affinity} from "@swim/component";
import {FastenerContext} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {Model} from "./Model";
import type {Trait} from "./Trait";
import type {TraitRelationDescriptor} from "./TraitRelation";
import type {TraitRelationClass} from "./TraitRelation";
import {TraitRelation} from "./TraitRelation";

/** @public */
export interface TraitRefDescriptor<R, T extends Trait> extends TraitRelationDescriptor<R, T> {
  extends?: Proto<TraitRef<any, any, any>> | boolean | null;
  traitKey?: string | boolean;
}

/** @public */
export interface TraitRefClass<F extends TraitRef<any, any, any> = TraitRef<any, any, any>> extends TraitRelationClass<F> {
  tryTrait<R, K extends keyof R, F extends R[K] = R[K]>(owner: R, fastenerName: K): (F extends {readonly trait: infer T | null} ? T | null : never) | null;
}

/** @public */
export interface TraitRef<R = any, T extends Trait = Trait, I extends any[] = [T | null]> extends TraitRelation<R, T, I> {
  /** @override */
  get descriptorType(): Proto<TraitRefDescriptor<R, T>>;

  /** @override */
  get fastenerType(): Proto<TraitRef<any, any, any>>;

  /** @override */
  get parent(): TraitRef<any, T, any> | null;

  get inletTrait(): T | null;

  getInletTrait(): T;

  get(): T | null;

  set(trait: T | LikeType<T> | Fastener<any, I[0], any> | null): R;

  setIntrinsic(trait: T | LikeType<T> | Fastener<any, I[0], any> | null): R;

  get traitKey(): string | undefined;

  readonly trait: T | null;

  getTrait(): T;

  setTrait(trait: T | LikeType<T> | null, target?: Trait | null, key?: string): T | null;

  attachTrait(trait?: T | LikeType<T> | null, target?: Trait | null): T;

  detachTrait(): T | null;

  insertTrait(model?: Model | null, trait?: T | LikeType<T>, target?: Trait | null, key?: string): T;

  removeTrait(): T | null;

  deleteTrait(): T | null;

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

  /** @protected @override */
  onStartConsuming(): void;

  /** @protected @override */
  onStopConsuming(): void;

  /** @override */
  recohere(t: number): void;
}

/** @public */
export const TraitRef = (<R, T extends Trait, I extends any[], F extends TraitRef<any, any, any>>() => TraitRelation.extend<TraitRef<R, T, I>, TraitRefClass<F>>("TraitRef", {
  get fastenerType(): Proto<TraitRef<any, any, any>> {
    return TraitRef;
  },

  get inletTrait(): T | null {
    const inlet = this.inlet;
    return inlet instanceof TraitRef ? inlet.trait : null;
  },

  getInletTrait(): T {
    const inletTrait = this.inletTrait;
    if (inletTrait === void 0 || inletTrait === null) {
      let message = inletTrait + " ";
      const name = this.name.toString();
      if (name.length !== 0) {
        message += name + " ";
      }
      message += "inlet trait";
      throw new TypeError(message);
    }
    return inletTrait;
  },

  get(): T | null {
    return this.trait;
  },

  set(trait: T | LikeType<T> | Fastener<any, I[0], any> | null): R {
    if (trait instanceof Fastener) {
      this.bindInlet(trait);
    } else {
      this.setTrait(trait);
    }
    return this.owner;
  },

  setIntrinsic(trait: T | LikeType<T> | Fastener<any, I[0], any> | null): R {
    if (trait instanceof Fastener) {
      this.bindInlet(trait);
    } else {
      this.setTrait(trait);
    }
    return this.owner;
  },

  traitKey: void 0,

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
    if (newTrait !== null) {
      newTrait = this.fromLike(newTrait);
    }
    let oldTrait = this.trait;
    if (oldTrait === newTrait) {
      this.setCoherent(true);
      return oldTrait;
    } else if (target === void 0) {
      target = null;
    }
    let model: Model | null;
    if (this.binds && (model = this.parentModel, model !== null)) {
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
        this.insertChild(model, newTrait, target, key);
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
    this.setCoherent(true);
    this.decohereOutlets();
    return oldTrait;
  },

  attachTrait(newTrait?: T | LikeType<T> | null, target?: Trait | null): T {
    const oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromLike(newTrait);
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
    this.setCoherent(true);
    this.decohereOutlets();
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
    this.setCoherent(true);
    this.decohereOutlets();
    return oldTrait;
  },

  insertTrait(model?: Model | null, newTrait?: T | LikeType<T>, target?: Trait | null, key?: string): T {
    let oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromLike(newTrait);
    } else if (oldTrait === null) {
      newTrait = this.createTrait();
    } else {
      newTrait = oldTrait;
    }
    if (model === void 0) {
      model = null;
    }
    if (!this.binds && oldTrait === newTrait && newTrait.model !== null && model === null && key === void 0) {
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
      this.insertChild(model, newTrait, target, key);
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
      if (this.binds && model !== null && oldTrait.model === model) {
        oldTrait.remove();
      }
    }
    (this as Mutable<typeof this>).trait = newTrait;
    this.willAttachTrait(newTrait, target);
    this.onAttachTrait(newTrait, target);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, target);
    this.setCoherent(true);
    this.decohereOutlets();
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

  bindModel(model: Model, target: Model | null): void {
    if (!this.binds || this.trait !== null) {
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
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindModel(model: Model): void {
    if (!this.binds) {
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
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectModel(model: Model): T | null {
    return null;
  },

  bindTrait(trait: Trait, target: Trait | null): void {
    if (!this.binds || this.trait !== null) {
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
    this.setCoherent(true);
    this.decohereOutlets();
  },

  unbindTrait(trait: Trait): void {
    if (!this.binds) {
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
    this.setCoherent(true);
    this.decohereOutlets();
  },

  detectTrait(trait: Trait): T | null {
    const key = this.traitKey;
    if (key !== void 0 && key === trait.key) {
      return trait as T;
    }
    return null;
  },

  onStartConsuming(): void {
    const trait = this.trait;
    if (trait !== null) {
      trait.consume(this);
    }
  },

  onStopConsuming(): void {
    const trait = this.trait;
    if (trait !== null) {
      trait.unconsume(this);
    }
  },

  recohere(t: number): void {
    this.setCoherentTime(t);
    const inlet = this.inlet;
    if (inlet instanceof TraitRef) {
      this.setDerived((this.flags & Affinity.Mask) <= Math.min(inlet.flags & Affinity.Mask, Affinity.Intrinsic));
      if ((this.flags & Fastener.DerivedFlag) !== 0) {
        this.setTrait(inlet.trait);
      }
    } else {
      this.setDerived(false);
    }
  },
},
{
  tryTrait<R, K extends keyof R, F extends R[K]>(owner: R, fastenerName: K): (F extends {readonly trait: infer T | null} ? T | null : never) | null {
    const metaclass = FastenerContext.getMetaclass(owner);
    const traitRef = metaclass !== null ? metaclass.tryFastener(owner, fastenerName) : null;
    return traitRef instanceof TraitRef ? traitRef.trait : null;
  },

  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).trait = null;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<TraitRef<any, any, any>>): void {
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
  },
}))();
