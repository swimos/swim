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

import {AnyItem, Item, Value, BinaryOperator} from "@swim/structure";
import {Interpolator} from "../Interpolator";
import {StructureInterpolator} from "../StructureInterpolator";

export class BinaryOperatorInterpolator extends StructureInterpolator<Item> {
  private readonly operand1Interpolator: StructureInterpolator<Value>;
  private readonly operator: string;
  private readonly operand2Interpolator: StructureInterpolator<Value>;

  constructor(e0?: BinaryOperator, e1?: BinaryOperator) {
    super();
    if (!e0 && !e1) {
      throw new TypeError();
    } else if (!e1) {
      e1 = e0;
    } else if (!e0) {
      e0 = e1;
    }
    this.operator = e0!.operator();
    if (this.operator !== e1!.operator()) {
      throw new Error(e1!.operator());
    }
    e0!.commit();
    e1!.commit();
    this.operand1Interpolator = Interpolator.structure(e0!.operand1(), e1!.operand1());
    this.operand2Interpolator = Interpolator.structure(e0!.operand2(), e1!.operand2());
  }

  interpolate(u: number): Item {
    const operand1 = this.operand1Interpolator.interpolate(u);
    const operand2 = this.operand2Interpolator.interpolate(u);
    switch (this.operator) {
      case "||": return operand1.or(operand2);
      case "&&": return operand1.and(operand2);
      case "|": return operand1.bitwiseOr(operand2);
      case "^": return operand1.bitwiseXor(operand2);
      case "&": return operand1.bitwiseAnd(operand2);
      case "<": return operand1.lt(operand2);
      case "<=": return operand1.le(operand2);
      case "==": return operand1.eq(operand2);
      case "!=": return operand1.ne(operand2);
      case ">=": return operand1.ge(operand2);
      case ">": return operand1.gt(operand2);
      case "+": return operand1.plus(operand2);
      case "-": return operand1.minus(operand2);
      case "*": return operand1.times(operand2);
      case "/": return operand1.divide(operand2);
      case "%": return operand1.modulo(operand2);
      default: throw new Error(this.operator);
    }
  }

  deinterpolate(f: AnyItem): number {
    return 0; // not implemented
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof BinaryOperatorInterpolator) {
      return this.operand1Interpolator.equals(that.operand1Interpolator)
          && this.operator === that.operator
          && this.operand2Interpolator.equals(that.operand2Interpolator);
    }
    return false;
  }
}
StructureInterpolator.BinaryOperator = BinaryOperatorInterpolator;
