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

import {Interpolator} from "./Interpolator";

export class InterpolatorMap<T, FT> extends Interpolator<FT, T> {
  /** @hidden */
  readonly interpolator: Interpolator<T, unknown>;
  /** @hidden */
  readonly transform: (value: T) => FT;

  constructor(interpolator: Interpolator<T, unknown>, transform: (value: T) => FT) {
    super();
    this.interpolator = interpolator;
    this.transform = transform;
  }

  interpolate(u: number): FT {
    return this.transform(this.interpolator.interpolate(u));
  }

  deinterpolate(y: FT | T): number {
    return 0; // not implemented
  }

  range(): ReadonlyArray<FT>;
  range(ys: ReadonlyArray<FT | T>): Interpolator<FT, T>;
  range(y0: FT | T, y1: FT | T): Interpolator<FT, T>;
  range(y0?: ReadonlyArray<FT | T> | FT | T, y1?: FT | T): ReadonlyArray<FT> | Interpolator<FT, T> {
    if (y0 === void 0) {
      const range = this.interpolator.range();
      return [this.transform(range[0]), this.transform(range[1])];
    } else if (y1 === void 0) {
      y0 = y0 as ReadonlyArray<FT | T>;
      return this;
    } else {
      return this;
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InterpolatorMap) {
      return this.interpolator.equals(that.interpolator)
          && this.transform === that.transform;
    }
    return false;
  }
}
Interpolator.Map = InterpolatorMap;
