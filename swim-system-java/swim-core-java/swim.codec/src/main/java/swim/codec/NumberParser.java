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

import java.math.BigDecimal;
import java.math.BigInteger;

final class NumberParser extends Parser<Number> {
  final int sign;
  final long value;
  final int mode;
  final int step;

  NumberParser(int sign, long value, int mode, int step) {
    this.sign = sign;
    this.value = value;
    this.mode = mode;
    this.step = step;
  }

  @Override
  public Parser<Number> feed(Input input) {
    return parse(input, this.sign, this.value, this.mode, this.step);
  }

  static Parser<Number> parse(Input input, int sign, long value, int mode, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == '-') {
          input = input.step();
          sign = -1;
        }
        step = 2;
      } else if (input.isDone()) {
        return error(Diagnostic.expected("number", input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (c == '0') {
          input = input.step();
          step = 4;
        } else if (c >= '1' && c <= '9') {
          input = input.step();
          value = sign * (c - '0');
          step = 3;
        } else {
          return error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 3) {
      while (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          final long newValue = 10 * value + sign * (c - '0');
          if (value >> 63 == newValue >> 63) {
            value = newValue;
            input = input.step();
          } else {
            return BigIntegerParser.parse(input, sign, BigInteger.valueOf(value));
          }
        } else {
          break;
        }
      }
      if (input.isCont()) {
        step = 4;
      } else if (input.isDone()) {
        return done(valueOf(value));
      }
    }
    if (step == 4) {
      if (input.isCont()) {
        c = input.head();
        if (mode > 0 && c == '.' || mode > 1 && (c == 'E' || c == 'e')) {
          return DecimalParser.parse(input, sign, value, mode);
        } else if (c == 'x' && sign > 0 && value == 0L) {
          input = input.step();
          return HexadecimalParser.parse(input);
        } else {
          return done(value);
        }
      } else if (input.isDone()) {
        return done(value);
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new NumberParser(sign, value, mode, step);
  }

  static Parser<Number> parseNumber(Input input) {
    return parse(input, 1, 0L, 2, 1);
  }

  static Parser<Number> parseDecimal(Input input) {
    return parse(input, 1, 0L, 1, 1);
  }

  static Parser<Number> parseInteger(Input input) {
    return parse(input, 1, 0L, 0, 1);
  }

  static Parser<Number> numberParser() {
    return new NumberParser(1, 0L, 2, 1);
  }

  static Parser<Number> decimalParser() {
    return new NumberParser(1, 0L, 1, 1);
  }

  static Parser<Number> integerParser() {
    return new NumberParser(1, 0L, 0, 1);
  }

  public static Number valueOf(long value) {
    if ((long) (int) value == value) {
      return Integer.valueOf((int) value);
    } else {
      return Long.valueOf(value);
    }
  }

  public static Number valueOf(String value) {
    try {
      final long longValue = Long.parseLong(value);
      if ((long) (int) longValue == longValue) {
        return Integer.valueOf((int) longValue);
      } else {
        return Long.valueOf(longValue);
      }
    } catch (NumberFormatException e1) {
      try {
        final double doubleValue = Double.parseDouble(value);
        if ((double) (float) doubleValue == doubleValue) {
          return Float.valueOf((float) doubleValue);
        } else {
          return Double.valueOf(doubleValue);
        }
      } catch (NumberFormatException e2) {
        return new BigDecimal(value);
      }
    }
  }
}

final class BigIntegerParser extends Parser<Number> {
  final int sign;
  final BigInteger value;

  BigIntegerParser(int sign, BigInteger value) {
    this.sign = sign;
    this.value = value;
  }

  @Override
  public Parser<Number> feed(Input input) {
    return parse(input, this.sign, this.value);
  }

  static Parser<Number> parse(Input input, int sign, BigInteger value) {
    while (input.isCont()) {
      final int c = input.head();
      if (c >= '0' && c <= '9') {
        input = input.step();
        value = BigInteger.TEN.multiply(value).add(BigInteger.valueOf(sign * (c - '0')));
      } else {
        break;
      }
    }
    if (!input.isEmpty()) {
      return done(value);
    }
    return new BigIntegerParser(sign, value);
  }
}

final class DecimalParser extends Parser<Number> {
  final StringBuilder builder;
  final int mode;
  final int step;

  DecimalParser(StringBuilder builder, int mode, int step) {
    this.builder = builder;
    this.mode = mode;
    this.step = step;
  }

  @Override
  public Parser<Number> feed(Input input) {
    return parse(input, this.builder, this.mode, this.step);
  }

  static Parser<Number> parse(Input input, StringBuilder builder, int mode, int step) {
    int c = 0;
    if (step == 1) {
      if (input.isCont()) {
        c = input.head();
        if (c == '.') {
          input = input.step();
          builder.appendCodePoint(c);
          step = 2;
        } else if (mode > 1 && (c == 'E' || c == 'e')) {
          input = input.step();
          builder.appendCodePoint(c);
          step = 5;
        } else {
          return error(Diagnostic.expected("decimal or exponent", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("decimal or exponent", input));
      }
    }
    if (step == 2) {
      if (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          input = input.step();
          builder.appendCodePoint(c);
          step = 3;
        } else {
          return error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 3) {
      while (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          input = input.step();
          builder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (input.isCont()) {
        if (mode > 1) {
          step = 4;
        } else {
          final String value = builder.toString();
          return done(NumberParser.valueOf(builder.toString()));
        }
      } else if (input.isDone()) {
        return done(NumberParser.valueOf(builder.toString()));
      }
    }
    if (step == 4) {
      c = input.head();
      if (c == 'E' || c == 'e') {
        input = input.step();
        builder.appendCodePoint(c);
        step = 5;
      } else {
        return done(NumberParser.valueOf(builder.toString()));
      }
    }
    if (step == 5) {
      if (input.isCont()) {
        c = input.head();
        if (c == '+' || c == '-') {
          input = input.step();
          builder.appendCodePoint(c);
        }
        step = 6;
      } else if (input.isDone()) {
        return error(Diagnostic.unexpected(input));
      }
    }
    if (step == 6) {
      if (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          input = input.step();
          builder.appendCodePoint(c);
          step = 7;
        } else {
          return error(Diagnostic.expected("digit", input));
        }
      } else if (input.isDone()) {
        return error(Diagnostic.expected("digit", input));
      }
    }
    if (step == 7) {
      while (input.isCont()) {
        c = input.head();
        if (c >= '0' && c <= '9') {
          input = input.step();
          builder.appendCodePoint(c);
        } else {
          break;
        }
      }
      if (!input.isEmpty()) {
        return done(NumberParser.valueOf(builder.toString()));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new DecimalParser(builder, mode, step);
  }

  static Parser<Number> parse(Input input, int sign, long value, int mode) {
    final StringBuilder builder = new StringBuilder();
    if (sign < 0 && value == 0L) {
      builder.append('-').append('0');
    } else {
      builder.append(value);
    }
    return parse(input, builder, mode, 1);
  }
}

final class HexadecimalParser extends Parser<Number> {
  final long value;
  final int size;

  HexadecimalParser(long value, int size) {
    this.value = value;
    this.size = size;
  }

  @Override
  public Parser<Number> feed(Input input) {
    return parse(input, this.value, this.size);
  }

  static Parser<Number> parse(Input input, long value, int size) {
    int c = 0;
    while (input.isCont()) {
      c = input.head();
      if (Base16.isDigit(c)) {
        input = input.step();
        value = (value << 4) | Base16.decodeDigit(c);
        size += 1;
      } else {
        break;
      }
    }
    if (!input.isEmpty()) {
      if (size > 0) {
        if (size <= 8) {
          return done(Integer.valueOf((int) value));
        } else {
          return done(Long.valueOf(value));
        }
      } else {
        return error(Diagnostic.expected("hex digit", input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HexadecimalParser(value, size);
  }

  static Parser<Number> parse(Input input) {
    return parse(input, 0L, 0);
  }
}
