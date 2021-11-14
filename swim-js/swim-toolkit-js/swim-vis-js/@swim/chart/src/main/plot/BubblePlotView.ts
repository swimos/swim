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

import type {Class} from "@swim/util";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import type {CanvasContext, FillViewInit, FillView, StrokeViewInit, StrokeView} from "@swim/graphics";
import {ScatterPlotViewInit, ScatterPlotView} from "./ScatterPlotView";
import type {BubblePlotViewObserver} from "./BubblePlotViewObserver";

/** @public */
export type AnyBubblePlotView<X = unknown, Y = unknown> = BubblePlotView<X, Y> | BubblePlotViewInit<X, Y>;

/** @public */
export interface BubblePlotViewInit<X = unknown, Y = unknown> extends ScatterPlotViewInit<X, Y>, FillViewInit, StrokeViewInit {
  radius?: AnyLength;
}

/** @public */
export class BubblePlotView<X = unknown, Y = unknown> extends ScatterPlotView<X, Y> implements FillView, StrokeView {
  override readonly observerType?: Class<BubblePlotViewObserver<X, Y>>;

  @ThemeAnimator<BubblePlotView<X, Y>, Length | null, AnyLength | null>({
    type: Length,
    state: Length.px(5),
    updateFlags: View.NeedsRender,
    willSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.callObservers("viewWillSetPlotRadius", newRadius, oldRadius, this.owner);
    },
    didSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.callObservers("viewDidSetPlotRadius", newRadius, oldRadius, this.owner);
    },
  })
  readonly radius!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator<BubblePlotView<X, Y>, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    look: Look.accentColor,
    updateFlags: View.NeedsRender,
    willSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.callObservers("viewWillSetPlotFill", newFill, oldFill, this.owner);
    },
    didSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.callObservers("viewDidSetPlotFill", newFill, oldFill, this.owner);
    },
  })
  readonly fill!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Color, state: null, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Length, state: null, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  protected renderPlot(context: CanvasContext, frame: R2Box): void {
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.getValueOr(Length.zero());
    const fill = this.fill.value;
    const stroke = this.stroke.value;
    const strokeWidth = this.strokeWidth.value;

    // save
    const contextFillStyle = context.fillStyle;
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    const dataPointViews = this.dataPoints.views;
    for (const viewId in dataPointViews) {
      const p = dataPointViews[viewId]!;
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

    // restore
    context.fillStyle = contextFillStyle;
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }

  override init(init: BubblePlotViewInit<X, Y>): void {
    super.init(init);
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
}
