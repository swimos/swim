// Copyright 2015-2020 Swim inc.
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
import {ConstraintRelation} from "./ConstraintRelation";
import {AnyConstraintStrength, ConstraintStrength} from "./ConstraintStrength";
import {Constraint} from "./Constraint";
import {ConstraintScope} from "./ConstraintScope";

export class ConstraintGroup {
  /** @hidden */
  readonly _scope: ConstraintScope;
  /** @hidden */
  readonly _constraints: Constraint[];
  /** @hidden */
  _enabled: boolean;

  constructor(scope: ConstraintScope) {
    this._scope = scope;
    this._constraints = [];
    this._enabled = false;
  }

  get scope(): ConstraintScope {
    return this._scope;
  }

  constraint(lhs: Constrain | number, relation: ConstraintRelation,
             rhs?: Constrain | number, strength?: AnyConstraintStrength): Constraint {
    if (typeof lhs === "number") {
      lhs = Constrain.constant(lhs);
    }
    if (typeof rhs === "number") {
      rhs = Constrain.constant(rhs);
    }
    const constrain = rhs !== void 0 ? lhs.minus(rhs) : lhs;
    if (strength === void 0) {
      strength = ConstraintStrength.Required;
    } else {
      strength = ConstraintStrength.fromAny(strength);
    }
    const constraint = new Constraint(this._scope, constrain, relation, strength);
    this.addConstraint(constraint);
    return constraint;
  }

  get constraints(): ReadonlyArray<Constraint> {
    return this._constraints;
  }

  hasConstraint(constraint: Constraint): boolean {
    const constraints = this._constraints;
    return constraints !== void 0 && constraints.indexOf(constraint) >= 0;
  }

  addConstraint(constraint: Constraint): void {
    const constraints = this._constraints;
    if (constraints.indexOf(constraint) < 0) {
      constraints.push(constraint);
      constraint.enabled(this._enabled);
    }
  }

  removeConstraint(constraint: Constraint): void {
    const constraints = this._constraints;
    if (constraints !== void 0) {
      const index = constraints.indexOf(constraint);
      if (index >= 0) {
        constraints.splice(index, 1);
        constraint.enabled(false);
      }
    }
  }

  /** @hidden */
  enableConstraints(): void {
    const constraints = this._constraints;
    for (let i = 0, n = constraints.length ; i < n; i += 1) {
      constraints[i].enabled(true);
    }
  }

  /** @hidden */
  disableConstraints(): void {
    const constraints = this._constraints;
    for (let i = 0, n = constraints.length ; i < n; i += 1) {
      constraints[i].enabled(false);
    }
  }

  enabled(): boolean;
  enabled(enabled: boolean): this;
  enabled(enabled?: boolean): boolean | this {
    if (enabled === void 0) {
      return this._enabled;
    } else {
      if (enabled && !this._enabled) {
        this._enabled = true;
        this.enableConstraints();
      } else if (!enabled && this._enabled) {
        this._enabled = false;
        this.disableConstraints();
      }
      return this;
    }
  }
}
