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

import {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {ViewContextType, View, ViewAnimator} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
  LayerView,
  FillView,
  Arc,
  TypesetView,
  AnyTextRunView,
  TextRunView,
} from "@swim/graphics";

export type AnySliceView = SliceView | SliceViewInit;

export interface SliceViewInit extends GraphicsViewInit {
  value?: number;
  total?: number;
  center?: AnyPointR2;
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
  label?: GraphicsView | string | null;
  legend?: GraphicsView | string | null;
}

export class SliceView extends LayerView {
  initView(init: SliceViewInit): void {
    super.initView(init);
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

  @ViewAnimator({type: Number, state: 0})
  value: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, state: 1})
  total: ViewAnimator<this, number>;

  @ViewAnimator({type: PointR2, inherit: true})
  center: ViewAnimator<this, PointR2 | undefined, AnyPointR2 | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  innerRadius: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  outerRadius: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Angle, state: Angle.zero()})
  phaseAngle: ViewAnimator<this, Angle | undefined, AnyAngle | undefined>;

  @ViewAnimator({type: Angle, inherit: true})
  padAngle: ViewAnimator<this, Angle | undefined, AnyAngle | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  padRadius: ViewAnimator<this, Length | null | undefined, AnyLength | null | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  cornerRadius: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  labelRadius: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  sliceColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewAnimator({type: Number, inherit: true})
  tickAlign: ViewAnimator<this, number | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  tickRadius: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  tickLength: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  tickWidth: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Length, inherit: true})
  tickPadding: ViewAnimator<this, Length | undefined, AnyLength | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  tickColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  @ViewAnimator({type: Font, inherit: true})
  font: ViewAnimator<this, Font | undefined, AnyFont | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  textColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

  label(): GraphicsView | null;
  label(label: GraphicsView | AnyTextRunView | null): this;
  label(label?: GraphicsView | AnyTextRunView | null): GraphicsView | null | this {
    if (label === void 0) {
      const childView = this.getChildView("label");
      return childView instanceof GraphicsView ? childView : null;
    } else {
      if (label !== null && !(label instanceof GraphicsView)) {
        label = TextRunView.fromAny(label);
      }
      this.setChildView("label", label);
      return this;
    }
  }

  legend(): GraphicsView | null;
  legend(legend: GraphicsView | AnyTextRunView | null): this;
  legend(legend?: GraphicsView | AnyTextRunView | null): GraphicsView | null | this {
    if (legend === void 0) {
      const childView = this.getChildView("legend");
      return childView instanceof GraphicsView ? childView : null;
    } else {
      if (legend !== null && !(legend instanceof GraphicsView)) {
        legend = TextRunView.fromAny(legend);
      }
      this.setChildView("legend", legend);
      return this;
    }
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onRemoveChildView(childView: View): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderSlice(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderSlice(context: CanvasContext, frame: BoxR2): void {
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
    const padRadius = this.padRadius.getValue() as Length | null;
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const arc = new Arc(center, innerRadius, outerRadius, startAngle,
                        sweepAngle, padAngle, padRadius, cornerRadius);

    context.beginPath();
    context.fillStyle = this.sliceColor.getValue().toString();
    arc.draw(context, frame);
    context.fill();

    const label = this.label();
    if (label !== null && !label.isHidden()) {
      const labelRadius = this.labelRadius.getValue().pxValue(deltaRadius);
      const labelAngle = startAngle.value + sweepAngle.value / 2;
      const r = innerRadius.value + labelRadius;
      const rx = r * Math.cos(labelAngle);
      const ry = r * Math.sin(labelAngle);

      if (TypesetView.is(label)) {
        label.textAlign.setAutoState("center");
        label.textBaseline.setAutoState("middle");
        label.textOrigin.setAutoState(new PointR2(center.x + rx, center.y + ry));
      }
    }

    const legend = this.legend();
    if (legend !== null && !legend.isHidden()) {
      const tickAlign = this.tickAlign.getValue();
      const tickAngle = startAngle.value + sweepAngle.value * tickAlign;
      const tickRadius = this.tickRadius.getValue().pxValue(size);
      const tickLength = this.tickLength.getValue().pxValue(width);
      const tickWidth = this.tickWidth.getValue().pxValue(size);
      const tickColor = this.tickColor.getValue();

      const cx = center.x;
      const cy = center.y;
      const r1x = outerRadius.value * Math.cos(tickAngle + 1e-12);
      const r1y = outerRadius.value * Math.sin(tickAngle + 1e-12);
      const r2x = tickRadius * Math.cos(tickAngle + 1e-12);
      const r2y = tickRadius * Math.sin(tickAngle + 1e-12);
      let dx = 0;

      context.beginPath();
      context.strokeStyle = tickColor.toString();
      context.lineWidth = tickWidth;
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

      if (TypesetView.is(legend)) {
        const tickPadding = this.tickPadding.getValue().pxValue(size);
        if (FillView.is(legend)) {
          legend.fill.setAutoState(tickColor);
        }
        legend.textAlign.setAutoState(textAlign);
        legend.textBaseline.setAutoState("alphabetic");
        legend.textOrigin.setAutoState(new PointR2(cx + r2x + dx, cy + r2y - tickPadding));
      }
    }
  }

  protected doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit = super.doHitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        context.save();
        x *= renderer.pixelRatio;
        y *= renderer.pixelRatio;
        hit = this.hitTestSlice(x, y, context, this.viewFrame);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestSlice(x: number, y: number, context: CanvasContext, frame: BoxR2): GraphicsView | null {
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
    const padRadius = this.padRadius.getValue() as Length | null;
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

  static fromInit(init: SliceViewInit): SliceView {
    const view = new SliceView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnySliceView): SliceView {
    if (value instanceof SliceView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
