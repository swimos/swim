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
import {
  ViewFlags,
  View,
  MemberAnimator,
  RenderedViewContext,
  RenderedViewInit,
  TypesetView,
  GraphicsView,
  GraphicsViewController,
} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {AnyDialView, DialView} from "./DialView";

export type AnyGaugeView = GaugeView | GaugeViewInit;

export interface GaugeViewInit extends RenderedViewInit {
  limit?: number;
  center?: AnyPointR2;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  startAngle?: AnyAngle;
  sweepAngle?: AnyAngle;
  cornerRadius?: AnyLength;
  dialSpacing?: AnyLength;
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
  title?: View | string;
  dials?: AnyDialView[];
}

export class GaugeView extends GraphicsView {
  get viewController(): GraphicsViewController<GaugeView> | null {
    return this._viewController;
  }

  @MemberAnimator(Number, {value: 0})
  limit: MemberAnimator<this, number>;

  @MemberAnimator(PointR2, {value: PointR2.origin()})
  center: MemberAnimator<this, PointR2, AnyPointR2>;

  @MemberAnimator(Length, {value: Length.pct(30)})
  innerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {value: Length.pct(40)})
  outerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Angle, {value: Angle.rad(-Math.PI / 2)})
  startAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Angle, {value: Angle.rad(2 * Math.PI)})
  sweepAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length, {value: Length.pct(50)})
  cornerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {value: Length.px(1)})
  dialSpacing: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, {value: Color.transparent()})
  dialColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color, {value: Color.black()})
  meterColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length, {value: Length.pct(25)})
  labelPadding: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Number, {value: 0.5})
  tickAlign: MemberAnimator<this, number>;

  @MemberAnimator(Length, {value: Length.pct(45)})
  tickRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {value: Length.pct(50)})
  tickLength: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {value: Length.px(1)})
  tickWidth: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {value: Length.px(1)})
  tickPadding: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, {value: Color.black()})
  tickColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Font, {inherit: true})
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, {inherit: true})
  textColor: MemberAnimator<this, Color, AnyColor>;

  title(): View | null;
  title(title: View | AnyTextRunView | null): this;
  title(title?: View | AnyTextRunView | null): View | null | this {
    if (title === void 0) {
      return this.getChildView("title");
    } else {
      if (title !== null && !(title instanceof View)) {
        title = TextRunView.fromAny(title);
      }
      this.setChildView("title", title);
      return this;
    }
  }

  addDial(dial: AnyDialView): void {
    dial = DialView.fromAny(dial);
    this.appendChildView(dial);
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected onLayout(viewContext: RenderedViewContext): void {
    super.onLayout(viewContext);
    this.layoutGauge(this.viewFrame);
  }

  protected layoutGauge(frame: BoxR2): void {
    const childViews = this._childViews;
    const childCount = childViews.length;

    if (this.center.isAuto()) {
      const cx = (frame.xMin + frame.xMax) / 2;
      const cy = (frame.yMin + frame.yMax) / 2;
      this.center.setAutoState(new PointR2(cx, cy))
    }

    const limit = this.limit.value;
    const innerRadius = this.innerRadius.value;
    const outerRadius = this.outerRadius.value;
    const startAngle = this.startAngle.value;
    const sweepAngle = this.sweepAngle.value;
    const dialSpacing = this.dialSpacing.value;

    let r0: number | undefined;
    let r1: number | undefined;
    let rs: number | undefined;
    let dr: number | undefined;
    if (innerRadius !== void 0 && outerRadius !== void 0) {
      let dialCount = 0;
      for (let i = 0; i < childCount; i += 1) {
        const childView = childViews[i];
        if (childView instanceof DialView && childView._arrangement === "auto") {
          dialCount += 1;
        }
      }
      const size = Math.min(frame.width, frame.height);
      r0 = innerRadius.pxValue(size);
      r1 = outerRadius.pxValue(size);
      rs = dialSpacing !== void 0 ? dialSpacing.pxValue(size) : 0;
      dr = dialCount > 1 ? (r1 - r0 - rs * (dialCount - 1)) / dialCount : r1 - r0;
    }

    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof DialView && childView._arrangement === "auto") {
        if (limit !== void 0 && isFinite(limit)) {
          const total = childView.total.value;
          if (total !== void 0) {
            childView.total.setAutoState(Math.max(total, limit));
          }
        }
        if (innerRadius !== void 0 && outerRadius !== void 0) {
          childView.innerRadius.setAutoState(Length.px(r0!));
          childView.outerRadius.setAutoState(Length.px(r0! + dr!));
          r0 = r0! + dr! + rs!;
        }
        if (startAngle !== void 0) {
          childView.startAngle.setAutoState(startAngle);
        }
        if (sweepAngle !== void 0) {
          childView.sweepAngle.setAutoState(sweepAngle);
        }
      }
    }

    const title = this.title();
    if (TypesetView.is(title)) {
      title.textAlign.setAutoState("center");
      title.textBaseline.setAutoState("middle");
      title.textOrigin.setAutoState(this.center.state);
    }
  }

  static fromAny(gauge: AnyGaugeView): GaugeView {
    if (gauge instanceof GaugeView) {
      return gauge;
    } else if (typeof gauge === "object" && gauge !== null) {
      const view = new GaugeView();
      if (gauge.limit !== void 0) {
        view.limit(gauge.limit);
      }
      if (gauge.innerRadius !== void 0) {
        view.innerRadius(gauge.innerRadius);
      }
      if (gauge.outerRadius !== void 0) {
        view.outerRadius(gauge.outerRadius);
      }
      if (gauge.startAngle !== void 0) {
        view.startAngle(gauge.startAngle);
      }
      if (gauge.sweepAngle !== void 0) {
        view.sweepAngle(gauge.sweepAngle);
      }
      if (gauge.cornerRadius !== void 0) {
        view.cornerRadius(gauge.cornerRadius);
      }
      if (gauge.dialSpacing !== void 0) {
        view.dialSpacing(gauge.dialSpacing);
      }
      if (gauge.dialColor !== void 0) {
        view.dialColor(gauge.dialColor);
      }
      if (gauge.meterColor !== void 0) {
        view.meterColor(gauge.meterColor);
      }
      if (gauge.labelPadding !== void 0) {
        view.labelPadding(gauge.labelPadding);
      }
      if (gauge.tickAlign !== void 0) {
        view.tickAlign(gauge.tickAlign);
      }
      if (gauge.tickRadius !== void 0) {
        view.tickRadius(gauge.tickRadius);
      }
      if (gauge.tickLength !== void 0) {
        view.tickLength(gauge.tickLength);
      }
      if (gauge.tickWidth !== void 0) {
        view.tickWidth(gauge.tickWidth);
      }
      if (gauge.tickPadding !== void 0) {
        view.tickPadding(gauge.tickPadding);
      }
      if (gauge.tickColor !== void 0) {
        view.tickColor(gauge.tickColor);
      }
      if (gauge.font !== void 0) {
        view.font(gauge.font);
      }
      if (gauge.textColor !== void 0) {
        view.textColor(gauge.textColor);
      }
      if (gauge.title !== void 0) {
        view.title(gauge.title);
      }
      const dials = gauge.dials;
      if (dials !== void 0) {
        for (let i = 0, n = dials.length; i < n; i += 1) {
          view.addDial(dials[i]);
        }
      }
      if (gauge.hidden !== void 0) {
        view.setHidden(gauge.hidden);
      }
      if (gauge.culled !== void 0) {
        view.setCulled(gauge.culled);
      }
      return view;
    }
    throw new TypeError("" + gauge);
  }
}
