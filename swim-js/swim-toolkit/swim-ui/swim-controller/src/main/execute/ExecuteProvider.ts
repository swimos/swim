// Copyright 2015-2021 Swim.inc
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

import {ProviderClass, Provider} from "@swim/component";
import {ExecuteService} from "./ExecuteService";
import type {ControllerContext} from "../controller/ControllerContext";
import type {ControllerFlags, Controller} from "../controller/Controller";

/** @public */
export interface ExecuteProvider<C extends Controller, S extends ExecuteService<C> | null | undefined = ExecuteService<C>> extends Provider<C, S> {
  get controllerContext(): ControllerContext;

  updatedControllerContext(): ControllerContext;

  requestUpdate(target: Controller, updateFlags: ControllerFlags, immediate: boolean): void;

  createService(): S;
}

/** @public */
export const ExecuteProvider = (function (_super: typeof Provider) {
  const ExecuteProvider = _super.extend("ExecuteProvider") as ProviderClass<ExecuteProvider<any, any>>;

  Object.defineProperty(ExecuteProvider.prototype, "controllerContext", {
    get<C extends Controller, S extends ExecuteService<C> | null | undefined>(this: ExecuteProvider<C, S>): ControllerContext {
      let service: ExecuteService<C> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = ExecuteService.global();
      }
      return service.controllerContext;
    },
    configurable: true,
  });

  ExecuteProvider.prototype.updatedControllerContext = function <C extends Controller, S extends ExecuteService<C> | null | undefined>(this: ExecuteProvider<C, S>): ControllerContext {
    let service: ExecuteService<C> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ExecuteService.global();
    }
    return service.updatedControllerContext();
  };

  ExecuteProvider.prototype.requestUpdate = function <C extends Controller, S extends ExecuteService<C> | null | undefined>(this: ExecuteProvider<C, S>, target: Controller, updateFlags: ControllerFlags, immediate: boolean): void {
    let service: ExecuteService<C> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = ExecuteService.global();
    }
    service.requestUpdate(target, updateFlags, immediate);
  };

  ExecuteProvider.prototype.createService = function <C extends Controller, S extends ExecuteService<C> | null | undefined>(this: ExecuteProvider<C, S>): S {
    return ExecuteService.global() as S;
  };

  return ExecuteProvider;
})(Provider);
