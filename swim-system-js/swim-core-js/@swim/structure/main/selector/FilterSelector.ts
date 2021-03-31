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

import {Murmur3, Numbers, Constructors} from "@swim/util";
import type {Output} from "@swim/codec";
import {AnyItem, Item} from "../Item";
import {Selector} from "./Selector";
import {AnyInterpreter, Interpreter} from "../"; // forward import

export class FilterSelector extends Selector {
  constructor(predicate: Selector, then: Selector) {
    super();
    Object.defineProperty(this, "predicate", {
      value: predicate,
      enumerable: true,
    });
    Object.defineProperty(this, "then", {
      value: then,
      enumerable: true,
    });
  }

  declare readonly predicate: Selector;

  declare readonly then: Selector;

  forSelected<T>(interpreter: Interpreter,
                 callback: (interpreter: Interpreter) => T | undefined): T | undefined;
  forSelected<T, S>(interpreter: Interpreter,
                    callback: (this: S, interpreter: Interpreter) => T | undefined,
                    thisArg: S): T | undefined;
  forSelected<T, S>(interpreter: Interpreter,
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

  mapSelected(interpreter: Interpreter,
              transform: (interpreter: Interpreter) => Item): Item;
  mapSelected<S>(interpreter: Interpreter,
                 transform: (this: S, interpreter: Interpreter) => Item,
                 thisArg: S): Item;
  mapSelected<S>(interpreter: Interpreter,
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

  substitute(interpreter: AnyInterpreter): Item {
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

  andThen(then: Selector): Selector {
    return new FilterSelector(this.predicate, this.then.andThen(then));
  }

  filter(predicate?: AnyItem): Selector {
    if (arguments.length === 0) {
      return this;
    } else {
      predicate = Item.fromAny(predicate);
      return this.andThen(predicate.filter());
    }
  }

  get typeOrder(): number {
    return 19;
  }

  compareTo(that: unknown): number {
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

  equivalentTo(that: unknown, epsilon?: number): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FilterSelector) {
      return this.predicate.equivalentTo(that.predicate, epsilon)
          && this.then.equivalentTo(that.then, epsilon);
    }
    return false;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof FilterSelector) {
      return this.predicate.equals(that.predicate) && this.then.equals(that.then);
    }
    return false;
  }

  hashCode(): number {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Constructors.hash(FilterSelector),
        this.predicate.hashCode()), this.then.hashCode()));
  }

  debugThen(output: Output): void {
    output = output.write(46/*'.'*/).write("filter").write(40/*'('*/)
        .debug(this.predicate).write(41/*')'*/);
    this.then.debugThen(output);
  }

  clone(): Selector {
    return new FilterSelector(this.predicate.clone(), this.then.clone());
  }
}
