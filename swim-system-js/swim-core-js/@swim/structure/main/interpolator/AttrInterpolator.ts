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

import {AnyItem} from "../Item";
import {Attr} from "../Attr";
import {Value} from "../Value";
import {Text} from "../Text";
import {ItemInterpolator} from "./ItemInterpolator";

export class AttrInterpolator extends ItemInterpolator<Attr> {
  /** @hidden */
  readonly keyInterpolator: ItemInterpolator<Text>;
  /** @hidden */
  readonly valueInterpolator: ItemInterpolator<Value>;

  constructor(a0: Attr, a1: Attr) {
    super();
    this.keyInterpolator = ItemInterpolator.between(a0.key, a1.key);
    this.valueInterpolator = ItemInterpolator.between(a0.value, a1.value);
  }

  interpolate(u: number): Attr {
    const key = this.keyInterpolator.interpolate(u);
    const value = this.valueInterpolator.interpolate(u);
    return Attr.of(key, value);
  }

  deinterpolate(f: AnyItem): number {
    return 0; // not implemented
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof AttrInterpolator) {
      return this.keyInterpolator.equals(that.keyInterpolator)
          && this.valueInterpolator.equals(that.valueInterpolator);
    }
    return false;
  }
}
ItemInterpolator.Attr = AttrInterpolator;
