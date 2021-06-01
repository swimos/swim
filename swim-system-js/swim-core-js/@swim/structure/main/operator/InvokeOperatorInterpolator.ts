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

import {Interpolator} from "@swim/mapping";
import type {Item} from "../Item";
import {InvokeOperator} from "./InvokeOperator";

/** @hidden */
export interface InvokeOperatorInterpolator extends Interpolator<InvokeOperator> {
  /** @hidden */
  readonly funcInterpolator: Interpolator<Item>;
  /** @hidden */
  readonly argsInterpolator: Interpolator<Item>;

  readonly 0: InvokeOperator;

  readonly 1: InvokeOperator;

  equals(that: unknown): boolean;
}

/** @hidden */
export const InvokeOperatorInterpolator = function (y0: InvokeOperator, y1: InvokeOperator): InvokeOperatorInterpolator {
  const interpolator = function (u: number): InvokeOperator {
    const func = interpolator.funcInterpolator(u);
    const args = interpolator.argsInterpolator(u);
    return new InvokeOperator(func, args);
  } as InvokeOperatorInterpolator;
  Object.setPrototypeOf(interpolator, InvokeOperatorInterpolator.prototype);
  Object.defineProperty(interpolator, "funcInterpolator", {
    value: y0.func.interpolateTo(y1.func),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "argsInterpolator", {
    value: y0.args.interpolateTo(y1.args),
    enumerable: true,
  });
  return interpolator;
} as {
  (y0: InvokeOperator, y1: InvokeOperator): InvokeOperatorInterpolator;

  /** @hidden */
  prototype: InvokeOperatorInterpolator;
};

InvokeOperatorInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(InvokeOperatorInterpolator.prototype, 0, {
  get(this: InvokeOperatorInterpolator): InvokeOperator {
    const func = this.funcInterpolator[0];
    const args = this.argsInterpolator[0];
    return new InvokeOperator(func, args);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(InvokeOperatorInterpolator.prototype, 1, {
  get(this: InvokeOperatorInterpolator): InvokeOperator {
    const func = this.funcInterpolator[1];
    const args = this.argsInterpolator[1];
    return new InvokeOperator(func, args);
  },
  enumerable: true,
  configurable: true,
});

InvokeOperatorInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof InvokeOperatorInterpolator) {
    return this.funcInterpolator.equals(that.funcInterpolator)
        && this.argsInterpolator.equals(that.argsInterpolator);
  }
  return false;
};
