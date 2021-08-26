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

import {Lazy} from "@swim/util";
import {ConstraintVariable, Constraint, ConstraintSolver} from "@swim/constraint";
import type {View} from "../View";
import {ViewManager} from "../manager/ViewManager";
import type {LayoutManagerObserver} from "./LayoutManagerObserver";

export class LayoutManager<V extends View = View> extends ViewManager<V> {
  constructor() {
    super();
    Object.defineProperty(this, "solver", {
      value: this.createSolver(),
      enumerable: true,
    });
  }

  readonly solver!: ConstraintSolver;

  /** @hidden */
  protected createSolver(): ConstraintSolver {
    return new ConstraintSolver();
  }

  activateConstraint(constraint: Constraint): void {
    this.solver.addConstraint(constraint);
  }

  deactivateConstraint(constraint: Constraint): void {
    this.solver.removeConstraint(constraint);
  }

  activateConstraintVariable(constraintVariable: ConstraintVariable): void {
    this.solver.addConstraintVariable(constraintVariable);
  }

  deactivateConstraintVariable(constraintVariable: ConstraintVariable): void {
    this.solver.removeConstraintVariable(constraintVariable);
  }

  setConstraintVariable(constraintVariable: ConstraintVariable, state: number): void {
    this.solver.setConstraintVariable(constraintVariable, state);
  }

  override readonly viewManagerObservers!: ReadonlyArray<LayoutManagerObserver>;

  @Lazy
  static global<V extends View>(): LayoutManager<V> {
    return new LayoutManager();
  }
}
