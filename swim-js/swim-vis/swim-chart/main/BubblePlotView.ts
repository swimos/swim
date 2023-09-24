// Copyright 2015-2023 Nstream, inc.
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
import {Length} from "@swim/math";
import type {R2Box} from "@swim/math";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import type {CanvasContext} from "@swim/graphics";
import type {FillView} from "@swim/graphics";
import type {StrokeView} from "@swim/graphics";
import type {ScatterPlotViewObserver} from "./ScatterPlotView";
import {ScatterPlotView} from "./ScatterPlotView";

/** @public */
export interface BubblePlotViewObserver<X = unknown, Y = unknown, V extends BubblePlotView<X, Y> = BubblePlotView<X, Y>> extends ScatterPlotViewObserver<X, Y, V> {
  viewDidSetRadius?(radius: Length | null, view: V): void;

  viewDidSetFill?(fill: Color | null, view: V): void;
}

/** @public */
export class BubblePlotView<X = unknown, Y = unknown> extends ScatterPlotView<X, Y> implements FillView, StrokeView {
  declare readonly observerType?: Class<BubblePlotViewObserver<X, Y>>;

  @ThemeAnimator({
    valueType: Length,
    value: Length.px(5),
    updateFlags: View.NeedsRender,
    didSetValue(radius: Length | null): void {
      this.owner.callObservers("viewDidSetRadius", radius, this.owner);
    },
  })
  readonly radius!: ThemeAnimator<this, Length | null>;

  @ThemeAnimator({
    valueType: Color,
    value: null,
    look: Look.accentColor,
    updateFlags: View.NeedsRender,
    didSetValue(fill: Color | null): void {
      this.owner.callObservers("viewDidSetFill", fill, this.owner);
    },
  })
  readonly fill!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Color, value: null, updateFlags: View.NeedsRender})
  readonly stroke!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Length, value: null, updateFlags: View.NeedsRender})
  readonly strokeWidth!: ThemeAnimator<this, Length | null>;

  protected renderPlot(context: CanvasContext, frame: R2Box): void {
    const size = Math.min(frame.width, frame.height);
    const radius = this.radius.getValueOr(Length.zero());
    const opacity = this.opacity.value;
    const fill = this.fill.value;
    const stroke = this.stroke.value;
    const strokeWidth = this.strokeWidth.value;

    // save
    const contextGlobalAlpha = context.globalAlpha;
    const contextFillStyle = context.fillStyle;
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    if (opacity !== void 0) {
      context.globalAlpha = opacity;
    }

    const dataPointViews = this.dataPoints.views;
    for (const viewId in dataPointViews) {
      const p = dataPointViews[viewId]!;
      context.beginPath();
      const r = p.radius.getValueOr(radius).pxValue(size);
      context.arc(p.xCoord, p.yCoord, r, 0, 2 * Math.PI);
      let fillColor = ThemeAnimator.tryValueOr(p, "color", fill);
      if (fillColor !== null) {
        const opacity = ThemeAnimator.tryValue(p, "opacity");
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
    context.globalAlpha = contextGlobalAlpha;
    context.fillStyle = contextFillStyle;
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}
