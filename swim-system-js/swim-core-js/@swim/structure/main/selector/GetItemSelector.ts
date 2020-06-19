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
import {Num} from "../Num";
import {Selector} from "../Selector";
import {AnyInterpreter, Interpreter} from "../Interpreter";

export class GetItemSelector extends Selector {
  /** @hidden */
  readonly _index: Num;
  /** @hidden */
  readonly _then: Selector;

  constructor(index: Num, then: Selector) {
    super();
    this._index = index;
    this._then = then;
  }

  accessor(): Num {
    return this._index;
  }

  then(): Selector {
    return this._then;
  }

  forSelected<T, S = unknown>(interpreter: Interpreter,
                              callback: (this: S, interpreter: Interpreter) => T | undefined,
                              thisArg?: S): T | undefined {
    let selected: T | undefined;
    interpreter.willSelect(this);
    const index = this._index.numberValue();
    if (interpreter.scopeDepth() !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      if (scope instanceof Item.Record && index < scope.length) {
        const item = scope.getItem(index);
        // Push the item onto the scope stack.
        interpreter.pushScope(item);
        // Subselect the item.
        selected = this._then.forSelected(interpreter, callback, thisArg);
        // Pop the item off of the scope stack.
        interpreter.popScope();
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
    }
    interpreter.didSelect(this, selected);
    return selected;
  }

  mapSelected<S = unknown>(interpreter: Interpreter,
                           transform: (this: S, interpreter: Interpreter) => Item,
                           thisArg?: S): Item {
    let result: Item;
    interpreter.willTransform(this);
    if (interpreter.scopeDepth() !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      const index = this._index.numberValue();
      if (scope instanceof Item.Record && index < scope.length) {
        const oldItem = scope.getItem(index);
        // Push the item onto the scope stack.
        interpreter.pushScope(oldItem);
        // Transform the item.
        const newItem = this._then.mapSelected(interpreter, transform, thisArg);
        // Pop the item off the scope stack.
        interpreter.popScope();
        if (newItem.isDefined()) {
          scope.setItem(index, newItem);
        } else {
          scope.splice(index, 1);
        }
      }
      // Push the transformed selection back onto the stack.
      interpreter.pushScope(scope);
      result = scope;
    } else {
      result = Item.absent();
    }
    interpreter.didTransform(this, result);
    return result;
  }

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const index = this._index.numberValue();
    if (interpreter.scopeDepth() !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      let selected: Item | undefined;
      if (scope instanceof Item.Record && index < scope.length) {
        const item = scope.getItem(index);
        // Substitute the item.
        selected = item.substitute(interpreter);
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
      if (selected !== void 0) {
        return selected;
      }
    }
    let then = this._then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this._then;
    }
    return new GetItemSelector(this._index, then as Selector);
  }

  andThen(then: Selector): Selector {
    return new GetItemSelector(this._index, this._then.andThen(then));
  }

  typeOrder(): number {
    return 14;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof GetItemSelector) {
      let order = this._index.compareTo(that._index);
      if (order === 0) {
        order = this._then.compareTo(that._then);
      }
      return order;
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GetItemSelector) {
      return this._index.equals(that._index) && this._then.equals(that._then);
    }
    return false;
  }

  hashCode(): number {
    if (GetItemSelector._hashSeed === void 0) {
      GetItemSelector._hashSeed = Murmur3.seed(GetItemSelector);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(GetItemSelector._hashSeed,
        this._index.hashCode()), this._then.hashCode()));
  }

  debugThen(output: Output): void {
    output = output.write(46/*'.'*/).write("getItem").write(40/*'('*/).debug(this._index).write(41/*')'*/);
    this._then.debugThen(output);
  }

  clone(): Selector {
    return new GetItemSelector(this._index, this._then.clone());
  }

  private static _hashSeed?: number;
}
Item.GetItemSelector = GetItemSelector;
