// Copyright 2015-2023 Nstream, inc.
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

import {Numbers} from "@swim/util";
import {Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import type {ItemLike} from "../Item";
import {Item} from "../Item";
import type {ValueLike} from "../Value";
import {Value} from "../Value";
import type {TextLike} from "../Text";
import {Text} from "../Text";
import type {NumLike} from "../Num";
import {Num} from "../Num";
import {Selector} from "./Selector";
import {GetSelector} from "../"; // forward import
import {GetAttrSelector} from "../"; // forward import
import {GetItemSelector} from "../"; // forward import
import {FilterSelector} from "../"; // forward import
import type {InterpreterLike} from "../interpreter/Interpreter";
import {Interpreter} from "../"; // forward import

/** @public */
export class IdentitySelector extends Selector {
  override get then(): Selector {
    return this;
  }

  override forSelected<T>(interpreter: Interpreter,
                          callback: (interpreter: Interpreter) => T | undefined): T | undefined;
  override forSelected<T, S>(interpreter: Interpreter,
                             callback: (this: S, interpreter: Interpreter) => T | undefined,
                             thisArg: S): T | undefined;
  override forSelected<T, S>(interpreter: Interpreter,
                             callback: (this: S | undefined, interpreter: Interpreter) => T | undefined,
                             thisArg?: S): T | undefined {
    let selected: T | undefined;
    interpreter.willSelect(this);
    if (interpreter.scopeDepth !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const oldScope = interpreter.popScope();
      // Evaluate the current selection.
      const newScope = oldScope.evaluate(interpreter);
      // Push the evaluated selection onto the scope stack.
      interpreter.pushScope(newScope);
      // Visit the evaluated selection.
      selected = callback.call(thisArg, interpreter);
      // Restore the original selection to the top of the scope stack.
      interpreter.swapScope(oldScope);
    }
    interpreter.didSelect(this, selected);
    return selected;
  }

  override mapSelected(interpreter: Interpreter,
                       transform: (interpreter: Interpreter) => Item): Item;
  override mapSelected<S>(interpreter: Interpreter,
                          transform: (this: S, interpreter: Interpreter) => Item,
                          thisArg: S): Item;
  override mapSelected<S>(interpreter: Interpreter,
                          transform: (this: S | undefined, interpreter: Interpreter) => Item,
                          thisArg?: S): Item {
    return transform.call(thisArg, interpreter);
  }

  override substitute(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    return interpreter.peekScope().substitute(interpreter);
  }

  override get(key: ValueLike): Selector {
    key = Value.fromLike(key);
    return new GetSelector(key, this);
  }

  override getAttr(key: TextLike): Selector {
    key = Text.fromLike(key);
    return new GetAttrSelector(key, this);
  }

  override getItem(index: NumLike): Selector {
    index = Num.fromLike(index);
    return new GetItemSelector(index, this);
  }

  override andThen(then: Selector): Selector {
    return then;
  }

  override keys(): Selector {
    return Selector.keys();
  }

  override values(): Selector {
    return Selector.values();
  }

  override children(): Selector {
    return Selector.children();
  }

  override descendants(): Selector {
    return Selector.descendants();
  }

  override filter(predicate?: ItemLike): Selector {
    if (arguments.length === 0) {
      return new FilterSelector(this, this);
    } else {
      predicate = Item.fromLike(predicate);
      return predicate.filter();
    }
  }

  override get typeOrder(): number {
    return 10;
  }

  override compareTo(that: unknown): number {
    if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown): boolean {
    return this === that;
  }

  override equals(that: unknown): boolean {
    return this === that;
  }

  override hashCode(): number {
    return Constructors.hash(IdentitySelector);
  }

  override debugThen<T>(output: Output<T>): Output<T> {
    return output; // blank
  }

  override clone(): Selector {
    return this;
  }
}
