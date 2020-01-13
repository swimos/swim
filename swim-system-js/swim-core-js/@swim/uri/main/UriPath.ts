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

import {Comparable, HashCode, Murmur3, HashGenCacheSet} from "@swim/util";
import {Output, Debug, Display} from "@swim/codec";
import {Form} from "@swim/structure";
import {Uri} from "./Uri";
import {UriPathBuilder} from "./UriPathBuilder";

export type AnyUriPath = UriPath | string[] | string;

export abstract class UriPath implements Comparable<UriPath>, HashCode, Debug, Display {
  /** @hidden */
  _hashCode?: number;

  /** @hidden */
  protected constructor() {
    // sealed
  }

  abstract isDefined(): boolean;

  abstract isAbsolute(): boolean;

  abstract isRelative(): boolean;

  abstract isEmpty(): boolean;

  get length(): number {
    let n = 0;
    let path = this as UriPath;
    while (!path.isEmpty()) {
      n += 1;
      path = path.tail();
    }
    return n;
  }

  get(index: number): string | undefined {
    let i = 0;
    let path = this as UriPath;
    while (!path.isEmpty()) {
      if (i < index) {
        i += 1;
        path = path.tail();
      } else {
        return path.head();
      }
    }
    return void 0;
  }

  abstract head(): string;

  abstract tail(): UriPath;

  /** @hidden */
  abstract setTail(tail: UriPath): void;

  /** @hidden */
  abstract dealias(): UriPath;

  abstract parent(): UriPath;

  abstract base(): UriPath;

  name(): string;
  name(name: string): UriPath;
  name(name?: string): string | UriPath {
    if (name === void 0) {
      if (this.isEmpty()) {
        return "";
      }
      let path = this as UriPath;
      do {
        const tail = path.tail();
        if (tail.isEmpty()) {
          return path.isRelative() ? path.head() : "";
        } else {
          path = tail;
        }
      } while (true);
    } else {
      const builder = new Uri.PathBuilder();
      builder.addPath(this.base());
      builder.addSegment(name);
      return builder.bind();
    }
  }

  foot(): UriPath {
    if (this.isEmpty()) {
      return this;
    }
    let path = this as UriPath;
    do {
      const tail = path.tail();
      if (tail.isEmpty()) {
        return path;
      } else {
        path = tail;
      }
    } while (true);
  }

  isSubpathOf(b: AnyUriPath): boolean {
    b = UriPath.fromAny(b);
    let a = this as UriPath;
    while (!a.isEmpty() && !b.isEmpty()) {
      if (a.head() !== b.head()) {
        return false;
      }
      a = a.tail();
      b = b.tail();
    }
    return b.isEmpty();
  }

  appended(...components: AnyUriPath[]): UriPath {
    if (arguments.length > 0) {
      const builder = new Uri.PathBuilder();
      builder.addPath(this);
      builder.push.apply(builder, arguments);
      return builder.bind();
    } else {
      return this;
    }
  }

  appendedSlash(): UriPath {
    const builder = new Uri.PathBuilder();
    builder.addPath(this);
    builder.addSlash();
    return builder.bind();
  }

  appendedSegment(segment: string): UriPath {
    const builder = new Uri.PathBuilder();
    builder.addPath(this);
    builder.addSegment(segment);
    return builder.bind();
  }

  prepended(...components: AnyUriPath[]): UriPath {
    if (arguments.length > 0) {
      const builder = new Uri.PathBuilder();
      builder.push.apply(builder, arguments);
      builder.addPath(this);
      return builder.bind();
    } else {
      return this;
    }
  }

  prependedSlash(): UriPath {
    return UriPath.slash(this);
  }

  prependedSegment(segment: string): UriPath {
    if (this.isEmpty() || this.isAbsolute()) {
      return UriPath.segment(segment, this);
    } else {
      return UriPath.segment(segment, UriPath.slash(this));
    }
  }

  resolve(that: UriPath): UriPath {
    if (that.isEmpty()) {
      return this;
    } else if (that.isAbsolute() || this.isEmpty()) {
      return that.removeDotSegments();
    } else {
      return this.merge(that).removeDotSegments();
    }
  }

  removeDotSegments(): UriPath {
    let path = this as UriPath;
    const builder = new Uri.PathBuilder();
    while (!path.isEmpty()) {
      const head = path.head();
      if (head === "." || head === "..") {
        path = path.tail();
        if (!path.isEmpty()) {
          path = path.tail();
        }
      } else if (path.isAbsolute()) {
        const rest = path.tail();
        if (!rest.isEmpty()) {
          const next = rest.head();
          if (next === ".") {
            path = rest.tail();
            if (path.isEmpty()) {
              path = UriPath.slash();
            }
          } else if (next === "..") {
            path = rest.tail();
            if (path.isEmpty()) {
              path = UriPath.slash();
            }
            if (!builder.isEmpty() && !builder.pop().isAbsolute()) {
              if (!builder.isEmpty()) {
                builder.pop();
              }
            }
          } else {
            builder.push(head, next);
            path = rest.tail();
          }
        } else {
          builder.push(path.head());
          path = path.tail();
        }
      } else {
        builder.push(path.head());
        path = path.tail();
      }
    }
    return builder.bind();
  }

  merge(that: UriPath): UriPath {
    if (!this.isEmpty()) {
      const builder = new Uri.PathBuilder();
      let prev = this as UriPath;
      do {
        const next = prev.tail();
        if (!next.isEmpty()) {
          if (prev.isAbsolute()) {
            builder.addSlash();
          } else {
            builder.addSegment(prev.head());
          }
          prev = next;
        } else {
          if (prev.isAbsolute()) {
            builder.addSlash();
          }
          break;
        }
      } while (true);
      builder.addPath(that);
      return builder.bind();
    } else {
      return that;
    }
  }

  unmerge(relative: UriPath, root: UriPath = relative): UriPath {
    let base = this as UriPath;
    do {
      if (base.isEmpty()) {
        if (!relative.isEmpty() && !relative.tail().isEmpty()) {
          return relative.tail();
        } else {
          return relative;
        }
      } else if (base.isRelative()) {
        return relative;
      } else if (relative.isRelative()) {
        return UriPath.slash(relative);
      } else {
        let a = base.tail();
        let b = relative.tail();
        if (!a.isEmpty() && b.isEmpty()) {
          return UriPath.slash();
        } else if (a.isEmpty() || b.isEmpty() || a.head() !== b.head()) {
          return b;
        } else {
          a = a.tail();
          b = b.tail();
          if (!a.isEmpty() && b.isEmpty()) {
            return root;
          } else {
            base = a;
            relative = b;
          }
        }
      }
    } while (true);
  }

  toAny(): string[] {
    const components = [];
    let path = this as UriPath;
    while (!path.isEmpty()) {
      components.push(path.head());
      path = path.tail();
    }
    return components;
  }

  compareTo(that: UriPath): 0 | 1 | -1 {
    const order = this.toString().localeCompare(that.toString());
    return order < 0 ? -1 : order > 0 ? 1 : 0;
  }

  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriPath) {
      return this.toString() === that.toString();
    }
    return false;
  }

  hashCode(): number {
    if (this._hashCode === void 0) {
      this._hashCode = Murmur3.hash(this.toString());
    }
    return this._hashCode;
  }

  abstract debug(output: Output): void;

  display(output: Output): void {
    let path = this as UriPath;
    while (!path.isEmpty()) {
      if (path.isAbsolute()) {
        output = output.write(47/*'/'*/);
      } else {
        Uri.writePathSegment(path.head(), output);
      }
      path = path.tail();
    }
  }

  abstract toString(): string;

  private static _empty?: UriPath;

  private static _slash?: UriPath;

  private static _segmentCache?: HashGenCacheSet<string>;

  static builder(): UriPathBuilder {
    return new Uri.PathBuilder();
  }

  static empty(): UriPath {
    if (UriPath._empty === void 0) {
      UriPath._empty = new Uri.PathEmpty();
    }
    return UriPath._empty;
  }

  static slash(tail: UriPath = UriPath.empty()): UriPath {
    if (tail === UriPath.empty()) {
      if (UriPath._slash === void 0) {
        UriPath._slash = new Uri.PathSlash(tail);
      }
      return UriPath._slash;
    } else {
      return new Uri.PathSlash(tail);
    }
  }

  static segment(segment: string, tail: UriPath = UriPath.empty()): UriPath {
    segment = this.cacheSegment(segment);
    return new Uri.PathSegment(segment, tail);
  }

  static from(...components: AnyUriPath[]): UriPath {
    const builder = new Uri.PathBuilder();
    builder.push.apply(builder, arguments);
    return builder.bind();
  }

  static fromAny(path: AnyUriPath | null | undefined): UriPath {
    if (path === null || path === void 0) {
      return UriPath.empty();
    } else if (path instanceof UriPath) {
      return path;
    } else if (Array.isArray(path)) {
      return UriPath.from.apply(void 0, arguments);
    } else if (typeof path === "string") {
      return UriPath.parse(path);
    } else {
      throw new TypeError("" + path);
    }
  }

  static parse(string: string): UriPath {
    return Uri.standardParser().parsePathString(string);
  }

  /** @hidden */
  static segmentCache(): HashGenCacheSet<string> {
    if (UriPath._segmentCache === void 0) {
      const segmentCacheSize = 64;
      UriPath._segmentCache = new HashGenCacheSet<string>(segmentCacheSize);
    }
    return UriPath._segmentCache;
  }

  /** @hidden */
  static cacheSegment(segment: string): string {
    if (segment.length <= 32) {
      return this.segmentCache().put(segment);
    } else {
      return segment;
    }
  }

  private static _pathForm?: Form<UriPath>;

  static pathForm(): Form<UriPath> {
    if (!UriPath._pathForm) {
      UriPath._pathForm = new Uri.PathForm(UriPath.empty());
    }
    return UriPath._pathForm;
  }
}
Uri.Path = UriPath;
