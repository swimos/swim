// Copyright 2015-2021 Swim.inc
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

import {Murmur3, Numbers, Constructors, Interpolator} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item} from "../Item";
import {Operator} from "./Operator";
import {ConditionalOperatorInterpolator} from "../"; // forward import
import {AnyInterpreter, Interpreter} from "../"; // forward import

/** @public */
export class ConditionalOperator extends Operator {
  constructor(ifTerm: Item, thenTerm: Item, elseTerm: Item) {
    super();
    this.ifTerm = ifTerm.commit();
    this.thenTerm = thenTerm.commit();
    this.elseTerm = elseTerm.commit();
  }

  readonly ifTerm: Item;

  readonly thenTerm: Item;

  readonly elseTerm: Item;

  override isConstant(): boolean {
    return this.ifTerm.isConstant() && this.thenTerm.isConstant()
        && this.elseTerm.isConstant();
  }

  override get precedence(): number {
    return 2;
  }

  override evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    interpreter.willOperate(this);
    let result;
    const ifTerm = this.ifTerm.evaluate(interpreter);
    if (ifTerm.isDefinite()) {
      const theTerm = this.thenTerm.evaluate(interpreter);
      result = theTerm;
    } else {
      const elseTerm = this.elseTerm.evaluate(interpreter);
      result = elseTerm;
    }
    interpreter.didOperate(this, result);
    return result;
  }

  override substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const ifTerm = this.ifTerm.substitute(interpreter);
    const thenTerm = this.thenTerm.substitute(interpreter);
    const elseTerm = this.elseTerm.substitute(interpreter);
    return new ConditionalOperator(ifTerm, thenTerm, elseTerm);
  }

  override interpolateTo(that: ConditionalOperator): Interpolator<ConditionalOperator>;
  override interpolateTo(that: Item): Interpolator<Item>;
  override interpolateTo(that: unknown): Interpolator<Item> | null;
  override interpolateTo(that: unknown): Interpolator<Item> | null {
    if (that instanceof ConditionalOperator) {
      return ConditionalOperatorInterpolator(this, that);
    } else {
      return super.interpolateTo(that);
    }
  }

  override get typeOrder(): number {
    return 20;
  }

  override compareTo(that: unknown): number {
    if (that instanceof ConditionalOperator) {
      let order = this.ifTerm.compareTo(that.ifTerm);
      if (order === 0) {
        order = this.thenTerm.compareTo(that.thenTerm);
        if (order === 0) {
          order = this.elseTerm.compareTo(that.elseTerm);
        }
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
    } else if (that instanceof ConditionalOperator) {
      return this.ifTerm.equivalentTo(that.ifTerm, epsilon)
          && this.thenTerm.equivalentTo(that.thenTerm, epsilon)
          && this.elseTerm.equivalentTo(that.elseTerm, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ConditionalOperator) {
      return this.ifTerm.equals(that.ifTerm) && this.thenTerm.equals(that.thenTerm)
          && this.elseTerm.equals(that.elseTerm);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Constructors.hash(ConditionalOperator),
        this.ifTerm.hashCode()), this.thenTerm.hashCode()), this.elseTerm.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.debug(this.ifTerm).write(46/*'.'*/).write("conditional").write(40/*'('*/)
                   .debug(this.thenTerm).write(44/*','*/).write(32/*' '*/)
                   .debug(this.elseTerm).write(41/*')'*/);
    return output;
  }

  override clone(): ConditionalOperator {
    return new ConditionalOperator(this.ifTerm.clone(), this.thenTerm.clone(), this.elseTerm.clone());
  }
}
