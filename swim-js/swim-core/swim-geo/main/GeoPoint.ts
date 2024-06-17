// Copyright 2015-2024 Nstream, inc.
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
import type {Mutable} from "@swim/util";
import {Murmur3} from "@swim/util";
import {Lazy} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Equivalent} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Objects} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {R2Point} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import type {GeoShapeLike} from "./GeoShape";
import {GeoShape} from "./GeoShape";

/** @public */
export type GeoPointLike = GeoPoint | GeoPointInit | GeoPointTuple;

/** @public */
export const GeoPointLike = {
  [Symbol.hasInstance](instance: unknown): instance is GeoPointLike {
    return instance instanceof GeoPoint
        || GeoPointInit[Symbol.hasInstance](instance)
        || GeoPointTuple[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface GeoPointInit {
  /** @internal */
  readonly typeid?: "GeoPointInit";
  lng: number;
  lat: number;
}

/** @public */
export const GeoPointInit = {
  [Symbol.hasInstance](instance: unknown): instance is GeoPointInit {
    return Objects.hasAllKeys<GeoPointInit>(instance, "lng", "lat");
  },
};

/** @public */
export type GeoPointTuple = [number, number];

/** @public */
export const GeoPointTuple = {
  [Symbol.hasInstance](instance: unknown): instance is GeoPointTuple {
    return Array.isArray(instance) && instance.length === 2
        && typeof instance[0] === "number"
        && typeof instance[1] === "number";
  },
};

/**
 * A geographic point represented by a WGS84 longitude and latitude.
 * @public
 */
export class GeoPoint extends GeoShape implements Interpolate<GeoPoint>, HashCode, Debug {
  constructor(lng: number, lat: number) {
    super();
    this.lng = lng;
    this.lat = lat;
  }

  /** @internal */
  declare readonly typeid?: "GeoPoint";

  override likeType?(like: GeoPointInit | GeoPointTuple): void;

  override isDefined(): boolean {
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

  override contains(that: GeoShapeLike): boolean;
  override contains(lng: number, lat: number): boolean;
  override contains(that: GeoShapeLike | number, lat?: number): boolean {
    if (typeof that === "number") {
      return this.lng === that && this.lat === lat!;
    }
    that = GeoShape.fromLike(that);
    if (that instanceof GeoPoint) {
      return this.lng === that.lng && this.lat === that.lat;
    } else if (that instanceof GeoShape) {
      return this.lng <= that.lngMin && that.lngMax <= this.lng
          && this.lat <= that.latMin && that.latMax <= this.lat;
    }
    return false;
  }

  override intersects(that: GeoShapeLike): boolean {
    that = GeoShape.fromLike(that);
    return that.intersects(this);
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
    }
    return new GeoPoint(newLng, newLat);
  }

  toLike(): GeoPointInit {
    return {
      lng: this.lng,
      lat: this.lat,
    };
  }

  /** @override */
  interpolateTo(that: GeoPoint): Interpolator<GeoPoint>;
  interpolateTo(that: unknown): Interpolator<GeoPoint> | null;
  interpolateTo(that: unknown): Interpolator<GeoPoint> | null {
    if (that instanceof GeoPoint) {
      return GeoPointInterpolator(this, that);
    }
    return null;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
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

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(GeoPoint),
        Numbers.hash(this.lng)), Numbers.hash(this.lat)));
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("GeoPoint").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.lng).write(", ").debug(this.lat).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static undefined(): GeoPoint {
    return new GeoPoint(NaN, NaN);
  }

  @Lazy
  static origin(): GeoPoint {
    return new GeoPoint(0, 0);
  }

  static of(lng: number, lat: number): GeoPoint {
    return new GeoPoint(lng, lat);
  }

  static override fromLike<T extends GeoPointLike | null | undefined>(value: T): GeoPoint | Uninitable<T>;
  static override fromLike<T extends GeoShapeLike | null | undefined>(value: T): never;
  static override fromLike<T extends GeoPointLike | null | undefined>(value: T): GeoPoint | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof GeoPoint) {
      return value as GeoPoint | Uninitable<T>;
    } else if (GeoPointInit[Symbol.hasInstance](value)) {
      return GeoPoint.fromInit(value);
    } else if (GeoPointTuple[Symbol.hasInstance](value)) {
      return GeoPoint.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: GeoPointInit): GeoPoint {
    return new GeoPoint(init.lng, init.lat);
  }

  static fromTuple(tuple: GeoPointTuple): GeoPoint {
    return new GeoPoint(tuple[0], tuple[1]);
  }

  static normalized(lng: number, lat: number): GeoPoint {
    lng = GeoPoint.normalizeLng(lng);
    lat = GeoPoint.normalizeLat(lat);
    return new GeoPoint(lng, lat);
  }

  /** @internal */
  static normalizeLng(lng: number): number {
    if (lng < -180) {
      lng = 180 - (-lng + 180) % 360;
    } else if (lng > 180) {
      lng = -180 + (lng - 180) % 360;
    }
    return lng;
  }

  /** @internal */
  static normalizeLat(lat: number): number {
    lat = Math.min(Math.max(-90 + Equivalent.Epsilon, lat), 90 - Equivalent.Epsilon);
    return lat;
  }
}

/** @internal */
export const GeoPointInterpolator = (function (_super: typeof Interpolator) {
  const GeoPointInterpolator = function (p0: GeoPoint, p1: GeoPoint): Interpolator<GeoPoint> {
    const interpolator = function (u: number): GeoPoint {
      const p0 = interpolator[0];
      const lng0 = p0.lng;
      const lat0 = p0.lat;
      const p1 = interpolator[1];
      const lng1 = p1.lng;
      const lat1 = p1.lat;
      let lng: number;
      if (lng0 > 0 && lng1 < 0 && lng0 - lng1 > 180) {
        // east across anti-meridian
        const w = 180 - lng0;
        const e = 180 + lng1;
        const uw = w / (w + e);
        if (u < uw) {
          lng = lng0 + (u / uw) * w;
        } else {
          const ue = 1 - uw;
          lng = -180 + ((u - uw) / ue) * e;
        }
      } else if (lng0 < 0 && lng1 > 0 && lng1 - lng0 > 180) {
        // west across anti-meridian
        const e = 180 + lng0;
        const w = 180 - lng1;
        const ue = e / (e + w);
        if (u < ue) {
          lng = lng0 - (u / ue) * e;
        } else {
          const uw = 1 - ue;
          lng = 180 - ((u - ue) / uw) * w;
        }
      } else {
        lng = lng0 + u * (lng1 - lng0);
      }
      const lat = lat0 + u * (lat1 - lat0);
      return new GeoPoint(lng, lat);
    } as Interpolator<GeoPoint>;
    Object.setPrototypeOf(interpolator, GeoPointInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = p0.normalized();
    (interpolator as Mutable<typeof interpolator>)[1] = p1.normalized();
    return interpolator;
  } as {
    (p0: GeoPoint, p1: GeoPoint): Interpolator<GeoPoint>;

    /** @internal */
    prototype: Interpolator<GeoPoint>;
  };

  GeoPointInterpolator.prototype = Object.create(_super.prototype);
  GeoPointInterpolator.prototype.constructor = GeoPointInterpolator;

  return GeoPointInterpolator;
})(Interpolator);
