// Copyright 2015-2021 Swim Inc.
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

  final Base16 base16;
  final Object value;
  final ByteBuffer input;
  final int index;
  final int limit;
  final int step;

  Base16Writer(Base16 base16, Object value, ByteBuffer input,
               int index, int limit, int step) {
    this.base16 = base16;
    this.value = value;
    this.input = input;
    this.index = index;
    this.limit = limit;
    this.step = step;
  }

  Base16Writer(Base16 base16, Object value, ByteBuffer input) {
    this(base16, value, input, input.position(), input.limit(), 1);
  }

  Base16Writer(Base16 base16, Object value, byte[] input) {
    this(base16, value, ByteBuffer.wrap(input));
  }

  Base16Writer(Base16 base16) {
    this(base16, null, null, 0, 0, 1);
  }

  @Override
  public Writer<Object, Object> feed(Object value) {
    if (value instanceof ByteBuffer) {
      return new Base16Writer(this.base16, null, (ByteBuffer) value);
    } else if (value instanceof byte[]) {
      return new Base16Writer(this.base16, null, (byte[]) value);
    } else {
      throw new IllegalArgumentException(value.toString());
    }
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return Base16Writer.write(output, this.base16, this.value, this.input,
                              this.index, this.limit, this.step);
  }

  static Writer<Object, Object> write(Output<?> output, Base16 base16, Object value,
                                      ByteBuffer input, int index, int limit, int step) {
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
      return Writer.done(value);
    } else if (output.isDone()) {
      return Writer.error(new WriterException("truncated"));
    } else if (output.isError()) {
      return Writer.error(output.trap());
    }
    return new Base16Writer(base16, value, input, index, limit, step);
  }

  static Writer<?, ?> write(Output<?> output, Base16 base16, Object value, ByteBuffer input) {
    return Base16Writer.write(output, base16, value, input, input.position(), input.limit(), 1);
  }

  static Writer<?, ?> write(Output<?> output, Base16 base16, Object value, byte[] input) {
    return Base16Writer.write(output, base16, value, ByteBuffer.wrap(input));
  }

}
