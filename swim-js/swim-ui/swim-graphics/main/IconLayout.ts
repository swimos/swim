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
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import {Objects} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Equivalent} from "@swim/util";
import type {Interpolate} from "@swim/util";
import {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";

/** @public */
export type IconLayoutLike = IconLayout | IconLayoutInit;

/** @public */
export const IconLayoutLike = {
  [Symbol.hasInstance](instance: unknown): instance is IconLayoutLike {
    return instance instanceof IconLayout
        || IconLayoutInit[Symbol.hasInstance](instance);
  },
};

/** @public */
export interface IconLayoutInit {
  /** @internal */
  readonly typeid?: "IconLayoutInit";
  width: LengthLike;
  height: LengthLike;
  xAlign?: number;
  yAlign?: number;
}

/** @public */
export const IconLayoutInit = {
  [Symbol.hasInstance](instance: unknown): instance is IconLayoutInit {
    return Objects.hasAllKeys<IconLayoutInit>(instance, "width", "height");
  },
};

/** @public */
export class IconLayout implements Interpolate<IconLayout>, Equivalent, HashCode, Debug {
  constructor(width: Length, height: Length, xAlign: number, yAlign: number) {
    this.width = width;
    this.height = height;
    this.xAlign = xAlign;
    this.yAlign = yAlign;
  }

  /** @internal */
  declare readonly typeid?: "IconLayout";

  likeType?(like: IconLayoutInit): void;

  readonly width: Length;

  withWidth(width: LengthLike): IconLayout {
    width = Length.fromLike(width);
    if (width.equals(this.width)) {
      return this;
    }
    return this.copy(width, this.height, this.xAlign, this.yAlign);
  }

  readonly height: Length;

  withHeight(height: LengthLike): IconLayout {
    height = Length.fromLike(height);
    if (height.equals(this.height)) {
      return this;
    }
    return this.copy(this.width, height, this.xAlign, this.yAlign);
  }

  withSize(width: LengthLike, height: LengthLike): IconLayout {
    width = Length.fromLike(width);
    height = Length.fromLike(height);
    if (width.equals(this.width) && height.equals(this.height)) {
      return this;
    }
    return this.copy(width, height, this.xAlign, this.yAlign);
  }

  readonly xAlign: number;

  withXAlign(xAlign: number): IconLayout {
    if (xAlign === this.xAlign) {
      return this;
    }
    return this.copy(this.width, this.height, xAlign, this.yAlign);
  }

  readonly yAlign: number;

  withYAlign(yAlign: number): IconLayout {
    if (yAlign === this.yAlign) {
      return this;
    }
    return this.copy(this.width, this.height, this.xAlign, yAlign);
  }

  withAlign(xAlign: number, yAlign: number): IconLayout {
    if (xAlign === this.xAlign && yAlign === this.yAlign) {
      return this;
    }
    return this.copy(this.width, this.height, xAlign, yAlign);
  }

  toLike(): IconLayoutInit {
    return {
      width: this.width,
      height: this.height,
      xAlign: this.xAlign,
      yAlign: this.yAlign,
    };
  }

  protected copy(width: Length, height: Length, xAlign: number, yAlign: number): IconLayout {
    return new IconLayout(width, height, xAlign, yAlign);
  }

  /** @override */
  interpolateTo(that: IconLayout): Interpolator<IconLayout>;
  interpolateTo(that: unknown): Interpolator<IconLayout> | null;
  interpolateTo(that: unknown): Interpolator<IconLayout> | null {
    if (that instanceof IconLayout) {
      return IconLayoutInterpolator(this, that);
    }
    return null;
  }

  /** @override */
  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof IconLayout) {
      return this.width.equivalentTo(that.width, epsilon)
          && this.height.equivalentTo(that.height, epsilon)
          && Numbers.equivalent(this.xAlign, that.xAlign, epsilon)
          && Numbers.equivalent(this.yAlign, that.yAlign, epsilon);
    }
    return false;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof IconLayout) {
      return this.width.equals(that.width) && this.height.equals(that.height)
          && this.xAlign === that.xAlign && this.yAlign === that.yAlign;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        Constructors.hash(IconLayout), this.width.hashCode()), this.height.hashCode()),
        Numbers.hash(this.xAlign)), Numbers.hash(this.yAlign)));
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("IconLayout").write(46/*'.'*/).write("of").write(40/*'('*/)
                   .debug(this.width).write(", ").debug(this.height).write(", ")
                   .debug(this.xAlign).write(", ").debug(this.yAlign).write(41/*')'*/);
    return output;
  }

  /** @override */
  toString(): string {
    return Format.debug(this);
  }

  static of(width: LengthLike, height: LengthLike, xAlign?: number, yAlign?: number): IconLayout {
    width = Length.fromLike(width);
    height = Length.fromLike(height);
    if (xAlign === void 0) {
      xAlign = 0.5;
    }
    if (yAlign === void 0) {
      yAlign = 0.5;
    }
    return new IconLayout(width, height, xAlign, yAlign);
  }

  static fromLike<T extends IconLayoutLike | null | undefined>(value: T): IconLayout | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof IconLayout) {
      return value as IconLayout | Uninitable<T>;
    } else if (IconLayoutInit[Symbol.hasInstance](value)) {
      return IconLayout.fromInit(value);
    }
    throw new TypeError("" + value);
  }

  static fromInit(init: IconLayoutInit): IconLayout {
    const width = Length.fromLike(init.width);
    const height = Length.fromLike(init.height);
    let xAlign = init.xAlign;
    let yAlign = init.yAlign;
    if (xAlign === void 0) {
      xAlign = 0.5;
    }
    if (yAlign === void 0) {
      yAlign = 0.5;
    }
    return new IconLayout(width, height, xAlign, yAlign);
  }
}

/** @internal */
export const IconLayoutInterpolator = (function (_super: typeof Interpolator) {
  const IconLayoutInterpolator = function (l0: IconLayout, l1: IconLayout): Interpolator<IconLayout> {
    const interpolator = function (u: number): IconLayout {
      const l0 = interpolator[0];
      const l1 = interpolator[1];
      const width = Length.of(l0.width.value + u * (l1.width.value - l0.width.value), l1.width.units);
      const height = Length.of(l0.height.value + u * (l1.height.value - l0.height.value), l1.height.units);
      const xAlign = l0.xAlign + u * (l1.xAlign - l0.xAlign);
      const yAlign = l0.yAlign + u * (l1.yAlign - l0.yAlign);
      return new IconLayout(width, height, xAlign, yAlign);
    } as Interpolator<IconLayout>;
    Object.setPrototypeOf(interpolator, IconLayoutInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>)[0] = l0.width.units === l1.width.units && l0.height.units === l1.height.units
                                                      ? l0 : new IconLayout(l0.width.to(l1.width.units), l0.height.to(l1.height.units), l0.xAlign, l0.yAlign);
    (interpolator as Mutable<typeof interpolator>)[1] = l1;
    return interpolator;
  } as {
    (l0: IconLayout, l1: IconLayout): Interpolator<IconLayout>;

    /** @internal */
    prototype: Interpolator<IconLayout>;
  };

  IconLayoutInterpolator.prototype = Object.create(_super.prototype);
  IconLayoutInterpolator.prototype.constructor = IconLayoutInterpolator;

  return IconLayoutInterpolator;
})(Interpolator);
