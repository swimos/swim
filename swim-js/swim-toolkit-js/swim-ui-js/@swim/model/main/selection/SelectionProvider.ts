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

import {ProviderClass, Provider} from "@swim/fastener";
import {SelectionOptions, SelectionService} from "./SelectionService";
import type {Model} from "../model/Model";

export interface SelectionProvider<M, S extends SelectionService<M> | null | undefined = SelectionService<M>> extends Provider<M, S> {
  get selections(): ReadonlyArray<Model>;

  select(model: Model, options?: SelectionOptions, index?: number): void;

  unselect(model: Model): void;

  unselectAll(): void;

  createService(): S;
}

export const SelectionProvider = (function (_super: typeof Provider) {
  const SelectionProvider = _super.extend("SelectionProvider") as ProviderClass<SelectionProvider<any, any>>;

  Object.defineProperty(SelectionProvider.prototype, "selections", {
    get<M, S extends SelectionService<M> | null | undefined>(this: SelectionProvider<M, S>): ReadonlyArray<Model> {
      let service: SelectionService<M> | null | undefined = this.service;
      if (service === void 0 || service === null) {
        service = SelectionService.global();
      }
      return service.selections;
    },
    configurable: true,
  });

  SelectionProvider.prototype.select = function <M, S extends SelectionService<M> | null | undefined>(this: SelectionProvider<M, S>, model: Model, options?: SelectionOptions, index?: number): void {
    let service: SelectionService<M> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = SelectionService.global();
    }
    service.select(model, options, index);
  };

  SelectionProvider.prototype.unselect = function <M, S extends SelectionService<M> | null | undefined>(this: SelectionProvider<M, S>, model: Model): void {
    let service: SelectionService<M> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = SelectionService.global();
    }
    service.unselect(model);
  };

  SelectionProvider.prototype.unselectAll = function <M, S extends SelectionService<M> | null | undefined>(this: SelectionProvider<M, S>): void {
    let service: SelectionService<M> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = SelectionService.global();
    }
    service.unselectAll();
  };

  SelectionProvider.prototype.createService = function <M, S extends SelectionService<M> | null | undefined>(this: SelectionProvider<M, S>): S {
    return SelectionService.global() as S;
  };

  return SelectionProvider;
})(Provider);
