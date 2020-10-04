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
import {CanvasContext} from "@swim/render";
import {
  ViewAnimator,
  FillViewInit,
  FillView,
  StrokeViewInit,
  StrokeView,
} from "@swim/view";
import {DataPointView} from "../data/DataPointView";
import {PlotView} from "./PlotView";
import {PlotViewController} from "./PlotViewController";
import {ScatterPlotType, ScatterPlotViewInit, ScatterPlotView} from "./ScatterPlotView";

export type AnyBubblePlotView<X, Y> = BubblePlotView<X, Y> | BubblePlotViewInit<X, Y>;

export interface BubblePlotViewInit<X, Y> extends ScatterPlotViewInit<X, Y>, FillViewInit, StrokeViewInit {
  viewController?: PlotViewController<X, Y>;
  radius?: AnyLength;
}

export class BubblePlotView<X, Y> extends ScatterPlotView<X, Y> implements FillView, StrokeView {
  initView(init: BubblePlotViewInit<X, Y>): void {
    super.initView(init);
    if (init.radius !== void 0) {
      this.radius(init.radius);
    }
    if (init.fill !== void 0) {
      this.fill(init.fill);
    }
    if (init.stroke !== void 0) {
      this.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      this.strokeWidth(init.strokeWidth);
    }
  }

  get plotType(): ScatterPlotType {
    return "bubble";
  }

  @ViewAnimator({type: Length, state: Length.px(5)})
  radius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: Color.black()})
  fill: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator({type: Color})
  stroke: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewAnimator({type: Length})
  strokeWidth: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  protected renderPlot(context: CanvasContext, frame: BoxR2): void {
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.getValue();
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

  static fromAny<X, Y>(plot: AnyBubblePlotView<X, Y>): BubblePlotView<X, Y> {
    if (plot instanceof BubblePlotView) {
      return plot;
    } else if (typeof plot === "object" && plot !== null) {
      return BubblePlotView.fromInit(plot);
    }
    throw new TypeError("" + plot);
  }

  static fromInit<X, Y>(init: BubblePlotViewInit<X, Y>): BubblePlotView<X, Y> {
    const view = new BubblePlotView<X, Y>();
    view.initView(init);
    return view;
  }
}
PlotView.Bubble = BubblePlotView;
