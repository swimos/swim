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

import {AnyItem, Item} from "./Item";
import {AnyValue, Value} from "./Value";
import {Operator} from "./Operator";

export abstract class Expression extends Value {
  /** @hidden */
  constructor() {
    super();
  }

  conditional(thenTerm: Value, elseTerm: Value): Value;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item;
  conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item {
    thenTerm = Item.fromAny(thenTerm);
    elseTerm = Item.fromAny(elseTerm);
    return new Item.ConditionalOperator(this, thenTerm, elseTerm);
  }

  or(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.OrOperator(this, that);
  }

  and(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.AndOperator(this, that);
  }

  bitwiseOr(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.BitwiseOrOperator(this, that);
  }

  bitwiseXor(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.BitwiseXorOperator(this, that);
  }

  bitwiseAnd(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.BitwiseAndOperator(this, that);
  }

  lt(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.LtOperator(this, that);
  }

  le(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.LeOperator(this, that);
  }

  eq(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.EqOperator(this, that);
  }

  ne(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.NeOperator(this, that);
  }

  ge(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.GeOperator(this, that);
  }

  gt(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.GtOperator(this, that);
  }

  plus(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.PlusOperator(this, that);
  }

  minus(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.MinusOperator(this, that);
  }

  times(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.TimesOperator(this, that);
  }

  divide(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.DivideOperator(this, that);
  }

  modulo(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new Item.ModuloOperator(this, that);
  }

  not(): Operator {
    return new Item.NotOperator(this);
  }

  bitwiseNot(): Operator {
    return new Item.BitwiseNotOperator(this);
  }

  negative(): Operator {
    return new Item.NegativeOperator(this);
  }

  positive(): Operator {
    return new Item.PositiveOperator(this);
  }

  inverse(): Operator {
    return new Item.DivideOperator(Item.Num.positiveOne(), this);
  }

  toAny(): AnyValue {
    return this;
  }
}
Item.Expression = Expression;
