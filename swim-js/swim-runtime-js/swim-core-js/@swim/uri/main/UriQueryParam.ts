// Copyright 2015-2021 Swim Inc.
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

import type {Mutable} from "@swim/util";
import {Output, Format} from "@swim/codec";
import {UriQuery} from "./UriQuery";

/** @hidden */
export class UriQueryParam extends UriQuery {
  constructor(key: string | undefined, value: string, tail: UriQuery) {
    super();
    this.key = key;
    this.value = value;
    this.rest = tail;
    this.stringValue = void 0;
  }

  override readonly key: string | undefined;

  override readonly value: string;

  /** @hidden */
  readonly rest: UriQuery;

  override isDefined(): boolean {
    return true;
  }

  override isEmpty(): boolean {
    return false;
  }

  override head(): [string | undefined, string] {
    return [this.key, this.value];
  }

  override tail(): UriQuery {
    return this.rest;
  }

  /** @hidden */
  override setTail(tail: UriQuery): void {
    (this as Mutable<this>).rest = tail;
  }

  /** @hidden */
  override dealias(): UriQuery {
    return new UriQueryParam(this.key, this.value, this.rest);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriQuery").write(46/*'.'*/).write("parse").write(40/*'('*/)
                   .write(34/*'"'*/).display(this).write(34/*'"'*/).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    const stringValue = this.stringValue;
    if (stringValue !== void 0) {
      output = output.write(stringValue);
    } else {
      output = super.display(output);
    }
    return output;
  }

  /** @hidden */
  readonly stringValue: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = Format.display(this);
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }
}
