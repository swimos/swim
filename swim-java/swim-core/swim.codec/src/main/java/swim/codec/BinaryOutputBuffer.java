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
import java.nio.BufferOverflowException;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;
import swim.annotations.CheckReturnValue;
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
  public int position() {
    return this.buffer.position();
  }

  @Override
  public BinaryOutputBuffer position(int position) {
    this.buffer.position(position);
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
  public boolean hasRemaining() {
    return this.buffer.hasRemaining();
  }

  @Override
  public int remaining() {
    return this.buffer.remaining();
  }

  @Override
  public int get(int index) {
    if (index < 0 || index >= this.buffer.limit()) {
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
    try {
      this.buffer.put((byte) token);
    } catch (BufferOverflowException cause) {
      throw new IllegalStateException("output " + (this.last ? "done" : "full"));
    }
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
  public BinaryOutputBuffer step(int offset) {
    final int index = this.buffer.position() + offset;
    if (index < 0) {
      throw new IllegalArgumentException("step from index " + this.buffer.position()
                                       + " with offset " + offset
                                       + " would underflow");
    } else if (index > this.buffer.limit()) {
      throw new IllegalArgumentException("step from index " + this.buffer.position()
                                        + " with offset " + offset
                                        + " would overflow limit " + this.buffer.limit());
    }
    this.buffer.position(index);
    return this;
  }

  @Override
  public BinaryOutputBuffer flip() {
    this.buffer.flip();
    return this;
  }

  @Override
  public BinaryOutputBuffer rewind() {
    this.buffer.rewind();
    return this;
  }

  @Override
  public BinaryOutputBuffer compact() {
    this.buffer.compact();
    return this;
  }

  @Override
  public BinaryOutputBuffer clear() {
    this.buffer.clear();
    return this;
  }

  @Override
  public BinaryOutputBuffer shift(int fromIndex, int toIndex, int length) {
    if (length < 0) {
      throw new IndexOutOfBoundsException("negative shift length: " + length);
    } else if (fromIndex < 0) {
      throw new IndexOutOfBoundsException("shift from negative index: " + fromIndex);
    } else if (toIndex < 0) {
      throw new IndexOutOfBoundsException("shift to negative index: " + toIndex);
    } else if (fromIndex + length > this.buffer.limit()) {
      throw new IndexOutOfBoundsException("shift from index " + fromIndex
                                        + " with length " + length
                                        + " would overflow limit " + this.buffer.limit());
    } else if (toIndex + length > this.buffer.limit()) {
      throw new IndexOutOfBoundsException("shift to index " + toIndex
                                        + " with length " + length
                                        + " would overflow limit " + this.buffer.limit());
    }
    if (this.buffer.hasArray()) {
      final byte[] array = this.buffer.array();
      System.arraycopy(array, fromIndex, array, toIndex, length);
    } else {
      final ByteBuffer dup = this.buffer.duplicate();
      dup.position(fromIndex).limit(fromIndex + length);
      final int position = this.buffer.position();
      this.buffer.position(toIndex);
      this.buffer.put(dup);
      this.buffer.position(position);
    }
    return this;
  }

  @CheckReturnValue
  @Override
  public ByteBuffer get() {
    final ByteBuffer dup = this.buffer.duplicate();
    dup.flip();
    return dup;
  }

  @CheckReturnValue
  @Override
  public ByteBuffer getNonNull() {
    return this.get();
  }

  @CheckReturnValue
  @Override
  public ByteBuffer getUnchecked() {
    return this.get();
  }

  @CheckReturnValue
  @Override
  public ByteBuffer getNonNullUnchecked() {
    return this.get();
  }

  @Override
  public boolean hasArray() {
    return this.buffer.hasArray();
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
  public boolean hasByteBuffer() {
    return true;
  }

  @Override
  public ByteBuffer byteBuffer() {
    return this.buffer;
  }

  @Override
  public ByteBuffer asByteBuffer() {
    return this.buffer;
  }

  @Override
  public BinaryOutputBuffer clone() {
    return new BinaryOutputBuffer(this.buffer, this.last);
  }

  static final ByteBuffer EMPTY_BUFFER = ByteBuffer.allocate(0);

  public static BinaryOutputBuffer full() {
    return new BinaryOutputBuffer(EMPTY_BUFFER, false);
  }

  public static BinaryOutputBuffer done() {
    return new BinaryOutputBuffer(EMPTY_BUFFER, true);
  }

  public static BinaryOutputBuffer allocate(int capacity) {
    return new BinaryOutputBuffer(ByteBuffer.allocate(capacity), true);
  }

  public static BinaryOutputBuffer allocateDirect(int capacity) {
    return new BinaryOutputBuffer(ByteBuffer.allocateDirect(capacity), true);
  }

  public static BinaryOutputBuffer wrap(byte[] array, int offset, int length) {
    return new BinaryOutputBuffer(ByteBuffer.wrap(array, offset, length), true);
  }

  public static BinaryOutputBuffer wrap(byte[] array) {
    return new BinaryOutputBuffer(ByteBuffer.wrap(array), true);
  }

}
