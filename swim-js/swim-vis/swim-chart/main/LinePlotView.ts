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
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {Length} from "@swim/math";
import type {R2Box} from "@swim/math";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import type {CanvasRenderer} from "@swim/graphics";
import type {StrokeView} from "@swim/graphics";
import type {DataPointView} from "./DataPointView";
import type {SeriesPlotViewObserver} from "./SeriesPlotView";
import {SeriesPlotView} from "./SeriesPlotView";

/** @public */
export interface LinePlotViewObserver<X = unknown, Y = unknown, V extends LinePlotView<X, Y> = LinePlotView<X, Y>> extends SeriesPlotViewObserver<X, Y, V> {
  viewDidSetStroke?(stroke: Color | null, view: V): void;

  viewDidSetStrokeWidth?(strokeWidth: Length | null, view: V): void;
}

/** @public */
export class LinePlotView<X = unknown, Y = unknown> extends SeriesPlotView<X, Y> implements StrokeView {
  declare readonly observerType?: Class<LinePlotViewObserver<X, Y>>;

  @ThemeAnimator({
    valueType: Color,
    value: null,
    look: Look.accentColor,
    updateFlags: View.NeedsRender,
    didSetValue(stroke: Color | null): void {
      this.owner.callObservers("viewDidSetStroke", stroke, this.owner);
    },
  })
  readonly stroke!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({
    valueType: Length,
    value: Length.px(1),
    updateFlags: View.NeedsRender,
    didSetValue(strokeWidth: Length | null): void {
      if (this.owner.xRangePadding.hasAffinity(Affinity.Intrinsic) || this.owner.yRangePadding.hasAffinity(Affinity.Intrinsic)) {
        const frame = this.owner.viewFrame;
        const size = Math.min(frame.width, frame.height);
        const strokeWidth = this.getValueOr(Length.zero()).pxValue(size);
        const strokeRadius = strokeWidth / 2;
        this.owner.xRangePadding.setIntrinsic([strokeRadius, strokeRadius]);
        this.owner.yRangePadding.setIntrinsic([strokeRadius, strokeRadius]);
      }
      this.owner.callObservers("viewDidSetStrokeWidth", strokeWidth, this.owner);
    },
  })
  readonly strokeWidth!: ThemeAnimator<this, Length | null>;

  @Property({valueType: Number, value: 5})
  readonly hitWidth!: Property<this, number>;

  protected renderPlot(context: CanvasContext, frame: R2Box): void {
    const size = Math.min(frame.width, frame.height);
    const opacity = this.opacity.value;
    const stroke = this.stroke.getValueOr(Color.transparent());
    const strokeWidth = this.strokeWidth.getValueOr(Length.zero()).pxValue(size);
    const gradientStops = this.gradientStops;
    let gradient: CanvasGradient | null = null;

    let x0: number;
    let x1: number;
    let dx: number;
    const dataPointViews = this.dataPointViews;
    if (!dataPointViews.isEmpty()) {
      const p0 = dataPointViews.firstValue()!;
      const p1 = dataPointViews.lastValue()!;
      x0 = p0.xCoord;
      x1 = p1.xCoord;
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
    dataPointViews.forEach(function (p: DataPointView<X, Y>): void {
      const xCoord = p.xCoord;
      const yCoord = p.yCoord;
      if (i === 0) {
        context.moveTo(xCoord, yCoord);
      } else {
        context.lineTo(xCoord, yCoord);
      }
      if (gradient !== null && p.isGradientStop()) {
        let color = ThemeAnimator.tryValueOr(p, "color", stroke);
        const opacity = ThemeAnimator.tryValue(p, "opacity");
        if (opacity !== void 0) {
          color = color.alpha(opacity);
        }
        const offset = (xCoord - x0) / (dx || 1);
        gradient!.addColorStop(offset, color.toString());
      }
      i += 1;
    }, this);

      // save
    const contextGlobalAlpha = context.globalAlpha;
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    if (opacity !== void 0) {
      context.globalAlpha = opacity;
    }
    context.lineWidth = strokeWidth;
    context.strokeStyle = gradient !== null ? gradient : stroke.toString();
    context.stroke();

    // restore
    context.globalAlpha = contextGlobalAlpha;
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }

  protected hitTestPlot(x: number, y: number, renderer: CanvasRenderer): GraphicsView | null {
    const context = renderer.context;
    let hitWidth = this.hitWidth.value;
    const strokeWidth = this.strokeWidth.value;
    if (strokeWidth !== null) {
      const frame = this.viewFrame;
      const size = Math.min(frame.width, frame.height);
      hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
    }

    context.beginPath();
    let i = 0;
    this.dataPointViews.forEach(function (p: DataPointView<X, Y>): void {
      const xCoord = p.xCoord;
      const yCoord = p.yCoord;
      if (i === 0) {
        context.moveTo(xCoord, yCoord);
      } else {
        context.lineTo(xCoord, yCoord);
      }
      i += 1;
    }, this);

    // save
    const contextLineWidth = context.lineWidth;

    context.lineWidth = hitWidth;
    const p = renderer.transform.transform(x, y);
    const pointInStroke = context.isPointInStroke(p.x, p.y);

    // restore
    context.lineWidth = contextLineWidth;

    if (pointInStroke) {
      const hitMode = this.hitMode.value;
      if (hitMode === "plot") {
        return this;
      } else if (hitMode === "data") {
        return this.hitTestDomain(x, y, renderer);
      }
    }
    return null;
  }
}
