// Copyright 2015-2020 Swim inc.
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
import type {ModelContextType} from "./ModelContext";
import type {ModelFlags, ModelClass, Model} from "./Model";
import type {TraitObserverType, TraitObserver} from "./TraitObserver";
import type {TraitConsumerType, TraitConsumer} from "./TraitConsumer";
import type {WarpManager} from "./warp/WarpManager";
import type {TraitServiceConstructor, TraitService} from "./service/TraitService";
import type {TraitPropertyConstructor, TraitProperty} from "./property/TraitProperty";
import type {TraitModelConstructor, TraitModel} from "./fastener/TraitModel";
import type {TraitFastenerConstructor, TraitFastener} from "./fastener/TraitFastener";
import type {ModelDownlinkContext} from "./downlink/ModelDownlinkContext";
import type {ModelDownlink} from "./downlink/ModelDownlink";

export type TraitModelType<R extends Trait> = R extends {readonly model: infer M} ? M extends null ? never : M : Model;

export type TraitContextType<R extends Trait> = ModelContextType<TraitModelType<R>>;

export type TraitFlags = number;

export interface TraitPrototype {
  /** @hidden */
  traitServiceConstructors?: {[serviceName: string]: TraitServiceConstructor<Trait, unknown> | undefined};

  /** @hidden */
  traitPropertyConstructors?: {[propertyName: string]: TraitPropertyConstructor<Trait, unknown> | undefined};

  /** @hidden */
  traitModelConstructors?: {[fastenerName: string]: TraitModelConstructor<Trait, Model> | undefined};

  /** @hidden */
  traitFastenerConstructors?: {[fastenerName: string]: TraitFastenerConstructor<Trait, Trait> | undefined};
}

export interface TraitConstructor<R extends Trait = Trait> {
  new(): R;
  readonly prototype: R;
}

export interface TraitClass<R extends Trait = Trait> extends Function {
  readonly prototype: R;

  readonly mountFlags: ModelFlags;

  readonly powerFlags: ModelFlags;

  readonly insertChildFlags: ModelFlags;

  readonly removeChildFlags: ModelFlags;

  readonly insertTraitFlags: ModelFlags;

  readonly removeTraitFlags: ModelFlags;

  readonly startConsumingFlags: TraitFlags;

  readonly stopConsumingFlags: TraitFlags;
}

export abstract class Trait implements ModelDownlinkContext {
  constructor() {
    Object.defineProperty(this, "traitFlags", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "traitObservers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly traitFlags: TraitFlags;

  setTraitFlags(traitFlags: TraitFlags): void {
    Object.defineProperty(this, "traitFlags", {
      value: traitFlags,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly traitObservers: ReadonlyArray<TraitObserver>;

  addTraitObserver(traitObserver: TraitObserverType<this>): void {
    const oldTraitObservers = this.traitObservers;
    const newTraitObservers = Arrays.inserted(traitObserver, oldTraitObservers);
    if (oldTraitObservers !== newTraitObservers) {
      this.willAddTraitObserver(traitObserver);
      Object.defineProperty(this, "traitObservers", {
        value: newTraitObservers,
        enumerable: true,
        configurable: true,
      });
      this.onAddTraitObserver(traitObserver);
      this.didAddTraitObserver(traitObserver);
    }
  }

  protected willAddTraitObserver(traitObserver: TraitObserverType<this>): void {
    // hook
  }

  protected onAddTraitObserver(traitObserver: TraitObserverType<this>): void {
    // hook
  }

  protected didAddTraitObserver(traitObserver: TraitObserverType<this>): void {
    // hook
  }

  removeTraitObserver(traitObserver: TraitObserverType<this>): void {
    const oldTraitObservers = this.traitObservers;
    const newTraitObservers = Arrays.removed(traitObserver, oldTraitObservers);
    if (oldTraitObservers !== newTraitObservers) {
      this.willRemoveTraitObserver(traitObserver);
      Object.defineProperty(this, "traitObservers", {
        value: newTraitObservers,
        enumerable: true,
        configurable: true,
      });
      this.onRemoveTraitObserver(traitObserver);
      this.didRemoveTraitObserver(traitObserver);
    }
  }

  protected willRemoveTraitObserver(traitObserver: TraitObserverType<this>): void {
    // hook
  }

  protected onRemoveTraitObserver(traitObserver: TraitObserverType<this>): void {
    // hook
  }

  protected didRemoveTraitObserver(traitObserver: TraitObserverType<this>): void {
    // hook
  }

  abstract get key(): string | undefined;

  /** @hidden */
  abstract setKey(key: string | undefined): void;

  get modelFlags(): ModelFlags {
    const model = this.model;
    return model !== null ? model.modelFlags : 0;
  }

  setModelFlags(modelFlags: ModelFlags): void {
    const model = this.model;
    if (model !== null) {
      model.setModelFlags(modelFlags);
    } else {
      throw new Error("no model");
    }
  }

  abstract get model(): Model | null;

  /** @hidden */
  abstract setModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void;

  protected willSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetModel !== void 0) {
        traitObserver.traitWillSetModel(newModel, oldModel, this);
      }
    }
  }

  protected onSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    if (newModel !== null) {
      if (newModel.isMounted()) {
        this.doMount();
        if (newModel.isPowered()) {
          this.doPower();
        }
      }
    } else if (this.isMounted()) {
      try {
        if (this.isPowered()) {
          this.doUnpower();
        }
      } finally {
        this.doUnmount();
      }
    }
  }

  protected didSetModel(newModel: TraitModelType<this> | null, oldModel: TraitModelType<this> | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetModel !== void 0) {
        traitObserver.traitDidSetModel(newModel, oldModel, this);
      }
    }
  }

  abstract remove(): void;

  get parentModel(): Model | null {
    const model = this.model;
    return model !== null ? model.parentModel : null;
  }

  protected attachParentModel(parentModel: Model): void {
    // hook
  }

  protected detachParentModel(parentModel: Model): void {
    // hook
  }

  protected willSetParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillSetParentModel !== void 0) {
        traitObserver.traitWillSetParentModel(newParentModel, oldParentModel, this);
      }
    }
  }

  protected onSetParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    // hook
  }

  protected didSetParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidSetParentModel !== void 0) {
        traitObserver.traitDidSetParentModel(newParentModel, oldParentModel, this);
      }
    }
  }

  get childModelCount(): number {
    const model = this.model;
    return model !== null ? model.childModelCount : 0;
  }

  get childModels(): ReadonlyArray<Model> {
    const model = this.model;
    return model !== null ? model.childModels : [];
  }

  firstChildModel(): Model | null {
    const model = this.model;
    return model !== null ? model.firstChildModel() : null;
  }

  lastChildModel(): Model | null {
    const model = this.model;
    return model !== null ? model.lastChildModel() : null;
  }

  nextChildModel(targetModel: Model): Model | null {
    const model = this.model;
    return model !== null ? model.nextChildModel(targetModel) : null;
  }

  previousChildModel(targetModel: Model): Model | null {
    const model = this.model;
    return model !== null ? model.previousChildModel(targetModel) : null;
  }

  forEachChildModel<T>(callback: (childModel: Model) => T | void): T | undefined;
  forEachChildModel<T, S>(callback: (this: S, childModel: Model) => T | void,
                          thisArg: S): T | undefined;
  forEachChildModel<T, S>(callback: (this: S | undefined, childModel: Model) => T | void,
                          thisArg?: S): T | undefined {
    const model = this.model;
    return model !== null ? model.forEachChildModel(callback, thisArg) : void 0;
  }

  getChildModel(key: string): Model | null {
    const model = this.model;
    return model !== null ? model.getChildModel(key) : null;
  }

  setChildModel(key: string, newChildModel: Model | null): Model | null {
    const model = this.model;
    if (model !== null) {
      return model.setChildModel(key, newChildModel);
    } else {
      throw new Error("no model");
    }
  }

  appendChildModel(childModel: Model, key?: string): void {
    const model = this.model;
    if (model !== null) {
      model.appendChildModel(childModel, key);
    } else {
      throw new Error("no model");
    }
  }

  prependChildModel(childModel: Model, key?: string): void {
    const model = this.model;
    if (model !== null) {
      model.prependChildModel(childModel, key);
    } else {
      throw new Error("no model");
    }
  }

  insertChildModel(childModel: Model, targetModel: Model | null, key?: string): void {
    const model = this.model;
    if (model !== null) {
      model.insertChildModel(childModel, targetModel, key);
    } else {
      throw new Error("no model");
    }
  }

  get insertChildFlags(): ModelFlags {
    return (this.constructor as TraitClass).insertChildFlags;
  }

  protected willInsertChildModel(childModel: Model, targetModel: Model | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillInsertChildModel !== void 0) {
        traitObserver.traitWillInsertChildModel(childModel, targetModel, this);
      }
    }
  }

  protected onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    this.requireUpdate(this.insertChildFlags);
  }

  protected didInsertChildModel(childModel: Model, targetModel: Model | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidInsertChildModel !== void 0) {
        traitObserver.traitDidInsertChildModel(childModel, targetModel, this);
      }
    }
  }

  removeChildModel(key: string): Model | null;
  removeChildModel(childModel: Model): void;
  removeChildModel(key: string | Model): Model | null | void {
    const model = this.model;
    if (typeof key === "string") {
      return model !== null ? model.removeChildModel(key) : null;
    } else if (model !== null) {
      model.removeChildModel(key);
    }
  }

  get removeChildFlags(): ModelFlags {
    return (this.constructor as TraitClass).removeChildFlags;
  }

  protected willRemoveChildModel(childModel: Model): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillRemoveChildModel !== void 0) {
        traitObserver.traitWillRemoveChildModel(childModel, this);
      }
    }
    this.requireUpdate(this.removeChildFlags);
  }

  protected onRemoveChildModel(childModel: Model): void {
    // hook
  }

  protected didRemoveChildModel(childModel: Model): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidRemoveChildModel !== void 0) {
        traitObserver.traitDidRemoveChildModel(childModel, this);
      }
    }
  }

  getSuperModel<M extends Model>(modelClass: ModelClass<M>): M | null {
    const model = this.model;
    return model !== null ? model.getSuperModel(modelClass) : null;
  }

  getBaseModel<M extends Model>(modelClass: ModelClass<M>): M | null {
    const model = this.model;
    return model !== null ? model.getBaseModel(modelClass) : null;
  }

  get traitCount(): number {
    const model = this.model;
    return model !== null ? model.traitCount : 0;
  }

  get traits(): ReadonlyArray<Trait> {
    const model = this.model;
    return model !== null ? model.traits : [];
  }

  firstTrait(): Trait | null {
    const model = this.model;
    return model !== null ? model.firstTrait() : null;
  }

  lastTrait(): Trait | null {
    const model = this.model;
    return model !== null ? model.lastTrait() : null;
  }

  nextTrait(targetTrait: Trait): Trait | null {
    const model = this.model;
    return model !== null ? model.nextTrait(targetTrait) : null;
  }

  previousTrait(targetTrait: Trait): Trait | null {
    const model = this.model;
    return model !== null ? model.previousTrait(targetTrait) : null;
  }

  forEachTrait<T>(callback: (trait: Trait) => T | void): T | undefined;
  forEachTrait<T, S>(callback: (this: S, trait: Trait) => T | void,
                     thisArg: S): T | undefined;
  forEachTrait<T, S>(callback: (this: S | undefined, trait: Trait) => T | void,
                     thisArg?: S): T | undefined {
    const model = this.model;
    return model !== null ? model.forEachTrait(callback, thisArg) : void 0;
  }

  getTrait(key: string): Trait | null;
  getTrait<R extends Trait>(traitClass: TraitClass<R>): R | null;
  getTrait(key: string | TraitClass): Trait | null;
  getTrait(key: string | TraitClass): Trait | null {
    const model = this.model;
    return model !== null ? model.getTrait(key) : null;
  }

  setTrait(key: string, newTrait: Trait | null): Trait | null {
    const model = this.model;
    if (model !== null) {
      return model.setTrait(key, newTrait);
    } else {
      throw new Error("no model");
    }
  }

  appendTrait(trait: Trait, key?: string): void {
    const model = this.model;
    if (model !== null) {
      model.appendTrait(trait, key);
    } else {
      throw new Error("no model");
    }
  }

  prependTrait(trait: Trait, key?: string): void {
    const model = this.model;
    if (model !== null) {
      model.prependTrait(trait, key);
    } else {
      throw new Error("no model");
    }
  }

  insertTrait(trait: Trait, targetTrait: Trait | null, key?: string): void {
    const model = this.model;
    if (model !== null) {
      model.insertTrait(trait, targetTrait, key);
    } else {
      throw new Error("no model");
    }
  }

  get insertTraitFlags(): ModelFlags {
    return (this.constructor as TraitClass).insertTraitFlags;
  }

  protected willInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillInsertTrait !== void 0) {
        traitObserver.traitWillInsertTrait(trait, targetTrait, this);
      }
    }
  }

  protected onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    this.requireUpdate(this.insertTraitFlags);
  }

  protected didInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidInsertTrait !== void 0) {
        traitObserver.traitDidInsertTrait(trait, targetTrait, this);
      }
    }
  }

  removeTrait(key: string): Trait | null;
  removeTrait(trait: Trait): void;
  removeTrait(key: string | Trait): Trait | null | void {
    const model = this.model;
    if (typeof key === "string") {
      return model !== null ? model.removeTrait(key) : null;
    } else if (model !== null) {
      model.removeTrait(key);
    }
  }

  get removeTraitFlags(): ModelFlags {
    return (this.constructor as TraitClass).removeTraitFlags;
  }

  protected willRemoveTrait(trait: Trait): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillRemoveTrait !== void 0) {
        traitObserver.traitWillRemoveTrait(trait, this);
      }
    }
  }

  protected onRemoveTrait(trait: Trait): void {
    this.requireUpdate(this.removeTraitFlags);
  }

  protected didRemoveTrait(trait: Trait): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidRemoveTrait !== void 0) {
        traitObserver.traitDidRemoveTrait(trait, this);
      }
    }
  }

  getSuperTrait<R extends Trait>(traitClass: TraitClass<R>): R | null {
    const model = this.model;
    return model !== null ? model.getSuperTrait(traitClass) : null;
  }

  getBaseTrait<R extends Trait>(traitClass: TraitClass<R>): R | null {
    const model = this.model;
    return model !== null ? model.getBaseTrait(traitClass) : null;
  }

  declare readonly warpService: TraitService<this, WarpManager>; // defined by WarpService

  declare readonly warpRef: TraitProperty<this, WarpRef | undefined>; // defined by GenericTrait

  isMounted(): boolean {
    return (this.traitFlags & Trait.MountedFlag) !== 0;
  }

  get mountFlags(): ModelFlags {
    return (this.constructor as TraitClass).mountFlags;
  }

  /** @hidden */
  abstract doMount(): void;

  protected willMount(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillMount !== void 0) {
        traitObserver.traitWillMount(this);
      }
    }
  }

  protected onMount(): void {
    this.requireUpdate(this.mountFlags);
  }

  protected didMount(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidMount !== void 0) {
        traitObserver.traitDidMount(this);
      }
    }
  }

  /** @hidden */
  abstract doUnmount(): void;

  protected willUnmount(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillUnmount !== void 0) {
        traitObserver.traitWillUnmount(this);
      }
    }
  }

  protected onUnmount(): void {
    // hook
  }

  protected didUnmount(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidUnmount !== void 0) {
        traitObserver.traitDidUnmount(this);
      }
    }
  }

  isPowered(): boolean {
    return (this.traitFlags & Trait.PoweredFlag) !== 0;
  }

  get powerFlags(): ModelFlags {
    return (this.constructor as TraitClass).powerFlags;
  }

  /** @hidden */
  abstract doPower(): void;

  protected willPower(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillPower !== void 0) {
        traitObserver.traitWillPower(this);
      }
    }
  }

  protected onPower(): void {
    this.requireUpdate(this.powerFlags);
  }

  protected didPower(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidPower !== void 0) {
        traitObserver.traitDidPower(this);
      }
    }
  }

  /** @hidden */
  abstract doUnpower(): void;

  protected willUnpower(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillUnpower !== void 0) {
        traitObserver.traitWillUnpower(this);
      }
    }
  }

  protected onUnpower(): void {
    // hook
  }

  protected didUnpower(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidUnpower !== void 0) {
        traitObserver.traitDidUnpower(this);
      }
    }
  }

  requireUpdate(updateFlags: ModelFlags, immediate: boolean = false): void {
    const model = this.model;
    if (model !== null) {
      model.requireUpdate(updateFlags, immediate);
    }
  }

  protected willRequireUpdate(updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected onRequireUpdate(updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected didRequireUpdate(updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  requestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    const model = this.model;
    if (model !== null) {
      model.requestUpdate(targetModel, updateFlags, immediate);
    } else {
      throw new TypeError("no model");
    }
  }

  protected willRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected onRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected didRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  isTraversing(): boolean {
    const model = this.model;
    return model !== null && model.isTraversing();
  }

  isUpdating(): boolean {
    const model = this.model;
    return model !== null && model.isUpdating();
  }

  isAnalyzing(): boolean {
    const model = this.model;
    return model !== null && model.isAnalyzing();
  }

  needsAnalyze(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): ModelFlags {
    return analyzeFlags;
  }

  protected willAnalyze(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected onAnalyze(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didAnalyze(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected willMutate(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillMutate !== void 0) {
        traitObserver.traitWillMutate(modelContext, this);
      }
    }
  }

  protected onMutate(modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didMutate(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidMutate !== void 0) {
        traitObserver.traitDidMutate(modelContext, this);
      }
    }
  }

  protected willAggregate(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillAggregate !== void 0) {
        traitObserver.traitWillAggregate(modelContext, this);
      }
    }
  }

  protected onAggregate(modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didAggregate(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidAggregate !== void 0) {
        traitObserver.traitDidAggregate(modelContext, this);
      }
    }
  }

  protected willCorrelate(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillCorrelate !== void 0) {
        traitObserver.traitWillCorrelate(modelContext, this);
      }
    }
  }

  protected onCorrelate(modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didCorrelate(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidCorrelate !== void 0) {
        traitObserver.traitDidCorrelate(modelContext, this);
      }
    }
  }

  protected willAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected onAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected analyzeChildModels(analyzeFlags: ModelFlags, modelContext: TraitContextType<this>,
                               analyzeChildModel: (this: TraitModelType<this>, childModel: Model, analyzeFlags: ModelFlags,
                                                   modelContext: TraitContextType<this>) => void,
                               analyzeChildModels: (this: TraitModelType<this>, analyzeFlags: ModelFlags, modelContext: TraitContextType<this>,
                                                    analyzeChildModel: (this: TraitModelType<this>, childModel: Model, analyzeFlags: ModelFlags,
                                                                        modelContext: TraitContextType<this>) => void) => void): void {
    const model = this.model as TraitModelType<this>;
    analyzeChildModels.call(model, analyzeFlags, modelContext, analyzeChildModel);
  }

  protected willAnalyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected onAnalyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didAnalyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  isRefreshing(): boolean {
    const model = this.model;
    return model !== null && model.isRefreshing();
  }

  needsRefresh(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): ModelFlags {
    return refreshFlags;
  }

  protected willRefresh(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected onRefresh(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didRefresh(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected willValidate(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillValidate !== void 0) {
        traitObserver.traitWillValidate(modelContext, this);
      }
    }
  }

  protected onValidate(modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didValidate(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidValidate !== void 0) {
        traitObserver.traitDidValidate(modelContext, this);
      }
    }
  }

  protected willReconcile(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillReconcile !== void 0) {
        traitObserver.traitWillReconcile(modelContext, this);
      }
    }
  }

  protected onReconcile(modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didReconcile(modelContext: TraitContextType<this>): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidReconcile !== void 0) {
        traitObserver.traitDidReconcile(modelContext, this);
      }
    }
  }

  protected willRefreshChildModels(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected onRefreshChildModels(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didRefreshChildModels(refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected refreshChildModels(refreshFlags: ModelFlags, modelContext: TraitContextType<this>,
                               refreshChildModel: (this: TraitModelType<this>, childModel: Model, refreshFlags: ModelFlags,
                                                   modelContext: TraitContextType<this>) => void,
                               refreshChildModels: (this: TraitModelType<this>, refreshFlags: ModelFlags, modelContext: TraitContextType<this>,
                                                    refreshChildModel: (this: TraitModelType<this>, childModel: Model, refreshFlags: ModelFlags,
                                                                        modelContext: TraitContextType<this>) => void) => void): void {
    const model = this.model as TraitModelType<this>;
    refreshChildModels.call(model, refreshFlags, modelContext, refreshChildModel);
  }

  protected willRefreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected onRefreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  protected didRefreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: TraitContextType<this>): void {
    // hook
  }

  isConsuming(): boolean {
    return (this.traitFlags & Trait.ConsumingFlag) !== 0;
  }

  get startConsumingFlags(): ModelFlags {
    return (this.constructor as TraitClass).startConsumingFlags;
  }

  protected willStartConsuming(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillStartConsuming !== void 0) {
        traitObserver.traitWillStartConsuming(this);
      }
    }
  }

  protected onStartConsuming(): void {
    this.requireUpdate(this.startConsumingFlags);
  }

  protected didStartConsuming(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidStartConsuming !== void 0) {
        traitObserver.traitDidStartConsuming(this);
      }
    }
  }

  get stopConsumingFlags(): ModelFlags {
    return (this.constructor as TraitClass).stopConsumingFlags;
  }

  protected willStopConsuming(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitWillStopConsuming !== void 0) {
        traitObserver.traitWillStopConsuming(this);
      }
    }
  }

  protected onStopConsuming(): void {
    this.requireUpdate(this.stopConsumingFlags);
  }

  protected didStopConsuming(): void {
    const traitObservers = this.traitObservers;
    for (let i = 0, n = traitObservers.length; i < n; i += 1) {
      const traitObserver = traitObservers[i]!;
      if (traitObserver.traitDidStopConsuming !== void 0) {
        traitObserver.traitDidStopConsuming(this);
      }
    }
  }

  abstract get traitConsumers(): ReadonlyArray<TraitConsumer>;

  abstract addTraitConsumer(traitConsumer: TraitConsumerType<this>): void;

  protected willAddTraitConsumer(traitConsumer: TraitConsumerType<this>): void {
    // hook
  }

  protected onAddTraitConsumer(traitConsumer: TraitConsumerType<this>): void {
    // hook
  }

  protected didAddTraitConsumer(traitConsumer: TraitConsumerType<this>): void {
    // hook
  }

  abstract removeTraitConsumer(traitConsumer: TraitConsumerType<this>): void;

  protected willRemoveTraitConsumer(traitConsumer: TraitConsumerType<this>): void {
    // hook
  }

  protected onRemoveTraitConsumer(traitConsumer: TraitConsumerType<this>): void {
    // hook
  }

  protected didRemoveTraitConsumer(traitConsumer: TraitConsumerType<this>): void {
    // hook
  }

  abstract hasTraitService(serviceName: string): boolean;

  abstract getTraitService(serviceName: string): TraitService<this, unknown> | null;

  abstract setTraitService(serviceName: string, traitService: TraitService<this, unknown> | null): void;

  /** @hidden */
  getLazyTraitService(serviceName: string): TraitService<this, unknown> | null {
    let traitService = this.getTraitService(serviceName) as TraitService<this, unknown> | null;
    if (traitService === null) {
      const constructor = Trait.getTraitServiceConstructor(serviceName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        traitService = new constructor(this, serviceName) as TraitService<this, unknown>;
        this.setTraitService(serviceName, traitService);
      }
    }
    return traitService;
  }

  abstract hasTraitProperty(propertyName: string): boolean;

  abstract getTraitProperty(propertyName: string): TraitProperty<this, unknown> | null;

  abstract setTraitProperty(propertyName: string, traitProperty: TraitProperty<this, unknown> | null): void;

  /** @hidden */
  getLazyTraitProperty(propertyName: string): TraitProperty<this, unknown> | null {
    let traitProperty = this.getTraitProperty(propertyName) as TraitProperty<this, unknown> | null;
    if (traitProperty === null) {
      const constructor = Trait.getTraitPropertyConstructor(propertyName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        traitProperty = new constructor(this, propertyName) as TraitProperty<this, unknown>;
        this.setTraitProperty(propertyName, traitProperty);
      }
    }
    return traitProperty;
  }

  abstract hasTraitModel(fastenerName: string): boolean;

  abstract getTraitModel(fastenerName: string): TraitModel<this, Model> | null;

  abstract setTraitModel(fastenerName: string, traitModel: TraitModel<this, Model> | null): void;

  /** @hidden */
  getLazyTraitModel(fastenerName: string): TraitModel<this, Model> | null {
    let traitModel = this.getTraitModel(fastenerName) as TraitModel<this, Model> | null;
    if (traitModel === null) {
      const constructor = Trait.getTraitModelConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const key = constructor.prototype.key === true ? fastenerName
                  : constructor.prototype.key === false ? void 0
                  : constructor.prototype.key;
        traitModel = new constructor(this, key, fastenerName) as TraitModel<this, Model>;
        this.setTraitModel(fastenerName, traitModel);
      }
    }
    return traitModel;
  }

  abstract hasTraitFastener(fastenerName: string): boolean;

  abstract getTraitFastener(fastenerName: string): TraitFastener<this, Trait> | null;

  abstract setTraitFastener(fastenerName: string, traitFastener: TraitFastener<this, Trait> | null): void;

  /** @hidden */
  getLazyTraitFastener(fastenerName: string): TraitFastener<this, Trait> | null {
    let traitFastener = this.getTraitFastener(fastenerName) as TraitFastener<this, Trait> | null;
    if (traitFastener === null) {
      const constructor = Trait.getTraitFastenerConstructor(fastenerName, Object.getPrototypeOf(this));
      if (constructor !== null) {
        const key = constructor.prototype.key === true ? fastenerName
                  : constructor.prototype.key === false ? void 0
                  : constructor.prototype.key;
        traitFastener = new constructor(this, key, fastenerName) as TraitFastener<this, Trait>;
        this.setTraitFastener(fastenerName, traitFastener);
      }
    }
    return traitFastener;
  }

  abstract hasModelDownlink(downlinkName: string): boolean;

  abstract getModelDownlink(downlinkName: string): ModelDownlink<this> | null;

  abstract setModelDownlink(downlinkName: string, traitDownlink: ModelDownlink<this> | null): void;

  get modelContext(): TraitContextType<this> | null {
    const model = this.model;
    return model !== null ? model.modelContext as TraitContextType<this> : null;
  }

  /** @hidden */
  static getTraitServiceConstructor(serviceName: string, traitPrototype: TraitPrototype | null = null): TraitServiceConstructor<Trait, unknown> | null {
    if (traitPrototype === null) {
      traitPrototype = this.prototype as TraitPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(traitPrototype, "traitServiceConstructors")) {
        const descriptor = traitPrototype.traitServiceConstructors![serviceName];
        if (descriptor !== void 0) {
          return descriptor;
        }
      }
      traitPrototype = Object.getPrototypeOf(traitPrototype);
    } while (traitPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateTraitService(constructor: TraitServiceConstructor<Trait, unknown>,
                              target: Object, propertyKey: string | symbol): void {
    const traitPrototype = target as TraitPrototype;
    if (!Object.prototype.hasOwnProperty.call(traitPrototype, "traitServiceConstructors")) {
      traitPrototype.traitServiceConstructors = {};
    }
    traitPrototype.traitServiceConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Trait): TraitService<Trait, unknown> {
        let traitService = this.getTraitService(propertyKey.toString());
        if (traitService === null) {
          traitService = new constructor(this, propertyKey.toString());
          this.setTraitService(propertyKey.toString(), traitService);
        }
        return traitService;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getTraitPropertyConstructor(propertyName: string, traitPrototype: TraitPrototype | null = null): TraitPropertyConstructor<Trait, unknown> | null {
    if (traitPrototype === null) {
      traitPrototype = this.prototype as TraitPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(traitPrototype, "traitPropertyConstructors")) {
        const constructor = traitPrototype.traitPropertyConstructors![propertyName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      traitPrototype = Object.getPrototypeOf(traitPrototype);
    } while (traitPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateTraitProperty(constructor: TraitPropertyConstructor<Trait, unknown>,
                               target: Object, propertyKey: string | symbol): void {
    const traitPrototype = target as TraitPrototype;
    if (!Object.prototype.hasOwnProperty.call(traitPrototype, "traitPropertyConstructors")) {
      traitPrototype.traitPropertyConstructors = {};
    }
    traitPrototype.traitPropertyConstructors![propertyKey.toString()] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Trait): TraitProperty<Trait, unknown> {
        let traitProperty = this.getTraitProperty(propertyKey.toString());
        if (traitProperty === null) {
          traitProperty = new constructor(this, propertyKey.toString());
          this.setTraitProperty(propertyKey.toString(), traitProperty);
        }
        return traitProperty;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getTraitModelConstructor(fastenerName: string, traitPrototype: TraitPrototype | null = null): TraitModelConstructor<Trait, Model> | null {
    if (traitPrototype === null) {
      traitPrototype = this.prototype as TraitPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(traitPrototype, "traitModelConstructors")) {
        const constructor = traitPrototype.traitModelConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      traitPrototype = Object.getPrototypeOf(traitPrototype);
    } while (traitPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateTraitModel(constructor: TraitModelConstructor<Trait, Model>,
                            target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const key = constructor.prototype.key === true ? fastenerName
              : constructor.prototype.key === false ? void 0
              : constructor.prototype.key;
    const traitPrototype = target as TraitPrototype;
    if (!Object.prototype.hasOwnProperty.call(traitPrototype, "traitModelConstructors")) {
      traitPrototype.traitModelConstructors = {};
    }
    traitPrototype.traitModelConstructors![fastenerName] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Trait): TraitModel<Trait, Model> {
        let traitModel = this.getTraitModel(fastenerName);
        if (traitModel === null) {
          traitModel = new constructor(this, key, fastenerName);
          this.setTraitModel(fastenerName, traitModel);
        }
        return traitModel;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getTraitFastenerConstructor(fastenerName: string, traitPrototype: TraitPrototype | null = null): TraitFastenerConstructor<Trait, Trait> | null {
    if (traitPrototype === null) {
      traitPrototype = this.prototype as TraitPrototype;
    }
    do {
      if (Object.prototype.hasOwnProperty.call(traitPrototype, "traitFastenerConstructors")) {
        const constructor = traitPrototype.traitFastenerConstructors![fastenerName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      traitPrototype = Object.getPrototypeOf(traitPrototype);
    } while (traitPrototype !== null);
    return null;
  }

  /** @hidden */
  static decorateTraitFastener(constructor: TraitFastenerConstructor<Trait, Trait>,
                               target: Object, propertyKey: string | symbol): void {
    const fastenerName = propertyKey.toString();
    const key = constructor.prototype.key === true ? fastenerName
              : constructor.prototype.key === false ? void 0
              : constructor.prototype.key;
    const traitPrototype = target as TraitPrototype;
    if (!Object.prototype.hasOwnProperty.call(traitPrototype, "traitFastenerConstructors")) {
      traitPrototype.traitFastenerConstructors = {};
    }
    traitPrototype.traitFastenerConstructors![fastenerName] = constructor;
    Object.defineProperty(target, propertyKey, {
      get: function (this: Trait): TraitFastener<Trait, Trait> {
        let traitFastener = this.getTraitFastener(fastenerName);
        if (traitFastener === null) {
          traitFastener = new constructor(this, key, fastenerName);
          this.setTraitFastener(fastenerName, traitFastener);
        }
        return traitFastener;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static readonly MountedFlag: TraitFlags = 1 << 0;
  /** @hidden */
  static readonly PoweredFlag: TraitFlags = 1 << 1;
  /** @hidden */
  static readonly ConsumingFlag: TraitFlags = 1 << 2;

  static readonly mountFlags: ModelFlags = 0;
  static readonly powerFlags: ModelFlags = 0;
  static readonly insertChildFlags: ModelFlags = 0;
  static readonly removeChildFlags: ModelFlags = 0;
  static readonly insertTraitFlags: ModelFlags = 0;
  static readonly removeTraitFlags: ModelFlags = 0;
  static readonly startConsumingFlags: TraitFlags = 0;
  static readonly stopConsumingFlags: TraitFlags = 0;
}
