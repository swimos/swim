// Copyright 2015-2023 Swim.inc
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

import type {Uri} from "@swim/uri";
import type {WarpDownlinkModel} from "./WarpDownlinkModel";

/** @public */
export interface WarpDownlinkContext {
  hostUri(): Uri | null;

  nodeUri(): Uri | null;

  laneUri(): Uri | null;

  /** @internal */
  getDownlink(hostUri: Uri, nodeUri: Uri, laneUri: Uri): WarpDownlinkModel | null;

  /** @internal */
  openDownlink(downlink: WarpDownlinkModel): void;
}

/** @public */
export const WarpDownlinkContext = (function () {
  const WarpDownlinkContext = {} as {
    /** @internal */
    has<K extends keyof WarpDownlinkContext>(object: unknown, key: K): object is Required<Pick<WarpDownlinkContext, K>>;

    /** @internal */
    is(object: unknown): object is WarpDownlinkContext;
  };

  WarpDownlinkContext.has = function <K extends keyof WarpDownlinkContext>(object: unknown, key: K): object is Required<Pick<WarpDownlinkContext, K>> {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      return key in object;
    }
    return false;
  };

  WarpDownlinkContext.is = function (object: unknown): object is WarpDownlinkContext {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      const downlinkContext = object as WarpDownlinkContext;
      return "openDownlink" in downlinkContext;
    }
    return false;
  };

  return WarpDownlinkContext;
})();
