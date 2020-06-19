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
import {TranslateTransform} from "./TranslateTransform";
import {ScaleTransform} from "./ScaleTransform";
import {RotateTransform} from "./RotateTransform";
import {SkewTransform} from "./SkewTransform";
import {TransformList} from "./TransformList";
import {TranslateTransformInterpolator} from "./TranslateTransformInterpolator";
import {ScaleTransformInterpolator} from "./ScaleTransformInterpolator";
import {RotateTransformInterpolator} from "./RotateTransformInterpolator";
import {SkewTransformInterpolator} from "./SkewTransformInterpolator";
import {AffineTransformInterpolator} from "./AffineTransformInterpolator";
import {TransformListInterpolator} from "./TransformListInterpolator";

export abstract class TransformInterpolator<F extends Transform = Transform> extends Interpolator<F, AnyTransform> {
  abstract range(): readonly [F, F];
  abstract range(fs: readonly [F, F]): TransformInterpolator<F>;
  abstract range(f0: F, f1: F): TransformInterpolator<F>;
  abstract range(fs: readonly [AnyTransform, AnyTransform]): TransformInterpolator;
  abstract range(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;

  static between(f0: AnyTransform, f1: AnyTransform): TransformInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof TranslateTransform && b instanceof TranslateTransform) {
      return new TransformInterpolator.Translate(a, b);
    } else if (a instanceof ScaleTransform && b instanceof ScaleTransform) {
      return new TransformInterpolator.Scale(a, b);
    } else if (a instanceof RotateTransform && b instanceof RotateTransform) {
      return new TransformInterpolator.Rotate(a, b);
    } else if (a instanceof SkewTransform && b instanceof SkewTransform) {
      return new TransformInterpolator.Skew(a, b);
    } else if (a instanceof TransformList && b instanceof TransformList && a.conformsTo(b)) {
      return new TransformInterpolator.List(a, b);
    } else if (a instanceof Transform && b instanceof Transform) {
      return new TransformInterpolator.Affine(a.toAffine(), b.toAffine());
    } else if (Transform.isAny(a) && Transform.isAny(b)) {
      return TransformInterpolator.between(Transform.fromAny(a), Transform.fromAny(b));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): TransformInterpolator | null {
    if (a instanceof TranslateTransform && b instanceof TranslateTransform) {
      return new TransformInterpolator.Translate(a, b);
    } else if (a instanceof ScaleTransform && b instanceof ScaleTransform) {
      return new TransformInterpolator.Scale(a, b);
    } else if (a instanceof RotateTransform && b instanceof RotateTransform) {
      return new TransformInterpolator.Rotate(a, b);
    } else if (a instanceof SkewTransform && b instanceof SkewTransform) {
      return new TransformInterpolator.Skew(a, b);
    } else if (a instanceof TransformList && b instanceof TransformList && a.conformsTo(b)) {
      return new TransformInterpolator.List(a, b);
    }
    return null;
  }

  // Forward type declarations
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
Interpolator.registerFactory(TransformInterpolator);
