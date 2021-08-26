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
import {R2VectorInterpolator} from "../"; // forward import

export type AnyR2Vector = R2Vector | R2VectorInit;

export interface R2VectorInit {
  x: number;
  y: number;
}

export class R2Vector implements Interpolate<R2Vector>, HashCode, Equivalent, Debug {
  constructor(x: number, y: number) {
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

  readonly x!: number;

  readonly y!: number;

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

  debug(output: Output): void {
    output.write("R2Vector").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this.x).write(", ").debug(this.y).write(41/*')'*/);
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

  /** @hidden */
  static isInit(value: unknown): value is R2VectorInit {
    if (typeof value === "object" && value !== null) {
      const init = value as R2VectorInit;
      return typeof init.x === "number"
          && typeof init.y === "number";
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyR2Vector {
    return value instanceof R2Vector
        || R2Vector.isInit(value);
  }
}
