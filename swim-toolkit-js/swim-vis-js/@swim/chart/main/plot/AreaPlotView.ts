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

import {BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont} from "@swim/font";
import {ContinuousScale} from "@swim/scale";
import {CanvasRenderer, CanvasContext} from "@swim/render";
import {ViewAnimator, GraphicsViewInit, GraphicsView, FillViewInit, FillView} from "@swim/view";
import {AnyDataPointView} from "../data/DataPointView";
import {PlotView} from "./PlotView";
import {PlotViewController} from "./PlotViewController";
import {SeriesPlotHitMode, SeriesPlotType, AnySeriesPlotView, SeriesPlotView} from "./SeriesPlotView";

export type AnyAreaPlotView<X, Y> = AreaPlotView<X, Y> | AreaPlotViewInit<X, Y>;

export interface AreaPlotViewInit<X, Y> extends GraphicsViewInit, FillViewInit {
  xScale?: ContinuousScale<X, number>;
  yScale?: ContinuousScale<Y, number>;

  data?: AnyDataPointView<X, Y>[];

  hitMode?: SeriesPlotHitMode;

  font?: AnyFont;
  textColor?: AnyColor;
}

export class AreaPlotView<X, Y> extends SeriesPlotView<X, Y> implements FillView {
  get viewController(): PlotViewController<X, Y, AreaPlotView<X, Y>> | null {
    return this._viewController;
  }

  get plotType(): SeriesPlotType {
    return "area";
  }

  @ViewAnimator(Color, {value: Color.black()})
  fill: ViewAnimator<this, Color, AnyColor>;

  protected renderPlot(context: CanvasContext, frame: BoxR2): void {
    const data = this._data;
    const n = data.size;

    const fill = this.fill.value!;
    const gradientStops = this._gradientStops;
    let gradient: CanvasGradient | undefined;

    context.beginPath();

    let x0: number;
    let x1: number;
    let dx: number;
    if (n > 0) {
      const p0 = data.firstValue()!;
      const p1 = data.lastValue()!;
      x0 = p0._xCoord;
      x1 = p1._xCoord;
      dx = x1 - x0;
      context.moveTo(p0._xCoord, p0._yCoord);
      if (gradientStops !== 0) {
        gradient = context.createLinearGradient(x0, 0, x1, 0);
        if (p0.isGradientStop()) {
          let color = p0.color.value || fill;
          const opacity = p0.opacity.value;
          if (typeof opacity === "number") {
            color = color.alpha(opacity);
          }
          gradient.addColorStop(0, color.toString());
        }
      }
    } else {
      x0 = NaN;
      x1 = NaN;
      dx = NaN;
    }

    const cursor = data.values();
    cursor.next();
    while (cursor.hasNext()) {
      const p = cursor.next().value!;
      context.lineTo(p._xCoord, p._yCoord);
      if (gradient !== void 0 && p.isGradientStop()) {
        let color = p.color.value || fill;
        const opacity = p.opacity.value;
        if (typeof opacity === "number") {
          color = color.alpha(opacity);
        }
        const offset = (p._xCoord - x0) / (dx || 1);
        gradient.addColorStop(offset, color.toString());
      }
    }
    while (cursor.hasPrevious()) {
      const p = cursor.previous().value!;
      context.lineTo(p._xCoord, p._y2Coord!);
    }
    if (n > 0) {
      context.closePath();
    }

    context.fillStyle = gradient !== void 0 ? gradient : fill.toString();
    context.fill();
  }

  protected hitTestPlot(x: number, y: number, renderer: CanvasRenderer): GraphicsView | null {
    const context = renderer.context;
    const data = this._data;
    const n = data.size;

    context.beginPath();
    const cursor = data.values();
    if (cursor.hasNext()) {
      const p = cursor.next().value!;
      context.moveTo(p._xCoord, p._yCoord);
    }
    while (cursor.hasNext()) {
      const p = cursor.next().value!;
      context.lineTo(p._xCoord, p._yCoord);
    }
    while (cursor.hasPrevious()) {
      const p = cursor.previous().value!;
      context.lineTo(p._xCoord, p._y2Coord!);
    }
    if (n > 0) {
      context.closePath();
    }

    if (context.isPointInPath(x, y)) {
      if (this._hitMode === "plot") {
        return this;
      } else if (this._hitMode === "data") {
        return this.hitTestDomain(x, y, renderer);
      }
    }
    return null;
  }

  static fromAny<X, Y>(plot: AnySeriesPlotView<X, Y>): AreaPlotView<X, Y> {
    if (plot instanceof AreaPlotView) {
      return plot;
    } else if (typeof plot === "object" && plot !== null) {
      return AreaPlotView.fromInit(plot as AreaPlotViewInit<X, Y>);
    }
    throw new TypeError("" + plot);
  }

  static fromInit<X, Y>(init: AreaPlotViewInit<X, Y>): AreaPlotView<X, Y> {
    const view = new AreaPlotView<X, Y>();

    if (init.xScale !== void 0) {
      view.xScale(init.xScale);
    }
    if (init.yScale !== void 0) {
      view.yScale(init.yScale);
    }

    const data = init.data;
    if (data !== void 0) {
      for (let i = 0, n = data.length; i < n; i += 1) {
        view.insertDataPoint(data[i]);
      }
    }

    if (init.hitMode !== void 0) {
      view.hitMode(init.hitMode);
    }

    if (init.fill !== void 0) {
      view.fill(init.fill);
    }

    if (init.font !== void 0) {
      view.font(init.font);
    }
    if (init.textColor !== void 0) {
      view.textColor(init.textColor);
    }

    if (init.hidden !== void 0) {
      view.setHidden(init.hidden);
    }
    if (init.culled !== void 0) {
      view.setCulled(init.culled);
    }

    return view;
  }
}
PlotView.Area = AreaPlotView;
