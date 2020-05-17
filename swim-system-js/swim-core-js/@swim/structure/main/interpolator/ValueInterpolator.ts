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
import {ItemInterpolator} from "./ItemInterpolator";

export class ValueInterpolator<V extends Value> extends ItemInterpolator<V> {
  /** @hidden */
  readonly v0: V;
  /** @hidden */
  readonly v1: V;

  constructor(v0: V, v1: V) {
    super();
    this.v0 = v0.commit();
    this.v1 = v1.commit();
  }

  interpolate(u: number): V {
    return u < 1 ? this.v0 : this.v1;
  }

  deinterpolate(v: AnyItem): number {
    v = Item.fromAny(v);
    return v.equals(this.v1) ? 1 : 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof ValueInterpolator) {
      return this.v0.equals(that.v0) && this.v1.equals(that.v1);
    }
    return false;
  }
}
ItemInterpolator.Value = ValueInterpolator;
