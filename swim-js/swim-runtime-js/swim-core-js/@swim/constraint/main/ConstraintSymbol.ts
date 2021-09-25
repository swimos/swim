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

import type {Mutable} from "@swim/util";
import {ConstraintKey} from "./ConstraintKey";
import type {Constraint} from "./Constraint";
import type {ConstraintSolver} from "./ConstraintSolver";

/** @hidden */
export interface ConstraintSymbol extends ConstraintKey {
  /** @hidden */
  isExternal(): boolean;

  /** @hidden */
  isDummy(): boolean;

  /** @hidden */
  isInvalid(): boolean;

  /** @hidden */
  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void;

  /** @hidden */
  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void;

  updateConstraintSolution(value: number): void;
}

/** @hidden */
export const ConstraintSymbol = {} as {
  readonly invalid: ConstraintInvalid; // defined by ConstraintInvalid
};

/** @hidden */
export class ConstraintSlack implements ConstraintSymbol {
  constructor() {
    this.id = ConstraintKey.nextId();
  }

  readonly id: number;

  isExternal(): boolean {
    return false;
  }

  isDummy(): boolean {
    return false;
  }

  isInvalid(): boolean {
    return false;
  }

  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    // nop
  }

  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    // nop
  }

  updateConstraintSolution(value: number): void {
    // nop
  }
}

/** @hidden */
export class ConstraintDummy implements ConstraintSymbol {
  constructor() {
    this.id = ConstraintKey.nextId();
  }

  readonly id: number;

  isExternal(): boolean {
    return false;
  }

  isDummy(): boolean {
    return true;
  }

  isInvalid(): boolean {
    return false;
  }

  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    // nop
  }

  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    // nop
  }

  updateConstraintSolution(value: number): void {
    // nop
  }
}

/** @hidden */
export class ConstraintError implements ConstraintSymbol {
  constructor() {
    this.id = ConstraintKey.nextId();
  }

  readonly id: number;

  isExternal(): boolean {
    return false;
  }

  isDummy(): boolean {
    return false;
  }

  isInvalid(): boolean {
    return false;
  }

  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    // nop
  }

  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    // nop
  }

  updateConstraintSolution(value: number): void {
    // nop
  }
}

/** @hidden */
export class ConstraintInvalid implements ConstraintSymbol {
  get id(): number {
    return -1;
  }

  isExternal(): boolean {
    return false;
  }

  isDummy(): boolean {
    return false;
  }

  isInvalid(): boolean {
    return true;
  }

  addConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    // nop
  }

  removeConstraintCondition(constraint: Constraint, solver: ConstraintSolver): void {
    // nop
  }

  updateConstraintSolution(value: number): void {
    // nop
  }
}
(ConstraintSymbol as Mutable<typeof ConstraintSymbol>).invalid = new ConstraintInvalid();
