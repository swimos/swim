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

import {BTree} from "@swim/collections";
import {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {DateTime} from "@swim/time";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {NumberInterpolator} from "@swim/interpolate";
import {ContinuousScale, LinearScale, TimeScale} from "@swim/scale";
import {Tween, AnyTransition, Transition} from "@swim/transition";
import {StyleValue} from "@swim/style";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  ViewFlags,
  View,
  MemberAnimator,
  RenderedViewContext,
  RenderedViewInit,
  GraphicsView,
} from "@swim/view";
import {AnyTickView, TickView} from "../tick/TickView";
import {TickGenerator} from "../tick/TickGenerator";
import {AxisViewController} from "./AxisViewController";
import {TopAxisView} from "./TopAxisView";
import {RightAxisView} from "./RightAxisView";
import {BottomAxisView} from "./BottomAxisView";
import {LeftAxisView} from "./LeftAxisView";

export type AxisOrientation = "top" | "right" | "bottom" | "left";

export type AnyAxisView<D> = AxisView<D> | AxisViewInit<D>;

export interface AxisViewInit<D> extends RenderedViewInit {
  orientation: AxisOrientation;
  scale: ContinuousScale<D, number> | string;

  ticks?: AnyTickView<D>[];
  tickGenerator?: TickGenerator<D>;
  tickSpacing?: number;
  tickTransition?: AnyTransition<any>;

  domainColor?: AnyColor;
  domainWidth?: number;
  domainSerif?: number;

  tickMarkColor?: AnyColor;
  tickMarkWidth?: number;
  tickMarkLength?: number;

  tickLabelPadding?: number;

  gridLineColor?: AnyColor;
  gridLineWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;
}

export abstract class AxisView<D> extends GraphicsView {
  /** @hidden */
  readonly _ticks: BTree<D, TickView<D>>;
  /** @hidden */
  _tickGenerator: TickGenerator<D> | null;
  /** @hidden */
  _tickSpacing: number;
  /** @hidden */
  _tickTransition: Transition<any> | null;

  constructor(scale: ContinuousScale<D, number>) {
    super();
    this._ticks = new BTree();
    this._tickGenerator = TickGenerator.fromScale(scale);
    this._tickSpacing = 80;
    this._tickTransition = Transition.duration(200);
    this.scale.setAutoState(scale);
  }

  get viewController(): AxisViewController<D> | null {
    return this._viewController;
  }

  abstract get orientation(): AxisOrientation;

  @MemberAnimator(Object)
  scale: MemberAnimator<this, ContinuousScale<D, number>>;

  @MemberAnimator(PointR2, {value: PointR2.origin()})
  origin: MemberAnimator<this, PointR2, AnyPointR2>;

  @MemberAnimator(Color, {inherit: true})
  domainColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number, {inherit: true})
  domainWidth: MemberAnimator<this, number>;

  @MemberAnimator(Number, {inherit: true})
  domainSerif: MemberAnimator<this, number>;

  @MemberAnimator(Color, {inherit: true})
  tickMarkColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number, {inherit: true})
  tickMarkWidth: MemberAnimator<this, number>;

  @MemberAnimator(Number, {inherit: true})
  tickMarkLength: MemberAnimator<this, number>;

  @MemberAnimator(Number, {inherit: true})
  tickLabelPadding: MemberAnimator<this, number>;

  @MemberAnimator(Color, {inherit: true})
  gridLineColor: MemberAnimator<this, Color, AnyColor>;

  @MemberAnimator(Number, {inherit: true})
  gridLineWidth: MemberAnimator<this, number>;

  @MemberAnimator(Font, {inherit: true})
  font: MemberAnimator<this, Font, AnyFont>;

  @MemberAnimator(Color, {inherit: true})
  textColor: MemberAnimator<this, Color, AnyColor>;

  getTick(value: D): TickView<D> | undefined {
    return this._ticks.get(value);
  }

  insertTick(tick: AnyTickView<D>): void {
    tick = TickView.fromAny(tick, this.orientation);
    this.insertChildView(tick, this._ticks.nextValue(tick.value) || null);
  }

  removeTick(value: D): void {
    const tick = this._ticks.get(value);
    if (tick !== void 0) {
      tick.remove();
      this._ticks.delete(value);
    }
  }

  domain(): ReadonlyArray<D>;
  domain(x0: D[] | D | string, x1?: D, tween?: Tween<ContinuousScale<D, number>>): this;
  domain(x0?: D[] | string | D, x1?: D, tween?: Tween<ContinuousScale<D, number>>): ReadonlyArray<D> | this {
    let scale = this.scale.value!;
    if (x0 === void 0) {
      return scale.domain();
    } else {
      scale = scale.domain(x0 as any, x1);
      if (this.scale.isAuto() && !scale.equals(this.scale.state)) {
        this.scale.setAutoState(scale, tween);
      }
      return this;
    }
  }

  range(): ReadonlyArray<number>;
  range(y0: number[] | number, y1?: number, tween?: Tween<ContinuousScale<D, number>>): this;
  range(y0?: number[] | number, y1?: number, tween?: Tween<ContinuousScale<D, number>>): ReadonlyArray<number> | this {
    let scale = this.scale.value!;
    if (y0 === void 0) {
      return scale.range();
    } else {
      scale = scale.range(y0 as any, y1);
      if (this.scale.isAuto() && !scale.equals(this.scale.state)) {
        this.scale.setAutoState(scale, tween);
      }
      return this;
    }
  }

  tickGenerator(): TickGenerator<D> | null;
  tickGenerator(tickGenerator: TickGenerator<D> | null): this;
  tickGenerator(tickGenerator?: TickGenerator<D> | null): TickGenerator<D> | null | this {
    if (tickGenerator === void 0) {
      return this._tickGenerator;
    } else {
      this._tickGenerator = tickGenerator;
      return this;
    }
  }

  tickSpacing(): number;
  tickSpacing(tickSpacing: number): this;
  tickSpacing(tickSpacing?: number): number | this {
    if (tickSpacing === void 0) {
      return this._tickSpacing;
    } else {
      this._tickSpacing = tickSpacing;
      return this;
    }
  }

  tickTransition(): Transition<any> | null;
  tickTransition(tickTransition: AnyTransition<any> | null): this;
  tickTransition(tickTransition?: AnyTransition<any> | null): Transition<any> | null | this {
    if (tickTransition === void 0) {
      return this._tickTransition;
    } else {
      if (tickTransition !== null) {
        tickTransition = Transition.fromAny(tickTransition);
      }
      this._tickTransition = tickTransition;
      return this;
    }
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsLayout;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  protected willRender(viewContext: RenderedViewContext): void {
    super.willRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
    }
  }

  protected didRender(viewContext: RenderedViewContext): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      this.renderDomain(context, this.viewFrame);
      context.restore();
    }
    super.didRender(viewContext);
  }

  protected onLayout(viewContext: RenderedViewContext): void {
    super.onLayout(viewContext);
    if (this._tickGenerator !== null) {
      this.generateTicks(this._tickGenerator);
      this.layoutTicks(this.viewFrame);
    }
  }

  protected generateTicks(tickGenerator: TickGenerator<D>): void {
    const scale = this.scale.value!;
    if (this._tickSpacing !== 0) {
      const [y0, y1] = scale.range();
      const dy = Math.abs(y1 - y0);
      const n = Math.max(1, Math.floor(dy / this._tickSpacing));
      tickGenerator.count(n);
    }
    tickGenerator.domain(scale.domain());

    const oldTicks = this._ticks.clone();
    const tickValues = tickGenerator.generate();
    for (let i = 0, n = tickValues.length; i < n; i += 1) {
      const tickValue = tickValues[i];
      const oldTick = oldTicks.get(tickValue);
      if (oldTick !== void 0) {
        oldTicks.delete(tickValue);
        oldTick.fadeIn(this._tickTransition || void 0);
      } else {
        const newTick = this.createTickView(tickValue);
        if (newTick !== null) {
          this.insertTick(newTick);
          newTick.opacity._value = 0;
          newTick.opacity._state = 0;
          newTick.fadeIn(this._tickTransition || void 0);
        }
      }
    }
    oldTicks.forEach(function (value: D, oldTick: TickView<D>): void {
      if (!oldTick._preserve) {
        oldTick.fadeOut(this._tickTransition || void 0);
      }
    }, this);
  }

  protected createTickView(tickValue: D): TickView<D> | null {
    let tickView: TickView<D> | null | undefined;
    const viewController = this._viewController;
    if (viewController !== null) {
      tickView = viewController.createTickView(tickValue);
    }
    if (tickView === void 0) {
      tickView = TickView.from(this.orientation, tickValue);
    }
    if (tickView !== null) {
      const tickLabel = this.createTickLabel(tickValue, tickView);
      if (tickLabel !== null) {
        tickView.tickLabel(tickLabel);
        tickView._preserve = false;
      }
    }
    return tickView;
  }

  protected createTickLabel(tickValue: D, tickView: TickView<D>): View | string | null {
    let tickLabel: View | string | null | undefined;
    const viewController = this._viewController;
    if (viewController !== null) {
      tickLabel = viewController.createTickLabel(tickValue, tickView);
    }
    if (tickLabel === void 0) {
      if (this._tickGenerator !== null) {
        tickLabel = this._tickGenerator.format(tickValue);
      } else {
        tickLabel = "" + tickValue;
      }
    }
    if (typeof tickLabel === "string") {
      tickLabel = this.formatTickLabel(tickLabel, tickView);
    }
    return tickLabel;
  }

  protected formatTickLabel(tickLabel: string, tickView: TickView<D>): string | null {
    const viewController = this._viewController;
    if (viewController !== null) {
      return viewController.formatTickLabel(tickLabel, tickView);
    } else {
      return tickLabel;
    }
  }

  protected abstract renderDomain(context: CanvasContext, frame: BoxR2): void;

  protected layoutTicks(frame: BoxR2): void {
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (childView instanceof TickView) {
        this.layoutTick(childView, frame);
      }
    }
  }

  protected abstract layoutTick(tick: TickView<D>, frame: BoxR2): void;

  protected onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    if (childView instanceof TickView) {
      this._ticks.set(childView.value, childView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    if (childView instanceof TickView) {
      this._ticks.delete(childView.value);
    }
  }

  static top<D>(scale: ContinuousScale<D, number> | string): TopAxisView<D> {
    scale = AxisView.scale(scale);
    return new AxisView.Top(scale);
  }

  static right<D>(scale: ContinuousScale<D, number> | string): RightAxisView<D> {
    scale = AxisView.scale(scale);
    return new AxisView.Right(scale);
  }

  static bottom<D>(scale: ContinuousScale<D, number> | string): BottomAxisView<D> {
    scale = AxisView.scale(scale);
    return new AxisView.Bottom(scale);
  }

  static left<D>(scale: ContinuousScale<D, number> | string): LeftAxisView<D> {
    scale = AxisView.scale(scale);
    return new AxisView.Left(scale);
  }

  static from<D>(orientation: AxisOrientation, scale: ContinuousScale<D, number> | string): AxisView<D> {
    if (orientation === "top") {
      return AxisView.top(scale);
    } else if (orientation === "right") {
      return AxisView.right(scale);
    } else if (orientation === "bottom") {
      return AxisView.bottom(scale);
    } else if (orientation === "left") {
      return AxisView.left(scale);
    } else {
      throw new TypeError(orientation);
    }
  }

  static fromAny<D>(axis: AnyAxisView<D>): AxisView<D> {
    if (axis instanceof AxisView) {
      return axis;
    } else if (typeof axis === "object" && axis !== null) {
      const view = AxisView.from(axis.orientation, axis.scale);

      const ticks = axis.ticks;
      const tickGenerator = axis.tickGenerator !== void 0
                          ? axis.tickGenerator
                          : (ticks !== void 0 ? null : void 0);
      if (tickGenerator !== void 0) {
        view.tickGenerator(tickGenerator);
      }
      if (ticks !== void 0) {
        for (let i = 0, n = ticks.length; i < n; i += 1) {
          view.insertTick(ticks[i]);
        }
      }
      if (axis.tickSpacing !== void 0) {
        view.tickSpacing(axis.tickSpacing);
      }
      if (axis.tickTransition !== void 0) {
        view.tickTransition(axis.tickTransition);
      }

      if (axis.domainColor !== void 0) {
        view.domainColor(axis.domainColor);
      }
      if (axis.domainWidth !== void 0) {
        view.domainWidth(axis.domainWidth);
      }
      if (axis.domainSerif !== void 0) {
        view.domainSerif(axis.domainSerif);
      }

      if (axis.tickMarkColor !== void 0) {
        view.tickMarkColor(axis.tickMarkColor);
      }
      if (axis.tickMarkWidth !== void 0) {
        view.tickMarkWidth(axis.tickMarkWidth);
      }
      if (axis.tickMarkLength !== void 0) {
        view.tickMarkLength(axis.tickMarkLength);
      }

      if (axis.tickLabelPadding !== void 0) {
        view.tickLabelPadding(axis.tickLabelPadding);
      }

      if (axis.gridLineColor !== void 0) {
        view.gridLineColor(axis.gridLineColor);
      }
      if (axis.gridLineWidth !== void 0) {
        view.gridLineWidth(axis.gridLineWidth);
      }

      if (axis.font !== void 0) {
        view.font(axis.font);
      }
      if (axis.textColor !== void 0) {
        view.textColor(axis.textColor);
      }

      if (axis.hidden !== void 0) {
        view.setHidden(axis.hidden);
      }
      if (axis.culled !== void 0) {
        view.setCulled(axis.culled);
      }

      return view;
    }
    throw new TypeError("" + axis);
  }

  /** @hidden */
  static scale<D>(value: ContinuousScale<D, number> | string): ContinuousScale<D, number> {
    if (value instanceof ContinuousScale) {
      return value;
    } else if (typeof value === "string") {
      if (value === "linear") {
        return new LinearScale(0, 1, new NumberInterpolator(0, 0)) as unknown as ContinuousScale<D, number>;
      } else if (value === "time") {
        const d1 = DateTime.current();
        const d0 = d1.day(d1.day() - 1);
        return new TimeScale(d0, d1, new NumberInterpolator(0, 0)) as unknown as ContinuousScale<D, number>;
      } else {
        const domain = value.split("...");
        const x0 = StyleValue.parse(domain[0]);
        const x1 = StyleValue.parse(domain[1]);
        if (typeof x0 === "number" && typeof x1 === "number") {
          return new LinearScale(x0, x1, new NumberInterpolator(0, 0)) as unknown as ContinuousScale<D, number>;
        } else if (x0 instanceof DateTime && x1 instanceof DateTime) {
          return new TimeScale(x0, x1, new NumberInterpolator(0, 0)) as unknown as ContinuousScale<D, number>;
        }
      }
    }
    throw new TypeError(value);
  }

  // Forward type declarations
  /** @hidden */
  static Top: typeof TopAxisView; // defined by TopAxisView
  /** @hidden */
  static Right: typeof RightAxisView; // defined by RightAxisView
  /** @hidden */
  static Bottom: typeof BottomAxisView; // defined by BottomAxisView
  /** @hidden */
  static Left: typeof LeftAxisView; // defined by LeftAxisView
}
