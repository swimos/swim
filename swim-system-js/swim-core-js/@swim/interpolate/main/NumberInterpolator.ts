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

import {Interpolator} from "./Interpolator";

export class NumberInterpolator extends Interpolator<number, number | string> {
  /** @hidden */
  readonly y0: number;
  /** @hidden */
  readonly dy: number;

  constructor(y0: number, y1: number) {
    super();
    this.y0 = y0;
    this.dy = y1 - this.y0;
  }

  interpolate(u: number): number {
    return this.y0 + this.dy * u;
  }

  deinterpolate(y: number | string): number {
    y = +y;
    return this.dy !== 0 ? (y - this.y0) / this.dy : this.dy;
  }

  range(): readonly [number, number];
  range(ys: readonly [number | string, number | string]): NumberInterpolator;
  range(y0: number | string, y1: number | string): NumberInterpolator;
  range(y0?: readonly [number | string, number | string] | number | string,
        y1?: number | string): readonly [number, number] | NumberInterpolator {
    if (arguments.length === 0) {
      return [this.y0, this.y0 + this.dy];
    } else if (arguments.length === 1) {
      y0 = y0 as readonly [number | string, number | string];
      return NumberInterpolator.between(y0[0], y0[1]);
    } else {
      return NumberInterpolator.between(y0 as number | string, y1 as number | string);
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

  static between(y0: number | string, y1: number | string): NumberInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if ((typeof a === "number" || typeof a === "string") &&
        (typeof b === "number" || typeof b === "string")) {
      return new NumberInterpolator(+a, +b);
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): NumberInterpolator | null {
    if (typeof a === "number" && typeof b === "number") {
      return new NumberInterpolator(a, b);
    }
    return null;
  }

  static tryBetweenAny(a: unknown, b: unknown): NumberInterpolator | null {
    if (typeof a === "number" && typeof b === "number") {
      return new NumberInterpolator(a, b);
    } else if (typeof a === "number" && typeof b === "string") {
      const y1 = +b;
      if (!isNaN(y1)) {
        return new NumberInterpolator(a, y1);
      }
    } else if (typeof a === "string" && typeof b === "number") {
      const y0 = +a;
      if (!isNaN(y0)) {
        return new NumberInterpolator(y0, b);
      }
    } else if (typeof a === "string" && typeof b === "string") {
      const y0 = +a;
      const y1 = +b;
      if (!isNaN(y0) && !isNaN(y1)) {
        return new NumberInterpolator(y0, y1);
      }
    }
    return null;
  }
}
Interpolator.Number = NumberInterpolator;
Interpolator.registerFactory(NumberInterpolator);
