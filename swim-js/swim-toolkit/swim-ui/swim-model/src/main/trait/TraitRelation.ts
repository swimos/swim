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

import type {Proto, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, FastenerClass, Fastener} from "@swim/component";
import {Model} from "../model/Model";
import {AnyTrait, TraitFactory, Trait} from "./Trait";

/** @internal */
export type TraitRelationType<F extends TraitRelation<any, any>> =
  F extends TraitRelation<any, infer T> ? T : never;

/** @public */
export interface TraitRelationInit<T extends Trait = Trait> extends FastenerInit {
  extends?: {prototype: TraitRelation<any, any>} | string | boolean | null;
  type?: TraitFactory<T>;
  binds?: boolean;
  observes?: boolean;

  initTrait?(trait: T): void;
  willAttachTrait?(trait: T, target: Trait | null): void;
  didAttachTrait?(trait: T, target: Trait | null): void;

  deinitTrait?(trait: T): void;
  willDetachTrait?(trait: T): void;
  didDetachTrait?(trait: T): void;

  parentModel?: Model | null;
  insertChild?(model: Model, trait: T, target: Trait | null, key: string | undefined): void;

  detectModel?(model: Model): T | null;
  detectTrait?(trait: Trait): T | null;
  createTrait?(): T;
  fromAny?(value: AnyTrait<T>): T;
}

/** @public */
export type TraitRelationDescriptor<O = unknown, T extends Trait = Trait, I = {}> = ThisType<TraitRelation<O, T> & I> & TraitRelationInit<T> & Partial<I>;

/** @public */
export interface TraitRelationClass<F extends TraitRelation<any, any> = TraitRelation<any, any>> extends FastenerClass<F> {
}

/** @public */
export interface TraitRelationFactory<F extends TraitRelation<any, any> = TraitRelation<any, any>> extends TraitRelationClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitRelationFactory<F> & I;

  define<O, T extends Trait = Trait>(className: string, descriptor: TraitRelationDescriptor<O, T>): TraitRelationFactory<TraitRelation<any, T>>;
  define<O, T extends Trait = Trait>(className: string, descriptor: {observes: boolean} & TraitRelationDescriptor<O, T, ObserverType<T>>): TraitRelationFactory<TraitRelation<any, T>>;
  define<O, T extends Trait = Trait, I = {}>(className: string, descriptor: {implements: unknown} & TraitRelationDescriptor<O, T, I>): TraitRelationFactory<TraitRelation<any, T> & I>;
  define<O, T extends Trait = Trait, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & TraitRelationDescriptor<O, T, I & ObserverType<T>>): TraitRelationFactory<TraitRelation<any, T> & I>;

  <O, T extends Trait = Trait>(descriptor: TraitRelationDescriptor<O, T>): PropertyDecorator;
  <O, T extends Trait = Trait>(descriptor: {observes: boolean} & TraitRelationDescriptor<O, T, ObserverType<T>>): PropertyDecorator;
  <O, T extends Trait = Trait, I = {}>(descriptor: {implements: unknown} & TraitRelationDescriptor<O, T, I>): PropertyDecorator;
  <O, T extends Trait = Trait, I = {}>(descriptor: {implements: unknown; observes: boolean} & TraitRelationDescriptor<O, T, I & ObserverType<T>>): PropertyDecorator;
}

/** @public */
export interface TraitRelation<O = unknown, T extends Trait = Trait> extends Fastener<O> {
  /** @override */
  get fastenerType(): Proto<TraitRelation<any, any>>;

  /** @protected */
  initTrait(trait: T): void;

  /** @protected */
  willAttachTrait(trait: T, target: Trait | null): void;

  /** @protected */
  onAttachTrait(trait: T, target: Trait | null): void;

  /** @protected */
  didAttachTrait(trait: T, target: Trait | null): void;

  /** @protected */
  deinitTrait(trait: T): void;

  /** @protected */
  willDetachTrait(trait: T): void;

  /** @protected */
  onDetachTrait(trait: T): void;

  /** @protected */
  didDetachTrait(trait: T): void;

  /** @internal @protected */
  get parentModel(): Model | null;

  /** @internal @protected */
  insertChild(model: Model, trait: T, target: Trait | null, key: string | undefined): void;

  /** @internal */
  bindModel(model: Model, targetModel: Model | null): void;

  /** @internal */
  unbindModel(model: Model): void;

  detectModel(model: Model): T | null;

  /** @internal */
  bindTrait(trait: Trait, target: Trait | null): void;

  /** @internal */
  unbindTrait(trait: Trait): void;

  detectTrait(trait: Trait): T | null;

  createTrait(): T;

  /** @internal @protected */
  fromAny(value: AnyTrait<T>): T;

  /** @internal @protected */
  get type(): TraitFactory<T> | undefined; // optional prototype property

  /** @internal @protected */
  get binds(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observes(): boolean | undefined; // optional prototype property

  /** @internal @override */
  get lazy(): boolean; // prototype property

  /** @internal @override */
  get static(): string | boolean; // prototype property
}

/** @public */
export const TraitRelation = (function (_super: typeof Fastener) {
  const TraitRelation: TraitRelationFactory = _super.extend("TraitRelation");

  Object.defineProperty(TraitRelation.prototype, "fastenerType", {
    get: function (this: TraitRelation): Proto<TraitRelation<any, any>> {
      return TraitRelation;
    },
    configurable: true,
  });

  TraitRelation.prototype.initTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: T): void {
    // hook
  };

  TraitRelation.prototype.willAttachTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: T, target: Trait | null): void {
    // hook
  };

  TraitRelation.prototype.onAttachTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: T, target: Trait | null): void {
    if (this.observes === true) {
      trait.observe(this as ObserverType<T>);
    }
  };

  TraitRelation.prototype.didAttachTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: T, target: Trait | null): void {
    // hook
  };

  TraitRelation.prototype.deinitTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: T): void {
    // hook
  };

  TraitRelation.prototype.willDetachTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: T): void {
    // hook
  };

  TraitRelation.prototype.onDetachTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: T): void {
    if (this.observes === true) {
      trait.unobserve(this as ObserverType<T>);
    }
  };

  TraitRelation.prototype.didDetachTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: T): void {
    // hook
  };

  Object.defineProperty(TraitRelation.prototype, "parentModel", {
    get(this: TraitRelation): Model | null {
      const owner = this.owner;
      if (owner instanceof Model) {
        return owner;
      } else if (owner instanceof Trait) {
        return owner.model;
      } else {
        return null;
      }
    },
    configurable: true,
  });

  TraitRelation.prototype.insertChild = function <T extends Trait>(this: TraitRelation<unknown, T>, model: Model, trait: T, target: Trait | null, key: string | undefined): void {
    model.insertTrait(trait, target, key);
  };

  TraitRelation.prototype.bindModel = function <T extends Trait>(this: TraitRelation<unknown, T>, model: Model, targetModel: Model | null): void {
    // hook
  };

  TraitRelation.prototype.unbindModel = function <T extends Trait>(this: TraitRelation<unknown, T>, model: Model): void {
    // hook
  };

  TraitRelation.prototype.detectModel = function <T extends Trait>(this: TraitRelation<unknown, T>, model: Model): T | null {
    return null;
  };

  TraitRelation.prototype.bindTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: Trait, target: Trait | null): void {
    // hook
  };

  TraitRelation.prototype.unbindTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: Trait): void {
    // hook
  };

  TraitRelation.prototype.detectTrait = function <T extends Trait>(this: TraitRelation<unknown, T>, trait: Trait): T | null {
    return null;
  };

  TraitRelation.prototype.createTrait = function <T extends Trait>(this: TraitRelation<unknown, T>): T {
    let trait: T | undefined;
    const type = this.type;
    if (type !== void 0) {
      return type.create();
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

  TraitRelation.prototype.fromAny = function <T extends Trait>(this: TraitRelation<unknown, T>, value: AnyTrait<T>): T {
    const type = this.type;
    if (type !== void 0) {
      return type.fromAny(value);
    } else {
      return Trait.fromAny(value) as T;
    }
  };

  Object.defineProperty(TraitRelation.prototype, "lazy", {
    get: function (this: TraitRelation): boolean {
      return false;
    },
    configurable: true,
  });

  Object.defineProperty(TraitRelation.prototype, "static", {
    get: function (this: TraitRelation): string | boolean {
      return true;
    },
    configurable: true,
  });

  TraitRelation.construct = function <F extends TraitRelation<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    return fastener;
  };

  TraitRelation.define = function <O, T extends Trait>(className: string, descriptor: TraitRelationDescriptor<O, T>): TraitRelationFactory<TraitRelation<any, T>> {
    let superClass = descriptor.extends as TraitRelationFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: TraitRelation<any, any>}, fastener: TraitRelation<O, T> | null, owner: O): TraitRelation<O, T> {
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

  return TraitRelation;
})(Fastener);
