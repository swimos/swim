// Copyright 2015-2020 SWIM.AI inc.
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
import {AnyR2Shape, R2Shape} from "./R2Shape";
import {PointR2} from "./PointR2";
import {SegmentR2} from "./SegmentR2";
import {CircleR2} from "./CircleR2";

export type AnyBoxR2 = BoxR2 | BoxR2Init;

export interface BoxR2Init {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export class BoxR2 extends R2Shape implements HashCode, Debug {
  /** @hidden */
  readonly _xMin: number;
  /** @hidden */
  readonly _yMin: number;
  /** @hidden */
  readonly _xMax: number;
  /** @hidden */
  readonly _yMax: number;

  constructor(xMin: number, yMin: number, xMax: number, yMax: number) {
    super();
    this._xMin = xMin;
    this._yMin = yMin;
    this._xMax = xMax;
    this._yMax = yMax;
  }

  isDefined(): boolean {
    return isFinite(this._xMin) && isFinite(this._yMin)
        && isFinite(this._xMax) && isFinite(this._yMax);
  }

  get xMin(): number {
    return this._xMin;
  }

  get yMin(): number {
    return this._yMin;
  }

  get xMax(): number {
    return this._xMax;
  }

  get yMax(): number {
    return this._yMax;
  }

  get x(): number {
    return this._xMin;
  }

  get y(): number {
    return this._yMin;
  }

  get width(): number {
    return this._xMax - this._xMin;
  }

  get height(): number {
    return this._yMax - this._yMin;
  }

  get top(): number {
    return this._yMin;
  }

  get right(): number {
    return this._xMax;
  }

  get bottom(): number {
    return this._yMax;
  }

  get left(): number {
    return this._xMin;
  }

  get center(): PointR2 {
    return new PointR2((this._xMin + this._xMax) / 2, (this._yMin + this._yMax) / 2);
  }

  contains(that: AnyShape): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShape | number, y?: number): boolean {
    if (typeof that === "number") {
      return this._xMin <= that && that <= this._xMax
          && this._yMin <= y! && y! <= this._yMax;
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
        } else {
          return this._xMin <= that.xMin && that.xMax <= this._xMax
              && this._yMin <= that.yMin && that.yMax <= this._yMax;
        }
      }
      return false;
    }
  }

  /** @hidden */
  containsPoint(that: PointR2): boolean {
    return this._xMin <= that._x && that._x <= this._xMax
        && this._yMin <= that._y && that._y <= this._yMax;
  }

  /** @hidden */
  containsSegment(that: SegmentR2): boolean {
    return this._xMin <= that._x0 && that._x0 <= this._xMax
        && this._yMin <= that._y0 && that._y0 <= this._yMax
        && this._xMin <= that._x1 && that._x1 <= this._xMax
        && this._yMin <= that._y1 && that._y1 <= this._yMax;
  }

  /** @hidden */
  containsBox(that: BoxR2): boolean {
    return this._xMin <= that._xMin && that._xMax <= this._xMax
        && this._yMin <= that._yMin && that._yMax <= this._yMax;
  }

  /** @hidden */
  containsCircle(that: CircleR2): boolean {
    return this._xMin <= that._cx - that._r && that._cx + that._r <= this._xMax
        && this._yMin <= that._cy - that._r && that._cy + that._r <= this._yMax;
  }

  intersects(that: Shape): boolean {
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
    return this._xMin <= that._x && that._x <= this._xMax
        && this._yMin <= that._y && that._y <= this._yMax;
  }

  /** @hidden */
  intersectsSegment(that: SegmentR2): boolean {
    const xMin = this._xMin;
    const yMin = this._yMin;
    const xMax = this._xMax;
    const yMax = this._yMax;
    const x0 = that._x0;
    const y0 = that._y0;
    const x1 = that._x1;
    const y1 = that._y1;
    if (x0 < xMin && x1 < xMin || x0 > xMax && x1 > xMax ||
        y0 < yMin && y1 < yMin || y0 > yMax && y1 > yMax) {
      return false;
    } else if (x0 > xMin && x0 < xMax && y0 > yMin && y0 < yMax) {
      return true;
    } else if ((BoxR2.intersectsSegment(x0 - xMin, x1 - xMin, x0, y0, x1, y1) && BoxR2._hitY > yMin && BoxR2._hitY < yMax)
            || (BoxR2.intersectsSegment(y0 - yMin, y1 - yMin, x0, y0, x1, y1) && BoxR2._hitX > xMin && BoxR2._hitX < xMax)
            || (BoxR2.intersectsSegment(x0 - xMax, x1 - xMax, x0, y0, x1, y1) && BoxR2._hitY > yMin && BoxR2._hitY < yMax)
            || (BoxR2.intersectsSegment(y0 - yMax, y1 - yMax, x0, y0, x1, y1) && BoxR2._hitX > xMin && BoxR2._hitX < xMax)) {
      return true;
    } else {
      return false;
    }
  }

  private static _hitX: number = 0; // stack local hit register
  private static _hitY: number = 0; // stack local hit register
  private static intersectsSegment(d0: number, d1: number, x0: number, y0: number, x1: number, y1: number): boolean {
    if (d0 !== d1 || d0 * d1 < 0) {
      const scale = -d0 / (d1 - d0);
      BoxR2._hitX = x0 + (x1 - x0) * scale;
      BoxR2._hitY = y0 + (y1 - y0) * scale;
      return true;
    }
    return false;
  }

  /** @hidden */
  intersectsBox(that: BoxR2): boolean {
    return this._xMin <= that._xMax && that._xMin <= this._xMax
        && this._yMin <= that._yMax && that._yMin <= this._yMax;
  }

  /** @hidden */
  intersectsCircle(that: CircleR2): boolean {
    const dx = (that._cx < this._xMin ? this._xMin : this._xMax < that._cx ? this._xMax : that._cx) - that._cx;
    const dy = (that._cy < this._yMin ? this._yMin : this._yMax < that._cy ? this._yMax : that._cy) - that._cy;
    return dx * dx + dy * dy <= that._r * that._r;
  }

  union(that: AnyR2Shape): BoxR2 {
    return super.union(that) as BoxR2;
  }

  transform(f: R2Function): BoxR2 {
    return new BoxR2(f.transformX(this.xMin, this.yMin), f.transformY(this.xMin, this.yMin),
                     f.transformX(this.xMax, this.yMax), f.transformY(this.xMax, this.yMax));
  }

  boundingBox(): BoxR2 {
    return this;
  }

  toAny(): BoxR2Init {
    return {
      xMin: this._xMin,
      yMin: this._yMin,
      xMax: this._xMax,
      yMax: this._yMax,
    };
  }

  protected canEqual(that: BoxR2): boolean {
    return true;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxR2) {
      return that.canEqual(this) && this._xMin === that._xMin && this._yMin === that._yMin
          && this._xMax === that._xMax && this._yMax === that._yMax;
    }
    return false;
  }

  hashCode(): number {
    if (BoxR2._hashSeed === void 0) {
      BoxR2._hashSeed = Murmur3.seed(BoxR2);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(BoxR2._hashSeed,
        Murmur3.hash(this.xMin)), Murmur3.hash(this.yMin)),
        Murmur3.hash(this.xMax)), Murmur3.hash(this.yMax)));
  }

  debug(output: Output): void {
    output.write("BoxR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this.xMin).write(", ").debug(this.yMin).write(", ")
        .debug(this.xMax).write(", ").debug(this.yMax).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;

  private static _undefined?: BoxR2;

  static undefined(): BoxR2 {
    if (BoxR2._undefined === void 0) {
      BoxR2._undefined = new BoxR2(Infinity, Infinity, -Infinity, -Infinity);
    }
    return BoxR2._undefined;
  }

  static from(xMin: number, yMin: number, xMax?: number, yMax?: number): BoxR2 {
    if (xMax === void 0) {
      xMax = xMin;
    }
    if (yMax === void 0) {
      yMax = yMin;
    }
    return new BoxR2(xMin, yMin, xMax, yMax);
  }

  static fromInit(value: BoxR2Init): BoxR2 {
    return new BoxR2(value.xMin, value.yMin, value.xMax, value.yMax);
  }

  static fromAny(value: AnyBoxR2): BoxR2 {
    if (value instanceof BoxR2) {
      return value;
    } else if (BoxR2.isInit(value)) {
      return BoxR2.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is BoxR2Init {
    if (typeof value === "object" && value !== null) {
      const init = value as BoxR2Init;
      return typeof init.xMin === "number"
          && typeof init.yMin === "number"
          && typeof init.xMax === "number"
          && typeof init.yMax === "number";
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyBoxR2 {
    return value instanceof BoxR2
        || BoxR2.isInit(value);
  }
}
R2Shape.Box = BoxR2;
