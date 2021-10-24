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
import {StorageService} from "./StorageService";
import type {Controller} from "../controller/Controller";

export interface StorageProvider<C extends Controller, S extends StorageService<C> | null | undefined = StorageService<C>> extends Provider<C, S> {
  get(key: string): string | undefined;

  set(key: string, newValue: string | undefined): string | undefined;

  clear(): void;

  createService(): S;
}

export const StorageProvider = (function (_super: typeof Provider) {
  const StorageProvider = _super.extend("StorageProvider") as ProviderClass<StorageProvider<any, any>>;

  StorageProvider.prototype.get = function <C extends Controller, S extends StorageService<C> | null | undefined>(key: string): string | undefined {
    let service: StorageService<C> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = StorageService.global();
    }
    return service.get(key);
  };

  StorageProvider.prototype.set = function <C extends Controller, S extends StorageService<C> | null | undefined>(key: string, newValue: string | undefined): string | undefined {
    let service: StorageService<C> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = StorageService.global();
    }
    return service.set(key, newValue);
  };

  StorageProvider.prototype.clear = function <C extends Controller, S extends StorageService<C> | null | undefined>(): void {
    let service: StorageService<C> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = StorageService.global();
    }
    service.clear();
  };

  StorageProvider.prototype.createService = function <C extends Controller, S extends StorageService<C> | null | undefined>(this: StorageProvider<C, S>): S {
    return StorageService.global() as S;
  };

  return StorageProvider;
})(Provider);
