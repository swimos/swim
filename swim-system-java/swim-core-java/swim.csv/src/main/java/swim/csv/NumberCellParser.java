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

package swim.csv;

import java.math.BigInteger;
import swim.codec.Base16;
import swim.codec.Diagnostic;
import swim.codec.Input;
import swim.codec.Parser;
import swim.structure.Item;
import swim.structure.Num;
import swim.util.Builder;

final class NumberCellParser extends Parser<Num> {
  final NumberCol col;
  final Builder<Item, ?> rowBuilder;
  final int sign;
  final long value;
  final int mode;
  final int step;

  NumberCellParser(NumberCol col, Builder<Item, ?> rowBuilder,
                   int sign, long value, int mode, int step) {
    this.col = col;
    this.rowBuilder = rowBuilder;
    this.sign = sign;
    this.value = value;
    this.mode = mode;
    this.step = step;
  }

  NumberCellParser(NumberCol col, Builder<Item, ?> rowBuilder) {
    this(col, rowBuilder, 1, 0L, 2, 1);
  }

  @Override
  public Parser<Num> feed(Input input) {
    return parse(input, this.col, this.rowBuilder, this.sign, this.value, this.mode, this.step);
  }

  static Parser<Num> parse(Input input, NumberCol col, Builder<Item, ?> rowBuilder,
                          int sign, long value, int mode, int step) {
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
        col.addCell(null, rowBuilder);
        return done();
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
            return BigIntegerCellParser.parse(input, col, rowBuilder, sign, BigInteger.valueOf(value));
          }
        } else {
          break;
        }
      }
      if (input.isCont()) {
        step = 4;
      } else if (input.isDone()) {
        final Num num = Num.from(value);
        col.addCell(num, rowBuilder);
        return done(num);
      }
    }
    if (step == 4) {
      if (input.isCont()) {
        c = input.head();
        if (mode > 0 && c == '.' || mode > 1 && (c == 'E' || c == 'e')) {
          return DecimalCellParser.parse(input, col, rowBuilder, sign, value, mode);
        } else if (c == 'x' && sign > 0 && value == 0L) {
          input = input.step();
          return HexadecimalCellParser.parse(input, col, rowBuilder);
        } else {
          final Num num = Num.from(value);
          col.addCell(num, rowBuilder);
          return done(num);
        }
      } else if (input.isDone()) {
        final Num num = Num.from(value);
        col.addCell(num, rowBuilder);
        return done(num);
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new NumberCellParser(col, rowBuilder, sign, value, mode, step);
  }

  static Parser<Num> parse(Input input, NumberCol col, Builder<Item, ?> rowBuilder) {
    return parse(input, col, rowBuilder, 1, 0L, 2, 1);
  }

  static Parser<Num> parseDecimal(Input input, NumberCol col, Builder<Item, ?> rowBuilder) {
    return parse(input, col, rowBuilder, 1, 0L, 1, 1);
  }

  static Parser<Num> parseInteger(Input input, NumberCol col, Builder<Item, ?> rowBuilder) {
    return parse(input, col, rowBuilder, 1, 0L, 0, 1);
  }
}

final class BigIntegerCellParser extends Parser<Num> {
  final NumberCol col;
  final Builder<Item, ?> rowBuilder;
  final int sign;
  final BigInteger value;

  BigIntegerCellParser(NumberCol col, Builder<Item, ?> rowBuilder,
                       int sign, BigInteger value) {
    this.col = col;
    this.rowBuilder = rowBuilder;
    this.sign = sign;
    this.value = value;
  }

  @Override
  public Parser<Num> feed(Input input) {
    return parse(input, this.col, this.rowBuilder, this.sign, this.value);
  }

  static Parser<Num> parse(Input input, NumberCol col, Builder<Item, ?> rowBuilder,
                           int sign, BigInteger value) {
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
      final Num num = Num.from(value);
      col.addCell(num, rowBuilder);
      return done(num);
    }
    return new BigIntegerCellParser(col, rowBuilder, sign, value);
  }
}

final class DecimalCellParser extends Parser<Num> {
  final NumberCol col;
  final Builder<Item, ?> rowBuilder;
  final StringBuilder builder;
  final int mode;
  final int step;

  DecimalCellParser(NumberCol col, Builder<Item, ?> rowBuilder,
                    StringBuilder builder, int mode, int step) {
    this.col = col;
    this.rowBuilder = rowBuilder;
    this.builder = builder;
    this.mode = mode;
    this.step = step;
  }

  @Override
  public Parser<Num> feed(Input input) {
    return parse(input, this.col, this.rowBuilder, this.builder, this.mode, this.step);
  }

  static Parser<Num> parse(Input input, NumberCol col, Builder<Item, ?> rowBuilder,
                           StringBuilder builder, int mode, int step) {
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
          final Num num = Num.from(builder.toString());
          col.addCell(num, rowBuilder);
          return done(num);
        }
      } else if (input.isDone()) {
        final Num num = Num.from(builder.toString());
        col.addCell(num, rowBuilder);
        return done(num);
      }
    }
    if (step == 4) {
      c = input.head();
      if (c == 'E' || c == 'e') {
        input = input.step();
        builder.appendCodePoint(c);
        step = 5;
      } else {
        final Num num = Num.from(builder.toString());
        col.addCell(num, rowBuilder);
        return done(num);
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
        final Num num = Num.from(builder.toString());
        col.addCell(num, rowBuilder);
        return done(num);
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new DecimalCellParser(col, rowBuilder, builder, mode, step);
  }

  static Parser<Num> parse(Input input, NumberCol col, Builder<Item, ?> rowBuilder,
                           int sign, long value, int mode) {
    final StringBuilder builder = new StringBuilder();
    if (sign < 0 && value == 0L) {
      builder.append('-').append('0');
    } else {
      builder.append(value);
    }
    return parse(input, col, rowBuilder, builder, mode, 1);
  }
}

final class HexadecimalCellParser extends Parser<Num> {
  final NumberCol col;
  final Builder<Item, ?> rowBuilder;
  final long value;
  final int size;

  HexadecimalCellParser(NumberCol col, Builder<Item, ?> rowBuilder,
                        long value, int size) {
    this.col = col;
    this.rowBuilder = rowBuilder;
    this.value = value;
    this.size = size;
  }

  @Override
  public Parser<Num> feed(Input input) {
    return parse(input, this.col, this.rowBuilder, this.value, this.size);
  }

  static Parser<Num> parse(Input input, NumberCol col, Builder<Item, ?> rowBuilder,
                           long value, int size) {
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
          final Num num = Num.uint32((int) value);
          col.addCell(num, rowBuilder);
          return done(num);
        } else {
          final Num num = Num.uint64(value);
          col.addCell(num, rowBuilder);
          return done(num);
        }
      } else {
        return error(Diagnostic.expected("hex digit", input));
      }
    }
    if (input.isError()) {
      return error(input.trap());
    }
    return new HexadecimalCellParser(col, rowBuilder, value, size);
  }

  static Parser<Num> parse(Input input, NumberCol col, Builder<Item, ?> rowBuilder) {
    return parse(input, col, rowBuilder, 0L, 0);
  }
}
