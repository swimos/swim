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

import {Interpolator} from "@swim/mapping";
import type {Item} from "../Item";
import {Operator} from "./Operator";
import type {BinaryOperator} from "./BinaryOperator";

/** @hidden */
export interface BinaryOperatorInterpolator extends Interpolator<BinaryOperator> {
  /** @hidden */
  readonly operand1Interpolator: Interpolator<Item>;
  /** @hidden */
  readonly operator: string;
  /** @hidden */
  readonly operand2Interpolator: Interpolator<Item>;

  readonly 0: BinaryOperator;

  readonly 1: BinaryOperator;

  equals(that: unknown): boolean;
}

/** @hidden */
export const BinaryOperatorInterpolator = function (y0: BinaryOperator, y1: BinaryOperator): BinaryOperatorInterpolator {
  const operator = y0.operator;
  if (operator !== y1.operator) {
    throw new Error();
  }
  const interpolator = function (u: number): BinaryOperator {
    const operand1 = interpolator.operand1Interpolator(u);
    const operand2 = interpolator.operand2Interpolator(u);
    return Operator.binary(operand1, interpolator.operator, operand2);
  } as BinaryOperatorInterpolator;
  Object.setPrototypeOf(interpolator, BinaryOperatorInterpolator.prototype);
  Object.defineProperty(interpolator, "operand1Interpolator", {
    value: y0.operand1.interpolateTo(y1.operand1),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "operator", {
    value: operator,
    enumerable: true,
  });
  Object.defineProperty(interpolator, "operand2Interpolator", {
    value: y0.operand2.interpolateTo(y1.operand2),
    enumerable: true,
  });
  return interpolator;
} as {
  (y0: BinaryOperator, y1: BinaryOperator): BinaryOperatorInterpolator;

  /** @hidden */
  prototype: BinaryOperatorInterpolator;
};

BinaryOperatorInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(BinaryOperatorInterpolator.prototype, 0, {
  get(this: BinaryOperatorInterpolator): BinaryOperator {
    const operand1 = this.operand1Interpolator[0];
    const operand2 = this.operand2Interpolator[0];
    return Operator.binary(operand1, this.operator, operand2);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(BinaryOperatorInterpolator.prototype, 1, {
  get(this: BinaryOperatorInterpolator): BinaryOperator {
    const operand1 = this.operand1Interpolator[1];
    const operand2 = this.operand2Interpolator[1];
    return Operator.binary(operand1, this.operator, operand2);
  },
  enumerable: true,
  configurable: true,
});

BinaryOperatorInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof BinaryOperatorInterpolator) {
    return this.operator === that.operator
        && this.operand1Interpolator.equals(that.operand1Interpolator)
        && this.operand2Interpolator.equals(that.operand2Interpolator);
  }
  return false;
};
