// Copyright 2015-2021 Swim.inc
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

import {Class, Equivalent, Initable} from "@swim/util";
import {Affinity, MemberFastenerClass, Property, Animator} from "@swim/component";
import {AnyLength, Length, AnyAngle, Angle, AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {ViewContextType, AnyView, View, ViewRef} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
  CanvasContext,
  CanvasRenderer,
  FillView,
  Arc,
  TypesetView,
  TextRunView,
} from "@swim/graphics";
import type {DialViewObserver} from "./DialViewObserver";

/** @public */
export type DialViewArrangement = "auto" | "manual";

/** @public */
export type AnyDialView = DialView | DialViewInit;

/** @public */
export interface DialViewInit extends GraphicsViewInit {
  value?: number;
  limit?: number;
  center?: AnyR2Point;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  startAngle?: AnyAngle;
  sweepAngle?: AnyAngle;
  cornerRadius?: AnyLength;
  dialColor?: AnyColor;
  meterColor?: AnyColor;
  labelPadding?: AnyLength;
  tickAlign?: number;
  tickRadius?: AnyLength;
  tickLength?: AnyLength;
  tickWidth?: AnyLength;
  tickPadding?: AnyLength;
  tickColor?: AnyColor;
  font?: AnyFont;
  textColor?: AnyColor;
  arrangement?: DialViewArrangement;
  label?: GraphicsView | string;
  legend?: GraphicsView | string;
}

/** @public */
export class DialView extends GraphicsView {
  override readonly observerType?: Class<DialViewObserver>;

  @Animator<DialView, number>({
    type: Number,
    value: 0,
    updateFlags: View.NeedsRender,
    willSetValue(newValue: number, oldValue: number): void {
      this.owner.callObservers("viewWillSetDialValue", newValue, oldValue, this.owner);
    },
    didSetValue(newValue: number, oldValue: number): void {
      this.owner.callObservers("viewDidSetDialValue", newValue, oldValue, this.owner);
    },
  })
  readonly value!: Animator<this, number>;

  @Animator<DialView, number>({
    type: Number,
    value: 1,
    updateFlags: View.NeedsRender,
    willSetValue(newLimit: number, oldLimit: number): void {
      this.owner.callObservers("viewWillSetDialLimit", newLimit, oldLimit, this.owner);
    },
    didSetValue(newLimit: number, oldLimit: number): void {
      this.owner.callObservers("viewDidSetDialLimit", newLimit, oldLimit, this.owner);
    },
  })
  readonly limit!: Animator<this, number>;

  @Animator({type: R2Point, inherits: true, value: R2Point.origin(), updateFlags: View.NeedsRender})
  readonly center!: Animator<this, R2Point, AnyR2Point>;

  @ThemeAnimator({type: Length, inherits: true, value: Length.pct(30), updateFlags: View.NeedsRender})
  readonly innerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, inherits: true, value: Length.pct(40), updateFlags: View.NeedsRender})
  readonly outerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Angle, inherits: true, value: Angle.rad(-Math.PI / 2), updateFlags: View.NeedsRender})
  readonly startAngle!: ThemeAnimator<this, Angle, AnyAngle>;

  @ThemeAnimator({type: Angle, inherits: true, value: Angle.rad(2 * Math.PI), updateFlags: View.NeedsRender})
  readonly sweepAngle!: ThemeAnimator<this, Angle, AnyAngle>;

  @ThemeAnimator({type: Length, inherits: true, value: Length.pct(50), updateFlags: View.NeedsRender})
  readonly cornerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Color, inherits: true, value: null, look: Look.subduedColor, updateFlags: View.NeedsRender})
  readonly dialColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Color, inherits: true, value: null, look: Look.accentColor, updateFlags: View.NeedsRender})
  readonly meterColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Length, inherits: true, value: Length.pct(25), updateFlags: View.NeedsRender})
  readonly labelPadding!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Number, inherits: true, value: 1.0, updateFlags: View.NeedsRender})
  readonly tickAlign!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Length, inherits: true, value: Length.pct(45), updateFlags: View.NeedsRender})
  readonly tickRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, inherits: true, value: Length.pct(50), updateFlags: View.NeedsRender})
  readonly tickLength!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, inherits: true, value: Length.px(1), updateFlags: View.NeedsRender})
  readonly tickWidth!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, inherits: true, value: Length.px(2), updateFlags: View.NeedsRender})
  readonly tickPadding!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Color, inherits: true, value: null, look: Look.neutralColor, updateFlags: View.NeedsRender})
  readonly tickColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Font, inherits: true, updateFlags: View.NeedsRender})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({type: Color, inherits: true, look: Look.mutedColor, updateFlags: View.NeedsRender})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ViewRef<DialView, GraphicsView & Initable<GraphicsViewInit | string>>({
    key: true,
    type: TextRunView,
    binds: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachDialLabel", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachDialLabel", labelView, this.owner);
    },
    fromAny(value: AnyView<GraphicsView> | string): GraphicsView {
      if (typeof value === "string") {
        if (this.view instanceof TextRunView) {
          this.view.text(value);
          return this.view;
        } else {
          return TextRunView.fromAny(value);
        }
      } else {
        return GraphicsView.fromAny(value);
      }
    },
  })
  readonly label!: ViewRef<this, GraphicsView & Initable<GraphicsViewInit | string>>;
  static readonly label: MemberFastenerClass<DialView, "label">;

  @ViewRef<DialView, GraphicsView & Initable<GraphicsViewInit | string>>({
    key: true,
    type: TextRunView,
    binds: true,
    willAttachView(legendView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachDialLegend", legendView, this.owner);
    },
    didDetachView(legendView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachDialLegend", legendView, this.owner);
    },
    fromAny(value: AnyView<GraphicsView> | string): GraphicsView {
      if (typeof value === "string") {
        if (this.view instanceof TextRunView) {
          this.view.text(value);
          return this.view;
        } else {
          return TextRunView.fromAny(value);
        }
      } else {
        return GraphicsView.fromAny(value);
      }
    },
  })
  readonly legend!: ViewRef<this, GraphicsView & Initable<GraphicsViewInit | string>>;
  static readonly legend: MemberFastenerClass<DialView, "legend">;

  @Property({type: String, value: "auto"})
  readonly arrangement!: Property<this, DialViewArrangement>;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.center.recohere(viewContext.updateTime);
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.hidden && !this.culled) {
      const context = renderer.context;
      context.save();
      this.renderDial(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderDial(context: CanvasContext, frame: R2Box): void {
    const width = frame.width;
    const height = frame.height;
    const size = Math.min(width, height);
    const value = this.value.getValue();
    const limit = this.limit.getValue();
    const delta = limit !== 0 ? value / limit : 0;

    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.startAngle.getValue().rad();
    const sweepAngle = this.sweepAngle.getValue().rad();
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const dial = new Arc(center, innerRadius, outerRadius, startAngle,
                         sweepAngle, Angle.zero(), null, cornerRadius);
    const meter = dial.withSweepAngle(sweepAngle.times(delta));

    context.save();

    context.beginPath();
    const dialColor = this.dialColor.value;
    if (dialColor !== null) {
      context.fillStyle = dialColor.toString();
    }
    dial.draw(context, frame);
    if (dialColor !== null) {
      context.fill();
    }
    context.clip();

    const meterColor = this.meterColor.value;
    if (meterColor !== null) {
      context.beginPath();
      context.fillStyle = meterColor.toString();
      meter.draw(context, frame);
      context.fill();
    }

    context.restore();

    const labelView = this.label.view;
    if (labelView !== null && !labelView.hidden) {
      const r = (innerRadius.value + outerRadius.value) / 2;
      const rx = r * Math.cos(startAngle.value + Equivalent.Epsilon);
      const ry = r * Math.sin(startAngle.value + Equivalent.Epsilon);

      let textAlign: CanvasTextAlign;
      if (rx >= 0) {
        if (ry >= 0) { // top-right
          textAlign = "start";
        } else { // bottom-right
          textAlign = "end";
        }
      } else {
        if (ry < 0) { // bottom-left
          textAlign = "end";
        } else { // top-left
          textAlign = "start";
        }
      }
      const padAngle = startAngle.value - Math.PI / 2;
      const labelPadding = this.labelPadding.getValue().pxValue(deltaRadius);
      const dx = labelPadding * Math.cos(padAngle);
      const dy = labelPadding * Math.sin(padAngle);

      if (TypesetView.is(labelView)) {
        labelView.textAlign.setState(textAlign, Affinity.Intrinsic);
        labelView.textBaseline.setState("middle", Affinity.Intrinsic);
        labelView.textOrigin.setState(new R2Point(center.x + rx + dx, center.y + ry + dy), Affinity.Intrinsic);
      }
    }

    const legendView = this.legend.view;
    if (legendView !== null && !legendView.hidden) {
      const tickAlign = this.tickAlign.getValue();
      const tickAngle = startAngle.value + sweepAngle.value * delta * tickAlign;
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

      if (tickColor !== null) {
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
      return this.hitTestDial(p.x, p.y, renderer.context, this.viewFrame);
    }
    return null;
  }

  protected hitTestDial(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const size = Math.min(frame.width, frame.height);
    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.startAngle.getValue();
    const sweepAngle = this.sweepAngle.getValue();
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const dial = new Arc(center, innerRadius, outerRadius, startAngle,
                         sweepAngle, Angle.zero(), null, cornerRadius);

    context.beginPath();
    dial.draw(context, frame);
    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }

  override init(init: DialViewInit): void {
    super.init(init);
    if (init.value !== void 0) {
      this.value(init.value);
    }
    if (init.limit !== void 0) {
      this.limit(init.limit);
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
    if (init.startAngle !== void 0) {
      this.startAngle(init.startAngle);
    }
    if (init.sweepAngle !== void 0) {
      this.sweepAngle(init.sweepAngle);
    }
    if (init.cornerRadius !== void 0) {
      this.cornerRadius(init.cornerRadius);
    }
    if (init.dialColor !== void 0) {
      this.dialColor(init.dialColor);
    }
    if (init.meterColor !== void 0) {
      this.meterColor(init.meterColor);
    }
    if (init.labelPadding !== void 0) {
      this.labelPadding(init.labelPadding);
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
    if (init.arrangement !== void 0) {
      this.arrangement(init.arrangement);
    }
    if (init.label !== void 0) {
      this.label(init.label);
    }
    if (init.legend !== void 0) {
      this.legend(init.legend);
    }
  }
}
