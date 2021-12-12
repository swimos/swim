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
import {Output} from "../output/Output";
import type {Parser} from "../parser/Parser";
import type {Writer} from "../writer/Writer";
import {Format} from "../format/Format";
import {Binary} from "../binary/Binary";
import {Unicode} from "../unicode/Unicode";
import {Base64Parser} from "../"; // forward import
import {Base64Writer} from "../"; // forward import

/**
 * Base-64 (7-bit ASCII) encoding [[Parser]]/[[Writer]] factory.
 * @public
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
      let message = Unicode.stringOutput();
      message = message.write("Invalid base-64 digit: ");
      message = Format.debugChar(message, c);
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
   *
   * @returns the continuation of the `output`.
   */
  writeQuantum<T>(output: Output<T>, c1: number, c2: number, c3: number, c4: number): Output<T> {
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
        return Output.error(new Error("Improperly padded base-64"));
      }
      output = output.write((x << 2) | (y >>> 4));
    }
    return output;
  }

  /**
   * Returns a `Parser` that decodes base-64 (7-bit ASCII) encoded input, and
   * writes the decoded bytes to `output`.
   */
  parser<O>(output: Output<O>): Parser<O> {
    return new Base64Parser<O>(this, output);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded `input`, and writes the decoded
   * bytes to `output`, returning a `Parser` continuation that knows how to
   * parse any additional input.
   */
  parse<O>(input: Input, output: Output<O>): Parser<O> {
    return Base64Parser.parse(input, this, output);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded `input`, and writes the decoded
   * bytes to a growable array, returning a `Parser` continuation that knows
   * how to parse any additional input. The returned `Parser` [[Parser.bind
   * binds]] a `Uint8Array` array containing all parsed base-64 data.
   */
  parseUint8Array(input: Input): Parser<Uint8Array> {
    return Base64Parser.parse(input, this, Binary.output());
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
      return new Base64Writer(this, void 0, null);
    } else {
      return new Base64Writer(this, input, input);
    }
  }

  /**
   * Writes the base-64 (7-bit ASCII) encoding of the `input` `Uint8Array` to
   * the `output`, returning a `Writer` continuation that knows how to write
   * any remaining output that couldn't be immediately generated.
   */
  writeUint8Array(output: Output, input: Uint8Array): Writer {
    return Base64Writer.write(output, this, void 0, input);
  }

  /** @internal */
  @Lazy
  static get standardPadded(): Base64 {
    return new Base64Standard(true);
  }

  /** @internal */
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

  /** @internal */
  @Lazy
  static get urlPadded(): Base64 {
    return new Base64Url(true);
  }

  /** @internal */
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

/** @internal */
class Base64Standard extends Base64 {
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

  /** @internal */
  readonly padded!: boolean;

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

/** @internal */
class Base64Url extends Base64 {
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

  /** @internal */
  readonly padded!: boolean;

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
