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
import type {R2Shape} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import {GeoPointInit} from "./"; // forward import
import {GeoPointTuple} from "./"; // forward import
import {GeoPoint} from "./"; // forward import
import {GeoSegmentInit} from "./"; // forward import
import {GeoSegment} from "./"; // forward import
import {GeoSplinePoints} from "./"; // forward import
import {GeoSpline} from "./"; // forward import
import {GeoPathSplines} from "./"; // forward import
import {GeoPath} from "./"; // forward import
import {GeoBoxInit} from "./"; // forward import
import {GeoBox} from "./"; // forward import
import {GeoTileInit} from "./"; // forward import
import {GeoTileTuple} from "./"; // forward import
import {GeoTile} from "./"; // forward import

/** @public */
export type GeoShapeLike = GeoShape
                         | GeoPointInit
                         | GeoPointTuple
                         | GeoSegmentInit
                         | GeoSplinePoints
                         | GeoTileInit
                         | GeoTileTuple
                         | GeoBoxInit;

/** @public */
export const GeoShapeLike = {
  [Symbol.hasInstance](instance: unknown): instance is GeoShapeLike {
    return instance instanceof GeoShape
        || GeoPointInit[Symbol.hasInstance](instance)
        || GeoPointTuple[Symbol.hasInstance](instance)
        || GeoSegmentInit[Symbol.hasInstance](instance)
        || GeoSplinePoints[Symbol.hasInstance](instance)
        || GeoPathSplines[Symbol.hasInstance](instance)
        || GeoTileInit[Symbol.hasInstance](instance)
        || GeoTileTuple[Symbol.hasInstance](instance)
        || GeoBoxInit[Symbol.hasInstance](instance);
  },
};

/** @public */
export abstract class GeoShape implements Equals, Equivalent {
  /** @internal */
  declare readonly typeid?: string;

  likeType?(like: GeoPointInit
                | GeoPointTuple
                | GeoSegmentInit
                | GeoSplinePoints
                | GeoPathSplines
                | GeoTileInit
                | GeoTileTuple
                | GeoBoxInit): void;

  abstract isDefined(): boolean;

  abstract readonly lngMin: number;

  abstract readonly latMin: number;

  abstract readonly lngMax: number;

  abstract readonly latMax: number;

  abstract contains(that: GeoShapeLike): boolean;

  abstract contains(lng: number, lat: number): boolean;

  abstract intersects(that: GeoShapeLike): boolean;

  union(that: GeoShapeLike): GeoShape {
    that = GeoShape.fromLike(that);
    return new GeoBox(Math.min(this.lngMin, that.lngMin),
                      Math.min(this.latMin, that.latMin),
                      Math.max(this.lngMax, that.lngMax),
                      Math.max(this.latMax, that.latMax));
  }

  abstract project(f: GeoProjection): R2Shape;

  get bounds(): GeoBox {
    return new GeoBox(this.lngMin, this.latMin, this.lngMax, this.latMax);
  }

  /** @override */
  abstract equivalentTo(that: unknown, epsilon?: number): boolean

  /** @override */
  abstract equals(that: unknown): boolean;

  static fromLike<T extends GeoShapeLike | null | undefined>(value: T): GeoShape | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof GeoShape) {
      return value as GeoShape | Uninitable<T>;
    } else if (GeoPointInit[Symbol.hasInstance](value)) {
      return GeoPoint.fromInit(value);
    } else if (GeoPointTuple[Symbol.hasInstance](value)) {
      return GeoPoint.fromTuple(value);
    } else if (GeoSegmentInit[Symbol.hasInstance](value)) {
      return GeoSegment.fromInit(value);
    } else if (GeoSplinePoints[Symbol.hasInstance](value)) {
      return GeoSpline.fromPoints(value);
    } else if (GeoPathSplines[Symbol.hasInstance](value)) {
      return GeoPath.fromSplines(value);
    } else if (GeoTileInit[Symbol.hasInstance](value)) {
      return GeoTile.fromInit(value);
    } else if (GeoTileTuple[Symbol.hasInstance](value)) {
      return GeoTile.fromTuple(value);
    } else if (GeoBoxInit[Symbol.hasInstance](value)) {
      return GeoBox.fromInit(value);
    }
    throw new TypeError("" + value);
  }
}
