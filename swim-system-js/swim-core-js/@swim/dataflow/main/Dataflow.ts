// Copyright 2015-2021 Swim inc.
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

import {
  Value,
  Record,
  Selector,
  IdentitySelector,
  GetSelector,
  GetAttrSelector,
  GetItemSelector,
  KeysSelector,
  ValuesSelector,
  ChildrenSelector,
  DescendantsSelector,
  FilterSelector,
  Operator,
  BinaryOperator,
  UnaryOperator,
  ConditionalOperator,
  OrOperator,
  AndOperator,
  BitwiseOrOperator,
  BitwiseXorOperator,
  BitwiseAndOperator,
  LtOperator,
  LeOperator,
  EqOperator,
  NeOperator,
  GeOperator,
  GtOperator,
  PlusOperator,
  MinusOperator,
  TimesOperator,
  DivideOperator,
  ModuloOperator,
  NotOperator,
  BitwiseNotOperator,
  NegativeOperator,
  PositiveOperator,
  InvokeOperator,
} from "@swim/structure";
import {Outlet, MapOutlet, KeyOutlet, StreamletScope, ValueInput} from "@swim/streamlet";
import {RecordOutlet} from "./RecordOutlet";
import {GetOutlet} from "./selector/GetOutlet";
import type {BinaryOutlet} from "./operator/BinaryOutlet";
import type {UnaryOutlet} from "./operator/UnaryOutlet";
import {ConditionalOutlet} from "./operator/ConditionalOutlet";
import {OrOutlet} from "./operator/OrOutlet";
import {AndOutlet} from "./operator/AndOutlet";
import {BitwiseOrOutlet} from "./operator/BitwiseOrOutlet";
import {BitwiseXorOutlet} from "./operator/BitwiseXorOutlet";
import {BitwiseAndOutlet} from "./operator/BitwiseAndOutlet";
import {LtOutlet} from "./operator/LtOutlet";
import {LeOutlet} from "./operator/LeOutlet";
import {EqOutlet} from "./operator/EqOutlet";
import {NeOutlet} from "./operator/NeOutlet";
import {GeOutlet} from "./operator/GeOutlet";
import {GtOutlet} from "./operator/GtOutlet";
import {PlusOutlet} from "./operator/PlusOutlet";
import {MinusOutlet} from "./operator/MinusOutlet";
import {TimesOutlet} from "./operator/TimesOutlet";
import {DivideOutlet} from "./operator/DivideOutlet";
import {ModuloOutlet} from "./operator/ModuloOutlet";
import {NotOutlet} from "./operator/NotOutlet";
import {BitwiseNotOutlet} from "./operator/BitwiseNotOutlet";
import {NegativeOutlet} from "./operator/NegativeOutlet";
import {PositiveOutlet} from "./operator/PositiveOutlet";
import {InvokeOutlet} from "./operator/InvokeOutlet";

export const Dataflow = {} as {
  /**
   * Returns an `Outlet` that evaluates the given `expr` in the context of the
   * given `scope`, and updates whenever any dependent expression updates.
   */
  compile(expr: Value, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileSelector(selector: Selector, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileIdentitySelector(scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileGetSelector(selector: GetSelector, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileGetAttrSelector(selector: GetAttrSelector, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileGetItemSelector(selector: GetItemSelector, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileKeysSelector(scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileValuesSelector(scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileChildrenSelector(scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileDescendantsSelector(scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileFilterSelector(selector: FilterSelector, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileOperator(operator: Operator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileConditionalOperator(operator: ConditionalOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileBinaryOperator(operator: BinaryOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileBinaryOutlet(operator: BinaryOperator, outlet: BinaryOutlet, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileOrOperator(operator: OrOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileAndOperator(operator: AndOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileBitwiseOrOperator(operator: BitwiseOrOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileBitwiseXorOperator(operator: BitwiseXorOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileBitwiseAndOperator(operator: BitwiseAndOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileLtOperator(operator: LtOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileLeOperator(operator: LeOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileEqOperator(operator: EqOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileNeOperator(operator: NeOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileGeOperator(operator: GeOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileGtOperator(operator: GtOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compilePlusOperator(operator: PlusOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileMinusOperator(operator: MinusOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileTimesOperator(operator: TimesOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileDivideOperator(operator: DivideOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileModuloOperator(operator: ModuloOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileUnaryOperator(operator: UnaryOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileUnaryOutlet(operator: UnaryOperator, outlet: UnaryOutlet, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileNotOperator(operator: NotOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileBitwiseNotOperator(operator: BitwiseNotOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileNegativeOperator(operator: NegativeOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compilePositiveOperator(operator: PositiveOperator, scope: Outlet<Value>): Outlet<Value>;

  /** @hidden */
  compileInvokeOperator(operator: InvokeOperator, scope: Outlet<Value>): Outlet<Value>;
};

Dataflow.compile = function (expr: Value, scope: Outlet<Value>): Outlet<Value> {
  if (scope instanceof KeyOutlet) {
    const value = scope.get();
    if (Outlet.is<Value>(value)) {
      scope = value;
    }
  }
  if (expr.isConstant()) {
    return new ValueInput<Value>(expr);
  } else if (expr instanceof Selector) {
    return Dataflow.compileSelector(expr, scope);
  } else if (expr instanceof Operator) {
    return Dataflow.compileOperator(expr, scope);
  }
  throw new TypeError("" + expr);
};

Dataflow.compileSelector = function (selector: Selector, scope: Outlet<Value>): Outlet<Value> {
  if (selector instanceof IdentitySelector) {
    return Dataflow.compileIdentitySelector(scope);
  } else if (selector instanceof GetSelector) {
    return Dataflow.compileGetSelector(selector, scope);
  } else if (selector instanceof GetAttrSelector) {
    return Dataflow.compileGetAttrSelector(selector, scope);
  } else if (selector instanceof GetItemSelector) {
    return Dataflow.compileGetItemSelector(selector, scope);
  } else if (selector instanceof KeysSelector) {
    return Dataflow.compileKeysSelector(scope);
  } else if (selector instanceof ValuesSelector) {
    return Dataflow.compileValuesSelector(scope);
  } else if (selector instanceof ChildrenSelector) {
    return Dataflow.compileChildrenSelector(scope);
  } else if (selector instanceof DescendantsSelector) {
    return Dataflow.compileDescendantsSelector(scope);
  } else if (selector instanceof FilterSelector) {
    return Dataflow.compileFilterSelector(selector, scope);
  }
  throw new TypeError("" + selector);
};

Dataflow.compileIdentitySelector = function (scope: Outlet<Value>): Outlet<Value> {
  return scope;
};

Dataflow.compileGetSelector = function (selector: GetSelector, scope: Outlet<Value>): Outlet<Value> {
  const key = selector.item;
  if (key.isConstant()) {
    if (RecordOutlet.is(scope)) {
      const outlet = scope.outlet(key);
      if (outlet !== null) {
        return Dataflow.compile(selector.then, outlet);
      }
    } else if (StreamletScope.is<Value>(scope)) {
      const name = key.stringValue(void 0);
      if (name !== void 0) {
        const outlet = scope.outlet(name);
        if (outlet !== null) {
          return Dataflow.compile(selector.then, outlet);
        }
      }
    }
  } else {
    const getOutlet = new GetOutlet();
    const outlet = Dataflow.compile(key, scope);
    getOutlet.keyInlet.bindInput(outlet);
    getOutlet.mapInlet.bindInput(scope as MapOutlet<Value, Value, unknown>);
    return getOutlet;
  }
  return null as unknown as Outlet<Value>;
};

Dataflow.compileGetAttrSelector = function (selector: GetAttrSelector, scope: Outlet<Value>): Outlet<Value> {
  throw new Error(); // TODO
};

Dataflow.compileGetItemSelector = function (selector: GetItemSelector, scope: Outlet<Value>): Outlet<Value> {
  throw new Error(); // TODO
};

Dataflow.compileKeysSelector = function (scope: Outlet<Value>): Outlet<Value> {
  throw new Error(); // TODO
};

Dataflow.compileValuesSelector = function (scope: Outlet<Value>): Outlet<Value> {
  throw new Error(); // TODO
};

Dataflow.compileChildrenSelector = function (scope: Outlet<Value>): Outlet<Value> {
  throw new Error(); // TODO
};

Dataflow.compileDescendantsSelector = function (scope: Outlet<Value>): Outlet<Value> {
  throw new Error(); // TODO
};

Dataflow.compileFilterSelector = function (selector: FilterSelector, scope: Outlet<Value>): Outlet<Value> {
  throw new Error(); // TODO
};

Dataflow.compileOperator = function (operator: Operator, scope: Outlet<Value>): Outlet<Value> {
  if (operator instanceof ConditionalOperator) {
    return Dataflow.compileConditionalOperator(operator, scope);
  } else if (operator instanceof BinaryOperator) {
    return Dataflow.compileBinaryOperator(operator, scope);
  } else if (operator instanceof UnaryOperator) {
    return Dataflow.compileUnaryOperator(operator, scope);
  } else if (operator instanceof InvokeOperator) {
    return Dataflow.compileInvokeOperator(operator, scope);
  }
  throw new TypeError("" + operator);
};

Dataflow.compileConditionalOperator = function (operator: ConditionalOperator, scope: Outlet<Value>): Outlet<Value> {
  const outlet = new ConditionalOutlet();
  const ifTerm = operator.ifTerm.toValue();
  const thenTerm = operator.thenTerm.toValue();
  const elseTerm = operator.elseTerm.toValue();
  const ifOutlet = Dataflow.compile(ifTerm, scope);
  const thenOutlet = Dataflow.compile(thenTerm, scope);
  const elseOutlet = Dataflow.compile(elseTerm, scope);
  outlet.ifInlet.bindInput(ifOutlet);
  outlet.thenInlet.bindInput(thenOutlet);
  outlet.elseInlet.bindInput(elseOutlet);
  return outlet;
};

Dataflow.compileBinaryOperator = function (operator: BinaryOperator, scope: Outlet<Value>): Outlet<Value> {
  if (operator instanceof OrOperator) {
    return Dataflow.compileOrOperator(operator, scope);
  } else if (operator instanceof AndOperator) {
    return Dataflow.compileAndOperator(operator, scope);
  } else if (operator instanceof BitwiseOrOperator) {
    return Dataflow.compileBitwiseOrOperator(operator, scope);
  } else if (operator instanceof BitwiseXorOperator) {
    return Dataflow.compileBitwiseXorOperator(operator, scope);
  } else if (operator instanceof BitwiseAndOperator) {
    return Dataflow.compileBitwiseAndOperator(operator, scope);
  } else if (operator instanceof LtOperator) {
    return Dataflow.compileLtOperator(operator, scope);
  } else if (operator instanceof LeOperator) {
    return Dataflow.compileLeOperator(operator, scope);
  } else if (operator instanceof EqOperator) {
    return Dataflow.compileEqOperator(operator, scope);
  } else if (operator instanceof NeOperator) {
    return Dataflow.compileNeOperator(operator, scope);
  } else if (operator instanceof GeOperator) {
    return Dataflow.compileGeOperator(operator, scope);
  } else if (operator instanceof GtOperator) {
    return Dataflow.compileGtOperator(operator, scope);
  } else if (operator instanceof PlusOperator) {
    return Dataflow.compilePlusOperator(operator, scope);
  } else if (operator instanceof MinusOperator) {
    return Dataflow.compileMinusOperator(operator, scope);
  } else if (operator instanceof TimesOperator) {
    return Dataflow.compileTimesOperator(operator, scope);
  } else if (operator instanceof DivideOperator) {
    return Dataflow.compileDivideOperator(operator, scope);
  } else if (operator instanceof ModuloOperator) {
    return Dataflow.compileModuloOperator(operator, scope);
  }
  throw new TypeError("" + operator);
};

Dataflow.compileBinaryOutlet = function (operator: BinaryOperator, outlet: BinaryOutlet, scope: Outlet<Value>): Outlet<Value> {
  const operand1 = operator.operand1.toValue();
  const operand2 = operator.operand2.toValue();
  const operand1Outlet = Dataflow.compile(operand1, scope);
  const operand2Outlet = Dataflow.compile(operand2, scope);
  outlet.operand1Inlet.bindInput(operand1Outlet);
  outlet.operand2Inlet.bindInput(operand2Outlet);
  return outlet;
};

Dataflow.compileOrOperator = function (operator: OrOperator, scope: Outlet<Value>): Outlet<Value> {
  const outlet = new OrOutlet();
  const operand1 = operator.operand1.toValue();
  const operand2 = operator.operand2.toValue();
  const operand1Outlet = Dataflow.compile(operand1, scope);
  const operand2Outlet = Dataflow.compile(operand2, scope);
  outlet.operand1Inlet.bindInput(operand1Outlet);
  outlet.operand2Inlet.bindInput(operand2Outlet);
  return outlet;
};

Dataflow.compileAndOperator = function (operator: AndOperator, scope: Outlet<Value>): Outlet<Value> {
  const outlet = new AndOutlet();
  const operand1 = operator.operand1.toValue();
  const operand2 = operator.operand2.toValue();
  const operand1Outlet = Dataflow.compile(operand1, scope);
  const operand2Outlet = Dataflow.compile(operand2, scope);
  outlet.operand1Inlet.bindInput(operand1Outlet);
  outlet.operand2Inlet.bindInput(operand2Outlet);
  return outlet;
};

Dataflow.compileBitwiseOrOperator = function (operator: BitwiseOrOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new BitwiseOrOutlet(), scope);
};

Dataflow.compileBitwiseXorOperator = function (operator: BitwiseXorOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new BitwiseXorOutlet(), scope);
};

Dataflow.compileBitwiseAndOperator = function (operator: BitwiseAndOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new BitwiseAndOutlet(), scope);
};

Dataflow.compileLtOperator = function (operator: LtOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new LtOutlet(), scope);
};

Dataflow.compileLeOperator = function (operator: LeOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new LeOutlet(), scope);
};

Dataflow.compileEqOperator = function (operator: EqOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new EqOutlet(), scope);
};

Dataflow.compileNeOperator = function (operator: NeOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new NeOutlet(), scope);
};

Dataflow.compileGeOperator = function (operator: GeOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new GeOutlet(), scope);
};

Dataflow.compileGtOperator = function (operator: GtOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new GtOutlet(), scope);
};

Dataflow.compilePlusOperator = function (operator: PlusOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new PlusOutlet(), scope);
};

Dataflow.compileMinusOperator = function (operator: MinusOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new MinusOutlet(), scope);
};

Dataflow.compileTimesOperator = function (operator: TimesOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new TimesOutlet(), scope);
};

Dataflow.compileDivideOperator = function (operator: DivideOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new DivideOutlet(), scope);
};

Dataflow.compileModuloOperator = function (operator: ModuloOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileBinaryOutlet(operator, new ModuloOutlet(), scope);
};

Dataflow.compileUnaryOperator = function (operator: UnaryOperator, scope: Outlet<Value>): Outlet<Value> {
  if (operator instanceof NotOperator) {
    return Dataflow.compileNotOperator(operator, scope);
  } else if (operator instanceof BitwiseNotOperator) {
    return Dataflow.compileBitwiseNotOperator(operator, scope);
  } else if (operator instanceof NegativeOperator) {
    return Dataflow.compileNegativeOperator(operator, scope);
  } else if (operator instanceof PositiveOperator) {
    return Dataflow.compilePositiveOperator(operator, scope);
  }
  throw new TypeError("" + operator);
};

Dataflow.compileUnaryOutlet = function (operator: UnaryOperator, outlet: UnaryOutlet, scope: Outlet<Value>): Outlet<Value> {
  const operand = operator.operand.toValue();
  const operandOutlet = Dataflow.compile(operand, scope);
  outlet.operandInlet.bindInput(operandOutlet);
  return outlet;
};

Dataflow.compileNotOperator = function (operator: NotOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileUnaryOutlet(operator, new NotOutlet(), scope);
};

Dataflow.compileBitwiseNotOperator = function (operator: BitwiseNotOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileUnaryOutlet(operator, new BitwiseNotOutlet(), scope);
};

Dataflow.compileNegativeOperator = function (operator: NegativeOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileUnaryOutlet(operator, new NegativeOutlet(), scope);
};

Dataflow.compilePositiveOperator = function (operator: PositiveOperator, scope: Outlet<Value>): Outlet<Value> {
  return Dataflow.compileUnaryOutlet(operator, new PositiveOutlet(), scope);
};

Dataflow.compileInvokeOperator = function (operator: InvokeOperator, scope: Outlet<Value>): Outlet<Value> {
  const func = operator.func;
  const args = operator.args;
  const invokeOutlet = new InvokeOutlet(scope as unknown as Record);
  const funcOutlet = Dataflow.compile(func, scope);
  const argsOutlet = Dataflow.compile(args, scope);
  invokeOutlet.funcInlet.bindInput(funcOutlet);
  invokeOutlet.argsInlet.bindInput(argsOutlet);
  return invokeOutlet;
};
