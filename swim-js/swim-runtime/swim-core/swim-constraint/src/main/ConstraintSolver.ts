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
import {ConstraintMap} from "./ConstraintMap";
import {ConstraintSymbol, ConstraintSlack, ConstraintError, ConstraintDummy} from "./ConstraintSymbol";
import {AnyConstraintExpression, ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintVariable} from "./ConstraintVariable";
import {ConstraintProperty} from "./ConstraintProperty";
import type {ConstraintRelation} from "./ConstraintRelation";
import {AnyConstraintStrength, ConstraintStrength} from "./ConstraintStrength";
import {Constraint} from "./Constraint";
import type {ConstraintScope} from "./ConstraintScope";
import {ConstraintRow} from "./ConstraintRow";

/** @internal */
export interface ConstraintTag {
  readonly marker: ConstraintSymbol;
  readonly other: ConstraintSymbol;
}

/** @internal */
export interface ConstraintVariableBinding {
  readonly constraint: Constraint;
  readonly tag: ConstraintTag;
  state: number;
}

/** @public */
export class ConstraintSolver implements ConstraintScope {
  constructor() {
    this.constraints = new ConstraintMap();
    this.constraintVariables = new ConstraintMap();
    this.rows = new ConstraintMap();
    this.infeasible = [];
    this.objective = new ConstraintRow(this, null, new ConstraintMap(), 0);
    this.artificial = null;
    this.invalidated = new ConstraintMap();
  }

  /** @internal */
  readonly constraints: ConstraintMap<Constraint, ConstraintTag>;

  /** @internal */
  readonly constraintVariables: ConstraintMap<ConstraintVariable, ConstraintVariableBinding>;

  /** @internal */
  readonly rows: ConstraintMap<ConstraintSymbol, ConstraintRow>;

  /** @internal */
  readonly infeasible: ConstraintSymbol[];

  /** @internal */
  readonly objective: ConstraintRow;

  /** @internal */
  readonly artificial: ConstraintRow | null;

  /** @internal */
  readonly invalidated: ConstraintMap<ConstraintSymbol, ConstraintRow | null>;

  constraint(lhs: AnyConstraintExpression, relation: ConstraintRelation,
             rhs?: AnyConstraintExpression, strength?: AnyConstraintStrength): Constraint {
    lhs = ConstraintExpression.fromAny(lhs);
    if (rhs !== void 0) {
      rhs = ConstraintExpression.fromAny(rhs);
    }
    const expression = rhs !== void 0 ? lhs.minus(rhs) : lhs;
    if (strength === void 0) {
      strength = ConstraintStrength.Required;
    } else {
      strength = ConstraintStrength.fromAny(strength);
    }
    const constraint = new Constraint(this, expression, relation, strength);
    this.addConstraint(constraint);
    return constraint;
  }

  hasConstraint(constraint: Constraint): boolean {
    return this.constraints.has(constraint);
  }

  addConstraint(constraint: Constraint): void {
    if (this.constraints.has(constraint)) {
      return;
    }

    const terms = constraint.expression.terms;
    for (let i = 0, n = terms.size; i < n; i += 1) {
      const variable = terms.getEntry(i)![0];
      variable.addConstraintCondition(constraint, this);
    }

    // Creating a row causes symbols to be reserved for the variables in the constraint.
    const {row, tag} = this.createRow(constraint);

    this.addConstraintRow(constraint, row, tag);
  }

  /** @internal */
  protected addConstraintRow(constraint: Constraint, row: ConstraintRow, tag: ConstraintTag): void {
    this.willAddConstraint(constraint);

    let subject = this.chooseSubject(row, tag);

    // If chooseSubject couldn't find a valid entering symbol, one last option
    // is available if the entire row is composed of dummy variables. If the
    // constant of the row is zero, then this represents redundant constraints
    // and the new dummy marker can enter the basis. If the constant is
    // non-zero, then it represents an unsatisfiable constraint.
    if (subject.isInvalid() && row.isDummy()) {
      if (Math.abs(row.constant) < Equivalent.Epsilon) {
        subject = tag.marker;
      } else {
        throw new Error("unsatisfiable constraint");
      }
    }

    // If an entering symbol still isn't found, then the row must be added
    // using an artificial variable. If that fails, then the row represents
    // an unsatisfiable constraint.
    if (subject.isInvalid()) {
      if (!this.addWithArtificialVariable(row)) {
        throw new Error("unsatisfiable constraint");
      }
    } else {
      row.setSymbol(subject);
      row.solveFor(subject);
      this.substitute(subject, row);
      this.rows.set(subject, row);
    }

    this.constraints.set(constraint, tag);

    // Optimizing after each constraint is added performs less aggregate work
    // due to a smaller average system size. It also ensures the solver remains
    // in a consistent state.
    this.optimize(this.objective);

    this.didAddConstraint(constraint);

    this.updateSolution();
  }

  protected willAddConstraint(constraint: Constraint): void {
    // hook
  }

  protected didAddConstraint(constraint: Constraint): void {
    // hook
  }

  removeConstraint(constraint: Constraint): void {
    const tag = this.constraints.get(constraint);
    if (tag === void 0) {
      return;
    }

    this.removeConstraintRow(constraint);

    const terms = constraint.expression.terms;
    for (let i = 0, n = terms.size; i < n; i += 1) {
      const variable = terms.getEntry(i)![0];
      variable.removeConstraintCondition(constraint, this);
    }
  }

  /** @internal */
  protected removeConstraintRow(constraint: Constraint): void {
    const tag = this.constraints.get(constraint);
    if (tag === void 0) {
      return;
    }

    this.willRemoveConstraint(constraint);

    this.constraints.remove(constraint);

    // Remove the error effects from the objective function *before* pivoting,
    // or substitutions into the objective will lead to incorrect solver results.
    this.removeConstraintEffects(constraint, tag);

    // If the marker is basic, simply drop the row. Otherwise pivot the marker
    // into the basis and then drop the row.
    const marker = tag.marker;
    if (this.rows.remove(marker) === void 0) {
      const leaving = this.getMarkerLeavingSymbol(marker);
      if (leaving.isInvalid()) {
        throw new Error("failed to find leaving row");
      }
      const row = this.rows.remove(leaving)!;
      row.solveForEx(leaving, marker);
      this.substitute(marker, row);
    }

    // Optimizing after each constraint is removed ensures that the solver
    // remains consistent. It makes the solver API easier to use at a small
    // tradeoff for speed.
    this.optimize(this.objective);

    this.didRemoveConstraint(constraint);

    this.updateSolution();
  }

  protected willRemoveConstraint(constraint: Constraint): void {
    // hook
  }

  protected didRemoveConstraint(constraint: Constraint): void {
    // hook
  }

  constraintVariable(name: string, value?: number, strength?: AnyConstraintStrength): ConstraintProperty<unknown, number> {
    if (value === void 0) {
      value = 0;
    }
    if (strength !== void 0) {
      strength = ConstraintStrength.fromAny(strength);
    } else {
      strength = ConstraintStrength.Strong;
    }
    const property = ConstraintProperty.create(this) as ConstraintProperty<unknown, number>;
    Object.defineProperty(property, "name", {
      value: name,
      configurable: true,
    });
    if (value !== void 0) {
      property.setValue(value);
    }
    property.setStrength(strength);
    property.mount();
    return property;
  }

  hasConstraintVariable(variable: ConstraintVariable): boolean {
    return this.constraintVariables.has(variable);
  }

  addConstraintVariable(variable: ConstraintVariable): void {
    if (this.constraintVariables.has(variable)) {
      return;
    }

    const strength = ConstraintStrength.clip(variable.strength);
    if (strength === ConstraintStrength.Required) {
      throw new Error("invalid variable strength");
    }

    this.willAddConstraintVariable(variable);

    const constraint = new Constraint(this, variable, "eq", strength);
    const {row, tag} = this.createRow(constraint);
    this.constraintVariables.set(variable, {constraint, tag, state: 0});

    this.addConstraintRow(constraint, row, tag);

    this.didAddConstraintVariable(variable);
  }

  protected willAddConstraintVariable(variable: ConstraintVariable): void {
    // hook
  }

  protected didAddConstraintVariable(variable: ConstraintVariable): void {
    // hook
  }

  removeConstraintVariable(variable: ConstraintVariable): void {
    const binding = this.constraintVariables.get(variable);
    if (binding === void 0) {
      return;
    }

    this.willRemoveConstraintVariable(variable);

    this.constraintVariables.remove(variable);
    this.removeConstraintRow(binding.constraint);

    this.didRemoveConstraintVariable(variable);
  }

  protected willRemoveConstraintVariable(variable: ConstraintVariable): void {
    // hook
  }

  protected didRemoveConstraintVariable(variable: ConstraintVariable): void {
    // hook
  }

  setConstraintVariable(variable: ConstraintVariable, newState: number): void {
    const binding = this.constraintVariables.get(variable);
    if (binding === void 0) {
      throw new Error("unbound variable");
    }

    const oldState = binding.state;
    if (oldState !== newState) {
      binding.state = newState;
      const delta = newState - oldState;

      this.willSetConstraintVariable(variable, newState, oldState);

      // Check first if the positive error variable is basic.
      const marker = binding.tag.marker;
      let row = this.rows.get(marker);
      if (row !== void 0) {
        if (row.add(-delta) < 0) {
          this.infeasible.push(marker);
        }
        this.dualOptimize();
        return;
      }

      // Check next if the negative error variable is basic.
      const other = binding.tag.other;
      row = this.rows.get(other);
      if (row !== void 0) {
        if (row.add(delta) < 0) {
          this.infeasible.push(other);
        }
        this.dualOptimize();
        return;
      }

      // Otherwise update each row where the error variables exist.
      for (let i = 0, n = this.rows.size; i < n; i += 1) {
        const [symbol, row] = this.rows.getEntry(i)!;
        const coefficient = row.coefficientFor(marker);
        if (coefficient !== 0 && row.add(delta * coefficient) < 0 && !symbol.isExternal()) {
          this.infeasible.push(symbol);
        }
      }
      this.dualOptimize();

      this.didSetConstraintVariable(variable, newState, oldState);

      this.updateSolution();
    }
  }

  protected willSetConstraintVariable(variable: ConstraintVariable, newState: number, oldState: number): void {
    // hook
  }

  protected didSetConstraintVariable(variable: ConstraintVariable, newState: number, oldState: number): void {
    // hook
  }

  /** @internal */
  invalidate(symbol: ConstraintSymbol, row: ConstraintRow | null = null): void {
    if (symbol.isExternal()) {
      this.invalidated.set(symbol, row);
    }
  }

  /** @internal */
  updateSolution(): void {
    const invalidated = this.invalidated;
    if (!invalidated.isEmpty()) {
      (this as Mutable<this>).invalidated = new ConstraintMap();
      for (let i = 0, n = invalidated.size; i < n; i += 1) {
        const symbol = invalidated.getEntry(i)![0];
        const row = this.rows.get(symbol);
        if (row !== void 0) {
          symbol.updateConstraintSolution(row.constant);
        }
      }
    }
  }

  // Returns a new row for the given constraint.
  //
  // The terms in the constraint will be converted to cells in the row.
  // Any term in the constraint with a coefficient of zero is ignored.
  // If the symbol for a given cell variable is basic, the cell variable
  // will be substituted with the basic row.
  //
  // The necessary slack and error variables will be added to the row.
  // If the constant for the row is negative, the sign for the row will
  // be inverted so the constant becomes positive.
  private createRow(constraint: Constraint): {row: ConstraintRow, tag: ConstraintTag} {
    const expression = constraint.expression;
    const row = new ConstraintRow(this, null, new ConstraintMap(), expression.constant);

    // Substitute the current basic variables into the row.
    const terms = expression.terms;
    for (let i = 0, n = terms.size; i < n; i += 1) {
      const [variable, coefficient] = terms.getEntry(i)!;
      if (Math.abs(coefficient) >= Equivalent.Epsilon) {
        const basic = this.rows.get(variable);
        if (basic !== void 0) {
          row.insertRow(basic, coefficient);
        } else {
          row.insertSymbol(variable, coefficient);
        }
      }
    }

    // Add the necessary slack, error, and dummy variables.
    const objective = this.objective;
    const relation = constraint.relation;
    const strength = constraint.strength;
    const tag = {marker: ConstraintSymbol.invalid, other: ConstraintSymbol.invalid};
    if (relation === "le" || relation === "ge") {
      const coefficient = relation === "le" ? 1 : -1;
      const slack = new ConstraintSlack();
      tag.marker = slack;
      row.insertSymbol(slack, coefficient);
      if (strength < ConstraintStrength.Required) {
        const error = new ConstraintError();
        tag.other = error;
        row.insertSymbol(error, -coefficient);
        objective.insertSymbol(error, strength);
      }
    } else {
      if (strength < ConstraintStrength.Required) {
        const eplus = new ConstraintError();
        const eminus = new ConstraintError();
        tag.marker = eplus;
        tag.other = eminus;
        row.insertSymbol(eplus, -1); // v = eplus - eminus
        row.insertSymbol(eminus, 1); // v - eplus + eminus = 0
        objective.insertSymbol(eplus, strength);
        objective.insertSymbol(eminus, strength);
      } else {
        const dummy = new ConstraintDummy();
        tag.marker = dummy;
        row.insertSymbol(dummy);
      }
    }

    // Ensure the row has a positive constant.
    if (row.constant < 0) {
      row.negate();
    }

    return {row, tag};
  }

  // Returns the symbol to use for solving for the row.
  //
  // This method will choose the best subject to use as the solve target for
  // the row. An invalid symbol will be returned if there is no valid target.
  //
  // The symbols are chosen according to the following precedence:
  //
  // 1) The first symbol representing an external variable.
  // 2) A negative slack or error tag variable.
  //
  // If a subject cannot be found, an invalid symbol will be returned.
  private chooseSubject(row: ConstraintRow, tag: ConstraintTag): ConstraintSymbol {
    for (let i = 0, n = row.cells.size; i < n; i += 1) {
      const symbol = row.cells.getEntry(i)![0];
      if (symbol.isExternal()) {
        return symbol;
      }
    }
    if (tag.marker instanceof ConstraintSlack || tag.marker instanceof ConstraintError) {
      if (row.coefficientFor(tag.marker) < 0) {
        return tag.marker;
      }
    }
    if (tag.other instanceof ConstraintSlack || tag.other instanceof ConstraintError) {
      if (row.coefficientFor(tag.other) < 0) {
        return tag.other;
      }
    }
    return ConstraintSymbol.invalid;
  }

  // Adds the row to the tableau using an artificial variable; returns `false`
  // if the constraint cannot be satisfied.
  private addWithArtificialVariable(row: ConstraintRow): boolean {
    // Create and add the artificial variable to the tableau.
    const artificial = new ConstraintSlack();
    this.rows.set(artificial, row.clone());
    (this as Mutable<this>).artificial = row.clone();

    // Optimize the artificial objective. This is successful
    // only if the artificial objective is optimized to zero.
    this.optimize(this.artificial!);
    const success = Math.abs(this.artificial!.constant) < Equivalent.Epsilon;
    (this as Mutable<this>).artificial = null;

    // If the artificial variable is basic, pivot the row so that
    // it becomes non-basic. If the row is constant, exit early.
    const basic = this.rows.remove(artificial);
    if (basic !== void 0) {
      if (basic.isConstant()) {
        return success;
      }
      const entering = this.anyPivotableSymbol(basic);
      if (entering.isInvalid()) {
        return false; // unsatisfiable (will this ever happen?)
      }
      basic.setSymbol(entering);
      basic.solveForEx(artificial, entering);
      this.substitute(entering, basic);
      this.rows.set(entering, basic);
    }

    // Remove the artificial variable from the tableau.
    for (let i = 0, n = this.rows.size; i < n; i += 1) {
      this.rows.getEntry(i)![1].removeSymbol(artificial);
    }
    this.objective.removeSymbol(artificial);
    return success;
  }

  // Substitutues all instances of the parametric symbol in the tableau
  // and the objective function with the given row.
  private substitute(symbol: ConstraintSymbol, row: ConstraintRow): void {
    for (let i = 0, n = this.rows.size; i < n; i += 1) {
      const [key, value] = this.rows.getEntry(i)!;
      value.substitute(symbol, row);
      if (value.constant < 0 && !key.isExternal()) {
        this.infeasible.push(key);
      }
    }
    this.objective.substitute(symbol, row);
    if (this.artificial !== null) {
      this.artificial.substitute(symbol, row);
    }
  }

  // Optimizes the system for the given objective function.
  //
  // Performs iterations of Phase 2 of the simplex method until the objective
  // function reaches a minimum.
  private optimize(objective: ConstraintRow): void {
    do {
      const entering = this.getEnteringSymbol(objective);
      if (entering.isInvalid()) {
        return;
      }
      const leaving = this.getLeavingSymbol(entering);
      if (leaving.isInvalid()) {
        throw new Error("objective is unbounded");
      }
      // Pivot the entering symbol into the basis.
      const row = this.rows.remove(leaving)!;
      row.setSymbol(entering);
      row.solveForEx(leaving, entering);
      this.substitute(entering, row);
      this.rows.set(entering, row);
    } while (true);
  }

  // Optimizes the system using the dual of the simplex method.
  //
  // The current state of the system should be such that the objective
  // function is optimal, but not feasible. This method will perform
  // an iteration of the dual simplex method to make the solution both
  // optimal and feasible.
  private dualOptimize(): void {
    let leaving: ConstraintSymbol | undefined;
    while ((leaving = this.infeasible.pop(), leaving !== void 0)) {
      const row = this.rows.get(leaving);
      if (row !== void 0 && row.constant < 0) {
        const entering = this.getDualEnteringSymbol(row);
        if (entering.isInvalid()) {
          throw new Error("dual optimize failed");
        }
        // Pivot the entering symbol into the basis.
        this.rows.remove(leaving);
        row.setSymbol(entering);
        row.solveForEx(leaving, entering);
        this.substitute(entering, row);
        this.rows.set(entering, row);
      }
    }
  }

  // Returns the entering variable for a pivot operation.
  //
  // Returns the first symbol in the objective function which is non-dummy and
  // has a coefficient less than zero. If no symbol meets the criteria then the
  // objective function is at a minimum, and an invalid symbol is returned.
  private getEnteringSymbol(objective: ConstraintRow): ConstraintSymbol {
    for (let i = 0, n = objective.cells.size; i < n; i += 1) {
      const [symbol, value] = objective.cells.getEntry(i)!;
      if (value < 0 && !symbol.isDummy()) {
        return symbol;
      }
    }
    return ConstraintSymbol.invalid;
  }

  // Returns the entering symbol for the dual optimize operation.
  //
  // Returns the symbol in the row which has a positive coefficient and yields
  // the minimum ratio for its respective symbol in the objective function.
  // The provided row *must* be infeasible. If no symbol is found which meets
  // the criteria, an invalid symbol is returned.
  private getDualEnteringSymbol(row: ConstraintRow): ConstraintSymbol {
    let ratio = Number.MAX_VALUE;
    let entering = ConstraintSymbol.invalid;
    for (let i = 0, n = row.cells.size; i < n; i += 1) {
      const [symbol, value] = row.cells.getEntry(i)!;
      if (value > 0 && !symbol.isDummy()) {
        const coefficient = this.objective.coefficientFor(symbol);
        const coratio = coefficient / value;
        if (coratio < ratio) {
          ratio = coratio;
          entering = symbol;
        }
      }
    }
    return entering;
  }

  // Returns the symbol for the pivot exit row. If no appropriate exit symbol
  // is found, an invalid symbol will be returned, indicating that the
  // objective function is unbounded.
  private getLeavingSymbol(entering: ConstraintSymbol): ConstraintSymbol {
    let ratio = Number.MAX_VALUE;
    let found = ConstraintSymbol.invalid;
    for (let i = 0, n = this.rows.size; i < n; i += 1) {
      const [symbol, row] = this.rows.getEntry(i)!;
      if (!symbol.isExternal()) {
        const coefficient = row.coefficientFor(entering);
        if (coefficient < 0) {
          const coratio = -row.constant / coefficient;
          if (coratio < ratio) {
            ratio = coratio;
            found = symbol;
          }
        }
      }
    }
    return found;
  }

  // Returns a symbol corresponding to a basic row which holds the given marker
  // variable. The row will be chosen according to the following precedence:
  //
  // 1) The row with a restricted basic varible and a negative coefficient
  //    for the marker with the smallest ratio of `-constant / coefficient`.
  // 2) The row with a restricted basic variable and the smallest ratio of
  //    `constant / coefficient`.
  // 3) The last unrestricted row which contains the marker.
  //
  // If the marker does not exist in any row, an invalid symbol will be
  // returned, indicating an internal solver error since the marker *should*
  // exist somewhere in the tableau.
  private getMarkerLeavingSymbol(marker: ConstraintSymbol): ConstraintSymbol {
    let r1 = Number.MAX_VALUE;
    let r2 = Number.MAX_VALUE;
    let first = ConstraintSymbol.invalid;
    let second = ConstraintSymbol.invalid;
    let third = ConstraintSymbol.invalid;
    for (let i = 0, n = this.rows.size; i < n; i += 1) {
      const [symbol, row] = this.rows.getEntry(i)!;
      const coefficient = row.coefficientFor(marker);
      if (coefficient === 0) {
        continue;
      }
      if (symbol.isExternal()) {
        third = symbol;
      } else if (coefficient < 0) {
        const ratio = -row.constant / coefficient;
        if (ratio < r1) {
          r1 = ratio;
          first = symbol;
        }
      } else {
        const ratio = row.constant / coefficient;
        if (ratio < r2) {
          r2 = ratio;
          second = symbol;
        }
      }
    }
    if (!first.isInvalid()) {
      return first;
    } else if (!second.isInvalid()) {
      return second;
    } else {
      return third;
    }
  }

  // Removes the effects of a constraint on the objective function.
  private removeConstraintEffects(constraint: Constraint, tag: ConstraintTag): void {
    if (tag.marker instanceof ConstraintError) {
      this.removeMarkerEffects(tag.marker, constraint.strength);
    }
    if (tag.other instanceof ConstraintError) {
      this.removeMarkerEffects(tag.other, constraint.strength);
    }
  }

  // Removes the effects of an error marker on the objective function.
  private removeMarkerEffects(marker: ConstraintSymbol, strength: ConstraintStrength): void {
    const row = this.rows.get(marker);
    if (row !== void 0) {
      this.objective.insertRow(row, -strength);
    } else {
      this.objective.insertSymbol(marker, -strength);
    }
  }

  // Returns the first Slack or Error symbol in the row. If no such symbol
  // is present, an invalid symbol will be returned.
  private anyPivotableSymbol(row: ConstraintRow): ConstraintSymbol {
    for (let i = 0, n = row.cells.size; i < n; i += 1) {
      const symbol = row.cells.getEntry(i)![0];
      if (symbol instanceof ConstraintSlack || symbol instanceof ConstraintError) {
        return symbol;
      }
    }
    return ConstraintSymbol.invalid;
  }
}
