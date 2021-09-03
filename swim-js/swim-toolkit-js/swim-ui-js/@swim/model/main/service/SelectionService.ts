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

export class SelectionService<M extends Model> extends ModelManagerService<M, SelectionManager<M>> {
  get selections(): ReadonlyArray<Model> {
    return this.manager.selections;
  }

  select(model: Model, options?: SelectionOptions, index?: number): void {
    this.manager.select(model, options, index);
  }

  unselect(model: Model): void {
    this.manager.unselect(model);
  }

  unselectAll(): void {
    this.manager.unselectAll();
  }

  override initManager(): SelectionManager<M> {
    return SelectionManager.global();
  }
}

ModelService({
  extends: SelectionService,
  type: SelectionManager,
  observe: false,
})(Model.prototype, "selectionService");
