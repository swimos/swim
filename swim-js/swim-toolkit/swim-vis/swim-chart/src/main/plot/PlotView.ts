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
import type {Animator} from "@swim/component";
import type {AnyFont, AnyColor} from "@swim/style";
import type {GraphicsViewInit, GraphicsView} from "@swim/graphics";
import type {AnyDataPointView} from "../data/DataPointView";
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
export interface PlotViewDataPointExt<X = unknown, Y = unknown> {
  attachDataPointLabelView(labelView: GraphicsView): void;
  detachDataPointLabelView(labelView: GraphicsView): void;
}

/** @public */
export interface PlotView<X = unknown, Y = unknown> extends GraphicsView, ScaledXYView<X, Y> {
  /** @override */
  readonly observerType?: Class<PlotViewObserver<X, Y>>;

  readonly xScale: Animator<this, ContinuousScale<X, number> | null, string>;

  readonly yScale: Animator<this, ContinuousScale<Y, number> | null, string>;

  xDomain(): Domain<X> | null;
  xDomain(xDomain: Domain<X> | null, timing?: AnyTiming | boolean): this;
  xDomain(xMin: X, xMax: X, timing?: AnyTiming | boolean): this;

  yDomain(): Domain<Y> | null;
  yDomain(yDomain: Domain<Y> | null, timing?: AnyTiming | boolean): this;
  yDomain(yMin: Y, yMax: Y, timingtimingtiming?: AnyTiming | boolean): this;

  xRange(): Range<number> | null;

  yRange(): Range<number> | null;

  xRangePadding(): readonly [number, number];

  yRangePadding(): readonly [number, number];

  readonly xDataDomain: Domain<X> | null;

  readonly yDataDomain: Domain<Y> | null;

  readonly xDataRange: Range<number> | null;

  readonly yDataRange: Range<number> | null;
}
