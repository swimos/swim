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

import {Value} from "@swim/structure";
import {Inlet, AbstractOutlet, OutletInlet} from "@swim/streamlet";

export class OrOutlet extends AbstractOutlet<Value> {
  /** @hidden */
  readonly _operand1Inlet: Inlet<Value>;
  /** @hidden */
  readonly _operand2Inlet: Inlet<Value>;

  constructor() {
    super();
    this._operand1Inlet = new OutletInlet<Value>(this);
    this._operand2Inlet = new OutletInlet<Value>(this);
  }

  operand1Inlet(): Inlet<Value> {
    return this._operand1Inlet;
  }

  operand2Inlet(): Inlet<Value> {
    return this._operand2Inlet;
  }

  get(): Value {
    const operand1Input = this._operand1Inlet.input();
    const argument1 = operand1Input !== null ? operand1Input.get() : void 0;
    if (argument1 !== void 0 && argument1.booleanValue(false)) {
      return argument1;
    }
    const operand2Input = this._operand2Inlet.input();
    const argument2 = operand2Input !== null ? operand2Input.get() : void 0;
    if (argument2 !== void 0) {
      return argument2;
    }
    return Value.absent();
  }
}
