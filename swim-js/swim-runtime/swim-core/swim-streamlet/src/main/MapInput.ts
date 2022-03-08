// Copyright 2015-2022 Swim.inc
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

import type {Mutable, Cursor, Map} from "@swim/util";
import {BTree} from "@swim/collections";
import {KeyEffect} from "./KeyEffect";
import {AbstractMapOutlet} from "./AbstractMapOutlet";

/** @public */
export class MapInput<K, V> extends AbstractMapOutlet<K, V, Map<K, V>> {
  constructor(state?: BTree<K, V>) {
    super();
    if (state === void 0) {
      state = new BTree();
    }
    this.state = state;
    let effects = this.effects;
    state.forEach(function (key: K): void {
      effects = effects.updated(key, KeyEffect.Update);
    }, this);
    (this as Mutable<this>).effects = effects;
  }

  /** @internal */
  readonly state: BTree<K, V>;

  override has(key: K): boolean {
    return this.state.has(key);
  }

  override get(): Map<K, V> | undefined;
  override get(key: K): V | undefined;
  override get(key?: K): Map<K, V> | V | undefined {
    if (key === void 0) {
      return this.state;
    } else {
      return this.state.get(key);
    }
  }

  set(key: K, newValue: V): V | undefined {
    const oldState = this.state;
    const oldValue = oldState.get(key);
    if (oldValue !== newValue) {
      (this as Mutable<this>).state = oldState.updated(key, newValue);
      this.decohereInputKey(key, KeyEffect.Update);
    }
    return oldValue;
  }

  delete(key: K): this {
    const oldState = this.state;
    const newState = oldState.removed(key);
    if (oldState !== newState) {
      (this as Mutable<this>).state = newState;
      this.decohereInputKey(key, KeyEffect.Remove);
    }
    return this;
  }

  keyIterator(): Cursor<K> {
    return this.state.keys();
  }
}
