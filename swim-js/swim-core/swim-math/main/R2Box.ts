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
import type {R2ShapeLike} from "./R2Shape";
import {R2Shape} from "./R2Shape";
import {R2Point} from "./R2Point";
import {R2Segment} from "./R2Segment";
import {R2Circle} from "./R2Circle";

/** @public */
export type R2BoxLike = R2Box | R2BoxInit;

/** @public */
export const R2BoxLike = {
  [Symbol.hasInstance](instance: unknown): instance is R2BoxLike {
    return instance instanceof R2Box
        || R2BoxInit[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface R2BoxInit {
  /** @internal */
  readonly typeid?: "R2BoxInit";
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
}

/** @public */
export const R2BoxInit = {
  [Symbol.hasInstance](instance: unknown): instance is R2BoxInit {
    return Objects.hasAllKeys<R2BoxInit>(instance, "xMin", "yMin", "xMax", "yMax");
  },
};

/** @public */
export class R2Box extends R2Shape implements Interpolate<R2Box>, HashCode, Debug {
  constructor(xMin: number, yMin: number, xMax: number, yMax: number) {
    super();
    this.xMin = xMin;
    this.yMin = yMin;
    this.xMax = xMax;
    this.yMax = yMax;
  }

  /** @internal */
  declare readonly typeid?: "R2Box";

  override likeType?(like: R2BoxInit): void;

  override isDefined(): boolean {
    return isFinite(this.xMin) && isFinite(this.yMin)
        && isFinite(this.xMax) && isFinite(this.yMax);
  }

  override readonly xMin: number;

  override readonly yMin: number;

  override readonly xMax: number;

  override readonly yMax: number;

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

  override contains(that: R2ShapeLike): boolean;
  override contains(x: number, y: number): boolean;
  override contains(that: R2ShapeLike | number, y?: number): boolean {
    if (typeof that === "number") {
      return this.xMin <= that && that <= this.xMax
          && this.yMin <= y! && y! <= this.yMax;
    }
    that = R2Shape.fromLike(that);
    if (that instanceof R2Point) {
      return this.containsPoint(that);
    } else if (that instanceof R2Segment) {
      return this.containsSegment(that);
    } else if (that instanceof R2Box) {
      return this.containsBox(that);
    } else if (that instanceof R2Circle) {
      return this.containsCircle(that);
    } else if (that instanceof R2Shape) {
      return this.xMin <= that.xMin && that.xMax <= this.xMax
          && this.yMin <= that.yMin && that.yMax <= this.yMax;
    }
    return false;
  }

  /** @internal */
  containsPoint(that: R2Point): boolean {
    return this.xMin <= that.x && that.x <= this.xMax
        && this.yMin <= that.y && that.y <= this.yMax;
  }

  /** @internal */
  containsSegment(that: R2Segment): boolean {
    return this.xMin <= that.x0 && that.x0 <= this.xMax
        && this.yMin <= that.y0 && that.y0 <= this.yMax
        && this.xMin <= that.x1 && that.x1 <= this.xMax
        && this.yMin <= that.y1 && that.y1 <= this.yMax;
  }

  /** @internal */
  containsBox(that: R2Box): boolean {
    return this.xMin <= that.xMin && that.xMax <= this.xMax
        && this.yMin <= that.yMin && that.yMax <= this.yMax;
  }

  /** @internal */
  containsCircle(that: R2Circle): boolean {
    return this.xMin <= that.cx - that.r && that.cx + that.r <= this.xMax
        && this.yMin <= that.cy - that.r && that.cy + that.r <= this.yMax;
  }

  override intersects(that: R2ShapeLike): boolean {
    that = R2Shape.fromLike(that);
    if (that instanceof R2Point) {
      return this.intersectsPoint(that);
    } else if (that instanceof R2Segment) {
      return this.intersectsSegment(that);
    } else if (that instanceof R2Box) {
      return this.intersectsBox(that);
    } else if (that instanceof R2Circle) {
      return this.intersectsCircle(that);
    }
    return that.intersects(this);
  }

  /** @internal */
  intersectsPoint(that: R2Point): boolean {
    return this.xMin <= that.x && that.x <= this.xMax
        && this.yMin <= that.y && that.y <= this.yMax;
  }

  /** @internal */
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
    }
    return false;
  }

  /** @internal */
  static hitX: number = 0; // stack local hit register
  /** @internal */
  static hitY: number = 0; // stack local hit register
  static intersectsSegment(d0: number, d1: number, x0: number, y0: number, x1: number, y1: number): boolean {
    if (d0 === d1 && d0 * d1 >= 0) {
      return false;
    }
    const scale = -d0 / (d1 - d0);
    R2Box.hitX = x0 + (x1 - x0) * scale;
    R2Box.hitY = y0 + (y1 - y0) * scale;
    return true;
  }

  /** @internal */
  intersectsBox(that: R2Box): boolean {
    return this.xMin <= that.xMax && that.xMin <= this.xMax
        && this.yMin <= that.yMax && that.yMin <= this.yMax;
  }

  /** @internal */
  intersectsCircle(that: R2Circle): boolean {
    const dx = (that.cx < this.xMin ? this.xMin : this.xMax < that.cx ? this.xMax : that.cx) - that.cx;
    const dy = (that.cy < this.yMin ? this.yMin : this.yMax < that.cy ? this.yMax : that.cy) - that.cy;
    return dx * dx + dy * dy <= that.r * that.r;
  }

  override union(that: R2ShapeLike): R2Box {
    return super.union(that) as R2Box;
  }

  override transform(f: R2Function): R2Box {
    return new R2Box(f.transformX(this.xMin, this.yMin), f.transformY(this.xMin, this.yMin),
                     f.transformX(this.xMax, this.yMax), f.transformY(this.xMax, this.yMax));
  }

  override get bounds(): R2Box {
    return this;
  }

  toLike(): R2BoxInit {
    return {
      xMin: this.xMin,
      yMin: this.yMin,
      xMax: this.xMax,
      yMax: this.yMax,
    };
  }

  /** @override */
  interpolateTo(that: R2Box): Interpolator<R2Box>;
  interpolateTo(that: unknown): Interpolator<R2Box> | null;
  interpolateTo(that: unknown): Interpolator<R2Box> | null {
    if (that instanceof R2Box) {
      return R2BoxInterpolator(this, that);
    }
    return null;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
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

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof R2Box) {
      return this.xMin === that.xMin && this.yMin === that.yMin
          && this.xMax === that.xMax && this.yMax === that.yMax;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(R2Box), Numbers.hash(this.xMin)), Numbers.hash(this.yMin)),
        Numbers.hash(this.xMax)), Numbers.hash(this.yMax)));
  }

  /** @override */
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

  static override fromLike<T extends R2BoxLike | null | undefined>(value: T): R2Box | Uninitable<T>;
  static override fromLike<T extends R2ShapeLike | null | undefined>(value: T): never;
  static override fromLike<T extends R2BoxLike | null | undefined>(value: T): R2Box | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof R2Box) {
      return value as R2Box | Uninitable<T>;
    } else if (R2BoxInit[Symbol.hasInstance](value)) {
      return R2Box.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: R2BoxInit): R2Box {
    return new R2Box(init.xMin, init.yMin, init.xMax, init.yMax);
  }
}

/** @internal */
export const R2BoxInterpolator = (function (_super: typeof Interpolator) {
  const R2BoxInterpolator = function (s0: R2Box, s1: R2Box): Interpolator<R2Box> {
    const interpolator = function (u: number): R2Box {
      const s0 = interpolator[0];
      const s1 = interpolator[1];
      const xMin = s0.xMin + u * (s1.xMin - s0.xMin);
      const yMin = s0.yMin + u * (s1.yMin - s0.yMin);
      const xMax = s0.xMax + u * (s1.xMax - s0.xMax);
      const yMax = s0.yMax + u * (s1.yMax - s0.yMax);
      return new R2Box(xMin, yMin, xMax, yMax);
    } as Interpolator<R2Box>;
    Object.setPrototypeOf(interpolator, R2BoxInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = s0;
    (interpolator as Mutable<typeof interpolator>)[1] = s1;
    return interpolator;
  } as {
    (s0: R2Box, s1: R2Box): Interpolator<R2Box>;

    /** @internal */
    prototype: Interpolator<R2Box>;
  };

  R2BoxInterpolator.prototype = Object.create(_super.prototype);
  R2BoxInterpolator.prototype.constructor = R2BoxInterpolator;

  return R2BoxInterpolator;
})(Interpolator);
