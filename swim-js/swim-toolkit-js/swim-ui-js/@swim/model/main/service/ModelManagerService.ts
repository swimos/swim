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

import type {Model} from "../Model";
import type {ModelManager} from "../manager/ModelManager";
import type {ModelManagerObserverType} from "../manager/ModelManagerObserver";
import {ModelService} from "./ModelService";

export abstract class ModelManagerService<M extends Model, MM extends ModelManager<M>> extends ModelService<M, MM> {
  override mount(): void {
    super.mount();
    const manager = this.manager;
    if (manager !== void 0) {
      if (!this.isInherited()) {
        manager.insertRootModel(this.owner);
      }
      if (this.observe !== false) {
        manager.addModelManagerObserver(this as ModelManagerObserverType<MM>);
      }
    }
  }

  override unmount(): void {
    const manager = this.manager;
    if (manager !== void 0) {
      if (this.observe !== false) {
        manager.removeModelManagerObserver(this as ModelManagerObserverType<MM>);
      }
      if (!this.isInherited()) {
        manager.removeRootModel(this.owner);
      }
    }
    super.unmount();
  }
}
