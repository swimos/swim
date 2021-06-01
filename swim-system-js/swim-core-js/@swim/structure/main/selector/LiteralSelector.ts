// Copyright 2015-2021 Swim inc.
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
import {Selector} from "./Selector";
import {AnyInterpreter, Interpreter} from "../"; // forward import

export class LiteralSelector extends Selector {
  constructor(item: Item, then: Selector) {
    super();
    Object.defineProperty(this, "item", {
      value: item.commit(),
      enumerable: true,
    });
    Object.defineProperty(this, "then", {
      value: then,
      enumerable: true,
    });
  }

  readonly item!: Item;

  override readonly then!: Selector;

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
      const literal = this.item.evaluate(interpreter);
      if (literal.isDefined()) {
        // Push the literal onto the scope stack.
        interpreter.pushScope(literal);
        // Subselect the literal.
        selected = this.then.forSelected(interpreter, callback, thisArg);
        // Pop the literal off of the scope stack.
        interpreter.popScope();
      }
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
      let literal = this.item.evaluate(interpreter);
      if (literal.isDefined()) {
        // Push the literal onto the scope stack.
        interpreter.pushScope(literal);
        // Transform the literal.
        literal = this.then.mapSelected(interpreter, transform, thisArg);
        // Pop the literal off of the scope stack.
        interpreter.popScope();
      }
      result = literal;
    } else {
      result = Item.absent();
    }
    interpreter.didTransform(this, result);
    return result;
  }

  override substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const item = this.item.substitute(interpreter);
    let then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new LiteralSelector(item, then as Selector);
  }

  override andThen(then: Selector): Selector {
    return new LiteralSelector(this.item, this.then.andThen(then));
  }

  override get precedence(): number {
    return this.item.precedence;
  }

  override get typeOrder(): number {
    return 11;
  }

  override compareTo(that: unknown): number {
    if (that instanceof LiteralSelector) {
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
    } else if (that instanceof LiteralSelector) {
      return this.item.equivalentTo(that.item, epsilon)
          && this.then.equivalentTo(that.then, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof LiteralSelector) {
      return this.item.equals(that.item) && this.then.equals(that.then);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(LiteralSelector),
        this.item.hashCode()), this.then.hashCode()));
  }

  override debug(output: Output): void {
    output = output.write("Selector").write(46/*'.'*/).write("literal").write(40/*'('*/)
        .debug(this.item).write(41/*')'*/);
    this.then.debugThen(output);
  }

  override debugThen(output: Output): void {
    // nop
  }

  override clone(): Selector {
    return new LiteralSelector(this.item.clone(), this.then.clone());
  }
}
