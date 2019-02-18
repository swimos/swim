// Copyright 2015-2019 SWIM.AI inc.
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
import {Selector} from "../Selector";
import {AnyInterpreter, Interpreter} from "../Interpreter";

export class LiteralSelector extends Selector {
  /** @hidden */
  readonly _item: Item;
  /** @hidden */
  readonly _then: Selector;

  constructor(item: Item, then: Selector) {
    super();
    this._item = item.commit();
    this._then = then;
  }

  item(): Item {
    return this._item;
  }

  then(): Selector {
    return this._then;
  }

  forSelected<T, S = unknown>(interpreter: Interpreter,
                              callback: (this: S, interpreter: Interpreter) => T | undefined,
                              thisArg?: S): T | undefined {
    let selected: T | undefined;
    interpreter.willSelect(this);
    if (interpreter.scopeDepth() !== 0) {
      const literal = this._item.evaluate(interpreter);
      if (literal.isDefined()) {
        // Push the literal onto the scope stack.
        interpreter.pushScope(literal);
        // Subselect the literal.
        selected = this._then.forSelected(interpreter, callback, thisArg);
        // Pop the literal off of the scope stack.
        interpreter.popScope();
      }
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
      let literal = this._item.evaluate(interpreter);
      if (literal.isDefined()) {
        // Push the literal onto the scope stack.
        interpreter.pushScope(literal);
        // Transform the literal.
        literal = this._then.mapSelected(interpreter, transform, thisArg);
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

  substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const item = this._item.substitute(interpreter);
    let then = this._then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this._then;
    }
    return new LiteralSelector(item, then as Selector);
  }

  andThen(then: Selector): Selector {
    return new LiteralSelector(this._item, this._then.andThen(then));
  }

  precedence(): number {
    return this._item.precedence();
  }

  typeOrder(): number {
    return 11;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof LiteralSelector) {
      let order = this._item.compareTo(that._item);
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
    } else if (that instanceof LiteralSelector) {
      return this._item.equals(that._item) && this._then.equals(that._then);
    }
    return false;
  }

  hashCode(): number {
    if (LiteralSelector._hashSeed === void 0) {
      LiteralSelector._hashSeed = Murmur3.seed(LiteralSelector);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(LiteralSelector._hashSeed,
        this._item.hashCode()), this._then.hashCode()));
  }

  debug(output: Output): void {
    output = output.write("Selector").write(46/*'.'*/).write("literal").write(40/*'('*/)
        .debug(this._item).write(41/*')'*/);
    this._then.debugThen(output);
  }

  debugThen(output: Output): void {
    // nop
  }

  clone(): Selector {
    return new LiteralSelector(this._item.clone(), this._then.clone());
  }

  private static _hashSeed?: number;
}
Item.LiteralSelector = LiteralSelector;
