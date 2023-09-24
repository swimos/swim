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
import type {R2Box} from "@swim/math";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import type {GraphicsView} from "@swim/graphics";
import type {CanvasContext} from "@swim/graphics";
import type {CanvasRenderer} from "@swim/graphics";
import type {FillView} from "@swim/graphics";
import type {SeriesPlotViewObserver} from "./SeriesPlotView";
import type {DataPointView} from "./DataPointView";
import {SeriesPlotView} from "./SeriesPlotView";

/** @public */
export interface AreaPlotViewObserver<X = unknown, Y = unknown, V extends AreaPlotView<X, Y> = AreaPlotView<X, Y>> extends SeriesPlotViewObserver<X, Y, V> {
  viewDidSetFill?(fill: Color | null, view: V): void;
}

/** @public */
export class AreaPlotView<X = unknown, Y = unknown> extends SeriesPlotView<X, Y> implements FillView {
  declare readonly observerType?: Class<AreaPlotViewObserver<X, Y>>;

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
          let color = ThemeAnimator.tryValueOr(p0, "color", fill);
          const opacity = ThemeAnimator.tryValue(p0, "opacity");
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
      const p = cursor.next().value as DataPointView<X, Y>;
      context.lineTo(p.xCoord, p.yCoord);
      if (gradient !== null && p.isGradientStop()) {
        let color = ThemeAnimator.tryValueOr(p, "color", fill);
        const opacity = ThemeAnimator.tryValue(p, "opacity");
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
}
