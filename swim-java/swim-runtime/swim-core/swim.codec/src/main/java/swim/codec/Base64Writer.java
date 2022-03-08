// Copyright 2015-2022 Swim.inc
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

import java.nio.ByteBuffer;

final class Base64Writer extends Writer<Object, Object> {

  final Base64 base64;
  final Object value;
  final ByteBuffer input;
  final int index;
  final int limit;
  final int step;

  Base64Writer(Base64 base64, Object value, ByteBuffer input,
               int index, int limit, int step) {
    this.base64 = base64;
    this.value = value;
    this.input = input;
    this.index = index;
    this.limit = limit;
    this.step = step;
  }

  Base64Writer(Base64 base64, Object value, ByteBuffer input) {
    this(base64, value, input, input.position(), input.limit(), 1);
  }

  Base64Writer(Base64 base64, Object value, byte[] input) {
    this(base64, value, ByteBuffer.wrap(input));
  }

  Base64Writer(Base64 base64) {
    this(base64, null, null, 0, 0, 0);
  }

  @Override
  public Writer<Object, Object> feed(Object value) {
    if (value instanceof ByteBuffer) {
      return new Base64Writer(this.base64, null, (ByteBuffer) value);
    } else if (value instanceof byte[]) {
      return new Base64Writer(this.base64, null, (byte[]) value);
    } else {
      throw new IllegalArgumentException(value.toString());
    }
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return Base64Writer.write(output, this.base64, this.value, this.input,
                              this.index, this.limit, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Base64 base64, Object value,
                                      ByteBuffer input, int index, int limit, int step) {
    while (index + 2 < limit && output.isCont()) {
      final int x = input.get(index) & 0xff;
      final int y = input.get(index + 1) & 0xff;
      final int z = input.get(index + 2) & 0xff;
      if (step == 1 && output.isCont()) {
        output = output.write(base64.encodeDigit(x >>> 2));
        step = 2;
      }
      if (step == 2 && output.isCont()) {
        output = output.write(base64.encodeDigit(((x << 4) | (y >>> 4)) & 0x3f));
        step = 3;
      }
      if (step == 3 && output.isCont()) {
        output = output.write(base64.encodeDigit(((y << 2) | (z >>> 6)) & 0x3f));
        step = 4;
      }
      if (step == 4 && output.isCont()) {
        output = output.write(base64.encodeDigit(z & 0x3f));
        index += 3;
        step = 1;
      }
    }
    if (index + 1 < limit && output.isCont()) {
      final int x = input.get(index) & 0xff;
      final int y = input.get(index + 1) & 0xff;
      if (step == 1 && output.isCont()) {
        output = output.write(base64.encodeDigit(x >>> 2));
        step = 2;
      }
      if (step == 2 && output.isCont()) {
        output = output.write(base64.encodeDigit(((x << 4) | (y >>> 4)) & 0x3f));
        step = 3;
      }
      if (step == 3 && output.isCont()) {
        output = output.write(base64.encodeDigit((y << 2) & 0x3f));
        step = 4;
      }
      if (step == 4) {
        if (!base64.isPadded()) {
          index += 2;
        } else if (output.isCont()) {
          output = output.write('=');
          index += 2;
        }
      }
    } else if (index < limit && output.isCont()) {
      final int x = input.get(index) & 0xff;
      if (step == 1 && output.isCont()) {
        output = output.write(base64.encodeDigit(x >>> 2));
        step = 2;
      }
      if (step == 2 && output.isCont()) {
        output = output.write(base64.encodeDigit((x << 4) & 0x3f));
        step = 3;
      }
      if (step == 3) {
        if (!base64.isPadded()) {
          index += 1;
        } else if (output.isCont()) {
          output = output.write('=');
          step = 4;
        }
      }
      if (step == 4 && output.isCont()) {
        output = output.write('=');
        index += 1;
      }
    }
    if (index == limit) {
      return Writer.done(value);
    } else if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new Base64Writer(base64, value, input, index, limit, step);
  }

  static Writer<?, ?> write(Output<?> output, Base64 base64, Object value, ByteBuffer input) {
    return Base64Writer.write(output, base64, value, input, input.position(), input.limit(), 1);
  }

  static Writer<?, ?> write(Output<?> output, Base64 base64, Object value, byte[] input) {
    return Base64Writer.write(output, base64, value, ByteBuffer.wrap(input));
  }

}
