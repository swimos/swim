// Copyright 2015-2020 SWIM.AI inc.
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
export class ValueCursor<V> extends Cursor<V> {
  private readonly _cursor: Cursor<Value>;
  private readonly _form: Form<V, unknown>;

  constructor(cursor: Cursor<Value>, form: Form<V, unknown>) {
    super();
    this._cursor = cursor;
    this._form = form;
  }

  isEmpty(): boolean {
    return this._cursor.isEmpty();
  }

  head(): V {
    const value = this._cursor.head();
    return value.coerce(this._form);
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

  next(): {value?: V, done: boolean} {
    const {value, done} = this._cursor.next();
    return {value: value && value.coerce(this._form), done};
  }

  hasPrevious(): boolean {
    return this._cursor.hasPrevious();
  }

  previousIndex(): number {
    return this._cursor.previousIndex();
  }

  previous(): {value?: V, done: boolean} {
    const {value, done} = this._cursor.next();
    return {value: value && value.coerce(this._form), done};
  }

  delete(): void {
    this._cursor.delete();
  }
}
