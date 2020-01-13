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

export class InterpolatorMap<S, T> extends Interpolator<T> {
  private readonly _interpolator: Interpolator<S>;
  private readonly _transform: (value: S) => T;

  constructor(interpolator: Interpolator<S>, transform: (value: S) => T) {
    super();
    this._interpolator = interpolator;
    this._transform = transform;
  }

  interpolate(u: number): T {
    return this._transform(this._interpolator.interpolate(u));
  }

  deinterpolate(y: T): number {
    return 0;
  }

  range(): T[];
  range(ys: ReadonlyArray<T>): Interpolator<T>;
  range(y0: T, y1?: T): Interpolator<T>;
  range(y0?: ReadonlyArray<T> | T, y1?: T): T[] | Interpolator<T> {
    if (y0 === void 0) {
      const range = this._interpolator.range();
      return [this._transform(range[0]), this._transform(range[1])];
    } else {
      return this;
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InterpolatorMap) {
      return this._interpolator.equals(that._interpolator)
          && this._transform === that._transform;
    }
    return false;
  }
}
Interpolator.Map = InterpolatorMap;
