// Copyright 2015-2023 Swim.inc
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
import {AnyItem, Item} from "../Item";
import {Selector} from "./Selector";
import {AnyInterpreter, Interpreter} from "../"; // forward import

/** @public */
export class FilterSelector extends Selector {
  constructor(predicate: Selector, then: Selector) {
    super();
    this.predicate = predicate;
    this.then = then;
  }

  readonly predicate: Selector;

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
      // If the filter matches the selection scope:
      if (this.filterSelected(interpreter)) {
        // Then subselect the selection scope.
        selected = this.then.forSelected(interpreter, callback, thisArg);
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
      // If the filter matches the selection scope:
      if (this.filterSelected(interpreter)) {
        // Then transform the selection scope.
        result = this.then.mapSelected(interpreter, transform, thisArg);
      } else {
        result = interpreter.peekScope().toValue();
      }
    } else {
      result = Item.absent();
    }
    interpreter.didTransform(this, result);
    return result;
  }

  override substitute(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    let predicate = this.predicate.substitute(interpreter);
    if (!(predicate instanceof Selector)) {
      predicate = this.predicate;
    }
    let then = this.then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this.then;
    }
    return new FilterSelector(predicate as Selector, then as Selector);
  }

  protected filterSelected(interpreter: Interpreter): boolean {
    return this.predicate.forSelected(interpreter, this.selected, this) !== void 0;
  }

  protected selected(interpreter: Interpreter): null {
    return null;
  }

  override andThen(then: Selector): Selector {
    return new FilterSelector(this.predicate, this.then.andThen(then));
  }

  override filter(predicate?: AnyItem): Selector {
    if (arguments.length === 0) {
      return this;
    } else {
      predicate = Item.fromAny(predicate);
      return this.andThen(predicate.filter());
    }
  }

  override get typeOrder(): number {
    return 19;
  }

  override compareTo(that: unknown): number {
    if (that instanceof FilterSelector) {
      let order = this.predicate.compareTo(that.predicate);
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
    } else if (that instanceof FilterSelector) {
      return this.predicate.equivalentTo(that.predicate, epsilon)
          && this.then.equivalentTo(that.then, epsilon);
    }
    return false;
  }

  override equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FilterSelector) {
      return this.predicate.equals(that.predicate) && this.then.equals(that.then);
    }
    return false;
  }

  override hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(FilterSelector),
        this.predicate.hashCode()), this.then.hashCode()));
  }

  override debugThen<T>(output: Output<T>): Output<T> {
    output = output.write(46/*'.'*/).write("filter").write(40/*'('*/)
                   .debug(this.predicate).write(41/*')'*/);
    output = this.then.debugThen(output);
    return output;
  }

  override clone(): Selector {
    return new FilterSelector(this.predicate.clone(), this.then.clone());
  }
}
