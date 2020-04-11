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

import {PointR2, BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {Transition} from "@swim/transition";
import {TweenState} from "@swim/animate";
import {CanvasContext, CanvasRenderer} from "@swim/render";
import {
  MemberAnimator,
  View,
  RenderedViewContext,
  RenderedViewInit,
  RenderedView,
  GraphicsView,
  GraphicsViewController,
} from "@swim/view";
import {AnyTextRunView, TextRunView} from "@swim/typeset";
import {TopTickView} from "./TopTickView";
import {RightTickView} from "./RightTickView";
import {BottomTickView} from "./BottomTickView";
import {LeftTickView} from "./LeftTickView";
import {AxisView} from "../axis/AxisView";

/** @hidden */
export const enum TickState {
  Excluded,
  Entering,
  Included,
  Leaving,
}

export type TickOrientation = "top" | "right" | "bottom" | "left";

export type AnyTickView<D> = TickView<D> | TickViewInit<D>;

export interface TickViewInit<D> extends RenderedViewInit {
  orientation?: TickOrientation;
  value: D;

  tickMarkColor?: AnyColor;
  tickMarkWidth?: number;
  tickMarkLength?: number;

  tickLabelPadding?: number;

  gridLineColor?: AnyColor;
  gridLineWidth?: number;

  font?: AnyFont | null;
  textColor?: AnyColor | null;

  tickLabel?: View | string | null;
}

export abstract class TickView<D> extends GraphicsView {
  /** @hidden */
  _viewController: GraphicsViewController<TickView<D>> | null;
  /** @hidden */
  readonly _value: D;
  /** @hidden */
  _coord: number;
  /** @hidden */
  _coord0: number;
  /** @hidden */
  _state: TickState;
  /** @hidden */
  _preserve: boolean;

  constructor(value: D) {
    super();
    this._value = value;
    this._coord = 0;
    this._coord0 = NaN;
    this._state = TickState.Excluded;
    this._preserve = true;

    this.opacity.setState(1);
    this.opacity.interpolate = TickView.interpolateOpacity;
  }

  get viewController(): GraphicsViewController<TickView<D>> | null {
    return this._viewController;
  }

  abstract get orientation(): TickOrientation;

  get value(): D {
    return this._value;
  }

  get coord(): number {
    return this._coord;
  }

  setCoord(coord: number): void {
    this._coord = coord;
  }

  @MemberAnimator(Number)
  opacity: MemberAnimator<this, number>;

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

  tickLabel(): View | null;
  tickLabel(tickLabel: View | AnyTextRunView | null): this;
  tickLabel(tickLabel?: View | AnyTextRunView | null): View | null | this {
    if (tickLabel === void 0) {
      return this.getChildView("tickLabel");
    } else {
      if (tickLabel !== null && !(tickLabel instanceof View)) {
        tickLabel = TextRunView.fromAny(tickLabel);
      }
      this.setChildView("tickLabel", tickLabel);
      return this;
    }
  }

  preserve(): boolean;
  preserve(preserve: boolean): this;
  preserve(preserve?: boolean): this | boolean {
    if (preserve === void 0) {
      return this._preserve;
    } else {
      this._preserve = preserve;
      return this;
    }
  }

  fadeIn(transition?: Transition<any>): void {
    if (this._state === TickState.Excluded || this._state === TickState.Leaving) {
      this.opacity.setState(1, transition);
      this._state = TickState.Entering;
    }
  }

  fadeOut(transition?: Transition<any>): void {
    if (this._state === TickState.Entering || this._state === TickState.Included) {
      this.opacity.setState(0, transition);
      this._state = TickState.Leaving;
    }
  }

  needsUpdate(updateFlags: number, viewContext: RenderedViewContext): number {
    if ((updateFlags & (View.NeedsAnimate | View.NeedsLayout)) !== 0) {
      updateFlags = updateFlags | View.NeedsAnimate | View.NeedsLayout | View.NeedsRender;
    }
    return updateFlags;
  }

  protected onAnimate(viewContext: RenderedViewContext): void {
    const t = viewContext.updateTime;
    this.opacity.onFrame(t);

    this.tickMarkColor.onFrame(t);
    this.tickMarkWidth.onFrame(t);
    this.tickMarkLength.onFrame(t);

    this.tickLabelPadding.onFrame(t);

    this.gridLineColor.onFrame(t);
    this.gridLineWidth.onFrame(t);

    this.font.onFrame(t);
    this.textColor.onFrame(t);
  }

  protected onLayout(viewContext: RenderedViewContext): void {
    const tickLabel = this.tickLabel();
    if (RenderedView.is(tickLabel)) {
      this.layoutTickLabel(tickLabel, this._bounds, this._anchor);
    }
  }

  protected willUpdate(viewContext: RenderedViewContext): void {
    super.willUpdate(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
    }
  }

  protected onRender(viewContext: RenderedViewContext): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.globalAlpha = this.opacity.value!;
      const bounds = this._bounds;
      const anchor = this._anchor;
      this.renderTick(context, bounds, anchor);
    }
  }

  protected didUpdate(viewContext: RenderedViewContext): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.restore();
    }
    super.didUpdate(viewContext);
  }

  protected abstract layoutTickLabel(tickLabel: RenderedView, bounds: BoxR2, anchor: PointR2): void;

  protected abstract renderTick(context: CanvasContext, bounds: BoxR2, anchor: PointR2): void;

  protected layoutChildView(childView: View, viewContext: RenderedViewContext): void {
    if (childView.key() === "tickLabel" && RenderedView.is(childView)) {
      this.layoutTickLabel(childView, this._bounds, this._anchor);
    } else {
      super.layoutChildView(childView, viewContext);
    }
  }

  static top<D>(value: D): TopTickView<D> {
    return new TickView.Top(value);
  }

  static right<D>(value: D): RightTickView<D> {
    return new TickView.Right(value);
  }

  static bottom<D>(value: D): BottomTickView<D> {
    return new TickView.Bottom(value);
  }

  static left<D>(value: D): LeftTickView<D> {
    return new TickView.Left(value);
  }

  static from<D>(orientation: TickOrientation, value: D): TickView<D> {
    if (orientation === "top") {
      return TickView.top(value);
    } else if (orientation === "right") {
      return TickView.right(value);
    } else if (orientation === "bottom") {
      return TickView.bottom(value);
    } else if (orientation === "left") {
      return TickView.left(value);
    } else {
      throw new TypeError(orientation);
    }
  }

  static fromAny<D>(tick: AnyTickView<D>, orientation?: TickOrientation): TickView<D> {
    if (tick instanceof TickView) {
      return tick;
    } else if (tick && typeof tick === "object") {
      if (tick.orientation) {
        orientation = tick.orientation;
      }
      if (!orientation) {
        throw new TypeError();
      }
      const view = TickView.from(orientation, tick.value);
      if (tick.key !== void 0) {
        view.key(tick.key);
      }

      if (tick.tickMarkColor !== void 0) {
        view.tickMarkColor(tick.tickMarkColor);
      }
      if (tick.tickMarkWidth !== void 0) {
        view.tickMarkWidth(tick.tickMarkWidth);
      }
      if (tick.tickMarkLength !== void 0) {
        view.tickMarkLength(tick.tickMarkLength);
      }

      if (tick.tickLabelPadding !== void 0) {
        view.tickLabelPadding(tick.tickLabelPadding);
      }

      if (tick.gridLineColor !== void 0) {
        view.gridLineColor(tick.gridLineColor);
      }
      if (tick.gridLineWidth !== void 0) {
        view.gridLineWidth(tick.gridLineWidth);
      }

      if (tick.font !== void 0) {
        view.font(tick.font);
      }
      if (tick.textColor !== void 0) {
        view.textColor(tick.textColor);
      }

      if (tick.tickLabel !== void 0) {
        view.tickLabel(tick.tickLabel);
      }

      if (tick.hidden !== void 0) {
        view.setHidden(tick.hidden);
      }
      if (tick.culled !== void 0) {
        view.setCulled(tick.culled);
      }

      return view;
    }
    throw new TypeError("" + tick);
  }

  private static interpolateOpacity<D>(this: MemberAnimator<TickView<D>, number>, u: number): number {
    // Interpolate over max of time and distance translated
    const view = this._view;
    const coord = view._coord;
    if (isNaN(view._coord0)) {
      view._coord0 = coord;
    }
    const axisView = view._parentView as AxisView<D>;
    const tickSpacing = axisView._tickSpacing / 2;
    const v = Math.min(Math.abs(coord - view._coord0) / tickSpacing, 1);
    const opacity = this._interpolator!.interpolate(Math.max(u, v));
    if (u === 1 || v === 1) {
      this._tweenState = TweenState.Converged;
    }
    if (opacity === 0 && view._state === TickState.Leaving) {
      view._state = TickState.Excluded;
      view._coord0 = NaN;
      setTimeout(view.remove.bind(view));
    } else if (opacity === 1 && view._state === TickState.Entering) {
      view._state = TickState.Included;
      view._coord0 = NaN;
    }
    return opacity;
  }

  // Forward type declarations
  /** @hidden */
  static Top: typeof TopTickView; // defined by TopTickView
  /** @hidden */
  static Right: typeof RightTickView; // defined by RightTickView
  /** @hidden */
  static Bottom: typeof BottomTickView; // defined by BottomTickView
  /** @hidden */
  static Left: typeof LeftTickView; // defined by LeftTickView
}
