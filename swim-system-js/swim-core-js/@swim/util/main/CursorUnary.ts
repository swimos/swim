// Copyright 2015-2020 SWIM.AI inc.
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
export class CursorUnary<T> extends Cursor<T> {
  private readonly _value: T;
  private _index: number;

  constructor(value: T) {
    super();
    this._value = value;
    this._index = 0;
  }

  isEmpty(): boolean {
    return this._index !== 0;
  }

  head(): T {
    if (this._index === 0) {
      return this._value;
    } else {
      throw new Error("empty");
    }
  }

  step(): void {
    if (this._index === 0) {
      this._index = 1;
    } else {
      throw new Error("empty");
    }
  }

  skip(count: number): void {
    this._index = Math.min(Math.max(0, this._index + count), 1);
  }

  hasNext(): boolean {
    return this._index === 0;
  }

  nextIndex(): number {
    return this._index;
  }

  next(): {value?: T, done: boolean} {
    if (this._index === 0) {
      this._index = 1;
      return {value: this._value, done: true};
    } else {
      return {done: true};
    }
  }

  hasPrevious(): boolean {
    return this._index === 1;
  }

  previousIndex(): number {
    return this._index - 1;
  }

  previous(): {value?: T, done: boolean} {
    if (this._index === 1) {
      this._index = 0;
      return {value: this._value, done: true};
    } else {
      return {done: true};
    }
  }
}
Cursor.Unary = CursorUnary;
