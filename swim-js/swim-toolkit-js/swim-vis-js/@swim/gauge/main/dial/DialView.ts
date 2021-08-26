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
import {ViewContextType, View, ViewProperty, ViewAnimator, ViewFastener} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
  GraphicsViewController,
  LayerView,
  CanvasContext,
  CanvasRenderer,
  FillView,
  Arc,
  TypesetView,
  AnyTextRunView,
  TextRunView,
} from "@swim/graphics";
import type {DialViewObserver} from "./DialViewObserver";

export type DialViewArrangement = "auto" | "manual";

export type AnyDialView = DialView | DialViewInit;

export interface DialViewInit extends GraphicsViewInit {
  value?: number;
  limit?: number;
  center?: AnyR2Point;
  innerRadius?: AnyLength;
  outerRadius?: AnyLength;
  startAngle?: AnyAngle;
  sweepAngle?: AnyAngle;
  cornerRadius?: AnyLength;
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
  arrangement?: DialViewArrangement;
  label?: GraphicsView | string;
  legend?: GraphicsView | string;
}

export class DialView extends LayerView {
  override initView(init: DialViewInit): void {
    super.initView(init);
    if (init.value !== void 0) {
      this.value(init.value);
    }
    if (init.limit !== void 0) {
      this.limit(init.limit);
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
    if (init.startAngle !== void 0) {
      this.startAngle(init.startAngle);
    }
    if (init.sweepAngle !== void 0) {
      this.sweepAngle(init.sweepAngle);
    }
    if (init.cornerRadius !== void 0) {
      this.cornerRadius(init.cornerRadius);
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
    if (init.arrangement !== void 0) {
      this.arrangement(init.arrangement);
    }
    if (init.label !== void 0) {
      this.label(init.label);
    }
    if (init.legend !== void 0) {
      this.legend(init.legend);
    }
  }

  override readonly viewController!: GraphicsViewController & DialViewObserver | null;

  override readonly viewObservers!: ReadonlyArray<DialViewObserver>;

  protected willSetValue(newValue: number, oldValue: number): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetDialValue !== void 0) {
      viewController.viewWillSetDialValue(newValue, oldValue, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDialValue !== void 0) {
        viewObserver.viewWillSetDialValue(newValue, oldValue, this);
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
      if (viewObserver.viewDidSetDialValue !== void 0) {
        viewObserver.viewDidSetDialValue(newValue, oldValue, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetDialValue !== void 0) {
      viewController.viewDidSetDialValue(newValue, oldValue, this);
    }
  }

  @ViewAnimator<DialView, number>({
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

  protected willSetLimit(newLimit: number, oldLimit: number): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetDialLimit !== void 0) {
      viewController.viewWillSetDialLimit(newLimit, oldLimit, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDialLimit !== void 0) {
        viewObserver.viewWillSetDialLimit(newLimit, oldLimit, this);
      }
    }
  }

  protected onSetLimit(newLimit: number, oldLimit: number): void {
    // hook
  }

  protected didSetLimit(newLimit: number, oldLimit: number): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewDidSetDialLimit !== void 0) {
        viewObserver.viewDidSetDialLimit(newLimit, oldLimit, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetDialLimit !== void 0) {
      viewController.viewDidSetDialLimit(newLimit, oldLimit, this);
    }
  }

  @ViewAnimator<DialView, number>({
    type: Number,
    state: 1,
    willSetValue(newLimit: number, oldLimit: number): void {
      this.owner.willSetLimit(newLimit, oldLimit);
    },
    didSetValue(newLimit: number, oldLimit: number): void {
      this.owner.onSetLimit(newLimit, oldLimit);
      this.owner.didSetLimit(newLimit, oldLimit);
    },
  })
  readonly limit!: ViewAnimator<this, number>;

  @ViewAnimator({type: R2Point, inherit: true, state: R2Point.origin()})
  readonly center!: ViewAnimator<this, R2Point, AnyR2Point>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(30)})
  readonly innerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(40)})
  readonly outerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Angle, inherit: true, state: Angle.rad(-Math.PI / 2)})
  readonly startAngle!: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Angle, inherit: true, state: Angle.rad(2 * Math.PI)})
  readonly sweepAngle!: ViewAnimator<this, Angle, AnyAngle>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(50)})
  readonly cornerRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, inherit: true, state: null, look: Look.subduedColor})
  readonly dialColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Color, inherit: true, state: null, look: Look.accentColor})
  readonly meterColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(25)})
  readonly labelPadding!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Number, inherit: true, state: 1.0})
  readonly tickAlign!: ViewAnimator<this, number>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(45)})
  readonly tickRadius!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, inherit: true, state: Length.pct(50)})
  readonly tickLength!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, inherit: true, state: Length.px(1)})
  readonly tickWidth!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Length, inherit: true, state: Length.px(2)})
  readonly tickPadding!: ViewAnimator<this, Length, AnyLength>;

  @ViewAnimator({type: Color, inherit: true, state: null, look: Look.neutralColor})
  readonly tickColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Font, inherit: true})
  readonly font!: ViewAnimator<this, Font | null, AnyFont | null>;

  @ViewAnimator({type: Color, inherit: true, look: Look.mutedColor})
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
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetDialLabel !== void 0) {
      viewController.viewWillSetDialLabel(newLabelView, oldLabelView, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDialLabel !== void 0) {
        viewObserver.viewWillSetDialLabel(newLabelView, oldLabelView, this);
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
      if (viewObserver.viewDidSetDialLabel !== void 0) {
        viewObserver.viewDidSetDialLabel(newLabelView, oldLabelView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetDialLabel !== void 0) {
      viewController.viewDidSetDialLabel(newLabelView, oldLabelView, this);
    }
  }

  @ViewFastener<DialView, GraphicsView, AnyTextRunView>({
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
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewWillSetDialLegend !== void 0) {
      viewController.viewWillSetDialLegend(newLegendView, oldLegendView, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.viewWillSetDialLegend !== void 0) {
        viewObserver.viewWillSetDialLegend(newLegendView, oldLegendView, this);
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
      if (viewObserver.viewDidSetDialLegend !== void 0) {
        viewObserver.viewDidSetDialLegend(newLegendView, oldLegendView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.viewDidSetDialLegend !== void 0) {
      viewController.viewDidSetDialLegend(newLegendView, oldLegendView, this);
    }
  }

  @ViewFastener<DialView, GraphicsView, AnyTextRunView>({
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

  @ViewProperty({type: String, state: "auto"})
  readonly arrangement!: ViewProperty<this, DialViewArrangement>;

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
      this.renderDial(context, this.viewFrame);
      context.restore();
    }
  }

  protected renderDial(context: CanvasContext, frame: R2Box): void {
    const width = frame.width;
    const height = frame.height;
    const size = Math.min(width, height);
    const value = this.value.getValue();
    const limit = this.limit.getValue();
    const delta = limit !== 0 ? value / limit : 0;

    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.startAngle.getValue().rad();
    const sweepAngle = this.sweepAngle.getValue().rad();
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const dial = new Arc(center, innerRadius, outerRadius, startAngle,
                         sweepAngle, Angle.zero(), null, cornerRadius);
    const meter = dial.withSweepAngle(sweepAngle.times(delta));

    context.save();

    context.beginPath();
    const dialColor = this.dialColor.value;
    if (dialColor !== null) {
      context.fillStyle = dialColor.toString();
    }
    dial.draw(context, frame);
    if (dialColor !== null) {
      context.fill();
    }
    context.clip();

    const meterColor = this.meterColor.value;
    if (meterColor !== null) {
      context.beginPath();
      context.fillStyle = meterColor.toString();
      meter.draw(context, frame);
      context.fill();
    }

    context.restore();

    const labelView = this.label.view;
    if (labelView !== null && !labelView.isHidden()) {
      const r = (innerRadius.value + outerRadius.value) / 2;
      const rx = r * Math.cos(startAngle.value + Equivalent.Epsilon);
      const ry = r * Math.sin(startAngle.value + Equivalent.Epsilon);

      let textAlign: CanvasTextAlign;
      if (rx >= 0) {
        if (ry >= 0) { // top-right
          textAlign = "start";
        } else { // bottom-right
          textAlign = "end";
        }
      } else {
        if (ry < 0) { // bottom-left
          textAlign = "end";
        } else { // top-left
          textAlign = "start";
        }
      }
      const padAngle = startAngle.value - Math.PI / 2;
      const labelPadding = this.labelPadding.getValue().pxValue(deltaRadius);
      const dx = labelPadding * Math.cos(padAngle);
      const dy = labelPadding * Math.sin(padAngle);

      if (TypesetView.is(labelView)) {
        labelView.textAlign.setState(textAlign, View.Intrinsic);
        labelView.textBaseline.setState("middle", View.Intrinsic);
        labelView.textOrigin.setState(new R2Point(center.x + rx + dx, center.y + ry + dy), View.Intrinsic);
      }
    }

    const legendView = this.legend.view;
    if (legendView !== null && !legendView.isHidden()) {
      const tickAlign = this.tickAlign.getValue();
      const tickAngle = startAngle.value + sweepAngle.value * delta * tickAlign;
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

      if (tickColor !== null) {
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

  protected override doHitTest(x: number, y: number, viewContext: ViewContextType<this>): GraphicsView | null {
    let hit = super.doHitTest(x, y, viewContext);
    if (hit === null) {
      const renderer = viewContext.renderer;
      if (renderer instanceof CanvasRenderer) {
        const context = renderer.context;
        context.save();
        x *= renderer.pixelRatio;
        y *= renderer.pixelRatio;
        hit = this.hitTestDial(x, y, context, this.viewFrame);
        context.restore();
      }
    }
    return hit;
  }

  protected hitTestDial(x: number, y: number, context: CanvasContext, frame: R2Box): GraphicsView | null {
    const size = Math.min(frame.width, frame.height);
    const center = this.center.getValue();
    const innerRadius = this.innerRadius.getValue().px(size);
    const outerRadius = this.outerRadius.getValue().px(size);
    const deltaRadius = outerRadius.value - innerRadius.value;
    const startAngle = this.startAngle.getValue();
    const sweepAngle = this.sweepAngle.getValue();
    const cornerRadius = this.cornerRadius.getValue().px(deltaRadius);
    const dial = new Arc(center, innerRadius, outerRadius, startAngle,
                         sweepAngle, Angle.zero(), null, cornerRadius);

    context.beginPath();
    dial.draw(context, frame);
    if (context.isPointInPath(x, y)) {
      return this;
    }
    return null;
  }

  static override create(): DialView {
    return new DialView();
  }

  static fromInit(init: DialViewInit): DialView {
    const view = new DialView();
    view.initView(init);
    return view;
  }

  static fromAny(value: AnyDialView): DialView {
    if (value instanceof DialView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return DialView.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
