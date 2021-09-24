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

import {Equivalent} from "@swim/util";
import {AnyLength, Length, AnyAngle, Angle, AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {Look} from "@swim/theme";
import {ViewContextType, View, ViewAnimator, ViewFastener} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
  LayerView,
  CanvasContext,
  CanvasRenderer,
  FillView,
  Arc,
  TypesetView,
  AnyTextRunView,
  TextRunView,
} from "@swim/graphics";
import type {SliceViewObserver} from "./SliceViewObserver";

export type AnySliceView = SliceView | SliceViewInit;

export interface SliceViewInit extends GraphicsViewInit {
  value?: number;
  total?: number;
  center?: AnyR2Point;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  phaseAngle?: AnyAngle;
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
  label?: GraphicsView | string;
  legend?: GraphicsView | string;
}

export class SliceView extends LayerView {
  override initView(init: SliceViewInit): void {
    super.initView(init);
    if (init.value !== void 0) {
      this.value(init.value);
    }
    if (init.total !== void 0) {
      this.total(init.total);
    }
    if (init.center !== void 0) {
      this.center(init.center);
    }
    if (init.innerRadius !== void 0) {
      this.innerRadius(init.innerRadius);
    }
    if (init.outerRadius !== void 0) {
      this.outerRadius(init.outerRadius);
    }
    if (init.phaseAngle !== void 0) {
      this.phaseAngle(init.phaseAngle);
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
    if (init.label !== void 0) {
      this.label(init.label);
    }
    if (init.legend !== void 0) {
      this.legend(init.legend);
    }
  }

  override readonly viewObservers!: ReadonlyArray<SliceViewObserver>;

  protected willSetValue(newValue: number, oldValue: number): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetSliceValue !== void 0) {
        viewObserver.viewWillSetSliceValue(newValue, oldValue, this);
      }
    }
  }

  protected onSetValue(newValue: number, oldValue: number): void {
    // hook
  }

  protected didSetValue(newValue: number, oldValue: number): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetSliceValue !== void 0) {
        viewObserver.viewDidSetSliceValue(newValue, oldValue, this);
      }
    }
  }

  @ViewAnimator<SliceView, number>({
    type: Number,
    state: 0,
    willSetValue(newValue: number, oldValue: number): void {
      this.owner.willSetValue(newValue, oldValue);
    },
    didSetValue(newValue: number, oldValue: number): void {
      this.owner.onSetValue(newValue, oldValue);
      this.owner.didSetValue(newValue, oldValue);
    },
  })
  readonly value!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, state: 1})
  readonly total!: ViewAnimator<this, number>;

  @ViewAnimator({type: R2Point, inherit: true, state: R2Point.origin()})
  readonly center!: ViewAnimator<this, R2Point, AnyR2Point>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(3)})
  readonly innerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(25)})
  readonly outerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Angle, state: Angle.zero()})
  readonly phaseAngle!: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Angle, inherit: true, state: Angle.deg(2)})
  readonly padAngle!: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Length, inherit: true, state: null})
  readonly padRadius!: ViewAnimator<this, Length | null, AnyLength | null>;

  @ViewAnimator({type: Length, inherit: true, state: Length.zero()})
  readonly cornerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(50)})
  readonly labelRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, inherit: true, state: null, look: Look.accentColor})
  readonly sliceColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Number, inherit: true, state: 0.5})
  readonly tickAlign!: ViewAnimator<this, number>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(30)})
  readonly tickRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(50)})
  readonly tickLength!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, inherit: true, state: Length.px(1)})
  readonly tickWidth!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, inherit: true, state: Length.px(2)})
  readonly tickPadding!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, inherit: true, state: null, look: Look.neutralColor})
  readonly tickColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Font, inherit: true, state: null})
  readonly font!: ViewAnimator<this, Font | null, AnyFont | null>;

  @ViewAnimator({type: Color, inherit: true, state: null, look: Look.mutedColor})
  readonly textColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  protected initLabel(labelView: GraphicsView): void {
    // hook
  }

  protected attachLabel(labelView: GraphicsView): void {
    // hook
  }

  protected detachLabel(labelView: GraphicsView): void {
    // hook
  }

  protected willSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetSliceLabel !== void 0) {
        viewObserver.viewWillSetSliceLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  protected onSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    if (oldLabelView !== null) {
      this.detachLabel(oldLabelView);
    }
    if (newLabelView !== null) {
      this.attachLabel(newLabelView);
      this.initLabel(newLabelView);
    }
  }

  protected didSetLabel(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetSliceLabel !== void 0) {
        viewObserver.viewDidSetSliceLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  @ViewFastener<SliceView, GraphicsView, AnyTextRunView>({
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
    willSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.willSetLabel(newLabelView, oldLabelView);
    },
    onSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.onSetLabel(newLabelView, oldLabelView);
    },
    didSetView(newLabelView: GraphicsView | null, oldLabelView: GraphicsView | null): void {
      this.owner.didSetLabel(newLabelView, oldLabelView);
    },
  })
  readonly label!: ViewFastener<this, GraphicsView, AnyTextRunView>;

  protected initLegend(legendView: GraphicsView | null): void {
    // hook
  }

  protected attachLegend(legendView: GraphicsView | null): void {
    // hook
  }

  protected detachLegend(legendView: GraphicsView | null): void {
    // hook
  }

  protected willSetLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetSliceLegend !== void 0) {
        viewObserver.viewWillSetSliceLegend(newLegendView, oldLegendView, this);
      }
    }
  }

  protected onSetLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    if (oldLegendView !== null) {
      this.detachLegend(oldLegendView);
    }
    if (newLegendView !== null) {
      this.attachLegend(newLegendView);
      this.initLegend(newLegendView);
    }
  }

  protected didSetLegend(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetSliceLegend !== void 0) {
        viewObserver.viewDidSetSliceLegend(newLegendView, oldLegendView, this);
      }
    }
  }

  @ViewFastener<SliceView, GraphicsView, AnyTextRunView>({
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
    willSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.willSetLegend(newLegendView, oldLegendView);
    },
    onSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.onSetLegend(newLegendView, oldLegendView);
    },
    didSetView(newLegendView: GraphicsView | null, oldLegendView: GraphicsView | null): void {
      this.owner.didSetLegend(newLegendView, oldLegendView);
    },
  })
  readonly legend!: ViewFastener<this, GraphicsView, AnyTextRunView>;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.center.onAnimate(viewContext.updateTime);
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    super.onRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.save();
      this.renderSlice(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderSlice(context: CanvasContext, frame: R2Box): void {
    const width = frame.width;
    const height = frame.height;
    const size = Math.min(width, height);
    const value = this.value.getValue();
    const total = this.total.getValue();
    const delta = total !== 0 ? value / total : 0;

    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.phaseAngle.getValue().rad();
    const sweepAngle = Angle.rad(2 * Math.PI * delta);
    const padAngle = this.padAngle.getValue();
    const padRadius = this.padRadius.getValueOr(null);
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const arc = new Arc(center, innerRadius, outerRadius, startAngle,
                        sweepAngle, padAngle, padRadius, cornerRadius);

    const sliceColor = this.sliceColor.value;
    if (sliceColor !== null) {
      context.beginPath();
      context.fillStyle = sliceColor.toString();
      arc.draw(context, frame);
      context.fill();
    }

    const labelView = this.label.view;
    if (labelView !== null && !labelView.isHidden()) {
      const labelRadius = this.labelRadius.getValue().pxValue(deltaRadius);
      const labelAngle = startAngle.value + sweepAngle.value / 2;
      const r = innerRadius.value + labelRadius;
      const rx = r * Math.cos(labelAngle);
      const ry = r * Math.sin(labelAngle);

      if (TypesetView.is(labelView)) {
        labelView.textAlign.setState("center", View.Intrinsic);
        labelView.textBaseline.setState("middle", View.Intrinsic);
        labelView.textOrigin.setState(new R2Point(center.x + rx, center.y + ry), View.Intrinsic);
      }
    }

    const legendView = this.legend.view;
    if (legendView !== null && !legendView.isHidden()) {
      const tickAlign = this.tickAlign.getValue();
      const tickAngle = startAngle.value + sweepAngle.value * tickAlign;
      const tickRadius = this.tickRadius.getValue().pxValue(size);
      const tickLength = this.tickLength.getValue().pxValue(width);
      const tickWidth = this.tickWidth.getValue().pxValue(size);
      const tickColor = this.tickColor.value;

      const cx = center.x;
      const cy = center.y;
      const r1x = outerRadius.value * Math.cos(tickAngle + Equivalent.Epsilon);
      const r1y = outerRadius.value * Math.sin(tickAngle + Equivalent.Epsilon);
      const r2x = tickRadius * Math.cos(tickAngle + Equivalent.Epsilon);
      const r2y = tickRadius * Math.sin(tickAngle + Equivalent.Epsilon);
      let dx = 0;

      if (tickColor !== null && tickWidth !== 0) {
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
      }

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

      if (TypesetView.is(legendView)) {
        const tickPadding = this.tickPadding.getValue().pxValue(size);
        if (FillView.is(legendView)) {
          legendView.fill.setState(tickColor, View.Intrinsic);
        }
        legendView.textAlign.setState(textAlign, View.Intrinsic);
        legendView.textBaseline.setState("alphabetic", View.Intrinsic);
        legendView.textOrigin.setState(new R2Point(cx + r2x + dx, cy + r2y - tickPadding), View.Intrinsic);
      }
    }
  }

  protected override hitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
      const p = renderer.transform.transform(x, y);
      const hit = this.hitTestSlice(p.x, p.y, context, this.viewFrame);
      context.restore();
      return hit;
    }
    return null;
  }

  protected hitTestSlice(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const size = Math.min(frame.width, frame.height);
    const value = this.value.getValue();
    const total = this.total.getValue();
    const delta = total !== 0 ? value / total : 0;

    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.phaseAngle.getValue().rad();
    const sweepAngle = Angle.rad(2 * Math.PI * delta);
    const padAngle = this.padAngle.getValue();
    const padRadius = this.padRadius.getValueOr(null);
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const arc = new Arc(center, innerRadius, outerRadius, startAngle,
                        sweepAngle, padAngle, padRadius, cornerRadius);

    context.beginPath();
    arc.draw(context, frame);
    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }

  static override create(): SliceView {
    return new SliceView();
  }

  static fromInit(init: SliceViewInit): SliceView {
    const view = new SliceView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnySliceView): SliceView {
    if (value instanceof SliceView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
