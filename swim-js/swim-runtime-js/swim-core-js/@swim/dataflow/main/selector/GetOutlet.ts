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
import {AbstractOutlet, OutletInlet, OutletMapInlet} from "@swim/streamlet";

/** @hidden */
export class GetOutlet extends AbstractOutlet<Value> {
  constructor() {
    super();
    this.keyInlet = new OutletInlet<Value>(this);
    this.mapInlet = new OutletMapInlet<Value, Value, unknown>(this);
  }

  readonly keyInlet: OutletInlet<Value>;

  readonly mapInlet: OutletMapInlet<Value, Value, unknown>;

  override get(): Value {
    const keyInput = this.keyInlet.input;
    if (keyInput !== null) {
      const key = keyInput.get();
      if (key !== void 0) {
        const mapInput = this.mapInlet.input;
        if (mapInput !== null) {
          const value = mapInput.get(key);
          if (value !== void 0) {
            return value;
          }
        }
      }
    }
    return Value.absent();
  }
}
