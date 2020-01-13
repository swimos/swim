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

import {MapOutlet} from "./MapOutlet";
import {AbstractOutlet} from "./AbstractOutlet";

export class KeyOutlet<K, V> extends AbstractOutlet<V> {
  /** @hidden */
  protected readonly _input: MapOutlet<K, V, unknown>;
  /** @hidden */
  protected readonly _key: K;

  constructor(input: MapOutlet<K, V, unknown>, key: K) {
    super();
    this._input = input;
    this._key = key;
  }

  input(): MapOutlet<K, V, unknown> {
    return this._input;
  }

  key(): K {
    return this._key;
  }

  get(): V | undefined {
    return this._input.get(this._key);
  }
}
