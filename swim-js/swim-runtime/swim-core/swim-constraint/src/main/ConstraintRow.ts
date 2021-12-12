// Copyright 2015-2021 Swim.inc
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

import {Equivalent, Mutable} from "@swim/util";
import type {ConstraintMap} from "./ConstraintMap";
import {ConstraintSymbol, ConstraintDummy} from "./ConstraintSymbol";
import type {ConstraintSolver} from "./ConstraintSolver";

/** @internal */
export class ConstraintRow {
  constructor(solver: ConstraintSolver, symbol: ConstraintSymbol | null,
              cells: ConstraintMap<ConstraintSymbol, number>, constant: number) {
    this.solver = solver;
    this.symbol = symbol;
    this.cells = cells;
    this.constant = constant;
  }

  readonly solver: ConstraintSolver;

  readonly symbol: ConstraintSymbol | null;

  /** @internal */
  setSymbol(symbol: ConstraintSymbol | null): void {
    (this as Mutable<this>).symbol = symbol;
    this.invalidate();
  }

  readonly cells: ConstraintMap<ConstraintSymbol, number>;

  readonly constant: number;

  /** @internal */
  setConstant(constant: number): void {
    if (this.constant !== constant) {
      (this as Mutable<this>).constant = constant;
      this.invalidate();
    }
  }

  isConstant(): boolean {
    return this.cells.isEmpty();
  }

  isDummy(): boolean {
    for (let i = 0, n = this.cells.size; i < n; i += 1) {
      const symbol = this.cells.getEntry(i)![0];
      if (!(symbol instanceof ConstraintDummy)) {
        return false;
      }
    }
    return true;
  }

  clone(): ConstraintRow {
    return new ConstraintRow(this.solver, this.symbol, this.cells.clone(), this.constant);
  }

  add(value: number): number {
    const sum = this.constant + value;
    this.setConstant(sum);
    return sum;
  }

  insertSymbol(symbol: ConstraintSymbol, coefficient: number = 1): void {
    coefficient += this.cells.get(symbol) ?? 0;
    if (Math.abs(coefficient) < Equivalent.Epsilon) {
      this.cells.remove(symbol);
    } else {
      this.cells.set(symbol, coefficient);
    }
  }

  insertRow(that: ConstraintRow, coefficient: number): void {
    this.setConstant(this.constant + that.constant * coefficient);
    for (let i = 0, n = that.cells.size; i < n; i += 1) {
      const [symbol, value] = that.cells.getEntry(i)!;
      this.insertSymbol(symbol, value * coefficient);
    }
  }

  removeSymbol(symbol: ConstraintSymbol): void {
    this.cells.remove(symbol);
  }

  negate(): void {
    this.setConstant(-this.constant);
    for (let i = 0, n = this.cells.size; i < n; i += 1) {
      const entry = this.cells.getEntry(i)!;
      entry[1] = -entry[1];
    }
  }

  solveFor(symbol: ConstraintSymbol): void {
    const value = this.cells.remove(symbol);
    if (value !== void 0) {
      const coefficient = -1 / value;
      this.setConstant(this.constant * coefficient);
      for (let i = 0, n = this.cells.size; i < n; i += 1) {
        const entry = this.cells.getEntry(i)!;
        entry[1] *= coefficient;
      }
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
    const value = this.cells.remove(symbol);
    if (value !== void 0) {
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
