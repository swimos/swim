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
import type {Value} from "../Value";
import type {Form} from "../form/Form";

/** @hidden */
export class ValueEntryCursor<K, V> extends Cursor<[K, V]> {
  /** @hidden */
  declare readonly cursor: Cursor<[Value, Value]>;
  /** @hidden */
  declare readonly keyForm: Form<K, unknown>;
  /** @hidden */
  declare readonly valueForm: Form<V, unknown>;

  constructor(cursor: Cursor<[Value, Value]>, keyForm: Form<K, unknown>, valueForm: Form<V, unknown>) {
    super();
    Object.defineProperty(this, "cursor", {
      value: cursor,
      enumerable: true,
    });
    Object.defineProperty(this, "keyForm", {
      value: keyForm,
      enumerable: true,
    });
    Object.defineProperty(this, "valueForm", {
      value: valueForm,
      enumerable: true,
    });
  }

  isEmpty(): boolean {
    return this.cursor.isEmpty();
  }

  head(): [K, V] {
    const pair = this.cursor.head();
    return [pair[0].coerce(this.keyForm), pair[1].coerce(this.valueForm)];
  }

  step(): void {
    this.cursor.step();
  }

  skip(count: number): void {
    this.cursor.skip(count);
  }

  hasNext(): boolean {
    return this.cursor.hasNext();
  }

  nextIndex(): number {
    return this.cursor.nextIndex();
  }

  next(): {value?: [K, V], done: boolean} {
    const {value, done} = this.cursor.next();
    if (value !== void 0) {
      return {value: [value[0].coerce(this.keyForm), value[1].coerce(this.valueForm)], done};
    } else {
      return {done};
    }
  }

  hasPrevious(): boolean {
    return this.cursor.hasPrevious();
  }

  previousIndex(): number {
    return this.cursor.previousIndex();
  }

  previous(): {value?: [K, V], done: boolean} {
    const {value, done} = this.cursor.previous();
    if (value !== void 0) {
      return {value: [value[0].coerce(this.keyForm), value[1].coerce(this.valueForm)], done};
    } else {
      return {done};
    }
  }

  delete(): void {
    this.cursor.delete();
  }
}
