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

import {Builder} from "@swim/util";
import {Output} from "@swim/codec";
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

export class ReconStructureParser extends ReconParser<Item, Value> {
  isDistinct(value: Value): boolean {
    return value.isDistinct();
  }

  item(value: Value): Item {
    return value;
  }

  value(item: Item): Value {
    return item.toValue();
  }

  attr(key: Value, value?: Value): Item {
    return Attr.of.apply(Attr, arguments);
  }

  slot(key: Value, value?: Value): Item {
    return Slot.of.apply(Slot, arguments);
  }

  valueBuilder(): Builder<Item, Value> {
    return Value.builder();
  }

  recordBuilder(): Builder<Item, Value> {
    return Record.create();
  }

  dataOutput(): Output<Value> {
    return Data.output();
  }

  textOutput(): Output<Value> {
    return Text.output();
  }

  ident(value: Value): Value {
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

  num(value: number | string): Value {
    if (typeof value === "number") {
      return Num.from(value);
    } else if (typeof value === "string") {
      return Num.from(+value);
    } else {
      throw new TypeError("" + value);
    }
  }

  uint32(value: number): Value {
    return Num.uint32(value);
  }

  uint64(value: number): Value {
    return Num.uint64(value);
  }

  bool(value: boolean): Value {
    return Bool.from(value);
  }

  selector(): Value {
    return Selector.identity();
  }

  extant(): Value {
    return Value.extant();
  }

  absent(): Value {
    return Value.absent();
  }

  conditional(ifTerm: Value, thenTerm: Value, elseTerm: Value): Value {
    return ifTerm.conditional(thenTerm, elseTerm);
  }

  or(lhs: Value, rhs: Value): Value {
    return new OrOperator(lhs, rhs);
  }

  and(lhs: Value, rhs: Value): Value {
    return new AndOperator(lhs, rhs);
  }

  bitwiseOr(lhs: Value, rhs: Value): Value {
    return new BitwiseOrOperator(lhs, rhs);
  }

  bitwiseXor(lhs: Value, rhs: Value): Value {
    return new BitwiseXorOperator(lhs, rhs);
  }

  bitwiseAnd(lhs: Value, rhs: Value): Value {
    return new BitwiseAndOperator(lhs, rhs);
  }

  lt(lhs: Value, rhs: Value): Value {
    return new LtOperator(lhs, rhs);
  }

  le(lhs: Value, rhs: Value): Value {
    return new LeOperator(lhs, rhs);
  }

  eq(lhs: Value, rhs: Value): Value {
    return new EqOperator(lhs, rhs);
  }

  ne(lhs: Value, rhs: Value): Value {
    return new NeOperator(lhs, rhs);
  }

  ge(lhs: Value, rhs: Value): Value {
    return new GeOperator(lhs, rhs);
  }

  gt(lhs: Value, rhs: Value): Value {
    return new GtOperator(lhs, rhs);
  }

  plus(lhs: Value, rhs: Value): Value {
    return new PlusOperator(lhs, rhs);
  }

  minus(lhs: Value, rhs: Value): Value {
    return new MinusOperator(lhs, rhs);
  }

  times(lhs: Value, rhs: Value): Value {
    return new TimesOperator(lhs, rhs);
  }

  divide(lhs: Value, rhs: Value): Value {
    return new DivideOperator(lhs, rhs);
  }

  modulo(lhs: Value, rhs: Value): Value {
    return new ModuloOperator(lhs, rhs);
  }

  not(rhs: Value): Value {
    return new NotOperator(rhs);
  }

  bitwiseNot(rhs: Value): Value {
    return new BitwiseNotOperator(rhs);
  }

  negative(rhs: Value): Value {
    if (rhs instanceof Num) {
      return rhs.negative();
    } else {
      return new NegativeOperator(rhs);
    }
  }

  positive(rhs: Value): Value {
    return new PositiveOperator(rhs);
  }

  invoke(func: Value, args: Value): Value {
    return new InvokeOperator(func, args);
  }

  lambda(bindings: Value, template: Value): Value {
    return bindings.lambda(template);
  }

  get(selector: Value, key: Value): Value {
    return selector.get(key);
  }

  getAttr(selector: Value, key: Value): Value {
    return selector.getAttr(key as Text);
  }

  getItem(selector: Value, index: Value): Item {
    return selector.getItem(index as Num);
  }

  children(selector: Value): Value {
    return Selector.literal(selector).children();
  }

  descendants(selector: Value): Value {
    return Selector.literal(selector).descendants();
  }

  keys(selector: Value): Value {
    return Selector.literal(selector).keys();
  }

  values(selector: Value): Value {
    return Selector.literal(selector).values();
  }

  filter(selector: Value, predicate: Value): Value {
    return selector.filter(predicate);
  }
}
