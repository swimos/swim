// Copyright 2015-2021 Swim inc.
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

import type {Equals} from "@swim/util";
import type {R2Shape} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import {GeoPointInit, GeoPointTuple, GeoPoint} from "./"; // forward import
import {GeoSegmentInit, GeoSegment} from "./"; // forward import
import {GeoBoxInit, GeoBox} from "./"; // forward import
import {GeoTileInit, GeoTileTuple, GeoTile} from "./"; // forward import

export type AnyGeoShape = GeoShape | GeoPointInit | GeoPointTuple | GeoSegmentInit | GeoTileInit | GeoTileTuple | GeoBoxInit;

export abstract class GeoShape implements Equals {
  abstract readonly lngMin: number;

  abstract readonly latMin: number;

  abstract readonly lngMax: number;

  abstract readonly latMax: number;

  abstract contains(that: AnyGeoShape): boolean;

  abstract contains(lng: number, lat: number): boolean;

  abstract intersects(that: AnyGeoShape): boolean;

  union(that: AnyGeoShape): GeoShape {
    that = GeoShape.fromAny(that);
    return new GeoBox(Math.min(this.lngMin, that.lngMin),
                      Math.min(this.latMin, that.latMin),
                      Math.max(this.lngMax, that.lngMax),
                      Math.max(this.latMax, that.latMax));
  }

  abstract project(f: GeoProjection): R2Shape;

  get bounds(): GeoBox {
    return new GeoBox(this.lngMin, this.latMin, this.lngMax, this.latMax);
  }

  abstract equals(that: unknown): boolean;

  static fromAny(value: AnyGeoShape): GeoShape {
    if (value === void 0 || value === null || value instanceof GeoShape) {
      return value;
    } else if (GeoPoint.isInit(value)) {
      return GeoPoint.fromInit(value);
    } else if (GeoPoint.isTuple(value)) {
      return GeoPoint.fromTuple(value);
    } else if (GeoSegment.isInit(value)) {
      return GeoSegment.fromInit(value);
    } else if (GeoTile.isInit(value)) {
      return GeoTile.fromInit(value);
    } else if (GeoTile.isTuple(value)) {
      return GeoTile.fromTuple(value);
    } else if (GeoBox.isInit(value)) {
      return GeoBox.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyGeoShape {
    return value instanceof GeoShape
        || GeoPoint.isInit(value)
        || GeoPoint.isTuple(value)
        || GeoSegment.isInit(value)
        || GeoTile.isInit(value)
        || GeoBox.isInit(value);
  }
}
