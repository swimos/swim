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
import {Value} from "../Value";
import {Form} from "../Form";

/** @hidden */
export class ValueEntryCursor<K, V> extends Cursor<[K, V]> {
  private readonly _cursor: Cursor<[Value, Value]>;
  private readonly _keyForm: Form<K, unknown>;
  private readonly _valueForm: Form<V, unknown>;

  constructor(cursor: Cursor<[Value, Value]>, keyForm: Form<K, unknown>, valueForm: Form<V, unknown>) {
    super();
    this._cursor = cursor;
    this._keyForm = keyForm;
    this._valueForm = valueForm;
  }

  isEmpty(): boolean {
    return this._cursor.isEmpty();
  }

  head(): [K, V] {
    const pair = this._cursor.head();
    return [pair[0].coerce(this._keyForm), pair[1].coerce(this._valueForm)];
  }

  step(): void {
    this._cursor.step();
  }

  skip(count: number): void {
    this._cursor.skip(count);
  }

  hasNext(): boolean {
    return this._cursor.hasNext();
  }

  nextIndex(): number {
    return this._cursor.nextIndex();
  }

  next(): {value?: [K, V], done: boolean} {
    const {value, done} = this._cursor.next();
    return {value: value && [value[0].coerce(this._keyForm), value[1].coerce(this._valueForm)], done};
  }

  hasPrevious(): boolean {
    return this._cursor.hasPrevious();
  }

  previousIndex(): number {
    return this._cursor.previousIndex();
  }

  previous(): {value?: [K, V], done: boolean} {
    const {value, done} = this._cursor.next();
    return {value: value && [value[0].coerce(this._keyForm), value[1].coerce(this._valueForm)], done};
  }

  delete(): void {
    this._cursor.delete();
  }
}
