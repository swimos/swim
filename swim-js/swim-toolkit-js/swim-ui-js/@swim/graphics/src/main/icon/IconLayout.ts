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

import {AnyLength, Length} from "@swim/math";

export type AnyIconLayout = IconLayout | IconLayoutInit;

export interface IconLayoutInit {
  iconWidth: AnyLength;
  iconHeight: AnyLength;
  xAlign?: number;
  yAlign?: number;
}

export interface IconLayout {
  readonly iconWidth: Length;
  readonly iconHeight: Length;
  readonly xAlign: number | undefined;
  readonly yAlign: number | undefined;
}

export const IconLayout = (function () {
  const IconLayout = {} as {
    fromAny(value: AnyIconLayout): IconLayout;

    is(object: unknown): object is IconLayout;
  };

  IconLayout.fromAny = function (value: AnyIconLayout): IconLayout {
    if (value === void 0 || value === null) {
      return value;
    } else {
      const iconWidth = Length.fromAny(value.iconWidth);
      const iconHeight = Length.fromAny(value.iconHeight);
      const xAlign = value.xAlign;
      const yAlign = value.yAlign;
      return {iconWidth, iconHeight, xAlign, yAlign};
    }
  };

  IconLayout.is = function (object: unknown): object is IconLayout {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      const viewport = object as IconLayout;
      return "iconWidth" in viewport
          && "iconHeight" in viewport;
    }
    return false;
  };

  return IconLayout;
})();
