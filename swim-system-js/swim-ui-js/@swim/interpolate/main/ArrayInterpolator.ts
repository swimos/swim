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

export class ArrayInterpolator<T> extends Interpolator<T[]> {
  private readonly interpolators: Interpolator<T>[];

  constructor(a0?: ReadonlyArray<T>, a1?: ReadonlyArray<T>) {
    super();
    if (!a0 && !a1) {
      a1 = a0 = [];
    } else if (!a1) {
      a1 = a0;
    } else if (!a0) {
      a0 = a1;
    }
    this.interpolators = [];
    const n = Math.min(a0!.length, a1!.length);
    for (let i = 0; i < n; i += 1) {
      this.interpolators.push(Interpolator.from(a0![i], a1![i]));
    }
  }

  interpolate(u: number): T[] {
    const n = this.interpolators.length;
    const array = new Array(n);
    for (let i = 0; i < this.interpolators.length; i += 1) {
      array[i] = this.interpolators[i].interpolate(u);
    }
    return array;
  }

  deinterpolate(a: ReadonlyArray<T>): number {
    return 0; // not implemented
  }

  range(): T[][];
  range(as: ReadonlyArray<ReadonlyArray<T>>): ArrayInterpolator<T>;
  range(a0: ReadonlyArray<T>, a1?: ReadonlyArray<T>): ArrayInterpolator<T>;
  range(a0?: ReadonlyArray<ReadonlyArray<T>> | ReadonlyArray<T>, a1?: ReadonlyArray<T>): T[][] | ArrayInterpolator<T> {
    if (a0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (a1 === void 0) {
      a0 = a0 as  ReadonlyArray<ReadonlyArray<T>>;
      return new ArrayInterpolator(a0[0], a0[1]);
    } else {
      return new ArrayInterpolator(a0 as ReadonlyArray<T>, a1);
    }
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ArrayInterpolator) {
      const n = this.interpolators.length;
      if (n === that.interpolators.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.interpolators[i].equals(that.interpolators[i])) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }
}
Interpolator.Array = ArrayInterpolator;
