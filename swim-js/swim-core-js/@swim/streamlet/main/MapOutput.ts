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

import {Map} from "@swim/util";
import {BTree} from "@swim/collections";
import {KeyEffect} from "./KeyEffect";
import {AbstractMapInlet} from "./AbstractMapInlet";

export class MapOutput<K, V> extends AbstractMapInlet<K, V, Map<K, V>> {
  /** @hidden */
  protected _state: BTree<K, V>;

  constructor() {
    super();
    this._state = new BTree();
  }

  get(): Map<K, V> {
    return this._state;
  }

  protected onReconcileOutputKey(key: K, effect: KeyEffect, version: number): void {
    if (effect === KeyEffect.Update) {
      if (this._input !== null) {
        const value = this._input.get(key);
        if (value !== void 0) {
          this._state = this._state.updated(key, value);
        } else {
          this._state = this._state.removed(key);
        }
      }
    } else if (effect === KeyEffect.Remove) {
      this._state = this._state.removed(key);
    }
  }
}
