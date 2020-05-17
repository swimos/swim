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

import {AnyItem} from "../Item";
import {Field} from "../Field";
import {Slot} from "../Slot";
import {Value} from "../Value";
import {ItemInterpolator} from "./ItemInterpolator";

export class SlotInterpolator extends ItemInterpolator<Slot> {
  /** @hidden */
  readonly keyInterpolator: ItemInterpolator<Value>;
  /** @hidden */
  readonly valueInterpolator: ItemInterpolator<Value>;

  constructor(f0: Field, f1: Field) {
    super();
    this.keyInterpolator = ItemInterpolator.between(f0.key, f1.key);
    this.valueInterpolator = ItemInterpolator.between(f0.value, f1.value);
  }

  interpolate(u: number): Slot {
    const key = this.keyInterpolator.interpolate(u);
    const value = this.valueInterpolator.interpolate(u);
    return Slot.of(key, value);
  }

  deinterpolate(f: AnyItem): number {
    return 0; // not implemented
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof SlotInterpolator) {
      return this.keyInterpolator.equals(that.keyInterpolator)
          && this.valueInterpolator.equals(that.valueInterpolator);
    }
    return false;
  }
}
ItemInterpolator.Slot = SlotInterpolator;
