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

import type {Class} from "@swim/util";
import {Timing} from "@swim/util";
import {Easing} from "@swim/util";
import type {ContinuousScale} from "@swim/util";
import {Affinity} from "@swim/component";
import {Property} from "@swim/component";
import {BTree} from "@swim/collections";
import {R2Point} from "@swim/math";
import type {R2Box} from "@swim/math";
import {Font} from "@swim/style";
import {Color} from "@swim/style";
import {ThemeAnimator} from "@swim/theme";
import type {ViewFlags} from "@swim/view";
import {View} from "@swim/view";
import type {GraphicsViewObserver} from "@swim/graphics";
import {GraphicsView} from "@swim/graphics";
import type {PaintingContext} from "@swim/graphics";
import {PaintingRenderer} from "@swim/graphics";
import {ContinuousScaleAnimator} from "./ContinuousScaleAnimator";
import {TickView} from "./TickView";
import {TickGenerator} from "./TickGenerator";

/** @public */
export type AxisOrientation = "top" | "right" | "bottom" | "left";

/** @public */
export interface AxisViewObserver<D = unknown, V extends AxisView<D> = AxisView<D>> extends GraphicsViewObserver<V> {
  viewWillAttachTick?(tickView: TickView<D>, targetView: View | null, view: V): void;

  viewDidDetachTick?(tickView: TickView<D>, view: V): void;

  createTickLabel?(tickValue: D, tickView: TickView<D>, view: V): GraphicsView | string | null;

  formatTickLabel?(tickLabel: string, tickView: TickView<D>, view: V): string | undefined;
}

/** @public */
export abstract class AxisView<D = unknown> extends GraphicsView {
  constructor() {
    super();
    this.tickViews = new BTree();
  }

  declare readonly observerType?: Class<AxisViewObserver<D>>;

  abstract readonly orientation: AxisOrientation;

  abstract readonly scale: ContinuousScaleAnimator<this, D, number>;

  /** @internal */
  readonly tickViews!: BTree<D, TickView<D>>;

  getTick(value: D): TickView<D> | null {
    const tickView = this.tickViews.get(value);
    return tickView !== void 0 ? tickView : null;
  }

  insertTick(value: D): TickView<D> | null {
    const tickView = this.createTickView(value);
    if (tickView !== null) {
      return this.insertChild(tickView, null);
    }
    return tickView;
  }

  removeTick(value: D): TickView<D> | null {
    const tickView = this.getTick(value);
    if (tickView !== null) {
      tickView.remove();
    }
    return tickView;
  }

  @Property({valueType: TickGenerator, value: true})
  readonly tickGenerator!: Property<this, TickGenerator<D> | true | null>;

  @ThemeAnimator({valueType: R2Point, value: R2Point.origin(), updateFlags: View.NeedsLayout | View.NeedsRender})
  readonly origin!: ThemeAnimator<this, R2Point>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly borderColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, value: 1, inherits: true, updateFlags: View.NeedsRender})
  readonly borderWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 6, inherits: true, updateFlags: View.NeedsRender})
  readonly borderSerif!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 80, updateFlags: View.NeedsRender})
  readonly tickMarkSpacing!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly tickMarkColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, value: 1, inherits: true, updateFlags: View.NeedsRender})
  readonly tickMarkWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 6, inherits: true, updateFlags: View.NeedsRender})
  readonly tickMarkLength!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Number, value: 2, inherits: true, updateFlags: View.NeedsRender})
  readonly tickLabelPadding!: ThemeAnimator<this, number>;

  @Property({
    valueType: Timing,
    inherits: true,
    initValue(): Timing {
      return Easing.cubicOut.withDuration(250);
    },
  })
  readonly tickTransition!: Property<this, Timing>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly gridLineColor!: ThemeAnimator<this, Color | null>;

  @ThemeAnimator({valueType: Number, value: 0, inherits: true, updateFlags: View.NeedsRender})
  readonly gridLineWidth!: ThemeAnimator<this, number>;

  @ThemeAnimator({valueType: Font, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly font!: ThemeAnimator<this, Font | null>;

  @ThemeAnimator({valueType: Color, value: null, inherits: true, updateFlags: View.NeedsRender})
  readonly textColor!: ThemeAnimator<this, Color | null>;

  protected updateTicks(): void {
    const scale = this.scale.value;
    let tickGenerator = this.tickGenerator.value;
    if (scale === null || tickGenerator === null) {
      return;
    }
    let timing: Timing | boolean = this.tickTransition.value;
    if (tickGenerator === true) {
      tickGenerator = TickGenerator.fromScale(scale);
      this.tickGenerator.set(tickGenerator);
      timing = false;
    }
    this.generateTicks(tickGenerator, scale, timing);
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

    const oldTicks = this.tickViews.clone();
    const tickValues = tickGenerator.generate();
    for (let i = 0; i < tickValues.length; i += 1) {
      const tickValue = tickValues[i]!;
      const oldTick = oldTicks.get(tickValue);
      if (oldTick !== void 0) {
        oldTicks.delete(tickValue);
        oldTick.fadeIn(timing);
      } else {
        const newTick = this.createTickView(tickValue);
        if (newTick !== null) {
          this.appendChild(newTick);
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
    if (tickView === null) {
      return null;
    }
    const tickLabel = this.createTickLabel(tickValue, tickView);
    if (tickLabel !== null) {
      tickView.label.set(tickLabel);
      tickView.preserve(false);
    }
    return tickView;
  }

  protected createTickLabel(tickValue: D, tickView: TickView<D>): GraphicsView | string | null {
    let tickLabel: GraphicsView | string | null = null;
    const observers = this.observers;
    if (observers !== null) {
      for (const observer of observers) {
        if (observer.createTickLabel === void 0) {
          continue;
        }
        tickLabel = observer.createTickLabel(tickValue, tickView, this);
      }
    }
    if (tickLabel === void 0 || tickLabel === null) {
      const tickGenerator = this.tickGenerator.value;
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
    if (observers === null) {
      return tickLabel;
    }
    for (const observer of observers) {
      if (observer.formatTickLabel === void 0) {
        continue;
      }
      const label = observer.formatTickLabel(tickLabel, tickView, this);
      if (label !== void 0) {
        return label;
      }
    }
    return tickLabel;
  }

  protected override onInsertChild(child: View, target: View | null): void {
    super.onInsertChild(child, target);
    if (child instanceof TickView && this.tickViews.get(child.value) !== child) {
      this.tickViews.set(child.value, child);
    }
  }

  protected override onRemoveChild(child: View): void {
    super.onRemoveChild(child);
    if (child instanceof TickView && this.tickViews.get(child.value) === child) {
      this.tickViews.delete(child.value);
    }
  }

  protected override needsDisplay(displayFlags: ViewFlags): ViewFlags {
    if ((this.flags & View.NeedsLayout) === 0) {
      displayFlags &= ~View.NeedsLayout;
    }
    return displayFlags;
  }

  protected override onLayout(): void {
    super.onLayout();
    this.scale.recohere(this.updateTime);
    this.updateTicks();
  }

  protected override displayChild(child: View, displayFlags: ViewFlags): void {
    if ((displayFlags & View.NeedsLayout) !== 0 && child instanceof TickView) {
      const scale = this.scale.value;
      if (scale !== null) {
        this.layoutTick(child, this.origin.getValue(), this.viewFrame, scale);
      }
    }
    super.displayChild(child, displayFlags);
  }

  protected abstract layoutTick(tick: TickView<D>, origin: R2Point, frame: R2Box,
                                scale: ContinuousScale<D, number>): void;

  protected override didRender(): void {
    const renderer = this.renderer.value;
    if (renderer instanceof PaintingRenderer) {
      this.renderDomain(renderer.context, this.origin.getValue(), this.viewFrame);
    }
    super.didRender();
  }

  protected abstract renderDomain(context: PaintingContext, origin: R2Point, frame: R2Box): void;
}

/** @public */
export class TopAxisView<X = unknown> extends AxisView<X> {
  override get orientation(): AxisOrientation {
    return "top";
  }

  @ContinuousScaleAnimator({
    value: null,
    inherits: "xScale",
    updateFlags: View.NeedsLayout,
  })
  override readonly scale!: ContinuousScaleAnimator<this, X, number>;

  protected override layoutTick(tick: TickView<X>, origin: R2Point, frame: R2Box,
                                scale: ContinuousScale<X, number>): void {
    if (tick.anchor.hasAffinity(Affinity.Intrinsic)) {
      const offset = scale(tick.value);
      tick.setOffset(offset);
      tick.anchor.setIntrinsic(new R2Point(frame.xMin + offset, origin.y));
    }
  }

  protected override renderDomain(context: PaintingContext, origin: R2Point, frame: R2Box): void {
    const borderColor = this.borderColor.value;
    const borderWidth = this.borderWidth.getValue();
    if (borderColor === null || borderWidth === 0) {
      return;
    }

    const x0 = frame.xMin;
    const x1 = frame.xMax;
    const y = origin.y;
    const dy = this.borderSerif.getValue();

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    context.beginPath();
    context.lineWidth = borderWidth;
    context.strokeStyle = borderColor.toString();
    if (dy !== 0) {
      context.moveTo(x0, y - dy);
      context.lineTo(x0, y);
      context.lineTo(x1, y);
      context.lineTo(x1, y - dy);
    } else {
      context.moveTo(x0, y);
      context.lineTo(x1, y);
    }
    context.stroke();

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}

/** @public */
export class RightAxisView<Y = unknown> extends AxisView<Y> {
  override get orientation(): AxisOrientation {
    return "right";
  }

  @ContinuousScaleAnimator({
    value: null,
    inherits: "yScale",
    updateFlags: View.NeedsLayout,
  })
  override readonly scale!: ContinuousScaleAnimator<this, Y, number>;

  protected override layoutTick(tick: TickView<Y>, origin: R2Point, frame: R2Box,
                                scale: ContinuousScale<Y, number>): void {
    if (tick.anchor.hasAffinity(Affinity.Intrinsic)) {
      const offset = scale(tick.value);
      tick.setOffset(offset);
      tick.anchor.setIntrinsic(new R2Point(origin.x, frame.yMin + offset));
    }
  }

  protected override renderDomain(context: PaintingContext, origin: R2Point, frame: R2Box): void {
    const borderColor = this.borderColor.value;
    const borderWidth = this.borderWidth.getValue();
    if (borderColor === null || borderWidth === 0) {
      return;
    }

    const x = origin.x;
    const dx = this.borderSerif.getValue();
    const y0 = frame.yMin;
    const y1 = frame.yMax;

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    context.beginPath();
    context.lineWidth = borderWidth;
    context.strokeStyle = borderColor.toString();
    if (dx !== 0) {
      context.moveTo(x + dx, y0);
      context.lineTo(x,      y0);
      context.lineTo(x,      y1);
      context.lineTo(x + dx, y1);
    } else {
      context.moveTo(x, y0);
      context.lineTo(x, y1);
    }
    context.stroke();

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}

/** @public */
export class BottomAxisView<X = unknown> extends AxisView<X> {
  override get orientation(): AxisOrientation {
    return "bottom";
  }

  @ContinuousScaleAnimator({
    value: null,
    inherits: "xScale",
    updateFlags: View.NeedsLayout,
  })
  override readonly scale!: ContinuousScaleAnimator<this, X, number>;

  protected override layoutTick(tick: TickView<X>, origin: R2Point, frame: R2Box,
                                scale: ContinuousScale<X, number>): void {
    if (tick.anchor.hasAffinity(Affinity.Intrinsic)) {
      const offset = scale(tick.value);
      tick.setOffset(offset);
      tick.anchor.setIntrinsic(new R2Point(frame.xMin + offset, origin.y));
    }
  }

  protected override renderDomain(context: PaintingContext, origin: R2Point, frame: R2Box): void {
    const borderColor = this.borderColor.value;
    const borderWidth = this.borderWidth.getValue();
    if (borderColor === null || borderWidth === 0) {
      return;
    }

    const x0 = frame.xMin;
    const x1 = frame.xMax;
    const y = origin.y;
    const dy = this.borderSerif.getValue();

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    context.beginPath();
    context.lineWidth = borderWidth;
    context.strokeStyle = borderColor.toString();
    if (dy !== 0) {
      context.moveTo(x0, y + dy);
      context.lineTo(x0, y);
      context.lineTo(x1, y);
      context.lineTo(x1, y + dy);
    } else {
      context.moveTo(x0, y);
      context.lineTo(x1, y);
    }
    context.stroke();

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}

/** @public */
export class LeftAxisView<Y = unknown> extends AxisView<Y> {
  override get orientation(): AxisOrientation {
    return "left";
  }

  @ContinuousScaleAnimator({
    value: null,
    inherits: "yScale",
    updateFlags: View.NeedsLayout,
  })
  override readonly scale!: ContinuousScaleAnimator<this, Y, number>;

  protected override layoutTick(tick: TickView<Y>, origin: R2Point, frame: R2Box,
                                scale: ContinuousScale<Y, number>): void {
    if (tick.anchor.hasAffinity(Affinity.Intrinsic)) {
      const offset = scale(tick.value);
      tick.setOffset(offset);
      tick.anchor.setIntrinsic(new R2Point(origin.x, frame.yMin + offset));
    }
  }

  protected override renderDomain(context: PaintingContext, origin: R2Point, frame: R2Box): void {
    const borderColor = this.borderColor.value;
    const borderWidth = this.borderWidth.getValue();
    if (borderColor === null || borderWidth === 0) {
      return;
    }

    const x = origin.x;
    const dx = this.borderSerif.getValue();
    const y0 = frame.yMin;
    const y1 = frame.yMax;

    // save
    const contextLineWidth = context.lineWidth;
    const contextStrokeStyle = context.strokeStyle;

    context.beginPath();
    context.lineWidth = borderWidth;
    context.strokeStyle = borderColor.toString();
    if (dx !== 0) {
      context.moveTo(x - dx, y0);
      context.lineTo(x,      y0);
      context.lineTo(x,      y1);
      context.lineTo(x - dx, y1);
    } else {
      context.moveTo(x, y0);
      context.lineTo(x, y1);
    }
    context.stroke();

    // restore
    context.lineWidth = contextLineWidth;
    context.strokeStyle = contextStrokeStyle;
  }
}
