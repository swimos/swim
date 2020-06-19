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
import {AnyItem, Item} from "../Item";
import {AnyValue, Value} from "../Value";
import {AnyText} from "../Text";
import {AnyNum} from "../Num";
import {Selector} from "../Selector";
import {AnyInterpreter, Interpreter} from "../Interpreter";

export class IdentitySelector extends Selector {
  then(): Selector {
    return this;
  }

  forSelected<T, S = unknown>(interpreter: Interpreter,
                              callback: (this: S, interpreter: Interpreter) => T | undefined,
                              thisArg?: S): T | undefined {
    let selected: T | undefined;
    interpreter.willSelect(this);
    if (interpreter.scopeDepth() !== 0) {
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

  mapSelected<S = unknown>(interpreter: Interpreter,
                           transform: (this: S, interpreter: Interpreter) => Item,
                           thisArg?: S): Item {
    return transform.call(thisArg, interpreter);
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    return interpreter.peekScope().substitute(interpreter);
  }

  get(key: AnyValue): Selector {
    key = Value.fromAny(key);
    return new Item.GetSelector(key, this);
  }

  getAttr(key: AnyText): Selector {
    key = Item.Text.fromAny(key);
    return new Item.GetAttrSelector(key, this);
  }

  getItem(index: AnyNum): Selector {
    index = Item.Num.fromAny(index);
    return new Item.GetItemSelector(index, this);
  }

  andThen(then: Selector): Selector {
    return then;
  }

  keys(): Selector {
    return Selector.keys();
  }

  values(): Selector {
    return Selector.values();
  }

  children(): Selector {
    return Selector.children();
  }

  descendants(): Selector {
    return Selector.descendants();
  }

  filter(predicate?: AnyItem): Selector {
    if (arguments.length === 0) {
      return new Item.FilterSelector(this, this);
    } else {
      predicate = Item.fromAny(predicate);
      return predicate.filter();
    }
  }

  typeOrder(): number {
    return 10;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    return this === that;
  }

  hashCode(): number {
    if (IdentitySelector._hashSeed === void 0) {
      IdentitySelector._hashSeed = Murmur3.seed(IdentitySelector);
    }
    return IdentitySelector._hashSeed;
  }

  debugThen(output: Output): void {
    // nop
  }

  clone(): Selector {
    return this;
  }

  private static _hashSeed?: number;
}
Item.IdentitySelector = IdentitySelector;
Selector._identity = new IdentitySelector();
