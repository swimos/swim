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

final class ByteArrayInput extends InputBuffer {
  byte[] array;
  int index;
  int limit;
  Object id;
  long offset;
  InputSettings settings;
  boolean isPart;

  ByteArrayInput(byte[] array, int index, int limit, Object id, long offset,
                 InputSettings settings, boolean isPart) {
    this.array = array;
    this.index = index;
    this.limit = limit;
    this.id = id;
    this.offset = offset;
    this.settings = settings;
    this.isPart = isPart;
  }

  ByteArrayInput(byte[] array, int offset, int length) {
    this(array, offset, offset + length, null, 0L, InputSettings.standard(), false);
  }

  @Override
  public boolean isCont() {
    return this.index < this.limit;
  }

  @Override
  public boolean isEmpty() {
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
  public InputBuffer isPart(boolean isPart) {
    this.isPart = isPart;
    return this;
  }

  @Override
  public int index() {
    return this.index;
  }

  @Override
  public InputBuffer index(int index) {
    if (0 <= index && index <= this.limit) {
      this.offset += (long) (index - this.index);
      this.index = index;
      return this;
    } else {
      final Throwable error = new InputException("invalid index");
      return InputBuffer.error(error, this.id, mark(), this.settings);
    }
  }

  @Override
  public int limit() {
    return this.limit;
  }

  @Override
  public InputBuffer limit(int limit) {
    if (0 <= limit && limit <= this.array.length) {
      this.limit = limit;
      return this;
    } else {
      final Throwable error = new InputException("invalid limit");
      return InputBuffer.error(error, this.id, mark(), this.settings);
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
      throw new InputException();
    }
  }

  @Override
  public void set(int index, int token) {
    if (0 <= index && index < this.limit) {
      this.array[index] = (byte) token;
    } else {
      throw new InputException();
    }
  }

  @Override
  public int head() {
    if (this.index < this.limit) {
      return this.array[this.index] & 0xff;
    } else {
      throw new InputException();
    }
  }

  @Override
  public InputBuffer step() {
    if (this.index < this.limit) {
      this.index += 1;
      this.offset += 1L;
      return this;
    } else {
      final Throwable error = new InputException("invalid step");
      return InputBuffer.error(error, this.id, mark(), this.settings);
    }
  }

  @Override
  public InputBuffer step(int offset) {
    final int index = this.index + offset;
    if (0 <= index && index <= this.limit) {
      this.index = index;
      this.offset += (long) offset;
      return this;
    } else {
      final Throwable error = new InputException("invalid step");
      return InputBuffer.error(error, this.id, mark(), this.settings);
    }
  }

  @Override
  public InputBuffer seek(Mark mark) {
    if (mark != null) {
      final long index = (long) this.index + (this.offset - mark.offset);
      if (0L <= index && index <= (long) this.limit) {
        this.index = (int) index;
        this.offset = mark.offset;
        return this;
      } else {
        final Throwable error = new InputException("invalid seek to " + mark);
        return InputBuffer.error(error, this.id, mark(), this.settings);
      }
    } else {
      this.offset -= (long) this.index;
      this.index = 0;
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
    return new ByteArrayInput(this.array, this.index, this.limit, this.id,
                              this.offset, this.settings, this.isPart);
  }
}
