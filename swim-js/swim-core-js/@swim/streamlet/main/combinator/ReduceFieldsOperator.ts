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

import {BTree} from "@swim/collections";
import {KeyEffect} from "../KeyEffect";
import {AbstractMapInletOutlet} from "../AbstractMapInletOutlet";

export abstract class ReduceFieldsOperator<K, V, I, O> extends AbstractMapInletOutlet<K, V, I, O> {
  /** @hidden */
  protected _state: BTree<K, V, O>;

  constructor() {
    super();
    this._state = new BTree();
  }

  get(): O | undefined {
    return this._state.reduced(this.identity(), this.accumulate.bind(this), this.combine.bind(this));
  }

  protected onReconcileOutputKey(key: K, effect: KeyEffect, version: number): void {
    if (effect === KeyEffect.Update) {
      if (this._input !== null) {
        const value = this._input.get(key);
        if (value !== void 0) {
          this._state.set(key, value);
        } else {
          this._state.delete(key);
        }
      }
    } else if (effect === KeyEffect.Remove) {
      this._state.delete(key);
    }
  }

  abstract identity(): O;

  abstract accumulate(result: O, value: V): O;

  abstract combine(result: O, value: O): O;
}
