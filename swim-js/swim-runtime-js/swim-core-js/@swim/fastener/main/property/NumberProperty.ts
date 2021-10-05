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

import {PropertyClass, Property} from "./Property";

/** @internal */
export const NumberProperty = (function (_super: typeof Property) {
  const NumberProperty = _super.extend() as PropertyClass<Property<any, number | null | undefined, number | string | null | undefined>>;

  NumberProperty.prototype.fromAny = function (value: number | string | null | undefined): number | null | undefined {
    if (typeof value === "string") {
      const number = +value;
      if (isFinite(number)) {
        return number;
      } else {
        throw new Error(value);
      }
    } else {
      return value;
    }
  };

  NumberProperty.prototype.equalState = function (newState: number | null | undefined, oldState: number | null | undefined): boolean {
    return newState === oldState;
  };

  return NumberProperty;
})(Property);
