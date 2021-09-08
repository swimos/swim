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
import type {ModelContextType, ModelContext} from "../ModelContext";
import {ModelFlags, Model} from "../Model";
import type {ModelObserverType} from "../ModelObserver";
import type {ModelConsumerType, ModelConsumer} from "../ModelConsumer";
import type {Trait} from "../Trait";
import type {ModelService} from "../service/ModelService";
import {ModelProperty} from "../property/ModelProperty";
import type {ModelFastener} from "../fastener/ModelFastener";
import type {ModelTrait} from "../fastener/ModelTrait";
import {ModelDownlinkContext} from "../downlink/ModelDownlinkContext";
import type {ModelDownlink} from "../downlink/ModelDownlink";

export abstract class GenericModel extends Model {
  constructor() {
    super();
    Object.defineProperty(this, "key", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "parentModel", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "modelConsumers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "modelServices", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "modelProperties", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "modelFasteners", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "modelTraits", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "modelDownlinks", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  protected willObserve<T>(callback: (this: this, modelObserver: ModelObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      result = callback.call(this, modelObserver as ModelObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, modelObserver: ModelObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const modelObservers = this.modelObservers;
    for (let i = 0, n = modelObservers.length; i < n; i += 1) {
      const modelObserver = modelObservers[i]!;
      result = callback.call(this, modelObserver as ModelObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  override readonly key!: string | undefined;

  /** @hidden */
  override setKey(key: string | undefined): void {
    Object.defineProperty(this, "key", {
      value: key,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly parentModel!: Model | null;

  /** @hidden */
  override setParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    this.willSetParentModel(newParentModel, oldParentModel);
    if (oldParentModel !== null) {
      this.detachParentModel(oldParentModel);
    }
    Object.defineProperty(this, "parentModel", {
      value: newParentModel,
      enumerable: true,
      configurable: true,
    });
    if (newParentModel !== null) {
      this.attachParentModel(newParentModel);
    }
    this.onSetParentModel(newParentModel, oldParentModel);
    this.didSetParentModel(newParentModel, oldParentModel);
  }

  override remove(): void {
    const parentModel = this.parentModel;
    if (parentModel !== null) {
      if ((this.modelFlags & Model.TraversingFlag) === 0) {
        parentModel.removeChildModel(this);
      } else {
        this.setModelFlags(this.modelFlags | Model.RemovingFlag);
      }
    }
  }

  abstract override readonly childModelCount: number;

  abstract override readonly childModels: ReadonlyArray<Model>;

  abstract override firstChildModel(): Model | null;

  abstract override lastChildModel(): Model | null;

  abstract override nextChildModel(targetModel: Model): Model | null;

  abstract override previousChildModel(targetModel: Model): Model | null;

  abstract override forEachChildModel<T>(callback: (childModel: Model) => T | void): T | undefined;
  abstract override forEachChildModel<T, S>(callback: (this: S, childModel: Model) => T | void,
                                            thisArg: S): T | undefined;

  abstract override getChildModel(key: string): Model | null;

  abstract override setChildModel(key: string, newChildModel: Model | null): Model | null;

  abstract override appendChildModel(childModel: Model, key?: string): void;

  abstract override prependChildModel(childModel: Model, key?: string): void;

  abstract override insertChildModel(childModel: Model, targetModel: Model | null, key?: string): void;

  protected override onInsertChildModel(childModel: Model, targetModel: Model | null): void {
    super.onInsertChildModel(childModel, targetModel);
    this.insertModelFastener(childModel, targetModel);
  }

  override cascadeInsert(updateFlags?: ModelFlags, modelContext?: ModelContext): void {
    // nop
  }

  abstract override removeChildModel(key: string): Model | null;
  abstract override removeChildModel(childModel: Model): void;

  protected override onRemoveChildModel(childModel: Model): void {
    super.onRemoveChildModel(childModel);
    this.removeModelFastener(childModel);
  }

  abstract override removeAll(): void;

  protected override onInsertTrait(trait: Trait, targetTrait: Trait | null): void {
    super.onInsertTrait(trait, targetTrait);
    this.insertModelTrait(trait, targetTrait);
  }

  protected override onRemoveTrait(trait: Trait): void {
    super.onRemoveTrait(trait);
    this.removeModelTrait(trait);
  }

  override cascadeMount(): void {
    if ((this.modelFlags & Model.MountedFlag) === 0) {
      this.setModelFlags(this.modelFlags | (Model.MountedFlag | Model.TraversingFlag));
      try {
        this.willMount();
        this.onMount();
        this.mountTraits();
        this.mountChildModels();
        this.didMount();
      } finally {
        this.setModelFlags(this.modelFlags & ~Model.TraversingFlag);
      }
    } else {
      throw new Error("already mounted");
    }
  }

  protected override onMount(): void {
    super.onMount();
    this.mountModelServices();
    this.mountModelProperties();
    this.mountModelFasteners();
    this.mountModelTraits();
    this.mountModelDownlinks();
    if (this.modelConsumers.length !== 0) {
      this.startConsuming();
    }
  }

  /** @hidden */
  protected mountTraits(): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).mountTrait();
    }
  }

  /** @hidden */
  protected mountChildModels(): void {
    type self = this;
    function mountChildModel(this: self, childModel: Model): void {
      childModel.cascadeMount();
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
      }
    }
    this.forEachChildModel(mountChildModel, this);
  }

  override cascadeUnmount(): void {
    if ((this.modelFlags & Model.MountedFlag) !== 0) {
      this.setModelFlags(this.modelFlags & ~Model.MountedFlag | Model.TraversingFlag);
      try {
        this.willUnmount();
        this.unmountChildModels();
        this.unmountTraits();
        this.onUnmount();
        this.didUnmount();
      } finally {
        this.setModelFlags(this.modelFlags & ~Model.TraversingFlag);
      }
    } else {
      throw new Error("already unmounted");
    }
  }

  protected override onUnmount(): void {
    this.stopConsuming();
    this.unmountModelDownlinks();
    this.unmountModelTraits();
    this.unmountModelFasteners();
    this.unmountModelProperties();
    this.unmountModelServices();
    this.setModelFlags(this.modelFlags & (~Model.ModelFlagMask | Model.RemovingFlag));
  }

  /** @hidden */
  protected unmountTraits(): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).unmountTrait();
    }
  }

  /** @hidden */
  protected unmountChildModels(): void {
    type self = this;
    function unmountChildModel(this: self, childModel: Model): void {
      childModel.cascadeUnmount();
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
      }
    }
    this.forEachChildModel(unmountChildModel, this);
  }

  override cascadePower(): void {
    if ((this.modelFlags & Model.PoweredFlag) === 0) {
      this.setModelFlags(this.modelFlags | (Model.PoweredFlag | Model.TraversingFlag));
      try {
        this.willPower();
        this.onPower();
        this.powerTraits();
        this.powerChildModels();
        this.didPower();
      } finally {
        this.setModelFlags(this.modelFlags & ~Model.TraversingFlag);
      }
    } else {
      throw new Error("already powered");
    }
  }

  /** @hidden */
  protected powerTraits(): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).powerTrait();
    }
  }

  /** @hidden */
  protected powerChildModels(): void {
    type self = this;
    function powerChildModel(this: self, childModel: Model): void {
      childModel.cascadePower();
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
      }
    }
    this.forEachChildModel(powerChildModel, this);
  }

  override cascadeUnpower(): void {
    if ((this.modelFlags & Model.PoweredFlag) !== 0) {
      this.setModelFlags(this.modelFlags & ~Model.PoweredFlag | Model.TraversingFlag);
      try {
        this.willUnpower();
        this.unpowerChildModels();
        this.unpowerTraits();
        this.onUnpower();
        this.didUnpower();
      } finally {
        this.setModelFlags(this.modelFlags & ~Model.TraversingFlag);
      }
    } else {
      throw new Error("already unpowered");
    }
  }

  /** @hidden */
  protected unpowerTraits(): void {
    const traits = this.traits;
    for (let i = 0, n = traits.length; i < n; i += 1) {
      (traits[i]! as any).unpowerTrait();
    }
  }

  /** @hidden */
  protected unpowerChildModels(): void {
    type self = this;
    function unpowerChildModel(this: self, childModel: Model): void {
      childModel.cascadeUnpower();
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
      }
    }
    this.forEachChildModel(unpowerChildModel, this);
  }

  override cascadeAnalyze(analyzeFlags: ModelFlags, baesModelContext: ModelContext): void {
    const modelContext = this.extendModelContext(baesModelContext);
    analyzeFlags &= ~Model.NeedsAnalyze;
    analyzeFlags |= this.modelFlags & Model.UpdateMask;
    analyzeFlags = this.needsAnalyze(analyzeFlags, modelContext);
    if ((analyzeFlags & Model.AnalyzeMask) !== 0) {
      let cascadeFlags = analyzeFlags;
      this.setModelFlags(this.modelFlags & ~Model.NeedsAnalyze | (Model.TraversingFlag | Model.AnalyzingFlag));
      try {
        this.willAnalyze(cascadeFlags, modelContext);
        if (((this.modelFlags | analyzeFlags) & Model.NeedsMutate) !== 0) {
          cascadeFlags |= Model.NeedsMutate;
          this.setModelFlags(this.modelFlags & ~Model.NeedsMutate);
          this.willMutate(modelContext);
        }
        if (((this.modelFlags | analyzeFlags) & Model.NeedsAggregate) !== 0) {
          cascadeFlags |= Model.NeedsAggregate;
          this.setModelFlags(this.modelFlags & ~Model.NeedsAggregate);
          this.willAggregate(modelContext);
        }
        if (((this.modelFlags | analyzeFlags) & Model.NeedsCorrelate) !== 0) {
          cascadeFlags |= Model.NeedsCorrelate;
          this.setModelFlags(this.modelFlags & ~Model.NeedsCorrelate);
          this.willCorrelate(modelContext);
        }

        this.onAnalyze(cascadeFlags, modelContext);
        if ((cascadeFlags & Model.NeedsMutate) !== 0) {
          this.onMutate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsAggregate) !== 0) {
          this.onAggregate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsCorrelate) !== 0) {
          this.onCorrelate(modelContext);
        }

        if ((cascadeFlags & Model.AnalyzeMask) !== 0) {
          this.analyzeChildModels(cascadeFlags, modelContext, this.analyzeChildModel);
        }

        if ((cascadeFlags & Model.NeedsCorrelate) !== 0) {
          this.didCorrelate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsAggregate) !== 0) {
          this.didAggregate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsMutate) !== 0) {
          this.didMutate(modelContext);
        }
        this.didAnalyze(cascadeFlags, modelContext);
      } finally {
        this.setModelFlags(this.modelFlags & ~(Model.TraversingFlag | Model.AnalyzingFlag));
      }
    }
  }

  protected override onMutate(modelContext: ModelContextType<this>): void {
    super.onMutate(modelContext);
    this.mutateModelProperties();
  }

  /** @hidden */
  protected abstract analyzeOwnChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                                           analyzeChildModel: (this: this, childModel: Model, analyzeFlags: ModelFlags,
                                                               modelContext: ModelContextType<this>) => void): void;

  protected analyzeTraitChildModels(traits: ReadonlyArray<Trait>, traitIndex: number,
                                    analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                                    analyzeChildModel: (this: this, childModel: Model, analyzeFlags: ModelFlags,
                                                        modelContext: ModelContextType<this>) => void): void {
    if (traitIndex < traits.length) {
      (traits[traitIndex] as any).analyzeChildModels(analyzeFlags, modelContext, analyzeChildModel,
                                                     this.analyzeTraitChildModels.bind(this, traits, traitIndex + 1));
    } else {
      this.analyzeOwnChildModels(analyzeFlags, modelContext, analyzeChildModel);
    }
  }

  protected override analyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                                        analyzeChildModel: (this: this, childModel: Model, analyzeFlags: ModelFlags,
                                                            modelContext: ModelContextType<this>) => void): void {
    const traits = this.traits;
    if (traits.length !== 0) {
      this.analyzeTraitChildModels(traits, 0, analyzeFlags, modelContext, analyzeChildModel);
    } else {
      this.analyzeOwnChildModels(analyzeFlags, modelContext, analyzeChildModel);
    }
  }

  override cascadeRefresh(refreshFlags: ModelFlags, baseModelContext: ModelContext): void {
    const modelContext = this.extendModelContext(baseModelContext);
    refreshFlags &= ~Model.NeedsRefresh;
    refreshFlags |= this.modelFlags & Model.UpdateMask;
    refreshFlags = this.needsRefresh(refreshFlags, modelContext);
    if ((refreshFlags & Model.RefreshMask) !== 0) {
      let cascadeFlags = refreshFlags;
      this.setModelFlags(this.modelFlags & ~Model.NeedsRefresh | (Model.TraversingFlag | Model.RefreshingFlag));
      try {
        this.willRefresh(cascadeFlags, modelContext);
        if (((this.modelFlags | refreshFlags) & Model.NeedsValidate) !== 0) {
          cascadeFlags |= Model.NeedsValidate;
          this.setModelFlags(this.modelFlags & ~Model.NeedsValidate);
          this.willValidate(modelContext);
        }
        if (((this.modelFlags | refreshFlags) & Model.NeedsReconcile) !== 0) {
          cascadeFlags |= Model.NeedsReconcile;
          this.setModelFlags(this.modelFlags & ~Model.NeedsReconcile);
          this.willReconcile(modelContext);
        }

        this.onRefresh(cascadeFlags, modelContext);
        if ((cascadeFlags & Model.NeedsValidate) !== 0) {
          this.onValidate(modelContext);
        }
        if ((cascadeFlags & Model.NeedsReconcile) !== 0) {
          this.onReconcile(modelContext);
        }

        if ((cascadeFlags & Model.RefreshMask)) {
          this.refreshChildModels(cascadeFlags, modelContext, this.refreshChildModel);
        }

        if ((cascadeFlags & Model.NeedsReconcile) !== 0) {
          this.didReconcile(modelContext);
        }
        if ((cascadeFlags & Model.NeedsValidate) !== 0) {
          this.didValidate(modelContext);
        }
        this.didRefresh(cascadeFlags, modelContext);
      } finally {
        this.setModelFlags(this.modelFlags & ~(Model.TraversingFlag | Model.RefreshingFlag));
      }
    }
  }

  /** @hidden */
  protected abstract refreshOwnChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                                           refreshChildModel: (this: this, childModel: Model, refreshFlags: ModelFlags,
                                                               modelContext: ModelContextType<this>) => void): void;

  protected refreshTraitChildModels(traits: ReadonlyArray<Trait>, traitIndex: number,
                                    refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                                    refreshChildModel: (this: this, childModel: Model, refreshFlags: ModelFlags,
                                                        modelContext: ModelContextType<this>) => void): void {
    if (traitIndex < traits.length) {
      (traits[traitIndex] as any).refreshChildModels(refreshFlags, modelContext, refreshChildModel,
                                                     this.refreshTraitChildModels.bind(this, traits, traitIndex + 1));
    } else {
      this.refreshOwnChildModels(refreshFlags, modelContext, refreshChildModel);
    }
  }

  protected override refreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                                        refreshChildModel: (this: this, childModel: Model, refreshFlags: ModelFlags,
                                                            modelContext: ModelContextType<this>) => void): void {
    const traits = this.traits;
    if (traits.length !== 0) {
      this.refreshTraitChildModels(traits, 0, refreshFlags, modelContext, refreshChildModel);
    } else {
      this.refreshOwnChildModels(refreshFlags, modelContext, refreshChildModel);
    }
  }

  protected override onReconcile(modelContext: ModelContextType<this>): void {
    super.onReconcile(modelContext);
    this.reconcileModelDownlinks();
  }

  override readonly modelConsumers!: ReadonlyArray<ModelConsumer>;

  override addModelConsumer(modelConsumer: ModelConsumerType<this>): void {
    const oldModelConsumers = this.modelConsumers;
    const newModelConsumers = Arrays.inserted(modelConsumer, oldModelConsumers);
    if (oldModelConsumers !== newModelConsumers) {
      this.willAddModelConsumer(modelConsumer);
      Object.defineProperty(this, "modelConsumers", {
        value: newModelConsumers,
        enumerable: true,
        configurable: true,
      });
      this.onAddModelConsumer(modelConsumer);
      this.didAddModelConsumer(modelConsumer);
      if (oldModelConsumers.length === 0 && this.isMounted()) {
        this.startConsuming();
      }
    }
  }

  protected override onStartConsuming(): void {
    super.onStartConsuming();
    this.startConsumingModelDownlinks();
  }

  override removeModelConsumer(modelConsumer: ModelConsumerType<this>): void {
    const oldModelConsumers = this.modelConsumers;
    const newModelConsumers = Arrays.removed(modelConsumer, oldModelConsumers);
    if (oldModelConsumers !== newModelConsumers) {
      this.willRemoveModelConsumer(modelConsumer);
      Object.defineProperty(this, "modelConsumers", {
        value: newModelConsumers,
        enumerable: true,
        configurable: true,
      });
      this.onRemoveModelConsumer(modelConsumer);
      this.didRemoveModelConsumer(modelConsumer);
      if (newModelConsumers.length === 0) {
        this.stopConsuming();
      }
    }
  }

  protected override onStopConsuming(): void {
    this.stopConsumingModelDownlinks();
    super.onStopConsuming();
  }

  /** @hidden */
  readonly modelServices!: {[serviceName: string]: ModelService<Model, unknown> | undefined} | null;

  override hasModelService(serviceName: string): boolean {
    const modelServices = this.modelServices;
    return modelServices !== null && modelServices[serviceName] !== void 0;
  }

  override getModelService(serviceName: string): ModelService<this, unknown> | null {
    const modelServices = this.modelServices;
    if (modelServices !== null) {
      const modelService = modelServices[serviceName];
      if (modelService !== void 0) {
        return modelService as ModelService<this, unknown>;
      }
    }
    return null;
  }

  override setModelService(serviceName: string, newModelService: ModelService<this, unknown> | null): void {
    let modelServices = this.modelServices;
    if (modelServices === null) {
      modelServices = {};
      Object.defineProperty(this, "modelServices", {
        value: modelServices,
        enumerable: true,
        configurable: true,
      });
    }
    const oldModelService = modelServices[serviceName];
    if (oldModelService !== void 0 && this.isMounted()) {
      oldModelService.unmount();
    }
    if (newModelService !== null) {
      modelServices[serviceName] = newModelService;
      if (this.isMounted()) {
        newModelService.mount();
      }
    } else {
      delete modelServices[serviceName];
    }
  }

  /** @hidden */
  protected mountModelServices(): void {
    const modelServices = this.modelServices;
    for (const serviceName in modelServices) {
      const modelService = modelServices[serviceName]!;
      modelService.mount();
    }
  }

  /** @hidden */
  protected unmountModelServices(): void {
    const modelServices = this.modelServices;
    for (const serviceName in modelServices) {
      const modelService = modelServices[serviceName]!;
      modelService.unmount();
    }
  }

  /** @hidden */
  readonly modelProperties!: {[propertyName: string]: ModelProperty<Model, unknown> | undefined} | null;

  override hasModelProperty(propertyName: string): boolean {
    const modelProperties = this.modelProperties;
    return modelProperties !== null && modelProperties[propertyName] !== void 0;
  }

  override getModelProperty(propertyName: string): ModelProperty<this, unknown> | null {
    const modelProperties = this.modelProperties;
    if (modelProperties !== null) {
      const modelProperty = modelProperties[propertyName];
      if (modelProperty !== void 0) {
        return modelProperty as ModelProperty<this, unknown>;
      }
    }
    return null;
  }

  override setModelProperty(propertyName: string, newModelProperty: ModelProperty<this, unknown> | null): void {
    let modelProperties = this.modelProperties;
    if (modelProperties === null) {
      modelProperties = {};
      Object.defineProperty(this, "modelProperties", {
        value: modelProperties,
        enumerable: true,
        configurable: true,
      });
    }
    const oldModelProperty = modelProperties[propertyName];
    if (oldModelProperty !== void 0 && this.isMounted()) {
      oldModelProperty.unmount();
    }
    if (newModelProperty !== null) {
      modelProperties[propertyName] = newModelProperty;
      if (this.isMounted()) {
        newModelProperty.mount();
      }
    } else {
      delete modelProperties[propertyName];
    }
  }

  /** @hidden */
  mutateModelProperties(): void {
    const modelProperties = this.modelProperties;
    for (const propertyName in modelProperties) {
      const modelProperty = modelProperties[propertyName]!;
      modelProperty.onMutate();
    }
  }

  /** @hidden */
  protected mountModelProperties(): void {
    const modelProperties = this.modelProperties;
    for (const propertyName in modelProperties) {
      const modelProperty = modelProperties[propertyName]!;
      modelProperty.mount();
    }
  }

  /** @hidden */
  protected unmountModelProperties(): void {
    const modelProperties = this.modelProperties;
    for (const propertyName in modelProperties) {
      const modelProperty = modelProperties[propertyName]!;
      modelProperty.unmount();
    }
  }

  /** @hidden */
  readonly modelFasteners!: {[fastenerName: string]: ModelFastener<Model, Model> | undefined} | null;

  override hasModelFastener(fastenerName: string): boolean {
    const modelFasteners = this.modelFasteners;
    return modelFasteners !== null && modelFasteners[fastenerName] !== void 0;
  }

  override getModelFastener(fastenerName: string): ModelFastener<this, Model> | null {
    const modelFasteners = this.modelFasteners;
    if (modelFasteners !== null) {
      const modelFastener = modelFasteners[fastenerName];
      if (modelFastener !== void 0) {
        return modelFastener as ModelFastener<this, Model>;
      }
    }
    return null;
  }

  override setModelFastener(fastenerName: string, newModelFastener: ModelFastener<this, any> | null): void {
    let modelFasteners = this.modelFasteners;
    if (modelFasteners === null) {
      modelFasteners = {};
      Object.defineProperty(this, "modelFasteners", {
        value: modelFasteners,
        enumerable: true,
        configurable: true,
      });
    }
    const oldModelFastener = modelFasteners[fastenerName];
    if (oldModelFastener !== void 0 && this.isMounted()) {
      oldModelFastener.unmount();
    }
    if (newModelFastener !== null) {
      modelFasteners[fastenerName] = newModelFastener;
      if (this.isMounted()) {
        newModelFastener.mount();
      }
    } else {
      delete modelFasteners[fastenerName];
    }
  }

  /** @hidden */
  protected mountModelFasteners(): void {
    const modelFasteners = this.modelFasteners;
    for (const fastenerName in modelFasteners) {
      const modelFastener = modelFasteners[fastenerName]!;
      modelFastener.mount();
    }
  }

  /** @hidden */
  protected unmountModelFasteners(): void {
    const modelFasteners = this.modelFasteners;
    for (const fastenerName in modelFasteners) {
      const modelFastener = modelFasteners[fastenerName]!;
      modelFastener.unmount();
    }
  }

  /** @hidden */
  protected insertModelFastener(childModel: Model, targetModel: Model | null): void {
    const fastenerName = childModel.key;
    if (fastenerName !== void 0) {
      const modelFastener = this.getLazyModelFastener(fastenerName);
      if (modelFastener !== null && modelFastener.child === true) {
        modelFastener.doSetModel(childModel, targetModel);
      }
    }
  }

  /** @hidden */
  protected removeModelFastener(childModel: Model): void {
    const fastenerName = childModel.key;
    if (fastenerName !== void 0) {
      const modelFastener = this.getModelFastener(fastenerName);
      if (modelFastener !== null && modelFastener.child === true) {
        modelFastener.doSetModel(null, null);
      }
    }
  }

  /** @hidden */
  readonly modelTraits!: {[fastenerName: string]: ModelTrait<Model, Trait> | undefined} | null;

  override hasModelTrait(fastenerName: string): boolean {
    const modelTraits = this.modelTraits;
    return modelTraits !== null && modelTraits[fastenerName] !== void 0;
  }

  override getModelTrait(fastenerName: string): ModelTrait<this, Trait> | null {
    const modelTraits = this.modelTraits;
    if (modelTraits !== null) {
      const modelTrait = modelTraits[fastenerName];
      if (modelTrait !== void 0) {
        return modelTrait as ModelTrait<this, Trait>;
      }
    }
    return null;
  }

  override setModelTrait(fastenerName: string, newModelTrait: ModelTrait<this, any> | null): void {
    let modelTraits = this.modelTraits;
    if (modelTraits === null) {
      modelTraits = {};
      Object.defineProperty(this, "modelTraits", {
        value: modelTraits,
        enumerable: true,
        configurable: true,
      });
    }
    const oldModelTrait = modelTraits[fastenerName];
    if (oldModelTrait !== void 0 && this.isMounted()) {
      oldModelTrait.unmount();
    }
    if (newModelTrait !== null) {
      modelTraits[fastenerName] = newModelTrait;
      if (this.isMounted()) {
        newModelTrait.mount();
      }
    } else {
      delete modelTraits[fastenerName];
    }
  }

  /** @hidden */
  protected mountModelTraits(): void {
    const modelTraits = this.modelTraits;
    for (const fastenerName in modelTraits) {
      const modelTrait = modelTraits[fastenerName]!;
      modelTrait.mount();
    }
  }

  /** @hidden */
  protected unmountModelTraits(): void {
    const modelTraits = this.modelTraits;
    for (const fastenerName in modelTraits) {
      const modelTrait = modelTraits[fastenerName]!;
      modelTrait.unmount();
    }
  }

  /** @hidden */
  protected insertModelTrait(trait: Trait, targetTrait: Trait | null): void {
    const fastenerName = trait.key;
    if (fastenerName !== void 0) {
      const modelTrait = this.getLazyModelTrait(fastenerName);
      if (modelTrait !== null && modelTrait.sibling === true) {
        modelTrait.doSetTrait(trait, null);
      }
    }
  }

  /** @hidden */
  protected removeModelTrait(trait: Trait): void {
    const fastenerName = trait.key;
    if (fastenerName !== void 0) {
      const modelTrait = this.getModelTrait(fastenerName);
      if (modelTrait !== null && modelTrait.sibling === true) {
        modelTrait.doSetTrait(null, null);
      }
    }
  }

  /** @hidden */
  readonly modelDownlinks!: {[downlinkName: string]: ModelDownlink<Model> | undefined} | null;

  override hasModelDownlink(downlinkName: string): boolean {
    const modelDownlinks = this.modelDownlinks;
    return modelDownlinks !== null && modelDownlinks[downlinkName] !== void 0;
  }

  override getModelDownlink(downlinkName: string): ModelDownlink<this> | null {
    const modelDownlinks = this.modelDownlinks;
    if (modelDownlinks !== null) {
      const modelDownlink = modelDownlinks[downlinkName];
      if (modelDownlink !== void 0) {
        return modelDownlink as ModelDownlink<this>;
      }
    }
    return null;
  }

  override setModelDownlink(downlinkName: string, newModelDownlink: ModelDownlink<this> | null): void {
    let modelDownlinks = this.modelDownlinks;
    if (modelDownlinks === null) {
      modelDownlinks = {};
      Object.defineProperty(this, "modelDownlinks", {
        value: modelDownlinks,
        enumerable: true,
        configurable: true,
      });
    }
    const oldModelDownlink = modelDownlinks[downlinkName];
    if (oldModelDownlink !== void 0 && this.isMounted()) {
      if (this.isConsuming() && oldModelDownlink.consume === true) {
        oldModelDownlink.removeDownlinkConsumer(this);
      }
      oldModelDownlink.unmount();
    }
    if (newModelDownlink !== null) {
      modelDownlinks[downlinkName] = newModelDownlink;
      if (this.isMounted()) {
        newModelDownlink.mount();
        if (this.isConsuming() && newModelDownlink.consume === true) {
          newModelDownlink.addDownlinkConsumer(this);
        }
      }
    } else {
      delete modelDownlinks[downlinkName];
    }
  }

  /** @hidden */
  protected mountModelDownlinks(): void {
    const modelDownlinks = this.modelDownlinks;
    for (const downlinkName in modelDownlinks) {
      const modelDownlink = modelDownlinks[downlinkName]!;
      modelDownlink.mount();
    }
    ModelDownlinkContext.initModelDownlinks(this);
  }

  /** @hidden */
  protected unmountModelDownlinks(): void {
    const modelDownlinks = this.modelDownlinks;
    for (const downlinkName in modelDownlinks) {
      const modelDownlink = modelDownlinks[downlinkName]!;
      modelDownlink.unmount();
    }
  }

  /** @hidden */
  protected reconcileModelDownlinks(): void {
    const modelDownlinks = this.modelDownlinks;
    for (const downlinkName in modelDownlinks) {
      const modelDownlink = modelDownlinks[downlinkName]!;
      modelDownlink.reconcile();
    }
  }

  /** @hidden */
  protected startConsumingModelDownlinks(): void {
    const modelDownlinks = this.modelDownlinks;
    for (const downlinkName in modelDownlinks) {
      const modelDownlink = modelDownlinks[downlinkName]!;
      if (modelDownlink.consume === true) {
        modelDownlink.addDownlinkConsumer(this);
      }
    }
  }

  /** @hidden */
  protected stopConsumingModelDownlinks(): void {
    const modelDownlinks = this.modelDownlinks;
    for (const downlinkName in modelDownlinks) {
      const modelDownlink = modelDownlinks[downlinkName]!;
      if (modelDownlink.consume === true) {
        modelDownlink.removeDownlinkConsumer(this);
      }
    }
  }
}

ModelProperty({
  type: Object,
  inherit: true,
  state: null,
  updateFlags: Model.NeedsReconcile,
})(Model.prototype, "warpRef");
