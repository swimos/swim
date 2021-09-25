// Copyright 2015-2021 Swim Inc.
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

import {Value} from "@swim/structure";
import {Inlet, AbstractOutlet, OutletInlet} from "@swim/streamlet";

export class ConditionalOutlet extends AbstractOutlet<Value> {
  constructor() {
    super();
    this.ifInlet = new OutletInlet<Value>(this);
    this.thenInlet = new OutletInlet<Value>(this);
    this.elseInlet = new OutletInlet<Value>(this);
  }

  readonly ifInlet: Inlet<Value>;

  readonly thenInlet: Inlet<Value>;

  readonly elseInlet: Inlet<Value>;

  override get(): Value {
    const ifInput = this.ifInlet.input;
    if (ifInput !== null) {
      const ifTerm = ifInput.get();
      if (ifTerm !== void 0) {
        if (ifTerm.isDefinite()) {
          const thenInput = this.thenInlet.input;
          if (thenInput !== null) {
            const thenTerm = thenInput.get();
            if (thenTerm !== void 0) {
              return thenTerm;
            }
          }
        } else {
          const elseInput = this.elseInlet.input;
          if (elseInput !== null) {
            const elseTerm = elseInput.get();
            if (elseTerm !== void 0) {
              return elseTerm;
            }
          }
        }
      }
    }
    return Value.absent();
  }
}
