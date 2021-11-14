// Copyright 2015-2021 Swim Inc.
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
import {R2PointInit, R2PointTuple, R2Point} from "../"; // forward import
import {R2SegmentInit, R2Segment} from "../"; // forward import
import {R2BoxInit, R2Box} from "../"; // forward import
import {R2CircleInit, R2Circle} from "../"; // forward import

/** @public */
export type AnyR2Shape = R2Shape | R2PointInit | R2PointTuple | R2SegmentInit | R2BoxInit | R2CircleInit;

/** @public */
export abstract class R2Shape {
  abstract readonly xMin: number;

  abstract readonly yMin: number;

  abstract readonly xMax: number;

  abstract readonly yMax: number;

  abstract contains(that: AnyR2Shape): boolean;

  abstract contains(x: number, y: number): boolean;

  abstract intersects(that: AnyR2Shape): boolean;

  union(that: AnyR2Shape): R2Shape {
    that = R2Shape.fromAny(that);
    return new R2Box(Math.min(this.xMin, that.xMin),
                     Math.min(this.yMin, that.yMin),
                     Math.max(this.xMax, that.xMax),
                     Math.max(this.yMax, that.yMax));
  }

  abstract transform(f: R2Function): R2Shape;

  get bounds(): R2Box {
    return new R2Box(this.xMin, this.yMin, this.xMax, this.yMax);
  }

  static fromAny(value: AnyR2Shape): R2Shape {
    if (value === void 0 || value === null || value instanceof R2Shape) {
      return value;
    } else if (R2Point.isInit(value)) {
      return R2Point.fromInit(value);
    } else if (R2Point.isTuple(value)) {
      return R2Point.fromTuple(value);
    } else if (R2Segment.isInit(value)) {
      return R2Segment.fromInit(value);
    } else if (R2Box.isInit(value)) {
      return R2Box.fromInit(value);
    } else if (R2Circle.isInit(value)) {
      return R2Circle.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @internal */
  static isAny(value: unknown): value is AnyR2Shape {
    return value instanceof R2Shape
        || R2Point.isInit(value)
        || R2Point.isTuple(value)
        || R2Segment.isInit(value)
        || R2Box.isInit(value)
        || R2Circle.isInit(value);
  }
}
