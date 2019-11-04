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

package swim.codec;

/**
 * Base-10 (decimal) encoding {@link Parser}/{@link Writer} factory.
 */
public final class Base10 {
  private Base10() {
    // nop
  }

  /**
   * Returns {@code true} if the Unicode code point {@code c} is a valid
   * base-10 digit.
   */
  public static boolean isDigit(int c) {
    return c >= '0' && c <= '9';
  }

  /**
   * Returns the decimal quantity between {@code 0} (inclusive) and {@code 10}
   * (exclusive) represented by the base-10 digit {@code c}.
   *
   * @throws IllegalArgumentException if {@code c} is not a valid base-10 digit.
   */
  public static int decodeDigit(int c) {
    if (c >= '0' && c <= '9') {
      return c - '0';
    } else {
      final Output<String> message = Unicode.stringOutput();
      message.write("Invalid base-10 digit: ");
      Format.debugChar(c, message);
      throw new IllegalArgumentException(message.bind());
    }
  }

  /**
   * Returns the Unicode code point of the base-10 digit that encodes the given
   * decimal quantity between {@code 0} (inclusive) and {@code 10} (exclusive).
   */
  public static int encodeDigit(int b) {
    if (b >= 0 && b <= 9) {
      return '0' + b;
    } else {
      throw new IllegalArgumentException(Integer.toString(b));
    }
  }

  /**
   * Returns the number of decimal digits in the given absolute {@code value}.
   */
  public static int countDigits(int value) {
    int size = 0;
    do {
      size += 1;
      value /= 10;
    } while (value != 0);
    return size;
  }

  /**
   * Returns the number of decimal digits in the given absolute {@code value}.
   */
  public static int countDigits(long value) {
    int size = 0;
    do {
      size += 1;
      value /= 10L;
    } while (value != 0L);
    return size;
  }

  public static Parser<Number> parseNumber(Input input) {
    return NumberParser.parseNumber(input);
  }

  public static Parser<Number> parseDecimal(Input input) {
    return NumberParser.parseDecimal(input);
  }

  public static Parser<Number> parseInteger(Input input) {
    return NumberParser.parseInteger(input);
  }

  public static Parser<Number> numberParser() {
    return NumberParser.numberParser();
  }

  public static Parser<Number> decimalParser() {
    return NumberParser.decimalParser();
  }

  public static Parser<Number> integerParser() {
    return NumberParser.integerParser();
  }

  /**
   * Returns a {@code Writer} that, when fed an input {@code Integer} value,
   * returns a continuation that writes the base-10 (decimal) encoding of the
   * input value.
   */
  @SuppressWarnings("unchecked")
  public static Writer<Integer, ?> intWriter() {
    return (Writer<Integer, ?>) (Writer<?, ?>) new Base10IntegerWriter();
  }

  /**
   * Returns a {@code Writer} continuation that writes the base-10 (decimal)
   * encoding of the {@code input} value.
   */
  @SuppressWarnings("unchecked")
  public static Writer<?, Integer> intWriter(int input) {
    return (Writer<?, Integer>) (Writer<?, ?>) new Base10IntegerWriter(null, (long) input);
  }

  /**
   * Returns a {@code Writer} that, when fed an input {@code Long} value,
   * returns a continuation that writes the base-10 (decimal) encoding of the
   * input value.
   */
  @SuppressWarnings("unchecked")
  public static Writer<Long, ?> longWriter() {
    return (Writer<Long, ?>) (Writer<?, ?>) new Base10IntegerWriter();
  }

  /**
   * Returns a {@code Writer} continuation that writes the base-10 (decimal)
   * encoding of the {@code input} value.
   */
  @SuppressWarnings("unchecked")
  public static Writer<?, Long> longWriter(long input) {
    return (Writer<?, Long>) (Writer<?, ?>) new Base10IntegerWriter(null, input);
  }

  /**
   * Returns a {@code Writer} continuation that writes the base-10 (decimal)
   * encoding of the {@code input} value.
   */
  @SuppressWarnings("unchecked")
  public static Writer<?, Float> floatWriter(long input) {
    return (Writer<?, Float>) (Writer<?, ?>) new StringWriter(null, input);
  }

  /**
   * Returns a {@code Writer} continuation that writes the base-10 (decimal)
   * encoding of the {@code input} value.
   */
  @SuppressWarnings("unchecked")
  public static Writer<?, Double> doubleWriter(long input) {
    return (Writer<?, Double>) (Writer<?, ?>) new StringWriter(null, input);
  }

  /**
   * Writes the base-10 (decimal) encoding of the {@code input} value to the
   * {@code output}, returning a {@code Writer} continuation that knows
   * how to write any remaining output that couldn't be immediately generated.
   */
  public static Writer<?, ?> writeInt(int input, Output<?> output) {
    return Base10IntegerWriter.write(output, null, (long) input);
  }

  /**
   * Writes the base-10 (decimal) encoding of the {@code input} value to the
   * {@code output}, returning a {@code Writer} continuation that knows
   * how to write any remaining output that couldn't be immediately generated.
   */
  public static Writer<?, ?> writeLong(long input, Output<?> output) {
    return Base10IntegerWriter.write(output, null, input);
  }

  /**
   * Writes the base-10 (decimal) encoding of the {@code input} value to the
   * {@code output}, returning a {@code Writer} continuation that knows
   * how to write any remaining output that couldn't be immediately generated.
   */
  public static Writer<?, ?> writeFloat(float input, Output<?> output) {
    return StringWriter.write(output, null, input);
  }

  /**
   * Writes the base-10 (decimal) encoding of the {@code input} value to the
   * {@code output}, returning a {@code Writer} continuation that knows
   * how to write any remaining output that couldn't be immediately generated.
   */
  public static Writer<?, ?> writeDouble(double input, Output<?> output) {
    return StringWriter.write(output, null, input);
  }
}
