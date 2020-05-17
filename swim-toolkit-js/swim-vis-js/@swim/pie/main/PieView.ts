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
import {AnySliceView, SliceView} from "./SliceView";

export type AnyPieView = PieView | PieViewInit;

export interface PieViewInit extends RenderedViewInit {
  limit?: number;
  center?: AnyPointR2;
  baseAngle?: AnyAngle;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
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
  title?: View | string;
  slices?: AnySliceView[];
}

export class PieView extends GraphicsView {
  get viewController(): GraphicsViewController<PieView> | null {
    return this._viewController;
  }

  @MemberAnimator(Number, {value: 0})
  limit: MemberAnimator<this, number>;

  @MemberAnimator(PointR2, {value: PointR2.origin()})
  center: MemberAnimator<this, PointR2, AnyPointR2>;

  @MemberAnimator(Angle, {value: Angle.rad(-Math.PI / 2)})
  baseAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length, {value: Length.pct(3)})
  innerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {value: Length.pct(25)})
  outerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Angle, {value: Angle.deg(2)})
  padAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length, {value: null})
  padRadius: MemberAnimator<this, Length | null, AnyLength | null>;

  @MemberAnimator(Length, {value: Length.zero()})
  cornerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length, {value: Length.pct(50)})
  labelRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color, {value: Color.black()})
  sliceColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number, {value: 0.5})
  tickAlign: MemberAnimator<this, number>;

  @MemberAnimator(Length, {value: Length.pct(30)})
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

  addSlice(slice: AnySliceView): void {
    slice = SliceView.fromAny(slice);
    this.appendChildView(slice);
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
    this.layoutPie(this.viewFrame);
  }

  protected layoutPie(frame: BoxR2): void {
    const childViews = this._childViews;
    const childCount = childViews.length;

    if (this.center.isAuto()) {
      const cx = (frame.xMin + frame.xMax) / 2;
      const cy = (frame.yMin + frame.yMax) / 2;
      this.center.setAutoState(new PointR2(cx, cy))
    }

    let total = 0;
    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof SliceView) {
        const value = childView.value.value!;
        if (isFinite(value)) {
          total += value;
        }
      }
    }
    total = Math.max(total, this.limit.value!);

    let baseAngle = this.baseAngle.value!.rad();
    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof SliceView) {
        childView.total.setAutoState(total);
        childView.phaseAngle.setAutoState(baseAngle);
        const value = childView.value.value!;
        if (isFinite(value)) {
          const delta = total !== 0 ? value / total : 0;
          baseAngle = Angle.rad(baseAngle.value + 2 * Math.PI * delta);
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

  static fromAny(pie: AnyPieView): PieView {
    if (pie instanceof PieView) {
      return pie;
    } else if (typeof pie === "object" && pie !== null) {
      const view = new PieView();
      if (pie.limit !== void 0) {
        view.limit(pie.limit);
      }
      if (pie.center !== void 0) {
        view.center(pie.center);
      }
      if (pie.baseAngle !== void 0) {
        view.baseAngle(pie.baseAngle);
      }
      if (pie.innerRadius !== void 0) {
        view.innerRadius(pie.innerRadius);
      }
      if (pie.outerRadius !== void 0) {
        view.outerRadius(pie.outerRadius);
      }
      if (pie.padAngle !== void 0) {
        view.padAngle(pie.padAngle);
      }
      if (pie.padRadius !== void 0) {
        view.padRadius(pie.padRadius);
      }
      if (pie.cornerRadius !== void 0) {
        view.cornerRadius(pie.cornerRadius);
      }
      if (pie.labelRadius !== void 0) {
        view.labelRadius(pie.labelRadius);
      }
      if (pie.sliceColor !== void 0) {
        view.sliceColor(pie.sliceColor);
      }
      if (pie.tickAlign !== void 0) {
        view.tickAlign(pie.tickAlign);
      }
      if (pie.tickRadius !== void 0) {
        view.tickRadius(pie.tickRadius);
      }
      if (pie.tickLength !== void 0) {
        view.tickLength(pie.tickLength);
      }
      if (pie.tickWidth !== void 0) {
        view.tickWidth(pie.tickWidth);
      }
      if (pie.tickPadding !== void 0) {
        view.tickPadding(pie.tickPadding);
      }
      if (pie.tickColor !== void 0) {
        view.tickColor(pie.tickColor);
      }
      if (pie.font !== void 0) {
        view.font(pie.font);
      }
      if (pie.textColor !== void 0) {
        view.textColor(pie.textColor);
      }
      if (pie.title !== void 0) {
        view.title(pie.title);
      }
      const slices = pie.slices;
      if (slices !== void 0) {
        for (let i = 0, n = slices.length; i < n; i += 1) {
          view.addSlice(slices[i]);
        }
      }
      if (pie.hidden !== void 0) {
        view.setHidden(pie.hidden);
      }
      if (pie.culled !== void 0) {
        view.setCulled(pie.culled);
      }
      return view;
    }
    throw new TypeError("" + pie);
  }
}
