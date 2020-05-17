// Copyright 2015-2020 SWIM.AI inc.
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
import {
  View,
  MemberAnimator,
  RenderedViewContext,
  RenderedViewInit,
  RenderedView,
  FillView,
  TypesetView,
  GraphicsView,
  GraphicsViewController,
} from "@swim/view";
import {Arc} from "@swim/shape";
import {AnyTextRunView, TextRunView} from "@swim/typeset";

export type AnySliceView = SliceView | SliceViewInit;

export interface SliceViewInit extends RenderedViewInit {
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
  label?: View | string | null;
  legend?: View | string | null;
}

export class SliceView extends GraphicsView {
  get viewController(): GraphicsViewController<SliceView> | null {
    return this._viewController;
  }

  @MemberAnimator(Number, {value: 0})
  value: MemberAnimator<this, number>;

  @MemberAnimator(Number, {value: 1})
  total: MemberAnimator<this, number>;

  @MemberAnimator(PointR2, {inherit: true})
  center: MemberAnimator<this, PointR2, AnyPointR2>;

  @MemberAnimator(Length, {inherit: true})
  innerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {inherit: true})
  outerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Angle, {value: Angle.zero()})
  phaseAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Angle, {inherit: true})
  padAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length, {inherit: true})
  padRadius: MemberAnimator<this, Length | null, AnyLength | null>;

  @MemberAnimator(Length, {inherit: true})
  cornerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {inherit: true})
  labelRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, {inherit: true})
  sliceColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number, {inherit: true})
  tickAlign: MemberAnimator<this, number>;

  @MemberAnimator(Length, {inherit: true})
  tickRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {inherit: true})
  tickLength: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {inherit: true})
  tickWidth: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {inherit: true})
  tickPadding: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, {inherit: true})
  tickColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Font, {inherit: true})
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, {inherit: true})
  textColor: MemberAnimator<this, Color, AnyColor>;

  label(): View | null;
  label(label: View | AnyTextRunView | null): this;
  label(label?: View | AnyTextRunView | null): View | null | this {
    if (label === void 0) {
      return this.getChildView("label");
    } else {
      if (label !== null && !(label instanceof View)) {
        label = TextRunView.fromAny(label);
      }
      this.setChildView("label", label);
      return this;
    }
  }

  legend(): View | null;
  legend(legend: View | AnyTextRunView | null): this;
  legend(legend?: View | AnyTextRunView | null): View | null | this {
    if (legend === void 0) {
      return this.getChildView("legend");
    } else {
      if (legend !== null && !(legend instanceof View)) {
        legend = TextRunView.fromAny(legend);
      }
      this.setChildView("legend", legend);
      return this;
    }
  }

  protected onRender(viewContext: RenderedViewContext): void {
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
    const value = this.value.value!;
    const total = this.total.value!;
    const delta = total !== 0 ? value / total : 0;

    const center = this.center.value!;
    const innerRadius = this.innerRadius.value!.px(size);
    const outerRadius = this.outerRadius.value!.px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.phaseAngle.value!.rad();
    const sweepAngle = Angle.rad(2 * Math.PI * delta);
    const padAngle = this.padAngle.value!;
    const padRadius = this.padRadius.value! as Length | null;
    const cornerRadius = this.cornerRadius.value!.px(deltaRadius);
    const arc = new Arc(center, innerRadius, outerRadius, startAngle,
                        sweepAngle, padAngle, padRadius, cornerRadius);

    context.beginPath();
    context.fillStyle = this.sliceColor.value!.toString();
    arc.draw(context, frame);
    context.fill();

    const label = this.label();
    if (RenderedView.is(label) && !label.isHidden()) {
      const labelRadius = this.labelRadius.value!.pxValue(deltaRadius);
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
    if (RenderedView.is(legend) && !legend.isHidden()) {
      const tickAlign = this.tickAlign.value!;
      const tickAngle = startAngle.value + sweepAngle.value * tickAlign;
      const tickRadius = this.tickRadius.value!.pxValue(size);
      const tickLength = this.tickLength.value!.pxValue(width);
      const tickWidth = this.tickWidth.value!.pxValue(size);
      const tickColor = this.tickColor.value!;

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
        const tickPadding = this.tickPadding.value!.pxValue(size);
        if (FillView.is(legend)) {
          legend.fill.setAutoState(tickColor);
        }
        legend.textAlign.setAutoState(textAlign);
        legend.textBaseline.setAutoState("alphabetic");
        legend.textOrigin.setAutoState(new PointR2(cx + r2x + dx, cy + r2y - tickPadding));
      }
    }
  }

  hitTest(x: number, y: number, viewContext: RenderedViewContext): RenderedView | null {
    let hit = super.hitTest(x, y, viewContext);
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

  protected hitTestSlice(x: number, y: number, context: CanvasContext, frame: BoxR2): RenderedView | null {
    const size = Math.min(frame.width, frame.height);
    const value = this.value.value!;
    const total = this.total.value!;
    const delta = total !== 0 ? value / total : 0;

    const center = this.center.value!;
    const innerRadius = this.innerRadius.value!.px(size);
    const outerRadius = this.outerRadius.value!.px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.phaseAngle.value!.rad();
    const sweepAngle = Angle.rad(2 * Math.PI * delta);
    const padAngle = this.padAngle.value!;
    const padRadius = this.padRadius.value! as Length | null;
    const cornerRadius = this.cornerRadius.value!.px(deltaRadius);
    const arc = new Arc(center, innerRadius, outerRadius, startAngle,
                        sweepAngle, padAngle, padRadius, cornerRadius);

    context.beginPath();
    arc.draw(context, frame);
    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }

  static fromAny(slice: AnySliceView): SliceView {
    if (slice instanceof SliceView) {
      return slice;
    } else if (typeof slice === "object" && slice !== null) {
      const view = new SliceView();
      if (slice.value !== void 0) {
        view.value(slice.value);
      }
      if (slice.total !== void 0) {
        view.total(slice.total);
      }
      if (slice.center !== void 0) {
        view.center(slice.center);
      }
      if (slice.innerRadius !== void 0) {
        view.innerRadius(slice.innerRadius);
      }
      if (slice.outerRadius !== void 0) {
        view.outerRadius(slice.outerRadius);
      }
      if (slice.phaseAngle !== void 0) {
        view.phaseAngle(slice.phaseAngle);
      }
      if (slice.padAngle !== void 0) {
        view.padAngle(slice.padAngle);
      }
      if (slice.padRadius !== void 0) {
        view.padRadius(slice.padRadius);
      }
      if (slice.cornerRadius !== void 0) {
        view.cornerRadius(slice.cornerRadius);
      }
      if (slice.labelRadius !== void 0) {
        view.labelRadius(slice.labelRadius);
      }
      if (slice.sliceColor !== void 0) {
        view.sliceColor(slice.sliceColor);
      }
      if (slice.tickAlign !== void 0) {
        view.tickAlign(slice.tickAlign);
      }
      if (slice.tickRadius !== void 0) {
        view.tickRadius(slice.tickRadius);
      }
      if (slice.tickLength !== void 0) {
        view.tickLength(slice.tickLength);
      }
      if (slice.tickWidth !== void 0) {
        view.tickWidth(slice.tickWidth);
      }
      if (slice.tickPadding !== void 0) {
        view.tickPadding(slice.tickPadding);
      }
      if (slice.tickColor !== void 0) {
        view.tickColor(slice.tickColor);
      }
      if (slice.font !== void 0) {
        view.font(slice.font);
      }
      if (slice.textColor !== void 0) {
        view.textColor(slice.textColor);
      }
      if (slice.label !== void 0) {
        view.label(slice.label);
      }
      if (slice.legend !== void 0) {
        view.legend(slice.legend);
      }
      if (slice.hidden !== void 0) {
        view.setHidden(slice.hidden);
      }
      if (slice.culled !== void 0) {
        view.setCulled(slice.culled);
      }
      return view;
    }
    throw new TypeError("" + slice);
  }
}
