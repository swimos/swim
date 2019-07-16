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

final class Base16IntegerWriter extends Writer<Object, Object> {
  final Object value;
  final long input;
  final int width;
  final Base16 base16;
  final int index;
  final int step;

  Base16IntegerWriter(Object value, long input, int width, Base16 base16, int index, int step) {
    this.value = value;
    this.input = input;
    this.width = width;
    this.base16 = base16;
    this.index = index;
    this.step = step;
  }

  Base16IntegerWriter(Object value, int input, int width, Base16 base16, boolean literal) {
    this(value, input & 0xffffffffL, width, base16, 0, literal ? 1 : 3);
  }

  Base16IntegerWriter(Object value, long input, int width, Base16 base16, boolean literal) {
    this(value, input, width, base16, 0, literal ? 1 : 3);
  }

  Base16IntegerWriter(Object value, float input, int width, Base16 base16, boolean literal) {
    this(value, Float.floatToIntBits(input) & 0xffffffffL, width, base16, 0, literal ? 1 : 3);
  }

  Base16IntegerWriter(Object value, double input, int width, Base16 base16, boolean literal) {
    this(value, Double.doubleToLongBits(input), width, base16, 0, literal ? 1 : 3);
  }

  Base16IntegerWriter(int width, Base16 base16, boolean literal) {
    this(null, 0L, width, base16, 0, literal ? -1 : -3);
  }

  @Override
  public Writer<Object, Object> feed(Object input) {
    if (input instanceof Integer) {
      return new Base16IntegerWriter(input, (Integer) input, this.width, this.base16, this.step == -1);
    } else if (input instanceof Long) {
      return new Base16IntegerWriter(input, (Long) input, this.width, this.base16, this.step == -1);
    } else if (input instanceof Float) {
      return new Base16IntegerWriter(input, (Float) input, this.width, this.base16, this.step == -1);
    } else if (input instanceof Double) {
      return new Base16IntegerWriter(input, (Double) input, this.width, this.base16, this.step == -1);
    } else {
      return new StringWriter(input, input);
    }
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.value, this.input, this.width, this.base16, this.index, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, long input, int width,
                                      Base16 base16, int index, int step) {
    if (step <= 0) {
      return done();
    }
    if (step == 1 && output.isCont()) {
      output = output.write('0');
      step = 2;
    }
    if (step == 2 && output.isCont()) {
      output = output.write('x');
      step = 3;
    }
    if (step == 3) {
      if (input >= 0L && input < 16L && width <= 1) {
        if (output.isCont()) {
          output = output.write(base16.encodeDigit((int) input));
          return done(value);
        }
      } else {
        int i = 15;
        final int[] digits = new int[16];
        long x = input;
        while (x != 0L || i >= 16 - width) {
          digits[i] = (int) x & 0xf;
          x >>>= 4;
          i -= 1;
        }
        i += 1 + index;
        while (i < 16 && output.isCont()) {
          output = output.write(base16.encodeDigit(digits[i]));
          index += 1;
          i += 1;
        }
        if (i == 16) {
          return done(value);
        }
      }
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new Base16IntegerWriter(value, input, width, base16, index, step);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, int input,
                                      int width, Base16 base16, boolean literal) {
    return write(output, null, input & 0xffffffffL, width, base16, 0, literal ? 1 : 3);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, long input,
                                      int width, Base16 base16, boolean literal) {
    return write(output, null, input, width, base16, 0, literal ? 1 : 3);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, float input,
                                      int width, Base16 base16, boolean literal) {
    return write(output, null, Float.floatToIntBits(input) & 0xffffffffL, width, base16, 0, literal ? 1 : 3);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, double input,
                                      int width, Base16 base16, boolean literal) {
    return write(output, null, Double.doubleToLongBits(input), width, base16, 0, literal ? 1 : 3);
  }
}
