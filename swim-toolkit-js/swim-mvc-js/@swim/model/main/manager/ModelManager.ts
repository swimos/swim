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

import {Model} from "../Model";
import {ModelManagerObserver} from "./ModelManagerObserver";
import {RefreshManager} from "../refresh/RefreshManager";
import {WarpManager} from "../warp/WarpManager";

export type ModelManagerObserverType<MM extends ModelManager> =
  MM extends {readonly modelManagerObservers: ReadonlyArray<infer MMO>} ? MMO : unknown;

export abstract class ModelManager<M extends Model = Model> {
  /** @hidden */
  readonly _rootModels: M[];
  /** @hidden */
  _modelManagerObservers?: ModelManagerObserverType<this>[];

  constructor() {
    this._rootModels = [];
  }

  get modelManagerObservers(): ReadonlyArray<ModelManagerObserver> {
    let modelManagerObservers = this._modelManagerObservers;
    if (modelManagerObservers === void 0) {
      modelManagerObservers = [];
      this._modelManagerObservers = modelManagerObservers;
    }
    return modelManagerObservers;
  }

  addModelManagerObserver(modelManagerObserver: ModelManagerObserverType<this>): void {
    let modelManagerObservers = this._modelManagerObservers;
    let index: number;
    if (modelManagerObservers === void 0) {
      modelManagerObservers = [];
      this._modelManagerObservers = modelManagerObservers;
      index = -1;
    } else {
      index = modelManagerObservers.indexOf(modelManagerObserver);
    }
    if (index < 0) {
      this.willAddModelManagerObserver(modelManagerObserver);
      modelManagerObservers.push(modelManagerObserver);
      this.onAddModelManagerObserver(modelManagerObserver);
      this.didAddModelManagerObserver(modelManagerObserver);
    }
  }

  protected willAddModelManagerObserver(modelManagerObserver: ModelManagerObserverType<this>): void {
    // hook
  }

  protected onAddModelManagerObserver(modelManagerObserver: ModelManagerObserverType<this>): void {
    // hook
  }

  protected didAddModelManagerObserver(modelManagerObserver: ModelManagerObserverType<this>): void {
    // hook
  }

  removeModelManagerObserver(modelManagerObserver: ModelManagerObserverType<this>): void {
    const modelManagerObservers = this._modelManagerObservers;
    if (modelManagerObservers !== void 0) {
      const index = modelManagerObservers.indexOf(modelManagerObserver);
      if (index >= 0) {
        this.willRemoveModelManagerObserver(modelManagerObserver);
        modelManagerObservers.splice(index, 1);
        this.onRemoveModelManagerObserver(modelManagerObserver);
        this.didRemoveModelManagerObserver(modelManagerObserver);
      }
    }
  }

  protected willRemoveModelManagerObserver(modelManagerObserver: ModelManagerObserverType<this>): void {
    // hook
  }

  protected onRemoveModelManagerObserver(modelManagerObserver: ModelManagerObserverType<this>): void {
    // hook
  }

  protected didRemoveModelManagerObserver(modelManagerObserver: ModelManagerObserverType<this>): void {
    // hook
  }

  protected willObserve<T>(callback: (this: this, modelManagerObserver: ModelManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const modelManagerObservers = this._modelManagerObservers;
    if (modelManagerObservers !== void 0) {
      let i = 0;
      while (i < modelManagerObservers.length) {
        const modelManagerObserver = modelManagerObservers[i];
        result = callback.call(this, modelManagerObserver);
        if (result !== void 0) {
          return result;
        }
        if (modelManagerObserver === modelManagerObservers[i]) {
          i += 1;
        }
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, modelManagerObserver: ModelManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const modelManagerObservers = this._modelManagerObservers;
    if (modelManagerObservers !== void 0) {
      let i = 0;
      while (i < modelManagerObservers.length) {
        const modelManagerObserver = modelManagerObservers[i];
        result = callback.call(this, modelManagerObserver);
        if (result !== void 0) {
          return result;
        }
        if (modelManagerObserver === modelManagerObservers[i]) {
          i += 1;
        }
      }
    }
    return result;
  }

  isAttached(): boolean {
    return this._rootModels.length !== 0;
  }

  protected willAttach(): void {
    this.willObserve(function (modelManagerObserver: ModelManagerObserver): void {
      if (modelManagerObserver.modelManagerWillAttach !== void 0) {
        modelManagerObserver.modelManagerWillAttach(this);
      }
    });
  }

  protected onAttach(): void {
    // hook
  }

  protected didAttach(): void {
    this.didObserve(function (modelManagerObserver: ModelManagerObserver): void {
      if (modelManagerObserver.modelManagerDidAttach !== void 0) {
        modelManagerObserver.modelManagerDidAttach(this);
      }
    });
  }

  protected willDetach(): void {
    this.willObserve(function (modelManagerObserver: ModelManagerObserver): void {
      if (modelManagerObserver.modelManagerWillDetach !== void 0) {
        modelManagerObserver.modelManagerWillDetach(this);
      }
    });
  }

  protected onDetach(): void {
    // hook
  }

  protected didDetach(): void {
    this.didObserve(function (modelManagerObserver: ModelManagerObserver): void {
      if (modelManagerObserver.modelManagerDidDetach !== void 0) {
        modelManagerObserver.modelManagerDidDetach(this);
      }
    });
  }

  get rootModels(): ReadonlyArray<M> {
    return this._rootModels;
  }

  insertRootModel(rootModel: M): void {
    const rootModels = this._rootModels;
    const index = rootModels.indexOf(rootModel);
    if (index < 0) {
      const needsAttach = rootModels.length === 0;
      if (needsAttach) {
        this.willAttach();
      }
      this.willInsertRootModel(rootModel);
      rootModels.push(rootModel);
      if (needsAttach) {
        this.onAttach();
      }
      this.onInsertRootModel(rootModel);
      this.didInsertRootModel(rootModel);
      if (needsAttach) {
        this.didAttach();
      }
    }
  }

  protected willInsertRootModel(rootModel: M): void {
    this.willObserve(function (modelManagerObserver: ModelManagerObserver): void {
      if (modelManagerObserver.modelManagerWillInsertRootModel !== void 0) {
        modelManagerObserver.modelManagerWillInsertRootModel(rootModel, this);
      }
    });
  }

  protected onInsertRootModel(rootModel: M): void {
    // hook
  }

  protected didInsertRootModel(rootModel: M): void {
    this.didObserve(function (modelManagerObserver: ModelManagerObserver): void {
      if (modelManagerObserver.modelManagerDidInsertRootModel !== void 0) {
        modelManagerObserver.modelManagerDidInsertRootModel(rootModel, this);
      }
    });
  }

  removeRootModel(rootModel: M): void {
    const rootModels = this._rootModels;
    const index = rootModels.indexOf(rootModel);
    if (index >= 0) {
      const needsDetach = rootModels.length === 1;
      if (needsDetach) {
        this.willDetach();
      }
      this.willRemoveRootModel(rootModel);
      rootModels.splice(index, 1);
      if (needsDetach) {
        this.onDetach();
      }
      this.onRemoveRootModel(rootModel);
      this.didRemoveRootModel(rootModel);
      if (needsDetach) {
        this.didDetach();
      }
    }
  }

  protected willRemoveRootModel(rootModel: M): void {
    this.willObserve(function (modelManagerObserver: ModelManagerObserver): void {
      if (modelManagerObserver.modelManagerWillRemoveRootModel !== void 0) {
        modelManagerObserver.modelManagerWillRemoveRootModel(rootModel, this);
      }
    });
  }

  protected onRemoveRootModel(rootModel: M): void {
    // hook
  }

  protected didRemoveRootModel(rootModel: M): void {
    this.didObserve(function (modelManagerObserver: ModelManagerObserver): void {
      if (modelManagerObserver.modelManagerDidRemoveRootModel !== void 0) {
        modelManagerObserver.modelManagerDidRemoveRootModel(rootModel, this);
      }
    });
  }

  // Forward type declarations
  /** @hidden */
  static Refresh: typeof RefreshManager; // defined by RefreshManager
  /** @hidden */
  static Warp: typeof WarpManager; // defined by WarpManager
}
Model.Manager = ModelManager;
