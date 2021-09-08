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

import {AnyTiming, Timing, Easing, ContinuousScale} from "@swim/mapping";
import {BTree} from "@swim/collections";
import {AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ViewContextType, ViewFlags, View, ViewProperty, ViewAnimator} from "@swim/view";
import {GraphicsViewInit, GraphicsView, CanvasContext, CanvasRenderer} from "@swim/graphics";
import type {ContinuousScaleAnimator} from "../scaled/ContinuousScaleAnimator";
import {AnyTickView, TickView} from "../tick/TickView";
import {TickGenerator} from "../tick/TickGenerator";
import type {AxisViewObserver} from "./AxisViewObserver";
import {TopAxisView} from "../"; // forward import
import {RightAxisView} from "../"; // forward import
import {BottomAxisView} from "../"; // forward import
import {LeftAxisView} from "../"; // forward import

export type AxisOrientation = "top" | "right" | "bottom" | "left";

export type AnyAxisView<D> = AxisView<D> | AxisViewInit<D>;

export interface AxisViewInit<D> extends GraphicsViewInit {
  orientation?: AxisOrientation;
  scale?: ContinuousScale<D, number> | string;
  ticks?: AnyTickView<D>[];
  tickGenerator?: TickGenerator<D> | true | null;

  borderColor?: AnyColor;
  borderWidth?: number;
  borderSerif?: number;

  tickMarkSpacing?: number;
  tickMarkColor?: AnyColor;
  tickMarkWidth?: number;
  tickMarkLength?: number;
  tickLabelPadding?: number;
  tickTransition?: AnyTiming;

  gridLineColor?: AnyColor;
  gridLineWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;
}

export abstract class AxisView<D = unknown> extends GraphicsView {
  constructor() {
    super();
    Object.defineProperty(this, "ticks", {
      value: new BTree(),
      enumerable: true,
      configurable: true,
    });
  }

  override readonly viewObservers!: ReadonlyArray<AxisViewObserver<D>>;

  override initView(init: AxisViewInit<D>): void {
    super.initView(init);
    if (init.scale !== void 0) {
      this.scale(init.scale);
    }

    const ticks = init.ticks;
    if (ticks !== void 0) {
      for (let i = 0, n = ticks.length; i < n; i += 1) {
        this.insertTick(ticks[i]!);
      }
    }
    if (init.tickGenerator !== void 0) {
      this.tickGenerator(init.tickGenerator);
    }

    if (init.borderColor !== void 0) {
      this.borderColor(init.borderColor);
    }
    if (init.borderWidth !== void 0) {
      this.borderWidth(init.borderWidth);
    }
    if (init.borderSerif !== void 0) {
      this.borderSerif(init.borderSerif);
    }

    if (init.tickMarkSpacing !== void 0) {
      this.tickMarkSpacing(init.tickMarkSpacing);
    }
    if (init.tickMarkColor !== void 0) {
      this.tickMarkColor(init.tickMarkColor);
    }
    if (init.tickMarkWidth !== void 0) {
      this.tickMarkWidth(init.tickMarkWidth);
    }
    if (init.tickMarkLength !== void 0) {
      this.tickMarkLength(init.tickMarkLength);
    }
    if (init.tickLabelPadding !== void 0) {
      this.tickLabelPadding(init.tickLabelPadding);
    }
    if (init.tickTransition !== void 0) {
      this.tickTransition(init.tickTransition);
    }

    if (init.gridLineColor !== void 0) {
      this.gridLineColor(init.gridLineColor);
    }
    if (init.gridLineWidth !== void 0) {
      this.gridLineWidth(init.gridLineWidth);
    }

    if (init.font !== void 0) {
      this.font(init.font);
    }
    if (init.textColor !== void 0) {
      this.textColor(init.textColor);
    }
  }

  abstract readonly orientation: AxisOrientation;

  abstract readonly scale: ContinuousScaleAnimator<this, D, number>;

  /** @hidden */
  readonly ticks!: BTree<D, TickView<D>>;

  getTick(value: D): TickView<D> | null {
    const tickView = this.ticks.get(value);
    return tickView !== void 0 ? tickView : null;
  }

  insertTick(tick: AnyTickView<D>): TickView<D> {
    tick = TickView.fromAny(tick, this.orientation);
    tick.remove();
    this.willInsertChildView(tick, null);
    this.ticks.set(tick.value, tick);
    tick.setParentView(this, null);
    this.onInsertChildView(tick, null);
    this.didInsertChildView(tick, null);
    tick.cascadeInsert();
    return tick;
  }

  removeTick(value: D): TickView<D> | null {
    const tick = this.ticks.get(value);
    if (tick !== void 0) {
      if (tick.parentView !== this) {
        throw new Error("not a child view");
      }
      this.willRemoveChildView(tick);
      tick.setParentView(null, this);
      this.ticks.delete(value);
      this.onRemoveChildView(tick);
      this.didRemoveChildView(tick);
      tick.setKey(void 0);
      return tick;
    }
    return null;
  }

  @ViewProperty({type: TickGenerator, state: true})
  readonly tickGenerator!: ViewProperty<this, TickGenerator<D> | true | null>;

  @ViewAnimator({type: R2Point, state: R2Point.origin()})
  readonly origin!: ViewAnimator<this, R2Point, AnyR2Point>;

  @ViewAnimator({type: Color, inherit: true, state: null})
  readonly borderColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Number, inherit: true, state: 1})
  readonly borderWidth!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, inherit: true, state: 6})
  readonly borderSerif!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, state: 80})
  readonly tickMarkSpacing!: ViewAnimator<this, number>;

  @ViewAnimator({type: Color, inherit: true, state: null})
  readonly tickMarkColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Number, inherit: true, state: 1})
  readonly tickMarkWidth!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, inherit: true, state: 6})
  readonly tickMarkLength!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, inherit: true, state: 2})
  readonly tickLabelPadding!: ViewAnimator<this, number>;

  @ViewProperty({
    type: Timing,
    inherit: true,
    initState(): Timing {
      return Easing.cubicOut.withDuration(250);
    },
  })
  readonly tickTransition!: ViewProperty<this, Timing, AnyTiming>;

  @ViewAnimator({type: Color, inherit: true, state: null})
  readonly gridLineColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Number, inherit: true, state: 0})
  readonly gridLineWidth!: ViewAnimator<this, number>;

  @ViewAnimator({type: Font, inherit: true, state: null})
  readonly font!: ViewAnimator<this, Font | null, AnyFont | null>;

  @ViewAnimator({type: Color, inherit: true, state: null})
  readonly textColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  override get childViewCount(): number {
    return this.ticks.size;
  }

  override get childViews(): ReadonlyArray<View> {
    const childViews: View[] = [];
    this.ticks.forEachValue(function (childView: TickView<D>): void {
      childViews.push(childView);
    }, this);
    return childViews;
  }

  override firstChildView(): View | null {
    const childView = this.ticks.firstValue();
    return childView !== void 0 ? childView : null;
  }

  override lastChildView(): View | null {
    const childView = this.ticks.lastValue();
    return childView !== void 0 ? childView : null;
  }

  override nextChildView(targetView: View): View | null {
    if (targetView instanceof TickView) {
      const childView = this.ticks.nextValue(targetView.value);
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  override previousChildView(targetView: View): View | null {
    if (targetView instanceof TickView) {
      const childView = this.ticks.previousValue(targetView.value);
      if (childView !== void 0) {
        return childView;
      }
    }
    return null;
  }

  override forEachChildView<T>(callback: (childView: View) => T | void): T | undefined;
  override forEachChildView<T, S>(callback: (this: S, childView: View) => T | void, thisArg: S): T | undefined;
  override forEachChildView<T, S>(callback: (this: S | undefined, childView: View) => T | void, thisArg?: S): T | undefined {
    return this.ticks.forEachValue(callback, thisArg);
  }

  override getChildView(key: string): View | null {
    return null;
  }

  override setChildView(key: string, newChildView: View | null): View | null {
    throw new Error("unsupported");
  }

  override appendChildView(childView: View, key?: string): void {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    if (!(childView instanceof TickView)) {
      throw new TypeError("" + childView);
    }
    this.insertTick(childView);
  }

  override prependChildView(childView: View, key?: string): void {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    if (!(childView instanceof TickView)) {
      throw new TypeError("" + childView);
    }
    this.insertTick(childView);
  }

  override insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    if (!(childView instanceof TickView)) {
      throw new TypeError("" + childView);
    }
    this.insertTick(childView);
  }

  override removeChildView(key: string): View | null;
  override removeChildView(childView: View): void;
  override removeChildView(childView: string | View): View | null | void {
    if (typeof childView === "string") {
      throw new Error("unsupported");
    }
    if (!(childView instanceof TickView)) {
      throw new TypeError("" + childView);
    }
    this.removeTick(childView.value);
  }

  override removeAll(): void {
    this.ticks.forEach(function (key: D, childView: TickView<D>): void {
      this.willRemoveChildView(childView);
      childView.setParentView(null, this);
      this.ticks.delete(key);
      this.onRemoveChildView(childView);
      this.didRemoveChildView(childView);
      childView.setKey(void 0);
    }, this);
  }

  protected updateTicks(): void {
    const scale = this.scale.value;
    let tickGenerator = this.tickGenerator.state;
    if (scale !== null && tickGenerator !== null) {
      let timing: Timing | boolean = this.tickTransition.state;
      if (tickGenerator === true) {
        tickGenerator = TickGenerator.fromScale(scale);
        this.tickGenerator.setState(tickGenerator);
        timing = false;
      }
      this.generateTicks(tickGenerator, scale, timing);
    }
  }

  protected generateTicks(tickGenerator: TickGenerator<D>,
                          scale: ContinuousScale<D, number>,
                          timing: Timing | boolean): void {
    const tickMarkSpacing = this.tickMarkSpacing.getValue();
    if (tickMarkSpacing !== 0) {
      const range = scale.range;
      const dy = Math.abs(range[1] - range[0]);
      const n = Math.max(1, Math.floor(dy / tickMarkSpacing));
      tickGenerator.count(n);
    }
    tickGenerator.domain(scale.domain);

    const oldTicks = this.ticks.clone();
    const tickValues = tickGenerator.generate();
    for (let i = 0, n = tickValues.length; i < n; i += 1) {
      const tickValue = tickValues[i]!;
      const oldTick = oldTicks.get(tickValue);
      if (oldTick !== void 0) {
        oldTicks.delete(tickValue);
        oldTick.fadeIn(timing);
      } else {
        const newTick = this.createTickView(tickValue);
        if (newTick !== null) {
          this.insertTick(newTick);
          Object.defineProperty(newTick.opacity, "ownValue", {
            value: 0,
            enumerable: true,
            configurable: true,
          });
          Object.defineProperty(newTick.opacity, "ownState", {
            value: 0,
            enumerable: true,
            configurable: true,
          });
          newTick.fadeIn(timing);
        }
      }
    }
    oldTicks.forEachValue(function (oldTick: TickView<D>): void {
      if (!oldTick.preserved) {
        oldTick.fadeOut(timing);
      }
    }, this);
  }

  protected createTickView(tickValue: D): TickView<D> | null {
    const tickView = TickView.from(tickValue, this.orientation);
    if (tickView !== null) {
      const tickLabel = this.createTickLabel(tickValue, tickView);
      if (tickLabel !== null) {
        tickView.label(tickLabel);
        tickView.preserve(false);
      }
    }
    return tickView;
  }

  protected createTickLabel(tickValue: D, tickView: TickView<D>): GraphicsView | string | null {
    let tickLabel: GraphicsView | string | null = null;
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n && (tickLabel === void 0 || tickLabel === null); i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.createTickLabel !== void 0) {
        tickLabel = viewObserver.createTickLabel(tickValue, tickView, this);
      }
    }
    if (tickLabel === void 0 || tickLabel === null) {
      const tickGenerator = this.tickGenerator.state;
      if (tickGenerator instanceof TickGenerator) {
        tickLabel = tickGenerator.format(tickValue);
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
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.formatTickLabel !== void 0) {
        const label = viewObserver.formatTickLabel(tickLabel, tickView, this);
        if (label !== void 0) {
          return label;
        }
      }
    }
    return tickLabel;
  }

  override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.viewFlags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.scale.onAnimate(viewContext.updateTime);
    this.updateTicks();
  }

  protected override displayChildView(childView: View, displayFlags: ViewFlags,
                                      viewContext: ViewContextType<this>): void {
    if ((displayFlags & View.NeedsLayout) !== 0 && childView instanceof TickView) {
      const scale = this.scale.value;
      if (scale !== null) {
        this.layoutTick(childView, this.origin.getValue(), this.viewFrame, scale);
      }
    }
    super.displayChildView(childView, displayFlags, viewContext);
  }

  protected abstract layoutTick(tick: TickView<D>, origin: R2Point, frame: R2Box,
                                scale: ContinuousScale<D, number>): void;

  protected override willRender(viewContext: ViewContextType<this>): void {
    super.willRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
    }
  }

  protected override didRender(viewContext: ViewContextType<this>): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      this.renderDomain(context, this.origin.getValue(), this.viewFrame);
      context.restore();
    }
    super.didRender(viewContext);
  }

  protected abstract renderDomain(context: CanvasContext, origin: R2Point, frame: R2Box): void;

  static fromInit<D>(init: AxisViewInit<D>): AxisView<D> {
    const orientation = init.orientation;
    if (orientation === "top") {
      return TopAxisView.fromInit(init);
    } else if (orientation === "right") {
      return RightAxisView.fromInit(init);
    } else if (orientation === "bottom") {
      return BottomAxisView.fromInit(init);
    } else if (orientation === "left") {
      return LeftAxisView.fromInit(init);
    } else {
      throw new Error("unknown axis orientation: " + orientation);
    }
  }

  static fromAny<D>(value: AnyAxisView<D> | true): AxisView<D> {
    if (value instanceof AxisView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      const orientation = value.orientation;
      if (orientation === "top") {
        return TopAxisView.fromAny(value);
      } else if (orientation === "right") {
        return RightAxisView.fromAny(value);
      } else if (orientation === "bottom") {
        return BottomAxisView.fromAny(value);
      } else if (orientation === "left") {
        return LeftAxisView.fromAny(value);
      } else {
        throw new Error("unknown axis orientation: " + orientation);
      }
    }
    throw new TypeError("" + value);
  }
}
