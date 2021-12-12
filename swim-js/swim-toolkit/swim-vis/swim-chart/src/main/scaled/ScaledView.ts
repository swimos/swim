// Copyright 2015-2021 Swim.inc
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

import {
  Mutable,
  Class,
  Equals,
  Equivalent,
  Arrays,
  Values,
  Domain,
  Range,
  AnyTiming,
  Timing,
  Easing,
  LinearDomain,
  LinearRange,
  ContinuousScale,
  LinearScale,
} from "@swim/util";
import {Affinity, MemberFastenerClass, Property, Animator} from "@swim/component";
import {DateTime, TimeDomain, TimeScale} from "@swim/time";
import {ScaleGestureInput, ScaleGesture, ViewContextType, ViewFlags, View, ViewSet} from "@swim/view";
import {GraphicsViewInit, GraphicsView} from "@swim/graphics";
import {ScaledXView} from "./ScaledXView";
import {ScaledYView} from "./ScaledYView";
import type {ScaledXYView} from "./ScaledXYView";
import {ContinuousScaleAnimator} from "./ContinuousScaleAnimator";
import type {ScaledViewObserver} from "./ScaledViewObserver";

/** @internal */
export type ScaledFlags = number;

/** @public */
export interface ScaledViewInit<X = unknown, Y = unknown> extends GraphicsViewInit {
  xScale?: ContinuousScale<X, number>;
  yScale?: ContinuousScale<Y, number>;

  xDomainBounds?: [X | boolean, X | boolean];
  yDomainBounds?: [Y | boolean, Y | boolean];
  xZoomBounds?: [number | boolean, number | boolean];
  yZoomBounds?: [number | boolean, number | boolean];

  xDomainPadding?: [X | boolean, X | boolean];
  yDomainPadding?: [Y | boolean, Y | boolean];
  xRangePadding?: [number, number];
  yRangePadding?: [number, number];

  fitAlign?: [number, number] | number;
  xFitAlign?: number;
  yFitAlign?: number;
  fitAspectRatio?: number;
  preserveAspectRatio?: boolean;

  domainTracking?: [boolean, boolean] | boolean;
  xDomainTracking?: boolean;
  yDomainTracking?: boolean;

  scaleGestures?: [boolean, boolean] | boolean;
  xScaleGestures?: boolean;
  yScaleGestures?: boolean;

  rescaleTransition?: AnyTiming | boolean;
  reboundTransition?: AnyTiming | boolean;
}

/** @public */
export abstract class ScaledView<X = unknown, Y = unknown> extends GraphicsView implements ScaledXYView<X, Y> {
  constructor() {
    super();
    this.scaledFlags = 0;
    this.xDataDomain = null;
    this.yDataDomain = null;
    this.xDataRange = null;
    this.yDataRange = null;
    this.xDataDomainPadded = null;
    this.yDataDomainPadded = null;
  }

  override readonly observerType?: Class<ScaledViewObserver<X, Y>>;

  /** @internal */
  readonly scaledFlags: ScaledFlags;

  /** @internal */
  setScaledFlags(scaledFlags: ScaledFlags): void {
    (this as Mutable<this>).scaledFlags = scaledFlags;
  }

  @Animator<ScaledView<X, Y>, ContinuousScale<X, number> | null>({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherits: true,
    value: null,
    updateFlags: View.NeedsLayout,
    willSetValue(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
      this.owner.callObservers("viewWillSetXScale", newXScale, oldXScale, this.owner);
    },
    didSetValue(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
      this.owner.updateXDataRange();
      this.owner.callObservers("viewDidSetXScale", newXScale, oldXScale, this.owner);
    },
    willTransition(xScale: ContinuousScale<X, number>): void {
      if ((this.owner.scaledFlags & ScaledView.XBoundingFlag) !== 0) {
        this.owner.onBeginBoundingXScale(xScale);
      }
    },
    didTransition(xScale: ContinuousScale<X, number>): void {
      if ((this.owner.scaledFlags & ScaledView.XBoundingFlag) !== 0) {
        this.owner.onEndBoundingXScale(xScale);
      }
    },
    didInterrupt(xScale: ContinuousScale<X, number>): void {
      if ((this.owner.scaledFlags & ScaledView.XBoundingFlag) !== 0) {
        this.owner.onInterruptBoundingXScale(xScale);
      }
    },
  })
  readonly xScale!: ContinuousScaleAnimator<this, X, number>;

  @Animator<ScaledView<X, Y>, ContinuousScale<Y, number> | null>({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherits: true,
    value: null,
    updateFlags: View.NeedsLayout,
    willSetValue(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
      this.owner.callObservers("viewWillSetYScale", newYScale, oldYScale, this.owner);
    },
    didSetValue(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
      this.owner.updateYDataRange();
      this.owner.callObservers("viewDidSetYScale", newYScale, oldYScale, this.owner);
    },
    willTransition(yScale: ContinuousScale<Y, number>): void {
      if ((this.owner.scaledFlags & ScaledView.YBoundingFlag) !== 0) {
        this.owner.onBeginBoundingYScale(yScale);
      }
    },
    didTransition(yScale: ContinuousScale<Y, number>): void {
      if ((this.owner.scaledFlags & ScaledView.YBoundingFlag) !== 0) {
        this.owner.onEndBoundingYScale(yScale);
      }
    },
    didInterrupt(yScale: ContinuousScale<Y, number>): void {
      if ((this.owner.scaledFlags & ScaledView.YBoundingFlag) !== 0) {
        this.owner.onInterruptBoundingYScale(yScale);
      }
    },
  })
  readonly yScale!: ContinuousScaleAnimator<this, Y, number>;

  xDomain(): Domain<X> | null;
  xDomain(xDomain: Domain<X> | string | null, timing?: AnyTiming | boolean): this;
  xDomain(xMin: X, xMax: X, timing?: AnyTiming | boolean): this;
  xDomain(xMin?: Domain<X> | X | string | null, xMax?: X | AnyTiming | boolean,
          timing?: AnyTiming | boolean): Domain<X> | null | this {
    if (xMin === void 0) {
      const xScale = this.xScale.value;
      return xScale !== null ? xScale.domain : null;
    } else {
      if (xMin instanceof Domain || typeof xMin === "string") {
        timing = xMax as AnyTiming | boolean;
      }
      if (timing === true) {
        timing = this.rescaleTransition.value;
      }
      const xRange = this.xRange();
      if (xMin instanceof Domain || typeof xMin === "string") {
        if (xRange !== null) {
          this.xScale.setBaseScale(xMin as Domain<X> | string, xRange, timing);
        } else {
          this.xScale.setBaseDomain(xMin as Domain<X> | string, timing);
        }
      } else {
        if (xRange !== null) {
          this.xScale.setBaseScale(xMin as X, xMax as X, xRange[0], xRange[1], timing);
        } else {
          this.xScale.setBaseDomain(xMin as X, xMax as X, timing);
        }
      }
      return this;
    }
  }

  yDomain(): Domain<Y> | null;
  yDomain(yDomain: Domain<Y> | string | null, timing?: AnyTiming | boolean): this;
  yDomain(yMin: Y, yMax: Y, timing?: AnyTiming | boolean): this;
  yDomain(yMin?: Domain<Y> | Y | string | null, yMax?: Y | AnyTiming | boolean,
          timing?: AnyTiming | boolean): Domain<Y> | null | this {
    if (yMin === void 0) {
      const yScale = this.yScale.value;
      return yScale !== null ? yScale.domain : null;
    } else {
      if (yMin instanceof Domain || typeof yMin === "string") {
        timing = yMax as AnyTiming | boolean;
      }
      if (timing === true) {
        timing = this.rescaleTransition.value;
      }
      const yRange = this.yRange();
      if (yMin instanceof Domain || typeof yMin === "string") {
        if (yRange !== null) {
          this.yScale.setBaseScale(yMin as Domain<Y> | string, yRange, timing);
        } else {
          this.yScale.setBaseDomain(yMin as Domain<Y>| string, timing);
        }
      } else {
        if (yRange !== null) {
          this.yScale.setBaseScale(yMin as Y, yMax as Y, yRange[0], yRange[1], timing);
        } else {
          this.yScale.setBaseDomain(yMin as Y, yMax as Y, timing);
        }
      }
      return this;
    }
  }

  xRange(): Range<number> | null {
    const width = this.viewFrame.width;
    if (isFinite(width)) {
      const xRangePadding = this.xRangePadding.value;
      const xRangeMin = xRangePadding[0];
      const xRangeMax = width - xRangePadding[1];
      return LinearRange(xRangeMin, xRangeMax);
    } else {
      return null;
    }
  }

  yRange(): Range<number> | null {
    const height = this.viewFrame.height;
    if (isFinite(height)) {
      const yRangePadding = this.yRangePadding.value;
      const yRangeMin = yRangePadding[0];
      const yRangeMax = height - yRangePadding[1];
      return LinearRange(yRangeMax, yRangeMin);
    } else {
      return null;
    }
  }

  readonly xDataDomain: Domain<X> | null;

  protected setXDataDomain(newXDataDomain: Domain<X> | null): void {
    const oldXDataDomain = this.xDataDomain;
    if (!Equals(newXDataDomain, oldXDataDomain)) {
      this.willSetXDataDomain(newXDataDomain, oldXDataDomain);
      (this as Mutable<this>).xDataDomain = newXDataDomain;
      this.onSetXDataDomain(newXDataDomain, oldXDataDomain);
      this.didSetXDataDomain(newXDataDomain, oldXDataDomain);
    }
  }

  protected willSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.callObservers("viewWillSetXDataDomain", newXDataDomain, oldXDataDomain, this);
  }

  protected onSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.updateXDataRange();
    this.updateXDataDomainPadded();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.callObservers("viewDidSetXDataDomain", newXDataDomain, oldXDataDomain, this);
  }

  protected updateXDataDomain(xScaledDomain: Domain<X> | null): void {
    let xDataDomain = this.xDataDomain;
    if (xDataDomain === null || this.scaled.viewCount === 1) {
      xDataDomain = xScaledDomain;
    } else if (xScaledDomain !== null) {
      if (Values.compare(xScaledDomain[0], xDataDomain[0]) < 0) {
        xDataDomain = Domain(xScaledDomain[0], xDataDomain[1]);
      }
      if (Values.compare(xDataDomain[1], xScaledDomain[1]) < 0) {
        xDataDomain = Domain(xDataDomain[0], xScaledDomain[1]);
      }
    }
    this.setXDataDomain(xDataDomain);
  }

  readonly yDataDomain: Domain<Y> | null;

  protected setYDataDomain(newYDataDomain: Domain<Y> | null): void {
    const oldYDataDomain = this.yDataDomain;
    if (!Equals(newYDataDomain, oldYDataDomain)) {
      this.willSetYDataDomain(newYDataDomain, oldYDataDomain);
      (this as Mutable<this>).yDataDomain = newYDataDomain;
      this.onSetYDataDomain(newYDataDomain, oldYDataDomain);
      this.didSetYDataDomain(newYDataDomain, oldYDataDomain);
    }
  }

  protected willSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.callObservers("viewWillSetYDataDomain", newYDataDomain, oldYDataDomain, this);
  }

  protected onSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.updateYDataRange();
    this.updateYDataDomainPadded();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.callObservers("viewDidSetYDataDomain", newYDataDomain, oldYDataDomain, this);
  }

  protected updateYDataDomain(yScaledDomain: Domain<Y> | null): void {
    let yDataDomain = this.yDataDomain;
    if (yDataDomain === null || this.scaled.viewCount === 1) {
      yDataDomain = yScaledDomain;
    } else if (yScaledDomain !== null) {
      if (Values.compare(yScaledDomain[0], yDataDomain[0]) < 0) {
        yDataDomain = Domain(yScaledDomain[0], yDataDomain[1]);
      }
      if (Values.compare(yDataDomain[1], yScaledDomain[1]) < 0) {
        yDataDomain = Domain(yDataDomain[0], yScaledDomain[1]);
      }
    }
    this.setYDataDomain(yDataDomain);
  }

  readonly xDataRange: Range<number> | null;

  protected setXDataRange(xDataRange: Range<number> | null): void {
    (this as Mutable<this>).xDataRange = xDataRange;
  }

  protected updateXDataRange(): void {
    const xDataDomain = this.xDataDomain;
    if (xDataDomain !== null) {
      const xScale = this.xScale.value;
      if (xScale !== null) {
        this.setXDataRange(LinearRange(xScale(xDataDomain[0]), xScale(xDataDomain[1])));
      } else {
        this.setXDataRange(null);
      }
    }
  }

  readonly yDataRange: Range<number> | null;

  protected setYDataRange(yDataRange: Range<number> | null): void {
    (this as Mutable<this>).yDataRange = yDataRange;
  }

  protected updateYDataRange(): void {
    const yDataDomain = this.yDataDomain;
    if (yDataDomain !== null) {
      const yScale = this.yScale.value;
      if (yScale !== null) {
        this.setYDataRange(LinearRange(yScale(yDataDomain[0]), yScale(yDataDomain[1])));
      } else {
        this.setYDataRange(null);
      }
    }
  }

  readonly xDataDomainPadded: Domain<X> | null;

  protected setXDataDomainPadded(xDataDomainPadded: Domain<X> | null): void {
    (this as Mutable<this>).xDataDomainPadded = xDataDomainPadded;
  }

  protected updateXDataDomainPadded(): void {
    let xDataDomainPadded: Domain<X> | null;
    const xDataDomain = this.xDataDomain;
    if (xDataDomain !== null) {
      let xDataDomainPaddedMin = xDataDomain[0];
      let xDataDomainPaddedMax = xDataDomain[1];
      const xDomainPadding = this.xDomainPadding.value;
      if (typeof xDomainPadding[0] !== "boolean") {
        xDataDomainPaddedMin = (+xDataDomainPaddedMin - +xDomainPadding[0]) as unknown as X;
      }
      if (typeof xDomainPadding[1] !== "boolean") {
        xDataDomainPaddedMax = (+xDataDomainPaddedMax + +xDomainPadding[1]) as unknown as X;
      }
      xDataDomainPadded = Domain(xDataDomainPaddedMin, xDataDomainPaddedMax);
    } else {
      xDataDomainPadded = null;
    }
    this.setXDataDomainPadded(xDataDomainPadded);
  }

  readonly yDataDomainPadded: Domain<Y> | null;

  protected setYDataDomainPadded(yDataDomainPadded: Domain<Y> | null): void {
    (this as Mutable<this>).yDataDomainPadded = yDataDomainPadded;
  }

  protected updateYDataDomainPadded(): void {
    let yDataDomainPadded: Domain<Y> | null;
    const yDataDomain = this.yDataDomain;
    if (yDataDomain !== null) {
      let yDataDomainPaddedMin = yDataDomain[0];
      let yDataDomainPaddedMax = yDataDomain[1];
      const yDomainPadding = this.yDomainPadding.value;
      if (typeof yDomainPadding[0] !== "boolean") {
        yDataDomainPaddedMin = (+yDataDomainPaddedMin - +yDomainPadding[0]) as unknown as Y;
      }
      if (typeof yDomainPadding[1] !== "boolean") {
        yDataDomainPaddedMax = (+yDataDomainPaddedMax + +yDomainPadding[1]) as unknown as Y;
      }
      yDataDomainPadded = Domain(yDataDomainPaddedMin, yDataDomainPaddedMax);
    } else {
      yDataDomainPadded = null;
    }
    this.setYDataDomainPadded(yDataDomainPadded);
  }

  @Property<ScaledView<X, Y>, readonly [X | boolean, X | boolean]>({
    updateFlags: View.NeedsLayout,
    initValue(): readonly [X | boolean, X | boolean] {
      return [true, true];
    },
    equalValues(newXDomainBounds: readonly [X | boolean, X | boolean], oldXDomainBounds: readonly [X | boolean, X | boolean]): boolean {
      return Arrays.equal(newXDomainBounds, oldXDomainBounds);
    },
  })
  readonly xDomainBounds!: Property<this, readonly [X | boolean, X | boolean]>

  @Property<ScaledView<X, Y>, readonly [Y | boolean, Y | boolean]>({
    updateFlags: View.NeedsLayout,
    initValue(): readonly [Y | boolean, Y | boolean] {
      return [true, true];
    },
    equalValues(newYDomainBounds: readonly [Y | boolean, Y | boolean], oldYDomainBounds: readonly [Y | boolean, Y | boolean]): boolean {
      return Arrays.equal(newYDomainBounds, oldYDomainBounds);
    },
  })
  readonly yDomainBounds!: Property<this, readonly [Y | boolean, Y | boolean]>

  @Property<ScaledView<X, Y>, readonly [number | boolean, number | boolean]>({
    updateFlags: View.NeedsLayout,
    initValue(): readonly [number | boolean, number | boolean] {
      return [true, true];
    },
    equalValues(newXZoomBounds: readonly [number | boolean, number | boolean], oldXZoomBounds: readonly [number | boolean, number | boolean]): boolean {
      return Arrays.equal(newXZoomBounds, oldXZoomBounds);
    },
  })
  readonly xZoomBounds!: Property<this, readonly [number | boolean, number | boolean]>

  @Property<ScaledView<X, Y>, readonly [number | boolean, number | boolean]>({
    updateFlags: View.NeedsLayout,
    initValue(): readonly [number | boolean, number | boolean] {
      return [true, true];
    },
    equalValues(newYDomainBounds: readonly [number | boolean, number | boolean], oldYDomainBounds: readonly [number | boolean, number | boolean]): boolean {
      return Arrays.equal(newYDomainBounds, oldYDomainBounds);
    },
  })
  readonly yZoomBounds!: Property<this, readonly [number | boolean, number | boolean]>

  @Property<ScaledView<X, Y>, readonly [X | boolean, X | boolean]>({
    updateFlags: View.NeedsLayout,
    initValue(): readonly [X | boolean, X | boolean] {
      return [false, false];
    },
    equalValues(newXDomainPadding: readonly [X | boolean, X | boolean], oldXDomainPadding: readonly [X | boolean, X | boolean]): boolean {
      return Arrays.equal(newXDomainPadding, oldXDomainPadding);
    },
  })
  readonly xDomainPadding!: Property<this, readonly [X | boolean, X | boolean]>

  @Property<ScaledView<X, Y>, readonly [Y | boolean, Y | boolean]>({
    updateFlags: View.NeedsLayout,
    initValue(): readonly [Y | boolean, Y | boolean] {
      return [false, false];
    },
    equalValues(newYDomainPadding: readonly [Y | boolean, Y | boolean], oldYDomainPadding: readonly [Y | boolean, Y | boolean]): boolean {
      return Arrays.equal(newYDomainPadding, oldYDomainPadding);
    },
  })
  readonly yDomainPadding!: Property<this, readonly [Y | boolean, Y | boolean]>

  protected updateXRangePadding(xScaledRangePadding: readonly [number, number]): void {
    if (this.xRangePadding.hasAffinity(Affinity.Intrinsic)) {
      let xRangePadding = this.xRangePadding.value;
      if (xRangePadding === null || this.scaled.viewCount === 1) {
        xRangePadding = xScaledRangePadding;
      } else if (xScaledRangePadding !== null) {
        xRangePadding = [Math.max(xRangePadding[0], xScaledRangePadding[0]), Math.max(xRangePadding[1], xScaledRangePadding[1])];
      }
      this.xRangePadding.setValue(xRangePadding, Affinity.Intrinsic);
    }
  }

  @Property<ScaledView<X, Y>, readonly [number, number]>({
    updateFlags: View.NeedsLayout,
    initValue(): readonly [number, number] {
      return [0, 0];
    },
    willSetValue(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewWillSetXRangePadding", newXRangePadding, oldXRangePadding, this.owner);
    },
    didSetValue(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewDidSetXRangePadding", newXRangePadding, oldXRangePadding, this.owner);
    },
    equalValues(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): boolean {
      return Arrays.equal(newXRangePadding, oldXRangePadding);
    },
  })
  readonly xRangePadding!: Property<this, readonly [number, number]>

  protected updateYRangePadding(yScaledRangePadding: readonly [number, number]): void {
    if (this.yRangePadding.hasAffinity(Affinity.Intrinsic)) {
      let yRangePadding = this.yRangePadding.value;
      if (yRangePadding === null || this.scaled.viewCount === 1) {
        yRangePadding = yScaledRangePadding;
      } else if (yScaledRangePadding !== null) {
        yRangePadding = [Math.max(yRangePadding[0], yScaledRangePadding[0]), Math.max(yRangePadding[1], yScaledRangePadding[1])];
      }
      this.yRangePadding.setValue(yRangePadding, Affinity.Intrinsic);
    }
  }

  @Property<ScaledView<X, Y>, readonly [number, number]>({
    updateFlags: View.NeedsLayout,
    initValue(): readonly [number, number] {
      return [0, 0];
    },
    willSetValue(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewWillSetYRangePadding", newYRangePadding, oldYRangePadding, this.owner);
    },
    didSetValue(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.callObservers("viewDidSetYRangePadding", newYRangePadding, oldYRangePadding, this.owner);
    },
    equalValues(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): boolean {
      return Arrays.equal(newYRangePadding, oldYRangePadding);
    },
  })
  readonly yRangePadding!: Property<this, readonly [number, number]>

  @Property<ScaledView<X, Y>, readonly [number, number], number>({
    type: Object,
    initValue(): readonly [number, number] {
      return [1.0, 0.5];
    },
    equalValues(newFitAlign: readonly [number, number], oldFitAlign: readonly [number, number]): boolean {
      return Arrays.equal(newFitAlign, oldFitAlign);
    },
    fromAny(value: readonly [number, number] | number): readonly [number, number] {
      if (typeof value === "number") {
        return [value, value];
      } else {
        return value;
      }
    },
  })
  readonly fitAlign!: Property<this, readonly [number, number], number>;

  xFitAlign(): number;
  xFitAlign(xFitAlign: number): this;
  xFitAlign(xFitAlign?: number): number | this {
    const fitAlign = this.fitAlign.value;
    if (xFitAlign === void 0) {
      return fitAlign[0];
    } else {
      this.fitAlign.setValue([xFitAlign, fitAlign[1]]);
      return this;
    }
  }

  yFitAlign(): number;
  yFitAlign(yFitAlign: number): this;
  yFitAlign(yFitAlign?: number): number | this {
    const fitAlign = this.fitAlign.value;
    if (yFitAlign === void 0) {
      return fitAlign[0];
    } else {
      this.fitAlign.setValue([fitAlign[0], yFitAlign]);
      return this;
    }
  }

  @Property({type: Number})
  readonly fitAspectRatio!: Property<this, number | undefined>;

  preserveAspectRatio(): boolean;
  preserveAspectRatio(preserveAspectRatio: boolean): this;
  preserveAspectRatio(preserveAspectRatio?: boolean): boolean | this {
    if (preserveAspectRatio === void 0) {
      return this.gesture.preserveAspectRatio;
    } else {
      this.gesture.preserveAspectRatio = preserveAspectRatio;
      return this;
    }
  }

  domainTracking(): readonly [boolean, boolean];
  domainTracking(domainTracking: readonly [boolean, boolean] | boolean): this;
  domainTracking(xDomainTracking: boolean, yDomainTracking: boolean): this;
  domainTracking(xDomainTracking?: readonly [boolean, boolean] | boolean,
                 yDomainTracking?: boolean): readonly [boolean, boolean] | this {
    if (xDomainTracking === void 0) {
      return [(this.scaledFlags & ScaledView.XDomainTrackingFlag) !== 0,
              (this.scaledFlags & ScaledView.YDomainTrackingFlag) !== 0];
    } else {
      if (Array.isArray(xDomainTracking)) {
        yDomainTracking = xDomainTracking[1] as boolean;
        xDomainTracking = xDomainTracking[0] as boolean;
      } else if (yDomainTracking === void 0) {
        yDomainTracking = xDomainTracking as boolean;
      }
      if (xDomainTracking as boolean) {
        this.setScaledFlags(this.scaledFlags | ScaledView.XDomainTrackingFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.XDomainTrackingFlag);
      }
      if (yDomainTracking) {
        this.setScaledFlags(this.scaledFlags | ScaledView.YDomainTrackingFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.YDomainTrackingFlag);
      }
      return this;
    }
  }

  xDomainTracking(): boolean;
  xDomainTracking(xDomainTracking: boolean): this;
  xDomainTracking(xDomainTracking?: boolean): boolean | this {
    if (xDomainTracking === void 0) {
      return (this.scaledFlags & ScaledView.XDomainTrackingFlag) !== 0;
    } else {
      if (xDomainTracking) {
        this.setScaledFlags(this.scaledFlags | ScaledView.XDomainTrackingFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.XDomainTrackingFlag);
      }
      return this;
    }
  }

  yDomainTracking(): boolean;
  yDomainTracking(yDomainTracking: boolean): this;
  yDomainTracking(yDomainTracking?: boolean): boolean | this {
    if (yDomainTracking === void 0) {
      return (this.scaledFlags & ScaledView.YDomainTrackingFlag) !== 0;
    } else {
      if (yDomainTracking) {
        this.setScaledFlags(this.scaledFlags | ScaledView.YDomainTrackingFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.YDomainTrackingFlag);
      }
      return this;
    }
  }

  scaleGestures(): readonly [boolean, boolean];
  scaleGestures(scaleGestures: readonly [boolean, boolean] | boolean): this;
  scaleGestures(xScaleGestures: boolean, yScaleGestures: boolean): this;
  scaleGestures(xScaleGestures?: readonly [boolean, boolean] | boolean,
                yScaleGestures?: boolean): readonly [boolean, boolean] | this {
    if (xScaleGestures === void 0) {
      return [(this.scaledFlags & ScaledView.XScaleGesturesFlag) !== 0,
              (this.scaledFlags & ScaledView.YScaleGesturesFlag) !== 0];
    } else {
      if (Array.isArray(xScaleGestures)) {
        yScaleGestures = xScaleGestures[1] as boolean;
        xScaleGestures = xScaleGestures[0] as boolean;
      } else if (yScaleGestures === void 0) {
        yScaleGestures = xScaleGestures as boolean;
      }
      if (xScaleGestures as boolean) {
        this.setScaledFlags(this.scaledFlags | ScaledView.XScaleGesturesFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.XScaleGesturesFlag);
      }
      if (yScaleGestures) {
        this.setScaledFlags(this.scaledFlags | ScaledView.YScaleGesturesFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.YScaleGesturesFlag);
      }
      return this;
    }
  }

  xScaleGestures(): boolean;
  xScaleGestures(xScaleGestures: boolean): this;
  xScaleGestures(xScaleGestures?: boolean): boolean | this {
    if (xScaleGestures === void 0) {
      return (this.scaledFlags & ScaledView.XScaleGesturesFlag) !== 0;
    } else {
      if (xScaleGestures) {
        this.setScaledFlags(this.scaledFlags | ScaledView.XScaleGesturesFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.XScaleGesturesFlag);
      }
      return this;
    }
  }

  yScaleGestures(): boolean;
  yScaleGestures(yScaleGestures: boolean): this;
  yScaleGestures(yScaleGestures?: boolean): boolean | this {
    if (yScaleGestures === void 0) {
      return (this.scaledFlags & ScaledView.YScaleGesturesFlag) !== 0;
    } else {
      if (yScaleGestures) {
        this.setScaledFlags(this.scaledFlags | ScaledView.YScaleGesturesFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.YScaleGesturesFlag);
      }
      return this;
    }
  }

  @Property<ScaledView<X, Y>, Timing | boolean | undefined, AnyTiming>({
    type: Timing,
    inherits: true,
    initValue(): Timing | boolean | undefined {
      return Easing.linear.withDuration(250);
    },
  })
  readonly rescaleTransition!: Property<this, Timing | boolean | undefined, AnyTiming>;

  @Property<ScaledView<X, Y>, Timing | boolean | undefined, AnyTiming>({
    type: Timing,
    inherits: true,
    initValue(): Timing | boolean | undefined {
      return Easing.cubicOut.withDuration(250);
    },
  })
  readonly reboundTransition!: Property<this, Timing | boolean | undefined, AnyTiming>;

  fitX(tween: boolean = false): void {
    this.setScaledFlags(this.scaledFlags | ScaledView.XFitFlag);
    if (tween === true) {
      this.setScaledFlags(this.scaledFlags | ScaledView.XFitTweenFlag);
    }
    this.requireUpdate(View.NeedsLayout);
  }

  fitY(tween: boolean = false): void {
    this.setScaledFlags(this.scaledFlags | ScaledView.YFitFlag);
    if (tween === true) {
      this.setScaledFlags(this.scaledFlags | ScaledView.YFitTweenFlag);
    }
    this.requireUpdate(View.NeedsLayout);
  }

  fit(tween: boolean = false): void {
    this.setScaledFlags(this.scaledFlags | (ScaledView.XFitFlag | ScaledView.YFitFlag));
    if (tween === true) {
      this.setScaledFlags(this.scaledFlags | ScaledView.FitTweenMask);
    }
    this.requireUpdate(View.NeedsLayout);
  }

  /** @internal */
  @ViewSet<ScaledView<X, Y>, ScaledXView<X> | ScaledYView<Y>>({
    binds: true,
    observes: true,
    willAttachView(scaledView: ScaledXView<X> | ScaledYView<Y>, targetView: View | null): void {
      this.owner.callObservers("viewWillAttachScaled", scaledView, targetView, this.owner);
    },
    didAttachView(newScaledView: ScaledXView<X> | ScaledYView<Y>): void {
      if (ScaledXView.is<X>(newScaledView)) {
        this.owner.updateXDataDomain(newScaledView.xDataDomain);
      }
      if (ScaledYView.is<Y>(newScaledView)) {
        this.owner.updateYDataDomain(newScaledView.yDataDomain);
      }
    },
    didDetachView(scaledView: ScaledXView<X> | ScaledYView<Y>): void {
      this.owner.callObservers("viewDidDetachScaled", scaledView, this.owner);
    },
    viewDidSetXRangePadding(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.updateXRangePadding(newXRangePadding);
    },
    viewDidSetYRangePadding(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.updateYRangePadding(newYRangePadding);
    },
    viewDidSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
      this.owner.updateXDataDomain(newXDataDomain);
      this.owner.requireUpdate(View.NeedsLayout);
    },
    viewDidSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
      this.owner.updateYDataDomain(newYDataDomain);
      this.owner.requireUpdate(View.NeedsLayout);
    },
    detectView(view: View): ScaledXView<X> | ScaledYView<Y> | null {
     return ScaledXView.is<X>(view) || ScaledYView.is<Y>(view) ? view : null;
    },
  })
  readonly scaled!: ViewSet<this, ScaledXView<X> | ScaledYView<Y>>;
  static readonly scaled: MemberFastenerClass<ScaledView, "scaled">;

  protected override onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.xScale.recohere(viewContext.updateTime);
    this.yScale.recohere(viewContext.updateTime);
    this.resizeScales();
    this.updateScales();
  }

  /**
   * Updates own scale ranges to project onto view frame. Infers own scales
   * from child view data domains if inherited x/y scales are undefined.
   */
  protected resizeScales(): void {
    let xScale: ContinuousScale<X, number> | null;
    const xRange = this.xRange();
    if (xRange !== null) {
      xScale = !this.xScale.inherited ? this.xScale.state : null;
      if (xScale !== null) {
        if (!xScale.range.equals(xRange)) {
          this.xScale.setRange(xRange);
          this.setScaledFlags(this.scaledFlags | ScaledView.RescaleFlag);
        }
      } else if (this.xScale.superFastener === null || this.xScale.superValue === null) {
        const xDataDomainPadded = this.xDataDomainPadded;
        if (xDataDomainPadded !== null) {
          xScale = ScaledView.createScale(xDataDomainPadded[0], xDataDomainPadded[1], xRange[0], xRange[1]);
          this.xScale.setState(xScale);
          this.setScaledFlags(this.scaledFlags | ScaledView.XFitFlag);
        }
      }
    }

    let yScale: ContinuousScale<Y, number> | null;
    const yRange = this.yRange();
    if (yRange !== null) {
      yScale = !this.yScale.inherited ? this.yScale.state : null;
      if (yScale !== null) {
        if (!yScale.range.equals(yRange)) {
          this.yScale.setRange(yRange);
          this.setScaledFlags(this.scaledFlags | ScaledView.RescaleFlag);
        }
      } else if (this.yScale.superFastener === null || this.yScale.superValue === null) {
        const yDataDomainPadded = this.yDataDomainPadded;
        if (yDataDomainPadded !== null) {
          yScale = ScaledView.createScale(yDataDomainPadded[0], yDataDomainPadded[1], yRange[0], yRange[1]);
          this.yScale.setState(yScale);
          this.setScaledFlags(this.scaledFlags | ScaledView.YFitFlag);
        }
      }
    }
  }

  protected updateScales(): void {
    const xScale = !this.xScale.inherited ? this.xScale.state : null;
    const yScale = !this.yScale.inherited ? this.yScale.state : null;
    if (xScale !== null && yScale !== null) {
      const isPressing = this.gesture.pressing;
      if (!isPressing) {
        const isCoasting = this.gesture.coasting;
        this.boundScales(xScale, yScale, isCoasting);
      }
    }
  }

  /**
   * Clamps scales to domain bounds and corrects aspect ratio.
   */
  protected boundScales(oldXScale: ContinuousScale<X, number>,
                        oldYScale: ContinuousScale<Y, number>,
                        isCoasting: boolean): void {
    const oldXDomain = oldXScale.domain;
    const oldYDomain = oldYScale.domain;
    let newXDomain: Domain<X> = oldXDomain;
    let newYDomain: Domain<Y> = oldYDomain;

    // fit x domain
    const xDataDomainPadded = this.xDataDomainPadded;
    if (xDataDomainPadded !== null && (this.scaledFlags & ScaledView.XFitFlag) !== 0) {
      newXDomain = xDataDomainPadded;
      this.setScaledFlags(this.scaledFlags | ScaledView.XInRangeMask);
    } else {
      newXDomain = oldXDomain;
    }

    // fit y domain
    const yDataDomainPadded = this.yDataDomainPadded;
    if (yDataDomainPadded !== null && (this.scaledFlags & ScaledView.YFitFlag) !== 0) {
      newYDomain = yDataDomainPadded;
      this.setScaledFlags(this.scaledFlags | ScaledView.YInRangeMask);
    } else {
      newYDomain = oldYDomain;
    }

    // clamp x domain
    const xDomainPadded = xDataDomainPadded !== null ? xDataDomainPadded : oldXDomain;
    const xDomainBounds = this.xDomainBounds.value;
    const xDomainMin = xDomainBounds[0] === false ? void 0
                     : xDomainBounds[0] === true ? xDomainPadded[0]
                     : xDomainBounds[0];
    const xDomainMax = xDomainBounds[1] === false ? void 0
                     : xDomainBounds[1] === true ? xDomainPadded[1]
                     : xDomainBounds[1];
    const xZoomBounds = this.xZoomBounds.value;
    let xZoomMin: number | boolean | undefined = xZoomBounds[0];
    let xZoomMax: number | boolean | undefined = xZoomBounds[1];
    if (xZoomMin === true) {
      if (oldXScale instanceof LinearScale) {
        xZoomMin = ScaledView.LinearZoomMin;
      } else if (oldXScale instanceof TimeScale) {
        xZoomMin = ScaledView.TimeZoomMin;
      } else {
        xZoomMin = void 0;
      }
    } else if (xZoomMin === false) {
      xZoomMin = void 0;
    }
    if (xZoomMax === true) {
      if (oldXScale instanceof LinearScale) {
        xZoomMax = ScaledView.LinearZoomMax;
      } else if (oldXScale instanceof TimeScale) {
        xZoomMax = ScaledView.TimeZoomMax;
      } else {
        xZoomMax = void 0;
      }
    } else if (xZoomMax === false) {
      xZoomMax = void 0;
    }
    newXDomain = oldXScale.clampDomain(xDomainMin, xDomainMax, xZoomMin, xZoomMax).domain;

    // clamp y domain
    const yDomainPadded = yDataDomainPadded !== null ? yDataDomainPadded : oldYDomain;
    const yDomainBounds = this.yDomainBounds.value;
    const yDomainMin = yDomainBounds[0] === false ? void 0
                     : yDomainBounds[0] === true ? yDomainPadded[0]
                     : yDomainBounds[0];
    const yDomainMax = yDomainBounds[1] === false ? void 0
                     : yDomainBounds[1] === true ? yDomainPadded[1]
                     : yDomainBounds[1];
    const yZoomBounds = this.yZoomBounds.value;
    let yZoomMin: number | boolean | undefined = yZoomBounds[0];
    let yZoomMax: number | boolean | undefined = yZoomBounds[1];
    if (yZoomMin === true) {
      if (oldYScale instanceof LinearScale) {
        yZoomMin = ScaledView.LinearZoomMin;
      } else if (oldYScale instanceof TimeScale) {
        yZoomMin = ScaledView.TimeZoomMin;
      } else {
        yZoomMin = void 0;
      }
    } else if (yZoomMin === false) {
      yZoomMin = void 0;
    }
    if (yZoomMax === true) {
      if (oldYScale instanceof LinearScale) {
        yZoomMax = ScaledView.LinearZoomMax;
      } else if (oldYScale instanceof TimeScale) {
        yZoomMax = ScaledView.TimeZoomMax;
      } else {
        yZoomMax = void 0;
      }
    } else if (yZoomMax === false) {
      yZoomMax = void 0;
    }
    newYDomain = oldYScale.clampDomain(yDomainMin, yDomainMax, yZoomMin, yZoomMax).domain;

    // track x domain
    if (xDataDomainPadded !== null && !isCoasting &&
        (this.scaledFlags & ScaledView.XDomainTrackingFlag) !== 0 &&
        (this.scaledFlags & ScaledView.XInRangeMask) !== 0) {
      if ((this.scaledFlags & ScaledView.XInRangeMask) === ScaledView.XInRangeMask) {
        newXDomain = xDataDomainPadded;
      } else {
        const xDomainWidth = +newXDomain[1] - +newXDomain[0] as unknown as X;
        if ((this.scaledFlags & ScaledView.XMinInRangeFlag) !== 0) {
          newXDomain = Domain(xDataDomainPadded[0], +xDataDomainPadded[0] + +xDomainWidth as unknown as X);
        } else {
          newXDomain = Domain(+xDataDomainPadded[1] - +xDomainWidth as unknown as X, xDataDomainPadded[1]);
        }
      }
    }

    // track y domain
    if (yDataDomainPadded !== null && !isCoasting &&
        (this.scaledFlags & ScaledView.YDomainTrackingFlag) !== 0 &&
        (this.scaledFlags & ScaledView.YInRangeMask) !== 0) {
      if ((this.scaledFlags & ScaledView.YInRangeMask) === ScaledView.YInRangeMask) {
        newYDomain = yDataDomainPadded;
      } else {
        const yDomainWidth = +newYDomain[1] - +newYDomain[0] as unknown as Y;
        if ((this.scaledFlags & ScaledView.YMinInRangeFlag) !== 0) {
          newYDomain = Domain(yDataDomainPadded[0], +yDataDomainPadded[0] + +yDomainWidth as unknown as Y);
        } else {
          newYDomain = Domain(+yDataDomainPadded[1] - +yDomainWidth as unknown as Y, yDataDomainPadded[1]);
        }
      }
    }

    // fit aspect ratio
    const fitAspectRatio = this.fitAspectRatio.value;
    if (fitAspectRatio !== void 0 && (this.gesture.preserveAspectRatio || (this.scaledFlags & ScaledView.FitMask) !== 0)) {
      const xRange = oldXScale.range;
      const yRange = oldYScale.range;
      const oldDomainWidth = +newXDomain[1] - +newXDomain[0];
      const oldDomainHeight = +newYDomain[1] - +newYDomain[0];
      const domainAspectRatio = oldDomainWidth / oldDomainHeight;
      const rangeAspectRatio = (xRange[1] - xRange[0]) / (yRange[0] - yRange[1]);
      const anamorphicAspectRatio = Math.abs(fitAspectRatio * rangeAspectRatio);
      if (!Equivalent(domainAspectRatio, anamorphicAspectRatio)) {
        const fitAlign = this.fitAlign.value;
        if (fitAspectRatio < 0 && domainAspectRatio < anamorphicAspectRatio ||
            fitAspectRatio > 0 && domainAspectRatio > anamorphicAspectRatio) {
          const newDomainWidth = oldDomainHeight * anamorphicAspectRatio;
          const dx = newDomainWidth - oldDomainWidth;
          newXDomain = Domain(+newXDomain[0] - dx * fitAlign[0] as unknown as X,
                              +newXDomain[1] + dx * (1 - fitAlign[0]) as unknown as X);
        } else {
          const newDomainHeight = oldDomainWidth / anamorphicAspectRatio;
          const dy = newDomainHeight - oldDomainHeight;
          newYDomain = Domain(+newYDomain[0] - dy * fitAlign[1] as unknown as Y,
                              +newYDomain[1] + dy * (1 - fitAlign[1]) as unknown as Y);
        }
      }
    }

    // update x domain
    if ((this.scaledFlags & ScaledView.XBoundingFlag) === 0 && !Equivalent(newXDomain, oldXDomain)) {
      let timing: Timing | boolean | undefined;
      if ((this.scaledFlags & (ScaledView.XFitFlag | ScaledView.RescaleFlag)) === 0 ||
          (this.scaledFlags & ScaledView.XFitTweenFlag) !== 0) {
        timing = (this.scaledFlags & ScaledView.InteractingMask) !== 0
               ? this.reboundTransition.value : this.rescaleTransition.value;
        if (timing !== void 0 && timing !== false) {
          this.setScaledFlags(this.scaledFlags | ScaledView.XBoundingFlag);
        }
      }
      this.willReboundX(oldXScale);
      this.xDomain(newXDomain, timing);
      if (timing === void 0 && timing !== false) {
        this.didReboundX(this.xScale.getState());
      }
      if (xDataDomainPadded !== null && (this.scaledFlags & ScaledView.XFitFlag) !== 0) {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.XFitFlag);
      }
    }

    // update y domain
    if ((this.scaledFlags & ScaledView.YBoundingFlag) === 0 && !Equivalent(newYDomain, oldYDomain)) {
      let timing: Timing | boolean | undefined;
      if ((this.scaledFlags & (ScaledView.YFitFlag | ScaledView.RescaleFlag)) === 0 ||
          (this.scaledFlags & ScaledView.YFitTweenFlag) !== 0) {
        timing = (this.scaledFlags & ScaledView.InteractingMask) !== 0
               ? this.reboundTransition.value : this.rescaleTransition.value;
        if (timing !== void 0 && timing !== false) {
          this.setScaledFlags(this.scaledFlags | ScaledView.YBoundingFlag);
        }
      }
      this.willReboundY(oldYScale);
      this.yDomain(newYDomain, timing);
      if (timing === void 0 && timing !== false) {
        this.didReboundY(this.yScale.getState());
      }
      if (yDataDomainPadded !== null && (this.scaledFlags & ScaledView.YFitFlag) !== 0) {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.YFitFlag);
      }
    }

    this.setScaledFlags(this.scaledFlags & ~(ScaledView.InteractedFlag | ScaledView.RescaleFlag));
  }

  protected override displayChildren(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                                     displayChild: (this: this, childView: View, displayFlags: ViewFlags,
                                                    viewContext: ViewContextType<this>) => void): void {
    let xScale: ContinuousScale<X, number> | null;
    let yScale: ContinuousScale<Y, number> | null;
    if ((displayFlags & View.NeedsLayout) !== 0 &&
        (xScale = this.xScale.value, xScale !== null) &&
        (yScale = this.yScale.value, yScale !== null)) {
      this.layoutChildViews(xScale, yScale, displayFlags, viewContext, displayChild);
    } else {
      super.displayChildren(displayFlags, viewContext, displayChild);
    }
  }

  protected layoutChildViews(xScale: ContinuousScale<X, number>,
                             yScale: ContinuousScale<Y, number>,
                             displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChild: (this: this, childView: View, displayFlags: ViewFlags,
                                            viewContext: ViewContextType<this>) => void): void {
    // Recompute extrema when laying out child views.
    let xDataDomainMin: X | undefined;
    let xDataDomainMax: X | undefined;
    let yDataDomainMin: Y | undefined;
    let yDataDomainMax: Y | undefined;
    let xRangePaddingMin = 0;
    let xRangePaddingMax = 0;
    let yRangePaddingMin = 0;
    let yRangePaddingMax = 0;
    let xCount = 0;
    let yCount = 0;

    type self = this;
    function layoutChildView(this: self, childView: View, displayFlags: ViewFlags,
                             viewContext: ViewContextType<self>): void {
      displayChild.call(this, childView, displayFlags, viewContext);
      if (ScaledXView.is<X>(childView) && childView.xScale.inherited) {
        const childXDataDomain = childView.xDataDomain;
        if (childXDataDomain !== null) {
          if (xCount !== 0) {
            if (Values.compare(childXDataDomain[0], xDataDomainMin) < 0) {
              xDataDomainMin = childXDataDomain[0];
            }
            if (Values.compare(xDataDomainMax, childXDataDomain[1]) < 0) {
              xDataDomainMax = childXDataDomain[1];
            }
          } else {
            xDataDomainMin = childXDataDomain[0];
            xDataDomainMax = childXDataDomain[1];
          }
          const childXRangePadding = childView.xRangePadding();
          xRangePaddingMin = Math.max(childXRangePadding[0], xRangePaddingMin);
          xRangePaddingMax = Math.max(childXRangePadding[1], xRangePaddingMax);
          xCount += 1;
        }
      }
      if (ScaledYView.is<Y>(childView) && childView.yScale.inherited) {
        const childYDataDomain = childView.yDataDomain;
        if (childYDataDomain !== null) {
          if (yCount !== 0) {
            if (Values.compare(childYDataDomain[0], yDataDomainMin) < 0) {
              yDataDomainMin = childYDataDomain[0];
            }
            if (Values.compare(yDataDomainMax, childYDataDomain[1]) < 0) {
              yDataDomainMax = childYDataDomain[1];
            }
          } else {
            yDataDomainMin = childYDataDomain[0];
            yDataDomainMax = childYDataDomain[1];
          }
          const childYRangePadding = childView.yRangePadding();
          yRangePaddingMin = Math.max(childYRangePadding[0], yRangePaddingMin);
          yRangePaddingMax = Math.max(childYRangePadding[1], yRangePaddingMax);
          yCount += 1;
        }
      }
    }
    super.displayChildren(displayFlags, viewContext, layoutChildView);

    this.setXDataDomain(xCount !== 0 ? Domain<X>(xDataDomainMin!, xDataDomainMax!) : null);
    this.setYDataDomain(yCount !== 0 ? Domain<Y>(yDataDomainMin!, yDataDomainMax!) : null);
    this.xRangePadding.setValue([xRangePaddingMin, xRangePaddingMax], Affinity.Intrinsic);
    this.yRangePadding.setValue([yRangePaddingMin, yRangePaddingMax], Affinity.Intrinsic);
  }

  protected onBeginBoundingXScale(xScale: ContinuousScale<X, number>): void {
    // hook
  }

  protected onEndBoundingXScale(xScale: ContinuousScale<X, number>): void {
    this.setScaledFlags(this.scaledFlags & ~ScaledView.XBoundingFlag);
    this.didReboundX(xScale);
  }

  protected onInterruptBoundingXScale(xScale: ContinuousScale<X, number>): void {
    this.setScaledFlags(this.scaledFlags & ~ScaledView.XBoundingFlag);
    this.didReboundX(xScale);
  }

  protected onBeginBoundingYScale(yScale: ContinuousScale<Y, number>): void {
    // hook
  }

  protected onEndBoundingYScale(yScale: ContinuousScale<Y, number>): void {
    this.setScaledFlags(this.scaledFlags & ~ScaledView.YBoundingFlag);
    this.didReboundY(yScale);
  }

  protected onInterruptBoundingYScale(yScale: ContinuousScale<Y, number>): void {
    this.setScaledFlags(this.scaledFlags & ~ScaledView.YBoundingFlag);
    this.didReboundY(yScale);
  }

  protected willReboundX(xScale: ContinuousScale<X, number>): void {
    this.gesture.neutralizeX();
  }

  protected didReboundX(xScale: ContinuousScale<X, number>): void {
    // hook
  }

  protected willReboundY(yScale: ContinuousScale<Y, number>): void {
    this.gesture.neutralizeY();
  }

  protected didReboundY(yScale: ContinuousScale<Y, number>): void {
    // hook
  }

  @ScaleGesture<ScaledView, ScaledView, unknown, unknown>({
    self: true,
    getXScale(): ContinuousScale<unknown, number> | null {
      if ((this.owner.scaledFlags & ScaledView.XScaleGesturesFlag) !== 0) {
        return this.owner.xScale();
      } else {
        return null;
      }
    },
    setXScale(xScale: ContinuousScale<unknown, number> | null, timing?: AnyTiming | boolean): void {
      if ((this.owner.scaledFlags & ScaledView.XScaleGesturesFlag) !== 0) {
        this.owner.xScale(xScale, timing);
      }
    },
    getYScale(): ContinuousScale<unknown, number> | null {
      if ((this.owner.scaledFlags & ScaledView.YScaleGesturesFlag) !== 0) {
        return this.owner.yScale();
      } else {
        return null;
      }
    },
    setYScale(yScale: ContinuousScale<unknown, number> | null, timing?: AnyTiming | boolean): void {
      if ((this.owner.scaledFlags & ScaledView.YScaleGesturesFlag) !== 0) {
        this.owner.yScale(yScale, timing);
      }
    },
    willStartInteracting(): void {
      this.owner.setScaledFlags(this.owner.scaledFlags & ~ScaledView.BoundingMask | ScaledView.InteractingFlag);
    },
    didStopInteracting(): void {
      const xScale = this.owner.xScale.value;
      const xDataDomain = this.owner.xDataDomain;
      if (xScale !== null && xDataDomain !== null) {
        const xDomain = xScale.domain;
        if (xDomain.contains(xDataDomain[0])) {
          this.owner.setScaledFlags(this.owner.scaledFlags | ScaledView.XMinInRangeFlag);
        } else {
          this.owner.setScaledFlags(this.owner.scaledFlags & ~ScaledView.XMinInRangeFlag);
        }
        if (xDomain.contains(xDataDomain[1])) {
          this.owner.setScaledFlags(this.owner.scaledFlags | ScaledView.XMaxInRangeFlag);
        } else {
          this.owner.setScaledFlags(this.owner.scaledFlags & ~ScaledView.XMaxInRangeFlag);
        }
      }
      const yScale = this.owner.yScale.value;
      const yDataDomain = this.owner.yDataDomain;
      if (yScale !== null && yDataDomain !== null) {
        const yDomain = yScale.domain;
        if (yDomain.contains(yDataDomain[0])) {
          this.owner.setScaledFlags(this.owner.scaledFlags | ScaledView.YMinInRangeFlag);
        } else {
          this.owner.setScaledFlags(this.owner.scaledFlags & ~ScaledView.YMinInRangeFlag);
        }
        if (yDomain.contains(yDataDomain[1])) {
          this.owner.setScaledFlags(this.owner.scaledFlags | ScaledView.YMaxInRangeFlag);
        } else {
          this.owner.setScaledFlags(this.owner.scaledFlags & ~ScaledView.YMaxInRangeFlag);
        }
      }
      this.owner.setScaledFlags(this.owner.scaledFlags & ~ScaledView.InteractingFlag | ScaledView.InteractedFlag);
    },
    didStopPressing(): void {
      this.owner.requireUpdate(View.NeedsLayout);
    },
    willBeginCoast(input: ScaleGestureInput, event: Event | null): boolean | void {
      if ((this.owner.scaledFlags & ScaledView.XScaleGesturesFlag) === 0) {
        input.disableX = true;
        input.vx = 0;
        input.ax = 0;
      }
      if ((this.owner.scaledFlags & ScaledView.YScaleGesturesFlag) === 0) {
        input.disableY = true;
        input.vy = 0;
        input.ay = 0;
      }
    },
  })
  readonly gesture!: ScaleGesture<this, ScaledView<X, Y>, X, Y>;
  static readonly gesture: MemberFastenerClass<ScaledView, "gesture">;

  override init(init: ScaledViewInit<X, Y>): void {
    super.init(init);
    if (init.xScale !== void 0) {
      this.xScale(init.xScale);
    }
    if (init.yScale !== void 0) {
      this.yScale(init.yScale);
    }

    if (init.xDomainBounds !== void 0) {
      this.xDomainBounds(init.xDomainBounds);
    }
    if (init.yDomainBounds !== void 0) {
      this.yDomainBounds(init.yDomainBounds);
    }
    if (init.xZoomBounds !== void 0) {
      this.xZoomBounds(init.xZoomBounds);
    }
    if (init.yZoomBounds !== void 0) {
      this.yZoomBounds(init.yZoomBounds);
    }

    if (init.xDomainPadding !== void 0) {
      this.xDomainPadding(init.xDomainPadding);
    }
    if (init.yDomainPadding !== void 0) {
      this.yDomainPadding(init.yDomainPadding);
    }
    if (init.xRangePadding !== void 0) {
      this.xRangePadding(init.xRangePadding);
    }
    if (init.yRangePadding !== void 0) {
      this.yRangePadding(init.yRangePadding);
    }

    if (init.fitAlign !== void 0) {
      this.fitAlign(init.fitAlign);
    }
    if (init.xFitAlign !== void 0) {
      this.xFitAlign(init.xFitAlign);
    }
    if (init.yFitAlign !== void 0) {
      this.yFitAlign(init.yFitAlign);
    }
    if (init.fitAspectRatio !== void 0) {
      this.fitAspectRatio(init.fitAspectRatio);
    }
    if (init.preserveAspectRatio !== void 0) {
      this.preserveAspectRatio(init.preserveAspectRatio);
    }

    if (init.domainTracking !== void 0) {
      this.domainTracking(init.domainTracking);
    }
    if (init.xDomainTracking !== void 0) {
      this.xDomainTracking(init.xDomainTracking);
    }
    if (init.yDomainTracking !== void 0) {
      this.yDomainTracking(init.yDomainTracking);
    }

    if (init.scaleGestures !== void 0) {
      this.scaleGestures(init.scaleGestures);
    }
    if (init.xScaleGestures !== void 0) {
      this.xScaleGestures(init.xScaleGestures);
    }
    if (init.yScaleGestures !== void 0) {
      this.yScaleGestures(init.yScaleGestures);
    }

    if (init.rescaleTransition !== void 0) {
      this.rescaleTransition.setValue(init.rescaleTransition);
    }
    if (init.reboundTransition !== void 0) {
      this.reboundTransition.setValue(init.reboundTransition);
    }
  }

  /** @internal */
  static createScale<X, Y>(x0: X, x1: X, y0: Y | undefined, y1: Y | undefined): ContinuousScale<X, Y> {
    let range: LinearRange;
    if (typeof y0 === "number" && typeof y1 === "number") {
      range = LinearRange(y0, y1);
    } else {
      range = LinearRange(0, 1);
    }
    if (typeof x0 === "number" && typeof x1 === "number") {
      return LinearScale(LinearDomain(x0, x1), range) as unknown as ContinuousScale<X, Y>;
    } else if (x0 instanceof DateTime && x1 instanceof DateTime) {
      return TimeScale(TimeDomain(x0, x1), range) as unknown as ContinuousScale<X, Y>;
    } else {
      throw new TypeError(x0 + ", " + x1 + ", " + y0 + ", " + y1);
    }
  }

  /** @internal */
  static parseScale<X, Y>(string: string): ContinuousScale<X, Y> {
    if (string === "linear") {
      return LinearScale(LinearDomain(0, 1), LinearRange(0, 1)) as unknown as ContinuousScale<X, Y>;
    } else if (string === "time") {
      const d1 = DateTime.current();
      const d0 = d1.withDay(d1.day - 1);
      return TimeScale(TimeDomain(d0, d1), LinearRange(0, 1)) as unknown as ContinuousScale<X, Y>;
    } else {
      const domain = string.split("...");
      const x0 = +domain[0]!;
      const x1 = +domain[1]!;
      if (isFinite(x0) && isFinite(x1)) {
        return LinearScale(LinearDomain(x0, x1), LinearRange(0, 1)) as unknown as ContinuousScale<X, Y>;
      } else {
        const d0 = DateTime.parse(domain[0]!);
        const d1 = DateTime.parse(domain[1]!);
        return TimeScale(TimeDomain(d0, d1), LinearRange(0, 1)) as unknown as ContinuousScale<X, Y>;
      }
    }
    throw new TypeError("" + string);
  }

  /** @internal */
  static readonly XDomainTrackingFlag: ScaledFlags = 1 << 0;
  /** @internal */
  static readonly YDomainTrackingFlag: ScaledFlags = 1 << 1;
  /** @internal */
  static readonly XScaleGesturesFlag: ScaledFlags = 1 << 2;
  /** @internal */
  static readonly YScaleGesturesFlag: ScaledFlags = 1 << 3;
  /** @internal */
  static readonly XMinInRangeFlag: ScaledFlags = 1 << 4;
  /** @internal */
  static readonly XMaxInRangeFlag: ScaledFlags = 1 << 5;
  /** @internal */
  static readonly YMinInRangeFlag: ScaledFlags = 1 << 6;
  /** @internal */
  static readonly YMaxInRangeFlag: ScaledFlags = 1 << 7;
  /** @internal */
  static readonly InteractingFlag: ScaledFlags = 1 << 8;
  /** @internal */
  static readonly InteractedFlag: ScaledFlags = 1 << 9;
  /** @internal */
  static readonly XBoundingFlag: ScaledFlags = 1 << 10;
  /** @internal */
  static readonly YBoundingFlag: ScaledFlags = 1 << 11;
  /** @internal */
  static readonly XFitFlag: ScaledFlags = 1 << 12;
  /** @internal */
  static readonly YFitFlag: ScaledFlags = 1 << 13;
  /** @internal */
  static readonly XFitTweenFlag: ScaledFlags = 1 << 14;
  /** @internal */
  static readonly YFitTweenFlag: ScaledFlags = 1 << 15;
  /** @internal */
  static readonly RescaleFlag: ScaledFlags = 1 << 16;

  /** @internal */
  static readonly DomainTrackingMask: ScaledFlags = ScaledView.XDomainTrackingFlag
                                                  | ScaledView.YDomainTrackingFlag;
  /** @internal */
  static readonly ScaleGesturesMask: ScaledFlags = ScaledView.XScaleGesturesFlag
                                                 | ScaledView.YScaleGesturesFlag;
  /** @internal */
  static readonly XInRangeMask: ScaledFlags = ScaledView.XMinInRangeFlag
                                            | ScaledView.XMaxInRangeFlag;
  /** @internal */
  static readonly YInRangeMask: ScaledFlags = ScaledView.YMinInRangeFlag
                                            | ScaledView.YMaxInRangeFlag;
  /** @internal */
  static readonly InteractingMask: ScaledFlags = ScaledView.InteractingFlag
                                               | ScaledView.InteractedFlag;
  /** @internal */
  static readonly BoundingMask: ScaledFlags = ScaledView.XBoundingFlag
                                            | ScaledView.YBoundingFlag;
  /** @internal */
  static readonly FitMask: ScaledFlags = ScaledView.XFitFlag
                                       | ScaledView.YFitFlag;
  /** @internal */
  static readonly FitTweenMask: ScaledFlags = ScaledView.XFitTweenFlag
                                            | ScaledView.YFitTweenFlag;

  /** @internal */
  static LinearZoomMin: number = 1000000;
  /** @internal */
  static LinearZoomMax: number = 0.001;
  /** @internal */
  static TimeZoomMin: number = 86400000;
  /** @internal */
  static TimeZoomMax: number = 1;

  static override readonly InsertChildFlags: ViewFlags = GraphicsView.InsertChildFlags | View.NeedsResize;
}
