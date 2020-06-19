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

import {Objects} from "@swim/util";
import {Interpolator} from "@swim/interpolate";
import {BoxR2} from "@swim/math";
import {AnyColor, Color} from "@swim/color";
import {AnyFont, Font} from "@swim/font";
import {Scale, ContinuousScale, LinearScale, TimeScale} from "@swim/scale";
import {Ease, Tween, AnyTransition, Transition} from "@swim/transition";
import {
  ViewFlags,
  View,
  ViewScope,
  ViewAnimator,
  ContinuousScaleViewAnimator,
  GraphicsViewContext,
  GraphicsViewInit,
  GraphicsNodeView,
} from "@swim/view";
import {ScaleGestureInput, ScaleGestureDelegate, ScaleGesture} from "@swim/gesture";
import {ScaleXView} from "./ScaleXView";
import {ScaleYView} from "./ScaleYView";
import {ScaleXYView} from "./ScaleXYView";
import {ScaleViewController} from "./ScaleViewController";

/** @hidden */
export type ScaleFlags = number;

export interface ScaleViewInit<X = unknown, Y = unknown> extends GraphicsViewInit {
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
  rescaleTransition?: AnyTransition<any>;
  reboundTransition?: AnyTransition<any>;

  font?: AnyFont;
  textColor?: AnyColor;
}

export abstract class ScaleView<X = unknown, Y = unknown> extends GraphicsNodeView
  implements ScaleXYView<X, Y>, ScaleGestureDelegate<X, Y> {

  /** @hidden */
  _scaleFlags: ScaleFlags;
  /** @hidden */
  readonly _xDomainBounds: [X | boolean, X | boolean];
  /** @hidden */
  readonly _yDomainBounds: [Y | boolean, Y | boolean];
  /** @hidden */
  readonly _xZoomBounds: [number | boolean, number | boolean];
  /** @hidden */
  readonly _yZoomBounds: [number | boolean, number | boolean];
  /** @hidden */
  readonly _xDomainPadding: [X | boolean, X | boolean];
  /** @hidden */
  readonly _yDomainPadding: [Y | boolean, Y | boolean];
  /** @hidden */
  readonly _xRangePadding: [number, number];
  /** @hidden */
  readonly _yRangePadding: [number, number];
  /** @hidden */
  readonly _fitAlign: [number, number];
  /** @hidden */
  _xDataDomain: [X, X] | undefined;
  /** @hiddenData */
  _yDataDomain: [Y, Y] | undefined;
  /** @hidden */
  _xDataDomainPadded: [X, X] | undefined;
  /** @hidden */
  _yDataDomainPadded: [Y, Y] | undefined;
  /** @hidden */
  _xDataRange: [number, number] | undefined;
  /** @hidden */
  _yDataRange: [number, number] | undefined;
  /** @hidden */
  _fitAspectRatio: number | undefined;

  constructor() {
    super();
    this._scaleFlags = 0;
    this._xDomainBounds = [true, true];
    this._yDomainBounds = [true, true];
    this._xZoomBounds = [true, true];
    this._yZoomBounds = [true, true];
    this._xDomainPadding = [false, false];
    this._yDomainPadding = [false, false];
    this._xRangePadding = [0, 0];
    this._yRangePadding = [0, 0];
    this._fitAlign = [1, 0.5];
    this._xDataDomain = void 0;
    this._yDataDomain = void 0;
    this._xDataDomainPadded = void 0;
    this._yDataDomainPadded = void 0;
    this._xDataRange = void 0;
    this._yDataRange = void 0;
    this._fitAspectRatio = void 0;
    this.xScale.onUpdate = this.onUpdateXScale.bind(this);
    this.yScale.onUpdate = this.onUpdateYScale.bind(this);
    this.onBeginFittingXScale = this.onBeginFittingXScale.bind(this);
    this.onEndFittingXScale = this.onEndFittingXScale.bind(this);
    this.onInterruptFittingXScale = this.onInterruptFittingXScale.bind(this);
    this.onBeginFittingYScale = this.onBeginFittingYScale.bind(this);
    this.onEndFittingYScale = this.onEndFittingYScale.bind(this);
    this.onInterruptFittingYScale = this.onInterruptFittingYScale.bind(this);
    this.onBeginBoundingXScale = this.onBeginBoundingXScale.bind(this);
    this.onEndBoundingXScale = this.onEndBoundingXScale.bind(this);
    this.onInterruptBoundingXScale = this.onInterruptBoundingXScale.bind(this);
    this.onBeginBoundingYScale = this.onBeginBoundingYScale.bind(this);
    this.onEndBoundingYScale = this.onEndBoundingYScale.bind(this);
    this.onInterruptBoundingYScale = this.onInterruptBoundingYScale.bind(this);
  }

  get viewController(): ScaleViewController<X, Y> | null {
    return this._viewController;
  }

  @ViewAnimator(ContinuousScale, {inherit: true})
  xScale: ContinuousScaleViewAnimator<this, X, number>;

  @ViewAnimator(ContinuousScale, {inherit: true})
  yScale: ContinuousScaleViewAnimator<this, Y, number>;

  xDomain(): readonly [X, X] | undefined;
  xDomain(xDomain: readonly [X, X] | string | undefined, tween?: Tween<ContinuousScale<X, number>>): this;
  xDomain(xMin: X, xMax: X, tween?: Tween<ContinuousScale<X, number>>): this;
  xDomain(xMin?: readonly [X, X] | X | string, xMax?: X | Tween<ContinuousScale<X, number>>,
          tween?: Tween<ContinuousScale<X, number>>): readonly [X, X] | undefined | this {
    if (xMin === null) {
      const xScale = this.xScale.value;
      return xScale !== void 0 ? xScale.domain() : void 0;
    } else {
      if (Array.isArray(xMin) || typeof xMin === "string") {
        tween = xMax as Tween<ContinuousScale<X, number>>;
      }
      if (tween === true) {
        tween = this.rescaleTransition.state;
      }
      const xRange = this.xRange();
      if (Array.isArray(xMin) || typeof xMin === "string") {
        if (xRange !== void 0) {
          this.xScale.setBaseScale(xMin as readonly [X, X] | string, xRange, tween);
        } else {
          this.xScale.setBaseDomain(xMin as readonly [X, X] | string, tween);
        }
      } else {
        if (xRange !== void 0) {
          this.xScale.setBaseScale(xMin as X, xMax as X, xRange[0], xRange[1], tween);
        } else {
          this.xScale.setBaseDomain(xMin as X, xMax as X, tween);
        }
      }
      return this;
    }
  }

  yDomain(): readonly [Y, Y] | undefined;
  yDomain(yDomain: readonly [Y, Y] | string | undefined, tween?: Tween<ContinuousScale<Y, number>>): this;
  yDomain(yMin: Y, yMax: Y, tween?: Tween<ContinuousScale<Y, number>>): this;
  yDomain(yMin?: readonly [Y, Y] | Y | string, yMax?: Y | Tween<ContinuousScale<Y, number>>,
          tween?: Tween<ContinuousScale<Y, number>>): readonly [Y, Y] | undefined | this {
    if (yMin === null) {
      const yScale = this.yScale.value;
      return yScale !== void 0 ? yScale.domain() : void 0;
    } else {
      if (Array.isArray(yMin) || typeof yMin === "string") {
        tween = yMax as Tween<ContinuousScale<Y, number>>;
      }
      if (tween === true) {
        tween = this.rescaleTransition.state;
      }
      const yRange = this.yRange();
      if (Array.isArray(yMin) || typeof yMin === "string") {
        if (yRange !== void 0) {
          this.yScale.setBaseScale(yMin as readonly [Y, Y] | string, [yRange[1], yRange[0]], tween);
        } else {
          this.yScale.setBaseDomain(yMin as readonly [Y, Y] | string, tween);
        }
      } else {
        if (yRange !== void 0) {
          this.yScale.setBaseScale(yMin as Y, yMax as Y, yRange[1], yRange[0], tween);
        } else {
          this.yScale.setBaseDomain(yMin as Y, yMax as Y, tween);
        }
      }
      return this;
    }
  }

  xRange(): readonly [number, number] | undefined {
    const xRangeMin = this._xRangePadding[0];
    const xRangeMax = this.viewFrame.width - this._xRangePadding[1];
    return [xRangeMin, xRangeMax];
  }

  yRange(): readonly [number, number] | undefined {
    const yRangeMin = this._yRangePadding[0];
    const yRangeMax = this.viewFrame.height - this._yRangePadding[1];
    return [yRangeMin, yRangeMax];
  }

  xDomainBounds(): readonly [X | boolean, X | boolean];
  xDomainBounds(xDomainBounds: readonly [X | boolean, X | boolean] | boolean): this;
  xDomainBounds(xDomainMin: X | boolean, xDomainMax: X | boolean): this;
  xDomainBounds(xDomainMin?: readonly [X | boolean, X | boolean] | X | boolean,
                xDomainMax?: X | boolean): readonly [X | boolean, X | boolean] | this {
    if (xDomainMin === void 0) {
      return this._xDomainBounds;
    } else {
      if (Array.isArray(xDomainMin)) {
        xDomainMax = (xDomainMin as readonly [X | boolean, X | boolean])[1];
        xDomainMin = (xDomainMin as readonly [X | boolean, X | boolean])[0];
      } else if (xDomainMax === void 0) {
        xDomainMax = xDomainMin as boolean;
      }
      this._xDomainBounds[0] = xDomainMin as X | boolean;
      this._xDomainBounds[1] = xDomainMax;
      this.requireUpdate(View.NeedsAnimate);
      return this;
    }
  }

  yDomainBounds(): readonly [Y | boolean, Y | boolean];
  yDomainBounds(yDomainBounds: readonly [Y | boolean, Y | boolean] | boolean): this;
  yDomainBounds(yDomainMin: Y | boolean, yDomainMax: Y | boolean): this;
  yDomainBounds(yDomainMin?: readonly [Y | boolean, Y | boolean] | Y | boolean,
                yDomainMax?: Y | boolean): readonly [Y | boolean, Y | boolean] | this {
    if (yDomainMin === void 0) {
      return this._yDomainBounds;
    } else {
      if (Array.isArray(yDomainMin)) {
        yDomainMax = (yDomainMin as readonly [Y | boolean, Y | boolean])[1];
        yDomainMin = (yDomainMin as readonly [Y | boolean, Y | boolean])[0];
      } else if (yDomainMax === void 0) {
        yDomainMax = yDomainMin as boolean;
      }
      this._yDomainBounds[0] = yDomainMin as Y | boolean;
      this._yDomainBounds[1] = yDomainMax;
      this.requireUpdate(View.NeedsAnimate);
      return this;
    }
  }

  xZoomBounds(): readonly [number | boolean, number | boolean];
  xZoomBounds(xZoomBounds: readonly [number | boolean, number | boolean] | boolean): this;
  xZoomBounds(xZoomMin: number | boolean, xZoomMax: number | boolean): this;
  xZoomBounds(xZoomMin?: readonly [number | boolean, number | boolean] | number | boolean,
              xZoomMax?: number | boolean): readonly [number | boolean, number | boolean] | this {
    if (xZoomMin === void 0) {
      return this._xZoomBounds;
    } else {
      if (Array.isArray(xZoomMin)) {
        xZoomMax = (xZoomMin as readonly [number | boolean, number | boolean])[1];
        xZoomMin = (xZoomMin as readonly [number | boolean, number | boolean])[0];
      } else if (xZoomMax === void 0) {
        xZoomMax = xZoomMin as boolean;
      }
      this._xZoomBounds[0] = xZoomMin as number | boolean;
      this._xZoomBounds[1] = xZoomMax;
      this.requireUpdate(View.NeedsAnimate);
      return this;
    }
  }

  yZoomBounds(): readonly [number | boolean, number | boolean];
  yZoomBounds(yZoomBounds: readonly [number | boolean, number | boolean] | boolean): this;
  yZoomBounds(yZoomMin: number | boolean, yZoomMax: number | boolean): this;
  yZoomBounds(yZoomMin?: readonly [number | boolean, number | boolean] | number | boolean,
              yZoomMax?: number | boolean): readonly [number | boolean, number | boolean] | this {
    if (yZoomMin === void 0) {
      return this._yZoomBounds;
    } else {
      if (Array.isArray(yZoomMin)) {
        yZoomMax = (yZoomMin as readonly [number | boolean, number | boolean])[1];
        yZoomMin = (yZoomMin as readonly [number | boolean, number | boolean])[0];
      } else if (yZoomMax === void 0) {
        yZoomMax = yZoomMin as boolean;
      }
      this._yZoomBounds[0] = yZoomMin as number | boolean;
      this._yZoomBounds[1] = yZoomMax;
      this.requireUpdate(View.NeedsAnimate);
      return this;
    }
  }

  xDomainPadding(): readonly [X | boolean, X | boolean];
  xDomainPadding(xDomainPadding: readonly [X | boolean, X | boolean] | boolean): this;
  xDomainPadding(xDomainPaddingMin: X | boolean, xDomainPaddingMax: X | boolean): this;
  xDomainPadding(xDomainPaddingMin?: readonly [X | boolean, X | boolean] | X | boolean,
                 xDomainPaddingMax?: X | boolean): readonly [X | boolean, X | boolean] | this {
    if (xDomainPaddingMin === void 0) {
      return this._xDomainPadding;
    } else {
      if (Array.isArray(xDomainPaddingMin)) {
        xDomainPaddingMax = (xDomainPaddingMin as readonly [X | boolean, X | boolean])[1];
        xDomainPaddingMin = (xDomainPaddingMin as readonly [X | boolean, X | boolean])[0];
      } else if (xDomainPaddingMax === void 0) {
        xDomainPaddingMax = xDomainPaddingMin as boolean;
      }
      this._xDomainPadding[0] = xDomainPaddingMin as X | boolean;
      this._xDomainPadding[1] = xDomainPaddingMax;
      this.requireUpdate(View.NeedsAnimate);
      return this;
    }
  }

  yDomainPadding(): readonly [Y | boolean, Y | boolean];
  yDomainPadding(yDomainPadding: readonly [Y | boolean, Y | boolean] | boolean): this;
  yDomainPadding(yDomainPaddingMin: Y | boolean, yDomainPaddingMax: Y | boolean): this;
  yDomainPadding(yDomainPaddingMin?: readonly [Y | boolean, Y | boolean] | Y | boolean,
                 yDomainPaddingMax?: Y | boolean): readonly [Y | boolean, Y | boolean] | this {
    if (yDomainPaddingMin === void 0) {
      return this._yDomainPadding;
    } else {
      if (Array.isArray(yDomainPaddingMin)) {
        yDomainPaddingMax = (yDomainPaddingMin as readonly [Y | boolean, Y | boolean])[1];
        yDomainPaddingMin = (yDomainPaddingMin as readonly [Y | boolean, Y | boolean])[0];
      } else if (yDomainPaddingMax === void 0) {
        yDomainPaddingMax = yDomainPaddingMin as boolean;
      }
      this._yDomainPadding[0] = yDomainPaddingMin as Y | boolean;
      this._yDomainPadding[1] = yDomainPaddingMax;
      this.requireUpdate(View.NeedsAnimate);
      return this;
    }
  }

  xRangePadding(): readonly [number, number];
  xRangePadding(xRangePadding: readonly [number, number] | number): this;
  xRangePadding(xRangePaddingMin: number, xRangePaddingMax: number): this;
  xRangePadding(xRangePaddingMin?: readonly [number, number] | number,
                xRangePaddingMax?: number): readonly [number, number] | this {
    if (xRangePaddingMin === void 0) {
      return this._xRangePadding;
    } else {
      if (Array.isArray(xRangePaddingMin)) {
        xRangePaddingMax = (xRangePaddingMin as readonly [number, number])[1];
        xRangePaddingMin = (xRangePaddingMin as readonly [number, number])[0];
      } else if (xRangePaddingMax === void 0) {
        xRangePaddingMax = xRangePaddingMin as number;
      }
      this._xRangePadding[0] = xRangePaddingMin as number;
      this._xRangePadding[1] = xRangePaddingMax;
      this.requireUpdate(View.NeedsAnimate);
      return this;
    }
  }

  yRangePadding(): readonly [number, number];
  yRangePadding(yRangePadding: readonly [number, number] | number): this;
  yRangePadding(yRangePaddingMin: number, yRangePaddingMax: number): this;
  yRangePadding(yRangePaddingMin?: readonly [number, number] | number,
                yRangePaddingMax?: number): readonly [number, number] | this {
    if (yRangePaddingMin === void 0) {
      return this._yRangePadding;
    } else {
      if (Array.isArray(yRangePaddingMin)) {
        yRangePaddingMax = (yRangePaddingMin as readonly [number, number])[1];
        yRangePaddingMin = (yRangePaddingMin as readonly [number, number])[0];
      } else if (yRangePaddingMax === void 0) {
        yRangePaddingMax = yRangePaddingMin as number;
      }
      this._yRangePadding[0] = yRangePaddingMin as number;
      this._yRangePadding[1] = yRangePaddingMax;
      this.requireUpdate(View.NeedsAnimate);
      return this;
    }
  }

  xDataDomain(): readonly [X, X] | undefined {
    let xDataDomain = this._xDataDomain;
    if (xDataDomain === void 0) {
      let xDataDomainMin: X | undefined;
      let xDataDomainMax: X | undefined;
      const childViews = this._childViews;
      for (let i = 0, n = childViews.length; i < n; i += 1) {
        const childView = childViews[i];
        if (ScaleXView.is<X>(childView)) {
          if (childView.xScale() === void 0) {
            const xDataDomain = childView.xDataDomain();
            if (xDataDomain !== void 0) {
              if (xDataDomainMin === void 0 || +xDataDomain[0] < +xDataDomainMin) {
                xDataDomainMin = xDataDomain[0];
              }
              if (xDataDomainMax === void 0 || +xDataDomainMax < +xDataDomain[1]) {
                xDataDomainMax = xDataDomain[1];
              }
            }
          }
        }
      }
      if (xDataDomainMin !== void 0 && xDataDomainMax !== void 0) {
        xDataDomain = [xDataDomainMin, xDataDomainMax];
        this._xDataDomain = xDataDomain;
      }
    }
    return xDataDomain;
  }

  yDataDomain(): readonly [Y, Y] | undefined {
    let yDataDomain = this._yDataDomain;
    if (yDataDomain === void 0) {
      let yDataDomainMin: Y | undefined;
      let yDataDomainMax: Y | undefined;
      const childViews = this._childViews;
      for (let i = 0, n = childViews.length; i < n; i += 1) {
        const childView = childViews[i];
        if (ScaleYView.is<Y>(childView)) {
          if (childView.yScale() === void 0) {
            const yDataDomain = childView.yDataDomain();
            if (yDataDomain !== void 0) {
              if (yDataDomainMin === void 0 || +yDataDomain[0] < +yDataDomainMin) {
                yDataDomainMin = yDataDomain[0];
              }
              if (yDataDomainMax === void 0 || +yDataDomainMax < +yDataDomain[1]) {
                yDataDomainMax = yDataDomain[1];
              }
            }
          }
        }
      }
      if (yDataDomainMin !== void 0 && yDataDomainMax !== void 0) {
        yDataDomain = [yDataDomainMin, yDataDomainMax];
        this._yDataDomain = yDataDomain;
      }
    }
    return yDataDomain;
  }

  xDataDomainPadded(): readonly [X, X] | undefined {
    return this._xDataDomainPadded;
  }

  yDataDomainPadded(): readonly [Y, Y] | undefined {
    return this._yDataDomainPadded;
  }

  xDataRange(): readonly [number, number] | undefined {
    return this._xDataRange;
  }

  yDataRange(): readonly [number, number] | undefined {
    return this._yDataRange;
  }

  fitAlign(): readonly [number, number];
  fitAlign(fitAlign: readonly [number, number] | number): this;
  fitAlign(xFitAlign: number, yFitAlign: number): this;
  fitAlign(xFitAlign?: readonly [number, number] | number,
           yFitAlign?: number): readonly [number, number] | this {
    if (xFitAlign === void 0) {
      return this._fitAlign;
    } else {
      if (Array.isArray(xFitAlign)) {
        yFitAlign = xFitAlign[1] as number;
        xFitAlign = xFitAlign[0] as number;
      } else if (yFitAlign === void 0) {
        yFitAlign = xFitAlign as number;
      }
      this._fitAlign[0] = xFitAlign as number;
      this._fitAlign[1] = yFitAlign;
      return this;
    }
  }

  xFitAlign(): number;
  xFitAlign(xFitAlign: number): this;
  xFitAlign(xFitAlign?: number): number | this {
    if (xFitAlign === void 0) {
      return this._fitAlign[0];
    } else {
      this._fitAlign[0] = xFitAlign;
      return this;
    }
  }

  yFitAlign(): number;
  yFitAlign(yFitAlign: number): this;
  yFitAlign(yFitAlign?: number): number | this {
    if (yFitAlign === void 0) {
      return this._fitAlign[1];
    } else {
      this._fitAlign[1] = yFitAlign;
      return this;
    }
  }

  fitAspectRatio(): number | undefined;
  fitAspectRatio(fitAspectRatio: number | undefined): this;
  fitAspectRatio(fitAspectRatio?: number): number | undefined | this {
    if (arguments.length === 0) {
      return this._fitAspectRatio;
    } else {
      this._fitAspectRatio = fitAspectRatio;
      return this;
    }
  }

  preserveAspectRatio(): boolean;
  preserveAspectRatio(preserveAspectRatio: boolean): this;
  preserveAspectRatio(preserveAspectRatio?: boolean): boolean | this {
    if (preserveAspectRatio === void 0) {
      return (this._scaleFlags & ScaleView.PreserveAspectRatioFlag) !== 0;
    } else {
      if (preserveAspectRatio) {
        this._scaleFlags |= ScaleView.PreserveAspectRatioFlag;
      } else {
        this._scaleFlags &= ~ScaleView.PreserveAspectRatioFlag;
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
      return [(this._scaleFlags & ScaleView.XDomainTrackingFlag) !== 0,
              (this._scaleFlags & ScaleView.YDomainTrackingFlag) !== 0];
    } else {
      if (Array.isArray(xDomainTracking)) {
        yDomainTracking = xDomainTracking[1] as boolean;
        xDomainTracking = xDomainTracking[0] as boolean;
      } else if (yDomainTracking === void 0) {
        yDomainTracking = xDomainTracking as boolean;
      }
      if (xDomainTracking as boolean) {
        this._scaleFlags |= ScaleView.XDomainTrackingFlag;
      } else {
        this._scaleFlags &= ~ScaleView.XDomainTrackingFlag;
      }
      if (yDomainTracking) {
        this._scaleFlags |= ScaleView.YDomainTrackingFlag;
      } else {
        this._scaleFlags &= ~ScaleView.YDomainTrackingFlag;
      }
      return this;
    }
  }

  xDomainTracking(): boolean;
  xDomainTracking(xDomainTracking: boolean): this;
  xDomainTracking(xDomainTracking?: boolean): boolean | this {
    if (xDomainTracking === void 0) {
      return (this._scaleFlags & ScaleView.XDomainTrackingFlag) !== 0;
    } else {
      if (xDomainTracking) {
        this._scaleFlags |= ScaleView.XDomainTrackingFlag;
      } else {
        this._scaleFlags &= ~ScaleView.XDomainTrackingFlag;
      }
      return this;
    }
  }

  yDomainTracking(): boolean;
  yDomainTracking(yDomainTracking: boolean): this;
  yDomainTracking(yDomainTracking?: boolean): boolean | this {
    if (yDomainTracking === void 0) {
      return (this._scaleFlags & ScaleView.YDomainTrackingFlag) !== 0;
    } else {
      if (yDomainTracking) {
        this._scaleFlags |= ScaleView.YDomainTrackingFlag;
      } else {
        this._scaleFlags &= ~ScaleView.YDomainTrackingFlag;
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
      return [(this._scaleFlags & ScaleView.XGesturesFlag) !== 0,
              (this._scaleFlags & ScaleView.YGesturesFlag) !== 0];
    } else {
      if (Array.isArray(xGestures)) {
        yGestures = xGestures[1] as boolean;
        xGestures = xGestures[0] as boolean;
      } else if (yGestures === void 0) {
        yGestures = xGestures as boolean;
      }
      if (xGestures as boolean) {
        this._scaleFlags |= ScaleView.XGesturesFlag;
        this.didEnableXGestures();
      } else {
        this._scaleFlags &= ~ScaleView.XGesturesFlag;
        this.didDisableXGestures();
      }
      if (yGestures) {
        this._scaleFlags |= ScaleView.YGesturesFlag;
        this.didEnableYGestures();
      } else {
        this._scaleFlags &= ~ScaleView.YGesturesFlag;
        this.didDisableYGestures();
      }
      return this;
    }
  }

  xGestures(): boolean;
  xGestures(xGestures: boolean): this;
  xGestures(xGestures?: boolean): boolean | this {
    if (xGestures === void 0) {
      return (this._scaleFlags & ScaleView.XGesturesFlag) !== 0;
    } else {
      if (xGestures) {
        this._scaleFlags |= ScaleView.XGesturesFlag;
        this.didEnableXGestures();
      } else {
        this._scaleFlags &= ~ScaleView.XGesturesFlag;
        this.didDisableXGestures();
      }
      return this;
    }
  }

  yGestures(): boolean;
  yGestures(yGestures: boolean): this;
  yGestures(yGestures?: boolean): boolean | this {
    if (yGestures === void 0) {
      return (this._scaleFlags & ScaleView.YGesturesFlag) !== 0;
    } else {
      if (yGestures) {
        this._scaleFlags |= ScaleView.YGesturesFlag;
        this.didEnableYGestures();
      } else {
        this._scaleFlags &= ~ScaleView.YGesturesFlag;
        this.didDisableYGestures();
      }
      return this;
    }
  }

  protected didEnableXGestures(): void {
    if (this.scaleGesture.state === void 0) {
      this.scaleGesture(true);
    }
  }

  protected didDisableXGestures(): void {
    // hook
  }

  protected didEnableYGestures(): void {
    if (this.scaleGesture.state === void 0) {
      this.scaleGesture(true);
    }
  }

  protected didDisableYGestures(): void {
    // hook
  }

  protected createScaleGesture(): ScaleGesture<X, Y> | undefined {
    return new ScaleGesture(this, this);
  }

  @ViewScope<ScaleView<X, Y>, typeof ScaleGesture>(ScaleGesture, {
    inherit: true,
    fromAny(value: ScaleGesture<X, Y> | boolean): ScaleGesture<X, Y> | undefined {
      if (value === true) {
        return this.view.createScaleGesture();
      } else if (value === false) {
        return void 0;
      } else {
        return value;
      }
    }
  })
  scaleGesture: ViewScope<this, ScaleGesture<X, Y>, ScaleGesture<X, Y> | boolean>;

  @ViewScope(Object, {
    inherit: true,
    init(): Transition<any> {
      return Transition.duration(250, Ease.linear);
    },
  })
  rescaleTransition: ViewScope<this, Transition<any>>;

  @ViewScope(Object, {
    inherit: true,
    init(): Transition<any> {
      return Transition.duration(250, Ease.cubicOut);
    },
  })
  reboundTransition: ViewScope<this, Transition<any>>;

  @ViewAnimator(Font, {inherit: true})
  font: ViewAnimator<this, Font, AnyFont>;

  @ViewAnimator(Color, {inherit: true})
  textColor: ViewAnimator<this, Color, AnyColor>;

  xDomainInRange(): boolean {
    return (this._scaleFlags & ScaleView.XInRangeMask) === ScaleView.XInRangeMask;
  }

  xInRange(): boolean {
    return (this._scaleFlags & ScaleView.XInRangeMask) !== 0;
  }

  xMinInRange(): boolean {
    return (this._scaleFlags & ScaleView.XMinInRangeFlag) !== 0;
  }

  xMaxInRange(): boolean {
    return (this._scaleFlags & ScaleView.XMaxInRangeFlag) !== 0;
  }

  yDomainInRange(): boolean {
    return (this._scaleFlags & ScaleView.XInRangeMask) === ScaleView.YInRangeMask;
  }

  yInRange(): boolean {
    return (this._scaleFlags & ScaleView.YInRangeMask) !== 0;
  }

  yMinInRange(): boolean {
    return (this._scaleFlags & ScaleView.YMinInRangeFlag) !== 0;
  }

  yMaxInRange(): boolean {
    return (this._scaleFlags & ScaleView.YMaxInRangeFlag) !== 0;
  }

  fitX(tween: boolean = false): void {
    this._scaleFlags |= ScaleView.XFitFlag;
    if (tween === true) {
      this._scaleFlags |= ScaleView.XFitTweenFlag;
    }
    this.requireUpdate(View.NeedsAnimate);
  }

  fitY(tween: boolean = false): void {
    this._scaleFlags |= ScaleView.YFitFlag;
    if (tween === true) {
      this._scaleFlags |= ScaleView.YFitTweenFlag;
    }
    this.requireUpdate(View.NeedsAnimate);
  }

  fit(tween: boolean = false): void {
    this._scaleFlags |= ScaleView.XFitFlag | ScaleView.YFitFlag;
    if (tween === true) {
      this._scaleFlags |= ScaleView.FitTweenMask;
    }
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onPower(): void {
    super.onPower();
    this.requireUpdate(View.NeedsResize);
  }

  protected onInsertChildView(childView: View, targetView: View | null | undefined): void {
    super.onInsertChildView(childView, targetView);
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onRemoveChildView(childView: View): void {
    this.requireUpdate(View.NeedsAnimate);
    super.onRemoveChildView(childView);
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

  protected willResize(viewContext: GraphicsViewContext): void {
    super.willResize(viewContext);
    this.resizeScales(this.viewFrame);
    this._scaleFlags |= ScaleView.RescaleFlag;
  }

  /**
   * Updates own scale ranges to project onto view frame.  Infers own scales
   * from child view data domains if inherited x/y scales are undefined.
   */
  protected resizeScales(frame: BoxR2): void {
    const xRange = this.xRange();
    if (xRange !== void 0) {
      const xScale = this.xScale.ownValue;
      if (xScale !== void 0 && !Objects.equal(xScale.range(), xRange)) {
        this.xScale.setRange(xRange);
        this.requireUpdate(View.NeedsAnimate);
        this._scaleFlags |= ScaleView.RescaleFlag;
      } else if (this.xScale.value === void 0) {
        const xDataDomain = this.xDataDomain();
        if (xDataDomain !== void 0) {
          const xScale = Scale.from(xDataDomain[0], xDataDomain[1],
                                    Interpolator.between(xRange[0], xRange[1]));
          this.xScale.setState(xScale);
          this._scaleFlags |= ScaleView.XFitFlag;
        }
      }
    }

    const yRange = this.yRange();
    if (yRange !== void 0) {
      const yScale = this.yScale.ownValue;
      if (yScale !== void 0 && !Objects.equal(yScale.range(), yRange)) {
        this.yScale.setRange(yRange[1], yRange[0]);
        this.requireUpdate(View.NeedsAnimate);
        this._scaleFlags |= ScaleView.RescaleFlag;
      } else if (this.yScale.value === void 0) {
        const yDataDomain = this.yDataDomain();
        if (yDataDomain !== void 0) {
          const yScale = Scale.from(yDataDomain[0], yDataDomain[1],
                                    Interpolator.between(yRange[1], yRange[0]));
          this.yScale.setState(yScale);
          this._scaleFlags |= ScaleView.YFitFlag;
        }
      }
    }
  }

  protected didAnimate(viewContext: GraphicsViewContext): void {
    this.updateScales();
    super.didAnimate(viewContext);
  }

  protected updateScales(): void {
    let xScale = this.xScale.value;
    let yScale = this.yScale.value;
    this.updateDataBounds(xScale, yScale);

    xScale = this.xScale.ownValue;
    yScale = this.yScale.ownValue;
    if (xScale !== void 0 && yScale !== void 0) {
      this.updateOwnScales(xScale, yScale);
    }
  }

  /**
   * Computes domain and range extrema from child view scales.
   */
  protected updateDataBounds(xScale: ContinuousScale<X, number> | undefined,
                             yScale: ContinuousScale<Y, number> | undefined): void {
    let xDataDomainMin: X | undefined;
    let xDataDomainMax: X | undefined;
    let yDataDomainMin: Y | undefined;
    let yDataDomainMax: Y | undefined;
    let xDataRangeMin = Infinity;
    let xDataRangeMax = -Infinity;
    let yDataRangeMin = Infinity;
    let yDataRangeMax = -Infinity;
    const childViews = this._childViews;
    for (let i = 0, n = childViews.length; i < n; i += 1) {
      const childView = childViews[i];
      if (ScaleXView.is<X>(childView)) {
        if (childView.xScale() === xScale) {
          const xDataDomain = childView.xDataDomain();
          if (xDataDomain !== void 0) {
            if (xDataDomainMin === void 0 || +xDataDomain[0] < +xDataDomainMin) {
              xDataDomainMin = xDataDomain[0];
            }
            if (xDataDomainMax === void 0 || +xDataDomainMax < +xDataDomain[1]) {
              xDataDomainMax = xDataDomain[1];
            }
          }
          const xDataRange = childView.xDataRange();
          if (xDataRange !== void 0) {
            xDataRangeMin = Math.min(xDataRangeMin, xDataRange[0]);
            xDataRangeMax = Math.max(xDataRangeMax, xDataRange[1]);
          }
        }
      }
      if (ScaleYView.is<Y>(childView)) {
        if (childView.yScale() === yScale) {
          const yDataDomain = childView.yDataDomain();
          if (yDataDomain !== void 0) {
            if (yDataDomainMin === void 0 || +yDataDomain[0] < +yDataDomainMin) {
              yDataDomainMin = yDataDomain[0];
            }
            if (yDataDomainMax === void 0 || +yDataDomainMax < +yDataDomain[1]) {
              yDataDomainMax = yDataDomain[1];
            }
          }
          const yDataRange = childView.yDataRange();
          if (yDataRange !== void 0) {
            yDataRangeMin = Math.min(yDataRangeMin, yDataRange[0]);
            yDataRangeMax = Math.max(yDataRangeMax, yDataRange[1]);
          }
        }
      }
    }

    if (xDataDomainMin !== void 0 && xDataDomainMax !== void 0 &&
        yDataDomainMin !== void 0 && yDataDomainMax !== void 0 &&
        isFinite(xDataRangeMin) && isFinite(xDataRangeMax) &&
        isFinite(yDataRangeMin) && isFinite(yDataRangeMax)) {
      let xDataDomain = this._xDataDomain;
      if (xDataDomain === void 0) {
        xDataDomain = [xDataDomainMin, xDataDomainMax];
        this._xDataDomain = xDataDomain;
        this._scaleFlags |= ScaleView.XChangingMask;
      } else {
        if (+xDataDomain[0] !== +xDataDomainMin) {
          xDataDomain[0] = xDataDomainMin;
          this._scaleFlags |= ScaleView.XMinChangingFlag;
        }
        if (+xDataDomain[1] !== +xDataDomainMax) {
          xDataDomain[1] = xDataDomainMax;
          this._scaleFlags |= ScaleView.XMaxChangingFlag;
        }
      }
      let yDataDomain = this._yDataDomain;
      if (yDataDomain === void 0) {
        yDataDomain = [yDataDomainMin, yDataDomainMax];
        this._yDataDomain = yDataDomain;
        this._scaleFlags |= ScaleView.YChangingMask;
      } else {
        if (+yDataDomain[0] !== +yDataDomainMin) {
          yDataDomain[0] = yDataDomainMin;
          this._scaleFlags |= ScaleView.YMinChangingFlag;
        }
        if (+yDataDomain[1] !== +yDataDomainMax) {
          yDataDomain[1] = yDataDomainMax;
          this._scaleFlags |= ScaleView.YMaxChangingFlag;
        }
      }

      let xDataRange = this._xDataRange;
      if (xDataRange === void 0) {
        xDataRange = [xDataRangeMin, xDataRangeMax];
        this._xDataRange = xDataRange;
      } else {
        xDataRange[0] = xDataRangeMin;
        xDataRange[1] = xDataRangeMax;
      }
      let yDataRange = this._yDataRange;
      if (yDataRange === void 0) {
        yDataRange = [yDataRangeMin, yDataRangeMax];
        this._yDataRange = yDataRange;
      } else {
        yDataRange[0] = yDataRangeMin;
        yDataRange[1] = yDataRangeMax;
      }

      const xDomainPadding = this._xDomainPadding;
      let xDataDomainPaddedMin: X;
      if (typeof xDomainPadding[0] !== "boolean") {
        xDataDomainPaddedMin = (+xDataDomainMin - +xDomainPadding[0]) as unknown as X;
      } else {
        xDataDomainPaddedMin = xDataDomainMin;
      }
      let xDataDomainPaddedMax: X;
      if (typeof xDomainPadding[1] !== "boolean") {
        xDataDomainPaddedMax = (+xDataDomainMax + +xDomainPadding[1]) as unknown as X;
      } else {
        xDataDomainPaddedMax = xDataDomainMax;
      }
      let xDataDomainPadded = this._xDataDomainPadded;
      if (xDataDomainPadded === void 0) {
        xDataDomainPadded = [xDataDomainPaddedMin, xDataDomainPaddedMax];
        this._xDataDomainPadded = xDataDomainPadded;
        this._scaleFlags |= ScaleView.XChangingMask;
      } else {
        if (+xDataDomainPadded[0] !== +xDataDomainPaddedMin) {
          xDataDomainPadded[0] = xDataDomainPaddedMin;
          this._scaleFlags |= ScaleView.XMinChangingFlag;
        }
        if (+xDataDomainPadded[1] !== +xDataDomainPaddedMax) {
          xDataDomainPadded[1] = xDataDomainPaddedMax;
          this._scaleFlags |= ScaleView.XMaxChangingFlag;
        }
      }

      const yDomainPadding = this._yDomainPadding;
      let yDataDomainPaddedMin: Y;
      if (typeof yDomainPadding[0] !== "boolean") {
        yDataDomainPaddedMin = (+yDataDomainMin - +yDomainPadding[0]) as unknown as Y;
      } else {
        yDataDomainPaddedMin = yDataDomainMin;
      }
      let yDataDomainPaddedMax: Y;
      if (typeof yDomainPadding[1] !== "boolean") {
        yDataDomainPaddedMax = (+yDataDomainMax + +yDomainPadding[1]) as unknown as Y;
      } else {
        yDataDomainPaddedMax = yDataDomainMax;
      }
      let yDataDomainPadded = this._yDataDomainPadded;
      if (yDataDomainPadded === void 0) {
        yDataDomainPadded = [yDataDomainPaddedMin, yDataDomainPaddedMax];
        this._yDataDomainPadded = yDataDomainPadded;
        this._scaleFlags |= ScaleView.YChangingMask;
      } else {
        if (+yDataDomainPadded[0] !== +yDataDomainPaddedMin) {
          yDataDomainPadded[0] = yDataDomainPaddedMin;
          this._scaleFlags |= ScaleView.YMinChangingFlag;
        }
        if (+yDataDomainPadded[1] !== +yDataDomainPaddedMax) {
          yDataDomainPadded[1] = yDataDomainPaddedMax;
          this._scaleFlags |= ScaleView.YMaxChangingFlag;
        }
      }
    } else {
      this._xDataDomain = void 0;
      this._yDataDomain = void 0;
      this._xDataDomainPadded = void 0;
      this._yDataDomainPadded = void 0;
      this._xDataRange = void 0;
      this._yDataRange = void 0;
    }
  }

  protected updateOwnScales(xScale: ContinuousScale<X, number>,
                            yScale: ContinuousScale<Y, number>): void {
    if ((this._scaleFlags & ScaleView.FitMask) !== 0) {
      this.fitScales(xScale, yScale);
    }

    xScale = this.xScale.ownValue!;
    yScale = this.yScale.ownValue!;
    this.boundScales(xScale, yScale);
  }

  /**
   * Fits scales to domains, and corrects aspect ratio.
   */
  protected fitScales(oldXScale: ContinuousScale<X, number>, oldYScale: ContinuousScale<Y, number>): void {
    const xDataDomain = this._xDataDomain;
    let oldXDomain: readonly [X, X] | undefined;
    let newXDomain: readonly [X, X] | undefined;
    if (xDataDomain !== void 0 && (this._scaleFlags & ScaleView.XFitFlag) !== 0) {
      oldXDomain = oldXScale.domain();
      if (+oldXDomain[0] !== +xDataDomain[0] ||
          +oldXDomain[1] !== +xDataDomain[1]) {
        newXDomain = xDataDomain;
      }
    }

    const yDataDomain = this._yDataDomain;
    let oldYDomain: readonly [Y, Y] | undefined;
    let newYDomain: readonly [Y, Y] | undefined;
    if (yDataDomain !== void 0 && (this._scaleFlags & ScaleView.YFitFlag) !== 0) {
      oldYDomain = oldYScale.domain();
      if (+oldYDomain[0] !== +yDataDomain[0] ||
          +oldYDomain[1] !== +yDataDomain[1]) {
        newYDomain = yDataDomain;
      }
    }

    const fitAspectRatio = this._fitAspectRatio;
    if (fitAspectRatio !== void 0) {
      const xDomain = newXDomain !== void 0 ? newXDomain : oldXScale.domain();
      const yDomain = newYDomain !== void 0 ? newYDomain : oldYScale.domain();
      const xRange = oldXScale.range();
      const yRange = oldYScale.range();
      const oldDomainWidth = +xDomain[1] - +xDomain[0];
      const oldDomainHeight = +yDomain[1] - +yDomain[0];
      const domainAspectRatio = oldDomainWidth / oldDomainHeight;
      const rangeAspectRatio = (xRange[1] - xRange[0]) / (yRange[0] - yRange[1]);
      const anamorphicAspectRatio = Math.abs(fitAspectRatio * rangeAspectRatio);
      if (Math.abs(domainAspectRatio - anamorphicAspectRatio) > 1e-12) {
        const fitAlign = this._fitAlign;
        if (fitAspectRatio < 0 && domainAspectRatio < anamorphicAspectRatio ||
            fitAspectRatio > 0 && domainAspectRatio > anamorphicAspectRatio) {
          const newDomainWidth = oldDomainHeight * anamorphicAspectRatio;
          const dx = newDomainWidth - oldDomainWidth;
          newXDomain = [+xDomain[0] - dx * fitAlign[0] as unknown as X,
                        +xDomain[1] + dx * (1 - fitAlign[0]) as unknown as X];
        } else {
          const newDomainHeight = oldDomainWidth / anamorphicAspectRatio;
          const dy = newDomainHeight - oldDomainHeight;
          newYDomain = [+yDomain[0] - dy * fitAlign[1] as unknown as Y,
                        +yDomain[1] + dy * (1 - fitAlign[1]) as unknown as Y];
        }
      }
    }

    if (xDataDomain !== void 0) {
      const xDomain = newXDomain !== void 0 ? newXDomain :
                      oldXDomain !== void 0 ? oldXDomain :
                      (oldXDomain = oldXScale.domain(), oldXDomain);
      const xDomainBounds = this._xDomainBounds;
      const xDomainMin = typeof xDomainBounds[0] === "boolean" ? xDataDomain[0] : xDomainBounds[0];
      const xDomainMax = typeof xDomainBounds[1] === "boolean" ? xDataDomain[1] : xDomainBounds[1];
      if (+xDomain[0] - 1e-12 <= +xDomainMin + 1e-12) {
        this._scaleFlags |= ScaleView.XMinInRangeFlag;
      }
      if (+xDomainMax - 1e-12 <= +xDomain[1] + 1e-12) {
        this._scaleFlags |= ScaleView.XMaxInRangeFlag;
      }
    }

    if (yDataDomain !== void 0) {
      const yDomain = newYDomain !== void 0 ? newYDomain :
                      oldYDomain !== void 0 ? oldYDomain :
                      (oldYDomain = oldYScale.domain(), oldYDomain);
      const yDomainBounds = this._yDomainBounds;
      const yDomainMin = typeof yDomainBounds[0] === "boolean" ? yDataDomain[0] : yDomainBounds[0];
      const yDomainMax = typeof yDomainBounds[1] === "boolean" ? yDataDomain[1] : yDomainBounds[1];
      if (+yDomain[0] - 1e-12 <= +yDomainMin + 1e-12) {
        this._scaleFlags |= ScaleView.YMinInRangeFlag;
      }
      if (+yDomainMax - 1e-12 <= +yDomain[1] + 1e-12) {
        this._scaleFlags |= ScaleView.YMaxInRangeFlag;
      }
    }

    if (newXDomain !== void 0) {
      let transition: Transition<any> | undefined;
      if ((this._scaleFlags & ScaleView.XFitTweenFlag) !== 0 &&
          (transition = this.rescaleTransition.state, transition !== void 0)) {
        transition = transition.observer({
          onBegin: this.onBeginFittingXScale,
          onEnd: this.onEndFittingXScale,
          onInterrupt: this.onInterruptFittingXScale,
        });
      }
      this.willFitX(oldXScale);
      this.xDomain(newXDomain, transition);
      this.requireUpdate(View.NeedsLayout);
      this._scaleFlags &= ~ScaleView.XFitFlag;
      if (transition === void 0) {
        this.didFitX(this.xScale.state!);
      }
    }

    if (newYDomain !== void 0) {
      let transition: Transition<any> | undefined;
      if ((this._scaleFlags & ScaleView.YFitTweenFlag) !== 0 &&
          (transition = this.rescaleTransition.state, transition !== void 0)) {
        transition = transition.observer({
          onBegin: this.onBeginFittingYScale,
          onEnd: this.onEndFittingYScale,
          onInterrupt: this.onInterruptFittingYScale,
        });
      }
      this.willFitY(oldYScale);
      this.yDomain(newYDomain, transition);
      this.requireUpdate(View.NeedsLayout);
      this._scaleFlags &= ~ScaleView.YFitFlag;
      if (transition === void 0) {
        this.didFitY(this.yScale.state!);
      }
    }

    this._scaleFlags &= ~(ScaleView.FitMask | ScaleView.FitTweenMask);
  }

  protected onBeginFittingXScale(xScale: ContinuousScale<X, number>): void {
    this._scaleFlags |= ScaleView.XFittingFlag;
  }

  protected onEndFittingXScale(xScale: ContinuousScale<X, number>): void {
    this._scaleFlags &= ~ScaleView.XFittingFlag;
    this.didFitX(xScale);
  }

  protected onInterruptFittingXScale(xScale: ContinuousScale<X, number>): void {
    this._scaleFlags &= ~ScaleView.XFittingFlag;
    this.didFitX(xScale);
  }

  protected onBeginFittingYScale(yScale: ContinuousScale<Y, number>): void {
    this._scaleFlags |= ScaleView.YFittingFlag;
  }

  protected onEndFittingYScale(yScale: ContinuousScale<Y, number>): void {
    this._scaleFlags &= ~ScaleView.YFittingFlag;
    this.didFitY(yScale);
  }

  protected onInterruptFittingYScale(yScale: ContinuousScale<Y, number>): void {
    this._scaleFlags &= ~ScaleView.YFittingFlag;
    this.didFitY(yScale);
  }

  protected willFitX(xScale: ContinuousScale<X, number>): void {
    // hook
  }

  protected didFitX(xScale: ContinuousScale<X, number>): void {
    // hook
  }

  protected willFitY(yScale: ContinuousScale<Y, number>): void {
    // hook
  }

  protected didFitY(yScale: ContinuousScale<Y, number>): void {
    // hook
  }

  /**
   * Clamps scales to domain bounds, and corrects aspect ratio.
   */
  protected boundScales(oldXScale: ContinuousScale<X, number>,
                        oldYScale: ContinuousScale<Y, number>): void {
    const scaleGesture = this.scaleGesture.state;
    const isPressing = scaleGesture !== void 0 && scaleGesture._pressCount !== 0;
    const isCoasting = scaleGesture !== void 0 && scaleGesture._coastCount !== 0;
    this._scaleFlags &= ~ScaleView.ClampedMask;

    const xDataDomainPadded = this._xDataDomainPadded;
    let xZoomMin: number | boolean | null = this._xZoomBounds[0];
    let xZoomMax: number | boolean | null = this._xZoomBounds[1];
    if (xZoomMin === true) {
      if (oldXScale instanceof LinearScale) {
        xZoomMin = ScaleView.LinearZoomMin;
      } else if (oldXScale instanceof TimeScale) {
        xZoomMin = ScaleView.TimeZoomMin;
      } else {
        xZoomMin = null;
      }
    } else if (xZoomMin === false) {
      xZoomMin = null;
    }
    if (xZoomMax === true) {
      if (oldXScale instanceof LinearScale) {
        xZoomMax = ScaleView.LinearZoomMax;
      } else if (oldXScale instanceof TimeScale) {
        xZoomMax = ScaleView.TimeZoomMax;
      } else {
        xZoomMax = null;
      }
    } else if (xZoomMax === false) {
      xZoomMax = null;
    }
    const oldXDomain = oldXScale.domain();
    const xDomainBounds = this._xDomainBounds;
    const xDomainPadded = xDataDomainPadded !== void 0 ? xDataDomainPadded : oldXDomain;
    const xDomainMin = xDomainBounds[0] === false ? null
                     : xDomainBounds[0] === true ? xDomainPadded[0]
                     : xDomainBounds[0];
    const xDomainMax = xDomainBounds[1] === false ? null
                     : xDomainBounds[1] === true ? xDomainPadded[1]
                     : xDomainBounds[1];
    const xDomainClamped = oldXScale.clampDomain(xDomainMin, xDomainMax,
                                                 xZoomMin, xZoomMax).domain();
    let newXDomain: readonly [X, X] | undefined;
    if (Math.abs(+oldXDomain[0] - +xDomainClamped[0]) >= 1e-12 ||
        Math.abs(+oldXDomain[1] - +xDomainClamped[1]) >= 1e-12) {
      newXDomain = xDomainClamped;
      if (Math.abs((+oldXDomain[1] - +oldXDomain[0]) - (+newXDomain[1] - +newXDomain[0])) >= 1e-12) {
        this._scaleFlags |= ScaleView.XClampedFlag;
      }
    }

    const yDataDomainPadded = this._yDataDomainPadded;
    let yZoomMin: number | boolean | null = this._yZoomBounds[0];
    let yZoomMax: number | boolean | null = this._yZoomBounds[1];
    if (yZoomMin === true) {
      if (oldYScale instanceof LinearScale) {
        yZoomMin = ScaleView.LinearZoomMin;
      } else if (oldYScale instanceof TimeScale) {
        yZoomMin = ScaleView.TimeZoomMin;
      } else {
        yZoomMin = null;
      }
    } else if (yZoomMin === false) {
      yZoomMin = null;
    }
    if (yZoomMax === true) {
      if (oldYScale instanceof LinearScale) {
        yZoomMax = ScaleView.LinearZoomMax;
      } else if (oldYScale instanceof TimeScale) {
        yZoomMax = ScaleView.TimeZoomMax;
      } else {
        yZoomMax = null;
      }
    } else if (yZoomMax === false) {
      yZoomMax = null;
    }
    const oldYDomain = oldYScale.domain();
    const yDomainBounds = this._yDomainBounds;
    const yDomainPadded = yDataDomainPadded !== void 0 ? yDataDomainPadded : oldYDomain;
    const yDomainMin = yDomainBounds[0] === false ? null
                     : yDomainBounds[0] === true ? yDomainPadded[0]
                     : yDomainBounds[0];
    const yDomainMax = yDomainBounds[1] === false ? null
                     : yDomainBounds[1] === true ? yDomainPadded[1]
                     : yDomainBounds[1];
    const yDomainClamped = oldYScale.clampDomain(yDomainMin, yDomainMax,
                                                 yZoomMin, yZoomMax).domain();
    let newYDomain: readonly [Y, Y] | undefined;
    if (Math.abs(+oldYDomain[0] - +yDomainClamped[0]) >= 1e-12 ||
        Math.abs(+oldYDomain[1] - +yDomainClamped[1]) >= 1e-12) {
      newYDomain = yDomainClamped;
      if (Math.abs((+oldYDomain[1] - +oldYDomain[0]) - (+newYDomain[1] - +newYDomain[0])) >= 1e-12) {
        this._scaleFlags |= ScaleView.YClampedFlag;
      }
    }

    const xDataDomain = this._xDataDomain;
    if (xDataDomain !== void 0 && !isPressing && !isCoasting &&
        (this._scaleFlags & ScaleView.XDomainTrackingFlag) !== 0 &&
        ((this._scaleFlags & ScaleView.XMinReboundMask) === ScaleView.XMinReboundMask ||
         (this._scaleFlags & ScaleView.XMaxReboundMask) === ScaleView.XMaxReboundMask)) {
      const xDomain = newXDomain !== void 0 ? newXDomain : oldXDomain;
      let xDomainMin: X;
      let xDomainMax: X;
      if ((this._scaleFlags & ScaleView.XInRangeMask) === ScaleView.XInRangeMask) {
        xDomainMin = xDataDomain[0];
        xDomainMax = xDataDomain[1];
      } else {
        const xDomainWidth = +xDomain[1] - +xDomain[0] as unknown as X;
        if ((this._scaleFlags & ScaleView.XMinReboundMask) === ScaleView.XMinReboundMask) {
          xDomainMin = xDataDomain[0];
          xDomainMax = +xDataDomain[0] + +xDomainWidth as unknown as X;
        } else {
          xDomainMin = +xDataDomain[1] - +xDomainWidth as unknown as X;
          xDomainMax = xDataDomain[1];
        }
      }
      if (Math.abs(+xDomain[0] - +xDomainMin) >= 1e-12 ||
          Math.abs(+xDomain[1] - +xDomainMax) >= 1e-12) {
        newXDomain = [xDomainMin, xDomainMax];
      }
    }

    const yDataDomain = this._yDataDomain;
    if (yDataDomain !== void 0 && !isPressing && !isCoasting &&
        (this._scaleFlags & ScaleView.YDomainTrackingFlag) !== 0 &&
        ((this._scaleFlags & ScaleView.YMinReboundMask) === ScaleView.YMinReboundMask ||
         (this._scaleFlags & ScaleView.YMaxReboundMask) === ScaleView.YMaxReboundMask)) {
      const yDomain = newYDomain !== void 0 ? newYDomain : oldYDomain;
      let yDomainMin: Y;
      let yDomainMax: Y;
      if ((this._scaleFlags & ScaleView.YInRangeMask) === ScaleView.YInRangeMask) {
        yDomainMin = yDataDomain[0];
        yDomainMax = yDataDomain[1];
      } else {
        const yDomainHeight = +yDomain[1] - +yDomain[0] as unknown as Y;
        if ((this._scaleFlags & ScaleView.YMinReboundMask) === ScaleView.YMinReboundMask) {
          yDomainMin = yDataDomain[0];
          yDomainMax = +yDataDomain[0] + +yDomainHeight as unknown as Y;
        } else {
          yDomainMin = +yDataDomain[1] - +yDomainHeight as unknown as Y;
          yDomainMax = yDataDomain[1];
        }
      }
      if (Math.abs(+yDomain[0] - +yDomainMin) >= 1e-12 ||
          Math.abs(+yDomain[1] - +yDomainMax) >= 1e-12) {
        newYDomain = [yDomainMin, yDomainMax];
      }
    }

    const fitAspectRatio = this._fitAspectRatio;
    if (fitAspectRatio !== void 0 && (this._scaleFlags & ScaleView.PreserveAspectRatioFlag) !== 0 &&
        (newXDomain !== void 0 || newYDomain !== void 0 || (this._scaleFlags & ScaleView.RescaleFlag) !== 0)) {
      const xDomain = newXDomain !== void 0 ? newXDomain : oldXDomain;
      const yDomain = newYDomain !== void 0 ? newYDomain : oldYDomain;
      const xRange = oldXScale.range();
      const yRange = oldYScale.range();
      const oldDomainWidth = +xDomain[1] - +xDomain[0];
      const oldDomainHeight = +yDomain[1] - +yDomain[0];
      const domainAspectRatio = oldDomainWidth / oldDomainHeight;
      const rangeAspectRatio = (xRange[1] - xRange[0]) / (yRange[0] - yRange[1]);
      const anamorphicAspectRatio = Math.abs(fitAspectRatio * rangeAspectRatio);
      if (Math.abs(domainAspectRatio - anamorphicAspectRatio) >= 1e-12 ||
          (this._scaleFlags & ScaleView.RescaleFlag) !== 0) {
        const fitAlign = this._fitAlign;
        if (fitAspectRatio < 0 && domainAspectRatio < anamorphicAspectRatio) {
          const newDomainWidth = oldDomainHeight * anamorphicAspectRatio;
          const dx = newDomainWidth - oldDomainWidth;
          newXDomain = [+xDomain[0] - dx * fitAlign[0] as unknown as X,
                        +xDomain[1] + dx * (1 - fitAlign[0]) as unknown as X];
        } else {
          const newDomainHeight = oldDomainWidth / anamorphicAspectRatio;
          const dy = newDomainHeight - oldDomainHeight;
          newYDomain = [+yDomain[0] - dy * fitAlign[1] as unknown as Y,
                        +yDomain[1] + dy * (1 - fitAlign[1]) as unknown as Y];
        }
      }
    }

    if (!isPressing && !isCoasting && (this._scaleFlags & (ScaleView.XTweeningMask)) === 0) {
      const xDataDomain = this._xDataDomain;
      if (xDataDomain !== void 0) {
        const xDomain = newXDomain !== void 0 ? newXDomain : oldXDomain;
        const xDomainBounds = this._xDomainBounds;
        const xDomainMin = typeof xDomainBounds[0] === "boolean" ? xDataDomain[0] : xDomainBounds[0];
        const xDomainMax = typeof xDomainBounds[1] === "boolean" ? xDataDomain[1] : xDomainBounds[1];
        if (+xDomain[0] - 1e-12 <= +xDomainMin + 1e-12) {
          this._scaleFlags |= ScaleView.XMinInRangeFlag;
        } else {
          this._scaleFlags &= ~ScaleView.XMinInRangeFlag;
        }
        if (+xDomainMax - 1e-12 <= +xDomain[1] + 1e-12) {
          this._scaleFlags |= ScaleView.XMaxInRangeFlag;
        } else {
          this._scaleFlags &= ~ScaleView.XMaxInRangeFlag;
        }
      } else {
        this._scaleFlags &= ~ScaleView.XInRangeMask;
      }
    }

    if (!isPressing && !isCoasting && (this._scaleFlags & (ScaleView.YTweeningMask)) === 0) {
      const yDataDomain = this._yDataDomain;
      if (yDataDomain !== void 0) {
        const yDomain = newYDomain !== void 0 ? newYDomain : oldYDomain;
        const yDomainBounds = this._yDomainBounds;
        const yDomainMin = typeof yDomainBounds[0] === "boolean" ? yDataDomain[0] : yDomainBounds[0];
        const yDomainMax = typeof yDomainBounds[1] === "boolean" ? yDataDomain[1] : yDomainBounds[1];
        if (+yDomain[0] - 1e-12 <= +yDomainMin + 1e-12) {
          this._scaleFlags |= ScaleView.YMinInRangeFlag;
        } else {
          this._scaleFlags &= ~ScaleView.YMinInRangeFlag;
        }
        if (+yDomainMax - 1e-12 <= +yDomain[1] + 1e-12) {
          this._scaleFlags |= ScaleView.YMaxInRangeFlag;
        } else {
          this._scaleFlags &= ~ScaleView.YMaxInRangeFlag;
        }
      } else {
        this._scaleFlags &= ~ScaleView.YInRangeMask;
      }
    }

    if (newXDomain !== void 0 && !isPressing && (this._scaleFlags & ScaleView.XTweeningMask) === 0 &&
        (Math.abs(+newXDomain[0] - +oldXDomain[0]) >= 1e-12 ||
         Math.abs(+newXDomain[1] - +oldXDomain[1]) >= 1e-12)) {
      let transition: Transition<any> | undefined;
      if ((this._scaleFlags & (ScaleView.XBoundingFlag | ScaleView.RescaleFlag)) === 0) {
        transition = (this._scaleFlags & ScaleView.InteractingMask) !== 0
                   ? this.reboundTransition.state : this.rescaleTransition.state;
        if (transition !== void 0) {
          transition = transition.observer({
            onBegin: this.onBeginBoundingXScale,
            onEnd: this.onEndBoundingXScale,
            onInterrupt: this.onInterruptBoundingXScale,
          });
        }
      }
      this.willReboundX(oldXScale);
      this.xDomain(newXDomain, transition);
      this.requireUpdate(View.NeedsLayout);
      if (transition === void 0) {
        this.didReboundX(this.xScale.state!);
      }
    }

    if (newYDomain !== void 0 && !isPressing && (this._scaleFlags & ScaleView.YTweeningMask) === 0 &&
        (Math.abs(+newYDomain[0] - +oldYDomain[0]) >= 1e-12 ||
         Math.abs(+newYDomain[1] - +oldYDomain[1]) >= 1e-12)) {
      let transition: Transition<any> | undefined;
      if ((this._scaleFlags & (ScaleView.YBoundingFlag | ScaleView.RescaleFlag)) === 0) {
        transition = (this._scaleFlags & ScaleView.InteractingMask) !== 0
                   ? this.reboundTransition.state : this.rescaleTransition.state;
        if (transition !== void 0) {
          transition = transition.observer({
            onBegin: this.onBeginBoundingYScale,
            onEnd: this.onEndBoundingYScale,
            onInterrupt: this.onInterruptBoundingYScale,
          });
        }
      }
      this.willReboundY(oldYScale);
      this.yDomain(newYDomain, transition);
      this.requireUpdate(View.NeedsLayout);
      if (transition === void 0) {
        this.didReboundY(this.yScale.state!);
      }
    }

    if ((this._scaleFlags & ScaleView.XBoundingFlag) === 0) {
      this._scaleFlags &= ~ScaleView.XChangingMask;
    }
    if ((this._scaleFlags & ScaleView.YBoundingFlag) === 0) {
      this._scaleFlags &= ~ScaleView.YChangingMask;
    }
    this._scaleFlags &= ~(ScaleView.InteractedFlag | ScaleView.RescaleFlag);
  }

  protected onBeginBoundingXScale(xScale: ContinuousScale<X, number>): void {
    this._scaleFlags |= ScaleView.XBoundingFlag;
  }

  protected onEndBoundingXScale(xScale: ContinuousScale<X, number>): void {
    this._scaleFlags &= ~ScaleView.XBoundingFlag;
    this.didReboundX(xScale);
  }

  protected onInterruptBoundingXScale(xScale: ContinuousScale<X, number>): void {
    this._scaleFlags &= ~ScaleView.XBoundingFlag;
    this.didReboundX(xScale);
  }

  protected onBeginBoundingYScale(yScale: ContinuousScale<Y, number>): void {
    this._scaleFlags |= ScaleView.YBoundingFlag;
  }

  protected onEndBoundingYScale(yScale: ContinuousScale<Y, number>): void {
    this._scaleFlags &= ~ScaleView.YBoundingFlag;
    this.didReboundY(yScale);
  }

  protected onInterruptBoundingYScale(yScale: ContinuousScale<Y, number>): void {
    this._scaleFlags &= ~ScaleView.YBoundingFlag;
    this.didReboundY(yScale);
  }

  protected willReboundX(xScale: ContinuousScale<X, number>): void {
    const scaleGesture = this.scaleGesture.state;
    if (scaleGesture !== void 0) {
      scaleGesture.neutralizeX();
    }
  }

  protected didReboundX(xScale: ContinuousScale<X, number>): void {
    // hook
  }

  protected willReboundY(yScale: ContinuousScale<Y, number>): void {
    const scaleGesture = this.scaleGesture.state;
    if (scaleGesture !== void 0) {
      scaleGesture.neutralizeY();
    }
  }

  protected didReboundY(yScale: ContinuousScale<Y, number>): void {
    // hook
  }

  willStartInteracting(): void {
    this._scaleFlags |= ScaleView.InteractingFlag;
  }

  didStopInteracting(): void {
    this._scaleFlags = this._scaleFlags & ~ScaleView.InteractingFlag | ScaleView.InteractedFlag;
  }

  didStopPressing(): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  willBeginCoast(input: ScaleGestureInput<X, Y>, event: Event | null): boolean | void {
    if ((this._scaleFlags & ScaleView.XGesturesFlag) === 0) {
      input.disableX = true;
      input.vx = 0;
      input.ax = 0;
    }
    if ((this._scaleFlags & ScaleView.YGesturesFlag) === 0) {
      input.disableY = true;
      input.vy = 0;
      input.ay = 0;
    }
  }

  protected onUpdateXScale(xScale: ContinuousScale<X, number> | undefined): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  protected onUpdateYScale(yScale: ContinuousScale<X, number> | undefined): void {
    this.requireUpdate(View.NeedsAnimate);
  }

  /** @hidden */
  static readonly PreserveAspectRatioFlag: ScaleFlags = 1 << 0;
  /** @hidden */
  static readonly XDomainTrackingFlag: ScaleFlags = 1 << 1;
  /** @hidden */
  static readonly YDomainTrackingFlag: ScaleFlags = 1 << 2;
  /** @hidden */
  static readonly XGesturesFlag: ScaleFlags = 1 << 3;
  /** @hidden */
  static readonly YGesturesFlag: ScaleFlags = 1 << 4;
  /** @hidden */
  static readonly XMinInRangeFlag: ScaleFlags = 1 << 5;
  /** @hidden */
  static readonly XMaxInRangeFlag: ScaleFlags = 1 << 6;
  /** @hidden */
  static readonly YMinInRangeFlag: ScaleFlags = 1 << 7;
  /** @hidden */
  static readonly YMaxInRangeFlag: ScaleFlags = 1 << 8;
  /** @hidden */
  static readonly XMinChangingFlag: ScaleFlags = 1 << 9;
  /** @hidden */
  static readonly XMaxChangingFlag: ScaleFlags = 1 << 10;
  /** @hidden */
  static readonly YMinChangingFlag: ScaleFlags = 1 << 11;
  /** @hidden */
  static readonly YMaxChangingFlag: ScaleFlags = 1 << 12;
  /** @hidden */
  static readonly InteractingFlag: ScaleFlags = 1 << 13;
  /** @hidden */
  static readonly InteractedFlag: ScaleFlags = 1 << 14;
  /** @hidden */
  static readonly XFittingFlag: ScaleFlags = 1 << 15;
  /** @hidden */
  static readonly YFittingFlag: ScaleFlags = 1 << 16;
  /** @hidden */
  static readonly XBoundingFlag: ScaleFlags = 1 << 17;
  /** @hidden */
  static readonly YBoundingFlag: ScaleFlags = 1 << 18;
  /** @hidden */
  static readonly XClampedFlag: ScaleFlags = 1 << 19;
  /** @hidden */
  static readonly YClampedFlag: ScaleFlags = 1 << 20;
  /** @hidden */
  static readonly XFitFlag: ScaleFlags = 1 << 21;
  /** @hidden */
  static readonly YFitFlag: ScaleFlags = 1 << 22;
  /** @hidden */
  static readonly XFitTweenFlag: ScaleFlags = 1 << 23;
  /** @hidden */
  static readonly YFitTweenFlag: ScaleFlags = 1 << 24;
  /** @hidden */
  static readonly RescaleFlag: ScaleFlags = 1 << 25;

  /** @hidden */
  static readonly DomainTrackingMask: ScaleFlags = ScaleView.XDomainTrackingFlag
                                                 | ScaleView.YDomainTrackingFlag;
  /** @hidden */
  static readonly GesturesMask: ScaleFlags = ScaleView.XGesturesFlag
                                           | ScaleView.YGesturesFlag;
  /** @hidden */
  static readonly XInRangeMask: ScaleFlags = ScaleView.XMinInRangeFlag
                                           | ScaleView.XMaxInRangeFlag;
  /** @hidden */
  static readonly YInRangeMask: ScaleFlags = ScaleView.YMinInRangeFlag
                                           | ScaleView.YMaxInRangeFlag;
  /** @hidden */
  static readonly XChangingMask: ScaleFlags = ScaleView.XMinChangingFlag
                                            | ScaleView.XMaxChangingFlag;
  /** @hidden */
  static readonly YChangingMask: ScaleFlags = ScaleView.YMinChangingFlag
                                            | ScaleView.YMaxChangingFlag;
  /** @hidden */
  static readonly ChangingMask: ScaleFlags = ScaleView.XChangingMask
                                           | ScaleView.YChangingMask;
  /** @hidden */
  static readonly XMinReboundMask: ScaleFlags = ScaleView.XMinInRangeFlag
                                              | ScaleView.XMinChangingFlag;
  /** @hidden */
  static readonly XMaxReboundMask: ScaleFlags = ScaleView.XMaxInRangeFlag
                                              | ScaleView.XMaxChangingFlag;
  /** @hidden */
  static readonly YMinReboundMask: ScaleFlags = ScaleView.YMinInRangeFlag
                                              | ScaleView.YMinChangingFlag;
  /** @hidden */
  static readonly YMaxReboundMask: ScaleFlags = ScaleView.YMaxInRangeFlag
                                              | ScaleView.YMaxChangingFlag;
  /** @hidden */
  static readonly XReboundMask: ScaleFlags = ScaleView.XMinReboundMask
                                           | ScaleView.XMaxReboundMask;
  /** @hidden */
  static readonly YReboundMask: ScaleFlags = ScaleView.YMinReboundMask
                                           | ScaleView.YMaxReboundMask;
  /** @hidden */
  static readonly InteractingMask: ScaleFlags = ScaleView.InteractingFlag
                                              | ScaleView.InteractedFlag;
  /** @hidden */
  static readonly FittingMask: ScaleFlags = ScaleView.XFittingFlag
                                          | ScaleView.YFittingFlag;
  /** @hidden */
  static readonly BoundingMask: ScaleFlags = ScaleView.XBoundingFlag
                                           | ScaleView.YBoundingFlag;
  /** @hidden */
  static readonly ClampedMask: ScaleFlags = ScaleView.XClampedFlag
                                          | ScaleView.YClampedFlag;
  /** @hidden */
  static readonly FitMask: ScaleFlags = ScaleView.XFitFlag
                                      | ScaleView.YFitFlag;
  /** @hidden */
  static readonly FitTweenMask: ScaleFlags = ScaleView.XFitTweenFlag
                                           | ScaleView.YFitTweenFlag;
  /** @hidden */
  static readonly XTweeningMask: ScaleFlags = ScaleView.XBoundingFlag
                                            | ScaleView.XFittingFlag;
  /** @hidden */
  static readonly YTweeningMask: ScaleFlags = ScaleView.YBoundingFlag
                                            | ScaleView.YFittingFlag;
  /** @hidden */
  static readonly TweeningMask: ScaleFlags = ScaleView.XTweeningMask
                                           | ScaleView.YTweeningMask;

  /** @hidden */
  static LinearZoomMin: number = 1000000;
  /** @hidden */
  static LinearZoomMax: number = 0.001;
  /** @hidden */
  static TimeZoomMin: number = 86400000;
  /** @hidden */
  static TimeZoomMax: number = 1;

  /** @hidden */
  static init<X, Y>(view: ScaleView<X, Y>, init: ScaleViewInit<X, Y>): void {
    if (init.xScale !== void 0) {
      view.xScale(init.xScale);
    }
    if (init.yScale !== void 0) {
      view.yScale(init.yScale);
    }

    if (init.xDomainBounds !== void 0) {
      view.xDomainBounds(init.xDomainBounds);
    }
    if (init.yDomainBounds !== void 0) {
      view.yDomainBounds(init.yDomainBounds);
    }
    if (init.xZoomBounds !== void 0) {
      view.xZoomBounds(init.xZoomBounds);
    }
    if (init.yZoomBounds !== void 0) {
      view.yZoomBounds(init.yZoomBounds);
    }

    if (init.xDomainPadding !== void 0) {
      view.xDomainPadding(init.xDomainPadding);
    }
    if (init.yDomainPadding !== void 0) {
      view.yDomainPadding(init.yDomainPadding);
    }
    if (init.xRangePadding !== void 0) {
      view.xRangePadding(init.xRangePadding);
    }
    if (init.yRangePadding !== void 0) {
      view.yRangePadding(init.yRangePadding);
    }

    if (init.fitAlign !== void 0) {
      view.fitAlign(init.fitAlign);
    }
    if (init.xFitAlign !== void 0) {
      view.xFitAlign(init.xFitAlign);
    }
    if (init.yFitAlign !== void 0) {
      view.yFitAlign(init.yFitAlign);
    }
    if (init.fitAspectRatio !== void 0) {
      view.fitAspectRatio(init.fitAspectRatio);
    }
    if (init.preserveAspectRatio !== void 0) {
      view.preserveAspectRatio(init.preserveAspectRatio);
    }

    if (init.domainTracking !== void 0) {
      view.domainTracking(init.domainTracking);
    }
    if (init.xDomainTracking !== void 0) {
      view.xDomainTracking(init.xDomainTracking);
    }
    if (init.yDomainTracking !== void 0) {
      view.yDomainTracking(init.yDomainTracking);
    }

    if (init.gestures !== void 0) {
      view.gestures(init.gestures);
    }
    if (init.xGestures !== void 0) {
      view.xGestures(init.xGestures);
    }
    if (init.yGestures !== void 0) {
      view.yGestures(init.yGestures);
    }

    if (init.scaleGesture !== void 0) {
      view.scaleGesture.setState(init.scaleGesture);
      init.scaleGesture.setView(view);
    }
    if (init.rescaleTransition !== void 0) {
      view.rescaleTransition.setState(Transition.fromAny(init.rescaleTransition));
    }
    if (init.reboundTransition !== void 0) {
      view.reboundTransition.setState(Transition.fromAny(init.reboundTransition));
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
}
