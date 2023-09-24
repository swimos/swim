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
import {Murmur3} from "@swim/util";
import {Lazy} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Objects} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import {R2Box} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import type {GeoShapeLike} from "./GeoShape";
import {GeoShape} from "./GeoShape";
import {GeoPointLike} from "./GeoPoint";
import {GeoPoint} from "./GeoPoint";
import {GeoSegmentLike} from "./GeoSegment";
import {GeoSegment} from "./GeoSegment";
import {GeoBoxLike} from "./"; // forward import
import {GeoBox} from "./"; // forward import

/** @public */
export type GeoTileLike = GeoTile | GeoTileInit | GeoTileTuple;

/** @public */
export const GeoTileLike = {
  [Symbol.hasInstance](instance: unknown): instance is GeoTileLike {
    return instance instanceof GeoTile
        || GeoTileInit[Symbol.hasInstance](instance)
        || GeoTileTuple[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface GeoTileInit {
  /** @internal */
  readonly typeid?: "GeoTileInit";
  x: number;
  y: number;
  z: number;
}

/** @public */
export const GeoTileInit = {
  [Symbol.hasInstance](instance: unknown): instance is GeoTileInit {
    return Objects.hasAllKeys<GeoTileInit>(instance, "x", "y", "z");
  },
};

/** @public */
export type GeoTileTuple = [number, number, number];

/** @public */
export const GeoTileTuple = {
  [Symbol.hasInstance](instance: unknown): instance is GeoTileTuple {
    return Array.isArray(instance) && instance.length === 3;
  },
};

/** @public */
export class GeoTile extends GeoShape implements HashCode, Debug {
  constructor(x: number, y: number, z: number) {
    super();
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /** @internal */
  declare readonly typeid?: "GeoTile";

  override likeType?(like: GeoTileInit | GeoTileTuple): void;

  override isDefined(): boolean {
    return true;
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

  override contains(that: GeoShapeLike): boolean;
  override contains(lng: number, lat: number): boolean;
  override contains(that: GeoShapeLike | number, lat?: number): boolean {
    if (typeof that === "number") {
      return this.lngMin <= that && that <= this.lngMax
          && this.latMin <= lat! && lat! <= this.latMax;
    } else if (GeoPointLike[Symbol.hasInstance](that)) {
      return this.containsPoint(GeoPoint.fromLike(that));
    } else if (GeoSegmentLike[Symbol.hasInstance](that)) {
      return this.containsSegment(GeoSegment.fromLike(that));
    } else if (GeoTileLike[Symbol.hasInstance](that)) {
      return this.containsTile(GeoTile.fromLike(that));
    } else if (GeoBoxLike[Symbol.hasInstance](that)) {
      return this.containsBox(GeoBox.fromLike(that));
    }
    throw new TypeError("" + that);
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

  override intersects(that: GeoShapeLike): boolean {
    if (GeoPointLike[Symbol.hasInstance](that)) {
      return this.intersectsPoint(GeoPoint.fromLike(that));
    } else if (GeoSegmentLike[Symbol.hasInstance](that)) {
      return this.intersectsSegment(GeoSegment.fromLike(that));
    } else if (GeoTileLike[Symbol.hasInstance](that)) {
      return this.intersectsTile(GeoTile.fromLike(that));
    } else if (GeoBoxLike[Symbol.hasInstance](that)) {
      return this.intersectsBox(GeoBox.fromLike(that));
    }
    throw new TypeError("" + that);
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
    }
    return false;
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

  toLike(): GeoTileInit {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
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

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Constructors.hash(GeoTile),
        Numbers.hash(this.x)), Numbers.hash(this.y)), Numbers.hash(this.z)));
  }

  /** @override */
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

  static override fromLike<T extends GeoTileLike | null | undefined>(value: T): GeoTile | Uninitable<T>;
  static override fromLike<T extends GeoShapeLike | null | undefined>(value: T): never;
  static override fromLike<T extends GeoTileLike | null | undefined>(value: T): GeoTile | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof GeoTile) {
      return value as GeoTile | Uninitable<T>;
    } else if (GeoTileInit[Symbol.hasInstance](value)) {
      return GeoTile.fromInit(value);
    } else if (GeoTileTuple[Symbol.hasInstance](value)) {
      return GeoTile.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: GeoTileInit): GeoTile {
    return new GeoTile(init.x, init.y, init.z);
  }

  static fromTuple(tuple: GeoTileTuple): GeoTile {
    return new GeoTile(tuple[0], tuple[1], tuple[2]);
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
