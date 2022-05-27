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

import type {Class, Domain, Range, AnyTiming, ContinuousScale} from "@swim/util";
import type {AnyFont, AnyColor} from "@swim/style";
import type {ThemeAnimator} from "@swim/theme";
import type {GraphicsViewInit, GraphicsView} from "@swim/graphics";
import type {AnyDataPointView} from "../data/DataPointView";
import type {ContinuousScaleAnimator} from "../scaled/ContinuousScaleAnimator";
import type {ScaledXYView} from "../scaled/ScaledXYView";
import type {PlotViewObserver} from "./PlotViewObserver";

/** @public */
export type AnyPlotView<X = unknown, Y = unknown> = PlotView<X, Y> | PlotViewInit<X, Y>;

/** @public */
export interface PlotViewInit<X = unknown, Y = unknown> extends GraphicsViewInit {
  xScale?: ContinuousScale<X, number>;
  yScale?: ContinuousScale<Y, number>;

  data?: AnyDataPointView<X, Y>[];

  font?: AnyFont;
  textColor?: AnyColor;
}

/** @public */
export interface PlotView<X = unknown, Y = unknown> extends GraphicsView, ScaledXYView<X, Y> {
  /** @override */
  readonly observerType?: Class<PlotViewObserver<X, Y>>;

  /** @override */
  readonly xScale: ContinuousScaleAnimator<this, X, number>;

  /** @override */
  readonly yScale: ContinuousScaleAnimator<this, Y, number>;

  /** @override */
  xDomain(): Domain<X> | null;
  xDomain(xDomain: Domain<X> | null, timing?: AnyTiming | boolean): this;
  xDomain(xMin: X, xMax: X, timing?: AnyTiming | boolean): this;

  /** @override */
  yDomain(): Domain<Y> | null;
  yDomain(yDomain: Domain<Y> | null, timing?: AnyTiming | boolean): this;
  yDomain(yMin: Y, yMax: Y, timingtimingtiming?: AnyTiming | boolean): this;

  /** @override */
  xRange(): Range<number> | null;

  /** @override */
  yRange(): Range<number> | null;

  /** @override */
  xRangePadding(): readonly [number, number];

  /** @override */
  yRangePadding(): readonly [number, number];

  /** @override */
  readonly xDataDomain: Domain<X> | null;

  /** @override */
  readonly yDataDomain: Domain<Y> | null;

  /** @override */
  readonly xDataRange: Range<number> | null;

  /** @override */
  readonly yDataRange: Range<number> | null;

  readonly opacity: ThemeAnimator<this, number | undefined>;
}
