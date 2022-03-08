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

import type {Item} from "../Item";
import {Expression} from "../Expression";
import type {BinaryOperator} from "./BinaryOperator";
import type {UnaryOperator} from "./UnaryOperator";
import {OrOperator} from "../"; // forward import
import {AndOperator} from "../"; // forward import
import {BitwiseOrOperator} from "../"; // forward import
import {BitwiseXorOperator} from "../"; // forward import
import {BitwiseAndOperator} from "../"; // forward import
import {LtOperator} from "../"; // forward import
import {LeOperator} from "../"; // forward import
import {EqOperator} from "../"; // forward import
import {NeOperator} from "../"; // forward import
import {GeOperator} from "../"; // forward import
import {GtOperator} from "../"; // forward import
import {PlusOperator} from "../"; // forward import
import {MinusOperator} from "../"; // forward import
import {TimesOperator} from "../"; // forward import
import {DivideOperator} from "../"; // forward import
import {ModuloOperator} from "../"; // forward import
import {NotOperator} from "../"; // forward import
import {BitwiseNotOperator} from "../"; // forward import
import {NegativeOperator} from "../"; // forward import
import {PositiveOperator} from "../"; // forward import

/** @public */
export abstract class Operator extends Expression {
  /** @internal */
  constructor() {
    super();
  }

  static binary(operand1: Item, operator: string, operand2: Item): BinaryOperator {
    switch (operator) {
      case "||": return new OrOperator(operand1, operand2);
      case "&&": return new AndOperator(operand1, operand2);
      case "|": return new BitwiseOrOperator(operand1, operand2);
      case "^": return new BitwiseXorOperator(operand1, operand2);
      case "&": return new BitwiseAndOperator(operand1, operand2);
      case "<": return new LtOperator(operand1, operand2);
      case "<=": return new LeOperator(operand1, operand2);
      case "==": return new EqOperator(operand1, operand2);
      case "!=": return new NeOperator(operand1, operand2);
      case ">=": return new GeOperator(operand1, operand2);
      case ">": return new GtOperator(operand1, operand2);
      case "+": return new PlusOperator(operand1, operand2);
      case "-": return new MinusOperator(operand1, operand2);
      case "*": return new TimesOperator(operand1, operand2);
      case "/": return new DivideOperator(operand1, operand2);
      case "%": return new ModuloOperator(operand1, operand2);
      default: throw new Error(operator);
    }
  }

  static unary(operator: string, operand: Item): UnaryOperator {
    switch (operator) {
      case "!": return new NotOperator(operand);
      case "~": return new BitwiseNotOperator(operand);
      case "-": return new NegativeOperator(operand);
      case "+": return new PositiveOperator(operand);
      default: throw new Error(operator);
    }
  }
}
