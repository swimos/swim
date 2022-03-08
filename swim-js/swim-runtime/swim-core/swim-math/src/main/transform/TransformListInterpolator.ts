// Copyright 2015-2022 Swim.inc
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

import {Mutable, Interpolator} from "@swim/util";
import type {Transform} from "./Transform";
import {TransformList} from "./TransformList";

/** @internal */
export interface TransformListInterpolator extends Interpolator<TransformList> {
  /** @internal */
  readonly interpolators: ReadonlyArray<Interpolator<Transform>>;

  readonly 0: TransformList;

  readonly 1: TransformList;

  equals(that: unknown): boolean;
}

/** @internal */
export const TransformListInterpolator = (function (_super: typeof Interpolator) {
  const TransformListInterpolator = function (f0: TransformList, f1: TransformList): TransformListInterpolator {
    const interpolator = function (u: number): TransformList {
      const interpolators = interpolator.interpolators;
      const interpolatorCount = interpolators.length;
      const transforms = new Array<Transform>(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        transforms[i] = interpolators[i]!(u);
      }
      return new TransformList(transforms);
    } as TransformListInterpolator;
    Object.setPrototypeOf(interpolator, TransformListInterpolator.prototype);
    const transforms0 = f0.transforms;
    const transforms1 = f1.transforms;
    const interpolatorCount = Math.min(transforms0.length, transforms1.length);
    const interpolators = new Array<Interpolator<Transform>>(interpolatorCount);
    for (let i = 0; i < interpolatorCount; i += 1) {
      interpolators[i] = transforms0[i]!.interpolateTo(transforms1[i]!);
    }
    (interpolator as Mutable<typeof interpolator>).interpolators = interpolators;
    return interpolator;
  } as {
    (f0: TransformList, f1: TransformList): TransformListInterpolator;

    /** @internal */
    prototype: TransformListInterpolator;
  };

  TransformListInterpolator.prototype = Object.create(_super.prototype);
  TransformListInterpolator.prototype.constructor = TransformListInterpolator;

  Object.defineProperty(TransformListInterpolator.prototype, 0, {
    get(this: TransformListInterpolator): TransformList {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const transforms = new Array<Transform>(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        transforms[i] = interpolators[i]![0];
      }
      return new TransformList(transforms);
    },
    configurable: true,
  });

  Object.defineProperty(TransformListInterpolator.prototype, 1, {
    get(this: TransformListInterpolator): TransformList {
      const interpolators = this.interpolators;
      const interpolatorCount = interpolators.length;
      const transforms = new Array<Transform>(interpolatorCount);
      for (let i = 0; i < interpolatorCount; i += 1) {
        transforms[i] = interpolators[i]![1];
      }
      return new TransformList(transforms);
    },
    configurable: true,
  });

  TransformListInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof TransformListInterpolator) {
      const n = this.interpolators.length;
      if (n === that.interpolators.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.interpolators[i]!.equals(that.interpolators[i]!)) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  };

  return TransformListInterpolator;
})(Interpolator);
