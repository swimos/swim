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
import type {Mutable} from "@swim/util";
import {Murmur3} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Objects} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import {R2Segment} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import type {GeoShapeLike} from "./GeoShape";
import {GeoShape} from "./GeoShape";
import {GeoPoint} from "./GeoPoint";
import {GeoCurve} from "./GeoCurve";

/** @public */
export type GeoSegmentLike = GeoSegment | GeoSegmentInit;

/** @public */
export const GeoSegmentLike = {
  [Symbol.hasInstance](instance: unknown): instance is GeoSegmentLike {
    return instance instanceof GeoSegment
        || GeoSegmentInit[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface GeoSegmentInit {
  /** @internal */
  readonly typeid?: "GeoSegmentInit";
  lng0: number;
  lat0: number;
  lng1: number;
  lat1: number;
}

/** @public */
export const GeoSegmentInit = {
  [Symbol.hasInstance](instance: unknown): instance is GeoSegmentInit {
    return Objects.hasAllKeys<GeoSegmentInit>(instance, "lng0", "lat0", "lng1", "lat1");
  },
};

/** @public */
export class GeoSegment extends GeoCurve implements Interpolate<GeoSegment>, HashCode, Debug {
  constructor(lng0: number, lat0: number, lng1: number, lat1: number) {
    super();
    this.lng0 = lng0;
    this.lat0 = lat0;
    this.lng1 = lng1;
    this.lat1 = lat1;
  }

  /** @internal */
  declare readonly typeid?: "GeoSegment";

  override likeType?(like: GeoSegmentInit): void;

  override isDefined(): boolean {
    return isFinite(this.lng0) && isFinite(this.lat0)
        && isFinite(this.lng1) && isFinite(this.lat1);
  }

  readonly lng0: number;

  readonly lat0: number;

  readonly lng1: number;

  readonly lat1: number;

  override get lngMin(): number {
    return Math.min(this.lng0, this.lng1);
  }

  override get latMin(): number {
    return Math.min(this.lat0, this.lat1);
  }

  override get lngMax(): number {
    return Math.max(this.lng0, this.lng1);
  }

  override get latMax(): number {
    return Math.max(this.lat0, this.lat1);
  }

  override interpolateLng(u: number): number {
    return (1.0 - u) * this.lng0 + u * this.lng1;
  }

  override interpolateLat(u: number): number {
   return (1.0 - u) * this.lat0 + u * this.lat1;
  }

  override interpolate(u: number): GeoPoint {
    const v = 1.0 - u;
    const lng01 = v * this.lng0 + u * this.lng1;
    const lat01 = v * this.lat0 + u * this.lat1;
    return new GeoPoint(lng01, lat01);
  }

  override contains(that: GeoShapeLike): boolean;
  override contains(lng: number, lat: number): boolean;
  override contains(that: GeoShapeLike | number, lat?: number): boolean {
    if (typeof that === "number") {
      return R2Segment.contains(this.lng0, this.lat0, this.lng1, this.lat1, that, lat!);
    }
    that = GeoShape.fromLike(that);
    if (that instanceof GeoPoint) {
      return this.containsPoint(that);
    } else if (that instanceof GeoSegment) {
      return this.containsSegment(that);
    }
    return false;
  }

  /** @internal */
  containsPoint(that: GeoPoint): boolean {
    return R2Segment.contains(this.lng0, this.lat0, this.lng1, this.lat1, that.lng, that.lat);
  }

  /** @internal */
  containsSegment(that: GeoSegment): boolean {
    return R2Segment.contains(this.lng0, this.lat0, this.lng1, this.lat1, that.lng0, that.lat0)
        && R2Segment.contains(this.lng0, this.lat0, this.lng1, this.lat1, that.lng1, that.lat1);
  }

  override intersects(that: GeoShapeLike): boolean {
    that = GeoShape.fromLike(that);
    if (that instanceof GeoPoint) {
      return this.intersectsPoint(that);
    } else if (that instanceof GeoSegment) {
      return this.intersectsSegment(that);
    } else {
      return that.intersects(this);
    }
    return false;
  }

  /** @internal */
  intersectsPoint(that: GeoPoint): boolean {
    return R2Segment.contains(this.lng0, this.lat0, this.lng1, this.lat1, that.lng, that.lat);
  }

  /** @internal */
  intersectsSegment(that: GeoSegment): boolean {
    return R2Segment.intersects(this.lng0, this.lat0, this.lng1 - this.lat0, this.lng1 - this.lat0,
                                that.lng0, that.lat0, that.lng1 - that.lat0, that.lng1 - that.lat0);
  }

  override split(u: number): [GeoSegment, GeoSegment] {
    const v = 1.0 - u;
    const lng01 = v * this.lng0 + u * this.lng1;
    const lat01 = v * this.lat0 + u * this.lat1;
    const c0 = new GeoSegment(this.lng0, this.lat0, lng01, lat01);
    const c1 = new GeoSegment(lng01, lat01, this.lng1, this.lat1);
    return [c0, c1];
  }

  override project(f: GeoProjection): R2Segment {
    const p0 = f.project(this.lng0, this.lat0);
    const p1 = f.project(this.lng1, this.lat1);
    return new R2Segment(p0.x, p0.y, p1.x, p1.y);
  }

  override forEachCoord<R>(callback: (lng: number, lat: number) => R | void): R | undefined;
  override forEachCoord<R, S>(callback: (this: S, lng: number, lat: number) => R | void, thisArg: S): R | undefined;
  override forEachCoord<R, S>(callback: (this: S | undefined, lng: number, lat: number) => R | undefined, thisArg?: S): R | undefined {
    let result: R | void;
    result = callback.call(thisArg, this.lng0, this.lat0);
    if (result !== void 0) {
      return result;
    }
    result = callback.call(thisArg, this.lng1, this.lat1);
    if (result !== void 0) {
      return result;
    }
    return void 0;
  }

  override forEachCoordRest<R>(callback: (lng: number, lat: number) => R | void): R | undefined;
  override forEachCoordRest<R, S>(callback: (this: S, lng: number, lat: number) => R | void, thisArg: S): R | undefined;
  override forEachCoordRest<R, S>(callback: (this: S | undefined, lng: number, lat: number) => R | void, thisArg?: S): R | undefined {
    const result = callback.call(thisArg, this.lng1, this.lat1);
    if (result !== void 0) {
      return result;
    }
    return void 0;
  }

  toLike(): GeoSegmentInit {
    return {
      lng0: this.lng0,
      lat0: this.lat0,
      lng1: this.lng1,
      lat1: this.lat1,
    };
  }

  /** @override */
  interpolateTo(that: GeoSegment): Interpolator<GeoSegment>;
  interpolateTo(that: unknown): Interpolator<GeoSegment> | null;
  interpolateTo(that: unknown): Interpolator<GeoSegment> | null {
    if (that instanceof GeoSegment) {
      return GeoSegmentInterpolator(this, that);
    }
    return null;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoSegment) {
      return Numbers.equivalent(this.lng0, that.lng0, epsilon)
          && Numbers.equivalent(this.lat0, that.lat0, epsilon)
          && Numbers.equivalent(this.lng1, that.lng1, epsilon)
          && Numbers.equivalent(this.lat1, that.lat1, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoSegment) {
      return this.lng0 === that.lng0 && this.lat0 === that.lat0
          && this.lng1 === that.lng1 && this.lat1 === that.lat1;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(GeoSegment), Numbers.hash(this.lng0)), Numbers.hash(this.lat0)),
        Numbers.hash(this.lng1)), Numbers.hash(this.lat1)));
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("GeoSegment").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.lng0).write(", ").debug(this.lat0).write(", ")
                   .debug(this.lng1).write(", ").debug(this.lat1).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static of(lng0: number, lat0: number, lng1: number, lat1: number): GeoSegment {
    return new GeoSegment(lng0, lat0, lng1, lat1);
  }

  static override fromLike<T extends GeoSegmentLike | null | undefined>(value: T): GeoSegment | Uninitable<T>;
  static override fromLike<T extends GeoShapeLike | null | undefined>(value: T): never;
  static override fromLike<T extends GeoSegmentLike | null | undefined>(value: T): GeoSegment | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof GeoSegment) {
      return value as GeoSegment | Uninitable<T>;
    } else if (GeoSegmentInit[Symbol.hasInstance](value)) {
      return GeoSegment.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: GeoSegmentInit): GeoSegment {
    return new GeoSegment(init.lng0, init.lat0, init.lng1, init.lat1);
  }
}

/** @internal */
export const GeoSegmentInterpolator = (function (_super: typeof Interpolator) {
  const GeoSegmentInterpolator = function (s0: GeoSegment, s1: GeoSegment): Interpolator<GeoSegment> {
    const interpolator = function (u: number): GeoSegment {
      const s0 = interpolator[0];
      const s1 = interpolator[1];
      const lng0 = s0.lng0 + u * (s1.lng0 - s0.lng0);
      const lat0 = s0.lat0 + u * (s1.lat0 - s0.lat0);
      const lng1 = s0.lng1 + u * (s1.lng1 - s0.lng1);
      const lat1 = s0.lat1 + u * (s1.lat1 - s0.lat1);
      return new GeoSegment(lng0, lat0, lng1, lat1);
    } as Interpolator<GeoSegment>;
    Object.setPrototypeOf(interpolator, GeoSegmentInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = s0;
    (interpolator as Mutable<typeof interpolator>)[1] = s1;
    return interpolator;
  } as {
    (s0: GeoSegment, s1: GeoSegment): Interpolator<GeoSegment>;

    /** @internal */
    prototype: Interpolator<GeoSegment>;
  };

  GeoSegmentInterpolator.prototype = Object.create(_super.prototype);
  GeoSegmentInterpolator.prototype.constructor = GeoSegmentInterpolator;

  return GeoSegmentInterpolator;
})(Interpolator);
