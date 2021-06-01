// Copyright 2015-2021 Swim inc.
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
import {Base64Parser} from "../"; // forward import
import {Base64Writer} from "../"; // forward import

/**
 * Base-64 (7-bit ASCII) encoding [[Parser]]/[[Writer]] factory.
 */
export abstract class Base64 {
  /**
   * The 64 character string, where the character at index `i` is the encoding
   * of the base-64 digit `i`.
   */
  abstract readonly alphabet: string;

  /**
   * Returns `true` if this base-64 encoding requires padding.
   */
  abstract isPadded(): boolean;

  /**
   * Returns this `Base64` encoding with required padding, if `padded` is `true`.
   */
  abstract asPadded(padded: boolean): Base64;

  /**
   * Returns `true` if the Unicode code point `c` is a valid base-64 digit.
   */
  abstract isDigit(c: number): boolean;

  /**
   * Returns the 7-bit quantity represented by the base-64 digit `c`.
   *
   * @throws `Error` if `c` is not a valid base-64 digit.
   */
  decodeDigit(c: number): number {
    if (c >= 65/*'A'*/ && c <= 90/*'Z'*/) {
      return c - 65/*'A'*/;
    } else if (c >= 97/*'a'*/ && c <= 122/*'z'*/) {
      return c + (26 - 97/*'a'*/);
    } else if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
      return c + (52 - 48/*'0'*/);
    } else if (c === 43/*'+'*/ || c === 45/*'-'*/) {
      return 62;
    } else if (c === 47/*'/'*/ || c === 95/*'_'*/) {
      return 63;
    } else {
      const message = Unicode.stringOutput();
      message.write("Invalid base-64 digit: ");
      Format.debugChar(c, message);
      throw new Error(message.bind());
    }
  }

  /**
   * Returns the Unicode code point of the base-64 digit that encodes the given
   * 7-bit quantity.
   */
  encodeDigit(b: number): number {
    return this.alphabet.charCodeAt(b);
  }

  /**
   * Decodes the base-64 digits `c1`, `c2`, `c3`, and `c4`, and writes the 8 to
   * 24 bit quantity they represent to the given `output`.
   */
  writeQuantum(c1: number, c2: number, c3: number, c4: number, output: Output): void {
    const x = this.decodeDigit(c1);
    const y = this.decodeDigit(c2);
    if (c3 !== 61/*'='*/) {
      const z = this.decodeDigit(c3);
      if (c4 !== 61/*'='*/) {
        const w = this.decodeDigit(c4);
        output = output.write((x << 2) | (y >>> 4));
        output = output.write((y << 4) | (z >>> 2));
        output = output.write((z << 6) | w);
      } else {
        output = output.write((x << 2) | (y >>> 4));
        output = output.write((y << 4) | (z >>> 2));
      }
    } else {
      if (c4 !== 61/*'='*/) {
        throw new Error("Improperly padded base-64");
      }
      output = output.write((x << 2) | (y >>> 4));
    }
  }

  /**
   * Returns a `Parser` that decodes base-64 (7-bit ASCII) encoded input, and
   * writes the decoded bytes to `output`.
   */
  parser<O>(output: Output<O>): Parser<O> {
    return new Base64Parser<O>(output, this);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded `input`, and writes the decoded
   * bytes to `output`, returning a `Parser` continuation that knows how to
   * parse any additional input.
   */
  parse<O>(input: Input, output: Output<O>): Parser<O> {
    return Base64Parser.parse(input, output, this);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded `input`, and writes the decoded
   * bytes to a growable array, returning a `Parser` continuation that knows
   * how to parse any additional input.  The returned `Parser` [[Parser.bind
   * binds]] a `Uint8Array` array containing all parsed base-64 data.
   */
  parseUint8Array(input: Input): Parser<Uint8Array> {
    return Base64Parser.parse(input, Binary.output(), this);
  }

  /**
   * Returns a `Writer` that, when fed an input `Uint8Array`, returns a
   * continuation that writes the base-64 (7-bit ASCII) encoding of the input
   * `Uint8Array`.
   */
  uint8ArrayWriter(): Writer<Uint8Array, unknown>;
  /**
   * Returns a `Writer` continuation that writes the base-64 (7-bit ASCII)
   * encoding of the `input` byte array.
   */
  uint8ArrayWriter(input: Uint8Array): Writer<unknown, Uint8Array>;
  uint8ArrayWriter(input?: Uint8Array): Writer {
    if (input === void 0) {
      return new Base64Writer(void 0, null, this);
    } else {
      return new Base64Writer(input, input, this);
    }
  }

  /**
   * Writes the base-64 (7-bit ASCII) encoding of the `input` `Uint8Array` to
   * the `output`, returning a `Writer` continuation that knows how to write
   * any remaining output that couldn't be immediately generated.
   */
  writeUint8Array(input: Uint8Array, output: Output): Writer {
    return Base64Writer.write(output, void 0, input, this);
  }

  /** @hidden */
  @Lazy
  static get standardPadded(): Base64 {
    return new Base64Standard(true);
  }

  /** @hidden */
  @Lazy
  static get standardUnpadded(): Base64 {
    return new Base64Standard(false);
  }

  /**
   * Returns the `Base64` encoding with the standard alphabet, and required
   * padding, if `isPadding` is `true`.
   */
  static standard(padded: boolean = true): Base64 {
    if (padded) {
      return Base64.standardPadded;
    } else {
      return Base64.standardUnpadded;
    }
  }

  /** @hidden */
  @Lazy
  static get urlPadded(): Base64 {
    return new Base64Url(true);
  }

  /** @hidden */
  @Lazy
  static get urlUnpadded(): Base64 {
    return new Base64Url(false);
  }

  /**
   * Returns the `Base64` encoding with the url and filename safe alphabet,
   * and required padding, if `padded` is `true`.
   */
  static url(padded: boolean = true): Base64 {
    if (padded) {
      return Base64.urlPadded;
    } else {
      return Base64.urlUnpadded;
    }
  }
}

/** @hidden */
class Base64Standard extends Base64 {
  /** @hidden */
  readonly padded!: boolean;

  constructor(padded: boolean) {
    super();
    Object.defineProperty(this, "padded", {
      value: padded,
      enumerable: true,
    });
  }

  get alphabet(): string {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  }

  isPadded(): boolean {
    return this.padded;
  }

  asPadded(padded: boolean): Base64 {
    if (padded === this.padded) {
      return this;
    } else {
      return Base64.standard(padded);
    }
  }

  isDigit(c: number): boolean {
    return c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c === 43/*'+'*/ || c === 47/*'/'*/;
  }
}

/** @hidden */
class Base64Url extends Base64 {
  /** @hidden */
  readonly padded!: boolean;

  constructor(padded: boolean) {
    super();
    Object.defineProperty(this, "padded", {
      value: padded,
      enumerable: true,
    });
  }

  get alphabet(): string {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  }

  isPadded(): boolean {
    return this.padded;
  }

  asPadded(padded: boolean): Base64 {
    if (padded === this.padded) {
      return this;
    } else {
      return Base64.url(padded);
    }
  }

  isDigit(c: number): boolean {
    return c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c === 45/*'-'*/ || c === 95/*'_'*/;
  }
}
