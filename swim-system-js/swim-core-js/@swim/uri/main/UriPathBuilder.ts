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

import {Builder} from "@swim/util";
import {Uri} from "./Uri";
import {AnyUriPath, UriPath} from "./UriPath";

export class UriPathBuilder implements Builder<string, UriPath> {
  /** @hidden */
  _first: UriPath;
  /** @hidden */
  _last: UriPath | null;
  /** @hidden */
  _size: number;
  /** @hidden */
  _aliased: number;

  constructor() {
    this._first = Uri.Path.empty();
    this._last = null;
    this._size = 0;
    this._aliased = 0;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  push(...components: AnyUriPath[]): void {
    for (let i = 0; i < components.length; i += 1) {
      const component = components[i];
      if (component instanceof Uri.Path) {
        this.addPath(component);
      } else if (Array.isArray(component)) {
        this.push.apply(this, component);
      } else if (component === "/") {
        this.addSlash();
      } else {
        this.addSegment(component);
      }
    }
  }

  bind(): UriPath {
    this._aliased = 0;
    return this._first;
  }

  addSlash(): void {
    const tail = Uri.Path.slash().dealias();
    const size = this._size;
    if (size === 0) {
      this._first = tail;
    } else {
      this.dealias(size - 1).setTail(tail);
    }
    this._last = tail;
    this._size = size + 1;
    this._aliased += 1;
  }

  addSegment(segment: string): void {
    const tail = Uri.Path.segment(segment, Uri.Path.empty());
    const size = this._size;
    if (size === 0) {
      this._first = tail;
    } else {
      this.dealias(size - 1).setTail(tail);
    }
    this._last = tail;
    this._size = size + 1;
    this._aliased += 1;
  }

  addPath(path: UriPath): void {
    if (!path.isEmpty()) {
      let size = this._size;
      if (size === 0) {
        this._first = path;
      } else {
        this.dealias(size - 1).setTail(path);
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
      this._last = path;
      this._size = size;
    }
  }

  pop(): UriPath {
    const size = this._size;
    const aliased = this._aliased;
    if (size === 0) {
      throw new Error("Empty UriPath");
    } else if (size === 1) {
      const first = this._first;
      this._first = first.tail();
      if (first.tail().isEmpty()) {
        this._last = null;
      }
      this._size = size - 1;
      if (aliased > 0) {
        this._aliased = aliased - 1;
      }
      return first;
    } else {
      const last = this.dealias(size - 2);
      last.setTail(Uri.Path.empty());
      this._last = last;
      this._size = size - 1;
      this._aliased = aliased - 1;
      return last.tail();
    }
  }

  /** @hidden */
  dealias(n: number): UriPath {
    let i = 0;
    let xi = null as UriPath | null;
    let xs = this._first;
    if (this._aliased <= n) {
      while (i < this._aliased) {
        xi = xs;
        xs = xs.tail();
        i += 1;
      }
      while (i <= n) {
        const xn = xs.dealias();
        if (i === 0) {
          this._first = xn;
        } else {
          xi!.setTail(xn);
        }
        xi = xn;
        xs = xs.tail();
        i += 1;
      }
      if (i === this._size) {
        this._last = xi;
      }
      this._aliased = i;
    } else if (n === 0) {
      xi = this._first;
    } else if (n === this._size - 1) {
      xi = this._last;
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
Uri.PathBuilder = UriPathBuilder;
