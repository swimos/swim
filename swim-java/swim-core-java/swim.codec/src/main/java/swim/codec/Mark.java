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

import java.util.Objects;
import swim.util.Murmur3;

/**
 * Description of a source position, identified by byte offset, line, and
 * column number, with an optional note.
 */
public final class Mark extends Tag implements Comparable<Mark> {
  final long offset;
  final int line;
  final int column;
  final String note;

  Mark(long offset, int line, int column, String note) {
    this.offset = offset;
    this.line = line;
    this.column = column;
    this.note = note;
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
   * Returns the note attached to the marked position, or {@code null} if this
   * position has no attached note.
   */
  public String note() {
    return this.note;
  }

  /**
   * Returns {@code this} position, if its byte offset is less than or equal
   * to {@code that} position; otherwise returns {@code that} position.
   */
  public Mark min(Mark that) {
    if (this.offset <= that.offset) {
      return this;
    } else {
      return that;
    }
  }

  /**
   * Returns {@code this} position, if its byte offset is greater than or equal
   * to {@code that} position; otherwise returns {@code that} position.
   */
  public Mark max(Mark that) {
    if (this.offset >= that.offset) {
      return this;
    } else {
      return that;
    }
  }

  @Override
  public Mark start() {
    return this;
  }

  @Override
  public Mark end() {
    return this;
  }

  @Override
  public Tag union(Tag other) {
    if (other instanceof Mark) {
      final Mark that = (Mark) other;
      if (this.offset == that.offset && this.line == that.line
          && this.column == that.column) {
        return this;
      } else {
        return Span.from(this, that);
      }
    } else if (other instanceof Span) {
      final Span that = (Span) other;
      final Mark start = min(that.start);
      final Mark end = max(that.end);
      if (start == that.start && end == that.end) {
        return that;
      } else {
        return Span.from(start, end);
      }
    }
    throw new UnsupportedOperationException(other.toString());
  }

  @Override
  public Mark shift(Mark mark) {
    final long offset = this.offset + (this.offset - mark.offset);
    final int line = this.line + (this.line - mark.line);
    int column = this.column;
    if (line == 1) {
      column += (this.column - mark.column);
    }
    if (offset == this.offset && line == this.line && column == this.column) {
      return this;
    } else {
      return Mark.at(offset, line, column, this.note);
    }
  }

  @Override
  public int compareTo(Mark that) {
    return Long.compare(this.offset, that.offset);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Mark) {
      final Mark that = (Mark) other;
      return this.offset == that.offset && this.line == that.line
          && this.column == that.column && Objects.equals(this.note, that.note);
    }
    return false;
  }

  @Override
  public int hashCode() {
    if (hashSeed == 0) {
      hashSeed = Murmur3.seed(Mark.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Murmur3.mix(Murmur3.mix(hashSeed,
        Murmur3.hash(this.offset)), this.line), this.column), Murmur3.hash(this.note)));
  }

  @Override
  public void display(Output<?> output) {
    Format.displayInt(this.line, output);
    output = output.write(':');
    Format.displayInt(this.column, output);
    if (this.note != null) {
      output = output.write(": ").write(this.note);
    }
  }

  @Override
  public void debug(Output<?> output) {
    output = output.write("Mark").write('.').write("at").write('(');
    Format.debugLong(this.offset, output);
    output = output.write(", ");
    Format.debugInt(this.line, output);
    output = output.write(", ");
    Format.debugInt(this.column, output);
    if (this.note != null) {
      output = output.write(", ");
      Format.debugString(this.note, output);
    }
    output = output.write(')');
  }

  @Override
  public String toString() {
    return Format.display(this);
  }

  private static int hashSeed;
  private static Mark zero;

  /**
   * Returns a {@code Mark} at byte offset {@code 0}, line {@code 1}, and
   * column {@code 1}, with no attached note.
   */
  public static Mark zero() {
    if (zero == null) {
      zero = new Mark(0L, 1, 1, null);
    }
    return zero;
  }

  /**
   * Returns a new {@code Mark} at the given zero-based byte {@code offset},
   * one-based {@code line} number, and one-based {@code column} number,
   * with the attached {@code note}.
   */
  public static Mark at(long offset, int line, int column, String note) {
    return new Mark(offset, line, column, note);
  }

  /**
   * Returns a new {@code Mark} at the given zero-based byte {@code offset},
   * one-based {@code line} number, and one-based {@code column} number,
   * with no attached note.
   */
  public static Mark at(long offset, int line, int column) {
    return at(offset, line, column, null);
  }
}
