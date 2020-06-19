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

import {Output} from "@swim/codec";
import {AnyInterpreter, Interpreter} from "./Interpreter";
import {AnyItem, Item} from "./Item";
import {AnyValue, Value} from "./Value";
import {AnyText} from "./Text";
import {AnyNum} from "./Num";
import {Expression} from "./Expression";
import {IdentitySelector} from "./selector/IdentitySelector";
import {KeysSelector} from "./selector/KeysSelector";
import {ValuesSelector} from "./selector/ValuesSelector";
import {ChildrenSelector} from "./selector/ChildrenSelector";
import {DescendantsSelector} from "./selector/DescendantsSelector";
import {Operator} from "./Operator";

export abstract class Selector extends Expression {
  /** @hidden */
  constructor() {
    super();
  }

  isConstant(): boolean {
    return false;
  }

  /**
   * Returns the `Selector` that this `Selector` uses to match sub-selections.
   */
  abstract then(): Selector;

  abstract forSelected<T, S = unknown>(interpreter: Interpreter,
                                       callback: (this: S, interpreter: Interpreter) => T | undefined,
                                       thisArg?: S): T | undefined;

  abstract mapSelected<S = unknown>(interpreter: Interpreter,
                                    transform: (this: S, interpreter: Interpreter) => Item,
                                    thisArg?: S): Item;

  evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const selected = Item.Record.create();
    this.forSelected(interpreter, function (interpreter: Interpreter): void {
      const scope = interpreter.peekScope();
      if (scope !== void 0) {
        selected.push(scope);
      }
    }, this);
    return selected.isEmpty() ? Item.absent() : selected.flattened();
  }

  abstract substitute(interpreter: AnyInterpreter): Item;

  abstract andThen(then: Selector): Selector;

  get(key: AnyValue): Selector {
    key = Value.fromAny(key);
    return this.andThen(new Item.GetSelector(key, Selector.identity()));
  }

  getAttr(key: AnyText): Selector {
    key = Item.Text.fromAny(key);
    return this.andThen(new Item.GetAttrSelector(key, Selector.identity()));
  }

  getItem(index: AnyNum): Selector {
    index = Item.Num.fromAny(index);
    return this.andThen(new Item.GetItemSelector(index, Selector.identity()));
  }

  keys(): Selector {
    return this.andThen(Selector.keys());
  }

  values(): Selector {
    return this.andThen(Selector.values());
  }

  children(): Selector {
    return this.andThen(Selector.children());
  }

  descendants(): Selector {
    return this.andThen(Selector.descendants());
  }

  filter(predicate?: AnyItem): Selector {
    if (arguments.length === 0) {
      return new Item.FilterSelector(this, Selector.identity());
    } else {
      predicate = Item.fromAny(predicate);
      return this.andThen(predicate.filter());
    }
  }

  invoke(args: Value): Operator {
    return new Item.InvokeOperator(this, args);
  }

  precedence(): number {
    return 11;
  }

  debug(output: Output): void {
    output = output.write("Selector").write(46/*'.'*/).write("identity").write(40/*'('*/).write(41/*')'*/);
    this.debugThen(output);
  }

  abstract debugThen(output: Output): void;

  abstract clone(): Selector;

  /** @hidden */
  static _identity: IdentitySelector; // defined by IdentitySelector
  private static _keys?: KeysSelector;
  private static _values?: ValuesSelector;
  private static _children?: ChildrenSelector;
  private static _descendants?: DescendantsSelector;

  static identity(): Selector {
    return Selector._identity;
  }

  static get(key: AnyValue): Selector {
    key = Value.fromAny(key);
    return new Item.GetSelector(key, Selector.identity());
  }

  static getAttr(key: AnyText): Selector {
    key = Item.Text.fromAny(key);
    return new Item.GetAttrSelector(key, Selector.identity());
  }

  static getItem(index: AnyNum): Selector {
    index = Item.Num.fromAny(index);
    return new Item.GetItemSelector(index, Selector.identity());
  }

  static keys(): Selector {
    if (Selector._keys === void 0) {
      Selector._keys = new Item.KeysSelector(Selector.identity());
    }
    return Selector._keys;
  }

  static values(): Selector {
    if (Selector._values === void 0) {
      Selector._values = new Item.ValuesSelector(Selector.identity());
    }
    return Selector._values;
  }

  static children(): Selector {
    if (Selector._children === void 0) {
      Selector._children = new Item.ChildrenSelector(Selector.identity());
    }
    return Selector._children;
  }

  static descendants(): Selector {
    if (Selector._descendants === void 0) {
      Selector._descendants = new Item.DescendantsSelector(Selector.identity());
    }
    return Selector._descendants;
  }

  static literal(item: AnyItem): Selector {
    item = Item.fromAny(item);
    if (!(item instanceof Selector)) {
      item = new Item.LiteralSelector(item, Selector.identity());
    }
    return item as Selector;
  }
}
Item.Selector = Selector;
