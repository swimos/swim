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

import {BoxR2, AnyPointR2, PointR2} from "@swim/math";
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

export type DialViewArrangement = "auto" | "manual";

export type AnyDialView = DialView | DialViewInit;

export interface DialViewInit extends RenderedViewInit {
  value?: number;
  total?: number;
  center?: AnyPointR2;
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
  label?: View | string | null;
  legend?: View | string | null;
}

export class DialView extends GraphicsView {
  /** @hidden */
  _arrangement: DialViewArrangement;

  constructor() {
    super();
    this._arrangement = "auto";
  }

  get viewController(): GraphicsViewController<DialView> | null {
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

  @MemberAnimator(Angle, {inherit: true})
  startAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Angle, {inherit: true})
  sweepAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length, {inherit: true})
  cornerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, {inherit: true})
  dialColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color, {inherit: true})
  meterColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, {inherit: true})
  labelPadding: MemberAnimator<this, Length, AnyLength>;

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

  protected onRender(viewContext: RenderedViewContext): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderDial(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderDial(context: CanvasContext, frame: BoxR2): void {
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
    const startAngle = this.startAngle.value!.rad();
    const sweepAngle = this.sweepAngle.value!.rad();
    const cornerRadius = this.cornerRadius.value!.px(deltaRadius);
    const dial = new Arc(center, innerRadius, outerRadius, startAngle,
                         sweepAngle, Angle.zero(), null, cornerRadius);
    const meter = dial.sweepAngle(sweepAngle.times(delta));

    context.save();

    context.beginPath();
    context.fillStyle = this.dialColor.value!.toString();
    dial.draw(context, frame);
    context.fill();
    context.clip();

    context.beginPath();
    context.fillStyle = this.meterColor.value!.toString();
    meter.draw(context, frame);
    context.fill();

    context.restore();

    const label = this.label();
    if (RenderedView.is(label) && !label.isHidden()) {
      const r = (innerRadius.value + outerRadius.value) / 2;
      const rx = r * Math.cos(startAngle.value + 1e-12);
      const ry = r * Math.sin(startAngle.value + 1e-12);

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
      const labelPadding = this.labelPadding.value!.pxValue(deltaRadius);
      const dx = labelPadding * Math.cos(padAngle);
      const dy = labelPadding * Math.sin(padAngle);

      if (TypesetView.is(label)) {
        label.textAlign.setAutoState(textAlign);
        label.textBaseline.setAutoState("middle");
        label.textOrigin.setAutoState(new PointR2(center.x + rx + dx, center.y + ry + dy));
      }
    }

    const legend = this.legend();
    if (RenderedView.is(legend) && !legend.isHidden()) {
      const tickAlign = this.tickAlign.value!;
      const tickAngle = startAngle.value + sweepAngle.value * delta * tickAlign;
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
        hit = this.hitTestDial(x, y, context, this.viewFrame);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestDial(x: number, y: number, context: CanvasContext, frame: BoxR2): RenderedView | null {
    const size = Math.min(frame.width, frame.height);

    const center = this.center.value!;
    const innerRadius = this.innerRadius.value!.px(size);
    const outerRadius = this.outerRadius.value!.px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.startAngle.value!;
    const sweepAngle = this.sweepAngle.value!;
    const cornerRadius = this.cornerRadius.value!.px(deltaRadius);
    const dial = new Arc(center, innerRadius, outerRadius, startAngle,
                         sweepAngle, Angle.zero(), null, cornerRadius);

    context.beginPath();
    dial.draw(context, frame);
    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }

  static fromAny(dial: AnyDialView): DialView {
    if (dial instanceof DialView) {
      return dial;
    } else if (typeof dial === "object" && dial !== null) {
      const view = new DialView();
      if (dial.value !== void 0) {
        view.value(dial.value);
      }
      if (dial.total !== void 0) {
        view.total(dial.total);
      }
      if (dial.center !== void 0) {
        view.center(dial.center);
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
      if (dial.sweepAngle !== void 0) {
        view.sweepAngle(dial.sweepAngle);
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
      if (dial.hidden !== void 0) {
        view.setHidden(dial.hidden);
      }
      if (dial.culled !== void 0) {
        view.setCulled(dial.culled);
      }
      return view;
    }
    throw new TypeError("" + dial);
  }
}
