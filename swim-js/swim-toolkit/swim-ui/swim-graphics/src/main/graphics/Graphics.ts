// Copyright 2015-2022 Swim.inc
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

import type {R2Box} from "@swim/math";
import type {GraphicsRenderer} from "./GraphicsRenderer";

/** @public */
export interface Graphics {
  render(renderer: GraphicsRenderer, frame: R2Box): void;
}

/** @public */
export const Graphics = (function () {
  const Graphics = {} as {
    is(object: unknown): object is Graphics;
  };

  Graphics.is = function (object: unknown): object is Graphics {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      const observable = object as Graphics;
      return "render" in observable;
    }
    return false;
  };

  return Graphics;
})();
