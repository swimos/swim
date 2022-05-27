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

import type {Class} from "@swim/util";
import {Service} from "@swim/component";
import {ConstraintVariable, Constraint, ConstraintContext, ConstraintSolver} from "@swim/constraint";
import type {SolverServiceObserver} from "./SolverServiceObserver";

/** @public */
export class SolverService extends Service implements ConstraintContext {
  constructor() {
    super();
    this.solver = this.createSolver();
  }

  override readonly observerType?: Class<SolverServiceObserver>;

  readonly solver: ConstraintSolver;

  /** @internal */
  protected createSolver(): ConstraintSolver {
    return new ConstraintSolver();
  }

  /** @override */
  activateConstraint(constraint: Constraint): void {
    this.solver.addConstraint(constraint);
  }

  /** @override */
  deactivateConstraint(constraint: Constraint): void {
    this.solver.removeConstraint(constraint);
  }

  /** @override */
  activateConstraintVariable(variable: ConstraintVariable): void {
    this.solver.addConstraintVariable(variable);
  }

  /** @override */
  deactivateConstraintVariable(variable: ConstraintVariable): void {
    this.solver.removeConstraintVariable(variable);
  }

  /** @override */
  setConstraintVariable(variable: ConstraintVariable, value: number): void {
    this.solver.setConstraintVariable(variable, value);
  }
}
