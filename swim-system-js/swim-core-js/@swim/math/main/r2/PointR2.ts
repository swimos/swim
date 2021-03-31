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
import {AnyVectorR2, VectorR2} from "./VectorR2";
import {AnyShapeR2, ShapeR2} from "./ShapeR2";
import {PointR2Interpolator} from "../"; // forward import

export type AnyPointR2 = PointR2 | PointR2Init | PointR2Tuple;

export interface PointR2Init {
  x: number;
  y: number;
}

export type PointR2Tuple = [number, number];

export class PointR2 extends ShapeR2 implements Interpolate<PointR2>, HashCode, Equivalent, Debug {
  constructor(x: number, y: number) {
    super();
    Object.defineProperty(this, "x", {
      value: x,
      enumerable: true,
    });
    Object.defineProperty(this, "y", {
      value: y,
      enumerable: true,
    });
  }

  isDefined(): boolean {
    return isFinite(this.x) && isFinite(this.y);
  }

  declare readonly x: number;

  declare readonly y: number;

  get xMin(): number {
    return this.x;
  }

  get yMin(): number {
    return this.y;
  }

  get xMax(): number {
    return this.x;
  }

  get yMax(): number {
    return this.y;
  }

  plus(vector: AnyVectorR2): PointR2 {
    return new PointR2(this.x + vector.x, this.y + vector.y);
  }

  minus(vector: VectorR2): PointR2;
  minus(that: PointR2): VectorR2;
  minus(that: VectorR2 | PointR2): PointR2 | VectorR2 {
    if (that instanceof VectorR2) {
      return new PointR2(this.x - that.x, this.y - that.y);
    } else {
      return new VectorR2(this.x - that.x, this.y - that.y);
    }
  }

  contains(that: AnyShapeR2): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShapeR2 | number, y?: number): boolean {
    if (typeof that === "number") {
      return this.x === that && this.y === y!;
    } else {
      that = ShapeR2.fromAny(that);
      if (that instanceof PointR2) {
        return this.x === that.x && this.y === that.y;
      } else if (that instanceof ShapeR2) {
        return this.x <= that.xMin && that.xMax <= this.x
            && this.y <= that.yMin && that.yMax <= this.y;
      }
      return false;
    }
  }

  intersects(that: AnyShapeR2): boolean {
    that = ShapeR2.fromAny(that);
    return (that as ShapeR2).intersects(this);
  }

  transform(f: R2Function): PointR2 {
    return new PointR2(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  toAny(): PointR2Init {
    return {
      x: this.x,
      y: this.y,
    };
  }

  interpolateTo(that: PointR2): Interpolator<PointR2>;
  interpolateTo(that: unknown): Interpolator<PointR2> | null;
  interpolateTo(that: unknown): Interpolator<PointR2> | null {
    if (that instanceof PointR2) {
      return PointR2Interpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof PointR2) {
      return Numbers.equivalent(this.x, that.x, epsilon)
          && Numbers.equivalent(this.y, that.y, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof PointR2) {
      return this.x === that.x && this.y === that.y;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(PointR2),
        Numbers.hash(this.x)), Numbers.hash(this.y)));
  }

  debug(output: Output): void {
    output.write("PointR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this.x).write(", ").debug(this.y).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static origin(): PointR2 {
    return new PointR2(0, 0);
  }

  @Lazy
  static undefined(): PointR2 {
    return new PointR2(NaN, NaN);
  }

  static of(x: number, y: number): PointR2 {
    return new PointR2(x, y);
  }

  static fromInit(value: PointR2Init): PointR2 {
    return new PointR2(value.x, value.y);
  }

  static fromTuple(value: PointR2Tuple): PointR2 {
    return new PointR2(value[0], value[1]);
  }

  static fromAny(value: AnyPointR2): PointR2 {
    if (value === void 0 || value === null || value instanceof PointR2) {
      return value;
    } else if (PointR2.isInit(value)) {
      return PointR2.fromInit(value);
    } else if (PointR2.isTuple(value)) {
      return PointR2.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is PointR2Init {
    if (typeof value === "object" && value !== null) {
      const init = value as PointR2Init;
      return typeof init.x === "number"
          && typeof init.y === "number";
    }
    return false;
  }

  /** @hidden */
  static isTuple(value: unknown): value is PointR2Tuple {
    return Array.isArray(value)
        && value.length === 2
        && typeof value[0] === "number"
        && typeof value[1] === "number";
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyPointR2 {
    return value instanceof PointR2
        || PointR2.isInit(value)
        || PointR2.isTuple(value);
  }
}
