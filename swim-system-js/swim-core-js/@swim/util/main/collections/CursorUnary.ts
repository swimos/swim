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

import {Cursor} from "./Cursor";

/** @hidden */
export class CursorUnary<T> extends Cursor<T> {
  private declare readonly value: T;
  private declare index: number;

  constructor(value: T) {
    super();
    Object.defineProperty(this, "value", {
      value: value,
    });
    Object.defineProperty(this, "index", {
      value: 0,
      configurable: true,
    });
  }

  isEmpty(): boolean {
    return this.index !== 0;
  }

  head(): T {
    if (this.index === 0) {
      return this.value;
    } else {
      throw new Error("empty");
    }
  }

  step(): void {
    if (this.index === 0) {
      Object.defineProperty(this, "index", {
        value: 1,
        configurable: true,
      });
    } else {
      throw new Error("empty");
    }
  }

  skip(count: number): void {
    this.index = Math.min(Math.max(0, this.index + count), 1);
  }

  hasNext(): boolean {
    return this.index === 0;
  }

  nextIndex(): number {
    return this.index;
  }

  next(): {value?: T, done: boolean} {
    if (this.index === 0) {
      Object.defineProperty(this, "index", {
        value: 1,
        configurable: true,
      });
      return {value: this.value, done: true};
    } else {
      return {done: true};
    }
  }

  hasPrevious(): boolean {
    return this.index === 1;
  }

  previousIndex(): number {
    return this.index - 1;
  }

  previous(): {value?: T, done: boolean} {
    if (this.index === 1) {
      Object.defineProperty(this, "index", {
        value: 0,
        configurable: true,
      });
      return {value: this.value, done: true};
    } else {
      return {done: true};
    }
  }
}
