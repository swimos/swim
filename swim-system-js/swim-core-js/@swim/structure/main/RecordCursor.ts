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
import type {Item} from "./Item";
import type {Record} from "./Record";

/** @hidden */
export class RecordCursor extends Cursor<Item> {
  /** @hidden */
  declare readonly record: Record;
  /** @hidden */
  declare readonly lower: number;
  /** @hidden */
  declare readonly upper: number;
  /** @hidden */
  declare readonly index: number;
  /** @hidden */
  declare readonly direction: number;

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
    Object.defineProperty(this, "record", {
      value: record,
      enumerable: true,
    });
    Object.defineProperty(this, "lower", {
      value: lower,
      enumerable: true,
    });
    Object.defineProperty(this, "upper", {
      value: upper,
      enumerable: true,
    });
    Object.defineProperty(this, "index", {
      value: index,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "direction", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
  }

  isEmpty(): boolean {
    return this.index >= this.upper;
  }

  head(): Item {
    Object.defineProperty(this, "direction", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    if (this.index < this.upper) {
      return this.record.getItem(this.index);
    } else {
      throw new Error("empty");
    }
  }

  step(): void {
    Object.defineProperty(this, "direction", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
    if (this.index < this.upper) {
      Object.defineProperty(this, "index", {
        value: this.index + 1,
        enumerable: true,
        configurable: true,
      });
    } else {
      throw new Error("empty");
    }
  }

  skip(count: number): void {
    Object.defineProperty(this, "index", {
      value: Math.min(Math.max(this.lower, this.index + count, this.upper)),
      enumerable: true,
      configurable: true,
    });
  }

  hasNext(): boolean {
    return this.index < this.upper;
  }

  nextIndex(): number {
    return this.index - this.lower;
  }

  next(): {value?: Item, done: boolean} {
    Object.defineProperty(this, "direction", {
      value: 1,
      enumerable: true,
      configurable: true,
    });
    const index = this.index;
    if (index < this.upper) {
      Object.defineProperty(this, "index", {
        value: index + 1,
        enumerable: true,
        configurable: true,
      });
      return {value: this.record.getItem(index), done: this.index === this.upper};
    } else {
      Object.defineProperty(this, "index", {
        value: this.upper,
        enumerable: true,
        configurable: true,
      });
      return {done: true};
    }
  }

  hasPrevious(): boolean {
    return this.index > this.lower;
  }

  previousIndex(): number {
    return this.index - this.lower - 1;
  }

  previous(): {value?: Item, done: boolean} {
    Object.defineProperty(this, "direction", {
      value: -1,
      enumerable: true,
      configurable: true,
    });
    const index = this.index - 1;
    if (index >= this.lower) {
      Object.defineProperty(this, "index", {
        value: index,
        enumerable: true,
        configurable: true,
      });
      return {value: this.record.getItem(index), done: index === this.lower};
    } else {
      Object.defineProperty(this, "index", {
        value: 0,
        enumerable: true,
        configurable: true,
      });
      return {done: true};
    }
  }

  set(newItem: Item): void {
    if (this.direction > 0) {
      this.record.setItem(this.index - 1, newItem);
    } else {
      this.record.setItem(this.index, newItem);
    }
  }

  delete(): void {
    if (this.direction > 0) {
      Object.defineProperty(this, "index", {
        value: this.index - 1,
        enumerable: true,
        configurable: true,
      });
    }
    this.record.splice(this.index, 1);
    Object.defineProperty(this, "direction", {
      value: 0,
      enumerable: true,
      configurable: true,
    });
  }
}
