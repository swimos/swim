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
import {Diagnostic} from "@swim/codec";
import type {Input} from "@swim/codec";
import type {Output} from "@swim/codec";
import {Parser} from "@swim/codec";
import type {Debug} from "@swim/codec";
import type {Display} from "@swim/codec";
import {Format} from "@swim/codec";
import {Base16} from "@swim/codec";
import {Unicode} from "@swim/codec";
import {Uri} from "./Uri";
import {Utf8} from "@swim/codec";

/** @public */
export type UriFragmentLike = UriFragment | string;

/** @public */
export const UriFragmentLike = {
  [Symbol.hasInstance](instance: unknown): instance is UriFragmentLike {
    return instance instanceof UriFragment
        || typeof instance === "string";
  },
};

/** @public */
export class UriFragment implements HashCode, Compare, Debug, Display {
  /** @internal */
  constructor(identifier: string | undefined) {
    this.identifier = identifier;
    this.stringValue = void 0;
  }

  likeType?(like: string): void;

  isDefined(): boolean {
    return this.identifier !== void 0;
  }

  readonly identifier: string | undefined;

  toLike(): string | undefined {
    return this.identifier;
  }

  /** @override */
  compareTo(that: UriFragment): number {
    if (that instanceof UriFragment) {
      return this.toString().localeCompare(that.toString());
    }
    return NaN;
  }

  /** @override */
  equals(that: unknown): boolean {
    if (this === that) {
      return true;
    } else if (that instanceof UriFragment) {
      return this.identifier === that.identifier;
    }
    return false;
  }

  /** @override */
  hashCode(): number {
    return Strings.hash(this.identifier);
  }

  /** @override */
  debug<T>(output: Output<T>): Output<T> {
    output = output.write("UriFragment").write(46/*'.'*/);
    if (this.isDefined()) {
      output = output.write("parse").write(40/*'('*/).write(34/*'"'*/)
                     .display(this).write(34/*'"'*/).write(41/*')'*/);
    } else {
      output = output.write("undefined").write(40/*'('*/).write(41/*')'*/);
    }
    return output;
  }

  /** @override */
  display<T>(output: Output<T>): Output<T> {
    const stringValue = this.stringValue;
    if (stringValue !== void 0) {
      output = output.write(stringValue);
    } else if (this.identifier !== void 0) {
      output = Uri.writeFragment(output, this.identifier);
    }
    return output;
  }

  /** @internal */
  readonly stringValue: string | undefined;

  /** @override */
  toString(): string {
    let stringValue = this.stringValue;
    if (stringValue === void 0) {
      stringValue = Format.display(this);
      (this as Mutable<this>).stringValue = stringValue;
    }
    return stringValue;
  }

  @Lazy
  static undefined(): UriFragment {
    return new UriFragment(void 0);
  }

  static create(identifier: string | undefined): UriFragment {
    if (identifier === void 0) {
      return UriFragment.undefined();
    }
    return new UriFragment(identifier);
  }

  static fromLike<T extends UriFragmentLike | null | undefined>(value: T): UriFragment | Uninitable<T> {
    if (value === void 0 || value === null || value instanceof UriFragment) {
      return value as UriFragment | Uninitable<T>;
    } else if (typeof value === "string") {
      return UriFragment.parse(value);
    }
    throw new TypeError("" + value);
  }

  static parse(input: Input): Parser<UriFragment>;
  static parse(string: string): UriFragment;
  static parse(string: Input | string): Parser<UriFragment> | UriFragment {
    const input = typeof string === "string" ? Unicode.stringInput(string) : string;
    let parser = UriFragmentParser.parse(input);
    if (typeof string === "string" && input.isCont() && !parser.isError()) {
      parser = Parser.error(Diagnostic.unexpected(input));
    }
    return typeof string === "string" ? parser.bind() : parser;
  }
}

/** @internal */
export class UriFragmentParser extends Parser<UriFragment> {
  private readonly output: Output<string> | undefined;
  private readonly c1: number | undefined;
  private readonly step: number | undefined;

  constructor(output?: Output<string>, c1?: number, step?: number) {
    super();
    this.output = output;
    this.c1 = c1;
    this.step = step;
  }

  override feed(input: Input): Parser<UriFragment> {
    return UriFragmentParser.parse(input, this.output, this.c1, this.step);
  }

  static parse(input: Input, output?: Output<string>,
               c1: number = 0, step: number = 1): Parser<UriFragment> {
    let c = 0;
    output = output || Utf8.decodedString();
    do {
      if (step === 1) {
        while (input.isCont() && (c = input.head(), Uri.isFragmentChar(c))) {
          input = input.step();
          output = output.write(c);
        }
        if (input.isCont() && c === 37/*'%'*/) {
          input = input.step();
          step = 2;
        } else if (!input.isEmpty()) {
          return Parser.done(UriFragment.create(output.bind()));
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
    return new UriFragmentParser(output, c1, step);
  }
}
