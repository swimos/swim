// Copyright 2015-2023 Nstream, inc.
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

import type {Class} from "@swim/util";
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {Observes} from "@swim/util";
import {Affinity} from "@swim/component";
import {Animator} from "@swim/component";
import {Length} from "@swim/math";
import {Angle} from "@swim/math";
import {R2Point} from "@swim/math";
import type {R2Box} from "@swim/math";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import {ViewSet} from "@swim/view";
import type {GraphicsViewObserver} from "@swim/graphics";
import {GraphicsView} from "@swim/graphics";
import {TypesetView} from "@swim/graphics";
import {TextRunView} from "@swim/graphics";
import {SliceView} from "./SliceView";

/** @public */
export interface PieViewObserver<V extends PieView = PieView> extends GraphicsViewObserver<V> {
  viewWillAttachTitle?(titleView: GraphicsView, view: V): void;

  viewDidDetachTitle?(titleView: GraphicsView, view: V): void;

  viewWillAttachSlice?(sliceView: SliceView, targetView: View | null, view: V): void;

  viewDidDetachSlice?(sliceView: SliceView, view: V): void;
}

/** @public */
export class PieView extends GraphicsView {
  declare readonly observerType?: Class<PieViewObserver>;

  @Animator({valueType: Number, value: 0, updateFlags: View.NeedsLayout})
  readonly limit!: Animator<this, number>;

  @Animator({valueType: R2Point, value: R2Point.origin(), updateFlags: View.NeedsLayout})
  readonly center!: Animator<this, R2Point>;

  @ThemeAnimator({valueType: Angle, value: Angle.rad(-Math.PI / 2), updateFlags: View.NeedsLayout})
  readonly baseAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Length, value: Length.pct(3)})
  readonly innerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.pct(25)})
  readonly outerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Angle, value: Angle.deg(2)})
  readonly padAngle!: ThemeAnimator<this, Angle>;

  @ThemeAnimator({valueType: Length, value: null})
  readonly padRadius!: ThemeAnimator<this, Length | null>;

  @ThemeAnimator({valueType: Length, value: Length.zero()})
  readonly cornerRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.pct(50)})
  readonly labelRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.accentColor})
  readonly sliceColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, value: 0.5})
  readonly tickAlign!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Length, value: Length.pct(30)})
  readonly tickRadius!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.pct(50)})
  readonly tickLength!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.px(1)})
  readonly tickWidth!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Length, value: Length.px(2)})
  readonly tickPadding!: ThemeAnimator<this, Length>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.legendColor})
  readonly tickColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null>;

  @ThemeAnimator({valueType: Color, value: null, look: Look.legendColor})
  readonly textColor!: ThemeAnimator<this, Color | null>;

  @ViewRef({
    viewType: TextRunView,
    viewKey: true,
    binds: true,
    initView(titleView: GraphicsView): void {
      if (TypesetView[Symbol.hasInstance](titleView)) {
        titleView.setIntrinsic({
          textAlign: "center",
          textBaseline: "middle",
          textOrigin: this.owner.center.state,
        });
      }
    },
    willAttachView(titleView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachTitle", titleView, this.owner);
    },
    didDetachView(titleView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachTitle", titleView, this.owner);
    },
    fromLike(value: GraphicsView | LikeType<GraphicsView> | string | undefined): GraphicsView {
      if (value === void 0 || typeof value === "string") {
        let view = this.view;
        if (view === null) {
          view = this.createView();
        }
        if (view instanceof TextRunView) {
          view.text.setState(value !== void 0 ? value : "");
        }
        return view;
      }
      return super.fromLike(value);
    },
  })
  readonly title!: ViewRef<this, Like<GraphicsView, string | undefined>>;

  @ViewSet({
    viewType: SliceView,
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
    viewDidSetValue(value: number): void {
      this.owner.requireUpdate(View.NeedsLayout);
    },
    viewWillAttachLabel(labelView: GraphicsView): void {
      this.attachLabelView(labelView);
    },
    viewDidDetachLabel(labelView: GraphicsView): void {
      this.detachLabelView(labelView);
    },
    attachLabelView(labelView: GraphicsView): void {
      // hook
    },
    detachLabelView(labelView: GraphicsView): void {
      // hook
    },
    viewWillAttachLegend(legendView: GraphicsView): void {
      this.attachLegendView(legendView);
    },
    viewDidDetachLegend(legendView: GraphicsView): void {
      this.detachLegendView(legendView);
    },
    attachLegendView(legendView: GraphicsView): void {
      // hook
    },
    detachLegendView(legendView: GraphicsView): void {
      // hook
    },
  })
  readonly slices!: ViewSet<this, SliceView> & Observes<SliceView> & {
    attachLabelView(labelView: GraphicsView): void,
    detachLabelView(labelView: GraphicsView): void,
    attachLegendView(legendView: GraphicsView): void,
    detachLegendView(legendView: GraphicsView): void,
  };

  protected override onLayout(): void {
    super.onLayout();
    this.layoutPie(this.viewFrame);
  }

  protected layoutPie(frame: R2Box): void {
    if (this.center.hasAffinity(Affinity.Intrinsic)) {
      const cx = (frame.xMin + frame.xMax) / 2;
      const cy = (frame.yMin + frame.yMax) / 2;
      this.center.setIntrinsic(new R2Point(cx, cy));
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
      sliceView.total.setIntrinsic(total);
      sliceView.phaseAngle.setIntrinsic(baseAngle);
      const value = sliceView.value.getValue();
      if (isFinite(value)) {
        const delta = total !== 0 ? value / total : 0;
        baseAngle = Angle.rad(baseAngle.value + 2 * Math.PI * delta);
      }
    }

    const titleView = this.title.view;
    if (TypesetView[Symbol.hasInstance](titleView)) {
      titleView.textOrigin.setIntrinsic(this.center.value);
    }
  }
}
