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

import {Equals, Equivalent, Values} from "@swim/util";
import {
  Domain,
  Range,
  AnyTiming,
  Timing,
  Easing,
  LinearDomain,
  LinearRange,
  ContinuousScale,
  LinearScale,
} from "@swim/mapping";
import {DateTime, TimeDomain, TimeScale} from "@swim/time";
import {
  ViewContextType,
  ViewFlags,
  View,
  ViewProperty,
  ViewAnimator,
  ViewFastener,
  ScaleGestureInput,
  ScaleGestureDelegate,
  ScaleGesture,
} from "@swim/view";
import {GraphicsViewInit, GraphicsViewController, LayerView} from "@swim/graphics";
import {ScaledXView} from "./ScaledXView";
import {ScaledYView} from "./ScaledYView";
import type {ScaledXYView} from "./ScaledXYView";
import {ContinuousScaleAnimator} from "./ContinuousScaleAnimator";
import type {ScaledViewObserver} from "./ScaledViewObserver";

/** @hidden */
export type ScaledFlags = number;

export interface ScaledViewInit<X, Y> extends GraphicsViewInit {
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

  gestures?: [boolean, boolean] | boolean;
  xGestures?: boolean;
  yGestures?: boolean;

  scaleGesture?: ScaleGesture<X, Y>;
  rescaleTransition?: AnyTiming | boolean;
  reboundTransition?: AnyTiming | boolean;
}

export abstract class ScaledView<X, Y> extends LayerView implements ScaledXYView<X, Y>, ScaleGestureDelegate<X, Y> {
  constructor() {
    super();
    Object.defineProperty(this, "scaledFlags", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "scaledFasteners", {
      value: [],
      enumerable: true,
    });
    Object.defineProperty(this, "xDataDomain", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "yDataDomain", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "xDataRange", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "yDataRange", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "xDataDomainPadded", {
      value: null,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "yDataDomainPadded", {
      value: null,
      enumerable: true,
      configurable: true,
    });
  }

  initView(init: ScaledViewInit<X, Y>): void {
    super.initView(init);
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

    if (init.gestures !== void 0) {
      this.gestures(init.gestures);
    }
    if (init.xGestures !== void 0) {
      this.xGestures(init.xGestures);
    }
    if (init.yGestures !== void 0) {
      this.yGestures(init.yGestures);
    }

    if (init.scaleGesture !== void 0) {
      this.scaleGesture.setState(init.scaleGesture);
      init.scaleGesture.setView(this);
    }
    if (init.rescaleTransition !== void 0) {
      this.rescaleTransition.setState(init.rescaleTransition);
    }
    if (init.reboundTransition !== void 0) {
      this.reboundTransition.setState(init.reboundTransition);
    }
  }

  declare readonly viewController: GraphicsViewController<ScaledView<X, Y>> & ScaledViewObserver<X, Y> | null;

  declare readonly viewObservers: ReadonlyArray<ScaledViewObserver<X, Y>>;

  /** @hidden */
  declare readonly scaledFlags: ScaledFlags;

  /** @hidden */
  setScaledFlags(scaledFlags: ScaledFlags): void {
    Object.defineProperty(this, "scaledFlags", {
      value: scaledFlags,
      enumerable: true,
      configurable: true,
    });
  }

  protected willSetXScale(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewWillSetXScale !== void 0) {
      viewController.scaledViewWillSetXScale(newXScale, oldXScale, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewWillSetXScale !== void 0) {
        viewObserver.scaledViewWillSetXScale(newXScale, oldXScale, this);
      }
    }
  }

  protected onSetXScale(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
    this.updateXDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetXScale(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewDidSetXScale !== void 0) {
        viewObserver.scaledViewDidSetXScale(newXScale, oldXScale, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewDidSetXScale !== void 0) {
      viewController.scaledViewDidSetXScale(newXScale, oldXScale, this);
    }
  }

  @ViewAnimator<ScaledView<X, Y>, ContinuousScale<X, number> | null>({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherit: true,
    state: null,
    willSetValue(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
      this.owner.willSetXScale(newXScale, oldXScale);
    },
    didSetValue(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null): void {
      this.owner.onSetXScale(newXScale, oldXScale);
      this.owner.didSetXScale(newXScale, oldXScale);
    },
    onBegin(xScale: ContinuousScale<X, number>): void {
      if ((this.owner.scaledFlags & ScaledView.XBoundingFlag) !== 0) {
        this.owner.onBeginBoundingXScale(xScale);
      }
    },
    onEnd(xScale: ContinuousScale<X, number>): void {
      if ((this.owner.scaledFlags & ScaledView.XBoundingFlag) !== 0) {
        this.owner.onEndBoundingXScale(xScale);
      }
    },
    onInterrupt(xScale: ContinuousScale<X, number>): void {
      if ((this.owner.scaledFlags & ScaledView.XBoundingFlag) !== 0) {
        this.owner.onInterruptBoundingXScale(xScale);
      }
    },
  })
  declare xScale: ContinuousScaleAnimator<this, X, number>;

  protected willSetYScale(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewWillSetYScale !== void 0) {
      viewController.scaledViewWillSetYScale(newYScale, oldYScale, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewWillSetYScale !== void 0) {
        viewObserver.scaledViewWillSetYScale(newYScale, oldYScale, this);
      }
    }
  }

  protected onSetYScale(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
    this.updateYDataRange();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetYScale(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewDidSetYScale !== void 0) {
        viewObserver.scaledViewDidSetYScale(newYScale, oldYScale, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewDidSetYScale !== void 0) {
      viewController.scaledViewDidSetYScale(newYScale, oldYScale, this);
    }
  }

  @ViewAnimator<ScaledView<X, Y>, ContinuousScale<Y, number> | null>({
    extends: ContinuousScaleAnimator,
    type: ContinuousScale,
    inherit: true,
    state: null,
    willSetValue(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
      this.owner.willSetYScale(newYScale, oldYScale);
    },
    didSetValue(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null): void {
      this.owner.onSetYScale(newYScale, oldYScale);
      this.owner.didSetYScale(newYScale, oldYScale);
    },
    onBegin(yScale: ContinuousScale<Y, number>): void {
      if ((this.owner.scaledFlags & ScaledView.YBoundingFlag) !== 0) {
        this.owner.onBeginBoundingYScale(yScale);
      }
    },
    onEnd(yScale: ContinuousScale<Y, number>): void {
      if ((this.owner.scaledFlags & ScaledView.YBoundingFlag) !== 0) {
        this.owner.onEndBoundingYScale(yScale);
      }
    },
    onInterrupt(yScale: ContinuousScale<Y, number>): void {
      if ((this.owner.scaledFlags & ScaledView.YBoundingFlag) !== 0) {
        this.owner.onInterruptBoundingYScale(yScale);
      }
    },
  })
  declare yScale: ContinuousScaleAnimator<this, Y, number>;

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
        timing = this.rescaleTransition.state;
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
        timing = this.rescaleTransition.state;
      }
      const yRange = this.yRange();
      if (yMin instanceof Domain || typeof yMin === "string") {
        if (yRange !== null) {
          this.yScale.setBaseScale(yMin as Domain<Y> | string, LinearRange(yRange[1], yRange[0]), timing);
        } else {
          this.yScale.setBaseDomain(yMin as Domain<Y>| string, timing);
        }
      } else {
        if (yRange !== null) {
          this.yScale.setBaseScale(yMin as Y, yMax as Y, yRange[1], yRange[0], timing);
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
      const xRangePadding = this.xRangePadding.state;
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
      const yRangePadding = this.yRangePadding.state;
      const yRangeMin = yRangePadding[0];
      const yRangeMax = height - yRangePadding[1];
      return LinearRange(yRangeMax, yRangeMin);
    } else {
      return null;
    }
  }

  declare readonly xDataDomain: Domain<X> | null;

  protected setXDataDomain(newXDataDomain: Domain<X> | null): void {
    const oldXDataDomain = this.xDataDomain;
    if (!Equals(newXDataDomain, oldXDataDomain)) {
      this.willSetXDataDomain(newXDataDomain, oldXDataDomain);
      Object.defineProperty(this, "xDataDomain", {
        value: newXDataDomain,
        enumerable: true,
        configurable: true,
      });
      this.onSetXDataDomain(newXDataDomain, oldXDataDomain);
      this.didSetXDataDomain(newXDataDomain, oldXDataDomain);
    }
  }

  protected willSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewWillSetXDataDomain !== void 0) {
      viewController.scaledViewWillSetXDataDomain(newXDataDomain, oldXDataDomain, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewWillSetXDataDomain !== void 0) {
        viewObserver.scaledViewWillSetXDataDomain(newXDataDomain, oldXDataDomain, this);
      }
    }
  }

  protected onSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    this.updateXDataRange();
    this.updateXDataDomainPadded();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewDidSetXDataDomain !== void 0) {
        viewObserver.scaledViewDidSetXDataDomain(newXDataDomain, oldXDataDomain, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewDidSetXDataDomain !== void 0) {
      viewController.scaledViewDidSetXDataDomain(newXDataDomain, oldXDataDomain, this);
    }
  }

  protected updateXDataDomain(xScaledDomain: Domain<X> | null, scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    let xDataDomain = this.xDataDomain;
    if (xDataDomain === null || this.scaledFasteners.length === 1) {
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

  declare readonly yDataDomain: Domain<Y> | null;

  protected setYDataDomain(newYDataDomain: Domain<Y> | null): void {
    const oldYDataDomain = this.yDataDomain;
    if (!Equals(newYDataDomain, oldYDataDomain)) {
      this.willSetYDataDomain(newYDataDomain, oldYDataDomain);
      Object.defineProperty(this, "yDataDomain", {
        value: newYDataDomain,
        enumerable: true,
        configurable: true,
      });
      this.onSetYDataDomain(newYDataDomain, oldYDataDomain);
      this.didSetYDataDomain(newYDataDomain, oldYDataDomain);
    }
  }

  protected willSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewWillSetYDataDomain !== void 0) {
      viewController.scaledViewWillSetYDataDomain(newYDataDomain, oldYDataDomain, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewWillSetYDataDomain !== void 0) {
        viewObserver.scaledViewWillSetYDataDomain(newYDataDomain, oldYDataDomain, this);
      }
    }
  }

  protected onSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    this.updateYDataRange();
    this.updateYDataDomainPadded();
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewDidSetYDataDomain !== void 0) {
        viewObserver.scaledViewDidSetYDataDomain(newYDataDomain, oldYDataDomain, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewDidSetYDataDomain !== void 0) {
      viewController.scaledViewDidSetYDataDomain(newYDataDomain, oldYDataDomain, this);
    }
  }

  protected updateYDataDomain(yScaledDomain: Domain<Y> | null, scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    let yDataDomain = this.yDataDomain;
    if (yDataDomain === null || this.scaledFasteners.length === 1) {
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

  declare readonly xDataRange: Range<number> | null;

  protected setXDataRange(xDataRange: Range<number> | null): void {
    Object.defineProperty(this, "xDataRange", {
      value: xDataRange,
      enumerable: true,
      configurable: true,
    });
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

  declare readonly yDataRange: Range<number> | null;

  protected setYDataRange(yDataRange: Range<number> | null): void {
    Object.defineProperty(this, "yDataRange", {
      value: yDataRange,
      enumerable: true,
      configurable: true,
    });
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

  declare readonly xDataDomainPadded: Domain<X> | null;

  protected setXDataDomainPadded(xDataDomainPadded: Domain<X> | null): void {
    Object.defineProperty(this, "xDataDomainPadded", {
      value: xDataDomainPadded,
      enumerable: true,
      configurable: true,
    });
  }

  protected updateXDataDomainPadded(): void {
    let xDataDomainPadded: Domain<X> | null;
    const xDataDomain = this.xDataDomain;
    if (xDataDomain !== null) {
      let xDataDomainPaddedMin = xDataDomain[0];
      let xDataDomainPaddedMax = xDataDomain[1];
      const xDomainPadding = this.xDomainPadding.state;
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

  declare readonly yDataDomainPadded: Domain<Y> | null;

  protected setYDataDomainPadded(yDataDomainPadded: Domain<Y> | null): void {
    Object.defineProperty(this, "yDataDomainPadded", {
      value: yDataDomainPadded,
      enumerable: true,
      configurable: true,
    });
  }

  protected updateYDataDomainPadded(): void {
    let yDataDomainPadded: Domain<Y> | null;
    const yDataDomain = this.yDataDomain;
    if (yDataDomain !== null) {
      let yDataDomainPaddedMin = yDataDomain[0];
      let yDataDomainPaddedMax = yDataDomain[1];
      const xDomainPadding = this.xDomainPadding.state;
      if (typeof xDomainPadding[0] !== "boolean") {
        yDataDomainPaddedMin = (+yDataDomainPaddedMin - +xDomainPadding[0]) as unknown as Y;
      }
      if (typeof xDomainPadding[1] !== "boolean") {
        yDataDomainPaddedMax = (+yDataDomainPaddedMax + +xDomainPadding[1]) as unknown as Y;
      }
      yDataDomainPadded = Domain(yDataDomainPaddedMin, yDataDomainPaddedMax);
    } else {
      yDataDomainPadded = null;
    }
    this.setYDataDomainPadded(yDataDomainPadded);
  }

  @ViewProperty<ScaledView<X, Y>, readonly [X | boolean, X | boolean]>({
    updateFlags: View.NeedsLayout,
    initState(): readonly [X | boolean, X | boolean] {
      return [true, true];
    },
  })
  declare xDomainBounds: ViewProperty<this, readonly [X | boolean, X | boolean]>

  @ViewProperty<ScaledView<X, Y>, readonly [Y | boolean, Y | boolean]>({
    updateFlags: View.NeedsLayout,
    initState(): readonly [Y | boolean, Y | boolean] {
      return [true, true];
    },
  })
  declare yDomainBounds: ViewProperty<this, readonly [Y | boolean, Y | boolean]>

  @ViewProperty<ScaledView<X, Y>, readonly [number | boolean, number | boolean]>({
    updateFlags: View.NeedsLayout,
    initState(): readonly [number | boolean, number | boolean] {
      return [true, true];
    },
  })
  declare xZoomBounds: ViewProperty<this, readonly [number | boolean, number | boolean]>

  @ViewProperty<ScaledView<X, Y>, readonly [number | boolean, number | boolean]>({
    updateFlags: View.NeedsLayout,
    initState(): readonly [number | boolean, number | boolean] {
      return [true, true];
    },
  })
  declare yZoomBounds: ViewProperty<this, readonly [number | boolean, number | boolean]>

  @ViewProperty<ScaledView<X, Y>, readonly [X | boolean, X | boolean]>({
    updateFlags: View.NeedsLayout,
    initState(): readonly [X | boolean, X | boolean] {
      return [false, false];
    },
  })
  declare xDomainPadding: ViewProperty<this, readonly [X | boolean, X | boolean]>

  @ViewProperty<ScaledView<X, Y>, readonly [Y | boolean, Y | boolean]>({
    updateFlags: View.NeedsLayout,
    initState(): readonly [Y | boolean, Y | boolean] {
      return [false, false];
    },
  })
  declare yDomainPadding: ViewProperty<this, readonly [Y | boolean, Y | boolean]>

  protected willSetXRangePadding(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewWillSetXRangePadding !== void 0) {
      viewController.scaledViewWillSetXRangePadding(newXRangePadding, oldXRangePadding, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewWillSetXRangePadding !== void 0) {
        viewObserver.scaledViewWillSetXRangePadding(newXRangePadding, oldXRangePadding, this);
      }
    }
  }

  protected onSetXRangePadding(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetXRangePadding(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewDidSetXRangePadding !== void 0) {
        viewObserver.scaledViewDidSetXRangePadding(newXRangePadding, oldXRangePadding, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewDidSetXRangePadding !== void 0) {
      viewController.scaledViewDidSetXRangePadding(newXRangePadding, oldXRangePadding, this);
    }
  }

  protected updateXRangePadding(xScaledRangePadding: readonly [number, number], scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    if (this.xRangePadding.isPrecedent(View.Intrinsic)) {
      let xRangePadding = this.xRangePadding.state;
      if (xRangePadding === null || this.scaledFasteners.length === 1) {
        xRangePadding = xScaledRangePadding;
      } else if (xScaledRangePadding !== null) {
        xRangePadding = [Math.max(xRangePadding[0], xScaledRangePadding[0]), Math.max(xRangePadding[1], xScaledRangePadding[1])];
      }
      this.xRangePadding.setState(xRangePadding, View.Intrinsic);
    }
  }

  @ViewProperty<ScaledView<X, Y>, readonly [number, number]>({
    initState(): readonly [number, number] {
      return [0, 0];
    },
    willSetState(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.willSetXRangePadding(newXRangePadding, oldXRangePadding);
    },
    didSetState(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.onSetXRangePadding(newXRangePadding, oldXRangePadding);
      this.owner.didSetXRangePadding(newXRangePadding, oldXRangePadding);
    },
  })
  declare xRangePadding: ViewProperty<this, readonly [number, number]>

  protected willSetYRangePadding(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewWillSetYRangePadding !== void 0) {
      viewController.scaledViewWillSetYRangePadding(newYRangePadding, oldYRangePadding, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewWillSetYRangePadding !== void 0) {
        viewObserver.scaledViewWillSetYRangePadding(newYRangePadding, oldYRangePadding, this);
      }
    }
  }

  protected onSetYRangePadding(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
    this.requireUpdate(View.NeedsLayout);
  }

  protected didSetYRangePadding(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewDidSetYRangePadding !== void 0) {
        viewObserver.scaledViewDidSetYRangePadding(newYRangePadding, oldYRangePadding, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewDidSetYRangePadding !== void 0) {
      viewController.scaledViewDidSetYRangePadding(newYRangePadding, oldYRangePadding, this);
    }
  }

  protected updateYRangePadding(yScaledRangePadding: readonly [number, number], scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    if (this.yRangePadding.isPrecedent(View.Intrinsic)) {
      let yRangePadding = this.yRangePadding.state;
      if (yRangePadding === null || this.scaledFasteners.length === 1) {
        yRangePadding = yScaledRangePadding;
      } else if (yScaledRangePadding !== null) {
        yRangePadding = [Math.max(yRangePadding[0], yScaledRangePadding[0]), Math.max(yRangePadding[1], yScaledRangePadding[1])];
      }
      this.yRangePadding.setState(yRangePadding, View.Intrinsic);
    }
  }

  @ViewProperty<ScaledView<X, Y>, readonly [number, number]>({
    initState(): readonly [number, number] {
      return [0, 0];
    },
    willSetState(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.willSetYRangePadding(newYRangePadding, oldYRangePadding);
    },
    didSetState(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.onSetYRangePadding(newYRangePadding, oldYRangePadding);
      this.owner.didSetYRangePadding(newYRangePadding, oldYRangePadding);
    },
  })
  declare yRangePadding: ViewProperty<this, readonly [number, number]>

  @ViewProperty<ScaledView<X, Y>, readonly [number, number], number>({
    type: Object,
    initState(): readonly [number, number] {
      return [1.0, 0.5];
    },
    fromAny(value: readonly [number, number] | number): readonly [number, number] {
      if (typeof value === "number") {
        return [value, value];
      } else {
        return value;
      }
    },
  })
  declare fitAlign: ViewProperty<this, readonly [number, number], number>;

  xFitAlign(): number;
  xFitAlign(xFitAlign: number): this;
  xFitAlign(xFitAlign?: number): number | this {
    const fitAlign = this.fitAlign.state;
    if (xFitAlign === void 0) {
      return fitAlign[0];
    } else {
      this.fitAlign.setState([xFitAlign, fitAlign[1]]);
      return this;
    }
  }

  yFitAlign(): number;
  yFitAlign(yFitAlign: number): this;
  yFitAlign(yFitAlign?: number): number | this {
    const fitAlign = this.fitAlign.state;
    if (yFitAlign === void 0) {
      return fitAlign[0];
    } else {
      this.fitAlign.setState([fitAlign[0], yFitAlign]);
      return this;
    }
  }

  @ViewProperty({type: Number})
  declare fitAspectRatio: ViewProperty<this, number | undefined>;

  preserveAspectRatio(): boolean;
  preserveAspectRatio(preserveAspectRatio: boolean): this;
  preserveAspectRatio(preserveAspectRatio?: boolean): boolean | this {
    if (preserveAspectRatio === void 0) {
      return (this.scaledFlags & ScaledView.PreserveAspectRatioFlag) !== 0;
    } else {
      if (preserveAspectRatio) {
        this.setScaledFlags(this.scaledFlags | ScaledView.PreserveAspectRatioFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.PreserveAspectRatioFlag);
      }
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

  gestures(): readonly [boolean, boolean];
  gestures(gestures: readonly [boolean, boolean] | boolean): this;
  gestures(xGestures: boolean, yGestures: boolean): this;
  gestures(xGestures?: readonly [boolean, boolean] | boolean,
           yGestures?: boolean): readonly [boolean, boolean] | this {
    if (xGestures === void 0) {
      return [(this.scaledFlags & ScaledView.XGesturesFlag) !== 0,
              (this.scaledFlags & ScaledView.YGesturesFlag) !== 0];
    } else {
      if (Array.isArray(xGestures)) {
        yGestures = xGestures[1] as boolean;
        xGestures = xGestures[0] as boolean;
      } else if (yGestures === void 0) {
        yGestures = xGestures as boolean;
      }
      if (xGestures as boolean) {
        this.setScaledFlags(this.scaledFlags | ScaledView.XGesturesFlag);
        this.didEnableXGestures();
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.XGesturesFlag);
        this.didDisableXGestures();
      }
      if (yGestures) {
        this.setScaledFlags(this.scaledFlags | ScaledView.YGesturesFlag);
        this.didEnableYGestures();
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.YGesturesFlag);
        this.didDisableYGestures();
      }
      return this;
    }
  }

  xGestures(): boolean;
  xGestures(xGestures: boolean): this;
  xGestures(xGestures?: boolean): boolean | this {
    if (xGestures === void 0) {
      return (this.scaledFlags & ScaledView.XGesturesFlag) !== 0;
    } else {
      if (xGestures) {
        this.setScaledFlags(this.scaledFlags | ScaledView.XGesturesFlag);
        this.didEnableXGestures();
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.XGesturesFlag);
        this.didDisableXGestures();
      }
      return this;
    }
  }

  yGestures(): boolean;
  yGestures(yGestures: boolean): this;
  yGestures(yGestures?: boolean): boolean | this {
    if (yGestures === void 0) {
      return (this.scaledFlags & ScaledView.YGesturesFlag) !== 0;
    } else {
      if (yGestures) {
        this.setScaledFlags(this.scaledFlags | ScaledView.YGesturesFlag);
        this.didEnableYGestures();
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.YGesturesFlag);
        this.didDisableYGestures();
      }
      return this;
    }
  }

  protected didEnableXGestures(): void {
    if (this.scaleGesture.state === null) {
      this.scaleGesture.setState(true);
    }
  }

  protected didDisableXGestures(): void {
    // hook
  }

  protected didEnableYGestures(): void {
    if (this.scaleGesture.state === null) {
      this.scaleGesture.setState(true);
    }
  }

  protected didDisableYGestures(): void {
    // hook
  }

  protected createScaleGesture(): ScaleGesture<X, Y> | null {
    return new ScaleGesture(this, this);
  }

  @ViewProperty<ScaledView<X, Y>, ScaleGesture<X, Y> | null, boolean>({
    type: ScaleGesture,
    inherit: true,
    state: null,
    fromAny(value: ScaleGesture<X, Y> | boolean | null): ScaleGesture<X, Y> | null {
      if (value === true) {
        return this.owner.createScaleGesture();
      } else if (value === false) {
        return null;
      } else {
        return value;
      }
    }
  })
  declare scaleGesture: ViewProperty<this, ScaleGesture<X, Y> | null, boolean>;

  @ViewProperty<ScaledView<X, Y>, Timing | boolean | undefined, AnyTiming>({
    type: Timing,
    inherit: true,
    initState(): Timing | boolean | undefined {
      return Easing.linear.withDuration(250);
    },
  })
  declare rescaleTransition: ViewProperty<this, Timing | boolean | undefined, AnyTiming>;

  @ViewProperty<ScaledView<X, Y>, Timing | boolean | undefined, AnyTiming>({
    type: Timing,
    inherit: true,
    initState(): Timing | boolean | undefined {
      return Easing.cubicOut.withDuration(250);
    },
  })
  declare reboundTransition: ViewProperty<this, Timing | boolean | undefined, AnyTiming>;

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

  insertScaled(scaledView: ScaledXView<X> | ScaledYView<Y>, targetView: View | null = null): void {
    const scaledFasteners = this.scaledFasteners as ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>[];
    let targetIndex = scaledFasteners.length;
    for (let i = 0, n = scaledFasteners.length; i < n; i += 1) {
      const scaledFastener = scaledFasteners[i]!;
      if (scaledFastener.view === scaledView) {
        return;
      } else if (scaledFastener.view === targetView) {
        targetIndex = i;
      }
    }
    const scaledFastener = this.createScaledFastener(scaledView);
    scaledFasteners.splice(targetIndex, 0, scaledFastener);
    scaledFastener.setView(scaledView, targetView);
    if (this.isMounted()) {
      scaledFastener.mount();
    }
  }

  removeScaled(scaledView: ScaledXView<X> | ScaledYView<Y>): void {
    const scaledFasteners = this.scaledFasteners as ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>[];
    for (let i = 0, n = scaledFasteners.length; i < n; i += 1) {
      const scaledFastener = scaledFasteners[i]!;
      if (scaledFastener.view === scaledView) {
        scaledFastener.setView(null);
        if (this.isMounted()) {
          scaledFastener.unmount();
        }
        scaledFasteners.splice(i, 1);
        break;
      }
    }
  }

  protected initScaled(scaledView: ScaledXView<X> | ScaledYView<Y>, scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    // hook
  }

  protected willSetScaled(newScaledView: ScaledXView<X> | ScaledYView<Y> | null, oldScaledView: ScaledXView<X> | ScaledYView<Y> | null,
                          targetView: View | null, scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewWillSetScaled !== void 0) {
      viewController.scaledViewWillSetScaled(newScaledView, oldScaledView, targetView, this);
    }
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewWillSetScaled !== void 0) {
        viewObserver.scaledViewWillSetScaled(newScaledView, oldScaledView, targetView, this);
      }
    }
  }

  protected onSetScaled(newScaledView: ScaledXView<X> | ScaledYView<Y> | null, oldScaledView: ScaledXView<X> | ScaledYView<Y> | null,
                        targetView: View | null, scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    if (newScaledView !== null) {
      this.initScaled(newScaledView, scaledFastener);
      if (ScaledXView.is<X>(newScaledView)) {
        this.updateXDataDomain(newScaledView.xDataDomain, scaledFastener);
      }
      if (ScaledYView.is<Y>(newScaledView)) {
        this.updateYDataDomain(newScaledView.yDataDomain, scaledFastener);
      }
    }
  }

  protected didSetScaled(newScaledView: ScaledXView<X> | ScaledYView<Y> | null, oldScaledView: ScaledXView<X> | ScaledYView<Y> | null,
                         targetView: View | null, scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    const viewObservers = this.viewObservers;
    for (let i = 0, n = viewObservers.length; i < n; i += 1) {
      const viewObserver = viewObservers[i]!;
      if (viewObserver.scaledViewDidSetScaled !== void 0) {
        viewObserver.scaledViewDidSetScaled(newScaledView, oldScaledView, targetView, this);
      }
    }
    const viewController = this.viewController;
    if (viewController !== null && viewController.scaledViewDidSetScaled !== void 0) {
      viewController.scaledViewDidSetScaled(newScaledView, oldScaledView, targetView, this);
    }
  }

  protected onSetScaledXScale(newXScale: ContinuousScale<X, number> | null, oldXScale: ContinuousScale<X, number> | null,
                              scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    // hook
  }

  protected onSetScaledYScale(newYScale: ContinuousScale<Y, number> | null, oldYScale: ContinuousScale<Y, number> | null,
                              scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    // hook
  }

  protected onSetScaledXRangePadding(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number],
                                     scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    this.updateXRangePadding(newXRangePadding, scaledFastener);
  }

  protected onSetScaledYRangePadding(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number],
                                     scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    this.updateYRangePadding(newYRangePadding, scaledFastener);
  }

  protected onSetScaledXDataDomain(newXDataDomain: Domain<X> | null, oldXDataDomain: Domain<X> | null,
                                   scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    this.updateXDataDomain(newXDataDomain, scaledFastener);
    this.requireUpdate(View.NeedsLayout);
  }

  protected onSetScaledYDataDomain(newYDataDomain: Domain<Y> | null, oldYDataDomain: Domain<Y> | null,
                                   scaledFastener: ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>): void {
    this.updateYDataDomain(newYDataDomain, scaledFastener);
    this.requireUpdate(View.NeedsLayout);
  }

  /** @hidden */
  static ScaledFastener = ViewFastener.define<ScaledView<unknown, unknown>, ScaledXView<unknown> | ScaledYView<unknown>>({
    child: false,
    observe: true,
    willSetView(newScaledView: ScaledView<unknown, unknown> | null, oldScaledView: ScaledXView<unknown> | ScaledYView<unknown> | null, targetView: View | null): void {
      this.owner.willSetScaled(newScaledView, oldScaledView, targetView, this);
    },
    onSetView(newScaledView: ScaledView<unknown, unknown> | null, oldScaledView: ScaledXView<unknown> | ScaledYView<unknown> | null, targetView: View | null): void {
      this.owner.onSetScaled(newScaledView, oldScaledView, targetView, this);
    },
    didSetView(newScaledView: ScaledView<unknown, unknown> | null, oldScaledView: ScaledXView<unknown> | ScaledYView<unknown> | null, targetView: View | null): void {
      this.owner.didSetScaled(newScaledView, oldScaledView, targetView, this);
    },
    scaledViewDidSetXScale(newXScale: ContinuousScale<unknown, number> | null, oldXScale: ContinuousScale<unknown, number> | null): void {
      this.owner.onSetScaledXScale(newXScale, oldXScale, this);
    },
    scaledViewDidSetYScale(newYScale: ContinuousScale<unknown, number> | null, oldYScale: ContinuousScale<unknown, number> | null): void {
      this.owner.onSetScaledYScale(newYScale, oldYScale, this);
    },
    scaledViewDidSetXRangePadding(newXRangePadding: readonly [number, number], oldXRangePadding: readonly [number, number]): void {
      this.owner.onSetScaledXRangePadding(newXRangePadding, oldXRangePadding, this);
    },
    scaledViewDidSetYRangePadding(newYRangePadding: readonly [number, number], oldYRangePadding: readonly [number, number]): void {
      this.owner.onSetScaledYRangePadding(newYRangePadding, oldYRangePadding, this);
    },
    scaledViewDidSetXDataDomain(newXDomain: Domain<unknown> | null, oldXDomain: Domain<unknown> | null): void {
      this.owner.onSetScaledXDataDomain(newXDomain, oldXDomain, this);
    },
    scaledViewDidSetYDataDomain(newYDomain: Domain<unknown> | null, oldYDomain: Domain<unknown> | null): void {
      this.owner.onSetScaledYDataDomain(newYDomain, oldYDomain, this);
    },
  });

  protected createScaledFastener(scaledView: ScaledXView<X> | ScaledYView<Y>): ViewFastener<this, ScaledXView<X> | ScaledYView<Y>> {
    return new ScaledView.ScaledFastener(this as ScaledView<unknown, unknown>, scaledView.key, "scaled") as ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>;
  }

  /** @hidden */
  declare readonly scaledFasteners: ReadonlyArray<ViewFastener<this, ScaledXView<X> | ScaledYView<Y>>>;

  /** @hidden */
  protected mountScaledFasteners(): void {
    const scaledFasteners = this.scaledFasteners;
    for (let i = 0, n = scaledFasteners.length; i < n; i += 1) {
      const scaledFastener = scaledFasteners[i]!;
      scaledFastener.mount();
    }
  }

  /** @hidden */
  protected unmountScaledFasteners(): void {
    const scaledFasteners = this.scaledFasteners;
    for (let i = 0, n = scaledFasteners.length; i < n; i += 1) {
      const scaledFastener = scaledFasteners[i]!;
      scaledFastener.unmount();
    }
  }

  protected detectScaled(view: View): ScaledXView<X> | ScaledYView<Y> | null {
    return ScaledXView.is<X>(view) || ScaledYView.is<Y>(view) ? view : null;
  }

  protected onInsertScaled(scaledView: ScaledXView<X> | ScaledYView<Y>, targetView: View | null): void {
    this.insertScaled(scaledView, targetView);
  }

  protected onRemoveScaled(scaledView: ScaledXView<X> | ScaledYView<Y>): void {
    this.removeScaled(scaledView);
  }

  protected onInsertChildView(childView: View, targetView: View | null): void {
    super.onInsertChildView(childView, targetView);
    const scaledView = this.detectScaled(childView);
    if (scaledView !== null) {
      this.onInsertScaled(scaledView, targetView);
    }
  }

  protected onRemoveChildView(childView: View): void {
    super.onRemoveChildView(childView);
    const scaledView = this.detectScaled(childView);
    if (scaledView !== null) {
      this.onRemoveScaled(scaledView);
    }
  }

  protected onLayout(viewContext: ViewContextType<this>): void {
    super.onLayout(viewContext);
    this.xScale.onAnimate(viewContext.updateTime);
    this.yScale.onAnimate(viewContext.updateTime);
    this.resizeScales();
    this.updateScales();
  }

  /**
   * Updates own scale ranges to project onto view frame.  Infers own scales
   * from child view data domains if inherited x/y scales are undefined.
   */
  protected resizeScales(): void {
    let xScale: ContinuousScale<X, number> | null;
    const xRange = this.xRange();
    if (xRange !== null) {
      xScale = !this.xScale.isInherited() ? this.xScale.ownState : null;
      if (xScale !== null) {
        if (!xScale.range.equals(xRange)) {
          this.xScale.setRange(xRange);
          this.setScaledFlags(this.scaledFlags | ScaledView.RescaleFlag);
        }
      } else if (this.xScale.superAnimator === null || this.xScale.superValue === null) {
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
      yScale = !this.yScale.isInherited() ? this.yScale.ownState : null;
      if (yScale !== null) {
        if (!yScale.range.equals(yRange)) {
          this.yScale.setRange(yRange);
          this.setScaledFlags(this.scaledFlags | ScaledView.RescaleFlag);
        }
      } else if (this.yScale.superAnimator === null || this.yScale.superValue === null) {
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
    const xScale = !this.xScale.isInherited() ? this.xScale.ownState : null;
    const yScale = !this.yScale.isInherited() ? this.yScale.ownState : null;
    if (xScale !== null && yScale !== null) {
      const scaleGesture = this.scaleGesture.state;
      const isPressing = scaleGesture !== null && scaleGesture.isPressing();
      if (!isPressing) {
        const isCoasting = scaleGesture !== null && scaleGesture.isCoasting();
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
    const xDomainBounds = this.xDomainBounds.state;
    const xDomainMin = xDomainBounds[0] === false ? void 0
                     : xDomainBounds[0] === true ? xDomainPadded[0]
                     : xDomainBounds[0];
    const xDomainMax = xDomainBounds[1] === false ? void 0
                     : xDomainBounds[1] === true ? xDomainPadded[1]
                     : xDomainBounds[1];
    const xZoomBounds = this.xZoomBounds.state;
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
    const yDomainBounds = this.yDomainBounds.state;
    const yDomainMin = yDomainBounds[0] === false ? void 0
                     : yDomainBounds[0] === true ? yDomainPadded[0]
                     : yDomainBounds[0];
    const yDomainMax = yDomainBounds[1] === false ? void 0
                     : yDomainBounds[1] === true ? yDomainPadded[1]
                     : yDomainBounds[1];
    const yZoomBounds = this.yZoomBounds.state;
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
    const fitAspectRatio = this.fitAspectRatio.state;
    if (fitAspectRatio !== void 0 && (this.scaledFlags & (ScaledView.PreserveAspectRatioFlag | ScaledView.FitMask)) !== 0) {
      const xRange = oldXScale.range;
      const yRange = oldYScale.range;
      const oldDomainWidth = +newXDomain[1] - +newXDomain[0];
      const oldDomainHeight = +newYDomain[1] - +newYDomain[0];
      const domainAspectRatio = oldDomainWidth / oldDomainHeight;
      const rangeAspectRatio = (xRange[1] - xRange[0]) / (yRange[0] - yRange[1]);
      const anamorphicAspectRatio = Math.abs(fitAspectRatio * rangeAspectRatio);
      if (!Equivalent(domainAspectRatio, anamorphicAspectRatio)) {
        const fitAlign = this.fitAlign.state;
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
               ? this.reboundTransition.state : this.rescaleTransition.state;
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
               ? this.reboundTransition.state : this.rescaleTransition.state;
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

  protected displayChildViews(displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                              displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
                                                 viewContext: ViewContextType<this>) => void): void {
    let xScale: ContinuousScale<X, number> | null;
    let yScale: ContinuousScale<Y, number> | null;
    if ((displayFlags & View.NeedsLayout) !== 0 &&
        (xScale = this.xScale.value, xScale !== null) &&
        (yScale = this.yScale.value, yScale !== null)) {
      this.layoutChildViews(xScale, yScale, displayFlags, viewContext, displayChildView);
    } else {
      super.displayChildViews(displayFlags, viewContext, displayChildView);
    }
  }

  protected layoutChildViews(xScale: ContinuousScale<X, number>,
                             yScale: ContinuousScale<Y, number>,
                             displayFlags: ViewFlags, viewContext: ViewContextType<this>,
                             displayChildView: (this: this, childView: View, displayFlags: ViewFlags,
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
      displayChildView.call(this, childView, displayFlags, viewContext);
      if (ScaledXView.is<X>(childView) && childView.xScale.isInherited()) {
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
      if (ScaledYView.is<Y>(childView) && childView.yScale.isInherited()) {
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
    super.displayChildViews(displayFlags, viewContext, layoutChildView);

    this.setXDataDomain(xCount !== 0 ? Domain<X>(xDataDomainMin!, xDataDomainMax!) : null);
    this.setYDataDomain(yCount !== 0 ? Domain<Y>(yDataDomainMin!, yDataDomainMax!) : null);
    this.xRangePadding.setState([xRangePaddingMin, xRangePaddingMax], View.Intrinsic);
    this.yRangePadding.setState([yRangePaddingMin, yRangePaddingMax], View.Intrinsic);
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
    const scaleGesture = this.scaleGesture.state;
    if (scaleGesture !== null) {
      scaleGesture.neutralizeX();
    }
  }

  protected didReboundX(xScale: ContinuousScale<X, number>): void {
    // hook
  }

  protected willReboundY(yScale: ContinuousScale<Y, number>): void {
    const scaleGesture = this.scaleGesture.state;
    if (scaleGesture !== null) {
      scaleGesture.neutralizeY();
    }
  }

  protected didReboundY(yScale: ContinuousScale<Y, number>): void {
    // hook
  }

  willStartInteracting(): void {
    this.setScaledFlags(this.scaledFlags & ~ScaledView.BoundingMask | ScaledView.InteractingFlag);
  }

  didStopInteracting(): void {
    const xScale = this.xScale.value;
    const xDataDomain = this.xDataDomain;
    if (xScale !== null && xDataDomain !== null) {
      const xDomain = xScale.domain;
      if (xDomain.contains(xDataDomain[0])) {
        this.setScaledFlags(this.scaledFlags | ScaledView.XMinInRangeFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.XMinInRangeFlag);
      }
      if (xDomain.contains(xDataDomain[1])) {
        this.setScaledFlags(this.scaledFlags | ScaledView.XMaxInRangeFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.XMaxInRangeFlag);
      }
    }

    const yScale = this.yScale.value;
    const yDataDomain = this.yDataDomain;
    if (yScale !== null && yDataDomain !== null) {
      const yDomain = yScale.domain;
      if (yDomain.contains(yDataDomain[0])) {
        this.setScaledFlags(this.scaledFlags | ScaledView.YMinInRangeFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.YMinInRangeFlag);
      }
      if (yDomain.contains(yDataDomain[1])) {
        this.setScaledFlags(this.scaledFlags | ScaledView.YMaxInRangeFlag);
      } else {
        this.setScaledFlags(this.scaledFlags & ~ScaledView.YMaxInRangeFlag);
      }
    }
    this.setScaledFlags(this.scaledFlags & ~ScaledView.InteractingFlag | ScaledView.InteractedFlag);
  }

  didStopPressing(): void {
    this.requireUpdate(View.NeedsLayout);
  }

  willBeginCoast(input: ScaleGestureInput<X, Y>, event: Event | null): boolean | void {
    if ((this.scaledFlags & ScaledView.XGesturesFlag) === 0) {
      input.disableX = true;
      input.vx = 0;
      input.ax = 0;
    }
    if ((this.scaledFlags & ScaledView.YGesturesFlag) === 0) {
      input.disableY = true;
      input.vy = 0;
      input.ay = 0;
    }
  }

  /** @hidden */
  protected mountViewFasteners(): void {
    super.mountViewFasteners();
    this.mountScaledFasteners();
  }

  /** @hidden */
  protected unmountViewFasteners(): void {
    this.unmountScaledFasteners();
    super.unmountViewFasteners();
  }

  /** @hidden */
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

  /** @hidden */
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

  /** @hidden */
  static readonly PreserveAspectRatioFlag: ScaledFlags = 1 << 0;
  /** @hidden */
  static readonly XDomainTrackingFlag: ScaledFlags = 1 << 1;
  /** @hidden */
  static readonly YDomainTrackingFlag: ScaledFlags = 1 << 2;
  /** @hidden */
  static readonly XGesturesFlag: ScaledFlags = 1 << 3;
  /** @hidden */
  static readonly YGesturesFlag: ScaledFlags = 1 << 4;
  /** @hidden */
  static readonly XMinInRangeFlag: ScaledFlags = 1 << 5;
  /** @hidden */
  static readonly XMaxInRangeFlag: ScaledFlags = 1 << 6;
  /** @hidden */
  static readonly YMinInRangeFlag: ScaledFlags = 1 << 7;
  /** @hidden */
  static readonly YMaxInRangeFlag: ScaledFlags = 1 << 8;
  /** @hidden */
  static readonly InteractingFlag: ScaledFlags = 1 << 9;
  /** @hidden */
  static readonly InteractedFlag: ScaledFlags = 1 << 10;
  /** @hidden */
  static readonly XBoundingFlag: ScaledFlags = 1 << 11;
  /** @hidden */
  static readonly YBoundingFlag: ScaledFlags = 1 << 12;
  /** @hidden */
  static readonly XFitFlag: ScaledFlags = 1 << 13;
  /** @hidden */
  static readonly YFitFlag: ScaledFlags = 1 << 14;
  /** @hidden */
  static readonly XFitTweenFlag: ScaledFlags = 1 << 15;
  /** @hidden */
  static readonly YFitTweenFlag: ScaledFlags = 1 << 16;
  /** @hidden */
  static readonly RescaleFlag: ScaledFlags = 1 << 17;

  /** @hidden */
  static readonly DomainTrackingMask: ScaledFlags = ScaledView.XDomainTrackingFlag
                                                  | ScaledView.YDomainTrackingFlag;
  /** @hidden */
  static readonly GesturesMask: ScaledFlags = ScaledView.XGesturesFlag
                                            | ScaledView.YGesturesFlag;
  /** @hidden */
  static readonly XInRangeMask: ScaledFlags = ScaledView.XMinInRangeFlag
                                            | ScaledView.XMaxInRangeFlag;
  /** @hidden */
  static readonly YInRangeMask: ScaledFlags = ScaledView.YMinInRangeFlag
                                            | ScaledView.YMaxInRangeFlag;
  /** @hidden */
  static readonly InteractingMask: ScaledFlags = ScaledView.InteractingFlag
                                               | ScaledView.InteractedFlag;
  /** @hidden */
  static readonly BoundingMask: ScaledFlags = ScaledView.XBoundingFlag
                                            | ScaledView.YBoundingFlag;
  /** @hidden */
  static readonly FitMask: ScaledFlags = ScaledView.XFitFlag
                                       | ScaledView.YFitFlag;
  /** @hidden */
  static readonly FitTweenMask: ScaledFlags = ScaledView.XFitTweenFlag
                                            | ScaledView.YFitTweenFlag;

  /** @hidden */
  static LinearZoomMin: number = 1000000;
  /** @hidden */
  static LinearZoomMax: number = 0.001;
  /** @hidden */
  static TimeZoomMin: number = 86400000;
  /** @hidden */
  static TimeZoomMax: number = 1;

  static readonly insertChildFlags: ViewFlags = LayerView.insertChildFlags | View.NeedsResize;
}
