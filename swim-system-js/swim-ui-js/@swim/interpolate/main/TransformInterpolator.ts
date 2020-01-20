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

import {
  AnyTransform,
  Transform,
  TranslateTransform,
  ScaleTransform,
  RotateTransform,
  SkewTransform,
  TransformList,
} from "@swim/transform";
import {Interpolator} from "./Interpolator";
import {IdentityTransformInterpolator} from "./transform/IdentityTransformInterpolator";
import {TranslateTransformInterpolator} from "./transform/TranslateTransformInterpolator";
import {ScaleTransformInterpolator} from "./transform/ScaleTransformInterpolator";
import {RotateTransformInterpolator} from "./transform/RotateTransformInterpolator";
import {SkewTransformInterpolator} from "./transform/SkewTransformInterpolator";
import {AffineTransformInterpolator} from "./transform/AffineTransformInterpolator";
import {TransformListInterpolator} from "./transform/TransformListInterpolator";

export abstract class TransformInterpolator<F extends Transform = Transform> extends Interpolator<F, AnyTransform> {
  range(): F[];
  range(fs: ReadonlyArray<AnyTransform>): TransformInterpolator<F>;
  range(f0: AnyTransform, f1?: AnyTransform): TransformInterpolator<F>;
  range(f0?: ReadonlyArray<AnyTransform> | AnyTransform, f1?: AnyTransform): F[] | TransformInterpolator<F> {
    if (f0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (f1 === void 0) {
      f0 = f0 as ReadonlyArray<AnyTransform>;
      return Interpolator.transform(f0[0], f0[1]) as TransformInterpolator<F>;
    } else {
      return Interpolator.transform(f0 as AnyTransform, f1) as TransformInterpolator<F>;
    }
  }

  static transform(f0?: AnyTransform, f1?: AnyTransform): TransformInterpolator {
    if (f0 === void 0 && f1 === void 0) {
      return new TransformInterpolator.Identity();
    }
    if (f0 !== void 0) {
      f0 = Transform.fromAny(f0);
    }
    if (f1 !== void 0) {
      f1 = Transform.fromAny(f1);
    }
    if (!f0 && !f1) {
      f1 = f0 = Transform.identity();
    } else if (!f1) {
      f1 = f0;
    } else if (!f0) {
      f0 = f1;
    }
    if (f0 instanceof TranslateTransform && f1 instanceof TranslateTransform) {
      return new TransformInterpolator.Translate(f0, f1);
    } else if (f0 instanceof ScaleTransform && f1 instanceof ScaleTransform) {
      return new TransformInterpolator.Scale(f0, f1);
    } else if (f0 instanceof RotateTransform && f1 instanceof RotateTransform) {
      return new TransformInterpolator.Rotate(f0, f1);
    } else if (f0 instanceof SkewTransform && f1 instanceof SkewTransform) {
      return new TransformInterpolator.Skew(f0, f1);
    } else if (f0 instanceof TransformList && f1 instanceof TransformList) {
      if (f0.conformsTo(f1)) {
        return new TransformInterpolator.List(f0, f1);
      }
    }
    return new TransformInterpolator.Affine(f0!.toAffine(), f1!.toAffine());
  }

  // Forward type declarations
  /** @hidden */
  static Identity: typeof IdentityTransformInterpolator; // defined by IdentityTransformInterpolator
  /** @hidden */
  static Translate: typeof TranslateTransformInterpolator; // defined by TranslateTransformInterpolator
  /** @hidden */
  static Scale: typeof ScaleTransformInterpolator; // defined by ScaleTransformInterpolator
  /** @hidden */
  static Rotate: typeof RotateTransformInterpolator; // defined by RotateTransformInterpolator
  /** @hidden */
  static Skew: typeof SkewTransformInterpolator; // defined by SkewTransformInterpolator
  /** @hidden */
  static Affine: typeof AffineTransformInterpolator; // defined by AffineTransformInterpolator
  /** @hidden */
  static List: typeof TransformListInterpolator; // defined by TransformListInterpolator
}
Interpolator.Transform = TransformInterpolator;
Interpolator.transform = TransformInterpolator.transform;
