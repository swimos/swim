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

import {Value, Record, Func, Interpreter} from "@swim/structure";
import {Inlet, AbstractOutlet, OutletInlet} from "@swim/streamlet";

export class InvokeOutlet extends AbstractOutlet<Value> {
  /** @hidden */
  readonly _scope: Record;
  /** @hidden */
  readonly _funcInlet: Inlet<Value>;
  /** @hidden */
  readonly _argsInlet: Inlet<Value>;

  constructor(scope: Record) {
    super();
    this._scope = scope;
    this._funcInlet = new OutletInlet<Value>(this);
    this._argsInlet = new OutletInlet<Value>(this);
  }

  funcInlet(): Inlet<Value> {
    return this._funcInlet;
  }

  argsInlet(): Inlet<Value> {
    return this._argsInlet;
  }

  get(): Value {
    const funcInput = this._funcInlet.input();
    const argsInput = this._argsInlet.input();
    if (funcInput !== null && argsInput !== null) {
      const func = funcInput.get();
      if (func instanceof Func) {
        const args = argsInput.get();
        if (args !== void 0) {
          const interpreter = new Interpreter();
          interpreter.pushScope(this._scope);
          const result = func.invoke(args, interpreter, void 0 /* TODO: generalize InvokeOperator to InvokeContext */);
          return result.toValue();
        }
      }
    }
    return Value.absent();
  }
}
