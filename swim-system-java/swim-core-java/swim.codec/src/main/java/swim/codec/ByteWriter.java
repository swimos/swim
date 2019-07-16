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

final class ByteWriter extends Writer<Object, Object> {
  final Object value;
  final Input input;

  ByteWriter(Object value, Input input) {
    this.value = value;
    this.input = input;
  }

  ByteWriter(Object value, ByteBuffer input) {
    this(value, Binary.inputBuffer(input));
  }

  ByteWriter(Object value, byte[] input) {
    this(value, Binary.inputBuffer(input));
  }

  ByteWriter(Input input) {
    this(null, input);
  }

  ByteWriter(ByteBuffer input) {
    this(null, Binary.inputBuffer(input));
  }

  ByteWriter(byte[] input) {
    this(null, Binary.inputBuffer(input));
  }

  ByteWriter() {
    this(null, (Input) null);
  }

  @Override
  public Writer<Object, Object> feed(Object value) {
    if (value == null) {
      return done();
    } else if (value instanceof ByteBuffer) {
      return new ByteWriter(((ByteBuffer) value).duplicate());
    } else if (value instanceof byte[]) {
      return new ByteWriter((byte[]) value);
    } else {
      throw new IllegalArgumentException(value.toString());
    }
  }

  @Override
  public Writer<Object, Object> pull(Output<?> output) {
    return write(output, this.value, this.input.clone());
  }

  static Writer<Object, Object> write(Output<?> output, Object value, Input input) {
    while (input.isCont() && output.isCont()) {
      output = output.write(input.head());
      input = input.step();
    }
    if (input.isDone() && !output.isError()) {
      return done(value);
    } else if (input.isError()) {
      return error(input.trap());
    } else if (output.isDone()) {
      return error(new WriterException("truncated"));
    } else if (output.isError()) {
      return error(output.trap());
    }
    return new ByteWriter(value, input);
  }

  static Writer<Object, Object> write(Output<?> output, Object value, ByteBuffer input) {
    return write(output, value, Binary.inputBuffer(input));
  }

  static Writer<Object, Object> write(Output<?> output, Object value, byte[] input) {
    return write(output, value, Binary.inputBuffer(input));
  }

  static Writer<Object, Object> write(Output<?> output, ByteBuffer input) {
    return write(output, null, Binary.inputBuffer(input));
  }

  static Writer<Object, Object> write(Output<?> output, byte[] input) {
    return write(output, null, Binary.inputBuffer(input));
  }
}
