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

import type {AnyConstraintExpression} from "./ConstraintExpression";
import type {ConstraintVariable} from "./ConstraintVariable";
import type {ConstraintProperty} from "./ConstraintProperty";
import type {ConstraintRelation} from "./ConstraintRelation";
import type {AnyConstraintStrength} from "./ConstraintStrength";
import type {Constraint} from "./Constraint";

/** @public */
export interface ConstraintScope {
  constraint(lhs: AnyConstraintExpression, relation: ConstraintRelation,
             rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint;

  hasConstraint(constraint: Constraint): boolean;

  addConstraint(constraint: Constraint): void;

  removeConstraint(constraint: Constraint): void;

  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number>;

  hasConstraintVariable(variable: ConstraintVariable): boolean;

  addConstraintVariable(variable: ConstraintVariable): void;

  removeConstraintVariable(variable: ConstraintVariable): void;

  setConstraintVariable(variable: ConstraintVariable, state: number): void;
}

/** @public */
export const ConstraintScope = (function () {
  const ConstraintScope = {} as {
    is(object: unknown): object is ConstraintScope;
  };

  ConstraintScope.is = function (object: unknown): object is ConstraintScope {
    if (typeof object === "object" && object !== null || typeof object === "function") {
      const constraintScope = object as ConstraintScope;
      return "constraint" in constraintScope;
    }
    return false;
  };

  return ConstraintScope;
})();
