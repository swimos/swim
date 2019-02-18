// Copyright 2015-2019 SWIM.AI inc.
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

import {HashCode, Murmur3} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import {AnyShape, Shape} from "./Shape";
import {R2Function} from "./R2Function";
import {R2Shape} from "./R2Shape";
import {PointR2} from "./PointR2";
import {SegmentR2} from "./SegmentR2";
import {BoxR2} from "./BoxR2";

export type AnyCircleR2 = CircleR2 | CircleR2Init;

export interface CircleR2Init {
  cx: number;
  cy: number;
  r: number;
}

export class CircleR2 extends R2Shape implements HashCode, Debug {
  /** @hidden */
  readonly _cx: number;
  /** @hidden */
  readonly _cy: number;
  /** @hidden */
  readonly _r: number;

  constructor(x: number, y: number, r: number) {
    super();
    this._cx = x;
    this._cy = y;
    this._r = r;
  }

  get cx(): number {
    return this._cx;
  }

  get cy(): number {
    return this._cy;
  }

  get r(): number {
    return this._r;
  }

  get xMin(): number {
    return this._cx - this._r;
  }

  get yMin(): number {
    return this._cy - this._r;
  }

  get xMax(): number {
    return this._cx + this._r;
  }

  get yMax(): number {
    return this._cy + this._r;
  }

  contains(that: AnyShape): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShape | number, y?: number): boolean {
    if (typeof that === "number") {
      const dx = that - this._cx;
      const dy = y! - this._cy;
      return dx * dx + dy * dy <= this._r * this._r;
    } else {
      that = Shape.fromAny(that);
      if (that instanceof R2Shape) {
        if (that instanceof PointR2) {
          return this.containsPoint(that);
        } else if (that instanceof SegmentR2) {
          return this.containsSegment(that);
        } else if (that instanceof BoxR2) {
          return this.containsBox(that);
        } else if (that instanceof CircleR2) {
          return this.containsCircle(that);
        }
      }
      return false;
    }
  }

  /** @hidden */
  containsPoint(that: PointR2): boolean {
    const dx = that._x - this._cx;
    const dy = that._y - this._cy;
    return dx * dx + dy * dy <= this._r * this._r;
  }

  /** @hidden */
  containsSegment(that: SegmentR2): boolean {
    const dx0 = that._x0 - this._cx;
    const dy0 = that._y0 - this._cy;
    const dx1 = that._x1 - this._cx;
    const dy1 = that._y1 - this._cy;
    const r2 = this._r * this._r;
    return dx0 * dx0 + dy0 * dy0 <= r2
        && dx1 * dx1 + dy1 * dy1 <= r2;
  }

  /** @hidden */
  containsBox(that: BoxR2): boolean {
    const dxMin = that._xMin - this._cx;
    const dyMin = that._yMin - this._cy;
    const dxMax = that._xMax - this._cx;
    const dyMax = that._yMax - this._cy;
    const r2 = this._r * this._r;
    return dxMin * dxMin + dyMin * dyMin <= r2
        && dxMin * dxMin + dyMax * dyMax <= r2
        && dxMax * dxMax + dyMin * dyMin <= r2
        && dxMax * dxMax + dyMax * dyMax <= r2;
  }

  /** @hidden */
  containsCircle(that: CircleR2): boolean {
    const dx = that._cx - this._cx;
    const dy = that._cy - this._cy;
    return dx * dx + dy * dy + that._r * that._r <= this._r * this._r;
  }

  intersects(that: AnyShape): boolean {
    that = Shape.fromAny(that);
    if (that instanceof R2Shape) {
      if (that instanceof PointR2) {
        return this.intersectsPoint(that);
      } else if (that instanceof SegmentR2) {
        return this.intersectsSegment(that);
      } else if (that instanceof BoxR2) {
        return this.intersectsBox(that);
      } else if (that instanceof CircleR2) {
        return this.intersectsCircle(that);
      } else {
        return that.intersects(this);
      }
    }
    return false;
  }

  /** @hidden */
  intersectsPoint(that: PointR2): boolean {
    const dx = that._x - this._cx;
    const dy = that._y - this._cy;
    return dx * dx + dy * dy <= this._r * this._r;
  }

  /** @hidden */
  intersectsSegment(that: SegmentR2): boolean {
    const cx = this._cx;
    const cy = this._cy;
    const r = this._r;
    const x0 = that._x0;
    const y0 = that._y0;
    const x1 = that._x1;
    const y1 = that._y1;
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
    const dx = (this._cx < that._xMin ? that._xMin : that._xMax < this._cx ? that._xMax : this._cx) - this._cx;
    const dy = (this._cy < that._yMin ? that._yMin : that._yMax < this._cy ? that._yMax : this._cy) - this._cy;
    return dx * dx + dy * dy <= this._r * this._r;
  }

  /** @hidden */
  intersectsCircle(that: CircleR2): boolean {
    const dx = that._cx - this._cx;
    const dy = that._cy - this._cy;
    const rr = this._r + that._r;
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
      cx: this._cx,
      cy: this._cy,
      r: this._r,
    };
  }

  protected canEqual(that: CircleR2): boolean {
    return true;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof CircleR2) {
      return that.canEqual(this) && this._cx === that._cx && this._cy === that._cy && this._r === that._r;
    }
    return false;
  }

  hashCode(): number {
    if (CircleR2._hashSeed === void 0) {
      CircleR2._hashSeed = Murmur3.seed(CircleR2);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(CircleR2._hashSeed,
        Murmur3.hash(this._cx)), Murmur3.hash(this._cy)), Murmur3.hash(this._r)));
  }

  debug(output: Output): void {
    output.write("CircleR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this._cx).write(", ").debug(this._cy).write(", ").debug(this._r).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;

  static of(cx: number, cy: number, r: number): CircleR2 {
    return new CircleR2(cx, cy, r);
  }

  static fromAny(circle: AnyCircleR2): CircleR2 {
    if (circle instanceof CircleR2) {
      return circle;
    } else if (typeof circle === "object" && circle) {
      return new CircleR2(circle.cx, circle.cy, circle.r);
    }
    throw new TypeError("" + circle);
  }
}
R2Shape.Circle = CircleR2;
