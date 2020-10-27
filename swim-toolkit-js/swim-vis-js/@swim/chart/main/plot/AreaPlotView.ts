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
import {CanvasRenderer, CanvasContext} from "@swim/render";
import {ViewAnimator} from "@swim/view";
import {GraphicsView, FillViewInit, FillView} from "@swim/graphics";
import {PlotView} from "./PlotView";
import {PlotViewController} from "./PlotViewController";
import {SeriesPlotType, SeriesPlotViewInit, SeriesPlotView} from "./SeriesPlotView";

export type AnyAreaPlotView<X, Y> = AreaPlotView<X, Y> | AreaPlotViewInit<X, Y>;

export interface AreaPlotViewInit<X, Y> extends SeriesPlotViewInit<X, Y>, FillViewInit {
  viewController?: PlotViewController<X, Y>;
}

export class AreaPlotView<X, Y> extends SeriesPlotView<X, Y> implements FillView {
  initView(init: AreaPlotViewInit<X, Y>): void {
    super.initView(init);
    if (init.fill !== void 0) {
      this.fill(init.fill);
    }
  }

  get plotType(): SeriesPlotType {
    return "area";
  }

  @ViewAnimator({type: Color, state: Color.black()})
  fill: ViewAnimator<this, Color, AnyColor>;

  protected renderPlot(context: CanvasContext, frame: BoxR2): void {
    const data = this._data;
    const n = data.size;

    const fill = this.fill.getValue();
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

  static fromInit<X, Y>(init: AreaPlotViewInit<X, Y>): AreaPlotView<X, Y> {
    const view = new AreaPlotView<X, Y>();
    view.initView(init);
    return view;
  }

  static fromAny<X, Y>(value: AnyAreaPlotView<X, Y>): AreaPlotView<X, Y> {
    if (value instanceof AreaPlotView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
PlotView.Area = AreaPlotView;
