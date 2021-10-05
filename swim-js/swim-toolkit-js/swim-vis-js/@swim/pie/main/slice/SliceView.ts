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

import {Class, Equivalent} from "@swim/util";
import {Affinity} from "@swim/fastener";
import {AnyLength, Length, AnyAngle, Angle, AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {ViewContextType, View, ViewFastener} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
  LayerView,
  CanvasContext,
  CanvasRenderer,
  FillView,
  Arc,
  TypesetView,
  AnyTextRunView,
  TextRunView,
} from "@swim/graphics";
import type {SliceViewObserver} from "./SliceViewObserver";

export type AnySliceView = SliceView | SliceViewInit;

export interface SliceViewInit extends GraphicsViewInit {
  value?: number;
  total?: number;
  center?: AnyR2Point;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  phaseAngle?: AnyAngle;
  padAngle?: AnyAngle;
  padRadius?: AnyLength | null;
  cornerRadius?: AnyLength;
  labelRadius?: AnyLength;
  sliceColor?: AnyColor;
  tickAlign?: number;
  tickRadius?: AnyLength;
  tickLength?: AnyLength;
  tickWidth?: AnyLength;
  tickPadding?: AnyLength;
  tickColor?: AnyColor;
  font?: AnyFont;
  textColor?: AnyColor;
  label?: GraphicsView | string;
  legend?: GraphicsView | string;
}

export class SliceView extends LayerView {
  override readonly observerType?: Class<SliceViewObserver>;

  protected willSetValue(newValue: number, oldValue: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetSliceValue !== void 0) {
        observer.viewWillSetSliceValue(newValue, oldValue, this);
      }
    }
  }

  protected onSetValue(newValue: number, oldValue: number): void {
    // hook
  }

  protected didSetValue(newValue: number, oldValue: number): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetSliceValue !== void 0) {
        observer.viewDidSetSliceValue(newValue, oldValue, this);
      }
    }
  }

  @ThemeAnimator<SliceView, number>({
    type: Number,
    state: 0,
    updateFlags: View.NeedsRender,
    willSetValue(newValue: number, oldValue: number): void {
      this.owner.willSetValue(newValue, oldValue);
    },
    didSetValue(newValue: number, oldValue: number): void {
      this.owner.onSetValue(newValue, oldValue);
      this.owner.didSetValue(newValue, oldValue);
    },
  })
  readonly value!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, state: 1, updateFlags: View.NeedsRender})
  readonly total!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: R2Point, inherits: true, state: R2Point.origin(), updateFlags: View.NeedsRender})
  readonly center!: ThemeAnimator<this, R2Point, AnyR2Point>;

  @ThemeAnimator({type: Length, inherits: true, state: Length.pct(3), updateFlags: View.NeedsRender})
  readonly innerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, inherits: true, state: Length.pct(25), updateFlags: View.NeedsRender})
  readonly outerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Angle, state: Angle.zero(), updateFlags: View.NeedsRender})
  readonly phaseAngle!: ThemeAnimator<this, Angle, AnyAngle>;

  @ThemeAnimator({type: Angle, inherits: true, state: Angle.deg(2), updateFlags: View.NeedsRender})
  readonly padAngle!: ThemeAnimator<this, Angle, AnyAngle>;

  @ThemeAnimator({type: Length, inherits: true, state: null, updateFlags: View.NeedsRender})
  readonly padRadius!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Length, inherits: true, state: Length.zero(), updateFlags: View.NeedsRender})
  readonly cornerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, inherits: true, state: Length.pct(50), updateFlags: View.NeedsRender})
  readonly labelRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Color, inherits: true, state: null, look: Look.accentColor, updateFlags: View.NeedsRender})
  readonly sliceColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Number, inherits: true, state: 0.5, updateFlags: View.NeedsRender})
  readonly tickAlign!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Length, inherits: true, state: Length.pct(30), updateFlags: View.NeedsRender})
  readonly tickRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, inherits: true, state: Length.pct(50), updateFlags: View.NeedsRender})
  readonly tickLength!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, inherits: true, state: Length.px(1), updateFlags: View.NeedsRender})
  readonly tickWidth!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, inherits: true, state: Length.px(2), updateFlags: View.NeedsRender})
  readonly tickPadding!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Color, inherits: true, state: null, look: Look.neutralColor, updateFlags: View.NeedsRender})
  readonly tickColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Font, inherits: true, state: null, updateFlags: View.NeedsRender})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({type: Color, inherits: true, state: null, look: Look.mutedColor, updateFlags: View.NeedsRender})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  protected initLabel(labelView: GraphicsView): void {
    // hook
  }

  protected attachLabel(labelView: GraphicsView): void {
    // hook
  }

  protected detachLabel(labelView: GraphicsView): void {
    // hook
  }

  protected willSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetSliceLabel !== void 0) {
        observer.viewWillSetSliceLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  protected onSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    if (oldLabelView !== null) {
      this.detachLabel(oldLabelView);
    }
    if (newLabelView !== null) {
      this.attachLabel(newLabelView);
      this.initLabel(newLabelView);
    }
  }

  protected didSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetSliceLabel !== void 0) {
        observer.viewDidSetSliceLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  @ViewFastener<SliceView, GraphicsView, AnyTextRunView>({
    key: true,
    type: TextRunView,
    child: true,
    fromAny(value: GraphicsView | AnyTextRunView): GraphicsView {
      if (value instanceof GraphicsView) {
        return value;
      } else if (typeof value === "string" && this.view instanceof TextRunView) {
        this.view.text(value);
        return this.view;
      } else {
        return TextRunView.fromAny(value);
      }
    },
    willSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetLabel(newLabelView, oldLabelView);
    },
    onSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetLabel(newLabelView, oldLabelView);
    },
    didSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.didSetLabel(newLabelView, oldLabelView);
    },
  })
  readonly label!: ViewFastener<this, GraphicsView, AnyTextRunView>;

  protected initLegend(legendView: GraphicsView | null): void {
    // hook
  }

  protected attachLegend(legendView: GraphicsView | null): void {
    // hook
  }

  protected detachLegend(legendView: GraphicsView | null): void {
    // hook
  }

  protected willSetLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewWillSetSliceLegend !== void 0) {
        observer.viewWillSetSliceLegend(newLegendView, oldLegendView, this);
      }
    }
  }

  protected onSetLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    if (oldLegendView !== null) {
      this.detachLegend(oldLegendView);
    }
    if (newLegendView !== null) {
      this.attachLegend(newLegendView);
      this.initLegend(newLegendView);
    }
  }

  protected didSetLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.viewDidSetSliceLegend !== void 0) {
        observer.viewDidSetSliceLegend(newLegendView, oldLegendView, this);
      }
    }
  }

  @ViewFastener<SliceView, GraphicsView, AnyTextRunView>({
    key: true,
    type: TextRunView,
    child: true,
    fromAny(value: GraphicsView | AnyTextRunView): GraphicsView {
      if (value instanceof GraphicsView) {
        return value;
      } else if (typeof value === "string" && this.view instanceof TextRunView) {
        this.view.text(value);
        return this.view;
      } else {
        return TextRunView.fromAny(value);
      }
    },
    willSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.willSetLegend(newLegendView, oldLegendView);
    },
    onSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetLegend(newLegendView, oldLegendView);
    },
    didSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.didSetLegend(newLegendView, oldLegendView);
    },
  })
  readonly legend!: ViewFastener<this, GraphicsView, AnyTextRunView>;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.center.recohere(viewContext.updateTime);
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.culled) {
      this.renderSlice(renderer.context, this.viewFrame);
    }
  }

  protected renderSlice(context: CanvasContext, frame: R2Box): void {
    const width = frame.width;
    const height = frame.height;
    const size = Math.min(width, height);
    const value = this.value.getValue();
    const total = this.total.getValue();
    const delta = total !== 0 ? value / total : 0;

    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.phaseAngle.getValue().rad();
    const sweepAngle = Angle.rad(2 * Math.PI * delta);
    const padAngle = this.padAngle.getValue();
    const padRadius = this.padRadius.getValueOr(null);
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const arc = new Arc(center, innerRadius, outerRadius, startAngle,
                        sweepAngle, padAngle, padRadius, cornerRadius);

    const sliceColor = this.sliceColor.value;
    if (sliceColor !== null) {
      // save
      const contextFillStyle = context.fillStyle;

      context.beginPath();
      context.fillStyle = sliceColor.toString();
      arc.draw(context, frame);
      context.fill();

      // restore
      context.fillStyle = contextFillStyle;
    }

    const labelView = this.label.view;
    if (labelView !== null && !labelView.isHidden()) {
      const labelRadius = this.labelRadius.getValue().pxValue(deltaRadius);
      const labelAngle = startAngle.value + sweepAngle.value / 2;
      const r = innerRadius.value + labelRadius;
      const rx = r * Math.cos(labelAngle);
      const ry = r * Math.sin(labelAngle);

      if (TypesetView.is(labelView)) {
        labelView.textAlign.setState("center", Affinity.Intrinsic);
        labelView.textBaseline.setState("middle", Affinity.Intrinsic);
        labelView.textOrigin.setState(new R2Point(center.x + rx, center.y + ry), Affinity.Intrinsic);
      }
    }

    const legendView = this.legend.view;
    if (legendView !== null && !legendView.isHidden()) {
      const tickAlign = this.tickAlign.getValue();
      const tickAngle = startAngle.value + sweepAngle.value * tickAlign;
      const tickRadius = this.tickRadius.getValue().pxValue(size);
      const tickLength = this.tickLength.getValue().pxValue(width);
      const tickWidth = this.tickWidth.getValue().pxValue(size);
      const tickColor = this.tickColor.value;

      const cx = center.x;
      const cy = center.y;
      const r1x = outerRadius.value * Math.cos(tickAngle + Equivalent.Epsilon);
      const r1y = outerRadius.value * Math.sin(tickAngle + Equivalent.Epsilon);
      const r2x = tickRadius * Math.cos(tickAngle + Equivalent.Epsilon);
      const r2y = tickRadius * Math.sin(tickAngle + Equivalent.Epsilon);
      let dx = 0;

      if (tickColor !== null && tickWidth !== 0) {
        // save
        const contextLineWidth = context.lineWidth;
        const contextStrokeStyle = context.strokeStyle;

        context.beginPath();
        context.lineWidth = tickWidth;
        context.strokeStyle = tickColor.toString();
        context.moveTo(cx + r1x, cy + r1y);
        context.lineTo(cx + r2x, cy + r2y);
        if (tickLength !== 0) {
          if (r2x >= 0) {
            context.lineTo(cx + tickLength, cy + r2y);
            dx = tickLength - r2x;
          } else if (r2x < 0) {
            context.lineTo(cx - tickLength, cy + r2y);
            dx = tickLength + r2x;
          }
        }
        context.stroke();

        // restore
        context.lineWidth = contextLineWidth;
        context.strokeStyle = contextStrokeStyle;
      }

      let textAlign: CanvasTextAlign;
      if (r2x >= 0) {
        if (r2y >= 0) { // top-right
          textAlign = "end";
        } else { // bottom-right
          textAlign = "end";
        }
      } else {
        dx = -dx;
        if (r2y < 0) { // bottom-left
          textAlign = "start";
        } else { // top-left
          textAlign = "start";
        }
      }

      if (TypesetView.is(legendView)) {
        const tickPadding = this.tickPadding.getValue().pxValue(size);
        if (FillView.is(legendView)) {
          legendView.fill.setState(tickColor, Affinity.Intrinsic);
        }
        legendView.textAlign.setState(textAlign, Affinity.Intrinsic);
        legendView.textBaseline.setState("alphabetic", Affinity.Intrinsic);
        legendView.textOrigin.setState(new R2Point(cx + r2x + dx, cy + r2y - tickPadding), Affinity.Intrinsic);
      }
    }
  }

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const p = renderer.transform.transform(x, y);
      return this.hitTestSlice(p.x, p.y, renderer.context, this.viewFrame);
    }
    return null;
  }

  protected hitTestSlice(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const size = Math.min(frame.width, frame.height);
    const value = this.value.getValue();
    const total = this.total.getValue();
    const delta = total !== 0 ? value / total : 0;

    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.phaseAngle.getValue().rad();
    const sweepAngle = Angle.rad(2 * Math.PI * delta);
    const padAngle = this.padAngle.getValue();
    const padRadius = this.padRadius.getValueOr(null);
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const arc = new Arc(center, innerRadius, outerRadius, startAngle,
                        sweepAngle, padAngle, padRadius, cornerRadius);

    context.beginPath();
    arc.draw(context, frame);
    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }

  override init(init: SliceViewInit): void {
    super.init(init);
    if (init.value !== void 0) {
      this.value(init.value);
    }
    if (init.total !== void 0) {
      this.total(init.total);
    }
    if (init.center !== void 0) {
      this.center(init.center);
    }
    if (init.innerRadius !== void 0) {
      this.innerRadius(init.innerRadius);
    }
    if (init.outerRadius !== void 0) {
      this.outerRadius(init.outerRadius);
    }
    if (init.phaseAngle !== void 0) {
      this.phaseAngle(init.phaseAngle);
    }
    if (init.padAngle !== void 0) {
      this.padAngle(init.padAngle);
    }
    if (init.padRadius !== void 0) {
      this.padRadius(init.padRadius);
    }
    if (init.cornerRadius !== void 0) {
      this.cornerRadius(init.cornerRadius);
    }
    if (init.labelRadius !== void 0) {
      this.labelRadius(init.labelRadius);
    }
    if (init.sliceColor !== void 0) {
      this.sliceColor(init.sliceColor);
    }
    if (init.tickAlign !== void 0) {
      this.tickAlign(init.tickAlign);
    }
    if (init.tickRadius !== void 0) {
      this.tickRadius(init.tickRadius);
    }
    if (init.tickLength !== void 0) {
      this.tickLength(init.tickLength);
    }
    if (init.tickWidth !== void 0) {
      this.tickWidth(init.tickWidth);
    }
    if (init.tickPadding !== void 0) {
      this.tickPadding(init.tickPadding);
    }
    if (init.tickColor !== void 0) {
      this.tickColor(init.tickColor);
    }
    if (init.font !== void 0) {
      this.font(init.font);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor);
    }
    if (init.label !== void 0) {
      this.label(init.label);
    }
    if (init.legend !== void 0) {
      this.legend(init.legend);
    }
  }
}
