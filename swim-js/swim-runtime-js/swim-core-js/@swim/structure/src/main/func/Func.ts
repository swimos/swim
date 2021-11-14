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

import type {Item} from "../Item";
import type {Value} from "../Value";
import {Expression} from "../Expression";
import type {InvokeOperator} from "../operator/InvokeOperator";
import type {Interpreter} from "../interpreter/Interpreter";

/** @public */
export abstract class Func extends Expression {
  /** @internal */
  constructor() {
    super();
  }

  override isConstant(): boolean {
    return false;
  }

  abstract override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item;

  expand(args: Value, interpreter: Interpreter, operator: InvokeOperator): Item | undefined {
    return void 0;
  }
}
