// Copyright 2015-2023 Swim.inc
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

/** @internal */
export class ValuesCursor<K, V> extends Cursor<V> {
  constructor(cursor: Cursor<[K, V]>) {
    super();
    this.cursor = cursor;
  }

  /** @internal */
  readonly cursor: Cursor<[K, V]>;

  override isEmpty(): boolean {
    return this.cursor.isEmpty();
  }

  override head(): V {
    return this.cursor.head()[1];
  }

  override step(): void {
    this.cursor.step();
  }

  override skip(count: number): void {
    this.cursor.skip(count);
  }

  override hasNext(): boolean {
    return this.cursor.hasNext();
  }

  override nextIndex(): number {
    return this.cursor.nextIndex();
  }

  override next(): {value?: V, done: boolean} {
    const {value, done} = this.cursor.next();
    return {value: value && value[1], done};
  }

  override hasPrevious(): boolean {
    return this.cursor.hasPrevious();
  }

  override previousIndex(): number {
    return this.cursor.previousIndex();
  }

  override previous(): {value?: V, done: boolean} {
    const {value, done} = this.cursor.previous();
    return {value: value && value[1], done};
  }

  override delete(): void {
    this.cursor.delete();
  }
}
