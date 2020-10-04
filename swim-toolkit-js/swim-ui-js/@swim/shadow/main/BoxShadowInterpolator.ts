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
import {AnyBoxShadow, BoxShadowArray, BoxShadowInit, BoxShadow} from "./BoxShadow";

export class BoxShadowInterpolator extends Interpolator<BoxShadow, AnyBoxShadow> {
  /** @hidden */
  readonly inset: Interpolator<boolean>;
  /** @hidden */
  readonly offsetX: Interpolator<Length>;
  /** @hidden */
  readonly offsetY: Interpolator<Length>;
  /** @hidden */
  readonly blurRadius: Interpolator<Length>;
  /** @hidden */
  readonly spreadRadius: Interpolator<Length>;
  /** @hidden */
  readonly color: Interpolator<Color>;
  /** @hidden */
  readonly next: Interpolator<BoxShadow | null>;

  constructor(b0: BoxShadow, b1: BoxShadow) {
    super();
    this.inset = Interpolator.between(b0._inset, b1._inset);
    this.offsetX = Interpolator.between(b0._offsetX, b1._offsetX);
    this.offsetY = Interpolator.between(b0._offsetY, b1._offsetY);
    this.blurRadius = Interpolator.between(b0._blurRadius, b1._blurRadius);
    this.spreadRadius = Interpolator.between(b0._spreadRadius, b1._spreadRadius);
    this.color = Interpolator.between(b0._color, b1._color);
    this.next = Interpolator.between(b0._next, b1._next);
  }

  interpolate(u: number): BoxShadow {
    const inset = this.inset.interpolate(u);
    const offsetX = this.offsetX.interpolate(u);
    const offsetY = this.offsetY.interpolate(u);
    const blurRadius = this.blurRadius.interpolate(u);
    const spreadRadius = this.spreadRadius.interpolate(u);
    const color = this.color.interpolate(u);
    const next = this.next.interpolate(u);
    return new BoxShadow(inset, offsetX, offsetY, blurRadius, spreadRadius, color, next);
  }

  deinterpolate(b: AnyBoxShadow): number {
    return 0; // not implemented
  }

  range(): readonly [BoxShadow, BoxShadow];
  range(bs: readonly [BoxShadow | BoxShadowInit | BoxShadowArray, BoxShadow | BoxShadowInit | BoxShadowArray]): BoxShadowInterpolator;
  range(b0: BoxShadow | BoxShadowInit | BoxShadowArray, b1: BoxShadow | BoxShadowInit | BoxShadowArray): BoxShadowInterpolator;
  range(bs: readonly [AnyBoxShadow, AnyBoxShadow]): Interpolator<BoxShadow, AnyBoxShadow>;
  range(b0: AnyBoxShadow, b1: AnyBoxShadow): Interpolator<BoxShadow, AnyBoxShadow>;
  range(b0?: readonly [AnyBoxShadow, AnyBoxShadow] | AnyBoxShadow,
        b1?: AnyBoxShadow): readonly [BoxShadow, BoxShadow] | Interpolator<BoxShadow, AnyBoxShadow> {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      b0 = b0 as readonly [AnyBoxShadow, AnyBoxShadow];
      return BoxShadowInterpolator.between(b0[0], b0[1]);
    } else {
      return BoxShadowInterpolator.between(b0 as AnyBoxShadow, b1 as AnyBoxShadow);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxShadowInterpolator) {
      return this.inset.equals(that.inset)
          && this.offsetX.equals(that.offsetX)
          && this.offsetY.equals(that.offsetY)
          && this.blurRadius.equals(that.blurRadius)
          && this.spreadRadius.equals(that.spreadRadius)
          && this.color.equals(that.color)
          && this.next.equals(that.next);
    }
    return false;
  }

  static between(b0: BoxShadow | BoxShadowInit | BoxShadowArray, b1: BoxShadow | BoxShadowInit | BoxShadowArray): BoxShadowInterpolator;
  static between(b0: AnyBoxShadow, b1: AnyBoxShadow): Interpolator<BoxShadow, AnyBoxShadow>;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof BoxShadow && b instanceof BoxShadow) {
      return new BoxShadowInterpolator(a, b);
    } else if (BoxShadow.isAny(a) && BoxShadow.isAny(b)) {
      return new BoxShadowInterpolator(BoxShadow.fromAny(a), BoxShadow.fromAny(b));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): BoxShadowInterpolator | null {
    if (a instanceof BoxShadow && b instanceof BoxShadow) {
      return new BoxShadowInterpolator(a, b);
    }
    return null;
  }
}
Interpolator.registerFactory(BoxShadowInterpolator);
