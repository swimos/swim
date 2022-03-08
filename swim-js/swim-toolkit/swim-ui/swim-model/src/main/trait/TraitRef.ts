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
import {Affinity, FastenerOwner, Fastener} from "@swim/component";
import type {Model} from "../model/Model";
import type {AnyTrait, Trait} from "./Trait";
import {TraitRelationInit, TraitRelationClass, TraitRelation} from "./TraitRelation";

/** @internal */
export type TraitRefType<F extends TraitRef<any, any>> =
  F extends TraitRef<any, infer T> ? T : never;

/** @public */
export interface TraitRefInit<T extends Trait = Trait> extends TraitRelationInit<T> {
  extends?: {prototype: TraitRef<any, any>} | string | boolean | null;
  key?: string | boolean;

  willInherit?(superFastener: TraitRef<unknown, T>): void;
  didInherit?(superFastener: TraitRef<unknown, T>): void;
  willUninherit?(superFastener: TraitRef<unknown, T>): void;
  didUninherit?(superFastener: TraitRef<unknown, T>): void;

  willBindSuperFastener?(superFastener: TraitRef<unknown, T>): void;
  didBindSuperFastener?(superFastener: TraitRef<unknown, T>): void;
  willUnbindSuperFastener?(superFastener: TraitRef<unknown, T>): void;
  didUnbindSuperFastener?(superFastener: TraitRef<unknown, T>): void;
}

/** @public */
export type TraitRefDescriptor<O = unknown, T extends Trait = Trait, I = {}> = ThisType<TraitRef<O, T> & I> & TraitRefInit<T> & Partial<I>;

/** @public */
export interface TraitRefClass<F extends TraitRef<any, any> = TraitRef<any, any>> extends TraitRelationClass<F> {
}

/** @public */
export interface TraitRefFactory<F extends TraitRef<any, any> = TraitRef<any, any>> extends TraitRefClass<F> {
  extend<I = {}>(className: string, classMembers?: Partial<I> | null): TraitRefFactory<F> & I;

  define<O, T extends Trait = Trait>(className: string, descriptor: TraitRefDescriptor<O, T>): TraitRefFactory<TraitRef<any, T>>;
  define<O, T extends Trait = Trait>(className: string, descriptor: {observes: boolean} & TraitRefDescriptor<O, T, ObserverType<T>>): TraitRefFactory<TraitRef<any, T>>;
  define<O, T extends Trait = Trait, I = {}>(className: string, descriptor: {implements: unknown} & TraitRefDescriptor<O, T, I>): TraitRefFactory<TraitRef<any, T> & I>;
  define<O, T extends Trait = Trait, I = {}>(className: string, descriptor: {implements: unknown; observes: boolean} & TraitRefDescriptor<O, T, I & ObserverType<T>>): TraitRefFactory<TraitRef<any, T> & I>;

  <O, T extends Trait = Trait>(descriptor: TraitRefDescriptor<O, T>): PropertyDecorator;
  <O, T extends Trait = Trait>(descriptor: {observes: boolean} & TraitRefDescriptor<O, T, ObserverType<T>>): PropertyDecorator;
  <O, T extends Trait = Trait, I = {}>(descriptor: {implements: unknown} & TraitRefDescriptor<O, T, I>): PropertyDecorator;
  <O, T extends Trait = Trait, I = {}>(descriptor: {implements: unknown; observes: boolean} & TraitRefDescriptor<O, T, I & ObserverType<T>>): PropertyDecorator;
}

/** @public */
export interface TraitRef<O = unknown, T extends Trait = Trait> extends TraitRelation<O, T> {
  (): T | null;
  (trait: AnyTrait<T> | null, target?: Trait | null, key?: string): O;

  /** @override */
  get fastenerType(): Proto<TraitRef<any, any>>;

  /** @internal @override */
  setInherited(inherited: boolean, superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  willInherit(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  onInherit(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  didInherit(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  willUninherit(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  onUninherit(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  didUninherit(superFastener: TraitRef<unknown, T>): void;

  /** @override */
  readonly superFastener: TraitRef<unknown, T> | null;

  /** @internal @override */
  getSuperFastener(): TraitRef<unknown, T> | null;

  /** @protected @override */
  willBindSuperFastener(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  onBindSuperFastener(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  didBindSuperFastener(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  willUnbindSuperFastener(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  onUnbindSuperFastener(superFastener: TraitRef<unknown, T>): void;

  /** @protected @override */
  didUnbindSuperFastener(superFastener: TraitRef<unknown, T>): void;

  /** @internal */
  readonly subFasteners: ReadonlyArray<TraitRef<unknown, T>> | null;

  /** @internal @override */
  attachSubFastener(subFastener: TraitRef<unknown, T>): void;

  /** @internal @override */
  detachSubFastener(subFastener: TraitRef<unknown, T>): void;

  get superTrait(): T | null;

  getSuperTrait(): T;

  readonly trait: T | null;

  getTrait(): T;

  setTrait(trait: AnyTrait<T> | null, target?: Trait | null, key?: string): T | null;

  attachTrait(trait?: AnyTrait<T>, target?: Trait | null): T;

  detachTrait(): T | null;

  insertTrait(model?: Model | null, trait?: AnyTrait<T>, target?: Trait | null, key?: string): T;

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

  /** @internal @protected */
  decohereSubFasteners(): void;

  /** @internal @protected */
  decohereSubFastener(subFastener: TraitRef<unknown, T>): void;

  /** @override */
  recohere(t: number): void;

  /** @internal */
  get key(): string | undefined; // optional prototype field
}

/** @public */
export const TraitRef = (function (_super: typeof TraitRelation) {
  const TraitRef: TraitRefFactory = _super.extend("TraitRef");

  Object.defineProperty(TraitRef.prototype, "fastenerType", {
    get: function (this: TraitRef): Proto<TraitRef<any, any>> {
      return TraitRef;
    },
    configurable: true,
  });

  TraitRef.prototype.onInherit = function (this: TraitRef, superFastener: TraitRef): void {
    this.setTrait(superFastener.trait);
  };

  TraitRef.prototype.onBindSuperFastener = function <T extends Trait>(this: TraitRef<unknown, T>, superFastener: TraitRef<unknown, T>): void {
    (this as Mutable<typeof this>).superFastener = superFastener;
    _super.prototype.onBindSuperFastener.call(this, superFastener);
  };

  TraitRef.prototype.onUnbindSuperFastener = function <T extends Trait>(this: TraitRef<unknown, T>, superFastener: TraitRef<unknown, T>): void {
    _super.prototype.onUnbindSuperFastener.call(this, superFastener);
    (this as Mutable<typeof this>).superFastener = null;
  };

  TraitRef.prototype.attachSubFastener = function <T extends Trait>(this: TraitRef<unknown, T>, subFastener: TraitRef<unknown, T>): void {
    let subFasteners = this.subFasteners as TraitRef<unknown, T>[] | null;
    if (subFasteners === null) {
      subFasteners = [];
      (this as Mutable<typeof this>).subFasteners = subFasteners;
    }
    subFasteners.push(subFastener);
  };

  TraitRef.prototype.detachSubFastener = function <T extends Trait>(this: TraitRef<unknown, T>, subFastener: TraitRef<unknown, T>): void {
    const subFasteners = this.subFasteners as TraitRef<unknown, T>[] | null;
    if (subFasteners !== null) {
      const index = subFasteners.indexOf(subFastener);
      if (index >= 0) {
        subFasteners.splice(index, 1);
      }
    }
  };

  Object.defineProperty(TraitRef.prototype, "superTrait", {
    get: function <T extends Trait>(this: TraitRef<unknown, T>): T | null {
      const superFastener = this.superFastener;
      return superFastener !== null ? superFastener.trait : null;
    },
    configurable: true,
  });

  TraitRef.prototype.getSuperTrait = function <T extends Trait>(this: TraitRef<unknown, T>): T {
    const superTrait = this.superTrait;
    if (superTrait === void 0 || superTrait === null) {
      let message = superTrait + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "super trait";
      throw new TypeError(message);
    }
    return superTrait;
  };

  TraitRef.prototype.getTrait = function <T extends Trait>(this: TraitRef<unknown, T>): T {
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

  TraitRef.prototype.setTrait = function <T extends Trait>(this: TraitRef<unknown, T>, newTrait: AnyTrait<T> | null, target?: Trait | null, key?: string): T | null {
    if (newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    }
    let oldTrait = this.trait;
    if (oldTrait !== newTrait) {
      if (target === void 0) {
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
            key = this.key;
          }
          this.insertChild(model, newTrait, target, key);
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
          this.willAttachTrait(newTrait, target);
          this.onAttachTrait(newTrait, target);
          this.initTrait(newTrait);
          this.didAttachTrait(newTrait, target);
        }
        this.setCoherent(true);
        this.decohereSubFasteners();
      }
    }
    return oldTrait;
  };

  TraitRef.prototype.attachTrait = function <T extends Trait>(this: TraitRef<unknown, T>, newTrait?: AnyTrait<T>, target?: Trait | null): T {
    const oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    } else if (oldTrait === null) {
      newTrait = this.createTrait();
    } else {
      newTrait = oldTrait;
    }
    if (newTrait !== oldTrait) {
      if (target === void 0) {
        target = null;
      }
      if (oldTrait !== null) {
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
      this.decohereSubFasteners();
    }
    return newTrait;
  };

  TraitRef.prototype.detachTrait = function <T extends Trait>(this: TraitRef<unknown, T>): T | null {
    const oldTrait = this.trait;
    if (oldTrait !== null) {
      (this as Mutable<typeof this>).trait = null;
      this.willDetachTrait(oldTrait);
      this.onDetachTrait(oldTrait);
      this.deinitTrait(oldTrait);
      this.didDetachTrait(oldTrait);
      this.setCoherent(true);
      this.decohereSubFasteners();
    }
    return oldTrait;
  };

  TraitRef.prototype.insertTrait = function <T extends Trait>(this: TraitRef<unknown, T>, model?: Model | null, newTrait?: AnyTrait<T>, target?: Trait | null, key?: string): T {
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    } else {
      const oldTrait = this.trait;
      if (oldTrait === null) {
        newTrait = this.createTrait();
      } else {
        newTrait = oldTrait;
      }
    }
    if (model === void 0 || model === null) {
      model = this.parentModel;
    }
    if (target === void 0) {
      target = null;
    }
    if (key === void 0) {
      key = this.key;
    }
    if (model !== null && (newTrait.parent !== model || newTrait.key !== key)) {
      this.insertChild(model, newTrait, target, key);
    }
    const oldTrait = this.trait;
    if (newTrait !== oldTrait) {
      if (oldTrait !== null) {
        (this as Mutable<typeof this>).trait = null;
        this.willDetachTrait(oldTrait);
        this.onDetachTrait(oldTrait);
        this.deinitTrait(oldTrait);
        this.didDetachTrait(oldTrait);
        oldTrait.remove();
      }
      (this as Mutable<typeof this>).trait = newTrait;
      this.willAttachTrait(newTrait, target);
      this.onAttachTrait(newTrait, target);
      this.initTrait(newTrait);
      this.didAttachTrait(newTrait, target);
      this.setCoherent(true);
      this.decohereSubFasteners();
    }
    return newTrait;
  };

  TraitRef.prototype.removeTrait = function <T extends Trait>(this: TraitRef<unknown, T>): T | null {
    const trait = this.trait;
    if (trait !== null) {
      trait.remove();
    }
    return trait;
  };

  TraitRef.prototype.deleteTrait = function <T extends Trait>(this: TraitRef<unknown, T>): T | null {
    const trait = this.detachTrait();
    if (trait !== null) {
      trait.remove();
    }
    return trait;
  };

  TraitRef.prototype.bindModel = function <T extends Trait>(this: TraitRef<unknown, T>, model: Model, target: Model | null): void {
    if (this.binds && this.trait === null) {
      const newTrait = this.detectModel(model);
      if (newTrait !== null) {
        (this as Mutable<typeof this>).trait = newTrait;
        this.willAttachTrait(newTrait, null);
        this.onAttachTrait(newTrait, null);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, null);
        this.setCoherent(true);
        this.decohereSubFasteners();
      }
    }
  };

  TraitRef.prototype.unbindModel = function <T extends Trait>(this: TraitRef<unknown, T>, model: Model): void {
    if (this.binds) {
      const oldTrait = this.detectModel(model);
      if (oldTrait !== null && this.trait === oldTrait) {
        (this as Mutable<typeof this>).trait = null;
        this.willDetachTrait(oldTrait);
        this.onDetachTrait(oldTrait);
        this.deinitTrait(oldTrait);
        this.didDetachTrait(oldTrait);
        this.setCoherent(true);
        this.decohereSubFasteners();
      }
    }
  };

  TraitRef.prototype.detectModel = function <T extends Trait>(this: TraitRef<unknown, T>, model: Model): T | null {
    return null;
  };

  TraitRef.prototype.bindTrait = function <T extends Trait>(this: TraitRef<unknown, T>, trait: Trait, target: Trait | null): void {
    if (this.binds && this.trait === null) {
      const newTrait = this.detectTrait(trait);
      if (newTrait !== null) {
        (this as Mutable<typeof this>).trait = newTrait;
        this.willAttachTrait(newTrait, target);
        this.onAttachTrait(newTrait, target);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, target);
        this.setCoherent(true);
        this.decohereSubFasteners();
      }
    }
  };

  TraitRef.prototype.unbindTrait = function <T extends Trait>(this: TraitRef<unknown, T>, trait: Trait): void {
    if (this.binds) {
      const oldTrait = this.detectTrait(trait);
      if (oldTrait !== null && this.trait === oldTrait) {
        (this as Mutable<typeof this>).trait = null;
        this.willDetachTrait(oldTrait);
        this.onDetachTrait(oldTrait);
        this.deinitTrait(oldTrait);
        this.didDetachTrait(oldTrait);
        this.setCoherent(true);
        this.decohereSubFasteners();
      }
    }
  };

  TraitRef.prototype.detectTrait = function <T extends Trait>(this: TraitRef<unknown, T>, trait: Trait): T | null {
    const key = this.key;
    if (key !== void 0 && key === trait.key) {
      return trait as T;
    }
    return null;
  };

  TraitRef.prototype.decohereSubFasteners = function (this: TraitRef): void {
    const subFasteners = this.subFasteners;
    for (let i = 0, n = subFasteners !== null ? subFasteners.length : 0; i < n; i += 1) {
      this.decohereSubFastener(subFasteners![i]!);
    }
  };

  TraitRef.prototype.decohereSubFastener = function (this: TraitRef, subFastener: TraitRef): void {
    if ((subFastener.flags & Fastener.InheritedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (subFastener.flags & Affinity.Mask)) {
      subFastener.setInherited(true, this);
    } else if ((subFastener.flags & Fastener.InheritedFlag) !== 0 && (subFastener.flags & Fastener.DecoherentFlag) === 0) {
      subFastener.setCoherent(false);
      subFastener.decohere();
    }
  };

  TraitRef.prototype.recohere = function (this: TraitRef, t: number): void {
    if ((this.flags & Fastener.InheritedFlag) !== 0) {
      const superFastener = this.superFastener;
      if (superFastener !== null) {
        this.setTrait(superFastener.trait);
      }
    }
  };

  TraitRef.construct = function <F extends TraitRef<any, any>>(fastenerClass: {prototype: F}, fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (trait?: AnyTrait<TraitRefType<F>> | null, target?: Trait | null, key?: string): TraitRefType<F> | null | FastenerOwner<F> {
        if (trait === void 0) {
          return fastener!.trait;
        } else {
          fastener!.setTrait(trait, target, key);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, fastenerClass.prototype);
    }
    fastener = _super.construct(fastenerClass, fastener, owner) as F;
    Object.defineProperty(fastener, "superFastener", { // override getter
      value: null,
      writable: true,
      enumerable: true,
      configurable: true,
    });
    (fastener as Mutable<typeof fastener>).subFasteners = null;
    (fastener as Mutable<typeof fastener>).trait = null;
    return fastener;
  };

  TraitRef.define = function <O, T extends Trait>(className: string, descriptor: TraitRefDescriptor<O, T>): TraitRefFactory<TraitRef<any, T>> {
    let superClass = descriptor.extends as TraitRefFactory | null | undefined;
    const affinity = descriptor.affinity;
    const inherits = descriptor.inherits;
    delete descriptor.extends;
    delete descriptor.implements;
    delete descriptor.affinity;
    delete descriptor.inherits;

    if (descriptor.key === true) {
      Object.defineProperty(descriptor, "key", {
        value: className,
        configurable: true,
      });
    } else if (descriptor.key === false) {
      Object.defineProperty(descriptor, "key", {
        value: void 0,
        configurable: true,
      });
    }

    if (superClass === void 0 || superClass === null) {
      superClass = this;
    }

    const fastenerClass = superClass.extend(className, descriptor);

    fastenerClass.construct = function (fastenerClass: {prototype: TraitRef<any, any>}, fastener: TraitRef<O, T> | null, owner: O): TraitRef<O, T> {
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

  return TraitRef;
})(TraitRelation);
