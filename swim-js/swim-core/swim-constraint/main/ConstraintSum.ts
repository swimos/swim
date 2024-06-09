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

import type {Output} from "@swim/codec";
import type {Debug} from "@swim/codec";
import {Format} from "@swim/codec";
import type {ConstraintExpressionLike} from "./ConstraintExpression";
import {ConstraintExpression} from "./ConstraintExpression";
import type {ConstraintVariable} from "./ConstraintVariable";

/** @public */
export class ConstraintSum implements ConstraintExpression, Debug {
  constructor(terms: ReadonlyMap<ConstraintVariable, number>, constant: number) {
    this.terms = terms;
    this.constant = constant;
  }

  isConstant(): boolean {
    return this.terms.size === 0;
  }

  readonly terms: ReadonlyMap<ConstraintVariable, number>;

  readonly constant: number;

  plus(that: ConstraintExpressionLike): ConstraintExpression {
    return ConstraintExpression.sum(this, that);
  }

  negative(): ConstraintExpression {
    const terms = new Map<ConstraintVariable, number>();
    for (const [variable, coefficient] of this.terms) {
      terms.set(variable, -coefficient);
    }
    return new ConstraintSum(terms, -this.constant);
  }

  minus(that: ConstraintExpressionLike): ConstraintExpression {
    that = ConstraintExpression.fromLike(that).negative();
    return ConstraintExpression.sum(this, that);
  }

  times(scalar: number): ConstraintExpression {
    const terms = new Map<ConstraintVariable, number>();
    for (const [variable, coefficient] of this.terms) {
      terms.set(variable, coefficient * scalar);
    }
    return new ConstraintSum(terms, this.constant * scalar);
  }

  divide(scalar: number): ConstraintExpression {
    const terms = new Map<ConstraintVariable, number>();
    for (const [variable, coefficient] of this.terms) {
      terms.set(variable, coefficient / scalar);
    }
    return new ConstraintSum(terms, this.constant / scalar);
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("ConstraintExpression").write(46/*'.'*/).write("sum").write(40/*'('*/);
    let i = 0;
    for (const [variable, coefficient] of this.terms) {
      if (i > 0) {
        output = output.write(", ");
      }
      if (coefficient === 1) {
        output = output.debug(variable);
      } else {
        output = output.debug(ConstraintExpression.product(coefficient, variable));
      }
      i += 1;
    }
    if (this.constant !== 0) {
      if (i !== 0) {
        output = output.write(", ");
      }
      output = output.debug(this.constant);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  toString(): string {
    return Format.debug(this);
  }
}
