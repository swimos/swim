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

import {AnyLength, Length} from "@swim/length";
import {StyleContext} from "../sheet/StyleContext";
import {StyleAnimator} from "./StyleAnimator";

/** @hidden */
export abstract class LengthStyleAnimator<V extends StyleContext> extends StyleAnimator<V, Length, AnyLength> {
  parse(value: string): Length | undefined {
    return Length.parse(value, this.node);
  }

  fromCss(value: CSSStyleValue): Length | undefined {
    return Length.fromCss(value, this.node);
  }

  fromAny(value: AnyLength): Length | undefined {
    return Length.fromAny(value, this.node);
  }
}
StyleAnimator.Length = LengthStyleAnimator;
