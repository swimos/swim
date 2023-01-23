// Copyright 2015-2023 Swim.inc
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

import type {Interpolator} from "@swim/util";
import {AnyFont, Font, FontInterpolator} from "@swim/style";
import {Look} from "./Look";

/** @public */
export type AnyFontOrLook = Look<Font, any> | AnyFont;

/** @public */
export type FontOrLook = Look<Font, any> | Font;

/** @public */
export class FontLook extends Look<Font, AnyFont> {
  override combine(combination: Font | undefined, value: Font, weight?: number): Font {
    if (weight === void 0 || weight !== 0) {
      return value;
    } else if (combination !== void 0) {
      return combination;
    } else {
      return Font.family(value.family);
    }
  }

  override between(a: Font, b: Font): Interpolator<Font> {
    return FontInterpolator(a, b);
  }

  override coerce(value: AnyFont): Font {
    return Font.fromAny(value);
  }

  static fromAny(value: Look<Font> | AnyFont): Look<Font> | Font;
  static fromAny(value: Look<Font> | AnyFont | null): Look<Font> | Font | null;
  static fromAny(value: Look<Font> | AnyFont | null | undefined): Look<Font> | Font | null | undefined;
  static fromAny(value: Look<Font> | AnyFont | null | undefined): Look<Font> | Font | null | undefined {
    if (value === void 0 || value === null || value instanceof Look || value instanceof Font) {
      return value;
    } else {
      return Font.fromAny(value);
    }
  }
}
