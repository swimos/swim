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

import type {Mutable} from "@swim/util";
import {Murmur3} from "@swim/util";
import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item} from "../Item";
import type {Value} from "../Value";
import {Operator} from "./Operator";
import {InvokeOperatorInterpolator} from "../"; // forward import
import {Func} from "../"; // forward import
import type {InterpreterLike} from "../interpreter/Interpreter"; // forward import
import {Interpreter} from "../"; // forward import

/** @public */
export class InvokeOperator extends Operator {
  constructor(func: Value, args: Value) {
    super();
    this.func = func;
    this.args = args.commit();
    this.state = void 0;
  }

  readonly func: Value;

  readonly args: Value;

  readonly state: unknown;

  setState(state: unknown): void {
    (this as Mutable<this>).state = state;
  }

  override isConstant(): boolean {
    return this.func.isConstant() && this.args.isConstant();
  }

  override get precedence(): number {
    return 11;
  }

  override evaluate(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    const func = this.func.evaluate(interpreter);
    if (func instanceof Func) {
      return func.invoke(this.args, interpreter, this);
    }
    return Item.absent();
  }

  override substitute(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    const func = this.func.evaluate(interpreter);
    if (func instanceof Func) {
      const result = func.expand(this.args, interpreter, this);
      if (result !== void 0) {
        return result;
      }
    }
    const args = this.args.substitute(interpreter).toValue();
    return new InvokeOperator(this.func, args);
  }

  override interpolateTo(that: InvokeOperator): Interpolator<InvokeOperator>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof InvokeOperator) {
      return InvokeOperatorInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  override get typeOrder(): number {
    return 41;
  }

  override compareTo(that: unknown): number {
    if (that instanceof InvokeOperator) {
      let order = this.func.compareTo(that.func);
      if (order === 0) {
        order = this.args.compareTo(that.args);
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
    } else if (that instanceof InvokeOperator) {
      return this.func.equals(that.func)
          && this.args.equivalentTo(that.args, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InvokeOperator) {
      return this.func.equals(that.func) && this.args.equals(that.args);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(InvokeOperator),
        this.func.hashCode()), this.args.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.debug(this.func).write(46/*'.'*/).write("invoke").write(40/*'('*/)
                   .debug(this.args).write(41/*')'*/);
    return output;
  }

  override clone(): InvokeOperator {
    return new InvokeOperator(this.func.clone(), this.args.clone());
  }
}
