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

import {Output, Format} from "@swim/codec";
import {Uri} from "./Uri";
import {UriQuery} from "./UriQuery";

/** @hidden */
export class UriQueryParam extends UriQuery {
  /** @hidden */
  readonly _key: string | null;
  /** @hidden */
  _value: string;
  /** @hidden */
  _tail: UriQuery;
  /** @hidden */
  _string?: string;

  constructor(key: string | null, value: string, tail: UriQuery) {
    super();
    this._key = key;
    this._value = value;
    this._tail = tail;
  }

  isDefined(): boolean {
    return true;
  }

  isEmpty(): boolean {
    return false;
  }

  head(): [string | null, string] {
    return [this._key, this._value];
  }

  key(): string | null {
    return this._key;
  }

  value(): string {
    return this._value;
  }

  tail(): UriQuery {
    return this._tail;
  }

  /** @hidden */
  setTail(tail: UriQuery): void {
    this._tail = tail;
  }

  /** @hidden */
  dealias(): UriQuery {
    return new UriQueryParam(this._key, this._value, this._tail);
  }

  debug(output: Output): void {
    output = output.write("UriQuery").write(46/*'.'*/).write("parse")
        .write(40/*'('*/).write(34/*'"'*/) .display(this).write(34/*'"'*/).write(41/*')'*/);
  }

  display(output: Output): void {
    if (this._string !== void 0) {
      output = output.write(this._string);
    } else {
      super.display(output);
    }
  }

  toString(): string {
    if (this._string === void 0) {
      this._string = Format.display(this);
    }
    return this._string;
  }
}
Uri.QueryParam = UriQueryParam;
