// Copyright 2015-2021 Swim.inc
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

import {Lazy} from "@swim/util";
import type {Input} from "../input/Input";
import type {Output} from "../output/Output";
import type {Parser} from "../parser/Parser";
import type {Writer} from "../writer/Writer";
import {Format} from "../format/Format";
import {Binary} from "../binary/Binary";
import {Unicode} from "../unicode/Unicode";
import {Base16Parser} from "../"; // forward import
import {Base16Writer} from "../"; // forward import
import {Base16IntegerWriter} from "../"; // forward import

/**
 * Base-16 (hexadecimal) encoding [[Parser]]/[[Writer]] factory.
 * @public
 */
export class Base16 {
  constructor(alphabet: string) {
    Object.defineProperty(this, "alphabet", {
      value: alphabet,
      enumerable: true,
    });
  }

  /**
   * Returns a 16 character string, where the character at index `i` is the
   * encoding of the base-16 digit `i`.
   */
  readonly alphabet!: string;

  /**
   * Returns the Unicode code point of the base-16 digit that encodes the given
   * 4-bit quantity.
   */
  encodeDigit(b: number): number {
    return this.alphabet.charCodeAt(b);
  }

  /**
   * Returns a `Writer` that, when fed an input `Uint8Array`, returns a
   * continuation that writes the base-16 (hexadecimal) encoding of the input
   * byte array.
   */
  uint8ArrayWriter(): Writer<Uint8Array, unknown>;
  /**
   * Returns a `Writer` continuation that writes the base-16 (hexadecimal)
   * encoding of the `input` `Uint8Array`.
   */
  uint8ArrayWriter(input: Uint8Array): Writer<unknown, Uint8Array>;
  uint8ArrayWriter(input?: Uint8Array): Writer<unknown, unknown> {
    if (input === void 0) {
      return new Base16Writer(this, void 0, null);
    } else {
      return new Base16Writer(this, input, input);
    }
  }

  /**
   * Writes the base-16 (hexadecimal) encoding of the `input` `Uint8Array` to
   * the `output`, returning a `Writer` continuation that knows how to write any
   * remaining output that couldn't be immediately generated.
   */
  writeUint8Array(output: Output, input: Uint8Array): Writer<unknown, unknown> {
    return Base16Writer.write(output, this, void 0, input);
  }

  writeInteger(output: Output, input: number, width: number = 0): Writer<unknown, unknown> {
    return Base16IntegerWriter.write(output, this, void 0, input, width);
  }

  writeIntegerLiteral(output: Output, input: number, width: number = 0): Writer<unknown, unknown> {
    return Base16IntegerWriter.writeLiteral(output, this, void 0, input, width);
  }

  /**
   * Returns the `Base16` encoding with lowercase alphanumeric digits.
   */
  @Lazy
  static get lowercase(): Base16 {
    return new Base16("0123456789abcdef");
  }

  /**
   * Returns the `Base16` encoding with uppercase alphanumeric digits.
   */
  @Lazy
  static get uppercase(): Base16 {
    return new Base16("0123456789ABCDEF");
  }

  /**
   * Returns `true` if the Unicode code point `c` is a valid base-16 digit.
   */
  static isDigit(c: number): boolean {
    return c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c >= 65/*'A'*/ && c <= 70/*'F'*/
        || c >= 97/*'a'*/ && c <= 102/*'f'*/;
  }

  /**
   * Returns the 4-bit quantity represented by the base-16 digit `c`.
   *
   * @throws `Error` if `c` is not a valid base-16 digit.
   */
  static decodeDigit(c: number): number {
    if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
      return c - 48/*'0'*/;
    } else if (c >= 65/*'A'*/ && c <= 70/*'F'*/) {
      return 10 + (c - 65/*'A'*/);
    } else if (c >= 97/*'a'*/ && c <= 102/*'f'*/) {
      return 10 + (c - 97/*'a'*/);
    } else {
      let message = Unicode.stringOutput();
      message = message.write("Invalid base-16 digit: ");
      message = Format.debugChar(message, c);
      throw new Error(message.bind());
    }
  }

  /**
   * Decodes the base-16 digits `c1` and `c2`, and writes the 8-bit  quantity
   * they represent to the given `output`.
   *
   * @returns the continuation of the `output`.
   */
  static writeQuantum<T>(output: Output<T>, c1: number, c2: number): Output<T> {
    const x = Base16.decodeDigit(c1);
    const y = Base16.decodeDigit(c2);
    output = output.write(x << 4 | y);
    return output;
  }

  /**
   * Returns a `Parser` that decodes base-16 (hexadecimal) encoded input, and
   * writes the decoded bytes to `output`.
   */
  static parser<O>(output: Output<O>): Parser<O> {
    return new Base16Parser<O>(output);
  }

  /**
   * Parses the base-16 (hexadecimal) encoded `input`, and writes the decoded
   * bytes to `output`, returning a `Parser` continuation that knows how to
   * parse any additional input.
   */
  static parse<O>(input: Input, output: Output<O>): Parser<O> {
    return Base16Parser.parse(input, output);
  }

  /**
   * Parses the base-16 (hexadecimal) encoded `input`, and writes the decoded
   * bytes to a growable array, returning a `Parser` continuation that knows
   * how to parse any additional input. The returned `Parser` [[Parser.bind
   * binds]] a `Uint8Array` array containing all parsed base-16 data.
   */
  static parseUint8Array(input: Input): Parser<Uint8Array> {
    return Base16Parser.parse(input, Binary.output());
  }
}
