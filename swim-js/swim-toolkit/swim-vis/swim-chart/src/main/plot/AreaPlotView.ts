// Copyright 2015-2023 Swim.inc
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
import type {R2Box} from "@swim/math";
import {AnyColor, Color} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView, CanvasContext, CanvasRenderer, FillViewInit, FillView} from "@swim/graphics";
import {SeriesPlotViewInit, SeriesPlotView} from "./SeriesPlotView";
import type {AreaPlotViewObserver} from "./AreaPlotViewObserver";

/** @public */
export type AnyAreaPlotView<X = unknown, Y = unknown> = AreaPlotView<X, Y> | AreaPlotViewInit<X, Y>;

/** @public */
export interface AreaPlotViewInit<X = unknown, Y = unknown> extends SeriesPlotViewInit<X, Y>, FillViewInit {
}

/** @public */
export class AreaPlotView<X = unknown, Y = unknown> extends SeriesPlotView<X, Y> implements FillView {
  override readonly observerType?: Class<AreaPlotViewObserver<X, Y>>;

  @ThemeAnimator<AreaPlotView<X, Y>["fill"]>({
    valueType: Color,
    value: null,
    look: Look.accentColor,
    updateFlags: View.NeedsRender,
    didSetValue(fill: Color | null): void {
      this.owner.callObservers("viewDidSetFill", fill, this.owner);
    },
  })
  readonly fill!: ThemeAnimator<this, Color | null, AnyColor | null>;

  protected renderPlot(context: CanvasContext, frame: R2Box): void {
    const opacity = this.opacity.value;
    const fill = this.fill.getValueOr(Color.transparent());
    const gradientStops = this.gradientStops;
    let gradient: CanvasGradient | null = null;

    context.beginPath();

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
      context.moveTo(p0.xCoord, p0.yCoord);
      if (gradientStops !== 0) {
        gradient = context.createLinearGradient(x0, 0, x1, 0);
        if (p0.isGradientStop()) {
          let color = p0.color.getValueOr(fill);
          const opacity = p0.opacity.value;
          if (opacity !== void 0) {
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

    const cursor = dataPointViews.values();
    cursor.next();
    while (cursor.hasNext()) {
      const p = cursor.next().value!;
      context.lineTo(p.xCoord, p.yCoord);
      if (gradient !== null && p.isGradientStop()) {
        let color = p.color.value || fill;
        const opacity = p.opacity.value;
        if (opacity !== void 0) {
          color = color.alpha(opacity);
        }
        const offset = (p.xCoord - x0) / (dx || 1);
        gradient.addColorStop(offset, color.toString());
      }
    }
    while (cursor.hasPrevious()) {
      const p = cursor.previous().value!;
      context.lineTo(p.xCoord, p.y2Coord!);
    }
    if (!dataPointViews.isEmpty()) {
      context.closePath();
    }

    // save
    const contextGlobalAlpha = context.globalAlpha;
    const contextFillStyle = context.fillStyle;

    if (opacity !== void 0) {
      context.globalAlpha = opacity;
    }
    context.fillStyle = gradient !== null ? gradient : fill.toString();
    context.fill();

    // restore
    context.globalAlpha = contextGlobalAlpha;
    context.fillStyle = contextFillStyle;
  }

  protected hitTestPlot(x: number, y: number, renderer: CanvasRenderer): GraphicsView | null {
    const context = renderer.context;
    const dataPointViews = this.dataPointViews;

    context.beginPath();
    const cursor = dataPointViews.values();
    if (cursor.hasNext()) {
      const p = cursor.next().value!;
      context.moveTo(p.xCoord, p.yCoord);
    }
    while (cursor.hasNext()) {
      const p = cursor.next().value!;
      context.lineTo(p.xCoord, p.yCoord);
    }
    while (cursor.hasPrevious()) {
      const p = cursor.previous().value!;
      context.lineTo(p.xCoord, p.y2Coord!);
    }
    if (!dataPointViews.isEmpty()) {
      context.closePath();
    }

    const p = renderer.transform.transform(x, y);
    if (context.isPointInPath(p.x, p.y)) {
      const hitMode = this.hitMode.value;
      if (hitMode === "plot") {
        return this;
      } else if (hitMode === "data") {
        return this.hitTestDomain(x, y, renderer);
      }
    }
    return null;
  }

  override init(init: AreaPlotViewInit<X, Y>): void {
    super.init(init);
    if (init.fill !== void 0) {
      this.fill(init.fill);
    }
  }
}
