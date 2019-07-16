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

import {AnyTransform, AffineTransform} from "@swim/transform";
import {TransformInterpolator} from "../TransformInterpolator";

export class AffineTransformInterpolator extends TransformInterpolator<AffineTransform> {
  private readonly f0: AffineTransform;
  private readonly f1: AffineTransform;

  constructor(f0: AffineTransform | string | undefined, f1: AffineTransform | string | undefined) {
    super();
    if (f0 !== void 0) {
      f0 = AffineTransform.fromAny(f0);
    }
    if (f1 !== void 0) {
      f1 = AffineTransform.fromAny(f1);
    }
    if (!f0 && !f1) {
      f1 = f0 = new AffineTransform();
    } else if (!f1) {
      f1 = f0;
    } else if (!f0) {
      f0 = f1;
    }
    // TODO: decompose matrices
    this.f0 = f0!;
    this.f1 = f1!;
  }

  interpolate(u: number): AffineTransform {
    // TODO: interpolate and recompose matrices
    return this.f1;
  }

  deinterpolate(f: AnyTransform): number {
    return 0; // TODO
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof AffineTransformInterpolator) {
      return this.f0.equals(that.f0) && this.f1.equals(that.f1);
    }
    return false;
  }
}
TransformInterpolator.Affine = AffineTransformInterpolator;
