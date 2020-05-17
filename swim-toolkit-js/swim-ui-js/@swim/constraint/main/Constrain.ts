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

import {ConstraintKey, ConstraintMap} from "./ConstraintMap";
import {ConstrainSum} from "./ConstrainSum";
import {ConstrainTerm} from "./ConstrainTerm";
import {ConstrainProduct} from "./ConstrainProduct";
import {ConstrainConstant} from "./ConstrainConstant";
import {ConstrainVariable} from "./ConstrainVariable";
import {ConstrainBinding} from "./ConstrainBinding";

export abstract class Constrain implements ConstraintKey {
  /** @hidden */
  readonly _id: number;

  constructor() {
    this._id = ConstraintMap.nextId();
  }

  /** @hidden */
  get id(): number {
    return this._id;
  }

  abstract isConstant(): boolean;

  abstract get terms(): ConstraintMap<ConstrainVariable, number>;

  abstract get constant(): number;

  abstract plus(that: Constrain | number): Constrain;

  abstract opposite(): Constrain;

  abstract minus(that: Constrain | number): Constrain;

  abstract times(scalar: number): Constrain;

  abstract divide(scalar: number): Constrain;

  static sum(...args: (Constrain | number)[]): ConstrainSum {
    const terms = new ConstraintMap<ConstrainVariable, number>();
    let constant = 0;
    for (let i = 0, n = args.length; i < n; i += 1) {
      const arg = args[i];
      if (typeof arg === "number") {
        constant += arg;
      } else if (arg instanceof Constrain.Term) {
        const variable = arg.variable;
        if (variable !== null) {
          const field = terms.getField(variable);
          if (field !== void 0) {
            field[1] += arg.coefficient;
          } else {
            terms.set(variable, arg.coefficient);
          }
        } else {
          constant += arg.constant;
        }
      } else {
        const subterms = arg.terms;
        for (let j = 0, k = subterms.size; j < k; j += 1) {
          const [variable, coefficient] = subterms.getEntry(j)!;
          const field = terms.getField(variable);
          if (field !== void 0) {
            field[1] += coefficient;
          } else {
            terms.set(variable, coefficient);
          }
        }
        constant += arg.constant;
      }
    }
    return new Constrain.Sum(terms, constant);
  }

  static product(coefficient: number, variable: ConstrainVariable): ConstrainProduct {
    return new Constrain.Product(coefficient, variable);
  }

  static constant(value: number): ConstrainConstant {
    return new Constrain.Constant(value);
  }

  static zero(): ConstrainConstant {
    return new Constrain.Constant(0);
  }

  // Forward type declarations
  /** @hidden */
  static Sum: typeof ConstrainSum; // defined by ConstrainSum
  /** @hidden */
  static Term: typeof ConstrainTerm; // defined by ConstrainTerm
  /** @hidden */
  static Product: typeof ConstrainProduct; // defined by ConstrainProduct
  /** @hidden */
  static Constant: typeof ConstrainConstant; // defined by ConstrainConstant
  /** @hidden */
  static Variable: typeof ConstrainVariable; // defined by ConstrainVariable
  /** @hidden */
  static Binding: typeof ConstrainBinding; // defined by ConstrainBinding
}
