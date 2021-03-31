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
export class ValueCursor<V> extends Cursor<V> {
  /** @hidden */
  declare readonly cursor: Cursor<Value>;
  /** @hidden */
  declare readonly form: Form<V, unknown>;

  constructor(cursor: Cursor<Value>, form: Form<V, unknown>) {
    super();
    Object.defineProperty(this, "cursor", {
      value: cursor,
      enumerable: true,
    });
    Object.defineProperty(this, "form", {
      value: form,
      enumerable: true,
    });
  }

  isEmpty(): boolean {
    return this.cursor.isEmpty();
  }

  head(): V {
    const value = this.cursor.head();
    return value.coerce(this.form);
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

  next(): {value?: V, done: boolean} {
    const {value, done} = this.cursor.next();
    if (value !== void 0) {
      return {value: value.coerce(this.form), done};
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

  previous(): {value?: V, done: boolean} {
    const {value, done} = this.cursor.previous();
    if (value !== void 0) {
      return {value: value.coerce(this.form), done};
    } else {
      return {done};
    }
  }

  delete(): void {
    this.cursor.delete();
  }
}
