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
import {Length} from "@swim/length";
import {Color} from "@swim/color";
import {AnyColorStop, ColorStopInit, ColorStopTuple, ColorStop} from "./ColorStop";

export class ColorStopInterpolator extends Interpolator<ColorStop, AnyColorStop> {
  /** @hidden */
  readonly color: Interpolator<Color>;
  /** @hidden */
  readonly stop: Interpolator<Length | null>;
  /** @hidden */
  readonly hint: Interpolator<Length | null>;

  constructor(s0: ColorStop, s1: ColorStop) {
    super();
    this.color = Interpolator.between(s0._color, s1._color);
    this.stop = Interpolator.between(s0._stop, s1._stop);
    this.hint = Interpolator.between(s0._hint, s1._hint);
  }

  interpolate(u: number): ColorStop {
    const color = this.color.interpolate(u);
    const stop = this.stop.interpolate(u);
    const hint = this.hint.interpolate(u);
    return new ColorStop(color, stop, hint);
  }

  deinterpolate(b: AnyColorStop): number {
    return 0; // not implemented
  }

  range(): readonly [ColorStop, ColorStop];
  range(ss: readonly [ColorStop | ColorStopInit | ColorStopTuple, ColorStop | ColorStopInit | ColorStopTuple]): ColorStopInterpolator;
  range(s0: ColorStop | ColorStopInit | ColorStopTuple, s1: ColorStop | ColorStopInit | ColorStopTuple): ColorStopInterpolator;
  range(ss: readonly [AnyColorStop, AnyColorStop]): Interpolator<ColorStop, AnyColorStop>;
  range(s0: AnyColorStop, s1: AnyColorStop): Interpolator<ColorStop, AnyColorStop>;
  range(s0?: readonly [AnyColorStop, AnyColorStop] | AnyColorStop,
        s1?: AnyColorStop): readonly [ColorStop, ColorStop] | Interpolator<ColorStop, AnyColorStop> {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      s0 = s0 as readonly [AnyColorStop, AnyColorStop];
      return ColorStopInterpolator.between(s0[0], s0[1]);
    } else {
      return ColorStopInterpolator.between(s0 as AnyColorStop, s1 as AnyColorStop);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColorStopInterpolator) {
      return this.color.equals(that.color)
          && this.stop.equals(that.stop)
          && this.hint.equals(that.hint);
    }
    return false;
  }

  static between(s0: ColorStop | ColorStopInit | ColorStopTuple, s1: ColorStop | ColorStopInit | ColorStopTuple): ColorStopInterpolator;
  static between(s0: AnyColorStop, s1: AnyColorStop): Interpolator<ColorStop, AnyColorStop>;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof ColorStop && b instanceof ColorStop) {
      return new ColorStopInterpolator(a, b);
    } else if (ColorStop.isAny(a) && ColorStop.isAny(b)) {
      return new ColorStopInterpolator(ColorStop.fromAny(a), ColorStop.fromAny(b));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): ColorStopInterpolator | null {
    if (a instanceof ColorStop && b instanceof ColorStop) {
      return new ColorStopInterpolator(a, b);
    }
    return null;
  }
}
Interpolator.registerFactory(ColorStopInterpolator);
