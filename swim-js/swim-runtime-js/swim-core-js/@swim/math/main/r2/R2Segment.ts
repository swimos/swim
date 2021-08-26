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

import {HashCode, Murmur3, Numbers, Constructors} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import type {R2Function} from "./R2Function";
import {AnyR2Shape, R2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import type {R2CurveContext} from "./R2CurveContext";
import {R2BezierCurve} from "./R2BezierCurve";
import {R2SegmentInterpolator} from "../"; // forward import

export type AnyR2Segment = R2Segment | R2SegmentInit;

export interface R2SegmentInit {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export class R2Segment extends R2BezierCurve implements Interpolate<R2Segment>, HashCode, Debug {
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

  readonly x0!: number;

  readonly y0!: number;

  readonly x1!: number;

  readonly y1!: number;

  override get xMin(): number {
    return Math.min(this.x0, this.x1);
  }

  override get yMin(): number {
    return Math.min(this.y0, this.y1);
  }

  override get xMax(): number {
    return Math.max(this.x0, this.x1);
  }

  override get yMax(): number {
    return Math.max(this.y0, this.y1);
  }

  override interpolateX(u: number): number {
    return (1.0 - u) * this.x0 + u * this.x1;
  }

  override interpolateY(u: number): number {
    return (1.0 - u) * this.y0 + u * this.y1;
  }

  override interpolate(u: number): R2Point {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    return new R2Point(x01, y01);
  }

  override contains(that: AnyR2Shape): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: AnyR2Shape | number, y?: number): boolean {
    if (typeof that === "number") {
      return R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that, y!);
    } else {
      that = R2Shape.fromAny(that);
      if (that instanceof R2Point) {
        return this.containsPoint(that);
      } else if (that instanceof R2Segment) {
        return this.containsSegment(that);
      }
      return false;
    }
  }

  /** @hidden */
  containsPoint(that: R2Point): boolean {
    return R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that.x, that.y);
  }

  /** @hidden */
  containsSegment(that: R2Segment): boolean {
    return R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that.x0, that.y0)
        && R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that.x1, that.y1);
  }

  /** @hidden */
  static contains(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
    return (ax <= cx && cx <= bx || bx <= cx && cx <= ax)
        && (ay <= cy && cy <= by || by <= cy && cy <= ay)
        && (bx - ax) * (cy - ay) === (cx - ax) * (by - ay);
  }

  override intersects(that: AnyR2Shape): boolean {
    that = R2Shape.fromAny(that);
    if (that instanceof R2Point) {
      return this.intersectsPoint(that);
    } else if (that instanceof R2Segment) {
      return this.intersectsSegment(that);
    } else {
      return (that as R2Shape).intersects(this);
    }
    return false;
  }

  /** @hidden */
  intersectsPoint(that: R2Point): boolean {
    return R2Segment.contains(this.x0, this.y0, this.x1, this.y1, that.x, that.y);
  }

  /** @hidden */
  intersectsSegment(that: R2Segment): boolean {
    return R2Segment.intersects(this.x0, this.y0, this.x1 - this.x0, this.y1 - this.y0,
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

  override split(u: number): [R2Segment, R2Segment] {
    const v = 1.0 - u;
    const x01 = v * this.x0 + u * this.x1;
    const y01 = v * this.y0 + u * this.y1;
    const c0 = new R2Segment(this.x0, this.y0, x01, y01);
    const c1 = new R2Segment(x01, y01, this.x1, this.y1);
    return [c0, c1];
  }

  override transform(f: R2Function): R2Segment {
    return new R2Segment(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0),
                         f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1));
  }

  toAny(): R2SegmentInit {
    return {
      x0: this.x0,
      y0: this.y0,
      x1: this.x1,
      y1: this.y1,
    };
  }

  override drawMove(context: R2CurveContext): void {
    context.moveTo(this.x0, this.y0);
  }

  override drawRest(context: R2CurveContext): void {
    context.lineTo(this.x1, this.y1);
  }

  override transformDrawMove(context: R2CurveContext, f: R2Function): void {
    context.moveTo(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0));
  }

  override transformDrawRest(context: R2CurveContext, f: R2Function): void {
    context.lineTo(f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1));
  }

  override writeMove(output: Output): void {
    output.write(77/*'M'*/);
    Format.displayNumber(this.x0, output)
    output.write(44/*','*/)
    Format.displayNumber(this.y0, output);
  }

  override writeRest(output: Output): void {
    output.write(76/*'L'*/);
    Format.displayNumber(this.x1, output)
    output.write(44/*','*/)
    Format.displayNumber(this.y1, output);
  }

  interpolateTo(that: R2Segment): Interpolator<R2Segment>;
  interpolateTo(that: unknown): Interpolator<R2Segment> | null;
  interpolateTo(that: unknown): Interpolator<R2Segment> | null {
    if (that instanceof R2Segment) {
      return R2SegmentInterpolator(this, that);
    } else {
      return null;
    }
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Segment) {
      return Numbers.equivalent(this.x0, that.x0, epsilon)
          && Numbers.equivalent(this.y0, that.y0, epsilon)
          && Numbers.equivalent(this.x1, that.x1, epsilon)
          && Numbers.equivalent(this.y1, that.y1, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Segment) {
      return this.x0 === that.x0 && this.y0 === that.y0
          && this.x1 === that.x1 && this.y1 === that.y1;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(R2Segment), Numbers.hash(this.x0)), Numbers.hash(this.y0)),
        Numbers.hash(this.x1)), Numbers.hash(this.y1)));
  }

  debug(output: Output): void {
    output.write("R2Segment").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this.x0).write(", ").debug(this.y0).write(", ")
        .debug(this.x1).write(", ").debug(this.y1).write(41/*')'*/);
  }

  override toString(): string {
    return Format.debug(this);
  }

  static of(x0: number, y0: number, x1: number, y1: number): R2Segment {
    return new R2Segment(x0, y0, x1, y1);
  }

  static fromInit(value: R2SegmentInit): R2Segment {
    return new R2Segment(value.x0, value.y0, value.x1, value.y1);
  }

  static override fromAny(value: AnyR2Segment): R2Segment {
    if (value === void 0 || value === null || value instanceof R2Segment) {
      return value;
    } else if (R2Segment.isInit(value)) {
      return R2Segment.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is R2SegmentInit {
    if (typeof value === "object" && value !== null) {
      const init = value as R2SegmentInit;
      return typeof init.x0 === "number"
          && typeof init.y0 === "number"
          && typeof init.x1 === "number"
          && typeof init.y1 === "number";
    }
    return false;
  }

  /** @hidden */
  static override isAny(value: unknown): value is AnyR2Segment {
    return value instanceof R2Segment
        || R2Segment.isInit(value);
  }
}
