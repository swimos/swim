// Copyright 2015-2019 SWIM.AI inc.
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

import {ConstrainVariable, Constraint, ConstraintSolver} from "@swim/constraint";
import {LayoutManager} from "./LayoutManager";

/** @hidden */
export class LayoutSolver extends ConstraintSolver {
  /** @hidden */
  readonly _manager: LayoutManager;

  constructor(manager: LayoutManager) {
    super();
    this._manager = manager;
  }

  get manager(): LayoutManager {
    return this._manager;
  }

  protected didAddConstraint(constraint: Constraint): void {
    this._manager.didAddConstraint(constraint);
  }

  protected didRemoveConstraint(constraint: Constraint): void {
    this._manager.didRemoveConstraint(constraint);
  }

  protected didAddVariable(variable: ConstrainVariable): void {
    this._manager.didAddVariable(variable);
  }

  protected didRemoveVariable(variable: ConstrainVariable): void {
    this._manager.didRemoveVariable(variable);
  }
}
