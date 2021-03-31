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

import {HashCode, Murmur3, Numbers, Constructors} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import type {R2Function} from "./R2Function";
import {AnyShapeR2, ShapeR2} from "./ShapeR2";
import {PointR2} from "./PointR2";
import type {CurveR2Context} from "./CurveR2Context";
import {BezierCurveR2} from "./BezierCurveR2";
import {SegmentR2Interpolator} from "../"; // forward import

export type AnySegmentR2 = SegmentR2 | SegmentR2Init;

export interface SegmentR2Init {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export class SegmentR2 extends BezierCurveR2 implements Interpolate<SegmentR2>, HashCode, Debug {
  constructor(x0: number, y0: number, x1: number, y1: number) {
    super();
    Object.defineProperty(this, "x0", {
      value: x0,
      enumerable: true,
    });
    Object.defineProperty(this, "y0", {
      value: y0,
      enumerable: true,
    });
    Object.defineProperty(this, "x1", {
      value: x1,
      enumerable: true,
    });
    Object.defineProperty(this, "y1", {
      value: y1,
      enumerable: true,
    });
  }

  isDefined(): boolean {
    return isFinite(this.x0) && isFinite(this.y0)
        && isFinite(this.x1) && isFinite(this.y1);
  }

  declare readonly x0: number;

  declare readonly y0: number;

  declare readonly x1: number;

  declare readonly y1: number;

  get xMin(): number {
    return Math.min(this.x0, this.x1);
  }

  get yMin(): number {
    return Math.min(this.y0, this.y1);
  }

  get xMax(): number {
    return Math.max(this.x0, this.x1);
  }

  get yMax(): number {
    return Math.max(this.y0, this.y1);
  }

  interpolateX(u: number): number {
    return (1.0 - u) * this.x0 + u * this.x1;
  }

  interpolateY(u: number): number {
    return (1.0 - u) * this.y0 + u * this.y1;
  }

  interpolate(u: number): PointR2 {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    return new PointR2(x01, y01);
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    if (typeof that === "number") {
      return SegmentR2.contains(this.x0, this.y0, this.x1, this.y1, that, y!);
    } else {
      that = ShapeR2.fromAny(that);
      if (that instanceof PointR2) {
        return this.containsPoint(that);
      } else if (that instanceof SegmentR2) {
        return this.containsSegment(that);
      }
      return false;
    }
  }

  /** @hidden */
  containsPoint(that: PointR2): boolean {
    return SegmentR2.contains(this.x0, this.y0, this.x1, this.y1, that.x, that.y);
  }

  /** @hidden */
  containsSegment(that: SegmentR2): boolean {
    return SegmentR2.contains(this.x0, this.y0, this.x1, this.y1, that.x0, that.y0)
        && SegmentR2.contains(this.x0, this.y0, this.x1, this.y1, that.x1, that.y1);
  }

  /** @hidden */
  static contains(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
    return (ax <= cx && cx <= bx || bx <= cx && cx <= ax)
        && (ay <= cy && cy <= by || by <= cy && cy <= ay)
        && (bx - ax) * (cy - ay) === (cx - ax) * (by - ay);
  }

  intersects(that: AnyShapeR2): boolean {
    that = ShapeR2.fromAny(that);
    if (that instanceof PointR2) {
      return this.intersectsPoint(that);
    } else if (that instanceof SegmentR2) {
      return this.intersectsSegment(that);
    } else {
      return (that as ShapeR2).intersects(this);
    }
    return false;
  }

  /** @hidden */
  intersectsPoint(that: PointR2): boolean {
    return SegmentR2.contains(this.x0, this.y0, this.x1, this.y1, that.x, that.y);
  }

  /** @hidden */
  intersectsSegment(that: SegmentR2): boolean {
    return SegmentR2.intersects(this.x0, this.y0, this.x1 - this.x0, this.y1 - this.y0,
                                that.x0, that.y0, that.x1 - that.x0, that.y1 - that.y0);
  }

  /** @hidden */
  static intersects(px: number, py: number, rx: number, ry: number,
                    qx: number, qy: number, sx: number, sy: number): boolean {
    const pqx = qx - px;
    const pqy = qy - py;
    const pqr = pqx * ry - pqy * rx;
    const rs = rx * sy - ry * sx;
    if (pqr === 0 && rs === 0) { // collinear
      const rr = rx * rx + ry * ry;
      const sr = sx * rx + sy * ry;
      const t0 = (pqx * rx + pqy * ry) / rr;
      const t1 = t0 + sr / rr;
      return sr >= 0 ? 0 < t1 && t0 < 1 : 0 < t0 && t1 < 1;
    } else if (rs === 0) { // parallel
      return false;
    } else {
      const pqs = pqx * sy - pqy * sx;
      const t = pqs / rs; // (q − p) × s / (r × s)
      const u = pqr / rs; // (q − p) × r / (r × s)
      return 0 <= t && t <= 1 && 0 <= u && u <= 1;
    }
  }

  split(u: number): [SegmentR2, SegmentR2] {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    const c0 = new SegmentR2(this.x0, this.y0, x01, y01);
    const c1 = new SegmentR2(x01, y01, this.x1, this.y1);
    return [c0, c1];
  }

  transform(f: R2Function): SegmentR2 {
    return new SegmentR2(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0),
                         f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1));
  }

  toAny(): SegmentR2Init {
    return {
      x0: this.x0,
      y0: this.y0,
      x1: this.x1,
      y1: this.y1,
    };
  }

  drawMove(context: CurveR2Context): void {
    context.moveTo(this.x0, this.y0);
  }

  drawRest(context: CurveR2Context): void {
    context.lineTo(this.x1, this.y1);
  }

  transformDrawMove(context: CurveR2Context, f: R2Function): void {
    context.moveTo(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0));
  }

  transformDrawRest(context: CurveR2Context, f: R2Function): void {
    context.lineTo(f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1));
  }

  writeMove(output: Output): void {
    output.write(77/*'M'*/);
    Format.displayNumber(this.x0, output)
    output.write(44/*','*/)
    Format.displayNumber(this.y0, output);
  }

  writeRest(output: Output): void {
    output.write(76/*'L'*/);
    Format.displayNumber(this.x1, output)
    output.write(44/*','*/)
    Format.displayNumber(this.y1, output);
  }

  interpolateTo(that: SegmentR2): Interpolator<SegmentR2>;
  interpolateTo(that: unknown): Interpolator<SegmentR2> | null;
  interpolateTo(that: unknown): Interpolator<SegmentR2> | null {
    if (that instanceof SegmentR2) {
      return SegmentR2Interpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SegmentR2) {
      return Numbers.equivalent(this.x0, that.x0, epsilon)
          && Numbers.equivalent(this.y0, that.y0, epsilon)
          && Numbers.equivalent(this.x1, that.x1, epsilon)
          && Numbers.equivalent(this.y1, that.y1, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SegmentR2) {
      return this.x0 === that.x0 && this.y0 === that.y0
          && this.x1 === that.x1 && this.y1 === that.y1;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(SegmentR2), Numbers.hash(this.x0)), Numbers.hash(this.y0)),
        Numbers.hash(this.x1)), Numbers.hash(this.y1)));
  }

  debug(output: Output): void {
    output.write("SegmentR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this.x0).write(", ").debug(this.y0).write(", ")
        .debug(this.x1).write(", ").debug(this.y1).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  static of(x0: number, y0: number, x1: number, y1: number): SegmentR2 {
    return new SegmentR2(x0, y0, x1, y1);
  }

  static fromInit(value: SegmentR2Init): SegmentR2 {
    return new SegmentR2(value.x0, value.y0, value.x1, value.y1);
  }

  static fromAny(value: AnySegmentR2): SegmentR2 {
    if (value === void 0 || value === null || value instanceof SegmentR2) {
      return value;
    } else if (SegmentR2.isInit(value)) {
      return SegmentR2.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is SegmentR2Init {
    if (typeof value === "object" && value !== null) {
      const init = value as SegmentR2Init;
      return typeof init.x0 === "number"
          && typeof init.y0 === "number"
          && typeof init.x1 === "number"
          && typeof init.y1 === "number";
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnySegmentR2 {
    return value instanceof SegmentR2
        || SegmentR2.isInit(value);
  }
}
