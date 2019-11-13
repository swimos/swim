// Copyright 2015-2019 SWIM.AI inc.
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

import {PointR2, BoxR2} from "@swim/math";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {RenderingContext} from "@swim/render";
import {
  MemberAnimator,
  ViewInit,
  View,
  RenderViewContext,
  RenderView,
  FillView,
  TypesetView,
  GraphicView,
  GraphicViewController,
} from "@swim/view";
import {Arc} from "@swim/shape";
import {AnyTextRunView, TextRunView} from "@swim/typeset";

export type AnySliceView = SliceView | SliceViewInit;

export interface SliceViewInit extends ViewInit {
  value?: number;
  total?: number;
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
  font?: AnyFont | null;
  textColor?: AnyColor | null;
  label?: View | string | null;
  legend?: View | string | null;
}

export class SliceView extends GraphicView {
  /** @hidden */
  _viewController: GraphicViewController<SliceView> | null;
  /** @hidden */
  _total: number;

  constructor() {
    super();
    this.value.setState(0);
    this._total = 1;
    this.phaseAngle.setState(Angle.zero());
  }

  get viewController(): GraphicViewController<SliceView> | null {
    return this._viewController;
  }

  @MemberAnimator(Number)
  value: MemberAnimator<this, number>;

  total(): number;
  total(value: number): this;
  total(value?: number): number | this {
    if (value === void 0) {
      return this._total;
    } else {
      this._total = value;
      return this;
    }
  }

  @MemberAnimator(Length, {inherit: true})
  innerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {inherit: true})
  outerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Angle)
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

  onAnimate(viewContext: RenderViewContext): void {
    const t = viewContext.updateTime;
    this.value.onFrame(t);
    this.innerRadius.onFrame(t);
    this.outerRadius.onFrame(t);
    this.phaseAngle.onFrame(t);
    this.padAngle.onFrame(t);
    this.padRadius.onFrame(t);
    this.cornerRadius.onFrame(t);
    this.labelRadius.onFrame(t);
    this.sliceColor.onFrame(t);
    this.tickAlign.onFrame(t);
    this.tickRadius.onFrame(t);
    this.tickLength.onFrame(t);
    this.tickWidth.onFrame(t);
    this.tickPadding.onFrame(t);
    this.tickColor.onFrame(t);
    this.font.onFrame(t);
    this.textColor.onFrame(t);
  }

  protected layoutChildView(childView: View): void {
    if (RenderView.is(childView)) {
      childView.setBounds(this._bounds);
      // Don't set anchor.
    }
  }

  protected onRender(viewContext: RenderViewContext): void {
    const context = viewContext.renderingContext;
    context.save();
    const bounds = this._bounds;
    const anchor = this._anchor;
    this.renderSlice(context, bounds, anchor);
    this.renderTick(context, bounds, anchor);
    context.restore();
  }

  protected renderSlice(context: RenderingContext, bounds: BoxR2, anchor: PointR2): void {
    const size = Math.min(bounds.width, bounds.height);

    const r0 = this.innerRadius.value!.pxValue(size);
    const r1 = this.outerRadius.value!.pxValue(size);
    const a0 = this.phaseAngle.value!.radValue();
    const da = 2 * Math.PI * this.value.value! / (this._total || 1);
    const ap = this.padAngle.value!;
    const rp = this.padRadius.value || null;
    const rc = this.cornerRadius.value!.pxValue(r1 - r0);
    const arc = new Arc(Length.px(r0), Length.px(r1), Angle.rad(a0), Angle.rad(da), ap, rp, Length.px(rc));

    context.beginPath();
    const sliceColor = this.sliceColor.value!;
    context.fillStyle = sliceColor.toString();
    arc.render(context, bounds, anchor);
    context.fill();

    const label = this.label();
    if (RenderView.is(label)) {
      const a = a0 + da / 2;
      const r = r0 + this.labelRadius.value!.pxValue(r1 - r0);
      const rx = r * Math.cos(a);
      const ry = r * Math.sin(a);
      const labelAnchor = new PointR2(anchor.x + rx, anchor.y + ry);
      label.setAnchor(labelAnchor);

      if (TypesetView.is(label)) {
        label.textAlign("center");
        label.textBaseline("middle");
      }
    }
  }

  protected renderTick(context: RenderingContext, bounds: BoxR2, anchor: PointR2): void {
    const legend = this.legend();
    if (RenderView.is(legend) && !legend.hidden) {
      const width = bounds.width;
      const height = bounds.height;
      const size = Math.min(width, height);
      const cx = anchor.x;
      const cy = anchor.y;

      const a0 = this.phaseAngle.value!.radValue();
      const da = Math.min(2 * Math.PI * this.value.value! / (this._total || 1), 2 * Math.PI);
      const a = a0 + da * this.tickAlign.value!;
      const r1 = this.outerRadius.value!.pxValue(size);
      const r2 = this.tickRadius.value!.pxValue(size);
      const r3 = this.tickLength.value!.pxValue(width);

      const r1x = r1 * Math.cos(a + 1e-12);
      const r1y = r1 * Math.sin(a + 1e-12);
      const r2x = r2 * Math.cos(a + 1e-12);
      const r2y = r2 * Math.sin(a + 1e-12);
      let l = 0;

      context.beginPath();
      const tickColor = this.tickColor.value!;
      context.strokeStyle = tickColor.toString();
      context.lineWidth = this.tickWidth.value!.pxValue(size);
      context.moveTo(cx + r1x, cy + r1y);
      context.lineTo(cx + r2x, cy + r2y);
      if (r3) {
        if (r2x >= 0) {
          context.lineTo(cx + r3, cy + r2y);
          l = r3 - r2x;
        } else if (r2x < 0) {
          context.lineTo(cx - r3, cy + r2y);
          l = r3 + r2x;
        }
      }
      context.stroke();

      let dx: number;
      let textAlign: CanvasTextAlign;
      if (r2x >= 0) {
        dx = l;
        if (r2y >= 0) { // top-right
          textAlign = "end";
        } else { // bottom-right
          textAlign = "end";
        }
      } else {
        dx = -l;
        if (r2y < 0) { // bottom-left
          textAlign = "start";
        } else { // top-left
          textAlign = "start";
        }
      }
      const legendAnchor = new PointR2(cx + r2x + dx, cy + r2y - this.tickPadding.value!.pxValue(size));
      legend.setAnchor(legendAnchor);

      if (TypesetView.is(legend)) {
        if (FillView.is(legend)) {
          legend.fill(tickColor);
        }
        legend.textAlign(textAlign);
        legend.textBaseline("alphabetic");
      }
    }
  }

  hitTest(x: number, y: number, context: RenderingContext): RenderView | null {
    let hit = super.hitTest(x, y, context);
    if (hit === null) {
      context.save();
      const pixelRatio = this.pixelRatio;
      x *= pixelRatio;
      y *= pixelRatio;
      const bounds = this._bounds;
      const anchor = this._anchor;
      hit = this.hitTestSlice(x, y, context, bounds, anchor);
      context.restore();
    }
    return hit;
  }

  protected hitTestSlice(x: number, y: number, context: RenderingContext,
                         bounds: BoxR2, anchor: PointR2): RenderView | null {
    const size = Math.min(bounds.width, bounds.height);

    const r0 = this.innerRadius.value!.pxValue(size);
    const r1 = this.outerRadius.value!.pxValue(size);
    const a0 = this.phaseAngle.value!.radValue();
    const da = 2 * Math.PI * this.value.value! / (this._total || 1);
    const ap = this.padAngle.value!;
    const rp = this.padRadius.value || null;
    const rc = this.cornerRadius.value!.pxValue(r1 - r0);
    const arc = new Arc(Length.px(r0), Length.px(r1), Angle.rad(a0), Angle.rad(da), ap, rp, Length.px(rc));

    context.beginPath();
    arc.render(context, bounds, anchor);
    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }

  static fromAny(slice: AnySliceView): SliceView {
    if (slice instanceof SliceView) {
      return slice;
    } else if (typeof slice === "object" && slice) {
      const view = new SliceView();
      if (slice.key !== void 0) {
        view.key(slice.key);
      }
      if (slice.value !== void 0) {
        view.value(slice.value);
      }
      if (slice.total !== void 0) {
        view.total(slice.total);
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
      return view;
    }
    throw new TypeError("" + slice);
  }
}
