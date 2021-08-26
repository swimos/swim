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

import type {Interpolator} from "@swim/mapping";
import {AnyLength, Length, LengthInterpolator} from "@swim/math";
import {Look} from "./Look";

export class LengthLook extends Look<Length, AnyLength> {
  override combine(combination: Length | undefined, value: Length, weight?: number): Length {
    if (combination !== void 0) {
      if (weight === void 0 || weight === 1) {
        return value;
      } else if (weight === 0) {
        return combination;
      } else {
        return LengthInterpolator(combination, value)(weight);
      }
    } else if (weight !== void 0 && weight !== 1) {
      return value.times(weight);
    } else {
      return value;
    }
  }

  override between(a: Length, b: Length): Interpolator<Length> {
    return LengthInterpolator(a, b);
  }

  override coerce(value: AnyLength): Length {
    return Length.fromAny(value);
  }
}
