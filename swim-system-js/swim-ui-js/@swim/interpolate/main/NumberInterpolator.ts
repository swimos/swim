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

export class NumberInterpolator extends Interpolator<number, number | string> {
  private readonly y0: number;
  private readonly dy: number;

  constructor(y0: number | string | undefined, y1: number | string | undefined) {
    super();
    if (y0 === void 0 && y1 === void 0) {
      y1 = y0 = 0;
    } else if (y1 === void 0) {
      y1 = y0;
    } else if (y0 === void 0) {
      y0 = y1;
    }
    this.y0 = +y0!;
    this.dy = +y1! - this.y0;
  }

  interpolate(u: number): number {
    return this.y0 + this.dy * u;
  }

  deinterpolate(y: number | string): number {
    return this.dy ? (+y - this.y0) / this.dy : this.dy;
  }

  range(): number[];
  range(ys: ReadonlyArray<number | string>): NumberInterpolator;
  range(y0: number | string, y1?: number | string): NumberInterpolator;
  range(y0?: ReadonlyArray<number | string> | number | string, y1?: number | string): number[] | NumberInterpolator {
    if (y0 === void 0) {
      return [this.y0, this.y0 + this.dy];
    } else if (y1 === void 0) {
      y0 = y0 as ReadonlyArray<number | string>;
      return new NumberInterpolator(y0[0], y0[1]);
    } else {
      return new NumberInterpolator(y0 as number | string, y1);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof NumberInterpolator) {
      return this.y0 === that.y0 && this.dy === that.dy;
    }
    return false;
  }
}
Interpolator.Number = NumberInterpolator;
