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

import {Output, Format} from "@swim/codec";
import {UriPath} from "./UriPath";

/** @hidden */
export class UriPathSlash extends UriPath {
  /** @hidden */
  constructor(tail: UriPath) {
    super();
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

  /** @hidden */
  declare readonly rest: UriPath;

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
    return this.rest;
  }

  /** @hidden */
  setTail(tail: UriPath): void {
    Object.defineProperty(this, "rest", {
      value: tail,
      enumerable: true,
      configurable: true,
    });
  }

  /** @hidden */
  dealias(): UriPath {
    return new UriPathSlash(this.rest);
  }

  parent(): UriPath {
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

  base(): UriPath {
    const tail = this.rest;
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
    const stringValue = this.stringValue;
    if (stringValue !== void 0) {
      output = output.write(stringValue);
    } else {
      super.display(output);
    }
  }

  /** @hidden */
  declare readonly stringValue: string | undefined;

  toString(): string {
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
