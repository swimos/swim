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
import {Affinity, Property} from "@swim/fastener";
import {AnyLength, Length, R2Box} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {View, ViewRef} from "@swim/view";
import type {GraphicsView, CanvasContext, CanvasRenderer, StrokeViewInit, StrokeView} from "@swim/graphics";
import type {DataPointView} from "../data/DataPointView";
import {SeriesPlotViewInit, SeriesPlotView} from "./SeriesPlotView";
import type {LinePlotViewObserver} from "./LinePlotViewObserver";

/** @public */
export type AnyLinePlotView<X = unknown, Y = unknown> = LinePlotView<X, Y> | LinePlotViewInit<X, Y>;

/** @public */
export interface LinePlotViewInit<X = unknown, Y = unknown> extends SeriesPlotViewInit<X, Y>, StrokeViewInit {
  hitWidth?: number;
}

/** @public */
export class LinePlotView<X = unknown, Y = unknown> extends SeriesPlotView<X, Y> implements StrokeView {
  override readonly observerType?: Class<LinePlotViewObserver<X, Y>>;

  @ThemeAnimator<LinePlotView<X, Y>, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    look: Look.accentColor,
    updateFlags: View.NeedsRender,
    willSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.callObservers("viewWillSetPlotStroke", newStroke, oldStroke, this.owner);
    },
    didSetValue(newStroke: Color | null, oldStroke: Color | null): void {
      this.owner.callObservers("viewDidSetPlotStroke", newStroke, oldStroke, this.owner);
    },
  })
  readonly stroke!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator<LinePlotView<X, Y>, Length | null, AnyLength | null>({
    type: Length,
    state: Length.px(1),
    updateFlags: View.NeedsRender,
    willSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      this.owner.callObservers("viewWillSetPlotStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
    didSetValue(newStrokeWidth: Length | null, oldStrokeWidth: Length | null): void {
      if (this.owner.xRangePadding.hasAffinity(Affinity.Intrinsic) || this.owner.yRangePadding.hasAffinity(Affinity.Intrinsic)) {
        const frame = this.owner.viewFrame;
        const size = Math.min(frame.width, frame.height);
        const strokeWidth = this.getValueOr(Length.zero()).pxValue(size);
        const strokeRadius = strokeWidth / 2;
        this.owner.xRangePadding.setState([strokeRadius, strokeRadius], Affinity.Intrinsic);
        this.owner.yRangePadding.setState([strokeRadius, strokeRadius], Affinity.Intrinsic);
      }
      this.owner.callObservers("viewDidSetPlotStrokeWidth", newStrokeWidth, oldStrokeWidth, this.owner);
    },
  })
  readonly strokeWidth!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @Property({type: Number, state: 5})
  readonly hitWidth!: Property<this, number>;

  protected renderPlot(context: CanvasContext, frame: R2Box): void {
    const size = Math.min(frame.width, frame.height);
    const stroke = this.stroke.getValueOr(Color.transparent());
    const strokeWidth = this.strokeWidth.getValueOr(Length.zero()).pxValue(size);
    const gradientStops = this.gradientStops;
    let gradient: CanvasGradient | null = null;

    let x0: number;
    let x1: number;
    let dx: number;
    const dataPointRefs = this.dataPointRefs;
    if (!dataPointRefs.isEmpty()) {
      const p0 = dataPointRefs.firstValue()!.view!;
      const p1 = dataPointRefs.lastValue()!.view!;
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
    type self = this;
    dataPointRefs.forEach(function (x: X, dataPointRef: ViewRef<self, DataPointView<X, Y>>): void {
      const p = dataPointRef.view!;
      const xCoord = p.xCoord;
      const yCoord = p.yCoord;
      if (i === 0) {
        context.moveTo(xCoord, yCoord);
      } else {
        context.lineTo(xCoord, yCoord);
      }
      if (gradient !== null && p.isGradientStop()) {
        let color = p.color.getValueOr(stroke);
        const opacity = p.opacity.value;
        if (opacity !== void 0) {
          color = color.alpha(opacity);
        }
        const offset = (xCoord - x0) / (dx || 1);
        gradient!.addColorStop(offset, color.toString());
      }
      i += 1;
    }, this);

      // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    context.lineWidth = strokeWidth;
    context.strokeStyle = gradient !== null ? gradient : stroke.toString();
    context.stroke();

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }

  protected hitTestPlot(x: number, y: number, renderer: CanvasRenderer): GraphicsView | null {
    const context = renderer.context;
    let hitWidth = this.hitWidth.state;
    const strokeWidth = this.strokeWidth.value;
    if (strokeWidth !== null) {
      const frame = this.viewFrame;
      const size = Math.min(frame.width, frame.height);
      hitWidth = Math.max(hitWidth, strokeWidth.pxValue(size));
    }

    context.beginPath();
    let i = 0;
    type self = this;
    this.dataPointRefs.forEach(function (x: X, dataPointRef: ViewRef<self, DataPointView<X, Y>>): void {
      const p = dataPointRef.view!;
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
      const hitMode = this.hitMode.state;
      if (hitMode === "plot") {
        return this;
      } else if (hitMode === "data") {
        return this.hitTestDomain(x, y, renderer);
      }
    }
    return null;
  }

  override init(init: LinePlotViewInit<X, Y>): void {
    super.init(init);
     if (init.hitWidth !== void 0) {
      this.hitWidth(init.hitWidth);
    }

    if (init.stroke !== void 0) {
      this.stroke(init.stroke);
    }
    if (init.strokeWidth !== void 0) {
      this.strokeWidth(init.strokeWidth);
    }
  }
}
