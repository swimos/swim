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

import {Iterator, Cursor, Map} from "@swim/util";
import {BTree} from "@swim/collections";
import {KeyEffect} from "../KeyEffect";
import {AbstractMapInletMapOutlet} from "../AbstractMapInletMapOutlet";

export abstract class FilterFieldsOperator<K, V, I> extends AbstractMapInletMapOutlet<K, K, V, V, I, Map<K, V>> {
  override has(key: K): boolean {
    const input = this.input;
    if (input !== null) {
      const value = input.get(key);
      return value !== void 0 && this.evaluate(key, value);
    }
    return false;
  }

  override get(): Map<K, V>;
  override get(key: K): V | undefined;
  override get(key?: K): Map<K, V> | V | undefined {
    if (key === void 0) {
      const output = new BTree<K, V>();
      const keys = this.keyIterator();
      do {
        const next = keys.next();
        if (!next.done) {
          const key = next.value!;
          const value = this.input!.get(key);
          if (value !== void 0 && this.evaluate(key, value)) {
            output.set(key, value);
          }
          continue;
        }
        break;
      } while (true);
      return output;
    } else {
      const input = this.input;
      if (input !== null) {
        const value = input.get(key);
        if (value !== void 0 && this.evaluate(key, value)) {
          return value;
        }
      }
      return void 0;
    }
  }

  override keyIterator(): Iterator<K> {
    const input = this.input;
    if (input !== null) {
      return input.keyIterator(); // TODO: filter keys
    } else {
      return Cursor.empty();
    }
  }

  protected override onDecohereOutputKey(key: K, effect: KeyEffect): void {
    this.decohereInputKey(key, effect);
  }

  protected override onRecohereOutputKey(key: K, effect: KeyEffect, version: number): void {
    this.recohereInputKey(key, version);
  }

  protected override willRecohereInputKey(key: K, effect: KeyEffect, version: number): KeyEffect {
    if (effect === KeyEffect.Update) {
      const input = this.input;
      if (input !== null) {
        const value = input.get(key);
        if (value === void 0 || !this.evaluate(key, value)) {
          return KeyEffect.Remove;
        }
      }
    }
    return effect;
  }

  abstract evaluate(key: K, value: V): boolean;
}
