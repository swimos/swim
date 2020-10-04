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
import {AnyTransform} from "./Transform";
import {AffineTransform} from "./AffineTransform";
import {TransformInterpolator} from "./TransformInterpolator";

export class AffineTransformInterpolator extends TransformInterpolator<AffineTransform> {
  /** @hidden */
  readonly f0: AffineTransform;
  /** @hidden */
  readonly f1: AffineTransform;

  constructor(f0: AffineTransform, f1: AffineTransform) {
    super();
    // TODO: decompose matrices
    this.f0 = f0!;
    this.f1 = f1!;
  }

  interpolate(u: number): AffineTransform {
    // TODO: interpolate and recompose matrices
    return this.f1;
  }

  deinterpolate(f: AnyTransform): number {
    //f = Transform.fromAny(f);
    return 0; // TODO: interpolate matrices
  }

  range(): readonly [AffineTransform, AffineTransform];
  range(fs: readonly [AffineTransform, AffineTransform]): AffineTransformInterpolator;
  range(f0: AffineTransform, f1: AffineTransform): AffineTransformInterpolator;
  range(fs: readonly [AnyTransform, AnyTransform]): TransformInterpolator;
  range(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  range(f0?: readonly [AnyTransform, AnyTransform] | AnyTransform,
        f1?: AnyTransform): readonly [AffineTransform, AffineTransform] | TransformInterpolator {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      f0 = f0 as readonly [AnyTransform, AnyTransform];
      return AffineTransformInterpolator.between(f0[0], f0[1]);
    } else {
      return AffineTransformInterpolator.between(f0 as AnyTransform, f1 as AnyTransform);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof AffineTransformInterpolator) {
      return this.f0.equals(that.f0) && this.f1.equals(that.f1);
    }
    return false;
  }

  static between(f0: AffineTransform, f1: AffineTransform): AffineTransformInterpolator;
  static between(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof AffineTransform && b instanceof AffineTransform) {
      return new AffineTransformInterpolator(a, b);
    }
    return TransformInterpolator.between(a, b);
  }
}
TransformInterpolator.Affine = AffineTransformInterpolator;
