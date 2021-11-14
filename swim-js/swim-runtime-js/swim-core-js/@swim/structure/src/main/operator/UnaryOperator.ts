// Copyright 2015-2021 Swim Inc.
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
import {UnaryOperatorInterpolator} from "../"; // forward import

/** @public */
export abstract class UnaryOperator extends Operator {
  constructor(operand: Item) {
    super();
    this.operand = operand;
  }

  readonly operand: Item;

  abstract readonly operator: string;

  override isConstant(): boolean {
    return this.operand.isConstant();
  }

  override interpolateTo(that: UnaryOperator): Interpolator<UnaryOperator>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof UnaryOperator && this.operator === that.operator) {
      return UnaryOperatorInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }
}
