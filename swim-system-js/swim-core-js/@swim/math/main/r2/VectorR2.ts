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
import {VectorR2Interpolator} from "../"; // forward import

export type AnyVectorR2 = VectorR2 | VectorR2Init;

export interface VectorR2Init {
  x: number;
  y: number;
}

export class VectorR2 implements Interpolate<VectorR2>, HashCode, Equivalent, Debug {
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

  declare readonly x: number;

  declare readonly y: number;

  plus(that: AnyVectorR2): VectorR2 {
    return new VectorR2(this.x + that.x, this.y + that.y);
  }

  negative(): VectorR2 {
    return new VectorR2(-this.x, -this.y);
  }

  minus(that: AnyVectorR2): VectorR2 {
    return new VectorR2(this.x - that.x, this.y - that.y);
  }

  times(scalar: number): VectorR2 {
    return new VectorR2(this.x * scalar, this.y * scalar);
  }

  toAny(): VectorR2Init {
    return {
      x: this.x,
      y: this.y,
    };
  }

  interpolateTo(that: VectorR2): Interpolator<VectorR2>;
  interpolateTo(that: unknown): Interpolator<VectorR2> | null;
  interpolateTo(that: unknown): Interpolator<VectorR2> | null {
    if (that instanceof VectorR2) {
      return VectorR2Interpolator(this, that);
    } else {
      return null;
    }
  }

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof VectorR2) {
      return Numbers.equivalent(this.x, that.x, epsilon)
          && Numbers.equivalent(this.y, that.y, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof VectorR2) {
      return this.x === that.x && this.y === that.y;
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(VectorR2),
        Numbers.hash(this.x)), Numbers.hash(this.y)));
  }

  debug(output: Output): void {
    output.write("VectorR2").write(46/*'.'*/).write("of").write(40/*'('*/)
        .debug(this.x).write(", ").debug(this.y).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static zero(): VectorR2 {
    return new VectorR2(0, 0);
  }

  static of(x: number, y: number): VectorR2 {
    return new VectorR2(x, y);
  }

  static fromInit(init: VectorR2Init): VectorR2 {
    return new VectorR2(init.x, init.y);
  }

  static fromAny(value: AnyVectorR2): VectorR2 {
    if (value === void 0 || value === null || value instanceof VectorR2) {
      return value;
    } else if (VectorR2.isInit(value)) {
      return VectorR2.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  /** @hidden */
  static isInit(value: unknown): value is VectorR2Init {
    if (typeof value === "object" && value !== null) {
      const init = value as VectorR2Init;
      return typeof init.x === "number"
          && typeof init.y === "number";
    }
    return false;
  }

  /** @hidden */
  static isAny(value: unknown): value is AnyVectorR2 {
    return value instanceof VectorR2
        || VectorR2.isInit(value);
  }
}
