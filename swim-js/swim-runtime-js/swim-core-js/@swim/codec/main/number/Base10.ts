// Copyright 2015-2021 Swim Inc.
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

import type {Input} from "../input/Input";
import type {Output} from "../output/Output";
import type {Parser} from "../parser/Parser";
import type {Writer} from "../writer/Writer";
import {Format} from "../format/Format";
import {Unicode} from "../unicode/Unicode";
import {Base10NumberParser} from "../"; // forward import
import {Base10IntegerWriter} from "../"; // forward import

/**
 * Base-10 (decimal) encoding [[Parser]]/[[Writer]] factory.
 */
export const Base10 = {} as {
  /**
   * Returns `true` if the Unicode code point `c` is a valid base-10 digit.
   */
  isDigit(c: number): boolean;

  /**
   * Returns the decimal quantity between `0` (inclusive) and `10` (exclusive)
   * represented by the base-10 digit `c`.
   *
   * @throws `Error` if `c` is not a valid base-10 digit.
   */
  decodeDigit(c: number): number;

  /**
   * Returns the Unicode code point of the base-10 digit that encodes the given
   * decimal quantity between `0` (inclusive) and `10` (exclusive).
   */
  encodeDigit(b: number): number;

  /**
   * Returns the number of whole decimal digits in the given absolute `value`.
   */
  countDigits(value: number): number;

  integerParser(): Parser<number>;

  parseInteger(input: Input): Parser<number>;

  decimalParser(): Parser<number>;

  parseDecimal(input: Input): Parser<number>;

  numberParser(): Parser<number>;

  parseNumber(input: Input): Parser<number>;

  /**
   * Returns a `Writer` that, when fed an input `number` value, returns a
   * continuation that writes the base-10 (decimal) encoding of the input value.
   */
  integerWriter(): Writer<number, unknown>;

  /**
   * Returns a `Writer` continuation that writes the base-10 (decimal) encoding
   * of the `input` value.
   */
  integerWriter(input: number): Writer<unknown, number>;

  /**
   * Writes the base-10 (decimal) encoding of the `input` value to the `output`,
   * returning a `Writer` continuation that knows how to write any remaining
   * output that couldn't be immediately generated.
   */
  writeInteger(output: Output, input: number): Writer;
};

Base10.isDigit = function (c: number): boolean {
  return c >= 48/*'0'*/ && c <= 57/*'9'*/;
};

Base10.decodeDigit = function (c: number): number {
  if (c >= 48/*'0'*/ && c <= 57/*'9'*/) {
    return c - 48/*'0'*/;
  } else {
    let message = Unicode.stringOutput();
    message = message.write("Invalid base-10 digit: ");
    message = Format.debugChar(message, c);
    throw new Error(message.bind());
  }
};

Base10.encodeDigit = function (b: number): number {
  if (b >= 0 && b <= 9) {
    return 48/*'0'*/ + b;
  } else {
    throw new Error("" + b);
  }
};

Base10.countDigits = function (value: number): number {
  let size = 0;
  do {
    size += 1;
    value = (value / 10) | 0;
  } while (value !== 0);
  return size;
};

Base10.integerParser = function (): Parser<number> {
  return new Base10NumberParser(void 0, void 0, 0);
};

Base10.parseInteger = function (input: Input): Parser<number> {
  return Base10NumberParser.parse(input, void 0, void 0, 0);
};

Base10.decimalParser = function (): Parser<number> {
  return new Base10NumberParser(void 0, void 0, 1);
};

Base10.parseDecimal = function (input: Input): Parser<number> {
  return Base10NumberParser.parse(input, void 0, void 0, 1);
};

Base10.numberParser = function (): Parser<number> {
  return new Base10NumberParser();
};

Base10.parseNumber = function (input: Input): Parser<number> {
  return Base10NumberParser.parse(input);
};

Base10.integerWriter = function (input?: number): Writer {
  if (input === void 0) {
    return new Base10IntegerWriter(void 0, 0);
  } else {
    return new Base10IntegerWriter(void 0, input);
  }
} as typeof Base10.integerWriter;

Base10.writeInteger = function (output: Output, input: number): Writer {
  return Base10IntegerWriter.write(output, void 0, input);
};
