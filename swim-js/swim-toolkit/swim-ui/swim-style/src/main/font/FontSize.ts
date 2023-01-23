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

import type {Value} from "@swim/structure";
import {AnyLength, Length} from "@swim/math";

/** @public */
export type AnyFontSize = AnyLength | FontSize;

/** @public */
export type FontSize = Length
                     | "large"
                     | "larger"
                     | "medium"
                     | "small"
                     | "smaller"
                     | "x-large"
                     | "x-small"
                     | "xx-large"
                     | "xx-small";

/** @public */
export const FontSize = (function () {
  const FontSize = {} as {
    fromAny(size: AnyFontSize): FontSize;

    fromValue(value: Value): FontSize | null;
  };

  FontSize.fromAny = function (size: AnyFontSize): FontSize {
    if (typeof size === "string" && (size === "large" || size === "larger" || size === "medium"
        || size === "small" || size === "smaller"  || size === "x-large" || size === "x-small"
        || size === "xx-large" || size === "xx-small")) {
      return size;
    } else {
      return Length.fromAny(size);
    }
  };

  FontSize.fromValue = function (value: Value): FontSize | null {
    const string = value.stringValue(null);
    if (string !== null) {
      return FontSize.fromAny(string);
    } else {
      const size = Length.form().cast(value);
      return size !== void 0 ? size : null;
    }
  };

  return FontSize;
})();
