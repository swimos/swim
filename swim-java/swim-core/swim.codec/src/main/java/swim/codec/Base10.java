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

package swim.codec;

import java.math.BigDecimal;
import java.math.BigInteger;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Assume;
import swim.util.Notation;

/**
 * Base-10 (decimal) {@link Parse}/{@link Write} factory.
 */
@Public
@Since("5.0")
public final class Base10 {

  private Base10() {
    // static
  }

  public static Parse<Integer> parseInt(Input input) {
    return ParseInt.parse(input, 1, 0, 1);
  }

  public static Parse<Integer> parseInt() {
    return new ParseInt(1, 0, 1);
  }

  public static Parse<Long> parseLong(Input input) {
    return ParseLong.parse(input, 1, 0L, 1);
  }

  public static Parse<Long> parseLong() {
    return new ParseLong(1, 0L, 1);
  }

  public static Parse<Number> parseNumber(Input input) {
    return ParseNumber.parse(input, null, 1, 0L, 0, 1);
  }

  public static Parse<Number> parseNumber() {
    return new ParseNumber(null, 1, 0L, 0, 1);
  }

  /**
   * Writes the decimal encoding of the {@code input} value to the
   * {@code output}.
   */
  public static Write<?> writeInt(Output<?> output, int input) {
    return WriteLong.write(output, (long) input, 0, 1);
  }

  /**
   * Returns a {@code Write} continuation that writes the decimal
   * encoding of the {@code input} value.
   */
  public static Write<?> writeInt(int input) {
    return new WriteLong((long) input, 0, 1);
  }

  /**
   * Writes the decimal encoding of the {@code input} value to the
   * {@code output}.
   */
  public static Write<?> writeLong(Output<?> output, long input) {
    return WriteLong.write(output, input, 0, 1);
  }

  /**
   * Returns a {@code Write} continuation that writes the decimal
   * encoding of the {@code input} value.
   */
  public static Write<?> writeLong(long input) {
    return new WriteLong(input, 0, 1);
  }

  /**
   * Writes decimal encoding of the {@code input} value to the
   * {@code output}.
   */
  public static Write<?> writeFloat(Output<?> output, float input) {
    return Text.write(output, Float.toString(input));
  }

  /**
   * Returns a {@code Write} continuation that writes the decimal
   * encoding of the {@code input} value.
   */
  public static Write<?> writeFloat(float input) {
    return Text.write(Float.toString(input));
  }

  /**
   * Writes the decimal encoding of the {@code input} value to the
   * {@code output}.
   */
  public static Write<?> writeDouble(Output<?> output, double input) {
    return Text.write(output, Double.toString(input));
  }

  /**
   * Returns a {@code Write} continuation that writes the decimal
   * encoding of the {@code input} value.
   */
  public static Write<?> writeDouble(double input) {
    return Text.write(Double.toString(input));
  }

  /**
   * Returns {@code true} if the Unicode code point {@code c} is a valid
   * decimal digit.
   */
  public static boolean isDigit(int c) {
    return c >= '0' && c <= '9';
  }

  /**
   * Returns the decimal quantity between {@code 0} (inclusive) and {@code 10}
   * (exclusive) represented by the decimal digit {@code c}.
   *
   * @throws IllegalArgumentException if {@code c} is not a valid decimal digit.
   */
  public static int decodeDigit(int c) {
    if (c >= '0' && c <= '9') {
      return c - '0';
    } else {
      throw new IllegalArgumentException(Notation.of("invalid decimal digit: ")
                                                 .appendSourceCodePoint(c)
                                                 .toString());
    }
  }

  /**
   * Returns the Unicode code point of the decimal digit that encodes the given
   * decimal quantity between {@code 0} (inclusive) and {@code 10} (exclusive).
   */
  public static char encodeDigit(int b) {
    if (b >= 0 && b <= 9) {
      return (char) ('0' + b);
    } else {
      throw new IllegalArgumentException("invalid binary-coded decimal: " + Integer.toString(b));
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

}

final class ParseInt extends Parse<Integer> {

  final int sign;
  final int value;
  final int step;

  ParseInt(int sign, int value, int step) {
    this.sign = sign;
    this.value = value;
    this.step = step;
  }

  @Override
  public Parse<Integer> consume(Input input) {
    return ParseInt.parse(input, this.sign, this.value, this.step);
  }

  static Parse<Integer> parse(Input input, int sign, int value, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && ((c = input.head()) == '-' || (c >= '0' && c <= '9'))) {
        if (c == '-') {
          sign = -1;
          input.step();
        }
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("number", input));
      }
    }
    if (step == 2) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        if (c == '0') {
          input.step();
          return Parse.done(value);
        } else { // c >= '1' && c <= '9'
          input.step();
          value = sign * (c - '0');
          step = 3;
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 3) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        final int newValue = 10 * value + sign * (c - '0');
        if (newValue / value >= 10) {
          value = newValue;
          input.step();
        } else {
          return Parse.error(Diagnostic.message("int overflow", input));
        }
      }
      if (input.isReady()) {
        return Parse.done(value);
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseInt(sign, value, step);
  }

}

final class ParseLong extends Parse<Long> {

  final int sign;
  final long value;
  final int step;

  ParseLong(int sign, long value, int step) {
    this.sign = sign;
    this.value = value;
    this.step = step;
  }

  @Override
  public Parse<Long> consume(Input input) {
    return ParseLong.parse(input, this.sign, this.value, this.step);
  }

  @SuppressWarnings("NarrowCalculation")
  static Parse<Long> parse(Input input, int sign, long value, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && ((c = input.head()) == '-' || (c >= '0' && c <= '9'))) {
        if (c == '-') {
          sign = -1;
          input.step();
        }
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("number", input));
      }
    }
    if (step == 2) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        if (c == '0') {
          input.step();
          return Parse.done(value);
        } else { // c >= '1' && c <= '9'
          value = (long) (sign * (c - '0'));
          input.step();
          step = 3;
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 3) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        final long newValue = 10L * value + (long) (sign * (c - '0'));
        if (newValue / value >= 10L) {
          value = newValue;
          input.step();
        } else {
          return Parse.error(Diagnostic.message("long overflow", input));
        }
      }
      if (input.isReady()) {
        return Parse.done(value);
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseLong(sign, value, step);
  }

}

final class ParseNumber extends Parse<Number> {

  final @Nullable StringBuilder builder;
  final int sign;
  final long value;
  final int digits;
  final int step;

  ParseNumber(@Nullable StringBuilder builder, int sign, long value,
              int digits, int step) {
    this.builder = builder;
    this.sign = sign;
    this.value = value;
    this.digits = digits;
    this.step = step;
  }

  @Override
  public Parse<Number> consume(Input input) {
    return ParseNumber.parse(input, this.builder, this.sign, this.value,
                             this.digits, this.step);
  }

  @SuppressWarnings("NarrowCalculation")
  static Parse<Number> parse(Input input, @Nullable StringBuilder builder,
                             int sign, long value, int digits, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont() && ((c = input.head()) == '-' || (c >= '0' && c <= '9'))) {
        if (c == '-') {
          sign = -1;
          input.step();
        }
        step = 2;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("number", input));
      }
    }
    if (step == 2) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        if (c == '0') {
          input.step();
          step = 5;
        } else { // c >= '1' && c <= '9'
          value = (long) (sign * (c - '0'));
          input.step();
          step = 3;
        }
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 3) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        final long newValue = 10L * value + (long) (sign * (c - '0'));
        if (newValue / value >= 10L) {
          value = newValue;
          input.step();
        } else {
          builder = new StringBuilder();
          builder.append(value);
          break;
        }
      }
      if (input.isCont()) {
        if (c >= '0' && c <= '9') {
          step = 4;
        } else {
          step = 5;
        }
      } else if (input.isDone()) {
        if (value == (long) (int) value) {
          return Parse.done(Integer.valueOf((int) value));
        } else {
          return Parse.done(Long.valueOf(value));
        }
      }
    }
    if (step == 4) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && (c == '.' || c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        if (c == '.') {
          step = 6;
        } else { // c == 'E' || c == 'e'
          step = 8;
        }
      } else if (input.isReady()) {
        return Parse.done(new BigInteger(Assume.nonNull(builder).toString()));
      }
    }
    if (step == 5) {
      if (input.isCont() && ((c = input.head()) == '.' || c == 'E' || c == 'e')) {
        builder = new StringBuilder();
        if (sign < 0 && value == 0L) {
          builder.append('-').append('0');
        } else {
          builder.append(value);
        }
        builder.appendCodePoint(c);
        input.step();
        if (c == '.') {
          step = 6;
        } else { // c == 'E' || c == 'e'
          step = 8;
        }
      } else if (input.isReady()) {
        if (value == (long) (int) value) {
          return Parse.done(Integer.valueOf((int) value));
        } else {
          return Parse.done(Long.valueOf(value));
        }
      }
    }
    if (step == 6) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 7;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 7) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isCont() && (c == 'E' || c == 'e')) {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 8;
      } else if (input.isReady()) {
        try {
          return Parse.done(Double.valueOf(Double.parseDouble(Assume.nonNull(builder).toString())));
        } catch (NumberFormatException cause) {
          return Parse.done(new BigDecimal(Assume.nonNull(builder).toString()));
        }
      }
    }
    if (step == 8) {
      if (input.isCont()) {
        if ((c = input.head()) == '+' || c == '-') {
          Assume.nonNull(builder).appendCodePoint(c);
          input.step();
        }
        step = 9;
      } else if (input.isDone()) {
        return Parse.error(Diagnostic.unexpected(input));
      }
    }
    if (step == 9) {
      if (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
        step = 10;
      } else if (input.isReady()) {
        return Parse.error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 10) {
      while (input.isCont() && (c = input.head()) >= '0' && c <= '9') {
        Assume.nonNull(builder).appendCodePoint(c);
        input.step();
      }
      if (input.isReady()) {
        try {
          return Parse.done(Double.valueOf(Double.parseDouble(Assume.nonNull(builder).toString())));
        } catch (NumberFormatException cause) {
          return Parse.done(new BigDecimal(Assume.nonNull(builder).toString()));
        }
      }
    }
    if (input.isError()) {
      return Parse.error(input.getError());
    }
    return new ParseNumber(builder, sign, value, digits, step);
  }

}

final class WriteLong extends Write<Object> {

  final long input;
  final int index;
  final int step;

  WriteLong(long input, int index, int step) {
    this.input = input;
    this.index = index;
    this.step = step;
  }

  @Override
  public Write<Object> produce(Output<?> output) {
    return WriteLong.write(output, this.input, this.index, this.step);
  }

  static Write<Object> write(Output<?> output, long input, int index, int step) {
    if (step == 1) {
      if (input >= 0L) {
        step = 2;
      } else if (output.isCont()) {
        output.write('-');
        step = 2;
      }
    }
    if (step == 2 && output.isCont()) {
      if (-10L < input && input < 10L) {
        output.write(Base10.encodeDigit(Math.abs((int) input)));
        return Write.done();
      } else {
        final int[] digits = new int[19];
        long x = input;
        int i = 18;
        while (x != 0L) {
          digits[i] = Math.abs((int) (x % 10L));
          x /= 10L;
          i -= 1;
        }
        i += 1 + index;
        while (i < 19 && output.isCont()) {
          output.write(Base10.encodeDigit(digits[i]));
          index += 1;
          i += 1;
        }
        if (i == 19) {
          return Write.done();
        }
      }
    }
    if (output.isDone()) {
      return Write.error(new WriteException("truncated write"));
    } else if (output.isError()) {
      return Write.error(output.getError());
    }
    return new WriteLong(input, index, step);
  }

}
