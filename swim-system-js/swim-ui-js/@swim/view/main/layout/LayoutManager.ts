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

import {ConstrainVariable, Constraint} from "@swim/constraint";

/** @hidden */
export interface LayoutManager {
  /** @hidden */
  activateVariable(variable: ConstrainVariable): void;

  /** @hidden */
  deactivateVariable(variable: ConstrainVariable): void;

  /** @hidden */
  setVariable(variable: ConstrainVariable, state: number): void;

  /** @hidden */
  activateConstraint(constraint: Constraint): void;

  /** @hidden */
  deactivateConstraint(constraint: Constraint): void;

  /** @hidden */
  didAddConstraint(constraint: Constraint): void;

  /** @hidden */
  didRemoveConstraint(constraint: Constraint): void;

  /** @hidden */
  didAddVariable(variable: ConstrainVariable): void;

  /** @hidden */
  didRemoveVariable(variable: ConstrainVariable): void;
}

/** @hidden */
export const LayoutManager = {
  is(object: unknown): object is LayoutManager {
    if (typeof object === "object" && object) {
      const view = object as LayoutManager;
      return typeof view.setVariable === "function";
    }
    return false;
  },
};
