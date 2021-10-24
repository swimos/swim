// Copyright 2015-2021 Swim Inc.
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

import type {Class, Initable} from "@swim/util";
import {Affinity, MemberFastenerClass, Animator} from "@swim/fastener";
import {AnyLength, Length, AnyAngle, Angle, AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {Look, ThemeAnimator} from "@swim/theme";
import {ViewContextType, AnyView, View, ViewRef, ViewSet} from "@swim/view";
import {GraphicsViewInit, GraphicsView, LayerView, TypesetView, TextRunView} from "@swim/graphics";
import {AnySliceView, SliceView} from "../slice/SliceView";
import type {PieViewObserver} from "./PieViewObserver";

export type AnyPieView = PieView | PieViewInit;

export interface PieViewInit extends GraphicsViewInit {
  limit?: number;
  center?: AnyR2Point;
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
  title?: GraphicsView | string;
  slices?: AnySliceView[];
}

/** @internal */
export interface PieViewSliceExt {
  attachLabelView(labelView: GraphicsView): void;
  detachLabelView(labelView: GraphicsView): void;
  attachLegendView(legendView: GraphicsView): void;
  detachLegendView(legendView: GraphicsView): void;
}

export class PieView extends LayerView {
  override readonly observerType?: Class<PieViewObserver>;

  @Animator({type: Number, state: 0, updateFlags: View.NeedsLayout})
  readonly limit!: Animator<this, number>;

  @Animator({type: R2Point, state: R2Point.origin(), updateFlags: View.NeedsLayout})
  readonly center!: Animator<this, R2Point, AnyR2Point>;

  @ThemeAnimator({type: Angle, state: Angle.rad(-Math.PI / 2), updateFlags: View.NeedsLayout})
  readonly baseAngle!: ThemeAnimator<this, Angle, AnyAngle>;

  @ThemeAnimator({type: Length, state: Length.pct(3)})
  readonly innerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, state: Length.pct(25)})
  readonly outerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Angle, state: Angle.deg(2)})
  readonly padAngle!: ThemeAnimator<this, Angle, AnyAngle>;

  @ThemeAnimator({type: Length, state: null})
  readonly padRadius!: ThemeAnimator<this, Length | null, AnyLength | null>;

  @ThemeAnimator({type: Length, state: Length.zero()})
  readonly cornerRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, state: Length.pct(50)})
  readonly labelRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Color, state: null, look: Look.accentColor})
  readonly sliceColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Number, state: 0.5})
  readonly tickAlign!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Length, state: Length.pct(30)})
  readonly tickRadius!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, state: Length.pct(50)})
  readonly tickLength!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, state: Length.px(1)})
  readonly tickWidth!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Length, state: Length.px(2)})
  readonly tickPadding!: ThemeAnimator<this, Length, AnyLength>;

  @ThemeAnimator({type: Color, state: null, look: Look.neutralColor})
  readonly tickColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Font, state: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({type: Color, state: null, look: Look.mutedColor})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ViewRef<PieView, GraphicsView & Initable<GraphicsViewInit | string>>({
    key: true,
    type: TextRunView,
    binds: true,
    initView(titleView: GraphicsView): void {
      if (TypesetView.is(titleView)) {
        titleView.textAlign.setState("center", Affinity.Intrinsic);
        titleView.textBaseline.setState("middle", Affinity.Intrinsic);
        titleView.textOrigin.setState(this.owner.center.state, Affinity.Intrinsic);
      }
    },
    willAttachView(titleView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachPieTitle", titleView, this.owner);
    },
    didDetachView(titleView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachPieTitle", titleView, this.owner);
    },
    fromAny(value: AnyView<GraphicsView> | string): GraphicsView {
      if (typeof value === "string") {
        if (this.view instanceof TextRunView) {
          this.view.text(value);
          return this.view;
        } else {
          return TextRunView.fromAny(value);
        }
      } else {
        return GraphicsView.fromAny(value);
      }
    },
  })
  readonly title!: ViewRef<this, GraphicsView & Initable<GraphicsViewInit | string>>;
  static readonly title: MemberFastenerClass<PieView, "title">;

  @ViewSet<PieView, SliceView, PieViewSliceExt>({
    type: SliceView,
    binds: true,
    observes: true,
    willAttachView(sliceView: SliceView, targetView: View | null): void {
      this.owner.callObservers("viewWillAttachSlice", sliceView, targetView, this.owner);
    },
    didAttachView(sliceView: SliceView): void {
      const labelView = sliceView.label.view;
      if (labelView !== null) {
        this.attachLabelView(labelView);
      }
      const legendView = sliceView.legend.view;
      if (legendView !== null) {
        this.attachLegendView(legendView);
      }
    },
    willDetachView(sliceView: SliceView): void {
      const legendView = sliceView.legend.view;
      if (legendView !== null) {
        this.detachLegendView(legendView);
      }
      const labelView = sliceView.label.view;
      if (labelView !== null) {
        this.detachLabelView(labelView);
      }
    },
    didDetachView(sliceView: SliceView): void {
      this.owner.callObservers("viewDidDetachSlice", sliceView, this.owner);
    },
    viewDidSetSliceValue(newValue: number, oldValue: number): void {
      this.owner.requireUpdate(View.NeedsLayout);
    },
    viewWillAttachSliceLabel(labelView: GraphicsView): void {
      this.attachLabelView(labelView);
    },
    viewDidDetachSliceLabel(labelView: GraphicsView): void {
      this.detachLabelView(labelView);
    },
    attachLabelView(labelView: GraphicsView): void {
      // hook
    },
    detachLabelView(labelView: GraphicsView): void {
      // hook
    },
    viewWillAttachSliceLegend(legendView: GraphicsView): void {
      this.attachLegendView(legendView);
    },
    viewDidDetachSliceLegend(legendView: GraphicsView): void {
      this.detachLegendView(legendView);
    },
    attachLegendView(legendView: GraphicsView): void {
      // hook
    },
    detachLegendView(legendView: GraphicsView): void {
      // hook
    },
  })
  readonly slices!: ViewSet<this, SliceView>;
  static readonly slices: MemberFastenerClass<PieView, "slices">;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutPie(this.viewFrame);
  }

  protected layoutPie(frame: R2Box): void {
    if (this.center.hasAffinity(Affinity.Intrinsic)) {
      const cx = (frame.xMin + frame.xMax) / 2;
      const cy = (frame.yMin + frame.yMax) / 2;
      this.center.setState(new R2Point(cx, cy), Affinity.Intrinsic);
    }

    const sliceViews = this.slices.views;

    let total = 0;
    for (const viewId in sliceViews) {
      const sliceView = sliceViews[viewId]!;
      const value = sliceView.value.getValue();
      if (isFinite(value)) {
        total += value;
      }
    }
    total = Math.max(total, this.limit.getValue());

    let baseAngle = this.baseAngle.getValue().rad();
    for (const viewId in sliceViews) {
      const sliceView = sliceViews[viewId]!;
      sliceView.total.setState(total, Affinity.Intrinsic);
      sliceView.phaseAngle.setState(baseAngle, Affinity.Intrinsic);
      const value = sliceView.value.getValue();
      if (isFinite(value)) {
        const delta = total !== 0 ? value / total : 0;
        baseAngle = Angle.rad(baseAngle.value + 2 * Math.PI * delta);
      }
    }

    const titleView = this.title.view;
    if (TypesetView.is(titleView)) {
      titleView.textOrigin.setState(this.center.value, Affinity.Intrinsic);
    }
  }

  override init(init: PieViewInit): void {
    super.init(init);
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
        const slice = slices[i]!;
        this.appendChild(SliceView.fromAny(slice), slice.key);
      }
    }
  }
}
