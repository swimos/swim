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
import {DomService} from "./DomService";
import type {NodeView} from "../node/NodeView";

/** @public */
export interface DomProvider<V extends NodeView, S extends DomService<V> | null | undefined = DomService<V>> extends Provider<V, S> {
  createService(): S;
}

/** @public */
export const DomProvider = (function (_super: typeof Provider) {
  const DomProvider = _super.extend("DomProvider") as ProviderClass<DomProvider<any, any>>;

  DomProvider.prototype.createService = function <V extends NodeView, S extends DomService<V> | null | undefined>(this: DomProvider<V, S>): S {
    return DomService.global() as S;
  };

  return DomProvider;
})(Provider);
