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
import {R2Shape} from "./R2Shape";
import {AnyVectorR2, VectorR2} from "./VectorR2";

export type AnyPointR2 = PointR2 | PointR2Init | PointR2Tuple;

export interface PointR2Init {
  x: number;
  y: number;
}

export type PointR2Tuple = [number, number];

export class PointR2 extends R2Shape implements HashCode, Debug {
  /** @hidden */
  readonly _x: number;
  /** @hidden */
  readonly _y: number;

  constructor(x: number, y: number) {
    super();
    this._x = x;
    this._y = y;
  }

  isDefined(): boolean {
    return this._x !== 0 || this._y !== 0;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get xMin(): number {
    return this._x;
  }

  get yMin(): number {
    return this._y;
  }

  get xMax(): number {
    return this._x;
  }

  get yMax(): number {
    return this._y;
  }

  plus(vector: AnyVectorR2): PointR2 {
    return new PointR2(this._x + vector.x, this._y + vector.y);
  }

  minus(vector: VectorR2): PointR2;
  minus(that: PointR2): VectorR2;
  minus(that: VectorR2 | PointR2): PointR2 | VectorR2 {
    const x = this._x - that._x;
    const y = this._y - that._y;
    if (that instanceof VectorR2) {
      return new PointR2(x, y);
    } else {
      return new VectorR2(x, y);
    }
  }

  contains(that: AnyShape): boolean;
  contains(x: number, y: number): boolean;
  contains(that: AnyShape | number, y?: number): boolean {
    if (typeof that === "number") {
      return this._x === that && this._y === y!;
    } else {
      that = Shape.fromAny(that);
      if (that instanceof PointR2) {
        return this._x === that._x && this._y === that._y;
      } else if (that instanceof R2Shape) {
        return this._x <= that.xMin && that.xMax <= this._x
            && this._y <= that.yMin && that.yMax <= this._y;
      }
      return false;
    }
  }

  intersects(that: AnyShape): boolean {
    that = Shape.fromAny(that);
    return that.intersects(this);
  }

  transform(f: R2Function): PointR2 {
    return new PointR2(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  toAny(): PointR2Init {
    return {
      x: this._x,
      y: this._y,
    };
  }

  protected canEqual(that: PointR2): boolean {
    return true;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof PointR2) {
      return that.canEqual(this) && this._x === that._x && this._y === that._y;
    }
    return false;
  }

  hashCode(): number {
    if (PointR2._hashSeed === void 0) {
      PointR2._hashSeed = Murmur3.seed(PointR2);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(PointR2._hashSeed,
        Murmur3.hash(this._x)), Murmur3.hash(this._y)));
  }

  debug(output: Output): void {
    output.write("PointR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this._x).write(", ").debug(this._y).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;

  private static _origin?: PointR2;

  static origin(): PointR2 {
    if (PointR2._origin === void 0) {
      PointR2._origin = new PointR2(0, 0);
    }
    return PointR2._origin;
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
    if (value instanceof PointR2) {
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
R2Shape.Point = PointR2;
