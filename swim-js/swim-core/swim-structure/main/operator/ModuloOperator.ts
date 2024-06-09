// Copyright 2015-2024 Nstream, inc.
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

import {Murmur3} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item} from "../Item";
import {BinaryOperator} from "./BinaryOperator";
import type {InterpreterLike} from "../interpreter/Interpreter";
import {Interpreter} from "../interpreter/Interpreter";

/** @public */
export class ModuloOperator extends BinaryOperator {
  constructor(operand1: Item, operand2: Item) {
    super(operand1, operand2);
  }

  override get operator(): string {
    return "%";
  }

  override get precedence(): number {
    return 9;
  }

  override evaluate(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    interpreter.willOperate(this);
    const argument1 = this.operand1.evaluate(interpreter);
    const argument2 = this.operand2.evaluate(interpreter);
    const result = argument1.modulo(argument2);
    interpreter.didOperate(this, result);
    return result;
  }

  override substitute(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    const argument1 = this.operand1.substitute(interpreter);
    const argument2 = this.operand2.substitute(interpreter);
    return argument1.modulo(argument2);
  }

  override get typeOrder(): number {
    return 36;
  }

  override compareTo(that: unknown): number {
    if (that instanceof ModuloOperator) {
      let order = this.operand1.compareTo(that.operand1);
      if (order === 0) {
        order = this.operand2.compareTo(that.operand2);
      }
      return order;
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ModuloOperator) {
      return this.operand1.equivalentTo(that.operand1, epsilon)
          && this.operand2.equivalentTo(that.operand2, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ModuloOperator) {
      return this.operand1.equals(that.operand1) && this.operand2.equals(that.operand2);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(ModuloOperator),
        this.operand1.hashCode()), this.operand2.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.debug(this.operand1).write(46/*'.'*/).write("modulo").write(40/*'('*/)
                   .debug(this.operand2).write(41/*')'*/);
    return output;
  }

  override clone(): ModuloOperator {
    return new ModuloOperator(this.operand1.clone(), this.operand2.clone());
  }
}
