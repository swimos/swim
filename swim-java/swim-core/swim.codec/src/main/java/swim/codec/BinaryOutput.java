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
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;
import swim.annotations.CheckReturnValue;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class BinaryOutput extends OutputBuffer<ByteBuffer> {

  final byte[] array;
  int index;
  int limit;
  boolean last;

  BinaryOutput(byte[] array, int index, int limit, boolean last) {
    this.array = array;
    this.index = index;
    this.limit = limit;
    this.last = last;
  }

  public BinaryOutput(byte[] array, int offset, int length) {
    this(array, offset, offset + length, true);
  }

  public BinaryOutput(byte[] array) {
    this(array, 0, array.length, true);
  }

  @Override
  public boolean isCont() {
    return this.index < this.limit;
  }

  @Override
  public boolean isFull() {
    return !this.last && this.index >= this.limit;
  }

  @Override
  public boolean isDone() {
    return this.last && this.index >= this.limit;
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
  public BinaryOutput asLast(boolean last) {
    this.last = last;
    return this;
  }

  @Override
  public int position() {
    return this.index;
  }

  @Override
  public BinaryOutput position(int position) {
    if (position < 0 || position > this.limit) {
      throw new IllegalArgumentException(Integer.toString(position));
    }
    this.index = position;
    return this;
  }

  @Override
  public int limit() {
    return this.limit;
  }

  @Override
  public BinaryOutput limit(int limit) {
    if (limit < 0 || limit > this.array.length) {
      throw new IllegalArgumentException(Integer.toString(limit));
    }
    this.limit = limit;
    return this;
  }

  @Override
  public int capacity() {
    return this.array.length;
  }

  @Override
  public boolean hasRemaining() {
    return this.limit - this.index > 0;
  }

  @Override
  public int remaining() {
    return this.limit - this.index;
  }

  @Override
  public int get(int index) {
    if (index < 0 || index >= this.limit) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    return this.array[index] & 0xFF;
  }

  @Override
  public void set(int index, int token) {
    if (index < 0 || index >= this.limit) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    this.array[index] = (byte) token;
  }

  @Override
  public BinaryOutput write(int token) {
    final int index = this.index;
    if (index >= this.limit) {
      throw new IllegalStateException("output " + (this.last ? "done" : "full"));
    }
    this.array[index] = (byte) token;
    this.index = index + 1;
    return this;
  }

  @Override
  public BinaryOutput write(ByteBuffer buffer) {
    final int offset = this.index;
    final int length = Math.min(this.limit - offset, buffer.remaining());
    buffer.get(this.array, offset, length);
    this.index = offset + length;
    return this;
  }

  @Override
  public int write(ReadableByteChannel channel) throws IOException {
    final ByteBuffer buffer = ByteBuffer.wrap(this.array, this.index,
                                              this.limit - this.index);
    try {
      return channel.read(buffer);
    } finally {
      this.index = buffer.position();
      this.limit = buffer.limit();
    }
  }

  @Override
  public BinaryOutput step(int offset) {
    final int index = this.index + offset;
    if (index < 0) {
      throw new IllegalArgumentException("step from index " + this.index
                                       + " with offset " + offset
                                       + " would underflow");
    } else if (index > this.limit) {
      throw new IllegalArgumentException("step from index " + this.index
                                        + " with offset " + offset
                                        + " would overflow limit " + this.limit);
    }
    this.index = index;
    return this;
  }

  @Override
  public BinaryOutput flip() {
    this.limit = this.index;
    this.index = 0;
    return this;
  }

  @Override
  public BinaryOutput rewind() {
    this.index = 0;
    return this;
  }

  @Override
  public BinaryOutput compact() {
    System.arraycopy(this.array, this.index, this.array, 0, this.limit - this.index);
    this.index = this.limit - this.index;
    return this;
  }

  @Override
  public BinaryOutput clear() {
    this.index = 0;
    this.limit = this.array.length;
    return this;
  }

  @Override
  public BinaryOutput shift(int fromIndex, int toIndex, int length) {
    if (length < 0) {
      throw new IndexOutOfBoundsException("negative shift length: " + length);
    } else if (fromIndex < 0) {
      throw new IndexOutOfBoundsException("shift from negative index: " + fromIndex);
    } else if (toIndex < 0) {
      throw new IndexOutOfBoundsException("shift to negative index: " + toIndex);
    } else if (fromIndex + length > this.limit) {
      throw new IndexOutOfBoundsException("shift from index " + fromIndex
                                        + " with length " + length
                                        + " would overflow limit " + this.limit);
    } else if (toIndex + length > this.limit) {
      throw new IndexOutOfBoundsException("shift to index " + toIndex
                                        + " with length " + length
                                        + " would overflow limit " + this.limit);
    }
    System.arraycopy(this.array, fromIndex, this.array, toIndex, length);
    return this;
  }

  @CheckReturnValue
  @Override
  public ByteBuffer get() {
    return ByteBuffer.wrap(this.array, 0, this.index);
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
    return true;
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
  public boolean hasByteBuffer() {
    return false;
  }

  @Override
  public ByteBuffer byteBuffer() {
    throw new UnsupportedOperationException();
  }

  @Override
  public ByteBuffer asByteBuffer() {
    return ByteBuffer.wrap(this.array, this.index, this.limit - this.index);
  }

  @Override
  public BinaryOutput clone() {
    return new BinaryOutput(this.array, this.index, this.limit, this.last);
  }

  static final byte[] EMPTY_ARRAY = new byte[0];

  public static BinaryOutput full() {
    return new BinaryOutput(EMPTY_ARRAY, 0, 0, false);
  }

  public static BinaryOutput done() {
    return new BinaryOutput(EMPTY_ARRAY, 0, 0, true);
  }

}
