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
import {Outlet, KeyOutlet, StreamletScope, ValueInput} from "@swim/streamlet";
import {RecordOutlet} from "./RecordOutlet";
import {GetOutlet} from "./selector/GetOutlet";
import {BinaryOutlet} from "./operator/BinaryOutlet";
import {UnaryOutlet} from "./operator/UnaryOutlet";
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

export class Dataflow {
  /** @hidden */
  private constructor() {
    // nop
  }

  /**
   * Returns an `Outlet` that evaluates the given `expr` in the context of the
   * given `scope`, and updates whenever any dependent expression updates.
   */
  static compile(expr: Value, scope: Outlet<Value>): Outlet<Value> {
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
  }

  private static compileSelector(selector: Selector, scope: Outlet<Value>): Outlet<Value> {
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
  }

  private static compileIdentitySelector(scope: Outlet<Value>): Outlet<Value> {
    return scope;
  }

  private static compileGetSelector(selector: GetSelector, scope: Outlet<Value>): Outlet<Value> {
    const key = selector.accessor();
    if (key.isConstant()) {
      if (RecordOutlet.is(scope)) {
        const outlet = scope.outlet(key);
        if (outlet !== null) {
          return Dataflow.compile(selector.then(), outlet);
        }
      } else if (StreamletScope.is<Value>(scope)) {
        const name = key.stringValue(void 0);
        if (name !== void 0) {
          const outlet = scope.outlet(name);
          if (outlet !== null) {
            return Dataflow.compile(selector.then(), outlet);
          }
        }
      }
    } else {
      const getOutlet = new GetOutlet();
      const outlet = Dataflow.compile(key, scope);
      getOutlet.keyInlet().bindInput(outlet);
      getOutlet.mapInlet().bindInput(scope);
      return getOutlet;
    }
    return null as unknown as Outlet<Value>;
  }

  private static compileGetAttrSelector(selector: GetAttrSelector, scope: Outlet<Value>): Outlet<Value> {
    throw new Error(); // TODO
  }

  private static compileGetItemSelector(selector: GetItemSelector, scope: Outlet<Value>): Outlet<Value> {
    throw new Error(); // TODO
  }

  private static compileKeysSelector(scope: Outlet<Value>): Outlet<Value> {
    throw new Error(); // TODO
  }

  private static compileValuesSelector(scope: Outlet<Value>): Outlet<Value> {
    throw new Error(); // TODO
  }

  private static compileChildrenSelector(scope: Outlet<Value>): Outlet<Value> {
    throw new Error(); // TODO
  }

  private static compileDescendantsSelector(scope: Outlet<Value>): Outlet<Value> {
    throw new Error(); // TODO
  }

  private static compileFilterSelector(selector: FilterSelector, scope: Outlet<Value>): Outlet<Value> {
    throw new Error(); // TODO
  }

  private static compileOperator(operator: Operator, scope: Outlet<Value>): Outlet<Value> {
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
  }

  private static compileConditionalOperator(operator: ConditionalOperator, scope: Outlet<Value>): Outlet<Value> {
    const outlet = new ConditionalOutlet();
    const ifTerm = operator.ifTerm().toValue();
    const thenTerm = operator.thenTerm().toValue();
    const elseTerm = operator.elseTerm().toValue();
    const ifOutlet = Dataflow.compile(ifTerm, scope);
    const thenOutlet = Dataflow.compile(thenTerm, scope);
    const elseOutlet = Dataflow.compile(elseTerm, scope);
    outlet.ifInlet().bindInput(ifOutlet);
    outlet.thenInlet().bindInput(thenOutlet);
    outlet.elseInlet().bindInput(elseOutlet);
    return outlet;
  }

  private static compileBinaryOperator(operator: BinaryOperator, scope: Outlet<Value>): Outlet<Value> {
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
  }

  private static compileBinaryOutlet(operator: BinaryOperator, outlet: BinaryOutlet, scope: Outlet<Value>): Outlet<Value> {
    const operand1 = operator.operand1().toValue();
    const operand2 = operator.operand2().toValue();
    const operand1Outlet = Dataflow.compile(operand1, scope);
    const operand2Outlet = Dataflow.compile(operand2, scope);
    outlet.operand1Inlet().bindInput(operand1Outlet);
    outlet.operand2Inlet().bindInput(operand2Outlet);
    return outlet;
  }

  private static compileOrOperator(operator: OrOperator, scope: Outlet<Value>): Outlet<Value> {
    const outlet = new OrOutlet();
    const operand1 = operator.operand1().toValue();
    const operand2 = operator.operand2().toValue();
    const operand1Outlet = Dataflow.compile(operand1, scope);
    const operand2Outlet = Dataflow.compile(operand2, scope);
    outlet.operand1Inlet().bindInput(operand1Outlet);
    outlet.operand2Inlet().bindInput(operand2Outlet);
    return outlet;
  }

  private static compileAndOperator(operator: AndOperator, scope: Outlet<Value>): Outlet<Value> {
    const outlet = new AndOutlet();
    const operand1 = operator.operand1().toValue();
    const operand2 = operator.operand2().toValue();
    const operand1Outlet = Dataflow.compile(operand1, scope);
    const operand2Outlet = Dataflow.compile(operand2, scope);
    outlet.operand1Inlet().bindInput(operand1Outlet);
    outlet.operand2Inlet().bindInput(operand2Outlet);
    return outlet;
  }

  private static compileBitwiseOrOperator(operator: BitwiseOrOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new BitwiseOrOutlet(), scope);
  }

  private static compileBitwiseXorOperator(operator: BitwiseXorOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new BitwiseXorOutlet(), scope);
  }

  private static compileBitwiseAndOperator(operator: BitwiseAndOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new BitwiseAndOutlet(), scope);
  }

  private static compileLtOperator(operator: LtOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new LtOutlet(), scope);
  }

  private static compileLeOperator(operator: LeOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new LeOutlet(), scope);
  }

  private static compileEqOperator(operator: EqOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new EqOutlet(), scope);
  }

  private static compileNeOperator(operator: NeOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new NeOutlet(), scope);
  }

  private static compileGeOperator(operator: GeOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new GeOutlet(), scope);
  }

  private static compileGtOperator(operator: GtOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new GtOutlet(), scope);
  }

  private static compilePlusOperator(operator: PlusOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new PlusOutlet(), scope);
  }

  private static compileMinusOperator(operator: MinusOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new MinusOutlet(), scope);
  }

  private static compileTimesOperator(operator: TimesOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new TimesOutlet(), scope);
  }

  private static compileDivideOperator(operator: DivideOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new DivideOutlet(), scope);
  }

  private static compileModuloOperator(operator: ModuloOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileBinaryOutlet(operator, new ModuloOutlet(), scope);
  }

  private static compileUnaryOperator(operator: UnaryOperator, scope: Outlet<Value>): Outlet<Value> {
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
  }

  private static compileUnaryOutlet(operator: UnaryOperator, outlet: UnaryOutlet, scope: Outlet<Value>): Outlet<Value> {
    const operand = operator.operand().toValue();
    const operandOutlet = Dataflow.compile(operand, scope);
    outlet.operandInlet().bindInput(operandOutlet);
    return outlet;
  }

  private static compileNotOperator(operator: NotOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileUnaryOutlet(operator, new NotOutlet(), scope);
  }

  private static compileBitwiseNotOperator(operator: BitwiseNotOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileUnaryOutlet(operator, new BitwiseNotOutlet(), scope);
  }

  private static compileNegativeOperator(operator: NegativeOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileUnaryOutlet(operator, new NegativeOutlet(), scope);
  }

  private static compilePositiveOperator(operator: PositiveOperator, scope: Outlet<Value>): Outlet<Value> {
    return Dataflow.compileUnaryOutlet(operator, new PositiveOutlet(), scope);
  }

  private static compileInvokeOperator(operator: InvokeOperator, scope: Outlet<Value>): Outlet<Value> {
    const func = operator.func();
    const args = operator.args();
    const invokeOutlet = new InvokeOutlet(scope as unknown as Record);
    const funcOutlet = Dataflow.compile(func, scope);
    const argsOutlet = Dataflow.compile(args, scope);
    invokeOutlet.funcInlet().bindInput(funcOutlet);
    invokeOutlet.argsInlet().bindInput(argsOutlet);
    return invokeOutlet;
  }
}
RecordOutlet.Dataflow = Dataflow;
