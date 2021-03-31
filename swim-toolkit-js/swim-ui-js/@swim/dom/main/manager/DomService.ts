// Copyright 2015-2020 Swim inc.
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

import {ViewService, ViewManagerService} from "@swim/view";
import {NodeView} from "../node/NodeView";
import {DomManager} from "./DomManager";

export abstract class DomService<V extends NodeView> extends ViewManagerService<V, DomManager<V>> {
  initManager(): DomManager<V> {
    return DomManager.global();
  }
}

ViewService({extends: DomService, type: DomManager, observe: false})(NodeView.prototype, "domService");
