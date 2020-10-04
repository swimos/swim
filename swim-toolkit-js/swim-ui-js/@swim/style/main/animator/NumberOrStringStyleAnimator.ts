// Copyright 2015-2020 Swim inc.
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

import {StyleContext} from "../sheet/StyleContext";
import {StyleAnimator} from "./StyleAnimator";

/** @hidden */
export abstract class NumberOrStringStyleAnimator<V extends StyleContext> extends StyleAnimator<V, number | string, number | string> {
  parse(value: string): number | string | undefined {
    const number = +value;
    return isFinite(number) ? number : value;
  }

  fromCss(value: CSSStyleValue): number | undefined {
    if (value instanceof CSSNumericValue) {
      return value.to("number").value;
    } else {
      return void 0;
    }
  }

  fromAny(value: number | string): number | string | undefined {
    if (typeof value === "number") {
      return value;
    } else {
      const number = +value;
      return isFinite(number) ? number : value;
    }
  }
}
StyleAnimator.NumberOrString = NumberOrStringStyleAnimator;
