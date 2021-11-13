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
import {Field} from "../Field";
import {Record} from "../Record";
import {Selector} from "./Selector";
import {AnyInterpreter, Interpreter} from "../"; // forward import

export class ValuesSelector extends Selector {
  constructor(then: Selector) {
    super();
    this.then = then;
  }

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
    if (interpreter.scopeDepth !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope();
      if (scope instanceof Record) {
        const children = scope.iterator();
        // For each child, while none have been selected:
        while (selected === void 0 && children.hasNext()) {
          const child = children.next().value!;
          // Push the child value onto the scope stack.
          interpreter.pushScope(child.toValue());
          // Subselect the child value.
          selected = this.then.forSelected(interpreter, callback, thisArg);
          // Pop the child value off of the scope stack.
          interpreter.popScope();
        }
      } else {
        // Push the value onto the scope stack.
        interpreter.pushScope(scope.toValue());
        // Subselect the value.
        selected = this.then.forSelected(interpreter, callback, thisArg);
        // Pop the value off of the scope stack.
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
      let scope = interpreter.popScope();
      if (scope instanceof Record) {
        const children = scope.iterator();
        while (children.hasNext()) {
          const child = children.next().value!;
          if (child instanceof Field) {
            const oldValue = child.toValue();
            // Push the child value onto the scope stack.
            interpreter.pushScope(oldValue);
            // Transform the child value.
            const newItem = this.then.mapSelected(interpreter, transform, thisArg);
            // Pop the child value off of the scope stack.
            interpreter.popScope();
            if (newItem.isDefined()) {
              if (newItem instanceof Field) {
                children.set(newItem);
              } else if (newItem !== oldValue) {
                children.set(child.updatedValue(newItem.toValue()));
              }
            } else {
              children.delete();
            }
          } else {
            // Push the child onto the scope stack.
            interpreter.pushScope(child.toValue());
            // Transform the child.
            const newItem = this.then.mapSelected(interpreter, transform, thisArg);
            // Pop the child off of the scope stack.
            interpreter.popScope();
            if (newItem.isDefined()) {
              if (child !== newItem) {
                children.set(newItem);
              }
            } else {
              children.delete();
            }
          }
        }
      } else if (scope instanceof Field) {
        const oldValue = scope.toValue();
        // Push the field value onto the scope stack.
        interpreter.pushScope(oldValue);
        // Transform the field value.
        const newItem = this.then.mapSelected(interpreter, transform, thisArg);
        // Pop the field value off of the scope stack.
        interpreter.popScope();
        if (newItem.isDefined()) {
          if (newItem instanceof Field) {
            scope = newItem;
          } else if (newItem !== oldValue) {
            scope = scope.updatedValue(newItem.toValue());
          }
        } else {
          scope = Item.absent();
        }
      } else {
        // Push the value onto the scope stack.
        interpreter.pushScope(scope);
        // Transform the value.
        scope = this.then.mapSelected(interpreter, transform, thisArg);
        // Pop the value off of the scope stack.
        interpreter.popScope();
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
    let then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new ValuesSelector(then as Selector);
  }

  override andThen(then: Selector): Selector {
    return new ValuesSelector(this.then.andThen(then));
  }

  override get typeOrder(): number {
    return 16;
  }

  override compareTo(that: unknown): number {
    if (that instanceof ValuesSelector) {
      return this.then.compareTo(that.then);
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ValuesSelector) {
      return this.then.equivalentTo(that.then, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ValuesSelector) {
      return this.then.equals(that.then);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(ValuesSelector), this.then.hashCode()));
  }

  override debugThen<T>(output: Output<T>): Output<T> {
    output = output.write(46/*'.'*/).write("values").write(40/*'('*/).write(41/*')'*/);
    output = this.then.debugThen(output);
    return output;
  }

  override clone(): Selector {
    return new ValuesSelector(this.then.clone());
  }
}
