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

import {Input} from "./Input";
import {Output} from "./Output";
import {Parser} from "./Parser";
import {Writer} from "./Writer";
import {Format} from "./Format";
import {Unicode} from "./Unicode";
import {Binary} from "./Binary";
import {Base16Parser} from "./Base16Parser";
import {Base16Writer} from "./Base16Writer";
import {Base16IntegerWriter} from "./Base16IntegerWriter";

/**
 * Base-16 (hexadecimal) encoding [[Parser]]/[[Writer]] factory.
 */
export class Base16 {
  /** @hidden */
  readonly _alphabet: string;

  constructor(alphabet: string) {
    this._alphabet = alphabet;
  }

  /**
   * Returns a 16 character string, where the character at index `i` is the
   * encoding of the base-16 digit `i`.
   */
  alphabet(): string {
    return this._alphabet;
  }

  /**
   * Returns the Unicode code point of the base-16 digit that encodes the given
   * 4-bit quantity.
   */
  encodeDigit(b: number): number {
    return this._alphabet.charCodeAt(b);
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
      return new Base16.Writer(void 0, void 0, this);
    } else {
      return new Base16.Writer(input, input, this);
    }
  }

  /**
   * Writes the base-16 (hexadecimal) encoding of the `input` `Uint8Array` to
   * the `output`, returning a `Writer` continuation that knows how to write any
   * remaining output that couldn't be immediately generated.
   */
  writeUint8Array(input: Uint8Array, output: Output): Writer<unknown, unknown> {
    return Base16.Writer.write(output, void 0, input, this);
  }

  writeInteger(input: number, output: Output, width: number = 0): Writer<unknown, unknown> {
    return Base16.IntegerWriter.write(output, void 0, input, width, this);
  }

  writeIntegerLiteral(input: number, output: Output, width: number = 0): Writer<unknown, unknown> {
    return Base16.IntegerWriter.writeLiteral(output, void 0, input, width, this);
  }

  private static _lowercase?: Base16;
  private static _uppercase?: Base16;

  /**
   * Returns the `Base16` encoding with lowercase alphanumeric digits.
   */
  public static lowercase(): Base16 {
    if (Base16._lowercase === void 0) {
      Base16._lowercase = new Base16("0123456789abcdef");
    }
    return Base16._lowercase;
  }

  /**
   * Returns the `Base16` encoding with uppercase alphanumeric digits.
   */
  public static uppercase(): Base16 {
    if (Base16._uppercase === void 0) {
      Base16._uppercase = new Base16("0123456789ABCDEF");
    }
    return Base16._uppercase;
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
      const message = Unicode.stringOutput();
      message.write("Invalid base-16 digit: ");
      Format.debugChar(c, message);
      throw new Error(message.bind());
    }
  }

  /**
   * Decodes the base-16 digits `c1` and `c2`, and writes the 8-bit  quantity
   * they represent to the given `output`.
   */
  static writeQuantum(c1: number, c2: number, output: Output): void {
    const x = Base16.decodeDigit(c1);
    const y = Base16.decodeDigit(c2);
    output = output.write(x << 4 | y);
  }

  /**
   * Returns a `Parser` that decodes base-16 (hexadecimal) encoded input, and
   * writes the decoded bytes to `output`.
   */
  static parser<O>(output: Output<O>): Parser<O> {
    return new Base16.Parser<O>(output);
  }

  /**
   * Parses the base-16 (hexadecimal) encoded `input`, and writes the decoded
   * bytes to `output`, returning a `Parser` continuation that knows how to
   * parse any additional input.
   */
  static parse<O>(input: Input, output: Output<O>): Parser<O> {
    return Base16.Parser.parse(input, output);
  }

  /**
   * Parses the base-16 (hexadecimal) encoded `input`, and writes the decoded
   * bytes to a growable array, returning a `Parser` continuation that knows
   * how to parse any additional input.  The returned `Parser` [[Parser.bind
   * binds]] a `Uint8Array` array containing all parsed base-16 data.
   */
  static parseUint8Array(input: Input): Parser<Uint8Array> {
    return Base16.Parser.parse(input, Binary.uint8ArrayOutput());
  }

  // Forward type declarations
  /** @hidden */
  static Parser: typeof Base16Parser; // defined by Base16Parser
  /** @hidden */
  static Writer: typeof Base16Writer; // defined by Base16Writer
  /** @hidden */
  static IntegerWriter: typeof Base16IntegerWriter; // defined by Base16IntegerWriter
}
