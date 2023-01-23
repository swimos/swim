// Copyright 2015-2023 Swim.inc
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

import {Mutable, Interpolator} from "@swim/util";
import type {Item} from "../Item";
import {Operator} from "./Operator";
import type {UnaryOperator} from "./UnaryOperator";

/** @internal */
export interface UnaryOperatorInterpolator extends Interpolator<UnaryOperator> {
  /** @internal */
  readonly operator: string;
  /** @internal */
  readonly operandInterpolator: Interpolator<Item>;

  readonly 0: UnaryOperator;

  readonly 1: UnaryOperator;

  equals(that: unknown): boolean;
}

/** @internal */
export const UnaryOperatorInterpolator = (function (_super: typeof Interpolator) {
  const UnaryOperatorInterpolator = function (y0: UnaryOperator, y1: UnaryOperator): UnaryOperatorInterpolator {
    const operator = y0.operator;
    if (operator !== y1.operator) {
      throw new Error();
    }
    const interpolator = function (u: number): UnaryOperator {
      const operand = interpolator.operandInterpolator(u);
      return Operator.unary(interpolator.operator, operand);
    } as UnaryOperatorInterpolator;
    Object.setPrototypeOf(interpolator, UnaryOperatorInterpolator.prototype);
    (interpolator as Mutable<typeof interpolator>).operator = operator;
    (interpolator as Mutable<typeof interpolator>).operandInterpolator = y0.operand.interpolateTo(y1.operand);
    return interpolator;
  } as {
    (y0: UnaryOperator, y1: UnaryOperator): UnaryOperatorInterpolator;

    /** @internal */
    prototype: UnaryOperatorInterpolator;
  };

  UnaryOperatorInterpolator.prototype = Object.create(_super.prototype);
  UnaryOperatorInterpolator.prototype.constructor = UnaryOperatorInterpolator;

  Object.defineProperty(UnaryOperatorInterpolator.prototype, 0, {
    get(this: UnaryOperatorInterpolator): UnaryOperator {
      const operand = this.operandInterpolator[0];
      return Operator.unary(this.operator, operand);
    },
    configurable: true,
  });

  Object.defineProperty(UnaryOperatorInterpolator.prototype, 1, {
    get(this: UnaryOperatorInterpolator): UnaryOperator {
      const operand = this.operandInterpolator[1];
      return Operator.unary(this.operator, operand);
    },
    configurable: true,
  });

  UnaryOperatorInterpolator.prototype.equals = function (that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UnaryOperatorInterpolator) {
      return this.operator === that.operator
          && this.operandInterpolator.equals(that.operandInterpolator);
    }
    return false;
  };

  return UnaryOperatorInterpolator;
})(Interpolator);
