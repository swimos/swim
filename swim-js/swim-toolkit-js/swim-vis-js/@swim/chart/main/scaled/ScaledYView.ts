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

import type {Domain, Range, AnyTiming, ContinuousScale} from "@swim/mapping";
import type {ViewAnimator} from "@swim/view";
import {GraphicsView, GraphicsViewController} from "@swim/graphics";
import type {ScaledYViewObserver} from "./ScaledYViewObserver";
import {ScaledView} from "../"; // forward import

export interface ScaledYView<Y> extends GraphicsView {
  readonly viewController: GraphicsViewController<ScaledYView<Y>> & ScaledYViewObserver<Y> | null;

  readonly viewObservers: ReadonlyArray<ScaledYViewObserver<Y>>;

  readonly yScale: ViewAnimator<this, ContinuousScale<Y, number> | null, string>;

  yDomain(): Domain<Y> | null;
  yDomain(yDomain: Domain<Y> | null, timing?: AnyTiming | boolean): this;
  yDomain(yMin: Y, yMax: Y, timing: AnyTiming | boolean): this;

  yRange(): Range<number> | null;

  yRangePadding(): readonly [number, number];

  readonly yDataDomain: Domain<Y> | null;

  readonly yDataRange: Range<number> | null;
}

export const ScaledYView = {} as {
  is<Y>(object: unknown): object is ScaledYView<Y>
};

ScaledYView.is = function <Y>(object: unknown): object is ScaledYView<Y> {
  if (typeof object === "object" && object !== null) {
    const view = object as ScaledYView<Y>;
    return view instanceof ScaledView
        || view instanceof GraphicsView && "yScale" in view;
  }
  return false;
};
