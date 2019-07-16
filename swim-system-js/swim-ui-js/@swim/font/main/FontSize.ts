// Copyright 2015-2019 SWIM.AI inc.
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

import {Value} from "@swim/structure";
import {AnyLength, Length} from "@swim/length";

export type AnyFontSize = AnyLength | FontSize;

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

export const FontSize = {
  fromAny(size: AnyFontSize): FontSize {
    if (typeof size === "string" && (size === "large" || size === "larger" || size === "medium"
          || size === "small" || size === "smaller"  || size === "x-large" || size === "x-small"
          || size === "xx-large" || size === "xx-small")) {
      return size;
    } else {
      return Length.fromAny(size);
    }
  },

  fromValue(value: Value): FontSize | undefined {
    const string = value.stringValue(void 0);
    if (string !== void 0) {
      return FontSize.fromAny(string);
    } else {
      return Length.form().cast(value);
    }
  },
};
