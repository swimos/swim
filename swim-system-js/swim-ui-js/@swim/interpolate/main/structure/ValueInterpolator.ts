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

import {AnyItem, Item, AnyValue, Value} from "@swim/structure";
import {StructureInterpolator} from "../StructureInterpolator";

export class ValueInterpolator<V extends Value> extends StructureInterpolator<V> {
  private readonly v0: V;
  private readonly v1: V;

  constructor(v0?: AnyValue, v1?: AnyValue) {
    super();
    if (v0 !== void 0) {
      v0 = Value.fromAny(v0);
    }
    if (v1 !== void 0) {
      v1 = Value.fromAny(v1);
    }
    if (!v0 && !v1) {
      v1 = v0 = Value.absent();
    } else if (!v1) {
      v1 = v0;
    } else if (!v0) {
      v0 = v1;
    }
    this.v0 = v0!.commit() as V;
    this.v1 = v1!.commit() as V;
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
StructureInterpolator.Value = ValueInterpolator;
