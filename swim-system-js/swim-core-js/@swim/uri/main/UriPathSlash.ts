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
import {UriPath} from "./UriPath";

/** @hidden */
export class UriPathSlash extends UriPath {
  /** @hidden */
  _tail: UriPath;
  /** @hidden */
  _string?: string;

  /** @hidden */
  constructor(tail: UriPath) {
    super();
    this._tail = tail;
  }

  isDefined(): boolean {
    return true;
  }

  isAbsolute(): boolean {
    return true;
  }

  isRelative(): boolean {
    return false;
  }

  isEmpty(): boolean {
    return false;
  }

  head(): string {
    return "/";
  }

  tail(): UriPath {
    return this._tail;
  }

  /** @hidden */
  setTail(tail: UriPath): void {
    this._tail = tail;
  }

  /** @hidden */
  dealias(): UriPath {
    return new UriPathSlash(this._tail);
  }

  parent(): UriPath {
    const tail = this._tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      const next = tail.tail();
      if (next.isEmpty()) {
        return UriPath.slash();
      } else {
        return new UriPathSlash(tail.parent());
      }
    }
  }

  base(): UriPath {
    const tail = this._tail;
    if (tail.isEmpty()) {
      return this;
    } else {
      return new UriPathSlash(tail.base());
    }
  }

  prependedSegment(segment: string): UriPath {
    return UriPath.segment(segment, this);
  }

  debug(output: Output): void {
    output = output.write("UriPath").write(46/*'.'*/).write("parse")
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
Uri.PathSlash = UriPathSlash;
