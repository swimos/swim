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

import {Item, Value} from "@swim/structure";
import {Inlet, AbstractOutlet, OutletInlet} from "@swim/streamlet";

export abstract class BinaryOutlet extends AbstractOutlet<Value> {
  constructor() {
    super();
    Object.defineProperty(this, "operand1Inlet", {
      value: new OutletInlet<Value>(this),
      enumerable: true,
    });
    Object.defineProperty(this, "operand2Inlet", {
      value: new OutletInlet<Value>(this),
      enumerable: true,
    });
  }

  readonly operand1Inlet!: Inlet<Value>;

  readonly operand2Inlet!: Inlet<Value>;

  override get(): Value {
    const operand1Input = this.operand1Inlet.input;
    const operand2Input = this.operand2Inlet.input;
    if (operand1Input !== null && operand2Input !== null) {
      const argument1 = operand1Input.get();
      const argument2 = operand2Input.get();
      if (argument1 !== void 0 && argument2 !== void 0) {
        const result = this.evaluate(argument1, argument2);
        return result.toValue();
      }
    }
    return Value.absent();
  }

  protected abstract evaluate(argument1: Value, argument2: Value): Item;
}
