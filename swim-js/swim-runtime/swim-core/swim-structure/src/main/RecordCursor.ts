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

import {Mutable, Cursor} from "@swim/util";
import type {Item} from "./Item";
import type {Record} from "./Record";

/** @internal */
export class RecordCursor extends Cursor<Item> {
  constructor(record: Record, lower?: number, upper?: number, index?: number) {
    super();
    if (lower === void 0) {
      lower = 0;
    }
    if (upper === void 0) {
      upper = record.length;
    }
    if (index === void 0) {
      index = lower;
    }
    this.record = record;
    this.lower = lower;
    this.upper = upper;
    this.index = index;
    this.direction = 0;
  }

  /** @internal */
  readonly record: Record;

  /** @internal */
  readonly lower: number;

  /** @internal */
  readonly upper: number;

  /** @internal */
  readonly index: number;

  /** @internal */
  readonly direction: number;

  override isEmpty(): boolean {
    return this.index >= this.upper;
  }

  override head(): Item {
    (this as Mutable<this>).direction = 0;
    if (this.index < this.upper) {
      return this.record.getItem(this.index);
    } else {
      throw new Error("empty");
    }
  }

  override step(): void {
    (this as Mutable<this>).direction = 0;
    const index = this.index;
    if (index < this.upper) {
      (this as Mutable<this>).index = index + 1;
    } else {
      throw new Error("empty");
    }
  }

  override skip(count: number): void {
    (this as Mutable<this>).index = Math.min(Math.max(this.lower, this.index + count, this.upper));
  }

  override hasNext(): boolean {
    return this.index < this.upper;
  }

  override nextIndex(): number {
    return this.index - this.lower;
  }

  override next(): {value?: Item, done: boolean} {
    (this as Mutable<this>).direction = 1;
    const index = this.index;
    if (index < this.upper) {
      (this as Mutable<this>).index = index + 1;
      return {value: this.record.getItem(index), done: this.index === this.upper};
    } else {
      (this as Mutable<this>).index = this.upper;
      return {done: true};
    }
  }

  override hasPrevious(): boolean {
    return this.index > this.lower;
  }

  override previousIndex(): number {
    return this.index - this.lower - 1;
  }

  override previous(): {value?: Item, done: boolean} {
    (this as Mutable<this>).direction = -1;
    const index = this.index - 1;
    if (index >= this.lower) {
      (this as Mutable<this>).index = index;
      return {value: this.record.getItem(index), done: index === this.lower};
    } else {
      (this as Mutable<this>).index = 0;
      return {done: true};
    }
  }

  override set(newItem: Item): void {
    if (this.direction > 0) {
      this.record.setItem(this.index - 1, newItem);
    } else {
      this.record.setItem(this.index, newItem);
    }
  }

  override delete(): void {
    let index = this.index;
    if (this.direction > 0) {
      index -= 1;
      (this as Mutable<this>).index = index;
    }
    this.record.splice(index, 1);
    (this as Mutable<this>).direction = 0;
  }
}
