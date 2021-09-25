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
import {Attr} from "../Attr";
import {Record} from "../Record";
import type {Text} from "../Text";
import {Selector} from "./Selector";
import {AnyInterpreter, Interpreter} from "../"; // forward import

export class GetAttrSelector extends Selector {
  constructor(key: Text, then: Selector) {
    super();
    this.item = key;
    this.then = then;
  }

  readonly item: Text;

  override readonly then: Selector;

  override forSelected<T>(interpreter: Interpreter,
                          callback: (interpreter: Interpreter) => T | undefined): T | undefined;
  override forSelected<T, S>(interpreter: Interpreter,
                             callback: (this: S, interpreter: Interpreter) => T | undefined,
                             thisArg: S): T | undefined;
  override forSelected<T, S>(interpreter: Interpreter,
                             callback: (this: S | undefined, interpreter: Interpreter) => T | undefined,
                             thisArg?: S): T | undefined {
    interpreter.willSelect(this);
    const key = this.item;
    const selected = GetAttrSelector.forSelected(key, this.then, interpreter, callback);
    interpreter.didSelect(this, selected);
    return selected;
  }

  /** @hidden */
  static forSelected<T, S>(key: Text, then: Selector, interpreter: Interpreter,
                           callback: (this: S | undefined, interpreter: Interpreter) => T | undefined,
                           thisArg?: S): T | undefined {
    let selected: T | undefined;
    if (interpreter.scopeDepth !== 0) {
      // Pop the next selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      let field: Field | undefined;
      // Only records can have members.
      if (scope instanceof Record) {
        field = scope.getField(key);
        if (field instanceof Attr) {
          // Push the field value onto the scope stack.
          interpreter.pushScope(field.toValue());
          // Subselect the field value.
          selected = then.forSelected(interpreter, callback, thisArg);
          // Pop the field value off of the scope stack.
          interpreter.popScope();
        }
      }
      if (field === void 0 && selected === void 0) {
        GetAttrSelector.forSelected(key, then, interpreter, callback, thisArg);
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
    }
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
    const key = this.item;
    if (interpreter.scopeDepth !== 0) {
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      // Only records can have members.
      if (scope instanceof Record) {
        const oldField = scope.getField(key);
        if (oldField instanceof Attr) {
          // Push the field value onto the scope stack.
          interpreter.pushScope(oldField.toValue());
          // Transform the field value.
          const newItem = this.then.mapSelected(interpreter, transform, thisArg);
          // Pop the field value off the scope stack.
          interpreter.popScope();
          if (newItem instanceof Field) {
            // Replace the original field with the transformed field.
            if (key.equals(newItem.key)) {
              scope.setAttr(key, newItem.toValue());
            } else {
              scope.delete(key);
              scope.push(newItem);
            }
          } else if (newItem.isDefined()) {
            // Update the field with the transformed value.
            scope.setAttr(key, newItem.toValue());
          } else {
            // Remove the field.
            scope.delete(key);
          }
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
    const key = this.item;
    const value = GetAttrSelector.substitute(key, this.then, interpreter);
    if (value !== void 0) {
      return value;
    }
    let then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new GetAttrSelector(this.item, then as Selector);
  }

  /** @hidden */
  static substitute(key: Text, then: Selector, interpreter: Interpreter): Item | undefined {
    let selected: Item | undefined;
    if (interpreter.scopeDepth !== 0) {
      // Pop the next selection off of the stack to take it out of scope.
      const scope = interpreter.popScope().toValue();
      let field: Field | undefined;
      // Only records can have members.
      if (scope instanceof Record) {
        field = scope.getField(key);
        if (field instanceof Attr) {
          // Substitute the field value.
          selected = field.toValue().substitute(interpreter);
        }
      }
      if (field === void 0 && selected === void 0) {
        GetAttrSelector.substitute(key, then, interpreter);
      }
      // Push the current selection back onto the stack.
      interpreter.pushScope(scope);
    }
    return selected;
  }

  override andThen(then: Selector): Selector {
    return new GetAttrSelector(this.item, this.then.andThen(then));
  }

  override get typeOrder(): number {
    return 13;
  }

  override compareTo(that: unknown): number {
    if (that instanceof GetAttrSelector) {
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
    } else if (that instanceof GetAttrSelector) {
      return this.item.equals(that.item) && this.then.equivalentTo(that.then, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof GetAttrSelector) {
      return this.item.equals(that.item) && this.then.equals(that.then);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(GetAttrSelector),
        this.item.hashCode()), this.then.hashCode()));
  }

  override debugThen<T>(output: Output<T>): Output<T> {
    output = output.write(46/*'.'*/).write("getAttr").write(40/*'('*/)
                   .debug(this.item).write(41/*')'*/);
    output = this.then.debugThen(output);
    return output;
  }

  override clone(): Selector {
    return new GetAttrSelector(this.item.clone(), this.then.clone());
  }
}
