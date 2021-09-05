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
import {GraphicsView} from "@swim/graphics";
import type {ScaledXViewObserver} from "./ScaledXViewObserver";
import {ScaledView} from "../"; // forward import

export interface ScaledXView<X> extends GraphicsView {
  readonly viewObservers: ReadonlyArray<ScaledXViewObserver<X>>;

  readonly xScale: ViewAnimator<this, ContinuousScale<X, number> | null, string>;

  xDomain(): Domain<X> | null;
  xDomain(xDomain: Domain<X> | null, timing?: AnyTiming | boolean): this;
  xDomain(xMin: X, xMax: X, timing: AnyTiming | boolean): this;

  xRange(): Range<number> | null;

  xRangePadding(): readonly [number, number];

  readonly xDataDomain: Domain<X> | null;

  readonly xDataRange: Range<number> | null;
}

export const ScaledXView = {} as {
  is<X>(object: unknown): object is ScaledXView<X>;
};

ScaledXView.is = function <X>(object: unknown): object is ScaledXView<X> {
  if (typeof object === "object" && object !== null) {
    const view = object as ScaledXView<X>;
    return view instanceof ScaledView
        || view instanceof GraphicsView && "xScale" in view;
  }
  return false;
};
