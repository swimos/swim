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
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Objects} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
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
import {GeoTileLike} from "./GeoTile";
import {GeoTile} from "./GeoTile";

/** @public */
export type GeoBoxLike = GeoBox | GeoBoxInit;

/** @public */
export const GeoBoxLike = {
  [Symbol.hasInstance](instance: unknown): instance is GeoBoxLike {
    return instance instanceof GeoBox
        || GeoBoxInit[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface GeoBoxInit {
  /** @internal */
  readonly typeid?: "GeoBoxInit";
  lngMin: number;
  latMin: number;
  lngMax: number;
  latMax: number;
}

/** @public */
export const GeoBoxInit = {
  [Symbol.hasInstance](instance: unknown): instance is GeoBoxInit {
    return Objects.hasAllKeys<GeoBoxInit>(instance, "lngMin", "latMin", "lngMax", "latMax");
  },
};

/** @public */
export class GeoBox extends GeoShape implements Interpolate<GeoBox>, HashCode, Debug {
  constructor(lngMin: number, latMin: number, lngMax: number, latMax: number) {
    super();
    this.lngMin = lngMin;
    this.latMin = latMin;
    this.lngMax = lngMax;
    this.latMax = latMax;
  }

  /** @internal */
  declare readonly typeid?: "GeoBox";

  override likeType?(like: GeoBoxInit): void;

  override isDefined(): boolean {
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

  override contains(that: GeoPointLike | GeoBoxLike): boolean;
  override contains(lng: number, lat: number): boolean;
  override contains(that: GeoPointLike | GeoBoxLike | number, y?: number): boolean {
    if (typeof that === "number") {
      return this.lngMin <= that && that <= this.lngMax
          && this.latMin <= y! && y! <= this.latMax;
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

  override intersects(that: GeoPointLike | GeoBoxLike): boolean {
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

  override union(that: GeoShapeLike): GeoBox {
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

  toLike(): GeoBoxInit {
    return {
      lngMin: this.lngMin,
      latMin: this.latMin,
      lngMax: this.lngMax,
      latMax: this.latMax,
    };
  }

  /** @override */
  interpolateTo(that: GeoBox): Interpolator<GeoBox>;
  interpolateTo(that: unknown): Interpolator<GeoBox> | null;
  interpolateTo(that: unknown): Interpolator<GeoBox> | null {
    if (that instanceof GeoBox) {
      return GeoBoxInterpolator(this, that);
    }
    return null;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
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

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(GeoBox), Numbers.hash(this.lngMin)), Numbers.hash(this.latMin)),
        Numbers.hash(this.lngMax)), Numbers.hash(this.latMax)));
  }

  /** @override */
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

  static override fromLike<T extends GeoBoxLike | null | undefined>(value: T): GeoBox | Uninitable<T>;
  static override fromLike<T extends GeoShapeLike | null | undefined>(value: T): never;
  static override fromLike<T extends GeoBoxLike | null | undefined>(value: T): GeoBox | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof GeoBox) {
      return value as GeoBox | Uninitable<T>;
    } else if (GeoBoxInit[Symbol.hasInstance](value)) {
      return GeoBox.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: GeoBoxInit): GeoBox {
    return new GeoBox(init.lngMin, init.latMin, init.lngMax, init.latMax);
  }
}

/** @internal */
export const GeoBoxInterpolator = (function (_super: typeof Interpolator) {
  const GeoBoxInterpolator = function (s0: GeoBox, s1: GeoBox): Interpolator<GeoBox> {
    const interpolator = function (u: number): GeoBox {
      const s0 = interpolator[0];
      const s1 = interpolator[1];
      const lngMin = s0.lngMin + u * (s1.lngMin - s0.lngMin);
      const latMin = s0.latMin + u * (s1.latMin - s0.latMin);
      const lngMax = s0.lngMax + u * (s1.lngMax - s0.lngMax);
      const latMax = s0.latMax + u * (s1.latMax - s0.latMax);
      return new GeoBox(lngMin, latMin, lngMax, latMax);
    } as Interpolator<GeoBox>;
    Object.setPrototypeOf(interpolator, GeoBoxInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = s0;
    (interpolator as Mutable<typeof interpolator>)[1] = s1;
    return interpolator;
  } as {
    (s0: GeoBox, s1: GeoBox): Interpolator<GeoBox>;

    /** @internal */
    prototype: Interpolator<GeoBox>;
  };

  GeoBoxInterpolator.prototype = Object.create(_super.prototype);
  GeoBoxInterpolator.prototype.constructor = GeoBoxInterpolator;

  return GeoBoxInterpolator;
})(Interpolator);
