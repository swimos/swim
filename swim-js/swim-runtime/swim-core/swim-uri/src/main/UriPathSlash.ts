// Copyright 2015-2021 Swim.inc
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
import {UriPath} from "./UriPath";

/** @internal */
export class UriPathSlash extends UriPath {
  /** @internal */
  constructor(tail: UriPath) {
    super();
    this.rest = tail;
    this.stringValue = void 0;
  }

  /** @internal */
  readonly rest: UriPath;

  override isDefined(): boolean {
    return true;
  }

  override isAbsolute(): boolean {
    return true;
  }

  override isRelative(): boolean {
    return false;
  }

  override isEmpty(): boolean {
    return false;
  }

  override head(): string {
    return "/";
  }

  override tail(): UriPath {
    return this.rest;
  }

  /** @internal */
  override setTail(tail: UriPath): void {
    (this as Mutable<this>).rest = tail;
  }

  /** @internal */
  override dealias(): UriPath {
    return new UriPathSlash(this.rest);
  }

  override parent(): UriPath {
    const tail = this.rest;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      const rest = tail.tail();
      if (rest.isEmpty()) {
        return UriPath.slash();
      } else {
        return new UriPathSlash(tail.parent());
      }
    }
  }

  override base(): UriPath {
    const tail = this.rest;
    if (tail.isEmpty()) {
      return this;
    } else {
      return new UriPathSlash(tail.base());
    }
  }

  override prependedSegment(segment: string): UriPath {
    return UriPath.segment(segment, this);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriPath").write(46/*'.'*/).write("parse").write(40/*'('*/)
                   .write(34/*'"'*/) .display(this).write(34/*'"'*/).write(41/*')'*/);
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

  /** @internal */
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