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

import {AnyTiming, Timing, Interpolator} from "@swim/util";
import {Look} from "./Look";

/** @internal */
export class TimingLook extends Look<Timing, AnyTiming> {
  override combine(combination: Timing | undefined, value: Timing, weight: number): Timing {
    if (weight === void 0 || weight !== 0) {
      return value;
    } else if (combination !== void 0) {
      return combination;
    } else {
      return value
    }
  }

  override between(a: Timing, b: Timing): Interpolator<Timing> {
    return Interpolator(a, b);
  }

  override coerce(value: AnyTiming): Timing {
    return Timing.fromAny(value);
  }
}
