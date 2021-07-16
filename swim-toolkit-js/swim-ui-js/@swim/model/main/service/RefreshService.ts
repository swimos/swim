// Copyright 2015-2021 Swim inc.
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
import {Model} from "../Model";
import {RefreshManager} from "../refresh/RefreshManager";
import {ModelService} from "./ModelService";
import {ModelManagerService} from "./ModelManagerService";

export abstract class RefreshService<M extends Model> extends ModelManagerService<M, RefreshManager<M>> {
  get modelContext(): ModelContext {
    let manager = this.manager;
    if (manager === void 0) {
      manager = RefreshManager.global();
    }
    return manager.modelContext;
  }

  updatedModelContext(): ModelContext {
    let manager = this.manager;
    if (manager === void 0) {
      manager = RefreshManager.global();
    }
    return manager.updatedModelContext();
  }

  override initManager(): RefreshManager<M> {
    return RefreshManager.global();
  }
}

ModelService({
  extends: RefreshService,
  type: RefreshManager,
  observe: false,
})(Model.prototype, "refreshService");
