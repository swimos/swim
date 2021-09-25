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

import {Mutable, Arrays} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import {R2Curve, R2Segment, R2Spline} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import {AnyGeoShape, GeoShape} from "./GeoShape";
import {AnyGeoPoint, GeoPoint} from "./GeoPoint";
import {GeoCurve} from "./GeoCurve";
import {GeoSegment} from "./GeoSegment";
import {GeoSplineBuilder} from "./"; // forward import
import {GeoBox} from "./"; // forward import

export type AnyGeoSpline = GeoSpline | GeoSplinePoints;

export type GeoSplinePoints = ReadonlyArray<AnyGeoPoint>;

export class GeoSpline extends GeoCurve implements Debug {
  constructor(curves: ReadonlyArray<GeoCurve>, closed: boolean) {
    super();
    this.curves = curves;
    this.closed = closed;
    this.boundingBox = null;
  }

  readonly curves: ReadonlyArray<GeoCurve>;

  /** @hidden */
  readonly closed: boolean;

  isDefined(): boolean {
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
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return curves[k]!.interpolateLng(v);
    } else {
      return NaN;
    }
  }

  override interpolateLat(u: number): number {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return curves[k]!.interpolateLat(v);
    } else {
      return NaN;
    }
  }

  override interpolate(u: number): GeoPoint {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
      const l = 1 / n;
      const k = Math.min(Math.max(0, Math.floor(u / l)), n);
      const v = u * n - k * l;
      return curves[k]!.interpolate(v);
    } else {
      return new GeoPoint(NaN, NaN);
    }
  }

  override contains(that: AnyGeoShape): boolean;
  override contains(lng: number, lat: number): boolean;
  override contains(that: AnyGeoShape | number, lat?: number): boolean {
    return false; // TODO
  }

  override intersects(that: AnyGeoShape): boolean {
    return false; // TODO
  }

  override split(u: number): [GeoSpline, GeoSpline] {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
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
    } else {
      return [GeoSpline.empty(), GeoSpline.empty()];
    }
  }

  subdivide(u: number): GeoSpline {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n > 0) {
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
    } else {
      return GeoSpline.empty();
    }
  }

  override project(f: GeoProjection): R2Spline {
    const oldCurves = this.curves;
    const n = oldCurves.length;
    if (n > 0) {
      let i = 0;
      const newCurves = new Array<R2Curve>(n);

      // project leading adjacent segments
      let curve = oldCurves[0]!;
      if (curve instanceof GeoSegment) {
        // project first point
        let p0 = f.project(curve.lng0, curve.lat0);
        while (i < n) {
          curve = oldCurves[i]!;
          if (curve instanceof GeoSegment) {
            // project next point
            const p1 = f.project(curve.lng1, curve.lat1);
            newCurves[i] = new R2Segment(p0.x, p0.y, p1.x, p1.y);
            p0 = p1;
            i += 1;
          } else {
            break;
          }
        }
      }

      // project any remaining curves
      while (i < n) {
        curve = oldCurves[i]!;
        newCurves[i] = curve.project(f);
        i += 1;
      }

      return new R2Spline(newCurves, this.closed);
    } else {
      return R2Spline.empty();
    }
  }

  /** @hidden */
  readonly boundingBox: GeoBox | null;

  override get bounds(): GeoBox {
    let boundingBox = this.boundingBox;
    if (boundingBox === null) {
      let lngMin = Infinity;
      let latMin = Infinity;
      let lngMax = -Infinity;
      let latMax = -Infinity;
      const curves = this.curves;
      for (let i = 0, n = curves.length; i < n; i += 1) {
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
  override forEachCoord<R, S>(callback: (this: S, lng: number, lat: number) => R | void,
                              thisArg: S): R | undefined;
  override forEachCoord<R, S>(callback: (this: S | undefined, lng: number, lat: number) => R | void,
                              thisArg?: S): R | undefined {
    const curves = this.curves;
    const n = curves.length;
    if (n > 0) {
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
    }
    return void 0;
  }

  override forEachCoordRest<R>(callback: (lng: number, lat: number) => R | void): R | undefined;
  override forEachCoordRest<R, S>(callback: (this: S, lng: number, lat: number) => R | void,
                                  thisArg: S): R | undefined;
  override forEachCoordRest<R, S>(callback: (this: S | undefined, lng: number, lat: number) => R | void,
                                  thisArg?: S): R | undefined {
    const curves = this.curves;
    for (let i = 0, n = curves.length; i < n; i += 1) {
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

  static empty(): GeoSpline {
    return new GeoSpline([], false);
  }

  static open(...curves: GeoCurve[]): GeoSpline {
    return new GeoSpline(curves, false);
  }

  static closed(...curves: GeoCurve[]): GeoSpline {
    return new GeoSpline(curves, true);
  }

  static fromPoints(points: GeoSplinePoints): GeoSpline {
    const n = points.length;
    if (n > 1) {
      const curves = new Array<GeoCurve>(n - 1);
      const p0 = GeoPoint.fromAny(points[0]!);
      let p1 = p0;
      for (let i = 1; i < n; i += 1) {
        const p2 = GeoPoint.fromAny(points[i]!);
        curves[i - 1] = new GeoSegment(p1.lng, p1.lat, p2.lng, p2.lat);
        p1 = p2;
      }
      const closed = p0.equals(p1);
      return new GeoSpline(curves, closed);
    } else {
      return GeoSpline.empty();
    }
  }

  static override fromAny(value: AnyGeoSpline): GeoSpline;
  static override fromAny(value: AnyGeoShape): GeoShape;
  static override fromAny(value: AnyGeoSpline | AnyGeoShape): GeoShape {
    if (value === void 0 || value === null || value instanceof GeoSpline) {
      return value;
    } else if (GeoSpline.isPoints(value)) {
      return GeoSpline.fromPoints(value);
    } else {
      return GeoShape.fromAny(value);
    }
  }

  static builder(): GeoSplineBuilder {
    return new GeoSplineBuilder();
  }

  /** @hidden */
  static isPoints(value: unknown): value is GeoSplinePoints {
    return Array.isArray(value)
        && value.length >= 2
        && GeoPoint.isAny(value[0]!);
  }

  /** @hidden */
  static isAnySpline(value: unknown): value is AnyGeoSpline {
    return value instanceof GeoSpline
        || GeoSpline.isPoints(value);
  }
}
