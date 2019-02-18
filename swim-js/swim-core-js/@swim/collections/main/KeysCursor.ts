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

import {Cursor} from "@swim/util";

/** @hidden */
export class KeysCursor<K, V> extends Cursor<K> {
  private readonly _cursor: Cursor<[K, V]>;

  constructor(cursor: Cursor<[K, V]>) {
    super();
    this._cursor = cursor;
  }

  isEmpty(): boolean {
    return this._cursor.isEmpty();
  }

  head(): K {
    return this._cursor.head()[0];
  }

  step(): void {
    this._cursor.step();
  }

  skip(count: number): void {
    this._cursor.skip(count);
  }

  hasNext(): boolean {
    return this._cursor.hasNext();
  }

  nextIndex(): number {
    return this._cursor.nextIndex();
  }

  next(): {value?: K, done: boolean} {
    const {value, done} = this._cursor.next();
    return {value: value && value[0], done};
  }

  hasPrevious(): boolean {
    return this._cursor.hasPrevious();
  }

  previousIndex(): number {
    return this._cursor.previousIndex();
  }

  previous(): {value?: K, done: boolean} {
    const {value, done} = this._cursor.previous();
    return {value: value && value[0], done};
  }

  delete(): void {
    this._cursor.delete();
  }
}
