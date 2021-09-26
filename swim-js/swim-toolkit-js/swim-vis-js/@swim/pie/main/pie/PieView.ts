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

import {AnyLength, Length, AnyAngle, Angle, AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ViewContextType, View, ViewAnimator, ViewFastener} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
  LayerView,
  TypesetView,
  AnyTextRunView,
  TextRunView,
} from "@swim/graphics";
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

export class PieView extends LayerView {
  constructor() {
    super();
    this.sliceFasteners = [];
  }

  override initView(init: PieViewInit): void {
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
        const slice = slices[i]!;
        this.appendChildView(SliceView.fromAny(slice), slice.key);
      }
    }
  }

  override readonly viewObservers!: ReadonlyArray<PieViewObserver>;

  @ViewAnimator({type: Number, state: 0, updateFlags: View.NeedsLayout})
  readonly limit!: ViewAnimator<this, number>;

  @ViewAnimator({type: R2Point, state: R2Point.origin(), updateFlags: View.NeedsLayout})
  readonly center!: ViewAnimator<this, R2Point, AnyR2Point>;

  @ViewAnimator({type: Angle, state: Angle.rad(-Math.PI / 2), updateFlags: View.NeedsLayout})
  readonly baseAngle!: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Length, state: Length.pct(3)})
  readonly innerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.pct(25)})
  readonly outerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Angle, state: Angle.deg(2)})
  readonly padAngle!: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Length, state: null})
  readonly padRadius!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Length, state: Length.zero()})
  readonly cornerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.pct(50)})
  readonly labelRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: null, look: Look.accentColor})
  readonly sliceColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Number, state: 0.5})
  readonly tickAlign!: ViewAnimator<this, number>;

  @ViewAnimator({type: Length, state: Length.pct(30)})
  readonly tickRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.pct(50)})
  readonly tickLength!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.px(1)})
  readonly tickWidth!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, state: Length.px(2)})
  readonly tickPadding!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, state: null, look: Look.neutralColor})
  readonly tickColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Font, state: null, inherit: true})
  readonly font!: ViewAnimator<this, Font | null, AnyFont | null>;

  @ViewAnimator({type: Color, state: null, look: Look.mutedColor})
  readonly textColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  protected initTitle(titleView: GraphicsView): void {
    if (TypesetView.is(titleView)) {
      titleView.textAlign.setState("center", View.Intrinsic);
      titleView.textBaseline.setState("middle", View.Intrinsic);
      titleView.textOrigin.setState(this.center.state, View.Intrinsic);
    }
  }

  protected attachTitle(titleView: GraphicsView): void {
    // hook
  }

  protected detachTitle(titleView: GraphicsView): void {
    // hook
  }

  protected willSetTitle(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetPieTitle !== void 0) {
        viewObserver.viewWillSetPieTitle(newTitleView, oldTitleView, this);
      }
    }
  }

  protected onSetTitle(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
    if (oldTitleView !== null) {
      this.detachTitle(oldTitleView);
    }
    if (newTitleView !== null) {
      this.attachTitle(newTitleView);
      this.initTitle(newTitleView);
    }
  }

  protected didSetTitle(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetPieTitle !== void 0) {
        viewObserver.viewDidSetPieTitle(newTitleView, oldTitleView, this);
      }
    }
  }

  @ViewFastener<PieView, GraphicsView, AnyTextRunView>({
    key: true,
    type: TextRunView,
    fromAny(value: GraphicsView | AnyTextRunView): GraphicsView {
      if (value instanceof GraphicsView) {
        return value;
      } else if (typeof value === "string" && this.view instanceof TextRunView) {
        this.view.text(value);
        return this.view;
      } else {
        return TextRunView.fromAny(value);
      }
    },
    willSetView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.willSetTitle(newTitleView, oldTitleView);
    },
    onSetView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.onSetTitle(newTitleView, oldTitleView);
    },
    didSetView(newTitleView: GraphicsView | null, oldTitleView: GraphicsView | null): void {
      this.owner.didSetTitle(newTitleView, oldTitleView);
    },
  })
  readonly title!: ViewFastener<this, GraphicsView, AnyTextRunView>;

  insertSlice(sliceView: AnySliceView, targetView: View | null = null): void {
    sliceView = SliceView.fromAny(sliceView);
    const sliceFasteners = this.sliceFasteners as ViewFastener<this, SliceView>[];
    let targetIndex = sliceFasteners.length;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      if (sliceFastener.view === sliceView) {
        return;
      } else if (sliceFastener.view === targetView) {
        targetIndex = i;
      }
    }
    const sliceFastener = this.createSliceFastener(sliceView);
    sliceFasteners.splice(targetIndex, 0, sliceFastener);
    sliceFastener.setView(sliceView, targetView);
    if (this.isMounted()) {
      sliceFastener.mount();
    }
  }

  removeSlice(sliceView: SliceView): void {
    const sliceFasteners = this.sliceFasteners as ViewFastener<this, SliceView>[];
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      if (sliceFastener.view === sliceView) {
        sliceFastener.setView(null);
        if (this.isMounted()) {
          sliceFastener.unmount();
        }
        sliceFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initSlice(sliceView: SliceView, sliceFastener: ViewFastener<this, SliceView>): void {
    const labelView = sliceView.label.view;
    if (labelView !== null) {
      this.initSliceLabel(labelView, sliceFastener);
    }
    const legendView = sliceView.legend.view;
    if (legendView !== null) {
      this.initSliceLegend(legendView, sliceFastener);
    }
  }

  protected attachSlice(sliceView: SliceView, sliceFastener: ViewFastener<this, SliceView>): void {
    // hook
  }

  protected detachSlice(sliceView: SliceView, sliceFastener: ViewFastener<this, SliceView>): void {
    // hook
  }

  protected willSetSlice(newSliceView: SliceView | null, oldSliceView: SliceView | null,
                         targetView: View | null, sliceFastener: ViewFastener<this, SliceView>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetSlice !== void 0) {
        viewObserver.viewWillSetSlice(newSliceView, oldSliceView, targetView, this);
      }
    }
  }

  protected onSetSlice(newSliceView: SliceView | null, oldSliceView: SliceView | null,
                       targetView: View | null, sliceFastener: ViewFastener<this, SliceView>): void {
    if (oldSliceView !== null) {
      this.detachSlice(oldSliceView, sliceFastener);
    }
    if (newSliceView !== null) {
      this.attachSlice(newSliceView, sliceFastener);
      this.initSlice(newSliceView, sliceFastener);
    }
  }

  protected didSetSlice(newSliceView: SliceView | null, oldSliceView: SliceView | null,
                        targetView: View | null, sliceFastener: ViewFastener<this, SliceView>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetSlice !== void 0) {
        viewObserver.viewDidSetSlice(newSliceView, oldSliceView, targetView, this);
      }
    }
  }

  protected onSetSliceValue(newValue: number, oldValue: number,
                            sliceFastener: ViewFastener<this, SliceView>): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected initSliceLabel(labelView: GraphicsView, sliceFastener: ViewFastener<this, SliceView>): void {
    // hook
  }

  protected onSetSliceLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null,
                            sliceFastener: ViewFastener<this, SliceView>): void {
    if (newLabelView !== null) {
      this.initSliceLabel(newLabelView, sliceFastener);
    }
  }

  protected initSliceLegend(legendView: GraphicsView, sliceFastener: ViewFastener<this, SliceView>): void {
    // hook
  }

  protected onSetSliceLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null,
                             sliceFastener: ViewFastener<this, SliceView>): void {
    if (newLegendView !== null) {
      this.initSliceLegend(newLegendView, sliceFastener);
    }
  }

  /** @hidden */
  static SliceFastener = ViewFastener.define<PieView, SliceView>({
    type: SliceView,
    child: false,
    observe: true,
    willSetView(newSliceView: SliceView | null, oldSliceView: SliceView | null, targetView: View | null): void {
      this.owner.willSetSlice(newSliceView, oldSliceView, targetView, this);
    },
    onSetView(newSliceView: SliceView | null, oldSliceView: SliceView | null, targetView: View | null): void {
      this.owner.onSetSlice(newSliceView, oldSliceView, targetView, this);
    },
    didSetView(newSliceView: SliceView | null, oldSliceView: SliceView | null, targetView: View | null): void {
      this.owner.didSetSlice(newSliceView, oldSliceView, targetView, this);
    },
    viewDidSetSliceValue(newValue: number, oldValue: number): void {
      this.owner.onSetSliceValue(newValue, oldValue, this);
    },
    viewDidSetSliceLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetSliceLabel(newLabelView, oldLabelView, this);
    },
    viewDidSetSliceLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetSliceLegend(newLegendView, oldLegendView, this);
    },
  });

  protected createSliceFastener(sliceView: SliceView): ViewFastener<this, SliceView> {
    return new PieView.SliceFastener(this, sliceView.key, "slice");
  }

  /** @hidden */
  readonly sliceFasteners: ReadonlyArray<ViewFastener<this, SliceView>>;

  /** @hidden */
  protected mountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.mount();
    }
  }

  /** @hidden */
  protected unmountSliceFasteners(): void {
    const sliceFasteners = this.sliceFasteners;
    for (let i = 0, n = sliceFasteners.length; i < n; i += 1) {
      const sliceFastener = sliceFasteners[i]!;
      sliceFastener.unmount();
    }
  }

  protected detectSlice(view: View): SliceView | null {
    return view instanceof SliceView ? view : null;
  }

  protected override onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    const sliceView = this.detectSlice(childView);
    if (sliceView !== null) {
      this.insertSlice(sliceView, targetView);
    }
  }

  protected override onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    const sliceView = this.detectSlice(childView);
    if (sliceView !== null) {
      this.removeSlice(sliceView);
    }
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.layoutPie(this.viewFrame);
  }

  protected layoutPie(frame: R2Box): void {
    if (this.center.takesPrecedence(View.Intrinsic)) {
      const cx = (frame.xMin + frame.xMax) / 2;
      const cy = (frame.yMin + frame.yMax) / 2;
      this.center.setState(new R2Point(cx, cy), View.Intrinsic);
    }

    const sliceFasteners = this.sliceFasteners;
    const sliceCount = sliceFasteners.length;

    let total = 0;
    for (let i = 0; i < sliceCount; i += 1) {
      const sliceView = sliceFasteners[i]!.view;
      if (sliceView !== null) {
        const value = sliceView.value.getValue();
        if (isFinite(value)) {
          total += value;
        }
      }
    }
    total = Math.max(total, this.limit.getValue());

    let baseAngle = this.baseAngle.getValue().rad();
    for (let i = 0; i < sliceCount; i += 1) {
      const sliceView = sliceFasteners[i]!.view;
      if (sliceView !== null) {
        sliceView.total.setState(total, View.Intrinsic);
        sliceView.phaseAngle.setState(baseAngle, View.Intrinsic);
        const value = sliceView.value.getValue();
        if (isFinite(value)) {
          const delta = total !== 0 ? value / total : 0;
          baseAngle = Angle.rad(baseAngle.value + 2 * Math.PI * delta);
        }
      }
    }

    const titleView = this.title.view;
    if (TypesetView.is(titleView)) {
      titleView.textOrigin.setState(this.center.value, View.Intrinsic);
    }
  }

  /** @hidden */
  protected override mountViewFasteners(): void {
    super.mountViewFasteners();
    this.mountSliceFasteners();
  }

  /** @hidden */
  protected override unmountViewFasteners(): void {
    this.unmountSliceFasteners();
    super.unmountViewFasteners();
  }

  static override create(): PieView {
    return new PieView();
  }

  static fromInit(init: PieViewInit): PieView {
    const view = new PieView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnyPieView): PieView {
    if (value instanceof PieView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
