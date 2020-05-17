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
import {ConstrainTerm} from "./ConstrainTerm";
import {ConstrainVariable} from "./ConstrainVariable";

export class ConstrainProduct extends ConstrainTerm implements Debug {
  /** @hidden */
  readonly _coefficient: number;
  /** @hidden */
  readonly _variable: ConstrainVariable;

  constructor(coefficient: number, variable: ConstrainVariable) {
    super();
    this._coefficient = coefficient;
    this._variable = variable;
  }

  isConstant(): boolean {
    return false;
  }

  get coefficient(): number {
    return this._coefficient;
  }

  get variable(): ConstrainVariable {
    return this._variable;
  }

  get terms(): ConstraintMap<ConstrainVariable, number> {
    const terms = new ConstraintMap<ConstrainVariable, number>();
    terms.set(this._variable, this._coefficient);
    return terms;
  }

  get constant(): number {
    return 0;
  }

  plus(that: Constrain | number): Constrain {
    if (typeof that === "number") {
      that = Constrain.constant(that);
    }
    if (that instanceof ConstrainProduct && this._variable === that._variable) {
      return Constrain.product(this._coefficient + that._coefficient, this._variable);
    } else if (that instanceof Constrain.Variable && this._variable === that) {
      return Constrain.product(this._coefficient + 1, this._variable);
    } else {
      return Constrain.sum(this, that);
    }
  }

  opposite(): ConstrainTerm {
    return Constrain.product(-this._coefficient, this._variable);
  }

  minus(that: Constrain | number): Constrain {
    if (typeof that === "number") {
      that = Constrain.constant(that);
    }
    if (that instanceof ConstrainProduct && this._variable === that._variable) {
      return Constrain.product(this._coefficient - that._coefficient, this._variable);
    } else if (that instanceof Constrain.Variable && this._variable === that) {
      return Constrain.product(this._coefficient - 1, this._variable);
    } else {
      return Constrain.sum(this, that.opposite());
    }
  }

  times(scalar: number): Constrain {
    return Constrain.product(this._coefficient * scalar, this._variable);
  }

  divide(scalar: number): Constrain {
    return Constrain.product(this._coefficient / scalar, this._variable);
  }

  debug(output: Output): void {
    output = output.write("Constrain").write(46/*'.'*/).write("product").write(40/*'('*/)
        .debug(this._coefficient).write(", ").debug(this._variable).write(41/*')'*/);
  }

  toString(): string {
    return Format.debug(this);
  }
}
Constrain.Product = ConstrainProduct;
