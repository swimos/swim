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
import {ConstraintMap} from "./ConstraintMap";
import {AnyConstraintExpression, ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintTerm} from "./ConstraintTerm";
import type {ConstraintVariable} from "./ConstraintVariable";

/** @hidden */
export class ConstraintProduct implements ConstraintTerm, Debug {
  constructor(coefficient: number, variable: ConstraintVariable) {
    Object.defineProperty(this, "coefficient", {
      value: coefficient,
      enumerable: true,
    });
    Object.defineProperty(this, "variable", {
      value: variable,
      enumerable: true,
    });
  }

  isConstant(): boolean {
    return false;
  }

  readonly coefficient!: number;

  readonly variable!: ConstraintVariable;

  get terms(): ConstraintMap<ConstraintVariable, number> {
    const terms = new ConstraintMap<ConstraintVariable, number>();
    terms.set(this.variable, this.coefficient);
    return terms;
  }

  get constant(): number {
    return 0;
  }

  plus(that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (that instanceof ConstraintProduct && this.variable === that.variable) {
      return ConstraintExpression.product(this.coefficient + that.coefficient, this.variable);
    } else if (this.variable === that) {
      return ConstraintExpression.product(this.coefficient + 1, this.variable);
    } else {
      return ConstraintExpression.sum(this, that);
    }
  }

  negative(): ConstraintTerm {
    return ConstraintExpression.product(-this.coefficient, this.variable);
  }

  minus(that: AnyConstraintExpression): ConstraintExpression {
    that = ConstraintExpression.fromAny(that);
    if (that instanceof ConstraintProduct && this.variable === that.variable) {
      return ConstraintExpression.product(this.coefficient - that.coefficient, this.variable);
    } else if (this.variable === that) {
      return ConstraintExpression.product(this.coefficient - 1, this.variable);
    } else {
      return ConstraintExpression.sum(this, that.negative());
    }
  }

  times(scalar: number): ConstraintExpression {
    return ConstraintExpression.product(this.coefficient * scalar, this.variable);
  }

  divide(scalar: number): ConstraintExpression {
    return ConstraintExpression.product(this.coefficient / scalar, this.variable);
  }

  debug(output: Output): void {
    output = output.write("ConstraintExpression").write(46/*'.'*/).write("product").write(40/*'('*/)
        .debug(this.coefficient).write(", ").debug(this.variable).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }
}
