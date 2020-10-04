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

import {Objects} from "@swim/util";
import {Interpolator} from "@swim/interpolate";
import {Look} from "../look/Look";
import {FeelVector} from "./FeelVector";

export class FeelVectorInterpolator extends Interpolator<FeelVector> {
  /** @hidden */
  readonly _array: ReadonlyArray<[Look<unknown>, Interpolator<unknown>]>;
  /** @hidden */
  readonly _index: {readonly [name: string]: number | undefined};

  constructor(v0: FeelVector, v1: FeelVector) {
    super();
    const array = new Array<[Look<unknown>, Interpolator<unknown>]>();
    const index: {[name: string]: number | undefined} = {};
    v0.forEach(function <T>(a: T, look: Look<T>): void {
      const b = v1.get(look);
      if (b !== void 0) {
        const interpolator = look.between(a, b);
        index[look.name] = array.length;
        array.push([look, interpolator]);
      }
    }, this);
    this._array = array;
    this._index = index;
  }

  interpolate(u: number): FeelVector {
    const interpolators = this._array;
    const n = interpolators.length;
    const array = new Array<[Look<unknown>, unknown]>(n);
    const index = this._index;
    for (let i = 0; i < n; i += 1) {
      const [look, interpolator] = interpolators[i];
      const value = interpolator.interpolate(u);
      array[i] = [look, value];
    }
    return FeelVector.fromArray(array, index);
  }

  deinterpolate(v: FeelVector): number {
    return 0; // not implemented
  }

  range(): readonly [FeelVector, FeelVector];
  range(vs: readonly [FeelVector, FeelVector]): FeelVectorInterpolator;
  range(v0: FeelVector, v1: FeelVector): FeelVectorInterpolator;
  range(v0?: readonly [FeelVector, FeelVector] | FeelVector,
        v1?: FeelVector): readonly[FeelVector, FeelVector] | FeelVectorInterpolator {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      v0 = v0 as readonly [FeelVector, FeelVector];
      return FeelVectorInterpolator.between(v0[0], v0[1]);
    } else {
      return FeelVectorInterpolator.between(v0 as FeelVector, v1 as FeelVector);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FeelVectorInterpolator) {
      const n = this._array.length;
      if (n === that._array.length) {
        for (let i = 0; i < n; i += 1) {
          if (!Objects.equal(this._array[i], that._array[i])) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }

  static between(v0: FeelVector, v1: FeelVector): FeelVectorInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof FeelVector && b instanceof FeelVector) {
      return new FeelVectorInterpolator(a, b);
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): FeelVectorInterpolator | null {
    if (a instanceof FeelVector && b instanceof FeelVector) {
      return new FeelVectorInterpolator(a, b);
    }
    return null;
  }
}
Interpolator.registerFactory(FeelVectorInterpolator);
