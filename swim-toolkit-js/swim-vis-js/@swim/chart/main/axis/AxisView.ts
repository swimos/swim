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

import {BTree} from "@swim/collections";
import {AnyPointR2, PointR2, BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {ContinuousScale} from "@swim/scale";
import {Ease, AnyTransition, Transition} from "@swim/transition";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  ViewFlags,
  View,
  ViewScope,
  ViewAnimator,
  ContinuousScaleViewAnimator,
  GraphicsViewContext,
  GraphicsViewInit,
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

export type AnyAxisView<D = unknown> = AxisView<D> | AxisViewInit<D>;

export interface AxisViewInit<D = unknown> extends GraphicsViewInit {
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
  tickTransition?: AnyTransition<any>;

  gridLineColor?: AnyColor;
  gridLineWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;
}

export abstract class AxisView<D = unknown> extends GraphicsView {
  /** @hidden */
  readonly _ticks: BTree<D, TickView<D>>;
  /** @hidden */
  _tickGenerator: TickGenerator<D> | true | null;

  constructor() {
    super();
    this._ticks = new BTree();
    this._tickGenerator = true;
  }

  get viewController(): AxisViewController<D> | null {
    return this._viewController;
  }

  abstract get orientation(): AxisOrientation;

  abstract scale: ContinuousScaleViewAnimator<this, D, number>;

  getTick(value: D): TickView<D> | undefined {
    return this._ticks.get(value);
  }

  insertTick(tick: AnyTickView<D>): TickView<D> {
    tick = TickView.fromAny(tick, this.orientation);
    tick.remove();
    this.willInsertChildView(tick, null);
    this._ticks.set(tick.value, tick);
    tick.setParentView(this, null);
    this.onInsertChildView(tick, null);
    this.didInsertChildView(tick, null);
    return tick;
  }

  removeTick(value: D): TickView<D> | null {
    const tick = this._ticks.get(value);
    if (tick !== void 0) {
      if (tick.parentView !== this) {
        throw new Error("not a child view");
      }
      this.willRemoveChildView(tick);
      tick.setParentView(null, this);
      this._ticks.delete(value);
      this.onRemoveChildView(tick);
      this.didRemoveChildView(tick);
      tick.setKey(null);
      return tick;
    }
    return null;
  }

  tickGenerator(): TickGenerator<D> | true | null;
  tickGenerator(tickGenerator: TickGenerator<D> | true | null): this;
  tickGenerator(tickGenerator?: TickGenerator<D> | true | null): TickGenerator<D> | true | null | this {
    if (tickGenerator === void 0) {
      let tickGenerator = this._tickGenerator;
      if (tickGenerator === true) {
        const scale = this.scale.value;
        if (scale !== void 0) {
          tickGenerator = TickGenerator.fromScale(scale);
          this._tickGenerator = tickGenerator;
        }
      }
      return tickGenerator;
    } else {
      this._tickGenerator = tickGenerator;
      return this;
    }
  }

  @ViewAnimator(PointR2, {value: PointR2.origin()})
  origin: ViewAnimator<this, PointR2, AnyPointR2>;

  @ViewAnimator(Color, {inherit: true})
  borderColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Number, {inherit: true})
  borderWidth: ViewAnimator<this, number>;

  @ViewAnimator(Number, {inherit: true})
  borderSerif: ViewAnimator<this, number>;

  @ViewAnimator(Number, {value: 80})
  tickMarkSpacing: ViewAnimator<this, number>;

  @ViewAnimator(Color, {inherit: true})
  tickMarkColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Number, {inherit: true})
  tickMarkWidth: ViewAnimator<this, number>;

  @ViewAnimator(Number, {inherit: true})
  tickMarkLength: ViewAnimator<this, number>;

  @ViewAnimator(Number, {inherit: true})
  tickLabelPadding: ViewAnimator<this, number>;

  @ViewScope(Object, {
    inherit: true,
    init(): Transition<any> {
      return Transition.duration(250, Ease.cubicOut);
    },
  })
  tickTransition: ViewScope<this, Transition<any>>;

  @ViewAnimator(Color, {inherit: true})
  gridLineColor: ViewAnimator<this, Color, AnyColor>;

  @ViewAnimator(Number, {inherit: true})
  gridLineWidth: ViewAnimator<this, number>;

  @ViewAnimator(Font, {inherit: true})
  font: ViewAnimator<this, Font, AnyFont>;

  @ViewAnimator(Color, {inherit: true})
  textColor: ViewAnimator<this, Color, AnyColor>;

  get childViewCount(): number {
    return this._ticks.size;
  }

  get childViews(): ReadonlyArray<View> {
    const childViews: View[] = [];
    this._ticks.forEachValue(function (childView: TickView<D>): void {
      childViews.push(childView);
    }, this);
    return childViews;
  }

  forEachChildView<T, S = unknown>(callback: (this: S, childView: View) => T | void,
                                   thisArg?: S): T | undefined {
    return this._ticks.forEachValue(callback, thisArg);
  }

  getChildView(key: string): View | null {
    return null;
  }

  setChildView(key: string, newChildView: View | null): View | null {
    throw new Error("unsupported");
  }

  appendChildView(childView: View, key?: string): void {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    if (!(childView instanceof TickView)) {
      throw new TypeError("" + childView);
    }
    this.insertTick(childView);
  }

  prependChildView(childView: View, key?: string): void {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    if (!(childView instanceof TickView)) {
      throw new TypeError("" + childView);
    }
    this.insertTick(childView);
  }

  insertChildView(childView: View, targetView: View | null, key?: string): void {
    if (key !== void 0) {
      throw new Error("unsupported");
    }
    if (!(childView instanceof TickView)) {
      throw new TypeError("" + childView);
    }
    this.insertTick(childView);
  }

  removeChildView(key: string): View | null;
  removeChildView(childView: View): void;
  removeChildView(childView: string | View): View | null | void {
    if (typeof childView === "string") {
      throw new Error("unsupported");
    }
    if (!(childView instanceof TickView)) {
      throw new TypeError("" + childView);
    }
    this.removeTick(childView.value);
  }

  removeAll(): void {
    this._ticks.forEach(function (key: D, childView: TickView<D>): void {
      this.willRemoveChildView(childView);
      childView.setParentView(null, this);
      this._ticks.delete(key);
      this.onRemoveChildView(childView);
      this.didRemoveChildView(childView);
      childView.setKey(null);
    }, this);
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onRemoveChildView(childView: View): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected modifyUpdate(updateFlags: ViewFlags): ViewFlags {
    let additionalFlags = 0;
    if ((updateFlags & View.NeedsAnimate) !== 0) {
      additionalFlags |= View.NeedsAnimate;
    }
    additionalFlags |= super.modifyUpdate(updateFlags | additionalFlags);
    return additionalFlags;
  }

  needsProcess(processFlags: ViewFlags, viewContext: GraphicsViewContext): ViewFlags {
    if ((processFlags & View.NeedsLayout) !== 0) {
      processFlags |= View.NeedsAnimate;
    }
    return processFlags;
  }

  protected willAnimate(viewContext: GraphicsViewContext): void {
    super.willAnimate(viewContext);
    this.updateTicks();
  }

  protected updateTicks(): void {
    const origin = this.origin.value;
    const scale = this.scale.value;
    let tickGenerator = this._tickGenerator;
    if (origin !== void 0 && scale !== void 0) {
      if (tickGenerator !== null) {
        if (tickGenerator === true) {
          tickGenerator = TickGenerator.fromScale(scale);
          this._tickGenerator = tickGenerator;
        }
        this.generateTicks(tickGenerator, scale);
      }
      this.layoutTicks(origin, this.viewFrame, scale);
    }
  }

  protected generateTicks(tickGenerator: TickGenerator<D>,
                          scale: ContinuousScale<D, number>): void {
    const tickMarkSpacing = this.tickMarkSpacing.value!;
    if (tickMarkSpacing !== 0) {
      const [y0, y1] = scale.range();
      const dy = Math.abs(y1 - y0);
      const n = Math.max(1, Math.floor(dy / tickMarkSpacing));
      tickGenerator.count(n);
    }
    tickGenerator.domain(scale.domain());

    const oldTicks = this._ticks.clone();
    const tickValues = tickGenerator.generate();
    const tickTransition = this.tickTransition.state;
    for (let i = 0, n = tickValues.length; i < n; i += 1) {
      const tickValue = tickValues[i];
      const oldTick = oldTicks.get(tickValue);
      if (oldTick !== void 0) {
        oldTicks.delete(tickValue);
        oldTick.fadeIn(tickTransition);
      } else {
        const newTick = this.createTickView(tickValue);
        if (newTick !== null) {
          this.insertTick(newTick);
          newTick.opacity._value = 0;
          newTick.opacity._state = 0;
          newTick.fadeIn(tickTransition);
        }
      }
    }
    oldTicks.forEachValue(function (oldTick: TickView<D>): void {
      if (!oldTick._preserve) {
        oldTick.fadeOut(tickTransition);
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
      tickView = TickView.from(tickValue, this.orientation);
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

  protected createTickLabel(tickValue: D, tickView: TickView<D>): GraphicsView | string | null {
    let tickLabel: GraphicsView | string | null | undefined;
    const viewController = this._viewController;
    if (viewController !== null) {
      tickLabel = viewController.createTickLabel(tickValue, tickView);
    }
    if (tickLabel === void 0) {
      if (this._tickGenerator instanceof TickGenerator) {
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

  protected onLayout(viewContext: GraphicsViewContext): void {
    super.onLayout(viewContext);
    this.updateTicks();
  }

  protected layoutTicks(origin: PointR2, frame: BoxR2, scale: ContinuousScale<D, number>): void {
    this._ticks.forEachValue(function (tick: TickView<D>): void {
      this.layoutTick(tick, origin, frame, scale);
    }, this);

    // We don't need to run the layout phase unless the view frame changes
    // between now and the display pass.
    this._viewFlags &= ~View.NeedsLayout;
  }

  protected abstract layoutTick(tick: TickView<D>, origin: PointR2, frame: BoxR2,
                                scale: ContinuousScale<D, number>): void;

  protected willRender(viewContext: GraphicsViewContext): void {
    super.willRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
    }
  }

  protected didRender(viewContext: GraphicsViewContext): void {
    const renderer = viewContext.renderer;
    const origin = this.origin.value;
    if (renderer instanceof CanvasRenderer && origin !== void 0) {
      const context = renderer.context;
      this.renderDomain(context, origin, this.viewFrame);
      context.restore();
    }
    super.didRender(viewContext);
  }

  protected abstract renderDomain(context: CanvasContext, origin: PointR2, frame: BoxR2): void;

  static top<X>(init?: AxisViewInit<X>): TopAxisView<X> {
    const view = new AxisView.Top<X>();
    if (init !== void 0) {
      AxisView.init(view, init);
    }
    return view;
  }

  static right<Y>(init?: AxisViewInit<Y>): RightAxisView<Y> {
    const view = new AxisView.Right<Y>();
    if (init !== void 0) {
      AxisView.init(view, init);
    }
    return view;
  }

  static bottom<X>(init?: AxisViewInit<X>): BottomAxisView<X> {
    const view = new AxisView.Bottom<X>();
    if (init !== void 0) {
      AxisView.init(view, init);
    }
    return view;
  }

  static left<Y>(init?: AxisViewInit<Y>): LeftAxisView<Y> {
    const view = new AxisView.Left<Y>();
    if (init !== void 0) {
      AxisView.init(view, init);
    }
    return view;
  }

  static fromOrientation<D>(orientation: AxisOrientation): AxisView<D> {
    if (orientation === "top") {
      return AxisView.top();
    } else if (orientation === "right") {
      return AxisView.right();
    } else if (orientation === "bottom") {
      return AxisView.bottom();
    } else if (orientation === "left") {
      return AxisView.left();
    } else {
      throw new TypeError(orientation);
    }
  }

  static fromAny<D>(axis: AnyAxisView<D> | true, orientation?: AxisOrientation): AxisView<D> {
    if (axis instanceof AxisView) {
      return axis;
    } else if (axis === true) {
      if (orientation === void 0) {
        throw new Error("undefined axis orientation");
      }
      return AxisView.fromOrientation(orientation);
    } else if (typeof axis === "object" && axis !== null) {
      return AxisView.fromInit(axis, orientation);
    }
    throw new TypeError("" + axis);
  }

  static fromInit<D>(init: AxisViewInit<D>, orientation?: AxisOrientation): AxisView<D> {
    if (orientation === void 0) {
      orientation = init.orientation;
      if (orientation === void 0) {
        throw new Error("undefined axis orientation");
      }
    }
    const view = AxisView.fromOrientation<D>(orientation);
    AxisView.init(view, init);
    return view;
  }

  /** @hidden */
  static init<D>(view: AxisView<D>, init: AxisViewInit<D>): void {
    if (init.scale !== void 0) {
      view.scale(init.scale);
    }

    const ticks = init.ticks;
    if (ticks !== void 0) {
      for (let i = 0, n = ticks.length; i < n; i += 1) {
        view.insertTick(ticks[i]);
      }
    }
    if (init.tickGenerator !== void 0) {
      view.tickGenerator(init.tickGenerator);
    }

    if (init.borderColor !== void 0) {
      view.borderColor(init.borderColor);
    }
    if (init.borderWidth !== void 0) {
      view.borderWidth(init.borderWidth);
    }
    if (init.borderSerif !== void 0) {
      view.borderSerif(init.borderSerif);
    }

    if (init.tickMarkSpacing !== void 0) {
      view.tickMarkSpacing(init.tickMarkSpacing);
    }
    if (init.tickMarkColor !== void 0) {
      view.tickMarkColor(init.tickMarkColor);
    }
    if (init.tickMarkWidth !== void 0) {
      view.tickMarkWidth(init.tickMarkWidth);
    }
    if (init.tickMarkLength !== void 0) {
      view.tickMarkLength(init.tickMarkLength);
    }
    if (init.tickLabelPadding !== void 0) {
      view.tickLabelPadding(init.tickLabelPadding);
    }
    if (init.tickTransition !== void 0) {
      view.tickTransition(Transition.fromAny(init.tickTransition));
    }

    if (init.gridLineColor !== void 0) {
      view.gridLineColor(init.gridLineColor);
    }
    if (init.gridLineWidth !== void 0) {
      view.gridLineWidth(init.gridLineWidth);
    }

    if (init.font !== void 0) {
      view.font(init.font);
    }
    if (init.textColor !== void 0) {
      view.textColor(init.textColor);
    }

    if (init.hidden !== void 0) {
      view.setHidden(init.hidden);
    }
    if (init.culled !== void 0) {
      view.setCulled(init.culled);
    }
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
