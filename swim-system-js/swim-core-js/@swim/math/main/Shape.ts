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

import {AnyR2Shape, R2Shape} from "./R2Shape";
import {PointR2Init, PointR2Tuple} from "./PointR2";
import {SegmentR2Init} from "./SegmentR2";
import {BoxR2Init} from "./BoxR2";
import {CircleR2Init} from "./CircleR2";

export type AnyShape = Shape | PointR2Init | PointR2Tuple | SegmentR2Init | BoxR2Init | CircleR2Init;

export interface Shape {
  contains(that: AnyShape): boolean;

  intersects(that: AnyShape): boolean;
}

export const Shape = {
  fromAny(value: AnyShape): Shape {
    return Shape.R2.fromAny(value as AnyR2Shape);
  },

  /** @hidden */
  isAny(value: unknown): value is AnyShape {
    return Shape.R2.isAny(value);
  },

  /** @hidden */
  is(object: unknown): object is Shape {
    if (typeof object === "object" && object !== null) {
      const shape = object as Shape;
      return typeof shape.contains === "function"
          && typeof shape.intersects === "function";
    }
    return false;
  },

  // Forward type declarations
  /** @hidden */
  R2: void 0 as unknown as typeof R2Shape, // defined by R2Shape
};
