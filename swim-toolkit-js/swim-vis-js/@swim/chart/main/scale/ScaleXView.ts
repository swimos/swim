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

import {ContinuousScale} from "@swim/scale";
import {Tween} from "@swim/transition";
import {GraphicsView} from "@swim/view";
import {ScaleView} from "./ScaleView";

export interface ScaleXView<X = unknown> extends GraphicsView {
  xScale(): ContinuousScale<X, number> | undefined;
  xScale(xScale: ContinuousScale<X, number> | undefined,
         tween?: Tween<ContinuousScale<X, number>>): this;

  xDomain(): readonly [X, X] | undefined;
  xDomain(xDomain: readonly [X, X] | undefined, tween?: Tween<any>): this;
  xDomain(xMin: X, xMax: X, tween: Tween<any>): this;

  xRange(): readonly [number, number] | undefined;

  xDataDomain(): readonly [X, X] | undefined;

  xDataRange(): readonly [number, number] | undefined;
}

/** @hidden */
export const ScaleXView = {
  /** @hidden */
  is<X>(object: unknown): object is ScaleXView<X> {
    if (typeof object === "object" && object !== null) {
      const view = object as ScaleXView<X>;
      return view instanceof ScaleView
          || view instanceof GraphicsView && "xScale" in view;
    }
    return false;
  },
}
