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
import {
  ViewContextType,
  ViewFlags,
  View,
  ViewAnimator,
  GraphicsViewInit,
  LayerView,
  TypesetView,
} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {AnySliceView, SliceView} from "./SliceView";

export type AnyPieView = PieView | PieViewInit;

export interface PieViewInit extends GraphicsViewInit {
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

export class PieView extends LayerView {
  initView(init: PieViewInit): void {
    super.initView(init);
    if (init.limit !== void 0) {
      this.limit(init.limit);
    }
    if (init.center !== void 0) {
      this.center(init.center);
    }
    if (init.baseAngle !== void 0) {
      this.baseAngle(init.baseAngle);
    }
    if (init.innerRadius !== void 0) {
      this.innerRadius(init.innerRadius);
    }
    if (init.outerRadius !== void 0) {
      this.outerRadius(init.outerRadius);
    }
    if (init.padAngle !== void 0) {
      this.padAngle(init.padAngle);
    }
    if (init.padRadius !== void 0) {
      this.padRadius(init.padRadius);
    }
    if (init.cornerRadius !== void 0) {
      this.cornerRadius(init.cornerRadius);
    }
    if (init.labelRadius !== void 0) {
      this.labelRadius(init.labelRadius);
    }
    if (init.sliceColor !== void 0) {
      this.sliceColor(init.sliceColor);
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
    const slices = init.slices;
    if (slices !== void 0) {
      for (let i = 0, n = slices.length; i < n; i += 1) {
        this.addSlice(slices[i]);
      }
    }
  }

  @ViewAnimator({type: Number, state: 0})
  limit: ViewAnimator<this, number>;

  @ViewAnimator({type: PointR2, state: PointR2.origin()})
  center: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator({type: Angle, state: Angle.rad(-Math.PI / 2)})
  baseAngle: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Length, state: Length.pct(3)})
  innerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.pct(25)})
  outerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Angle, state: Angle.deg(2)})
  padAngle: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Length, state: null})
  padRadius: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Length, state: Length.zero()})
  cornerRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.pct(50)})
  labelRadius: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: Color.black()})
  sliceColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator({type: Number, state: 0.5})
  tickAlign: ViewAnimator<this, number>;

  @ViewAnimator({type: Length, state: Length.pct(30)})
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

  addSlice(slice: AnySliceView, key?: string): void {
    if (key === void 0) {
      key = slice.key;
    }
    slice = SliceView.fromAny(slice);
    this.appendChildView(slice, key);
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

  protected didAnimate(viewContext: ViewContextType<this>): void {
    this.layoutPie(this.viewFrame);
    super.didAnimate(viewContext);
  }

  protected layoutPie(frame: BoxR2): void {
    const childViews = this._childViews;
    const childCount = childViews.length;

    if (this.center.isAuto()) {
      const cx = (frame.xMin + frame.xMax) / 2;
      const cy = (frame.yMin + frame.yMax) / 2;
      this.center.setAutoState(new PointR2(cx, cy));
    }

    let total = 0;
    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof SliceView) {
        const value = childView.value.getValue();
        if (isFinite(value)) {
          total += value;
        }
      }
    }
    total = Math.max(total, this.limit.getValue());

    let baseAngle = this.baseAngle.getValue().rad();
    for (let i = 0; i < childCount; i += 1) {
      const childView = childViews[i];
      if (childView instanceof SliceView) {
        childView.total.setAutoState(total);
        childView.phaseAngle.setAutoState(baseAngle);
        const value = childView.value.getValue();
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

    this._viewFlags &= ~View.NeedsLayout;
  }

  static fromAny(pie: AnyPieView): PieView {
    if (pie instanceof PieView) {
      return pie;
    } else if (typeof pie === "object" && pie !== null) {
      return PieView.fromInit(pie);
    }
    throw new TypeError("" + pie);
  }

  static fromInit(init: PieViewInit): PieView {
    const view = new PieView();
    view.initView(init);
    return view;
  }
}
