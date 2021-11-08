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

import {Class, AnyTiming, Timing, Easing, ContinuousScale} from "@swim/util";
import {Property} from "@swim/fastener";
import {BTree} from "@swim/collections";
import {AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {ViewContextType, ViewFlags, AnyView, ViewCreator, View} from "@swim/view";
import {GraphicsViewInit, GraphicsView, PaintingContext, PaintingRenderer} from "@swim/graphics";
import type {ContinuousScaleAnimator} from "../scaled/ContinuousScaleAnimator";
import {AnyTickView, TickView} from "../tick/TickView";
import {TickGenerator} from "../tick/TickGenerator";
import type {AxisViewObserver} from "./AxisViewObserver";

export type AxisOrientation = "top" | "right" | "bottom" | "left";

export type AnyAxisView<D = unknown> = AxisView<D> | AxisViewInit<D>;

export interface AxisViewInit<D = unknown> extends GraphicsViewInit {
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
    this.ticks = new BTree();
  }

  override readonly observerType?: Class<AxisViewObserver<D>>;

  abstract readonly orientation: AxisOrientation;

  abstract readonly scale: ContinuousScaleAnimator<this, D, number>;

  /** @internal */
  readonly ticks!: BTree<D, TickView<D>>;

  getTick(value: D): TickView<D> | null {
    const tickView = this.ticks.get(value);
    return tickView !== void 0 ? tickView : null;
  }

  insertTick(tick: AnyTickView<D>): TickView<D> {
    tick = TickView.fromAny(tick, this.orientation);
    tick.remove();
    this.willInsertChild(tick, null);
    this.ticks.set(tick.value, tick);
    tick.attachParent(this);
    this.onInsertChild(tick, null);
    this.didInsertChild(tick, null);
    tick.cascadeInsert();
    return tick;
  }

  removeTick(value: D): TickView<D> | null {
    const tick = this.ticks.get(value);
    if (tick !== void 0) {
      if (tick.parent !== this) {
        throw new Error("not a child view");
      }
      this.willRemoveChild(tick);
      tick.detachParent(this);
      this.ticks.delete(value);
      this.onRemoveChild(tick);
      this.didRemoveChild(tick);
      tick.setKey(void 0);
      return tick;
    }
    return null;
  }

  @Property({type: TickGenerator, state: true})
  readonly tickGenerator!: Property<this, TickGenerator<D> | true | null>;

  @ThemeAnimator({type: R2Point, state: R2Point.origin(), updateFlags: View.NeedsLayout | View.NeedsRender})
  readonly origin!: ThemeAnimator<this, R2Point, AnyR2Point>;

  @ThemeAnimator({type: Color, inherits: true, state: null, updateFlags: View.NeedsRender})
  readonly borderColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Number, inherits: true, state: 1, updateFlags: View.NeedsRender})
  readonly borderWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, inherits: true, state: 6, updateFlags: View.NeedsRender})
  readonly borderSerif!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, state: 80, updateFlags: View.NeedsRender})
  readonly tickMarkSpacing!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Color, inherits: true, state: null, updateFlags: View.NeedsRender})
  readonly tickMarkColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Number, inherits: true, state: 1, updateFlags: View.NeedsRender})
  readonly tickMarkWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, inherits: true, state: 6, updateFlags: View.NeedsRender})
  readonly tickMarkLength!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Number, inherits: true, state: 2, updateFlags: View.NeedsRender})
  readonly tickLabelPadding!: ThemeAnimator<this, number>;

  @Property({
    type: Timing,
    inherits: true,
    initState(): Timing {
      return Easing.cubicOut.withDuration(250);
    },
  })
  readonly tickTransition!: Property<this, Timing, AnyTiming>;

  @ThemeAnimator({type: Color, inherits: true, state: null, updateFlags: View.NeedsRender})
  readonly gridLineColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({type: Number, inherits: true, state: 0, updateFlags: View.NeedsRender})
  readonly gridLineWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({type: Font, inherits: true, state: null, updateFlags: View.NeedsRender})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({type: Color, inherits: true, state: null, updateFlags: View.NeedsRender})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  override get childCount(): number {
    return this.ticks.size;
  }

  override get children(): ReadonlyArray<View> {
    const children: View[] = [];
    this.ticks.forEachValue(function (child: TickView<D>): void {
      children.push(child);
    }, this);
    return children;
  }

  override firstChild(): View | null {
    const child = this.ticks.firstValue();
    return child !== void 0 ? child : null;
  }

  override lastChild(): View | null {
    const child = this.ticks.lastValue();
    return child !== void 0 ? child : null;
  }

  override nextChild(targetView: View): View | null {
    if (targetView instanceof TickView) {
      const child = this.ticks.nextValue(targetView.value);
      if (child !== void 0) {
        return child;
      }
    }
    return null;
  }

  override previousChild(targetView: View): View | null {
    if (targetView instanceof TickView) {
      const child = this.ticks.previousValue(targetView.value);
      if (child !== void 0) {
        return child;
      }
    }
    return null;
  }

  override forEachChild<T>(callback: (child: View) => T | void): T | undefined;
  override forEachChild<T, S>(callback: (this: S, child: View) => T | void, thisArg: S): T | undefined;
  override forEachChild<T, S>(callback: (this: S | undefined, child: View) => T | void, thisArg?: S): T | undefined {
    return this.ticks.forEachValue(callback, thisArg);
  }

  override getChild<F extends abstract new (...args: any[]) => View>(key: string, childBound: F): InstanceType<F> | null;
  override getChild(key: string, childBound?: abstract new (...args: any[]) => View): View | null;
  override getChild(key: string, childBound?: abstract new (...args: any[]) => View): View | null {
    return null;
  }

  override setChild<V extends View>(key: string, newChild: V): View | null;
  override setChild<F extends ViewCreator<F>>(key: string, factory: F): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null;
  override setChild(key: string, newChild: AnyView | null): View | null {
    throw new Error("unsupported");
  }

  override appendChild<V extends View>(child: V, key?: string): V;
  override appendChild<F extends ViewCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override appendChild(child: AnyView, key?: string): View;
  override appendChild(child: AnyView, key?: string): View {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    child = View.fromAny(child);
    if (!(child instanceof TickView)) {
      throw new TypeError("" + child);
    }
    return this.insertTick(child);
  }

  override prependChild<V extends View>(child: V, key?: string): V;
  override prependChild<F extends ViewCreator<F>>(factory: F, key?: string): InstanceType<F>;
  override prependChild(child: AnyView, key?: string): View;
  override prependChild(child: AnyView, key?: string): View {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    child = View.fromAny(child);
    if (!(child instanceof TickView)) {
      throw new TypeError("" + child);
    }
    return this.insertTick(child);
  }

  override insertChild<V extends View>(child: V, target: View | null, key?: string): V;
  override insertChild<F extends ViewCreator<F>>(factory: F, target: View | null, key?: string): InstanceType<F>;
  override insertChild(child: AnyView, target: View | null, key?: string): View;
  override insertChild(child: AnyView, target: View | null, key?: string): View {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    child = View.fromAny(child);
    if (!(child instanceof TickView)) {
      throw new TypeError("" + child);
    }
    return this.insertTick(child);
  }

  override replaceChild<V extends View>(newChild: View, oldChild: V): V;
  override replaceChild<V extends View>(newChild: AnyView, oldChild: V): V;
  override replaceChild(newChild: AnyView, oldChild: View): View {
    if (!(oldChild instanceof TickView)) {
      throw new TypeError("" + oldChild);
    }
    if (oldChild.parent !== this) {
      throw new TypeError("" + oldChild);
    }
    newChild = View.fromAny(newChild);
    if (!(newChild instanceof TickView)) {
      throw new TypeError("" + newChild);
    }
    if (newChild !== oldChild) {
      this.removeTick(oldChild.value);
      this.insertTick(newChild);
    }
    return oldChild;
  }

  override removeChild(key: string): View | null;
  override removeChild<V extends View>(child: V): V;
  override removeChild(child: string | View): View | null {
    if (typeof child === "string") {
      throw new Error("unsupported");
    }
    if (!(child instanceof TickView)) {
      throw new TypeError("" + child);
    }
    this.removeTick(child.value);
    return child;
  }

  override removeChildren(): void {
    this.ticks.forEach(function (key: D, child: TickView<D>): void {
      this.willRemoveChild(child);
      child.detachParent(this);
      this.ticks.delete(key);
      this.onRemoveChild(child);
      this.didRemoveChild(child);
      child.setKey(void 0);
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
          newTick.opacity.setInterpolatedValue(0, 0);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n && (tickLabel === void 0 || tickLabel === null); i += 1) {
      const observer = observers[i]!;
      if (observer.createTickLabel !== void 0) {
        tickLabel = observer.createTickLabel(tickValue, tickView, this);
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
    const observers = this.observers;
    for (let i = 0, n = observers.length; i < n; i += 1) {
      const observer = observers[i]!;
      if (observer.formatTickLabel !== void 0) {
        const label = observer.formatTickLabel(tickLabel, tickView, this);
        if (label !== void 0) {
          return label;
        }
      }
    }
    return tickLabel;
  }

  protected override needsDisplay(displayFlags: ViewFlags, viewContext: ViewContextType<this>): ViewFlags {
    if ((this.flags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.scale.recohere(viewContext.updateTime);
    this.updateTicks();
  }

  protected override displayChild(child: View, displayFlags: ViewFlags,
                                  viewContext: ViewContextType<this>): void {
    if ((displayFlags & View.NeedsLayout) !== 0 && child instanceof TickView) {
      const scale = this.scale.value;
      if (scale !== null) {
        this.layoutTick(child, this.origin.getValue(), this.viewFrame, scale);
      }
    }
    super.displayChild(child, displayFlags, viewContext);
  }

  protected abstract layoutTick(tick: TickView<D>, origin: R2Point, frame: R2Box,
                                scale: ContinuousScale<D, number>): void;

  protected override didRender(viewContext: ViewContextType<this>): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof PaintingRenderer) {
      this.renderDomain(renderer.context, this.origin.getValue(), this.viewFrame);
    }
    super.didRender(viewContext);
  }

  protected abstract renderDomain(context: PaintingContext, origin: R2Point, frame: R2Box): void;

  override init(init: AxisViewInit<D>): void {
    super.init(init);
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
}
