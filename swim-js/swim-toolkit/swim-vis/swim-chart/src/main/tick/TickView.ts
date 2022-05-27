// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Class, Timing} from "@swim/util";
import {FastenerClass, Animator} from "@swim/component";
import {AnyR2Point, R2Point, R2Box} from "@swim/math";
import {AnyFont, Font, AnyColor, Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {View, ViewRef} from "@swim/view";
import {
  GraphicsViewInit,
  GraphicsView,
  PaintingContext,
  PaintingRenderer,
  CanvasRenderer,
  TextRunView,
} from "@swim/graphics";
import type {TickViewObserver} from "./TickViewObserver";
import {TopTickView} from "../"; // forward import
import {RightTickView} from "../"; // forward import
import {BottomTickView} from "../"; // forward import
import {LeftTickView} from "../"; // forward import

/** @internal */
export const enum TickState {
  Excluded,
  Entering,
  Included,
  Leaving,
}

/** @public */
export type TickOrientation = "top" | "right" | "bottom" | "left";

/** @public */
export type AnyTickView<D = unknown> = TickView<D> | TickViewInit<D>;

/** @public */
export interface TickViewInit<D = unknown> extends GraphicsViewInit {
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

/** @public */
export abstract class TickView<D = unknown> extends GraphicsView {
  constructor(value: D) {
    super();
    this.value = value;
    this.offset = 0;
    this.tickState = TickState.Excluded;
    this.preserved = true;
  }

  override readonly observerType?: Class<TickViewObserver<D>>;

  abstract readonly orientation: TickOrientation;

  readonly value: D;

  /** @internal */
  readonly offset: number;

  /** @internal */
  setOffset(offset: number): void {
    (this as Mutable<this>).offset = offset;
  }

  /** @internal */
  readonly tickState: TickState;

  @Animator({valueType: R2Point, value: R2Point.origin(), updateFlags: View.NeedsRender})
  readonly anchor!: Animator<this, R2Point, AnyR2Point>;

  @ThemeAnimator({valueType: Number, value: 1, updateFlags: View.NeedsRender})
  readonly opacity!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly tickMarkColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({valueType: Number, value: 1, inherits: true, updateFlags: View.NeedsRender})
  readonly tickMarkWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 6, inherits: true, updateFlags: View.NeedsRender})
  readonly tickMarkLength!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 2, inherits: true, updateFlags: View.NeedsRender})
  readonly tickLabelPadding!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly gridLineColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ThemeAnimator({valueType: Number, value: 0, inherits: true, updateFlags: View.NeedsRender})
  readonly gridLineWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null, AnyFont | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | null, AnyColor | null>;

  @ViewRef<TickView<D>["label"]>({
    viewType: TextRunView,
    viewKey: true,
    binds: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachTickLabel", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachTickLabel", labelView, this.owner);
    },
    setText(label: string | undefined): GraphicsView {
      let labelView = this.view;
      if (labelView === null) {
        labelView = this.createView();
        this.setView(labelView);
      }
      if (labelView instanceof TextRunView) {
        labelView.text(label !== void 0 ? label : "");
      }
      return labelView;
    },
  })
  readonly label!: ViewRef<this, GraphicsView> & {
    setText(label: string | undefined): GraphicsView,
  };
  static readonly label: FastenerClass<TickView["label"]>;

  /** @internal */
  readonly preserved: boolean;

  preserve(): boolean;
  preserve(preserve: boolean): this;
  preserve(preserve?: boolean): this | boolean {
    if (preserve === void 0) {
      return this.preserved;
    } else {
      (this as Mutable<this>).preserved = preserve;
      return this;
    }
  }

  fadeIn(timing?: Timing | boolean): void {
    if (this.tickState === TickState.Excluded || this.tickState === TickState.Leaving) {
      this.opacity.setState(1, timing);
      (this as Mutable<this>).tickState = TickState.Entering;
    }
  }

  fadeOut(timing?: Timing | boolean): void {
    if (this.tickState === TickState.Entering || this.tickState === TickState.Included) {
      this.opacity.setState(0, timing);
      (this as Mutable<this>).tickState = TickState.Leaving;
    }
  }

  protected override onLayout(): void {
    super.onLayout();
    const labelView = this.label.view;
    if (labelView !== null) {
      this.layoutLabel(labelView);
    }
  }

  /** @internal */
  private static globalAlpha: number = NaN;

  protected override willRender(): void {
    super.willRender();
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      // save
      TickView.globalAlpha = context.globalAlpha;
      context.globalAlpha = this.opacity.getValue();
    }
  }

  protected override onRender(): void {
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer && !this.hidden && !this.culled) {
      this.renderTick(renderer.context, this.viewFrame);
    }
  }

  protected override didRender(): void {
    const renderer = this.renderer.value;
    if (renderer instanceof CanvasRenderer) {
      const context = renderer.context;
      // restore
      context.globalAlpha = TickView.globalAlpha;
      TickView.globalAlpha = NaN;
    }
    super.didRender();
  }

  protected abstract layoutLabel(labelView: GraphicsView): void;

  protected abstract renderTick(context: PaintingContext, frame: R2Box): void;

  override init(init: TickViewInit<D>): void {
    super.init(init);
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

    if (typeof init.label === "string") {
      this.label.setText(init.label);
    } else if (init.label !== void 0) {
      this.label.setView(init.label);
    }
  }

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

  static override fromInit<D>(init: TickViewInit<D>, orientation?: TickOrientation): TickView<D>;
  static override fromInit(init: TickViewInit, orientation?: TickOrientation): TickView;
  static override fromInit(init: TickViewInit, orientation?: TickOrientation): TickView {
    if (init.orientation !== void 0) {
      orientation = init.orientation;
    }
    if (orientation === void 0) {
      throw new TypeError();
    }
    const view = this.from(init.value, orientation);
    view.init(init);
    return view;
  }

  static override fromAny<D>(value: AnyTickView<D>, orientation?: TickOrientation): TickView<D>;
  static override fromAny(value: AnyTickView, orientation?: TickOrientation): TickView;
  static override fromAny(value: AnyTickView, orientation?: TickOrientation): TickView {
    if (value === void 0 || value === null) {
      return value;
    } else if (value instanceof View) {
      if (value instanceof this) {
        return value;
      } else {
        throw new TypeError(value + " not an instance of " + this);
      }
    } else {
      return this.fromInit(value, orientation);
    }
  }
}
