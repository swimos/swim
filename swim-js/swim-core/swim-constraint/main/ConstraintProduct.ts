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

import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {ConstraintExpressionLike} from "./ConstraintExpression";
import {ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintTerm} from "./ConstraintTerm";
import type {ConstraintVariable} from "./ConstraintVariable";

/** @public */
export class ConstraintProduct implements ConstraintTerm, Debug {
  constructor(coefficient: number, variable: ConstraintVariable) {
    this.coefficient = coefficient;
    this.variable = variable;
  }

  isConstant(): boolean {
    return false;
  }

  readonly coefficient: number;

  readonly variable: ConstraintVariable;

  get terms(): ReadonlyMap<ConstraintVariable, number> {
    const terms = new Map<ConstraintVariable, number>();
    terms.set(this.variable, this.coefficient);
    return terms;
  }

  get constant(): number {
    return 0;
  }

  plus(that: ConstraintExpressionLike): ConstraintExpression {
    that = ConstraintExpression.fromLike(that);
    if (that instanceof ConstraintProduct && this.variable === that.variable) {
      return ConstraintExpression.product(this.coefficient + that.coefficient, this.variable);
    } else if (this.variable === that) {
      return ConstraintExpression.product(this.coefficient + 1, this.variable);
    }
    return ConstraintExpression.sum(this, that);
  }

  negative(): ConstraintTerm {
    return ConstraintExpression.product(-this.coefficient, this.variable);
  }

  minus(that: ConstraintExpressionLike): ConstraintExpression {
    that = ConstraintExpression.fromLike(that);
    if (that instanceof ConstraintProduct && this.variable === that.variable) {
      return ConstraintExpression.product(this.coefficient - that.coefficient, this.variable);
    } else if (this.variable === that) {
      return ConstraintExpression.product(this.coefficient - 1, this.variable);
    }
    return ConstraintExpression.sum(this, that.negative());
  }

  times(scalar: number): ConstraintExpression {
    return ConstraintExpression.product(this.coefficient * scalar, this.variable);
  }

  divide(scalar: number): ConstraintExpression {
    return ConstraintExpression.product(this.coefficient / scalar, this.variable);
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("ConstraintExpression").write(46/*'.'*/).write("product").write(40/*'('*/)
                   .debug(this.coefficient).write(", ").debug(this.variable).write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }
}
