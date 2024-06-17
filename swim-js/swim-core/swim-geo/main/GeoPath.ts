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
import {Lazy} from "@swim/util";
import {Arrays} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {R2Spline} from "@swim/math";
import {R2Path} from "@swim/math";
import type {GeoProjection} from "./GeoProjection";
import type {GeoShapeLike} from "./GeoShape";
import {GeoShape} from "./GeoShape";
import {GeoPoint} from "./GeoPoint";
import type {GeoCurve} from "./GeoCurve";
import type {GeoSplineContext} from "./GeoSpline";
import {GeoSplineLike} from "./GeoSpline";
import {GeoSplinePoints} from "./GeoSpline";
import {GeoSplineBuilder} from "./GeoSpline";
import {GeoSpline} from "./GeoSpline";
import {GeoBox} from "./"; // forward import

/** @public */
export interface GeoPathContext extends GeoSplineContext {
}

/** @public */
export type GeoPathLike = GeoPath | GeoPathSplines | GeoSplinePoints;

/** @public */
export const GeoPathLike = {
  [Symbol.hasInstance](instance: unknown): instance is GeoPathLike {
    return instance instanceof GeoPath
        || GeoPathSplines[Symbol.hasInstance](instance);
  },
};

/** @public */
export const GeoPathSplines = {
  [Symbol.hasInstance](instance: unknown): instance is GeoPathSplines {
    return Array.isArray(instance) && instance.length !== 0
        && GeoSplinePoints[Symbol.hasInstance](instance[0]!);
  },
};

/** @public */
export type GeoPathSplines = readonly GeoSplineLike[];

/** @public */
export class GeoPath extends GeoShape implements Debug {
  constructor(splines: readonly GeoSpline[]) {
    super();
    this.splines = splines;
    this.boundingBox = null;
  }

  /** @internal */
  declare readonly typeid?: "GeoPath";

  override likeType?(like: GeoPathSplines | GeoSplinePoints): void;

  override isDefined(): boolean {
    return this.splines.length !== 0;
  }

  isClosed(): boolean {
    const splines = this.splines;
    if (splines.length === 0) {
      return false;
    }
    for (let i = 0; i < splines.length; i += 1) {
      const spline = splines[i]!;
      if (!spline.isClosed()) {
        return false;
      }
    }
    return true;
  }

  readonly splines: readonly GeoSpline[];

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

  interpolateLng(u: number): number {
    const splines = this.splines;
    const n = splines.length;
    if (n === 0) {
      return NaN;
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    return splines[k]!.interpolateLng(v);
  }

  interpolateLat(u: number): number {
    const splines = this.splines;
    const n = splines.length;
    if (n === 0) {
      return NaN;
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    return splines[k]!.interpolateLat(v);
  }

  interpolate(u: number): GeoPoint {
    const splines = this.splines;
    const n = splines.length;
    if (n === 0) {
      return GeoPoint.undefined();
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    return splines[k]!.interpolate(v);
  }

  override contains(that: GeoShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: GeoShapeLike | number, y?: number): boolean {
    return false; // TODO
  }

  override intersects(that: GeoShapeLike): boolean {
    return false; // TODO
  }

  split(u: number): [GeoPath, GeoPath] {
    const splines = this.splines;
    const n = splines.length;
    if (n === 0) {
      return [GeoPath.empty(), GeoPath.empty()];
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    const [s0, s1] = splines[k]!.split(v);
    const splines0 = new Array<GeoSpline>(k + 1);
    const splines1 = new Array<GeoSpline>(n - k);
    for (let i = 0; i < k; i += 1) {
      splines0[i] = splines[i]!;
    }
    splines0[k] = s0;
    splines1[0] = s1;
    for (let i = k + 1; i < n; i += 1) {
      splines1[i - k] = splines[i]!;
    }
    return [new GeoPath(splines0), new GeoPath(splines1)];
  }

  subdivide(u: number): GeoPath {
    const oldSplines = this.splines;
    const n = oldSplines.length;
    if (n === 0) {
      return GeoPath.empty();
    }
    const l = 1 / n;
    const k = Math.min(Math.max(0, Math.floor(u / l)), n);
    const v = u * n - k * l;
    const newSplines = new Array<GeoSpline>(n);
    for (let i = 0; i < k; i += 1) {
      newSplines[i] = oldSplines[i]!;
    }
    newSplines[k] = oldSplines[k]!.subdivide(v);
    for (let i = k + 1; i < n; i += 1) {
      newSplines[i] = oldSplines[i]!;
    }
    return new GeoPath(newSplines);
  }

  override project(f: GeoProjection): R2Path {
    const oldSplines = this.splines;
    const n = oldSplines.length;
    if (n === 0) {
      return R2Path.empty();
    }
    const newSplines = new Array<R2Spline>(n);
    for (let i = 0; i < n; i += 1) {
      newSplines[i] = oldSplines[i]!.project(f);
    }
    return new R2Path(newSplines);
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
      const splines = this.splines;
      for (let i = 0; i < splines.length; i += 1) {
        const spline = splines[i]!;
        lngMin = Math.min(lngMin, spline.lngMin);
        latMin = Math.min(latMin, spline.latMin);
        lngMax = Math.max(spline.lngMax, lngMax);
        latMax = Math.max(spline.latMax, latMax);
      }
      boundingBox = new GeoBox(lngMin, latMin, lngMax, latMax);
      (this as Mutable<this>).boundingBox = boundingBox;
    }
    return boundingBox;
  }

  centroid(): GeoPoint {
    let lngSum = 0;
    let latSum = 0;
    let n = 0;
    this.forEachCoord(function (lng: number, lat: number): void {
      lngSum += lng;
      latSum += lat;
      n += 1;
    }, this);
    if (n === 0) {
      return GeoPoint.undefined();
    }
    return new GeoPoint(lngSum / n, latSum / n);
  }

  forEachCoord<R>(callback: (lng: number, lat: number) => R | void): R | undefined;
  forEachCoord<R, S>(callback: (this: S, lng: number, lat: number) => R | void, thisArg: S): R | undefined;
  forEachCoord<R, S>(callback: (this: S | undefined, lng: number, lat: number) => R | void, thisArg?: S): R | undefined {
    const splines = this.splines;
    for (let i = 0; i < splines.length; i += 1) {
      const spline = splines[i]!;
      const result = spline.forEachCoord(callback, thisArg);
      if (result !== void 0) {
        return result;
      }
    }
    return void 0;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoPath) {
      return Arrays.equivalent(this.splines, that.splines, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GeoPath) {
      return Arrays.equal(this.splines, that.splines);
    }
    return false;
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    const splines = this.splines;
    const n = splines.length;
    output = output.write("GeoPath").write(46/*'.'*/);
    if (n === 0) {
      output = output.write("empty").write(40/*'('*/);
    } else if (n === 1) {
      const spline = splines[0]!;
      output = output.write(spline.closed ? "closed" : "open").write(40/*'('*/);
      const curves = spline.curves;
      const m = curves.length;
      if (m !== 0) {
        output = output.debug(curves[0]!);
        for (let i = 1; i < m; i += 1) {
          output = output.write(", ").debug(curves[i]!);
        }
      }
    } else {
      output = output.write("of").write(40/*'('*/);
      output = output.debug(splines[0]!);
      for (let i = 1; i < n; i += 1) {
        output = output.write(", ").debug(splines[i]!);
      }
    }
    output = output.write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static builder(): GeoPathBuilder {
    return new GeoPathBuilder();
  }

  @Lazy
  static empty(): GeoPath {
    return new GeoPath(Arrays.empty());
  }

  static of(...splines: GeoSpline[]): GeoPath {
    return new GeoPath(splines);
  }

  static open(...curves: GeoCurve[]): GeoPath {
    return new GeoPath([new GeoSpline(curves, false)]);
  }

  static closed(...curves: GeoCurve[]): GeoPath {
    return new GeoPath([new GeoSpline(curves, true)]);
  }

  static override fromLike<T extends GeoPathLike | null | undefined>(value: T): GeoPath | Uninitable<T>;
  static override fromLike<T extends GeoShapeLike | null | undefined>(value: T): never;
  static override fromLike<T extends GeoPathLike | null | undefined>(value: T): GeoPath | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof GeoPath) {
      return value as GeoPath | Uninitable<T>;
    } else if (GeoPathSplines[Symbol.hasInstance](value)) {
      return GeoPath.fromSplines(value);
    } else if (GeoSplineLike[Symbol.hasInstance](value)) {
      return GeoPath.of(GeoSpline.fromLike(value as GeoSplineLike));
    }
    throw new TypeError("" + value);
  }

  static fromSplines(values: GeoPathSplines): GeoPath {
    const n = values.length;
    const splines = new Array<GeoSpline>(n);
    for (let i = 0; i < n; i += 1) {
      splines[i] = GeoSpline.fromLike(values[i]!);
    }
    return new GeoPath(splines);
  }

  static fromPoints(points: GeoSplinePoints): GeoPath {
    return new GeoPath([GeoSpline.fromPoints(points)]);
  }
}

/** @public */
export class GeoPathBuilder implements GeoPathContext {
  /** @internal */
  splines: GeoSpline[];
  /** @internal */
  builder: GeoSplineBuilder | null;

  constructor() {
    this.splines = [];
    this.builder = null;
  }

  moveTo(lng: number, lat: number): void {
    let builder = this.builder;
    if (builder !== null) {
      const spline = builder.build();
      if (spline.isDefined()) {
        this.splines.push(spline);
      }
    }
    builder = new GeoSplineBuilder();
    this.builder = builder;
    builder.moveTo(lng, lat);
  }

  closePath(): void {
    const builder = this.builder;
    if (builder === null) {
      throw new Error();
    }
    builder.closePath();
  }

  lineTo(lng: number, lat: number): void {
    const builder = this.builder;
    if (builder === null) {
      throw new Error();
    }
    builder.lineTo(lng, lat);
  }

  build(): GeoPath {
    const splines = this.splines.slice(0);
    const builder = this.builder;
    if (builder !== null) {
      const spline = builder.build();
      if (spline.isDefined()) {
        splines.push(spline);
      }
    }
    return new GeoPath(splines);
  }
}
