// Copyright 2015-2022 Swim.inc
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
import {R2VectorInterpolator} from "../"; // forward import

/** @public */
export type AnyR2Vector = R2Vector | R2VectorInit;

/** @public */
export interface R2VectorInit {
  x: number;
  y: number;
}

/** @public */
export class R2Vector implements Interpolate<R2Vector>, HashCode, Equivalent, Debug {
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  isDefined(): boolean {
    return isFinite(this.x) && isFinite(this.y);
  }

  readonly x: number;

  readonly y: number;

  plus(that: AnyR2Vector): R2Vector {
    return new R2Vector(this.x + that.x, this.y + that.y);
  }

  negative(): R2Vector {
    return new R2Vector(-this.x, -this.y);
  }

  minus(that: AnyR2Vector): R2Vector {
    return new R2Vector(this.x - that.x, this.y - that.y);
  }

  times(scalar: number): R2Vector {
    return new R2Vector(this.x * scalar, this.y * scalar);
  }

  toAny(): R2VectorInit {
    return {
      x: this.x,
      y: this.y,
    };
  }

  interpolateTo(that: R2Vector): Interpolator<R2Vector>;
  interpolateTo(that: unknown): Interpolator<R2Vector> | null;
  interpolateTo(that: unknown): Interpolator<R2Vector> | null {
    if (that instanceof R2Vector) {
      return R2VectorInterpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Vector) {
      return Numbers.equivalent(this.x, that.x, epsilon)
          && Numbers.equivalent(this.y, that.y, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Vector) {
      return this.x === that.x && this.y === that.y;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(R2Vector),
        Numbers.hash(this.x)), Numbers.hash(this.y)));
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Vector").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.x).write(", ").debug(this.y).write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static zero(): R2Vector {
    return new R2Vector(0, 0);
  }

  static of(x: number, y: number): R2Vector {
    return new R2Vector(x, y);
  }

  static fromInit(init: R2VectorInit): R2Vector {
    return new R2Vector(init.x, init.y);
  }

  static fromAny(value: AnyR2Vector): R2Vector {
    if (value === void 0 || value === null || value instanceof R2Vector) {
      return value;
    } else if (R2Vector.isInit(value)) {
      return R2Vector.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @internal */
  static isInit(value: unknown): value is R2VectorInit {
    if (typeof value === "object" && value !== null) {
      const init = value as R2VectorInit;
      return typeof init.x === "number"
          && typeof init.y === "number";
    }
    return false;
  }

  /** @internal */
  static isAny(value: unknown): value is AnyR2Vector {
    return value instanceof R2Vector
        || R2Vector.isInit(value);
  }
}
