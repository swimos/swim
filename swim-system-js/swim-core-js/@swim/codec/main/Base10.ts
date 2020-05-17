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
import {Base10NumberParser} from "./Base10NumberParser";
import {Base10IntegerWriter} from "./Base10IntegerWriter";

/**
 * Base-10 (decimal) encoding [[Parser]]/[[Writer]] factory.
 */
export class Base10 {
  private constructor() {
    // nop
  }

  /**
   * Returns `true` if the Unicode code point `c` is a valid base-10 digit.
   */
  static isDigit(c: number): boolean {
    return c >= 48/*'0'*/ && c <= 57/*'9'*/;
  }

  /**
   * Returns the decimal quantity between `0` (inclusive) and `10` (exclusive)
   * represented by the base-10 digit `c`.
   *
   * @throws `Error` if `c` is not a valid base-10 digit.
   */
  static decodeDigit(c: number): number {
    if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
      return c - 48/*'0'*/;
    } else {
      const message = Unicode.stringOutput();
      message.write("Invalid base-10 digit: ");
      Format.debugChar(c, message);
      throw new Error(message.bind());
    }
  }

  /**
   * Returns the Unicode code point of the base-10 digit that encodes the given
   * decimal quantity between `0` (inclusive) and `10` (exclusive).
   */
  static encodeDigit(b: number): number {
    if (b >= 0 && b <= 9) {
      return 48/*'0'*/ + b;
    } else {
      throw new Error("" + b);
    }
  }

  /**
   * Returns the number of whole decimal digits in the given absolute `value`.
   */
  static countDigits(value: number): number {
    let size = 0;
    do {
      size += 1;
      value = (value / 10) | 0;
    } while (value !== 0);
    return size;
  }

  static integerParser(): Parser<number> {
    return new Base10.NumberParser(void 0, void 0, 0);
  }

  static parseInteger(input: Input): Parser<number> {
    return Base10.NumberParser.parse(input, void 0, void 0, 0);
  }

  static decimalParser(): Parser<number> {
    return new Base10.NumberParser(void 0, void 0, 1);
  }

  static parseDecimal(input: Input): Parser<number> {
    return Base10.NumberParser.parse(input, void 0, void 0, 1);
  }

  static numberParser(): Parser<number> {
    return new Base10.NumberParser();
  }

  static parseNumber(input: Input): Parser<number> {
    return Base10.NumberParser.parse(input);
  }

  /**
   * Returns a `Writer` that, when fed an input `number` value, returns a
   * continuation that writes the base-10 (decimal) encoding of the input value.
   */
  static integerWriter(): Writer<number, unknown>;
  /**
   * Returns a `Writer` continuation that writes the base-10 (decimal) encoding
   * of the `input` value.
   */
  static integerWriter(input: number): Writer<unknown, number>;
  static integerWriter(input?: number): Writer<unknown, unknown> {
    if (input === void 0) {
      return new Base10.IntegerWriter(void 0, 0);
    } else {
      return new Base10.IntegerWriter(void 0, input);
    }
  }

  /**
   * Writes the base-10 (decimal) encoding of the `input` value to the `output`,
   * returning a `Writer` continuation that knows how to write any remaining
   * output that couldn't be immediately generated.
   */
  static writeInteger(input: number, output: Output): Writer<unknown, unknown> {
    return Base10.IntegerWriter.write(output, void 0, input);
  }

  // Forward type declarations
  /** @hidden */
  static NumberParser: typeof Base10NumberParser; // defined by Base10NumberParser
  /** @hidden */
  static IntegerWriter: typeof Base10IntegerWriter; // defined by Base10IntegerWriter
}
