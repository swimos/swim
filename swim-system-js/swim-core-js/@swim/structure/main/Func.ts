// Copyright 2015-2019 SWIM.AI inc.
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

import {Item} from "./Item";
import {Value} from "./Value";
import {Expression} from "./Expression";
import {InvokeOperator} from "./operator/InvokeOperator";
import {Interpreter} from "./Interpreter";

export abstract class Func extends Expression {
  /** @hidden */
  constructor() {
    super();
  }

  abstract invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item;

  expand(args: Value, interpreter: Interpreter, operator: InvokeOperator): Item | undefined {
    return void 0;
  }

  isConstant(): boolean {
    return false;
  }
}
Item.Func = Func;
