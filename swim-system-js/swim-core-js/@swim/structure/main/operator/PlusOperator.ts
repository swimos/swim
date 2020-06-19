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

import {Murmur3, Objects} from "@swim/util";
import {Output} from "@swim/codec";
import {Item} from "../Item";
import {BinaryOperator} from "./BinaryOperator";
import {AnyInterpreter, Interpreter} from "../Interpreter";

export class PlusOperator extends BinaryOperator {
  constructor(operand1: Item, operand2: Item) {
    super(operand1, operand2);
  }

  operator(): string {
    return "+";
  }

  precedence(): number {
    return 8;
  }

  evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    interpreter.willOperate(this);
    const argument1 = this._operand1.evaluate(interpreter);
    const argument2 = this._operand2.evaluate(interpreter);
    const result = argument1.plus(argument2);
    interpreter.didOperate(this, result);
    return result;
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const argument1 = this._operand1.substitute(interpreter);
    const argument2 = this._operand2.substitute(interpreter);
    return argument1.plus(argument2);
  }

  typeOrder(): number {
    return 32;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof PlusOperator) {
      let order = this._operand1.compareTo(that._operand1);
      if (order === 0) {
        order = this._operand2.compareTo(that._operand2);
      }
      return order;
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof PlusOperator) {
      return this._operand1.equals(that._operand1) && this._operand2.equals(that._operand2);
    }
    return false;
  }

  hashCode(): number {
    if (PlusOperator._hashSeed === void 0) {
      PlusOperator._hashSeed = Murmur3.seed(PlusOperator);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(PlusOperator._hashSeed,
        this._operand1.hashCode()), this._operand2.hashCode()));
  }

  debug(output: Output): void {
    output.debug(this._operand1).write(46/*'.'*/).write("plus").write(40/*'('*/)
        .debug(this._operand2).write(41/*')'*/);
  }

  clone(): PlusOperator {
    return new PlusOperator(this._operand1.clone(), this._operand2.clone());
  }

  private static _hashSeed?: number;
}
Item.PlusOperator = PlusOperator;
