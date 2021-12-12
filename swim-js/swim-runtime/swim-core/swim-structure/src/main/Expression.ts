// Copyright 2015-2021 Swim.inc
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
import {Num} from "./Num";
import type {Operator} from "./operator/Operator";
import {ConditionalOperator} from "./"; // forward import
import {OrOperator} from "./"; // forward import
import {AndOperator} from "./"; // forward import
import {BitwiseOrOperator} from "./"; // forward import
import {BitwiseXorOperator} from "./"; // forward import
import {BitwiseAndOperator} from "./"; // forward import
import {LtOperator} from "./"; // forward import
import {LeOperator} from "./"; // forward import
import {EqOperator} from "./"; // forward import
import {NeOperator} from "./"; // forward import
import {GeOperator} from "./"; // forward import
import {GtOperator} from "./"; // forward import
import {PlusOperator} from "./"; // forward import
import {MinusOperator} from "./"; // forward import
import {TimesOperator} from "./"; // forward import
import {DivideOperator} from "./"; // forward import
import {ModuloOperator} from "./"; // forward import
import {NotOperator} from "./"; // forward import
import {BitwiseNotOperator} from "./"; // forward import
import {NegativeOperator} from "./"; // forward import
import {PositiveOperator} from "./"; // forward import

/** @public */
export abstract class Expression extends Value {
  /** @internal */
  constructor() {
    super();
  }

  override conditional(thenTerm: Value, elseTerm: Value): Value;
  override conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item;
  override conditional(thenTerm: AnyItem, elseTerm: AnyItem): Item {
    thenTerm = Item.fromAny(thenTerm);
    elseTerm = Item.fromAny(elseTerm);
    return new ConditionalOperator(this, thenTerm, elseTerm);
  }

  override or(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new OrOperator(this, that);
  }

  override and(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new AndOperator(this, that);
  }

  override bitwiseOr(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new BitwiseOrOperator(this, that);
  }

  override bitwiseXor(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new BitwiseXorOperator(this, that);
  }

  override bitwiseAnd(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new BitwiseAndOperator(this, that);
  }

  override lt(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new LtOperator(this, that);
  }

  override le(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new LeOperator(this, that);
  }

  override eq(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new EqOperator(this, that);
  }

  override ne(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new NeOperator(this, that);
  }

  override ge(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new GeOperator(this, that);
  }

  override gt(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new GtOperator(this, that);
  }

  override plus(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new PlusOperator(this, that);
  }

  override minus(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new MinusOperator(this, that);
  }

  override times(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new TimesOperator(this, that);
  }

  override divide(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new DivideOperator(this, that);
  }

  override modulo(that: AnyItem): Operator {
    that = Item.fromAny(that);
    return new ModuloOperator(this, that);
  }

  override not(): Operator {
    return new NotOperator(this);
  }

  override bitwiseNot(): Operator {
    return new BitwiseNotOperator(this);
  }

  override negative(): Operator {
    return new NegativeOperator(this);
  }

  override positive(): Operator {
    return new PositiveOperator(this);
  }

  override inverse(): Operator {
    return new DivideOperator(Num.one, this);
  }

  override toAny(): AnyValue {
    return this;
  }
}
