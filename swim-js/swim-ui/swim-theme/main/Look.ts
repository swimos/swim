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
import {Numbers} from "@swim/util";
import type {Like} from "@swim/util";
import type {LikeType} from "@swim/util";
import type {TimingLike} from "@swim/util";
import {Timing} from "@swim/util";
import {Interpolator} from "@swim/util";
import {NumberInterpolator} from "@swim/util";
import type {LengthLike} from "@swim/math";
import {Length} from "@swim/math";
import {LengthInterpolator} from "@swim/math";
import type {FontLike} from "@swim/style";
import {Font} from "@swim/style";
import {FontInterpolator} from "@swim/style";
import type {ColorLike} from "@swim/style";
import {Color} from "@swim/style";
import type {BoxShadowLike} from "@swim/style";
import {BoxShadow} from "@swim/style";
import {BoxShadowInterpolator} from "@swim/style";
import {LookVector} from "./LookVector";
import type {MoodVector} from "./MoodVector";
import type {Feel} from "./Feel";
import type {Mood} from "./Mood";

/** @public */
export abstract class Look<T> implements Mood {
  constructor(name: string) {
    this.name = name;
  }

  readonly name: string;

  add(a: LookVector<T>, b: LookVector<T>): LookVector<T> {
    const aArray = a.array;
    const bArray = b.array;
    const newArray = new Array<[Feel, T]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0; i < aArray.length; i += 1) {
      const entry = aArray[i]!;
      const feel = entry[0];
      const y = b.get(feel);
      newIndex[feel.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [feel, feel.combine(this, entry[1], y)]);
    }
    for (let i = 0; i < bArray.length; i += 1) {
      const entry = bArray[i]!;
      const feel = entry[0];
      if (newIndex[feel.name] === void 0) {
        newIndex[feel.name] = newArray.length;
        newArray.push(entry);
      }
    }
    return this.fromArray(newArray, newIndex);
  }

  negate(a: LookVector<T>): LookVector<T> {
    const oldArray = a.array;
    const n = oldArray.length;
    const newArray = new Array<[Feel, T]>(n);
    for (let i = 0; i < n; i += 1) {
      const [feel, x] = oldArray[i]!;
      newArray[i] = [feel, feel.combine(this, void 0, x, -1)];
    }
    return this.fromArray(newArray, a.index);
  }

  subtract(a: LookVector<T>, b: LookVector<T>): LookVector<T> {
    const aArray = a.array;
    const bArray = b.array;
    const newArray = new Array<[Feel, T]>();
    const newIndex: {[name: string]: number | undefined} = {};
    for (let i = 0; i < aArray.length; i += 1) {
      const entry = aArray[i]!;
      const feel = entry[0];
      const y = b.get(feel);
      newIndex[feel.name] = newArray.length;
      newArray.push(y === void 0 ? entry : [feel, feel.combine(this, entry[1], y, -1)]);
    }
    for (let i = 0; i < bArray.length; i += 1) {
      const [feel, y] = bArray[i]!;
      if (newIndex[feel.name] === void 0) {
        newIndex[feel.name] = newArray.length;
        newArray.push([feel, feel.combine(this, void 0, y, -1)]);
      }
    }
    return this.fromArray(newArray, newIndex);
  }

  multiply(a: LookVector<T>, scalar: number): LookVector<T> {
    const oldArray = a.array;
    const n = oldArray.length;
    const newArray = new Array<[Feel, T]>(n);
    for (let i = 0; i < n; i += 1) {
      const [feel, x] = oldArray[i]!;
      newArray[i] = [feel, feel.combine(this, void 0, x, scalar)];
    }
    return this.fromArray(newArray, a.index);
  }

  dot(a: LookVector<T>, b: MoodVector): T | undefined {
    const array = a.array;
    let combination: T | undefined;
    for (let i = 0; i < array.length; i += 1) {
      const [feel, value] = array[i]!;
      const weight = b.get(feel);
      if (weight !== void 0 && weight !== 0) {
        combination = feel.combine(this, combination, value, weight);
      }
    }
    return combination;
  }

  dotOr<E>(a: LookVector<T>, b: MoodVector, elseValue: E): T | E {
    const array = a.array;
    if (array.length === 0) {
      return elseValue;
    }
    let combination: T | undefined;
    for (let i = 0; i < array.length; i += 1) {
      const [feel, value] = array[i]!;
      const weight = b.get(feel);
      if (weight !== void 0 && weight !== 0) {
        combination = feel.combine(this, combination, value, weight);
      }
    }
    return combination!;
  }

  abstract combine(combination: T | undefined, value: T, weight?: number): T;

  abstract between(a: T, b: T): Interpolator<T>;

  abstract coerce(value: T | LikeType<T>): T;

  empty(): LookVector<T> {
    return LookVector.empty();
  }

  of(...feels: [Feel, T | LikeType<T>][]): LookVector<T> {
    const n = feels.length;
    const array = new Array<[Feel, T]>(n);
    const index: {[name: string]: number | undefined} = {};
    for (let i = 0; i < n; i += 1) {
      const [feel, value] = feels[i]!;
      array[i] = [feel, this.coerce(value)];
      index[feel.name] = i;
    }
    return this.fromArray(array, index);
  }

  fromArray(array: readonly [Feel, T][],
            index?: {readonly [name: string]: number | undefined}): LookVector<T> {
    return LookVector.fromArray(array, index);
  }

  toString(): string {
    return "Look" + "." + this.name;
  }

  static font: Look<Font>; // defined by looks
  static smallFont: Look<Font>; // defined by looks
  static largeFont: Look<Font>; // defined by looks

  static textColor: Look<Color>; // defined by looks
  static iconColor: Look<Color>; // defined by looks
  static labelColor: Look<Color>; // defined by looks
  static legendColor: Look<Color>; // defined by looks
  static placeholderColor: Look<Color>; // defined by looks
  static highlightColor: Look<Color>; // defined by looks

  static statusColor: Look<Color>; // defined by looks
  static accentColor: Look<Color>; // defined by looks

  static backgroundColor: Look<Color>; // defined by looks
  static selectionColor: Look<Color>; // defined by looks
  static borderColor: Look<Color>; // defined by looks
  static focusColor: Look<Color>; // defined by looks

  static etchColor: Look<Color>; // defined by looks
  static maskColor: Look<Color>; // defined by looks
  static tickColor: Look<Color>; // defined by looks
  static gridColor: Look<Color>; // defined by looks

  static opacity: Look<number>; // defined by looks
  static shadow: Look<BoxShadow>; // defined by looks
  static spacing: Look<Length>; // defined by looks
  static timing: Look<Timing>; // defined by looks
}

/** @public */
export type NumberOrLookLike = Look<number> | number | string | boolean;

/** @public */
export type NumberOrLook = Like<Look<number> | number, string | boolean>;

/** @public */
export class NumberLook extends Look<number> {
  override combine(combination: number | undefined, value: number, weight: number): number {
    if (combination !== void 0) {
      if (weight === void 0 || weight === 1) {
        return value;
      } else if (weight === 0) {
        return combination;
      } else {
        return (1.0 - weight) * combination + weight * value;
      }
    } else if (weight !== void 0 && weight !== 1) {
      return value * weight;
    }
    return value;
  }

  override between(a: number, b: number): Interpolator<number> {
    return NumberInterpolator(a, b);
  }

  override coerce(value: number): number {
    return value;
  }

  static fromLike<T extends Look<number> | number | string | boolean | null | undefined>(value: T): Look<number> | number | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Look) {
      return value as Look<number> | Uninitable<T>;
    }
    return Numbers.fromLike<number | string | boolean>(value);
  }
}

/** @public */
export type LengthOrLookLike = Look<Length> | LengthLike;

/** @public */
export type LengthOrLook = Look<Length> | Length;

/** @public */
export class LengthLook extends Look<Length> {
  override combine(combination: Length | undefined, value: Length, weight?: number): Length {
    if (combination !== void 0) {
      if (weight === void 0 || weight === 1) {
        return value;
      } else if (weight === 0) {
        return combination;
      } else {
        return LengthInterpolator(combination, value)(weight);
      }
    } else if (weight !== void 0 && weight !== 1) {
      return value.times(weight);
    }
    return value;
  }

  override between(a: Length, b: Length): Interpolator<Length> {
    return LengthInterpolator(a, b);
  }

  override coerce(value: LengthLike): Length {
    return Length.fromLike(value);
  }

  static fromLike<T extends Look<Length> | LengthLike | null | undefined>(value: T): Look<Length> | Length | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Look || value instanceof Length) {
      return value as Look<Length> | Length | Uninitable<T>;
    }
    return Length.fromLike<LengthLike>(value);
  }
}

/** @public */
export type ColorOrLookLike = Look<Color> | ColorLike;

/** @public */
export type ColorOrLook = Look<Color> | Color;

/** @public */
export class ColorLook extends Look<Color> {
  override combine(combination: Color | undefined, value: Color, weight?: number): Color {
    if (combination !== void 0) {
      if (weight === void 0 || weight === 1) {
        return value;
      } else if (weight === 0) {
        return combination;
      } else {
        return combination.interpolateTo(value)(weight);
      }
    } else if (weight !== void 0 && weight !== 1) {
      return value.times(weight);
    }
    return value;
  }

  override between(a: Color, b: Color): Interpolator<Color> {
    return a.interpolateTo(b);
  }

  override coerce(value: ColorLike): Color {
    return Color.fromLike(value);
  }

  static fromLike<T extends Look<Color> | ColorLike | null | undefined>(value: T): Look<Color> | Color | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Look || value instanceof Color) {
      return value as Look<Color> | Color | Uninitable<T>;
    }
    return Color.fromLike<ColorLike>(value);
  }
}

/** @public */
export type FontOrLookLike = Look<Font> | FontLike;

/** @public */
export type FontOrLook = Look<Font> | Font;

/** @public */
export class FontLook extends Look<Font> {
  override combine(combination: Font | undefined, value: Font, weight?: number): Font {
    if (weight === void 0 || weight !== 0) {
      return value;
    } else if (combination !== void 0) {
      return combination;
    }
    return Font.family(value.family);
  }

  override between(a: Font, b: Font): Interpolator<Font> {
    return FontInterpolator(a, b);
  }

  override coerce(value: FontLike): Font {
    return Font.fromLike(value);
  }

  static fromLike<T extends Look<Font> | FontLike | null | undefined>(value: T): Look<Font> | Font | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Look || value instanceof Font) {
      return value as Look<Font> | Font | Uninitable<T>;
    }
    return Font.fromLike<Font | FontLike>(value);
  }
}

/** @public */
export type ShadowOrLookLike = Look<BoxShadow> | BoxShadowLike;

/** @public */
export type ShadowOrLook = Look<BoxShadow> | BoxShadow;

/** @public */
export class ShadowLook extends Look<BoxShadow> {
  override combine(combination: BoxShadow | undefined, value: BoxShadow, weight?: number): BoxShadow {
    if (weight === void 0 || weight !== 0) {
      return value;
    } else if (combination !== void 0) {
      return combination;
    }
    return value;
  }

  override between(a: BoxShadow, b: BoxShadow): Interpolator<BoxShadow> {
    return BoxShadowInterpolator(a, b);
  }

  override coerce(value: BoxShadowLike): BoxShadow {
    return BoxShadow.fromLike(value)!;
  }

  static fromLike<T extends Look<BoxShadow> | BoxShadowLike | null | undefined>(value: T): Look<BoxShadow> | BoxShadow | Uninitable<T>{
    if (value === void 0 || value === null || value instanceof Look || value instanceof BoxShadow) {
      return value as Look<BoxShadow> | BoxShadow | Uninitable<T>;
    }
    return BoxShadow.fromLike<BoxShadowLike>(value);
  }
}

/** @public */
export type TimingOrLookLike = Look<Timing> | TimingLike;

/** @public */
export type TimingOrLook = Look<Timing> | Timing;

/** @public */
export class TimingLook extends Look<Timing> {
  override combine(combination: Timing | undefined, value: Timing, weight: number): Timing {
    if (weight === void 0 || weight !== 0) {
      return value;
    } else if (combination !== void 0) {
      return combination;
    }
    return value;
  }

  override between(a: Timing, b: Timing): Interpolator<Timing> {
    return Interpolator(a, b);
  }

  override coerce(value: TimingLike): Timing {
    return Timing.fromLike(value);
  }

  static fromLike<T extends Look<Timing> | TimingLike | null | undefined>(value: T): Look<Timing> | Timing | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof Look || value instanceof Timing) {
      return value as Look<Timing> | Timing | Uninitable<T>;
    }
    return Timing.fromLike<TimingLike>(value);
  }
}

Look.font = new FontLook("font");
Look.smallFont = new FontLook("smallFont");
Look.largeFont = new FontLook("largeFont");

Look.textColor = new ColorLook("textColor");
Look.iconColor = new ColorLook("iconColor");
Look.labelColor = new ColorLook("labelColor");
Look.legendColor = new ColorLook("legendColor");
Look.placeholderColor = new ColorLook("placeholderColor");
Look.highlightColor = new ColorLook("highlightColor");

Look.statusColor = new ColorLook("statusColor");
Look.accentColor = new ColorLook("accentColor");

Look.backgroundColor = new ColorLook("backgroundColor");
Look.selectionColor = new ColorLook("selectionColor");
Look.borderColor = new ColorLook("borderColor");
Look.focusColor = new ColorLook("focusColor");

Look.etchColor = new ColorLook("etchColor");
Look.maskColor = new ColorLook("maskColor");
Look.tickColor = new ColorLook("tickColor");
Look.gridColor = new ColorLook("gridColor");

Look.opacity = new NumberLook("opacity");
Look.shadow = new ShadowLook("shadow");
Look.spacing = new LengthLook("spacing");
Look.timing = new TimingLook("timing");
