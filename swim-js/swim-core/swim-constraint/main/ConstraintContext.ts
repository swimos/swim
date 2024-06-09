// Copyright 2015-2024 Nstream, inc.
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

import {Objects} from "@swim/util";
import type {ConstraintVariable} from "./ConstraintVariable";
import type {Constraint} from "./Constraint";

/** @public */
export interface ConstraintContext {
  activateConstraint(constraint: Constraint): void;

  deactivateConstraint(constraint: Constraint): void;

  activateConstraintVariable(variable: ConstraintVariable): void;

  deactivateConstraintVariable(variable: ConstraintVariable): void;

  setConstraintVariable(variable: ConstraintVariable, state: number): void;
}

/** @public */
export const ConstraintContext = {
  [Symbol.hasInstance](instance: unknown): instance is ConstraintContext {
    return Objects.hasAllKeys<ConstraintContext>(instance, "activateConstraint", "deactivateConstraint", "activateConstraintVariable", "deactivateConstraintVariable", "setConstraintVariable");
  },
};
