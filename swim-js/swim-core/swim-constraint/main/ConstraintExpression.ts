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

import type {Uninitable} from "@swim/util";
import {Lazy} from "@swim/util";
import {Objects} from "@swim/util";
import type {ConstraintVariable} from "./ConstraintVariable";
import {ConstraintSum} from "./"; // forward import
import {ConstraintTerm} from "./"; // forward import
import {ConstraintProduct} from "./"; // forward import
import {ConstraintConstant} from "./"; // forward import

/** @public */
export type ConstraintExpressionLike = ConstraintExpression | number;

/** @public */
export const ConstraintExpressionLike = {
  [Symbol.hasInstance](instance: unknown): instance is ConstraintExpressionLike {
    return ConstraintExpression[Symbol.hasInstance](instance)
        || typeof instance === "number";
  },
};

/** @public */
export interface ConstraintExpression {
  readonly terms: ReadonlyMap<ConstraintVariable, number>;

  readonly constant: number;

  isConstant(): boolean;

  plus(that: ConstraintExpressionLike): ConstraintExpression;

  negative(): ConstraintExpression;

  minus(that: ConstraintExpressionLike): ConstraintExpression;

  times(scalar: number): ConstraintExpression;

  divide(scalar: number): ConstraintExpression;
}

/** @public */
export const ConstraintExpression = {
  zero: Lazy(function (): ConstraintConstant {
    return new ConstraintConstant(0);
  }),

  constant(value: number): ConstraintConstant {
    if (value === 0) {
      return ConstraintExpression.zero();
    }
    return new ConstraintConstant(value);
  },

  sum(...expressions: ConstraintExpressionLike[]): ConstraintSum {
    const terms = new Map<ConstraintVariable, number>();
    let constant = 0;
    for (let i = 0; i < expressions.length; i += 1) {
      const expression = expressions[i]!;
      if (typeof expression === "number") {
        constant += expression;
      } else if (ConstraintTerm[Symbol.hasInstance](expression)) {
        const variable = expression.variable;
        if (variable === null) {
          constant += expression.constant;
        } else {
          let value = terms.get(variable);
          if (value === void 0) {
            value = 0;
          }
          terms.set(variable, value + expression.coefficient);
        }
      } else {
        for (const [variable, coefficient] of expression.terms) {
          let value = terms.get(variable);
          if (value === void 0) {
            value = 0;
          }
          terms.set(variable, value + coefficient);
        }
        constant += expression.constant;
      }
    }
    return new ConstraintSum(terms, constant);
  },

  product(coefficient: number, variable: ConstraintVariable): ConstraintProduct {
    return new ConstraintProduct(coefficient, variable);
  },

  fromLike<T extends ConstraintExpressionLike | null | undefined>(value: T): ConstraintExpression | Uninitable<T> {
    if (value == void 0 || value === null || ConstraintExpression[Symbol.hasInstance](value)) {
      return value as ConstraintExpression | Uninitable<T>;
    } else if (typeof value === "number") {
      return ConstraintExpression.constant(value);
    }
    throw new TypeError("" + value);
  },

  [Symbol.hasInstance](instance: unknown): instance is ConstraintExpression {
    return Objects.hasAllKeys<ConstraintExpression>(instance, "terms", "constant");
  },
};
