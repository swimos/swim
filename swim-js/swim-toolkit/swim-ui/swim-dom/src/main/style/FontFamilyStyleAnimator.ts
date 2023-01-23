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

import {FontFamily, Font} from "@swim/style";
import {StyleAnimatorClass, StyleAnimator} from "./StyleAnimator";

/** @internal */
export interface FontFamilyStyleAnimator<O = unknown, T extends FontFamily | ReadonlyArray<FontFamily> | undefined = FontFamily | ReadonlyArray<FontFamily> | undefined, U extends FontFamily | ReadonlyArray<FontFamily> | undefined = T> extends StyleAnimator<O, T, U> {
}

/** @internal */
export const FontFamilyStyleAnimator = (function (_super: typeof StyleAnimator) {
  const FontFamilyStyleAnimator = _super.extend("FontFamilyStyleAnimator", {
    valueType: Font,
  }) as StyleAnimatorClass<FontFamilyStyleAnimator<any, any, any>>;

  FontFamilyStyleAnimator.prototype.parse = function (value: string): FontFamily | ReadonlyArray<FontFamily> | undefined {
    return Font.parse(value).family;
  };

  FontFamilyStyleAnimator.prototype.fromAny = function (value: FontFamily | ReadonlyArray<FontFamily>): FontFamily | ReadonlyArray<FontFamily> | undefined {
    return Font.family(value).family;
  };

  return FontFamilyStyleAnimator;
})(StyleAnimator);
