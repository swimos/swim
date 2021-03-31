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

import {Equivalent, HashCode, Murmur3, Numbers, Constructors} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import type {R2Function} from "./R2Function";
import {AnyShapeR2, ShapeR2} from "./ShapeR2";
import {PointR2} from "./PointR2";
import {SegmentR2} from "./SegmentR2";
import {BoxR2} from "./BoxR2";
import {CircleR2Interpolator} from "../"; // forward import

export type AnyCircleR2 = CircleR2 | CircleR2Init;

export interface CircleR2Init {
  cx: number;
  cy: number;
  r: number;
}

export class CircleR2 extends ShapeR2 implements Interpolate<CircleR2>, HashCode, Equivalent, Debug {
  constructor(cx: number, cy: number, r: number) {
    super();
    Object.defineProperty(this, "cx", {
      value: cx,
      enumerable: true,
    });
    Object.defineProperty(this, "cy", {
      value: cy,
      enumerable: true,
    });
    Object.defineProperty(this, "r", {
      value: r,
      enumerable: true,
    });
  }

  isDefined(): boolean {
    return isFinite(this.cx) && isFinite(this.cy) && isFinite(this.r);
  }

  declare readonly cx: number;

  declare readonly cy: number;

  declare readonly r: number;

  get xMin(): number {
    return this.cx - this.r;
  }

  get yMin(): number {
    return this.cy - this.r;
  }

  get xMax(): number {
    return this.cx + this.r;
  }

  get yMax(): number {
    return this.cy + this.r;
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    if (typeof that === "number") {
      const dx = that - this.cx;
      const dy = y! - this.cy;
      return dx * dx + dy * dy <= this.r * this.r;
    } else {
      that = ShapeR2.fromAny(that);
      if (that instanceof PointR2) {
        return this.containsPoint(that);
      } else if (that instanceof SegmentR2) {
        return this.containsSegment(that);
      } else if (that instanceof BoxR2) {
        return this.containsBox(that);
      } else if (that instanceof CircleR2) {
        return this.containsCircle(that);
      }
      return false;
    }
  }

  /** @hidden */
  containsPoint(that: PointR2): boolean {
    const dx = that.x - this.cx;
    const dy = that.y - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  /** @hidden */
  containsSegment(that: SegmentR2): boolean {
    const dx0 = that.x0 - this.cx;
    const dy0 = that.y0 - this.cy;
    const dx1 = that.x1 - this.cx;
    const dy1 = that.y1 - this.cy;
    const r2 = this.r * this.r;
    return dx0 * dx0 + dy0 * dy0 <= r2
        && dx1 * dx1 + dy1 * dy1 <= r2;
  }

  /** @hidden */
  containsBox(that: BoxR2): boolean {
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

  /** @hidden */
  containsCircle(that: CircleR2): boolean {
    const dx = that.cx - this.cx;
    const dy = that.cy - this.cy;
    return dx * dx + dy * dy + that.r * that.r <= this.r * this.r;
  }

  intersects(that: AnyShapeR2): boolean {
    that = ShapeR2.fromAny(that);
    if (that instanceof PointR2) {
      return this.intersectsPoint(that);
    } else if (that instanceof SegmentR2) {
      return this.intersectsSegment(that);
    } else if (that instanceof BoxR2) {
      return this.intersectsBox(that);
    } else if (that instanceof CircleR2) {
      return this.intersectsCircle(that);
    } else {
      return (that as ShapeR2).intersects(this);
    }
    return false;
  }

  /** @hidden */
  intersectsPoint(that: PointR2): boolean {
    const dx = that.x - this.cx;
    const dy = that.y - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  /** @hidden */
  intersectsSegment(that: SegmentR2): boolean {
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

  /** @hidden */
  intersectsBox(that: BoxR2): boolean {
    const dx = (this.cx < that.xMin ? that.xMin : that.xMax < this.cx ? that.xMax : this.cx) - this.cx;
    const dy = (this.cy < that.yMin ? that.yMin : that.yMax < this.cy ? that.yMax : this.cy) - this.cy;
    return dx * dx + dy * dy <= this.r * this.r;
  }

  /** @hidden */
  intersectsCircle(that: CircleR2): boolean {
    const dx = that.cx - this.cx;
    const dy = that.cy - this.cy;
    const rr = this.r + that.r;
    return dx * dx + dy * dy <= rr * rr;
  }

  transform(f: R2Function): CircleR2 {
    const cx = f.transformX(this.cx, this.cy);
    const cy = f.transformY(this.cx, this.cy);
    const rx = f.transformX(this.cx + this.r, this.cy);
    const ry = f.transformY(this.cx + this.r, this.cy);
    const dx = rx - cx;
    const dy = ry - cy;
    const r = Math.sqrt(dx * dx + dy * dy);
    return new CircleR2(cx, cy, r);
  }

  toAny(): CircleR2Init {
    return {
      cx: this.cx,
      cy: this.cy,
      r: this.r,
    };
  }

  interpolateTo(that: CircleR2): Interpolator<CircleR2>;
  interpolateTo(that: unknown): Interpolator<CircleR2> | null;
  interpolateTo(that: unknown): Interpolator<CircleR2> | null {
    if (that instanceof CircleR2) {
      return CircleR2Interpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof CircleR2) {
      return Numbers.equivalent(this.cx, that.cx, epsilon)
          && Numbers.equivalent(this.cy, that.cy, epsilon)
          && Numbers.equivalent(this.r, that.r, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof CircleR2) {
      return this.cx === that.cx && this.cy === that.cy && this.r === that.r;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Constructors.hash(CircleR2),
        Numbers.hash(this.cx)), Numbers.hash(this.cy)), Numbers.hash(this.r)));
  }

  debug(output: Output): void {
    output.write("CircleR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this.cx).write(", ").debug(this.cy).write(", ").debug(this.r).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  static of(cx: number, cy: number, r: number): CircleR2 {
    return new CircleR2(cx, cy, r);
  }

  static fromInit(value: CircleR2Init): CircleR2 {
    return new CircleR2(value.cx, value.cy, value.r);
  }

  static fromAny(value: AnyCircleR2): CircleR2 {
    if (value === void 0 || value === null || value instanceof CircleR2) {
      return value;
    } else if (CircleR2.isInit(value)) {
      return CircleR2.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is CircleR2Init {
    if (typeof value === "object" && value !== null) {
      const init = value as CircleR2Init;
      return typeof init.cx === "number"
          && typeof init.cy === "number"
          && typeof init.r === "number";
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyCircleR2 {
    return value instanceof CircleR2
        || CircleR2.isInit(value);
  }
}
