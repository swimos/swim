// Copyright 2015-2021 Swim inc.
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

import {Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {Interpolator} from "@swim/mapping";
import {Item} from "../Item";
import type {Value} from "../Value";
import {Operator} from "./Operator";
import {InvokeOperatorInterpolator} from "../"; // forward import
import {Func} from "../"; // forward import
import {AnyInterpreter, Interpreter} from "../"; // forward import

export class InvokeOperator extends Operator {
  constructor(func: Value, args: Value) {
    super();
    Object.defineProperty(this, "func", {
      value: func,
      enumerable: true,
    });
    Object.defineProperty(this, "args", {
      value: args.commit(),
      enumerable: true,
    });
    Object.defineProperty(this, "state", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  readonly func!: Value;

  readonly args!: Value;

  readonly state!: unknown;

  setState(state: unknown): void {
    Object.defineProperty(this, "state", {
      value: state,
      enumerable: true,
      configurable: true,
    });
  }

  override isConstant(): boolean {
    return this.func.isConstant() && this.args.isConstant();
  }

  override get precedence(): number {
    return 11;
  }

  override evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const func = this.func.evaluate(interpreter);
    if (func instanceof Func) {
      return func.invoke(this.args, interpreter, this);
    }
    return Item.absent();
  }

  override substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
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

  override debug(output: Output): void {
    output.debug(this.func).write(46/*'.'*/).write("invoke").write(40/*'('*/)
        .debug(this.args).write(41/*')'*/);
  }

  override clone(): InvokeOperator {
    return new InvokeOperator(this.func.clone(), this.args.clone());
  }
}
