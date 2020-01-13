// Copyright 2015-2020 SWIM.AI inc.
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

export type AnyLineHeight = AnyLength | LineHeight;

export type LineHeight = Length | "normal";

export const LineHeight = {
  fromAny(height: AnyLineHeight): LineHeight {
    if (typeof height === "string" && height === "normal") {
      return height;
    } else {
      return Length.fromAny(height);
    }
  },

  fromValue(value: Value): LineHeight | undefined {
    const string = value.stringValue(void 0);
    if (string !== void 0) {
      return LineHeight.fromAny(string);
    } else {
      return Length.form().cast(value);
    }
  },
};
