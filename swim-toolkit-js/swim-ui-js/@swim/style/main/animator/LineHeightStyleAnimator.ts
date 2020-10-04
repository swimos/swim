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

import {Length} from "@swim/length";
import {AnyLineHeight, LineHeight} from "@swim/font";
import {StyleContext} from "../sheet/StyleContext";
import {StyleAnimator} from "./StyleAnimator";

/** @hidden */
export abstract class LineHeightStyleAnimator<V extends StyleContext> extends StyleAnimator<V, LineHeight, AnyLineHeight> {
  parse(value: string): LineHeight | undefined {
    return LineHeight.fromAny(value);
  }

  fromCss(value: CSSStyleValue): LineHeight | undefined {
    if (value instanceof CSSNumericValue) {
      return Length.fromCss(value);
    } else {
      return void 0;
    }
  }

  fromAny(value: AnyLineHeight): LineHeight | undefined {
    return LineHeight.fromAny(value);
  }
}
StyleAnimator.LineHeight = LineHeightStyleAnimator;
