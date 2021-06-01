// Copyright 2015-2021 Swim inc.
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

import type {Builder} from "@swim/util";
import type {Item} from "./Item";
import {Field} from "./Field";
import {Value} from "./Value";
import {Record} from "./Record";

/** @hidden */
export class ValueBuilder implements Builder<Item, Value> {
  /** @hidden */
  record: Record | null;
  /** @hidden */
  value: Value | null;

  constructor() {
    this.record = null;
    this.value = null;
  }

  push(...items: Item[]): void {
    for (let i = 0, n = items.length; i < n; i += 1) {
      const item = items[i]!;
      if (item instanceof Field) {
        return this.pushField(item);
      } else if (item instanceof Value) {
        return this.pushValue(item);
      } else {
        throw new TypeError("" + item);
      }
    }
  }

  /** @hidden */
  pushField(item: Field): void {
    if (this.record === null) {
      this.record = Record.create();
      if (this.value !== null) {
        this.record.push(this.value);
        this.value = null;
      }
    }
    this.record.push(item);
  }

  /** @hidden */
  pushValue(item: Value): void {
    if (this.record !== null) {
      this.record.push(item);
    } else if (this.value === null) {
      this.value = item;
    } else {
      this.record = Record.create();
      this.record.push(this.value);
      this.value = null;
      this.record.push(item);
    }
  }

  bind(): Value {
    if (this.record !== null) {
      return this.record;
    } else if (this.value !== null) {
      return this.value;
    } else {
      return Value.absent();
    }
  }
}
