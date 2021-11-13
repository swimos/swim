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

import {Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {Item} from "../Item";
import {Record} from "../Record";
import type {Num} from "../Num";
import {Selector} from "./Selector";
import {AnyInterpreter, Interpreter} from "../"; // forward import

export class GetItemSelector extends Selector {
  constructor(index: Num, then: Selector) {
    super();
    this.item = index;
    this.then = then;
  }

  readonly item: Num;

  override readonly then: Selector;

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
    const index = this.item.numberValue();
    if (interpreter.scopeDepth !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      if (scope instanceof Record && index < scope.length) {
        const item = scope.getItem(index);
        // Push the item onto the scope stack.
        interpreter.pushScope(item);
        // Subselect the item.
        selected = this.then.forSelected(interpreter, callback, thisArg);
        // Pop the item off of the scope stack.
        interpreter.popScope();
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
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
    let result: Item;
    interpreter.willTransform(this);
    if (interpreter.scopeDepth !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      const index = this.item.numberValue();
      if (scope instanceof Record && index < scope.length) {
        const oldItem = scope.getItem(index);
        // Push the item onto the scope stack.
        interpreter.pushScope(oldItem);
        // Transform the item.
        const newItem = this.then.mapSelected(interpreter, transform, thisArg);
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

  override substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const index = this.item.numberValue();
    if (interpreter.scopeDepth !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      let selected: Item | undefined;
      if (scope instanceof Record && index < scope.length) {
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
    let then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new GetItemSelector(this.item, then as Selector);
  }

  override andThen(then: Selector): Selector {
    return new GetItemSelector(this.item, this.then.andThen(then));
  }

  override get typeOrder(): number {
    return 14;
  }

  override compareTo(that: unknown): number {
    if (that instanceof GetItemSelector) {
      let order = this.item.compareTo(that.item);
      if (order === 0) {
        order = this.then.compareTo(that.then);
      }
      return order;
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GetItemSelector) {
      return this.item.equals(that.item) && this.then.equivalentTo(that.then, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GetItemSelector) {
      return this.item.equals(that.item) && this.then.equals(that.then);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(GetItemSelector),
        this.item.hashCode()), this.then.hashCode()));
  }

  override debugThen<T>(output: Output<T>): Output<T> {
    output = output.write(46/*'.'*/).write("getItem").write(40/*'('*/)
                   .debug(this.item).write(41/*')'*/);
    output = this.then.debugThen(output);
    return output;
  }

  override clone(): Selector {
    return new GetItemSelector(this.item, this.then.clone());
  }
}
