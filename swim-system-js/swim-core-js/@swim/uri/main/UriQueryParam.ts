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

import {Output, Format} from "@swim/codec";
import {UriQuery} from "./UriQuery";

/** @hidden */
export class UriQueryParam extends UriQuery {
  constructor(key: string | undefined, value: string, tail: UriQuery) {
    super();
    Object.defineProperty(this, "key", {
      value: key,
      enumerable: true,
    });
    Object.defineProperty(this, "value", {
      value: value,
      enumerable: true,
    });
    Object.defineProperty(this, "rest", {
      value: tail,
      enumerable: true,
      configurable: true,
    });
    Object.defineProperty(this, "stringValue", {
      value: void 0,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly key!: string | undefined;

  override readonly value!: string;

  /** @hidden */
  readonly rest!: UriQuery;

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
    Object.defineProperty(this, "rest", {
      value: tail,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  override dealias(): UriQuery {
    return new UriQueryParam(this.key, this.value, this.rest);
  }

  override debug(output: Output): void {
    output = output.write("UriQuery").write(46/*'.'*/).write("parse")
        .write(40/*'('*/).write(34/*'"'*/).display(this).write(34/*'"'*/).write(41/*')'*/);
  }

  override display(output: Output): void {
    const stringValue = this.stringValue;
    if (stringValue !== void 0) {
      output = output.write(stringValue);
    } else {
      super.display(output);
    }
  }

  /** @hidden */
  readonly stringValue!: string | undefined;

  override toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = Format.display(this);
      Object.defineProperty(this, "stringValue", {
        value: stringValue,
        enumerable: true,
        configurable: true,
      });
    }
    return stringValue;
  }
}
