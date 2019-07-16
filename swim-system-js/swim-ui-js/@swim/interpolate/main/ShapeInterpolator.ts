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

import {AnyShape, Shape, R2Shape, PointR2, SegmentR2, BoxR2, CircleR2} from "@swim/math";
import {Interpolator} from "./Interpolator";
import {IdentityShapeInterpolator} from "./shape/IdentityShapeInterpolator";
import {PointR2Interpolator} from "./shape/PointR2Interpolator";
import {SegmentR2Interpolator} from "./shape/SegmentR2Interpolator";
import {BoxR2Interpolator} from "./shape/BoxR2Interpolator";
import {CircleR2Interpolator} from "./shape/CircleR2Interpolator";

export abstract class ShapeInterpolator<S extends Shape = Shape> extends Interpolator<S, AnyShape> {
  range(): S[];
  range(ss: ReadonlyArray<AnyShape>): ShapeInterpolator<S>;
  range(s0: AnyShape, s1?: AnyShape): ShapeInterpolator<S>;
  range(s0?: ReadonlyArray<AnyShape> | AnyShape, s1?: AnyShape): S[] | ShapeInterpolator<S> {
    if (s0 === void 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (s1 === void 0) {
      s0 = s0 as ReadonlyArray<AnyShape>;
      return Interpolator.shape(s0[0], s0[1]) as ShapeInterpolator<S>;
    } else {
      return Interpolator.shape(s0 as AnyShape, s1) as ShapeInterpolator<S>;
    }
  }

  static shape(s0?: AnyShape, s1?: AnyShape): ShapeInterpolator {
    if (s0 === void 0 && s1 === void 0) {
      return new ShapeInterpolator.Identity();
    }
    if (s0 !== void 0) {
      s0 = Shape.fromAny(s0);
    }
    if (s1 !== void 0) {
      s1 = Shape.fromAny(s1);
    }
    if (!s0 && !s1) {
      s1 = s0 = PointR2.origin();
    } else if (!s1) {
      s1 = s0;
    } else if (!s0) {
      s0 = s1;
    }
    if (s0 instanceof PointR2 && s1 instanceof PointR2) {
      return new ShapeInterpolator.PointR2(s0, s1);
    } else if (s0 instanceof SegmentR2 && s1 instanceof SegmentR2) {
      return new ShapeInterpolator.SegmentR2(s0, s1);
    } else if (s0 instanceof BoxR2 && s1 instanceof BoxR2) {
      return new ShapeInterpolator.BoxR2(s0, s1);
    } else if (s0 instanceof CircleR2 && s1 instanceof CircleR2) {
      return new ShapeInterpolator.CircleR2(s0, s1);
    } else if (s0 instanceof R2Shape && s1 instanceof R2Shape) {
      if (!(s0 instanceof BoxR2)) {
        s0 = new BoxR2(s0.xMin, s0.yMin, s0.xMax, s0.yMax);
      }
      if (!(s1 instanceof BoxR2)) {
        s1 = new BoxR2(s1.xMin, s1.yMin, s1.xMax, s1.yMax);
      }
      return new ShapeInterpolator.BoxR2(s0, s1);
    }
    throw new TypeError(s0 + ", " + s1);
  }

  // Forward type declarations
  /** @hidden */
  static Identity: typeof IdentityShapeInterpolator; // defined by IdentityShapeInterpolator
  /** @hidden */
  static PointR2: typeof PointR2Interpolator; // defined by PointR2Interpolator
  /** @hidden */
  static SegmentR2: typeof SegmentR2Interpolator; // defined by SegmentR2Interpolator
  /** @hidden */
  static BoxR2: typeof BoxR2Interpolator; // defined by BoxR2Interpolator
  /** @hidden */
  static CircleR2: typeof CircleR2Interpolator; // defined by CircleR2Interpolator
}
Interpolator.Shape = ShapeInterpolator;
Interpolator.shape = ShapeInterpolator.shape;
