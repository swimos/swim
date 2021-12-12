// Copyright 2015-2021 Swim.inc
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

import {Equivalent, HashCode, Lazy, Murmur3, Numbers, Constructors} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import {R2Box} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import {AnyGeoShape, GeoShape} from "./GeoShape";
import {GeoPoint} from "./GeoPoint";
import {GeoBox} from "./GeoBox";
import {GeoSegment} from "./GeoSegment";

/** @public */
export type AnyGeoTile = GeoTile | GeoTileInit | GeoTileTuple;

/** @public */
export interface GeoTileInit {
  x: number;
  y: number;
  z: number;
}

/** @public */
export type GeoTileTuple = [number, number, number];

/** @public */
export class GeoTile extends GeoShape implements HashCode, Equivalent, Debug {
  constructor(x: number, y: number, z: number) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }

  readonly x: number;

  readonly y: number;

  readonly z: number;

  override get lngMin(): number {
    return GeoTile.unprojectX(this.x / (1 << this.z));
  }

  override get latMin(): number {
    return GeoTile.unprojectY(this.y / (1 << this.z));
  }

  override get lngMax(): number {
    return GeoTile.unprojectX((this.x + 1) / (1 << this.z));
  }

  override get latMax(): number {
    return GeoTile.unprojectY((this.y + 1) / (1 << this.z));
  }

  get west(): number {
    return this.lngMin;
  }

  get south(): number {
    return this.latMin;
  }

  get east(): number {
    return this.lngMax;
  }

  get north(): number {
    return this.latMax;
  }

  get southWest(): GeoPoint {
    return new GeoPoint(this.lngMin, this.latMin);
  }

  get northWest(): GeoPoint {
    return new GeoPoint(this.lngMin, this.latMax);
  }

  get southEast(): GeoPoint {
    return new GeoPoint(this.lngMax, this.latMin);
  }

  get northEast(): GeoPoint {
    return new GeoPoint(this.lngMax, this.latMax);
  }

  get center(): GeoPoint {
    return new GeoPoint((this.lngMin + this.lngMax) / 2,
                        (this.latMin + this.latMax) / 2);
  }

  get southWestTile(): GeoTile {
    return new GeoTile(this.x * 2, this.y * 2, this.z + 1);
  }

  get northWestTile(): GeoTile {
    return new GeoTile(this.x * 2, this.y * 2 + 1, this.z + 1);
  }

  get southEastTile(): GeoTile {
    return new GeoTile(this.x * 2 + 1, this.y * 2, this.z + 1);
  }

  get northEastTile(): GeoTile {
    return new GeoTile(this.x * 2 + 1, this.y * 2 + 1, this.z + 1);
  }

  get parentTile(): GeoTile {
    return new GeoTile(this.x >> 1, this.y >> 1, this.z - 1);
  }

  override contains(that: AnyGeoShape): boolean;
  override contains(lng: number, lat: number): boolean;
  override contains(that: AnyGeoShape | number, lat?: number): boolean {
    if (typeof that === "number") {
      return this.lngMin <= that && that <= this.lngMax
          && this.latMin <= lat! && lat! <= this.latMax;
    } else if (GeoPoint.isAny(that)) {
      return this.containsPoint(GeoPoint.fromAny(that));
    } else if (GeoSegment.isAny(that)) {
      return this.containsSegment(GeoSegment.fromAny(that));
    } else if (GeoTile.isAny(that)) {
      return this.containsTile(GeoTile.fromAny(that));
    } else if (GeoBox.isAny(that)) {
      return this.containsBox(GeoBox.fromAny(that));
    } else {
      throw new TypeError("" + that);
    }
  }

  /** @internal */
  containsPoint(that: GeoPoint): boolean {
    return this.lngMin <= that.lng && that.lng <= this.lngMax
        && this.latMin <= that.lat && that.lat <= this.latMax;
  }

  /** @internal */
  containsSegment(that: GeoSegment): boolean {
    return this.lngMin <= that.lng0 && that.lng0 <= this.lngMax
        && this.latMin <= that.lat0 && that.lat0 <= this.latMax
        && this.lngMin <= that.lng1 && that.lng1 <= this.lngMax
        && this.latMin <= that.lat1 && that.lat1 <= this.latMax;
  }

  /** @internal */
  containsTile(that: GeoTile): boolean {
    return this.lngMin <= that.lngMin && that.lngMax <= this.lngMax
        && this.latMin <= that.latMin && that.latMax <= this.latMax;
  }

  /** @internal */
  containsBox(that: GeoBox): boolean {
    return this.lngMin <= that.lngMin && that.lngMax <= this.lngMax
        && this.latMin <= that.latMin && that.latMax <= this.latMax;
  }

  override intersects(that: AnyGeoShape): boolean {
    if (GeoPoint.isAny(that)) {
      return this.intersectsPoint(GeoPoint.fromAny(that));
    } else if (GeoSegment.isAny(that)) {
      return this.intersectsSegment(GeoSegment.fromAny(that));
    } else if (GeoTile.isAny(that)) {
      return this.intersectsTile(GeoTile.fromAny(that));
    } else if (GeoBox.isAny(that)) {
      return this.intersectsBox(GeoBox.fromAny(that));
    } else {
      throw new TypeError("" + that);
    }
  }

  /** @internal */
  intersectsPoint(that: GeoPoint): boolean {
    return this.lngMin <= that.lng && that.lng <= this.lngMax
        && this.latMin <= that.lat && that.lat <= this.latMax;
  }

  /** @internal */
  intersectsSegment(that: GeoSegment): boolean {
    const lngMin = this.lngMin;
    const latMin = this.latMin;
    const lngMax = this.lngMax;
    const latMax = this.latMax;
    const lng0 = that.lng0;
    const lat0 = that.lat0;
    const lng1 = that.lng1;
    const lat1 = that.lat1;
    if (lng0 < lngMin && lng1 < lngMin || lng0 > lngMax && lng1 > lngMax ||
        lat0 < latMin && lat1 < latMin || lat0 > latMax && lat1 > latMax) {
      return false;
    } else if (lng0 > lngMin && lng0 < lngMax && lat0 > latMin && lat0 < latMax) {
      return true;
    } else if ((R2Box.intersectsSegment(lng0 - lngMin, lng1 - lngMin, lng0, lat0, lng1, lat1) && R2Box.hitY > latMin && R2Box.hitY < latMax)
            || (R2Box.intersectsSegment(lat0 - latMin, lat1 - latMin, lng0, lat0, lng1, lat1) && R2Box.hitX > lngMin && R2Box.hitX < lngMax)
            || (R2Box.intersectsSegment(lng0 - lngMax, lng1 - lngMax, lng0, lat0, lng1, lat1) && R2Box.hitY > latMin && R2Box.hitY < latMax)
            || (R2Box.intersectsSegment(lat0 - latMax, lat1 - latMax, lng0, lat0, lng1, lat1) && R2Box.hitX > lngMin && R2Box.hitX < lngMax)) {
      return true;
    } else {
      return false;
    }
  }

  /** @internal */
  intersectsTile(that: GeoTile): boolean {
    return this.lngMin <= that.lngMax && that.lngMin <= this.lngMax
        && this.latMin <= that.latMax && that.latMin <= this.latMax;
  }

  /** @internal */
  intersectsBox(that: GeoBox): boolean {
    return this.lngMin <= that.lngMax && that.lngMin <= this.lngMax
        && this.latMin <= that.latMax && that.latMin <= this.latMax;
  }

  override project(f: GeoProjection): R2Box {
    const bottomLeft = f.project(this.lngMin, this.latMin);
    const topRight = f.project(this.lngMax, this.latMax);
    let xMin = bottomLeft.x;
    let yMin = bottomLeft.y;
    let xMax = topRight.x;
    let yMax = topRight.y;
    if (xMin > xMax) {
      const x = xMin;
      xMin = xMax;
      xMax = x;
    }
    if (yMin > yMax) {
      const y = yMin;
      yMin = yMax;
      yMax = y;
    }
    if (!isFinite(xMin)) {
      xMin = -Infinity;
    }
    if (!isFinite(yMin)) {
      yMin = -Infinity;
    }
    if (!isFinite(xMax)) {
      xMax = Infinity;
    }
    if (!isFinite(yMax)) {
      yMax = Infinity;
    }
    return new R2Box(xMin, yMin, xMax, yMax);
  }

  toAny(): GeoTileInit {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoTile) {
      return Numbers.equivalent(this.x, that.x, epsilon)
          && Numbers.equivalent(this.y, that.y, epsilon)
          && Numbers.equivalent(this.z, that.z, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoTile) {
      return this.x === that.x && this.y === that.y && this.z === that.z;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Constructors.hash(GeoTile),
        Numbers.hash(this.x)), Numbers.hash(this.y)), Numbers.hash(this.z)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("GeoTile").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.x).write(", ").debug(this.y).write(", ")
                   .debug(this.z).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static root(): GeoTile {
    return new GeoTile(0, 0, 0);
  }

  static of(x: number, y: number, z: number): GeoTile {
    return new GeoTile(x, y, z);
  }

  static fromInit(value: GeoTileInit): GeoTile {
    return new GeoTile(value.x, value.y, value.z);
  }

  static fromTuple(value: GeoTileTuple): GeoTile {
    return new GeoTile(value[0], value[1], value[2]);
  }

  static override fromAny(value: AnyGeoTile): GeoTile {
    if (value === void 0 || value === null || value instanceof GeoTile) {
      return value;
    } else if (GeoTile.isInit(value)) {
      return GeoTile.fromInit(value);
    } else if (GeoTile.isTuple(value)) {
      return GeoTile.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  /** @internal */
  static isInit(value: unknown): value is GeoTileInit {
    if (typeof value === "object" && value !== null) {
      const init = value as GeoTileInit;
      return typeof init.x === "number"
          && typeof init.y === "number"
          && typeof init.z === "number";
    }
    return false;
  }

  /** @internal */
  static isTuple(value: unknown): value is GeoTileTuple {
    return Array.isArray(value)
        && value.length === 3
        && typeof value[0] === "number"
        && typeof value[1] === "number"
        && typeof value[2] === "number";
  }

  /** @internal */
  static override isAny(value: unknown): value is AnyGeoTile {
    return value instanceof GeoTile
        || GeoTile.isInit(value)
        || GeoTile.isTuple(value);
  }

  /** @internal */
  static unprojectX(x: number): number {
    return (x * Math.PI * 2 - Math.PI) * (180 / Math.PI);
  }

  /** @internal */
  static unprojectY(y: number): number {
    return (Math.atan(Math.exp(y * Math.PI * 2 - Math.PI)) * 2 - Math.PI / 2) * (180 / Math.PI);
  }
}
