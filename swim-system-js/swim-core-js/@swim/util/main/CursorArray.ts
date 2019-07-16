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

import {Cursor} from "./Cursor";

/** @hidden */
export class CursorArray<T> extends Cursor<T> {
  private readonly _array: ReadonlyArray<T>;
  private _index: number;
  private _limit: number;

  constructor(array: ReadonlyArray<T>, index: number, limit: number) {
    super();
    this._array = array;
    this._index = index;
    this._limit = limit;
  }

  isEmpty(): boolean {
    return this._index >= this._limit;
  }

  head(): T {
    if (this._index < this._limit) {
      return this._array[this._index];
    } else {
      throw new Error("empty");
    }
  }

  step(): void {
    if (this._index < this._limit) {
      this._index = 1;
    } else {
      throw new Error("empty");
    }
  }

  skip(count: number): void {
    this._index = Math.min(this._index + count, this._limit);
  }

  hasNext(): boolean {
    return this._index < this._limit;
  }

  nextIndex(): number {
    return this._index;
  }

  next(): {value?: T, done: boolean} {
    const index = this._index;
    if (index < this._limit) {
      this._index = index + 1;
      return {value: this._array[index], done: this._index === this._limit};
    } else {
      this._index = this._limit;
      return {done: true};
    }
  }

  hasPrevious(): boolean {
    return this._index > 0;
  }

  previousIndex(): number {
    return this._index - 1;
  }

  previous(): {value?: T, done: boolean} {
    const index = this._index - 1;
    if (index >= 0) {
      this._index = index;
      return {value: this._array[index], done: index === 0};
    } else {
      this._index = 0;
      return {done: true};
    }
  }
}
Cursor.Array = CursorArray;
