// Copyright 2015-2024 Nstream, inc.
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

import type {Uninitable} from "@swim/util";
import type {Mutable} from "@swim/util";
import {Lazy} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Compare} from "@swim/util";
import {Strings} from "@swim/util";
import type {Builder} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import type {Display} from "@swim/codec";
import {Format} from "@swim/codec";
import {Base16} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Utf8} from "@swim/codec";
import type {Item} from "@swim/structure";
import {Text} from "@swim/structure";
import {Form} from "@swim/structure";
import {Uri} from "./Uri";

/** @public */
export type UriPathLike = UriPath | readonly string[] | string;

/** @public */
export const UriPathLike = {
  [Symbol.hasInstance](instance: unknown): instance is UriPathLike {
    return instance instanceof UriPath
        || Array.isArray(instance)
        || typeof instance === "string";
  },
};

/** @public */
export abstract class UriPath implements HashCode, Compare, Debug, Display {
  /** @internal */
  protected constructor() {
    // sealed
  }

  likeType?(like: readonly string[] | string): void;

  abstract isDefined(): boolean;

  abstract isAbsolute(): boolean;

  abstract isRelative(): boolean;

  abstract isSegment(): boolean;

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
      if (i >= index) {
        return path.head();
      }
      i += 1;
      path = path.tail();
    }
    return void 0;
  }

  abstract head(): string;

  abstract tail(): UriPath;

  /** @internal */
  abstract setTail(tail: UriPath): void;

  /** @internal */
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
      }
      path = tail;
    } while (true);
  }

  withName(name: string): UriPath {
    const builder = new UriPathBuilder();
    builder.addPath(this.base());
    builder.addSegment(name);
    return builder.build();
  }

  body(): UriPath {
    if (this.isEmpty()) {
      return this;
    }
    const builder = new UriPathBuilder();
    let path: UriPath = this;
    do {
      const tail = path.tail();
      if (tail.isEmpty()) {
        return builder.build();
      } else if (path.isSegment()) {
        builder.addSegment(path.head());
      } else if (path.isAbsolute()) {
        builder.addSlash();
      }
      path = tail;
    } while (true);
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
      }
      path = tail;
    } while (true);
  }

  isSubpathOf(b: UriPathLike): boolean {
    b = UriPath.fromLike(b);
    let a: UriPath = this;
    while (!a.isEmpty() && !b.isEmpty()) {
      if (a.isRelative() != b.isRelative() || a.head() !== b.head()) {
        return false;
      }
      a = a.tail();
      b = b.tail();
    }
    return b.isEmpty();
  }

  appended(...components: UriPathLike[]): UriPath {
    if (arguments.length === 0) {
      return this;
    }
    const builder = new UriPathBuilder();
    builder.addPath(this);
    builder.push(...components);
    return builder.build();
  }

  appendedSlash(): UriPath {
    const builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addSlash();
    return builder.build();
  }

  appendedSegment(segment: string): UriPath {
    const builder = new UriPathBuilder();
    builder.addPath(this);
    builder.addSegment(segment);
    return builder.build();
  }

  prepended(...components: UriPathLike[]): UriPath {
    if (arguments.length === 0) {
      return this;
    }
    const builder = new UriPathBuilder();
    builder.push(...components);
    builder.addPath(this);
    return builder.build();
  }

  prependedSlash(): UriPath {
    return new UriPathSlash(this);
  }

  prependedSegment(segment: string): UriPath {
    if (this.isEmpty() || this.isAbsolute()) {
      return UriPath.segment(segment, this);
    }
    return UriPath.segment(segment, this.prependedSlash());
  }

  resolve(that: UriPath): UriPath {
    if (that.isEmpty()) {
      return this;
    } else if (that.isAbsolute() || this.isEmpty()) {
      return that.removeDotSegments();
    }
    return this.merge(that).removeDotSegments();
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
    return builder.build();
  }

  merge(that: UriPath): UriPath {
    if (this.isEmpty()) {
      return that;
    }
    const builder = new UriPathBuilder();
    let prev: UriPath = this;
    do {
      const next = prev.tail();
      if (next.isEmpty()) {
        if (prev.isAbsolute()) {
          builder.addSlash();
        }
        break;
      } else if (prev.isAbsolute()) {
        builder.addSlash();
      } else {
        builder.addSegment(prev.head());
      }
      prev = next;
    } while (true);
    builder.addPath(that);
    return builder.build();
  }

  unmerge(that: UriPath): UriPath {
    let base: UriPath = this;
    let relative = that;
    if (base.isEmpty()) {
      return relative;
    }
    do {
      if (base.isEmpty()) {
        if (relative.isEmpty() || relative.tail().isEmpty()) {
          return relative;
        }
        return relative.tail();
      } else if (base.isRelative()) {
        return relative;
      } else if (relative.isRelative()) {
        return relative.prependedSlash();
      }
      let a = base.tail();
      let b = relative.tail();
      if (!a.isEmpty() && b.isEmpty()) {
        return UriPath.slash();
      } else if (a.isEmpty() || b.isEmpty()
          || a.isRelative() != b.isRelative()
          || a.head() !== b.head()) {
        return b;
      }
      a = a.tail();
      b = b.tail();
      if (!a.isEmpty() && b.isEmpty()) {
        return that;
      }
      base = a;
      relative = b;
    } while (true);
  }

  /**
   * Returns this path relative to the given `base` path.
   */
  relativeTo(base: UriPath): UriPath {
    return UriPath.difference(base, this);
  }

  /** @internal */
  static difference(base: UriPath, target: UriPath): UriPath {
    let commonSlash = false;
    while (!base.isEmpty() && !target.isEmpty()
        && base.isRelative() === target.isRelative()
        && base.head() === target.head()) {
      commonSlash = base.isAbsolute();
      base = base.tail();
      target = target.tail();
    }
    if (base.isEmpty()) {
      return target;
    }
    const builder = new UriPathBuilder();
    while (!base.isEmpty()) {
      if (base.isRelative()) {
        builder.addSegment("..");
      }
      base = base.tail();
    }
    if (commonSlash) {
      builder.addSlash();
    }
    builder.addPath(target);
    return builder.build();
  }

  toLike(): string[] {
    const components = [];
    let path: UriPath = this;
    while (!path.isEmpty()) {
      components.push(path.head());
      path = path.tail();
    }
    return components;
  }

  /** @override */
  compareTo(that: unknown): number {
    if (that instanceof UriPath) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriPath) {
      return this.toString() === that.toString();
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Strings.hash(this.toString());
  }

  /** @override */
  abstract debug<T>(output: Output<T>): Output<T>;

  /** @override */
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

  /** @override */
  abstract toString(): string;

  static builder(): UriPathBuilder {
    return new UriPathBuilder();
  }

  @Lazy
  static empty(): UriPath {
    return new UriPathEmpty();
  }

  static slash(segment?: string | UriPath): UriPath {
    if (segment === void 0) {
      return UriPathSlash.slash();
    } else if (typeof segment === "string") {
      segment = this.segment(segment);
    }
    return new UriPathSlash(segment);
  }

  static segment(segment: string, tail?: UriPath): UriPath {
    if (tail === void 0) {
      tail = UriPath.empty();
    }
    return new UriPathSegment(segment, tail);
  }

  static of(...components: UriPathLike[]): UriPath {
    const builder = new UriPathBuilder();
    builder.push(...components);
    return builder.build();
  }

  static fromLike<T extends UriPathLike | null | undefined>(value: T): UriPath | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof UriPath) {
      return value as UriPath | Uninitable<T>;
    } else if (Array.isArray(value)) {
      return UriPath.of(...value);
    } else if (typeof value === "string") {
      return UriPath.parse(value);
    }
    throw new TypeError("" + value);
  }

  static parse(input: Input): Parser<UriPath>;
  static parse(string: string): UriPath;
  static parse(string: Input | string): Parser<UriPath> | UriPath {
    const input = typeof string === "string" ? Unicode.stringInput(string) : string;
    let parser = UriPathParser.parse(input);
    if (typeof string === "string" && input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return typeof string === "string" ? parser.bind() : parser;
  }

  @Lazy
  static pathForm(): Form<UriPath, UriPathLike> {
    return new UriPathForm(UriPath.empty());
  }
}

/** @internal */
export class UriPathEmpty extends UriPath {
  /** @internal */
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

  override isSegment(): boolean {
    return false;
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

  /** @internal */
  override setTail(tail: UriPath): void {
    throw new Error("empty path");
  }

  /** @internal */
  override dealias(): UriPath {
    return this;
  }

  override parent(): UriPath {
    return this;
  }

  override base(): UriPath {
    return this;
  }

  override appended(...components: UriPathLike[]): UriPath {
    return UriPath.of(...components);
  }

  override appendedSlash(): UriPath {
    return UriPath.slash();
  }

  override appendedSegment(segment: string): UriPath {
    return UriPath.segment(segment);
  }

  override prepended(...components: UriPathLike[]): UriPath {
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

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriPath").write(46/*'.'*/).write("empty")
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

  override isSegment(): boolean {
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
    }
    const rest = tail.tail();
    if (rest.isEmpty()) {
      return UriPath.slash();
    }
    return new UriPathSlash(tail.parent());
  }

  override base(): UriPath {
    const tail = this.rest;
    if (tail.isEmpty()) {
      return this;
    }
    return new UriPathSlash(tail.base());
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

  /** @internal */
  @Lazy
  static override slash(): UriPathSlash {
    return new UriPathSlash(UriPath.empty());
  }
}

/** @internal */
export class UriPathSegment extends UriPath {
  /** @internal */
  constructor(head: string, tail: UriPath) {
    super();
    this.segment = head;
    this.rest = tail;
    this.stringValue = void 0;
  }

  /** @internal */
  readonly segment: string;

  /** @internal */
  readonly rest: UriPath;

  override isDefined(): boolean {
    return true;
  }

  override isAbsolute(): boolean {
    return false;
  }

  override isRelative(): boolean {
    return true;
  }

  override isSegment(): boolean {
    return true;
  }

  override isEmpty(): boolean {
    return false;
  }

  override head(): string {
    return this.segment;
  }

  override tail(): UriPath {
    return this.rest;
  }

  /** @internal */
  override setTail(tail: UriPath): void {
    if (tail instanceof UriPathSegment) {
      throw new Error("adjacent path segments");
    }
    (this as Mutable<this>).rest = tail;
  }

  /** @internal */
  override dealias(): UriPath {
    return new UriPathSegment(this.segment, this.rest);
  }

  override parent(): UriPath {
    const tail = this.rest;
    if (tail.isEmpty()) {
      return UriPath.empty();
    }
    const rest = tail.tail();
    if (rest.isEmpty()) {
      return UriPath.empty();
    }
    return new UriPathSegment(this.segment, tail.parent());
  }

  override base(): UriPath {
    const tail = this.rest;
    if (tail.isEmpty()) {
      return UriPath.empty();
    }
    return new UriPathSegment(this.segment, tail.base());
  }

  override prependedSegment(segment: string): UriPath {
    return UriPath.segment(segment, this.prependedSlash());
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriPath").write(46/*'.'*/).write("parse").write(40/*'('*/)
                   .write(34/*'"'*/).display(this).write(34/*'"'*/).write(41/*')'*/);
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

  push(...components: UriPathLike[]): void {
    for (let i = 0; i < components.length; i += 1) {
      const component = components[i]!;
      if (component instanceof UriPath) {
        this.addPath(component);
      } else if (Array.isArray(component)) {
        this.push(...component);
      } else if (component === "/") {
        this.addSlash();
      } else {
        this.addSegment(component as string);
      }
    }
  }

  build(): UriPath {
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
    if (path.isEmpty()) {
      return;
    }
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
      if (tail.isEmpty()) {
        break;
      }
      path = tail;
      size += 1;
    } while (true);
    this.last = path;
    this.size = size;
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
    }
    const last = this.dealias(size - 2);
    last.setTail(UriPath.empty());
    this.last = last;
    this.size = size - 1;
    this.aliased = aliased - 1;
    return last.tail();
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

  /** @override */
  toString(): string {
    return this.build().toString();
  }
}

/** @internal */
export class UriPathForm extends Form<UriPath, UriPathLike> {
  constructor(unit: UriPath | undefined) {
    super();
    Object.defineProperty(this, "unit", {
      value: unit,
      enumerable: true,
      configurable: true,
    });
  }

  override readonly unit: UriPath | undefined;

  override withUnit(unit: UriPath | undefined): Form<UriPath, UriPathLike> {
    if (unit === this.unit) {
      return this;
    }
    return new UriPathForm(unit);
  }

  override mold(object: UriPathLike, item?: Item): Item {
    object = UriPath.fromLike(object);
    if (item === void 0) {
      return Text.from(object.toString());
    } else {
      return item.concat(Text.from(object.toString()));
    }
  }

  override cast(item: Item, object?: UriPath): UriPath | undefined {
    const value = item.target;
    try {
      const string = value.stringValue();
      if (typeof string === "string") {
        return UriPath.parse(string);
      }
    } catch (error) {
      // swallow
    }
    return void 0;
  }
}

/** @internal */
export class UriPathParser extends Parser<UriPath> {
  private readonly builder: UriPathBuilder | undefined;
  private readonly output: Output<string> | undefined;
  private readonly c1: number | undefined;
  private readonly step: number | undefined;

  constructor(builder?: UriPathBuilder, output?: Output<string>,
              c1?: number, step?: number) {
    super();
    this.builder = builder;
    this.output = output;
    this.c1 = c1;
    this.step = step;
  }

  override feed(input: Input): Parser<UriPath> {
    return UriPathParser.parse(input, this.builder, this.output, this.c1, this.step);
  }

  static parse(input: Input, builder?: UriPathBuilder, output?: Output<string>,
               c1: number = 0, step: number = 1): Parser<UriPath> {
    let c = 0;
    do {
      if (step === 1) {
        while (input.isCont() && (c = input.head(), Uri.isPathChar(c))) {
          output = output || Utf8.decodedString();
          input = input.step();
          output = output.write(c);
        }
        if (input.isCont() && c === 47/*'/'*/) {
          input = input.step();
          builder = builder || new UriPathBuilder();
          if (output !== void 0) {
            builder.addSegment(output.bind());
            output = void 0;
          }
          builder.addSlash();
          continue;
        } else if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          if (output !== void 0) {
            builder = builder || new UriPathBuilder();
            builder.addSegment(output.bind());
          }
          if (builder !== void 0) {
            return Parser.done(builder.build());
          } else {
            return Parser.done(UriPath.empty());
          }
        }
      }
      if (step === 2) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          c1 = c;
          step = 3;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 3) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          output = output || Utf8.decodedString();
          input = input.step();
          output = output.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    return new UriPathParser(builder, output, c1, step);
  }
}
