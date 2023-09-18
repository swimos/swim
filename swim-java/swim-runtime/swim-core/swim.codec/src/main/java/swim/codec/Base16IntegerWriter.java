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

final class Base16IntegerWriter extends Writer<Object, Object> {

  final Base16 base16;
  final Object value;
  final long input;
  final int width;
  final int index;
  final int step;

  Base16IntegerWriter(Base16 base16, Object value, long input, int width, int index, int step) {
    this.base16 = base16;
    this.value = value;
    this.input = input;
    this.width = width;
    this.index = index;
    this.step = step;
  }

  Base16IntegerWriter(Base16 base16, Object value, int input, int width, boolean literal) {
    this(base16, value, input & 0xffffffffL, width, 0, literal ? 1 : 3);
  }

  Base16IntegerWriter(Base16 base16, Object value, long input, int width, boolean literal) {
    this(base16, value, input, width, 0, literal ? 1 : 3);
  }

  Base16IntegerWriter(Base16 base16, Object value, float input, int width, boolean literal) {
    this(base16, value, Float.floatToIntBits(input) & 0xffffffffL, width, 0, literal ? 1 : 3);
  }

  Base16IntegerWriter(Base16 base16, Object value, double input, int width, boolean literal) {
    this(base16, value, Double.doubleToLongBits(input), width, 0, literal ? 1 : 3);
  }

  Base16IntegerWriter(Base16 base16, int width, boolean literal) {
    this(base16, null, 0L, width, 0, literal ? -1 : -3);
  }

  @Override
  public Writer<Object, Object> feed(Object input) {
    if (input instanceof Integer) {
      return new Base16IntegerWriter(this.base16, input, (Integer) input, this.width, this.step == -1);
    } else if (input instanceof Long) {
      return new Base16IntegerWriter(this.base16, input, (Long) input, this.width, this.step == -1);
    } else if (input instanceof Float) {
      return new Base16IntegerWriter(this.base16, input, (Float) input, this.width, this.step == -1);
    } else if (input instanceof Double) {
      return new Base16IntegerWriter(this.base16, input, (Double) input, this.width, this.step == -1);
    } else {
      return new StringWriter(input, input);
    }
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return Base16IntegerWriter.write(output, this.base16, this.value, this.input,
                                     this.width, this.index, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Base16 base16, Object value,
                                      long input, int width, int index, int step) {
    if (step <= 0) {
      return Writer.done();
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
          return Writer.done(value);
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
          return Writer.done(value);
        }
      }
    }
    if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new Base16IntegerWriter(base16, value, input, width, index, step);
  }

  static Writer<Object, Object> write(Output<?> output, Base16 base16, Object value,
                                      int input, int width, boolean literal) {
    return Base16IntegerWriter.write(output, base16, null, input & 0xffffffffL,
                                     width, 0, literal ? 1 : 3);
  }

  static Writer<Object, Object> write(Output<?> output, Base16 base16, Object value,
                                      long input, int width, boolean literal) {
    return Base16IntegerWriter.write(output, base16, null, input, width, 0, literal ? 1 : 3);
  }

  static Writer<Object, Object> write(Output<?> output, Base16 base16, Object value,
                                      float input, int width, boolean literal) {
    return Base16IntegerWriter.write(output, base16, null, Float.floatToIntBits(input) & 0xffffffffL,
                                     width, 0, literal ? 1 : 3);
  }

  static Writer<Object, Object> write(Output<?> output, Base16 base16, Object value,
                                      double input, int width, boolean literal) {
    return Base16IntegerWriter.write(output, base16, null, Double.doubleToLongBits(input),
                                     width, 0, literal ? 1 : 3);
  }

}
