// Copyright 2015-2022 Swim.inc
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
import {RefreshService} from "./RefreshService";
import type {ModelContext} from "../model/ModelContext";
import type {ModelFlags, Model} from "../model/Model";

/** @public */
export interface RefreshProvider<M extends Model, S extends RefreshService<M> | null | undefined = RefreshService<M>> extends Provider<M, S> {
  get modelContext(): ModelContext;

  updatedModelContext(): ModelContext;

  requestUpdate(target: Model, updateFlags: ModelFlags, immediate: boolean): void;

  createService(): S;
}

/** @public */
export const RefreshProvider = (function (_super: typeof Provider) {
  const RefreshProvider = _super.extend("RefreshProvider") as ProviderClass<RefreshProvider<any, any>>;

  Object.defineProperty(RefreshProvider.prototype, "modelContext", {
    get<M extends Model, S extends RefreshService<M> | null | undefined>(this: RefreshProvider<M, S>): ModelContext {
      let service: RefreshService<M> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = RefreshService.global();
      }
      return service.modelContext;
    },
    configurable: true,
  });

  RefreshProvider.prototype.updatedModelContext = function <M extends Model, S extends RefreshService<M> | null | undefined>(this: RefreshProvider<M, S>): ModelContext {
    let service: RefreshService<M> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = RefreshService.global();
    }
    return service.updatedModelContext();
  };

  RefreshProvider.prototype.requestUpdate = function <M extends Model, S extends RefreshService<M> | null | undefined>(this: RefreshProvider<M, S>, target: Model, updateFlags: ModelFlags, immediate: boolean): void {
    let service: RefreshService<M> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = RefreshService.global();
    }
    service.requestUpdate(target, updateFlags, immediate);
  };

  RefreshProvider.prototype.createService = function <M extends Model, S extends RefreshService<M> | null | undefined>(this: RefreshProvider<M, S>): S {
    return RefreshService.global() as S;
  };

  return RefreshProvider;
})(Provider);
