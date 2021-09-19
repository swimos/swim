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

import type {ModelContext} from "../ModelContext";
import {ModelFlags, Model} from "../Model";
import {RefreshManager} from "../refresh/RefreshManager";
import {ModelService} from "./ModelService";
import {ModelManagerService} from "./ModelManagerService";

export abstract class RefreshService<M extends Model, MM extends RefreshManager<M> | null | undefined = RefreshManager<M>> extends ModelManagerService<M, MM> {
  get modelContext(): ModelContext {
    let manager: RefreshManager<M> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = RefreshManager.global();
    }
    return manager.modelContext;
  }

  updatedModelContext(): ModelContext {
    let manager: RefreshManager<M> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = RefreshManager.global();
    }
    return manager.updatedModelContext();
  }

  requestUpdate(targetModel: Model, updateFlags: ModelFlags, immediate: boolean): void {
    let manager: RefreshManager<M> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = RefreshManager.global();
    }
    manager.requestUpdate(targetModel, updateFlags, immediate);
  }

  override initManager(): MM {
    return RefreshManager.global() as MM;
  }
}

ModelService({
  extends: RefreshService,
  type: RefreshManager,
  observe: false,
  manager: RefreshManager.global(),
})(Model.prototype, "refreshService");
