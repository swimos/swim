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
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont} from "@swim/font";
import {ContinuousScale} from "@swim/scale";
import {CanvasRenderer, CanvasContext} from "@swim/render";
import {ViewAnimator, GraphicsViewInit, GraphicsView, StrokeViewInit, StrokeView} from "@swim/view";
import {AnyDataPointView, DataPointView} from "../data/DataPointView";
import {PlotView} from "./PlotView";
import {PlotViewController} from "./PlotViewController";
import {SeriesPlotHitMode, SeriesPlotType, AnySeriesPlotView, SeriesPlotView} from "./SeriesPlotView";

export type AnyLinePlotView<X, Y> = LinePlotView<X, Y> | LinePlotViewInit<X, Y>;

export interface LinePlotViewInit<X, Y> extends GraphicsViewInit, StrokeViewInit {
  xScale?: ContinuousScale<X, number>;
  yScale?: ContinuousScale<Y, number>;

  data?: AnyDataPointView<X, Y>[];

  hitMode?: SeriesPlotHitMode;
  hitWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;
}

export class LinePlotView<X, Y> extends SeriesPlotView<X, Y> implements StrokeView {
  /** @hidden */
  _hitWidth: number;

  constructor() {
    super();
    this._hitWidth = 5;
  }

  get viewController(): PlotViewController<X, Y, LinePlotView<X, Y>> | null {
    return this._viewController;
  }

  get plotType(): SeriesPlotType {
    return "line";
  }

  @ViewAnimator(Color, {value: Color.black()})
  stroke: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Length, {value: Length.px(1)})
  strokeWidth: ViewAnimator<this, Length, AnyLength>;

  hitWidth(): number;
  hitWidth(hitWidth: number): this;
  hitWidth(hitWidth?: number): number | this {
    if (hitWidth === void 0) {
      return this._hitWidth;
    } else {
      this._hitWidth = hitWidth;
      return this;
    }
  }

  protected renderPlot(context: CanvasContext, frame: BoxR2): void {
    const data = this._data;
    const n = data.size;

    const stroke = this.stroke.value!;
    const strokeWidth = this.strokeWidth.value!.pxValue(Math.min(frame.width, frame.height));
    const gradientStops = this._gradientStops;
    let gradient: CanvasGradient | undefined;

    let x0: number;
    let x1: number;
    let dx: number;
    if (n > 0) {
      const p0 = data.firstValue()!;
      const p1 = data.lastValue()!;
      x0 = p0._xCoord;
      x1 = p1._xCoord;
      dx = x1 - x0;
      if (gradientStops !== 0) {
        gradient = context.createLinearGradient(x0, 0, x1, 0);
      }
    } else {
      x0 = NaN;
      x1 = NaN;
      dx = NaN;
    }

    context.beginPath();
    let i = 0;
    data.forEach(function (x: X, p: DataPointView<X, Y>): void {
      const xCoord = p._xCoord;
      const yCoord = p._yCoord;
      if (i === 0) {
        context.moveTo(xCoord, yCoord);
      } else {
        context.lineTo(xCoord, yCoord);
      }
      if (gradient !== void 0 && p.isGradientStop()) {
        let color = p.color.value || stroke;
        const opacity = p.opacity.value;
        if (typeof opacity === "number") {
          color = color.alpha(opacity);
        }
        const offset = (xCoord - x0) / (dx || 1);
        gradient!.addColorStop(offset, color.toString());
      }
      i += 1;
    }, this);

    context.strokeStyle = gradient !== void 0 ? gradient : stroke.toString();
    context.lineWidth = strokeWidth;
    context.stroke();
  }

  protected hitTestPlot(x: number, y: number, renderer: CanvasRenderer): GraphicsView | null {
    const context = renderer.context;
    let hitWidth = this._hitWidth;
    const strokeWidth = this.strokeWidth.value;
    if (strokeWidth !== void 0) {
      const frame = this.viewFrame;
      const size = Math.min(frame.width, frame.height);
      hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
    }

    context.beginPath();
    let i = 0;
    this._data.forEach(function (x: X, p: DataPointView<X, Y>): void {
      const xCoord = p._xCoord;
      const yCoord = p._yCoord;
      if (i === 0) {
        context.moveTo(xCoord, yCoord);
      } else {
        context.lineTo(xCoord, yCoord);
      }
      i += 1;
    }, this);

    context.lineWidth = hitWidth;
    if (context.isPointInStroke(x, y)) {
      if (this._hitMode === "plot") {
        return this;
      } else if (this._hitMode === "data") {
        return this.hitTestDomain(x, y, renderer);
      }
    }
    return null;
  }

  static fromAny<X, Y>(plot: AnySeriesPlotView<X, Y>): LinePlotView<X, Y> {
    if (plot instanceof LinePlotView) {
      return plot;
    } else if (typeof plot === "object" && plot !== null) {
      return LinePlotView.fromInit(plot as LinePlotViewInit<X, Y>);
    }
    throw new TypeError("" + plot);
  }

  static fromInit<X, Y>(init: LinePlotViewInit<X, Y>): LinePlotView<X, Y> {
    const view = new LinePlotView<X, Y>();

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
    if (init.hitWidth !== void 0) {
      view.hitWidth(init.hitWidth);
    }

    if (init.stroke !== void 0) {
      view.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      view.strokeWidth(init.strokeWidth);
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
PlotView.Line = LinePlotView;
