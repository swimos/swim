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
import {ColorStop} from "./ColorStop";
import {ColorStopInterpolator} from "./ColorStopInterpolator";
import {AnyLinearGradient, LinearGradientAngle, LinearGradientInit, LinearGradient} from "./LinearGradient";

export class LinearGradientInterpolator extends Interpolator<LinearGradient, AnyLinearGradient> {
  /** @hidden */
  readonly angle: Interpolator<LinearGradientAngle>;
  /** @hidden */
  readonly stops: ReadonlyArray<ColorStopInterpolator>;

  constructor(g0: LinearGradient, g1: LinearGradient) {
    super();
    this.angle = Interpolator.between(g0._angle, g1._angle);
    const stops0 = g0._stops;
    const stops1 = g1._stops;
    const stopCount = Math.min(stops0.length, stops1.length);
    const interpolators = new Array<ColorStopInterpolator>(stopCount);
    for (let i = 0; i < stopCount; i += 1) {
      interpolators[i] = ColorStopInterpolator.between(stops0[i], stops1[i]);
    }
    this.stops = interpolators;
  }

  interpolate(u: number): LinearGradient {
    const angle = this.angle.interpolate(u);
    const interpolators = this.stops;
    const interpolatorCount = interpolators.length;
    const stops = new Array<ColorStop>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      stops[i] = interpolators[i].interpolate(u);
    }
    return new LinearGradient(angle, stops);
  }

  deinterpolate(b: AnyLinearGradient): number {
    return 0; // not implemented
  }

  range(): readonly [LinearGradient, LinearGradient];
  range(gs: readonly [LinearGradient | LinearGradientInit, LinearGradient | LinearGradientInit]): LinearGradientInterpolator;
  range(g0: LinearGradient | LinearGradientInit, g1: LinearGradient | LinearGradientInit): LinearGradientInterpolator;
  range(gs: readonly [AnyLinearGradient, AnyLinearGradient]): Interpolator<LinearGradient, AnyLinearGradient>;
  range(g0: AnyLinearGradient, g1: AnyLinearGradient): Interpolator<LinearGradient, AnyLinearGradient>;
  range(g0?: readonly [AnyLinearGradient, AnyLinearGradient] | AnyLinearGradient,
        g1?: AnyLinearGradient): readonly [LinearGradient, LinearGradient] | Interpolator<LinearGradient, AnyLinearGradient> {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      g0 = g0 as readonly [AnyLinearGradient, AnyLinearGradient];
      return LinearGradientInterpolator.between(g0[0], g0[1]);
    } else {
      return LinearGradientInterpolator.between(g0 as AnyLinearGradient, g1 as AnyLinearGradient);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LinearGradientInterpolator) {
      return this.angle.equals(that.angle)
          && Objects.equal(this.stops, that.stops);
    }
    return false;
  }

  static between(g0: LinearGradient | LinearGradientInit, g1: LinearGradient | LinearGradientInit): LinearGradientInterpolator;
  static between(g0: AnyLinearGradient, g1: AnyLinearGradient): Interpolator<LinearGradient, AnyLinearGradient>;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof LinearGradient && b instanceof LinearGradient) {
      return new LinearGradientInterpolator(a, b);
    } else if (LinearGradient.isAny(a) && LinearGradient.isAny(b)) {
      return new LinearGradientInterpolator(LinearGradient.fromAny(a), LinearGradient.fromAny(b));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): LinearGradientInterpolator | null {
    if (a instanceof LinearGradient && b instanceof LinearGradient) {
      return new LinearGradientInterpolator(a, b);
    }
    return null;
  }
}
Interpolator.registerFactory(LinearGradientInterpolator);
