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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class BinaryInput extends InputBuffer {

  final byte[] array;
  int index;
  int limit;
  @Nullable String identifier;
  long offset;
  boolean last;

  BinaryInput(byte[] array, int index, int limit, @Nullable String identifier,
              long offset, boolean last) {
    this.array = array;
    this.index = index;
    this.limit = limit;
    this.identifier = identifier;
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
  public int index() {
    return this.index;
  }

  @Override
  public BinaryInput index(int index) {
    if (index < 0 || index > this.limit) {
      throw new IndexOutOfBoundsException(Integer.toString(index));
    }
    this.offset += (long) (index - this.index);
    this.index = index;
    return this;
  }

  @Override
  public int limit() {
    return this.limit;
  }

  @Override
  public BinaryInput limit(int limit) {
    if (limit < 0 || limit > this.array.length) {
      throw new IndexOutOfBoundsException(Integer.toString(limit));
    }
    this.limit = limit;
    return this;
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
      throw new IllegalStateException();
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
      throw new IllegalStateException("Invalid step");
    }
    this.index += 1;
    this.offset += 1L;
    return this;
  }

  @Override
  public BinaryInput step(int offset) {
    final int index = this.index + offset;
    if (index < 0 || index > this.limit) {
      throw new IllegalStateException("Invalid step to " + index);
    }
    this.index = index;
    this.offset += (long) offset;
    return this;
  }

  @Override
  public BinaryInput seek(@Nullable SourcePosition position) {
    if (position != null) {
      final long index = (long) this.index + (this.offset - position.offset());
      if (index < 0 || index > (long) this.limit) {
        throw new IllegalStateException("Invalid seek to " + position);
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
  public @Nullable String identifier() {
    return this.identifier;
  }

  @Override
  public BinaryInput withIdentifier(@Nullable String identifier) {
    this.identifier = identifier;
    return this;
  }

  @Override
  public SourcePosition position() {
    return SourcePosition.at(this.offset, 0, 0);
  }

  @Override
  public BinaryInput withPosition(SourcePosition position) {
    this.offset = position.offset();
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
  public BinaryInput clone() {
    return new BinaryInput(this.array, this.index, this.limit, this.identifier,
                           this.offset, this.last);
  }

  private static final byte[] EMPTY_ARRAY = new byte[0];

  public static BinaryInput empty() {
    return new BinaryInput(EMPTY_ARRAY, 0, 0, null, 0L, false);
  }

  public static BinaryInput done() {
    return new BinaryInput(EMPTY_ARRAY, 0, 0, null, 0L, true);
  }

}
