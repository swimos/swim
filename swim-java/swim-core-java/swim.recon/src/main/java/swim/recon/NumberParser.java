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

package swim.recon;

import java.math.BigInteger;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;

final class NumberParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final int sign;
  final long value;
  final int mode;
  final int step;

  NumberParser(ReconParser<I, V> recon, int sign, long value, int mode, int step) {
    this.recon = recon;
    this.sign = sign;
    this.value = value;
    this.mode = mode;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.sign, this.value, this.mode, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, int sign,
                                long value, int mode, int step) {
    int c = 0;
    if (step == 1) {
      while (input.isCont()) {
        c = input.head();
        if (Recon.isWhitespace(c)) {
          input = input.step();
        } else {
          break;
        }
      }
      if (input.isCont()) {
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
            return BigIntegerParser.parse(input, recon, sign, BigInteger.valueOf(value));
          }
        } else {
          break;
        }
      }
      if (input.isCont()) {
        step = 4;
      } else if (input.isDone()) {
        return done(recon.num(value));
      }
    }
    if (step == 4) {
      if (input.isCont()) {
        c = input.head();
        if (mode > 0 && c == '.' || mode > 1 && (c == 'E' || c == 'e')) {
          return DecimalParser.parse(input, recon, sign, value, mode);
        } else if (c == 'x' && sign > 0 && value == 0L) {
          input = input.step();
          return HexadecimalParser.parse(input, recon);
        } else {
          return done(recon.num(value));
        }
      } else if (input.isDone()) {
        return done(recon.num(value));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new NumberParser<I, V>(recon, sign, value, mode, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon) {
    return parse(input, recon, 1, 0L, 2, 1);
  }

  static <I, V> Parser<V> parseDecimal(Input input, ReconParser<I, V> recon) {
    return parse(input, recon, 1, 0L, 1, 1);
  }

  static <I, V> Parser<V> parseInteger(Input input, ReconParser<I, V> recon) {
    return parse(input, recon, 1, 0L, 0, 1);
  }
}

final class BigIntegerParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final int sign;
  final BigInteger value;

  BigIntegerParser(ReconParser<I, V> recon, int sign, BigInteger value) {
    this.recon = recon;
    this.sign = sign;
    this.value = value;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.sign, this.value);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, int sign, BigInteger value) {
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
      return done(recon.num(value));
    }
    return new BigIntegerParser<I, V>(recon, sign, value);
  }
}

final class DecimalParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final StringBuilder builder;
  final int mode;
  final int step;

  DecimalParser(ReconParser<I, V> recon, StringBuilder builder, int mode, int step) {
    this.recon = recon;
    this.builder = builder;
    this.mode = mode;
    this.step = step;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.builder, this.mode, this.step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, StringBuilder builder,
                                int mode, int step) {
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
          return done(recon.num(builder.toString()));
        }
      } else if (input.isDone()) {
        return done(recon.num(builder.toString()));
      }
    }
    if (step == 4) {
      c = input.head();
      if (c == 'E' || c == 'e') {
        input = input.step();
        builder.appendCodePoint(c);
        step = 5;
      } else {
        return done(recon.num(builder.toString()));
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
        return done(recon.num(builder.toString()));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new DecimalParser<I, V>(recon, builder, mode, step);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, int sign,
                                long value, int mode) {
    final StringBuilder builder = new StringBuilder();
    if (sign < 0 && value == 0L) {
      builder.append('-').append('0');
    } else {
      builder.append(value);
    }
    return parse(input, recon, builder, mode, 1);
  }
}

final class HexadecimalParser<I, V> extends Parser<V> {
  final ReconParser<I, V> recon;
  final long value;
  final int size;

  HexadecimalParser(ReconParser<I, V> recon, long value, int size) {
    this.recon = recon;
    this.value = value;
    this.size = size;
  }

  @Override
  public Parser<V> feed(Input input) {
    return parse(input, this.recon, this.value, this.size);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon, long value, int size) {
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
          return done(recon.uint32((int) value));
        } else {
          return done(recon.uint64(value));
        }
      } else {
        return error(Diagnostic.expected("hex digit", input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HexadecimalParser<I, V>(recon, value, size);
  }

  static <I, V> Parser<V> parse(Input input, ReconParser<I, V> recon) {
    return parse(input, recon, 0L, 0);
  }
}
