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

import type {Look} from "../look/Look";
import type {Feel} from "../feel/Feel";
import type {MoodVector} from "../mood/MoodVector";

/** @public */
export interface ThemeContext {
  getLook<T>(look: Look<T, unknown>, mood?: MoodVector<Feel> | null): T | undefined;

  getLookOr<T, E>(look: Look<T, unknown>, elseValue: E): T | E;
  getLookOr<T, E>(look: Look<T, unknown>, mood: MoodVector<Feel> | null, elseValue: E): T | E;
}

/** @public */
export const ThemeContext = (function () {
  const ThemeContext = {} as {
    is(object: unknown): object is ThemeContext;
  };

  ThemeContext.is = function (object: unknown): object is ThemeContext {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      const themeContext = object as ThemeContext;
      return "getLook" in themeContext;
    }
    return false;
  };

  return ThemeContext;
})();
