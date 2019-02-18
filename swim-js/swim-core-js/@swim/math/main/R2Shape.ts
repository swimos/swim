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

import {AnyShape, Shape} from "./Shape";
import {R2Function} from "./R2Function";
import {PointR2, PointR2Init} from "./PointR2";
import {SegmentR2, SegmentR2Init} from "./SegmentR2";
import {BoxR2, BoxR2Init} from "./BoxR2";
import {CircleR2, CircleR2Init} from "./CircleR2";

export type AnyR2Shape = R2Shape | PointR2Init | SegmentR2Init | BoxR2Init | CircleR2Init | [number, number];

export abstract class R2Shape implements Shape {
  abstract get xMin(): number;

  abstract get yMin(): number;

  abstract get xMax(): number;

  abstract get yMax(): number;

  abstract contains(that: AnyShape): boolean;

  abstract contains(x: number, y: number): boolean;

  abstract intersects(that: AnyShape): boolean;

  union(that: AnyR2Shape): R2Shape {
    that = R2Shape.fromAny(that);
    return new R2Shape.Box(Math.min(this.xMin, that.xMin),
                           Math.min(this.yMin, that.yMin),
                           Math.max(this.xMax, that.xMax),
                           Math.max(this.yMax, that.yMax));
  }

  abstract transform(f: R2Function): R2Shape;

  static fromAny(shape: AnyR2Shape): R2Shape {
    return Shape.fromAny(shape) as R2Shape;
  }

  // Forward type declarations
  /** @hidden */
  static Point: typeof PointR2; // defined by PointR2
  /** @hidden */
  static Segment: typeof SegmentR2; // defined by SegmentR2
  /** @hidden */
  static Box: typeof BoxR2; // defined by BoxR2
  /** @hidden */
  static Circle: typeof CircleR2; // defined by CircleR2
}
Shape.R2 = R2Shape;
