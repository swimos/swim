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

import {AnyItem, Item, Value, UnaryOperator} from "@swim/structure";
import {Interpolator} from "../Interpolator";
import {StructureInterpolator} from "../StructureInterpolator";

export class UnaryOperatorInterpolator extends StructureInterpolator<Item> {
  private readonly operator: string;
  private readonly operandInterpolator: StructureInterpolator<Value>;

  constructor(e0?: UnaryOperator, e1?: UnaryOperator) {
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
    this.operandInterpolator = Interpolator.structure(e0!.operand(), e1!.operand());
  }

  interpolate(u: number): Item {
    const operand = this.operandInterpolator.interpolate(u);
    switch (this.operator) {
      case "!": return operand.not();
      case "~": return operand.bitwiseNot();
      case "-": return operand.negative();
      default: throw new Error(this.operator);
    }
  }

  deinterpolate(f: AnyItem): number {
    return 0; // not implemented
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UnaryOperatorInterpolator) {
      return this.operator === that.operator
          &&  this.operandInterpolator.equals(that.operandInterpolator);
    }
    return false;
  }
}
StructureInterpolator.UnaryOperator = UnaryOperatorInterpolator;
