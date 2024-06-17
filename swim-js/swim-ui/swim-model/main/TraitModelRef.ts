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
import type {Class} from "@swim/util";
import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {Observes} from "@swim/util";
import {Fastener} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import type {Model} from "./Model";
import type {ModelRefDescriptor} from "./ModelRef";
import type {ModelRefClass} from "./ModelRef";
import {ModelRef} from "./ModelRef";
import type {TraitFactory} from "./Trait";
import {Trait} from "./Trait";

/** @public */
export interface TraitModelRefDescriptor<R, T extends Trait, M extends Model> extends ModelRefDescriptor<R, M> {
  extends?: Proto<TraitModelRef<any, any, any, any>> | boolean | null;
  traitKey?: string | boolean;
}

/** @public */
export interface TraitModelRefClass<F extends TraitModelRef<any, any, any, any> = TraitModelRef<any, any, any, any>> extends ModelRefClass<F> {
}

/** @public */
export interface TraitModelRef<R = any, T extends Trait = Trait, M extends Model = Model, I extends any[] = [M | null]> extends ModelRef<R, M, I> {
  /** @override */
  get descriptorType(): Proto<TraitModelRefDescriptor<R, T, M>>;

  get traitType(): TraitFactory<T> | null;

  get traitKey(): string | undefined;

  get observesTrait(): boolean;

  /** @override */
  set(traitOrModel: T | M | LikeType<M> | Fastener<any, I[0], any> | null): R;

  /** @override */
  setIntrinsic(traitOrModel: T | M | LikeType<M> | Fastener<any, I[0], any> | null): R;

  readonly trait: T | null;

  getTrait(): T;

  setTrait(trait: T | LikeType<T> | null, targetTrait?: Trait | null, modelKey?: string): T | null;

  attachTrait(trait?: T | LikeType<T> | null, targetTrait?: Trait | null): T;

  /** @protected */
  initTrait(trait: T): void;

  /** @protected */
  willAttachTrait(trait: T, targetTrait: Trait | null): void;

  /** @protected */
  onAttachTrait(trait: T, targetTrait: Trait | null): void;

  /** @protected */
  didAttachTrait(trait: T, targetTrait: Trait | null): void;

  detachTrait(): T | null;

  /** @protected */
  deinitTrait(trait: T): void;

  /** @protected */
  willDetachTrait(trait: T): void;

  /** @protected */
  onDetachTrait(trait: T): void;

  /** @protected */
  didDetachTrait(trait: T): void;

  insertTrait(model?: M | null, trait?: T | LikeType<T>, targetTrait?: Trait | null, modelKey?: string): T;

  removeTrait(): T | null;

  deleteTrait(): T | null;

  createTrait(): T;

  /** @protected */
  fromTraitLike(value: T | LikeType<T>): T;

  /** @protected */
  detectModelTrait(model: Model): T | null;

  /** @protected */
  insertModelTrait(model: M, trait: T | null, targetTrait: Trait | null, traitKey: string | undefined): void;

  /** @protected @override */
  onAttachModel(model: M, targetModel: Model | null): void;

  /** @protected @override */
  onDetachModel(model: M): void;

  /** @override */
  createModel(trait?: T): M;
}

/** @public */
export const TraitModelRef = (<R, T extends Trait, M extends Model, I extends any[], F extends TraitModelRef<any, any, any, any>>() => ModelRef.extend<TraitModelRef<R, T, M, I>, TraitModelRefClass<F>>("TraitModelRef", {
  set(traitOrModel: T | M | LikeType<M> | Fastener<any, I[0], any> | null): R {
    if (traitOrModel instanceof Fastener) {
      this.bindInlet(traitOrModel);
    } else if (traitOrModel instanceof Trait) {
      this.setTrait(traitOrModel);
    } else {
      this.setModel(traitOrModel);
    }
    return this.owner;
  },

  setIntrinsic(traitOrModel: T | M | LikeType<M> | Fastener<any, I[0], any> | null): R {
    if (traitOrModel instanceof Fastener) {
      this.bindInlet(traitOrModel);
    } else if (traitOrModel instanceof Trait) {
      this.setTrait(traitOrModel);
    } else {
      this.setModel(traitOrModel);
    }
    return this.owner;
  },

  traitType: null,

  traitKey: void 0,

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

  setTrait(newTrait: T | LikeType<T> | null, targetTrait?: Trait | null, modelKey?: string): T | null {
    if (newTrait !== null) {
      newTrait = this.fromTraitLike(newTrait);
    }
    let oldTrait = this.trait;
    if (oldTrait === newTrait) {
      return oldTrait;
    } else if (targetTrait === void 0) {
      targetTrait = null;
    }
    let model = this.model;
    if (model === null && newTrait !== null) {
      model = this.createModel(newTrait);
      const targetModel = targetTrait !== null ? targetTrait.model : null;
      this.setModel(model, targetModel, modelKey);
    }
    if (model !== null) {
      if (oldTrait !== null && oldTrait.model === model) {
        if (targetTrait === null) {
          targetTrait = oldTrait.nextTrait;
        }
        oldTrait.remove();
      }
      if (newTrait !== null) {
        this.insertModelTrait(model, newTrait, targetTrait, this.traitKey);
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
      this.willAttachTrait(newTrait, targetTrait);
      this.onAttachTrait(newTrait, targetTrait);
      this.initTrait(newTrait);
      this.didAttachTrait(newTrait, targetTrait);
    }
    return oldTrait;
  },

  attachTrait(newTrait?: T | LikeType<T> | null, targetTrait?: Trait | null): T {
    let oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromTraitLike(newTrait);
    } else if (oldTrait === null) {
      newTrait = this.createTrait();
    } else {
      newTrait = oldTrait;
    }
    if (targetTrait === void 0) {
      targetTrait = null;
    }
    let model = this.model;
    if (model === null) {
      model = this.createModel(newTrait);
      const targetModel = targetTrait !== null ? targetTrait.model : null;
      this.attachModel(model, targetModel);
      oldTrait = this.trait;
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
    this.willAttachTrait(newTrait, targetTrait);
    this.onAttachTrait(newTrait, targetTrait);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, targetTrait);
    return newTrait;
  },

  initTrait(trait: T): void {
    // hook
  },

  willAttachTrait(trait: T, targetTrait: Trait | null): void {
    // hook
  },

  onAttachTrait(trait: T, targetTrait: Trait | null): void {
    if (this.observesTrait) {
      trait.observe(this as Observes<T>);
    }
  },

  didAttachTrait(trait: T, targetTrait: Trait | null): void {
    // hook
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

  deinitTrait(trait: T): void {
    // hook
  },

  willDetachTrait(trait: T): void {
    // hook
  },

  onDetachTrait(trait: T): void {
    if (this.observesTrait) {
      trait.unobserve(this as Observes<T>);
    }
  },

  didDetachTrait(trait: T): void {
    // hook
  },

  insertTrait(model?: M | null, newTrait?: T | LikeType<T>, targetTrait?: Trait | null, modelKey?: string): T {
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
    if (oldTrait === newTrait && newTrait.model !== null && model === null) {
      return newTrait;
    }
    if (targetTrait === void 0) {
      targetTrait = null;
    }
    if (model === null) {
      model = this.createModel(newTrait);
      const targetModel = targetTrait !== null ? targetTrait.model : null;
      this.insertModel(null, model, targetModel, modelKey);
    }
    if (model !== null && newTrait.model !== model) {
      this.insertModelTrait(model, newTrait, targetTrait, this.traitKey);
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
      oldTrait.remove();
    }
    (this as Mutable<typeof this>).trait = newTrait;
    this.willAttachTrait(newTrait, targetTrait);
    this.onAttachTrait(newTrait, targetTrait);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, targetTrait);
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

  detectModelTrait(model: Model): T | null {
    return model.findTrait(this.traitKey, this.traitType as unknown as Class<T>);
  },

  insertModelTrait(model: M, trait: T, targetTrait: Trait | null, traitKey: string | undefined): void {
    model.insertTrait(trait, targetTrait, traitKey);
  },

  onAttachModel(model: M, targetModel: Model | null): void {
    const trait = this.detectModelTrait(model);
    if (trait !== null) {
      const targetTrait = targetModel !== null ? this.detectModelTrait(targetModel) : null;
      this.attachTrait(trait, targetTrait);
    }
    super.onAttachModel(model, targetModel);
  },

  onDetachModel(model: M): void {
    super.onDetachModel(model);
    this.detachTrait();
  },

  createModel(trait?: T): M {
    const model = super.createModel() as M;
    if (trait === void 0) {
      trait = this.createTrait();
    }
    this.insertModelTrait(model, trait, null, this.traitKey);
    return model;
  },
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).trait = null;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<TraitModelRef<any, any, any, any>>): void {
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
