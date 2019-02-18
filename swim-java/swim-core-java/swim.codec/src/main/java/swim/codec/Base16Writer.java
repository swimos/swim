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

final class Base16Writer extends Writer<Object, Object> {
  final Object value;
  final ByteBuffer input;
  final Base16 base16;
  final int index;
  final int limit;
  final int step;

  Base16Writer(Object value, ByteBuffer input, Base16 base16, int index, int limit, int step) {
    this.value = value;
    this.input = input;
    this.base16 = base16;
    this.index = index;
    this.limit = limit;
    this.step = step;
  }

  Base16Writer(Object value, ByteBuffer input, Base16 base16) {
    this(value, input, base16, input.position(), input.limit(), 1);
  }

  Base16Writer(ByteBuffer input, Base16 base16) {
    this(null, input, base16);
  }

  Base16Writer(Object value, byte[] input, Base16 base16) {
    this(value, ByteBuffer.wrap(input), base16);
  }

  Base16Writer(byte[] input, Base16 base16) {
    this(null, ByteBuffer.wrap(input), base16);
  }

  Base16Writer(Base16 base16) {
    this(null, null, base16, 0, 0, 1);
  }

  @Override
  public Writer<Object, Object> feed(Object value) {
    if (value instanceof ByteBuffer) {
      return new Base16Writer((ByteBuffer) value, this.base16);
    } else if (value instanceof byte[]) {
      return new Base16Writer((byte[]) value, this.base16);
    } else {
      throw new IllegalArgumentException(value.toString());
    }
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.value, this.input, this.base16, this.index, this.limit, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, ByteBuffer input,
                                      Base16 base16, int index, int limit, int step) {
    while (index < limit) {
      final int x = input.get(index) & 0xff;
      if (step == 1 && output.isCont()) {
        output = output.write(base16.encodeDigit(x >>> 4));
        step = 2;
      }
      if (step == 2 && output.isCont()) {
        output = output.write(base16.encodeDigit(x & 0x0f));
        index += 1;
        step = 1;
      }
    }
    if (index == limit) {
      return done(value);
    } else if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new Base16Writer(value, input, base16, index, limit, step);
  }

  static Writer<?, ?> write(Output<?> output, Object value, ByteBuffer input, Base16 base16) {
    return write(output, value, input, base16, input.position(), input.limit(), 1);
  }

  static Writer<?, ?> write(Output<?> output, ByteBuffer input, Base16 base16) {
    return write(output, null, input, base16);
  }

  static Writer<?, ?> write(Output<?> output, Object value, byte[] input, Base16 base16) {
    return write(output, value, ByteBuffer.wrap(input), base16);
  }

  static Writer<?, ?> write(Output<?> output, byte[] input, Base16 base16) {
    return write(output, null, ByteBuffer.wrap(input), base16);
  }
}
