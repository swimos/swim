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
import {ModelManagerObserverType, ModelManager} from "../manager/ModelManager";
import {ModelService} from "./ModelService";

/** @hidden */
export abstract class ModelManagerService<M extends Model, MM extends ModelManager<M>> extends ModelService<M, MM> {
  /** @hidden */
  readonly observe?: boolean;

  mount(): void {
    super.mount();
    const manager = this._manager;
    if (manager !== void 0 && !this.isInherited()) {
      manager.insertRootModel(this._model);
      if (this.observe !== false) {
        manager.addModelManagerObserver(this as ModelManagerObserverType<MM>);
      }
    }
  }

  unmount(): void {
    const manager = this._manager;
    if (manager !== void 0 && !this.isInherited()) {
      if (this.observe !== false) {
        manager.removeModelManagerObserver(this as ModelManagerObserverType<MM>);
      }
      manager.removeRootModel(this._model);
    }
    super.unmount();
  }
}
ModelService.Manager = ModelManagerService;
