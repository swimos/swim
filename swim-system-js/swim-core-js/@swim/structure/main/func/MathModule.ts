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

import {Item} from "../Item";
import {Value} from "../Value";
import {Record} from "../Record";
import {Func} from "../Func";
import {Interpreter} from "../Interpreter";
import {InvokeOperator} from "../operator/InvokeOperator";
import {BridgeFunc} from "./BridgeFunc";

export class MathModule {
  private constructor() {
    // stub
  }

  private static _max?: Func;
  private static _min?: Func;
  private static _abs?: Func;
  private static _ceil?: Func;
  private static _floor?: Func;
  private static _round?: Func;
  private static _sqrt?: Func;
  private static _pow?: Func;
  private static _rate?: Func;
  private static _random?: Func;

  private static _scope?: Record;

  static max(): Func {
    if (MathModule._max === void 0) {
      MathModule._max = new MaxFunc();
    }
    return MathModule._max;
  }

  static min(): Func {
    if (MathModule._min === void 0) {
      MathModule._min = new MinFunc();
    }
    return MathModule._min;
  }

  static abs(): Func {
    if (MathModule._abs === void 0) {
      MathModule._abs = new AbsFunc();
    }
    return MathModule._abs;
  }

  static ceil(): Func {
    if (MathModule._ceil === void 0) {
      MathModule._ceil = new CeilFunc();
    }
    return MathModule._ceil;
  }

  static floor(): Func {
    if (MathModule._floor === void 0) {
      MathModule._floor = new FloorFunc();
    }
    return MathModule._floor;
  }

  static round(): Func {
    if (MathModule._round === void 0) {
      MathModule._round = new RoundFunc();
    }
    return MathModule._round;
  }

  static sqrt(): Func {
    if (MathModule._sqrt === void 0) {
      MathModule._sqrt = new SqrtFunc();
    }
    return MathModule._sqrt;
  }

  static pow(): Func {
    if (MathModule._pow === void 0) {
      MathModule._pow = new PowFunc();
    }
    return MathModule._pow;
  }

  static rate(): Func {
    if (MathModule._rate === void 0) {
      MathModule._rate = new RateFunc();
    }
    return MathModule._rate;
  }

  static random(): Func {
    if (MathModule._random === void 0) {
      MathModule._random = new RandomFunc();
    }
    return MathModule._random;
  }

  static scope(): Record {
    if (MathModule._scope === void 0) {
      MathModule._scope = Item.Record.create(10)
          .slot("max", MathModule.max())
          .slot("min", MathModule.min())
          .slot("abs", MathModule.abs())
          .slot("ceil", MathModule.ceil())
          .slot("floor", MathModule.floor())
          .slot("round", MathModule.round())
          .slot("pow", MathModule.pow())
          .slot("sqrt", MathModule.sqrt())
          .slot("rate", MathModule.rate())
          .slot("random", MathModule.random())
          .commit();
    }
    return MathModule._scope;
  }
}
Item.MathModule = MathModule;

/** @hidden */
class MaxFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    interpreter = Interpreter.fromAny(interpreter);
    let x: Item;
    let y: Item | undefined;
    if (args.length >= 2) {
      x = args.getItem(0).evaluate(interpreter);
      y = args.getItem(1).evaluate(interpreter);
    } else {
      x = args.evaluate(interpreter);
    }
    if (y !== void 0) {
      return x.max(y);
    } else if (operator !== void 0) {
      y = operator.state() as Item;
      const max = y !== void 0 ? x.max(y) : x;
      operator.setState(max);
      return max;
    }
    return Item.absent();
  }

  expand(args: Value, interpreter: Interpreter, operator: InvokeOperator): Item | undefined {
    if (args.length === 1) {
      args = args.evaluate(interpreter).toValue();
      return this.invoke(args, interpreter, operator);
    }
    return void 0;
  }
}

/** @hidden */
class MinFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    interpreter = Interpreter.fromAny(interpreter);
    let x: Item;
    let y: Item | undefined;
    if (args.length >= 2) {
      x = args.getItem(0).evaluate(interpreter);
      y = args.getItem(1).evaluate(interpreter);
    } else {
      x = args.evaluate(interpreter);
    }
    if (y !== void 0) {
      return x.min(y);
    } else if (operator !== void 0) {
      y = operator.state() as Item;
      const min = y !== void 0 ? x.min(y) : x;
      operator.setState(min);
      return min;
    }
    return Item.absent();
  }

  expand(args: Value, interpreter: Interpreter, operator: InvokeOperator): Item | undefined {
    if (args.length === 1) {
      args = args.evaluate(interpreter).toValue();
      return this.invoke(args, interpreter, operator);
    }
    return void 0;
  }
}

/** @hidden */
class AbsFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Item.Num) {
      return args.abs();
    }
    return Item.absent();
  }
}

/** @hidden */
class CeilFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Item.Num) {
      return args.ceil();
    }
    return Item.absent();
  }
}

/** @hidden */
class FloorFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Item.Num) {
      return args.floor();
    }
    return Item.absent();
  }
}

/** @hidden */
class RoundFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Item.Num) {
      return args.round();
    }
    return Item.absent();
  }
}

/** @hidden */
class SqrtFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    args = args.evaluate(interpreter).toValue();
    if (args instanceof Item.Num) {
      return args.sqrt();
    }
    return Item.absent();
  }
}

/** @hidden */
class PowFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    interpreter = Interpreter.fromAny(interpreter);
    const x = args.getItem(0).evaluate(interpreter);
    const y = args.getItem(1).evaluate(interpreter);
    if (x instanceof Item.Num && y instanceof Item.Num) {
      return x.pow(y);
    }
    return Item.absent();
  }
}

/** @hidden */
class RateFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    interpreter = Interpreter.fromAny(interpreter);
    let value: number;
    let period: number;
    if (args.length >= 2) {
      value = args.getItem(0).evaluate(interpreter).numberValue(NaN);
      period = args.getItem(1).evaluate(interpreter).numberValue(1000);
    } else {
      value = args.evaluate(interpreter).numberValue(NaN);
      period = 1000;
    }
    if (isFinite(value) && operator !== void 0) {
      let state = operator.state() as {v0: number, t0: number, dv: number, dt: number} | undefined;
      if (state === void 0) {
        state = {v0: value, t0: Date.now(), dv: 0, dt: 0};
        operator.setState(state);
      } else {
        const t1 = Date.now();
        const dt = t1 - state.t0;
        if (dt > period && t1 > state.t0 || dt > 2 * period) {
          const dv = value - state.v0;
          state.v0 = value;
          state.t0 = t1;
          state.dv = dv;
          state.dt = dt;
        }
        operator.setState(state);
        if (state.dt !== 0) {
          const rate = period * state.dv / state.dt;
          return Item.Num.from(rate);
        }
      }
    }
    return Item.absent();
  }

  expand(args: Value, interpreter: Interpreter, operator: InvokeOperator): Item | undefined {
    args = args.evaluate(interpreter).toValue();
    return this.invoke(args, interpreter, operator);
  }
}

/** @hidden */
class RandomFunc extends BridgeFunc {
  invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
    args = args.evaluate(interpreter).toValue();
    const lower = args.length >= 1 ? args.getItem(0).numberValue(0.0) : 0.0;
    const upper = args.length >= 2 ? args.getItem(1).numberValue(lower + 1.0) : lower + 1.0;
    const value = lower + Math.random() * (upper - lower);
    return Item.Num.from(value);
  }
}
