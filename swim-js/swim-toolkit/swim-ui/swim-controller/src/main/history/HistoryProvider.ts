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
import type {HistoryStateInit, HistoryState} from "./HistoryState";
import {HistoryService} from "./HistoryService";
import type {Controller} from "../controller/Controller";

/** @public */
export interface HistoryProvider<C extends Controller, S extends HistoryService<C> | null | undefined = HistoryService<C>> extends Provider<C, S> {
  get historyState(): HistoryState;

  pushHistory(deltaState: HistoryStateInit): void;

  replaceHistory(deltaState: HistoryStateInit): void;

  createService(): S;
}

/** @public */
export const HistoryProvider = (function (_super: typeof Provider) {
  const HistoryProvider = _super.extend("HistoryProvider") as ProviderClass<HistoryProvider<any, any>>;

  Object.defineProperty(HistoryProvider.prototype, "historyState", {
    get<C extends Controller, S extends HistoryService<C> | null | undefined>(this: HistoryProvider<C, S>): HistoryState {
      let service: HistoryService<C> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = HistoryService.global();
      }
      return service.historyState;
    },
    configurable: true,
  });

  HistoryProvider.prototype.pushHistory = function <C extends Controller, S extends HistoryService<C> | null | undefined>(this: HistoryProvider<C, S>, deltaState: HistoryStateInit): void {
    let service: HistoryService<C> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = HistoryService.global();
    }
    service.pushHistory(deltaState);
  };

  HistoryProvider.prototype.replaceHistory = function <C extends Controller, S extends HistoryService<C> | null | undefined>(this: HistoryProvider<C, S>, deltaState: HistoryStateInit): void {
    let service: HistoryService<C> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = HistoryService.global();
    }
    service.replaceHistory(deltaState);
  };

  HistoryProvider.prototype.createService = function <C extends Controller, S extends HistoryService<C> | null | undefined>(this: HistoryProvider<C, S>): S {
    return HistoryService.global() as S;
  };

  return HistoryProvider;
})(Provider);
