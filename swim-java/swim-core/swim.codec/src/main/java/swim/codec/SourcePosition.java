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
import java.util.Objects;
import swim.annotations.Nullable;
import swim.annotations.Public;
import swim.annotations.Since;
import swim.util.Murmur3;
import swim.util.Notation;
import swim.util.ToMarkup;
import swim.util.ToSource;
import swim.util.ToString;

/**
 * Description of a source position, identified by byte offset, line,
 * and column number, with an optional note.
 */
@Public
@Since("5.0")
public final class SourcePosition extends SourceLocation implements Comparable<SourcePosition>, ToMarkup, ToSource, ToString {

  final @Nullable String name;
  final long offset;
  final int line;
  final int column;
  final @Nullable String note;

  SourcePosition(@Nullable String name, long offset,
                 int line, int column, @Nullable String note) {
    this.name = name;
    this.offset = offset;
    this.line = line;
    this.column = column;
    this.note = note;
  }

  @Override
  public @Nullable String name() {
    return this.name;
  }

  @Override
  public SourcePosition withName(@Nullable String name) {
    if (Objects.equals(name, this.name)) {
      return this;
    } else {
      return new SourcePosition(name, this.offset, this.line, this.column, this.note);
    }
  }

  /**
   * Returns the zero-based byte offset of this position.
   */
  public long offset() {
    return this.offset;
  }

  /**
   * Returns the one-based line number of this position.
   */
  public int line() {
    return this.line;
  }

  /**
   * Returns the one-based column number of this position.
   */
  public int column() {
    return this.column;
  }

  /**
   * Returns the note attached to the source position,
   * or {@code null} if this position has no attached note.
   */
  public @Nullable String note() {
    return this.note;
  }

  /**
   * Returns a copy of this source position with the given {@code note}.
   */
  public SourcePosition withNote(@Nullable String note) {
    if (Objects.equals(note, this.note)) {
      return this;
    } else {
      return new SourcePosition(this.name, this.offset, this.line, this.column, note);
    }
  }

  /**
   * Returns {@code this} position, if its byte offset is less than or equal
   * to {@code that} position; otherwise returns {@code that} position.
   */
  public SourcePosition min(SourcePosition that) {
    if (this.offset <= that.offset) {
      return this;
    } else {
      return that;
    }
  }

  /**
   * Returns {@code this} position, if its byte offset is greater than or
   * equal to {@code that} position; otherwise returns {@code that} position.
   */
  public SourcePosition max(SourcePosition that) {
    if (this.offset >= that.offset) {
      return this;
    } else {
      return that;
    }
  }

  @Override
  public SourcePosition start() {
    return this;
  }

  @Override
  public SourcePosition end() {
    return this;
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public SourceLocation union(SourceLocation other) {
    if (other instanceof SourcePosition) {
      final SourcePosition that = (SourcePosition) other;
      if (this.offset == that.offset && this.line == that.line && this.column == that.column) {
        return this;
      } else {
        return SourceRange.of(this, that);
      }
    } else if (other instanceof SourceRange) {
      final SourceRange that = (SourceRange) other;
      final SourcePosition start = this.min(that.start);
      final SourcePosition end = this.max(that.end);
      if (start == that.start && end == that.end) {
        return that;
      } else {
        return SourceRange.of(start, end);
      }
    }
    throw new UnsupportedOperationException(other.toString());
  }

  @Override
  public SourcePosition shift(SourcePosition position) {
    final long offset = this.offset + (this.offset - position.offset);
    final int line = this.line + (this.line - position.line);
    int column = this.column;
    if (line == 1) {
      column += (this.column - position.column);
    }
    if (offset == this.offset && line == this.line && column == this.column) {
      return this;
    } else {
      return new SourcePosition(this.name, offset, line, column, this.note);
    }
  }

  @Override
  public int compareTo(SourcePosition that) {
    return Long.compare(this.offset, that.offset);
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SourcePosition that) {
      return Objects.equals(this.name, that.name)
          && this.offset == that.offset
          && this.line == that.line
          && this.column == that.column
          && Objects.equals(this.note, that.note);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(SourcePosition.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(
        HASH_SEED, Objects.hashCode(this.name)), Murmur3.hash(this.offset)),
        this.line), this.column), Objects.hashCode(this.note)));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("SourcePosition", "of");
    if (this.name != null) {
      notation.appendArgument(this.name);
    }
    notation.appendArgument(this.offset)
            .appendArgument(this.line)
            .appendArgument(this.column);
    if (this.note != null) {
      notation.appendArgument(this.note);
    }
    notation.endInvoke();
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("SourcePosition");
    if (this.name != null) {
      notation.appendField("name", this.name);
    }
    notation.appendField("offset", this.offset)
            .appendField("line", this.line)
            .appendField("column", this.column);
    if (this.note != null) {
      notation.appendField("note", this.note);
    }
    notation.endObject();
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    if (this.name != null) {
      output.append(this.name).append(':');
    }
    output.append(Integer.toString(this.line)).append(':')
          .append(Integer.toString(this.column));
    if (this.note != null) {
      output.append(' ').append('(').append(this.note).append(')');
    }
  }

  @Override
  public String toString() {
    return this.toString(null);
  }

  /**
   * Returns a new {@code SourcePosition} with the given source {@code name}
   * at the given zero-based byte {@code offset}, one-based {@code line} number,
   * and one-based {@code column} number, with the attached {@code note}.
   */
  public static SourcePosition of(@Nullable String name, long offset,
                                  int line, int column, @Nullable String note) {
    return new SourcePosition(name, offset, line, column, note);
  }

  /**
   * Returns a new {@code SourcePosition} with the given source {@code name}
   * at the given zero-based byte {@code offset}, one-based {@code line} number,
   * and one-based {@code column} number, with no attached note.
   */
  public static SourcePosition of(@Nullable String name, long offset,
                                  int line, int column) {
    return new SourcePosition(name, offset, line, column, null);
  }

  /**
   * Returns a new {@code SourcePosition} at the given zero-based byte
   * {@code offset}, one-based {@code line} number, and one-based
   * {@code column} number, with the attached {@code note}.
   */
  public static SourcePosition of(long offset, int line, int column,
                                  @Nullable String note) {
    return new SourcePosition(null, offset, line, column, note);
  }

  /**
   * Returns a new {@code SourcePosition} at the given zero-based byte
   * {@code offset}, one-based {@code line} number, and one-based
   * {@code column} number, with no attached note.
   */
  public static SourcePosition of(long offset, int line, int column) {
    return new SourcePosition(null, offset, line, column, null);
  }

}
