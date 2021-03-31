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

import {Interpolator} from "@swim/mapping";
import type {Item} from "../Item";
import {ConditionalOperator} from "./ConditionalOperator";

/** @hidden */
export interface ConditionalOperatorInterpolator extends Interpolator<ConditionalOperator> {
  /** @hidden */
  readonly ifTermInterpolator: Interpolator<Item>;
  /** @hidden */
  readonly thenTermInterpolator: Interpolator<Item>;
  /** @hidden */
  readonly elseTermInterpolator: Interpolator<Item>;

  readonly 0: ConditionalOperator;

  readonly 1: ConditionalOperator;

  equals(that: unknown): boolean;
}

/** @hidden */
export const ConditionalOperatorInterpolator = function (y0: ConditionalOperator, y1: ConditionalOperator): ConditionalOperatorInterpolator {
  const interpolator = function (u: number): ConditionalOperator {
    const ifTerm = interpolator.ifTermInterpolator(u);
    const thenTerm = interpolator.thenTermInterpolator(u);
    const elseTerm = interpolator.elseTermInterpolator(u);
    return new ConditionalOperator(ifTerm, thenTerm, elseTerm);
  } as ConditionalOperatorInterpolator;
  Object.setPrototypeOf(interpolator, ConditionalOperatorInterpolator.prototype);
  Object.defineProperty(interpolator, "ifTermInterpolator", {
    value: y0.ifTerm.interpolateTo(y1.ifTerm),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "thenTermInterpolator", {
    value: y0.thenTerm.interpolateTo(y1.thenTerm),
    enumerable: true,
  });
  Object.defineProperty(interpolator, "elseTermInterpolator", {
    value: y0.elseTerm.interpolateTo(y1.elseTerm),
    enumerable: true,
  });
  return interpolator;
} as {
  (y0: ConditionalOperator, y1: ConditionalOperator): ConditionalOperatorInterpolator;

  /** @hidden */
  prototype: ConditionalOperatorInterpolator;
};

ConditionalOperatorInterpolator.prototype = Object.create(Interpolator.prototype);

Object.defineProperty(ConditionalOperatorInterpolator.prototype, 0, {
  get(this: ConditionalOperatorInterpolator): ConditionalOperator {
    const ifTerm = this.ifTermInterpolator[0];
    const thenTerm = this.thenTermInterpolator[0];
    const elseTerm = this.elseTermInterpolator[0];
    return new ConditionalOperator(ifTerm, thenTerm, elseTerm);
  },
  enumerable: true,
  configurable: true,
});

Object.defineProperty(ConditionalOperatorInterpolator.prototype, 1, {
  get(this: ConditionalOperatorInterpolator): ConditionalOperator {
    const ifTerm = this.ifTermInterpolator[1];
    const thenTerm = this.thenTermInterpolator[1];
    const elseTerm = this.elseTermInterpolator[1];
    return new ConditionalOperator(ifTerm, thenTerm, elseTerm);
  },
  enumerable: true,
  configurable: true,
});

ConditionalOperatorInterpolator.prototype.equals = function (that: unknown): boolean {
  if (this === that) {
    return true;
  } else if (that instanceof ConditionalOperatorInterpolator) {
    return this.ifTermInterpolator.equals(that.ifTermInterpolator)
        && this.thenTermInterpolator.equals(that.thenTermInterpolator)
        && this.elseTermInterpolator.equals(that.elseTermInterpolator);
  }
  return false;
};
