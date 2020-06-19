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

import {__extends} from "tslib";
import {Interpolator} from "@swim/interpolate";
import {Scale, ContinuousScale} from "@swim/scale";
import {Transition, Tween} from "@swim/transition";
import {TweenState} from "@swim/animate";
import {StyleValue} from "@swim/style";
import {View} from "../View";
import {ViewAnimatorDescriptor, ViewAnimator} from "./ViewAnimator";

/** @hidden */
export interface ContinuousScaleViewAnimatorClass {
  new<V extends View, X, Y>(view: V, animatorName: string, descriptor?: ViewAnimatorDescriptor<V, ContinuousScale<X, Y>, ContinuousScale<X, Y> | string>): ContinuousScaleViewAnimator<V, X, Y>;
}

/** @hidden */
export interface ContinuousScaleViewAnimator<V extends View, X, Y> extends ViewAnimator<V, ContinuousScale<X, Y>, ContinuousScale<X, Y> | string> {
  setScale(domain: readonly [X, X] | string, range: readonly [Y, Y], tween?: Tween<ContinuousScale<X, Y>>): void;
  setScale(xMin: X, xMax: X, yMin: Y, yMax: Y, tween?: Tween<ContinuousScale<X, Y>>): void;

  setDomain(domain: readonly [X, X] | string, tween?: Tween<ContinuousScale<X, Y>>): void;
  setDomain(xMin: X, xMax: X, tween?: Tween<ContinuousScale<X, Y>>): void;

  setRange(range: readonly [Y, Y], tween?: Tween<ContinuousScale<X, Y>>): void;
  setRange(yMin: Y, yMax: Y, tween?: Tween<ContinuousScale<X, Y>>): void;

  setBaseScale(domain: readonly [X, X] | string, range: readonly [Y, Y], tween?: Tween<ContinuousScale<X, Y>>): void;
  setBaseScale(xMin: X, xMax: X, yMin: Y, yMax: Y, tween?: Tween<ContinuousScale<X, Y>>): void;

  setBaseDomain(domain: readonly [X, X] | string, tween?: Tween<ContinuousScale<X, Y>>): void;
  setBaseDomain(xMin: X, xMax: X, tween?: Tween<ContinuousScale<X, Y>>): void;

  setBaseRange(range: readonly [Y, Y], tween?: Tween<ContinuousScale<X, Y>>): void;
  setBaseRange(yMin: Y, yMax: Y, tween?: Tween<ContinuousScale<X, Y>>): void;
}

/** @hidden */
export const ContinuousScaleViewAnimator: ContinuousScaleViewAnimatorClass = (function (_super: typeof ViewAnimator): ContinuousScaleViewAnimatorClass {
  const ContinuousScaleViewAnimator: ContinuousScaleViewAnimatorClass = function <V extends View, X, Y>(
      this: ContinuousScaleViewAnimator<V, X, Y>, view: V, animatorName: string | undefined,
      descriptor?: ViewAnimatorDescriptor<V, ContinuousScale<X, Y>, ContinuousScale<X, Y> | string>): ContinuousScaleViewAnimator<V, X, Y> {
    let _this: ContinuousScaleViewAnimator<V, X, Y> = function accessor(value?: ContinuousScale<X, Y> | string, tween?: Tween<ContinuousScale<X, Y>>): ContinuousScale<X, Y> | undefined | V {
      if (arguments.length === 0) {
        return _this.value;
      } else {
        _this.setState(value, tween);
        return _this._view;
      }
    } as ContinuousScaleViewAnimator<V, X, Y>;
    (_this as any).__proto__ = this;
    _this = _super.call(_this, view, animatorName, descriptor) || _this;
    return _this;
  } as unknown as ContinuousScaleViewAnimatorClass;
  __extends(ContinuousScaleViewAnimator, _super);

  ContinuousScaleViewAnimator.prototype.setScale = function <X, Y>(this: ContinuousScaleViewAnimator<View, X, Y>,
                                                                   xMin?: readonly [X, X] | X | string,
                                                                   xMax?: readonly [Y, Y] | X,
                                                                   yMin?: Y | Tween<ContinuousScale<X, Y>>,
                                                                   yMax?: Y,
                                                                   tween?: Tween<ContinuousScale<X, Y>>): void {
    if (typeof xMin === "string") {
      xMin = StyleValue.parseScale<X, Y>(xMin).domain();
    }
    if (Array.isArray(xMin)) {
      tween = yMin as Tween<ContinuousScale<X, Y>>;
      if (Array.isArray(xMax)) {
        yMax = (xMax as readonly [Y, Y])[1];
        yMin = (xMax as readonly [Y, Y])[0];
      }
      xMax = (xMin as readonly [X, X])[1];
      xMin = (xMin as readonly [X, X])[0];
    }
    const oldState = this.state;
    let newState: ContinuousScale<X, Y>;
    if (oldState !== void 0) {
      newState = oldState.domain(xMin as X, xMax as X);
      if (yMin !== void 0 && yMax !== void 0) {
        newState = newState.range(yMin as Y, yMax);
      }
      if ((tween === void 0 || tween === null || tween === false) && this._tweenState === TweenState.Tracking) {
        const oldValue = this.value!;
        const newValue = oldValue.domain(xMin as X, xMax as X);
        const duration = this._duration - this._beginTime;
        tween = Transition.duration(duration, void 0, Interpolator.between(newValue, newState));
      }
    } else {
      newState = Scale.from(xMin as X, xMax as X, Interpolator.between(yMin as Y, yMax as Y));
    }
    this._auto = false;
    _super.prototype.setState.call(this, newState, tween);
  };

  ContinuousScaleViewAnimator.prototype.setDomain = function <X, Y>(this: ContinuousScaleViewAnimator<View, X, Y>,
                                                                    xMin?: readonly [X, X] | X | string,
                                                                    xMax?: X | Tween<ContinuousScale<X, Y>>,
                                                                    tween?: Tween<ContinuousScale<X, Y>>): void {
    if (typeof xMin === "string") {
      xMin = StyleValue.parseScale<X, Y>(xMin).domain();
    }
    if (Array.isArray(xMin)) {
      tween = xMax as Tween<ContinuousScale<X, Y>>;
      xMax = (xMin as readonly [X, X])[1];
      xMin = (xMin as readonly [X, X])[0];
    }
    const oldState = this.state;
    let newState: ContinuousScale<X, Y>;
    if (oldState !== void 0) {
      newState = oldState.domain(xMin as X, xMax as X);
      if ((tween === void 0 || tween === null || tween === false) && this._tweenState === TweenState.Tracking) {
        const oldValue = this.value!;
        const newValue = oldValue.domain(xMin as X, xMax as X);
        const duration = this._duration - this._beginTime;
        tween = Transition.duration(duration, void 0, Interpolator.between(newValue, newState));
      }
    } else {
      newState = Scale.from(xMin as X, xMax as X, Interpolator.between(void 0 as unknown as Y, void 0 as unknown as Y));
    }
    this._auto = false;
    _super.prototype.setState.call(this, newState, tween);
  };

  ContinuousScaleViewAnimator.prototype.setRange = function <X, Y>(this: ContinuousScaleViewAnimator<View, X, Y>,
                                                                   yMin?: readonly [Y, Y] | Y,
                                                                   yMax?: Y | Tween<ContinuousScale<X, Y>>,
                                                                   tween?: Tween<ContinuousScale<X, Y>>): void {
    const oldState = this.state;
    if (oldState !== void 0) {
      if (Array.isArray(yMin)) {
        tween = yMax as Tween<ContinuousScale<X, Y>>;
        yMax = (yMin as readonly [Y, Y])[1];
        yMin = (yMin as readonly [Y, Y])[0];
      }
      const newState = oldState.range(yMin as Y, yMax as Y);
      if ((tween === void 0 || tween === null || tween === false) && this._tweenState === TweenState.Tracking) {
        const oldValue = this.value!;
        const newValue = oldValue.range(yMin as Y, yMax as Y);
        const duration = this._duration - this._beginTime;
        tween = Transition.duration(duration, void 0, Interpolator.between(newValue, newState));
      }
      this._auto = false;
      _super.prototype.setState.call(this, newState, tween);
    }
  };

  ContinuousScaleViewAnimator.prototype.setBaseScale = function <X, Y>(this: ContinuousScaleViewAnimator<View, X, Y>,
                                                                       xMin?: readonly [X, X] | X | string,
                                                                       xMax?: readonly [Y, Y] | X,
                                                                       yMin?: Y | Tween<ContinuousScale<X, Y>>,
                                                                       yMax?: Y,
                                                                       tween?: Tween<ContinuousScale<X, Y>>): void {
    let superAnimator: ViewAnimator<View, ContinuousScale<X, Y>> | null | undefined;
    if (this._value === void 0 && (superAnimator = this.superAnimator, superAnimator instanceof ContinuousScaleViewAnimator)) {
      superAnimator.setBaseScale(xMin as any, xMax as any, yMin as any, yMax as any, tween);
    } else {
      this.setScale(xMin as any, xMax as any, yMin as any, yMax as any, tween);
    }
  };

  ContinuousScaleViewAnimator.prototype.setBaseDomain = function <X, Y>(this: ContinuousScaleViewAnimator<View, X, Y>,
                                                                        xMin?: readonly [X, X] | X | string,
                                                                        xMax?: X | Tween<ContinuousScale<X, Y>>,
                                                                        tween?: Tween<ContinuousScale<X, Y>>): void {
    let superAnimator: ViewAnimator<View, ContinuousScale<X, Y>> | null | undefined;
    if (this._value === void 0 && (superAnimator = this.superAnimator, superAnimator instanceof ContinuousScaleViewAnimator)) {
      superAnimator.setBaseDomain(xMin as any, xMax as any, tween);
    } else {
      this.setDomain(xMin as any, xMax as any, tween);
    }
  };

  ContinuousScaleViewAnimator.prototype.setBaseRange = function <X, Y>(this: ContinuousScaleViewAnimator<View, X, Y>,
                                                                       yMin?: readonly [Y, Y] | Y,
                                                                       yMax?: Y | Tween<ContinuousScale<X, Y>>,
                                                                       tween?: Tween<ContinuousScale<X, Y>>): void {
    let superAnimator: ViewAnimator<View, ContinuousScale<X, Y>> | null | undefined;
    if (this._value === void 0 && (superAnimator = this.superAnimator, superAnimator instanceof ContinuousScaleViewAnimator)) {
      superAnimator.setBaseRange(yMin as any, yMax as any, tween);
    } else {
      this.setRange(yMin as any, yMax as any, tween);
    }
  };

  ContinuousScaleViewAnimator.prototype.fromAny = function <X, Y>(this: ContinuousScaleViewAnimator<View, X, Y>, value: ContinuousScale<X, Y> | string): ContinuousScale<X, Y> {
    if (typeof value === "string") {
      value = StyleValue.parseScale(value);
    }
    return value;
  };

  return ContinuousScaleViewAnimator;
}(ViewAnimator));
ViewAnimator.ContinuousScale = ContinuousScaleViewAnimator;
