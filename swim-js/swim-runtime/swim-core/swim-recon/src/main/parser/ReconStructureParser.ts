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

import type {Builder} from "@swim/util";
import type {Output} from "@swim/codec";
import {
  Item,
  Attr,
  Slot,
  Value,
  Record,
  Data,
  Text,
  Num,
  Bool,
  Selector,
  AndOperator,
  BitwiseAndOperator,
  BitwiseNotOperator,
  BitwiseOrOperator,
  BitwiseXorOperator,
  DivideOperator,
  EqOperator,
  GeOperator,
  GtOperator,
  InvokeOperator,
  LeOperator,
  LtOperator,
  MinusOperator,
  ModuloOperator,
  NeOperator,
  NegativeOperator,
  NotOperator,
  OrOperator,
  PlusOperator,
  PositiveOperator,
  TimesOperator,
} from "@swim/structure";
import {ReconParser} from "./ReconParser";

/** @public */
export class ReconStructureParser extends ReconParser<Item, Value> {
  override isDistinct(value: Value): boolean {
    return value.isDistinct();
  }

  override item(value: Value): Item {
    return value;
  }

  override value(item: Item): Value {
    return item.toValue();
  }

  override attr(key: Value, value?: Value): Item {
    if (arguments.length === 1) {
      return Attr.of(key as Text);
    } else {
      return Attr.of(key as Text, value);
    }
  }

  override slot(key: Value, value?: Value): Item {
    if (arguments.length === 1) {
      return Slot.of(key);
    } else {
      return Slot.of(key, value);
    }
  }

  override valueBuilder(): Builder<Item, Value> {
    return Value.builder();
  }

  override recordBuilder(): Builder<Item, Value> {
    return Record.create();
  }

  override dataOutput(): Output<Value> {
    return Data.output();
  }

  override textOutput(): Output<Value> {
    return Text.output();
  }

  override ident(value: Value): Value {
    if (value instanceof Text) {
      const string = value.stringValue();
      if (string === "true") {
        return Bool.from(true);
      } else if (string === "false") {
        return Bool.from(false);
      }
    }
    return value;
  }

  override num(value: number | string): Value {
    if (typeof value === "number") {
      return Num.from(value);
    } else if (typeof value === "string") {
      return Num.from(+value);
    } else {
      throw new TypeError("" + value);
    }
  }

  override uint32(value: number): Value {
    return Num.uint32(value);
  }

  override uint64(value: number): Value {
    return Num.uint64(value);
  }

  override bool(value: boolean): Value {
    return Bool.from(value);
  }

  override selector(): Value {
    return Selector.identity();
  }

  override extant(): Value {
    return Value.extant();
  }

  override absent(): Value {
    return Value.absent();
  }

  override conditional(ifTerm: Value, thenTerm: Value, elseTerm: Value): Value {
    return ifTerm.conditional(thenTerm, elseTerm);
  }

  override or(lhs: Value, rhs: Value): Value {
    return new OrOperator(lhs, rhs);
  }

  override and(lhs: Value, rhs: Value): Value {
    return new AndOperator(lhs, rhs);
  }

  override bitwiseOr(lhs: Value, rhs: Value): Value {
    return new BitwiseOrOperator(lhs, rhs);
  }

  override bitwiseXor(lhs: Value, rhs: Value): Value {
    return new BitwiseXorOperator(lhs, rhs);
  }

  override bitwiseAnd(lhs: Value, rhs: Value): Value {
    return new BitwiseAndOperator(lhs, rhs);
  }

  override lt(lhs: Value, rhs: Value): Value {
    return new LtOperator(lhs, rhs);
  }

  override le(lhs: Value, rhs: Value): Value {
    return new LeOperator(lhs, rhs);
  }

  override eq(lhs: Value, rhs: Value): Value {
    return new EqOperator(lhs, rhs);
  }

  override ne(lhs: Value, rhs: Value): Value {
    return new NeOperator(lhs, rhs);
  }

  override ge(lhs: Value, rhs: Value): Value {
    return new GeOperator(lhs, rhs);
  }

  override gt(lhs: Value, rhs: Value): Value {
    return new GtOperator(lhs, rhs);
  }

  override plus(lhs: Value, rhs: Value): Value {
    return new PlusOperator(lhs, rhs);
  }

  override minus(lhs: Value, rhs: Value): Value {
    return new MinusOperator(lhs, rhs);
  }

  override times(lhs: Value, rhs: Value): Value {
    return new TimesOperator(lhs, rhs);
  }

  override divide(lhs: Value, rhs: Value): Value {
    return new DivideOperator(lhs, rhs);
  }

  override modulo(lhs: Value, rhs: Value): Value {
    return new ModuloOperator(lhs, rhs);
  }

  override not(rhs: Value): Value {
    return new NotOperator(rhs);
  }

  override bitwiseNot(rhs: Value): Value {
    return new BitwiseNotOperator(rhs);
  }

  override negative(rhs: Value): Value {
    if (rhs instanceof Num) {
      return rhs.negative();
    } else {
      return new NegativeOperator(rhs);
    }
  }

  override positive(rhs: Value): Value {
    return new PositiveOperator(rhs);
  }

  override invoke(func: Value, args: Value): Value {
    return new InvokeOperator(func, args);
  }

  override lambda(bindings: Value, template: Value): Value {
    return bindings.lambda(template);
  }

  override get(selector: Value, key: Value): Value {
    return selector.get(key);
  }

  override getAttr(selector: Value, key: Value): Value {
    return selector.getAttr(key as Text);
  }

  override getItem(selector: Value, index: Value): Item {
    return selector.getItem(index as Num);
  }

  override children(selector: Value): Value {
    return Selector.literal(selector).children();
  }

  override descendants(selector: Value): Value {
    return Selector.literal(selector).descendants();
  }

  override keys(selector: Value): Value {
    return Selector.literal(selector).keys();
  }

  override values(selector: Value): Value {
    return Selector.literal(selector).values();
  }

  override filter(selector: Value, predicate: Value): Value {
    return selector.filter(predicate);
  }
}
