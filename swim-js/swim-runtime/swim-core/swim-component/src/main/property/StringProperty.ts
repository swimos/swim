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

import {PropertyFactory, Property} from "./Property";

/** @internal */
export const StringProperty = (function (_super: typeof Property) {
  const StringProperty = _super.extend("StringProperty") as PropertyFactory<Property<any, string | null | undefined, string | null | undefined>>;

  StringProperty.prototype.fromAny = function (value: string | null | undefined): string | null | undefined {
    return value;
  };

  StringProperty.prototype.equalValues = function (newValue: string | null | undefined, oldValue: string | null | undefined): boolean {
    return newValue === oldValue;
  };

  return StringProperty;
})(Property);
