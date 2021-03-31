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

import type {Output} from "@swim/codec";
import {AnyUriQuery, UriQuery} from "./UriQuery";
import {UriQueryBuilder} from "./"; // forward import

/** @hidden */
export class UriQueryUndefined extends UriQuery {
  isDefined(): boolean {
    return false;
  }

  isEmpty(): boolean {
    return true;
  }

  head(): [string | undefined, string] {
    throw new Error("undefined query");
  }

  get key(): string | undefined {
    throw new Error("undefined query");
  }

  get value(): string {
    throw new Error("undefined query");
  }

  tail(): UriQuery {
    throw new Error("undefined query");
  }

  /** @hidden */
  setTail(tail: UriQuery): void {
    throw new Error("undefined query");
  }

  /** @hidden */
  dealias(): UriQuery {
    return this;
  }

  updated(key: string, value: string): UriQuery {
    return UriQuery.param(key, value, this);
  }

  removed(key: string): UriQuery {
    return this;
  }

  appended(key: string | undefined, value: string): UriQuery;
  appended(params: AnyUriQuery): UriQuery;
  appended(key: AnyUriQuery | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.add(key as any, value as any);
    return builder.bind();
  }

  prepended(key: string | undefined, value: string): UriQuery;
  prepended(params: AnyUriQuery): UriQuery;
  prepended(key: AnyUriQuery | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.add(key as any, value as any);
    return builder.bind();
  }

  debug(output: Output): void {
    output = output.write("UriQuery").write(46/*'.'*/).write("undefined")
        .write(40/*'('*/).write(41/*')'*/);
  }

  display(output: Output): void {
    // nop
  }

  toString(): string {
    return "";
  }
}
