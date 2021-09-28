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

import type {Domain, Range, AnyTiming, ContinuousScale} from "@swim/util";
import type {AnyFont, AnyColor} from "@swim/style";
import type {ViewAnimator} from "@swim/view";
import {GraphicsViewInit, GraphicsView} from "@swim/graphics";
import type {AnyDataPointView} from "../data/DataPointView";
import type {ScaledXYView} from "../scaled/ScaledXYView";
import type {PlotViewObserver} from "./PlotViewObserver";
import {ScatterPlotView} from "../"; // forward import
import {SeriesPlotView} from "../"; // forward import
import {BubblePlotViewInit, BubblePlotView} from "../"; // forward import
import {LinePlotViewInit, LinePlotView} from "../"; // forward import
import {AreaPlotViewInit, AreaPlotView} from "../"; // forward import

export type PlotType = "bubble" | "line" | "area";

export type AnyPlotView<X, Y> = PlotView<X, Y> | PlotViewInit<X, Y> | PlotType;

export interface PlotViewInit<X, Y> extends GraphicsViewInit {
  plotType?: PlotType;

  xScale?: ContinuousScale<X, number>;
  yScale?: ContinuousScale<Y, number>;

  data?: AnyDataPointView<X, Y>[];

  font?: AnyFont;
  textColor?: AnyColor;
}

export interface PlotView<X, Y> extends GraphicsView, ScaledXYView<X, Y> {
  readonly viewObservers: ReadonlyArray<PlotViewObserver<X, Y>>;

  plotType: PlotType;

  readonly xScale: ViewAnimator<this, ContinuousScale<X, number> | null, string>;

  readonly yScale: ViewAnimator<this, ContinuousScale<Y, number> | null, string>;

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

export const PlotView = {} as {
  is<X, Y>(object: unknown): object is PlotView<X, Y>;

  fromType<X, Y>(type: PlotType): PlotView<X, Y>;

  fromInit<X, Y>(init: PlotViewInit<X, Y>): PlotView<X, Y>;

  fromAny<X, Y>(value: AnyPlotView<X, Y>): PlotView<X, Y>;
};

PlotView.is = function <X, Y>(object: unknown): object is PlotView<X, Y> {
  if (typeof object === "object" && object !== null) {
    const view = object as PlotView<X, Y>;
    return view instanceof ScatterPlotView
        || view instanceof SeriesPlotView
        || view instanceof GraphicsView && "plotType" in view;
  }
  return false;
};

PlotView.fromType = function <X, Y>(type: PlotType): PlotView<X, Y> {
  if (type === "bubble") {
    return new BubblePlotView();
  } else if (type === "line") {
    return new LinePlotView();
  } else if (type === "area") {
    return new AreaPlotView();
  }
  throw new TypeError("" + type);
};

PlotView.fromInit = function <X, Y>(init: PlotViewInit<X, Y>): PlotView<X, Y> {
  const type = init.plotType;
  if (type === "bubble") {
    return BubblePlotView.fromInit(init as BubblePlotViewInit<X, Y>);
  } else if (type === "line") {
    return LinePlotView.fromInit(init as LinePlotViewInit<X, Y>);
  } else if (type === "area") {
    return AreaPlotView.fromInit(init as AreaPlotViewInit<X, Y>);
  }
  throw new TypeError("" + init);
};

PlotView.fromAny = function <X, Y>(value: AnyPlotView<X, Y>): PlotView<X, Y> {
  if (this.is<X, Y>(value)) {
    return value;
  } else if (typeof value === "string") {
    return this.fromType(value);
  } else if (typeof value === "object" && value !== null) {
    return this.fromInit(value);
  }
  throw new TypeError("" + value);
};
