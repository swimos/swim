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

import type {WarpRef} from "@swim/client";
import type {ModelFlags} from "../Model";
import type {WarpManager} from "../warp/WarpManager";
import type {ModelDownlinkConstructor, ModelDownlink} from "./ModelDownlink";

export interface ModelDownlinkContext {
  hasModelDownlink(downlinkName: string): boolean;

  getModelDownlink(downlinkName: string): ModelDownlink<this> | null;

  setModelDownlink(downlinkName: string, modelDownlink: ModelDownlink<this> | null): void;

  requireUpdate(updateFlags: ModelFlags): void;

  readonly warpRef: {
    readonly state: WarpRef | null;
  };

  readonly warpService: {
    readonly manager: WarpManager;
  };
}

/** @hidden */
export const ModelDownlinkContext = {} as {
  /** @hidden */
  decorateModelDownlink(constructor: ModelDownlinkConstructor<ModelDownlinkContext>,
                        target: Object, propertyKey: string | symbol): void;
};

ModelDownlinkContext.decorateModelDownlink = function (constructor: ModelDownlinkConstructor<ModelDownlinkContext>,
                                                       target: Object, propertyKey: string | symbol): void {
  Object.defineProperty(target, propertyKey, {
    get: function (this: ModelDownlinkContext): ModelDownlink<ModelDownlinkContext> {
      let modelDownlink = this.getModelDownlink(propertyKey.toString());
      if (modelDownlink === null) {
        modelDownlink = new constructor(this, propertyKey.toString());
        this.setModelDownlink(propertyKey.toString(), modelDownlink);
      }
      return modelDownlink;
    },
    configurable: true,
    enumerable: true,
  });
};
