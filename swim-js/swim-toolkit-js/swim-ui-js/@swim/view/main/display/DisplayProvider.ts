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
import {DisplayService} from "./DisplayService";
import type {ViewContext} from "../view/ViewContext";
import type {ViewFlags, View} from "../view/View";

export interface DisplayProvider<V extends View, S extends DisplayService<V> | null | undefined = DisplayService<V>> extends Provider<V, S> {
  updatedViewContext(viewContext: ViewContext): ViewContext;

  requestUpdate(target: View, updateFlags: ViewFlags, immediate: boolean): void;

  createService(): S;
}

export const DisplayProvider = (function (_super: typeof Provider) {
  const DisplayProvider = _super.extend() as ProviderClass<DisplayProvider<any, any>>;

  DisplayProvider.prototype.updatedViewContext = function <V extends View, S extends DisplayService<V> | null | undefined>(this: DisplayProvider<V, S>, viewContext: ViewContext): ViewContext {
    let service: DisplayService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = DisplayService.global();
    }
    return service.updatedViewContext(viewContext);
  };

  DisplayProvider.prototype.requestUpdate = function <V extends View, S extends DisplayService<V> | null | undefined>(this: DisplayProvider<V, S>, target: View, updateFlags: ViewFlags, immediate: boolean): void {
    let service: DisplayService<V> | null | undefined = this.service;
    if (service === void 0 || service === null) {
      service = DisplayService.global();
    }
    service.requestUpdate(target, updateFlags, immediate);
  };

  DisplayProvider.prototype.createService = function <V extends View, S extends DisplayService<V> | null | undefined>(this: DisplayProvider<V, S>): S {
    return DisplayService.global() as S;
  };

  return DisplayProvider;
})(Provider);
