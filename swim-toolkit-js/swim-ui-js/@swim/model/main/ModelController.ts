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

import {ModelContextType, ModelContext} from "./ModelContext";
import {ModelClass, Model} from "./Model";
import type {ModelObserver} from "./ModelObserver";
import type {TraitClass, Trait} from "./Trait";

export type ModelControllerType<M extends Model> =
  M extends {readonly modelController: infer MC | null} ? MC : never;

export class ModelController<M extends Model = Model> implements ModelObserver<M> {
  constructor() {
    Object.defineProperty(this, "model", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  declare readonly model: M | null;

  setModel(model: M | null): void {
    this.willSetModel(model);
    Object.defineProperty(this, "model", {
      value: model,
      enumerable: true,
      configurable: true,
    });
    this.onSetModel(model);
    this.didSetModel(model);
  }

  protected willSetModel(model: M | null): void {
    // hook
  }

  protected onSetModel(model: M | null): void {
    // hook
  }

  protected didSetModel(model: M | null): void {
    // hook
  }

  get key(): string | undefined {
    const model = this.model;
    return model !== null ? model.key : void 0;
  }

  get parentModel(): Model | null {
    const model = this.model;
    return model !== null ? model.parentModel : null;
  }

  get parentModelController(): ModelController | null {
    const parentModel = this.parentModel;
    return parentModel !== null ? parentModel.modelController : null;
  }

  modelWillSetParentModel(newParentModel: Model | null, oldParentModel: Model | null, model: M): void {
    // hook
  }

  modelDidSetParentModel(newParentModel: Model | null, oldParentModel: Model | null, model: M): void {
    // hook
  }

  remove(): void {
    const model = this.model;
    if (model !== null) {
      model.remove();
    } else {
      throw new Error("no model");
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

  get childModelControllers(): ReadonlyArray<ModelController | null> {
    return this.childModels.map(function (model: Model): ModelController | null {
      return model.modelController;
    });
  }

  getChildModel(key: string): Model | null {
    const model = this.model;
    return model !== null ? model.getChildModel(key) : null;
  }

  getChildModelController(key: string): ModelController | null {
    const childModel = this.getChildModel(key);
    return childModel !== null ? childModel.modelController : null;
  }

  setChildModel(key: string, newChildModel: Model | null): Model | null {
    const model = this.model;
    if (model !== null) {
      return model.setChildModel(key, newChildModel);
    } else {
      throw new Error("no model");
    }
  }

  setChildModelController(key: string, newChildModelController: ModelController | null): ModelController | null {
    const newChildModel = newChildModelController !== null ? newChildModelController.model : null;
    if (newChildModel !== null) {
      const oldChildModel = this.setChildModel(key, newChildModel);
      return oldChildModel !== null ? oldChildModel.modelController : null;
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

  appendChildModelController(childModelController: ModelController, key?: string): void {
    const model = this.model;
    const childModel = childModelController.model;
    if (model !== null && childModel !== null) {
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

  prependChildModelController(childModelController: ModelController, key?: string): void {
    const model = this.model;
    const childModel = childModelController.model;
    if (model !== null && childModel !== null) {
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

  insertChildModelController(childModelController: ModelController,
                             targetModelController: ModelController | Model | null,
                             key?: string): void {
    const model = this.model;
    const childModel = childModelController.model;
    if (model !== null && childModel !== null) {
      let targetModel: Model | null;
      if (targetModelController !== null && !(targetModelController instanceof Model)) {
        targetModel = targetModelController.model;
      } else {
        targetModel = targetModelController;
      }
      model.insertChildModel(childModel, targetModel, key);
    } else {
      throw new Error("no model");
    }
  }

  modelWillInsertChildModel(childModel: Model, targetModel: Model | null, model: M): void {
    // hook
  }

  modelDidInsertChildModel(childModel: Model, targetModel: Model | null, model: M): void {
    // hook
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

  removeChildModelController(key: string): ModelController | null;
  removeChildModelController(childModelController: ModelController): void;
  removeChildModelController(childModelController: string | ModelController): ModelController | null | void {
    const model = this.model;
    if (model !== null) {
      if (typeof childModelController === "string") {
        const childModel = model.removeChildModel(childModelController);
        return childModel !== null ? childModel.modelController : null;
      } else {
        const childModel = childModelController.model;
        if (childModel !== null) {
          model.removeChildModel(childModel);
        } else {
          throw new Error("no model");
        }
      }
    } else {
      throw new Error("no model");
    }
  }

  removeAll(): void {
    const model = this.model;
    if (model !== null) {
      model.removeAll();
    } else {
      throw new Error("no model");
    }
  }

  modelWillRemoveChildModel(childModel: Model, model: M): void {
    // hook
  }

  modelDidRemoveChildModel(childModel: Model, model: M): void {
    // hook
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

  modelWillInsertTrait(trait: Trait, targetTrait: Trait | null, model: M): void {
    // hook
  }

  modelDidInsertTrait(trait: Trait, targetTrait: Trait | null, model: M): void {
    // hook
  }

  removeTrait(key: string): Trait | null;
  removeTrait(trait: Trait): void;
  removeTrait(key: string | Trait): Trait | null | void {
    const model = this.model;
    if (model !== null) {
      if (typeof key === "string") {
        return model.removeTrait(key);
      } else {
        model.removeTrait(key);
      }
    } else {
      throw new Error("no model");
    }
  }

  modelWillRemoveTrait(trait: Trait, model: M): void {
    // hook
  }

  modelDidRemoveTrait(trait: Trait, model: M): void {
    // hook
  }

  getSuperTrait<R extends Trait>(traitClass: TraitClass<R>): R | null {
    const model = this.model;
    return model !== null ? model.getSuperTrait(traitClass) : null;
  }

  getBaseTrait<R extends Trait>(traitClass: TraitClass<R>): R | null {
    const model = this.model;
    return model !== null ? model.getBaseTrait(traitClass) : null;
  }

  isMounted(): boolean {
    const model = this.model;
    return model !== null && model.isMounted();
  }

  modelWillMount(model: M): void {
    // hook
  }

  modelDidMount(model: M): void {
    // hook
  }

  modelWillUnmount(model: M): void {
    // hook
  }

  modelDidUnmount(model: M): void {
    // hook
  }

  isPowered(): boolean {
    const model = this.model;
    return model !== null && model.isPowered();
  }

  modelWillPower(model: M): void {
    // hook
  }

  modelDidPower(model: M): void {
    // hook
  }

  modelWillUnpower(model: M): void {
    // hook
  }

  modelDidUnpower(model: M): void {
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

  modelWillMutate(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  modelDidMutate(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  modelWillAggregate(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  modelDidAggregate(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  modelWillCorrelate(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  modelDidCorrelate(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  isRefreshing(): boolean {
    const model = this.model;
    return model !== null && model.isRefreshing();
  }

  modelWillValidate(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  modelDidValidate(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  modelWillReconcile(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  modelDidReconcile(modelContext: ModelContextType<M>, model: M): void {
    // hook
  }

  modelWillStartConsuming(model: M): void {
    // hook
  }

  modelDidStartConsuming(model: M): void {
    // hook
  }

  modelWillStopConsuming(model: M): void {
    // hook
  }

  modelDidStopConsuming(model: M): void {
    // hook
  }

  get modelContext(): ModelContext {
    const model = this.model;
    return model !== null ? model.modelContext : ModelContext.default();
  }
}
