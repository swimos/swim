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

import type {ModelContextType} from "../ModelContext";
import {ModelFlags, Model} from "../Model";
import {GenericModel} from "./GenericModel";

export class CompoundModel extends GenericModel {
  constructor() {
    super();
    Object.defineProperty(this, "childModels", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "childModelMap", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly childModels!: ReadonlyArray<Model>;

  override get childModelCount(): number {
    return this.childModels.length;
  }

  override firstChildModel(): Model | null {
    const childModels = this.childModels;
    return childModels.length !== 0 ? childModels[0]! : null;
  }

  override lastChildModel(): Model | null {
    const childModels = this.childModels;
    return childModels.length !== 0 ? childModels[childModels.length - 1]! : null;
  }

  override nextChildModel(targetModel: Model): Model | null {
    const childModels = this.childModels;
    const targetIndex = childModels.indexOf(targetModel);
    return targetIndex >= 0 && targetIndex + 1 < childModels.length ? childModels[targetIndex + 1]! : null;
  }

  override previousChildModel(targetModel: Model): Model | null {
    const childModels = this.childModels;
    const targetIndex = childModels.indexOf(targetModel);
    return targetIndex - 1 >= 0 ? childModels[targetIndex - 1]! : null;
  }

  override forEachChildModel<T>(callback: (childModel: Model) => T | void): T | undefined;
  override forEachChildModel<T, S>(callback: (this: S, childModel: Model) => T | void,
                                   thisArg: S): T | undefined;
  override forEachChildModel<T, S>(callback: (this: S | undefined, childModel: Model) => T | void,
                                   thisArg?: S): T | undefined {
    let result: T | undefined;
    const childModels = this.childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i]!;
      result = callback.call(thisArg, childModel) as T | undefined;
      if (result !== void 0) {
        break;
      }
      if (childModels[i] === childModel) {
        i += 1;
      }
    }
    return result;
  }

  /** @hidden */
  readonly childModelMap!: {[key: string]: Model | undefined} | null;

  override getChildModel(key: string): Model | null {
    const childModelMap = this.childModelMap;
    if (childModelMap !== null) {
      const childModel = childModelMap[key];
      if (childModel !== void 0) {
        return childModel;
      }
    }
    return null;
  }

  override setChildModel(key: string, newChildModel: Model | null): Model | null {
    let targetModel: Model | null = null;
    const childModels = this.childModels as Model[];
    if (newChildModel !== null) {
      if (newChildModel.parentModel === this) {
        targetModel = childModels[childModels.indexOf(newChildModel) + 1] || null;
      }
      newChildModel.remove();
    }
    let index = -1;
    const oldChildModel = this.getChildModel(key);
    if (oldChildModel !== null) {
      index = childModels.indexOf(oldChildModel);
      // assert(index >= 0);
      targetModel = childModels[index + 1] || null;
      this.willRemoveChildModel(oldChildModel);
      oldChildModel.setParentModel(null, this);
      this.removeChildModelMap(oldChildModel);
      childModels.splice(index, 1);
      this.onRemoveChildModel(oldChildModel);
      this.didRemoveChildModel(oldChildModel);
      oldChildModel.setKey(void 0);
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
      let childModelMap = this.childModelMap;
      if (childModelMap === null) {
        childModelMap = {};
        Object.defineProperty(this, "childModelMap", {
          value: childModelMap,
          enumerable: true,
          configurable: true,
        });
      }
      childModelMap[key] = childModel;
    }
  }

  /** @hidden */
  protected removeChildModelMap(childModel: Model): void {
    const key = childModel.key;
    if (key !== void 0) {
      const childModelMap = this.childModelMap;
      if (childModelMap !== null) {
        delete childModelMap[key];
      }
    }
  }

  override appendChildModel(childModel: Model, key?: string): void {
    childModel.remove();
    if (key !== void 0) {
      this.removeChildModel(key);
      childModel.setKey(key);
    }
    this.willInsertChildModel(childModel, null);
    (this.childModels as Model[]).push(childModel);
    this.insertChildModelMap(childModel);
    childModel.setParentModel(this, null);
    this.onInsertChildModel(childModel, null);
    this.didInsertChildModel(childModel, null);
    childModel.cascadeInsert();
  }

  override prependChildModel(childModel: Model, key?: string): void {
    childModel.remove();
    if (key !== void 0) {
      this.removeChildModel(key);
      childModel.setKey(key);
    }
    const childModels = this.childModels as Model[];
    const targetModel = childModels.length !== 0 ? childModels[0]! : null;
    this.willInsertChildModel(childModel, targetModel);
    childModels.unshift(childModel);
    this.insertChildModelMap(childModel);
    childModel.setParentModel(this, null);
    this.onInsertChildModel(childModel, targetModel);
    this.didInsertChildModel(childModel, targetModel);
    childModel.cascadeInsert();
  }

  override insertChildModel(childModel: Model, targetModel: Model | null, key?: string): void {
    if (targetModel !== null && targetModel.parentModel !== this) {
      throw new TypeError("" + targetModel);
    }
    childModel.remove();
    if (key !== void 0) {
      this.removeChildModel(key);
      childModel.setKey(key);
    }
    this.willInsertChildModel(childModel, targetModel);
    const childModels = this.childModels as Model[];
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

  override removeChildModel(key: string): Model | null;
  override removeChildModel(childModel: Model): void;
  override removeChildModel(key: string | Model): Model | null | void {
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
    const childModels = this.childModels as Model[];
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

  override removeAll(): void {
    const childModels = this.childModels as Model[];
    do {
      const count = childModels.length;
      if (count > 0) {
        const childModel = childModels[count - 1]!;
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
  protected override doMountChildModels(): void {
    const childModels = this.childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i]!;
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
  protected override doUnmountChildModels(): void {
    const childModels = this.childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i]!;
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
  protected override doPowerChildModels(): void {
    const childModels = this.childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i]!;
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
  protected override doUnpowerChildModels(): void {
    const childModels = this.childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i]!;
      childModel.cascadeUnpower();
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected override analyzeOwnChildModels(analyzeFlags: ModelFlags, modelContext: ModelContextType<this>,
                                           analyzeChildModel: (this: this, childModel: Model, analyzeFlags: ModelFlags,
                                                               modelContext: ModelContextType<this>) => void): void {
    const childModels = this.childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i]!;
      analyzeChildModel.call(this, childModel, analyzeFlags, modelContext);
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
        continue;
      }
      i += 1;
    }
  }

  /** @hidden */
  protected override refreshOwnChildModels(refreshFlags: ModelFlags, modelContext: ModelContextType<this>,
                                           refreshChildModel: (this: this, childModel: Model, refreshFlags: ModelFlags,
                                                               modelContext: ModelContextType<this>) => void): void {
    const childModels = this.childModels;
    let i = 0;
    while (i < childModels.length) {
      const childModel = childModels[i]!;
      refreshChildModel.call(this, childModel, refreshFlags, modelContext);
      if ((childModel.modelFlags & Model.RemovingFlag) !== 0) {
        childModel.setModelFlags(childModel.modelFlags & ~Model.RemovingFlag);
        this.removeChildModel(childModel);
        continue;
      }
      i += 1;
    }
  }
}
