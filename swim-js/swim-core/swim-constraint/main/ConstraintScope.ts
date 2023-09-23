// Copyright 2015-2023 Nstream, inc.
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
import type {ConstraintExpressionLike} from "./ConstraintExpression";
import type {ConstraintVariable} from "./ConstraintVariable";
import type {ConstraintProperty} from "./ConstraintProperty";
import type {ConstraintRelation} from "./Constraint";
import type {ConstraintStrengthLike} from "./Constraint";
import type {Constraint} from "./Constraint";

/** @public */
export interface ConstraintScope {
  constraint(lhs: ConstraintExpressionLike, relation: ConstraintRelation,
             rhs?: ConstraintExpressionLike, strength?: ConstraintStrengthLike): Constraint;

  hasConstraint(constraint: Constraint): boolean;

  addConstraint(constraint: Constraint): void;

  removeConstraint(constraint: Constraint): void;

  constraintVariable(name: string, value?: number, strength?: ConstraintStrengthLike): ConstraintProperty<unknown, number>;

  hasConstraintVariable(variable: ConstraintVariable): boolean;

  addConstraintVariable(variable: ConstraintVariable): void;

  removeConstraintVariable(variable: ConstraintVariable): void;

  setConstraintVariable(variable: ConstraintVariable, state: number): void;
}

/** @public */
export const ConstraintScope = {
  [Symbol.hasInstance](instance: unknown): instance is ConstraintScope {
    return Objects.hasAllKeys<ConstraintScope>(instance, "constraint", "constraintVariable");
  },
};
