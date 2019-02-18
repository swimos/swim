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

import {Builder} from "@swim/util";
import {Item} from "./Item";
import {Field} from "./Field";
import {Value} from "./Value";
import {Record} from "./Record";

/** @hidden */
export class ValueBuilder implements Builder<Item, Value> {
  _record: Record | null;
  _value: Value | null;

  constructor() {
    this._record = null;
    this._value = null;
  }

  push(...items: Item[]): void {
    for (let i = 0, n = arguments.length; i < n; i += 1) {
      const item = arguments[i] as Item;
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
    if (this._record === null) {
      this._record = Item.Record.create();
      if (this._value !== null) {
        this._record.push(this._value);
        this._value = null;
      }
    }
    this._record.push(item);
  }

  /** @hidden */
  pushValue(item: Value): void {
    if (this._record != null) {
      this._record.push(item);
    } else if (this._value == null) {
      this._value = item;
    } else {
      this._record = Item.Record.create();
      this._record.push(this._value);
      this._value = null;
      this._record.push(item);
    }
  }

  bind(): Value {
    if (this._record !== null) {
      return this._record;
    } else if (this._value !== null) {
      return this._value;
    } else {
      return Value.absent();
    }
  }
}
