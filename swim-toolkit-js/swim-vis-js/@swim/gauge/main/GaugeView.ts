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
import {ViewContextType, ViewFlags, View, ViewAnimator} from "@swim/view";
import {GraphicsViewInit, LayerView, TypesetView, AnyTextRunView, TextRunView} from "@swim/graphics";
import {AnyDialView, DialView} from "./DialView";

export type AnyGaugeView = GaugeView | GaugeViewInit;

export interface GaugeViewInit extends GraphicsViewInit {
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

export class GaugeView extends LayerView {
  initView(init: GaugeViewInit): void {
    super.initView(init);
    if (init.limit !== void 0) {
      this.limit(init.limit);
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
    if (init.dialSpacing !== void 0) {
      this.dialSpacing(init.dialSpacing);
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
    if (init.title !== void 0) {
      this.title(init.title);
    }
    const dials = init.dials;
    if (dials !== void 0) {
      for (let i = 0, n = dials.length; i < n; i += 1) {
        this.addDial(dials[i]);
      }
    }
  }

  @ViewAnimator({type: Number, state: 0})
  limit: ViewAnimator<this, number>;

  @ViewAnimator({type: PointR2, state: PointR2.origin()})
  center: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator({type: Length, state: Length.pct(30)})
  innerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.pct(40)})
  outerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Angle, state: Angle.rad(-Math.PI / 2)})
  startAngle: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Angle, state: Angle.rad(2 * Math.PI)})
  sweepAngle: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Length, state: Length.pct(50)})
  cornerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.px(1)})
  dialSpacing: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: Color.transparent()})
  dialColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator({type: Color, state: Color.black()})
  meterColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator({type: Length, state: Length.pct(25)})
  labelPadding: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Number, state: 0.5})
  tickAlign: ViewAnimator<this, number>;

  @ViewAnimator({type: Length, state: Length.pct(45)})
  tickRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.pct(50)})
  tickLength: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.px(1)})
  tickWidth: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.px(1)})
  tickPadding: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: Color.black()})
  tickColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator({type: Font, inherit: true})
  font: ViewAnimator<this, Font | undefined, AnyFont | undefined>;

  @ViewAnimator({type: Color, inherit: true})
  textColor: ViewAnimator<this, Color | undefined, AnyColor | undefined>;

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

  addDial(dial: AnyDialView, key?: string): void {
    if (key === void 0) {
      key = dial.key;
    }
    dial = DialView.fromAny(dial);
    this.appendChildView(dial);
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onRemoveChildView(childView: View): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected modifyUpdate(targetView: View, updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsAnimate;
    }
    additionalFlags |= super.modifyUpdate(targetView, updateFlags | additionalFlags);
    return additionalFlags;
  }

  needsProcess(processFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this._viewFlags & View.NeedsLayout) !== 0) {
      processFlags |= View.NeedsAnimate;
    }
    return processFlags;
  }

  protected onAnimate(viewContext: ViewContextType<this>): void {
    super.onAnimate(viewContext);
    this.animateGauge(this.viewFrame);
  }

  protected animateGauge(frame: BoxR2): void {
    if (this.center.isAuto()) {
      const cx = (frame.xMin + frame.xMax) / 2;
      const cy = (frame.yMin + frame.yMax) / 2;
      this.center.setAutoState(new PointR2(cx, cy));
    }

    const childViews = this._childViews;
    const childCount = childViews.length;
    const innerRadius = this.innerRadius.value;
    const outerRadius = this.outerRadius.value;
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
        if (innerRadius !== void 0 && outerRadius !== void 0) {
          childView.innerRadius.setAutoState(Length.px(r0!));
          childView.outerRadius.setAutoState(Length.px(r0! + dr!));
          r0 = r0! + dr! + rs!;
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

  protected didAnimate(viewContext: ViewContextType<this>): void {
    this.layoutGauge();
    super.didAnimate(viewContext);
  }

  protected layoutGauge(): void {
    const childViews = this._childViews;
    const childCount = childViews.length;

    const limit = this.limit.value;
    const startAngle = this.startAngle.value;
    const sweepAngle = this.sweepAngle.value;

    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof DialView && childView._arrangement === "auto") {
        if (limit !== void 0 && isFinite(limit)) {
          const total = childView.total.value;
          if (total !== void 0) {
            childView.total.setAutoState(Math.max(total, limit));
          }
        }
        if (startAngle !== void 0) {
          childView.startAngle.setAutoState(startAngle);
        }
        if (sweepAngle !== void 0) {
          childView.sweepAngle.setAutoState(sweepAngle);
        }
      }
    }

    this._viewFlags &= ~View.NeedsLayout;
  }

  static fromInit(init: GaugeViewInit): GaugeView {
    const view = new GaugeView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnyGaugeView): GaugeView {
    if (value instanceof GaugeView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
