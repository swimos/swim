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

import {Arrays} from "@swim/util";
import type {WarpRef} from "@swim/client";
import type {ModelContextType, ModelContext} from "./ModelContext";
import type {ModelObserverType, ModelObserver} from "./ModelObserver";
import type {ModelConsumerType, ModelConsumer} from "./ModelConsumer";
import type {TraitClass, Trait} from "./Trait";
import type {ModelServiceConstructor, ModelService} from "./service/ModelService";
import type {RefreshService} from "./service/RefreshService";
import type {WarpService} from "./service/WarpService";
import type {ModelPropertyConstructor, ModelProperty} from "./property/ModelProperty";
import type {ModelFastenerConstructor, ModelFastener} from "./fastener/ModelFastener";
import type {ModelTraitConstructor, ModelTrait} from "./fastener/ModelTrait";
import {ModelDownlinkContextPrototype, ModelDownlinkContext} from "./downlink/ModelDownlinkContext";
import type {ModelDownlink} from "./downlink/ModelDownlink";

export type ModelFlags = number;

export type ModelPrecedence = number;

export interface ModelInit {
  key?: string;
}

export interface ModelPrototype extends ModelDownlinkContextPrototype {
  /** @hidden */
  modelServiceConstructors?: {[serviceName: string]: ModelServiceConstructor<Model, unknown> | undefined};

  /** @hidden */
  modelPropertyConstructors?: {[propertyName: string]: ModelPropertyConstructor<Model, unknown> | undefined};

  /** @hidden */
  modelFastenerConstructors?: {[fastenerName: string]: ModelFastenerConstructor<Model, Model> | undefined};

  /** @hidden */
  modelTraitConstructors?: {[fastenerName: string]: ModelTraitConstructor<Model, Trait> | undefined};
}

export interface ModelConstructor<M extends Model = Model> {
  new(): M;
  readonly prototype: M;
}

export interface ModelClass<M extends Model = Model> extends Function {
  readonly prototype: M;

  readonly mountFlags: ModelFlags;

  readonly powerFlags: ModelFlags;

  readonly insertChildFlags: ModelFlags;

  readonly removeChildFlags: ModelFlags;

  readonly insertTraitFlags: ModelFlags;

  readonly removeTraitFlags: ModelFlags;

  readonly startConsumingFlags: ModelFlags;

  readonly stopConsumingFlags: ModelFlags;
}

export abstract class Model implements ModelDownlinkContext {
  constructor() {
    Object.defineProperty(this, "modelFlags", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "modelObservers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "traits", {
      value: [],
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "traitMap", {
      value: {},
      enumerable: true,
      configurable: true,
    });
  }

  initModel(init: ModelInit): void {
    // hook
  }

  readonly modelFlags!: ModelFlags;

  setModelFlags(modelFlags: ModelFlags): void {
    Object.defineProperty(this, "modelFlags", {
      value: modelFlags,
      enumerable: true,
      configurable: true,
    });
  }

  readonly modelObservers!: ReadonlyArray<ModelObserver>;

  addModelObserver(modelObserver: ModelObserverType<this>): void {
    const oldModelObservers = this.modelObservers;
    const newModelObservers = Arrays.inserted(modelObserver, oldModelObservers);
    if (oldModelObservers !== newModelObservers) {
      this.willAddModelObserver(modelObserver);
      Object.defineProperty(this, "modelObservers", {
        value: newModelObservers,
        enumerable: true,
        configurable: true,
      });
      this.onAddModelObserver(modelObserver);
      this.didAddModelObserver(modelObserver);
    }
  }

  protected willAddModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  protected onAddModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  protected didAddModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  removeModelObserver(modelObserver: ModelObserverType<this>): void {
    const oldModelObservers = this.modelObservers;
    const newModelObservers = Arrays.removed(modelObserver, oldModelObservers);
    if (oldModelObservers !== newModelObservers) {
      this.willRemoveModelObserver(modelObserver);
      Object.defineProperty(this, "modelObservers", {
        value: newModelObservers,
        enumerable: true,
        configurable: true,
      });
      this.onRemoveModelObserver(modelObserver);
      this.didRemoveModelObserver(modelObserver);
    }
  }

  protected willRemoveModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  protected onRemoveModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  protected didRemoveModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  abstract readonly key: string | undefined;

  /** @hidden */
  abstract setKey(key: string | undefined): void;

  abstract readonly parentModel: Model | null;

  /** @hidden */
  abstract setParentModel(newParentModel: Model | null, oldParentModel: Model | null): void;

  protected attachParentModel(parentModel: Model): void {
    if (parentModel.isMounted()) {
      this.cascadeMount();
      if (parentModel.isPowered()) {
        this.cascadePower();
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).attachParentModel(parentModel);
    }
  }

  protected detachParentModel(parentModel: Model): void {
    try {
      const traits = this.traits;
      for (let i = 0, n = traits.length; i < n; i += 1) {
        (traits[i]! as any).detachParentModel(parentModel);
      }
    } finally {
      if (this.isMounted()) {
        try {
          if (this.isPowered()) {
            this.cascadeUnpower();
          }
        } finally {
          this.cascadeUnmount();
        }
      }
    }
  }

  protected willSetParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willSetParentModel(newParentModel, oldParentModel);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillSetParentModel !== void 0) {
        modelObserver.modelWillSetParentModel(newParentModel, oldParentModel, this);
      }
    }
  }

  protected onSetParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onSetParentModel(newParentModel, oldParentModel);
    }
  }

  protected didSetParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidSetParentModel !== void 0) {
        modelObserver.modelDidSetParentModel(newParentModel, oldParentModel, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didSetParentModel(newParentModel, oldParentModel);
    }
  }

  abstract remove(): void;

  abstract readonly childModelCount: number;

  abstract readonly childModels: ReadonlyArray<Model>;

  abstract firstChildModel(): Model | null;

  abstract lastChildModel(): Model | null;

  abstract nextChildModel(targetModel: Model): Model | null;

  abstract previousChildModel(targetModel: Model): Model | null;

  abstract forEachChildModel<T>(callback: (childModel: Model) => T | void): T | undefined;
  abstract forEachChildModel<T, S>(callback: (this: S, childModel: Model) => T | void,
                                   thisArg: S): T | undefined;

  abstract getChildModel(key: string): Model | null;

  abstract setChildModel(key: string, newChildModel: Model | null): Model | null;

  abstract appendChildModel(childModel: Model, key?: string): void;

  abstract prependChildModel(childModel: Model, key?: string): void;

  abstract insertChildModel(childModel: Model, targetModel: Model | null, key?: string): void;

  get insertChildFlags(): ModelFlags {
    return (this.constructor as ModelClass).insertChildFlags;
  }

  protected willInsertChildModel(childModel: Model, targetModel: Model | null): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willInsertChildModel(childModel, targetModel);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillInsertChildModel !== void 0) {
        modelObserver.modelWillInsertChildModel(childModel, targetModel, this);
      }
    }
  }

  protected onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    this.requireUpdate(this.insertChildFlags);
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onInsertChildModel(childModel, targetModel);
    }
  }

  protected didInsertChildModel(childModel: Model, targetModel: Model | null): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidInsertChildModel !== void 0) {
        modelObserver.modelDidInsertChildModel(childModel, targetModel, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didInsertChildModel(childModel, targetModel);
    }
  }

  abstract cascadeInsert(updateFlags?: ModelFlags, modelContext?: ModelContext): void;

  abstract removeChildModel(key: string): Model | null;
  abstract removeChildModel(childModel: Model): void;

  abstract removeAll(): void;

  get removeChildFlags(): ModelFlags {
    return (this.constructor as ModelClass).removeChildFlags;
  }

  protected willRemoveChildModel(childModel: Model): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willRemoveChildModel(childModel);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillRemoveChildModel !== void 0) {
        modelObserver.modelWillRemoveChildModel(childModel, this);
      }
    }
    this.requireUpdate(this.removeChildFlags);
  }

  protected onRemoveChildModel(childModel: Model): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onRemoveChildModel(childModel);
    }
  }

  protected didRemoveChildModel(childModel: Model): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidRemoveChildModel !== void 0) {
        modelObserver.modelDidRemoveChildModel(childModel, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didRemoveChildModel(childModel);
    }
  }

  getSuperModel<M extends Model>(modelClass: ModelClass<M>): M | null {
    const parentModel = this.parentModel;
    if (parentModel === null) {
      return null;
    } else if (parentModel instanceof modelClass) {
      return parentModel;
    } else {
      return parentModel.getSuperModel(modelClass);
    }
  }

  getBaseModel<M extends Model>(modelClass: ModelClass<M>): M | null {
    const parentModel = this.parentModel;
    if (parentModel === null) {
      return null;
    } else {
      const baseModel = parentModel.getBaseModel(modelClass);
      if (baseModel !== null) {
        return baseModel;
      } else {
        return parentModel instanceof modelClass ? parentModel : null;
      }
    }
  }

  get traitCount(): number {
    return this.traits.length;
  }

  readonly traits!: ReadonlyArray<Trait>;

  /** @hidden */
  readonly traitMap!: {[traitName: string]: Trait | undefined};

  firstTrait(): Trait | null {
    const traits = this.traits;
    return traits.length !== 0 ? traits[0]! : null;
  }

  lastTrait(): Trait | null {
    const traits = this.traits;
    return traits.length !== 0 ? traits[traits.length - 1]! : null;
  }

  nextTrait(targetTrait: Trait): Trait | null {
    const traits = this.traits;
    const targetIndex = traits.indexOf(targetTrait);
    return targetIndex >= 0 && targetIndex + 1 < traits.length ? traits[targetIndex + 1]! : null;
  }

  previousTrait(targetTrait: Trait): Trait | null {
    const traits = this.traits;
    const targetIndex = traits.indexOf(targetTrait);
    return targetIndex - 1 >= 0 ? traits[targetIndex - 1]! : null;
  }

  forEachTrait<T>(callback: (trait: Trait) => T | void): T | undefined;
  forEachTrait<T, S>(callback: (this: S, trait: Trait) => T | void,
                     thisArg: S): T | undefined;
  forEachTrait<T, S>(callback: (this: S | undefined, trait: Trait) => T | void,
                     thisArg?: S): T | undefined {
    let result: T | undefined;
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      const trait = traits[i]!;
      result = callback.call(thisArg, trait) as T | undefined;
      if (result !== void 0) {
        break;
      }
    }
    return result;
  }

  getTrait(key: string): Trait | null;
  getTrait<R extends Trait>(traitClass: TraitClass<R>): R | null;
  getTrait(key: string | TraitClass): Trait | null;
  getTrait(key: string | TraitClass): Trait | null {
    if (typeof key === "string") {
      const trait = this.traitMap[key];
      if (trait !== void 0) {
        return trait;
      }
    } else {
      const traits = this.traits;
      for (let i = 0, n = traits.length; i < n; i += 1) {
        const trait = traits[i];
        if (trait instanceof key) {
          return trait;
        }
      }
    }
    return null;
  }

  setTrait(key: string, newTrait: Trait | null): Trait | null {
    if (newTrait !== null) {
      newTrait.remove();
    }
    let index = -1;
    let targetTrait: Trait | null = null;
    const traits = this.traits;
    const oldTrait = this.getTrait(key);
    if (oldTrait !== null) {
      index = traits.indexOf(oldTrait);
      // assert(index >= 0);
      targetTrait = traits[index + 1] || null;
      this.willRemoveTrait(oldTrait);
      oldTrait.setModel(null, this);
      this.removeTraitMap(oldTrait);
      (traits as Trait[]).splice(index, 1);
      this.onRemoveTrait(oldTrait);
      this.didRemoveTrait(oldTrait);
      oldTrait.setKey(void 0);
    }
    if (newTrait !== null) {
      newTrait.setKey(key);
      this.willInsertTrait(newTrait, targetTrait);
      if (index >= 0) {
        (traits as Trait[]).splice(index, 0, newTrait);
      } else {
        (traits as Trait[]).push(newTrait);
      }
      this.insertTraitMap(newTrait);
      newTrait.setModel(this, null);
      this.onInsertTrait(newTrait, targetTrait);
      this.didInsertTrait(newTrait, targetTrait);
    }
    return oldTrait;
  }

  /** @hidden */
  protected insertTraitMap(trait: Trait): void {
    const key = trait.key;
    if (key !== void 0) {
      this.traitMap[key] = trait;
    }
  }

  /** @hidden */
  protected removeTraitMap(trait: Trait): void {
    const key = trait.key;
    if (key !== void 0) {
      delete this.traitMap[key];
    }
  }

  appendTrait(trait: Trait, key?: string): void {
    trait.remove();
    if (key !== void 0) {
      this.removeTrait(key);
      trait.setKey(key);
    }
    this.willInsertTrait(trait, null);
    const traits = this.traits;
    (traits as Trait[]).push(trait);
    this.insertTraitMap(trait);
    trait.setModel(this, null);
    this.onInsertTrait(trait, null);
    this.didInsertTrait(trait, null);
  }

  prependTrait(trait: Trait, key?: string): void {
    trait.remove();
    if (key !== void 0) {
      this.removeTrait(key);
      trait.setKey(key);
    }
    const traits = this.traits;
    const targetTrait = traits.length !== 0 ? traits[0]! : null;
    this.willInsertTrait(trait, targetTrait);
    (traits as Trait[]).unshift(trait);
    this.insertTraitMap(trait);
    trait.setModel(this, null);
    this.onInsertTrait(trait, targetTrait);
    this.didInsertTrait(trait, targetTrait);
  }

  insertTrait(trait: Trait, targetTrait: Trait | null, key?: string): void {
    if (targetTrait !== null && targetTrait.model !== this) {
      throw new TypeError("" + targetTrait);
    }
    trait.remove();
    if (key !== void 0) {
      this.removeTrait(key);
      trait.setKey(key);
    }
    this.willInsertTrait(trait, targetTrait);
    const traits = this.traits;
    const index = targetTrait !== null ? traits.indexOf(targetTrait) : -1;
    if (index >= 0) {
      (traits as Trait[]).splice(index, 0, trait);
    } else {
      (traits as Trait[]).push(trait);
    }
    this.insertTraitMap(trait);
    trait.setModel(this, null);
    this.onInsertTrait(trait, targetTrait);
    this.didInsertTrait(trait, targetTrait);
  }

  get insertTraitFlags(): ModelFlags {
    return (this.constructor as ModelClass).insertTraitFlags;
  }

  protected willInsertTrait(newTrait: Trait, targetTrait: Trait | null): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willInsertTrait(newTrait, targetTrait);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillInsertTrait !== void 0) {
        modelObserver.modelWillInsertTrait(newTrait, targetTrait, this);
      }
    }
  }

  protected onInsertTrait(newTrait: Trait, targetTrait: Trait | null): void {
    this.requireUpdate(this.insertTraitFlags);
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onInsertTrait(newTrait, targetTrait);
    }
  }

  protected didInsertTrait(newTrait: Trait, targetTrait: Trait | null): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidInsertTrait !== void 0) {
        modelObserver.modelDidInsertTrait(newTrait, targetTrait, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didInsertTrait(newTrait, targetTrait);
    }
  }

  removeTrait(key: string): Trait | null;
  removeTrait(trait: Trait): void;
  removeTrait(key: string | Trait): Trait | null | void {
    let trait: Trait | null;
    if (typeof key === "string") {
      trait = this.getTrait(key);
      if (trait === null) {
        return null;
      }
    } else {
      trait = key;
    }
    if (trait.model !== this) {
      throw new Error("not a member trait");
    }
    this.willRemoveTrait(trait);
    trait.setModel(null, this);
    this.removeTraitMap(trait);
    const traits = this.traits;
    const index = traits.indexOf(trait);
    if (index >= 0) {
      (traits as Trait[]).splice(index, 1);
    }
    this.onRemoveTrait(trait);
    this.didRemoveTrait(trait);
    trait.setKey(void 0);
    if (typeof key === "string") {
      return trait;
    }
  }

  get removeTraitFlags(): ModelFlags {
    return (this.constructor as ModelClass).removeTraitFlags;
  }

  protected willRemoveTrait(oldTrait: Trait): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willRemoveTrait(oldTrait);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillRemoveTrait !== void 0) {
        modelObserver.modelWillRemoveTrait(oldTrait, this);
      }
    }
  }

  protected onRemoveTrait(oldTrait: Trait): void {
    this.requireUpdate(this.removeTraitFlags);
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onRemoveTrait(oldTrait);
    }
  }

  protected didRemoveTrait(oldTrait: Trait): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidRemoveTrait !== void 0) {
        modelObserver.modelDidRemoveTrait(oldTrait, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didRemoveTrait(oldTrait);
    }
  }

  getSuperTrait<R extends Trait>(traitClass: TraitClass<R>): R | null {
    const parentModel = this.parentModel;
    if (parentModel === null) {
      return null;
    } else {
      const trait = parentModel.getTrait(traitClass);
      if (trait !== null) {
        return trait;
      } else {
        return parentModel.getSuperTrait(traitClass);
      }
    }
  }

  getBaseTrait<R extends Trait>(traitClass: TraitClass<R>): R | null {
    const parentModel = this.parentModel;
    if (parentModel === null) {
      return null;
    } else {
      const baseTrait = parentModel.getBaseTrait(traitClass);
      if (baseTrait !== null) {
        return baseTrait;
      } else {
        return parentModel.getTrait(traitClass);
      }
    }
  }

  declare readonly refreshService: RefreshService<this>; // defined by RefreshService

  declare readonly warpService: WarpService<this>; // defined by WarpService

  declare readonly warpRef: ModelProperty<this, WarpRef | null>; // defined by GenericModel

  isMounted(): boolean {
    return (this.modelFlags & Model.MountedFlag) !== 0;
  }

  get mountFlags(): ModelFlags {
    return (this.constructor as ModelClass).mountFlags;
  }

  mount(): void {
    if (!this.isMounted() && this.parentModel === null) {
      this.cascadeMount();
      if (!this.isPowered() && document.visibilityState === "visible") {
        this.cascadePower();
      }
      this.cascadeInsert();
    }
  }

  abstract cascadeMount(): void;

  protected willMount(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillMount !== void 0) {
        modelObserver.modelWillMount(this);
      }
    }
  }

  protected onMount(): void {
    this.requestUpdate(this, this.modelFlags & ~Model.StatusMask, false);
    this.requireUpdate(this.mountFlags);
  }

  protected didMount(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidMount !== void 0) {
        modelObserver.modelDidMount(this);
      }
    }
  }

  abstract cascadeUnmount(): void;

  protected willUnmount(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillUnmount !== void 0) {
        modelObserver.modelWillUnmount(this);
      }
    }
  }

  protected onUnmount(): void {
    // hook
  }

  protected didUnmount(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidUnmount !== void 0) {
        modelObserver.modelDidUnmount(this);
      }
    }
  }

  isPowered(): boolean {
    return (this.modelFlags & Model.PoweredFlag) !== 0;
  }

  get powerFlags(): ModelFlags {
    return (this.constructor as ModelClass).powerFlags;
  }

  abstract cascadePower(): void;

  protected willPower(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillPower !== void 0) {
        modelObserver.modelWillPower(this);
      }
    }
  }

  protected onPower(): void {
    this.requestUpdate(this, this.modelFlags & ~Model.StatusMask, false);
    this.requireUpdate(this.powerFlags);
  }

  protected didPower(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidPower !== void 0) {
        modelObserver.modelDidPower(this);
      }
    }
  }

  abstract cascadeUnpower(): void;

  protected willUnpower(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillUnpower !== void 0) {
        modelObserver.modelWillUnpower(this);
      }
    }
  }

  protected onUnpower(): void {
    // hook
  }

  protected didUnpower(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidUnpower !== void 0) {
        modelObserver.modelDidUnpower(this);
      }
    }
  }

  requireUpdate(updateFlags: ModelFlags, immediate: boolean = false): void {
    updateFlags &= ~Model.StatusMask;
    if (updateFlags !== 0) {
      this.willRequireUpdate(updateFlags, immediate);
      const oldUpdateFlags = this.modelFlags;
      const newUpdateFlags = oldUpdateFlags | updateFlags;
      const deltaUpdateFlags = newUpdateFlags & ~oldUpdateFlags & ~Model.StatusMask;
      if (deltaUpdateFlags !== 0) {
        this.setModelFlags(newUpdateFlags);
        this.onRequireUpdate(updateFlags, immediate);
        this.requestUpdate(this, deltaUpdateFlags, immediate);
      }
      this.didRequireUpdate(updateFlags, immediate);
    }
  }

  protected willRequireUpdate(updateFlags: ModelFlags, immediate: boolean): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willRequireUpdate(updateFlags, immediate);
    }
  }

  protected onRequireUpdate(updateFlags: ModelFlags, immediate: boolean): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onRequireUpdate(updateFlags, immediate);
    }
  }

  protected didRequireUpdate(updateFlags: ModelFlags, immediate: boolean): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didRequireUpdate(updateFlags, immediate);
    }
  }

  requestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    this.willRequestUpdate(targetModel, updateFlags, immediate);
    let propagateFlags = updateFlags & (Model.NeedsAnalyze | Model.NeedsRefresh);
    if ((updateFlags & Model.AnalyzeMask) !== 0 && (this.modelFlags & Model.NeedsAnalyze) === 0) {
      this.setModelFlags(this.modelFlags | Model.NeedsAnalyze);
      propagateFlags |= Model.NeedsAnalyze;
    }
    if ((updateFlags & Model.RefreshMask) !== 0 && (this.modelFlags & Model.NeedsRefresh) === 0) {
      this.setModelFlags(this.modelFlags | Model.NeedsRefresh);
      propagateFlags |= Model.NeedsRefresh;
    }
    if ((propagateFlags & (Model.NeedsAnalyze | Model.NeedsRefresh)) !== 0 || immediate) {
      this.onRequestUpdate(targetModel, updateFlags, immediate);
      const parentModel = this.parentModel;
      if (parentModel !== null) {
        parentModel.requestUpdate(targetModel, updateFlags, immediate);
      } else if (this.isMounted()) {
        const refreshManager = this.refreshService.manager;
        if (refreshManager !== void 0) {
          refreshManager.requestUpdate(targetModel, updateFlags, immediate);
        }
      }
    }
    this.didRequestUpdate(targetModel, updateFlags, immediate);
  }

  protected willRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      updateFlags |= (traits[i]! as any).willRequestUpdate(targetModel, updateFlags, immediate);
    }
  }

  protected onRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onRequestUpdate(targetModel, updateFlags, immediate);
    }
  }

  protected didRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didRequestUpdate(targetModel, updateFlags, immediate);
    }
  }

  isTraversing(): boolean {
    return (this.modelFlags & Model.TraversingFlag) !== 0;
  }

  isUpdating(): boolean {
    return (this.modelFlags & Model.UpdatingMask) !== 0;
  }

  isAnalyzing(): boolean {
    return (this.modelFlags & Model.AnalyzingFlag) !== 0;
  }

  needsAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): ModelFlags {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      analyzeFlags = (traits[i]! as any).needsAnalyze(analyzeFlags, modelContext);
    }
    return analyzeFlags;
  }

  abstract cascadeAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContext): void;

  protected willAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willAnalyze(analyzeFlags, modelContext);
    }
  }

  protected onAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onAnalyze(analyzeFlags, modelContext);
    }
  }

  protected didAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didAnalyze(analyzeFlags, modelContext);
    }
  }

  protected willMutate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willMutate(modelContext);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillMutate !== void 0) {
        modelObserver.modelWillMutate(modelContext, this);
      }
    }
  }

  protected onMutate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onMutate(modelContext);
    }
  }

  protected didMutate(modelContext: ModelContextType<this>): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidMutate !== void 0) {
        modelObserver.modelDidMutate(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didMutate(modelContext);
    }
  }

  protected willAggregate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willAggregate(modelContext);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillAggregate !== void 0) {
        modelObserver.modelWillAggregate(modelContext, this);
      }
    }
  }

  protected onAggregate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onAggregate(modelContext);
    }
  }

  protected didAggregate(modelContext: ModelContextType<this>): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidAggregate !== void 0) {
        modelObserver.modelDidAggregate(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didAggregate(modelContext);
    }
  }

  protected willCorrelate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willCorrelate(modelContext);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillCorrelate !== void 0) {
        modelObserver.modelWillCorrelate(modelContext, this);
      }
    }
  }

  protected onCorrelate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onCorrelate(modelContext);
    }
  }

  protected didCorrelate(modelContext: ModelContextType<this>): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidCorrelate !== void 0) {
        modelObserver.modelDidCorrelate(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didCorrelate(modelContext);
    }
  }

  /** @hidden */
  protected doAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    if ((analyzeFlags & Model.AnalyzeMask) !== 0) {
      this.willAnalyzeChildModels(analyzeFlags, modelContext);
      this.onAnalyzeChildModels(analyzeFlags, modelContext);
      this.didAnalyzeChildModels(analyzeFlags, modelContext);
    }
  }

  protected willAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willAnalyzeChildModels(analyzeFlags, modelContext);
    }
  }

  protected onAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onAnalyzeChildModels(analyzeFlags, modelContext);
    }
    this.analyzeChildModels(analyzeFlags, modelContext, this.analyzeChildModel);
  }

  protected didAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didAnalyzeChildModels(analyzeFlags, modelContext);
    }
  }

  protected abstract analyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                                        analyzeChildModel: (this: this, childModel: Model, analyzeFlags: ModelFlags,
                                                            modelContext: ModelContextType<this>) => void): void;

  /** @hidden */
  protected analyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.willAnalyzeChildModel(childModel, analyzeFlags, modelContext);
    this.onAnalyzeChildModel(childModel, analyzeFlags, modelContext);
    this.didAnalyzeChildModel(childModel, analyzeFlags, modelContext);
  }

  protected willAnalyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willAnalyzeChildModel(childModel, analyzeFlags, modelContext);
    }
  }

  protected onAnalyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onAnalyzeChildModel(childModel, analyzeFlags, modelContext);
    }
    childModel.cascadeAnalyze(analyzeFlags, modelContext);
  }

  protected didAnalyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didAnalyzeChildModel(childModel, analyzeFlags, modelContext);
    }
  }

  isRefreshing(): boolean {
    return (this.modelFlags & Model.RefreshingFlag) !== 0;
  }

  needsRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): ModelFlags {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      refreshFlags = (traits[i]! as any).needsRefresh(refreshFlags, modelContext);
    }
    return refreshFlags;
  }

  abstract cascadeRefresh(refreshFlags: ModelFlags, modelContext: ModelContext): void;

  protected willRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willRefresh(refreshFlags, modelContext);
    }
  }

  protected onRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onRefresh(refreshFlags, modelContext);
    }
  }

  protected didRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didRefresh(refreshFlags, modelContext);
    }
  }

  protected willValidate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willValidate(modelContext);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillValidate !== void 0) {
        modelObserver.modelWillValidate(modelContext, this);
      }
    }
  }

  protected onValidate(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onValidate(modelContext);
    }
  }

  protected didValidate(modelContext: ModelContextType<this>): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidValidate !== void 0) {
        modelObserver.modelDidValidate(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didValidate(modelContext);
    }
  }

  protected willReconcile(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willReconcile(modelContext);
    }
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillReconcile !== void 0) {
        modelObserver.modelWillReconcile(modelContext, this);
      }
    }
  }

  protected onReconcile(modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i] as any).onReconcile(modelContext);
    }
  }

  protected didReconcile(modelContext: ModelContextType<this>): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidReconcile !== void 0) {
        modelObserver.modelDidReconcile(modelContext, this);
      }
    }
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didReconcile(modelContext);
    }
  }

  /** @hidden */
  protected doRefreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    if ((refreshFlags & Model.RefreshMask)) {
      this.willRefreshChildModels(refreshFlags, modelContext);
      this.onRefreshChildModels(refreshFlags, modelContext);
      this.didRefreshChildModels(refreshFlags, modelContext);
    }
  }

  protected willRefreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willRefreshChildModels(refreshFlags, modelContext);
    }
  }

  protected onRefreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onRefreshChildModels(refreshFlags, modelContext);
    }
    this.refreshChildModels(refreshFlags, modelContext, this.refreshChildModel);
  }

  protected didRefreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didRefreshChildModels(refreshFlags, modelContext);
    }
  }

  protected abstract refreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                                        refreshChildModel: (this: this, childModel: Model, refreshFlags: ModelFlags,
                                                            modelContext: ModelContextType<this>) => void): void;

  /** @hidden */
  protected refreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.willRefreshChildModel(childModel, refreshFlags, modelContext);
    this.onRefreshChildModel(childModel, refreshFlags, modelContext);
    this.didRefreshChildModel(childModel, refreshFlags, modelContext);
  }

  protected willRefreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).willRefreshChildModel(childModel, refreshFlags, modelContext);
    }
  }

  protected onRefreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).onRefreshChildModel(childModel, refreshFlags, modelContext);
    }
    childModel.cascadeRefresh(refreshFlags, modelContext);
  }

  protected didRefreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).didRefreshChildModel(childModel, refreshFlags, modelContext);
    }
  }

  isConsuming(): boolean {
    return (this.modelFlags & Model.ConsumingFlag) !== 0;
  }

  get startConsumingFlags(): ModelFlags {
    return (this.constructor as ModelClass).startConsumingFlags;
  }

  protected startConsuming(): void {
    if ((this.modelFlags & Model.ConsumingFlag) === 0) {
      this.willStartConsuming();
      this.setModelFlags(this.modelFlags | Model.ConsumingFlag);
      this.onStartConsuming();
      this.didStartConsuming();
    }
  }

  protected willStartConsuming(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillStartConsuming !== void 0) {
        modelObserver.modelWillStartConsuming(this);
      }
    }
  }

  protected onStartConsuming(): void {
    this.requireUpdate(this.startConsumingFlags);
  }

  protected didStartConsuming(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidStartConsuming !== void 0) {
        modelObserver.modelDidStartConsuming(this);
      }
    }
  }

  get stopConsumingFlags(): ModelFlags {
    return (this.constructor as ModelClass).stopConsumingFlags;
  }

  protected stopConsuming(): void {
    if ((this.modelFlags & Model.ConsumingFlag) !== 0) {
      this.willStopConsuming();
      this.setModelFlags(this.modelFlags & ~Model.ConsumingFlag);
      this.onStopConsuming();
      this.didStopConsuming();
    }
  }

  protected willStopConsuming(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelWillStopConsuming !== void 0) {
        modelObserver.modelWillStopConsuming(this);
      }
    }
  }

  protected onStopConsuming(): void {
    this.requireUpdate(this.stopConsumingFlags);
  }

  protected didStopConsuming(): void {
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      if (modelObserver.modelDidStopConsuming !== void 0) {
        modelObserver.modelDidStopConsuming(this);
      }
    }
  }

  abstract readonly modelConsumers: ReadonlyArray<ModelConsumer>;

  abstract addModelConsumer(modelConsumer: ModelConsumerType<this>): void;

  protected willAddModelConsumer(modelConsumer: ModelConsumerType<this>): void {
    // hook
  }

  protected onAddModelConsumer(modelConsumer: ModelConsumerType<this>): void {
    // hook
  }

  protected didAddModelConsumer(modelConsumer: ModelConsumerType<this>): void {
    // hook
  }

  abstract removeModelConsumer(modelConsumer: ModelConsumerType<this>): void;

  protected willRemoveModelConsumer(modelConsumer: ModelConsumerType<this>): void {
    // hook
  }

  protected onRemoveModelConsumer(modelConsumer: ModelConsumerType<this>): void {
    // hook
  }

  protected didRemoveModelConsumer(modelConsumer: ModelConsumerType<this>): void {
    // hook
  }

  abstract hasModelService(serviceName: string): boolean;

  abstract getModelService(serviceName: string): ModelService<this, unknown> | null;

  abstract setModelService(serviceName: string, modelService: ModelService<this, unknown> | null): void;

  /** @hidden */
  getLazyModelService(serviceName: string): ModelService<this, unknown> | null {
    let modelService = this.getModelService(serviceName) as ModelService<this, unknown> | null;
    if (modelService === null) {
      const constructor = Model.getModelServiceConstructor(serviceName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        modelService = new constructor(this, serviceName) as ModelService<this, unknown>;
        this.setModelService(serviceName, modelService);
      }
    }
    return modelService;
  }

  abstract hasModelProperty(propertyName: string): boolean;

  abstract getModelProperty(propertyName: string): ModelProperty<this, unknown> | null;

  abstract setModelProperty(propertyName: string, modelProperty: ModelProperty<this, unknown> | null): void;

  /** @hidden */
  getLazyModelProperty(propertyName: string): ModelProperty<this, unknown> | null {
    let modelProperty = this.getModelProperty(propertyName) as ModelProperty<this, unknown> | null;
    if (modelProperty === null) {
      const constructor = Model.getModelPropertyConstructor(propertyName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        modelProperty = new constructor(this, propertyName) as ModelProperty<this, unknown>;
        this.setModelProperty(propertyName, modelProperty);
      }
    }
    return modelProperty;
  }

  abstract hasModelFastener(fastenerName: string): boolean;

  abstract getModelFastener(fastenerName: string): ModelFastener<this, Model> | null;

  abstract setModelFastener(fastenerName: string, modelFastener: ModelFastener<this, any> | null): void;

  /** @hidden */
  getLazyModelFastener(fastenerName: string): ModelFastener<this, Model> | null {
    let modelFastener = this.getModelFastener(fastenerName) as ModelFastener<this, Model> | null;
    if (modelFastener === null) {
      const constructor = Model.getModelFastenerConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const key = constructor.prototype.key === true ? fastenerName
                  : constructor.prototype.key === false ? void 0
                  : constructor.prototype.key;
        modelFastener = new constructor(this, key, fastenerName) as ModelFastener<this, Model>;
        this.setModelFastener(fastenerName, modelFastener);
      }
    }
    return modelFastener;
  }

  abstract hasModelTrait(fastenerName: string): boolean;

  abstract getModelTrait(fastenerName: string): ModelTrait<this, Trait> | null;

  abstract setModelTrait(fastenerName: string, modelTrait: ModelTrait<this, any> | null): void;

  /** @hidden */
  getLazyModelTrait(fastenerName: string): ModelTrait<this, Trait> | null {
    let modelTrait = this.getModelTrait(fastenerName) as ModelTrait<this, Trait> | null;
    if (modelTrait === null) {
      const constructor = Model.getModelTraitConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const key = constructor.prototype.key === true ? fastenerName
                  : constructor.prototype.key === false ? void 0
                  : constructor.prototype.key;
        modelTrait = new constructor(this, key, fastenerName) as ModelTrait<this, Trait>;
        this.setModelTrait(fastenerName, modelTrait);
      }
    }
    return modelTrait;
  }

  abstract hasModelDownlink(downlinkName: string): boolean;

  abstract getModelDownlink(downlinkName: string): ModelDownlink<this> | null;

  abstract setModelDownlink(downlinkName: string, modelDownlink: ModelDownlink<this> | null): void;

  /** @hidden */
  getLazyModelDownlink(downlinkName: string): ModelDownlink<this> | null {
    let modelDownlink = this.getModelDownlink(downlinkName) as ModelDownlink<this> | null;
    if (modelDownlink === null) {
      const constructor = ModelDownlinkContext.getModelDownlinkConstructor(downlinkName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        modelDownlink = new constructor(this, downlinkName) as ModelDownlink<this>;
        this.setModelDownlink(downlinkName, modelDownlink);
      }
    }
    return modelDownlink;
  }

  /** @hidden */
  extendModelContext(modelContext: ModelContext): ModelContextType<this> {
    return modelContext as ModelContextType<this>;
  }

  get superModelContext(): ModelContext {
    const parentModel = this.parentModel;
    if (parentModel !== null) {
      return parentModel.modelContext;
    } else {
      return this.refreshService.updatedModelContext();
    }
  }

  get modelContext(): ModelContext {
    return this.extendModelContext(this.superModelContext);
  }

  /** @hidden */
  static getModelServiceConstructor(serviceName: string, modelPrototype: ModelPrototype | null = null): ModelServiceConstructor<Model, unknown> | null {
    if (modelPrototype === null) {
      modelPrototype = this.prototype as ModelPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(modelPrototype, "modelServiceConstructors")) {
        const constructor = modelPrototype.modelServiceConstructors![serviceName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      modelPrototype = Object.getPrototypeOf(modelPrototype);
    } while (modelPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateModelService(constructor: ModelServiceConstructor<Model, unknown>,
                              target: Object, propertyKey: string | symbol): void {
    const modelPrototype = target as ModelPrototype;
    if (!Object.prototype.hasOwnProperty.call(modelPrototype, "modelServiceConstructors")) {
      modelPrototype.modelServiceConstructors = {};
    }
    modelPrototype.modelServiceConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Model): ModelService<Model, unknown> {
        let modelService = this.getModelService(propertyKey.toString());
        if (modelService === null) {
          modelService = new constructor(this, propertyKey.toString());
          this.setModelService(propertyKey.toString(), modelService);
        }
        return modelService;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getModelPropertyConstructor(propertyName: string, modelPrototype: ModelPrototype | null = null): ModelPropertyConstructor<Model, unknown> | null {
    if (modelPrototype === null) {
      modelPrototype = this.prototype as ModelPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(modelPrototype, "modelPropertyConstructors")) {
        const constructor = modelPrototype.modelPropertyConstructors![propertyName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      modelPrototype = Object.getPrototypeOf(modelPrototype);
    } while (modelPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateModelProperty(constructor: ModelPropertyConstructor<Model, unknown>,
                               target: Object, propertyKey: string | symbol): void {
    const modelPrototype = target as ModelPrototype;
    if (!Object.prototype.hasOwnProperty.call(modelPrototype, "modelPropertyConstructors")) {
      modelPrototype.modelPropertyConstructors = {};
    }
    modelPrototype.modelPropertyConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Model): ModelProperty<Model, unknown> {
        let modelProperty = this.getModelProperty(propertyKey.toString());
        if (modelProperty === null) {
          modelProperty = new constructor(this, propertyKey.toString());
          this.setModelProperty(propertyKey.toString(), modelProperty);
        }
        return modelProperty;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getModelFastenerConstructor(fastenerName: string, modelPrototype: ModelPrototype | null = null): ModelFastenerConstructor<Model, Model> | null {
    if (modelPrototype === null) {
      modelPrototype = this.prototype as ModelPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(modelPrototype, "modelFastenerConstructors")) {
        const constructor = modelPrototype.modelFastenerConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      modelPrototype = Object.getPrototypeOf(modelPrototype);
    } while (modelPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateModelFastener(constructor: ModelFastenerConstructor<Model, Model>,
                               target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const key = constructor.prototype.key === true ? fastenerName
              : constructor.prototype.key === false ? void 0
              : constructor.prototype.key;
    const modelPrototype = target as ModelPrototype;
    if (!Object.prototype.hasOwnProperty.call(modelPrototype, "modelFastenerConstructors")) {
      modelPrototype.modelFastenerConstructors = {};
    }
    modelPrototype.modelFastenerConstructors![fastenerName] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Model): ModelFastener<Model, Model> {
        let modelFastener = this.getModelFastener(fastenerName);
        if (modelFastener === null) {
          modelFastener = new constructor(this, key, fastenerName);
          this.setModelFastener(fastenerName, modelFastener);
        }
        return modelFastener;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getModelTraitConstructor(fastenerName: string, modelPrototype: ModelPrototype | null = null): ModelTraitConstructor<Model, Trait> | null {
    if (modelPrototype === null) {
      modelPrototype = this.prototype as ModelPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(modelPrototype, "modelTraitConstructors")) {
        const constructor = modelPrototype.modelTraitConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      modelPrototype = Object.getPrototypeOf(modelPrototype);
    } while (modelPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateModelTrait(constructor: ModelTraitConstructor<Model, Trait>,
                            target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const key = constructor.prototype.key === true ? fastenerName
              : constructor.prototype.key === false ? void 0
              : constructor.prototype.key;
    const modelPrototype = target as ModelPrototype;
    if (!Object.prototype.hasOwnProperty.call(modelPrototype, "modelTraitConstructors")) {
      modelPrototype.modelTraitConstructors = {};
    }
    modelPrototype.modelTraitConstructors![fastenerName] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Model): ModelTrait<Model, Trait> {
        let modelTrait = this.getModelTrait(fastenerName);
        if (modelTrait === null) {
          modelTrait = new constructor(this, key, fastenerName);
          this.setModelTrait(fastenerName, modelTrait);
        }
        return modelTrait;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static readonly MountedFlag: ModelFlags = 1 << 0;
  /** @hidden */
  static readonly PoweredFlag: ModelFlags = 1 << 1;
  /** @hidden */
  static readonly ConsumingFlag: ModelFlags = 1 << 2;
  /** @hidden */
  static readonly TraversingFlag: ModelFlags = 1 << 3;
  /** @hidden */
  static readonly AnalyzingFlag: ModelFlags = 1 << 4;
  /** @hidden */
  static readonly RefreshingFlag: ModelFlags = 1 << 5;
  /** @hidden */
  static readonly RemovingFlag: ModelFlags = 1 << 6;
  /** @hidden */
  static readonly ImmediateFlag: ModelFlags = 1 << 7;
  /** @hidden */
  static readonly UpdatingMask: ModelFlags = Model.AnalyzingFlag
                                           | Model.RefreshingFlag;
  /** @hidden */
  static readonly StatusMask: ModelFlags = Model.MountedFlag
                                         | Model.PoweredFlag
                                         | Model.ConsumingFlag
                                         | Model.TraversingFlag
                                         | Model.AnalyzingFlag
                                         | Model.RefreshingFlag
                                         | Model.RemovingFlag
                                         | Model.ImmediateFlag;

  static readonly NeedsAnalyze: ModelFlags = 1 << 8;
  static readonly NeedsMutate: ModelFlags = 1 << 9;
  static readonly NeedsAggregate: ModelFlags = 1 << 10;
  static readonly NeedsCorrelate: ModelFlags = 1 << 11;
  /** @hidden */
  static readonly AnalyzeMask: ModelFlags = Model.NeedsAnalyze
                                          | Model.NeedsMutate
                                          | Model.NeedsAggregate
                                          | Model.NeedsCorrelate;

  static readonly NeedsRefresh: ModelFlags = 1 << 12;
  static readonly NeedsValidate: ModelFlags = 1 << 13;
  static readonly NeedsReconcile: ModelFlags = 1 << 14;
  /** @hidden */
  static readonly RefreshMask: ModelFlags = Model.NeedsRefresh
                                          | Model.NeedsValidate
                                          | Model.NeedsReconcile;

  /** @hidden */
  static readonly UpdateMask: ModelFlags = Model.AnalyzeMask
                                         | Model.RefreshMask;

  /** @hidden */
  static readonly ModelFlagShift: ModelFlags = 24;
  /** @hidden */
  static readonly ModelFlagMask: ModelFlags = (1 << Model.ModelFlagShift) - 1;

  static readonly mountFlags: ModelFlags = 0;
  static readonly powerFlags: ModelFlags = 0;
  static readonly insertChildFlags: ModelFlags = 0;
  static readonly removeChildFlags: ModelFlags = 0;
  static readonly insertTraitFlags: ModelFlags = 0;
  static readonly removeTraitFlags: ModelFlags = 0;
  static readonly startConsumingFlags: ModelFlags = 0;
  static readonly stopConsumingFlags: ModelFlags = 0;

  static readonly Intrinsic: ModelPrecedence = 0;
  static readonly Extrinsic: ModelPrecedence = 1;
}
