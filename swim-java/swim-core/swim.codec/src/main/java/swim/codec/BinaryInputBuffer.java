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

import java.nio.Buffer;
import java.nio.ByteBuffer;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class BinaryInputBuffer extends InputBuffer {

  final ByteBuffer buffer;
  @Nullable String identifier;
  long offset;
  boolean last;

  BinaryInputBuffer(ByteBuffer buffer, @Nullable String identifier,
                    long offset, boolean last) {
    this.buffer = buffer;
    this.identifier = identifier;
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
  public int index() {
    return this.buffer.position();
  }

  @Override
  public BinaryInputBuffer index(int index) {
    ((Buffer) this.buffer).position(index);
    return this;
  }

  @Override
  public int limit() {
    return this.buffer.limit();
  }

  @Override
  public BinaryInputBuffer limit(int limit) {
    ((Buffer) this.buffer).limit(limit);
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
    final int position = this.buffer.position();
    if (position >= this.buffer.limit()) {
      throw new IllegalStateException("Invalid step");
    }
    ((Buffer) this.buffer).position(position + 1);
    this.offset += 1L;
    return this;
  }

  @Override
  public BinaryInputBuffer step(int offset) {
    final int position = this.buffer.position() + offset;
    if (position < 0 || position > this.buffer.limit()) {
      throw new IllegalStateException("Invalid step to " + position);
    }
    ((Buffer) this.buffer).position(position);
    this.offset += (long) offset;
    return this;
  }

  @Override
  public BinaryInputBuffer seek(@Nullable SourcePosition position) {
    final ByteBuffer buffer = this.buffer;
    if (position != null) {
      final long offset = (long) buffer.position() + (this.offset - position.offset());
      if (offset < 0 || offset > (long) buffer.limit()) {
        throw new IllegalStateException("Invalid seek to " + position);
      }
      ((Buffer) buffer).position((int) offset);
      this.offset = position.offset();
      return this;
    } else {
      this.offset -= (long) buffer.position();
      ((Buffer) buffer).position(0);
      return this;
    }
  }

  @Override
  public @Nullable String identifier() {
    return this.identifier;
  }

  @Override
  public BinaryInputBuffer withIdentifier(@Nullable String identifier) {
    this.identifier = identifier;
    return this;
  }

  @Override
  public SourcePosition position() {
    return SourcePosition.at(this.offset, 0, 0);
  }

  @Override
  public BinaryInputBuffer withPosition(SourcePosition position) {
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
  public BinaryInputBuffer clone() {
    return new BinaryInputBuffer(this.buffer.duplicate(), this.identifier,
                                 this.offset, this.last);
  }

  private static final ByteBuffer EMPTY_BUFFER = ByteBuffer.allocate(0);

  public static BinaryInputBuffer empty() {
    return new BinaryInputBuffer(EMPTY_BUFFER, null, 0L, false);
  }

  public static BinaryInputBuffer done() {
    return new BinaryInputBuffer(EMPTY_BUFFER, null, 0L, true);
  }

}
