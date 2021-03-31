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

import {Cursor} from "@swim/util";

/** @hidden */
export class ValuesCursor<K, V> extends Cursor<V> {
  /** @hidden */
  declare readonly cursor: Cursor<[K, V]>;

  constructor(cursor: Cursor<[K, V]>) {
    super();
    Object.defineProperty(this, "cursor", {
      value: cursor,
      enumerable: true,
    });
  }

  isEmpty(): boolean {
    return this.cursor.isEmpty();
  }

  head(): V {
    return this.cursor.head()[1];
  }

  step(): void {
    this.cursor.step();
  }

  skip(count: number): void {
    this.cursor.skip(count);
  }

  hasNext(): boolean {
    return this.cursor.hasNext();
  }

  nextIndex(): number {
    return this.cursor.nextIndex();
  }

  next(): {value?: V, done: boolean} {
    const {value, done} = this.cursor.next();
    return {value: value && value[1], done};
  }

  hasPrevious(): boolean {
    return this.cursor.hasPrevious();
  }

  previousIndex(): number {
    return this.cursor.previousIndex();
  }

  previous(): {value?: V, done: boolean} {
    const {value, done} = this.cursor.previous();
    return {value: value && value[1], done};
  }

  delete(): void {
    this.cursor.delete();
  }
}
