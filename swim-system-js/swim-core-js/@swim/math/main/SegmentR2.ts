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

export type AnySegmentR2 = SegmentR2 | SegmentR2Init;

export interface SegmentR2Init {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export class SegmentR2 extends R2Shape implements HashCode, Debug {
  /** @hidden */
  readonly _x0: number;
  /** @hidden */
  readonly _y0: number;
  /** @hidden */
  readonly _x1: number;
  /** @hidden */
  readonly _y1: number;

  constructor(x0: number, y0: number, x1: number, y1: number) {
    super();
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
  }

  get x0(): number {
    return this._x0;
  }

  get y0(): number {
    return this._y0;
  }

  get x1(): number {
    return this._x1;
  }

  get y1(): number {
    return this._y1;
  }

  get xMin(): number {
    return Math.min(this._x0, this._x1);
  }

  get yMin(): number {
    return Math.min(this._y0, this._y1);
  }

  get xMax(): number {
    return Math.max(this._x0, this._x1);
  }

  get yMax(): number {
    return Math.max(this._y0, this._y1);
  }

  contains(that: AnyShape): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShape | number, y?: number): boolean {
    if (typeof that === "number") {
      return SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that, y!);
    } else {
      that = Shape.fromAny(that);
      if (that instanceof R2Shape) {
        if (that instanceof PointR2) {
          return this.containsPoint(that);
        } else if (that instanceof SegmentR2) {
          return this.containsSegment(that);
        }
      }
      return false;
    }
  }

  /** @hidden */
  containsPoint(that: PointR2): boolean {
    return SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that._x, that._y);
  }

  /** @hidden */
  containsSegment(that: SegmentR2): boolean {
    return SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that._x0, that._y0)
        && SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that._x1, that._y1);
  }

  intersects(that: AnyShape): boolean {
    that = Shape.fromAny(that);
    if (that instanceof R2Shape) {
      if (that instanceof PointR2) {
        return this.intersectsPoint(that);
      } else if (that instanceof SegmentR2) {
        return this.intersectsSegment(that);
      } else {
        return that.intersects(this);
      }
    }
    return false;
  }

  /** @hidden */
  intersectsPoint(that: PointR2): boolean {
    return SegmentR2.contains(this._x0, this._y0, this._x1, this._y1, that._x, that._y);
  }

  /** @hidden */
  intersectsSegment(that: SegmentR2): boolean {
    return SegmentR2.intersects(this._x0, this._y0, this._x1 - this._x0, this._y1 - this._y0,
                                that._x0, that._y0, that._x1 - that._x0, that._y1 - that._y0);
  }

  transform(f: R2Function): SegmentR2 {
    return new SegmentR2(f.transformX(this.x0, this.y0), f.transformY(this.x0, this.y0),
                         f.transformX(this.x1, this.y1), f.transformY(this.x1, this.y1));
  }

  /** @hidden */
  private static contains(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean {
    return (ax <= cx && cx <= bx || bx <= cx && cx <= ax)
        && (ay <= cy && cy <= by || by <= cy && cy <= ay)
        && (bx - ax) * (cy - ay) === (cx - ax) * (by - ay);
  }

  /** @hidden */
  private static intersects(px: number, py: number, rx: number, ry: number,
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

  toAny(): SegmentR2Init {
    return {
      x0: this._x0,
      y0: this._y0,
      x1: this._x1,
      y1: this._y1,
    };
  }

  protected canEqual(that: SegmentR2): boolean {
    return true;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SegmentR2) {
      return that.canEqual(this) && this._x0 === that._x0 && this._y0 === that._y0
          && this._x1 === that._x1 && this._y1 === that._y1;
    }
    return false;
  }

  hashCode(): number {
    if (SegmentR2._hashSeed === void 0) {
      SegmentR2._hashSeed = Murmur3.seed(SegmentR2);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(SegmentR2._hashSeed,
        Murmur3.hash(this._x0)), Murmur3.hash(this._y0)),
        Murmur3.hash(this._x1)), Murmur3.hash(this._y1)));
  }

  debug(output: Output): void {
    output.write("SegmentR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this._x0).write(", ").debug(this._y0).write(", ")
        .debug(this._x1).write(", ").debug(this._y1).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;

  static of(x0: number, y0: number, x1: number, y1: number): SegmentR2 {
    return new SegmentR2(x0, y0, x1, y1);
  }

  static fromAny(segment: AnySegmentR2): SegmentR2 {
    if (segment instanceof SegmentR2) {
      return segment;
    } else if (typeof segment === "object" && segment) {
      return new SegmentR2(segment.x0, segment.y0, segment.x1, segment.y1);
    }
    throw new TypeError("" + segment);
  }
}
R2Shape.Segment = SegmentR2;
