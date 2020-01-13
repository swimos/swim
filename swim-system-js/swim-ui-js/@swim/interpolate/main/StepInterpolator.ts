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

export class StepInterpolator<T> extends Interpolator<T> {
  private readonly y0: T | undefined;
  private readonly y1: T | undefined;

  constructor(y0: T | undefined, y1: T | undefined) {
    super();
    if (y1 === void 0) {
      y1 = y0;
    } else if (y0 === void 0) {
      y0 = y1;
    }
    this.y0 = y0;
    this.y1 = y1;
  }

  interpolate(u: number): T {
    const v = u < 1 ? this.y0 : this.y1;
    if (v === void 0) {
      throw new TypeError();
    }
    return v;
  }

  deinterpolate(y: T): number {
    return y === this.y1 ? 1 : 0;
  }

  range(): T[];
  range(ys: ReadonlyArray<T>): StepInterpolator<T>;
  range(y0: T, y1?: T): StepInterpolator<T>;
  range(y0?: ReadonlyArray<T> | T, y1?: T): T[] | StepInterpolator<T> {
    if (y0 === void 0) {
      if (this.y0 === void 0 || this.y1 === void 0) {
        throw new TypeError();
      }
      return [this.y0, this.y1];
    } else if (y1 === void 0) {
      y0 = y0 as ReadonlyArray<T>;
      return new StepInterpolator(y0[0], y0[1]);
    } else {
      return new StepInterpolator(y0 as T, y1);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof StepInterpolator) {
      return this.y0 === that.y0 && this.y1 === that.y1;
    }
    return false;
  }
}
Interpolator.Step = StepInterpolator;
