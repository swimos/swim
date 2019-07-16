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

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;

final class ByteArrayOutput extends OutputBuffer<ByteBuffer> {
  byte[] array;
  int index;
  int limit;
  OutputSettings settings;
  boolean isPart;

  ByteArrayOutput(byte[] array, int index, int limit, OutputSettings settings, boolean isPart) {
    this.array = array;
    this.index = index;
    this.limit = limit;
    this.settings = settings;
    this.isPart = isPart;
  }

  ByteArrayOutput(byte[] array, int offset, int length) {
    this(array, offset, offset + length, OutputSettings.standard(), false);
  }

  @Override
  public boolean isCont() {
    return this.index < this.limit;
  }

  @Override
  public boolean isFull() {
    return this.isPart && this.index >= this.limit;
  }

  @Override
  public boolean isDone() {
    return !this.isPart && this.index >= this.limit;
  }

  @Override
  public boolean isError() {
    return false;
  }

  @Override
  public boolean isPart() {
    return this.isPart;
  }

  @Override
  public OutputBuffer<ByteBuffer> isPart(boolean isPart) {
    this.isPart = isPart;
    return this;
  }

  @Override
  public int index() {
    return this.index;
  }

  @Override
  public OutputBuffer<ByteBuffer> index(int index) {
    if (0 <= index && index <= this.limit) {
      this.index = index;
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid index"), this.settings);
    }
  }

  @Override
  public int limit() {
    return this.limit;
  }

  @Override
  public OutputBuffer<ByteBuffer> limit(int limit) {
    if (0 <= limit && limit <= this.array.length) {
      this.limit = limit;
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid limit"), this.settings);
    }
  }

  @Override
  public int capacity() {
    return this.array.length;
  }

  @Override
  public int remaining() {
    return this.limit - this.index;
  }

  @Override
  public byte[] array() {
    return this.array;
  }

  @Override
  public int arrayOffset() {
    return 0;
  }

  @Override
  public boolean has(int index) {
    return 0 <= index && index < this.limit;
  }

  @Override
  public int get(int index) {
    if (0 <= index && index < this.limit) {
      return this.array[index] & 0xff;
    } else {
      throw new OutputException();
    }
  }

  @Override
  public void set(int index, int token) {
    if (0 <= index && index < this.limit) {
      this.array[index] = (byte) token;
    } else {
      throw new OutputException();
    }
  }

  @Override
  public int write(ReadableByteChannel channel) throws IOException {
    final ByteBuffer buffer = ByteBuffer.wrap(this.array, this.index, this.limit - this.index);
    try {
      return channel.read(buffer);
    } finally {
      this.index = buffer.position();
      this.limit = buffer.limit();
    }
  }

  @Override
  public OutputBuffer<ByteBuffer> write(int token) {
    final int index = this.index;
    if (index < this.limit) {
      this.array[index] = (byte) token;
      this.index = index + 1;
      return this;
    } else {
      return OutputBuffer.error(new OutputException("full"), this.settings);
    }
  }

  @Override
  public OutputBuffer<ByteBuffer> write(String string) {
    return OutputBuffer.error(new OutputException("binary output"), this.settings);
  }

  @Override
  public OutputBuffer<ByteBuffer> writeln(String string) {
    return OutputBuffer.error(new OutputException("binary output"), this.settings);
  }

  @Override
  public OutputBuffer<ByteBuffer> writeln() {
    return OutputBuffer.error(new OutputException("binary output"), this.settings);
  }

  @Override
  public OutputBuffer<ByteBuffer> move(int fromIndex, int toIndex, int length) {
    if (0 <= fromIndex && fromIndex <= this.limit) {
      final int limit = toIndex + length;
      if (0 <= limit && limit <= this.limit) {
        System.arraycopy(this.array, fromIndex, this.array, toIndex, length);
        return this;
      }
    }
    return OutputBuffer.error(new OutputException("invalid move"), this.settings);
  }

  @Override
  public OutputBuffer<ByteBuffer> step(int offset) {
    final int index = this.index + offset;
    if (0 <= index && index <= this.limit) {
      this.index = index;
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid step"), this.settings);
    }
  }

  @Override
  public ByteBuffer bind() {
    return ByteBuffer.wrap(this.array, 0, this.index);
  }

  @Override
  public OutputSettings settings() {
    return this.settings;
  }

  @Override
  public OutputBuffer<ByteBuffer> settings(OutputSettings settings) {
    this.settings = settings;
    return this;
  }

  @Override
  public OutputBuffer<ByteBuffer> clone() {
    return new ByteArrayOutput(this.array, this.index, this.limit, this.settings, this.isPart);
  }
}
