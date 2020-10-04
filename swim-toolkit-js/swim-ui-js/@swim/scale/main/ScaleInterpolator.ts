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

import {Interpolator} from "@swim/interpolate";
import {ContinuousScale} from "./ContinuousScale";
import {LinearScale} from "./LinearScale";
import {TimeScale} from "./TimeScale";
import {LinearScaleInterpolator} from "./LinearScaleInterpolator";
import {TimeScaleInterpolator} from "./TimeScaleInterpolator";

export abstract class ScaleInterpolator<D extends DU, R extends RU, DU = D, RU = R, S extends ContinuousScale<D, R, DU, RU> = ContinuousScale<D, R, DU, RU>> extends Interpolator<S, ContinuousScale<D, R, DU, RU>> {
  range(): readonly [S, S];
  range(ss: readonly [ContinuousScale<D, R, DU, RU>, ContinuousScale<D, R, DU, RU>]): ScaleInterpolator<D, R, DU, RU, S>;
  range(s0: ContinuousScale<D, R, DU, RU>, s1: ContinuousScale<D, R, DU, RU>): ScaleInterpolator<D, R, DU, RU, S>;
  range(s0?: readonly [ContinuousScale<D, R, DU, RU>, ContinuousScale<D, R, DU, RU>] | ContinuousScale<D, R, DU, RU>,
        s1?: ContinuousScale<D, R, DU, RU>): readonly [S, S] | ScaleInterpolator<D, R, DU, RU, S> {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      s0 = s0 as readonly [ContinuousScale<D, R, DU, RU>, ContinuousScale<D, R, DU, RU>];
      return ScaleInterpolator.between(s0[0], s0[1]) as ScaleInterpolator<D, R, DU, RU, S>;
    } else {
      return ScaleInterpolator.between(s0 as ContinuousScale<D, R, DU, RU>, s1 as ContinuousScale<D, R, DU, RU>) as ScaleInterpolator<D, R, DU, RU, S>;
    }
  }

  static between<D extends DU, R extends RU, DU = D, RU = R>(s0: ContinuousScale<D, R, DU, RU>, s1: ContinuousScale<D, R, DU, RU>): ScaleInterpolator<D, R, DU, RU>;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof LinearScale && b instanceof LinearScale) {
      return new ScaleInterpolator.Linear(a, b);
    } else if (a instanceof TimeScale && b instanceof TimeScale) {
      return new ScaleInterpolator.Time(a, b);
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): ScaleInterpolator<any, any> | null {
    if (a instanceof LinearScale && b instanceof LinearScale) {
      return new ScaleInterpolator.Linear(a, b);
    } else if (a instanceof TimeScale && b instanceof TimeScale) {
      return new ScaleInterpolator.Time(a, b);
    }
    return null;
  }

  // Forward type declarations
  /** @hidden */
  static Linear: typeof LinearScaleInterpolator; // defined by LinearScaleInterpolator
  /** @hidden */
  static Time: typeof TimeScaleInterpolator; // defined by TimeScaleInterpolator
}
Interpolator.registerFactory(ScaleInterpolator);
