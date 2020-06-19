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

import {BoxR2, AnyPointR2, PointR2} from "@swim/math";
import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  View,
  ViewAnimator,
  GraphicsViewContext,
  GraphicsViewInit,
  GraphicsView,
  GraphicsViewController,
  GraphicsNodeView,
  FillView,
  TypesetView,
} from "@swim/view";
import {Arc} from "@swim/shape";
import {AnyTextRunView, TextRunView} from "@swim/typeset";

export type DialViewArrangement = "auto" | "manual";

export type AnyDialView = DialView | DialViewInit;

export interface DialViewInit extends GraphicsViewInit {
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
  label?: GraphicsView | string | null;
  legend?: GraphicsView | string | null;
}

export class DialView extends GraphicsNodeView {
  /** @hidden */
  _arrangement: DialViewArrangement;

  constructor() {
    super();
    this._arrangement = "auto";
  }

  get viewController(): GraphicsViewController<DialView> | null {
    return this._viewController;
  }

  @ViewAnimator(Number, {value: 0})
  value: ViewAnimator<this, number>;

  @ViewAnimator(Number, {value: 1})
  total: ViewAnimator<this, number>;

  @ViewAnimator(PointR2, {inherit: true})
  center: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator(Length, {inherit: true})
  innerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {inherit: true})
  outerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Angle, {inherit: true})
  startAngle: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator(Angle, {inherit: true})
  sweepAngle: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator(Length, {inherit: true})
  cornerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Color, {inherit: true})
  dialColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Color, {inherit: true})
  meterColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Length, {inherit: true})
  labelPadding: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Number, {inherit: true})
  tickAlign: ViewAnimator<this, number>;

  @ViewAnimator(Length, {inherit: true})
  tickRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {inherit: true})
  tickLength: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {inherit: true})
  tickWidth: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Length, {inherit: true})
  tickPadding: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator(Color, {inherit: true})
  tickColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Font, {inherit: true})
  font: ViewAnimator<this, Font, AnyFont>;

  @ViewAnimator(Color, {inherit: true})
  textColor: ViewAnimator<this, Color, AnyColor>;

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

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onRemoveChildView(childView: View): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onRender(viewContext: GraphicsViewContext): void {
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
    if (label !== null && !label.isHidden()) {
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
    if (legend !== null && !legend.isHidden()) {
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

  hitTest(x: number, y: number, viewContext: GraphicsViewContext): GraphicsView | null {
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

  protected hitTestDial(x: number, y: number, context: CanvasContext, frame: BoxR2): GraphicsView | null {
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
