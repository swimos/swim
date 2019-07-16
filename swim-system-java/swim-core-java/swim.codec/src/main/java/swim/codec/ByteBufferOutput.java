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
import java.nio.Buffer;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;

final class ByteBufferOutput extends OutputBuffer<ByteBuffer> {
  ByteBuffer buffer;
  OutputSettings settings;
  boolean isPart;

  ByteBufferOutput(ByteBuffer buffer, OutputSettings settings, boolean isPart) {
    this.buffer = buffer;
    this.settings = settings;
    this.isPart = isPart;
  }

  ByteBufferOutput(ByteBuffer buffer) {
    this(buffer, OutputSettings.standard(), false);
  }

  @Override
  public boolean isCont() {
    return this.buffer.hasRemaining();
  }

  @Override
  public boolean isFull() {
    return this.isPart && !this.buffer.hasRemaining();
  }

  @Override
  public boolean isDone() {
    return !this.isPart && !this.buffer.hasRemaining();
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
    return this.buffer.position();
  }

  @Override
  public OutputBuffer<ByteBuffer> index(int index) {
    ((Buffer) this.buffer).position(index);
    return this;
  }

  @Override
  public int limit() {
    return this.buffer.limit();
  }

  @Override
  public OutputBuffer<ByteBuffer> limit(int limit) {
    this.buffer.limit(limit);
    return this;
  }

  @Override
  public int capacity() {
    return this.buffer.capacity();
  }

  @Override
  public int remaining() {
    return this.buffer.remaining();
  }

  @Override
  public byte[] array() {
    return this.buffer.array();
  }

  @Override
  public int arrayOffset() {
    return this.buffer.arrayOffset();
  }

  @Override
  public boolean has(int index) {
    return 0 <= index && index < this.buffer.limit();
  }

  @Override
  public int get(int index) {
    if (0 <= index && index < this.buffer.limit()) {
      return this.buffer.get(index) & 0xff;
    } else {
      throw new OutputException();
    }
  }

  @Override
  public void set(int index, int token) {
    if (0 <= index && index < this.buffer.limit()) {
      this.buffer.put(index, (byte) token);
    } else {
      throw new OutputException();
    }
  }

  @Override
  public int write(ReadableByteChannel channel) throws IOException {
    return channel.read(this.buffer);
  }

  @Override
  public OutputBuffer<ByteBuffer> write(int token) {
    final int position = this.buffer.position();
    if (position < this.buffer.limit()) {
      this.buffer.put((byte) token);
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
    if (0 <= fromIndex && fromIndex <= this.buffer.limit()) {
      final int limit = toIndex + length;
      if (0 <= limit && limit <= this.buffer.limit()) {
        if (this.buffer.hasArray()) {
          final byte[] array = this.buffer.array();
          System.arraycopy(array, fromIndex, array, toIndex, length);
        } else {
          final ByteBuffer dup = this.buffer.duplicate();
          ((Buffer) dup).position(fromIndex).limit(fromIndex + length);
          final int position = this.buffer.position();
          ((Buffer) this.buffer).position(toIndex);
          this.buffer.put(dup);
          ((Buffer) this.buffer).position(position);
        }
        return this;
      }
    }
    return OutputBuffer.error(new OutputException("invalid move"), this.settings);
  }

  @Override
  public OutputBuffer<ByteBuffer> step(int offset) {
    final int position = this.buffer.position() + offset;
    if (0 <= position && position <= this.buffer.limit()) {
      ((Buffer) this.buffer).position(position);
      return this;
    } else {
      return OutputBuffer.error(new OutputException("invalid step"), this.settings);
    }
  }

  @Override
  public ByteBuffer bind() {
    final ByteBuffer dup = this.buffer.duplicate();
    dup.flip();
    return dup;
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
    return new ByteBufferOutput(this.buffer, this.settings, this.isPart);
  }
}
