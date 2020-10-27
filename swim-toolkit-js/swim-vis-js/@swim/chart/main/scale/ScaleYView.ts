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
import {GraphicsView} from "@swim/graphics";
import {ScaleView} from "./ScaleView";

export interface ScaleYView<Y = unknown> extends GraphicsView {
  yScale(): ContinuousScale<Y, number> | undefined;
  yScale(yScale: ContinuousScale<Y, number> | undefined,
         tween?: Tween<ContinuousScale<Y, number>>): this;

  yDomain(): readonly [Y, Y] | undefined;
  yDomain(yDomain: readonly [Y, Y] | undefined, tween?: Tween<any>): this;
  yDomain(yMin: Y, yMax: Y, tween: Tween<any>): this;

  yRange(): readonly [number, number] | undefined;

  yDataDomain(): readonly [Y, Y] | undefined;

  yDataRange(): readonly [number, number] | undefined;
}

/** @hidden */
export const ScaleYView = {
  /** @hidden */
  is<X>(object: unknown): object is ScaleYView<X> {
    if (typeof object === "object" && object !== null) {
      const view = object as ScaleYView<X>;
      return view instanceof ScaleView
          || view instanceof GraphicsView && "yScale" in view;
    }
    return false;
  },
}
