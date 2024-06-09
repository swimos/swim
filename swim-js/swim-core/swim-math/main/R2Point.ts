// Copyright 2015-2024 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Mutable} from "@swim/util";
import {Murmur3} from "@swim/util";
import {Lazy} from "@swim/util";
import type {HashCode} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Objects} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {R2Function} from "./R2Function";
import type {R2VectorLike} from "./R2Vector";
import {R2Vector} from "./R2Vector";
import type {R2ShapeLike} from "./R2Shape";
import {R2Shape} from "./R2Shape";

/** @public */
export type R2PointLike = R2Point | R2PointInit | R2PointTuple;

/** @public */
export const R2PointLike = {
  [Symbol.hasInstance](instance: unknown): instance is R2PointLike {
    return instance instanceof R2Point
        || R2PointInit[Symbol.hasInstance](instance)
        || R2PointTuple[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface R2PointInit {
  /** @internal */
  readonly typeid?: "R2PointInit";
  x: number;
  y: number;
}

/** @public */
export const R2PointInit = {
  [Symbol.hasInstance](instance: unknown): instance is R2PointInit {
    return Objects.hasAllKeys<R2PointInit>(instance, "x", "y");
  },
};

/** @public */
export type R2PointTuple = [number, number];

/** @public */
export const R2PointTuple = {
  [Symbol.hasInstance](instance: unknown): instance is R2PointTuple {
    return Array.isArray(instance) && instance.length === 2
        && typeof instance[0] === "number"
        && typeof instance[1] === "number";
  },
};

/** @public */
export class R2Point extends R2Shape implements Interpolate<R2Point>, HashCode, Debug {
  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  /** @internal */
  declare readonly typeid?: "R2Point";

  override likeType?(like: R2PointInit | R2PointTuple): void;

  override isDefined(): boolean {
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

  plus(vector: R2VectorLike): R2Point {
    return new R2Point(this.x + vector.x, this.y + vector.y);
  }

  minus(vector: R2Vector): R2Point;
  minus(that: R2Point): R2Vector;
  minus(that: R2Vector | R2Point): R2Point | R2Vector {
    if (that instanceof R2Vector) {
      return new R2Point(this.x - that.x, this.y - that.y);
    }
    return new R2Vector(this.x - that.x, this.y - that.y);
  }

  override contains(that: R2ShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: R2ShapeLike | number, y?: number): boolean {
    if (typeof that === "number") {
      return this.x === that && this.y === y!;
    }
    that = R2Shape.fromLike(that);
    if (that instanceof R2Point) {
      return this.x === that.x && this.y === that.y;
    } else if (that instanceof R2Shape) {
      return this.x <= that.xMin && that.xMax <= this.x
          && this.y <= that.yMin && that.yMax <= this.y;
    }
    return false;
  }

  override intersects(that: R2ShapeLike): boolean {
    that = R2Shape.fromLike(that);
    return that.intersects(this);
  }

  override transform(f: R2Function): R2Point {
    return new R2Point(f.transformX(this.x, this.y), f.transformY(this.x, this.y));
  }

  toLike(): R2PointInit {
    return {
      x: this.x,
      y: this.y,
    };
  }

  /** @override */
  interpolateTo(that: R2Point): Interpolator<R2Point>;
  interpolateTo(that: unknown): Interpolator<R2Point> | null;
  interpolateTo(that: unknown): Interpolator<R2Point> | null {
    if (that instanceof R2Point) {
      return R2PointInterpolator(this, that);
    }
    return null;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Point) {
      return Numbers.equivalent(this.x, that.x, epsilon)
          && Numbers.equivalent(this.y, that.y, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Point) {
      return this.x === that.x && this.y === that.y;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(R2Point),
        Numbers.hash(this.x)), Numbers.hash(this.y)));
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("R2Point").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.x).write(", ").debug(this.y).write(41/*')'*/);
    return output;
  }

  override toString(): string {
    return Format.debug(this);
  }

  @Lazy
  static undefined(): R2Point {
    return new R2Point(NaN, NaN);
  }

  @Lazy
  static origin(): R2Point {
    return new R2Point(0, 0);
  }

  static of(x: number, y: number): R2Point {
    return new R2Point(x, y);
  }

  static override fromLike<T extends R2PointLike | null | undefined>(value: T): R2Point | Uninitable<T>;
  static override fromLike<T extends R2ShapeLike | null | undefined>(value: T): never;
  static override fromLike<T extends R2PointLike | null | undefined>(value: T): R2Point | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof R2Point) {
      return value as R2Point | Uninitable<T>;
    } else if (R2PointInit[Symbol.hasInstance](value)) {
      return R2Point.fromInit(value);
    } else if (R2PointTuple[Symbol.hasInstance](value)) {
      return R2Point.fromTuple(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: R2PointInit): R2Point {
    return new R2Point(init.x, init.y);
  }

  static fromTuple(tuple: R2PointTuple): R2Point {
    return new R2Point(tuple[0], tuple[1]);
  }
}

/** @internal */
export const R2PointInterpolator = (function (_super: typeof Interpolator) {
  const R2PointInterpolator = function (p0: R2Point, p1: R2Point): Interpolator<R2Point> {
    const interpolator = function (u: number): R2Point {
      const p0 = interpolator[0];
      const p1 = interpolator[1];
      const x = p0.x + u * (p1.x - p0.x);
      const y = p0.y + u * (p1.y - p0.y);
      return new R2Point(x, y);
    } as Interpolator<R2Point>;
    Object.setPrototypeOf(interpolator, R2PointInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = p0;
    (interpolator as Mutable<typeof interpolator>)[1] = p1;
    return interpolator;
  } as {
    (p0: R2Point, p1: R2Point): Interpolator<R2Point>;

    /** @internal */
    prototype: Interpolator<R2Point>;
  };

  R2PointInterpolator.prototype = Object.create(_super.prototype);
  R2PointInterpolator.prototype.constructor = R2PointInterpolator;

  return R2PointInterpolator;
})(Interpolator);
