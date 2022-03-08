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

import type {Builder} from "@swim/util";
import {AnyUriPath, UriPath} from "./UriPath";

/** @public */
export class UriPathBuilder implements Builder<string, UriPath> {
  /** @internal */
  first: UriPath;
  /** @internal */
  last: UriPath | null;
  /** @internal */
  size: number;
  /** @internal */
  aliased: number;

  constructor() {
    this.first = UriPath.empty();
    this.last = null;
    this.size = 0;
    this.aliased = 0;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  push(...components: AnyUriPath[]): void {
    for (let i = 0; i < components.length; i += 1) {
      const component = components[i]!;
      if (component instanceof UriPath) {
        this.addPath(component);
      } else if (Array.isArray(component)) {
        this.push(...component);
      } else if (component === "/") {
        this.addSlash();
      } else {
        this.addSegment(component);
      }
    }
  }

  bind(): UriPath {
    this.aliased = 0;
    return this.first;
  }

  addSlash(): void {
    const tail = UriPath.slash().dealias();
    const size = this.size;
    if (size === 0) {
      this.first = tail;
    } else {
      this.dealias(size - 1).setTail(tail);
    }
    this.last = tail;
    this.size = size + 1;
    this.aliased += 1;
  }

  addSegment(segment: string): void {
    const tail = UriPath.segment(segment, UriPath.empty());
    let size = this.size;
    if (size === 0) {
      this.first = tail;
    } else {
      const last = this.dealias(size - 1);
      if (last.isAbsolute()) {
        last.setTail(tail);
      } else {
        last.setTail(tail.prependedSlash());
        size += 1;
        this.aliased += 1;
      }
    }
    this.last = tail;
    this.size = size + 1;
    this.aliased += 1;
  }

  addPath(path: UriPath): void {
    if (!path.isEmpty()) {
      let size = this.size;
      if (size === 0) {
        this.first = path;
      } else {
        const last = this.dealias(size - 1);
        if (last.isAbsolute() || path.isAbsolute()) {
          last.setTail(path);
        } else {
          last.setTail(path.prependedSlash());
          size += 1;
          this.aliased += 1;
        }
      }
      size += 1;
      do {
        const tail = path.tail();
        if (!tail.isEmpty()) {
          path = tail;
          size += 1;
        } else {
          break;
        }
      } while (true);
      this.last = path;
      this.size = size;
    }
  }

  pop(): UriPath {
    const size = this.size;
    const aliased = this.aliased;
    if (size === 0) {
      throw new Error("Empty UriPath");
    } else if (size === 1) {
      const first = this.first;
      this.first = first.tail();
      if (first.tail().isEmpty()) {
        this.last = null;
      }
      this.size = size - 1;
      if (aliased > 0) {
        this.aliased = aliased - 1;
      }
      return first;
    } else {
      const last = this.dealias(size - 2);
      last.setTail(UriPath.empty());
      this.last = last;
      this.size = size - 1;
      this.aliased = aliased - 1;
      return last.tail();
    }
  }

  /** @internal */
  dealias(n: number): UriPath {
    let i = 0;
    let xi: UriPath | null = null;
    let xs = this.first;
    if (this.aliased <= n) {
      while (i < this.aliased) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
      while (i <= n) {
        const xn = xs.dealias();
        if (i === 0) {
          this.first = xn;
        } else {
          xi!.setTail(xn);
        }
        xi = xn;
        xs = xs.tail();
        i += 1;
      }
      if (i === this.size) {
        this.last = xi;
      }
      this.aliased = i;
    } else if (n === 0) {
      xi = this.first;
    } else if (n === this.size - 1) {
      xi = this.last;
    } else {
      while (i <= n) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
    }
    return xi!;
  }
}
