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

import type {Interpolator} from "@swim/util";
import type {Item} from "../Item";
import {Operator} from "./Operator";
import {BinaryOperatorInterpolator} from "../"; // forward import

/** @public */
export abstract class BinaryOperator extends Operator {
  constructor(operand1: Item, operand2: Item) {
    super();
    this.operand1 = operand1;
    this.operand2 = operand2;
  }

  readonly operand1: Item;

  abstract readonly operator: string;

  readonly operand2: Item;

  override isConstant(): boolean {
    return this.operand1.isConstant() && this.operand2.isConstant();
  }

  override interpolateTo(that: BinaryOperator): Interpolator<BinaryOperator>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof BinaryOperator && this.operator === that.operator) {
      return BinaryOperatorInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }
}
