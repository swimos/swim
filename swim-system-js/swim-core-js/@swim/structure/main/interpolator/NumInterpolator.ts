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
import {Num} from "../Num";
import {ItemInterpolator} from "./ItemInterpolator";

export class NumInterpolator extends ItemInterpolator<Num> {
  /** @hidden */
  readonly y0: number;
  /** @hidden */
  readonly dy: number;

  constructor(y0: number, y1: number) {
    super();
    this.y0 = y0;
    this.dy = y1 - this.y0;
  }

  interpolate(u: number): Num {
    return Num.from(this.y0 + this.dy * u);
  }

  deinterpolate(y: AnyItem): number {
    y = Item.fromAny(y);
    if (y instanceof Num) {
      return this.dy !== 0 ? (y.value - this.y0) / this.dy : this.dy;
    }
    return 0;
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof NumInterpolator) {
      return this.y0 === that.y0 && this.dy === that.dy;
    }
    return false;
  }
}
ItemInterpolator.Num = NumInterpolator;
