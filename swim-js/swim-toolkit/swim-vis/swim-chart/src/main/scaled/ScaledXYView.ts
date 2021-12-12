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

import type {Class} from "@swim/util";
import {GraphicsView} from "@swim/graphics";
import type {ScaledXView} from "./ScaledXView";
import type {ScaledYView} from "./ScaledYView";
import type {ScaledXYViewObserver} from "./ScaledXYViewObserver";
import {ScaledView} from "../"; // forward import

/** @public */
export interface ScaledXYView<X = unknown, Y = unknown> extends GraphicsView, ScaledXView<X>, ScaledYView<Y> {
  /** @override */
  readonly observerType?: Class<ScaledXYViewObserver<X, Y>>;
}

/** @public */
export const ScaledXYView = (function () {
  const ScaledXYView = {} as {
    is<X, Y>(object: unknown): object is ScaledXYView<X, Y>;
  };

  ScaledXYView.is = function <X, Y>(object: unknown): object is ScaledXYView<X, Y> {
    if (typeof object === "object" && object !== null) {
      const view = object as ScaledXYView<X, Y>;
      return view instanceof ScaledView
          || view instanceof GraphicsView && "xScale" in view && "yScale" in view;
    }
    return false;
  };

  return ScaledXYView;
})();
