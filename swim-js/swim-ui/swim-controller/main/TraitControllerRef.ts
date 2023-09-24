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

import type {Proto} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {FastenerClass} from "@swim/component";
import {Fastener} from "@swim/component";
import type {TraitFactory} from "@swim/model";
import {Trait} from "@swim/model";
import type {TraitRef} from "@swim/model";
import type {Controller} from "./Controller";
import type {ControllerRefDescriptor} from "./ControllerRef";
import type {ControllerRefClass} from "./ControllerRef";
import {ControllerRef} from "./ControllerRef";

/** @public */
export interface TraitControllerRefDescriptor<R, T extends Trait, C extends Controller> extends ControllerRefDescriptor<R, C> {
  extends?: Proto<TraitControllerRef<any, any, any, any>> | boolean | null;
  traitKey?: string | boolean;
}

/** @public */
export interface TraitControllerRefClass<F extends TraitControllerRef<any, any, any, any> = TraitControllerRef<any, any, any, any>> extends ControllerRefClass<F> {
}

/** @public */
export interface TraitControllerRef<R = any, T extends Trait = Trait, C extends Controller = Controller, I extends any[] = [C | null]> extends ControllerRef<R, C, I> {
  /** @override */
  get descriptorType(): Proto<TraitControllerRefDescriptor<R, T, C>>;

  getTraitRef(controller: C): TraitRef<any, T>;

  /** @override */
  set(traitOrController: T | C | LikeType<C> | Fastener<any, I[0], any> | null): R;

  /** @override */
  setIntrinsic(traitOrController: T | C | LikeType<C> | Fastener<any, I[0], any> | null): R;

  get traitType(): TraitFactory<T> | null;

  get traitKey(): string | undefined;

  get trait(): T | null;

  getTrait(): T;

  setTrait(trait: T | LikeType<T> | null, targetTrait?: Trait | null, key?: string): C | null;

  attachTrait(trait?: T | LikeType<T> | null, targetTrait?: Trait | null): C;

  /** @protected */
  initTrait(trait: T, controller: C): void;

  /** @protected */
  willAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void;

  /** @protected */
  onAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void;

  /** @protected */
  didAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void;

  detachTrait(trait?: T): C | null;

  /** @protected */
  deinitTrait(trait: T, controller: C): void;

  /** @protected */
  willDetachTrait(trait: T, controller: C): void;

  /** @protected */
  onDetachTrait(trait: T, controller: C): void;

  /** @protected */
  didDetachTrait(trait: T, controller: C): void;

  insertTrait(parent?: Controller | null, trait?: T | LikeType<T>, targetTrait?: Trait | null, key?: string): C;

  removeTrait(trait: T | null): C | null;

  deleteTrait(trait: T | null): C | null;

  createTrait(): T;

  /** @protected */
  fromTraitLike(value: T | LikeType<T>): T;

  /** @protected @override */
  onAttachController(controller: C, targetController: Controller | null): void;

  /** @protected @override */
  onDetachController(controller: C): void;

  createController(trait?: T): C;
}

/** @public */
export const TraitControllerRef = (<R, T extends Trait, C extends Controller, I extends any[], F extends TraitControllerRef<any, any, any, any>>() => ControllerRef.extend<TraitControllerRef<R, T, C, I>, TraitControllerRefClass<F>>("TraitControllerRef", {
  getTraitRef(controller: C): TraitRef<any, T> {
    throw new Error("missing implementation");
  },

  set(traitOrController: T | C | LikeType<C> | Fastener<any, I[0], any> | null): R {
    if (traitOrController instanceof Fastener) {
      this.bindInlet(traitOrController);
    } else if (traitOrController instanceof Trait) {
      this.setTrait(traitOrController);
    } else {
      this.setController(traitOrController);
    }
    return this.owner;
  },

  setIntrinsic(traitOrController: T | C | LikeType<C> | Fastener<any, I[0], any> | null): R {
    if (traitOrController instanceof Fastener) {
      this.bindInlet(traitOrController);
    } else if (traitOrController instanceof Trait) {
      this.setTrait(traitOrController);
    } else {
      this.setController(traitOrController);
    }
    return this.owner;
  },

  traitType: null,

  traitKey: void 0,

  get trait(): T | null {
    const controller = this.controller;
    if (controller === null) {
      return null;
    }
    const traitRef = this.getTraitRef(controller);
    return traitRef.trait;
  },

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

  setTrait(trait: T | LikeType<T> | null, targetTrait?: Trait | null, key?: string): C | null {
    let controller = this.controller;
    if (trait !== null) {
      trait = this.fromTraitLike(trait);
      if (controller === null) {
        controller = this.createController(trait);
      }
      const traitRef = this.getTraitRef(controller);
      traitRef.setTrait(trait, targetTrait, this.traitKey);
      this.setController(controller, null, key);
    } else if (controller !== null) {
      const traitRef = this.getTraitRef(controller);
      traitRef.setTrait(null);
    }
    return controller;
  },

  attachTrait(trait?: T | LikeType<T> | null, targetTrait?: Trait | null): C {
    if (trait === void 0 || trait === null) {
      trait = this.createTrait();
    } else {
      trait = this.fromTraitLike(trait);
    }
    let controller = this.controller;
    if (controller === null) {
      controller = this.createController(trait);
    }
    const traitRef = this.getTraitRef(controller);
    traitRef.setTrait(trait, targetTrait, this.traitKey);
    this.attachController(controller, null);
    return controller;
  },

  initTrait(trait: T, controller: C): void {
    // hook
  },

  willAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void {
    // hook
  },

  onAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void {
    // hook
  },

  didAttachTrait(trait: T, targetTrait: Trait | null, controller: C): void {
    // hook
  },

  detachTrait(trait?: T): C | null {
    const controller = this.controller;
    if (controller === null || this.getTraitRef(controller).trait !== trait) {
      return null;
    }
    this.willDetachTrait(trait, controller);
    this.onDetachTrait(trait, controller);
    this.deinitTrait(trait, controller);
    this.didDetachTrait(trait, controller);
    return controller;
  },

  deinitTrait(trait: T, controller: C): void {
    // hook
  },

  willDetachTrait(trait: T, controller: C): void {
    // hook
  },

  onDetachTrait(trait: T, controller: C): void {
    // hook
  },

  didDetachTrait(trait: T, controller: C): void {
    // hook
  },

  insertTrait(parent?: Controller | null, trait?: T | LikeType<T>, targetTrait?: Trait | null, key?: string): C {
    if (trait === void 0 || trait === null) {
      trait = this.createTrait();
    } else {
      trait = this.fromTraitLike(trait);
    }
    let controller = this.controller;
    if (controller === null) {
      controller = this.createController(trait);
    }
    const traitRef = this.getTraitRef(controller);
    traitRef.setTrait(trait, targetTrait, this.traitKey);
    this.insertController(parent, controller);
    return controller;
  },

  removeTrait(trait: T | null): C | null {
    const controller = this.controller;
    if (controller === null) {
      return null;
    }
    const traitRef = this.getTraitRef(controller);
    if (traitRef.trait !== trait) {
      return null;
    }
    controller.remove();
    return controller;
  },

  deleteTrait(trait: T | null): C | null {
    const controller = this.controller;
    if (controller === null) {
      return null;
    }
    const traitRef = this.getTraitRef(controller);
    if (traitRef.trait !== trait) {
      return null;
    }
    controller.remove();
    this.setController(null);
    return controller;
  },

  fromTraitLike(value: T | LikeType<T>): T {
    const traitType = this.traitType;
    if (traitType !== null) {
      return traitType.fromLike(value);
    }
    return Trait.fromLike(value) as T;
  },

  onAttachController(controller: C, targetController: Controller | null): void {
    const trait = this.getTraitRef(controller).trait;
    if (trait !== null) {
      const targetTrait = targetController !== null ? this.getTraitRef(targetController as C).trait : null;
      this.attachTrait(trait, targetTrait);
    }
    super.onAttachController(controller, targetController);
  },

  onDetachController(controller: C): void {
    super.onDetachController(controller);
    const trait = this.getTraitRef(controller).trait;
    if (trait !== null) {
      this.detachTrait(trait);
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
},
{
  construct(fastener: F | null, owner: F extends Fastener<infer R, any, any> ? R : never): F {
    fastener = super.construct(fastener, owner) as F;
    return fastener;
  },

  refine(fastenerClass: FastenerClass<TraitControllerRef<any, any, any, any>>): void {
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
