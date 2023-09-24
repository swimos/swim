// Copyright 2015-2023 Nstream, inc.
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
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class BinaryInput extends InputBuffer {

  final byte[] array;
  int index;
  int limit;
  @Nullable String name;
  long offset;
  boolean last;

  BinaryInput(byte[] array, int index, int limit, @Nullable String name,
              long offset, boolean last) {
    this.array = array;
    this.index = index;
    this.limit = limit;
    this.name = name;
    this.offset = offset;
    this.last = last;
  }

  public BinaryInput(byte[] array, int offset, int length) {
    this(array, offset, offset + length, null, 0L, true);
  }

  public BinaryInput(byte[] array) {
    this(array, 0, array.length, null, 0L, true);
  }

  @Override
  public boolean isCont() {
    return this.index < this.limit;
  }

  @Override
  public boolean isEmpty() {
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
  public BinaryInput asLast(boolean last) {
    this.last = last;
    return this;
  }

  @Override
  public int position() {
    return this.index;
  }

  @Override
  public BinaryInput position(int position) {
    if (position < 0 || position > this.limit) {
      throw new IllegalArgumentException(Integer.toString(position));
    }
    this.offset += (long) (position - this.index);
    this.index = position;
    return this;
  }

  @Override
  public int limit() {
    return this.limit;
  }

  @Override
  public BinaryInput limit(int limit) {
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
  public int head() {
    if (this.index >= this.limit) {
      throw new IllegalStateException("input " + (this.last ? "done" : "empty"));
    }
    return this.array[this.index] & 0xFF;
  }

  @Override
  public int lookahead(int k) {
    if (0 <= k && this.index + k < this.limit) {
      return this.array[this.index + k] & 0xFF;
    } else {
      return -1;
    }
  }

  @Override
  public BinaryInput step() {
    if (this.index >= this.limit) {
      throw new IllegalStateException("input " + (this.last ? "done" : "empty"));
    }
    this.index += 1;
    this.offset += 1L;
    return this;
  }

  @Override
  public BinaryInput step(int offset) {
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
    this.offset += (long) offset;
    return this;
  }

  @Override
  public BinaryInput seek(@Nullable SourcePosition position) {
    if (position != null) {
      final long index = (long) this.index + (this.offset - position.offset());
      if (index < 0) {
        throw new IllegalArgumentException("seek from index " + this.index
                                         + " to index " + position.offset()
                                         + " would underflow");
      } else if (index > (long) this.limit) {
        throw new IllegalArgumentException("seek from index " + this.index
                                         + " to index " + position.offset()
                                         + " would overflow limit: " + this.limit);
      }
      this.index = (int) index;
      this.offset = position.offset();
      return this;
    } else {
      this.offset -= (long) this.index;
      this.index = 0;
      return this;
    }
  }

  @Override
  public BinaryInput flip() {
    this.limit = this.index;
    this.index = 0;
    return this;
  }

  @Override
  public BinaryInput rewind() {
    this.index = 0;
    return this;
  }

  @Override
  public BinaryInput compact() {
    System.arraycopy(this.array, this.index, this.array, 0, this.limit - this.index);
    this.index = this.limit - this.index;
    return this;
  }

  @Override
  public BinaryInput clear() {
    this.index = 0;
    this.limit = this.array.length;
    return this;
  }

  @Override
  public BinaryInput shift(int fromIndex, int toIndex, int length) {
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

  @Override
  public SourcePosition location() {
    return SourcePosition.of(this.name, this.offset, 0, 0);
  }

  @Override
  public BinaryInput location(SourcePosition location) {
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
  public BinaryInput name(@Nullable String name) {
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
  public BinaryInput clone() {
    return new BinaryInput(this.array, this.index, this.limit,
                           this.name, this.offset, this.last);
  }

  static final byte[] EMPTY_ARRAY = new byte[0];

  public static BinaryInput empty() {
    return new BinaryInput(EMPTY_ARRAY, 0, 0, null, 0L, false);
  }

  public static BinaryInput done() {
    return new BinaryInput(EMPTY_ARRAY, 0, 0, null, 0L, true);
  }

}
