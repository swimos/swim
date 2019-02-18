// Copyright 2015-2019 SWIM.AI inc.
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

import {AnyTransform, TransformList} from "@swim/transform";
import {Interpolator} from "../Interpolator";
import {TransformInterpolator} from "../TransformInterpolator";

export class TransformListInterpolator extends TransformInterpolator<TransformList> {
  private readonly interpolators: TransformInterpolator[];

  constructor(f0: TransformList | string | undefined, f1: TransformList | string | undefined) {
    super();
    if (f0 !== void 0) {
      f0 = TransformList.fromAny(f0);
    }
    if (f1 !== void 0) {
      f1 = TransformList.fromAny(f1);
    }
    if (!f0 && !f1) {
      f1 = f0 = new TransformList([]);
    } else if (!f1) {
      f1 = f0;
    } else if (!f0) {
      f0 = f1;
    }
    this.interpolators = [];
    const n = Math.min(f0!.transforms.length, f1!.transforms.length);
    for (let i = 0; i < n; i += 1) {
      this.interpolators.push(Interpolator.transform(f0!.transforms[i], f1!.transforms[i]));
    }
  }

  interpolate(u: number): TransformList {
    const transforms = [];
    for (let i = 0; i < this.interpolators.length; i += 1) {
      transforms.push(this.interpolators[i].interpolate(u));
    }
    return new TransformList(transforms);
  }

  deinterpolate(f: AnyTransform): number {
    return 0; // not implemented
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
}
