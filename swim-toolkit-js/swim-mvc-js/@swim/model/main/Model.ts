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

import {WarpRef} from "@swim/client";
import {ModelContextType, ModelContext} from "./ModelContext";
import {ModelObserverType, ModelObserver} from "./ModelObserver";
import {ModelControllerType, ModelController} from "./ModelController";
import {ModelConsumerType, ModelConsumer} from "./ModelConsumer";
import {SubmodelConstructor, Submodel} from "./Submodel";
import {ModelManager} from "./manager/ModelManager";
import {ModelServiceConstructor, ModelService} from "./service/ModelService";
import {RefreshService} from "./service/RefreshService";
import {WarpService} from "./service/WarpService";
import {ModelScopeConstructor, ModelScope} from "./scope/ModelScope";
import {ModelTraitConstructor, ModelTrait} from "./trait/ModelTrait";
import {ModelDownlinkConstructor, ModelDownlink} from "./downlink/ModelDownlink";
import {GenericModel} from "./generic/GenericModel";
import {CompoundModel} from "./generic/CompoundModel";

export type ModelFlags = number;

export interface ModelInit {
  key?: string;
  modelController?: ModelController;
}

export interface ModelClass {
  readonly mountFlags: ModelFlags;

  readonly powerFlags: ModelFlags;

  readonly insertChildFlags: ModelFlags;

  readonly removeChildFlags: ModelFlags;

  readonly startConsumingFlags: ModelFlags;

  readonly stopConsumingFlags: ModelFlags;

  /** @hidden */
  _submodelConstructors?: {[submodelName: string]: SubmodelConstructor<any, any> | undefined};

  /** @hidden */
  _modelServiceConstructors?: {[serviceName: string]: ModelServiceConstructor<any, unknown> | undefined};

  /** @hidden */
  _modelScopeConstructors?: {[scopeName: string]: ModelScopeConstructor<any, unknown> | undefined};
}

export abstract class Model {
  abstract get modelController(): ModelController | null;

  abstract setModelController(modelController: ModelControllerType<this> | null): void;

  protected willSetModelController(modelController: ModelControllerType<this> | null): void {
    // hook
  }

  protected onSetModelController(modelController: ModelControllerType<this> | null): void {
    // hook
  }

  protected didSetModelController(modelController: ModelControllerType<this> | null): void {
    // hook
  }

  abstract get modelObservers(): ReadonlyArray<ModelObserver>;

  abstract addModelObserver(modelObserver: ModelObserverType<this>): void;

  protected willAddModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  protected onAddModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  protected didAddModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  abstract removeModelObserver(modelObserver: ModelObserverType<this>): void;

  protected willRemoveModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  protected onRemoveModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  protected didRemoveModelObserver(modelObserver: ModelObserverType<this>): void {
    // hook
  }

  protected willObserve<T>(callback: (this: this, modelObserver: ModelObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const modelController = this.modelController;
    if (modelController !== null) {
      result = callback.call(this, modelController);
      if (result !== void 0) {
        return result;
      }
    }
    const modelObservers = this.modelObservers;
    let i = 0;
    while (i < modelObservers.length) {
      const modelObserver = modelObservers[i];
      result = callback.call(this, modelObserver);
      if (result !== void 0) {
        return result;
      }
      if (modelObserver === modelObservers[i]) {
        i += 1;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, modelObserver: ModelObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const modelObservers = this.modelObservers;
    let i = 0;
    while (i < modelObservers.length) {
      const modelObserver = modelObservers[i];
      result = callback.call(this, modelObserver);
      if (result !== void 0) {
        return result;
      }
      if (modelObserver === modelObservers[i]) {
        i += 1;
      }
    }
    const modelController = this.modelController;
    if (modelController !== null) {
      result = callback.call(this, modelController);
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  initModel(init: ModelInit): void {
    if (init.modelController !== void 0) {
      this.setModelController(init.modelController as ModelControllerType<this>);
    }
  }

  abstract get key(): string | undefined;

  /** @hidden */
  abstract setKey(key: string | undefined): void;

  abstract get parentModel(): Model | null;

  /** @hidden */
  abstract setParentModel(newParentModel: Model | null, oldParentModel: Model | null): void;

  protected willSetParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillSetParentModel !== void 0) {
        modelObserver.modelWillSetParentModel(newParentModel, oldParentModel, this);
      }
    });
  }

  protected onSetParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    if (newParentModel !== null) {
      if (newParentModel.isMounted()) {
        this.cascadeMount();
        if (newParentModel.isPowered()) {
          this.cascadePower();
        }
      }
    } else if (this.isMounted()) {
      try {
        if (this.isPowered()) {
          this.cascadeUnpower();
        }
      } finally {
        this.cascadeUnmount();
      }
    }
  }

  protected didSetParentModel(newParentModel: Model | null, oldParentModel: Model | null): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidSetParentModel !== void 0) {
        modelObserver.modelDidSetParentModel(newParentModel, oldParentModel, this);
      }
    });
  }

  abstract get childModelCount(): number;

  abstract get childModels(): ReadonlyArray<Model>;

  abstract firstChildModel(): Model | null;

  abstract lastChildModel(): Model | null;

  abstract nextChildModel(targetModel: Model): Model | null;

  abstract previousChildModel(targetModel: Model): Model | null;

  abstract forEachChildModel<T, S = unknown>(callback: (this: S, childModel: Model) => T | void,
                                             thisArg?: S): T | undefined;

  abstract getChildModel(key: string): Model | null;

  abstract setChildModel(key: string, newChildModel: Model | null): Model | null;

  abstract appendChildModel(childModel: Model, key?: string): void;

  abstract prependChildModel(childModel: Model, key?: string): void;

  abstract insertChildModel(childModel: Model, targetModel: Model | null, key?: string): void;

  get insertChildFlags(): ModelFlags {
    return this.modelClass.insertChildFlags;
  }

  protected willInsertChildModel(childModel: Model, targetModel: Model | null | undefined): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillInsertChildModel !== void 0) {
        modelObserver.modelWillInsertChildModel(childModel, targetModel, this);
      }
    });
  }

  protected onInsertChildModel(childModel: Model, targetModel: Model | null | undefined): void {
    this.requireUpdate(this.insertChildFlags);
  }

  protected didInsertChildModel(childModel: Model, targetModel: Model | null | undefined): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidInsertChildModel !== void 0) {
        modelObserver.modelDidInsertChildModel(childModel, targetModel, this);
      }
    });
  }

  abstract cascadeInsert(updateFlags?: ModelFlags, modelContext?: ModelContext): void;

  abstract removeChildModel(key: string): Model | null;
  abstract removeChildModel(childModel: Model): void;

  abstract removeAll(): void;

  abstract remove(): void;

  get removeChildFlags(): ModelFlags {
    return this.modelClass.removeChildFlags;
  }

  protected willRemoveChildModel(childModel: Model): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillRemoveChildModel !== void 0) {
        modelObserver.modelWillRemoveChildModel(childModel, this);
      }
    });
  }

  protected onRemoveChildModel(childModel: Model): void {
    this.requireUpdate(this.removeChildFlags);
  }

  protected didRemoveChildModel(childModel: Model): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidRemoveChildModel !== void 0) {
        modelObserver.modelDidRemoveChildModel(childModel, this);
      }
    });
  }

  getSuperModel<M extends Model>(modelClass: {new(...args: any[]): M}): M | null {
    const parentModel = this.parentModel;
    if (parentModel === null) {
      return null;
    } else if (parentModel instanceof modelClass) {
      return parentModel;
    } else {
      return parentModel.getSuperModel(modelClass);
    }
  }

  getBaseModel<M extends Model>(modelClass: {new(...args: any[]): M}): M | null {
    const parentModel = this.parentModel;
    if (parentModel === null) {
      return null;
    } else if (parentModel instanceof modelClass) {
      const baseModel = parentModel.getBaseModel(modelClass);
      return baseModel !== null ? baseModel : parentModel;
    } else {
      return parentModel.getBaseModel(modelClass);
    }
  }

  readonly refreshService: RefreshService<this>; // defined by RefreshService

  readonly warpService: WarpService<this>; // defined by WarpService

  readonly warpRef: ModelScope<this, WarpRef | undefined>; // defined by GenericModel

  get modelClass(): ModelClass {
    return this.constructor as unknown as ModelClass;
  }

  /** @hidden */
  abstract get modelFlags(): ModelFlags;

  /** @hidden */
  abstract setModelFlags(modelFlags: ModelFlags): void;

  isMounted(): boolean {
    return (this.modelFlags & Model.MountedFlag) !== 0;
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

  get mountFlags(): ModelFlags {
    return this.modelClass.mountFlags;
  }

  protected willMount(): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillMount !== void 0) {
        modelObserver.modelWillMount(this);
      }
    });
  }

  protected onMount(): void {
    this.requestUpdate(this, this.modelFlags & ~Model.StatusMask, false);
    this.requireUpdate(this.mountFlags);
  }

  protected didMount(): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidMount !== void 0) {
        modelObserver.modelDidMount(this);
      }
    });
  }

  abstract cascadeUnmount(): void;

  protected willUnmount(): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillUnmount !== void 0) {
        modelObserver.modelWillUnmount(this);
      }
    });
  }

  protected onUnmount(): void {
    // hook
  }

  protected didUnmount(): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidUnmount !== void 0) {
        modelObserver.modelDidUnmount(this);
      }
    });
  }

  isPowered(): boolean {
    return (this.modelFlags & Model.PoweredFlag) !== 0;
  }

  abstract cascadePower(): void;

  get powerFlags(): ModelFlags {
    return this.modelClass.powerFlags;
  }

  protected willPower(): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillPower !== void 0) {
        modelObserver.modelWillPower(this);
      }
    });
  }

  protected onPower(): void {
    this.requireUpdate(this.powerFlags);
  }

  protected didPower(): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidPower !== void 0) {
        modelObserver.modelDidPower(this);
      }
    });
  }

  abstract cascadeUnpower(): void;

  protected willUnpower(): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillUnpower !== void 0) {
        modelObserver.modelWillUnpower(this);
      }
    });
  }

  protected onUnpower(): void {
    // hook
  }

  protected didUnpower(): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidUnpower !== void 0) {
        modelObserver.modelDidUnpower(this);
      }
    });
  }

  requireUpdate(updateFlags: ModelFlags, immediate: boolean = false): void {
    updateFlags &= ~Model.StatusMask;
    if (updateFlags !== 0) {
      this.willRequireUpdate(updateFlags, immediate);
      const oldUpdateFlags = this.modelFlags;
      const newUpdateFlags = oldUpdateFlags | updateFlags;
      const deltaUpdateFlags = newUpdateFlags & ~oldUpdateFlags;
      if (deltaUpdateFlags !== 0) {
        this.setModelFlags(newUpdateFlags);
        this.requestUpdate(this, deltaUpdateFlags, immediate);
      }
      this.didRequireUpdate(updateFlags, immediate);
    }
  }

  protected willRequireUpdate(updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected didRequireUpdate(updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  requestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    updateFlags = this.willRequestUpdate(targetModel, updateFlags, immediate);
    const parentModel = this.parentModel;
    if (parentModel !== null) {
      parentModel.requestUpdate(targetModel, updateFlags, immediate);
    } else if (this.isMounted()) {
      const refreshManager = this.refreshService.manager;
      if (refreshManager !== void 0) {
        refreshManager.requestUpdate(targetModel, updateFlags, immediate);
      }
    }
    this.didRequestUpdate(targetModel, updateFlags, immediate);
  }

  protected willRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): ModelFlags {
    let additionalFlags = this.modifyUpdate(targetModel, updateFlags);
    additionalFlags &= ~Model.StatusMask;
    if (additionalFlags !== 0) {
      updateFlags |= additionalFlags;
      this.setModelFlags(this.modelFlags | additionalFlags);
    }
    return updateFlags;
  }

  protected didRequestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    // hook
  }

  protected modifyUpdate(targetModel: Model, updateFlags: ModelFlags): ModelFlags {
    let additionalFlags = 0;
    if ((updateFlags & Model.AnalyzeMask) !== 0) {
      additionalFlags |= Model.NeedsAnalyze;
    }
    if ((updateFlags & Model.RefreshMask) !== 0) {
      additionalFlags |= Model.NeedsRefresh;
    }
    return additionalFlags;
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
    return analyzeFlags;
  }

  abstract cascadeAnalyze(analyzeFlags: ModelFlags, modelContext: ModelContext): void;

  protected willAnalyze(modelContext: ModelContextType<this>): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillAnalyze !== void 0) {
        modelObserver.modelWillAnalyze(modelContext, this);
      }
    });
  }

  protected onAnalyze(modelContext: ModelContextType<this>): void {
    // hook
  }

  protected didAnalyze(modelContext: ModelContextType<this>): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidAnalyze !== void 0) {
        modelObserver.modelDidAnalyze(modelContext, this);
      }
    });
  }

  protected willMutate(modelContext: ModelContextType<this>): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillMutate !== void 0) {
        modelObserver.modelWillMutate(modelContext, this);
      }
    });
  }

  protected onMutate(modelContext: ModelContextType<this>): void {
    // hook
  }

  protected didMutate(modelContext: ModelContextType<this>): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidMutate !== void 0) {
        modelObserver.modelDidMutate(modelContext, this);
      }
    });
  }

  protected willAggregate(modelContext: ModelContextType<this>): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillAggregate !== void 0) {
        modelObserver.modelWillAggregate(modelContext, this);
      }
    });
  }

  protected onAggregate(modelContext: ModelContextType<this>): void {
    // hook
  }

  protected didAggregate(modelContext: ModelContextType<this>): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidAggregate !== void 0) {
        modelObserver.modelDidAggregate(modelContext, this);
      }
    });
  }

  protected willCorrelate(modelContext: ModelContextType<this>): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillCorrelate !== void 0) {
        modelObserver.modelWillCorrelate(modelContext, this);
      }
    });
  }

  protected onCorrelate(modelContext: ModelContextType<this>): void {
    // hook
  }

  protected didCorrelate(modelContext: ModelContextType<this>): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidCorrelate !== void 0) {
        modelObserver.modelDidCorrelate(modelContext, this);
      }
    });
  }

  protected willAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillAnalyzeChildModels !== void 0) {
        modelObserver.modelWillAnalyzeChildModels(analyzeFlags, modelContext, this);
      }
    });
  }

  protected onAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.analyzeChildModels(analyzeFlags, modelContext);
  }

  protected didAnalyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidAnalyzeChildModels !== void 0) {
        modelObserver.modelDidAnalyzeChildModels(analyzeFlags, modelContext, this);
      }
    });
  }

  protected analyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                               callback?: (this: this, childModel: Model) => void): void {
    this.forEachChildModel(function (childModel: Model): void {
      this.analyzeChildModel(childModel, analyzeFlags, modelContext);
      if (callback !== void 0) {
        callback.call(this, childModel);
      }
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
      }
    }, this);
  }

  /** @hidden */
  protected analyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.willAnalyzeChildModel(childModel, analyzeFlags, modelContext);
    this.onAnalyzeChildModel(childModel, analyzeFlags, modelContext);
    this.didAnalyzeChildModel(childModel, analyzeFlags, modelContext);
  }

  protected willAnalyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    // hook
  }

  protected onAnalyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    childModel.cascadeAnalyze(analyzeFlags, modelContext);
  }

  protected didAnalyzeChildModel(childModel: Model, analyzeFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    // hook
  }

  isRefreshing(): boolean {
    return (this.modelFlags & Model.RefreshingFlag) !== 0;
  }

  needsRefresh(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): ModelFlags {
    return refreshFlags;
  }

  abstract cascadeRefresh(refreshFlags: ModelFlags, modelContext: ModelContext): void;

  protected willRefresh(modelContext: ModelContextType<this>): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillRefresh !== void 0) {
        modelObserver.modelWillRefresh(modelContext, this);
      }
    });
  }

  protected onRefresh(modelContext: ModelContextType<this>): void {
    // hook
  }

  protected didRefresh(modelContext: ModelContextType<this>): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidRefresh !== void 0) {
        modelObserver.modelDidRefresh(modelContext, this);
      }
    });
  }

  protected willValidate(modelContext: ModelContextType<this>): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillValidate !== void 0) {
        modelObserver.modelWillValidate(modelContext, this);
      }
    });
  }

  protected onValidate(modelContext: ModelContextType<this>): void {
    // hook
  }

  protected didValidate(modelContext: ModelContextType<this>): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidValidate !== void 0) {
        modelObserver.modelDidValidate(modelContext, this);
      }
    });
  }

  protected willReconcile(modelContext: ModelContextType<this>): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillReconcile !== void 0) {
        modelObserver.modelWillReconcile(modelContext, this);
      }
    });
  }

  protected onReconcile(modelContext: ModelContextType<this>): void {
    // hook
  }

  protected didReconcile(modelContext: ModelContextType<this>): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidReconcile !== void 0) {
        modelObserver.modelDidReconcile(modelContext, this);
      }
    });
  }

  protected willRefreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillRefreshChildModels !== void 0) {
        modelObserver.modelWillRefreshChildModels(refreshFlags, modelContext, this);
      }
    });
  }

  protected onRefreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.refreshChildModels(refreshFlags, modelContext);
  }

  protected didRefreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidRefreshChildModels !== void 0) {
        modelObserver.modelDidRefreshChildModels(refreshFlags, modelContext, this);
      }
    });
  }

  protected refreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                               callback?: (this: this, childModel: Model) => void): void {
    this.forEachChildModel(function (childModel: Model): void {
      this.refreshChildModel(childModel, refreshFlags, modelContext);
      if (callback !== void 0) {
        callback.call(this, childModel);
      }
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
      }
    }, this);
  }

  /** @hidden */
  protected refreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    this.willRefreshChildModel(childModel, refreshFlags, modelContext);
    this.onRefreshChildModel(childModel, refreshFlags, modelContext);
    this.didRefreshChildModel(childModel, refreshFlags, modelContext);
  }

  protected willRefreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    // hook
  }

  protected onRefreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    childModel.cascadeRefresh(refreshFlags, modelContext);
  }

  protected didRefreshChildModel(childModel: Model, refreshFlags: ModelFlags, modelContext: ModelContextType<this>): void {
    // hook
  }

  isConsuming(): boolean {
    return (this.modelFlags & Model.ConsumingFlag) !== 0;
  }

  get startConsumingFlags(): ModelFlags {
    return this.modelClass.startConsumingFlags;
  }

  protected willStartConsuming(): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillStartConsuming !== void 0) {
        modelObserver.modelWillStartConsuming(this);
      }
    });
  }

  protected onStartConsuming(): void {
    this.requireUpdate(this.startConsumingFlags);
  }

  protected didStartConsuming(): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidStartConsuming !== void 0) {
        modelObserver.modelDidStartConsuming(this);
      }
    });
  }

  get stopConsumingFlags(): ModelFlags {
    return this.modelClass.stopConsumingFlags;
  }

  protected willStopConsuming(): void {
    this.willObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelWillStopConsuming !== void 0) {
        modelObserver.modelWillStopConsuming(this);
      }
    });
  }

  protected onStopConsuming(): void {
    this.requireUpdate(this.stopConsumingFlags);
  }

  protected didStopConsuming(): void {
    this.didObserve(function (modelObserver: ModelObserver): void {
      if (modelObserver.modelDidStopConsuming !== void 0) {
        modelObserver.modelDidStopConsuming(this);
      }
    });
  }

  abstract get modelConsumers(): ReadonlyArray<ModelConsumer>;

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

  abstract hasSubmodel(submodelName: string): boolean;

  abstract getSubmodel(submodelName: string): Submodel<this, Model> | null;

  abstract setSubmodel(submodelName: string, submodel: Submodel<this, Model, unknown> | null): void;

  /** @hidden */
  getLazySubmodel(submodelName: string): Submodel<this, Model> | null {
    let submodel = this.getSubmodel(submodelName);
    if (submodel === null) {
      const modelClass = (this as any).__proto__ as ModelClass;
      const constructor = Model.getSubmodelConstructor(submodelName, modelClass);
      if (constructor !== null) {
        submodel = new constructor(this, submodelName);
        this.setSubmodel(submodelName, submodel);
      }
    }
    return submodel;
  }

  abstract hasModelService(serviceName: string): boolean;

  abstract getModelService(serviceName: string): ModelService<this, unknown> | null;

  abstract setModelService(serviceName: string, modelService: ModelService<this, unknown> | null): void;

  /** @hidden */
  getLazyModelService(serviceName: string): ModelService<this, unknown> | null {
    let modelService = this.getModelService(serviceName);
    if (modelService === null) {
      const modelClass = (this as any).__proto__ as ModelClass;
      const constructor = Model.getModelServiceConstructor(serviceName, modelClass);
      if (constructor !== null) {
        modelService = new constructor(this, serviceName);
        this.setModelService(serviceName, modelService);
      }
    }
    return modelService;
  }

  abstract hasModelScope(scopeName: string): boolean;

  abstract getModelScope(scopeName: string): ModelScope<this, unknown> | null;

  abstract setModelScope(scopeName: string, modelScope: ModelScope<this, unknown> | null): void;

  /** @hidden */
  getLazyModelScope(scopeName: string): ModelScope<this, unknown> | null {
    let modelScope = this.getModelScope(scopeName);
    if (modelScope === null) {
      const modelClass = (this as any).__proto__ as ModelClass;
      const constructor = Model.getModelScopeConstructor(scopeName, modelClass);
      if (constructor !== null) {
        modelScope = new constructor(this, scopeName);
        this.setModelScope(scopeName, modelScope);
      }
    }
    return modelScope;
  }

  abstract hasModelTrait(traitName: string): boolean;

  abstract getModelTrait(traitName: string): ModelTrait<this> | null;

  abstract setModelTrait(traitName: string, modelTrait: ModelTrait<this> | null): void;

  abstract hasModelDownlink(downlinkName: string): boolean;

  abstract getModelDownlink(downlinkName: string): ModelDownlink<this> | null;

  abstract setModelDownlink(downlinkName: string, modelDownlink: ModelDownlink<this> | null): void;

  /** @hidden */
  extendModelContext(modelContext: ModelContext): ModelContextType<this> {
    return modelContext as ModelContextType<this>;
  }

  get superModelContext(): ModelContext {
    let superModelContext: ModelContext;
    const parentModel = this.parentModel;
    if (parentModel !== null) {
      superModelContext = parentModel.modelContext;
    } else if (this.isMounted()) {
      const refreshManager = this.refreshService.manager;
      if (refreshManager !== void 0) {
        superModelContext = refreshManager.modelContext;
      } else {
        superModelContext = ModelContext.default();
      }
    } else {
      superModelContext = ModelContext.default();
    }
    return superModelContext;
  }

  get modelContext(): ModelContext {
    return this.extendModelContext(this.superModelContext);
  }

  /** @hidden */
  static getSubmodelConstructor(submodelName: string, modelClass: ModelClass | null = null): SubmodelConstructor<any, any> | null {
    if (modelClass === null) {
      modelClass = this.prototype as unknown as ModelClass;
    }
    do {
      if (modelClass.hasOwnProperty("_submodelConstructors")) {
        const constructor = modelClass._submodelConstructors![submodelName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      modelClass = (modelClass as any).__proto__ as ModelClass | null;
    } while (modelClass !== null);
    return null;
  }

  /** @hidden */
  static decorateSubmodel<M extends Model, S extends Model, U>(constructor: SubmodelConstructor<M, S, U>,
                                                               modelClass: ModelClass, submodelName: string): void {
    if (!modelClass.hasOwnProperty("_submodelConstructors")) {
      modelClass._submodelConstructors = {};
    }
    modelClass._submodelConstructors![submodelName] = constructor;
    Object.defineProperty(modelClass, submodelName, {
      get: function (this: M): Submodel<M, S, U> {
        let submodel = this.getSubmodel(submodelName) as Submodel<M, S, U> | null;
        if (submodel === null) {
          submodel = new constructor(this, submodelName);
          this.setSubmodel(submodelName, submodel);
        }
        return submodel;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getModelServiceConstructor(serviceName: string, modelClass: ModelClass | null = null): ModelServiceConstructor<any, unknown> | null {
    if (modelClass === null) {
      modelClass = this.prototype as unknown as ModelClass;
    }
    do {
      if (modelClass.hasOwnProperty("_modelServiceConstructors")) {
        const descriptor = modelClass._modelServiceConstructors![serviceName];
        if (descriptor !== void 0) {
          return descriptor;
        }
      }
      modelClass = (modelClass as any).__proto__ as ModelClass | null;
    } while (modelClass !== null);
    return null;
  }

  /** @hidden */
  static decorateModelService<M extends Model, T>(constructor: ModelServiceConstructor<M, T>,
                                                  modelClass: ModelClass, serviceName: string): void {
    if (!modelClass.hasOwnProperty("_modelServiceConstructors")) {
      modelClass._modelServiceConstructors = {};
    }
    modelClass._modelServiceConstructors![serviceName] = constructor;
    Object.defineProperty(modelClass, serviceName, {
      get: function (this: M): ModelService<M, T> {
        let modelService = this.getModelService(serviceName) as ModelService<M, T> | null;
        if (modelService === null) {
          modelService = new constructor(this, serviceName);
          this.setModelService(serviceName, modelService);
        }
        return modelService;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static getModelScopeConstructor(scopeName: string, modelClass: ModelClass | null = null): ModelScopeConstructor<any, unknown> | null {
    if (modelClass === null) {
      modelClass = this.prototype as unknown as ModelClass;
    }
    do {
      if (modelClass.hasOwnProperty("_modelScopeConstructors")) {
        const constructor = modelClass._modelScopeConstructors![scopeName];
        if (constructor !== void 0) {
          return constructor;
        }
      }
      modelClass = (modelClass as any).__proto__ as ModelClass | null;
    } while (modelClass !== null);
    return null;
  }

  /** @hidden */
  static decorateModelScope<M extends Model, T, U>(constructor: ModelScopeConstructor<M, T, U>,
                                                   modelClass: ModelClass, scopeName: string): void {
    if (!modelClass.hasOwnProperty("_modelScopeConstructors")) {
      modelClass._modelScopeConstructors = {};
    }
    modelClass._modelScopeConstructors![scopeName] = constructor;
    Object.defineProperty(modelClass, scopeName, {
      get: function (this: M): ModelScope<M, T, U> {
        let modelScope = this.getModelScope(scopeName) as ModelScope<M, T, U> | null;
        if (modelScope === null) {
          modelScope = new constructor(this, scopeName);
          this.setModelScope(scopeName, modelScope);
        }
        return modelScope;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static decorateModelTrait<M extends Model>(constructor: ModelTraitConstructor<M>,
                                             modelClass: ModelClass, traitName: string): void {
    Object.defineProperty(modelClass, traitName, {
      get: function (this: M): ModelTrait<M> {
        let modelTrait = this.getModelTrait(traitName);
        if (modelTrait === null) {
          modelTrait = new constructor(this, traitName);
          this.setModelTrait(traitName, modelTrait);
        }
        return modelTrait;
      },
      configurable: true,
      enumerable: true,
    });
  }

  /** @hidden */
  static decorateModelDownlink<M extends Model>(constructor: ModelDownlinkConstructor<M>,
                                                modelClass: ModelClass, downlinkName: string): void {
    Object.defineProperty(modelClass, downlinkName, {
      get: function (this: M): ModelDownlink<M> {
        let modelDownlink = this.getModelDownlink(downlinkName);
        if (modelDownlink === null) {
          modelDownlink = new constructor(this, downlinkName);
          this.setModelDownlink(downlinkName, modelDownlink);
        }
        return modelDownlink;
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
  static readonly startConsumingFlags: ModelFlags = 0;
  static readonly stopConsumingFlags: ModelFlags = 0;

  // Forward type declarations
  /** @hidden */
  static Submodel: typeof Submodel; // defined by Submodel
  /** @hidden */
  static Manager: typeof ModelManager; // defined by ModelManager
  /** @hidden */
  static Service: typeof ModelService; // defined by ModelService
  /** @hidden */
  static Scope: typeof ModelScope; // defined by ModelScope
  /** @hidden */
  static Trait: typeof ModelTrait; // defined by ModelTrait
  /** @hidden */
  static Downlink: typeof ModelDownlink; // defined by ModelDownlink
  /** @hidden */
  static Generic: typeof GenericModel; // defined by GenericModel
  /** @hidden */
  static Compound: typeof CompoundModel; // defined by CompoundModel
}
