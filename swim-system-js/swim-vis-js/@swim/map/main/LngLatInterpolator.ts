// Copyright 2015-2019 SWIM.AI inc.
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
import {AnyLngLat, LngLat} from "./LngLat";

export class LngLatInterpolator extends Interpolator<LngLat> {
  private readonly x0: number;
  private readonly dx: number;
  private readonly y0: number;
  private readonly dy: number;

  constructor(c0: AnyLngLat | undefined, c1: AnyLngLat | undefined) {
    super();
    if (c0 !== void 0) {
      c0 = LngLat.fromAny(c0);
    }
    if (c1 !== void 0) {
      c1 = LngLat.fromAny(c1);
    }
    if (!c0 && !c1) {
      c1 = c0 = LngLat.origin();
    } else if (!c1) {
      c1 = c0;
    } else if (!c0) {
      c0 = c1;
    }
    this.x0 = (c0 as LngLat).lng;
    this.dx = (c1 as LngLat).lng - this.x0;
    this.y0 = (c0 as LngLat).lat;
    this.dy = (c1 as LngLat).lat - this.y0;
  }

  interpolate(u: number): LngLat {
    const lng = this.x0 + this.dx * u;
    const lat = this.y0 + this.dy * u;
    return new LngLat(lng, lat);
  }

  deinterpolate(c: AnyLngLat): number {
    c = LngLat.fromAny(c);
    const cx = (c as LngLat).lng - this.x0;
    const cy = (c as LngLat).lat - this.y0;
    const dc = cx * this.dx + cy * this.dy;
    const lc = Math.sqrt(cx * cx + cy * cy);
    return lc ? dc / lc : lc;
  }

  range(): LngLat[];
  range(cs: ReadonlyArray<AnyLngLat>): LngLatInterpolator;
  range(c0: AnyLngLat, c1?: AnyLngLat): LngLatInterpolator;
  range(c0?: ReadonlyArray<AnyLngLat> | AnyLngLat, c1?: AnyLngLat): LngLat[] | LngLatInterpolator {
    if (c0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (c1 === void 0) {
      c0 = c0 as ReadonlyArray<AnyLngLat>;
      return new LngLatInterpolator(c0[0], c0[1]) as LngLatInterpolator;
    } else {
      return new LngLatInterpolator(c0 as AnyLngLat, c1) as LngLatInterpolator;
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LngLatInterpolator) {
      return this.x0 === that.x0 && this.dx === that.dx
          && this.y0 === that.y0 && this.dy === that.dy;
    }
    return false;
  }

  static lngLat(c0?: AnyLngLat, c1?: AnyLngLat): LngLatInterpolator {
    return new LngLatInterpolator(c0, c1);
  }
}
Interpolator.lngLat = LngLatInterpolator.lngLat;

const InterpolatorFrom = Interpolator.from;
Interpolator.from = function <T extends U, U = T>(a?: U, b?: U): Interpolator<T, U> {
  if (a instanceof LngLat || b instanceof LngLat) {
    return Interpolator.lngLat(a as any, b as any) as any as Interpolator<T, U>;
  } else {
    return InterpolatorFrom(a, b);
  }
};
