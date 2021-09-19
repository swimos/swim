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

import {Controller} from "../Controller";
import {StorageManager} from "../storage/StorageManager";
import {ControllerService} from "./ControllerService";
import {ControllerManagerService} from "./ControllerManagerService";

export abstract class StorageService<C extends Controller, CM extends StorageManager<C> | null | undefined = StorageManager<C>> extends ControllerManagerService<C, CM> {
  get(key: string): string | undefined {
    let manager: StorageManager<C> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = StorageManager.global();
    }
    return manager.get(key);
  }

  set(key: string, newValue: string | undefined): string | undefined {
    let manager: StorageManager<C> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = StorageManager.global();
    }
    return manager.set(key, newValue);
  }

  clear(): void {
    let manager: StorageManager<C> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = StorageManager.global();
    }
    manager.clear();
  }

  override initManager(): CM {
    return StorageManager.global() as CM;
  }
}

ControllerService({
  extends: StorageService,
  type: StorageManager,
  observe: false,
  manager: StorageManager.global(),
})(Controller.prototype, "storageService");
