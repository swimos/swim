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
import {UnaryOperator} from "./UnaryOperator";
import type {InterpreterLike} from "../interpreter/Interpreter";
import {Interpreter} from "../interpreter/Interpreter";

/** @public */
export class NegativeOperator extends UnaryOperator {
  constructor(operand: Item) {
    super(operand);
  }

  override get operator(): string {
    return "-";
  }

  override get precedence(): number {
    return 10;
  }

  override evaluate(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    const argument = this.operand.evaluate(interpreter);
    return argument.negative();
  }

  override substitute(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    const argument = this.operand.substitute(interpreter);
    return argument.negative();
  }

  override get typeOrder(): number {
    return 39;
  }

  override compareTo(that: unknown): number {
    if (that instanceof NegativeOperator) {
      return this.operand.compareTo(that.operand);
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof NegativeOperator) {
      return this.operand.equivalentTo(that.operand, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof NegativeOperator) {
      return this.operand.equals(that.operand);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(NegativeOperator), this.operand.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.debug(this.operand).write(46/*'.'*/).write("negative").write(40/*'('*/).write(41/*')'*/);
    return output;
  }

  override clone(): NegativeOperator {
    return new NegativeOperator(this.operand.clone());
  }
}
