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
import type {Consumer} from "@swim/util";
import type {Fastener} from "@swim/component";
import type {FastenerClass} from "@swim/component";
import type {Model} from "./Model";
import type {ModelSetDescriptor} from "./ModelSet";
import type {ModelSetClass} from "./ModelSet";
import {ModelSet} from "./ModelSet";
import type {TraitFactory} from "./Trait";
import {Trait} from "./Trait";

/** @public */
export interface TraitModelSetDescriptor<R, T extends Trait, M extends Model> extends ModelSetDescriptor<R, M> {
  extends?: Proto<TraitModelSet<any, any, any, any>> | boolean | null;
  traitKey?: string | boolean;
}

/** @public */
export interface TraitModelSetClass<F extends TraitModelSet<any, any, any, any> = TraitModelSet<any, any, any, any>> extends ModelSetClass<F> {
}

/** @public */
export interface TraitModelSet<R = any, T extends Trait = Trait, M extends Model = Model, I extends any[] = [M | null]> extends ModelSet<R, M, I> {
  /** @override */
  get descriptorType(): Proto<TraitModelSetDescriptor<R, T, M>>;

  get traitType(): TraitFactory<T> | null;

  get traitKey(): string | undefined;

  get observesTrait(): boolean;

  /** @internal */
  readonly traits: {readonly [traitId: string]: T | undefined};

  readonly traitCount: number;

  hasTrait(trait: Trait): boolean;

  addTrait(trait?: T | LikeType<T>, targetModel?: Model | null, modelKey?: string): T;

  addTraits(traits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void;

  setTraits(traits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void;

  attachTrait(trait?: T | LikeType<T> | null, targetModel?: Model | null): T;

  /** @protected */
  initTrait(trait: T): void;

  /** @protected */
  willAttachTrait(trait: T, targetModel: Model | null): void;

  /** @protected */
  onAttachTrait(trait: T, targetModel: Model | null): void;

  /** @protected */
  didAttachTrait(trait: T, targetModel: Model | null): void;

  attachTraits(traits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void;

  detachTrait(trait: T): T | null;

  /** @protected */
  deinitTrait(trait: T): void;

  /** @protected */
  willDetachTrait(trait: T): void;

  /** @protected */
  onDetachTrait(trait: T): void;

  /** @protected */
  didDetachTrait(trait: T): void;

  detachTraits(traits?: {readonly [traitId: string]: T | undefined}): void;

  insertTrait(parent?: Model | null, trait?: T | LikeType<T>, targetModel?: Model | null, modelKey?: string): T;

  insertTraits(parent: Model | null, traits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void;

  removeTrait(trait: T): T | null;

  removeTraits(traits?: {readonly [traitId: string]: T | undefined}): void;

  deleteTrait(trait: T): T | null;

  deleteTraits(traits?: {readonly [traitId: string]: T | undefined}): void;

  reinsertTrait(trait: T, targetTrait?: T | null): void;

  consumeTraits(consumer: Consumer): void;

  unconsumeTraits(consumer: Consumer): void;

  createTrait(): T;

  /** @protected */
  fromTraitLike(value: T | LikeType<T>): T;

  /** @protected */
  detectModelTrait(model: Model): T | null;

  /** @protected */
  insertModelTrait(model: M, trait: T | null, targetTrait: Trait | null, traitKey: string | undefined): void;

  /** @override */
  detectModel(model: Model): M | null;

  /** @protected @override */
  onAttachModel(model: M, targetModel: Model | null): void;

  /** @protected @override */
  onDetachModel(model: M): void;

  /** @override */
  createModel(trait?: T): M;

  /** @protected @override */
  compare(a: M, b: M): number;

  /** @protected */
  compareTraits(a: T, b: T): number;
}

/** @public */
export const TraitModelSet = (<R, T extends Trait, M extends Model, I extends any[], F extends TraitModelSet<any, any, any, any>>() => ModelSet.extend<TraitModelSet<R, T, M, I>, TraitModelSetClass<F>>("TraitModelSet", {
  traitType: null,

  traitKey: void 0,

  observesTrait: false,

  hasTrait(trait: Trait): boolean {
    return this.traits[trait.uid] !== void 0;
  },

  addTrait(newTrait?: T | LikeType<T>, targetModel?: Model | null, modelKey?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromTraitLike(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    let model = newTrait.model as M | null;
    if (model === null) {
      model = this.createModel(newTrait);
    }
    this.addModel(model, targetModel, modelKey);
    return newTrait;
  },

  addTraits(newTraits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void {
    for (const traitId in newTraits) {
      this.addTrait(newTraits[traitId]!, targetModel);
    }
  },

  setTraits(newTraits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void {
    const traits = this.traits;
    for (const traitId in traits) {
      if (newTraits[traitId] === void 0) {
        this.detachTrait(traits[traitId]!);
      }
    }
    for (const traitId in newTraits) {
      if (traits[traitId] === void 0) {
        this.attachTrait(newTraits[traitId]!, targetModel);
      }
    }
  },

  attachTrait(newTrait?: T | LikeType<T> | null, targetModel?: Model | null): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromTraitLike(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    const traits = this.traits as {[traitId: string]: T | undefined};
    if (traits[newTrait.uid] !== void 0) {
      return newTrait;
    } else if (targetModel === void 0) {
      targetModel = null;
    }
    traits[newTrait.uid] = newTrait;
    (this as Mutable<typeof this>).traitCount += 1;
    let model = newTrait.model as M | null;
    if (model === null) {
      model = this.createModel(newTrait);
    }
    this.attachModel(model, targetModel);
    this.willAttachTrait(newTrait, targetModel);
    this.onAttachTrait(newTrait, targetModel);
    this.initTrait(newTrait);
    this.didAttachTrait(newTrait, targetModel);
    return newTrait;
  },

  initTrait(trait: T): void {
    // hook
  },

  willAttachTrait(trait: T, targetModel: Model | null): void {
    // hook
  },

  onAttachTrait(trait: T, targetModel: Model | null): void {
    if (this.observesTrait) {
      trait.observe(this as Observes<T>);
    }
  },

  didAttachTrait(trait: T, targetModel: Model | null): void {
    // hook
  },

  attachTraits(newTraits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void {
    for (const traitId in newTraits) {
      this.attachTrait(newTraits[traitId]!, targetModel);
    }
  },

  detachTrait(oldTrait: T): T | null {
    const traits = this.traits as {[traitId: string]: T | undefined};
    if (traits[oldTrait.uid] === void 0) {
      return null;
    }
    (this as Mutable<typeof this>).traitCount -= 1;
    delete traits[oldTrait.uid];
    this.willDetachTrait(oldTrait);
    this.onDetachTrait(oldTrait);
    this.deinitTrait(oldTrait);
    this.didDetachTrait(oldTrait);
    const model = oldTrait.model as M | null;
    if (model !== null) {
      this.detachModel(model);
    }
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

  detachTraits(traits?: {readonly [traitId: string]: T | undefined}): void {
    if (traits === void 0) {
      traits = this.traits;
    }
    for (const traitId in traits) {
      this.detachTrait(traits[traitId]!);
    }
  },

  insertTrait(parent?: Model | null, newTrait?: T | LikeType<T>, targetModel?: Model | null, modelKey?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromTraitLike(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    let model = newTrait.model as M | null;
    if (model === null) {
      model = this.createModel(newTrait);
    }
    this.insertModel(parent, model, targetModel, modelKey);
    return newTrait;
  },

  insertTraits(parent: Model | null, newTraits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void {
    for (const traitId in newTraits) {
      this.insertTrait(parent, newTraits[traitId]!, targetModel);
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

  reinsertTrait(trait: T, targetTrait: T | null): void {
    const model = trait.model as M | null;
    if (model === null) {
      return;
    }
    const targetModel = targetTrait !== null ? targetTrait.model : null;
    this.reinsertModel(model, targetModel);
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
    return model.findTrait(this.traitKey, this.traitType as unknown as Class<T> | null);
  },

  insertModelTrait(model: M, trait: T, targetTrait: Trait | null, traitKey: string | undefined): void {
    model.insertTrait(trait, targetTrait, traitKey);
  },

  detectModel(model: Model): M | null {
    if (this.detectModelTrait(model) !== null) {
      return model as M;
    }
    return null;
  },

  onAttachModel(model: M, targetModel: Model | null): void {
    const trait = this.detectModelTrait(model);
    if (trait !== null) {
      this.attachTrait(trait, targetModel);
    }
    super.onAttachModel(model, targetModel);
  },

  onDetachModel(model: M): void {
    super.onDetachModel(model);
    const trait = this.detectModelTrait(model);
    if (trait !== null) {
      this.detachTrait(trait);
    }
  },

  createModel(trait?: T): M {
    const model = super.createModel() as M;
    if (trait === void 0) {
      trait = this.createTrait();
    }
    this.insertModelTrait(model, trait, null, this.traitKey);
    return model;
  },

  compare(a: M, b: M): number {
    const x = this.detectModelTrait(a);
    const y = this.detectModelTrait(b);
    if (x !== null && y !== null) {
      return this.compareTraits(x, y);
    }
    return x !== null ? 1 : y !== null ? -1 : 0;
  },

  compareTraits(a: T, b: T): number {
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

  refine(fastenerClass: FastenerClass<TraitModelSet<any, any, any, any>>): void {
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
