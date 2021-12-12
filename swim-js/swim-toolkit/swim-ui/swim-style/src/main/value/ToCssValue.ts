// Copyright 2015-2021 Swim.inc
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

import {ToStyleString} from "./ToStyleString";

/** @public */
export interface ToCssValue {
  toCssValue(): CSSStyleValue | null;
}

/** @public */
export const ToCssValue = (function () {
  let ToCssValue: (value: unknown) => CSSStyleValue | null;

  if (typeof CSSStyleValue !== "undefined") { // CSS Typed OM support
    ToCssValue = function (value: unknown): CSSStyleValue | null {
      if (typeof value === "object" && value !== null &&
          typeof (value as ToCssValue).toCssValue === "function") {
        return (value as ToCssValue).toCssValue();
      } else if (typeof value === "number") {
        return new CSSUnitValue(value, "number");
      } else {
        return null;
      }
    };
  } else {
    ToCssValue = ToStyleString;
  }

  return ToCssValue;
})();
