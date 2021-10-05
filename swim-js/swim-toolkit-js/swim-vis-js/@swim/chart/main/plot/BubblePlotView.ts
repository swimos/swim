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
import {ScatterPlotType, ScatterPlotViewInit, ScatterPlotView} from "./ScatterPlotView";
import type {BubblePlotViewObserver} from "./BubblePlotViewObserver";

export type AnyBubblePlotView<X = unknown, Y = unknown> = BubblePlotView<X, Y> | BubblePlotViewInit<X, Y>;

export interface BubblePlotViewInit<X = unknown, Y = unknown> extends ScatterPlotViewInit<X, Y>, FillViewInit, StrokeViewInit {
  radius?: AnyLength;
}

export class BubblePlotView<X = unknown, Y = unknown> extends ScatterPlotView<X, Y> implements FillView, StrokeView {
  override readonly observerType?: Class<BubblePlotViewObserver<X, Y>>;

  override get plotType(): ScatterPlotType {
    return "bubble";
  }

  protected willSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetPlotRadius !== void 0) {
        observer.viewWillSetPlotRadius(newRadius, oldRadius, this);
      }
    }
  }

  protected onSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    // hook
  }

  protected didSetRadius(newRadius: Length | null, oldRadius: Length | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetPlotRadius !== void 0) {
        observer.viewDidSetPlotRadius(newRadius, oldRadius, this);
      }
    }
  }

  @ThemeAnimator<BubblePlotView<X, Y>, Length | null, AnyLength | null>({
    type: Length,
    state: Length.px(5),
    updateFlags: View.NeedsRender,
    willSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.willSetRadius(newRadius, oldRadius);
    },
    didSetValue(newRadius: Length | null, oldRadius: Length | null): void {
      this.owner.onSetRadius(newRadius, oldRadius);
      this.owner.didSetRadius(newRadius, oldRadius);
    },
  })
  readonly radius!: ThemeAnimator<this, Length | null, AnyLength | null>;

  protected willSetFill(newFill: Color | null, oldFill: Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetPlotFill !== void 0) {
        observer.viewWillSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  protected onSetFill(newFill: Color | null, oldFill: Color | null): void {
    // hook
  }

  protected didSetFill(newFill: Color | null, oldFill: Color | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetPlotFill !== void 0) {
        observer.viewDidSetPlotFill(newFill, oldFill, this);
      }
    }
  }

  @ThemeAnimator<BubblePlotView<X, Y>, Color | null, AnyColor | null>({
    type: Color,
    state: null,
    look: Look.accentColor,
    updateFlags: View.NeedsRender,
    willSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.willSetFill(newFill, oldFill);
    },
    didSetValue(newFill: Color | null, oldFill: Color | null): void {
      this.owner.onSetFill(newFill, oldFill);
      this.owner.didSetFill(newFill, oldFill);
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
