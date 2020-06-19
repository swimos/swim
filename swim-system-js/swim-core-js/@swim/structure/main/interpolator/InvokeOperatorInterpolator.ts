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

import {AnyItem, Item} from "../Item";
import {Value} from "../Value";
import {InvokeOperator} from "../operator/InvokeOperator";
import {Selector} from "../Selector";
import {ItemInterpolator} from "./ItemInterpolator";

export class InvokeOperatorInterpolator extends ItemInterpolator<Item> {
  /** @hidden */
  readonly funcInterpolator: ItemInterpolator<Value>;
  /** @hidden */
  readonly argsInterpolator: ItemInterpolator<Value>;

  constructor(e0: InvokeOperator, e1: InvokeOperator) {
    super();
    this.funcInterpolator = ItemInterpolator.between(e0.func(), e1.func());
    this.argsInterpolator = ItemInterpolator.between(e0.args(), e1.args());
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
ItemInterpolator.InvokeOperator = InvokeOperatorInterpolator;
