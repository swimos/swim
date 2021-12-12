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

import {Cursor} from "./Cursor";

/** @internal */
export class CursorUnary<T> extends Cursor<T> {
  constructor(value: T) {
    super();
    this.value = value;
    this.index = 0;
  }

  /** @internal */
  readonly value: T;

  /** @internal */
  index: number;

  override isEmpty(): boolean {
    return this.index !== 0;
  }

  override head(): T {
    if (this.index === 0) {
      return this.value;
    } else {
      throw new Error("empty");
    }
  }

  override step(): void {
    if (this.index === 0) {
      this.index = 1;
    } else {
      throw new Error("empty");
    }
  }

  override skip(count: number): void {
    this.index = Math.min(Math.max(0, this.index + count), 1);
  }

  override hasNext(): boolean {
    return this.index === 0;
  }

  override nextIndex(): number {
    return this.index;
  }

  override next(): {value?: T, done: boolean} {
    if (this.index === 0) {
      this.index = 1;
      return {value: this.value, done: true};
    } else {
      return {done: true};
    }
  }

  override hasPrevious(): boolean {
    return this.index === 1;
  }

  override previousIndex(): number {
    return this.index - 1;
  }

  override previous(): {value?: T, done: boolean} {
    if (this.index === 1) {
      this.index = 0;
      return {value: this.value, done: true};
    } else {
      return {done: true};
    }
  }
}
