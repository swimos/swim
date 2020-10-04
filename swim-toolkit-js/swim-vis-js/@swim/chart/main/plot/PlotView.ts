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

import {AnyColor} from "@swim/color";
import {AnyFont} from "@swim/font";
import {ContinuousScale} from "@swim/scale";
import {Tween} from "@swim/transition";
import {GraphicsViewInit, GraphicsView} from "@swim/view";
import {AnyDataPointView} from "../data/DataPointView";
import {ScaleXYView} from "../scale/ScaleXYView";
import {PlotViewObserver} from "./PlotViewObserver";
import {PlotViewController} from "./PlotViewController";
import {ScatterPlotView} from "./ScatterPlotView";
import {SeriesPlotView} from "./SeriesPlotView";
import {BubblePlotViewInit, BubblePlotView} from "./BubblePlotView";
import {LinePlotViewInit, LinePlotView} from "./LinePlotView";
import {AreaPlotViewInit, AreaPlotView} from "./AreaPlotView";

export type PlotType = "bubble" | "line" | "area";

export type AnyPlotView<X, Y> = PlotView<X, Y> | PlotViewInit<X, Y> | PlotType;

export interface PlotViewInit<X, Y> extends GraphicsViewInit {
  viewController?: PlotViewController<X, Y>;
  plotType?: PlotType;

  xScale?: ContinuousScale<X, number>;
  yScale?: ContinuousScale<Y, number>;

  data?: AnyDataPointView<X, Y>[];

  font?: AnyFont;
  textColor?: AnyColor;
}

export interface PlotView<X, Y> extends GraphicsView, ScaleXYView<X, Y> {
  // @ts-ignore
  declare readonly viewController: PlotViewController<X, Y> | null;

  // @ts-ignore
  declare readonly viewObservers: ReadonlyArray<PlotViewObserver<X, Y>>;

  plotType: PlotType;

  xScale(): ContinuousScale<X, number> | undefined;
  xScale(xScale: ContinuousScale<X, number> | undefined,
         tween?: Tween<ContinuousScale<X, number>>): this;

  yScale(): ContinuousScale<Y, number> | undefined;
  yScale(yScale: ContinuousScale<Y, number> | undefined,
         tween?: Tween<ContinuousScale<Y, number>>): this;

  xDomain(): readonly [X, X] | undefined;
  xDomain(xDomain: readonly [X, X] | undefined, tween?: Tween<any>): this;
  xDomain(xMin: X, xMax: X, tween: Tween<any>): this;

  yDomain(): readonly [Y, Y] | undefined;
  yDomain(yDomain: readonly [Y, Y] | undefined, tween?: Tween<any>): this;
  yDomain(yMin: Y, yMax: Y, tween: Tween<any>): this;

  xRange(): readonly [number, number] | undefined;

  yRange(): readonly [number, number] | undefined;

  xDataDomain(): readonly [X, X] | undefined;

  yDataDomain(): readonly [Y, Y] | undefined;

  xDataRange(): readonly [number, number] | undefined;

  yDataRange(): readonly [number, number] | undefined;
}

export const PlotView = {
  /** @hidden */
  is<X, Y>(object: unknown): object is PlotView<X, Y> {
    if (typeof object === "object" && object !== null) {
      const view = object as PlotView<X, Y>;
      return view instanceof PlotView.Scatter
          || view instanceof PlotView.Series
          || view instanceof GraphicsView && "plotType" in view;
    }
    return false;
  },

  fromAny<X, Y>(plot: AnyPlotView<X, Y>): PlotView<X, Y> {
    if (PlotView.is(plot)) {
      return plot;
    } else if (typeof plot === "string") {
      return PlotView.fromType(plot);
    } else if (typeof plot === "object" && plot !== null) {
      return PlotView.fromInit(plot);
    }
    throw new TypeError("" + plot);
  },

  fromType<X, Y>(type: PlotType): PlotView<X, Y> {
    if (type === "bubble") {
      return new PlotView.Bubble();
    } else if (type === "line") {
      return new PlotView.Line();
    } else if (type === "area") {
      return new PlotView.Area();
    }
    throw new TypeError("" + type);
  },

  fromInit<X, Y>(init: PlotViewInit<X, Y>): PlotView<X, Y> {
    const type = init.plotType;
    if (type === "bubble") {
      return PlotView.Bubble.fromInit(init as BubblePlotViewInit<X, Y>);
    } else if (type === "line") {
      return PlotView.Line.fromInit(init as LinePlotViewInit<X, Y>);
    } else if (type === "area") {
      return PlotView.Area.fromInit(init as AreaPlotViewInit<X, Y>);
    }
    throw new TypeError("" + init);
  },

  Scatter: void 0 as unknown as typeof ScatterPlotView,
  Series: void 0 as unknown as typeof SeriesPlotView,
  Bubble: void 0 as unknown as typeof BubblePlotView,
  Line: void 0 as unknown as typeof LinePlotView,
  Area: void 0 as unknown as typeof AreaPlotView,
};
