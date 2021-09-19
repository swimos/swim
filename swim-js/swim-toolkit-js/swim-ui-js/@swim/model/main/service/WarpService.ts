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

import type {WarpClient} from "@swim/client";
import {Model} from "../Model";
import {Trait} from "../Trait";
import {WarpManager} from "../warp/WarpManager";
import {ModelService} from "./ModelService";
import {ModelManagerService} from "./ModelManagerService";
import {TraitService} from "./TraitService";

export abstract class WarpService<M extends Model, MM extends WarpManager<M> | null | undefined = WarpManager<M>> extends ModelManagerService<M, MM> {
  get client(): WarpClient {
    let manager: WarpManager<M> | null | undefined = this.manager;
    if (manager === void 0 || manager === null) {
      manager = WarpManager.global();
    }
    return manager.client;
  }

  override initManager(): MM {
    return WarpManager.global() as MM;
  }
}

ModelService({
  extends: WarpService,
  type: WarpManager,
  observe: false,
  manager: WarpManager.global(),
})(Model.prototype, "warpService");

TraitService({
  type: WarpManager,
  observe: false,
  manager: WarpManager.global(),
  modelService: {
    extends: WarpService,
    type: WarpManager,
    observe: false,
    manager: WarpManager.global(),
  },
})(Trait.prototype, "warpService");
