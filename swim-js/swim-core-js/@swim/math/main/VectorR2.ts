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

export type AnyVectorR2 = VectorR2 | VectorR2Init;

export interface VectorR2Init {
  x: number;
  y: number;
}

export class VectorR2 implements HashCode, Debug {
  /** @hidden */
  readonly _x: number;
  /** @hidden */
  readonly _y: number;

  constructor(x: number, y: number) {
    this._x = x;
    this._y = y;
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  plus(that: AnyVectorR2): VectorR2 {
    return new VectorR2(this._x + that.x, this._y + that.y);
  }

  opposite(): VectorR2 {
    return new VectorR2(-this._x, -this._y);
  }

  minus(that: AnyVectorR2): VectorR2 {
    return new VectorR2(this._x - that.x, this._y - that.y);
  }

  times(scalar: number): VectorR2 {
    return new VectorR2(this._x * scalar, this._y * scalar);
  }

  toAny(): VectorR2Init {
    return {
      x: this._x,
      y: this._y,
    };
  }

  protected canEqual(that: VectorR2): boolean {
    return true;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof VectorR2) {
      return that.canEqual(this) && this._x === that._x && this._y === that._y;
    }
    return false;
  }

  hashCode(): number {
    if (VectorR2._hashSeed === void 0) {
      VectorR2._hashSeed = Murmur3.seed(VectorR2);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(VectorR2._hashSeed,
        Murmur3.hash(this._x)), Murmur3.hash(this._y)));
  }

  debug(output: Output): void {
    output.write("VectorR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this._x).write(", ").debug(this._y).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  private static _hashSeed?: number;

  private static _zero?: VectorR2;

  static zero(): VectorR2 {
    if (VectorR2._zero === void 0) {
      VectorR2._zero = new VectorR2(0, 0);
    }
    return VectorR2._zero;
  }

  static of(x: number, y: number): VectorR2 {
    return new VectorR2(x, y);
  }

  static fromAny(vector: AnyVectorR2): VectorR2 {
    if (vector instanceof VectorR2) {
      return vector;
    } else if (typeof vector === "object" && vector) {
      return new VectorR2(vector.x, vector.y);
    }
    throw new TypeError("" + vector);
  }
}
