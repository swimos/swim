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

import {R2Shape} from "./R2Shape";
import {PointR2Init} from "./PointR2";
import {SegmentR2Init} from "./SegmentR2";
import {BoxR2Init} from "./BoxR2";
import {CircleR2Init} from "./CircleR2";

export type AnyShape = Shape | PointR2Init | SegmentR2Init | BoxR2Init | CircleR2Init | [number, number];

export interface Shape {
  contains(that: AnyShape): boolean;

  intersects(that: AnyShape): boolean;
}

export const Shape = {
  fromAny(shape: AnyShape): Shape {
    if (shape instanceof Shape.R2) {
      return shape;
    } else if (typeof shape === "object" && shape) {
      if (Array.isArray(shape)) {
        if (shape.length === 2) {
          return new Shape.R2.Point(shape[0], shape[1]);
        } else {
          throw new TypeError("" + shape);
        }
      }
      const point = shape as PointR2Init;
      if (typeof point.x === "number" && typeof point.y === "number") {
        return new Shape.R2.Point(point.x, point.y);
      }
      const segment = shape as SegmentR2Init;
      if (typeof segment.x0 === "number" && typeof segment.y0 === "number"
          && typeof segment.x1 === "number" && typeof segment.y1 === "number") {
        return new Shape.R2.Segment(segment.x0, segment.y0, segment.x1, segment.y1);
      }
      const box = shape as BoxR2Init;
      if (typeof box.xMin === "number" && typeof box.yMin === "number"
          && typeof box.xMax === "number" && typeof box.yMax === "number") {
        return new Shape.R2.Box(box.xMin, box.yMin, box.xMax, box.yMax);
      }
      const circle = shape as CircleR2Init;
      if (typeof circle.cx === "number" && typeof circle.cy === "number"
          && typeof circle.r === "number") {
        return new Shape.R2.Circle(circle.cx, circle.cy, circle.r);
      }
    }
    throw new TypeError("" + shape);
  },

  /** @hidden */
  is(object: unknown): object is Shape {
    if (typeof object === "object" && object) {
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
