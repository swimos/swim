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

import type {Output} from "@swim/codec";
import {AnyUriPath, UriPath} from "./UriPath";

/** @hidden */
export class UriPathEmpty extends UriPath {
  /** @hidden */
  constructor() {
    super();
  }

  override isDefined(): boolean {
    return false;
  }

  override isAbsolute(): boolean {
    return false;
  }

  override isRelative(): boolean {
    return true;
  }

  override isEmpty(): boolean {
    return true;
  }

  override head(): string {
    throw new Error("empty path");
  }

  override tail(): UriPath {
    throw new Error("empty path");
  }

  /** @hidden */
  override setTail(tail: UriPath): void {
    throw new Error("empty path");
  }

  /** @hidden */
  override dealias(): UriPath {
    return this;
  }

  override parent(): UriPath {
    return this;
  }

  override base(): UriPath {
    return this;
  }

  override appended(...components: AnyUriPath[]): UriPath {
    return UriPath.of(...components);
  }

  override appendedSlash(): UriPath {
    return UriPath.slash();
  }

  override appendedSegment(segment: string): UriPath {
    return UriPath.segment(segment);
  }

  override prepended(...components: AnyUriPath[]): UriPath {
    return UriPath.of(...components);
  }

  override prependedSlash(): UriPath {
    return UriPath.slash();
  }

  override prependedSegment(segment: string): UriPath {
    return UriPath.segment(segment);
  }

  override merge(that: UriPath): UriPath {
    return that;
  }

  override debug(output: Output): void {
    output = output.write("UriPath").write(46/*'.'*/).write("empty")
        .write(40/*'('*/).write(41/*')'*/);
  }

  override display(output: Output): void {
    // nop
  }

  override toString(): string {
    return "";
  }
}
