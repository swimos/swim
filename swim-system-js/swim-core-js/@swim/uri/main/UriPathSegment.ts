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

import {Output, Format} from "@swim/codec";
import {Uri} from "./Uri";
import {UriPath} from "./UriPath";

/** @hidden */
export class UriPathSegment extends UriPath {
  /** @hidden */
  readonly _head: string;
  /** @hidden */
  _tail: UriPath;
  /** @hidden */
  _string?: string;

  /** @hidden */
  constructor(head: string, tail: UriPath) {
    super();
    this._head = head;
    this._tail = tail;
  }

  isDefined(): boolean {
    return true;
  }

  isAbsolute(): boolean {
    return false;
  }

  isRelative(): boolean {
    return true;
  }

  isEmpty(): boolean {
    return false;
  }

  head(): string {
    return this._head;
  }

  tail(): UriPath {
    return this._tail;
  }

  /** @hidden */
  setTail(tail: UriPath): void {
    if (tail.isAbsolute()) {
      this._tail = tail;
    } else {
      this._tail = UriPath.slash(tail);
    }
  }

  /** @hidden */
  dealias(): UriPath {
    return new UriPathSegment(this._head, this._tail);
  }

  parent(): UriPath {
    const tail = this._tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      const next = tail.tail();
      if (next.isEmpty()) {
        return UriPath.empty();
      } else {
        return new UriPathSegment(this._head, tail.parent());
      }
    }
  }

  base(): UriPath {
    const tail = this._tail;
    if (tail.isEmpty()) {
      return UriPath.empty();
    } else {
      return new UriPathSegment(this._head, tail.base());
    }
  }

  prependedSegment(segment: string): UriPath {
    return UriPath.segment(segment, UriPath.slash(this));
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
Uri.PathSegment = UriPathSegment;
