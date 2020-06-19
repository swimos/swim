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

import {Output} from "@swim/codec";
import {Uri} from "./Uri";
import {AnyUriQuery, UriQuery} from "./UriQuery";

/** @hidden */
export class UriQueryUndefined extends UriQuery {
  isDefined(): boolean {
    return false;
  }

  isEmpty(): boolean {
    return true;
  }

  head(): [string | null, string] {
    throw new Error("Undefined Query");
  }

  key(): string | null {
    throw new Error("Undefined Query");
  }

  value(): string {
    throw new Error("Undefined Query");
  }

  tail(): UriQuery {
    throw new Error("Undefined Query");
  }

  /** @hidden */
  setTail(tail: UriQuery): void {
    throw new Error("Undefined Query");
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

  appended(key: string | null, value: string): UriQuery;
  appended(params: AnyUriQuery): UriQuery;
  appended(key: AnyUriQuery | null, value?: string): UriQuery {
    return UriQuery.from(key as any, value as any);
  }

  prepended(key: string | null, value: string): UriQuery;
  prepended(params: AnyUriQuery): UriQuery;
  prepended(key: AnyUriQuery | null, value?: string): UriQuery {
    return UriQuery.from(key as any, value as any);
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
Uri.QueryUndefined = UriQueryUndefined;
