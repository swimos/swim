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
import {Item} from "./Item";
import {Record} from "./Record";

/** @hidden */
export class RecordCursor extends Cursor<Item> {
  /** @hidden */
  readonly _record: Record;
  /** @hidden */
  readonly _lower: number;
  /** @hidden */
  readonly _upper: number;
  /** @hidden */
  _index: number;
  /** @hidden */
  _direction: number;

  constructor(record: Record, lower: number = 0, upper: number = record.length, index: number = lower) {
    super();
    this._record = record;
    this._lower = lower;
    this._upper = upper;
    this._index = index;
    this._direction = 0;
  }

  isEmpty(): boolean {
    return this._index >= this._upper;
  }

  head(): Item {
    this._direction = 0;
    if (this._index < this._upper) {
      return this._record.getItem(this._index);
    } else {
      throw new Error("empty");
    }
  }

  step(): void {
    this._direction = 0;
    if (this._index < this._upper) {
      this._index += 1;
    } else {
      throw new Error("empty");
    }
  }

  skip(count: number): void {
    this._index = Math.min(Math.max(this._lower, this._index + count, this._upper));
  }

  hasNext(): boolean {
    return this._index < this._upper;
  }

  nextIndex(): number {
    return this._index - this._lower;
  }

  next(): {value?: Item, done: boolean} {
    this._direction = 1;
    const index = this._index;
    if (index < this._upper) {
      this._index = index + 1;
      return {value: this._record.getItem(index), done: this._index === this._upper};
    } else {
      this._index = this._upper;
      return {done: true};
    }
  }

  hasPrevious(): boolean {
    return this._index > this._lower;
  }

  previousIndex(): number {
    return this._index - this._lower - 1;
  }

  previous(): {value?: Item, done: boolean} {
    this._direction = -1;
    const index = this._index - 1;
    if (index >= this._lower) {
      this._index = index;
      return {value: this._record.getItem(index), done: index === this._lower};
    } else {
      this._index = 0;
      return {done: true};
    }
  }

  set(newItem: Item): void {
    if (this._direction > 0) {
      this._record.setItem(this._index - 1, newItem);
    } else {
      this._record.setItem(this._index, newItem);
    }
  }

  delete(): void {
    if (this._direction > 0) {
      this._index -= 1;
    }
    this._record.splice(this._index, 1);
    this._direction = 0;
  }
}
