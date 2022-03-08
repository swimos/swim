// Copyright 2015-2022 Swim.inc
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
import {Selector} from "./Selector";
import {AnyInterpreter, Interpreter} from "../"; // forward import

/** @public */
export class ChildrenSelector extends Selector {
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
      const scope = interpreter.popScope().toValue();
      // Only records can have children.
      if (scope instanceof Record) {
        const children = scope.iterator();
        // For each child, while none have been selected:
        while (selected === void 0 && children.hasNext()) {
          const child = children.next().value!;
          // Push the child onto the scope stack.
          interpreter.pushScope(child);
          // Subselect the child.
          selected = this.then.forSelected(interpreter, callback, thisArg);
          // Pop the child off of the scope stack.
          interpreter.popScope();
        }
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
      // Only records can have children.
      if (scope instanceof Record) {
        const children = scope.iterator();
        // For each child:
        while (children.hasNext()) {
          const oldChild = children.next().value!;
          // Push the child onto the scope stack.
          interpreter.pushScope(oldChild);
          // Transform the child.
          const newChild = this.then.mapSelected(interpreter, transform);
          // Pop the child off the scope stack.
          interpreter.popScope();
          if (newChild.isDefined()) {
            // Update the child, if its identity changed.
            if (newChild !== oldChild) {
              children.set(newChild);
            }
          } else {
            // Remove the child, if it transformed to Absent.
            children.delete();
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
    let then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new ChildrenSelector(then as Selector);
  }

  override andThen(then: Selector): Selector {
    return new ChildrenSelector(this.then.andThen(then));
  }

  override get typeOrder(): number {
    return 17;
  }

  override compareTo(that: unknown): number {
    if (that instanceof ChildrenSelector) {
      return this.then.compareTo(that.then);
    } else if (that instanceof Item) {
      return Numbers.compare(this.typeOrder, that.typeOrder);
    }
    return NaN;
  }

  override equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ChildrenSelector) {
      return this.then.equivalentTo(that.then, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ChildrenSelector) {
      return this.then.equals(that.then);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Constructors.hash(ChildrenSelector), this.then.hashCode()));
  }

  override debugThen<T>(output: Output<T>): Output<T> {
    output = output.write(46/*'.'*/).write("children").write(40/*'('*/).write(41/*')'*/);
    output = this.then.debugThen(output);
    return output;
  }

  override clone(): Selector {
    return new ChildrenSelector(this.then.clone());
  }
}
