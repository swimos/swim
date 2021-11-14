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

import type {Mutable} from "@swim/util";
import {InterpreterException} from "./InterpreterException";
import {InterpreterSettings} from "./InterpreterSettings";
import {AnyItem, Item} from "../Item";
import type {Operator} from "../operator/Operator";
import type {Selector} from "../selector/Selector";

/** @public */
export type AnyInterpreter = Interpreter | AnyItem;

/** @public */
export class Interpreter {
  constructor(settings?: InterpreterSettings, scopeStack?: Item[] | null, scopeDepth?: number) {
    this.settings = settings !== void 0 ? settings : InterpreterSettings.standard();
    this.scopeStack = scopeStack !== void 0 ? scopeStack : null;
    this.scopeDepth = scopeDepth !== void 0 ? scopeDepth : 0;
  }

  readonly settings: InterpreterSettings;

  withSettings(settings: InterpreterSettings): this {
    (this as Mutable<this>).settings = settings;
    return this;
  }

  /** @internal */
  readonly scopeStack: Item[] | null;

  readonly scopeDepth: number;

  peekScope(): Item {
    const scopeDepth = this.scopeDepth;
    if (scopeDepth <= 0) {
      throw new InterpreterException("scope stack empty");
    }
    return this.scopeStack![scopeDepth - 1]!;
  }

  getScope(index: number): Item {
    if (index < 0 || index >= this.scopeDepth) {
      throw new RangeError("" + index);
    }
    return this.scopeStack![index]!;
  }

  pushScope(scope: Item): void {
    const scopeDepth = this.scopeDepth;
    if (scopeDepth >= this.settings.maxScopeDepth) {
      throw new InterpreterException("scope stack overflow");
    }
    const oldScopeStack = this.scopeStack;
    let newScopeStack;
    if (oldScopeStack === null || scopeDepth + 1 > oldScopeStack.length) {
      newScopeStack = new Array<Item>(Interpreter.expand(scopeDepth + 1));
      if (oldScopeStack !== null) {
        for (let i = 0; i < scopeDepth; i += 1) {
          newScopeStack[i] = oldScopeStack[i]!;
        }
      }
      (this as Mutable<this>).scopeStack = newScopeStack;
    } else {
      newScopeStack = oldScopeStack;
    }
    newScopeStack[scopeDepth] = scope;
    (this as Mutable<this>).scopeDepth += 1;
  }

  popScope(): Item {
    const scopeDepth = this.scopeDepth;
    if (scopeDepth <= 0) {
      throw new InterpreterException("scope stack empty");
    }
    const scopeStack = this.scopeStack!;
    const scope = scopeStack[scopeDepth - 1]!;
    scopeStack[scopeDepth - 1] = void 0 as any;
    (this as Mutable<this>).scopeDepth -= 1;
    return scope;
  }

  swapScope(newScope: Item): Item {
    const scopeDepth = this.scopeDepth;
    if (scopeDepth <= 0) {
      throw new InterpreterException("scope stack empty");
    }
    const scopeStack = this.scopeStack!;
    const oldScope = scopeStack[scopeDepth - 1]!;
    scopeStack[scopeDepth - 1] = newScope;
    return oldScope;
  }

  willOperate(operator: Operator): void {
    // stub
  }

  didOperate(operator: Operator, result: Item): void {
    // stub
  }

  willSelect(selector: Selector): void {
    // stub
  }

  didSelect(selector: Selector, result: unknown): void {
    // stub
  }

  willTransform(selector: Selector): void {
    // stub
  }

  didTransform(selector: Selector, result: Item): void {
    // stub
  }

  static of(...objects: AnyItem[]): Interpreter {
    const n = objects.length;
    const scopes = new Array(Interpreter.expand(n));
    for (let i = 0; i < n; i += 1) {
      const scope = Item.fromAny(objects[i]);
      scopes[i] = scope;
    }
    return new Interpreter(InterpreterSettings.standard(), scopes, n);
  }

  static fromAny(interpreter: AnyInterpreter, globalScope: Item = Item.globalScope()): Interpreter {
    if (!(interpreter instanceof Interpreter)) {
      const scope = interpreter;
      interpreter = new Interpreter();
      if (globalScope !== void 0) {
        interpreter.pushScope(globalScope);
      }
      if (scope !== void 0) {
        interpreter.pushScope(Item.fromAny(scope));
      }
    }
    return interpreter;
  }

  private static expand(n: number): number {
    n = Math.max(32, n) - 1;
    n |= n >> 1; n |= n >> 2; n |= n >> 4; n |= n >> 8; n |= n >> 16;
    return n + 1;
  }
}
