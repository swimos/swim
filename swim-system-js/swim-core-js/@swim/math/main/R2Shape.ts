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

import {AnyShape, Shape} from "./Shape";
import {R2Function} from "./R2Function";
import {PointR2Init, PointR2Tuple, PointR2} from "./PointR2";
import {SegmentR2Init, SegmentR2} from "./SegmentR2";
import {BoxR2Init, BoxR2} from "./BoxR2";
import {CircleR2Init, CircleR2} from "./CircleR2";

export type AnyR2Shape = R2Shape | PointR2Init | PointR2Tuple | SegmentR2Init | BoxR2Init | CircleR2Init;

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

  boundingBox(): BoxR2 {
    return new R2Shape.Box(this.xMin, this.yMin, this.xMax, this.yMax);
  }

  static fromAny(value: AnyR2Shape): R2Shape {
    if (value instanceof R2Shape) {
      return value;
    } else if (R2Shape.Point.isInit(value)) {
      return R2Shape.Point.fromInit(value);
    } else if (R2Shape.Point.isTuple(value)) {
      return R2Shape.Point.fromTuple(value);
    } else if (R2Shape.Segment.isInit(value)) {
      return R2Shape.Segment.fromInit(value);
    } else if (R2Shape.Box.isInit(value)) {
      return R2Shape.Box.fromInit(value);
    } else if (R2Shape.Circle.isInit(value)) {
      return R2Shape.Circle.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyR2Shape {
    return value instanceof R2Shape
        || R2Shape.Point.isInit(value)
        || R2Shape.Point.isTuple(value)
        || R2Shape.Segment.isInit(value)
        || R2Shape.Box.isInit(value)
        || R2Shape.Circle.isInit(value);
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
