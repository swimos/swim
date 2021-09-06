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

import type {ControllerContext} from "../ControllerContext";
import {Controller} from "../Controller";
import {ExecuteManager} from "../execute/ExecuteManager";
import {ControllerService} from "./ControllerService";
import {ControllerManagerService} from "./ControllerManagerService";

export abstract class ExecuteService<C extends Controller> extends ControllerManagerService<C, ExecuteManager<C>> {
  get controllerContext(): ControllerContext {
    let manager = this.manager;
    if (manager === void 0) {
      manager = ExecuteManager.global();
    }
    return manager.controllerContext;
  }

  updatedControllerContext(): ControllerContext {
    let manager = this.manager;
    if (manager === void 0) {
      manager = ExecuteManager.global();
    }
    return manager.updatedControllerContext();
  }

  override initManager(): ExecuteManager<C> {
    return ExecuteManager.global();
  }
}

ControllerService({
  extends: ExecuteService,
  type: ExecuteManager,
  observe: false,
})(Controller.prototype, "executeService");
