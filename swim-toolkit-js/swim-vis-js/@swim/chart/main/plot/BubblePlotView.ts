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

import {AnyLength, Length, BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ViewAnimator} from "@swim/view";
import type {GraphicsViewController, CanvasContext, FillViewInit, FillView, StrokeViewInit, StrokeView} from "@swim/graphics";
import {ScatterPlotType, ScatterPlotViewInit, ScatterPlotView} from "./ScatterPlotView";
import type {BubblePlotViewObserver} from "./BubblePlotViewObserver";

export type AnyBubblePlotView<X, Y> = BubblePlotView<X, Y> | BubblePlotViewInit<X, Y>;

export interface BubblePlotViewInit<X, Y> extends ScatterPlotViewInit<X, Y>, FillViewInit, StrokeViewInit {
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

  declare readonly viewController: GraphicsViewController<BubblePlotView<X, Y>> & BubblePlotViewObserver<X, Y> | null;

  declare readonly viewObservers: ReadonlyArray<BubblePlotViewObserver<X, Y>>;

  get plotType(): ScatterPlotType {
    return "bubble";
  }

  @ViewAnimator({type: Length, state: Length.px(5)})
  declare radius: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Color, state: null, look: Look.accentColor})
  declare fill: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Color, state: null})
  declare stroke: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Length, state: null})
  declare strokeWidth: ViewAnimator<this, Length | null, AnyLength | null>;

  protected renderPlot(context: CanvasContext, frame: BoxR2): void {
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.getValueOr(Length.zero());
    const fill = this.fill.value;
    const stroke = this.stroke.value;
    const strokeWidth = this.strokeWidth.value;

    const dataPointFasteners = this.dataPointFasteners;
    for (let i = 0, n = dataPointFasteners.length; i < n; i += 1) {
      const p = dataPointFasteners[i]!.view!;
      context.beginPath();
      const r = p.radius.getValueOr(radius).pxValue(size);
      context.arc(p.xCoord, p.yCoord, r, 0, 2 * Math.PI);
      let fillColor = p.color.getValueOr(fill);
      if (fillColor !== null) {
        const opacity = p.opacity.value;
        if (opacity !== void 0) {
          fillColor = fillColor.alpha(opacity);
        }
        context.fillStyle = fillColor.toString();
        context.fill();
      }
      if (stroke !== null) {
        if (strokeWidth !== null) {
          context.lineWidth = strokeWidth.pxValue(size);
        }
        context.strokeStyle = stroke.toString();
        context.stroke();
      }
    }
  }

  static create<X, Y>(): BubblePlotView<X, Y> {
    return new BubblePlotView<X, Y>();
  }

  static fromInit<X, Y>(init: BubblePlotViewInit<X, Y>): BubblePlotView<X, Y> {
    const view = new BubblePlotView<X, Y>();
    view.initView(init);
    return view;
  }

  static fromAny<X, Y>(value: AnyBubblePlotView<X, Y>): BubblePlotView<X, Y> {
    if (value instanceof BubblePlotView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
