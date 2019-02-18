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

final class Base10IntegerWriter extends Writer<Object, Object> {
  final Object value;
  final long input;
  final int index;
  final int step;

  Base10IntegerWriter(Object value, long input, int index, int step) {
    this.value = value;
    this.input = input;
    this.index = index;
    this.step = step;
  }

  Base10IntegerWriter(Object value, long input) {
    this(value, input, 0, 1);
  }

  Base10IntegerWriter() {
    this(null, 0L, 0, 0);
  }

  @Override
  public Writer<Object, Object> feed(Object input) {
    if (input instanceof Integer) {
      return new Base10IntegerWriter(input, ((Integer) input).longValue());
    } else if (input instanceof Long) {
      return new Base10IntegerWriter(input, ((Long) input).longValue());
    } else {
      return new StringWriter(input, input);
    }
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.value, this.input, this.index, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, long input, int index, int step) {
    if (step == 0) {
      return done();
    }
    if (step == 1) {
      if (input < 0L) {
        if (output.isCont()) {
          output = output.write('-');
          step = 2;
        }
      } else {
        step = 2;
      }
    }
    if (step == 2) {
      if (input > -10L && input < 10L) {
        if (output.isCont()) {
          output = output.write(Base10.encodeDigit(Math.abs((int) input)));
          return done(value);
        }
      } else {
        int i = 18;
        final int[] digits = new int[19];
        long x = input;
        while (x != 0L) {
          digits[i] = Math.abs((int) (x % 10L));
          x /= 10L;
          i -= 1;
        }
        i += 1 + index;
        while (i < 19 && output.isCont()) {
          output = output.write(Base10.encodeDigit(digits[i]));
          index += 1;
          i += 1;
        }
        if (i == 19) {
          return done(value);
        }
      }
    }
    if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new Base10IntegerWriter(value, input, index, step);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, long input) {
    return write(output, value, input, 0, 1);
  }
}
