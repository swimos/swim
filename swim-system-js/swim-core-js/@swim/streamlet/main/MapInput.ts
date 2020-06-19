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

import {Cursor, Map} from "@swim/util";
import {BTree} from "@swim/collections";
import {KeyEffect} from "./KeyEffect";
import {AbstractMapOutlet} from "./AbstractMapOutlet";

export class MapInput<K, V> extends AbstractMapOutlet<K, V, Map<K, V>> {
  /** @hidden */
  protected _state: BTree<K, V>;

  constructor(state: BTree<K, V> = new BTree()) {
    super();
    this._state = state;
    state.forEach(function (key: K): void {
      this._effects = this._effects.updated(key, KeyEffect.Update);
    }, this);
  }

  has(key: K): boolean {
    return this._state.has(key);
  }

  get(): Map<K, V> | undefined;
  get(key: K): V | undefined;
  get(key?: K): Map<K, V> | V | undefined {
    if (key === void 0) {
      return this._state;
    } else {
      return this._state.get(key);
    }
  }

  set(key: K, newValue: V): V | undefined {
    const oldValue = this._state.get(key);
    this._state = this._state.updated(key, newValue);
    this.decohereInputKey(key, KeyEffect.Update);
    return oldValue;
  }

  delete(key: K): this {
    const oldState = this._state;
    const newState = oldState.removed(key);
    if (oldState !== newState) {
      this._state = newState;
      this.decohereInputKey(key, KeyEffect.Remove);
    }
    return this;
  }

  keyIterator(): Cursor<K> {
    return this._state.keys();
  }
}
