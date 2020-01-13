// Copyright 2015-2020 SWIM.AI inc.
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
import {UnaryOperator} from "./UnaryOperator";
import {AnyInterpreter, Interpreter} from "../Interpreter";

export class NegativeOperator extends UnaryOperator {
  constructor(operand: Item) {
    super(operand);
  }

  operator(): string {
    return "-";
  }

  precedence(): number {
    return 10;
  }

  evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const argument = this._operand.evaluate(interpreter);
    return argument.negative();
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const argument = this._operand.substitute(interpreter);
    return argument.negative();
  }

  typeOrder(): number {
    return 39;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof NegativeOperator) {
      return this._operand.compareTo(that._operand);
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof NegativeOperator) {
      return this._operand.equals(that._operand);
    }
    return false;
  }

  hashCode(): number {
    if (NegativeOperator._hashSeed === void 0) {
      NegativeOperator._hashSeed = Murmur3.seed(NegativeOperator);
    }
    return Murmur3.mash(Murmur3.mix(NegativeOperator._hashSeed, this._operand.hashCode()));
  }

  debug(output: Output): void {
    output.debug(this._operand).write(46/*'.'*/).write("negative").write(40/*'('*/).write(41/*')'*/);
  }

  clone(): NegativeOperator {
    return new NegativeOperator(this._operand.clone());
  }

  private static _hashSeed?: number;
}
Item.NegativeOperator = NegativeOperator;
