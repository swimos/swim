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

import java.nio.Buffer;
import java.nio.ByteBuffer;

final class ByteBufferInput extends InputBuffer {
  ByteBuffer buffer;
  Object id;
  long offset;
  InputSettings settings;
  boolean isPart;

  ByteBufferInput(ByteBuffer buffer, Object id, long offset,
                  InputSettings settings, boolean isPart) {
    this.buffer = buffer;
    this.id = id;
    this.offset = offset;
    this.settings = settings;
    this.isPart = isPart;
  }

  ByteBufferInput(ByteBuffer buffer) {
    this(buffer, null, 0L, InputSettings.standard(), false);
  }

  @Override
  public boolean isCont() {
    return this.buffer.hasRemaining();
  }

  @Override
  public boolean isEmpty() {
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
  public InputBuffer isPart(boolean isPart) {
    this.isPart = isPart;
    return this;
  }

  @Override
  public int index() {
    return this.buffer.position();
  }

  @Override
  public InputBuffer index(int index) {
    ((Buffer) this.buffer).position(index);
    return this;
  }

  @Override
  public int limit() {
    return this.buffer.limit();
  }

  @Override
  public InputBuffer limit(int limit) {
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
    if (0 <= index && index < this.buffer.limit()) {
      return this.buffer.get(index) & 0xff;
    } else {
      throw new InputException();
    }
  }

  @Override
  public void set(int index, int token) {
    if (0 <= index && index < this.buffer.limit()) {
      this.buffer.put(index, (byte) token);
    } else {
      throw new InputException();
    }
  }

  @Override
  public int head() {
    final ByteBuffer buffer = this.buffer;
    final int position = buffer.position();
    if (position < buffer.limit()) {
      return buffer.get(position) & 0xff;
    } else {
      throw new InputException();
    }
  }

  @Override
  public InputBuffer step() {
    final ByteBuffer buffer = this.buffer;
    final int position = buffer.position();
    if (position < buffer.limit()) {
      ((Buffer) buffer).position(position + 1);
      this.offset += 1L;
      return this;
    } else {
      final Throwable error = new InputException("invalid step");
      return InputBuffer.error(error, this.id, mark(), this.settings);
    }
  }

  @Override
  public InputBuffer step(int offset) {
    final ByteBuffer buffer = this.buffer;
    final int position = buffer.position() + offset;
    if (0 <= position && position <= buffer.limit()) {
      ((Buffer) buffer).position(position);
      this.offset += (long) offset;
      return this;
    } else {
      final Throwable error = new InputException("invalid step");
      return InputBuffer.error(error, this.id, mark(), this.settings);
    }
  }

  @Override
  public InputBuffer seek(Mark mark) {
    final ByteBuffer buffer = this.buffer;
    if (mark != null) {
      final long position = (long) buffer.position() + (this.offset - mark.offset);
      if (0L <= position && position <= (long) buffer.limit()) {
        ((Buffer) buffer).position((int) position);
        this.offset = mark.offset;
        return this;
      } else {
        final Throwable error = new InputException("invalid seek to " + mark);
        return InputBuffer.error(error, this.id, mark(), this.settings);
      }
    } else {
      this.offset -= (long) buffer.position();
      ((Buffer) buffer).position(0);
      return this;
    }
  }

  @Override
  public Object id() {
    return this.id;
  }

  @Override
  public InputBuffer id(Object id) {
    this.id = id;
    return this;
  }

  @Override
  public Mark mark() {
    return Mark.at(this.offset, 0, 0);
  }

  @Override
  public InputBuffer mark(Mark mark) {
    this.offset = mark.offset;
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
  public InputSettings settings() {
    return this.settings;
  }

  @Override
  public InputBuffer settings(InputSettings settings) {
    this.settings = settings;
    return this;
  }

  @Override
  public InputBuffer clone() {
    return new ByteBufferInput(this.buffer.duplicate(), this.id, this.offset,
                               this.settings, this.isPart);
  }
}
