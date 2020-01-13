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

import {AnyAngle, Angle} from "@swim/angle";
import {AnyLength, Length} from "@swim/length";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {
  MemberAnimator,
  ViewInit,
  View,
  RenderViewContext,
  TypesetView,
  GraphicView,
  GraphicViewController,
} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {AnySliceView, SliceView} from "./SliceView";

export type AnyPieView = PieView | PieViewInit;

export interface PieViewInit extends ViewInit {
  limit?: number;
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
  font?: AnyFont | null;
  textColor?: AnyColor | null;
  title?: View | string | null;
  slices?: AnySliceView[] | null;
}

export class PieView extends GraphicView {
  /** @hidden */
  _viewController: GraphicViewController<PieView> | null;

  constructor() {
    super();
    this.limit.setState(0);
    this.baseAngle.setState(Angle.rad(-Math.PI / 2));
    this.innerRadius.setState(Length.pct(3));
    this.outerRadius.setState(Length.pct(25));
    this.padAngle.setState(Angle.deg(2));
    this.padRadius.setState(null);
    this.cornerRadius.setState(Length.zero());
    this.labelRadius.setState(Length.pct(50));
    this.sliceColor.setState(Color.black());
    this.tickAlign.setState(0.5);
    this.tickRadius.setState(Length.pct(30));
    this.tickLength.setState(Length.pct(50));
    this.tickWidth.setState(Length.px(1));
    this.tickPadding.setState(Length.px(1));
    this.tickColor.setState(Color.black());
  }

  get viewController(): GraphicViewController<PieView> | null {
    return this._viewController;
  }

  @MemberAnimator(Number)
  limit: MemberAnimator<this, number>;

  @MemberAnimator(Angle)
  baseAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length)
  innerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  outerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Angle)
  padAngle: MemberAnimator<this, Angle, AnyAngle>;

  @MemberAnimator(Length)
  padRadius: MemberAnimator<this, Length | null, AnyLength | null>;

  @MemberAnimator(Length)
  cornerRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Length)
  labelRadius: MemberAnimator<this, Length, AnyLength>;

  @MemberAnimator(Color)
  sliceColor: MemberAnimator<this, Color, AnyColor>;

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

  needsUpdate(updateFlags: number, viewContext: RenderViewContext): number {
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      updateFlags = updateFlags | View.NeedsLayout;
    }
    if ((updateFlags & (View.NeedsAnimate | View.NeedsLayout)) !== 0) {
      updateFlags = updateFlags | View.NeedsRender;
    }
    return updateFlags;
  }

  protected onAnimate(viewContext: RenderViewContext): void {
    const t = viewContext.updateTime;
    this.limit.onFrame(t);
    this.baseAngle.onFrame(t);
    this.innerRadius.onFrame(t);
    this.outerRadius.onFrame(t);
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

    const childViews = this._childViews;
    for (let i = 0; i < childViews.length; i += 1) {
      const childView = childViews[i];
      if (childView instanceof SliceView) {
        childView.onAnimate(viewContext);
        childView.setUpdateFlags(childView.updateFlags & ~View.NeedsAnimate);
      }
    }
  }

  protected onLayout(viewContext: RenderViewContext): void {
    super.onLayout(viewContext);
    this.layoutPie();
  }

  protected layoutPie(): void {
    const childViews = this._childViews;
    const childCount = childViews.length;
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

    let baseAngle = this.baseAngle.value!;
    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof SliceView) {
        childView.total(total).phaseAngle(baseAngle);
        const value = childView.value.value!;
        if (isFinite(value)) {
          baseAngle = baseAngle.plus(Angle.rad(2 * Math.PI * value / (total || 1)));
        }
      }
    }

    const title = this.title();
    if (TypesetView.is(title)) {
      title.textAlign("center");
      title.textBaseline("middle");
    }
  }

  static fromAny(pie: AnyPieView): PieView {
    if (pie instanceof PieView) {
      return pie;
    } else if (typeof pie === "object" && pie) {
      const view = new PieView();
      if (pie.key !== void 0) {
        view.key(pie.key);
      }
      if (pie.limit !== void 0) {
        view.limit(pie.limit);
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
      if (slices) {
        for (let i = 0, n = slices.length; i < n; i += 1) {
          view.addSlice(slices[i]);
        }
      }
      return view;
    }
    throw new TypeError("" + pie);
  }
}
