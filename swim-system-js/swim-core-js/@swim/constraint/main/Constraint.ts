// Copyright 2015-2021 Swim inc.
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

import {Output, Debug, Format} from "@swim/codec";
import {ConstraintKey} from "./ConstraintKey";
import type {ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintRelation} from "./ConstraintRelation";
import {ConstraintStrength} from "./ConstraintStrength";
import type {ConstraintScope} from "./ConstraintScope";

export class Constraint implements ConstraintKey, Debug {
  constructor(scope: ConstraintScope, expression: ConstraintExpression,
              relation: ConstraintRelation, strength: ConstraintStrength) {
    Object.defineProperty(this, "id", {
      value: ConstraintKey.nextId(),
      enumerable: true,
    });
    Object.defineProperty(this, "scope", {
      value: scope,
      enumerable: true,
    });
    Object.defineProperty(this, "expression", {
      value: expression,
      enumerable: true,
    });
    Object.defineProperty(this, "relation", {
      value: relation,
      enumerable: true,
    });
    Object.defineProperty(this, "strength", {
      value: strength,
      enumerable: true,
    });
  }

  readonly id!: number;

  readonly scope!: ConstraintScope;

  readonly expression!: ConstraintExpression;

  readonly relation!: ConstraintRelation;

  readonly strength!: ConstraintStrength;

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

  debug(output: Output): void {
    output = output.debug(this.scope).write(46/*'.'*/).write("constraint").write(40/*'('*/)
        .debug(this.expression).write(", ").debug(this.relation).write(", ").debug(void 0).write(", ");
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
  }

  toString(): string {
    return Format.debug(this);
  }
}
