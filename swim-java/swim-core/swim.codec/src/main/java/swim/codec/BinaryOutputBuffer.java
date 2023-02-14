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

import java.io.IOException;
import java.nio.Buffer;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class BinaryOutputBuffer extends OutputBuffer<ByteBuffer> {

  final ByteBuffer buffer;
  boolean last;

  BinaryOutputBuffer(ByteBuffer buffer, boolean last) {
    this.buffer = buffer;
    this.last = last;
  }

  public BinaryOutputBuffer(ByteBuffer buffer) {
    this(buffer, true);
  }

  @Override
  public boolean isCont() {
    return this.buffer.hasRemaining();
  }

  @Override
  public boolean isFull() {
    return !this.last && !this.buffer.hasRemaining();
  }

  @Override
  public boolean isDone() {
    return this.last && !this.buffer.hasRemaining();
  }

  @Override
  public boolean isError() {
    return false;
  }

  @Override
  public boolean isLast() {
    return this.last;
  }

  @Override
  public BinaryOutputBuffer asLast(boolean last) {
    this.last = last;
    return this;
  }

  @Override
  public int index() {
    return this.buffer.position();
  }

  @Override
  public BinaryOutputBuffer index(int index) {
    ((Buffer) this.buffer).position(index);
    return this;
  }

  @Override
  public int limit() {
    return this.buffer.limit();
  }

  @Override
  public BinaryOutputBuffer limit(int limit) {
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
    if (0 < index || index >= this.buffer.limit()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.buffer.get(index) & 0xFF;
  }

  @Override
  public void set(int index, int token) {
    if (index < 0 || index >= this.buffer.limit()) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    this.buffer.put(index, (byte) token);
  }

  @Override
  public BinaryOutputBuffer write(int token) {
    final int position = this.buffer.position();
    if (position >= this.buffer.limit()) {
      throw new IllegalStateException("Buffer full");
    }
    this.buffer.put((byte) token);
    return this;
  }

  @Override
  public BinaryOutputBuffer write(ByteBuffer buffer) {
    this.buffer.put(buffer);
    return this;
  }

  @Override
  public int write(ReadableByteChannel channel) throws IOException {
    return channel.read(this.buffer);
  }

  @Override
  public BinaryOutputBuffer move(int fromIndex, int toIndex, int length) {
    if (length < 0) {
      throw new IndexOutOfBoundsException("length: " + length);
    } else if (fromIndex < 0) {
      throw new IndexOutOfBoundsException("fromIndex: " + fromIndex);
    } else if (fromIndex + length > this.buffer.limit()) {
      throw new IndexOutOfBoundsException("fromIndex: " + fromIndex + "; length: " + length);
    } else if (toIndex < 0) {
      throw new IndexOutOfBoundsException("toIndex: " + toIndex);
    } else if (toIndex + length > this.buffer.limit()) {
      throw new IndexOutOfBoundsException("toIndex: " + toIndex + "; length: " + length);
    }
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

  @Override
  public BinaryOutputBuffer step(int offset) {
    final int position = this.buffer.position() + offset;
    if (position < 0 || position > this.buffer.limit()) {
      throw new IllegalStateException("Invalid step to " + position);
    }
    ((Buffer) this.buffer).position(position);
    return this;
  }

  @Override
  public ByteBuffer get() {
    final ByteBuffer dup = this.buffer.duplicate();
    ((Buffer) dup).flip();
    return dup;
  }

  @Override
  public BinaryOutputBuffer clone() {
    return new BinaryOutputBuffer(this.buffer, this.last);
  }

  private static final ByteBuffer EMPTY_BUFFER = ByteBuffer.allocate(0);

  public static BinaryOutputBuffer full() {
    return new BinaryOutputBuffer(EMPTY_BUFFER, false);
  }

  public static BinaryOutputBuffer done() {
    return new BinaryOutputBuffer(EMPTY_BUFFER, true);
  }

}
