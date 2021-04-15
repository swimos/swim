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

/** @hidden */
export interface ModelDownlinkContextPrototype {
  /** @hidden */
  modelDownlinkConstructors?: {[downlinkName: string]: ModelDownlinkConstructor<ModelDownlinkContext> | undefined};
}

export interface ModelDownlinkContext {
  hasModelDownlink(downlinkName: string): boolean;

  getModelDownlink(downlinkName: string): ModelDownlink<this> | null;

  setModelDownlink(downlinkName: string, modelDownlink: ModelDownlink<this> | null): void;

  /** @hidden */
  getLazyModelDownlink(downlinkName: string): ModelDownlink<this> | null;

  requireUpdate(updateFlags: ModelFlags): void;

  readonly warpService: {
    readonly manager: WarpManager;
  };

  readonly warpRef: {
    readonly state: WarpRef | null;
  };
}

/** @hidden */
export const ModelDownlinkContext = {} as {
  /** @hidden */
  initModelDownlinks(modelDownlinkContext: ModelDownlinkContext): void;

  /** @hidden */
  getModelDownlinkConstructor(downlinkName: string, modelDownlinkContextPrototype: ModelDownlinkContextPrototype | null): ModelDownlinkConstructor<ModelDownlinkContext> | null;

  /** @hidden */
  decorateModelDownlink(modelDownlinkConstructor: ModelDownlinkConstructor<ModelDownlinkContext>,
                        target: Object, propertyKey: string | symbol): void;
};

ModelDownlinkContext.initModelDownlinks = function (modelDownlinkContext: ModelDownlinkContext): void {
  let modelDownlinkContextPrototype: ModelDownlinkContextPrototype | null = Object.getPrototypeOf(modelDownlinkContext) as ModelDownlinkContextPrototype;
  do {
    if (Object.prototype.hasOwnProperty.call(modelDownlinkContextPrototype, "modelDownlinkConstructors")) {
      const modelDownlinkConstructors = modelDownlinkContextPrototype.modelDownlinkConstructors!;
      for (const downlinkName in modelDownlinkConstructors) {
        const modelDownlinkConstructor = modelDownlinkConstructors[downlinkName]!;
        if (modelDownlinkConstructor.prototype.consume !== void 0 && !modelDownlinkContext.hasModelDownlink(downlinkName)) {
          const modelDownlink = new modelDownlinkConstructor(modelDownlinkContext, downlinkName);
          modelDownlinkContext.setModelDownlink(downlinkName, modelDownlink);
        }
      }
    }
    modelDownlinkContextPrototype = Object.getPrototypeOf(modelDownlinkContextPrototype);
  } while (modelDownlinkContextPrototype !== null);
};

ModelDownlinkContext.getModelDownlinkConstructor = function (downlinkName: string, modelDownlinkContextPrototype: ModelDownlinkContextPrototype | null): ModelDownlinkConstructor<ModelDownlinkContext> | null {
  while (modelDownlinkContextPrototype !== null) {
    if (Object.prototype.hasOwnProperty.call(modelDownlinkContextPrototype, "modelDownlinkConstructors")) {
      const modelDownlinkConstructor = modelDownlinkContextPrototype.modelDownlinkConstructors![downlinkName];
      if (modelDownlinkConstructor !== void 0) {
        return modelDownlinkConstructor;
      }
    }
    modelDownlinkContextPrototype = Object.getPrototypeOf(modelDownlinkContextPrototype);
  }
  return null;
};

ModelDownlinkContext.decorateModelDownlink = function (modelDownlinkConstructor: ModelDownlinkConstructor<ModelDownlinkContext>,
                                                       target: Object, propertyKey: string | symbol): void {
  const modelDownlinkContextPrototype = target as ModelDownlinkContextPrototype;
  if (!Object.prototype.hasOwnProperty.call(modelDownlinkContextPrototype, "modelDownlinkConstructors")) {
    modelDownlinkContextPrototype.modelDownlinkConstructors = {};
  }
  modelDownlinkContextPrototype.modelDownlinkConstructors![propertyKey.toString()] = modelDownlinkConstructor;
  Object.defineProperty(target, propertyKey, {
    get: function (this: ModelDownlinkContext): ModelDownlink<ModelDownlinkContext> {
      let modelDownlink = this.getModelDownlink(propertyKey.toString());
      if (modelDownlink === null) {
        modelDownlink = new modelDownlinkConstructor(this, propertyKey.toString());
        this.setModelDownlink(propertyKey.toString(), modelDownlink);
      }
      return modelDownlink;
    },
    configurable: true,
    enumerable: true,
  });
};
