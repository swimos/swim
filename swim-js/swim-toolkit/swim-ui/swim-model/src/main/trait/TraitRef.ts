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

import type {Mutable, Proto} from "@swim/util";
import {Affinity, FastenerOwner, Fastener} from "@swim/component";
import type {Model} from "../model/Model";
import type {AnyTrait, TraitFactory, Trait} from "./Trait";
import {TraitRelationDescriptor, TraitRelationClass, TraitRelation} from "./TraitRelation";

/** @public */
export type TraitRefTrait<F extends TraitRef<any, any>> =
  F extends {traitType?: TraitFactory<infer T>} ? T : never;

/** @public */
export interface TraitRefDescriptor<T extends Trait = Trait> extends TraitRelationDescriptor<T> {
  extends?: Proto<TraitRef<any, any>> | string | boolean | null;
  traitKey?: string | boolean;
}

/** @public */
export type TraitRefTemplate<F extends TraitRef<any, any>> =
  ThisType<F> &
  TraitRefDescriptor<TraitRefTrait<F>> &
  Partial<Omit<F, keyof TraitRefDescriptor>>;

/** @public */
export interface TraitRefClass<F extends TraitRef<any, any> = TraitRef<any, any>> extends TraitRelationClass<F> {
  /** @override */
  specialize(template: TraitRefDescriptor<any>): TraitRefClass<F>;

  /** @override */
  refine(fastenerClass: TraitRefClass<any>): void;

  /** @override */
  extend<F2 extends F>(className: string, template: TraitRefTemplate<F2>): TraitRefClass<F2>;
  extend<F2 extends F>(className: string, template: TraitRefTemplate<F2>): TraitRefClass<F2>;

  /** @override */
  define<F2 extends F>(className: string, template: TraitRefTemplate<F2>): TraitRefClass<F2>;
  define<F2 extends F>(className: string, template: TraitRefTemplate<F2>): TraitRefClass<F2>;

  /** @override */
  <F2 extends F>(template: TraitRefTemplate<F2>): PropertyDecorator;
}

/** @public */
export interface TraitRef<O = unknown, T extends Trait = Trait> extends TraitRelation<O, T> {
  (): T | null;
  (trait: AnyTrait<T> | null, target?: Trait | null, key?: string): O;

  /** @override */
  get fastenerType(): Proto<TraitRef<any, any>>;

  /** @internal @override */
  getSuper(): TraitRef<unknown, T> | null;

  /** @internal @override */
  setDerived(derived: boolean, inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  willDerive(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  onDerive(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  didDerive(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  willUnderive(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  onUnderive(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  didUnderive(inlet: TraitRef<unknown, T>): void;

  /** @override */
  readonly inlet: TraitRef<unknown, T> | null;

  /** @protected @override */
  willBindInlet(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  onBindInlet(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  didBindInlet(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  willUnbindInlet(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  onUnbindInlet(inlet: TraitRef<unknown, T>): void;

  /** @protected @override */
  didUnbindInlet(inlet: TraitRef<unknown, T>): void;

  /** @internal @override */
  readonly outlets: ReadonlyArray<TraitRef<unknown, T>> | null;

  /** @internal @override */
  attachOutlet(outlet: TraitRef<unknown, T>): void;

  /** @internal @override */
  detachOutlet(outlet: TraitRef<unknown, T>): void;

  get inletTrait(): T | null;

  getInletTrait(): T;

  /** @internal */
  readonly traitKey?: string; // optional prototype property

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

  /** @protected @override */
  onStartConsuming(): void;

  /** @protected @override */
  onStopConsuming(): void;

  /** @internal @protected */
  decohereOutlets(): void;

  /** @internal @protected */
  decohereOutlet(outlet: TraitRef<unknown, T>): void;

  /** @override */
  recohere(t: number): void;
}

/** @public */
export const TraitRef = (function (_super: typeof TraitRelation) {
  const TraitRef = _super.extend("TraitRef", {}) as TraitRefClass;

  Object.defineProperty(TraitRef.prototype, "fastenerType", {
    value: TraitRef,
    configurable: true,
  });

  TraitRef.prototype.onDerive = function (this: TraitRef, inlet: TraitRef): void {
    const inletTrait = inlet.trait;
    if (inletTrait !== null) {
      this.attachTrait(inletTrait);
    } else {
      this.detachTrait();
    }
  };

  Object.defineProperty(TraitRef.prototype, "inletTrait", {
    get: function <T extends Trait>(this: TraitRef<unknown, T>): T | null {
      const inlet = this.inlet;
      return inlet !== null ? inlet.trait : null;
    },
    configurable: true,
  });

  TraitRef.prototype.getInletTrait = function <T extends Trait>(this: TraitRef<unknown, T>): T {
    const inletTrait = this.inletTrait;
    if (inletTrait === void 0 || inletTrait === null) {
      let message = inletTrait + " ";
      if (this.name.length !== 0) {
        message += this.name + " ";
      }
      message += "inlet trait";
      throw new TypeError(message);
    }
    return inletTrait;
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
    let oldTrait = this.trait;
    if (newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    }
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
            key = this.traitKey;
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
        this.decohereOutlets();
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
    if (oldTrait !== newTrait) {
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
      this.decohereOutlets();
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
      this.decohereOutlets();
    }
    return oldTrait;
  };

  TraitRef.prototype.insertTrait = function <T extends Trait>(this: TraitRef<unknown, T>, model?: Model | null, newTrait?: AnyTrait<T>, target?: Trait | null, key?: string): T {
    let oldTrait = this.trait;
    if (newTrait !== void 0 && newTrait !== null) {
      newTrait = this.fromAny(newTrait);
    } else if (oldTrait === null) {
      newTrait = this.createTrait();
    } else {
      newTrait = oldTrait;
    }
    if (model === void 0) {
      model = null;
    }
    if (this.binds || oldTrait !== newTrait || newTrait.model === null || model !== null || key !== void 0) {
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
        this.willAttachTrait(newTrait, target);
        this.onAttachTrait(newTrait, target);
        this.initTrait(newTrait);
        this.didAttachTrait(newTrait, target);
        this.setCoherent(true);
        this.decohereOutlets();
      }
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
        this.decohereOutlets();
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
        this.decohereOutlets();
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
        this.decohereOutlets();
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
        this.decohereOutlets();
      }
    }
  };

  TraitRef.prototype.detectTrait = function <T extends Trait>(this: TraitRef<unknown, T>, trait: Trait): T | null {
    const key = this.traitKey;
    if (key !== void 0 && key === trait.key) {
      return trait as T;
    }
    return null;
  };

  TraitRef.prototype.onStartConsuming = function (this: TraitRef): void {
    const trait = this.trait;
    if (trait !== null) {
      trait.consume(this);
    }
  };

  TraitRef.prototype.onStopConsuming = function (this: TraitRef): void {
    const trait = this.trait;
    if (trait !== null) {
      trait.unconsume(this);
    }
  };

  TraitRef.prototype.decohereOutlets = function (this: TraitRef): void {
    const outlets = this.outlets;
    for (let i = 0, n = outlets !== null ? outlets.length : 0; i < n; i += 1) {
      this.decohereOutlet(outlets![i]!);
    }
  };

  TraitRef.prototype.decohereOutlet = function (this: TraitRef, outlet: TraitRef): void {
    if ((outlet.flags & Fastener.DerivedFlag) === 0 && Math.min(this.flags & Affinity.Mask, Affinity.Intrinsic) >= (outlet.flags & Affinity.Mask)) {
      outlet.setDerived(true, this);
    } else if ((outlet.flags & Fastener.DerivedFlag) !== 0 && (outlet.flags & Fastener.DecoherentFlag) === 0) {
      outlet.setCoherent(false);
      outlet.decohere();
    }
  };

  TraitRef.prototype.recohere = function (this: TraitRef, t: number): void {
    if ((this.flags & Fastener.DerivedFlag) !== 0) {
      const inlet = this.inlet;
      if (inlet !== null) {
        this.setTrait(inlet.trait);
      }
    }
  };

  TraitRef.construct = function <F extends TraitRef<any, any>>(fastener: F | null, owner: FastenerOwner<F>): F {
    if (fastener === null) {
      fastener = function (trait?: AnyTrait<TraitRefTrait<F>> | null, target?: Trait | null, key?: string): TraitRefTrait<F> | null | FastenerOwner<F> {
        if (trait === void 0) {
          return fastener!.trait;
        } else {
          fastener!.setTrait(trait, target, key);
          return fastener!.owner;
        }
      } as F;
      delete (fastener as Partial<Mutable<F>>).name; // don't clobber prototype name
      Object.setPrototypeOf(fastener, this.prototype);
    }
    fastener = _super.construct.call(this, fastener, owner) as F;
    (fastener as Mutable<typeof fastener>).trait = null;
    return fastener;
  };

  TraitRef.refine = function (fastenerClass: TraitRefClass<any>): void {
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

  return TraitRef;
})(TraitRelation);
