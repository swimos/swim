// Copyright 2015-2020 SWIM.AI inc.
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
import {CanvasContext} from "@swim/render";
import {
  MemberAnimator,
  RenderedViewInit,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {AxisView} from "../axis/AxisView";
import {AnyDatumView, DatumView} from "../data/DatumView";
import {PlotType, AnyPlotView, PlotView} from "./PlotView";
import {PlotViewController} from "./PlotViewController";

export type AnyBubblePlotView<X, Y> = BubblePlotView<X, Y> | BubblePlotViewInit<X, Y>;

export interface BubblePlotViewInit<X, Y> extends RenderedViewInit, FillViewInit, StrokeViewInit {
  xAxis?: AxisView<X>;
  yAxis?: AxisView<Y>;

  data?: AnyDatumView<X, Y>[];

  radius?: AnyLength;

  font?: AnyFont;
  textColor?: AnyColor;
}

export class BubblePlotView<X, Y> extends PlotView<X, Y> implements FillView, StrokeView {
  constructor() {
    super();
    this.radius.setState(Length.px(5));
    this.fill.setState(Color.black());
  }

  get viewController(): PlotViewController<X, Y, BubblePlotView<X, Y>> | null {
    return this._viewController;
  }

  get type(): PlotType {
    return "bubble";
  }

  @MemberAnimator(Length)
  radius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color)
  fill: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color)
  stroke: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length)
  strokeWidth: MemberAnimator<this, Length, AnyLength>;

  getDatum(key: string): DatumView<X, Y> | undefined {
    const datum = this.getChildView(key);
    return datum instanceof DatumView ? datum : void 0;
  }

  insertDatum(datum: AnyDatumView<X, Y>, key?: string): DatumView<X, Y> {
    datum = DatumView.fromAny(datum);
    this.appendChildView(datum, key);
    return datum;
  }

  insertData(...data: AnyDatumView<X, Y>[]): void {
    for (let i = 0, n = arguments.length; i < n; i += 1) {
      this.insertDatum(arguments[i]);
    }
  }

  removeDatum(key: string): DatumView<X, Y> | null {
    const datum = this.getChildView(key);
    if (datum instanceof DatumView) {
      datum.remove();
      return datum;
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
      if (p instanceof DatumView) {
        context.beginPath();
        const r = p.r.value || radius;
        context.arc(p.xCoord, p.yCoord, r.pxValue(size), 0, 2 * Math.PI);
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

  static fromAny<X, Y>(plot: AnyBubblePlotView<X, Y>): BubblePlotView<X, Y>;
  static fromAny<X, Y>(plot: AnyPlotView<X, Y>): PlotView<X, Y>;
  static fromAny<X, Y>(plot: AnyPlotView<X, Y> | BubblePlotViewInit<X, Y>): PlotView<X, Y> {
    if (plot instanceof BubblePlotView) {
      return plot;
    } else if (plot instanceof PlotView) {
      // error
    } else if (typeof plot === "object" && plot !== null) {
      plot = plot as BubblePlotViewInit<X, Y>;
      const view = new BubblePlotView<X, Y>();

      if (plot.xAxis !== void 0) {
        view.xAxis(plot.xAxis);
      }
      if (plot.yAxis !== void 0) {
        view.yAxis(plot.yAxis);
      }

      const data = plot.data;
      if (data !== void 0) {
        for (let i = 0, n = data.length; i < n; i += 1) {
          view.insertDatum(data[i]);
        }
      }

      if (plot.radius !== void 0) {
        view.radius(plot.radius);
      }
      if (plot.fill !== void 0) {
        view.fill(plot.fill);
      }
      if (plot.stroke !== void 0) {
        view.stroke(plot.stroke);
      }
      if (plot.strokeWidth !== void 0) {
        view.strokeWidth(plot.strokeWidth);
      }

      if (plot.font !== void 0) {
        view.font(plot.font);
      }
      if (plot.textColor !== void 0) {
        view.textColor(plot.textColor);
      }

      if (plot.hidden !== void 0) {
        view.setHidden(plot.hidden);
      }
      if (plot.culled !== void 0) {
        view.setCulled(plot.culled);
      }

      return view;
    }
    throw new TypeError("" + plot);
  }
}
PlotView.Bubble = BubblePlotView;
