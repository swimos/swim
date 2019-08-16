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

import {BoxR2, PointR2} from "@swim/math";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {RenderingContext} from "@swim/render";
import {
  MemberAnimator,
  ViewInit,
  View,
  RenderView,
  FillView,
  TypesetView,
  GraphicView,
  GraphicViewController,
} from "@swim/view";
import {Arc} from "@swim/shape";
import {AnyTextRunView, TextRunView} from "@swim/typeset";

export type DialViewArrangement = "auto" | "manual";

export type AnyDialView = DialView | DialViewInit;

export interface DialViewInit extends ViewInit {
  value?: number;
  total?: number;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  startAngle?: AnyAngle;
  deltaAngle?: AnyAngle;
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
  font?: AnyFont | null;
  textColor?: AnyColor | null;
  arrangement?: DialViewArrangement;
  label?: View | string | null;
  legend?: View | string | null;
}

export class DialView extends GraphicView {
  /** @hidden */
  _viewController: GraphicViewController<DialView> | null;
  /** @hidden */
  _arrangement: DialViewArrangement;

  constructor() {
    super();
    this.value.setState(0);
    this.total.setState(1);
    this._arrangement = "auto";
  }

  get viewController(): GraphicViewController<DialView> | null {
    return this._viewController;
  }

  @MemberAnimator(Number)
  value: MemberAnimator<this, number>;

  @MemberAnimator(Number)
  total: MemberAnimator<this, number>;

  @MemberAnimator(Length)
  innerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  outerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Angle, "inherit")
  startAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Angle, "inherit")
  deltaAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length, "inherit")
  cornerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, "inherit")
  dialColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color, "inherit")
  meterColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, "inherit")
  labelPadding: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Number, "inherit")
  tickAlign: MemberAnimator<this, number>;

  @MemberAnimator(Length, "inherit")
  tickRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, "inherit")
  tickLength: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, "inherit")
  tickWidth: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, "inherit")
  tickPadding: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, "inherit")
  tickColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Font, "inherit")
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, "inherit")
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

  arrangement(): DialViewArrangement;
  arrangement(arrangement: DialViewArrangement): this;
  arrangement(arrangement?: DialViewArrangement): DialViewArrangement | this {
    if (arrangement === void 0) {
      return this._arrangement;
    } else {
      this._arrangement = arrangement;
      return this;
    }
  }

  protected onAnimate(t: number): void {
    this.value.onFrame(t);
    this.total.onFrame(t);
    this.innerRadius.onFrame(t);
    this.outerRadius.onFrame(t);
    this.startAngle.onFrame(t);
    this.deltaAngle.onFrame(t);
    this.cornerRadius.onFrame(t);
    this.dialColor.onFrame(t);
    this.meterColor.onFrame(t);
    this.labelPadding.onFrame(t);
    this.tickAlign.onFrame(t);
    this.tickRadius.onFrame(t);
    this.tickLength.onFrame(t);
    this.tickWidth.onFrame(t);
    this.tickPadding.onFrame(t);
    this.tickColor.onFrame(t);
    this.font.onFrame(t);
    this.textColor.onFrame(t);
  }

  protected onRender(context: RenderingContext): void {
    context.save();
    const bounds = this._bounds;
    const anchor = this._anchor;
    this.renderDial(context, bounds, anchor);
    context.restore();
    this.renderTick(context, bounds, anchor);
  }

  protected renderDial(context: RenderingContext, bounds: BoxR2, anchor: PointR2): void {
    const size = Math.min(bounds.width, bounds.height);

    const r0 = this.innerRadius.value!.pxValue(size);
    const r1 = this.outerRadius.value!.pxValue(size);
    const a0 = this.startAngle.value!.radValue();
    const da = this.deltaAngle.value!.radValue();
    const rc = this.cornerRadius.value!.pxValue(r1 - r0);
    const dial = new Arc(Length.px(r0), Length.px(r1), Angle.rad(a0), Angle.rad(da), Angle.zero(), null, Length.px(rc));
    const meter = dial.deltaAngle(da * this.value.value! / (this.total.value! || 1));

    context.beginPath();
    const dialColor = this.dialColor.value!;
    context.fillStyle = dialColor.toString();
    dial.render(context, bounds, anchor);
    context.fill();
    context.clip();

    context.beginPath();
    const meterColor = this.meterColor.value!;
    context.fillStyle = meterColor.toString();
    meter.render(context, bounds, anchor);
    context.fill();

    const label = this.label();
    if (RenderView.is(label)) {
      const r = (r0 + r1) / 2;
      const rx = r * Math.cos(a0 + 1e-12);
      const ry = r * Math.sin(a0 + 1e-12);

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
      const padAngle = a0 - Math.PI / 2;
      const labelPadding = this.labelPadding.value!.pxValue(r1 - r0);
      const dx = labelPadding * Math.cos(padAngle);
      const dy = labelPadding * Math.sin(padAngle);

      const labelAnchor = new PointR2(anchor.x + rx + dx, anchor.y + ry + dy);
      label.setAnchor(labelAnchor);

      if (TypesetView.is(label)) {
        label.textAlign(textAlign);
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

      const a0 = this.startAngle.value!.radValue();
      const da = this.deltaAngle.value!.radValue() * this.value.value! / (this.total.value! || 1);
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
      hit = this.hitTestDial(x, y, context, bounds, anchor);
      context.restore();
    }
    return hit;
  }

  protected hitTestDial(x: number, y: number, context: RenderingContext,
                        bounds: BoxR2, anchor: PointR2): RenderView | null {
    const size = Math.min(bounds.width, bounds.height);

    const r0 = this.innerRadius.value!.pxValue(size);
    const r1 = this.outerRadius.value!.pxValue(size);
    const a0 = this.startAngle.value!.radValue();
    const da = this.deltaAngle.value!.radValue();
    const rc = this.cornerRadius.value!.pxValue(r1 - r0);
    const dial = new Arc(Length.px(r0), Length.px(r1), Angle.rad(a0), Angle.rad(da), Angle.zero(), null, Length.px(rc));

    context.beginPath();
    dial.render(context, bounds, anchor);
    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }

  static fromAny(dial: AnyDialView): DialView {
    if (dial instanceof DialView) {
      return dial;
    } else if (typeof dial === "object" && dial) {
      const view = new DialView();
      if (dial.key !== void 0) {
        view.key(dial.key);
      }
      if (dial.value !== void 0) {
        view.value(dial.value);
      }
      if (dial.total !== void 0) {
        view.total(dial.total);
      }
      if (dial.innerRadius !== void 0) {
        view.innerRadius(dial.innerRadius);
      }
      if (dial.outerRadius !== void 0) {
        view.outerRadius(dial.outerRadius);
      }
      if (dial.startAngle !== void 0) {
        view.startAngle(dial.startAngle);
      }
      if (dial.deltaAngle !== void 0) {
        view.deltaAngle(dial.deltaAngle);
      }
      if (dial.cornerRadius !== void 0) {
        view.cornerRadius(dial.cornerRadius);
      }
      if (dial.dialColor !== void 0) {
        view.dialColor(dial.dialColor);
      }
      if (dial.meterColor !== void 0) {
        view.meterColor(dial.meterColor);
      }
      if (dial.labelPadding !== void 0) {
        view.labelPadding(dial.labelPadding);
      }
      if (dial.tickAlign !== void 0) {
        view.tickAlign(dial.tickAlign);
      }
      if (dial.tickRadius !== void 0) {
        view.tickRadius(dial.tickRadius);
      }
      if (dial.tickLength !== void 0) {
        view.tickLength(dial.tickLength);
      }
      if (dial.tickWidth !== void 0) {
        view.tickWidth(dial.tickWidth);
      }
      if (dial.tickPadding !== void 0) {
        view.tickPadding(dial.tickPadding);
      }
      if (dial.tickColor !== void 0) {
        view.tickColor(dial.tickColor);
      }
      if (dial.font !== void 0) {
        view.font(dial.font);
      }
      if (dial.textColor !== void 0) {
        view.textColor(dial.textColor);
      }
      if (dial.arrangement !== void 0) {
        view.arrangement(dial.arrangement);
      }
      if (dial.label !== void 0) {
        view.label(dial.label);
      }
      if (dial.legend !== void 0) {
        view.legend(dial.legend);
      }
      return view;
    }
    throw new TypeError("" + dial);
  }
}
