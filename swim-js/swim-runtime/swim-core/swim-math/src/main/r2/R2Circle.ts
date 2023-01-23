// Copyright 2015-2023 Swim.inc
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

import {
  Equivalent,
  HashCode,
  Murmur3,
  Numbers,
  Constructors,
  Interpolate,
  Interpolator,
} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {R2Function} from "./R2Function";
import {AnyR2Shape, R2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import {R2Segment} from "./R2Segment";
import {R2Box} from "./R2Box";
import {R2CircleInterpolator} from "../"; // forward import

/** @public */
export type AnyR2Circle = R2Circle | R2CircleInit;

/** @public */
export interface R2CircleInit {
  cx: number;
  cy: number;
  r: number;
}

/** @public */
export class R2Circle extends R2Shape implements Interpolate<R2Circle>, HashCode, Equivalent, Debug {
  constructor(cx: number, cy: number, r: number) {
    super();
    this.cx = cx;
    this.cy = cy;
    this.r = r;
  }

  isDefined(): boolean {
    return isFinite(this.cx) && isFinite(this.cy) && isFinite(this.r);
  }

  readonly cx: number;

  readonly cy: number;

  readonly r: number;

  override get xMin(): number {
    return this.cx - this.r;
  }

  override get yMin(): number {
    return this.cy - this.r;
  }

  override get xMax(): number {
    return this.cx + this.r;
  }

  override get yMax(): number {
    return this.cy + this.r;
  }

  override contains(that: AnyR2Shape): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: AnyR2Shape | number, y?: number): boolean {
    if (typeof that === "number") {
      const dx = that - this.cx;
      const dy = y! - this.cy;
      return dx * dx + dy * dy <= this.r * this.r;
    } else {
      that = R2Shape.fromAny(that);
      if (that instanceof R2Point) {
        return this.containsPoint(that);
      } else if (that instanceof R2Segment) {
        return this.containsSegment(that);
      } else if (that instanceof R2Box) {
        return this.containsBox(that);
      } else if (that instanceof R2Circle) {
        return this.containsCircle(that);
      }
      return false;
    }
  }

  /** @internal */
  containsPoint(that: R2Point): boolean {
    const dx = that.x - this.cx;
    const dy = that.y - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  /** @internal */
  containsSegment(that: R2Segment): boolean {
    const dx0 = that.x0 - this.cx;
    const dy0 = that.y0 - this.cy;
    const dx1 = that.x1 - this.cx;
    const dy1 = that.y1 - this.cy;
    const r2 = this.r * this.r;
    return dx0 * dx0 + dy0 * dy0 <= r2
        && dx1 * dx1 + dy1 * dy1 <= r2;
  }

  /** @internal */
  containsBox(that: R2Box): boolean {
    const dxMin = that.xMin - this.cx;
    const dyMin = that.yMin - this.cy;
    const dxMax = that.xMax - this.cx;
    const dyMax = that.yMax - this.cy;
    const r2 = this.r * this.r;
    return dxMin * dxMin + dyMin * dyMin <= r2
        && dxMin * dxMin + dyMax * dyMax <= r2
        && dxMax * dxMax + dyMin * dyMin <= r2
        && dxMax * dxMax + dyMax * dyMax <= r2;
  }

  /** @internal */
  containsCircle(that: R2Circle): boolean {
    const dx = that.cx - this.cx;
    const dy = that.cy - this.cy;
    return dx * dx + dy * dy + that.r * that.r <= this.r * this.r;
  }

  override intersects(that: AnyR2Shape): boolean {
    that = R2Shape.fromAny(that);
    if (that instanceof R2Point) {
      return this.intersectsPoint(that);
    } else if (that instanceof R2Segment) {
      return this.intersectsSegment(that);
    } else if (that instanceof R2Box) {
      return this.intersectsBox(that);
    } else if (that instanceof R2Circle) {
      return this.intersectsCircle(that);
    } else {
      return (that as R2Shape).intersects(this);
    }
    return false;
  }

  /** @internal */
  intersectsPoint(that: R2Point): boolean {
    const dx = that.x - this.cx;
    const dy = that.y - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  /** @internal */
  intersectsSegment(that: R2Segment): boolean {
    const cx = this.cx;
    const cy = this.cy;
    const r = this.r;
    const x0 = that.x0;
    const y0 = that.y0;
    const x1 = that.x1;
    const y1 = that.y1;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const l = Math.sqrt(dx * dx + dy * dy);
    const unitX = dx / l;
    const unitY = dy / l;
    const d = (cx - x0) * unitY - (cy - y0) * unitX;
    if (d < -r || r < d) {
      return false;
    } else {
      const dcx0 = x0 - cx;
      const dcy0 = y0 - cy;
      const dcx1 = x1 - cx;
      const dcy1 = y1 - cy;
      const r2 = r * r;
      if (dcx0 * dcx0 + dcy0 * dcy0 <= r2 || dcx1 * dcx1 + dcy1 * dcy1 <= r2) {
        return true;
      } else {
        const uc = unitX * cx + unitY * cy;
        const u0 = unitX * x0 + unitY * y0;
        const u1 = unitX * x1 + unitY * y1;
        return u0 < uc && uc <= u1 || u1 < uc && uc <= u0;
      }
    }
  }

  /** @internal */
  intersectsBox(that: R2Box): boolean {
    const dx = (this.cx < that.xMin ? that.xMin : that.xMax < this.cx ? that.xMax : this.cx) - this.cx;
    const dy = (this.cy < that.yMin ? that.yMin : that.yMax < this.cy ? that.yMax : this.cy) - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  /** @internal */
  intersectsCircle(that: R2Circle): boolean {
    const dx = that.cx - this.cx;
    const dy = that.cy - this.cy;
    const rr = this.r + that.r;
    return dx * dx + dy * dy <= rr * rr;
  }

  override transform(f: R2Function): R2Circle {
    const cx = f.transformX(this.cx, this.cy);
    const cy = f.transformY(this.cx, this.cy);
    const rx = f.transformX(this.cx + this.r, this.cy);
    const ry = f.transformY(this.cx + this.r, this.cy);
    const dx = rx - cx;
    const dy = ry - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    return new R2Circle(cx, cy, r);
  }

  toAny(): R2CircleInit {
    return {
      cx: this.cx,
      cy: this.cy,
      r: this.r,
    };
  }

  interpolateTo(that: R2Circle): Interpolator<R2Circle>;
  interpolateTo(that: unknown): Interpolator<R2Circle> | null;
  interpolateTo(that: unknown): Interpolator<R2Circle> | null {
    if (that instanceof R2Circle) {
      return R2CircleInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Circle) {
      return Numbers.equivalent(this.cx, that.cx, epsilon)
          && Numbers.equivalent(this.cy, that.cy, epsilon)
          && Numbers.equivalent(this.r, that.r, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Circle) {
      return this.cx === that.cx && this.cy === that.cy && this.r === that.r;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Constructors.hash(R2Circle),
        Numbers.hash(this.cx)), Numbers.hash(this.cy)), Numbers.hash(this.r)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Circle").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.cx).write(", ").debug(this.cy).write(", ")
                   .debug(this.r).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  static of(cx: number, cy: number, r: number): R2Circle {
    return new R2Circle(cx, cy, r);
  }

  static fromInit(value: R2CircleInit): R2Circle {
    return new R2Circle(value.cx, value.cy, value.r);
  }

  static override fromAny(value: AnyR2Circle): R2Circle {
    if (value === void 0 || value === null || value instanceof R2Circle) {
      return value;
    } else if (R2Circle.isInit(value)) {
      return R2Circle.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @internal */
  static isInit(value: unknown): value is R2CircleInit {
    if (typeof value === "object" && value !== null) {
      const init = value as R2CircleInit;
      return typeof init.cx === "number"
          && typeof init.cy === "number"
          && typeof init.r === "number";
    }
    return false;
  }

  /** @internal */
  static override isAny(value: unknown): value is AnyR2Circle {
    return value instanceof R2Circle
        || R2Circle.isInit(value);
  }
}
