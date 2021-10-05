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

import type {Value} from "@swim/structure";
import {AnyLength, Length} from "@swim/math";

export type AnyLineHeight = AnyLength | LineHeight;

export type LineHeight = Length | "normal";

export const LineHeight = (function () {
  const LineHeight = {} as {
    fromAny(height: AnyLineHeight): LineHeight;

    fromValue(value: Value): LineHeight | null;
  };

  LineHeight.fromAny = function (height: AnyLineHeight): LineHeight {
    if (typeof height === "string" && height === "normal") {
      return height;
    } else {
      return Length.fromAny(height);
    }
  };

  LineHeight.fromValue = function (value: Value): LineHeight | null {
    const string = value.stringValue(null);
    if (string !== null) {
      return LineHeight.fromAny(string);
    } else {
      const height = Length.form().cast(value);
      return height !== void 0 ? height : null;
    }
  };

  return LineHeight;
})();
