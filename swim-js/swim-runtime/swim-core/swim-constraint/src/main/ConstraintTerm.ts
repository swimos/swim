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

import type {ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintVariable} from "./ConstraintVariable";

/** @public */
export interface ConstraintTerm extends ConstraintExpression {
  readonly coefficient: number;

  readonly variable: ConstraintVariable | null;

  negative(): ConstraintTerm;
}

/** @public */
export const ConstraintTerm = (function () {
  const ConstraintTerm = {} as {
    is(value: unknown): value is ConstraintTerm;
  };

  ConstraintTerm.is = function (value: unknown): value is ConstraintTerm {
    if (typeof value === "object" && value !== null || typeof value === "function") {
      const term = value as ConstraintTerm;
      return "coefficient" in term && "variable" in term;
    }
    return false;
  };

  return ConstraintTerm;
})();
