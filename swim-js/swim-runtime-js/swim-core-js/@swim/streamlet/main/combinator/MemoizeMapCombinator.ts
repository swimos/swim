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

import type {Mutable, Iterator} from "@swim/util";
import {BTree} from "@swim/collections";
import {KeyEffect} from "../KeyEffect";
import type {MapOutlet} from "../MapOutlet";
import {AbstractMapInoutlet} from "../AbstractMapInoutlet";

export class MemoizeMapCombinator<K, V, IO> extends AbstractMapInoutlet<K, V, V, IO, IO> {
  constructor() {
    super();
    this.state = void 0;
    this.cache = new BTree();
  }

  /** @internal */
  readonly state: IO | undefined;

  /** @internal */
  readonly cache: BTree<K, V>;

  override has(key: K): boolean {
    return this.cache.has(key);
  }

  override get(): IO | undefined;
  override get(key: K): V | undefined;
  override get(key?: K): IO | V | undefined {
    if (key === void 0) {
      let state = this.state;
      const input = this.input;
      if (state === void 0 && input !== null) {
        state = input.get();
        (this as Mutable<this>).state = state;
      }
      return state;
    } else {
      return this.cache.get(key);
    }
  }

  override keyIterator(): Iterator<K> {
    return this.cache.keys();
  }

  protected override onRecohereKey(key: K, effect: KeyEffect, version: number): void {
    if (effect === KeyEffect.Update) {
      const input = this.input;
      if (input !== null) {
        const value = input.get(key);
        if (value !== void 0) {
          (this as Mutable<this>).cache = this.cache.updated(key, value);
        } else {
          (this as Mutable<this>).cache = this.cache.removed(key);
        }
      }
    } else if (effect === KeyEffect.Remove) {
      (this as Mutable<this>).cache = this.cache.removed(key);
    }
  }

  protected override onRecohere(version: number): void {
    (this as Mutable<this>).state = void 0;
  }

  override memoize(): MapOutlet<K, V, IO> {
    return this;
  }
}
