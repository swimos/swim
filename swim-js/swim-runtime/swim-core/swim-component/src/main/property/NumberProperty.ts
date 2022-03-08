// Copyright 2015-2022 Swim.inc
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

import {PropertyFactory, Property} from "./Property";

/** @internal */
export const NumberProperty = (function (_super: typeof Property) {
  const NumberProperty = _super.extend("NumberProperty") as PropertyFactory<Property<any, number | null | undefined, number | string | null | undefined>>;

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

  NumberProperty.prototype.equalValues = function (newValue: number | null | undefined, oldValue: number | null | undefined): boolean {
    return newValue === oldValue;
  };

  return NumberProperty;
})(Property);
