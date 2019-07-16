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

import {AnyItem, Field, Attr, Value, Text} from "@swim/structure";
import {Interpolator} from "../Interpolator";
import {StructureInterpolator} from "../StructureInterpolator";

export class AttrInterpolator extends StructureInterpolator<Attr> {
  private readonly keyInterpolator: StructureInterpolator<Text>;
  private readonly valueInterpolator: StructureInterpolator<Value>;

  constructor(f0?: Field, f1?: Field) {
    super();
    if (!f0 && !f1) {
      throw new TypeError();
    } else if (!f1) {
      f1 = f0;
    } else if (!f0) {
      f0 = f1;
    }
    if (!(f0!.key instanceof Text)) {
      throw new TypeError("" + f0!.key);
    } else if (!(f1!.key instanceof Text)) {
      throw new TypeError("" + f1!.key);
    }
    f0!.commit();
    f1!.commit();
    this.keyInterpolator = Interpolator.structure(f0!.key, f1!.key);
    this.valueInterpolator = Interpolator.structure(f0!.value, f1!.value);
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
StructureInterpolator.Attr = AttrInterpolator;
