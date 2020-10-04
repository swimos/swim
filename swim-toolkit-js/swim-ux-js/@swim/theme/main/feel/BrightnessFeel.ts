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

import {Color} from "@swim/color";
import {Look} from "../look/Look";
import {Feel} from "../feel/Feel";

export class BrightnessFeel extends Feel {
  combine<T>(look: Look<T, any>, combination: T | undefined,
             value: T, weight?: number): T {
    if (combination instanceof Color && value instanceof Color) {
      const amount = weight === void 0 ? value.alpha() : value.alpha() * weight;
      if (amount >= 0) {
        return combination.darker(amount) as unknown as T;
      } else {
        return combination.lighter(-amount) as unknown as T;
      }
    } else {
      return look.combine(combination, value, weight);
    }
  }
}
