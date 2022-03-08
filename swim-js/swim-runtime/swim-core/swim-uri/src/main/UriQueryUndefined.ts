// Copyright 2015-2022 Swim.inc
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

/** @internal */
export class UriQueryUndefined extends UriQuery {
  override isDefined(): boolean {
    return false;
  }

  override isEmpty(): boolean {
    return true;
  }

  override head(): [string | undefined, string] {
    throw new Error("undefined query");
  }

  override get key(): string | undefined {
    throw new Error("undefined query");
  }

  override get value(): string {
    throw new Error("undefined query");
  }

  override tail(): UriQuery {
    throw new Error("undefined query");
  }

  /** @internal */
  override setTail(tail: UriQuery): void {
    throw new Error("undefined query");
  }

  /** @internal */
  override dealias(): UriQuery {
    return this;
  }

  override updated(key: string, value: string): UriQuery {
    return UriQuery.param(key, value, this);
  }

  override removed(key: string): UriQuery {
    return this;
  }

  override appended(key: string | undefined, value: string): UriQuery;
  override appended(params: AnyUriQuery): UriQuery;
  override appended(key: AnyUriQuery | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.add(key as any, value as any);
    return builder.bind();
  }

  override prepended(key: string | undefined, value: string): UriQuery;
  override prepended(params: AnyUriQuery): UriQuery;
  override prepended(key: AnyUriQuery | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.add(key as any, value as any);
    return builder.bind();
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriQuery").write(46/*'.'*/).write("undefined")
                   .write(40/*'('*/).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    return output; // blank
  }

  override toString(): string {
    return "";
  }
}
