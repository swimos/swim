// Copyright 2015-2022 Swim.inc
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

import {Mutable, Interpolator} from "@swim/util";
import type {Length} from "@swim/math";
import type {Color} from "../color/Color";
import {ColorStop} from "./ColorStop";

/** @internal */
export interface ColorStopInterpolator extends Interpolator<ColorStop> {
  /** @internal */
  readonly colorInterpolator: Interpolator<Color>;
  /** @internal */
  readonly stopInterpolator: Interpolator<Length | null>;
  /** @internal */
  readonly hintInterpolator: Interpolator<Length | null>;

  readonly 0: ColorStop;

  readonly 1: ColorStop;

  equals(that: unknown): boolean;
}

/** @internal */
export const ColorStopInterpolator = (function (_super: typeof Interpolator) {
  const ColorStopInterpolator = function (y0: ColorStop, y1: ColorStop): ColorStopInterpolator {
    const interpolator = function (u: number): ColorStop {
      const color = interpolator.colorInterpolator(u);
      const stop = interpolator.stopInterpolator(u);
      const hint = interpolator.hintInterpolator(u);
      return new ColorStop(color, stop, hint);
    } as ColorStopInterpolator;
    Object.setPrototypeOf(interpolator, ColorStopInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).colorInterpolator = y0.color.interpolateTo(y1.color);
    (interpolator as Mutable<typeof interpolator>).stopInterpolator = Interpolator(y0.stop, y1.stop);
    (interpolator as Mutable<typeof interpolator>).hintInterpolator = Interpolator(y0.hint, y1.hint);
    return interpolator;
  } as {
    (y0: ColorStop, y1: ColorStop): ColorStopInterpolator;

    /** @internal */
    prototype: ColorStopInterpolator;
  };

  ColorStopInterpolator.prototype = Object.create(_super.prototype);
  ColorStopInterpolator.prototype.constructor = ColorStopInterpolator;

  Object.defineProperty(ColorStopInterpolator.prototype, 0, {
    get(this: ColorStopInterpolator): ColorStop {
      const color = this.colorInterpolator[0];
      const stop = this.stopInterpolator[0];
      const hint = this.hintInterpolator[0];
      return new ColorStop(color, stop, hint);
    },
    configurable: true,
  });

  Object.defineProperty(ColorStopInterpolator.prototype, 1, {
    get(this: ColorStopInterpolator): ColorStop {
      const color = this.colorInterpolator[1];
      const stop = this.stopInterpolator[1];
      const hint = this.hintInterpolator[1];
      return new ColorStop(color, stop, hint);
    },
    configurable: true,
  });

  ColorStopInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ColorStopInterpolator) {
      return this.colorInterpolator.equals(that.colorInterpolator)
          && this.stopInterpolator.equals(that.stopInterpolator)
          && this.hintInterpolator.equals(that.hintInterpolator);
    }
    return false;
  };

  return ColorStopInterpolator;
})(Interpolator);
