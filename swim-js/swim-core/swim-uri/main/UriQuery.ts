// Copyright 2015-2023 Nstream, inc.
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
import type {PairBuilder} from "@swim/util";
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
import {Uri} from "./Uri";

/** @public */
export type UriQueryLike = UriQuery | {[key: string]: string} | string;

/** @public */
export const UriQueryLike = {
  [Symbol.hasInstance](instance: unknown): instance is UriQueryLike {
    return instance instanceof UriQuery
        || typeof instance === "object" && instance !== null
        || typeof instance === "string";
  },
};

/** @public */
export abstract class UriQuery implements HashCode, Compare, Debug, Display {
  likeType?(like: {[key: string]: string} | string): void;

  abstract isDefined(): boolean;

  abstract isEmpty(): boolean;

  get length(): number {
    let n = 0;
    let query: UriQuery = this;
    while (!query.isEmpty()) {
      n += 1;
      query = query.tail();
    }
    return n;
  }

  abstract head(): [string | undefined, string];

  abstract readonly key: string | undefined;

  abstract readonly value: string;

  abstract tail(): UriQuery;

  /** @internal */
  abstract setTail(tail: UriQuery): void;

  /** @internal */
  abstract dealias(): UriQuery;

  has(key: string): boolean {
    let query: UriQuery = this;
    while (!query.isEmpty()) {
      if (key === query.key) {
        return true;
      }
      query = query.tail();
    }
    return false;
  }

  get(key: string): string | undefined {
    let query: UriQuery = this;
    while (!query.isEmpty()) {
      if (key === query.key) {
        return query.value;
      }
      query = query.tail();
    }
    return void 0;
  }

  updated(key: string, value: string): UriQuery {
    let query: UriQuery = this;
    const builder = new UriQueryBuilder();
    let updated = false;
    while (!query.isEmpty()) {
      if (key === query.key) {
        builder.addParam(key, value);
        updated = true;
      } else {
        builder.addParam(query.key, query.value);
      }
      query = query.tail();
    }
    if (!updated) {
      builder.addParam(key, value);
    }
    return builder.build();
  }

  removed(key: string): UriQuery {
    let query: UriQuery = this;
    const builder = new UriQueryBuilder();
    let updated = false;
    while (!query.isEmpty()) {
      if (key === query.key) {
        updated = true;
      } else {
        builder.addParam(query.key, query.value);
      }
      query = query.tail();
    }
    if (!updated) {
      return this;
    }
    return builder.build();
  }

  appended(key: string | undefined, value: string): UriQuery;
  appended(params: UriQueryLike): UriQuery;
  appended(key: UriQueryLike | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.addQuery(this);
    builder.add(key as any, value as any);
    return builder.build();
  }

  prepended(key: string | undefined, value: string): UriQuery;
  prepended(params: UriQueryLike): UriQuery;
  prepended(key: UriQueryLike | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.add(key as any, value as any);
    builder.addQuery(this);
    return builder.build();
  }

  toLike(params?: {[key: string]: string}): {[key: string]: string} | undefined {
    if (this.isDefined()) {
      params = params || {};
      let query: UriQuery = this;
      let i = 0;
      while (!query.isEmpty()) {
        const key = query.key;
        if (key !== void 0) {
          params[key] = query.value;
        } else {
          params["$" + i] = query.value;
        }
        query = query.tail();
        i += 1;
      }
    }
    return params;
  }

  /** @override */
  compareTo(that: UriQuery): number {
    if (that instanceof UriQuery) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriQuery) {
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
    let query: UriQuery = this;
    let first = true;
    while (!query.isEmpty()) {
      if (!first) {
        output = output.write(38/*'&'*/);
      } else {
        first = false;
      }
      const key = query.key;
      if (key !== void 0) {
        output = Uri.writeParam(output, key);
        output = output.write(61/*'='*/);
      }
      output = Uri.writeQuery(output, query.value);
      query = query.tail();
    }
    return output;
  }

  /** @override */
  abstract toString(): string;

  static builder(): UriQueryBuilder {
    return new UriQueryBuilder();
  }

  @Lazy
  static undefined(): UriQuery {
    return new UriQueryUndefined();
  }

  static param(value: string, tail?: UriQuery): UriQuery;
  static param(key: string | undefined, value: string, tail?: UriQuery): UriQuery;
  static param(key: string | undefined, value?: UriQuery | string, tail?: UriQuery): UriQuery {
    if (tail === void 0) {
      tail = value as UriQuery | undefined;
      value = key!;
      key = void 0;
    }
    if (tail === void 0) {
      tail = UriQuery.undefined();
    }
    return new UriQueryParam(key, value as string, tail);
  }

  static fromLike<T extends UriQueryLike | null | undefined>(value: T): UriQuery | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof UriQuery) {
      return value as UriQuery | Uninitable<T>;
    } else if (typeof value === "object") {
      const builder = new UriQueryBuilder();
      builder.add(value);
      return builder.build();
    } else if (typeof value === "string") {
      return UriQuery.parse(value);
    }
    throw new TypeError("" + value);
  }

  static parse(input: Input): Parser<UriQuery>;
  static parse(string: string): UriQuery;
  static parse(string: Input | string): Parser<UriQuery> | UriQuery {
    const input = typeof string === "string" ? Unicode.stringInput(string) : string;
    let parser = UriQueryParser.parse(input);
    if (typeof string === "string" && input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return typeof string === "string" ? parser.bind() : parser;
  }
}

/** @internal */
export class UriQueryUndefined extends UriQuery {
  override isDefined(): boolean {
    return false;
  }

  override isEmpty(): boolean {
    return true;
  }

  override head(): [string | undefined, string] {
    throw new Error("undefined query");
  }

  override get key(): string | undefined {
    throw new Error("undefined query");
  }

  override get value(): string {
    throw new Error("undefined query");
  }

  override tail(): UriQuery {
    throw new Error("undefined query");
  }

  /** @internal */
  override setTail(tail: UriQuery): void {
    throw new Error("undefined query");
  }

  /** @internal */
  override dealias(): UriQuery {
    return this;
  }

  override updated(key: string, value: string): UriQuery {
    return UriQuery.param(key, value, this);
  }

  override removed(key: string): UriQuery {
    return this;
  }

  override appended(key: string | undefined, value: string): UriQuery;
  override appended(params: UriQueryLike): UriQuery;
  override appended(key: UriQueryLike | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.add(key as any, value as any);
    return builder.build();
  }

  override prepended(key: string | undefined, value: string): UriQuery;
  override prepended(params: UriQueryLike): UriQuery;
  override prepended(key: UriQueryLike | undefined, value?: string): UriQuery {
    const builder = new UriQueryBuilder();
    builder.add(key as any, value as any);
    return builder.build();
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriQuery").write(46/*'.'*/).write("undefined")
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
export class UriQueryParam extends UriQuery {
  constructor(key: string | undefined, value: string, tail: UriQuery) {
    super();
    this.key = key;
    this.value = value;
    this.rest = tail;
    this.stringValue = void 0;
  }

  override readonly key: string | undefined;

  override readonly value: string;

  /** @internal */
  readonly rest: UriQuery;

  override isDefined(): boolean {
    return true;
  }

  override isEmpty(): boolean {
    return false;
  }

  override head(): [string | undefined, string] {
    return [this.key, this.value];
  }

  override tail(): UriQuery {
    return this.rest;
  }

  /** @internal */
  override setTail(tail: UriQuery): void {
    (this as Mutable<this>).rest = tail;
  }

  /** @internal */
  override dealias(): UriQuery {
    return new UriQueryParam(this.key, this.value, this.rest);
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriQuery").write(46/*'.'*/).write("parse").write(40/*'('*/)
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
export class UriQueryBuilder implements PairBuilder<string | undefined, string, UriQuery> {
  /** @internal */
  first: UriQuery;
  /** @internal */
  last: UriQuery | null;
  /** @internal */
  size: number;
  /** @internal */
  aliased: number;

  constructor() {
    this.first = UriQuery.undefined();
    this.last = null;
    this.size = 0;
    this.aliased = 0;
  }

  isEmpty(): boolean {
    return this.size === 0;
  }

  add(key: string | undefined, value: string): void;
  add(params: UriQueryLike): void;
  add(key: UriQueryLike | undefined, value?: string): void {
    if (value !== void 0) {
      this.addParam(key as string | undefined, value);
    } else if (typeof key === "string") {
      this.addParam(void 0, key);
    } else if (key instanceof UriQuery) {
      this.addQuery(key);
    } else {
      const params = key!;
      for (const k in params) {
        let key = k as string | undefined;
        const value = params[k]!;
        if (k.charCodeAt(0) === 36/*'$'*/) {
          key = void 0;
        }
        this.addParam(key, value);
      }
    }
  }

  build(): UriQuery {
    this.aliased = 0;
    return this.first;
  }

  addParam(value: string): void;
  addParam(key: string | undefined, value: string): void;
  addParam(key: string | undefined, value?: string): void {
    if (value === void 0) {
      value = key!;
      key = void 0;
    }
    const tail = UriQuery.param(key, value, UriQuery.undefined());
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

  addQuery(query: UriQuery): void {
    if (query.isEmpty()) {
      return;
    }
    let size = this.size;
    if (size === 0) {
      this.first = query;
    } else {
      this.dealias(size - 1).setTail(query);
    }
    size += 1;
    do {
      const tail = query.tail();
      if (tail.isEmpty()) {
        break;
      }
      query = tail;
      size += 1;
    } while (true);
    this.last = query;
    this.size = size;
  }

  /** @internal */
  dealias(n: number): UriQuery {
    let i = 0;
    let xi: UriQuery | null = null;
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
export class UriQueryParser extends Parser<UriQuery> {
  private readonly builder: UriQueryBuilder | undefined;
  private readonly keyOutput: Output<string> | undefined;
  private readonly valueOutput: Output<string> | undefined;
  private readonly c1: number | undefined;
  private readonly step: number | undefined;

  constructor(builder?: UriQueryBuilder, keyOutput?: Output<string>,
              valueOutput?: Output<string>, c1?: number, step?: number) {
    super();
    this.builder = builder;
    this.keyOutput = keyOutput;
    this.valueOutput = valueOutput;
    this.c1 = c1;
    this.step = step;
  }

  override feed(input: Input): Parser<UriQuery> {
    return UriQueryParser.parse(input, this.builder, this.keyOutput,
                                this.valueOutput, this.c1, this.step);
  }

  static parse(input: Input, builder?: UriQueryBuilder, keyOutput?: Output<string>,
               valueOutput?: Output<string>, c1: number = 0, step: number = 1): Parser<UriQuery> {
    let c = 0;
    do {
      if (step === 1) {
        keyOutput = keyOutput || Utf8.decodedString();
        while (input.isCont() && (c = input.head(), Uri.isParamChar(c))) {
          input = input.step();
          keyOutput.write(c);
        }
        if (input.isCont() && c === 61/*'='*/) {
          input = input.step();
          step = 4;
        } else if (input.isCont() && c === 38/*'&'*/) {
          input = input.step();
          builder = builder || new UriQueryBuilder();
          builder.addParam(keyOutput.bind());
          keyOutput = void 0;
          continue;
        } else if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          builder = builder || new UriQueryBuilder();
          builder.addParam(keyOutput.bind());
          return Parser.done(builder.build());
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
          input = input.step();
          keyOutput!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 1;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 4) {
        valueOutput = valueOutput || Utf8.decodedString();
        while (input.isCont() && (c = input.head(), Uri.isParamChar(c) || c === 61/*'='*/)) {
          input = input.step();
          valueOutput.write(c);
        }
        if (input.isCont() && c === 38/*'&'*/) {
          input = input.step();
          builder = builder || new UriQueryBuilder();
          builder.addParam(keyOutput!.bind(), valueOutput.bind());
          keyOutput = void 0;
          valueOutput = void 0;
          step = 1;
          continue;
        } else if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 5;
        } else if (!input.isEmpty()) {
          builder = builder || new UriQueryBuilder();
          builder.addParam(keyOutput!.bind(), valueOutput.bind());
          return Parser.done(builder.build());
        }
      }
      if (step === 5) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          c1 = c;
          step = 6;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 6) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          valueOutput!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 4;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    return new UriQueryParser(builder, keyOutput, valueOutput, c1, step);
  }
}
