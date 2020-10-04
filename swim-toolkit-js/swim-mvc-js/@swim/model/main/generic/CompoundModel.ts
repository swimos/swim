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

import {ModelContextType} from "../ModelContext";
import {ModelFlags, Model} from "../Model";
import {GenericModel} from "./GenericModel";

export class CompoundModel extends GenericModel {
  /** @hidden */
  readonly _childModels: Model[];
  /** @hidden */
  _childModelMap?: {[key: string]: Model | undefined};

  constructor() {
    super();
    this._childModels = [];
  }

  get childModelCount(): number {
    return this._childModels.length;
  }

  get childModels(): ReadonlyArray<Model> {
    return this._childModels;
  }

  firstChildModel(): Model | null {
    const childModels = this._childModels;
    return childModels.length !== 0 ? childModels[0] : null;
  }

  lastChildModel(): Model | null {
    const childModels = this._childModels;
    return childModels.length !== 0 ? childModels[childModels.length - 1] : null;
  }

  nextChildModel(targetModel: Model): Model | null {
    const childModels = this._childModels;
    const targetIndex = childModels.indexOf(targetModel);
    return targetIndex >= 0 && targetIndex + 1 < childModels.length ? childModels[targetIndex + 1] : null;
  }

  previousChildModel(targetModel: Model): Model | null {
    const childModels = this._childModels;
    const targetIndex = childModels.indexOf(targetModel);
    return targetIndex - 1 >= 0 ? childModels[targetIndex - 1] : null;
  }

  forEachChildModel<T, S = unknown>(callback: (this: S, childModel: Model) => T | void,
                                    thisArg?: S): T | undefined {
    let result: T | undefined;
    const childModels = this._childModels;
    if (childModels.length !== 0) {
      let i = 0;
      do {
        const childModel = childModels[i];
        result = callback.call(thisArg, childModel);
        if (result !== void 0) {
          return result;
        }
        if (i < childModels.length) {
          if (childModels[i] === childModel) {
            i += 1;
          }
          continue;
        }
        break;
      } while (true);
    }
    return result;
  }

  getChildModel(key: string): Model | null {
    const childModelMap = this._childModelMap;
    if (childModelMap !== void 0) {
      const childModel = childModelMap[key];
      if (childModel !== void 0) {
        return childModel;
      }
    }
    return null;
  }

  setChildModel(key: string, newChildModel: Model | null): Model | null {
    if (newChildModel !== null) {
      newChildModel.remove();
    }
    let index = -1;
    let oldChildModel: Model | null = null;
    let targetModel: Model | null = null;
    const childModels = this._childModels;
    const childModelMap = this._childModelMap;
    if (childModelMap !== void 0) {
      const childModel = childModelMap[key];
      if (childModel !== void 0) {
        index = childModels.indexOf(childModel);
        // assert(index >= 0);
        oldChildModel = childModel;
        targetModel = childModels[index + 1] || null;
        this.willRemoveChildModel(childModel);
        childModel.setParentModel(null, this);
        this.removeChildModelMap(childModel);
        childModels.splice(index, 1);
        this.onRemoveChildModel(childModel);
        this.didRemoveChildModel(childModel);
        childModel.setKey(void 0);
      }
    }
    if (newChildModel !== null) {
      newChildModel.setKey(key);
      this.willInsertChildModel(newChildModel, targetModel);
      if (index >= 0) {
        childModels.splice(index, 0, newChildModel);
      } else {
        childModels.push(newChildModel);
      }
      this.insertChildModelMap(newChildModel);
      newChildModel.setParentModel(this, null);
      this.onInsertChildModel(newChildModel, targetModel);
      this.didInsertChildModel(newChildModel, targetModel);
      newChildModel.cascadeInsert();
    }
    return oldChildModel;
  }

  /** @hidden */
  protected insertChildModelMap(childModel: Model): void {
    const key = childModel.key;
    if (key !== void 0) {
      let childModelMap = this._childModelMap;
      if (childModelMap === void 0) {
        childModelMap = {};
        this._childModelMap = childModelMap;
      }
      childModelMap[key] = childModel;
    }
  }

  /** @hidden */
  protected removeChildModelMap(childModel: Model): void {
    const childModelMap = this._childModelMap;
    if (childModelMap !== void 0) {
      const key = childModel.key;
      if (key !== void 0) {
        delete childModelMap[key];
      }
    }
  }

  appendChildModel(childModel: Model, key?: string): void {
    childModel.remove();
    if (key !== void 0) {
      this.removeChildModel(key);
      childModel.setKey(key);
    }
    this.willInsertChildModel(childModel, null);
    this._childModels.push(childModel);
    this.insertChildModelMap(childModel);
    childModel.setParentModel(this, null);
    this.onInsertChildModel(childModel, null);
    this.didInsertChildModel(childModel, null);
    childModel.cascadeInsert();
  }

  prependChildModel(childModel: Model, key?: string): void {
    childModel.remove();
    if (key !== void 0) {
      this.removeChildModel(key);
      childModel.setKey(key);
    }
    const childModels = this._childModels;
    const targetModel = childModels.length !== 0 ? childModels[0] : null;
    this.willInsertChildModel(childModel, targetModel);
    childModels.unshift(childModel);
    this.insertChildModelMap(childModel);
    childModel.setParentModel(this, targetModel);
    this.onInsertChildModel(childModel, targetModel);
    this.didInsertChildModel(childModel, targetModel);
    childModel.cascadeInsert();
  }

  insertChildModel(childModel: Model, targetModel: Model | null, key?: string): void {
    if (targetModel !== null && targetModel.parentModel !== this) {
      throw new TypeError("" + targetModel);
    }
    childModel.remove();
    if (key !== void 0) {
      this.removeChildModel(key);
      childModel.setKey(key);
    }
    this.willInsertChildModel(childModel, targetModel);
    const childModels = this._childModels;
    const index = targetModel !== null ? childModels.indexOf(targetModel) : -1;
    if (index >= 0) {
      childModels.splice(index, 0, childModel);
    } else {
      childModels.push(childModel);
    }
    this.insertChildModelMap(childModel);
    childModel.setParentModel(this, null);
    this.onInsertChildModel(childModel, targetModel);
    this.didInsertChildModel(childModel, targetModel);
    childModel.cascadeInsert();
  }

  removeChildModel(key: string): Model | null;
  removeChildModel(childModel: Model): void;
  removeChildModel(key: string | Model): Model | null | void {
    let childModel: Model | null;
    if (typeof key === "string") {
      childModel = this.getChildModel(key);
      if (childModel === null) {
        return null;
      }
    } else {
      childModel = key;
    }
    if (childModel.parentModel !== this) {
      throw new Error("not a child model");
    }
    this.willRemoveChildModel(childModel);
    childModel.setParentModel(null, this);
    this.removeChildModelMap(childModel);
    const childModels = this._childModels;
    const index = childModels.indexOf(childModel);
    if (index >= 0) {
      childModels.splice(index, 1);
    }
    this.onRemoveChildModel(childModel);
    this.didRemoveChildModel(childModel);
    childModel.setKey(void 0);
    if (typeof key === "string") {
      return childModel;
    }
  }

  removeAll(): void {
    const childModels = this._childModels;
    do {
      const count = childModels.length;
      if (count > 0) {
        const childModel = childModels[count - 1];
        this.willRemoveChildModel(childModel);
        childModel.setParentModel(null, this);
        this.removeChildModelMap(childModel);
        childModels.pop();
        this.onRemoveChildModel(childModel);
        this.didRemoveChildModel(childModel);
        childModel.setKey(void 0);
        continue;
      }
      break;
    } while (true);
  }

  /** @hidden */
  protected doMountChildModels(): void {
    const childModels = this._childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i];
      childModel.cascadeMount();
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected doUnmountChildModels(): void {
    const childModels = this._childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i];
      childModel.cascadeUnmount();
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected doPowerChildModels(): void {
    const childModels = this._childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i];
      childModel.cascadePower();
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected doUnpowerChildModels(): void {
    const childModels = this._childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i];
      childModel.cascadeUnpower();
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
        continue;
      }
      i += 1;
    }
  }

  protected analyzeChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                               callback?: (this: this, childModel: Model) => void): void {
    const childModels = this._childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i];
      this.analyzeChildModel(childModel, analyzeFlags, modelContext);
      if (callback !== void 0) {
        callback.call(this, childModel);
      }
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
        continue;
      }
      i += 1;
    }
  }

  protected refreshChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                               callback?: (this: this, childModel: Model) => void): void {
    const childModels = this._childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i];
      this.refreshChildModel(childModel, refreshFlags, modelContext);
      if (callback !== void 0) {
        callback.call(this, childModel);
      }
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
        continue;
      }
      i += 1;
    }
  }
}
Model.Compound = CompoundModel;
