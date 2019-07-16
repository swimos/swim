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

import {Murmur3, Objects} from "@swim/util";
import {Output} from "@swim/codec";
import {Item} from "../Item";
import {Func} from "../Func";

export abstract class BridgeFunc extends Func {
  typeOrder(): number {
    return 51;
  }

  compareTo(that: Item): 0 | 1 | -1 {
    if (that instanceof BridgeFunc) {
      return Objects.compare((this as any).__proto__.constructor.name,
                             (that as any).__proto__.constructor.name);
    }
    return Objects.compare(this.typeOrder(), that.typeOrder());
  }

  equals(that: unknown): boolean {
    return this === that;
  }

  hashCode(): number {
    return Murmur3.seed((this as any).__proto__.constructor);
  }

  debug(output: Output) {
    output = output.write((this as any).__proto__.constructor.name);
  }
}
Item.BridgeFunc = BridgeFunc;
