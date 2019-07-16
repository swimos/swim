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

package swim.dataflow;

import swim.dataflow.operator.AndOutlet;
import swim.dataflow.operator.BinaryOutlet;
import swim.dataflow.operator.BitwiseAndOutlet;
import swim.dataflow.operator.BitwiseNotOutlet;
import swim.dataflow.operator.BitwiseOrOutlet;
import swim.dataflow.operator.BitwiseXorOutlet;
import swim.dataflow.operator.ConditionalOutlet;
import swim.dataflow.operator.DivideOutlet;
import swim.dataflow.operator.EqOutlet;
import swim.dataflow.operator.GeOutlet;
import swim.dataflow.operator.GtOutlet;
import swim.dataflow.operator.InvokeOutlet;
import swim.dataflow.operator.LeOutlet;
import swim.dataflow.operator.LtOutlet;
import swim.dataflow.operator.MinusOutlet;
import swim.dataflow.operator.ModuloOutlet;
import swim.dataflow.operator.NeOutlet;
import swim.dataflow.operator.NegativeOutlet;
import swim.dataflow.operator.NotOutlet;
import swim.dataflow.operator.OrOutlet;
import swim.dataflow.operator.PlusOutlet;
import swim.dataflow.operator.PositiveOutlet;
import swim.dataflow.operator.TimesOutlet;
import swim.dataflow.operator.UnaryOutlet;
import swim.dataflow.selector.GetOutlet;
import swim.streamlet.KeyOutlet;
import swim.streamlet.Outlet;
import swim.streamlet.StreamletScope;
import swim.streamlet.ValueInput;
import swim.structure.Operator;
import swim.structure.Record;
import swim.structure.Selector;
import swim.structure.Value;
import swim.structure.operator.AndOperator;
import swim.structure.operator.BinaryOperator;
import swim.structure.operator.BitwiseAndOperator;
import swim.structure.operator.BitwiseNotOperator;
import swim.structure.operator.BitwiseOrOperator;
import swim.structure.operator.BitwiseXorOperator;
import swim.structure.operator.ConditionalOperator;
import swim.structure.operator.DivideOperator;
import swim.structure.operator.EqOperator;
import swim.structure.operator.GeOperator;
import swim.structure.operator.GtOperator;
import swim.structure.operator.InvokeOperator;
import swim.structure.operator.LeOperator;
import swim.structure.operator.LtOperator;
import swim.structure.operator.MinusOperator;
import swim.structure.operator.ModuloOperator;
import swim.structure.operator.NeOperator;
import swim.structure.operator.NegativeOperator;
import swim.structure.operator.NotOperator;
import swim.structure.operator.OrOperator;
import swim.structure.operator.PlusOperator;
import swim.structure.operator.PositiveOperator;
import swim.structure.operator.TimesOperator;
import swim.structure.operator.UnaryOperator;
import swim.structure.selector.ChildrenSelector;
import swim.structure.selector.DescendantsSelector;
import swim.structure.selector.FilterSelector;
import swim.structure.selector.GetAttrSelector;
import swim.structure.selector.GetItemSelector;
import swim.structure.selector.GetSelector;
import swim.structure.selector.IdentitySelector;
import swim.structure.selector.KeysSelector;
import swim.structure.selector.ValuesSelector;

public final class Dataflow {
  private Dataflow() {
    // nop
  }

  /**
   * Returns an {@code Outlet} that evaluates the given {@code expr} in the
   * context of the giveb {@code scope}, and updates whenever any dependent
   * expression updates.
   */
  @SuppressWarnings("unchecked")
  public static Outlet<Value> compile(Value expr, Outlet<? extends Value> scope) {
    if (scope instanceof KeyOutlet<?, ?>) {
      final Value value = ((KeyOutlet<Value, Value>) scope).get();
      if (value instanceof Outlet<?>) {
        scope = (Outlet<? extends Value>) value;
      }
    }
    if (expr.isConstant()) {
      return new ValueInput<Value>(expr);
    } else if (expr instanceof Selector) {
      return compileSelector((Selector) expr, scope);
    } else if (expr instanceof Operator) {
      return compileOperator((Operator) expr, scope);
    }
    throw new IllegalArgumentException(expr.toString());
  }

  private static Outlet<Value> compileSelector(Selector selector, Outlet<? extends Value> scope) {
    if (selector instanceof IdentitySelector) {
      return compileIdentitySelector(scope);
    } else if (selector instanceof GetSelector) {
      return compileGetSelector((GetSelector) selector, scope);
    } else if (selector instanceof GetAttrSelector) {
      return compileGetAttrSelector((GetAttrSelector) selector, scope);
    } else if (selector instanceof GetItemSelector) {
      return compileGetItemSelector((GetItemSelector) selector, scope);
    } else if (selector instanceof KeysSelector) {
      return compileKeysSelector(scope);
    } else if (selector instanceof ValuesSelector) {
      return compileValuesSelector(scope);
    } else if (selector instanceof ChildrenSelector) {
      return compileChildrenSelector(scope);
    } else if (selector instanceof DescendantsSelector) {
      return compileDescendantsSelector(scope);
    } else if (selector instanceof FilterSelector) {
      return compileFilterSelector((FilterSelector) selector, scope);
    }
    throw new IllegalArgumentException(selector.toString());
  }

  @SuppressWarnings("unchecked")
  private static Outlet<Value> compileIdentitySelector(Outlet<? extends Value> scope) {
    return (Outlet<Value>) scope;
  }

  @SuppressWarnings("unchecked")
  private static Outlet<Value> compileGetSelector(GetSelector selector, Outlet<? extends Value> scope) {
    final Value key = selector.accessor();
    if (key.isConstant()) {
      if (scope instanceof RecordOutlet) {
        final Outlet<Value> outlet = ((RecordScope) scope).outlet(key);
        if (outlet != null) {
          return compile(selector.then(), outlet);
        }
      } else if (scope instanceof StreamletScope<?>) {
        final String name = key.stringValue(null);
        if (name != null) {
          final Outlet<Value> outlet = ((StreamletScope<Value>) scope).outlet(name);
          if (outlet != null) {
            return compile(selector.then(), outlet);
          }
        }
      }
    } else {
      final GetOutlet getOutlet = new GetOutlet();
      final Outlet<Value> outlet = compile(key, scope);
      getOutlet.keyInlet().bindInput(outlet);
      getOutlet.mapInlet().bindInput((Outlet<? extends Value>) scope);
      return getOutlet;
    }
    return null;
  }

  private static Outlet<Value> compileGetAttrSelector(GetAttrSelector selector, Outlet<? extends Value> scope) {
    throw new UnsupportedOperationException(); // TODO
  }

  private static Outlet<Value> compileGetItemSelector(GetItemSelector selector, Outlet<? extends Value> scope) {
    throw new UnsupportedOperationException(); // TODO
  }

  private static Outlet<Value> compileKeysSelector(Outlet<? extends Value> scope) {
    throw new UnsupportedOperationException(); // TODO
  }

  private static Outlet<Value> compileValuesSelector(Outlet<? extends Value> scope) {
    throw new UnsupportedOperationException(); // TODO
  }

  private static Outlet<Value> compileChildrenSelector(Outlet<? extends Value> scope) {
    throw new UnsupportedOperationException(); // TODO
  }

  private static Outlet<Value> compileDescendantsSelector(Outlet<? extends Value> scope) {
    throw new UnsupportedOperationException(); // TODO
  }

  private static Outlet<Value> compileFilterSelector(FilterSelector selector, Outlet<? extends Value> scope) {
    throw new UnsupportedOperationException(); // TODO
  }

  private static Outlet<Value> compileOperator(Operator operator, Outlet<? extends Value> scope) {
    if (operator instanceof ConditionalOperator) {
      return compileConditionalOperator((ConditionalOperator) operator, scope);
    } else if (operator instanceof BinaryOperator) {
      return compileBinaryOperator((BinaryOperator) operator, scope);
    } else if (operator instanceof UnaryOperator) {
      return compileUnaryOperator((UnaryOperator) operator, scope);
    } else if (operator instanceof InvokeOperator) {
      return compileInvokeOperator((InvokeOperator) operator, scope);
    }
    throw new IllegalArgumentException(operator.toString());
  }

  private static Outlet<Value> compileConditionalOperator(ConditionalOperator operator, Outlet<? extends Value> scope) {
    final ConditionalOutlet outlet = new ConditionalOutlet();
    final Value ifTerm = operator.ifTerm().toValue();
    final Value thenTerm = operator.thenTerm().toValue();
    final Value elseTerm = operator.elseTerm().toValue();
    final Outlet<Value> ifOutlet = compile(ifTerm, scope);
    final Outlet<Value> thenOutlet = compile(thenTerm, scope);
    final Outlet<Value> elseOutlet = compile(elseTerm, scope);
    outlet.ifInlet().bindInput(ifOutlet);
    outlet.thenInlet().bindInput(thenOutlet);
    outlet.elseInlet().bindInput(elseOutlet);
    return outlet;
  }

  private static Outlet<Value> compileBinaryOperator(BinaryOperator operator, Outlet<? extends Value> scope) {
    if (operator instanceof OrOperator) {
      return compileOrOperator((OrOperator) operator, scope);
    } else if (operator instanceof AndOperator) {
      return compileAndOperator((AndOperator) operator, scope);
    } else if (operator instanceof BitwiseOrOperator) {
      return compileBitwiseOrOperator((BitwiseOrOperator) operator, scope);
    } else if (operator instanceof BitwiseXorOperator) {
      return compileBitwiseXorOperator((BitwiseXorOperator) operator, scope);
    } else if (operator instanceof BitwiseAndOperator) {
      return compileBitwiseAndOperator((BitwiseAndOperator) operator, scope);
    } else if (operator instanceof LtOperator) {
      return compileLtOperator((LtOperator) operator, scope);
    } else if (operator instanceof LeOperator) {
      return compileLeOperator((LeOperator) operator, scope);
    } else if (operator instanceof EqOperator) {
      return compileEqOperator((EqOperator) operator, scope);
    } else if (operator instanceof NeOperator) {
      return compileNeOperator((NeOperator) operator, scope);
    } else if (operator instanceof GeOperator) {
      return compileGeOperator((GeOperator) operator, scope);
    } else if (operator instanceof GtOperator) {
      return compileGtOperator((GtOperator) operator, scope);
    } else if (operator instanceof PlusOperator) {
      return compilePlusOperator((PlusOperator) operator, scope);
    } else if (operator instanceof MinusOperator) {
      return compileMinusOperator((MinusOperator) operator, scope);
    } else if (operator instanceof TimesOperator) {
      return compileTimesOperator((TimesOperator) operator, scope);
    } else if (operator instanceof DivideOperator) {
      return compileDivideOperator((DivideOperator) operator, scope);
    } else if (operator instanceof ModuloOperator) {
      return compileModuloOperator((ModuloOperator) operator, scope);
    }
    throw new IllegalArgumentException(operator.toString());
  }

  private static Outlet<Value> compileBinaryOutlet(BinaryOperator operator, BinaryOutlet outlet, Outlet<? extends Value> scope) {
    final Value operand1 = operator.operand1().toValue();
    final Value operand2 = operator.operand2().toValue();
    final Outlet<Value> operand1Outlet = compile(operand1, scope);
    final Outlet<Value> operand2Outlet = compile(operand2, scope);
    outlet.operand1Inlet().bindInput(operand1Outlet);
    outlet.operand2Inlet().bindInput(operand2Outlet);
    return outlet;
  }

  private static Outlet<Value> compileOrOperator(OrOperator operator, Outlet<? extends Value> scope) {
    final OrOutlet outlet = new OrOutlet();
    final Value operand1 = operator.operand1().toValue();
    final Value operand2 = operator.operand2().toValue();
    final Outlet<Value> operand1Outlet = compile(operand1, scope);
    final Outlet<Value> operand2Outlet = compile(operand2, scope);
    outlet.operand1Inlet().bindInput(operand1Outlet);
    outlet.operand2Inlet().bindInput(operand2Outlet);
    return outlet;
  }

  private static Outlet<Value> compileAndOperator(AndOperator operator, Outlet<? extends Value> scope) {
    final AndOutlet outlet = new AndOutlet();
    final Value operand1 = operator.operand1().toValue();
    final Value operand2 = operator.operand2().toValue();
    final Outlet<Value> operand1Outlet = compile(operand1, scope);
    final Outlet<Value> operand2Outlet = compile(operand2, scope);
    outlet.operand1Inlet().bindInput(operand1Outlet);
    outlet.operand2Inlet().bindInput(operand2Outlet);
    return outlet;
  }

  private static Outlet<Value> compileBitwiseOrOperator(BitwiseOrOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new BitwiseOrOutlet(), scope);
  }

  private static Outlet<Value> compileBitwiseXorOperator(BitwiseXorOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new BitwiseXorOutlet(), scope);
  }

  private static Outlet<Value> compileBitwiseAndOperator(BitwiseAndOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new BitwiseAndOutlet(), scope);
  }

  private static Outlet<Value> compileLtOperator(LtOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new LtOutlet(), scope);
  }

  private static Outlet<Value> compileLeOperator(LeOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new LeOutlet(), scope);
  }

  private static Outlet<Value> compileEqOperator(EqOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new EqOutlet(), scope);
  }

  private static Outlet<Value> compileNeOperator(NeOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new NeOutlet(), scope);
  }

  private static Outlet<Value> compileGeOperator(GeOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new GeOutlet(), scope);
  }

  private static Outlet<Value> compileGtOperator(GtOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new GtOutlet(), scope);
  }

  private static Outlet<Value> compilePlusOperator(PlusOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new PlusOutlet(), scope);
  }

  private static Outlet<Value> compileMinusOperator(MinusOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new MinusOutlet(), scope);
  }

  private static Outlet<Value> compileTimesOperator(TimesOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new TimesOutlet(), scope);
  }

  private static Outlet<Value> compileDivideOperator(DivideOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new DivideOutlet(), scope);
  }

  private static Outlet<Value> compileModuloOperator(ModuloOperator operator, Outlet<? extends Value> scope) {
    return compileBinaryOutlet(operator, new ModuloOutlet(), scope);
  }

  private static Outlet<Value> compileUnaryOperator(UnaryOperator operator, Outlet<? extends Value> scope) {
    if (operator instanceof NotOperator) {
      return compileNotOperator((NotOperator) operator, scope);
    } else if (operator instanceof BitwiseNotOperator) {
      return compileBitwiseNotOperator((BitwiseNotOperator) operator, scope);
    } else if (operator instanceof NegativeOperator) {
      return compileNegativeOperator((NegativeOperator) operator, scope);
    } else if (operator instanceof PositiveOperator) {
      return compilePositiveOperator((PositiveOperator) operator, scope);
    }
    throw new IllegalArgumentException(operator.toString());
  }

  private static Outlet<Value> compileUnaryOutlet(UnaryOperator operator, UnaryOutlet outlet, Outlet<? extends Value> scope) {
    final Value operand = operator.operand().toValue();
    final Outlet<Value> operandOutlet = compile(operand, scope);
    outlet.operandInlet().bindInput(operandOutlet);
    return outlet;
  }

  private static Outlet<Value> compileNotOperator(NotOperator operator, Outlet<? extends Value> scope) {
    return compileUnaryOutlet(operator, new NotOutlet(), scope);
  }

  private static Outlet<Value> compileBitwiseNotOperator(BitwiseNotOperator operator, Outlet<? extends Value> scope) {
    return compileUnaryOutlet(operator, new BitwiseNotOutlet(), scope);
  }

  private static Outlet<Value> compileNegativeOperator(NegativeOperator operator, Outlet<? extends Value> scope) {
    return compileUnaryOutlet(operator, new NegativeOutlet(), scope);
  }

  private static Outlet<Value> compilePositiveOperator(PositiveOperator operator, Outlet<? extends Value> scope) {
    return compileUnaryOutlet(operator, new PositiveOutlet(), scope);
  }

  private static Outlet<Value> compileInvokeOperator(InvokeOperator operator, Outlet<? extends Value> scope) {
    final Value func = operator.func();
    final Value args = operator.args();
    final InvokeOutlet invokeOutlet = new InvokeOutlet((Record) scope);
    final Outlet<Value> funcOutlet = compile(func, scope);
    final Outlet<Value> argsOutlet = compile(args, scope);
    invokeOutlet.funcInlet().bindInput(funcOutlet);
    invokeOutlet.argsInlet().bindInput(argsOutlet);
    return invokeOutlet;
  }
}
