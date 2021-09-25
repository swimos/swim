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

import {Equivalent, HashCode, Lazy, Murmur3, Numbers, Constructors} from "@swim/util";
import {Output, Debug, Format} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import type {R2Point} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import {AnyGeoShape, GeoShape} from "./GeoShape";
import {GeoPointInterpolator} from "./"; // forward import

export type AnyGeoPoint = GeoPoint | GeoPointInit | GeoPointTuple;

export interface GeoPointInit {
  lng: number;
  lat: number;
}

export type GeoPointTuple = [number, number];

/**
 * A geographic point represented by a WGS84 longitude and latitude.
 */
export class GeoPoint extends GeoShape implements Interpolate<GeoPoint>, HashCode, Equivalent, Debug {
  constructor(lng: number, lat: number) {
    super();
    this.lng = lng;
    this.lat = lat;
  }

  isDefined(): boolean {
    return isFinite(this.lng) && isFinite(this.lat);
  }

  readonly lng: number;

  readonly lat: number;

  override get lngMin(): number {
    return this.lng;
  }

  override get latMin(): number {
    return this.lat;
  }

  override get lngMax(): number {
    return this.lng;
  }

  override get latMax(): number {
    return this.lat;
  }

  override contains(that: AnyGeoShape): boolean;
  override contains(lng: number, lat: number): boolean;
  override contains(that: AnyGeoShape | number, lat?: number): boolean {
    if (typeof that === "number") {
      return this.lng === that && this.lat === lat!;
    } else {
      that = GeoShape.fromAny(that);
      if (that instanceof GeoPoint) {
        return this.lng === that.lng && this.lat === that.lat;
      } else if (that instanceof GeoShape) {
        return this.lng <= that.lngMin && that.lngMax <= this.lng
            && this.lat <= that.latMin && that.latMax <= this.lat;
      }
      return false;
    }
  }

  override intersects(that: AnyGeoShape): boolean {
    that = GeoShape.fromAny(that);
    return (that as GeoShape).intersects(this);
  }

  override project(f: GeoProjection): R2Point {
    return f.project(this);
  }

  normalized(): GeoPoint {
    const oldLng = this.lng;
    const oldLat = this.lat;
    const newLng = GeoPoint.normalizeLng(oldLng);
    const newLat = GeoPoint.normalizeLat(oldLat);
    if (oldLng === newLng && oldLat === newLat) {
      return this;
    } else {
      return new GeoPoint(newLng, newLat);
    }
  }

  toAny(): GeoPointInit {
    return {
      lng: this.lng,
      lat: this.lat,
    };
  }

  interpolateTo(that: GeoPoint): Interpolator<GeoPoint>;
  interpolateTo(that: unknown): Interpolator<GeoPoint> | null;
  interpolateTo(that: unknown): Interpolator<GeoPoint> | null {
    if (that instanceof GeoPoint) {
      return GeoPointInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoPoint) {
      return Numbers.equivalent(this.lng, that.lng, epsilon)
          && Numbers.equivalent(this.lat, that.lat, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoPoint) {
      return this.lng === that.lng && this.lat === that.lat;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(GeoPoint),
        Numbers.hash(this.lng)), Numbers.hash(this.lat)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("GeoPoint").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.lng).write(", ").debug(this.lat).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static origin(): GeoPoint {
    return new GeoPoint(0, 0);
  }

  @Lazy
  static undefined(): GeoPoint {
    return new GeoPoint(NaN, NaN);
  }

  static of(lng: number, lat: number): GeoPoint {
    return new GeoPoint(lng, lat);
  }

  static fromInit(value: GeoPointInit): GeoPoint {
    return new GeoPoint(value.lng, value.lat);
  }

  static fromTuple(value: GeoPointTuple): GeoPoint {
    return new GeoPoint(value[0], value[1]);
  }

  static override fromAny(value: AnyGeoPoint): GeoPoint {
    if (value === void 0 || value === null || value instanceof GeoPoint) {
      return value;
    } else if (GeoPoint.isInit(value)) {
      return GeoPoint.fromInit(value);
    } else if (GeoPoint.isTuple(value)) {
      return GeoPoint.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  static normalized(lng: number, lat: number): GeoPoint {
    lng = GeoPoint.normalizeLng(lng);
    lat = GeoPoint.normalizeLat(lat);
    return new GeoPoint(lng, lat);
  }

  /** @hidden */
  static normalizeLng(lng: number): number {
    if (lng < -180) {
      lng = 180 - (-lng + 180) % 360;
    } else if (lng > 180) {
      lng = -180 + (lng - 180) % 360;
    }
    return lng;
  }

  /** @hidden */
  static normalizeLat(lat: number): number {
    lat = Math.min(Math.max(-90 + Equivalent.Epsilon, lat), 90 - Equivalent.Epsilon);
    return lat;
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
  static override isAny(value: unknown): value is AnyGeoPoint {
    return value instanceof GeoPoint
        || GeoPoint.isInit(value)
        || GeoPoint.isTuple(value);
  }
}
