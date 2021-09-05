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

import type {Timing} from "@swim/mapping";
import {AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ViewContextType, ViewAnimator, ViewFastener} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
  LayerView,
  CanvasContext,
  CanvasRenderer,
  AnyTextRunView,
  TextRunView,
} from "@swim/graphics";
import type {TickViewObserver} from "./TickViewObserver";
import {TopTickView} from "../"; // forward import
import {RightTickView} from "../"; // forward import
import {BottomTickView} from "../"; // forward import
import {LeftTickView} from "../"; // forward import

/** @hidden */
export const enum TickState {
  Excluded,
  Entering,
  Included,
  Leaving,
}

export type TickOrientation = "top" | "right" | "bottom" | "left";

export type AnyTickView<D> = TickView<D> | TickViewInit<D>;

export interface TickViewInit<D> extends GraphicsViewInit {
  value: D;
  orientation?: TickOrientation;

  tickMarkColor?: AnyColor;
  tickMarkWidth?: number;
  tickMarkLength?: number;
  tickLabelPadding?: number;

  gridLineColor?: AnyColor;
  gridLineWidth?: number;

  font?: AnyFont;
  textColor?: AnyColor;

  label?: GraphicsView | string | null;
}

export abstract class TickView<D> extends LayerView {
  constructor(value: D) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "offset", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "tickState", {
      value: TickState.Excluded,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "preserved", {
      value: true,
      enumerable: true,
      configurable: true,
    });
  }

  override initView(init: TickViewInit<D>): void {
    super.initView(init);
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

    if (init.label !== void 0) {
      this.label(init.label);
    }
  }

  override readonly viewObservers!: ReadonlyArray<TickViewObserver<D>>;

  abstract readonly orientation: TickOrientation;

  readonly value!: D;

  /** @hidden */
  readonly offset!: number;

  /** @hidden */
  setOffset(offset: number): void {
    Object.defineProperty(this, "offset", {
      value: offset,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  readonly tickState!: TickState;

  @ViewAnimator({type: R2Point, state: R2Point.origin()})
  readonly anchor!: ViewAnimator<this, R2Point, AnyR2Point>;

  @ViewAnimator({type: Number, state: 1})
  readonly opacity!: ViewAnimator<this, number>;

  @ViewAnimator({type: Color, inherit: true, state: null})
  readonly tickMarkColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Number, inherit: true, state: 1})
  readonly tickMarkWidth!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, inherit: true, state: 6})
  readonly tickMarkLength!: ViewAnimator<this, number>;

  @ViewAnimator({type: Number, inherit: true, state: 2})
  readonly tickLabelPadding!: ViewAnimator<this, number>;

  @ViewAnimator({type: Color, inherit: true, state: null})
  readonly gridLineColor!: ViewAnimator<this, Color | null, AnyColor | null>;

  @ViewAnimator({type: Number, inherit: true, state: 0})
  readonly gridLineWidth!: ViewAnimator<this, number>;

  @ViewAnimator({type: Font, inherit: true, state: null})
  readonly font!: ViewAnimator<this, Font | null, AnyFont | null>;

  @ViewAnimator({type: Color, inherit: true, state: null})
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
      if (viewObserver.viewWillSetTickLabel !== void 0) {
        viewObserver.viewWillSetTickLabel(newLabelView, oldLabelView, this);
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
      if (viewObserver.viewDidSetTickLabel !== void 0) {
        viewObserver.viewDidSetTickLabel(newLabelView, oldLabelView, this);
      }
    }
  }

  @ViewFastener<TickView<D>, GraphicsView, AnyTextRunView>({
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

  /** @hidden */
  readonly preserved!: boolean;

  preserve(): boolean;
  preserve(preserve: boolean): this;
  preserve(preserve?: boolean): this | boolean {
    if (preserve === void 0) {
      return this.preserved;
    } else {
      Object.defineProperty(this, "preserved", {
        value: preserve,
        enumerable: true,
        configurable: true,
      });
      return this;
    }
  }

  fadeIn(timing?: Timing | boolean): void {
    if (this.tickState === TickState.Excluded || this.tickState === TickState.Leaving) {
      this.opacity.setState(1, timing);
      Object.defineProperty(this, "tickState", {
        value: TickState.Entering,
        enumerable: true,
        configurable: true,
      });
    }
  }

  fadeOut(timing?: Timing | boolean): void {
    if (this.tickState === TickState.Entering || this.tickState === TickState.Included) {
      this.opacity.setState(0, timing);
      Object.defineProperty(this, "tickState", {
        value: TickState.Leaving,
        enumerable: true,
        configurable: true,
      });
    }
  }

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    const labelView = this.label.view;
    if (labelView !== null) {
      this.layoutLabel(labelView);
    }
  }

  protected override willRender(viewContext: ViewContextType<this>): void {
    super.willRender(viewContext);
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.save();
    }
  }

  protected override onRender(viewContext: ViewContextType<this>): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer && !this.isHidden() && !this.isCulled()) {
      const context = renderer.context;
      context.globalAlpha = this.opacity.getValue();
      this.renderTick(context, this.viewFrame);
    }
  }

  protected override didRender(viewContext: ViewContextType<this>): void {
    const renderer = viewContext.renderer;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      context.restore();
    }
    super.didRender(viewContext);
  }

  protected abstract layoutLabel(labelView: GraphicsView): void;

  protected abstract renderTick(context: CanvasContext, frame: R2Box): void;

  static top<D>(value: D): TopTickView<D> {
    return new TopTickView(value);
  }

  static right<D>(value: D): RightTickView<D> {
    return new RightTickView(value);
  }

  static bottom<D>(value: D): BottomTickView<D> {
    return new BottomTickView(value);
  }

  static left<D>(value: D): LeftTickView<D> {
    return new LeftTickView(value);
  }

  static from<D>(value: D, orientation: TickOrientation): TickView<D> {
    if (orientation === "top") {
      return this.top(value);
    } else if (orientation === "right") {
      return this.right(value);
    } else if (orientation === "bottom") {
      return this.bottom(value);
    } else if (orientation === "left") {
      return this.left(value);
    } else {
      throw new TypeError(orientation);
    }
  }

  static fromInit<D>(init: TickViewInit<D>, orientation?: TickOrientation): TickView<D> {
    if (init.orientation !== void 0) {
      orientation = init.orientation;
    }
    if (orientation === void 0) {
      throw new TypeError();
    }
    const view = this.from(init.value, orientation);
    view.initView(init);
    return view;
  }

  static fromAny<D>(value: AnyTickView<D>, orientation?: TickOrientation): TickView<D> {
    if (value instanceof TickView) {
      return value;
    } else if (typeof value === "object" && value !== null) {
      return this.fromInit(value, orientation);
    }
    throw new TypeError("" + value);
  }
}
