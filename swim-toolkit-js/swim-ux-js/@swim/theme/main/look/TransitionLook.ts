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

import {Interpolator} from "@swim/interpolate";
import {AnyTransition, Transition} from "@swim/transition";
import {Look} from "./Look";

export class TransitionLook<T = any> extends Look<Transition<T>, AnyTransition<T>> {
  combine(combination: Transition<any> | undefined, value: Transition<any>, weight: number): Transition<any> {
    if (weight === void 0 || weight !== 0) {
      return value;
    } else if (combination !== void 0) {
      return combination;
    } else {
      return new Transition(null, null, null, null);
    }
  }

  between(a: Transition<any>, b: Transition<any>): Interpolator<Transition<any>> {
    return Interpolator.between(a, b);
  }

  coerce(value: AnyTransition<any>): Transition<any> {
    return Transition.fromAny(value);
  }
}
