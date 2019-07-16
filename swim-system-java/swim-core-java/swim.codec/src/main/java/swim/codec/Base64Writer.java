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

import java.nio.ByteBuffer;

final class Base64Writer extends Writer<Object, Object> {
  final Object value;
  final ByteBuffer input;
  final Base64 base64;
  final int index;
  final int limit;
  final int step;

  Base64Writer(Object value, ByteBuffer input, Base64 base64, int index, int limit, int step) {
    this.value = value;
    this.input = input;
    this.base64 = base64;
    this.index = index;
    this.limit = limit;
    this.step = step;
  }

  Base64Writer(Object value, ByteBuffer input, Base64 base64) {
    this(value, input, base64, input.position(), input.limit(), 1);
  }

  Base64Writer(ByteBuffer input, Base64 base64) {
    this(null, input, base64);
  }

  Base64Writer(Object value, byte[] input, Base64 base64) {
    this(value, ByteBuffer.wrap(input), base64);
  }

  Base64Writer(byte[] input, Base64 base64) {
    this(null, input, base64);
  }

  Base64Writer(Base64 base64) {
    this(null, null, base64, 0, 0, 0);
  }

  @Override
  public Writer<Object, Object> feed(Object value) {
    if (value instanceof ByteBuffer) {
      return new Base64Writer((ByteBuffer) value, this.base64);
    } else if (value instanceof byte[]) {
      return new Base64Writer((byte[]) value, this.base64);
    } else {
      throw new IllegalArgumentException(value.toString());
    }
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.value, this.input, this.base64, this.index, this.limit, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, ByteBuffer input,
                                      Base64 base64, int index, int limit, int step) {
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
      return done(value);
    } else if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new Base64Writer(value, input, base64, index, limit, step);
  }

  static Writer<?, ?> write(Output<?> output, Object value, ByteBuffer input, Base64 base64) {
    return write(output, value, input, base64, input.position(), input.limit(), 1);
  }

  static Writer<?, ?> write(Output<?> output, ByteBuffer input, Base64 base64) {
    return write(output, null, input, base64);
  }

  static Writer<?, ?> write(Output<?> output, Object value, byte[] input, Base64 base64) {
    return write(output, value, ByteBuffer.wrap(input), base64);
  }

  static Writer<?, ?> write(Output<?> output, byte[] input, Base64 base64) {
    return write(output, null, input, base64);
  }
}
