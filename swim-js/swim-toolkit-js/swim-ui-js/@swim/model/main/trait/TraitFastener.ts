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

import {Mutable, Class, FromAny, ObserverType} from "@swim/util";
import {FastenerOwner, FastenerInit, Fastener} from "@swim/fastener";
import {Model} from "../model/Model";
import {AnyTraitFactory, Trait} from "./Trait";

export type TraitFastenerType<F extends TraitFastener<any, any, any>> =
  F extends TraitFastener<any, infer R, any> ? R : never;

export type TraitFastenerInitType<F extends TraitFastener<any, any, any>> =
  F extends TraitFastener<any, any, infer U> ? U : never;

export interface TraitFastenerInit<R extends Trait = Trait, U = never> extends FastenerInit {
  key?: string | boolean;
  type?: AnyTraitFactory<R, U>;
  sibling?: boolean;
  observes?: boolean;

  willSetTrait?(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;
  onSetTrait?(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;
  didSetTrait?(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;

  model?: Model | null;
  createTrait?(): R | null;
  insertTrait?(model: Model, trait: R, target: Trait | null, key: string | undefined): void;
  fromAny?(value: R | U): R | null;
}

export type TraitFastenerDescriptor<O = unknown, R extends Trait = Trait, U = never, I = {}> = ThisType<TraitFastener<O, R, U> & I> & TraitFastenerInit<R, U> & Partial<I>;

export interface TraitFastenerClass<F extends TraitFastener<any, any> = TraitFastener<any, any, any>> {
  /** @internal */
  prototype: F;

  create(owner: FastenerOwner<F>, fastenerName: string): F;

  construct(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F;

  extend<I = {}>(classMembers?: Partial<I> | null): TraitFastenerClass<F> & I;

  define<O, R extends Trait = Trait, U = never>(descriptor: TraitFastenerDescriptor<O, R, U>): TraitFastenerClass<TraitFastener<any, R, U>>;
  define<O, R extends Trait = Trait, U = never>(descriptor: {observes: boolean} & TraitFastenerDescriptor<O, R, U, ObserverType<R>>): TraitFastenerClass<TraitFastener<any, R, U>>;
  define<O, R extends Trait = Trait, U = never, I = {}>(descriptor: TraitFastenerDescriptor<O, R, U, I>): TraitFastenerClass<TraitFastener<any, R, U> & I>;
  define<O, R extends Trait = Trait, U = never, I = {}>(descriptor: {observes: boolean} & TraitFastenerDescriptor<O, R, U, I & ObserverType<R>>): TraitFastenerClass<TraitFastener<any, R, U> & I>;

  <O, R extends Trait = Trait, U = never>(descriptor: TraitFastenerDescriptor<O, R, U>): PropertyDecorator;
  <O, R extends Trait = Trait, U = never>(descriptor: {observes: boolean} & TraitFastenerDescriptor<O, R, U, ObserverType<R>>): PropertyDecorator;
  <O, R extends Trait = Trait, U = never, I = {}>(descriptor: TraitFastenerDescriptor<O, R, U, I>): PropertyDecorator;
  <O, R extends Trait = Trait, U = never, I = {}>(descriptor: {observes: boolean} & TraitFastenerDescriptor<O, R, U, I & ObserverType<R>>): PropertyDecorator;
}

export interface TraitFastener<O = unknown, R extends Trait = Trait, U = never> extends Fastener<O> {
  (): R | null;
  (trait: R | U | null, target?: Trait | null): O;

  /** @override */
  get familyType(): Class<TraitFastener<any, any, any>> | null;

  /** @protected @override */
  onInherit(superFastener: Fastener): void;

  readonly trait: R | null;

  getTrait(): R;

  setTrait(newTrait: R | U | null, target?: Trait | null): R | null;

  /** @internal */
  setOwnTrait(newTrait: R | null, target: Trait | null): void;

  /** @protected */
  attachTrait(newTrait: R): void;

  /** @protected */
  detachTrait(oldTrait: R): void;

  /** @protected */
  willSetTrait(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;

  /** @protected */
  onSetTrait(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;

  /** @protected */
  didSetTrait(newTrait: R | null, oldTrait: R | null, target: Trait | null): void;

  readonly key: string | undefined;

  /** @internal @protected */
  get model(): Model | null;

  injectTrait(model?: Model | null, trait?: R | U | null, target?: Trait | null, key?: string | null): R | null;

  createTrait(): R | null;

  /** @internal @protected */
  insertTrait(model: Model, trait: R, target: Trait | null, key: string | undefined): void;

  removeTrait(): R | null;

  /** @internal @protected */
  fromAny(value: R | U): R | null;

  /** @internal @protected */
  get type(): AnyTraitFactory<R, U> | undefined; // optional prototype property

  /** @internal @protected */
  get sibling(): boolean | undefined; // optional prototype property

  /** @internal @protected */
  get observes(): boolean | undefined; // optional prototype property
}

export const TraitFastener = (function (_super: typeof Fastener) {
  const TraitFastener: TraitFastenerClass = _super.extend();

  Object.defineProperty(TraitFastener.prototype, "familyType", {
    get: function (this: TraitFastener): Class<TraitFastener<any, any, any>> | null {
      return TraitFastener;
    },
    configurable: true,
  });

  TraitFastener.prototype.onInherit = function (this: TraitFastener, superFastener: TraitFastener): void {
    this.setTrait(superFastener.trait);
  };

  TraitFastener.prototype.getTrait = function <R extends Trait>(this: TraitFastener<unknown, R>): R {
    const trait = this.trait;
    if (trait === null) {
      throw new TypeError("null " + this.name + " trait");
    }
    return trait;
  };

  TraitFastener.prototype.setTrait = function <R extends Trait>(this: TraitFastener<unknown, R>, newTrait: R | null, target?: Trait | null): R | null {
    const oldTrait = this.trait;
    if (newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    }
    if (target === void 0) {
      target = null;
    }
    if (this.sibling === true) {
      if (newTrait !== null && newTrait.model === null) {
        const model = this.model;
        if (model !== null) {
          this.insertTrait(model, newTrait, target, this.key);
        }
      } else if (newTrait === null && oldTrait !== null) {
        oldTrait.remove();
      }
    }
    this.setOwnTrait(newTrait, target);
    return oldTrait;
  };

  TraitFastener.prototype.setOwnTrait = function <R extends Trait>(this: TraitFastener<unknown, R>, newTrait: R | null, target: Trait | null): void {
    const oldTrait = this.trait;
    if (oldTrait !== newTrait) {
      this.willSetTrait(newTrait, oldTrait, target);
      if (oldTrait !== null) {
        this.detachTrait(oldTrait);
      }
      (this as Mutable<typeof this>).trait = newTrait;
      if (newTrait !== null) {
        this.attachTrait(newTrait);
      }
      this.onSetTrait(newTrait, oldTrait, target);
      this.didSetTrait(newTrait, oldTrait, target);
    }
  };

  TraitFastener.prototype.attachTrait = function <R extends Trait>(this: TraitFastener<unknown, R>, newTrait: R): void {
    if (this.observes === true) {
      newTrait.observe(this as ObserverType<R>);
    }
  };

  TraitFastener.prototype.detachTrait = function <R extends Trait>(this: TraitFastener<unknown, R>, oldTrait: R): void {
    if (this.observes === true) {
      oldTrait.unobserve(this as ObserverType<R>);
    }
  };

  TraitFastener.prototype.willSetTrait = function <R extends Trait>(this: TraitFastener<unknown, R>, newTrait: R | null, oldTrait: R | null, target: Trait | null): void {
    // hook
  };

  TraitFastener.prototype.onSetTrait = function <R extends Trait>(this: TraitFastener<unknown, R>, newTrait: R | null, oldTrait: R | null, target: Trait | null): void {
    // hook
  };

  TraitFastener.prototype.didSetTrait = function <R extends Trait>(this: TraitFastener<unknown, R>, newTrait: R | null, oldTrait: R | null, target: Trait | null): void {
    // hook
  };

  Object.defineProperty(TraitFastener.prototype, "model", {
    get(this: TraitFastener): Model | null {
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

  TraitFastener.prototype.injectTrait = function <R extends Trait>(this: TraitFastener<unknown, R>, model?: Model | null, trait?: R | null, target?: Trait | null, key?: string | null): R | null {
    if (target === void 0) {
      target = null;
    }
    if (trait === void 0 || trait === null) {
      trait = this.trait;
      if (trait === null) {
        trait = this.createTrait();
      }
    } else {
      trait = this.fromAny(trait);
      if (trait !== null) {
        this.setOwnTrait(trait, target);
      }
    }
    if (trait !== null) {
      if (model === void 0 || model === null) {
        model = this.model;
      }
      if (key === void 0) {
        key = this.key;
      } else if (key === null) {
        key = void 0;
      }
      if (model !== null && (trait.model !== model || trait.key !== key)) {
        this.insertTrait(model, trait, target, key);
      }
      if (this.trait === null) {
        this.setOwnTrait(trait, target);
      }
    }
    return trait;
  };

  TraitFastener.prototype.createTrait = function <R extends Trait, U>(this: TraitFastener<unknown, R, U>): R | null {
    const type = this.type;
    if (type !== void 0 && type.create !== void 0) {
      return type.create();
    }
    return null;
  };

  TraitFastener.prototype.insertTrait = function <R extends Trait>(this: TraitFastener<unknown, R>, model: Model, trait: R, target: Trait | null, key: string | undefined): void {
    model.insertTrait(trait, target, key);
  };

  TraitFastener.prototype.removeTrait = function <R extends Trait>(this: TraitFastener<unknown, R>): R | null {
    const trait = this.trait;
    if (trait !== null) {
      trait.remove();
    }
    return trait;
  };

  TraitFastener.prototype.fromAny = function <R extends Trait, U>(this: TraitFastener<unknown, R, U>, value: R | U): R | null {
    const type = this.type;
    if (FromAny.is<R, U>(type)) {
      return type.fromAny(value);
    } else if (value instanceof Trait) {
      return value;
    }
    return null;
  };

  TraitFastener.construct = function <F extends TraitFastener<any, any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>, fastenerName: string): F {
    if (fastener === null) {
      fastener = function TraitFastener(trait?: TraitFastenerType<F> | TraitFastenerInitType<F> | null, target?: Trait | null): TraitFastenerType<F> | null | FastenerOwner<F> {
        if (trait === void 0) {
          return fastener!.trait;
        } else {
          fastener!.setTrait(trait, target);
          return fastener!.owner;
        }
      } as F;
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner, fastenerName) as F;
    (fastener as Mutable<typeof fastener>).key = void 0;
    (fastener as Mutable<typeof fastener>).trait = null;
    return fastener;
  };

  TraitFastener.define = function <O, R extends Trait, U>(descriptor: TraitFastenerDescriptor<O, R, U>): TraitFastenerClass<TraitFastener<any, R, U>> {
    let superClass = descriptor.extends as TraitFastenerClass | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    const key = descriptor.key;
    delete descriptor.extends;
    delete descriptor.affinity;
    delete descriptor.inherits;
    delete descriptor.key;

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: TraitFastener<any, any, any>}, fastener: TraitFastener<O, R, U> | null, owner: O, fastenerName: string): TraitFastener<O, R, U> {
      fastener = superClass!.construct(fastenerClass, fastener, owner, fastenerName);
      if (affinity !== void 0) {
        fastener.initAffinity(affinity);
      }
      if (inherits !== void 0) {
        fastener.initInherits(inherits);
      }
      if (typeof key === "string") {
        (fastener as Mutable<typeof fastener>).key = key;
      } else if (key === true) {
        (fastener as Mutable<typeof fastener>).key = fastenerName;
      }
      return fastener;
    };

    return fastenerClass;
  };

  return TraitFastener;
})(Fastener);
