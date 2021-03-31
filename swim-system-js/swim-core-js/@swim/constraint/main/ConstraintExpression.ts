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

import {ConstraintMap} from "./ConstraintMap";
import type {ConstraintVariable} from "./ConstraintVariable";
import {ConstraintSum} from "./"; // forward import
import {ConstraintTerm} from "./"; // forward import
import {ConstraintProduct} from "./"; // forward import
import {ConstraintConstant} from "./"; // forward import

export type AnyConstraintExpression = ConstraintExpression | number;

export interface ConstraintExpression {
  readonly terms: ConstraintMap<ConstraintVariable, number>;

  readonly constant: number;

  isConstant(): boolean;

  plus(that: AnyConstraintExpression): ConstraintExpression;

  negative(): ConstraintExpression;

  minus(that: AnyConstraintExpression): ConstraintExpression;

  times(scalar: number): ConstraintExpression;

  divide(scalar: number): ConstraintExpression;
}

export const ConstraintExpression = {} as {
  fromAny(value: AnyConstraintExpression): ConstraintExpression;

  sum(...expressions: AnyConstraintExpression[]): ConstraintSum;

  product(coefficient: number, variable: ConstraintVariable): ConstraintProduct;

  constant(value: number): ConstraintConstant;

  readonly zero: ConstraintConstant; // defined by ConstraintConstant
};

ConstraintExpression.fromAny = function (value: AnyConstraintExpression): ConstraintExpression {
  if (typeof value === "number") {
    return ConstraintExpression.constant(value);
  } else {
    return value;
  }
};

ConstraintExpression.sum = function (...expressions: AnyConstraintExpression[]): ConstraintSum {
  const terms = new ConstraintMap<ConstraintVariable, number>();
  let constant = 0;
  for (let i = 0, n = expressions.length; i < n; i += 1) {
    const expression = expressions[i]!;
    if (typeof expression === "number") {
      constant += expression;
    } else if (ConstraintTerm.is(expression)) {
      const variable = expression.variable;
      if (variable !== null) {
        const field = terms.getField(variable);
        if (field !== void 0) {
          field[1] += expression.coefficient;
        } else {
          terms.set(variable, expression.coefficient);
        }
      } else {
        constant += expression.constant;
      }
    } else {
      const subterms = expression.terms;
      for (let j = 0, k = subterms.size; j < k; j += 1) {
        const [variable, coefficient] = subterms.getEntry(j)!;
        const field = terms.getField(variable);
        if (field !== void 0) {
          field[1] += coefficient;
        } else {
          terms.set(variable, coefficient);
        }
      }
      constant += expression.constant;
    }
  }
  return new ConstraintSum(terms, constant);
};

ConstraintExpression.product = function (coefficient: number, variable: ConstraintVariable): ConstraintProduct {
  return new ConstraintProduct(coefficient, variable);
};

ConstraintExpression.constant = function (value: number): ConstraintConstant {
  if (value === 0) {
    return ConstraintExpression.zero;
  } else {
    return new ConstraintConstant(value);
  }
};
