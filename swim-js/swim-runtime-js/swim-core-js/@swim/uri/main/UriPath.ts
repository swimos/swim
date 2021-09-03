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

import {HashCode, Compare, Lazy, Strings, HashGenCacheSet} from "@swim/util";
import type {Output, Debug, Display} from "@swim/codec";
import type {Form} from "@swim/structure";
import {Uri} from "./Uri";
import {UriPathSegment} from "./"; // forward import
import {UriPathSlash} from "./"; // forward import
import {UriPathEmpty} from "./"; // forward import
import {UriPathBuilder} from "./"; // forward import
import {UriPathForm} from "./"; // forward import

export type AnyUriPath = UriPath | string[] | string;

export abstract class UriPath implements HashCode, Compare, Debug, Display {
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
    let path: UriPath = this;
    while (!path.isEmpty()) {
      n += 1;
      path = path.tail();
    }
    return n;
  }

  get(index: number): string | undefined {
    let i = 0;
    let path: UriPath = this;
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

  get name(): string {
    if (this.isEmpty()) {
      return "";
    }
    let path: UriPath = this;
    do {
      const tail = path.tail();
      if (tail.isEmpty()) {
        return path.isRelative() ? path.head() : "";
      } else {
        path = tail;
      }
    } while (true);
  }

  withName(name: string): UriPath {
    const builder = new UriPathBuilder();
    builder.addPath(this.base());
    builder.addSegment(name);
    return builder.bind();
  }

  foot(): UriPath {
    if (this.isEmpty()) {
      return this;
    }
    let path: UriPath = this;
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
    let a: UriPath = this;
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
      const builder = new UriPathBuilder();
      builder.addPath(this);
      builder.push(...components);
      return builder.bind();
    } else {
      return this;
    }
  }

  appendedSlash(): UriPath {
    const builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addSlash();
    return builder.bind();
  }

  appendedSegment(segment: string): UriPath {
    const builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addSegment(segment);
    return builder.bind();
  }

  prepended(...components: AnyUriPath[]): UriPath {
    if (arguments.length > 0) {
      const builder = new UriPathBuilder();
      builder.push(...components);
      builder.addPath(this);
      return builder.bind();
    } else {
      return this;
    }
  }

  prependedSlash(): UriPath {
    return new UriPathSlash(this);
  }

  prependedSegment(segment: string): UriPath {
    if (this.isEmpty() || this.isAbsolute()) {
      return UriPath.segment(segment, this);
    } else {
      return UriPath.segment(segment, this.prependedSlash());
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
    let path: UriPath = this;
    const builder = new UriPathBuilder();
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
      const builder = new UriPathBuilder();
      let prev: UriPath = this;
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
    let base: UriPath = this;
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
        return relative.prependedSlash();
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
    let path: UriPath = this;
    while (!path.isEmpty()) {
      components.push(path.head());
      path = path.tail();
    }
    return components;
  }

  compareTo(that: unknown): number {
    if (that instanceof UriPath) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
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
    return Strings.hash(this.toString());
  }

  abstract debug<T>(output: Output<T>): Output<T>;

  display<T>(output: Output<T>): Output<T> {
    let path: UriPath = this;
    while (!path.isEmpty()) {
      if (path.isAbsolute()) {
        output = output.write(47/*'/'*/);
      } else {
        output = Uri.writePathSegment(output, path.head());
      }
      path = path.tail();
    }
    return output;
  }

  abstract toString(): string;

  @Lazy
  static empty(): UriPath {
    return new UriPathEmpty();
  }

  @Lazy
  static slash(): UriPath {
    return new UriPathSlash(UriPath.empty());
  }

  static segment(segment: string, tail?: UriPath): UriPath {
    if (tail === void 0) {
      tail = UriPath.empty();
    }
    segment = this.cacheSegment(segment);
    return new UriPathSegment(segment, tail);
  }

  static of(...components: AnyUriPath[]): UriPath {
    const builder = new UriPathBuilder();
    builder.push(...components);
    return builder.bind();
  }

  static fromAny(value: AnyUriPath | null | undefined): UriPath {
    if (value === void 0 || value === null) {
      return UriPath.empty();
    } else if (value instanceof UriPath) {
      return value;
    } else if (Array.isArray(value)) {
      return UriPath.of(...value);
    } else if (typeof value === "string") {
      return UriPath.parse(value);
    } else {
      throw new TypeError("" + value);
    }
  }

  static parse(pathPart: string): UriPath {
    return Uri.standardParser.parsePathString(pathPart);
  }

  static builder(): UriPathBuilder {
    return new UriPathBuilder();
  }

  @Lazy
  static pathForm(): Form<UriPath, AnyUriPath> {
    return new UriPathForm(UriPath.empty());
  }

  /** @hidden */
  @Lazy
  static get segmentCache(): HashGenCacheSet<string> {
    const segmentCacheSize = 64;
    return new HashGenCacheSet<string>(segmentCacheSize);
  }

  /** @hidden */
  static cacheSegment(segment: string): string {
    if (segment.length <= 32) {
      return this.segmentCache.put(segment);
    } else {
      return segment;
    }
  }
}
