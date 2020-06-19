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
import {CanvasContext} from "@swim/render";
import {
  ViewAnimator,
  GraphicsViewInit,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {AnyDataPointView, DataPointView} from "../data/DataPointView";
import {AnyPlotView, PlotView} from "./PlotView";
import {PlotViewController} from "./PlotViewController";
import {ScatterPlotType, ScatterPlotView} from "./ScatterPlotView";

export type AnyBubblePlotView<X, Y> = BubblePlotView<X, Y> | BubblePlotViewInit<X, Y>;

export interface BubblePlotViewInit<X, Y> extends GraphicsViewInit, FillViewInit, StrokeViewInit {
  xScale?: ContinuousScale<X, number>;
  yScale?: ContinuousScale<Y, number>;

  data?: AnyDataPointView<X, Y>[];

  radius?: AnyLength;

  font?: AnyFont;
  textColor?: AnyColor;
}

export class BubblePlotView<X, Y> extends ScatterPlotView<X, Y> implements FillView, StrokeView {
  get viewController(): PlotViewController<X, Y, BubblePlotView<X, Y>> | null {
    return this._viewController;
  }

  get plotType(): ScatterPlotType {
    return "bubble";
  }

  @ViewAnimator(Length, {value: Length.px(5)})
  radius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Color, {value: Color.black()})
  fill: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Color)
  stroke: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Length)
  strokeWidth: ViewAnimator<this, Length, AnyLength>;

  getDataPoint(key: string): DataPointView<X, Y> | undefined {
    const point = this.getChildView(key);
    return point instanceof DataPointView ? point : void 0;
  }

  insertDataPoint(point: AnyDataPointView<X, Y>, key?: string): DataPointView<X, Y> {
    point = DataPointView.fromAny(point);
    this.appendChildView(point, key);
    return point;
  }

  insertDataPoints(...points: AnyDataPointView<X, Y>[]): void {
    for (let i = 0, n = arguments.length; i < n; i += 1) {
      this.insertDataPoint(arguments[i]);
    }
  }

  removeDataPoint(key: string): DataPointView<X, Y> | null {
    const point = this.getChildView(key);
    if (point instanceof DataPointView) {
      point.remove();
      return point;
    } else {
      return null;
    }
  }

  protected renderPlot(context: CanvasContext, frame: BoxR2): void {
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.value!;
    const fill = this.fill.value;
    const stroke = this.stroke.value;
    const strokeWidth = this.strokeWidth.value;

    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const p = childViews[i];
      if (p instanceof DataPointView) {
        context.beginPath();
        const r = p.r.value || radius;
        context.arc(p._xCoord, p._yCoord, r.pxValue(size), 0, 2 * Math.PI);
        let fillStyle = p.color.value || fill;
        if (fillStyle !== void 0) {
          const opacity = p.opacity.value;
          if (typeof opacity === "number") {
            fillStyle = fillStyle.alpha(opacity);
          }
          context.fillStyle = fillStyle.toString();
          context.fill();
        }
        if (stroke !== void 0) {
          if (strokeWidth !== void 0) {
            context.lineWidth = strokeWidth.pxValue(size);
          }
          context.strokeStyle = stroke.toString();
          context.stroke();
        }
      }
    }
  }

  static fromAny<X, Y>(plot: AnyPlotView<X, Y>): BubblePlotView<X, Y> {
    if (plot instanceof BubblePlotView) {
      return plot;
    } else if (typeof plot === "object" && plot !== null) {
      return BubblePlotView.fromInit(plot as BubblePlotViewInit<X, Y>);
    }
    throw new TypeError("" + plot);
  }

  static fromInit<X, Y>(init: BubblePlotViewInit<X, Y>): BubblePlotView<X, Y> {
    const view = new BubblePlotView<X, Y>();

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

    if (init.radius !== void 0) {
      view.radius(init.radius);
    }
    if (init.fill !== void 0) {
      view.fill(init.fill);
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
PlotView.Bubble = BubblePlotView;
