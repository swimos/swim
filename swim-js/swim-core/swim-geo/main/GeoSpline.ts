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
import {Lazy} from "@swim/util";
import {Arrays} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {R2Curve} from "@swim/math";
import {R2Segment} from "@swim/math";
import {R2Spline} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import type {GeoShapeLike} from "./GeoShape";
import {GeoPointLike} from "./GeoPoint";
import {GeoPoint} from "./GeoPoint";
import type {GeoCurveContext} from "./GeoCurve";
import {GeoCurve} from "./GeoCurve";
import {GeoSegment} from "./GeoSegment";
import {GeoBox} from "./"; // forward import

/** @public */
export interface GeoSplineContext extends GeoCurveContext {
  closePath(): void;
}

/** @public */
export type GeoSplineLike = GeoSpline | GeoSplinePoints;

/** @public */
export const GeoSplineLike = {
  [Symbol.hasInstance](instance: unknown): instance is GeoSplineLike {
    return instance instanceof GeoSpline
        || GeoSplinePoints[Symbol.hasInstance](instance);
  },
};

/** @public */
export type GeoSplinePoints = readonly GeoPointLike[];

/** @public */
export const GeoSplinePoints = {
  [Symbol.hasInstance](instance: unknown): instance is GeoSplinePoints {
    return Array.isArray(instance) && instance.length >= 2
        && GeoPointLike[Symbol.hasInstance](instance[0]!);
  },
};

/** @public */
export class GeoSpline extends GeoCurve implements Debug {
  constructor(curves: readonly GeoCurve[], closed: boolean) {
    super();
    this.curves = curves;
    this.closed = closed;
    this.boundingBox = null;
  }

  override likeType?(like: GeoSplinePoints): void;

  readonly curves: readonly GeoCurve[];

  /** @internal */
  readonly closed: boolean;

  override isDefined(): boolean {
    return this.curves.length !== 0;
  }

  isClosed(): boolean {
    return this.closed;
  }

  override get lngMin(): number {
    return this.bounds.lngMin;
  }

  override get latMin(): number {
    return this.bounds.latMin;
  }

  override get lngMax(): number {
    return this.bounds.lngMax;
  }

  override get latMax(): number {
    return this.bounds.latMax;
  }

  override interpolateLng(u: number): number {
    const curves = this.curves;
    const n = curves.length;
    if (n === 0) {
      return NaN;
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    return curves[k]!.interpolateLng(v);
  }

  override interpolateLat(u: number): number {
    const curves = this.curves;
    const n = curves.length;
    if (n === 0) {
      return NaN;
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    return curves[k]!.interpolateLat(v);
  }

  override interpolate(u: number): GeoPoint {
    const curves = this.curves;
    const n = curves.length;
    if (n === 0) {
      return GeoPoint.undefined();
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    return curves[k]!.interpolate(v);
  }

  override contains(that: GeoShapeLike): boolean;
  override contains(lng: number, lat: number): boolean;
  override contains(that: GeoShapeLike | number, lat?: number): boolean {
    return false; // TODO
  }

  override intersects(that: GeoShapeLike): boolean {
    return false; // TODO
  }

  override split(u: number): [GeoSpline, GeoSpline] {
    const curves = this.curves;
    const n = curves.length;
    if (n === 0) {
      return [GeoSpline.empty(), GeoSpline.empty()];
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    const [c0, c1] = curves[k]!.split(v);
    const curves0 = new Array<GeoCurve>(k + 1);
    const curves1 = new Array<GeoCurve>(n - k);
    for (let i = 0; i < k; i += 1) {
      curves0[i] = curves[i]!;
    }
    curves0[k] = c0;
    curves1[0] = c1;
    for (let i = k + 1; i < n; i += 1) {
      curves1[i - k] = curves[i]!;
    }
    return [new GeoSpline(curves0, false), new GeoSpline(curves1, false)];
  }

  subdivide(u: number): GeoSpline {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n === 0) {
      return GeoSpline.empty();
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    const [c0, c1] = oldCurves[k]!.split(v);
    const newCurves = new Array<GeoCurve>(n + 1);
    for (let i = 0; i < k; i += 1) {
      newCurves[i] = oldCurves[i]!;
    }
    newCurves[k] = c0;
    newCurves[k + 1] = c1;
    for (let i = k + 1; i < n; i += 1) {
      newCurves[i + 1] = oldCurves[i]!;
    }
    return new GeoSpline(newCurves, this.closed);
  }

  override project(f: GeoProjection): R2Spline {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n === 0) {
      return R2Spline.empty();
    }

    let i = 0;
    const newCurves = new Array<R2Curve>(n);

    // project leading adjacent segments
    let curve = oldCurves[0]!;
    if (curve instanceof GeoSegment) {
      // project first point
      let p0 = f.project(curve.lng0, curve.lat0);
      while (i < n) {
        curve = oldCurves[i]!;
        if (!(curve instanceof GeoSegment)) {
          break;
        }
        // project next point
        const p1 = f.project(curve.lng1, curve.lat1);
        newCurves[i] = new R2Segment(p0.x, p0.y, p1.x, p1.y);
        p0 = p1;
        i += 1;
      }
    }

    // project any remaining curves
    while (i < n) {
      curve = oldCurves[i]!;
      newCurves[i] = curve.project(f);
      i += 1;
    }

    return new R2Spline(newCurves, this.closed);
  }

  /** @internal */
  readonly boundingBox: GeoBox | null;

  override get bounds(): GeoBox {
    let boundingBox = this.boundingBox;
    if (boundingBox === null) {
      let lngMin = Infinity;
      let latMin = Infinity;
      let lngMax = -Infinity;
      let latMax = -Infinity;
      const curves = this.curves;
      for (let i = 0; i < curves.length; i += 1) {
        const curve = curves[i]!;
        lngMin = Math.min(lngMin, curve.lngMin);
        latMin = Math.min(latMin, curve.latMin);
        lngMax = Math.max(curve.lngMax, lngMax);
        latMax = Math.max(curve.latMax, latMax);
      }
      boundingBox = new GeoBox(lngMin, latMin, lngMax, latMax);
      (this as Mutable<this>).boundingBox = boundingBox;
    }
    return boundingBox;
  }

  override forEachCoord<R>(callback: (lng: number, lat: number) => R | void): R | undefined;
  override forEachCoord<R, S>(callback: (this: S, lng: number, lat: number) => R | void, thisArg: S): R | undefined;
  override forEachCoord<R, S>(callback: (this: S | undefined, lng: number, lat: number) => R | void, thisArg?: S): R | undefined {
    const curves = this.curves;
    const n = curves.length;
    if (n === 0) {
      return void 0;
    }
    let curve = curves[0]!;
    let result = curve.forEachCoord(callback, thisArg);
    if (result !== void 0) {
      return result;
    }
    for (let i = 1; i < n; i += 1) {
      curve = curves[i]!;
      result = curve.forEachCoordRest(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override forEachCoordRest<R>(callback: (lng: number, lat: number) => R | void): R | undefined;
  override forEachCoordRest<R, S>(callback: (this: S, lng: number, lat: number) => R | void, thisArg: S): R | undefined;
  override forEachCoordRest<R, S>(callback: (this: S | undefined, lng: number, lat: number) => R | void, thisArg?: S): R | undefined {
    const curves = this.curves;
    for (let i = 0; i < curves.length; i += 1) {
      const curve = curves[i]!;
      const result = curve.forEachCoordRest(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoSpline) {
      return Arrays.equivalent(this.curves, that.curves, epsilon)
          && this.closed === that.closed;
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoSpline) {
      return Arrays.equal(this.curves, that.curves)
          && this.closed === that.closed;
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    const curves = this.curves;
    const n = curves.length;
    output = output.write("GeoSpline").write(46/*'.'*/);
    if (n === 0) {
      output = output.write("empty").write(40/*'('*/);
    } else if (n !== 0) {
      output = output.write(this.closed ? "closed" : "open").write(40/*'('*/);
      output = output.debug(curves[0]!);
      for (let i = 1; i < n; i += 1) {
        output = output.write(", ").debug(curves[i]!);
      }
    }
    output = output.write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static builder(): GeoSplineBuilder {
    return new GeoSplineBuilder();
  }

  @Lazy
  static empty(): GeoSpline {
    return new GeoSpline(Arrays.empty(), false);
  }

  static open(...curves: GeoCurve[]): GeoSpline {
    return new GeoSpline(curves, false);
  }

  static closed(...curves: GeoCurve[]): GeoSpline {
    return new GeoSpline(curves, true);
  }

  static override fromLike<T extends GeoSplineLike | null | undefined>(value: T): GeoSpline | Uninitable<T>;
  static override fromLike<T extends GeoShapeLike | null | undefined>(value: T): never;
  static override fromLike<T extends GeoSplineLike | null | undefined>(value: T): GeoSpline | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof GeoSpline) {
      return value as GeoSpline | Uninitable<T>;
    } else if (GeoSplinePoints[Symbol.hasInstance](value)) {
      return GeoSpline.fromPoints(value);
    }
    throw new TypeError("" + value);
  }

  static fromPoints(points: GeoSplinePoints): GeoSpline {
    const n = points.length;
    if (n === 0 || n === 1) {
      return GeoSpline.empty();
    }
    const curves = new Array<GeoCurve>(n - 1);
    const p0 = GeoPoint.fromLike(points[0]!);
    let p1 = p0;
    for (let i = 1; i < n; i += 1) {
      const p2 = GeoPoint.fromLike(points[i]!);
      curves[i - 1] = new GeoSegment(p1.lng, p1.lat, p2.lng, p2.lat);
      p1 = p2;
    }
    const closed = p0.equals(p1);
    return new GeoSpline(curves, closed);
  }
}

/** @public */
export class GeoSplineBuilder implements GeoSplineContext {
  /** @internal */
  curves: GeoCurve[];
  /** @internal */
  closed: boolean;
  /** @internal */
  aliased: boolean;
  /** @internal */
  lng0: number;
  /** @internal */
  lat0: number;
  /** @internal */
  lng: number;
  /** @internal */
  lat: number;

  constructor() {
    this.curves = [];
    this.closed = false;
    this.aliased = false;
    this.lng0 = 0;
    this.lat0 = 0;
    this.lng = 0;
    this.lat = 0;
  }

  private dealias(): void {
    if (!this.aliased) {
      return;
    }
    this.curves = this.curves.slice(0);
    this.aliased = false;
  }

  moveTo(lng: number, lat: number): void {
    if (this.aliased) {
      this.curves = [];
      this.aliased = false;
    } else {
      this.curves.length = 0;
    }
    this.closed = false;
    this.lng0 = lng;
    this.lat0 = lat;
    this.lng = lng;
    this.lat = lat;
  }

  closePath(): void {
    this.dealias();
    this.curves.push(new GeoSegment(this.lng, this.lat, this.lng0, this.lat0));
    this.closed = true;
    this.lng = this.lng0;
    this.lat = this.lat0;
  }

  lineTo(lng: number, lat: number): void {
    this.dealias();
    this.curves.push(new GeoSegment(this.lng, this.lat, lng, lat));
    this.lng = lng;
    this.lat = lat;
  }

  build(): GeoSpline {
    this.aliased = true;
    return new GeoSpline(this.curves, this.closed);
  }
}
