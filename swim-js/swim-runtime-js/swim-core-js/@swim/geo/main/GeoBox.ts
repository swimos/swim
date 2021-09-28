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

import {
  Lazy,
  Equivalent,
  HashCode,
  Murmur3,
  Numbers,
  Constructors,
  Interpolate,
  Interpolator,
} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import {R2Box} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import {AnyGeoShape, GeoShape} from "./GeoShape";
import {AnyGeoPoint, GeoPoint} from "./GeoPoint";
import {GeoSegment} from "./GeoSegment";
import {GeoTile} from "./GeoTile";
import {GeoBoxInterpolator} from "./"; // forward import

export type AnyGeoBox = GeoBox | GeoBoxInit;

export interface GeoBoxInit {
  lngMin: number;
  latMin: number;
  lngMax: number;
  latMax: number;
}

export class GeoBox extends GeoShape implements Interpolate<GeoBox>, HashCode, Equivalent, Debug {
  constructor(lngMin: number, latMin: number, lngMax: number, latMax: number) {
    super();
    this.lngMin = lngMin;
    this.latMin = latMin;
    this.lngMax = lngMax;
    this.latMax = latMax;
  }

  isDefined(): boolean {
    return isFinite(this.lngMin) && isFinite(this.latMin)
        && isFinite(this.lngMax) && isFinite(this.latMax);
  }

  readonly lngMin: number;

  readonly latMin: number;

  readonly lngMax: number;

  readonly latMax: number;

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

  override contains(that: AnyGeoPoint | AnyGeoBox): boolean;
  override contains(lng: number, lat: number): boolean;
  override contains(that: AnyGeoPoint | AnyGeoBox | number, y?: number): boolean {
    if (typeof that === "number") {
      return this.lngMin <= that && that <= this.lngMax
          && this.latMin <= y! && y! <= this.latMax;
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

  /** @hidden */
  containsPoint(that: GeoPoint): boolean {
    return this.lngMin <= that.lng && that.lng <= this.lngMax
        && this.latMin <= that.lat && that.lat <= this.latMax;
  }

  /** @hidden */
  containsSegment(that: GeoSegment): boolean {
    return this.lngMin <= that.lng0 && that.lng0 <= this.lngMax
        && this.latMin <= that.lat0 && that.lat0 <= this.latMax
        && this.lngMin <= that.lng1 && that.lng1 <= this.lngMax
        && this.latMin <= that.lat1 && that.lat1 <= this.latMax;
  }

  /** @hidden */
  containsTile(that: GeoTile): boolean {
    return this.lngMin <= that.lngMin && that.lngMax <= this.lngMax
        && this.latMin <= that.latMin && that.latMax <= this.latMax;
  }

  /** @hidden */
  containsBox(that: GeoBox): boolean {
    return this.lngMin <= that.lngMin && that.lngMax <= this.lngMax
        && this.latMin <= that.latMin && that.latMax <= this.latMax;
  }

  override intersects(that: AnyGeoPoint | AnyGeoBox): boolean {
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

  /** @hidden */
  intersectsPoint(that: GeoPoint): boolean {
    return this.lngMin <= that.lng && that.lng <= this.lngMax
        && this.latMin <= that.lat && that.lat <= this.latMax;
  }

  /** @hidden */
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

  /** @hidden */
  intersectsTile(that: GeoTile): boolean {
    return this.lngMin <= that.lngMax && that.lngMin <= this.lngMax
        && this.latMin <= that.latMax && that.latMin <= this.latMax;
  }

  /** @hidden */
  intersectsBox(that: GeoBox): boolean {
    return this.lngMin <= that.lngMax && that.lngMin <= this.lngMax
        && this.latMin <= that.latMax && that.latMin <= this.latMax;
  }

  override union(that: AnyGeoShape): GeoBox {
    return super.union(that) as GeoBox;
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

  override get bounds(): GeoBox {
    return this;
  }

  toAny(): GeoBoxInit {
    return {
      lngMin: this.lngMin,
      latMin: this.latMin,
      lngMax: this.lngMax,
      latMax: this.latMax,
    };
  }

  interpolateTo(that: GeoBox): Interpolator<GeoBox>;
  interpolateTo(that: unknown): Interpolator<GeoBox> | null;
  interpolateTo(that: unknown): Interpolator<GeoBox> | null {
    if (that instanceof GeoBox) {
      return GeoBoxInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoBox) {
      return Numbers.equivalent(this.lngMin, that.lngMin, epsilon)
          && Numbers.equivalent(this.latMin, that.latMin, epsilon)
          && Numbers.equivalent(this.lngMax, that.lngMax, epsilon)
          && Numbers.equivalent(this.latMax, that.latMax, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoBox) {
      return this.lngMin === that.lngMin && this.latMin === that.latMin
          && this.lngMax === that.lngMax && this.latMax === that.latMax;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(GeoBox), Numbers.hash(this.lngMin)), Numbers.hash(this.latMin)),
        Numbers.hash(this.lngMax)), Numbers.hash(this.latMax)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("GeoBox").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.lngMin).write(", ").debug(this.latMin).write(", ")
                   .debug(this.lngMax).write(", ").debug(this.latMax).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static undefined(): GeoBox {
    return new GeoBox(Infinity, Infinity, -Infinity, -Infinity);
  }

  @Lazy
  static globe(): GeoBox {
    return new GeoBox(-180, -90, 180, 90);
  }

  static of(lngMin: number, latMin: number, lngMax?: number, latMax?: number): GeoBox {
    if (lngMax === void 0) {
      lngMax = lngMin;
    }
    if (latMax === void 0) {
      latMax = latMin;
    }
    return new GeoBox(lngMin, latMin, lngMax, latMax);
  }

  static fromInit(value: GeoBoxInit): GeoBox {
    return new GeoBox(value.lngMin, value.latMin, value.lngMax, value.latMax);
  }

  static override fromAny(value: AnyGeoBox): GeoBox {
    if (value === void 0 || value === null || value instanceof GeoBox) {
      return value;
    } else if (GeoBox.isInit(value)) {
      return GeoBox.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is GeoBoxInit {
    if (typeof value === "object" && value !== null) {
      const init = value as GeoBoxInit;
      return typeof init.lngMin === "number"
          && typeof init.latMin === "number"
          && typeof init.lngMax === "number"
          && typeof init.latMax === "number";
    }
    return false;
  }

  /** @hidden */
  static override isAny(value: unknown): value is AnyGeoBox {
    return value instanceof GeoBox
        || GeoBox.isInit(value);
  }
}
