// Copyright 2015-2022 Swim.inc
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
import type {ConstraintVariable} from "./ConstraintVariable";

/** @public */
export class ConstraintSum implements ConstraintExpression, Debug {
  constructor(terms: ConstraintMap<ConstraintVariable, number>, constant: number) {
    this.terms = terms;
    this.constant = constant;
  }

  isConstant(): boolean {
    return this.terms.isEmpty();
  }

  readonly terms: ConstraintMap<ConstraintVariable, number>;

  readonly constant: number;

  plus(that: AnyConstraintExpression): ConstraintExpression {
    return ConstraintExpression.sum(this, that);
  }

  negative(): ConstraintExpression {
    const oldTerms = this.terms;
    const newTerms = new ConstraintMap<ConstraintVariable, number>();
    for (let i = 0, n = oldTerms.size; i < n; i += 1) {
      const [variable, coefficient] = oldTerms.getEntry(i)!;
      newTerms.set(variable, -coefficient);
    }
    return new ConstraintSum(newTerms, -this.constant);
  }

  minus(that: AnyConstraintExpression): ConstraintExpression {
    if (typeof that === "number") {
      that = ConstraintExpression.constant(that);
    } else {
      that = that.negative();
    }
    return ConstraintExpression.sum(this, that);
  }

  times(scalar: number): ConstraintExpression {
    const oldTerms = this.terms;
    const newTerms = new ConstraintMap<ConstraintVariable, number>();
    for (let i = 0, n = oldTerms.size; i < n; i += 1) {
      const [variable, coefficient] = oldTerms.getEntry(i)!;
      newTerms.set(variable, coefficient * scalar);
    }
    return new ConstraintSum(newTerms, this.constant * scalar);
  }

  divide(scalar: number): ConstraintExpression {
    const oldTerms = this.terms;
    const newTerms = new ConstraintMap<ConstraintVariable, number>();
    for (let i = 0, n = oldTerms.size; i < n; i += 1) {
      const [variable, coefficient] = oldTerms.getEntry(i)!;
      newTerms.set(variable, coefficient / scalar);
    }
    return new ConstraintSum(newTerms, this.constant / scalar);
  }

  debug<T>(output: Output<T>): Output<T> {
    output = output.write("ConstraintExpression").write(46/*'.'*/).write("sum").write(40/*'('*/);
    const n = this.terms.size;
    for (let i = 0; i < n; i += 1) {
      const [variable, coefficient] = this.terms.getEntry(i)!;
      if (i > 0) {
        output = output.write(", ");
      }
      if (coefficient === 1) {
        output = output.debug(variable);
      } else {
        output = output.debug(ConstraintExpression.product(coefficient, variable));
      }
    }
    if (this.constant !== 0) {
      if (n > 0) {
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
