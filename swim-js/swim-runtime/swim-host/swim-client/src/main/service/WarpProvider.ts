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
import type {WarpClient} from "../client/WarpClient";
import {WarpService} from "./WarpService";

/** @public */
export interface WarpProvider<O, S extends WarpService<O> | null | undefined = WarpService<O>> extends Provider<O, S> {
  get client(): WarpClient

  createService(): S;
}

/** @public */
export const WarpProvider = (function (_super: typeof Provider) {
  const WarpProvider = _super.extend("WarpProvider") as ProviderClass<WarpProvider<any, any>>;

  Object.defineProperty(WarpProvider.prototype, "client", {
    get<O, S extends WarpService<O> | null | undefined>(this: WarpProvider<O, S>): WarpClient {
      let service: WarpService<O> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = WarpService.global();
      }
      return service.client;
    },
    configurable: true,
  });

  WarpProvider.prototype.createService = function <O, S extends WarpService<O> | null | undefined>(this: WarpProvider<O, S>): S {
    return WarpService.global() as S;
  };

  return WarpProvider;
})(Provider);
