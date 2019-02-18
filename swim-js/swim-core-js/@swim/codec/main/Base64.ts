// Copyright 2015-2019 SWIM.AI inc.
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
import {Base64Parser} from "./Base64Parser";
import {Base64Writer} from "./Base64Writer";

/**
 * Base-64 (7-bit ASCII) encoding [[Parser]]/[[Writer]] factory.
 */
export abstract class Base64 {
  /** @hidden */
  constructor() {
    // stub
  }

  /**
   * Returns a 64 character string, where the character at index `i` is the
   * encoding of the base-64 digit `i`.
   */
  abstract alphabet(): string;

  /**
   * Returns `true` if this base-64 encoding requires padding.
   */
  abstract isPadded(): boolean;

  /**
   * Returns this `Base64` encoding with required padding, if `isPadded` is
   * `true`.
   */
  abstract isPadded(isPadded: boolean): Base64;

  /**
   * Returns `true` if the Unicode code point `c` is a valid base-64 digit.
   */
  abstract isDigit(c: number): boolean;

  /**
   * Returns the 7-bit quantity represented by the base-64 digit `c`.
   *
   * @throws `Error` if `c` is not a valid base-64 digit.
   */
  public decodeDigit(c: number): number {
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
    return this.alphabet().charCodeAt(b);
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
    return new Base64.Parser<O>(output, this);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded `input`, and writes the decoded
   * bytes to `output`, returning a `Parser` continuation that knows how to
   * parse any additional input.
   */
  parse<O>(input: Input, output: Output<O>): Parser<O> {
    return Base64.Parser.parse(input, output, this);
  }

  /**
   * Parses the base-64 (7-bit ASCII) encoded `input`, and writes the decoded
   * bytes to a growable array, returning a `Parser` continuation that knows
   * how to parse any additional input.  The returned `Parser` [[Parser.bind
   * binds]] a `Uint8Array` array containing all parsed base-64 data.
   */
  parseUint8Array(input: Input): Parser<Uint8Array> {
    return Base64.Parser.parse(input, Binary.uint8ArrayOutput(), this);
  }

  /**
   * Returns a `Writer` that, when fed an input `Uint8Array`, returns a
   * continuation that writes the base-64 (7-bit ASCII) encoding of the input
   * `Uint8Array`.
   */
  uint8ArrayWriter(): Writer<Uint8Array, unknown>;
  /**
   * Returns a {@code Writer} continuation that writes the base-64 (7-bit ASCII)
   * encoding of the {@code input} byte array.
   */
  uint8ArrayWriter(input: Uint8Array): Writer<unknown, Uint8Array>;
  uint8ArrayWriter(input?: Uint8Array): Writer<unknown, unknown> {
    if (input === void 0) {
      return new Base64.Writer(void 0, void 0, this);
    } else {
      return new Base64.Writer(input, input, this);
    }
  }

  /**
   * Writes the base-64 (7-bit ASCII) encoding of the `input` `Uint8Array` to
   * the `output`, returning a `Writer` continuation that knows how to write any
   * remaining output that couldn't be immediately generated.
   */
  writeUint8Array(input: Uint8Array, output: Output): Writer<unknown, unknown> {
    return Base64.Writer.write(output, void 0, input, this);
  }

  private static _standard?: Base64;
  private static _standardUnpadded?: Base64;
  private static _url?: Base64;
  private static _urlUnpadded?: Base64;

  /**
   * Returns the `Base64` encoding with the standard alphabet, and required
   * padding, if `isPadding` is `true`.
   */
  static standard(isPadded: boolean = true): Base64 {
    if (isPadded) {
      if (!Base64._standard) {
        Base64._standard = new Base64Standard(true);
      }
      return Base64._standard;
    } else {
      if (!Base64._standardUnpadded) {
        Base64._standardUnpadded = new Base64Standard(true);
      }
      return Base64._standardUnpadded;
    }
  }

  /**
   * Returns the `Base64` encoding with the url and filename safe alphabet,
   * and required padding, if `isPadded` is `true`.
   */
  static url(isPadded: boolean = true): Base64 {
    if (isPadded) {
      if (!Base64._url) {
        Base64._url = new Base64Url(true);
      }
      return Base64._url;
    } else {
      if (!Base64._urlUnpadded) {
        Base64._urlUnpadded = new Base64Url(false);
      }
      return Base64._urlUnpadded;
    }
  }

  // Forward type declarations
  /** @hidden */
  static Parser: typeof Base64Parser; // defined by Base64Parser
  /** @hidden */
  static Writer: typeof Base64Writer; // defined by Base64Writer
}

/** @hidden */
class Base64Standard extends Base64 {
  /** @hidden */
  readonly _isPadded: boolean;

  constructor(isPadded: boolean) {
    super();
    this._isPadded = isPadded;
  }

  alphabet(): string {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  }

  isPadded(): boolean;
  isPadded(isPadded: boolean): Base64;
  isPadded(isPadded?: boolean): boolean | Base64 {
    if (isPadded === void 0) {
      return this._isPadded;
    } else {
      if (isPadded === this._isPadded) {
        return this;
      } else {
        return Base64.standard(isPadded);
      }
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
  readonly _isPadded: boolean;

  constructor(isPadded: boolean) {
    super();
    this._isPadded = isPadded;
  }

  alphabet(): string {
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  }

  isPadded(): boolean;
  isPadded(isPadded: boolean): Base64;
  isPadded(isPadded?: boolean): boolean | Base64 {
    if (isPadded === void 0) {
      return this._isPadded;
    } else {
      if (isPadded === this._isPadded) {
        return this;
      } else {
        return Base64.url(isPadded);
      }
    }
  }

  isDigit(c: number): boolean {
    return c >= 48/*'0'*/ && c <= 57/*'9'*/
        || c >= 65/*'A'*/ && c <= 90/*'Z'*/
        || c >= 97/*'a'*/ && c <= 122/*'z'*/
        || c === 45/*'-'*/ || c === 95/*'_'*/;
  }
}
