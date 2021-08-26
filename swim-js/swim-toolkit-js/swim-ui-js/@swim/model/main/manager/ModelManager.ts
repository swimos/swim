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
import type {Model} from "../Model";
import type {ModelManagerObserverType, ModelManagerObserver} from "./ModelManagerObserver";

export abstract class ModelManager<M extends Model = Model> {
  constructor() {
    Object.defineProperty(this, "rootModels", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "modelManagerObservers", {
      value: Arrays.empty,
      enumerable: true,
      configurable: true,
    });
  }

  readonly modelManagerObservers!: ReadonlyArray<ModelManagerObserver>;

  addModelManagerObserver(modelManagerObserver: ModelManagerObserverType<this>): void {
    const oldModelManagerObservers = this.modelManagerObservers;
    const newModelManagerObservers = Arrays.inserted(modelManagerObserver, oldModelManagerObservers);
    if (oldModelManagerObservers !== newModelManagerObservers) {
      this.willAddModelManagerObserver(modelManagerObserver);
      Object.defineProperty(this, "modelManagerObservers", {
        value: newModelManagerObservers,
        enumerable: true,
        configurable: true,
      });
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
    const oldModelManagerObservers = this.modelManagerObservers;
    const newModelManagerObservers = Arrays.removed(modelManagerObserver, oldModelManagerObservers);
    if (oldModelManagerObservers !== newModelManagerObservers) {
      this.willRemoveModelManagerObserver(modelManagerObserver);
      Object.defineProperty(this, "modelManagerObservers", {
        value: newModelManagerObservers,
        enumerable: true,
        configurable: true,
      });
      this.onRemoveModelManagerObserver(modelManagerObserver);
      this.didRemoveModelManagerObserver(modelManagerObserver);
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
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      result = callback.call(this, modelManagerObserver as ModelManagerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  protected didObserve<T>(callback: (this: this, modelManagerObserver: ModelManagerObserverType<this>) => T | void): T | undefined {
    let result: T | undefined;
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      result = callback.call(this, modelManagerObserver as ModelManagerObserverType<this>) as T | undefined;
      if (result !== void 0) {
        return result;
      }
    }
    return result;
  }

  isAttached(): boolean {
    return this.rootModels.length !== 0;
  }

  protected willAttach(): void {
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      if (modelManagerObserver.modelManagerWillAttach !== void 0) {
        modelManagerObserver.modelManagerWillAttach(this);
      }
    }
  }

  protected onAttach(): void {
    // hook
  }

  protected didAttach(): void {
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      if (modelManagerObserver.modelManagerDidAttach !== void 0) {
        modelManagerObserver.modelManagerDidAttach(this);
      }
    }
  }

  protected willDetach(): void {
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      if (modelManagerObserver.modelManagerWillDetach !== void 0) {
        modelManagerObserver.modelManagerWillDetach(this);
      }
    }
  }

  protected onDetach(): void {
    // hook
  }

  protected didDetach(): void {
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      if (modelManagerObserver.modelManagerDidDetach !== void 0) {
        modelManagerObserver.modelManagerDidDetach(this);
      }
    }
  }

  readonly rootModels!: ReadonlyArray<M>;

  insertRootModel(rootModel: M): void {
    const oldRootModels = this.rootModels;
    const newRootModels = Arrays.inserted(rootModel, oldRootModels);
    if (oldRootModels !== newRootModels) {
      const needsAttach = oldRootModels.length === 0;
      if (needsAttach) {
        this.willAttach();
      }
      this.willInsertRootModel(rootModel);
      Object.defineProperty(this, "rootModels", {
        value: newRootModels,
        enumerable: true,
        configurable: true,
      });
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
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      if (modelManagerObserver.modelManagerWillInsertRootModel !== void 0) {
        modelManagerObserver.modelManagerWillInsertRootModel(rootModel, this);
      }
    }
  }

  protected onInsertRootModel(rootModel: M): void {
    // hook
  }

  protected didInsertRootModel(rootModel: M): void {
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      if (modelManagerObserver.modelManagerDidInsertRootModel !== void 0) {
        modelManagerObserver.modelManagerDidInsertRootModel(rootModel, this);
      }
    }
  }

  removeRootModel(rootModel: M): void {
    const oldRootModels = this.rootModels;
    const newRootModels = Arrays.removed(rootModel, oldRootModels);
    if (oldRootModels !== newRootModels) {
      const needsDetach = oldRootModels.length === 1;
      if (needsDetach) {
        this.willDetach();
      }
      this.willRemoveRootModel(rootModel);
      Object.defineProperty(this, "rootModels", {
        value: newRootModels,
        enumerable: true,
        configurable: true,
      });
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
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      if (modelManagerObserver.modelManagerWillRemoveRootModel !== void 0) {
        modelManagerObserver.modelManagerWillRemoveRootModel(rootModel, this);
      }
    }
  }

  protected onRemoveRootModel(rootModel: M): void {
    // hook
  }

  protected didRemoveRootModel(rootModel: M): void {
    const modelManagerObservers = this.modelManagerObservers;
    for (let i = 0, n = modelManagerObservers.length; i < n; i += 1) {
      const modelManagerObserver = modelManagerObservers[i]!;
      if (modelManagerObserver.modelManagerDidRemoveRootModel !== void 0) {
        modelManagerObserver.modelManagerDidRemoveRootModel(rootModel, this);
      }
    }
  }
}
