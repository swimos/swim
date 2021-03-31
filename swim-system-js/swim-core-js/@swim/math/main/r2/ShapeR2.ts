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

import type {R2Function} from "./R2Function";
import {PointR2Init, PointR2Tuple, PointR2} from "../"; // forward import
import {SegmentR2Init, SegmentR2} from "../"; // forward import
import {BoxR2Init, BoxR2} from "../"; // forward import
import {CircleR2Init, CircleR2} from "../"; // forward import

export type AnyShapeR2 = ShapeR2 | PointR2Init | PointR2Tuple | SegmentR2Init | BoxR2Init | CircleR2Init;

export abstract class ShapeR2 {
  abstract readonly xMin: number;

  abstract readonly yMin: number;

  abstract readonly xMax: number;

  abstract readonly yMax: number;

  abstract contains(that: AnyShapeR2): boolean;

  abstract contains(x: number, y: number): boolean;

  abstract intersects(that: AnyShapeR2): boolean;

  union(that: AnyShapeR2): ShapeR2 {
    that = ShapeR2.fromAny(that);
    return new BoxR2(Math.min(this.xMin, that.xMin),
                     Math.min(this.yMin, that.yMin),
                     Math.max(this.xMax, that.xMax),
                     Math.max(this.yMax, that.yMax));
  }

  abstract transform(f: R2Function): ShapeR2;

  get bounds(): BoxR2 {
    return new BoxR2(this.xMin, this.yMin, this.xMax, this.yMax);
  }

  static fromAny(value: AnyShapeR2): ShapeR2 {
    if (value === void 0 || value === null || value instanceof ShapeR2) {
      return value;
    } else if (PointR2.isInit(value)) {
      return PointR2.fromInit(value);
    } else if (PointR2.isTuple(value)) {
      return PointR2.fromTuple(value);
    } else if (SegmentR2.isInit(value)) {
      return SegmentR2.fromInit(value);
    } else if (BoxR2.isInit(value)) {
      return BoxR2.fromInit(value);
    } else if (CircleR2.isInit(value)) {
      return CircleR2.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyShapeR2 {
    return value instanceof ShapeR2
        || PointR2.isInit(value)
        || PointR2.isTuple(value)
        || SegmentR2.isInit(value)
        || BoxR2.isInit(value)
        || CircleR2.isInit(value);
  }
}
