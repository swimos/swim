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

import type {Mutable, Class, Proto, Observes, Consumer} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import type {ModelFactory, Model} from "../model/Model";
import {ModelSetDescriptor, ModelSetClass, ModelSet} from "../model/ModelSet";
import {AnyTrait, TraitFactory, Trait} from "./Trait";

/** @public */
export type TraitModelSetTrait<F extends TraitModelSet<any, any, any>> =
  F extends {traitType?: TraitFactory<infer T>} ? T : never;

/** @public */
export type TraitModelSetModel<F extends TraitModelSet<any, any, any>> =
  F extends {modelType?: ModelFactory<infer M>} ? M : never;

/** @public */
export interface TraitModelSetDescriptor<T extends Trait = Trait, M extends Model = Model> extends ModelSetDescriptor<M> {
  extends?: Proto<TraitModelSet<any, any, any>> | string | boolean | null;
  traitType?: TraitFactory<T>;
  traitKey?: string | boolean;
  observesTrait?: boolean;
}

/** @public */
export type TraitModelSetTemplate<F extends TraitModelSet<any, any, any>> =
  ThisType<F> &
  TraitModelSetDescriptor<TraitModelSetTrait<F>, TraitModelSetModel<F>> &
  Partial<Omit<F, keyof TraitModelSetDescriptor>>;

/** @public */
export interface TraitModelSetClass<F extends TraitModelSet<any, any, any> = TraitModelSet<any, any, any>> extends ModelSetClass<F> {
  /** @override */
  specialize(template: TraitModelSetDescriptor<any, any>): TraitModelSetClass<F>;

  /** @override */
  refine(fastenerClass: TraitModelSetClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: TraitModelSetTemplate<F2>): TraitModelSetClass<F2>;
  extend<F2 extends F>(className: string, template: TraitModelSetTemplate<F2>): TraitModelSetClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: TraitModelSetTemplate<F2>): TraitModelSetClass<F2>;
  define<F2 extends F>(className: string, template: TraitModelSetTemplate<F2>): TraitModelSetClass<F2>;

  /** @override */
  <F2 extends F>(template: TraitModelSetTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface TraitModelSet<O = unknown, T extends Trait = Trait, M extends Model = Model> extends ModelSet<O, M> {
  /** @override */
  get fastenerType(): Proto<TraitModelSet<any, any, any>>;

  /** @internal */
  readonly traitType?: TraitFactory<T>; // optional prototype property

  /** @internal */
  readonly traitKey?: string; // optional prototype property

  /** @internal */
  readonly traits: {readonly [traitId: string]: T | undefined};

  readonly traitCount: number;

  hasTrait(trait: Trait): boolean;

  addTrait(trait?: AnyTrait<T>, targetModel?: Model | null, modelKey?: string): T;

  addTraits(traits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void;

  setTraits(traits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void;

  attachTrait(trait?: AnyTrait<T>, targetModel?: Model | null): T;

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

  insertTrait(parent?: Model | null, trait?: AnyTrait<T>, targetModel?: Model | null, modelKey?: string): T;

  insertTraits(parent: Model | null, traits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void;

  removeTrait(trait: T): T | null;

  removeTraits(traits?: {readonly [traitId: string]: T | undefined}): void;

  deleteTrait(trait: T): T | null;

  deleteTraits(traits?: {readonly [traitId: string]: T | undefined}): void;

  reinsertTrait(trait: T, targetTrait?: T | null): void;

  consumeTraits(consumer: Consumer): void;

  unconsumeTraits(consumer: Consumer): void;

  createTrait(): T;

  /** @internal */
  readonly observesTrait?: boolean; // optional prototype property

  /** @protected */
  fromAnyTrait(value: AnyTrait<T>): T;

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
export const TraitModelSet = (function (_super: typeof ModelSet) {
  const TraitModelSet = _super.extend("TraitModelSet", {}) as TraitModelSetClass;

  Object.defineProperty(TraitModelSet.prototype, "fastenerType", {
    value: TraitModelSet,
    configurable: true,
  });

  TraitModelSet.prototype.hasTrait = function (this: TraitModelSet, trait: Trait): boolean {
    return this.traits[trait.uid] !== void 0;
  };

  TraitModelSet.prototype.addTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, newTrait?: AnyTrait<T>, targetModel?: Model | null, modelKey?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    let model = newTrait.model;
    if (model === null) {
      model = this.createModel(newTrait);
    }
    this.addModel(model, targetModel, modelKey);
    return newTrait;
  };

  TraitModelSet.prototype.addTraits = function <T extends Trait>(this: TraitModelSet, newTraits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void {
    for (const traitId in newTraits) {
      this.addTrait(newTraits[traitId]!, targetModel);
    }
  };

  TraitModelSet.prototype.setTraits = function <T extends Trait>(this: TraitModelSet, newTraits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void {
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
  };

  TraitModelSet.prototype.attachTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, newTrait?: AnyTrait<T>, targetModel?: Model | null): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    const traits = this.traits as {[traitId: string]: T | undefined};
    if (traits[newTrait.uid] === void 0) {
      traits[newTrait.uid] = newTrait;
      (this as Mutable<typeof this>).traitCount += 1;
      if (targetModel === void 0) {
        targetModel = null;
      }
      let model = newTrait.model;
      if (model === null) {
        model = this.createModel(newTrait);
      }
      this.attachModel(model, targetModel);
      this.willAttachTrait(newTrait, targetModel);
      this.onAttachTrait(newTrait, targetModel);
      this.initTrait(newTrait);
      this.didAttachTrait(newTrait, targetModel);
    }
    return newTrait;
  };

  TraitModelSet.prototype.initTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T): void {
    // hook
  };

  TraitModelSet.prototype.willAttachTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T, targetModel: Model | null): void {
    // hook
  };

  TraitModelSet.prototype.onAttachTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T, targetModel: Model | null): void {
    if (this.observesTrait === true) {
      trait.observe(this as Observes<T>);
    }
  };

  TraitModelSet.prototype.didAttachTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T, targetModel: Model | null): void {
    // hook
  };

  TraitModelSet.prototype.attachTraits = function <T extends Trait>(this: TraitModelSet, newTraits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void {
    for (const traitId in newTraits) {
      this.attachTrait(newTraits[traitId]!, targetModel);
    }
  };

  TraitModelSet.prototype.detachTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, oldTrait: T): T | null {
    const traits = this.traits as {[traitId: string]: T | undefined};
    if (traits[oldTrait.uid] !== void 0) {
      (this as Mutable<typeof this>).traitCount -= 1;
      delete traits[oldTrait.uid];
      this.willDetachTrait(oldTrait);
      this.onDetachTrait(oldTrait);
      this.deinitTrait(oldTrait);
      this.didDetachTrait(oldTrait);
      const model = oldTrait.model;
      if (model !== null) {
        this.detachModel(model);
      }
      return oldTrait;
    }
    return null;
  };

  TraitModelSet.prototype.deinitTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T): void {
    // hook
  };

  TraitModelSet.prototype.willDetachTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T): void {
    // hook
  };

  TraitModelSet.prototype.onDetachTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T): void {
    if (this.observesTrait === true) {
      trait.unobserve(this as Observes<T>);
    }
  };

  TraitModelSet.prototype.didDetachTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T): void {
    // hook
  };

  TraitModelSet.prototype.detachTraits = function <T extends Trait>(this: TraitModelSet<unknown, T>, traits?: {readonly [traitId: string]: T | undefined}): void {
    if (traits === void 0) {
      traits = this.traits;
    }
    for (const traitId in traits) {
      this.detachTrait(traits[traitId]!);
    }
  };

  TraitModelSet.prototype.insertTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, parent?: Model | null, newTrait?: AnyTrait<T>, targetModel?: Model | null, modelKey?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    } else {
      newTrait = this.createTrait();
    }
    let model = newTrait.model;
    if (model === null) {
      model = this.createModel(newTrait);
    }
    this.insertModel(parent, model, targetModel, modelKey);
    return newTrait;
  };

  TraitModelSet.prototype.insertTraits = function <T extends Trait>(this: TraitModelSet, parent: Model | null, newTraits: {readonly [traitId: string]: T | undefined}, targetModel?: Model | null): void {
    for (const traitId in newTraits) {
      this.insertTrait(parent, newTraits[traitId]!, targetModel);
    }
  };

  TraitModelSet.prototype.removeTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T): T | null {
    if (this.hasTrait(trait)) {
      trait.remove();
      return trait;
    }
    return null;
  };

  TraitModelSet.prototype.removeTraits = function <T extends Trait>(this: TraitModelSet<unknown, T>, traits?: {readonly [traitId: string]: T | undefined}): void {
    if (traits === void 0) {
      traits = this.traits;
    }
    for (const traitId in traits) {
      this.removeTrait(traits[traitId]!);
    }
  };

  TraitModelSet.prototype.deleteTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T): T | null {
    const oldTrait = this.detachTrait(trait);
    if (oldTrait !== null) {
      oldTrait.remove();
    }
    return oldTrait;
  };

  TraitModelSet.prototype.deleteTraits = function <T extends Trait>(this: TraitModelSet<unknown, T>, traits?: {readonly [traitId: string]: T | undefined}): void {
    if (traits === void 0) {
      traits = this.traits;
    }
    for (const traitId in traits) {
      this.deleteTrait(traits[traitId]!);
    }
  };

  TraitModelSet.prototype.reinsertTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, trait: T, targetTrait: T | null): void {
    const model = trait.model;
    if (model !== null) {
      const targetModel = targetTrait !== null ? targetTrait.model : null;
      this.reinsertModel(model, targetModel);
    }
  };

  TraitModelSet.prototype.consumeTraits = function <T extends Trait>(this: TraitModelSet<unknown, T>, consumer: Consumer): void {
    const traits = this.traits;
    for (const traitId in traits) {
      const trait = traits[traitId]!;
      trait.consume(consumer);
    }
  };

  TraitModelSet.prototype.unconsumeTraits = function <T extends Trait>(this: TraitModelSet<unknown, T>, consumer: Consumer): void {
    const traits = this.traits;
    for (const traitId in traits) {
      const trait = traits[traitId]!;
      trait.unconsume(consumer);
    }
  };

  TraitModelSet.prototype.createTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>): T {
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

  TraitModelSet.prototype.fromAnyTrait = function <T extends Trait>(this: TraitModelSet<unknown, T>, value: AnyTrait<T>): T {
    const traitType = this.traitType;
    if (traitType !== void 0) {
      return traitType.fromAny(value);
    } else {
      return Trait.fromAny(value) as T;
    }
  };

  TraitModelSet.prototype.detectModelTrait = function <T extends Trait, M extends Model>(this: TraitModelSet<unknown, T, M>, model: Model): T | null {
    return model.findTrait(this.traitKey, this.traitType as unknown as Class<T>);
  };

  TraitModelSet.prototype.insertModelTrait = function <T extends Trait, M extends Model>(this: TraitModelSet<unknown, T, M>, model: M, trait: T, targetTrait: Trait | null, traitKey: string | undefined): void {
    model.insertTrait(trait, targetTrait, traitKey);
  };

  TraitModelSet.prototype.detectModel = function <T extends Trait, M extends Model>(this: TraitModelSet<unknown, T, M>, model: Model): M | null {
    if (this.detectModelTrait(model) !== null) {
      return model as M;
    }
    return null;
  };

  TraitModelSet.prototype.onAttachModel = function <T extends Trait, M extends Model>(this: TraitModelSet<unknown, T, M>, model: M, targetModel: Model | null): void {
    const trait = this.detectModelTrait(model);
    if (trait !== null) {
      this.attachTrait(trait, targetModel);
    }
    ModelSet.prototype.onAttachModel.call(this, model, targetModel);
  };

  TraitModelSet.prototype.onDetachModel = function <T extends Trait, M extends Model>(this: TraitModelSet<unknown, T, M>, model: M): void {
    ModelSet.prototype.onDetachModel.call(this, model);
    const trait = this.detectModelTrait(model);
    if (trait !== null) {
      this.detachTrait(trait);
    }
  };

  TraitModelSet.prototype.createModel = function <T extends Trait, M extends Model>(this: TraitModelSet<unknown, T, M>, trait?: T): M {
    const model = _super.prototype.createModel.call(this) as M;
    if (trait === void 0) {
      trait = this.createTrait();
    }
    this.insertModelTrait(model, trait, null, this.traitKey);
    return model;
  };

  TraitModelSet.prototype.compare = function <T extends Trait, M extends Model>(this: TraitModelSet<unknown, T, M>, a: M, b: M): number {
    const x = this.detectModelTrait(a);
    const y = this.detectModelTrait(b);
    if (x !== null && y !== null) {
      return this.compareTraits(x, y);
    } else {
      return x !== null ? 1 : y !== null ? -1 : 0;
    }
  };

  TraitModelSet.prototype.compareTraits = function <T extends Trait, M extends Model>(this: TraitModelSet<unknown, T, M>, a: T, b: T): number {
    return a.uid < b.uid ? -1 : a.uid > b.uid ? 1 : 0;
  };

  TraitModelSet.construct = function <F extends TraitModelSet<any, any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).traits = {};
    (fastener as Mutable<typeof fastener>).traitCount = 0;
    return fastener;
  };

  TraitModelSet.refine = function (fastenerClass: TraitModelSetClass<any>): void {
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
  };

  return TraitModelSet;
})(ModelSet);
