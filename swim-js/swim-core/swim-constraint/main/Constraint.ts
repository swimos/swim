// Copyright 2015-2024 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintScope} from "./ConstraintScope";

/** @public */
export type ConstraintRelation = "le" | "eq" | "ge";

/** @public */
export type ConstraintStrengthLike = ConstraintStrength | ConstraintStrengthInit;

/** @public */
export type ConstraintStrengthInit = "required" | "strong" | "medium" | "weak";

/** @public */
export type ConstraintStrength = number;

/** @public */
export const ConstraintStrength: {
  readonly Required: ConstraintStrength;
  readonly Strong: ConstraintStrength;
  readonly Medium: ConstraintStrength;
  readonly Weak: ConstraintStrength;
  readonly Unbound: ConstraintStrength;

  clip(strength: ConstraintStrength): ConstraintStrength;

  fromLike<T extends ConstraintStrengthLike | null | undefined>(strength: T): ConstraintStrength | Uninitable<T>;
} = {
  Required: 1001001000,
  Strong: 1000000,
  Medium: 1000,
  Weak: 1,
  Unbound: -1,

  clip(strength: ConstraintStrength): ConstraintStrength {
    return Math.min(Math.max(0, strength), ConstraintStrength.Required);
  },

  fromLike<T extends ConstraintStrengthLike | null | undefined>(strength: T): ConstraintStrength | Uninitable<T> {
    if (strength === void 0 || strength === null) {
      return strength as ConstraintStrength | Uninitable<T>;
    } else if (typeof strength === "number") {
      return ConstraintStrength.clip(strength);
    } else if (strength === "required") {
      return ConstraintStrength.Required;
    } else if (strength === "strong") {
      return ConstraintStrength.Strong;
    } else if (strength === "medium") {
      return ConstraintStrength.Medium;
    } else if (strength === "weak") {
      return ConstraintStrength.Weak;
    }
    throw new TypeError("" + strength);
  },
};

/** @public */
export class Constraint implements Debug {
  constructor(scope: ConstraintScope, expression: ConstraintExpression,
              relation: ConstraintRelation, strength: ConstraintStrength) {
    this.scope = scope;
    this.expression = expression;
    this.relation = relation;
    this.strength = strength;
  }

  readonly scope: ConstraintScope;

  readonly expression: ConstraintExpression;

  readonly relation: ConstraintRelation;

  readonly strength: ConstraintStrength;

  isConstrained(): boolean {
    return this.scope.hasConstraint(this);
  }

  constrain(constrained: boolean = true): this {
    if (constrained) {
      this.scope.addConstraint(this);
    } else {
      this.scope.removeConstraint(this);
    }
    return this;
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.debug(this.scope).write(46/*'.'*/).write("constraint").write(40/*'('*/)
                   .debug(this.expression).write(", ").debug(this.relation).write(", ")
                   .debug(void 0).write(", ");
    if (this.strength === ConstraintStrength.Required) {
      output = output.debug("required");
    } else if (this.strength === ConstraintStrength.Strong) {
      output = output.debug("strong");
    } else if (this.strength === ConstraintStrength.Medium) {
      output = output.debug("medium");
    } else if (this.strength === ConstraintStrength.Weak) {
      output = output.debug("weak");
    } else {
      output = output.debug(this.strength);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }
}
