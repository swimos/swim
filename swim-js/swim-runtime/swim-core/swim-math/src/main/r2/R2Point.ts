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
  Lazy,
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
import {AnyR2Vector, R2Vector} from "./R2Vector";
import {AnyR2Shape, R2Shape} from "./R2Shape";
import {R2PointInterpolator} from "../"; // forward import

/** @public */
export type AnyR2Point = R2Point | R2PointInit | R2PointTuple;

/** @public */
export interface R2PointInit {
  x: number;
  y: number;
}

/** @public */
export type R2PointTuple = [number, number];

/** @public */
export class R2Point extends R2Shape implements Interpolate<R2Point>, HashCode, Equivalent, Debug {
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  isDefined(): boolean {
    return isFinite(this.x) && isFinite(this.y);
  }

  readonly x: number;

  readonly y: number;

  override get xMin(): number {
    return this.x;
  }

  override get yMin(): number {
    return this.y;
  }

  override get xMax(): number {
    return this.x;
  }

  override get yMax(): number {
    return this.y;
  }

  plus(vector: AnyR2Vector): R2Point {
    return new R2Point(this.x + vector.x, this.y + vector.y);
  }

  minus(vector: R2Vector): R2Point;
  minus(that: R2Point): R2Vector;
  minus(that: R2Vector | R2Point): R2Point | R2Vector {
    if (that instanceof R2Vector) {
      return new R2Point(this.x - that.x, this.y - that.y);
    } else {
      return new R2Vector(this.x - that.x, this.y - that.y);
    }
  }

  override contains(that: AnyR2Shape): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: AnyR2Shape | number, y?: number): boolean {
    if (typeof that === "number") {
      return this.x === that && this.y === y!;
    } else {
      that = R2Shape.fromAny(that);
      if (that instanceof R2Point) {
        return this.x === that.x && this.y === that.y;
      } else if (that instanceof R2Shape) {
        return this.x <= that.xMin && that.xMax <= this.x
            && this.y <= that.yMin && that.yMax <= this.y;
      }
      return false;
    }
  }

  override intersects(that: AnyR2Shape): boolean {
    that = R2Shape.fromAny(that);
    return (that as R2Shape).intersects(this);
  }

  override transform(f: R2Function): R2Point {
    return new R2Point(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  toAny(): R2PointInit {
    return {
      x: this.x,
      y: this.y,
    };
  }

  interpolateTo(that: R2Point): Interpolator<R2Point>;
  interpolateTo(that: unknown): Interpolator<R2Point> | null;
  interpolateTo(that: unknown): Interpolator<R2Point> | null {
    if (that instanceof R2Point) {
      return R2PointInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Point) {
      return Numbers.equivalent(this.x, that.x, epsilon)
          && Numbers.equivalent(this.y, that.y, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Point) {
      return this.x === that.x && this.y === that.y;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(R2Point),
        Numbers.hash(this.x)), Numbers.hash(this.y)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Point").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.x).write(", ").debug(this.y).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static origin(): R2Point {
    return new R2Point(0, 0);
  }

  @Lazy
  static undefined(): R2Point {
    return new R2Point(NaN, NaN);
  }

  static of(x: number, y: number): R2Point {
    return new R2Point(x, y);
  }

  static fromInit(value: R2PointInit): R2Point {
    return new R2Point(value.x, value.y);
  }

  static fromTuple(value: R2PointTuple): R2Point {
    return new R2Point(value[0], value[1]);
  }

  static override fromAny(value: AnyR2Point): R2Point {
    if (value === void 0 || value === null || value instanceof R2Point) {
      return value;
    } else if (R2Point.isInit(value)) {
      return R2Point.fromInit(value);
    } else if (R2Point.isTuple(value)) {
      return R2Point.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  /** @internal */
  static isInit(value: unknown): value is R2PointInit {
    if (typeof value === "object" && value !== null) {
      const init = value as R2PointInit;
      return typeof init.x === "number"
          && typeof init.y === "number";
    }
    return false;
  }

  /** @internal */
  static isTuple(value: unknown): value is R2PointTuple {
    return Array.isArray(value)
        && value.length === 2
        && typeof value[0] === "number"
        && typeof value[1] === "number";
  }

  /** @internal */
  static override isAny(value: unknown): value is AnyR2Point {
    return value instanceof R2Point
        || R2Point.isInit(value)
        || R2Point.isTuple(value);
  }
}
