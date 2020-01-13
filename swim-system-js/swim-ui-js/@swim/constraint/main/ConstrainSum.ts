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

import {Output, Debug, Format} from "@swim/codec";
import {ConstraintMap} from "./ConstraintMap";
import {Constrain} from "./Constrain";
import {ConstrainVariable} from "./ConstrainVariable";

export class ConstrainSum extends Constrain implements Debug {
  /** @hidden */
  readonly _terms: ConstraintMap<ConstrainVariable, number>;
  /** @hidden */
  readonly _constant: number;

  constructor(terms: ConstraintMap<ConstrainVariable, number>, constant: number) {
    super();
    this._terms = terms;
    this._constant = constant;
  }

  isConstant(): boolean {
    return this._terms.isEmpty();
  }

  get terms(): ConstraintMap<ConstrainVariable, number> {
    return this._terms;
  }

  get constant(): number {
    return this._constant;
  }

  plus(that: Constrain | number): Constrain {
    return Constrain.sum(this, that);
  }

  opposite(): Constrain {
    const oldTerms = this._terms;
    const newTerms = new ConstraintMap<ConstrainVariable, number>();
    for (let i = 0, n = oldTerms.size; i < n; i += 1) {
      const [variable, coefficient] = oldTerms.getEntry(i)!;
      newTerms.set(variable, -coefficient);
    }
    return new ConstrainSum(newTerms, -this._constant);
  }

  minus(that: Constrain | number): Constrain {
    if (typeof that === "number") {
      that = Constrain.constant(that);
    } else {
      that = that.opposite();
    }
    return Constrain.sum(this, that);
  }

  times(scalar: number): Constrain {
    const oldTerms = this._terms;
    const newTerms = new ConstraintMap<ConstrainVariable, number>();
    for (let i = 0, n = oldTerms.size; i < n; i += 1) {
      const [variable, coefficient] = oldTerms.getEntry(i)!;
      newTerms.set(variable, coefficient * scalar);
    }
    return new ConstrainSum(newTerms, this._constant * scalar);
  }

  divide(scalar: number): Constrain {
    const oldTerms = this._terms;
    const newTerms = new ConstraintMap<ConstrainVariable, number>();
    for (let i = 0, n = oldTerms.size; i < n; i += 1) {
      const [variable, coefficient] = oldTerms.getEntry(i)!;
      newTerms.set(variable, coefficient / scalar);
    }
    return new ConstrainSum(newTerms, this._constant / scalar);
  }

  debug(output: Output): void {
    output = output.write("Constrain").write(46/*'.'*/).write("sum").write(40/*'('*/);
    const n = this._terms.size;
    for (let i = 0; i < n; i += 1) {
      const [variable, coefficient] = this._terms.getEntry(i)!;
      if (i > 0) {
        output = output.write(", ");
      }
      if (coefficient === 1) {
        output = output.debug(variable);
      } else {
        output = output.debug(Constrain.product(coefficient, variable));
      }
    }
    if (this._constant !== 0) {
      if (n > 0) {
        output = output.write(", ");
      }
      output = output.debug(this._constant);
    }
    output = output.write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }
}
Constrain.Sum = ConstrainSum;
