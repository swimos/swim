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

import {Equivalent, HashCode, Lazy, Murmur3, Numbers, Constructors} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import type {R2Function} from "./R2Function";
import {AnyShapeR2, ShapeR2} from "./ShapeR2";
import {PointR2} from "./PointR2";
import {SegmentR2} from "./SegmentR2";
import {BoxR2Interpolator} from "../"; // forward import
import {CircleR2} from "./CircleR2";

export type AnyBoxR2 = BoxR2 | BoxR2Init;

export interface BoxR2Init {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export class BoxR2 extends ShapeR2 implements Interpolate<BoxR2>, HashCode, Equivalent, Debug {
  constructor(xMin: number, yMin: number, xMax: number, yMax: number) {
    super();
    Object.defineProperty(this, "xMin", {
      value: xMin,
      enumerable: true,
    });
    Object.defineProperty(this, "yMin", {
      value: yMin,
      enumerable: true,
    });
    Object.defineProperty(this, "xMax", {
      value: xMax,
      enumerable: true,
    });
    Object.defineProperty(this, "yMax", {
      value: yMax,
      enumerable: true,
    });
  }

  isDefined(): boolean {
    return isFinite(this.xMin) && isFinite(this.yMin)
        && isFinite(this.xMax) && isFinite(this.yMax);
  }

  declare readonly xMin: number;

  declare readonly yMin: number;

  declare readonly xMax: number;

  declare readonly yMax: number;

  get x(): number {
    return this.xMin;
  }

  get y(): number {
    return this.yMin;
  }

  get width(): number {
    return this.xMax - this.xMin;
  }

  get height(): number {
    return this.yMax - this.yMin;
  }

  get top(): number {
    return this.yMin;
  }

  get right(): number {
    return this.xMax;
  }

  get bottom(): number {
    return this.yMax;
  }

  get left(): number {
    return this.xMin;
  }

  get center(): PointR2 {
    return new PointR2((this.xMin + this.xMax) / 2, (this.yMin + this.yMax) / 2);
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    if (typeof that === "number") {
      return this.xMin <= that && that <= this.xMax
          && this.yMin <= y! && y! <= this.yMax;
    } else {
      that = ShapeR2.fromAny(that);
      if (that instanceof ShapeR2) {
        if (that instanceof PointR2) {
          return this.containsPoint(that);
        } else if (that instanceof SegmentR2) {
          return this.containsSegment(that);
        } else if (that instanceof BoxR2) {
          return this.containsBox(that);
        } else if (that instanceof CircleR2) {
          return this.containsCircle(that);
        } else {
          return this.xMin <= that.xMin && that.xMax <= this.xMax
              && this.yMin <= that.yMin && that.yMax <= this.yMax;
        }
      }
      return false;
    }
  }

  /** @hidden */
  containsPoint(that: PointR2): boolean {
    return this.xMin <= that.x && that.x <= this.xMax
        && this.yMin <= that.y && that.y <= this.yMax;
  }

  /** @hidden */
  containsSegment(that: SegmentR2): boolean {
    return this.xMin <= that.x0 && that.x0 <= this.xMax
        && this.yMin <= that.y0 && that.y0 <= this.yMax
        && this.xMin <= that.x1 && that.x1 <= this.xMax
        && this.yMin <= that.y1 && that.y1 <= this.yMax;
  }

  /** @hidden */
  containsBox(that: BoxR2): boolean {
    return this.xMin <= that.xMin && that.xMax <= this.xMax
        && this.yMin <= that.yMin && that.yMax <= this.yMax;
  }

  /** @hidden */
  containsCircle(that: CircleR2): boolean {
    return this.xMin <= that.cx - that.r && that.cx + that.r <= this.xMax
        && this.yMin <= that.cy - that.r && that.cy + that.r <= this.yMax;
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
    return this.xMin <= that.x && that.x <= this.xMax
        && this.yMin <= that.y && that.y <= this.yMax;
  }

  /** @hidden */
  intersectsSegment(that: SegmentR2): boolean {
    const xMin = this.xMin;
    const yMin = this.yMin;
    const xMax = this.xMax;
    const yMax = this.yMax;
    const x0 = that.x0;
    const y0 = that.y0;
    const x1 = that.x1;
    const y1 = that.y1;
    if (x0 < xMin && x1 < xMin || x0 > xMax && x1 > xMax ||
        y0 < yMin && y1 < yMin || y0 > yMax && y1 > yMax) {
      return false;
    } else if (x0 > xMin && x0 < xMax && y0 > yMin && y0 < yMax) {
      return true;
    } else if ((BoxR2.intersectsSegment(x0 - xMin, x1 - xMin, x0, y0, x1, y1) && BoxR2.hitY > yMin && BoxR2.hitY < yMax)
            || (BoxR2.intersectsSegment(y0 - yMin, y1 - yMin, x0, y0, x1, y1) && BoxR2.hitX > xMin && BoxR2.hitX < xMax)
            || (BoxR2.intersectsSegment(x0 - xMax, x1 - xMax, x0, y0, x1, y1) && BoxR2.hitY > yMin && BoxR2.hitY < yMax)
            || (BoxR2.intersectsSegment(y0 - yMax, y1 - yMax, x0, y0, x1, y1) && BoxR2.hitX > xMin && BoxR2.hitX < xMax)) {
      return true;
    } else {
      return false;
    }
  }

  /** @hidden */
  static hitX: number = 0; // stack local hit register
  /** @hidden */
  static hitY: number = 0; // stack local hit register
  static intersectsSegment(d0: number, d1: number, x0: number, y0: number, x1: number, y1: number): boolean {
    if (d0 !== d1 || d0 * d1 < 0) {
      const scale = -d0 / (d1 - d0);
      BoxR2.hitX = x0 + (x1 - x0) * scale;
      BoxR2.hitY = y0 + (y1 - y0) * scale;
      return true;
    }
    return false;
  }

  /** @hidden */
  intersectsBox(that: BoxR2): boolean {
    return this.xMin <= that.xMax && that.xMin <= this.xMax
        && this.yMin <= that.yMax && that.yMin <= this.yMax;
  }

  /** @hidden */
  intersectsCircle(that: CircleR2): boolean {
    const dx = (that.cx < this.xMin ? this.xMin : this.xMax < that.cx ? this.xMax : that.cx) - that.cx;
    const dy = (that.cy < this.yMin ? this.yMin : this.yMax < that.cy ? this.yMax : that.cy) - that.cy;
    return dx * dx + dy * dy <= that.r * that.r;
  }

  union(that: AnyShapeR2): BoxR2 {
    return super.union(that) as BoxR2;
  }

  transform(f: R2Function): BoxR2 {
    return new BoxR2(f.transformX(this.xMin, this.yMin), f.transformY(this.xMin, this.yMin),
                     f.transformX(this.xMax, this.yMax), f.transformY(this.xMax, this.yMax));
  }

  get bounds(): BoxR2 {
    return this;
  }

  toAny(): BoxR2Init {
    return {
      xMin: this.xMin,
      yMin: this.yMin,
      xMax: this.xMax,
      yMax: this.yMax,
    };
  }

  interpolateTo(that: BoxR2): Interpolator<BoxR2>;
  interpolateTo(that: unknown): Interpolator<BoxR2> | null;
  interpolateTo(that: unknown): Interpolator<BoxR2> | null {
    if (that instanceof BoxR2) {
      return BoxR2Interpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxR2) {
      return Numbers.equivalent(this.xMin, that.xMin, epsilon)
          && Numbers.equivalent(this.yMin, that.yMin, epsilon)
          && Numbers.equivalent(this.xMax, that.xMax, epsilon)
          && Numbers.equivalent(this.yMax, that.yMax, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BoxR2) {
      return this.xMin === that.xMin && this.yMin === that.yMin
          && this.xMax === that.xMax && this.yMax === that.yMax;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(BoxR2), Numbers.hash(this.xMin)), Numbers.hash(this.yMin)),
        Numbers.hash(this.xMax)), Numbers.hash(this.yMax)));
  }

  debug(output: Output): void {
    output.write("BoxR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this.xMin).write(", ").debug(this.yMin).write(", ")
        .debug(this.xMax).write(", ").debug(this.yMax).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static undefined(): BoxR2 {
    return new BoxR2(Infinity, Infinity, -Infinity, -Infinity);
  }

  static of(xMin: number, yMin: number, xMax?: number, yMax?: number): BoxR2 {
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
    if (value === void 0 || value === null || value instanceof BoxR2) {
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
