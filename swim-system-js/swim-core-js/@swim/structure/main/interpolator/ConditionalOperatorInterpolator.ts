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

import {AnyItem, Item} from "../Item";
import {Value} from "../Value";
import {ConditionalOperator} from "../operator/ConditionalOperator";
import {ItemInterpolator} from "./ItemInterpolator";

export class ConditionalOperatorInterpolator extends ItemInterpolator<Item> {
  /** @hidden */
  readonly ifTermInterpolator: ItemInterpolator<Value>;
  /** @hidden */
  readonly thenTermInterpolator: ItemInterpolator<Value>;
  /** @hidden */
  readonly elseTermInterpolator: ItemInterpolator<Value>;

  constructor(e0: ConditionalOperator, e1: ConditionalOperator) {
    super();
    this.ifTermInterpolator = ItemInterpolator.between(e0.ifTerm(), e1.ifTerm());
    this.thenTermInterpolator = ItemInterpolator.between(e0.thenTerm(), e1.thenTerm());
    this.elseTermInterpolator = ItemInterpolator.between(e0.elseTerm(), e1.elseTerm());
  }

  interpolate(u: number): Item {
    const ifTerm = this.ifTermInterpolator.interpolate(u);
    const thenTerm = this.thenTermInterpolator.interpolate(u);
    const elseTerm = this.elseTermInterpolator.interpolate(u);
    return ifTerm.conditional(thenTerm, elseTerm);
  }

  deinterpolate(f: AnyItem): number {
    return 0; // not implemented
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ConditionalOperatorInterpolator) {
      return this.ifTermInterpolator.equals(that.ifTermInterpolator)
          && this.thenTermInterpolator.equals(that.thenTermInterpolator)
          && this.elseTermInterpolator.equals(that.elseTermInterpolator);
    }
    return false;
  }
}
ItemInterpolator.ConditionalOperator = ConditionalOperatorInterpolator;
