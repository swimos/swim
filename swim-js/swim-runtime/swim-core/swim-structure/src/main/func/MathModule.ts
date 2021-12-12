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

import {Item} from "../Item";
import type {Value} from "../Value";
import {Record} from "../Record";
import {Num} from "../Num";
import type {InvokeOperator} from "../operator/InvokeOperator";
import type {Func} from "./Func";
import {BridgeFunc} from "./BridgeFunc";
import {Interpreter} from "../"; // forward import

/** @public */
export const MathModule = (function () {
  const MathModule = {} as {
    readonly max: Func;

    readonly min: Func;

    readonly abs: Func;

    readonly ceil: Func;

    readonly floor: Func;

    readonly round: Func;

    readonly sqrt: Func;

    readonly pow: Func;

    readonly rate: Func;

    readonly random: Func;

    readonly scope: Record;
  };

  Object.defineProperty(MathModule, "max", {
    get(): Func {
      const func = new MaxFunc();
      Object.defineProperty(MathModule, "max", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "min", {
    get(): Func {
      const func = new MinFunc();
      Object.defineProperty(MathModule, "min", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "abs", {
    get(): Func {
      const func = new AbsFunc();
      Object.defineProperty(MathModule, "abs", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "ceil", {
    get(): Func {
      const func = new CeilFunc();
      Object.defineProperty(MathModule, "ceil", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "floor", {
    get(): Func {
      const func = new FloorFunc();
      Object.defineProperty(MathModule, "floor", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "round", {
    get(): Func {
      const func = new RoundFunc();
      Object.defineProperty(MathModule, "round", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "sqrt", {
    get(): Func {
      const func = new SqrtFunc();
      Object.defineProperty(MathModule, "sqrt", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "pow", {
    get(): Func {
      const func = new PowFunc();
      Object.defineProperty(MathModule, "pow", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "rate", {
    get(): Func {
      const func = new RateFunc();
      Object.defineProperty(MathModule, "rate", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "random", {
    get(): Func {
      const func = new RandomFunc();
      Object.defineProperty(MathModule, "random", {
        value: func,
        enumerable: true,
        configurable: true,
      });
      return func;
    },
    enumerable: true,
    configurable: true,
  });

  Object.defineProperty(MathModule, "scope", {
    get(): Record {
      const scope = Record.create(10)
          .slot("max", MathModule.max)
          .slot("min", MathModule.min)
          .slot("abs", MathModule.abs)
          .slot("ceil", MathModule.ceil)
          .slot("floor", MathModule.floor)
          .slot("round", MathModule.round)
          .slot("pow", MathModule.pow)
          .slot("sqrt", MathModule.sqrt)
          .slot("rate", MathModule.rate)
          .slot("random", MathModule.random)
          .commit();
      Object.defineProperty(MathModule, "scope", {
        value: scope,
        configurable: true,
        enumerable: true,
      });
      return scope;
    },
    enumerable: true,
    configurable: true,
  });

  class MaxFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
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
        y = operator.state as Item;
        const max = y !== void 0 ? x.max(y) : x;
        operator.setState(max);
        return max;
      }
      return Item.absent();
    }

    override expand(args: Value, interpreter: Interpreter, operator: InvokeOperator): Item | undefined {
      if (args.length === 1) {
        args = args.evaluate(interpreter).toValue();
        return this.invoke(args, interpreter, operator);
      }
      return void 0;
    }
  }

  class MinFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
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
        y = operator.state as Item;
        const min = y !== void 0 ? x.min(y) : x;
        operator.setState(min);
        return min;
      }
      return Item.absent();
    }

    override expand(args: Value, interpreter: Interpreter, operator: InvokeOperator): Item | undefined {
      if (args.length === 1) {
        args = args.evaluate(interpreter).toValue();
        return this.invoke(args, interpreter, operator);
      }
      return void 0;
    }
  }

  class AbsFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
      args = args.evaluate(interpreter).toValue();
      if (args instanceof Num) {
        return args.abs();
      }
      return Item.absent();
    }
  }

  class CeilFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
      args = args.evaluate(interpreter).toValue();
      if (args instanceof Num) {
        return args.ceil();
      }
      return Item.absent();
    }
  }

  class FloorFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
      args = args.evaluate(interpreter).toValue();
      if (args instanceof Num) {
        return args.floor();
      }
      return Item.absent();
    }
  }

  class RoundFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
      args = args.evaluate(interpreter).toValue();
      if (args instanceof Num) {
        return args.round();
      }
      return Item.absent();
    }
  }

  class SqrtFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
      args = args.evaluate(interpreter).toValue();
      if (args instanceof Num) {
        return args.sqrt();
      }
      return Item.absent();
    }
  }

  class PowFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
      interpreter = Interpreter.fromAny(interpreter);
      const x = args.getItem(0).evaluate(interpreter);
      const y = args.getItem(1).evaluate(interpreter);
      if (x instanceof Num && y instanceof Num) {
        return x.pow(y);
      }
      return Item.absent();
    }
  }

  class RateFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
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
        let state = operator.state as {v0: number, t0: number, dv: number, dt: number} | undefined;
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
            return Num.from(rate);
          }
        }
      }
      return Item.absent();
    }

    override expand(args: Value, interpreter: Interpreter, operator: InvokeOperator): Item | undefined {
      args = args.evaluate(interpreter).toValue();
      return this.invoke(args, interpreter, operator);
    }
  }

  class RandomFunc extends BridgeFunc {
    override invoke(args: Value, interpreter?: Interpreter, operator?: InvokeOperator): Item {
      args = args.evaluate(interpreter).toValue();
      const lower = args.length >= 1 ? args.getItem(0).numberValue(0.0) : 0.0;
      const upper = args.length >= 2 ? args.getItem(1).numberValue(lower + 1.0) : lower + 1.0;
      const value = lower + Math.random() * (upper - lower);
      return Num.from(value);
    }
  }

  return MathModule;
})();
