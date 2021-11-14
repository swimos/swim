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

import type {Mutable, Map} from "@swim/util";
import {BTree} from "@swim/collections";
import {KeyEffect} from "./KeyEffect";
import {AbstractMapInlet} from "./AbstractMapInlet";

/** @public */
export class MapOutput<K, V> extends AbstractMapInlet<K, V, Map<K, V>> {
  constructor() {
    super();
    this.state = new BTree();
  }

  /** @internal */
  readonly state: BTree<K, V>;

  get(): Map<K, V> {
    return this.state;
  }

  protected override onRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
    if (effect === KeyEffect.Update) {
      const input = this.input;
      if (input !== null) {
        const value = input.get(key);
        if (value !== void 0) {
          (this as Mutable<this>).state = this.state.updated(key, value);
        } else {
          (this as Mutable<this>).state = this.state.removed(key);
        }
      }
    } else if (effect === KeyEffect.Remove) {
      (this as Mutable<this>).state = this.state.removed(key);
    }
  }
}
