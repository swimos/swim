// Copyright 2015-2023 Swim.inc
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

import type {Mutable, Class, Proto, Observes} from "@swim/util";
import type {FastenerOwner} from "@swim/component";
import type {ModelFactory, Model} from "../model/Model";
import {ModelRefDescriptor, ModelRefClass, ModelRef} from "../model/ModelRef";
import {AnyTrait, TraitFactory, Trait} from "./Trait";

/** @public */
export type TraitModelRefTrait<F extends TraitModelRef<any, any, any>> =
  F extends {traitType?: TraitFactory<infer T>} ? T : never;

/** @public */
export type TraitModelRefModel<F extends TraitModelRef<any, any, any>> =
  F extends {modelType?: ModelFactory<infer M>} ? M : never;

/** @public */
export interface TraitModelRefDescriptor<T extends Trait = Trait, M extends Model = Model> extends ModelRefDescriptor<M> {
  extends?: Proto<TraitModelRef<any, any, any>> | string | boolean | null;
  traitType?: TraitFactory<T>;
  traitKey?: string | boolean;
  observesTrait?: boolean;
}

/** @public */
export type TraitModelRefTemplate<F extends TraitModelRef<any, any, any>> =
  ThisType<F> &
  TraitModelRefDescriptor<TraitModelRefTrait<F>, TraitModelRefModel<F>> &
  Partial<Omit<F, keyof TraitModelRefDescriptor>>;

/** @public */
export interface TraitModelRefClass<F extends TraitModelRef<any, any, any> = TraitModelRef<any, any, any>> extends ModelRefClass<F> {
  /** @override */
  specialize(template: TraitModelRefDescriptor<any, any>): TraitModelRefClass<F>;

  /** @override */
  refine(fastenerClass: TraitModelRefClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: TraitModelRefTemplate<F2>): TraitModelRefClass<F2>;
  extend<F2 extends F>(className: string, template: TraitModelRefTemplate<F2>): TraitModelRefClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: TraitModelRefTemplate<F2>): TraitModelRefClass<F2>;
  define<F2 extends F>(className: string, template: TraitModelRefTemplate<F2>): TraitModelRefClass<F2>;

  /** @override */
  <F2 extends F>(template: TraitModelRefTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface TraitModelRef<O = unknown, T extends Trait = Trait, M extends Model = Model> extends ModelRef<O, M> {
  /** @override */
  get fastenerType(): Proto<TraitModelRef<any, any, any>>;

  /** @internal */
  readonly traitType?: TraitFactory<T>; // optional prototype property

  /** @internal */
  readonly traitKey?: string; // optional prototype property

  readonly trait: T | null;

  getTrait(): T;

  setTrait(trait: AnyTrait<T> | null, targetTrait?: Trait | null, modelKey?: string): T | null;

  attachTrait(trait?: AnyTrait<T>, targetTrait?: Trait | null): T;

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

  insertTrait(model?: M | null, trait?: AnyTrait<T>, targetTrait?: Trait | null, modelKey?: string): T;

  removeTrait(): T | null;

  deleteTrait(): T | null;

  createTrait(): T;

  /** @internal */
  readonly observesTrait?: boolean; // optional prototype property

  /** @protected */
  fromAnyTrait(value: AnyTrait<T>): T;

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
export const TraitModelRef = (function (_super: typeof ModelRef) {
  const TraitModelRef = _super.extend("TraitModelRef", {}) as TraitModelRefClass;

  Object.defineProperty(TraitModelRef.prototype, "fastenerType", {
    value: TraitModelRef,
    configurable: true,
  });

  TraitModelRef.prototype.getTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>): T {
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

  TraitModelRef.prototype.setTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, newTrait: AnyTrait<T> | null, targetTrait?: Trait | null, modelKey?: string): T | null {
    if (newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
    }
    let oldTrait = this.trait;
    if (oldTrait !== newTrait) {
      if (targetTrait === void 0) {
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
          this.willAttachTrait(newTrait, targetTrait);
          this.onAttachTrait(newTrait, targetTrait);
          this.initTrait(newTrait);
          this.didAttachTrait(newTrait, targetTrait);
        }
      }
    }
    return oldTrait;
  };

  TraitModelRef.prototype.attachTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, newTrait?: AnyTrait<T>, targetTrait?: Trait | null): T {
    let oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAnyTrait(newTrait);
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
    if (oldTrait !== newTrait) {
      if (oldTrait !== null) {
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
    }
    return newTrait;
  };

  TraitModelRef.prototype.initTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, trait: T): void {
    // hook
  };

  TraitModelRef.prototype.willAttachTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitModelRef.prototype.onAttachTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, trait: T, targetTrait: Trait | null): void {
    if (this.observesTrait === true) {
      trait.observe(this as Observes<T>);
    }
  };

  TraitModelRef.prototype.didAttachTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, trait: T, targetTrait: Trait | null): void {
    // hook
  };

  TraitModelRef.prototype.detachTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>): T | null {
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

  TraitModelRef.prototype.deinitTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, trait: T): void {
    // hook
  };

  TraitModelRef.prototype.willDetachTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, trait: T): void {
    // hook
  };

  TraitModelRef.prototype.onDetachTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, trait: T): void {
    if (this.observesTrait === true) {
      trait.unobserve(this as Observes<T>);
    }
  };

  TraitModelRef.prototype.didDetachTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, trait: T): void {
    // hook
  };

  TraitModelRef.prototype.insertTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, model?: M | null, newTrait?: AnyTrait<T>, targetTrait?: Trait | null, modelKey?: string): T {
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
    if (oldTrait !== newTrait || newTrait.model === null || model !== null) {
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
        this.willAttachTrait(newTrait, targetTrait);
        this.onAttachTrait(newTrait, targetTrait);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, targetTrait);
      }
    }
    return newTrait;
  };

  TraitModelRef.prototype.removeTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>): T | null {
    const trait = this.trait;
    if (trait !== null) {
      trait.remove();
    }
    return trait;
  };

  TraitModelRef.prototype.deleteTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>): T | null {
    const trait = this.detachTrait();
    if (trait !== null) {
      trait.remove();
    }
    return trait;
  };

  TraitModelRef.prototype.createTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>): T {
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

  TraitModelRef.prototype.fromAnyTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, value: AnyTrait<T>): T {
    const traitType = this.traitType;
    if (traitType !== void 0) {
      return traitType.fromAny(value);
    } else {
      return Trait.fromAny(value) as T;
    }
  };

  TraitModelRef.prototype.detectModelTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, model: Model): T | null {
    return model.findTrait(this.traitKey, this.traitType as unknown as Class<T>);
  };

  TraitModelRef.prototype.insertModelTrait = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, model: M, trait: T, targetTrait: Trait | null, traitKey: string | undefined): void {
    model.insertTrait(trait, targetTrait, traitKey);
  };

  TraitModelRef.prototype.onAttachModel = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, model: M, targetModel: Model | null): void {
    const trait = this.detectModelTrait(model);
    if (trait !== null) {
      const targetTrait = targetModel !== null ? this.detectModelTrait(targetModel) : null;
      this.attachTrait(trait, targetTrait);
    }
    ModelRef.prototype.onAttachModel.call(this, model, targetModel);
  };

  TraitModelRef.prototype.onDetachModel = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, model: M): void {
    ModelRef.prototype.onDetachModel.call(this, model);
    this.detachTrait();
  };

  TraitModelRef.prototype.createModel = function <T extends Trait, M extends Model>(this: TraitModelRef<unknown, T, M>, trait?: T): M {
    const model = _super.prototype.createModel.call(this) as M;
    if (trait === void 0) {
      trait = this.createTrait();
    }
    this.insertModelTrait(model, trait, null, this.traitKey);
    return model;
  };

  TraitModelRef.construct = function <F extends TraitModelRef<any, any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).trait = null;
    return fastener;
  };

  TraitModelRef.refine = function (fastenerClass: TraitModelRefClass<any>): void {
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

  return TraitModelRef;
})(ModelRef);
