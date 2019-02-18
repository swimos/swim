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

import {Iterator} from "@swim/util";
import {BTree} from "@swim/collections";
import {KeyEffect} from "../KeyEffect";
import {MapOutlet} from "../MapOutlet";
import {AbstractMapInoutlet} from "../AbstractMapInoutlet";

export class MemoizeMapCombinator<K, V, IO> extends AbstractMapInoutlet<K, V, V, IO, IO> {
  /** @hidden */
  protected _state: IO | undefined;
  /** @hidden */
  protected _cache: BTree<K, V>;

  constructor() {
    super();
    this._cache = new BTree();
  }

  has(key: K): boolean {
    return this._cache.has(key);
  }

  get(): IO | undefined;
  get(key: K): V | undefined;
  get(key?: K): IO | V | undefined {
    if (key === void 0) {
      if (this._state === void 0 && this._input != null) {
        this._state = this._input.get();
      }
      return this._state;
    } else {
      return this._cache.get(key);
    }
  }

  keyIterator(): Iterator<K> {
    return this._cache.keys();
  }

  protected onReconcileKey(key: K, effect: KeyEffect, version: number): void {
    if (effect === KeyEffect.Update) {
      if (this._input !== null) {
        const value = this._input.get(key);
        if (value !== void 0) {
          this._cache = this._cache.updated(key, value);
        } else {
          this._cache = this._cache.removed(key);
        }
      }
    } else if (effect === KeyEffect.Remove) {
      this._cache = this._cache.removed(key);
    }
  }

  protected onReconcile(version: number): void {
    this._state = void 0;
  }

  memoize(): MapOutlet<K, V, IO> {
    return this;
  }
}
MapOutlet.MemoizeMapCombinator = MemoizeMapCombinator;
