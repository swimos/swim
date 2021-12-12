// Copyright 2015-2021 Swim.inc
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
import {AbstractMapInoutlet} from "../AbstractMapInoutlet";

/** @public */
export abstract class MapFieldValuesOperator<K, VI, VO, I> extends AbstractMapInoutlet<K, VI, VO, I, Map<K, VO>> {
  override has(key: K): boolean {
    const input = this.input;
    if (input !== null) {
      return input.has(key);
    } else {
      return false;
    }
  }

  override get(): Map<K, VO>;
  override get(key: K): VO | undefined;
  override get(key?: K): Map<K, VO> | VO | undefined {
    if (key === void 0) {
      const output = new BTree<K, VO>();
      const keys = this.keyIterator();
      do {
        const next = keys.next();
        if (!next.done) {
          const key = next.value!;
          const value = this.evaluate(key, this.input!.get(key));
          if (value !== void 0) {
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
        return this.evaluate(key, input.get(key));
      } else {
        return void 0;
      }
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

  abstract evaluate(key: K, value: VI | undefined): VO | undefined;
}
