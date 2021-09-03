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

import {Equivalent, HashCode, Lazy, Murmur3, Numbers, Constructors} from "@swim/util";
import {Debug, Format, Output} from "@swim/codec";
import type {Interpolate, Interpolator} from "@swim/mapping";
import type {R2Function} from "./R2Function";
import {AnyR2Shape, R2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import {R2Segment} from "./R2Segment";
import {R2BoxInterpolator} from "../"; // forward import
import {R2Circle} from "./R2Circle";

export type AnyR2Box = R2Box | R2BoxInit;

export interface R2BoxInit {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

export class R2Box extends R2Shape implements Interpolate<R2Box>, HashCode, Equivalent, Debug {
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

  override readonly xMin!: number;

  override readonly yMin!: number;

  override readonly xMax!: number;

  override readonly yMax!: number;

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

  get center(): R2Point {
    return new R2Point((this.xMin + this.xMax) / 2, (this.yMin + this.yMax) / 2);
  }

  override contains(that: AnyR2Shape): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: AnyR2Shape | number, y?: number): boolean {
    if (typeof that === "number") {
      return this.xMin <= that && that <= this.xMax
          && this.yMin <= y! && y! <= this.yMax;
    } else {
      that = R2Shape.fromAny(that);
      if (that instanceof R2Shape) {
        if (that instanceof R2Point) {
          return this.containsPoint(that);
        } else if (that instanceof R2Segment) {
          return this.containsSegment(that);
        } else if (that instanceof R2Box) {
          return this.containsBox(that);
        } else if (that instanceof R2Circle) {
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
  containsPoint(that: R2Point): boolean {
    return this.xMin <= that.x && that.x <= this.xMax
        && this.yMin <= that.y && that.y <= this.yMax;
  }

  /** @hidden */
  containsSegment(that: R2Segment): boolean {
    return this.xMin <= that.x0 && that.x0 <= this.xMax
        && this.yMin <= that.y0 && that.y0 <= this.yMax
        && this.xMin <= that.x1 && that.x1 <= this.xMax
        && this.yMin <= that.y1 && that.y1 <= this.yMax;
  }

  /** @hidden */
  containsBox(that: R2Box): boolean {
    return this.xMin <= that.xMin && that.xMax <= this.xMax
        && this.yMin <= that.yMin && that.yMax <= this.yMax;
  }

  /** @hidden */
  containsCircle(that: R2Circle): boolean {
    return this.xMin <= that.cx - that.r && that.cx + that.r <= this.xMax
        && this.yMin <= that.cy - that.r && that.cy + that.r <= this.yMax;
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

  /** @hidden */
  intersectsPoint(that: R2Point): boolean {
    return this.xMin <= that.x && that.x <= this.xMax
        && this.yMin <= that.y && that.y <= this.yMax;
  }

  /** @hidden */
  intersectsSegment(that: R2Segment): boolean {
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
    } else if ((R2Box.intersectsSegment(x0 - xMin, x1 - xMin, x0, y0, x1, y1) && R2Box.hitY > yMin && R2Box.hitY < yMax)
            || (R2Box.intersectsSegment(y0 - yMin, y1 - yMin, x0, y0, x1, y1) && R2Box.hitX > xMin && R2Box.hitX < xMax)
            || (R2Box.intersectsSegment(x0 - xMax, x1 - xMax, x0, y0, x1, y1) && R2Box.hitY > yMin && R2Box.hitY < yMax)
            || (R2Box.intersectsSegment(y0 - yMax, y1 - yMax, x0, y0, x1, y1) && R2Box.hitX > xMin && R2Box.hitX < xMax)) {
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
      R2Box.hitX = x0 + (x1 - x0) * scale;
      R2Box.hitY = y0 + (y1 - y0) * scale;
      return true;
    }
    return false;
  }

  /** @hidden */
  intersectsBox(that: R2Box): boolean {
    return this.xMin <= that.xMax && that.xMin <= this.xMax
        && this.yMin <= that.yMax && that.yMin <= this.yMax;
  }

  /** @hidden */
  intersectsCircle(that: R2Circle): boolean {
    const dx = (that.cx < this.xMin ? this.xMin : this.xMax < that.cx ? this.xMax : that.cx) - that.cx;
    const dy = (that.cy < this.yMin ? this.yMin : this.yMax < that.cy ? this.yMax : that.cy) - that.cy;
    return dx * dx + dy * dy <= that.r * that.r;
  }

  override union(that: AnyR2Shape): R2Box {
    return super.union(that) as R2Box;
  }

  override transform(f: R2Function): R2Box {
    return new R2Box(f.transformX(this.xMin, this.yMin), f.transformY(this.xMin, this.yMin),
                     f.transformX(this.xMax, this.yMax), f.transformY(this.xMax, this.yMax));
  }

  override get bounds(): R2Box {
    return this;
  }

  toAny(): R2BoxInit {
    return {
      xMin: this.xMin,
      yMin: this.yMin,
      xMax: this.xMax,
      yMax: this.yMax,
    };
  }

  interpolateTo(that: R2Box): Interpolator<R2Box>;
  interpolateTo(that: unknown): Interpolator<R2Box> | null;
  interpolateTo(that: unknown): Interpolator<R2Box> | null {
    if (that instanceof R2Box) {
      return R2BoxInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Box) {
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
    } else if (that instanceof R2Box) {
      return this.xMin === that.xMin && this.yMin === that.yMin
          && this.xMax === that.xMax && this.yMax === that.yMax;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(R2Box), Numbers.hash(this.xMin)), Numbers.hash(this.yMin)),
        Numbers.hash(this.xMax)), Numbers.hash(this.yMax)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Box").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.xMin).write(", ").debug(this.yMin).write(", ")
                   .debug(this.xMax).write(", ").debug(this.yMax).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static undefined(): R2Box {
    return new R2Box(Infinity, Infinity, -Infinity, -Infinity);
  }

  static of(xMin: number, yMin: number, xMax?: number, yMax?: number): R2Box {
    if (xMax === void 0) {
      xMax = xMin;
    }
    if (yMax === void 0) {
      yMax = yMin;
    }
    return new R2Box(xMin, yMin, xMax, yMax);
  }

  static fromInit(value: R2BoxInit): R2Box {
    return new R2Box(value.xMin, value.yMin, value.xMax, value.yMax);
  }

  static override fromAny(value: AnyR2Box): R2Box {
    if (value === void 0 || value === null || value instanceof R2Box) {
      return value;
    } else if (R2Box.isInit(value)) {
      return R2Box.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is R2BoxInit {
    if (typeof value === "object" && value !== null) {
      const init = value as R2BoxInit;
      return typeof init.xMin === "number"
          && typeof init.yMin === "number"
          && typeof init.xMax === "number"
          && typeof init.yMax === "number";
    }
    return false;
  }

  /** @hidden */
  static override isAny(value: unknown): value is AnyR2Box {
    return value instanceof R2Box
        || R2Box.isInit(value);
  }
}
