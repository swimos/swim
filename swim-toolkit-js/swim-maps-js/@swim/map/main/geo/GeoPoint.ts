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

import {HashCode, Murmur3} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {PointR2} from "@swim/math";
import {GeoProjection} from "./GeoProjection";

export type AnyGeoPoint = GeoPoint | GeoPointInit | GeoPointTuple;

export interface GeoPointInit {
  lng: number;
  lat: number;
}

export type GeoPointTuple = [number, number];

/**
 * A geographic point represented by a WGS84 longitude and latitude.
 */
export class GeoPoint implements HashCode, Debug {
  /** @hidden */
  readonly _lng: number;
  /** @hidden */
  readonly _lat: number;

  constructor(lng: number, lat: number) {
    this._lng = lng;
    this._lat = lat;
  }

  get lng(): number {
    return this._lng;
  }

  get lat(): number {
    return this._lat;
  }

  project(projection: GeoProjection): PointR2 {
    return projection.project(this);
  }

  toAny(): GeoPointInit {
    return {
      lng: this._lng,
      lat: this._lat,
    };
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoPoint) {
      return this._lng === that._lng && this._lat === that._lat;
    }
    return false;
  }

  hashCode(): number {
    if (GeoPoint._hashSeed === void 0) {
      GeoPoint._hashSeed = Murmur3.seed(GeoPoint);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(GeoPoint._hashSeed,
        Murmur3.hash(this._lng)), Murmur3.hash(this._lat)));
  }

  debug(output: Output): void {
    output = output.write("GeoPoint").write(46/*'.'*/).write("from").write(40/*'('*/)
        .debug(this._lng).write(", ").debug(this._lat).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;

  private static _origin?: GeoPoint;

  static origin(): GeoPoint {
    if (GeoPoint._origin === void 0) {
      GeoPoint._origin = new GeoPoint(0, 0);
    }
    return GeoPoint._origin;
  }

  static from(lng: number, lat: number): GeoPoint {
    return new GeoPoint(lng, lat);
  }

  static fromInit(value: GeoPointInit): GeoPoint {
    return new GeoPoint(value.lng, value.lat);
  }

  static fromTuple(value: GeoPointTuple): GeoPoint {
    return new GeoPoint(value[0], value[1]);
  }

  static fromAny(value: AnyGeoPoint): GeoPoint {
    if (value instanceof GeoPoint) {
      return value;
    } else if (GeoPoint.isInit(value)) {
      return GeoPoint.fromInit(value);
    } else if (GeoPoint.isTuple(value)) {
      return GeoPoint.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is GeoPointInit {
    if (typeof value === "object" && value !== null) {
      const init = value as GeoPointInit;
      return typeof init.lng === "number"
          && typeof init.lat === "number";
    }
    return false;
  }

  /** @hidden */
  static isTuple(value: unknown): value is GeoPointTuple {
    return Array.isArray(value)
        && value.length === 2
        && typeof value[0] === "number"
        && typeof value[1] === "number";
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyGeoPoint {
    return value instanceof GeoPoint
        || GeoPoint.isInit(value)
        || GeoPoint.isTuple(value);
  }
}
