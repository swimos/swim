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
import swim.util.WriteMarkup;
import swim.util.WriteSource;
import swim.util.WriteString;

/**
 * Description of a source range, identified by a closed interval between
 * start and end {@linkplain SourcePosition positions}.
 */
@Public
@Since("5.0")
public final class SourceRange extends SourceLocation implements WriteMarkup, WriteSource, WriteString {

  final SourcePosition start;
  final SourcePosition end;

  SourceRange(SourcePosition start, SourcePosition end) {
    this.start = start;
    this.end = end;
  }

  @Override
  public @Nullable String name() {
    return this.start.name();
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public SourceRange withName(@Nullable String name) {
    final SourcePosition start = this.start.withName(name);
    final SourcePosition end = this.end.withName(name);
    if (start == this.start && end == this.end) {
      return this;
    } else {
      return new SourceRange(start, end);
    }
  }

  @Override
  public SourcePosition start() {
    return this.start;
  }

  @Override
  public SourcePosition end() {
    return this.end;
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public SourceLocation union(SourceLocation other) {
    if (other instanceof SourcePosition) {
      final SourcePosition that = (SourcePosition) other;
      final SourcePosition start = this.start.min(that);
      final SourcePosition end = this.end.max(that);
      if (start == this.start && end == this.end) {
        return this;
      } else {
        return new SourceRange(start, end);
      }
    } else if (other instanceof SourceRange) {
      final SourceRange that = (SourceRange) other;
      final SourcePosition start = this.start.min(that.start);
      final SourcePosition end = this.end.max(that.end);
      if (start == this.start && end == this.end) {
        return this;
      } else {
        return new SourceRange(start, end);
      }
    }
    throw new UnsupportedOperationException(other.toString());
  }

  @SuppressWarnings("ReferenceEquality")
  @Override
  public SourceRange shift(SourcePosition position) {
    final SourcePosition start = this.start.shift(position);
    final SourcePosition end = this.end.shift(position);
    if (start == this.start && end == this.end) {
      return this;
    } else {
      return new SourceRange(start, end);
    }
  }

  @Override
  public boolean equals(@Nullable Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof SourceRange that) {
      return this.start.equals(that.start) && this.end.equals(that.end);
    }
    return false;
  }

  private static final int HASH_SEED = Murmur3.seed(SourceRange.class);

  @Override
  public int hashCode() {
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(HASH_SEED,
        this.start.hashCode()), this.end.hashCode()));
  }

  @Override
  public void writeSource(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginInvoke("SourceRange", "of")
            .appendArgument(this.start)
            .appendArgument(this.end)
            .endInvoke();
  }

  @Override
  public void writeMarkup(Appendable output) {
    final Notation notation = Notation.from(output);
    notation.beginObject("SourceRange")
            .appendField("start", this.start)
            .appendField("end", this.end)
            .endObject();
  }

  @Override
  public void writeString(Appendable output) throws IOException {
    if (this.start.note != null) {
      output.append('(').append(this.start.note).append(')').append(' ');
    }
    if (this.start.name != null) {
      output.append(this.start.name).append(':');
    }
    output.append(Integer.toString(this.start.line)).append(':')
          .append(Integer.toString(this.start.column))
          .append('-')
          .append(Integer.toString(this.end.line)).append(':')
          .append(Integer.toString(this.end.column));
    if (this.end.note != null) {
      output.append(' ').append('(').append(this.end.note).append(')');
    }
  }

  @Override
  public String toString() {
    return WriteString.toString(this);
  }

  /**
   * Returns a new {@code SourceRange} representing the closed interval
   * between the given {@code start} and {@code end} positions.
   */
  public static SourceRange of(SourcePosition start, SourcePosition end) {
    Objects.requireNonNull(start, "start");
    Objects.requireNonNull(end, "end");
    if (start.offset > end.offset) {
      final SourcePosition tmp = start;
      start = end;
      end = tmp;
    }
    return new SourceRange(start, end);
  }

}
