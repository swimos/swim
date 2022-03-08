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

package swim.structure.func;

import swim.structure.Func;
import swim.structure.Interpreter;
import swim.structure.Item;
import swim.structure.Num;
import swim.structure.Record;
import swim.structure.Value;
import swim.structure.operator.InvokeOperator;

public final class MathModule {

  private MathModule() {
    // static
  }

  private static Func max;
  private static Func min;
  private static Func abs;
  private static Func ceil;
  private static Func floor;
  private static Func round;
  private static Func sqrt;
  private static Func pow;
  private static Func rate;
  private static Func random;
  private static Record scope;

  public static Func max() {
    if (MathModule.max == null) {
      MathModule.max = new MaxFunc();
    }
    return MathModule.max;
  }

  public static Func min() {
    if (MathModule.min == null) {
      MathModule.min = new MinFunc();
    }
    return MathModule.min;
  }

  public static Func abs() {
    if (MathModule.abs == null) {
      MathModule.abs = new AbsFunc();
    }
    return MathModule.abs;
  }

  public static Func ceil() {
    if (MathModule.ceil == null) {
      MathModule.ceil = new CeilFunc();
    }
    return MathModule.ceil;
  }

  public static Func floor() {
    if (MathModule.floor == null) {
      MathModule.floor = new FloorFunc();
    }
    return MathModule.floor;
  }

  public static Func round() {
    if (MathModule.round == null) {
      MathModule.round = new RoundFunc();
    }
    return MathModule.round;
  }

  public static Func sqrt() {
    if (MathModule.sqrt == null) {
      MathModule.sqrt = new SqrtFunc();
    }
    return MathModule.sqrt;
  }

  public static Func pow() {
    if (MathModule.pow == null) {
      MathModule.pow = new PowFunc();
    }
    return MathModule.pow;
  }

  public static Func rate() {
    if (MathModule.rate == null) {
      MathModule.rate = new RateFunc();
    }
    return MathModule.rate;
  }

  public static Func random() {
    if (MathModule.random == null) {
      MathModule.random = new RandomFunc();
    }
    return MathModule.random;
  }

  public static Record scope() {
    if (MathModule.scope == null) {
      MathModule.scope = Record.create(10)
                               .slot("max", max())
                               .slot("min", min())
                               .slot("abs", abs())
                               .slot("ceil", ceil())
                               .slot("floor", floor())
                               .slot("round", round())
                               .slot("sqrt", sqrt())
                               .slot("pow", pow())
                               .slot("rate", rate())
                               .slot("random", random())
                               .commit();
    }
    return MathModule.scope;
  }

}

final class MaxFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    final Item x;
    Item y;
    if (args.length() >= 2) {
      x = args.getItem(0).evaluate(interpreter);
      y = args.getItem(1).evaluate(interpreter);
    } else {
      x = args.evaluate(interpreter);
      y = null;
    }
    if (y != null) {
      return x.max(y);
    } else if (operator != null) {
      y = (Item) operator.state();
      final Item max = y != null ? x.max(y) : x;
      operator.setState(max);
      return max;
    }
    return Item.absent();
  }

  @Override
  public Item expand(Value args, Interpreter interpreter, InvokeOperator operator) {
    if (args.length() == 1) {
      args = args.evaluate(interpreter).toValue();
      return this.invoke(args, interpreter, operator);
    }
    return null;
  }

}

final class MinFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    final Item x;
    Item y;
    if (args.length() >= 2) {
      x = args.getItem(0).evaluate(interpreter);
      y = args.getItem(1).evaluate(interpreter);
    } else {
      x = args.evaluate(interpreter);
      y = null;
    }
    if (y != null) {
      return x.min(y);
    } else if (operator != null) {
      y = (Item) operator.state();
      final Item min = y != null ? x.min(y) : x;
      operator.setState(min);
      return min;
    }
    return Item.absent();
  }

  @Override
  public Item expand(Value args, Interpreter interpreter, InvokeOperator operator) {
    if (args.length() == 1) {
      args = args.evaluate(interpreter).toValue();
      return this.invoke(args, interpreter, operator);
    }
    return null;
  }

}

final class AbsFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Num) {
      return ((Num) args).abs();
    }
    return Item.absent();
  }

}

final class CeilFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Num) {
      return ((Num) args).ceil();
    }
    return Item.absent();
  }

}

final class FloorFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Num) {
      return ((Num) args).floor();
    }
    return Item.absent();
  }

}

final class RoundFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Num) {
      return ((Num) args).round();
    }
    return Item.absent();
  }

}

final class SqrtFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Num) {
      return ((Num) args).sqrt();
    }
    return Item.absent();
  }

}

final class PowFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    final Value x = args.getItem(0).evaluate(interpreter).toValue();
    final Value y = args.getItem(1).evaluate(interpreter).toValue();
    if (x instanceof Num && y instanceof Num) {
      return ((Num) x).pow((Num) y);
    }
    return Item.absent();
  }

}

final class RateFuncState {

  double v0;
  long t0;
  double dv;
  long dt;

}

final class RateFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    final double value;
    final long period;
    if (args.length() >= 2) {
      value = args.getItem(0).evaluate(interpreter).doubleValue(Double.NaN);
      period = args.getItem(1).evaluate(interpreter).longValue(1000L);
    } else {
      value = args.evaluate(interpreter).doubleValue(Double.NaN);
      period = 1000L;
    }
    if (!Double.isNaN(value) && operator != null) {
      RateFuncState state = (RateFuncState) operator.state();
      if (state == null) {
        state = new RateFuncState();
        state.v0 = value;
        state.t0 = System.currentTimeMillis();
        operator.setState(state);
      } else {
        final long t1 = System.currentTimeMillis();
        final long dt = t1 - state.t0;
        if (dt > period && t1 > state.t0 || dt > 2 * period) {
          final double dv = value - state.v0;
          state.v0 = value;
          state.t0 = t1;
          state.dv = dv;
          state.dt = dt;
        }
        operator.setState(state);
        if (state.dt != 0L) {
          final double rate = (double) period * state.dv / (double) state.dt;
          return Num.from(rate);
        }
      }
    }
    return Item.absent();
  }

  @Override
  public Item expand(Value args, Interpreter interpreter, InvokeOperator operator) {
    args = args.evaluate(interpreter).toValue();
    return this.invoke(args, interpreter, operator);
  }

}

final class RandomFunc extends BridgeFunc {

  @Override
  public Item invoke(Value args, Interpreter interpreter, InvokeOperator operator) {
    args = args.evaluate(interpreter).toValue();
    final double lower = args.length() >= 1 ? args.getItem(0).doubleValue(0.0) : 0.0;
    final double upper = args.length() >= 2 ? args.getItem(1).doubleValue(lower + 1.0) : lower + 1.0;
    final double value = lower + Math.random() * (upper - lower);
    return Num.from(value);
  }

}
