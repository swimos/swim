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

import java.nio.BufferUnderflowException;
import java.nio.ByteBuffer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class BinaryInputBuffer extends InputBuffer {

  final ByteBuffer buffer;
  @Nullable String name;
  long offset;
  boolean last;

  BinaryInputBuffer(ByteBuffer buffer, @Nullable String name,
                    long offset, boolean last) {
    this.buffer = buffer;
    this.name = name;
    this.offset = offset;
    this.last = last;
  }

  public BinaryInputBuffer(ByteBuffer buffer) {
    this(buffer, null, 0L, true);
  }

  @Override
  public boolean isCont() {
    return this.buffer.hasRemaining();
  }

  @Override
  public boolean isEmpty() {
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
  public BinaryInputBuffer asLast(boolean last) {
    this.last = last;
    return this;
  }

  @Override
  public int position() {
    return this.buffer.position();
  }

  @Override
  public BinaryInputBuffer position(int position) {
    this.buffer.position(position);
    return this;
  }

  @Override
  public int limit() {
    return this.buffer.limit();
  }

  @Override
  public BinaryInputBuffer limit(int limit) {
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
  public int head() {
    final int position = this.buffer.position();
    if (position >= this.buffer.limit()) {
      throw new IllegalStateException();
    }
    return this.buffer.get(position) & 0xFF;
  }

  @Override
  public int lookahead(int k) {
    final int position = this.buffer.position();
    if (0 <= k && position + k < this.buffer.limit()) {
      return this.buffer.get(position + k) & 0xFF;
    } else {
      return -1;
    }
  }

  @Override
  public BinaryInputBuffer step() {
    try {
      this.buffer.get();
      this.offset += 1L;
    } catch (BufferUnderflowException e) {
      throw new IllegalStateException("Invalid step");
    }
    return this;
  }

  @Override
  public BinaryInputBuffer step(int offset) {
    final int position = this.buffer.position() + offset;
    if (position < 0 || position > this.buffer.limit()) {
      throw new IllegalArgumentException("Invalid step to " + position);
    }
    this.buffer.position(position);
    this.offset += (long) offset;
    return this;
  }

  @Override
  public BinaryInputBuffer seek(@Nullable SourcePosition position) {
    final ByteBuffer buffer = this.buffer;
    if (position != null) {
      final long offset = (long) buffer.position() + (this.offset - position.offset());
      if (offset < 0 || offset > (long) buffer.limit()) {
        throw new IllegalArgumentException("Invalid seek to " + position);
      }
      buffer.position((int) offset);
      this.offset = position.offset();
      return this;
    } else {
      this.offset -= (long) buffer.position();
      buffer.position(0);
      return this;
    }
  }

  @Override
  public BinaryInputBuffer flip() {
    this.buffer.flip();
    return this;
  }

  @Override
  public BinaryInputBuffer rewind() {
    this.buffer.rewind();
    return this;
  }

  @Override
  public BinaryInputBuffer compact() {
    this.buffer.compact();
    return this;
  }

  @Override
  public BinaryInputBuffer clear() {
    this.buffer.clear();
    return this;
  }

  @Override
  public BinaryInputBuffer shift(int fromIndex, int toIndex, int length) {
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
      dup.position(fromIndex).limit(fromIndex + length);
      final int position = this.buffer.position();
      this.buffer.position(toIndex);
      this.buffer.put(dup);
      this.buffer.position(position);
    }
    return this;
  }

  @Override
  public SourcePosition location() {
    return SourcePosition.of(this.name, this.offset, 0, 0);
  }

  @Override
  public BinaryInputBuffer location(SourcePosition location) {
    if (location.name() != null) {
      this.name = location.name();
    }
    this.offset = location.offset();
    return this;
  }

  @Override
  public @Nullable String name() {
    return this.name;
  }

  @Override
  public BinaryInputBuffer name(@Nullable String name) {
    this.name = name;
    return this;
  }

  @Override
  public long offset() {
    return this.offset;
  }

  @Override
  public int line() {
    return 0;
  }

  @Override
  public int column() {
    return 0;
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
  public BinaryInputBuffer clone() {
    return new BinaryInputBuffer(this.buffer.duplicate(), this.name,
                                 this.offset, this.last);
  }

  private static final ByteBuffer EMPTY_BUFFER = ByteBuffer.allocate(0);

  public static BinaryInputBuffer empty() {
    return new BinaryInputBuffer(EMPTY_BUFFER, null, 0L, false);
  }

  public static BinaryInputBuffer done() {
    return new BinaryInputBuffer(EMPTY_BUFFER, null, 0L, true);
  }

  public static BinaryInputBuffer allocate(int capacity) {
    return new BinaryInputBuffer(ByteBuffer.allocate(capacity), null, 0L, true);
  }

  public static BinaryInputBuffer allocateDirect(int capacity) {
    return new BinaryInputBuffer(ByteBuffer.allocateDirect(capacity), null, 0L, true);
  }

  public static BinaryInputBuffer wrap(byte[] array, int offset, int length) {
    return new BinaryInputBuffer(ByteBuffer.wrap(array, offset, length), null, 0L, true);
  }

  public static BinaryInputBuffer wrap(byte[] array) {
    return new BinaryInputBuffer(ByteBuffer.wrap(array), null, 0L, true);
  }

}
