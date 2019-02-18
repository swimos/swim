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

final class StringInput extends Input {
  String string;
  Object id;
  long offset;
  int line;
  int column;
  InputSettings settings;
  int index;
  boolean isPart;

  StringInput(String string, Object id, long offset, int line, int column,
              InputSettings settings, int index, boolean isPart) {
    this.string = string;
    this.id = id;
    this.offset = offset;
    this.line = line;
    this.column = column;
    this.settings = settings;
    this.index = index;
    this.isPart = isPart;
  }

  StringInput(String string) {
    this(string, null, 0L, 1, 1, InputSettings.standard(), 0, false);
  }

  @Override
  public boolean isCont() {
    return this.index < this.string.length();
  }

  @Override
  public boolean isEmpty() {
    return this.isPart && this.index >= this.string.length();
  }

  @Override
  public boolean isDone() {
    return !this.isPart && this.index >= this.string.length();
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
  public Input isPart(boolean isPart) {
    this.isPart = isPart;
    return this;
  }

  @Override
  public int head() {
    if (this.index < this.string.length()) {
      return this.string.codePointAt(this.index);
    } else {
      throw new InputException();
    }
  }

  @Override
  public Input step() {
    final int index = this.index;
    if (index < this.string.length()) {
      final int c = this.string.codePointAt(index);
      this.index = this.string.offsetByCodePoints(index, 1);
      this.offset += (long) (this.index - index);
      if (c == '\n') {
        this.line += 1;
        this.column = 1;
      } else {
        this.column += 1;
      }
      return this;
    } else {
      final Throwable error = new InputException("invalid step");
      return Input.error(error, this.id, mark(), this.settings);
    }
  }

  @Override
  public Input seek(Mark mark) {
    if (mark != null) {
      final long index = (long) this.index + (this.offset - mark.offset);
      if (0L <= index && index <= this.string.length()) {
        this.offset = mark.offset;
        this.line = mark.line;
        this.column = mark.column;
        this.index = (int) index;
        return this;
      } else {
        final Throwable error = new InputException("invalid seek to " + mark);
        return Input.error(error, this.id, mark(), this.settings);
      }
    } else {
      this.offset = 0L;
      this.line = 1;
      this.column = 1;
      this.index = 0;
      return this;
    }
  }

  @Override
  public Object id() {
    return this.id;
  }

  @Override
  public Input id(Object id) {
    this.id = id;
    return this;
  }

  @Override
  public Mark mark() {
    return Mark.at(this.offset, this.line, this.column);
  }

  @Override
  public Input mark(Mark mark) {
    this.offset = mark.offset;
    this.line = mark.line;
    this.column = mark.column;
    return this;
  }

  public long offset() {
    return this.offset;
  }

  public int line() {
    return this.line;
  }

  public int column() {
    return this.column;
  }

  @Override
  public InputSettings settings() {
    return this.settings;
  }

  @Override
  public Input settings(InputSettings settings) {
    this.settings = settings;
    return this;
  }

  @Override
  public Input clone() {
    return new StringInput(this.string, this.id, this.offset, this.line,
                           this.column, this.settings, this.index, this.isPart);
  }
}
