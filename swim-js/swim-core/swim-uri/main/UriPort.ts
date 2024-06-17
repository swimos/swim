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
import {Format} from "@swim/codec";
import {Base10} from "@swim/codec";
import {Unicode} from "@swim/codec";

/** @public */
export type UriPortLike = UriPort | number | string;

/** @public */
export const UriPortLike = {
  [Symbol.hasInstance](instance: unknown): instance is UriPortLike {
    return instance instanceof UriPort
        || typeof instance === "number"
        || typeof instance === "string";
  },
};

/** @public */
export class UriPort implements HashCode, Compare, Debug, Display {
  /** @internal */
  constructor(portNumber: number) {
    this.number = portNumber;
  }

  likeType?(like: number | string): void;

  isDefined(): boolean {
    return this.number !== 0;
  }

  readonly number!: number;

  valueOf(): number {
    return this.number;
  }

  toLike(): number {
    return this.number;
  }

  /** @override */
  compareTo(that: unknown): number {
    if (that instanceof UriPort) {
      return this.number < that.number ? -1 : this.number > that.number ? 1 : 0;
    }
    return NaN;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriPort) {
      return this.number === that.number;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Strings.hash(this.toString());
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriPort").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("create").write(40/*'('*/);
      output = Format.displayNumber(output, this.number);
    } else {
      output = output.write("undefined").write(40/*'('*/);
    }
    output = output.write(41/*')'*/);
    return output;
  }

  /** @override */
  display<T>(output: Output<T>): Output<T> {
    output = Format.displayNumber(output, this.number);
    return output;
  }

  /** @override */
  toString(): string {
    return "" + this.number;
  }

  @Lazy
  static undefined(): UriPort {
    return new UriPort(0);
  }

  static create(number: number): UriPort {
    if (number < 0) {
      throw new TypeError("" + number);
    } else if (number === 0) {
      return UriPort.undefined();
    }
    return new UriPort(number);
  }

  static fromLike<T extends UriPortLike | null | undefined>(value: T): UriPort | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof UriPort) {
      return value as UriPort | Uninitable<T>;
    } else if (typeof value === "number") {
      return UriPort.create(value);
    } else if (typeof value === "string") {
      return UriPort.parse(value);
    }
    throw new TypeError("" + value);
  }

  static parse(input: Input): Parser<UriPort>;
  static parse(string: string): UriPort;
  static parse(string: Input | string): Parser<UriPort> | UriPort {
    const input = typeof string === "string" ? Unicode.stringInput(string) : string;
    let parser = UriPortParser.parse(input);
    if (typeof string === "string" && input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return typeof string === "string" ? parser.bind() : parser;
  }
}

/** @internal */
export class UriPortParser extends Parser<UriPort> {
  private readonly number: number | undefined;

  constructor(number?: number) {
    super();
    this.number = number;
  }

  override feed(input: Input): Parser<UriPort> {
    return UriPortParser.parse(input, this.number);
  }

  static parse(input: Input, number: number = 0): Parser<UriPort> {
    let c = 0;
    while (input.isCont() && (c = input.head(), Base10.isDigit(c))) {
      input = input.step();
      number = 10 * number + Base10.decodeDigit(c);
    }
    if (!input.isEmpty()) {
      return Parser.done(UriPort.create(number));
    }
    return new UriPortParser(number);
  }
}
