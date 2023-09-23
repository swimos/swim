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

import type {Mutable} from "@swim/util";
import type {ConstraintExpressionLike} from "./ConstraintExpression";
import {ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintRelation} from "./Constraint";
import type {ConstraintStrengthLike} from "./Constraint";
import {ConstraintStrength} from "./Constraint";
import {Constraint} from "./Constraint";
import type {ConstraintScope} from "./ConstraintScope";

/** @beta */
export class ConstraintGroup {
  constructor(scope: ConstraintScope) {
    this.scope = scope;
    this.constraints = [];
    this.constrained = false;
  }

  readonly scope: ConstraintScope;

  constraint(lhs: ConstraintExpressionLike, relation: ConstraintRelation,
             rhs?: ConstraintExpressionLike, strength?: ConstraintStrengthLike): Constraint {
    lhs = ConstraintExpression.fromLike(lhs);
    rhs = ConstraintExpression.fromLike(rhs);
    const expression = rhs !== void 0 ? lhs.minus(rhs) : lhs;
    if (strength === void 0) {
      strength = ConstraintStrength.Required;
    } else {
      strength = ConstraintStrength.fromLike(strength);
    }
    const constraint = new Constraint(this.scope, expression, relation, strength);
    this.addConstraint(constraint);
    return constraint;
  }

  readonly constraints: readonly Constraint[];

  hasConstraint(constraint: Constraint): boolean {
    const constraints = this.constraints;
    return constraints.indexOf(constraint) >= 0;
  }

  addConstraint(constraint: Constraint): void {
    const constraints = this.constraints as Constraint[];
    if (constraints.indexOf(constraint) < 0) {
      constraints.push(constraint);
      constraint.constrain(this.constrained);
    }
  }

  removeConstraint(constraint: Constraint): void {
    const constraints = this.constraints as Constraint[];
    if (constraints === void 0) {
      return;
    }
    const index = constraints.indexOf(constraint);
    if (index >= 0) {
      constraints.splice(index, 1);
      constraint.constrain(false);
    }
  }

  /** @internal */
  enableConstraints(): void {
    const constraints = this.constraints;
    for (let i = 0; i < constraints.length; i += 1) {
      constraints[i]!.constrain(true);
    }
  }

  /** @internal */
  disableConstraints(): void {
    const constraints = this.constraints;
    for (let i = 0; i < constraints.length; i += 1) {
      constraints[i]!.constrain(false);
    }
  }

  /** @internal */
  readonly constrained: boolean;

  isConstrained(): boolean {
    return this.constrained;
  }

  constrain(constrained: boolean = true): this {
    if (constrained && !this.constrained) {
      (this as Mutable<this>).constrained = true;
      this.enableConstraints();
    } else if (!constrained && this.constrained) {
      (this as Mutable<this>).constrained = false;
      this.disableConstraints();
    }
    return this;
  }
}
