// Copyright 2015-2023 Nstream, inc.
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

import type {Mutable} from "@swim/util";
import type {Class} from "@swim/util";
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {Timing} from "@swim/util";
import {Animator} from "@swim/component";
import {R2Point} from "@swim/math";
import type {R2Box} from "@swim/math";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import {View} from "@swim/view";
import {ViewRef} from "@swim/view";
import type {GraphicsViewObserver} from "@swim/graphics";
import {GraphicsView} from "@swim/graphics";
import type {PaintingContext} from "@swim/graphics";
import {PaintingRenderer} from "@swim/graphics";
import {CanvasRenderer} from "@swim/graphics";
import {TypesetView} from "@swim/graphics";
import {TextRunView} from "@swim/graphics";

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
export interface TickViewObserver<D = unknown, V extends TickView<D> = TickView<D>> extends GraphicsViewObserver<V> {
  viewWillAttachTickLabel?(labelView: GraphicsView, view: V): void;

  viewDidDetachTickLabel?(labelView: GraphicsView, view: V): void;
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

  declare readonly observerType?: Class<TickViewObserver<D>>;

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
  readonly anchor!: Animator<this, R2Point>;

  @ThemeAnimator({valueType: Number, value: 1, updateFlags: View.NeedsRender})
  readonly opacity!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly tickMarkColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, value: 1, inherits: true, updateFlags: View.NeedsRender})
  readonly tickMarkWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 6, inherits: true, updateFlags: View.NeedsRender})
  readonly tickMarkLength!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 2, inherits: true, updateFlags: View.NeedsRender})
  readonly tickLabelPadding!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly gridLineColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, value: 0, inherits: true, updateFlags: View.NeedsRender})
  readonly gridLineWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true})
  readonly font!: ThemeAnimator<this, Font | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true})
  readonly textColor!: ThemeAnimator<this, Color | null>;

  @ViewRef({
    viewType: TextRunView,
    viewKey: true,
    binds: true,
    willAttachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewWillAttachTickLabel", labelView, this.owner);
    },
    didDetachView(labelView: GraphicsView): void {
      this.owner.callObservers("viewDidDetachTickLabel", labelView, this.owner);
    },
    fromLike(value: GraphicsView | LikeType<GraphicsView> | string | undefined): GraphicsView {
      if (value === void 0 || typeof value === "string") {
        let view = this.view;
        if (view === null) {
          view = this.createView();
        }
        if (view instanceof TextRunView) {
          view.text.setState(value !== void 0 ? value : "");
        }
        return view;
      }
      return super.fromLike(value);
    },
  })
  readonly label!: ViewRef<this, Like<GraphicsView, string | undefined>>;

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
      this.opacity.set(1, timing);
      (this as Mutable<this>).tickState = TickState.Entering;
    }
  }

  fadeOut(timing?: Timing | boolean): void {
    if (this.tickState === TickState.Entering || this.tickState === TickState.Included) {
      this.opacity.set(0, timing);
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
}

/** @public */
export class TopTickView<X = unknown> extends TickView<X> {
  constructor(value: X) {
    super(value);
  }

  override get orientation(): TickOrientation {
    return "top";
  }

  protected override layoutLabel(labelView: GraphicsView): void {
    const anchor = this.anchor.getValue();
    const x = Math.round(anchor.x);
    const y0 = Math.round(anchor.y);
    const y1 = y0 - this.tickMarkLength.getValue();
    const y2 = y1 - this.tickLabelPadding.getValue();

    if (TypesetView[Symbol.hasInstance](labelView)) {
      labelView.setIntrinsic({
        textAlign: "center",
        textBaseline: "bottom",
        textOrigin: new R2Point(x, y2),
      });
    }
  }

  protected override renderTick(context: PaintingContext, frame: R2Box): void {
    const anchor = this.anchor.getValue();
    const x = Math.round(anchor.x);
    const y0 = Math.round(anchor.y);
    const tickMarkLength = this.tickMarkLength.getValue();
    const y1 = y0 - tickMarkLength;

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    const tickMarkColor = this.tickMarkColor.value;
    const tickMarkWidth = this.tickMarkWidth.getValue();
    if (tickMarkColor !== null && tickMarkWidth !== 0 && tickMarkLength !== 0) {
      context.beginPath();
      context.lineWidth = tickMarkWidth;
      context.strokeStyle = tickMarkColor.toString();
      context.moveTo(x, y0);
      context.lineTo(x, y1);
      context.stroke();
    }

    const gridLineColor = this.gridLineColor.value;
    const gridLineWidth = this.gridLineWidth.getValue();
    if (gridLineColor !== null && gridLineWidth !== 0 && frame.xMin < x && x < frame.xMax) {
      context.beginPath();
      context.lineWidth = gridLineWidth;
      context.strokeStyle = gridLineColor.toString();
      context.moveTo(x, y0);
      context.lineTo(x, frame.yMax);
      context.stroke();
    }

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}

/** @public */
export class RightTickView<Y = unknown> extends TickView<Y> {
  constructor(value: Y) {
    super(value);
  }

  override get orientation(): TickOrientation {
    return "right";
  }

  protected override layoutLabel(labelView: GraphicsView): void {
    const anchor = this.anchor.getValue();
    const x0 = Math.round(anchor.x);
    const y = Math.round(anchor.y);
    const x1 = x0 + this.tickMarkLength.getValue();
    const x2 = x1 + this.tickLabelPadding.getValue();

    if (TypesetView[Symbol.hasInstance](labelView)) {
      labelView.setIntrinsic({
        textAlign: "left",
        textBaseline: "middle",
        textOrigin: new R2Point(x2, y),
      });
    }
  }

  protected override renderTick(context: PaintingContext, frame: R2Box): void {
    const anchor = this.anchor.getValue();
    const x0 = Math.round(anchor.x);
    const y = Math.round(anchor.y);
    const tickMarkLength = this.tickMarkLength.getValue();
    const x1 = x0 + tickMarkLength;

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    const tickMarkColor = this.tickMarkColor.value;
    const tickMarkWidth = this.tickMarkWidth.getValue();
    if (tickMarkColor !== null && tickMarkWidth !== 0 && tickMarkLength !== 0) {
      context.beginPath();
      context.lineWidth = tickMarkWidth;
      context.strokeStyle = tickMarkColor.toString();
      context.moveTo(x0, y);
      context.lineTo(x1, y);
      context.stroke();
    }

    const gridLineColor = this.gridLineColor.value;
    const gridLineWidth = this.gridLineWidth.getValue();
    if (gridLineColor !== null && gridLineWidth !== 0 && frame.yMin < y && y < frame.yMax) {
      context.beginPath();
      context.lineWidth = gridLineWidth;
      context.strokeStyle = gridLineColor.toString();
      context.moveTo(x0, y);
      context.lineTo(frame.xMin, y);
      context.stroke();
    }

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}

/** @public */
export class BottomTickView<X = unknown> extends TickView<X> {
  constructor(value: X) {
    super(value);
  }

  override get orientation(): TickOrientation {
    return "bottom";
  }

  protected override layoutLabel(labelView: GraphicsView): void {
    const anchor = this.anchor.getValue();
    const x = Math.round(anchor.x);
    const y0 = Math.round(anchor.y);
    const y1 = y0 + this.tickMarkLength.getValue();
    const y2 = y1 + this.tickLabelPadding.getValue();

    if (TypesetView[Symbol.hasInstance](labelView)) {
      labelView.setIntrinsic({
        textAlign: "center",
        textBaseline: "top",
        textOrigin: new R2Point(x, y2),
      });
    }
  }

  protected override renderTick(context: PaintingContext, frame: R2Box): void {
    const anchor = this.anchor.getValue();
    const x = Math.round(anchor.x);
    const y0 = Math.round(anchor.y);
    const tickMarkLength = this.tickMarkLength.getValue();
    const y1 = y0 + tickMarkLength;

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    const tickMarkColor = this.tickMarkColor.value;
    const tickMarkWidth = this.tickMarkWidth.getValue();
    if (tickMarkColor !== null && tickMarkWidth !== 0 && tickMarkLength !== 0) {
      context.beginPath();
      context.lineWidth = tickMarkWidth;
      context.strokeStyle = tickMarkColor.toString();
      context.moveTo(x, y0);
      context.lineTo(x, y1);
      context.stroke();
    }

    const gridLineColor = this.gridLineColor.value;
    const gridLineWidth = this.gridLineWidth.getValue();
    if (gridLineColor !== null && gridLineWidth !== 0 && frame.xMin < x && x < frame.xMax) {
      context.beginPath();
      context.lineWidth = gridLineWidth;
      context.strokeStyle = gridLineColor.toString();
      context.moveTo(x, y0);
      context.lineTo(x, frame.yMin);
      context.stroke();
    }

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}

/** @public */
export class LeftTickView<Y = unknown> extends TickView<Y> {
  constructor(value: Y) {
    super(value);
  }

  override get orientation(): TickOrientation {
    return "left";
  }

  protected override layoutLabel(labelView: GraphicsView): void {
    const anchor = this.anchor.getValue();
    const x0 = Math.round(anchor.x);
    const y = Math.round(anchor.y);
    const x1 = x0 - this.tickMarkLength.getValue();
    const x2 = x1 - this.tickLabelPadding.getValue();

    if (TypesetView[Symbol.hasInstance](labelView)) {
      labelView.setIntrinsic({
        textAlign: "right",
        textBaseline: "middle",
        textOrigin: new R2Point(x2, y),
      });
    }
  }

  protected override renderTick(context: PaintingContext, frame: R2Box): void {
    const anchor = this.anchor.getValue();
    const x0 = Math.round(anchor.x);
    const y = Math.round(anchor.y);
    const tickMarkLength = this.tickMarkLength.getValue();
    const x1 = x0 - tickMarkLength;

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    const tickMarkColor = this.tickMarkColor.value;
    const tickMarkWidth = this.tickMarkWidth.getValue();
    if (tickMarkColor !== null && tickMarkWidth !== 0 && tickMarkLength !== 0) {
      context.beginPath();
      context.strokeStyle = tickMarkColor.toString();
      context.lineWidth = tickMarkWidth;
      context.moveTo(x0, y);
      context.lineTo(x1, y);
      context.stroke();
    }

    const gridLineColor = this.gridLineColor.value;
    const gridLineWidth = this.gridLineWidth.getValue();
    if (gridLineColor !== null && gridLineWidth !== 0 && frame.yMin < y && y < frame.yMax) {
      context.beginPath();
      context.lineWidth = gridLineWidth;
      context.strokeStyle = gridLineColor.toString();
      context.moveTo(x0, y);
      context.lineTo(frame.xMax, y);
      context.stroke();
    }

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}
