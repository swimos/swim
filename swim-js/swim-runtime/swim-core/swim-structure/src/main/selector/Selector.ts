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

import {Lazy} from "@swim/util";
import type {Output} from "@swim/codec";
import {AnyItem, Item} from "../Item";
import {AnyValue, Value} from "../Value";
import {Record} from "../Record";
import {AnyText, Text} from "../Text";
import {AnyNum, Num} from "../Num";
import {Expression} from "../Expression";
import type {Operator} from "../operator/Operator";
import {InvokeOperator} from "../operator/InvokeOperator";
import {IdentitySelector} from "../"; // forward import
import {GetSelector} from "../"; // forward import
import {GetAttrSelector} from "../"; // forward import
import {GetItemSelector} from "../"; // forward import
import {KeysSelector} from "../"; // forward import
import {ValuesSelector} from "../"; // forward import
import {ChildrenSelector} from "../"; // forward import
import {DescendantsSelector} from "../"; // forward import
import {FilterSelector} from "../"; // forward import
import {LiteralSelector} from "../"; // forward import
import {AnyInterpreter, Interpreter} from "../"; // forward import

/** @public */
export abstract class Selector extends Expression {
  /** @internal */
  constructor() {
    super();
  }

  override isConstant(): boolean {
    return false;
  }

  /**
   * The `Selector` that this `Selector` uses to match sub-selections.
   */
  abstract readonly then: Selector;

  abstract forSelected<T>(interpreter: Interpreter,
                          callback: (interpreter: Interpreter) => T | undefined): T | undefined;
  abstract forSelected<T, S>(interpreter: Interpreter,
                             callback: (this: S, interpreter: Interpreter) => T | undefined,
                             thisArg: S): T | undefined;

  abstract mapSelected(interpreter: Interpreter,
                       transform: (interpreter: Interpreter) => Item): Item;
  abstract mapSelected<S>(interpreter: Interpreter,
                          transform: (this: S, interpreter: Interpreter) => Item,
                          thisArg: S): Item;

  override evaluate(interpreter: AnyInterpreter): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const selected = Record.create();
    this.forSelected(interpreter, function (interpreter: Interpreter): void {
      const scope = interpreter.peekScope();
      if (scope !== void 0) {
        selected.push(scope);
      }
    }, this);
    return selected.isEmpty() ? Item.absent() : selected.flattened();
  }

  abstract override substitute(interpreter: AnyInterpreter): Item;

  abstract andThen(then: Selector): Selector;

  override get(key: AnyValue): Selector {
    key = Value.fromAny(key);
    return this.andThen(new GetSelector(key, Selector.identity()));
  }

  override getAttr(key: AnyText): Selector {
    key = Text.fromAny(key);
    return this.andThen(new GetAttrSelector(key, Selector.identity()));
  }

  override getItem(index: AnyNum): Selector {
    index = Num.fromAny(index);
    return this.andThen(new GetItemSelector(index, Selector.identity()));
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

  override filter(predicate?: AnyItem): Selector {
    if (arguments.length === 0) {
      return new FilterSelector(this, Selector.identity());
    } else {
      predicate = Item.fromAny(predicate);
      return this.andThen(predicate.filter());
    }
  }

  override invoke(args: Value): Operator {
    return new InvokeOperator(this, args);
  }

  override get precedence(): number {
    return 11;
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("Selector").write(46/*'.'*/).write("identity").write(40/*'('*/).write(41/*')'*/);
    output = this.debugThen(output);
    return output;
  }

  abstract debugThen<T>(output: Output<T>): Output<T>;

  abstract override clone(): Selector;

  @Lazy
  static identity(): Selector {
    return new IdentitySelector();
  }

  static get(key: AnyValue): Selector {
    key = Value.fromAny(key);
    return new GetSelector(key, Selector.identity());
  }

  static getAttr(key: AnyText): Selector {
    key = Text.fromAny(key);
    return new GetAttrSelector(key, Selector.identity());
  }

  static getItem(index: AnyNum): Selector {
    index = Num.fromAny(index);
    return new GetItemSelector(index, Selector.identity());
  }

  @Lazy
  static keys(): Selector {
    return new KeysSelector(Selector.identity());
  }

  @Lazy
  static values(): Selector {
    return new ValuesSelector(Selector.identity());
  }

  @Lazy
  static children(): Selector {
    return new ChildrenSelector(Selector.identity());
  }

  @Lazy
  static descendants(): Selector {
    return new DescendantsSelector(Selector.identity());
  }

  static literal(item: AnyItem): Selector {
    item = Item.fromAny(item);
    if (!(item instanceof Selector)) {
      item = new LiteralSelector(item, Selector.identity());
    }
    return item as Selector;
  }
}
