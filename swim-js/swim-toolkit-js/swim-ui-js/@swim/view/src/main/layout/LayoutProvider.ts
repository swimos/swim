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

import {ProviderClass, Provider} from "@swim/component";
import {LayoutService} from "./LayoutService";
import type {View} from "../view/View";

/** @public */
export interface LayoutProvider<V extends View, S extends LayoutService<V> | null | undefined = LayoutService<V>> extends Provider<V, S> {
  createService(): S;
}

/** @public */
export const LayoutProvider = (function (_super: typeof Provider) {
  const LayoutProvider = _super.extend("LayoutProvider") as ProviderClass<LayoutProvider<any, any>>;

  LayoutProvider.prototype.createService = function <V extends View, S extends LayoutService<V> | null | undefined>(this: LayoutProvider<V, S>): S {
    return LayoutService.global() as S;
  };

  return LayoutProvider;
})(Provider);
