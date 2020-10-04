// Copyright 2015-2020 Swim inc.
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

import {Interpolator} from "@swim/interpolate";
import {AnyGeoPoint, GeoPoint} from "./GeoPoint";

export class GeoPointInterpolator extends Interpolator<GeoPoint> {
  /** @hidden */
  readonly x: number;
  /** @hidden */
  readonly dx: number;
  /** @hidden */
  readonly y: number;
  /** @hidden */
  readonly dy: number;

  constructor(p0: GeoPoint, p1: GeoPoint) {
    super();
    this.x = p0.lng;
    this.dx = p1.lng - this.x;
    this.y = p0.lat;
    this.dy = p1.lat - this.y;
  }

  interpolate(u: number): GeoPoint {
    const lng = this.x + this.dx * u;
    const lat = this.y + this.dy * u;
    return new GeoPoint(lng, lat);
  }

  deinterpolate(p: AnyGeoPoint): number {
    p = GeoPoint.fromAny(p);
    const x = p.lng - this.x;
    const y = p.lat - this.y;
    const dp = x * this.dx + y * this.dy;
    const l = Math.sqrt(x * x + y * y);
    return l !== 0 ? dp / l : l;
  }

  range(): readonly [GeoPoint, GeoPoint];
  range(ps: readonly [AnyGeoPoint, AnyGeoPoint]): GeoPointInterpolator;
  range(p0: AnyGeoPoint, p1: AnyGeoPoint): GeoPointInterpolator;
  range(p0?: readonly [AnyGeoPoint, AnyGeoPoint] | AnyGeoPoint,
        p1?: AnyGeoPoint): readonly [GeoPoint, GeoPoint] | GeoPointInterpolator {
    if (arguments.length === 0) {
      return [this.interpolate(0), this.interpolate(1)];
    } else if (arguments.length === 1) {
      p0 = p0 as readonly [AnyGeoPoint, AnyGeoPoint];
      return GeoPointInterpolator.between(p0[0], p0[1]);
    } else {
      return GeoPointInterpolator.between(p0 as AnyGeoPoint, p1 as AnyGeoPoint);
    }
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoPointInterpolator) {
      return this.x === that.x && this.dx === that.dx
          && this.y === that.y && this.dy === that.dy;
    }
    return false;
  }

  static between(p0: AnyGeoPoint, p1: AnyGeoPoint): GeoPointInterpolator;
  static between(a: unknown, b: unknown): Interpolator<unknown>;
  static between(a: unknown, b: unknown): Interpolator<unknown> {
    if (a instanceof GeoPoint && b instanceof GeoPoint) {
      return new GeoPointInterpolator(a, b);
    } else if (GeoPoint.isAny(a) && GeoPoint.isAny(b)) {
      return new GeoPointInterpolator(GeoPoint.fromAny(a), GeoPoint.fromAny(b));
    }
    return Interpolator.between(a, b);
  }

  static tryBetween(a: unknown, b: unknown): GeoPointInterpolator | null {
    if (a instanceof GeoPoint && b instanceof GeoPoint) {
      return new GeoPointInterpolator(a, b);
    }
    return null;
  }

  static tryBetweenAny(a: unknown, b: unknown): GeoPointInterpolator | null {
    if ((a instanceof GeoPoint || GeoPoint.isInit(a)) && (b instanceof GeoPoint || GeoPoint.isInit(b))) {
      return new GeoPointInterpolator(GeoPoint.fromAny(a), GeoPoint.fromAny(b));
    }
    return null;
  }
}
Interpolator.registerFactory(GeoPointInterpolator);
