// Copyright 2015-2024 Nstream, inc.
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

import type {LikeType} from "@swim/util";
import {Domain} from "@swim/util";
import {Range} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {ContinuousScale} from "@swim/util";
import type {DateTimeLike} from "@swim/time";
import {DateTime} from "@swim/time";
import {TimeDomain} from "@swim/time";
import {Affinity} from "@swim/component";
import type {AnimatorClass} from "@swim/component";
import {Animator} from "@swim/component";
import type {View} from "@swim/view";
import {ScaledView} from "./"; // forward import

/** @public */
export interface ContinuousScaleAnimator<R extends View = View, X = unknown, Y = unknown, T extends ContinuousScale<X, Y> | null | undefined = ContinuousScale<X, Y> | null, I extends any[] = [T]> extends Animator<R, T, I> {
  setScale(domain: Domain<X> | string, range: Range<Y>, timing?: TimingLike | boolean | null): void;
  setScale(xMin: X, xMax: X, yMin: Y, yMax: Y, timing?: TimingLike | boolean | null): void;

  setDomain(domain: Domain<X> | string, timing?: TimingLike | boolean | null): void;
  setDomain(xMin: X, xMax: X, timing?: TimingLike | boolean | null): void;

  setRange(range: Range<Y>, timing?: TimingLike | boolean | null): void;
  setRange(yMin: Y, yMax: Y, timing?: TimingLike | boolean | null): void;

  setBaseScale(domain: Domain<X> | string, range: Range<Y>, timing?: TimingLike | boolean | null): void;
  setBaseScale(xMin: X, xMax: X, yMin: Y, yMax: Y, timing?: TimingLike | boolean | null): void;

  setBaseDomain(domain: Domain<X> | string, timing?: TimingLike | boolean | null): void;
  setBaseDomain(xMin: X, xMax: X, timing?: TimingLike | boolean | null): void;

  setBaseRange(range: Range<Y>, timing?: TimingLike | boolean | null): void;
  setBaseRange(yMin: Y, yMax: Y, timing?: TimingLike | boolean | null): void;

  createDomain(xMin: X, xMax: X): Domain<X>;

  /** @override */
  fromLike(value: T | LikeType<T>): T;
}

/** @public */
export const ContinuousScaleAnimator = (<R extends View, X, Y, T extends ContinuousScale<X, Y> | null | undefined, I extends any[], A extends ContinuousScaleAnimator<any, any, any, any, any>>() => Animator.extend<ContinuousScaleAnimator<R, X, Y, T, I>, AnimatorClass<A>>("ContinuousScaleAnimator", {
  valueType: ContinuousScale,

  setScale(xMin?: Domain<X> | X | string, xMax?: Range<Y> | X, yMin?: Y | TimingLike | boolean | null, yMax?: Y, timing?: TimingLike | boolean | null): void {
    if (typeof xMin === "string") {
      xMin = ScaledView.parseScale<X, Y>(xMin).domain;
    }
    if (xMin instanceof Domain) {
      timing = yMin as TimingLike | boolean | null;
      if (xMax instanceof Domain) {
        yMax = (xMax as Domain<Y>)[1];
        yMin = (xMax as Domain<Y>)[0];
      }
      xMax = (xMin as Domain<X>)[1];
      xMin = (xMin as Domain<X>)[0];
    }
    const oldState = this.state;
    let newState: NonNullable<T>;
    if (oldState === void 0 || oldState === null) {
      newState = ScaledView.createScale(xMin as X, xMax as X, yMin as Y, yMax as Y) as NonNullable<T>;
    } else {
      newState = oldState.withDomain(xMin as X, xMax as X) as NonNullable<T>;
      if (yMin !== void 0 && yMax !== void 0) {
        newState = newState.overRange(yMin as Y, yMax) as NonNullable<T>;
      }
      if ((timing === void 0 || timing === null || timing === false) && (this.flags & Animator.TweeningFlag) !== 0) {
        const oldValue = this.getValue();
        const newValue = oldValue.withDomain(xMin as X, xMax as X) as NonNullable<T>;
        this.setValue(newValue, Affinity.Extrinsic);
        timing = true;
      }
    }
    this.setState(newState, timing, Affinity.Extrinsic);
  },

  setDomain(xMin?: Domain<X> | X | string, xMax?: X | TimingLike | boolean | null, timing?: TimingLike | boolean | null): void {
    if (typeof xMin === "string") {
      xMin = ScaledView.parseScale<X, Y>(xMin).domain;
    }
    if (xMin instanceof Domain) {
      timing = xMax as TimingLike | boolean | null;
      xMax = (xMin as Domain<X>)[1];
      xMin = (xMin as Domain<X>)[0];
    }
    const oldState = this.state;
    let newState: NonNullable<T>;
    if (oldState === void 0 || oldState === null) {
      newState = ScaledView.createScale(xMin as X, xMax as X, 0 as unknown as Y, 1 as unknown as Y) as NonNullable<T>;
    } else {
      newState = oldState.withDomain(xMin as X, xMax as X) as NonNullable<T>;
      if ((timing === void 0 || timing === null || timing === false) && (this.flags & Animator.TweeningFlag) !== 0) {
        const oldValue = this.getValue();
        const newValue = oldValue.withDomain(xMin as X, xMax as X) as NonNullable<T>;
        this.setValue(newValue, Affinity.Extrinsic);
        timing = true;
      }
    }
    this.setState(newState, timing, Affinity.Extrinsic);
  },

  setRange(yMin?: Range<Y> | Y, yMax?: Y | TimingLike | boolean | null, timing?: TimingLike | boolean | null): void {
    const oldState = this.state;
    if (oldState === void 0 || oldState === null) {
      return;
    }
    if (yMin instanceof Range) {
      timing = yMax as TimingLike | boolean | null;
      yMax = (yMin as Range<Y>)[1];
      yMin = (yMin as Range<Y>)[0];
    }
    const newState = oldState.overRange(yMin as Y, yMax as Y) as NonNullable<T>;
    if ((timing === void 0 || timing === null || timing === false) && (this.flags & Animator.TweeningFlag) !== 0) {
      const oldValue = this.getValue();
      const newValue = oldValue.overRange(yMin as Y, yMax as Y) as NonNullable<T>;
      this.setValue(newValue, Affinity.Extrinsic);
      timing = true;
    }
    this.setState(newState, timing, Affinity.Extrinsic);
  },

  setBaseScale(xMin?: Domain<X> | X | string, xMax?: Range<Y> | X, yMin?: Y | TimingLike | boolean | null, yMax?: Y, timing?: TimingLike | boolean | null): void {
    if (this.derived && this.inlet instanceof ContinuousScaleAnimator) {
      this.inlet.setBaseScale(xMin as any, xMax as any, yMin as any, yMax as any, timing);
    } else {
      this.setScale(xMin as any, xMax as any, yMin as any, yMax as any, timing);
    }
  },

  setBaseDomain(xMin?: Domain<X> | X | string, xMax?: X | TimingLike | boolean | null, timing?: TimingLike | boolean | null): void {
    if (this.derived && this.inlet instanceof ContinuousScaleAnimator) {
      this.inlet.setBaseDomain(xMin as any, xMax as any, timing);
    } else {
      this.setDomain(xMin as any, xMax as any, timing);
    }
  },

  setBaseRange(yMin?: Range<Y> | Y, yMax?: Y | TimingLike | boolean | null, timing?: TimingLike | boolean | null): void {
    if (this.derived && this.inlet instanceof ContinuousScaleAnimator) {
      this.inlet.setBaseRange(yMin as any, yMax as any, timing);
    } else {
      this.setRange(yMin as any, yMax as any, timing);
    }
  },

  createDomain(xMin: X, xMax: X): Domain<X> {
    if (xMin instanceof DateTime || xMax instanceof DateTime) {
      return TimeDomain(DateTime.fromLike(xMin as DateTimeLike), DateTime.fromLike(xMax as DateTimeLike)) as unknown as Domain<X>;
    }
    return Domain(xMin, xMax);
  },

  fromLike(value: T | LikeType<T>): T {
    if (typeof value === "string") {
      return ScaledView.parseScale(value) as T;
    }
    return value as T;
  },
}))();
