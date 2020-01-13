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

import {AnyItem, Item, AnyRecord, Record} from "@swim/structure";
import {Interpolator} from "../Interpolator";
import {StructureInterpolator} from "../StructureInterpolator";

export class RecordInterpolator extends StructureInterpolator<Record> {
  private readonly interpolators: StructureInterpolator<Item>[];

  constructor(r0?: AnyRecord, r1?: AnyRecord) {
    super();
    if (r0 !== void 0) {
      r0 = Record.fromAny(r0);
    }
    if (r1 !== void 0) {
      r1 = Record.fromAny(r1);
    }
    if (!r0 && !r1) {
      r1 = r0 = Record.empty();
    } else if (!r1) {
      r1 = r0;
    } else if (!r0) {
      r0 = r1;
    }
    r0!.commit();
    r1!.commit();
    this.interpolators = [];
    const n = Math.min(r0!.length, r1!.length);
    for (let i = 0; i < n; i += 1) {
      this.interpolators.push(Interpolator.structure(r0!.getItem(i), r1!.getItem(i)));
    }
  }

  interpolate(u: number): Record {
    const n = this.interpolators.length;
    const record = Record.create(n);
    for (let i = 0; i < n; i += 1) {
      record.push(this.interpolators[i].interpolate(u));
    }
    return record;
  }

  deinterpolate(f: AnyItem): number {
    return 0; // not implemented
  }

  equals(that: any): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof RecordInterpolator) {
      const n = this.interpolators.length;
      if (n === that.interpolators.length) {
        for (let i = 0; i < n; i += 1) {
          if (!this.interpolators[i].equals(that.interpolators[i])) {
            return false;
          }
        }
        return true;
      }
    }
    return false;
  }
}
StructureInterpolator.Record = RecordInterpolator;
