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

import {R2Box} from "@swim/math";
import type {ViewportIdiom} from "../viewport/ViewportIdiom";
import {Viewport} from "../viewport/Viewport";

/** @public */
export interface ViewContext {
  readonly updateTime: number;

  readonly viewportIdiom: ViewportIdiom;

  readonly viewport: Viewport;

  readonly viewFrame: R2Box;
}

/** @public */
export const ViewContext = (function () {
  const ViewContext = {} as {
    current: ViewContext | null;
    create(): ViewContext;
  };

  ViewContext.current = null;

  ViewContext.create = function (): ViewContext {
    const viewport = Viewport.detect();
    const viewFrame = new R2Box(0, 0, viewport.width, viewport.height);
    return {
      updateTime: performance.now(),
      viewportIdiom: "unspecified",
      viewport: viewport,
      viewFrame: viewFrame,
    };
  };

  return ViewContext;
})();
