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

export class ArrayInterpolator<T> extends Interpolator<T[], ReadonlyArray<T>> {
  /** @hidden */
  readonly interpolators: ReadonlyArray<Interpolator<T>>;

  constructor(a0: ReadonlyArray<T>, a1: ReadonlyArray<T>) {
    super();
    const interpolatorCount = Math.min(a0.length, a1.length);
    const interpolators = new Array<Interpolator<T>>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      interpolators[i] = Interpolator.between(a0[i], a1[i]);
    }
    this.interpolators = interpolators;
  }

  interpolate(u: number): T[] {
    const interpolators = this.interpolators;
    const interpolatorCount = interpolators.length;
    const array = new Array<T>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      array[i] = interpolators[i].interpolate(u);
    }
    return array;
  }

  deinterpolate(a: ReadonlyArray<T>): number {
    return 0; // not implemented
  }

  range(): readonly [T[], T[]];
  range(as: readonly [ReadonlyArray<T>, ReadonlyArray<T>]): ArrayInterpolator<T>;
  range(a0: ReadonlyArray<T>, a1: ReadonlyArray<T>): ArrayInterpolator<T>;
  range(a0?: readonly [ReadonlyArray<T>, ReadonlyArray<T>] | ReadonlyArray<T>,
        a1?: ReadonlyArray<T>): readonly[T[], T[]] | ArrayInterpolator<T> {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      a0 = a0 as readonly [ReadonlyArray<T>, ReadonlyArray<T>];
      return ArrayInterpolator.between(a0[0], a0[1]);
    } else {
      return ArrayInterpolator.between(a0 as ReadonlyArray<T>, a1 as ReadonlyArray<T>);
    }
  }

  equals(that: unknown): boolean {
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

  static between<T>(a0: ReadonlyArray<T>, a1: ReadonlyArray<T>): ArrayInterpolator<T>;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (Array.isArray(a) && Array.isArray(b)) {
      return new ArrayInterpolator(a, b);
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): ArrayInterpolator<unknown> | null {
    if (Array.isArray(a) && Array.isArray(b)) {
      return new ArrayInterpolator(a, b);
    }
    return null;
  }
}
Interpolator.Array = ArrayInterpolator;
