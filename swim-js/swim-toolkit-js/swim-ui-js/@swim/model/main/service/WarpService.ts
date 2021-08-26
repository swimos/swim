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

export abstract class WarpService<M extends Model> extends ModelManagerService<M, WarpManager<M>> {
  get client(): WarpClient {
    return this.manager.client;
  }

  override initManager(): WarpManager<M> {
    return WarpManager.global();
  }
}

ModelService({
  extends: WarpService,
  type: WarpManager,
  observe: false,
})(Model.prototype, "warpService");

TraitService({
  type: WarpManager,
  observe: false,
  modelService: {
    extends: WarpService,
    type: WarpManager,
    observe: false,
  },
})(Trait.prototype, "warpService");
