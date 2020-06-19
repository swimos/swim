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
import {Value} from "../Value";
import {Func} from "../Func";
import {Interpreter} from "../Interpreter";
import {InvokeOperator} from "../operator/InvokeOperator";

export class LambdaFunc extends Func {
  readonly _bindings: Value;
  readonly _template: Value;

  constructor(bindings: Value, template: Value) {
    super();
    this._bindings = bindings;
    this._template = template;
  }

  bindings(): Value {
    return this._bindings;
  }

  template(): Value {
    return this._template;
  }

  precedence(): number {
    return 1;
  }

  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const bindings = this._bindings;
    const arity = Math.max(1, bindings.length);
    const params = Item.Record.create(arity);
    let i = 0;
    let j = 0;
    while (i < arity) {
      const binding = bindings instanceof Item.Record ? bindings.getItem(i) : i === 0 ? bindings : Item.absent();
      const arg = args instanceof Item.Record ? args.getItem(j).toValue() : j === 0 ? args : Item.Value.absent();
      if (binding instanceof Item.Text && arg.isDistinct()) {
        params.push(Item.Slot.of(binding, arg));
        j += 1;
      } else if (binding instanceof Item.Slot) {
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
    const result = this._template.evaluate(interpreter);
    interpreter.popScope();
    return result;
  }

  typeOrder(): number {
    return 50;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof LambdaFunc) {
      let order = this._bindings.compareTo(that._bindings);
      if (order === 0) {
        order = this._template.compareTo(that._template);
      }
      return order;
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LambdaFunc) {
      return this._bindings.equals(that._bindings) && this._template.equals(that._template);
    }
    return false;
  }

  hashCode() {
    if (LambdaFunc._hashSeed === void 0) {
      LambdaFunc._hashSeed = Murmur3.seed(LambdaFunc);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(LambdaFunc._hashSeed,
        this._bindings.hashCode()), this._template.hashCode()));
  }

  debug(output: Output): void {
    output.debug(this.bindings).write(46/*'.'*/).write("lambda").write(40/*'('*/)
        .debug(this.template).write(41/*')'*/);
  }

  private static _hashSeed?: number;
}
Item.LambdaFunc = LambdaFunc;
