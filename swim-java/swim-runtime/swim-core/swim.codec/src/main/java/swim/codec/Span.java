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

import java.util.Objects;
import swim.util.Murmur3;

/**
 * Description of a source range, identified by a closed interval between start
 * and end {@link Mark marks}.
 */
public final class Span extends Tag {

  final Mark start;
  final Mark end;

  Span(Mark start, Mark end) {
    this.start = start;
    this.end = end;
  }

  @Override
  public Mark start() {
    return this.start;
  }

  @Override
  public Mark end() {
    return this.end;
  }

  @Override
  public Tag union(Tag other) {
    if (other instanceof Mark) {
      final Mark that = (Mark) other;
      final Mark start = this.start.min(that);
      final Mark end = this.end.max(that);
      if (start == this.start && end == this.end) {
        return this;
      } else {
        return Span.from(start, end);
      }
    } else if (other instanceof Span) {
      final Span that = (Span) other;
      final Mark start = this.start.min(that.start);
      final Mark end = this.end.max(that.end);
      if (start == this.start && end == this.end) {
        return this;
      } else {
        return Span.from(start, end);
      }
    }
    throw new UnsupportedOperationException(other.toString());
  }

  @Override
  public Span shift(Mark mark) {
    final Mark start = this.start.shift(mark);
    final Mark end = this.end.shift(mark);
    if (start == this.start && end == this.end) {
      return this;
    } else {
      return Span.from(start, end);
    }
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Span) {
      final Span that = (Span) other;
      return this.start.equals(that.start) && this.end.equals(that.end);
    }
    return false;
  }

  private static int hashSeed;

  @Override
  public int hashCode() {
    if (Span.hashSeed == 0) {
      Span.hashSeed = Murmur3.seed(Span.class);
    }
    return Murmur3.mash(Murmur3.mix(Murmur3.mix(Span.hashSeed,
        this.start.hashCode()), this.end.hashCode()));
  }

  @Override
  public <T> Output<T> display(Output<T> output) {
    if (this.start.note != null) {
      output = output.write(this.start.note).write(": ");
    }
    output = Format.displayInt(output, this.start.line);
    output = output.write(':');
    output = Format.displayInt(output, this.start.column);
    output = output.write('-');
    output = Format.displayInt(output, this.end.line);
    output = output.write(':');
    output = Format.displayInt(output, this.end.column);
    if (this.end.note != null) {
      output = output.write(": ").write(this.end.note);
    }
    return output;
  }

  @Override
  public <T> Output<T> debug(Output<T> output) {
    output = output.write("Span").write('.').write("from").write('(');
    output = this.start.debug(output);
    output = output.write(", ");
    output = this.end.debug(output);
    output = output.write(')');
    return output;
  }

  @Override
  public String toString() {
    return Format.display(this);
  }

  /**
   * Returns a new {@code Span} representing the closed interval between the
   * given {@code start} and {@code end} marks.
   */
  public static Span from(Mark start, Mark end) {
    start = Objects.requireNonNull(start);
    end = Objects.requireNonNull(end);
    if (start.offset > end.offset) {
      final Mark tmp = start;
      start = end;
      end = tmp;
    }
    return new Span(start, end);
  }

}
