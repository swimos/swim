// Copyright 2015-2020 SWIM.AI inc.
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

import {ConstrainVariable, Constraint, ConstraintScope} from "@swim/constraint";

export interface LayoutScope extends ConstraintScope {
  readonly constraints: ReadonlyArray<Constraint>;

  readonly constraintVariables: ReadonlyArray<ConstrainVariable>;

  /** @hidden */
  updateConstraintVariables(): void;
}

/** @hidden */
export const LayoutScope = {
  is(object: unknown): object is LayoutScope {
    if (typeof object === "object" && object !== null) {
      const view = object as LayoutScope;
      return typeof view.updateConstraintVariables === "function";
    }
    return false;
  },
};
