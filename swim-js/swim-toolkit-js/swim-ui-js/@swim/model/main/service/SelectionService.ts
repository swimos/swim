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

import {Model} from "../Model";
import {SelectionOptions, SelectionManager} from "../selection/SelectionManager";
import {ModelService} from "./ModelService";
import {ModelManagerService} from "./ModelManagerService";

export class SelectionService<M extends Model, MM extends SelectionManager<M> | null | undefined = SelectionManager<M>> extends ModelManagerService<M, MM> {
  get selections(): ReadonlyArray<Model> {
    let manager: SelectionManager<M> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = SelectionManager.global();
    }
    return manager.selections;
  }

  select(model: Model, options?: SelectionOptions, index?: number): void {
    let manager: SelectionManager<M> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = SelectionManager.global();
    }
    manager.select(model, options, index);
  }

  unselect(model: Model): void {
    let manager: SelectionManager<M> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = SelectionManager.global();
    }
    manager.unselect(model);
  }

  unselectAll(): void {
    let manager: SelectionManager<M> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = SelectionManager.global();
    }
    manager.unselectAll();
  }

  override initManager(): MM {
    return SelectionManager.global() as MM;
  }
}

ModelService({
  extends: SelectionService,
  type: SelectionManager,
  observe: false,
  manager: SelectionManager.global(),
})(Model.prototype, "selectionService");
