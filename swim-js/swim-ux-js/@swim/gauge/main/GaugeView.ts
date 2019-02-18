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

import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {
  MemberAnimator,
  ViewInit,
  View,
  TypesetView,
  GraphicView,
  GraphicViewController,
} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {AnyDialView, DialView} from "./DialView";

export type AnyGaugeView = GaugeView | GaugeViewInit;

export interface GaugeViewInit extends ViewInit {
  limit?: number;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  startAngle?: AnyAngle;
  deltaAngle?: AnyAngle;
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
  font?: AnyFont | null;
  textColor?: AnyColor | null;
  title?: View | string | null;
  dials?: AnyDialView[] | null;
}

export class GaugeView extends GraphicView {
  /** @hidden */
  _viewController: GraphicViewController<GaugeView> | null;

  constructor() {
    super();
    this.limit.setState(0);
    this.innerRadius.setState(Length.pct(30));
    this.outerRadius.setState(Length.pct(40));
    this.startAngle.setState(Angle.rad(-Math.PI / 2));
    this.deltaAngle.setState(Angle.rad(2 * Math.PI));
    this.cornerRadius.setState(Length.pct(50));
    this.dialSpacing.setState(Length.px(1));
    this.dialColor.setState(Color.transparent());
    this.meterColor.setState(Color.black());
    this.labelPadding.setState(Length.pct(25));
    this.tickAlign.setState(0.5);
    this.tickRadius.setState(Length.pct(45));
    this.tickLength.setState(Length.pct(50));
    this.tickWidth.setState(Length.px(1));
    this.tickPadding.setState(Length.px(1));
    this.tickColor.setState(Color.black());
  }

  get viewController(): GraphicViewController<GaugeView> | null {
    return this._viewController;
  }

  @MemberAnimator(Number)
  limit: MemberAnimator<this, number>;

  @MemberAnimator(Length)
  innerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  outerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Angle)
  startAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Angle)
  deltaAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length)
  cornerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  dialSpacing: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color)
  dialColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Color)
  meterColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Length)
  labelPadding: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Number)
  tickAlign: MemberAnimator<this, number>;

  @MemberAnimator(Length)
  tickRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  tickLength: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  tickWidth: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  tickPadding: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color)
  tickColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Font, "inherit")
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, "inherit")
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

  protected onAnimate(t: number): void {
    this.limit.onFrame(t);
    this.innerRadius.onFrame(t);
    this.outerRadius.onFrame(t);
    this.startAngle.onFrame(t);
    this.deltaAngle.onFrame(t);
    this.cornerRadius.onFrame(t);
    this.dialSpacing.onFrame(t);
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

  protected didAnimate(t: number): void {
    this.layoutGauge();
    super.didAnimate(t);
  }

  protected layoutGauge(): void {
    const bounds = this._bounds;
    const size = Math.min(bounds.width, bounds.height);

    const childViews = this._childViews;
    const childCount = childViews.length;

    const limit = this.limit.value;
    const innerRadius = this.innerRadius.value;
    const outerRadius = this.outerRadius.value;
    const startAngle = this.startAngle.value;
    const deltaAngle = this.deltaAngle.value;
    const dialSpacing = this.dialSpacing.value;

    let r0: number | undefined;
    let r1: number | undefined;
    let rs: number | undefined;
    let dr: number | undefined;
    if (innerRadius && outerRadius) {
      let dialCount = 0;
      for (let i = 0; i < childCount; i += 1) {
        const childView = childViews[i];
        if (childView instanceof DialView && childView._arrangement === "auto") {
          dialCount += 1;
        }
      }
      r0 = innerRadius.pxValue(size);
      r1 = outerRadius.pxValue(size);
      rs = dialSpacing ? dialSpacing.pxValue(size) : 0;
      dr = dialCount > 1 ? (r1 - r0 - rs * (dialCount - 1)) / dialCount : r1 - r0;
    }

    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof DialView && childView._arrangement === "auto") {
        if (limit && isFinite(limit)) {
          const total = childView.total();
          if (total) {
            childView.total(Math.max(total, limit));
          }
        }
        if (innerRadius && outerRadius) {
          childView.innerRadius(Length.px(r0!))
                   .outerRadius(Length.px(r0! + dr!));
          r0 = r0! + dr! + rs!;
        }
        if (startAngle) {
          childView.startAngle(startAngle);
        }
        if (deltaAngle) {
          childView.deltaAngle(deltaAngle);
        }
      }
    }

    const title = this.title();
    if (TypesetView.is(title)) {
      title.textAlign("center");
      title.textBaseline("middle");
    }
  }

  static fromAny(gauge: AnyGaugeView): GaugeView {
    if (gauge instanceof GaugeView) {
      return gauge;
    } else if (typeof gauge === "object" && gauge) {
      const view = new GaugeView();
      if (gauge.key !== void 0) {
        view.key(gauge.key);
      }
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
      if (gauge.deltaAngle !== void 0) {
        view.deltaAngle(gauge.deltaAngle);
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
      if (dials) {
        for (let i = 0, n = dials.length; i < n; i += 1) {
          view.addDial(dials[i]);
        }
      }
      return view;
    }
    throw new TypeError("" + gauge);
  }
}
