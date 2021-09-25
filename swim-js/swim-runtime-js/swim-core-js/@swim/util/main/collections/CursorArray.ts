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

import {Cursor} from "./Cursor";

/** @hidden */
export class CursorArray<T> extends Cursor<T> {
  constructor(array: ReadonlyArray<T>, index: number, limit: number) {
    super();
    this.array = array;
    this.index = index;
    this.limit = limit;
  }

  /** @hidden */
  readonly array: ReadonlyArray<T>;

  /** @hidden */
  index: number;

  /** @hidden */
  readonly limit: number;

  override isEmpty(): boolean {
    return this.index >= this.limit;
  }

  override head(): T {
    if (this.index < this.limit) {
      return this.array[this.index]!;
    } else {
      throw new Error("empty");
    }
  }

  override step(): void {
    const index = this.index;
    if (index < this.limit) {
      this.index += 1;
    } else {
      throw new Error("empty");
    }
  }

  override skip(count: number): void {
    this.index = Math.min(this.index + count, this.limit);
  }

  override hasNext(): boolean {
    return this.index < this.limit;
  }

  override nextIndex(): number {
    return this.index;
  }

  override next(): {value?: T, done: boolean} {
    const index = this.index;
    if (index < this.limit) {
      this.index += 1;
      return {value: this.array[index]!, done: this.index === this.limit};
    } else {
      this.index = this.limit;
      return {done: true};
    }
  }

  override hasPrevious(): boolean {
    return this.index > 0;
  }

  override previousIndex(): number {
    return this.index - 1;
  }

  override previous(): {value?: T, done: boolean} {
    const index = this.index - 1;
    if (index >= 0) {
      this.index = index;
      return {value: this.array[index]!, done: index === 0};
    } else {
      this.index = 0;
      return {done: true};
    }
  }
}
