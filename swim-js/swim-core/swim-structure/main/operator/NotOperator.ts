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

import {Murmur3} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Item} from "../Item";
import {UnaryOperator} from "./UnaryOperator";
import type {InterpreterLike} from "../interpreter/Interpreter";
import {Interpreter} from "../interpreter/Interpreter";

/** @public */
export class NotOperator extends UnaryOperator {
  constructor(operand: Item) {
    super(operand);
  }

  override get operator(): string {
    return "!";
  }

  override get precedence(): number {
    return 10;
  }

  override evaluate(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    const argument = this.operand.evaluate(interpreter);
    return argument.not();
  }

  override substitute(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    const argument = this.operand.substitute(interpreter);
    return argument.not();
  }

  override get typeOrder(): number {
    return 37;
  }

  override compareTo(that: Item): number {
    return Numbers.compare(this.typeOrder, that.typeOrder);
  }

  override equivalentTo(that: Item, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof NotOperator) {
      return this.operand.equivalentTo(that.operand, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof NotOperator) {
      return this.operand.equals(that.operand);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(NotOperator), this.operand.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.debug(this.operand).write(46/*'.'*/).write("not").write(40/*'('*/).write(41/*')'*/);
    return output;
  }

  override clone(): NotOperator {
    return new NotOperator(this.operand.clone());
  }
}
