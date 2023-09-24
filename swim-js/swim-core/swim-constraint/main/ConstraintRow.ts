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

import {Equivalent} from "@swim/util";
import type {ConstraintSymbol} from "./ConstraintSymbol";
import {ConstraintDummy} from "./ConstraintSymbol";
import type {ConstraintSolver} from "./ConstraintSolver";

/** @internal */
export class ConstraintRow {
  constructor(solver: ConstraintSolver, symbol: ConstraintSymbol | null,
              cells: Map<ConstraintSymbol, number>, constant: number) {
    this.solver = solver;
    this.symbol = symbol;
    this.cells = cells;
    this.constant = constant;
  }

  readonly solver: ConstraintSolver;

  symbol: ConstraintSymbol | null;

  /** @internal */
  setSymbol(symbol: ConstraintSymbol | null): void {
    this.symbol = symbol;
    this.invalidate();
  }

  readonly cells: Map<ConstraintSymbol, number>;

  constant: number;

  /** @internal */
  setConstant(constant: number): void {
    if (this.constant === constant) {
      return;
    }
    this.constant = constant;
    this.invalidate();
  }

  isConstant(): boolean {
    return this.cells.size === 0;
  }

  isDummy(): boolean {
    for (const symbol of this.cells.keys()) {
      if (!(symbol instanceof ConstraintDummy)) {
        return false;
      }
    }
    return true;
  }

  clone(): ConstraintRow {
    return new ConstraintRow(this.solver, this.symbol, new Map(this.cells), this.constant);
  }

  add(value: number): number {
    const sum = this.constant + value;
    this.setConstant(sum);
    return sum;
  }

  insertSymbol(symbol: ConstraintSymbol, coefficient: number = 1): void {
    coefficient += this.cells.get(symbol) ?? 0;
    if (Math.abs(coefficient) < Equivalent.Epsilon) {
      this.cells.delete(symbol);
    } else {
      this.cells.set(symbol, coefficient);
    }
  }

  insertRow(that: ConstraintRow, coefficient: number): void {
    this.setConstant(this.constant + that.constant * coefficient);
    for (const [symbol, value] of that.cells) {
      this.insertSymbol(symbol, value * coefficient);
    }
  }

  removeSymbol(symbol: ConstraintSymbol): void {
    this.cells.delete(symbol);
  }

  negate(): void {
    this.setConstant(-this.constant);
    for (const [symbol, value] of this.cells) {
      this.cells.set(symbol, -value);
    }
  }

  solveFor(symbol: ConstraintSymbol): void {
    const value = this.cells.get(symbol);
    if (value === void 0) {
      return;
    }
    this.cells.delete(symbol);
    const coefficient = -1 / value;
    this.setConstant(this.constant * coefficient);
    for (const [symbol, value] of this.cells) {
      this.cells.set(symbol, value * coefficient);
    }
  }

  solveForEx(lhs: ConstraintSymbol, rhs: ConstraintSymbol): void {
    this.insertSymbol(lhs, -1.0);
    this.solveFor(rhs);
  }

  coefficientFor(symbol: ConstraintSymbol): number {
    const value = this.cells.get(symbol);
    return value !== void 0 ? value : 0;
  }

  substitute(symbol: ConstraintSymbol, row: ConstraintRow): void {
    const value = this.cells.get(symbol);
    if (value !== void 0) {
      this.cells.delete(symbol);
      this.insertRow(row, value);
    }
  }

  invalidate(): void {
    const symbol = this.symbol;
    if (symbol !== null) {
      this.solver.invalidate(symbol, this);
    }
  }
}
