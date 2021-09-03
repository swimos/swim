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

import {Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item} from "../Item";
import {Slot} from "../Slot";
import {Value} from "../Value";
import {Record} from "../Record";
import {Text} from "../Text";
import type {InvokeOperator} from "../operator/InvokeOperator";
import {Func} from "./Func";
import {Interpreter} from "../"; // forward import

export class LambdaFunc extends Func {
  constructor(bindings: Value, template: Value) {
    super();
    Object.defineProperty(this, "bindings", {
      value: bindings,
      enumerable: true,
    });
    Object.defineProperty(this, "template", {
      value: template,
      enumerable: true,
    });
  }

  readonly bindings!: Value;

  readonly template!: Value;

  override get precedence(): number {
    return 1;
  }

  override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const bindings = this.bindings;
    const arity = Math.max(1, bindings.length);
    const params = Record.create(arity);
    let i = 0;
    let j = 0;
    while (i < arity) {
      const binding = bindings instanceof Record ? bindings.getItem(i) : i === 0 ? bindings : Item.absent();
      const arg = args instanceof Record ? args.getItem(j).toValue() : j === 0 ? args : Value.absent();
      if (binding instanceof Text && arg.isDistinct()) {
        params.push(Slot.of(binding, arg));
        j += 1;
      } else if (binding instanceof Slot) {
        if (arg.isDistinct()) {
          params.push(binding.updatedValue(arg));
        } else {
          params.push(binding);
        }
        j += 1;
      }
      i += 1;
    }
    interpreter.pushScope(params);
    const result = this.template.evaluate(interpreter);
    interpreter.popScope();
    return result;
  }

  override get typeOrder(): number {
    return 50;
  }

  override compareTo(that: unknown): number {
    if (that instanceof LambdaFunc) {
      let order = this.bindings.compareTo(that.bindings);
      if (order === 0) {
        order = this.template.compareTo(that.template);
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
    } else if (that instanceof LambdaFunc) {
      return this.bindings.equivalentTo(that.bindings, epsilon)
          && this.template.equivalentTo(that.template, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LambdaFunc) {
      return this.bindings.equals(that.bindings) && this.template.equals(that.template);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(LambdaFunc),
        this.bindings.hashCode()), this.template.hashCode()));
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.debug(this.bindings).write(46/*'.'*/).write("lambda").write(40/*'('*/)
                   .debug(this.template).write(41/*')'*/);
    return output;
  }
}
