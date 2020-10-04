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
import {AnyTransform, Transform} from "./Transform";
import {TransformList} from "./TransformList";
import {TransformInterpolator} from "./TransformInterpolator";

export class TransformListInterpolator extends TransformInterpolator<TransformList> {
  /** @hidden */
  readonly interpolators: ReadonlyArray<TransformInterpolator>;

  constructor(f0: TransformList, f1: TransformList) {
    super();
    const transforms0 = f0.transforms;
    const transforms1 = f1.transforms;
    const interpolatorCount = Math.min(transforms0.length, transforms1.length);
    const interpolators = new Array<TransformInterpolator>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      interpolators[i] = TransformInterpolator.between(transforms0[i], transforms1[i]);
    }
    this.interpolators = interpolators;
  }

  interpolate(u: number): TransformList {
    const interpolators = this.interpolators;
    const interpolatorCount = interpolators.length;
    const transforms = new Array<Transform>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      transforms[i] = interpolators[i].interpolate(u);
    }
    return new TransformList(transforms);
  }

  deinterpolate(f: AnyTransform): number {
    return 0; // not implemented
  }

  range(): readonly [TransformList, TransformList];
  range(fs: readonly [TransformList, TransformList]): TransformListInterpolator;
  range(f0: TransformList, f1: TransformList): TransformListInterpolator;
  range(fs: readonly [AnyTransform, AnyTransform]): TransformInterpolator;
  range(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  range(f0?: readonly [AnyTransform, AnyTransform] | AnyTransform,
        f1?: AnyTransform): readonly [TransformList, TransformList] | TransformInterpolator {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      f0 = f0 as readonly [AnyTransform, AnyTransform];
      return TransformListInterpolator.between(f0[0], f0[1]);
    } else {
      return TransformListInterpolator.between(f0 as AnyTransform, f1 as AnyTransform);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TransformListInterpolator) {
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

  static between(f0: TransformList, f1: TransformList): TransformListInterpolator;
  static between(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof TransformList && b instanceof TransformList && a.conformsTo(b)) {
      return new TransformListInterpolator(a, b);
    }
    return TransformInterpolator.between(a, b);
  }
}
TransformInterpolator.List = TransformListInterpolator;
