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

import {AnyItem, Item, Value, InvokeOperator, Selector} from "@swim/structure";
import {Interpolator} from "../Interpolator";
import {StructureInterpolator} from "../StructureInterpolator";

export class InvokeOperatorInterpolator extends StructureInterpolator<Item> {
  readonly funcInterpolator: StructureInterpolator<Value>;
  readonly argsInterpolator: StructureInterpolator<Value>;

  constructor(e0?: InvokeOperator, e1?: InvokeOperator) {
    super();
    if (!e0 && !e1) {
      throw new TypeError();
    } else if (!e1) {
      e1 = e0;
    } else if (!e0) {
      e0 = e1;
    }
    e0!.commit();
    e1!.commit();
    this.funcInterpolator = Interpolator.structure(e0!.func(), e1!.func());
    this.argsInterpolator = Interpolator.structure(e0!.args(), e1!.args());
  }

  interpolate(u: number): Item {
    const func = this.funcInterpolator.interpolate(u);
    const args = this.argsInterpolator.interpolate(u);
    return Selector.literal(func).invoke(args);
  }

  deinterpolate(f: AnyItem): number {
    return 0; // not implemented
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof InvokeOperatorInterpolator) {
      return this.funcInterpolator.equals(that.funcInterpolator)
          && this.argsInterpolator.equals(that.argsInterpolator);
    }
    return false;
  }
}
StructureInterpolator.InvokeOperator = InvokeOperatorInterpolator;
