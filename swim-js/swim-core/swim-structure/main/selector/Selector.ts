// Copyright 2015-2023 Nstream, inc.
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
import type {ItemLike} from "../Item";
import {Item} from "../Item";
import type {ValueLike} from "../Value";
import {Value} from "../Value";
import {Record} from "../Record";
import type {TextLike} from "../Text";
import {Text} from "../Text";
import type {NumLike} from "../Num";
import {Num} from "../Num";
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
import type {InterpreterLike} from "../interpreter/Interpreter";
import {Interpreter} from "../"; // forward import

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

  override evaluate(interpreter: InterpreterLike): Item {
    interpreter = Interpreter.fromLike(interpreter);
    let selected = Item.absent();
    let count = 0;
    this.forSelected(interpreter, function (interpreter: Interpreter): void {
      const scope = interpreter.peekScope();
      if (scope !== void 0) {
        if (count === 0) {
          selected = scope;
        } else {
          if (count === 1) {
            const record = Record.create();
            record.push(selected);
            selected = record;
          }
          (selected as Record).push(scope);
        }
        count += 1;
      }
    }, this);
    return selected;
  }

  abstract override substitute(interpreter: InterpreterLike): Item;

  abstract andThen(then: Selector): Selector;

  override get(key: ValueLike): Selector {
    key = Value.fromLike(key);
    return this.andThen(new GetSelector(key, Selector.identity()));
  }

  override getAttr(key: TextLike): Selector {
    key = Text.fromLike(key);
    return this.andThen(new GetAttrSelector(key, Selector.identity()));
  }

  override getItem(index: NumLike): Selector {
    index = Num.fromLike(index);
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

  override filter(predicate?: ItemLike): Selector {
    if (arguments.length === 0) {
      return new FilterSelector(this, Selector.identity());
    } else {
      predicate = Item.fromLike(predicate);
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

  static get(key: ValueLike): Selector {
    key = Value.fromLike(key);
    return new GetSelector(key, Selector.identity());
  }

  static getAttr(key: TextLike): Selector {
    key = Text.fromLike(key);
    return new GetAttrSelector(key, Selector.identity());
  }

  static getItem(index: NumLike): Selector {
    index = Num.fromLike(index);
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

  static literal(item: ItemLike): Selector {
    item = Item.fromLike(item);
    if (!(item instanceof Selector)) {
      item = new LiteralSelector(item, Selector.identity());
    }
    return item as Selector;
  }
}
