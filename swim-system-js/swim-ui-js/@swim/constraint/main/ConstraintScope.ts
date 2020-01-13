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

import {Constrain} from "./Constrain";
import {ConstrainVariable} from "./ConstrainVariable";
import {ConstraintRelation} from "./ConstraintRelation";
import {AnyConstraintStrength} from "./ConstraintStrength";
import {Constraint} from "./Constraint";

export interface ConstraintScope {
  variable(name: string, value?: number, strength?: AnyConstraintStrength): ConstrainVariable;

  constraint(lhs: Constrain | number, relation: ConstraintRelation,
             rhs?: Constrain | number, strength?: AnyConstraintStrength): Constraint;

  hasVariable(variable: ConstrainVariable): boolean;

  addVariable(variable: ConstrainVariable): void;

  removeVariable(variable: ConstrainVariable): void;

  setVariable(variable: ConstrainVariable, state: number): void;

  hasConstraint(constraint: Constraint): boolean;

  addConstraint(constraint: Constraint): void;

  removeConstraint(constraint: Constraint): void;
}
