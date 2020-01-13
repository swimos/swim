// Copyright 2015-2020 SWIM.AI inc.
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

export class KeysSelector extends Selector {
  /** @hidden */
  readonly _then: Selector;

  constructor(then: Selector) {
    super();
    this._then = then;
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
      // Pop the current selection off of the stack to take it out of scope.
      const scope = interpreter.popScope();
      if (scope instanceof Item.Record) {
        const children = scope.iterator();
        // For each child, while none have been selected:
        while (selected === void 0 && children.hasNext()) {
          const child = children.next().value!;
          // Only fields can have keys.
          if (child instanceof Item.Field) {
            // Push the child key onto the scope stack.
            interpreter.pushScope(child.key);
            // Subselect the child key.
            selected = this._then.forSelected(interpreter, callback, thisArg);
            // Pop the child key off of the scope stack.
            interpreter.popScope();
          }
        }
      } else if (scope instanceof Item.Field) {
        // Push the key onto the scope stack.
        interpreter.pushScope(scope.key);
        // Subselect the key.
        selected = this._then.forSelected(interpreter, callback, thisArg);
        // Pop the key off of the scope stack.
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
      let scope = interpreter.popScope();
      if (scope instanceof Item.Record) {
        const children = scope.iterator();
        while (children.hasNext()) {
          const child = children.next().value!;
          if (child instanceof Item.Field) {
            const oldKey = child.key;
            // Push the key onto the scope stack.
            interpreter.pushScope(oldKey);
            // Subselect the key.
            const newKey = this._then.mapSelected(interpreter, transform, thisArg).toValue();
            // Pop the key off of the scope stack.
            interpreter.popScope();
            if (newKey.isDefined()) {
              if (oldKey !== newKey) {
                if (scope instanceof Item.Attr && newKey instanceof Item.Text) {
                  children.set(Item.Attr.of(newKey, scope.toValue()));
                } else {
                  children.set(Item.Slot.of(newKey, scope.toValue()));
                }
              }
            } else {
              children.delete();
            }
          }
        }
      } else if (scope instanceof Item.Field) {
        const oldKey = scope.key;
        // Push the key onto the scope stack.
        interpreter.pushScope(oldKey);
        // Subselect the key.
        const newKey = this._then.mapSelected(interpreter, transform, thisArg).toValue();
        // Pop the key off of the scope stack.
        interpreter.popScope();
        if (newKey.isDefined()) {
          if (oldKey !== newKey) {
            if (scope instanceof Item.Attr && newKey instanceof Item.Text) {
              scope = Item.Attr.of(newKey, scope.toValue());
            } else {
              scope = Item.Slot.of(newKey, scope.toValue());
            }
          }
        } else {
          scope = Item.absent();
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
    let then = this._then.substitute(interpreter);
    if (!(then instanceof Selector)) {
      then = this._then;
    }
    return new KeysSelector(then as Selector);
  }

  andThen(then: Selector): Selector {
    return new KeysSelector(this._then.andThen(then));
  }

  typeOrder(): number {
    return 15;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof KeysSelector) {
      return this._then.compareTo(that._then);
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof KeysSelector) {
      return this._then.equals(that._then);
    }
    return false;
  }

  hashCode(): number {
    if (KeysSelector._hashSeed === void 0) {
      KeysSelector._hashSeed = Murmur3.seed(KeysSelector);
    }
    return Murmur3.mash(Murmur3.mix(KeysSelector._hashSeed, this._then.hashCode()));
  }

  debugThen(output: Output): void {
    output = output.write(46/*'.'*/).write("keys").write(40/*'('*/).write(41/*')'*/);
    this._then.debugThen(output);
  }

  clone(): Selector {
    return new KeysSelector(this._then.clone());
  }

  private static _hashSeed?: number;
}
Item.KeysSelector = KeysSelector;
