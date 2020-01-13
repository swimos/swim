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

import {Interpolator} from "@swim/interpolate";
import {ContinuousScale} from "./ContinuousScale";
import {LinearScale} from "./LinearScale";
import {TimeScale} from "./TimeScale";
import {LinearScaleInterpolator} from "./LinearScaleInterpolator";
import {TimeScaleInterpolator} from "./TimeScaleInterpolator";

export abstract class ScaleInterpolator<D extends DU, R extends RU, DU = D, RU = R, S extends ContinuousScale<D, R, DU, RU> = ContinuousScale<D, R, DU, RU>> extends Interpolator<S, ContinuousScale<D, R, DU, RU>> {
  range(): S[];
  range(ss: ReadonlyArray<ContinuousScale<D, R, DU, RU>>): ScaleInterpolator<D, R, DU, RU, S>;
  range(s0: ContinuousScale<D, R, DU, RU>, s1?: ContinuousScale<D, R, DU, RU>): ScaleInterpolator<D, R, DU, RU, S>;
  range(s0?: ReadonlyArray<ContinuousScale<D, R, DU, RU>> | ContinuousScale<D, R, DU, RU>,
        s1?: ContinuousScale<D, R, DU, RU>): S[] | ScaleInterpolator<D, R, DU, RU, S> {
    if (s0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (s1 === void 0) {
      s0 = s0 as ReadonlyArray<ContinuousScale<D, R, DU, RU>>;
      return Interpolator.scale(s0[0], s0[1]) as ScaleInterpolator<D, R, DU, RU, S>;
    } else {
      s0 = s0 as ContinuousScale<D, R, DU, RU>;
      return Interpolator.scale(s0, s1) as ScaleInterpolator<D, R, DU, RU, S>;
    }
  }

  static scale<D extends DU, R extends RU, DU = D, RU = R>(s0?: ContinuousScale<D, R, DU, RU>, s1?: ContinuousScale<D, R, DU, RU>): ScaleInterpolator<D, R, DU, RU> {
    if (!s0 && !s1) {
      throw new Error();
    } else if (!s1) {
      s1 = s0;
    } else if (!s0) {
      s0 = s1;
    }
    if (s0 instanceof LinearScale && s1 instanceof LinearScale) {
      return new ScaleInterpolator.Linear(s0, s1) as any as ScaleInterpolator<D, R, DU, RU>;
    } else if (s0 instanceof TimeScale && s1 instanceof TimeScale) {
      return new ScaleInterpolator.Time(s0, s1) as any as ScaleInterpolator<D, R, DU, RU>;
    } else {
      throw new TypeError(s0 + ", " + s1);
    }
  }

  // Forward type declarations
  /** @hidden */
  static Linear: typeof LinearScaleInterpolator; // defined by LinearScaleInterpolator
  /** @hidden */
  static Time: typeof TimeScaleInterpolator; // defined by TimeScaleInterpolator
}
Interpolator.scale = ScaleInterpolator.scale;

const InterpolatorFrom = Interpolator.from;
Interpolator.from = function <T extends U, U = T>(a?: U, b?: U): Interpolator<T, U> {
  if (a instanceof ContinuousScale || b instanceof ContinuousScale) {
    return Interpolator.scale(a as any, b as any) as any as Interpolator<T, U>;
  } else {
    return InterpolatorFrom(a, b);
  }
};
