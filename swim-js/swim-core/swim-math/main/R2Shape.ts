// Copyright 2015-2023 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Equals} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {R2Function} from "./R2Function";
import {R2PointInit} from "./"; // forward import
import {R2PointTuple} from "./"; // forward import
import {R2Point} from "./"; // forward import
import {R2SegmentInit} from "./"; // forward import
import {R2Segment} from "./"; // forward import
import {R2Path} from "./"; // forward import
import {R2BoxInit} from "./"; // forward import
import {R2Box} from "./"; // forward import
import {R2CircleInit} from "./"; // forward import
import {R2Circle} from "./"; // forward import

/** @public */
export type R2ShapeLike = R2Shape
                        | R2PointInit
                        | R2PointTuple
                        | R2SegmentInit
                        | R2BoxInit
                        | R2CircleInit
                        | string;

/** @public */
export const R2ShapeLike = {
  [Symbol.hasInstance](instance: unknown): instance is R2ShapeLike {
    return instance instanceof R2Shape
        || R2PointInit[Symbol.hasInstance](instance)
        || R2PointTuple[Symbol.hasInstance](instance)
        || R2SegmentInit[Symbol.hasInstance](instance)
        || R2BoxInit[Symbol.hasInstance](instance)
        || R2Circle[Symbol.hasInstance](instance)
        || typeof instance === "string";
  },
};

/** @public */
export abstract class R2Shape implements Equals, Equivalent {
  /** @internal */
  declare readonly typeid?: string;

  likeType?(like: R2PointInit
                | R2PointTuple
                | R2SegmentInit
                | R2BoxInit
                | R2CircleInit
                | string): void;

  abstract isDefined(): boolean;

  abstract readonly xMin: number;

  abstract readonly yMin: number;

  abstract readonly xMax: number;

  abstract readonly yMax: number;

  abstract contains(that: R2ShapeLike): boolean;

  abstract contains(x: number, y: number): boolean;

  abstract intersects(that: R2ShapeLike): boolean;

  union(that: R2ShapeLike): R2Shape {
    that = R2Shape.fromLike(that);
    return new R2Box(Math.min(this.xMin, that.xMin),
                     Math.min(this.yMin, that.yMin),
                     Math.max(this.xMax, that.xMax),
                     Math.max(this.yMax, that.yMax));
  }

  abstract transform(f: R2Function): R2Shape;

  get bounds(): R2Box {
    return new R2Box(this.xMin, this.yMin, this.xMax, this.yMax);
  }

  /** @override */
  abstract equivalentTo(that: unknown, epsilon?: number): boolean

  /** @override */
  abstract equals(that: unknown): boolean;

  static fromLike<T extends R2ShapeLike | null | undefined>(value: T): R2Shape | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof R2Shape) {
      return value as R2Shape | Uninitable<T>;
    } else if (R2PointInit[Symbol.hasInstance](value)) {
      return R2Point.fromInit(value);
    } else if (R2PointTuple[Symbol.hasInstance](value)) {
      return R2Point.fromTuple(value);
    } else if (R2SegmentInit[Symbol.hasInstance](value)) {
      return R2Segment.fromInit(value);
    } else if (R2BoxInit[Symbol.hasInstance](value)) {
      return R2Box.fromInit(value);
    } else if (R2CircleInit[Symbol.hasInstance](value)) {
      return R2Circle.fromInit(value);
    } else if (typeof value === "string") {
      return R2Path.parse(value);
    }
    throw new TypeError("" + value);
  }
}
