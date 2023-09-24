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

import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;

@Public
@Since("5.0")
public final class StringInput extends Input {

  String string;
  @Nullable String name;
  long offset;
  int line;
  int column;
  int index;
  boolean last;

  StringInput(String string, @Nullable String name, long offset,
              int line, int column, int index, boolean last) {
    this.string = string;
    this.name = name;
    this.offset = offset;
    this.line = line;
    this.column = column;
    this.index = index;
    this.last = last;
  }

  public StringInput(String string) {
    this(string, null, 0L, 1, 1, 0, true);
  }

  @Override
  public boolean isCont() {
    return this.index < this.string.length();
  }

  @Override
  public boolean isEmpty() {
    return !this.last && this.index >= this.string.length();
  }

  @Override
  public boolean isDone() {
    return this.last && this.index >= this.string.length();
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
  public StringInput asLast(boolean last) {
    this.last = last;
    return this;
  }

  @Override
  public int head() {
    if (this.index >= this.string.length()) {
      throw new IllegalStateException("input " + (this.last ? "done" : "empty"));
    }
    return this.string.codePointAt(this.index);
  }

  @Override
  public int lookahead(int k) {
    final String string = this.string;
    final int length = string.length();
    int index = this.index;
    while (k > 0 && index < length) {
      index = string.offsetByCodePoints(index, 1);
      k -= 1;
    }
    if (k == 0 && index < length) {
      return string.codePointAt(index);
    } else {
      return -1;
    }
  }

  @Override
  public StringInput step() {
    final int index = this.index;
    if (index >= this.string.length()) {
      throw new IllegalStateException("input " + (this.last ? "done" : "empty"));
    }
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
  }

  @Override
  public StringInput seek(@Nullable SourcePosition position) {
    if (position != null) {
      final long index = (long) this.index + (this.offset - position.offset());
      if (index < 0L || index > this.string.length()) {
        throw new IllegalArgumentException("invalid seek to " + position);
      }
      this.offset = position.offset();
      this.line = position.line();
      this.column = position.column();
      this.index = (int) index;
      return this;
    } else {
      this.offset = 0L;
      this.line = 1;
      this.column = 1;
      this.index = 0;
      return this;
    }
  }

  public StringInput extend(String extension) {
    this.string += extension;
    return this;
  }

  @Override
  public SourcePosition location() {
    return SourcePosition.of(this.offset, this.line, this.column);
  }

  @Override
  public StringInput location(SourcePosition location) {
    if (location.name() != null) {
      this.name = location.name();
    }
    this.offset = location.offset();
    this.line = location.line();
    this.column = location.column();
    return this;
  }

  @Override
  public @Nullable String name() {
    return this.name;
  }

  @Override
  public StringInput name(@Nullable String name) {
    this.name = name;
    return this;
  }

  @Override
  public long offset() {
    return this.offset;
  }

  @Override
  public int line() {
    return this.line;
  }

  @Override
  public int column() {
    return this.column;
  }

  @Override
  public StringInput clone() {
    return new StringInput(this.string, this.name, this.offset,
                           this.line, this.column, this.index, this.last);
  }

  public static StringInput empty() {
    return new StringInput("", null, 0L, 1, 1, 0, false);
  }

  public static StringInput done() {
    return new StringInput("", null, 0L, 1, 1, 0, true);
  }

}
