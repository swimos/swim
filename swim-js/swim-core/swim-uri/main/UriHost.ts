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
import {Lazy} from "@swim/util";
import type {HashCode} from "@swim/util";
import type {Compare} from "@swim/util";
import {Strings} from "@swim/util";
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import type {Display} from "@swim/codec";
import {Base10} from "@swim/codec";
import {Base16} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Utf8} from "@swim/codec";
import {Uri} from "./Uri";

/** @public */
export type UriHostLike = UriHost | string;

/** @public */
export const UriHostLike = {
  [Symbol.hasInstance](instance: unknown): instance is UriHostLike {
    return instance instanceof UriHost
        || typeof instance === "string";
  },
};

/** @public */
export abstract class UriHost implements HashCode, Compare, Debug, Display {
  protected constructor() {
    // nop
  }

  likeType?(like: string): void;

  isDefined(): boolean {
    return true;
  }

  abstract readonly address: string;

  get name(): string | undefined {
    return void 0;
  }

  get ipv4(): string | undefined {
    return void 0;
  }

  get ipv6(): string | undefined {
    return void 0;
  }

  toLike(): string {
    return this.toString();
  }

  /** @override */
  compareTo(that: unknown): number {
    if (that instanceof UriHost) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriHost) {
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
  abstract display<T>(output: Output<T>): Output<T>;

  /** @override */
  abstract toString(): string;

  @Lazy
  static undefined(): UriHost {
    return new UriHostUndefined();
  }

  static hostname(name: string): UriHost {
    return new UriHostName(name);
  }

  static ipv4(ipv4: string): UriHost {
    return new UriHostIPv4(ipv4);
  }

  static ipv6(ipv6: string): UriHost {
    return new UriHostIPv6(ipv6);
  }

  static fromLike<T extends UriHostLike | null | undefined>(value: T): UriHost | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof UriHost) {
      return value as UriHost | Uninitable<T>;
    } else if (typeof value === "string") {
      return UriHost.parse(value);
    }
    throw new TypeError("" + value);
  }

  static parse(input: Input): Parser<UriHost>;
  static parse(string: string): UriHost;
  static parse(string: Input | string): Parser<UriHost> | UriHost {
    const input = typeof string === "string" ? Unicode.stringInput(string) : string;
    let parser = UriHostParser.parse(input);
    if (typeof string === "string" && input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return typeof string === "string" ? parser.bind() : parser;
  }
}

/** @internal */
export class UriHostUndefined extends UriHost {
  /** @internal */
  constructor() {
    super();
  }

  override isDefined(): boolean {
    return false;
  }

  override get address(): string {
    return "";
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriHost").write(46/*'.'*/).write("undefined")
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
export class UriHostName extends UriHost {
  /** @internal */
  constructor(address: string) {
    super();
    this.address = address;
  }

  override readonly address: string;

  override get name(): string {
    return this.address;
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriHost").write(46/*'.'*/).write("hostname")
                   .write(40/*'('*/).debug(this.address).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    output = Uri.writeHost(output, this.address);
    return output;
  }

  override toString(): string {
    return this.address;
  }
}

/** @internal */
export class UriHostIPv4 extends UriHost {
  /** @internal */
  constructor(address: string) {
    super();
    this.address = address;
  }

  override readonly address: string;

  override get ipv4(): string {
    return this.address;
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriHost").write(46/*'.'*/).write("ipv4")
                   .write(40/*'('*/).debug(this.address).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    output = Uri.writeHost(output, this.address);
    return output;
  }

  override toString(): string {
    return this.address;
  }
}

/** @internal */
export class UriHostIPv6 extends UriHost {
  /** @internal */
  constructor(address: string) {
    super();
    this.address = address;
  }

  override readonly address: string;

  override get ipv6(): string {
    return this.address;
  }

  override debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriHost").write(46/*'.'*/).write("ipv6")
                   .write(40/*'('*/).debug(this.address).write(41/*')'*/);
    return output;
  }

  override display<T>(output: Output<T>): Output<T> {
    output = output.write(91/*'['*/);
    output = Uri.writeHostLiteral(output, this.address);
    output = output.write(93/*']'*/);
    return output;
  }

  override toString(): string {
    return "[" + this.address + "]";
  }
}

/** @internal */
export class UriHostParser extends Parser<UriHost> {
  override feed(input: Input): Parser<UriHost> {
    return UriHostParser.parse(input);
  }

  static parse(input: Input): Parser<UriHost> {
    if (input.isCont()) {
      const c = input.head();
      if (c === 91/*'['*/) {
        return UriHostLiteralParser.parse(input);
      } else {
        return UriHostAddressParser.parse(input);
      }
    } else if (input.isDone()) {
      return Parser.done(UriHost.hostname(""));
    }
    return new UriHostParser();
  }
}

/** @internal */
export class UriHostAddressParser extends Parser<UriHost> {
  private readonly output: Output<string> | undefined;
  private readonly c1: number | undefined;
  private readonly x: number | undefined;
  private readonly step: number | undefined;

  constructor(output?: Output<string>, c1?: number, x?: number, step?: number) {
    super();
    this.output = output;
    this.c1 = c1;
    this.x = x;
    this.step = step;
  }

  override feed(input: Input): Parser<UriHost> {
    return UriHostAddressParser.parse(input, this.output, this.c1, this.x, this.step);
  }

  static parse(input: Input, output?: Output<string>, c1: number = 0,
               x: number = 0, step: number = 1): Parser<UriHost> {
    let c = 0;
    output = output || Utf8.decodedString();
    while (step <= 4) {
      while (input.isCont() && (c = input.head(), Base10.isDigit(c))) {
        input = input.step();
        output = output.write(c);
        x = 10 * x + Base10.decodeDigit(c);
      }
      if (input.isCont()) {
        if (c === 46/*'.'*/ && step < 4 && x <= 255) {
          input = input.step();
          output = output.write(c);
          x = 0;
          step += 1;
        } else if (!Uri.isHostChar(c) && c !== 37/*'%'*/ && step === 4 && x <= 255) {
          return Parser.done(UriHost.ipv4(output.bind()));
        } else {
          x = 0;
          step = 5;
          break;
        }
      } else if (!input.isEmpty()) {
        if (step === 4 && x <= 255) {
          return Parser.done(UriHost.ipv4(output.bind()));
        } else {
          return Parser.done(UriHost.hostname(output.bind()));
        }
      } else {
        break;
      }
    }
    do {
      if (step === 5) {
        while (input.isCont() && (c = input.head(), Uri.isHostChar(c))) {
          input = input.step();
          output!.write(Uri.toLowerCase(c));
        }
        if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 6;
        } else if (!input.isEmpty()) {
          return Parser.done(UriHost.hostname(output!.bind()));
        }
      }
      if (step === 6) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          c1 = c;
          step = 7;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      if (step === 7) {
        if (input.isCont() && (c = input.head(), Base16.isDigit(c))) {
          input = input.step();
          output!.write((Base16.decodeDigit(c1) << 4) | Base16.decodeDigit(c));
          c1 = 0;
          step = 5;
          continue;
        } else if (!input.isEmpty()) {
          return Parser.error(Diagnostic.expected("hex digit", input));
        }
      }
      break;
    } while (true);
    return new UriHostAddressParser(output, c1, x, step);
  }
}

/** @internal */
export class UriHostLiteralParser extends Parser<UriHost> {
  private readonly output: Output<string> | undefined;
  private readonly step: number | undefined;

  constructor(output?: Output<string>, step?: number) {
    super();
    this.output = output;
    this.step = step;
  }

  override feed(input: Input): Parser<UriHost> {
    return UriHostLiteralParser.parse(input, this.output, this.step);
  }

  static parse(input: Input, output?: Output<string>, step: number = 1): Parser<UriHost> {
    let c = 0;
    if (step === 1) {
      if (input.isCont() && input.head() === 91/*'['*/) {
        input = input.step();
        step = 2;
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(91/*'['*/, input));
      }
    }
    if (step === 2) {
      output = output || Utf8.decodedString();
      while (input.isCont() && (c = input.head(), Uri.isHostChar(c) || c === 58/*':'*/)) {
        input = input.step();
        output = output.write(Uri.toLowerCase(c));
      }
      if (input.isCont() && c === 93/*']'*/) {
        input = input.step();
        return Parser.done(UriHost.ipv6(output.bind()));
      } else if (!input.isEmpty()) {
        return Parser.error(Diagnostic.expected(93/*']'*/, input));
      }
    }
    return new UriHostLiteralParser(output, step);
  }
}
